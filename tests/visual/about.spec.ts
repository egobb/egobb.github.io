import { expect, test } from '@playwright/test';
import { stabilizePage } from './helpers';

test('About page centers current backend work while preserving background, photo, and useful links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto('/about/', { waitUntil: 'networkidle' });
  await stabilizePage(page);

  expect(response?.ok(), `/about/ returned ${response?.status()}`).toBeTruthy();

  await expect(
    page.getByText(
      'Software engineer working on backend platforms for inventory and e-commerce, from domain decisions to production behavior.',
      { exact: true },
    ),
  ).toBeVisible();

  const content = page.locator('.prose').first();

  await expect(content).not.toContainText(/Senior Backend Engineer|hybrid profile|\benabler\b|empowers teams|real value|drives projects forward/i);
  await expect(content.getByText(/building software professionally for more than a decade/i)).toBeVisible();
  await expect(content.getByText(/today I work mostly on backend platforms for inventory and e-commerce/i)).toBeVisible();
  await expect(content.getByText(/Since 2020, I have worked on central inventory platforms for e-commerce/i)).toBeVisible();
  await expect(content.getByText(/I tend to work close to both the domain and the implementation/i)).toBeVisible();
  await expect(content.getByText(/Earlier in my career I worked on embedded software, a smart-metering platform, and RFID systems/i)).toBeVisible();

  await expect(content.getByRole('img', { name: 'Enrique Goberna outdoors', exact: true })).toHaveAttribute(
    'src',
    '/images/nature_profile_small.jpeg',
  );
  await expect(content.getByRole('heading', { name: 'What I work on', exact: true })).toBeVisible();
  await expect(content.getByRole('heading', { name: 'How I work', exact: true })).toBeVisible();
  await expect(content.getByRole('heading', { name: 'Selected projects', exact: true })).toBeVisible();
  await expect(content.getByRole('heading', { name: 'Background', exact: true })).toBeVisible();
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
