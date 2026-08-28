import { test, expect } from '@playwright/test';

const longArticle = '/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/';
const historicalArticle = '/posts/scaling-order-tracking-with-kafka-domain-events-and-auto-ingestion/';
const caseStudies = ['/projects/order-tracking/', '/projects/snapshot-ingestion/'];

async function assertNoPageOverflow(page: import('@playwright/test').Page, width: number) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.clientWidth).toBe(width);
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(width + 1);
}

test('long article uses document-first measure and quiet metadata', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(longArticle, { waitUntil: 'networkidle' });

  const content = page.locator('[data-visual-role="longform-content"]');
  const bounds = await content.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.width).toBeGreaterThan(520);
  expect(bounds!.width).toBeLessThan(760);

  const h1Size = await page.locator('.portfolio-longform-header h1').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(h1Size).toBeGreaterThanOrEqual(42);
  expect(h1Size).toBeLessThanOrEqual(48);

  const meta = page.locator('[data-visual-role="article-meta"]');
  const metaStyle = await meta.evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      background: style.backgroundColor,
      borderTop: style.borderTopWidth,
      radius: style.borderRadius,
      shadow: style.boxShadow,
    };
  });
  expect(metaStyle.background).toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
  expect(metaStyle.borderTop).toBe('0px');
  expect(metaStyle.radius).toBe('0px');
  expect(metaStyle.shadow).toBe('none');

  const taxonomy = page.locator('[data-visual-role="article-taxonomy"]');
  await expect(taxonomy).toContainText('Topics:');
  const topicStyle = await taxonomy.locator('a').first().evaluate((el) => {
    const style = getComputedStyle(el);
    return { radius: style.borderRadius, transform: style.transform, shadow: style.boxShadow };
  });
  expect(topicStyle.radius).toBe('0px');
  expect(topicStyle.transform).toBe('none');
  expect(topicStyle.shadow).toBe('none');

  const firstH2 = content.locator('h2').first();
  const ornament = await firstH2.evaluate((el) => ({
    borderLeft: getComputedStyle(el).borderLeftWidth,
    before: getComputedStyle(el, '::before').content,
  }));
  expect(ornament.borderLeft).toBe('0px');
  expect(['none', 'normal', '""']).toContain(ornament.before);

  const cover = page.locator('[data-visual-role="article-cover"]');
  await expect(cover).toHaveCount(1);
  const coverStyle = await cover.evaluate((el) => {
    const style = getComputedStyle(el);
    return { radius: style.borderRadius, shadow: style.boxShadow };
  });
  expect(coverStyle.radius).toBe('0px');
  expect(coverStyle.shadow).toBe('none');
});

test('flagship case studies keep narrative structure while diagrams can exceed prose measure', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const route of caseStudies) {
    await page.goto(route, { waitUntil: 'networkidle' });
    const content = page.locator('[data-visual-role="longform-content"]');
    const contentBounds = await content.boundingBox();
    expect(contentBounds).not.toBeNull();
    expect(contentBounds!.width).toBeGreaterThan(520);
    expect(contentBounds!.width).toBeLessThan(760);

    const technicalMedia = content.locator(':scope > picture, :scope > figure').first();
    await expect(technicalMedia).toHaveCount(1);
    const mediaBounds = await technicalMedia.boundingBox();
    expect(mediaBounds).not.toBeNull();
    expect(mediaBounds!.width).toBeGreaterThan(contentBounds!.width + 100);

    await expect(content.locator('h2').first()).toBeVisible();
  }
});

test('historical article keeps cover and taxonomy without theme card chrome', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto(historicalArticle, { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(200);

  await expect(page.locator('[data-visual-role="longform-content"]')).toBeVisible();
  const meta = page.locator('[data-visual-role="article-meta"]');
  await expect(meta).toBeVisible();
  expect(await page.locator('.post-meta .bg-card, .post-license, .related-posts .rounded-xl').count()).toBe(0);
});

for (const width of [390, 360]) {
  test(`longform surfaces stay usable without page overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });

    for (const route of [longArticle, ...caseStudies]) {
      await page.goto(route, { waitUntil: 'networkidle' });
      await assertNoPageOverflow(page, width);

      const content = page.locator('[data-visual-role="longform-content"]');
      const bounds = await content.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(15);
      expect(bounds!.width).toBeLessThanOrEqual(width - 30);

      const media = content.locator(':scope > picture, :scope > figure').first();
      if (await media.count()) {
        const mediaBounds = await media.boundingBox();
        expect(mediaBounds).not.toBeNull();
        expect(mediaBounds!.x).toBeGreaterThanOrEqual(15);
        expect(mediaBounds!.width).toBeLessThanOrEqual(width - 30);
      }
    }

    await page.goto(longArticle, { waitUntil: 'networkidle' });
    const code = page.locator('[data-visual-role="longform-content"] pre').first();
    if (await code.count()) {
      expect(await code.evaluate((el) => getComputedStyle(el).overflowX)).toMatch(/auto|scroll/);
    }
  });
}
