import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const artifactDir = path.join(process.cwd(), 'artifacts', 'visual-review');

const coverPages = [
  { route: '/posts/automating-order-tracking/', sourceBytes: 1_355_332 },
  { route: '/posts/lost-in-the-clouds/', sourceBytes: 1_432_144 },
  { route: '/posts/order-tracking-first-steps/', sourceBytes: 1_470_687 },
  { route: '/posts/scaling-order-tracking-kafka/', sourceBytes: 1_486_689 },
  { route: '/posts/welcome-to-the-blog-building-my-portfolio/', sourceBytes: 1_910_794 },
  { route: '/posts/when-postgres-is-enough-snapshot-ingestion-pipeline/', sourceBytes: 1_754_621 },
] as const;

test('configured social, logo and favicon assets resolve', async ({ request }) => {
  for (const asset of ['/images/og-default.avif', '/images/logo.svg', '/favicon.svg']) {
    const response = await request.get(asset);
    expect(response.ok(), `${asset} returned ${response.status()}`).toBeTruthy();
    expect((await response.body()).byteLength, `${asset} is empty`).toBeGreaterThan(100);
  }
});

test('post covers are bounded WebP variants and transfer evidence is recorded', async ({ page }) => {
  fs.mkdirSync(artifactDir, { recursive: true });

  const inventory: Array<Record<string, string | number>> = [];

  for (const { route, sourceBytes } of coverPages) {
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.ok(), `${route} did not load`).toBeTruthy();

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
    expect(data.encodedBodySize, `${route} encoded transfer size missing`).toBeGreaterThan(0);
    expect(data.encodedBodySize, `${route} optimized asset should be smaller than source`).toBeLessThan(sourceBytes);

    inventory.push({ route, sourceBytes, ...data });
  }

  await page.goto('/', { waitUntil: 'networkidle' });
  const cardCovers = await page.locator('a[href^="/posts/"] img[src]').evaluateAll((elements) =>
    elements.map((element) => {
      const img = element as HTMLImageElement;
      const src = img.currentSrc || img.src;
      const resource = performance
        .getEntriesByType('resource')
        .find((entry) => entry.name === src) as PerformanceResourceTiming | undefined;
      return {
        src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        transferSize: resource?.transferSize ?? 0,
        encodedBodySize: resource?.encodedBodySize ?? 0,
      };
    }),
  );

  expect(cardCovers.length).toBeGreaterThan(0);
  for (const image of cardCovers) {
    expect(image.src).toContain('.webp');
    expect(image.naturalWidth).toBeLessThanOrEqual(640);
    expect(image.encodedBodySize).toBeGreaterThan(0);
  }

  fs.writeFileSync(
    path.join(artifactDir, 'media-assets.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), inventory, homeCardCovers: cardCovers }, null, 2)}\n`,
  );
});
