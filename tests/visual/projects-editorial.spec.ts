import { expect, test } from '@playwright/test';
import { stabilizePage, viewports } from './helpers';

test('Projects hub is a vertical technical index without card surfaces', async ({ page }) => {
  await page.setViewportSize(viewports[0]);
  await page.goto('/projects/');
  await stabilizePage(page);

  const index = page.locator('[data-visual-role="project-index"]');
  const entries = index.locator('[data-visual-role="project-entry"]');
  await expect(entries).toHaveCount(2);

  for (const entry of await entries.all()) {
    const chrome = await entry.evaluate(element => {
      const style = window.getComputedStyle(element);
      return {
        background: style.backgroundColor,
        radius: style.borderRadius,
        shadow: style.boxShadow,
      };
    });
    expect(chrome.background).toBe('rgba(0, 0, 0, 0)');
    expect(chrome.radius).toBe('0px');
    expect(chrome.shadow).toBe('none');
  }

  await expect(page.getByText('Current limitation', { exact: true })).toBeVisible();
  await expect(page.getByText('Operational pressure', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Project overview' })).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Engineering write-up' })).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Repository' })).toHaveCount(2);
});

test('Home selected projects use the same flat editorial family on mobile', async ({ page }) => {
  await page.setViewportSize(viewports[2]);
  await page.goto('/');
  await stabilizePage(page);

  const index = page.locator('[data-visual-role="project-index"]');
  const entries = index.locator('[data-visual-role="project-entry"]');
  await expect(entries).toHaveCount(2);

  const geometry = await entries.evaluateAll(nodes => nodes.map(node => {
    const rect = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);
    return { x: rect.x, width: rect.width, background: style.backgroundColor, radius: style.borderRadius, shadow: style.boxShadow };
  }));

  expect(Math.abs(geometry[0].x - geometry[1].x)).toBeLessThan(2);
  expect(Math.abs(geometry[0].width - geometry[1].width)).toBeLessThan(2);
  for (const item of geometry) {
    expect(item.background).toBe('rgba(0, 0, 0, 0)');
    expect(item.radius).toBe('0px');
    expect(item.shadow).toBe('none');
  }
});
