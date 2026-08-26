import { expect, test } from '@playwright/test';

test('Projects hub follows project-specific structure and keeps links keyboard reachable', async ({ page }) => {
  const response = await page.goto('/projects/', { waitUntil: 'networkidle' });
  expect(response?.ok()).toBeTruthy();

  const projects = page.getByRole('region', { name: 'Selected projects' });
  const cards = projects.locator('article');
  await expect(cards).toHaveCount(2);

  const orderTracking = cards.filter({ hasText: 'Order Tracking — Event-Driven Ingestion with Kafka' });
  await expect(orderTracking.getByText('Ordering boundary', { exact: true })).toBeVisible();
  await expect(orderTracking.getByText('Current limitation', { exact: true })).toBeVisible();
  await expect(orderTracking.getByText('Why PostgreSQL', { exact: true })).toHaveCount(0);

  const snapshotIngestion = cards.filter({ hasText: 'Snapshot Ingestion — Resilient Coordination with PostgreSQL' });
  await expect(snapshotIngestion.getByText('Why PostgreSQL', { exact: true })).toBeVisible();
  await expect(snapshotIngestion.getByText('Coordination model', { exact: true })).toBeVisible();
  await expect(snapshotIngestion.getByText('Operational pressure', { exact: true })).toBeVisible();
  await expect(snapshotIngestion.getByText('Current limitation', { exact: true })).toHaveCount(0);

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
