import { expect, test } from '@playwright/test';

test('About is an editorial page without a page-level card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto('/about/', { waitUntil: 'networkidle' });
  expect(response?.ok()).toBeTruthy();

  const body = page.locator('[data-visual-role="about-editorial"]');
  await expect(body).toBeVisible();

  const surface = await body.evaluate(element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      width: Math.round(rect.width),
      background: style.backgroundColor,
      borderTop: style.borderTopWidth,
      radius: style.borderRadius,
      shadow: style.boxShadow,
    };
  });

  expect(surface.width).toBeLessThanOrEqual(760);
  expect(surface.background).toBe('rgba(0, 0, 0, 0)');
  expect(surface.borderTop).toBe('0px');
  expect(surface.radius).toBe('0px');
  expect(surface.shadow).toBe('none');

  const photo = body.locator('figure img[alt="Enrique Goberna outdoors"]');
  await expect(photo).toBeVisible();
  const photoStyle = await photo.evaluate(element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      width: Math.round(rect.width),
      radius: Number.parseFloat(style.borderRadius),
      shadow: style.boxShadow,
    };
  });
  expect(photoStyle.width).toBeGreaterThanOrEqual(280);
  expect(photoStyle.width).toBeLessThanOrEqual(320);
  expect(photoStyle.radius).toBeLessThanOrEqual(8);
  expect(photoStyle.shadow).toBe('none');

  const firstH2 = body.locator('h2').first();
  expect(Number.parseFloat(await firstH2.evaluate(element => getComputedStyle(element).marginTop))).toBeGreaterThanOrEqual(48);
});

test('About mobile keeps a content gutter and balanced photo flow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about/', { waitUntil: 'networkidle' });

  const body = page.locator('[data-visual-role="about-editorial"]');
  const bounds = await body.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(20);
  expect(bounds!.x).toBeLessThanOrEqual(24.5);
  expect(bounds!.width).toBeLessThanOrEqual(350);

  const photo = body.locator('figure img[alt="Enrique Goberna outdoors"]');
  const photoBounds = await photo.boundingBox();
  expect(photoBounds).not.toBeNull();
  expect(photoBounds!.width).toBeLessThanOrEqual(320);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await expect(page.getByText('Contact:', { exact: false }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Email' }).first()).toBeVisible();
});

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`About editorial baseline at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/about/', { waitUntil: 'networkidle' });
    await expect(page).toHaveScreenshot(`about-editorial-${viewport.name}.png`, { fullPage: true });
  });
}
