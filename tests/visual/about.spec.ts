import { expect, test } from '@playwright/test';
import { stabilizePage } from './helpers';

test('About page communicates senior-backend positioning and evidence paths', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto('/about/', { waitUntil: 'networkidle' });
  await stabilizePage(page);

  expect(response?.ok(), `/about/ returned ${response?.status()}`).toBeTruthy();

  await expect(
    page.getByText(
      'Senior Backend Engineer focused on Java, Kafka, distributed systems, event-driven platforms, reliability, and technical leadership.',
      { exact: true },
    ),
  ).toBeVisible();

  const content = page.locator('.prose').first();
  await expect(content.getByText(/I am a Senior Backend Engineer focused on Java, Kafka, distributed systems, and event-driven platforms/)).toBeVisible();
  await expect(content.getByRole('img', { name: 'Enrique Goberna outdoors', exact: true })).toHaveAttribute(
    'src',
    '/images/nature_profile_small.jpeg',
  );
  await expect(content.getByRole('heading', { name: 'Current engineering focus', exact: true })).toBeVisible();
  await expect(content.getByRole('heading', { name: 'How I approach systems', exact: true })).toBeVisible();
  await expect(content.getByRole('heading', { name: 'Technical leadership', exact: true })).toBeVisible();
  await expect(content.getByRole('heading', { name: 'Selected projects', exact: true })).toBeVisible();

  await expect(content.getByRole('link', { name: 'Order Tracking — Event-Driven Ingestion with Kafka', exact: true })).toHaveAttribute(
    'href',
    '/projects/order-tracking/',
  );
  await expect(content.getByRole('link', { name: 'Snapshot Ingestion — Resilient Coordination with PostgreSQL', exact: true })).toHaveAttribute(
    'href',
    '/projects/snapshot-ingestion/',
  );
  await expect(content.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute('href', 'https://github.com/egobb');
  await expect(content.getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/enriquegoberna/',
  );
  await expect(content.getByRole('link', { name: 'Email', exact: true })).toHaveAttribute(
    'href',
    'mailto:egobernagarcia@gmail.com',
  );
});
