import { expect, test } from '@playwright/test';
import { assertNoHorizontalOverflow, stabilizePage } from './helpers';

const primaryLabels = ['Home', 'Projects', 'Engineering writing', 'About', 'Contact'];

test('desktop primary navigation exposes the portfolio journey', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await stabilizePage(page);

  for (const label of primaryLabels) {
    await expect(page.getByRole('link', { name: label, exact: true }).first()).toBeVisible();
  }

  await page.getByRole('link', { name: 'Projects', exact: true }).first().click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.getByRole('heading', { name: 'Projects', exact: true }).first()).toBeVisible();

  await page.getByRole('link', { name: 'Engineering writing', exact: true }).first().click();
  await expect(page).toHaveURL(/\/writing\/$/);
});

test('mobile menu opens, exposes primary links, and navigates without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await stabilizePage(page);

  const toggle = page.locator('.dropdown-toggle[data-dropdown-type="mobile-menu"]').first();
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  const menu = page.locator('.dropdown-menu[data-dropdown-type="mobile-menu"]').first();
  await expect(menu).toBeVisible();
  for (const label of primaryLabels) {
    await expect(menu.getByRole('link', { name: label, exact: true }).first()).toBeVisible();
  }

  await assertNoHorizontalOverflow(page);
  await menu.getByRole('link', { name: 'Projects', exact: true }).first().click();
  await expect(page).toHaveURL(/\/projects\/$/);
});

test('keyboard can reach and activate the mobile menu control', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await stabilizePage(page);

  const toggle = page.locator('.dropdown-toggle[data-dropdown-type="mobile-menu"]').first();
  await toggle.focus();
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  const menu = page.locator('.dropdown-menu[data-dropdown-type="mobile-menu"]').first();
  const projects = menu.getByRole('link', { name: 'Projects', exact: true }).first();
  await projects.focus();
  await expect(projects).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/projects\/$/);
});
