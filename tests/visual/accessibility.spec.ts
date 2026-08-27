import { expect, Page, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { getOverflowDiagnostics, stabilizePage, visualRoot } from './helpers';

const axeUrl = 'https://cdn.jsdelivr.net/npm/axe-core@4.13.0/axe.min.js';
const baselineOrigin = process.env.ACCESSIBILITY_BASELINE_URL || 'https://enriquegoberna.com';

const accessibilityPages = [
  { name: 'home', url: '/' },
  { name: 'projects', url: '/projects/' },
  { name: 'case-study', url: '/projects/order-tracking/' },
  {
    name: 'article',
    url: '/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/',
  },
  { name: 'about', url: '/about/' },
] as const;

type AxeNode = {
  html: string;
  target: string[];
  failureSummary?: string;
};

type AxeViolation = {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical' | null;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
};

type AxeResult = {
  violations: AxeViolation[];
  incomplete: AxeViolation[];
};

type AxeRunner = {
  run: (context: Document, options?: unknown) => Promise<AxeResult>;
};

const accessibilityEvidenceDir = path.join(visualRoot, 'accessibility');

function writeAccessibilityEvidence(name: string, value: unknown): void {
  fs.mkdirSync(accessibilityEvidenceDir, { recursive: true });
  fs.writeFileSync(path.join(accessibilityEvidenceDir, `${name}.json`), JSON.stringify(value, null, 2));
}

function summarizeAxe(result: AxeResult) {
  const summarize = (violations: AxeViolation[]) =>
    violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map(node => ({
        target: node.target,
        html: node.html,
        failureSummary: node.failureSummary,
      })),
    }));

  return {
    violations: summarize(result.violations),
    incomplete: summarize(result.incomplete),
  };
}

async function fetchAxeSource(page: Page): Promise<string> {
  const response = await page.request.get(axeUrl);
  expect(response.ok(), `Unable to load pinned Axe ${axeUrl}: ${response.status()}`).toBeTruthy();
  return response.text();
}

async function injectAxe(page: Page, axeSource: string): Promise<void> {
  await page.addScriptTag({ content: axeSource });
}

async function runAxe(page: Page, options?: unknown): Promise<AxeResult> {
  return page.evaluate(async scanOptions => {
    const axe = (window as unknown as { axe: AxeRunner }).axe;
    if (!axe) throw new Error('Axe was not injected into the page');
    return axe.run(document, scanOptions);
  }, options);
}

async function assertHeadingHierarchy(page: Page, pageName: string): Promise<void> {
  const headings = await page.locator('#main-content h1, #main-content h2, #main-content h3, #main-content h4, #main-content h5, #main-content h6').evaluateAll(elements =>
    elements
      .filter(element => {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
      })
      .map(element => ({
        level: Number(element.tagName.slice(1)),
        text: element.textContent?.trim() || '',
      })),
  );

  const h1s = headings.filter(heading => heading.level === 1);
  expect(h1s, `${pageName} should expose exactly one page-level H1`).toHaveLength(1);

  const skips: Array<{ from: (typeof headings)[number]; to: (typeof headings)[number] }> = [];
  for (let index = 1; index < headings.length; index += 1) {
    const previous = headings[index - 1];
    const current = headings[index];
    if (current.level > previous.level + 1) {
      skips.push({ from: previous, to: current });
    }
  }
  expect(skips, `${pageName} contains skipped heading levels`).toEqual([]);
}

async function assertImageAlternatives(page: Page, pageName: string): Promise<void> {
  const imageAudit = await page.locator('img').evaluateAll(images =>
    images.map(image => ({
      src: image.getAttribute('src'),
      alt: image.getAttribute('alt'),
      ariaHidden: image.getAttribute('aria-hidden'),
      labelledContainer: image.closest('[aria-label]')?.getAttribute('aria-label') || null,
    })),
  );

  const missingAlt = imageAudit.filter(image => image.alt === null);
  expect(missingAlt, `${pageName} contains images without an alt attribute`).toEqual([]);

  const unexplainedEmptyAlt = imageAudit.filter(
    image => image.alt === '' && image.ariaHidden !== 'true' && !image.labelledContainer,
  );
  expect(
    unexplainedEmptyAlt,
    `${pageName} contains empty image alternatives without decorative semantics or a labelled container`,
  ).toEqual([]);
}

test('captures the published before-scan evidence', async ({ page }) => {
  test.setTimeout(120_000);
  const axeSource = await fetchAxeSource(page);

  for (const route of accessibilityPages) {
    const url = new URL(route.url, baselineOrigin).toString();
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
      await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
      await injectAxe(page, axeSource);
      const result = await runAxe(page);
      writeAccessibilityEvidence(`before-${route.name}`, {
        source: url,
        responseStatus: response?.status() ?? null,
        ...summarizeAxe(result),
      });
    } catch (error) {
      writeAccessibilityEvidence(`before-${route.name}`, {
        source: url,
        status: 'unavailable',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

for (const mode of ['light', 'dark'] as const) {
  test(`candidate accessibility scan passes in ${mode} mode`, async ({ page }) => {
    test.setTimeout(120_000);
    const axeSource = await fetchAxeSource(page);

    await page.goto('/');
    await page.evaluate(selectedMode => localStorage.setItem('theme', selectedMode), mode);

    for (const route of accessibilityPages) {
      const response = await page.goto(route.url, { waitUntil: 'networkidle' });
      expect(response?.ok(), `${route.url} did not render successfully`).toBeTruthy();
      await stabilizePage(page);
      await injectAxe(page, axeSource);

      const result = await runAxe(page);
      const summary = summarizeAxe(result);
      writeAccessibilityEvidence(`after-${mode}-${route.name}`, {
        source: route.url,
        mode,
        ...summary,
      });

      const blocking = result.violations.filter(
        violation => violation.impact === 'critical' || violation.impact === 'serious',
      );
      expect(blocking, `${route.name} has critical/serious Axe findings in ${mode} mode`).toEqual([]);

      await assertHeadingHierarchy(page, route.name);
      await assertImageAlternatives(page, route.name);
    }
  });
}

test('configured palettes meet WCAG AA text contrast in light and dark mode', async ({ page }) => {
  test.setTimeout(120_000);
  const axeSource = await fetchAxeSource(page);
  await page.goto('/');

  const palettes = await page.locator('[data-color-scheme]').evaluateAll(buttons => [
    ...new Set(buttons.map(button => button.getAttribute('data-color-scheme')).filter((value): value is string => Boolean(value))),
  ]);
  expect(palettes.length, 'No configured color palettes were rendered').toBeGreaterThan(0);

  const reports: unknown[] = [];
  for (const mode of ['light', 'dark'] as const) {
    for (const palette of palettes) {
      await page.evaluate(
        ({ selectedPalette, selectedMode }) => {
          localStorage.setItem('colorScheme', selectedPalette);
          localStorage.setItem('theme', selectedMode);
        },
        { selectedPalette: palette, selectedMode: mode },
      );
      await page.reload({ waitUntil: 'networkidle' });
      await injectAxe(page, axeSource);
      const result = await runAxe(page, { runOnly: { type: 'rule', values: ['color-contrast'] } });
      const report = {
        palette,
        mode,
        ...summarizeAxe(result),
      };
      reports.push(report);
      expect(result.violations, `${palette}/${mode} has WCAG AA color-contrast failures`).toEqual([]);
    }
  }

  writeAccessibilityEvidence('palette-contrast', reports);
});

test('skip link and keyboard focus stay visible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await stabilizePage(page);

  const skipLink = page.getByRole('link', { name: 'Skip to main content', exact: true });
  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main-content$/);

  await page.goto('/');
  await stabilizePage(page);
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) return null;
      const style = window.getComputedStyle(active);
      const rect = active.getBoundingClientRect();
      return {
        tag: active.tagName.toLowerCase(),
        text: active.getAttribute('aria-label') || active.textContent?.trim() || '',
        visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none',
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth) || 0,
      };
    });

    expect(focus, `No active element after Tab ${index + 1}`).not.toBeNull();
    expect(focus?.visible, `Focused element is not visible after Tab ${index + 1}: ${JSON.stringify(focus)}`).toBeTruthy();
    expect(
      focus && focus.outlineStyle !== 'none' && focus.outlineWidth >= 3,
      `Focused element lacks the site focus indicator after Tab ${index + 1}: ${JSON.stringify(focus)}`,
    ).toBeTruthy();
  }
});

test('representative pages reflow at 320 CSS pixels without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });

  for (const route of accessibilityPages) {
    const response = await page.goto(route.url, { waitUntil: 'networkidle' });
    expect(response?.ok(), `${route.url} did not render successfully`).toBeTruthy();
    await stabilizePage(page);
    const overflow = await getOverflowDiagnostics(page);
    expect(
      overflow.horizontalOverflow,
      `${route.name} overflows at 320px: ${overflow.scrollWidth}px > ${overflow.clientWidth}px; ${JSON.stringify(overflow.elements)}`,
    ).toBeFalsy();
  }
});

test('reduced-motion preference suppresses non-essential motion', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBeTruthy();

  const motion = await page.locator('.home-hero-action').first().evaluate(element => {
    const style = window.getComputedStyle(element);
    return {
      transitionDuration: Number.parseFloat(style.transitionDuration) || 0,
      animationDuration: Number.parseFloat(style.animationDuration) || 0,
      scrollBehavior: window.getComputedStyle(document.documentElement).scrollBehavior,
    };
  });

  expect(motion.transitionDuration, 'Reduced motion should collapse transition duration').toBeLessThanOrEqual(0.001);
  expect(motion.animationDuration, 'Reduced motion should collapse animation duration').toBeLessThanOrEqual(0.001);
  expect(motion.scrollBehavior).toBe('auto');
});
