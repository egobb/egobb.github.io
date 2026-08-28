import { expect, test } from '@playwright/test';
import { getOverflowDiagnostics, stabilizePage } from './helpers';

const mobileViewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'narrow-mobile', width: 360, height: 800 },
] as const;

for (const viewport of mobileViewports) {
  test(`global shell stays compact and touch-friendly at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await stabilizePage(page);

    const metrics = await page.locator('.portfolio-mobile-header').evaluate(header => {
      const headerRect = header.getBoundingClientRect();
      const theme = header.querySelector<HTMLElement>('.portfolio-theme-toggle');
      const menu = header.querySelector<HTMLElement>('.portfolio-mobile-menu-toggle');
      if (!theme || !menu) throw new Error('Missing mobile shell controls');
      return {
        headerHeight: headerRect.height,
        themeHeight: theme.getBoundingClientRect().height,
        menuHeight: menu.getBoundingClientRect().height,
      };
    });

    expect(metrics.headerHeight).toBeGreaterThanOrEqual(48);
    expect(metrics.headerHeight).toBeLessThanOrEqual(56);
    expect(metrics.themeHeight).toBeGreaterThanOrEqual(44);
    expect(metrics.menuHeight).toBeGreaterThanOrEqual(44);

    const menuToggle = page.locator('#mobile-menu-toggle');
    await menuToggle.click();
    const menuLinks = page.locator('.portfolio-mobile-nav-link');
    expect(await menuLinks.count()).toBeGreaterThan(0);
    const linkHeights = await menuLinks.evaluateAll(links => links.map(link => link.getBoundingClientRect().height));
    for (const height of linkHeights) expect(height).toBeGreaterThanOrEqual(44);

    const overflow = await getOverflowDiagnostics(page);
    expect(overflow.horizontalOverflow, JSON.stringify(overflow.elements)).toBeFalsy();
  });

  test(`Home remains content-first at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await stabilizePage(page);

    const metrics = await page.evaluate(() => {
      const title = document.querySelector<HTMLElement>('[data-visual-role="home-hero-title"]');
      const avatar = document.querySelector<HTMLElement>('[data-visual-role="home-hero-avatar"]');
      const primary = document.querySelector<HTMLElement>('[data-visual-role="home-hero-primary-cta"]');
      const actions = Array.from(document.querySelectorAll<HTMLElement>('[data-visual-role="home-hero-actions"] a'));
      if (!title || !avatar || !primary || actions.length !== 3) throw new Error('Missing Home mobile composition element');
      return {
        titleSize: Number.parseFloat(getComputedStyle(title).fontSize),
        avatarWidth: avatar.getBoundingClientRect().width,
        primaryHeight: primary.getBoundingClientRect().height,
        primaryWidth: primary.getBoundingClientRect().width,
        actionWidths: actions.map(action => action.getBoundingClientRect().width),
        viewportWidth: document.documentElement.clientWidth,
      };
    });

    expect(metrics.titleSize).toBeGreaterThanOrEqual(30);
    expect(metrics.titleSize).toBeLessThanOrEqual(32);
    expect(metrics.avatarWidth).toBeLessThanOrEqual(64);
    expect(metrics.primaryHeight).toBeGreaterThanOrEqual(44);
    expect(metrics.primaryWidth).toBeLessThan(metrics.viewportWidth * 0.75);
    for (const width of metrics.actionWidths) expect(width).toBeLessThan(metrics.viewportWidth * 0.9);
  });

  test(`About and long-form keep deliberate narrow-phone composition at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    await page.goto('/about/');
    await stabilizePage(page);
    const about = page.locator('.portfolio-about-page');
    const aboutRect = await about.boundingBox();
    expect(aboutRect).not.toBeNull();
    expect(aboutRect!.x).toBeGreaterThanOrEqual(20);
    expect(viewport.width - (aboutRect!.x + aboutRect!.width)).toBeGreaterThanOrEqual(20);

    await page.goto('/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/');
    await stabilizePage(page);
    const articleMetrics = await page.locator('.portfolio-longform-header h1').evaluate(title => ({
      size: Number.parseFloat(getComputedStyle(title).fontSize),
      lineHeight: Number.parseFloat(getComputedStyle(title).lineHeight),
    }));
    expect(articleMetrics.size).toBeGreaterThanOrEqual(30);
    expect(articleMetrics.size).toBeLessThanOrEqual(36);
    expect(articleMetrics.lineHeight / articleMetrics.size).toBeGreaterThanOrEqual(1.05);

    const overflow = await getOverflowDiagnostics(page);
    expect(overflow.horizontalOverflow, JSON.stringify(overflow.elements)).toBeFalsy();
  });
}
