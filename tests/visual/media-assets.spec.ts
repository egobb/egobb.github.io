import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const artifactDir = path.join(process.cwd(), 'artifacts', 'visual-review');

const coverPages = [
  { route: '/posts/automating-order-tracking-from-functionality-to-continuous-integration/', sourceBytes: 1_355_332 },
  { route: '/posts/lost-in-the-clouds-automating-deployments-with-aws-terraform-and-github-actions/', sourceBytes: 1_432_144 },
  { route: '/posts/order-tracking-first-steps-into-my-portfolio/', sourceBytes: 1_470_687 },
  { route: '/posts/scaling-order-tracking-with-kafka-domain-events-and-auto-ingestion/', sourceBytes: 1_486_689 },
  { route: '/posts/welcome-to-the-blog-building-my-portfolio/', sourceBytes: 1_910_794 },
  { route: '/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/', sourceBytes: 1_754_621 },
] as const;

const viewports = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

const architecturePages = [
  { route: '/projects/order-tracking/', sourceFragment: 'order-tracking-architecture' },
  { route: '/projects/snapshot-ingestion/', sourceFragment: 'snapshot-ingestion-architecture' },
] as const;

test('configured social, logo and favicon assets resolve', async ({ request }) => {
  for (const asset of ['/images/og-default.avif', '/images/logo.svg', '/favicon.svg']) {
    const response = await request.get(asset);
    expect(response.ok(), `${asset} returned ${response.status()}`).toBeTruthy();
    expect((await response.body()).byteLength, `${asset} is empty`).toBeGreaterThan(100);
  }
});

test('optimized media has desktop/mobile transfer evidence and architecture remains legible', async ({ browser }) => {
  fs.mkdirSync(artifactDir, { recursive: true });

  const inventory: Array<Record<string, string | number>> = [];
  const architectureDiagrams: Array<Record<string, string | number>> = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();

    for (const { route, sourceBytes } of coverPages) {
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      expect(response?.ok(), `${route} did not load at ${viewport.name}`).toBeTruthy();

      const cover = page.locator('main img[data-source-width]').first();
      await expect(cover).toBeVisible();

      const data = await cover.evaluate((img: HTMLImageElement) => {
        const rect = img.getBoundingClientRect();
        const src = img.currentSrc || img.src;
        const resource = performance
          .getEntriesByType('resource')
          .find((entry) => entry.name === src) as PerformanceResourceTiming | undefined;

        return {
          src,
          sourceWidth: Number(img.dataset.sourceWidth || 0),
          sourceHeight: Number(img.dataset.sourceHeight || 0),
          optimizedWidth: Number(img.dataset.optimizedWidth || img.naturalWidth),
          optimizedHeight: Number(img.dataset.optimizedHeight || img.naturalHeight),
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          renderedWidth: Math.round(rect.width),
          renderedHeight: Math.round(rect.height),
          transferSize: resource?.transferSize ?? 0,
          encodedBodySize: resource?.encodedBodySize ?? 0,
        };
      });

      expect(data.src, `${route} should use Hugo-generated WebP`).toContain('.webp');
      expect(data.sourceWidth, `${route} source width missing`).toBeGreaterThan(0);
      expect(data.sourceHeight, `${route} source height missing`).toBeGreaterThan(0);
      expect(data.optimizedWidth, `${route} optimized width`).toBeLessThanOrEqual(1200);
      expect(data.optimizedWidth, `${route} should not upscale`).toBeLessThanOrEqual(data.sourceWidth);
      expect(data.naturalWidth).toBe(data.optimizedWidth);
      expect(data.encodedBodySize, `${route} encoded transfer size missing at ${viewport.name}`).toBeGreaterThan(0);
      expect(data.encodedBodySize, `${route} optimized asset should be smaller than source`).toBeLessThan(sourceBytes);

      inventory.push({
        viewport: viewport.name,
        route,
        sourceBytes,
        ...data,
        savingsBytes: sourceBytes - data.encodedBodySize,
        savingsPercent: Math.round((1 - data.encodedBodySize / sourceBytes) * 10_000) / 100,
      });
    }

    for (const { route, sourceFragment } of architecturePages) {
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      expect(response?.ok(), `${route} did not load at ${viewport.name}`).toBeTruthy();

      const diagram = page.locator(`picture img[src*="${sourceFragment}"]`).first();
      await expect(diagram).toBeVisible();
      const geometry = await diagram.evaluate((img: HTMLImageElement) => {
        const rect = img.getBoundingClientRect();
        return {
          src: img.currentSrc || img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          renderedWidth: Math.round(rect.width),
          renderedHeight: Math.round(rect.height),
        };
      });

      expect(geometry.naturalWidth, `${route} architecture source width missing`).toBeGreaterThan(0);
      expect(geometry.naturalHeight, `${route} architecture source height missing`).toBeGreaterThan(0);
      expect(
        geometry.renderedWidth,
        `${route} architecture diagram is too narrow to remain useful at ${viewport.name}`,
      ).toBeGreaterThanOrEqual(viewport.name === 'mobile' ? 280 : 600);
      expect(geometry.renderedHeight, `${route} architecture diagram collapsed at ${viewport.name}`).toBeGreaterThan(150);

      architectureDiagrams.push({ viewport: viewport.name, route, ...geometry });
    }

    await context.close();
  }

  const editorialContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const editorialPage = await editorialContext.newPage();
  await editorialPage.goto('/writing/', { waitUntil: 'networkidle' });
  const writingIndexImageCount = await editorialPage.locator('[data-visual-role="writing-index"] img').count();
  expect(writingIndexImageCount, 'Issue #18 must not restore thumbnails removed by epic #47').toBe(0);
  await editorialContext.close();

  fs.writeFileSync(
    path.join(artifactDir, 'media-assets.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), inventory, architectureDiagrams, writingIndexImageCount }, null, 2)}\n`,
  );
});
