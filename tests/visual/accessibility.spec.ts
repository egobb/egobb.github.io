import { expect, type Page, test } from '@playwright/test';
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

type AxeViolation = {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical' | null;
  help: string;
  helpUrl: string;
  nodes: Array<{ html: string; target: string[]; failureSummary?: string }>;
};

type AxeResult = { violations: AxeViolation[]; incomplete: AxeViolation[] };
type AxeRunner = { run: (context: Document, options?: unknown) => Promise<AxeResult> };

const evidenceDir = path.join(visualRoot, 'accessibility');

function writeEvidence(name: string, value: unknown): void {
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(path.join(evidenceDir, `${name}.json`), JSON.stringify(value, null, 2));
}

function summarize(result: AxeResult) {
  const map = (violations: AxeViolation[]) => violations.map(violation => ({
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

  return { violations: map(result.violations), incomplete: map(result.incomplete) };
}

async function fetchAxeSource(page: Page): Promise<string> {
  const response = await page.request.get(axeUrl);
  expect(response.ok(), `Unable to load pinned Axe ${axeUrl}: ${response.status()}`).toBeTruthy();
  return response.text();
}

async function runAxe(page: Page, axeSource: string): Promise<AxeResult> {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    const axe = (window as unknown as { axe: AxeRunner }).axe;
    if (!axe) throw new Error('Axe was not injected into the page');
    return axe.run(document);
  });
}

async function assertHeadingHierarchy(page: Page, pageName: string): Promise<void> {
  const headings = await page.locator('#main-content h1, #main-content h2, #main-content h3, #main-content h4, #main-content h5, #main-content h6').evaluateAll(elements =>
    elements.filter(element => {
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden';
    }).map(element => ({
      level: Number(element.tagName.slice(1)),
      text: element.textContent?.trim() || '',
    })),
  );

  expect(headings.filter(heading => heading.level === 1), `${pageName} should expose exactly one H1`).toHaveLength(1);

  const skips = [] as Array<{ from: (typeof headings)[number]; to: (typeof headings)[number] }>;
  for (let index = 1; index < headings.length; index += 1) {
    const previous = headings[index - 1];
    const current = headings[index];
    if (current.level > previous.level + 1) skips.push({ from: previous, to: current });
  }
  expect(skips, `${pageName} contains skipped heading levels`).toEqual([]);
}

async function assertImageAlternatives(page: Page, pageName: string): Promise<void> {
  const images = await page.locator('img').evaluateAll(elements => elements.map(image => ({
    src: image.getAttribute('src'),
    alt: image.getAttribute('alt'),
    ariaHidden: image.getAttribute('aria-hidden'),
    labelledContainer: image.closest('[aria-label]')?.getAttribute('aria-label') || null,
  })));

  expect(images.filter(image => image.alt === null), `${pageName} contains images without alt`).toEqual([]);
  expect(
    images.filter(image => image.alt === '' && image.ariaHidden !== 'true' && !image.labelledContainer),
    `${pageName} contains unexplained empty image alternatives`,
  ).toEqual([]);
}

async function assertVisibleFocus(page: Page, context: string): Promise<void> {
  const focus = await page.evaluate(() => {
    const active = document.activeElement as HTMLElement | null;
    if (!active) return null;
    const style = window.getComputedStyle(active);
    const rect = active.getBoundingClientRect();
    return {
      tag: active.tagName.toLowerCase(),
      name: active.getAttribute('aria-label') || active.textContent?.trim() || '',
      visible: rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden',
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth) || 0,
    };
  });

  expect(focus, `${context}: no active element`).not.toBeNull();
  expect(focus?.visible, `${context}: focused element is not visible: ${JSON.stringify(focus)}`).toBeTruthy();
  expect(
    focus && focus.outlineStyle !== 'none' && focus.outlineWidth >= 3,
    `${context}: focused element lacks the repository focus indicator: ${JSON.stringify(focus)}`,
  ).toBeTruthy();
}

test('captures a non-blocking published before-scan', async ({ page }) => {
  test.setTimeout(120_000);
  const axeSource = await fetchAxeSource(page);

  for (const route of accessibilityPages) {
    const url = new URL(route.url, baselineOrigin).toString();
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
      await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
      const result = await runAxe(page, axeSource);
      writeEvidence(`before-${route.name}`, {
        source: url,
        responseStatus: response?.status() ?? null,
        ...summarize(result),
      });
    } catch (error) {
      writeEvidence(`before-${route.name}`, {
        source: url,
        status: 'unavailable',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

for (const mode of ['light', 'dark'] as const) {
  test(`representative pages have no serious or critical Axe finding in ${mode} mode`, async ({ page }) => {
    test.setTimeout(120_000);
    const axeSource = await fetchAxeSource(page);

    await page.goto('/');
    await page.evaluate(selectedMode => localStorage.setItem('theme', selectedMode), mode);

    for (const route of accessibilityPages) {
      const response = await page.goto(route.url, { waitUntil: 'networkidle' });
      expect(response?.ok(), `${route.url} did not render successfully`).toBeTruthy();
      await stabilizePage(page);

      const result = await runAxe(page, axeSource);
      writeEvidence(`after-${mode}-${route.name}`, { source: route.url, mode, ...summarize(result) });

      const blocking = result.violations.filter(violation =>
        violation.impact === 'critical' || violation.impact === 'serious');
      expect(blocking, `${route.name} has blocking Axe findings in ${mode} mode`).toEqual([]);

      await assertHeadingHierarchy(page, route.name);
      await assertImageAlternatives(page, route.name);
    }
  });
}

test('skip link and keyboard focus are visible and usable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await stabilizePage(page);

  const skipLink = page.getByRole('link', { name: 'Skip to main content', exact: true });
  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  await assertVisibleFocus(page, 'skip link');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator('#main-content')).toBeFocused();

  await page.goto('/');
  await stabilizePage(page);
  for (let index = 0; index < 14; index += 1) {
    await page.keyboard.press('Tab');
    await assertVisibleFocus(page, `desktop Tab ${index + 1}`);
  }
});

test('mobile navigation disclosure is keyboard operable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await stabilizePage(page);

  const toggle = page.getByRole('button', { name: 'Menu' });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mobile-menu')).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(page.locator('#mobile-menu a').first()).toBeFocused();
  await assertVisibleFocus(page, 'first mobile navigation link');

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('representative pages reflow at 320 CSS pixels without page overflow', async ({ page }) => {
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
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'networkidle' });
  await stabilizePage(page);

  expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBeTruthy();

  const motion = await page.locator('.portfolio-nav-link').first().evaluate(element => {
    const style = window.getComputedStyle(element);
    return {
      transitionDuration: Number.parseFloat(style.transitionDuration) || 0,
      animationDuration: Number.parseFloat(style.animationDuration) || 0,
      scrollBehavior: window.getComputedStyle(document.documentElement).scrollBehavior,
    };
  });

  expect(motion.transitionDuration).toBeLessThanOrEqual(0.001);
  expect(motion.animationDuration).toBeLessThanOrEqual(0.001);
  expect(motion.scrollBehavior).toBe('auto');
});
