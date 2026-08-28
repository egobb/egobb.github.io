import { expect, test } from '@playwright/test';

const writingRoutes = ['/writing/', '/posts/'];

for (const route of writingRoutes) {
  test(`${route} uses a text-first editorial article index`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.ok()).toBeTruthy();

    const index = page.locator('[data-visual-role="writing-index"]').first();
    await expect(index).toBeVisible();
    const entries = index.locator('[data-visual-role="writing-entry"]');
    expect(await entries.count()).toBeGreaterThan(1);

    await expect(index.locator('img')).toHaveCount(0);
    await expect(index.locator('[class*="scale-"]')).toHaveCount(0);
    await expect(index.locator('[class*="shadow"]')).toHaveCount(0);

    const first = entries.first();
    await expect(first.locator('time')).toBeVisible();
    await expect(first.locator('[data-visual-role="writing-entry-title"]')).toBeVisible();
    await expect(first.locator('[data-visual-role="writing-entry-summary"]')).toBeVisible();

    const hierarchy = await first.evaluate(element => {
      const title = element.querySelector<HTMLElement>('[data-visual-role="writing-entry-title"]');
      const meta = element.querySelector<HTMLElement>('[data-visual-role="writing-entry-meta"]');
      if (!title || !meta) throw new Error('Missing writing hierarchy elements');
      const rect = element.getBoundingClientRect();
      return {
        height: Math.round(rect.height),
        titleSize: Number.parseFloat(getComputedStyle(title).fontSize),
        metaSize: Number.parseFloat(getComputedStyle(meta).fontSize),
      };
    });

    expect(hierarchy.titleSize).toBeGreaterThan(hierarchy.metaSize);
    expect(hierarchy.height).toBeLessThan(280);
  });
}

test('Home recent writing reuses the same compact editorial language', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const list = page.locator('.editorial-post-list');
  await expect(list).toBeVisible();
  await expect(list.getByRole('heading', { name: 'Engineering writing' })).toBeVisible();
  await expect(list.locator('img')).toHaveCount(0);
  await expect(list.locator('[data-visual-role="writing-entry"]')).not.toHaveCount(0);
  await expect(list.getByRole('link', { name: 'View all writing' })).toHaveAttribute('href', '/writing/');
});

test('Archive and taxonomy surfaces do not reintroduce cards, tag clouds, or hover lift', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/archives/', { waitUntil: 'networkidle' });
  const archive = page.locator('[data-visual-role="archive-index"]');
  await expect(archive).toBeVisible();
  await expect(archive.locator('[data-visual-role="archive-entry"]')).not.toHaveCount(0);
  await expect(archive.locator('[class*="rounded"]')).toHaveCount(0);
  await expect(archive.locator('[class*="scale-"]')).toHaveCount(0);

  for (const route of ['/tags/', '/categories/']) {
    await page.goto(route, { waitUntil: 'networkidle' });
    const taxonomy = page.locator('[data-visual-role="taxonomy-index"]');
    await expect(taxonomy).toBeVisible();
    await expect(taxonomy.locator('[class*="rounded"]')).toHaveCount(0);
    await expect(taxonomy.locator('[class*="scale-"]')).toHaveCount(0);
  }
});

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`Writing editorial baseline at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/writing/', { waitUntil: 'networkidle' });
    await expect(page).toHaveScreenshot(`writing-editorial-${viewport.name}.png`, { fullPage: true });
  });
}
