import { expect, test } from '@playwright/test';
import { stabilizePage, viewports } from './helpers';

test('global shell exposes one restrained appearance control and no theme-demo chrome', async ({ page }) => {
  await page.setViewportSize(viewports[0]);
  await page.goto('/');
  await stabilizePage(page);

  const desktopHeader = page.locator('.portfolio-desktop-header');
  await expect(desktopHeader.locator('nav a svg')).toHaveCount(0);
  await expect(desktopHeader.locator('.portfolio-theme-toggle')).toHaveCount(1);
  await expect(page.locator('[data-dropdown-type="theme"]')).toHaveCount(0);
  await expect(page.locator('[data-dropdown-type="color-scheme"]')).toHaveCount(0);
  await expect(page.locator('#dock')).toHaveCount(0);

  const themeToggle = desktopHeader.locator('.portfolio-theme-toggle');
  const wasPressed = await themeToggle.getAttribute('aria-pressed');
  await themeToggle.click();
  await expect(themeToggle).toHaveAttribute('aria-pressed', wasPressed === 'true' ? 'false' : 'true');

  const footer = page.locator('.portfolio-footer');
  await expect(footer).not.toContainText(/Powered by|Themes|Categories|Tags|Archives/i);
  await expect(footer.getByRole('link', { name: 'GitHub' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'LinkedIn' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'Email' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'RSS' })).toBeVisible();
});

test('detail pages use one contextual back link instead of breadcrumb trails', async ({ page }) => {
  await page.setViewportSize(viewports[2]);

  await page.goto('/projects/');
  await stabilizePage(page);
  await expect(page.locator('.portfolio-context-nav')).toHaveCount(0);

  await page.goto('/projects/order-tracking/');
  await stabilizePage(page);
  const context = page.locator('.portfolio-context-nav');
  await expect(context).toHaveCount(1);
  await expect(context.getByRole('link', { name: 'Back to Projects' })).toBeVisible();
  await expect(context.locator('a')).toHaveCount(1);
});
