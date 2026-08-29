import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {
  collectConsoleErrors,
  findBrokenImages,
  getOverflowDiagnostics,
  stabilizePage,
} from './helpers';

const artifactDir = path.join(process.cwd(), 'artifacts', 'quality-gates');
const revision = process.env.QUALITY_GATE_REVISION || process.env.GITHUB_SHA || 'local';

const representativePages = [
  { name: 'home', url: '/' },
  { name: 'projects', url: '/projects/' },
  { name: 'order-tracking-case-study', url: '/projects/order-tracking/' },
  { name: 'snapshot-ingestion-case-study', url: '/projects/snapshot-ingestion/' },
  {
    name: 'long-article',
    url: '/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/',
  },
  { name: 'about', url: '/about/' },
] as const;

const responsiveViewports = [
  { name: 'compact-mobile', width: 320, height: 740 },
  { name: 'narrow-mobile', width: 360, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'compact-desktop', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

const performanceViewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

const performanceBudgets = {
  maxLoadEventMs: 10_000,
  maxEncodedBodyBytes: 5_000_000,
  maxResourceCount: 140,
} as const;

function ensureArtifactDirectory(): void {
  fs.mkdirSync(artifactDir, { recursive: true });
}

function normalizeInternalUrl(raw: string, currentUrl: string): string | null {
  if (!raw || raw.startsWith('#')) return null;
  try {
    const parsed = new URL(raw, currentUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    const internalHosts = new Set(['127.0.0.1', 'localhost', 'enriquegoberna.com', 'www.enriquegoberna.com']);
    if (!internalHosts.has(parsed.hostname)) return null;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

async function geometry(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const read = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        x: Math.round(rect.x * 10) / 10,
        y: Math.round(rect.y * 10) / 10,
        width: Math.round(rect.width * 10) / 10,
        height: Math.round(rect.height * 10) / 10,
      };
    };
    return {
      header: read('header'),
      main: read('main'),
      footer: read('footer'),
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });
}

function maxGeometryDelta(
  before: Awaited<ReturnType<typeof geometry>>,
  after: Awaited<ReturnType<typeof geometry>>,
): number {
  const deltas: number[] = [];
  for (const key of ['header', 'main', 'footer'] as const) {
    const left = before[key];
    const right = after[key];
    if (!left || !right) continue;
    for (const field of ['x', 'y', 'width', 'height'] as const) {
      deltas.push(Math.abs(left[field] - right[field]));
    }
  }
  deltas.push(Math.abs(before.documentWidth - after.documentWidth));
  return Math.max(...deltas, 0);
}

test.beforeAll(() => ensureArtifactDirectory());

test('representative pages have no horizontal overflow across the final viewport matrix', async ({ browser }) => {
  test.setTimeout(180_000);
  const evidence: Array<Record<string, string | number | boolean>> = [];

  for (const viewport of responsiveViewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();

    for (const target of representativePages) {
      const response = await page.goto(target.url, { waitUntil: 'networkidle' });
      expect(response?.ok(), `${target.url} failed at ${viewport.width}px`).toBeTruthy();
      await stabilizePage(page);
      const overflow = await getOverflowDiagnostics(page);
      expect(
        overflow.horizontalOverflow,
        `${target.name} overflow at ${viewport.width}px: ${overflow.scrollWidth}px > ${overflow.clientWidth}px; ` +
          JSON.stringify(overflow.elements),
      ).toBeFalsy();
      evidence.push({
        page: target.name,
        viewport: viewport.name,
        width: viewport.width,
        clientWidth: overflow.clientWidth,
        scrollWidth: overflow.scrollWidth,
        passed: true,
      });
    }

    await context.close();
  }

  fs.writeFileSync(
    path.join(artifactDir, 'viewport-matrix.json'),
    `${JSON.stringify({ revision, generatedAt: new Date().toISOString(), evidence }, null, 2)}\n`,
  );
});

test('key pages render without console errors or missing images', async ({ browser }) => {
  test.setTimeout(120_000);
  const evidence: Array<Record<string, unknown>> = [];

  for (const viewport of performanceViewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });

    for (const target of representativePages) {
      const page = await context.newPage();
      const consoleErrors = collectConsoleErrors(page);
      const response = await page.goto(target.url, { waitUntil: 'networkidle' });
      expect(response?.ok(), `${target.url} failed at ${viewport.name}`).toBeTruthy();
      await stabilizePage(page);
      const brokenImages = await findBrokenImages(page);

      expect(consoleErrors, `${target.name} console errors at ${viewport.name}`).toEqual([]);
      expect(brokenImages, `${target.name} broken images at ${viewport.name}`).toEqual([]);

      evidence.push({ page: target.name, viewport: viewport.name, consoleErrors, brokenImages });
      await page.close();
    }

    await context.close();
  }

  fs.writeFileSync(
    path.join(artifactDir, 'rendering-assets.json'),
    `${JSON.stringify({ revision, generatedAt: new Date().toISOString(), evidence }, null, 2)}\n`,
  );
});

test('all sitemap pages and discovered internal links/assets resolve', async ({ page, request }) => {
  test.setTimeout(180_000);
  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.ok(), 'sitemap.xml must resolve').toBeTruthy();
  const sitemap = await sitemapResponse.text();
  const sitemapRoutes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map(match => normalizeInternalUrl(match[1], 'https://enriquegoberna.com/'))
    .filter((value): value is string => Boolean(value));

  expect(sitemapRoutes.length, 'sitemap should expose public routes').toBeGreaterThan(0);

  const discoveredLinks = new Set<string>();
  const discoveredAssets = new Set<string>();

  for (const route of sitemapRoutes) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `sitemap route failed: ${route}`).toBeTruthy();

    const currentUrl = page.url();
    const links = await page.locator('a[href]').evaluateAll(elements =>
      elements.map(element => element.getAttribute('href')).filter((value): value is string => Boolean(value)),
    );
    for (const href of links) {
      const normalized = normalizeInternalUrl(href, currentUrl);
      if (normalized) discoveredLinks.add(normalized);
    }

    const assets = await page.evaluate(() => {
      const values: string[] = [];
      document.querySelectorAll<HTMLElement>('img[src], script[src], link[href], source[srcset]').forEach(element => {
        const src = element.getAttribute('src');
        const href = element.getAttribute('href');
        const srcset = element.getAttribute('srcset');
        if (src) values.push(src);
        if (href) values.push(href);
        if (srcset) {
          for (const candidate of srcset.split(',')) {
            const url = candidate.trim().split(/\s+/)[0];
            if (url) values.push(url);
          }
        }
      });
      return values;
    });
    for (const asset of assets) {
      const normalized = normalizeInternalUrl(asset, currentUrl);
      if (normalized) discoveredAssets.add(normalized);
    }
  }

  const failures: string[] = [];
  for (const target of [...new Set([...sitemapRoutes, ...discoveredLinks, ...discoveredAssets])].sort()) {
    const response = await request.get(target, { maxRedirects: 10 });
    if (!response.ok()) failures.push(`${target} -> ${response.status()}`);
  }

  expect(failures, `broken internal targets: ${failures.join(', ')}`).toEqual([]);

  fs.writeFileSync(
    path.join(artifactDir, 'broken-link-report.json'),
    `${JSON.stringify(
      {
        revision,
        generatedAt: new Date().toISOString(),
        sitemapRoutes: sitemapRoutes.length,
        internalLinks: discoveredLinks.size,
        internalAssets: discoveredAssets.size,
        failures,
      },
      null,
      2,
    )}\n`,
  );
});

test('header, footer, active navigation and appearance switching remain geometrically stable', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const routes = [
    { url: '/projects/', activeHref: '/projects/' },
    { url: '/writing/', activeHref: '/writing/' },
    { url: '/about/', activeHref: '/about/' },
  ] as const;

  const evidence: Array<Record<string, unknown>> = [];

  for (const route of routes) {
    const response = await page.goto(route.url, { waitUntil: 'networkidle' });
    expect(response?.ok(), `${route.url} failed`).toBeTruthy();
    await stabilizePage(page);

    const header = page.getByRole('banner');
    const footer = page.getByRole('contentinfo');
    await expect(header).toBeVisible();
    await expect(footer).toBeVisible();
    await expect(page.locator(`header nav a[href="${route.activeHref}"]`)).toHaveAttribute('aria-current', 'page');
    await expect(page.locator(`header nav a[href="${route.activeHref}"]`)).toHaveClass(/nav-active-indicator/);

    const footerNav = page.getByRole('navigation', { name: 'Footer' });
    for (const name of ['GitHub', 'LinkedIn', 'Email', 'RSS']) {
      await expect(footerNav.getByRole('link', { name, exact: true }), `footer ${name}`).toBeVisible();
    }

    const toggle = page.getByRole('button', { name: 'Toggle light and dark appearance' });
    await expect(toggle).toBeVisible();
    const before = await geometry(page);
    await toggle.click();
    await page.evaluate(() => document.fonts.ready);
    const after = await geometry(page);
    const delta = maxGeometryDelta(before, after);

    expect(delta, `${route.url} appearance switch layout delta ${delta}px`).toBeLessThanOrEqual(1);
    expect(after.documentWidth, `${route.url} overflow after appearance switch`).toBeLessThanOrEqual(after.viewportWidth);
    evidence.push({ route: route.url, maxGeometryDeltaPx: delta, before, after });
  }

  fs.writeFileSync(
    path.join(artifactDir, 'navigation-appearance.json'),
    `${JSON.stringify({ revision, generatedAt: new Date().toISOString(), evidence }, null, 2)}\n`,
  );
});

test('records mobile and desktop performance baselines and enforces regression budgets', async ({ browser }) => {
  test.setTimeout(180_000);
  const samples: Array<Record<string, unknown>> = [];

  for (const viewport of performanceViewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();

    for (const target of representativePages) {
      const response = await page.goto(target.url, { waitUntil: 'networkidle' });
      expect(response?.ok(), `${target.url} failed at ${viewport.name}`).toBeTruthy();
      await page.evaluate(() => document.fonts.ready);

      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const encodedBodyBytes = resources.reduce((total, entry) => total + (entry.encodedBodySize || 0), 0);
        const transferBytes = resources.reduce((total, entry) => total + (entry.transferSize || 0), 0);
        const largestResources = resources
          .map(entry => ({
            name: new URL(entry.name).pathname,
            encodedBodyBytes: entry.encodedBodySize || 0,
            transferBytes: entry.transferSize || 0,
          }))
          .sort((left, right) => right.encodedBodyBytes - left.encodedBodyBytes)
          .slice(0, 5);
        return {
          domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd),
          loadEventMs: Math.round(navigation.loadEventEnd),
          responseEndMs: Math.round(navigation.responseEnd),
          resourceCount: resources.length,
          encodedBodyBytes,
          transferBytes,
          largestResources,
        };
      });

      expect(metrics.loadEventMs, `${target.name} load event at ${viewport.name}`).toBeLessThanOrEqual(
        performanceBudgets.maxLoadEventMs,
      );
      expect(metrics.encodedBodyBytes, `${target.name} encoded body bytes at ${viewport.name}`).toBeLessThanOrEqual(
        performanceBudgets.maxEncodedBodyBytes,
      );
      expect(metrics.resourceCount, `${target.name} resource count at ${viewport.name}`).toBeLessThanOrEqual(
        performanceBudgets.maxResourceCount,
      );

      samples.push({ page: target.name, route: target.url, viewport: viewport.name, ...metrics });
    }

    await context.close();
  }

  const baseline = {
    revision,
    generatedAt: new Date().toISOString(),
    environment: 'Hugo production build served locally by the Playwright CI web server',
    budgets: performanceBudgets,
    samples,
  };
  fs.writeFileSync(path.join(artifactDir, 'performance-baseline.json'), `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(`QUALITY_GATE_PERFORMANCE_BASELINE=${JSON.stringify(baseline)}`);
});
