import { expect, test } from '@playwright/test';

test('Projects hub follows the concise project-specific structure and keeps links keyboard reachable', async ({ page }) => {
  const response = await page.goto('/projects/', { waitUntil: 'networkidle' });
  expect(response?.ok()).toBeTruthy();

  const projects = page.getByRole('region', { name: 'Selected projects' });
  const entries = projects.locator('article');
  await expect(entries).toHaveCount(2);

  const orderTracking = entries.filter({ hasText: 'Order Tracking — Event-Driven Ingestion with Kafka' });
  await expect(orderTracking.getByText('Decision', { exact: true })).toBeVisible();
  await expect(orderTracking.getByText('Limitation', { exact: true })).toBeVisible();
  await expect(orderTracking.locator('[data-visual-role="project-decisions"] > div')).toHaveCount(2);

  const snapshotIngestion = entries.filter({ hasText: 'Snapshot Ingestion — Resilient Coordination with PostgreSQL' });
  await expect(snapshotIngestion.getByText('Decision', { exact: true })).toBeVisible();
  await expect(snapshotIngestion.getByText('Boundary', { exact: true })).toBeVisible();
  await expect(snapshotIngestion.locator('[data-visual-role="project-decisions"] > div')).toHaveCount(2);

  await expect(projects.getByText('Evidence', { exact: true })).toHaveCount(0);
  await expect(projects.getByText('Stack', { exact: true })).toHaveCount(0);
  await expect(projects.getByText('Key decisions', { exact: true })).toHaveCount(0);

  await expect(projects.getByRole('link', { name: 'Project overview' })).toHaveCount(2);
  await expect(projects.getByRole('link', { name: 'Engineering write-up' })).toHaveCount(2);
  await expect(projects.getByRole('link', { name: 'Repository' })).toHaveCount(2);

  const orderOverview = orderTracking.getByRole('link', { name: 'Project overview' });
  const orderWriteUp = orderTracking.getByRole('link', { name: 'Engineering write-up' });
  const orderRepository = orderTracking.getByRole('link', { name: 'Repository' });

  await orderOverview.focus();
  await expect(orderOverview).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(orderWriteUp).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(orderRepository).toBeFocused();
});
