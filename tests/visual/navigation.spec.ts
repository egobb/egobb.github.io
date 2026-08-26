import { expect, Locator, Page, test } from '@playwright/test';
import { getOverflowDiagnostics, stabilizePage } from './helpers';

const primaryLinks = [
  { name: 'Home', selector: 'a[href="/"]' },
  { name: 'Projects', selector: 'a[href="/projects/"]' },
  { name: 'Engineering writing', selector: 'a[href="/writing/"]' },
  { name: 'About', selector: 'a[href="/about/"]' },
  { name: 'Contact', selector: 'a[href^="mailto:"]' },
] as const;

async function tabUntilFocused(page: Page, target: Locator, maxTabs = 12): Promise<void> {
  for (let index = 0; index < maxTabs; index += 1) {
    await page.keyboard.press('Tab');
    if (await target.evaluate(element => element === document.activeElement)) {
      return;
    }
  }
  throw new Error(`Target was not reached by keyboard after ${maxTabs} Tab presses`);
}

test('desktop primary navigation exposes routes and active state', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await stabilizePage(page);

  const desktopNav = page.locator('header nav').filter({ visible: true }).first();
  for (const link of primaryLinks) {
    await expect(desktopNav.locator(`${link.selector}:visible`).first(), `${link.name} link`).toBeVisible();
  }

  const projects = desktopNav.locator('a[href="/projects/"]').first();
  await projects.click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.locator('header nav:visible a[href="/projects/"]').first()).toHaveClass(/nav-active-indicator/);

  await page.locator('header nav:visible a[href="/writing/"]').first().click();
  await expect(page).toHaveURL(/\/writing\/$/);
  await expect(page.locator('header nav:visible a[href="/writing/"]').first()).toHaveClass(/nav-active-indicator/);
});

test('mobile menu opens, exposes routes, and navigates without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await stabilizePage(page);

  const toggle = page.locator('#mobile-menu-toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  const menu = page.locator('#mobile-menu');
  await expect(menu).toBeVisible();
  for (const link of primaryLinks) {
    await expect(menu.locator(link.selector).first(), `${link.name} mobile link`).toBeVisible();
  }

  const overflow = await getOverflowDiagnostics(page);
  expect(
    overflow.horizontalOverflow,
    `Mobile menu overflow: ${overflow.scrollWidth}px > ${overflow.clientWidth}px. ` +
      `Overflowing elements: ${JSON.stringify(overflow.elements)}`,
  ).toBeFalsy();

  await menu.locator('a[href="/projects/"]').first().click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.locator('#mobile-menu a[href="/projects/"]').first()).toHaveAttribute('aria-current', 'page');
});

test('keyboard can reach and activate the mobile menu path', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await stabilizePage(page);

  const toggle = page.locator('#mobile-menu-toggle');
  await tabUntilFocused(page, toggle);
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  const projects = page.locator('#mobile-menu a[href="/projects/"]').first();
  await tabUntilFocused(page, projects);
  await expect(projects).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/projects\/$/);
});
