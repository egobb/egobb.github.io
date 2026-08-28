import { expect, test } from '@playwright/test';

const longArticle = '/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/';

test('Writing keeps Archive primary while taxonomy remains quietly discoverable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto('/writing/', { waitUntil: 'networkidle' });
  expect(response?.ok()).toBeTruthy();

  const primaryIndex = page.locator('[data-visual-role="writing-primary-index"]');
  await expect(primaryIndex.getByRole('link', { name: 'Archive', exact: true })).toHaveAttribute('href', '/archives/');
  await expect(primaryIndex.getByRole('link', { name: 'Categories', exact: true })).toHaveCount(0);
  await expect(primaryIndex.getByRole('link', { name: 'Tags', exact: true })).toHaveCount(0);

  const taxonomy = page.locator('[data-visual-role="writing-taxonomy-links"]');
  await expect(taxonomy.getByRole('link', { name: 'Categories', exact: true })).toHaveAttribute('href', '/categories/');
  await expect(taxonomy.getByRole('link', { name: 'Tags', exact: true })).toHaveAttribute('href', '/tags/');
});

test('Article header exposes a concise taxonomy and preserves the complete set after the article', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto(longArticle, { waitUntil: 'networkidle' });
  expect(response?.ok()).toBeTruthy();

  const headerTaxonomy = page.locator('[data-visual-role="article-taxonomy"]');
  const fullTaxonomy = page.locator('[data-visual-role="article-taxonomy-full"]');
  await expect(headerTaxonomy).toBeVisible();
  await expect(fullTaxonomy).toBeVisible();

  const headerLinks = headerTaxonomy.getByRole('link');
  const fullLinks = fullTaxonomy.getByRole('link');
  expect(await headerLinks.count()).toBeLessThanOrEqual(4);
  expect(await fullLinks.count()).toBeGreaterThan(await headerLinks.count());
  expect(await fullLinks.count()).toBeGreaterThanOrEqual(7);

  const chipLikeElements = page.locator('[data-visual-role="article-taxonomy"] [class*="rounded"], [data-visual-role="article-taxonomy-full"] [class*="rounded"]');
  await expect(chipLikeElements).toHaveCount(0);
});

test('legacy writing indexes share one editorial shell and keep stable taxonomy routes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  const routes = ['/posts/', '/archives/', '/categories/', '/tags/'];
  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('.portfolio-site-header')).toHaveCount(1);
    await expect(page.locator('.portfolio-footer')).toHaveCount(1);
    await expect(page.locator('.portfolio-primary-nav')).toHaveCount(1);
    await expect(page.locator('.portfolio-theme-toggle:visible')).toHaveCount(1);
    await expect(page.locator('main h1').first()).toBeVisible();

    const mainWidth = await page.locator('main > div').first().evaluate(element => element.getBoundingClientRect().width);
    expect(mainWidth, route).toBeLessThanOrEqual(900);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, route).toBeLessThanOrEqual(1);
  }

  await page.goto('/tags/', { waitUntil: 'networkidle' });
  const firstTerm = page.locator('[data-visual-role="taxonomy-index"] a[href^="/tags/"]').first();
  const termHref = await firstTerm.getAttribute('href');
  expect(termHref).toBeTruthy();

  const termResponse = await page.goto(termHref!, { waitUntil: 'networkidle' });
  expect(termResponse?.status()).toBe(200);
  await expect(page.locator('.portfolio-site-header')).toHaveCount(1);
  await expect(page.locator('.portfolio-footer')).toHaveCount(1);
  await expect(page.locator('main h1').first()).toBeVisible();
});

for (const width of [390, 360]) {
  test(`writing and taxonomy indexes remain intentional at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });

    for (const route of ['/writing/', '/archives/', '/categories/', '/tags/']) {
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      expect(response?.status(), route).toBe(200);
      await expect(page.locator('.portfolio-site-header')).toHaveCount(1);
      await expect(page.locator('.portfolio-theme-toggle:visible')).toHaveCount(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, route).toBeLessThanOrEqual(1);
    }
  });
}
