import { expect, test } from '@playwright/test';
import { stabilizePage } from './helpers';

test('About page preserves concrete trajectory, working style, photo, and useful links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto('/about/', { waitUntil: 'networkidle' });
  await stabilizePage(page);

  expect(response?.ok(), `/about/ returned ${response?.status()}`).toBeTruthy();

  await expect(
    page.getByText(
      'From embedded software and smart metering to RFID, inventory platforms, and backend systems.',
      { exact: true },
    ),
  ).toBeVisible();

  const content = page.locator('.prose').first();

  await expect(content).not.toContainText(/Senior Backend Engineer|hybrid profile|\benabler\b|empowers teams|real value|drives projects forward/i);
  await expect(content.getByText(/started close to hardware, writing low-level and embedded software/i)).toBeVisible();
  await expect(content.getByText(/smart-metering management PaaS/i)).toBeVisible();
  await expect(content.getByText(/Inventory Traceability and Verification Across the Supply Chain Using RFID/i)).toBeVisible();
  await expect(content.getByText(/Much of my day-to-day work sits between a domain rule and the code that eventually enforces it/i)).toBeVisible();

  await expect(content.getByRole('img', { name: 'Enrique Goberna outdoors', exact: true })).toHaveAttribute(
    'src',
    '/images/nature_profile_small.jpeg',
  );
  await expect(content.getByRole('heading', { name: 'From devices to backend systems', exact: true })).toBeVisible();
  await expect(content.getByRole('heading', { name: 'How I work', exact: true })).toBeVisible();
  await expect(content.getByRole('heading', { name: 'Selected projects', exact: true })).toBeVisible();
  await expect(content.getByRole('heading', { name: 'Beyond engineering', exact: true })).toBeVisible();

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
