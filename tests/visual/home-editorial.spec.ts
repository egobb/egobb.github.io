import { expect, test } from '@playwright/test';
import { stabilizePage, viewports } from './helpers';

test('Home reads as an editorial introduction instead of a marketing card', async ({ page }) => {
  await page.setViewportSize(viewports[0]);
  await page.goto('/');
  await stabilizePage(page);

  const surface = page.locator('.home-hero-surface');
  const chrome = await surface.evaluate(element => {
    const style = window.getComputedStyle(element);
    return {
      background: style.backgroundColor,
      borderTop: style.borderTopWidth,
      radius: style.borderRadius,
      shadow: style.boxShadow,
    };
  });

  expect(chrome.background).toBe('rgba(0, 0, 0, 0)');
  expect(chrome.borderTop).toBe('0px');
  expect(chrome.radius).toBe('0px');
  expect(chrome.shadow).toBe('none');

  const actions = page.locator('[data-visual-role="home-hero-actions"]');
  await expect(actions.locator('.home-hero-primary')).toHaveCount(1);
  await expect(actions.locator('.home-hero-text-link')).toHaveCount(2);
  await expect(actions.getByRole('link', { name: 'Explore projects' })).toBeVisible();
  await expect(actions.getByRole('link', { name: 'Read engineering notes' })).toBeVisible();
  await expect(actions.getByRole('link', { name: 'GitHub' })).toBeVisible();
});

test('Home mobile composition is left aligned and keeps the avatar secondary', async ({ page }) => {
  await page.setViewportSize(viewports[2]);
  await page.goto('/');
  await stabilizePage(page);

  const metrics = await page.evaluate(() => {
    const layout = document.querySelector<HTMLElement>('[data-visual-role="home-hero-layout"]');
    const avatar = document.querySelector<HTMLElement>('[data-visual-role="home-hero-avatar"]');
    const title = document.querySelector<HTMLElement>('[data-visual-role="home-hero-title"]');
    const primary = document.querySelector<HTMLElement>('[data-visual-role="home-hero-primary-cta"]');
    if (!layout || !avatar || !title || !primary) throw new Error('Missing Home editorial composition element');
    const avatarRect = avatar.getBoundingClientRect();
    const primaryRect = primary.getBoundingClientRect();
    return {
      textAlign: window.getComputedStyle(layout).textAlign,
      avatarWidth: avatarRect.width,
      titleSize: Number.parseFloat(window.getComputedStyle(title).fontSize),
      primaryWidth: primaryRect.width,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(['left', 'start']).toContain(metrics.textAlign);
  expect(metrics.avatarWidth).toBeGreaterThanOrEqual(56);
  expect(metrics.avatarWidth).toBeLessThanOrEqual(64);
  expect(metrics.titleSize).toBeGreaterThanOrEqual(30);
  expect(metrics.titleSize).toBeLessThanOrEqual(32);
  expect(metrics.primaryWidth).toBeLessThan(metrics.viewportWidth * 0.7);
});
