import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'narrow-mobile', width: 360, height: 800 },
];

for (const viewport of viewports) {
  test(`Home hero keeps calm personal hierarchy at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const response = await page.goto('/', { waitUntil: 'networkidle' });
    expect(response?.ok()).toBeTruthy();

    const hero = page.locator('.author-section');
    const title = hero.locator('[data-visual-role="home-hero-title"]');
    const avatar = hero.locator('[data-visual-role="home-hero-avatar"]');
    const primary = hero.getByRole('link', { name: 'Explore projects', exact: true });
    const writing = hero.getByRole('link', { name: 'Read engineering notes', exact: true });
    const github = hero.getByRole('link', { name: 'GitHub', exact: true });

    await expect(title).toBeVisible();
    await expect(avatar).toBeVisible();
    await expect(primary).toHaveAttribute('href', '/projects/');
    await expect(writing).toHaveAttribute('href', '/writing/');
    await expect(github).toHaveAttribute('href', 'https://github.com/egobb');

    const titleMetrics = await title.evaluate(element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const fontSize = Number.parseFloat(style.fontSize);
      const lineHeight = Number.parseFloat(style.lineHeight);
      return { fontSize, lineHeight, height: rect.height };
    });
    expect(titleMetrics.fontSize).toBeGreaterThanOrEqual(viewport.width < 768 ? 30 : 32);
    expect(titleMetrics.fontSize).toBeLessThanOrEqual(36.1);
    expect(titleMetrics.lineHeight / titleMetrics.fontSize).toBeGreaterThanOrEqual(1.05);
    expect(titleMetrics.lineHeight / titleMetrics.fontSize).toBeLessThanOrEqual(1.15);
    expect(titleMetrics.height / titleMetrics.lineHeight).toBeLessThanOrEqual(viewport.width <= 390 ? 4.1 : 3.1);

    const avatarMetrics = await avatar.evaluate(element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        border: style.borderTopWidth,
        shadow: style.boxShadow,
      };
    });
    expect(avatarMetrics.width).toBeGreaterThanOrEqual(75);
    expect(avatarMetrics.width).toBeLessThanOrEqual(77);
    expect(avatarMetrics.height).toBeGreaterThanOrEqual(75);
    expect(avatarMetrics.height).toBeLessThanOrEqual(77);
    expect(avatarMetrics.border).toBe('0px');
    expect(avatarMetrics.shadow).toBe('none');

    const actionMetrics = await Promise.all([primary, writing, github].map(locator => locator.evaluate(element => {
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        fontSize: Number.parseFloat(style.fontSize),
        fontWeight: Number.parseInt(style.fontWeight, 10),
      };
    })));
    expect(actionMetrics[0].background).not.toBe('rgba(0, 0, 0, 0)');
    expect(actionMetrics[2].fontSize).toBeLessThan(actionMetrics[1].fontSize);
    expect(actionMetrics[2].fontWeight).toBeLessThanOrEqual(actionMetrics[1].fontWeight);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
