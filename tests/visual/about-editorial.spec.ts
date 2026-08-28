import { expect, test } from '@playwright/test';

test('About brings the portrait into the opening composition without card chrome', async ({ page }) => {
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
  const intro = body.locator('p').first();
  await expect(photo).toBeVisible();
  const photoStyle = await photo.evaluate(element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      right: rect.right,
      width: Math.round(rect.width),
      radius: Number.parseFloat(style.borderRadius),
      borderTop: style.borderTopWidth,
      shadow: style.boxShadow,
    };
  });
  const introBounds = await intro.boundingBox();
  const bodyBounds = await body.boundingBox();
  expect(introBounds).not.toBeNull();
  expect(bodyBounds).not.toBeNull();
  expect(photoStyle.width).toBeGreaterThanOrEqual(248);
  expect(photoStyle.width).toBeLessThanOrEqual(272);
  expect(photoStyle.top).toBeLessThanOrEqual(introBounds!.y + 12);
  expect(photoStyle.right).toBeGreaterThan(bodyBounds!.x + bodyBounds!.width * 0.7);
  expect(photoStyle.radius).toBe(0);
  expect(photoStyle.borderTop).toBe('0px');
  expect(photoStyle.shadow).toBe('none');

  const paragraphSpacing = Number.parseFloat(await intro.evaluate(element => getComputedStyle(element).marginBottom));
  expect(paragraphSpacing).toBeGreaterThanOrEqual(16);
  expect(paragraphSpacing).toBeLessThanOrEqual(20);

  const firstH2 = body.locator('h2').first();
  const sectionGap = Number.parseFloat(await firstH2.evaluate(element => getComputedStyle(element).marginTop));
  expect(sectionGap).toBeGreaterThanOrEqual(46);
  expect(sectionGap).toBeLessThanOrEqual(50);

  await expect(page.getByText('Contact:', { exact: false }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'LinkedIn' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'GitHub' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Email' }).first()).toBeVisible();
});

for (const width of [390, 360]) {
  test(`About mobile keeps deliberate portrait and text flow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/about/', { waitUntil: 'networkidle' });

    const body = page.locator('[data-visual-role="about-editorial"]');
    const bounds = await body.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(18);
    expect(bounds!.width).toBeLessThanOrEqual(width - 36);

    const figure = body.locator('figure').first();
    const photo = figure.locator('img[alt="Enrique Goberna outdoors"]');
    const figureBounds = await figure.boundingBox();
    const introBounds = await body.locator('p').first().boundingBox();
    expect(figureBounds).not.toBeNull();
    expect(introBounds).not.toBeNull();
    expect(await photo.isVisible()).toBeTruthy();
    expect(figureBounds!.width).toBeLessThanOrEqual(240);
    expect(figureBounds!.y).toBeLessThan(introBounds!.y);
    expect(await figure.evaluate(element => getComputedStyle(element).float)).toBe('none');

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await expect(page.getByText('Contact:', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Email' }).first()).toBeVisible();
  });
}
