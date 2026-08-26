import { expect, test } from '@playwright/test';
import { stabilizePage } from './helpers';

test('Snapshot Ingestion case study exposes the core architecture and evidence boundaries', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto('/projects/snapshot-ingestion/', { waitUntil: 'networkidle' });
  await stabilizePage(page);

  expect(response?.ok(), `/projects/snapshot-ingestion/ returned ${response?.status()}`).toBeTruthy();

  const content = page.locator('.prose').first();
  await expect(
    content.getByRole('heading', { name: 'Why PostgreSQL instead of Kafka', exact: true }),
  ).toBeVisible();
  await expect(
    content.getByRole('heading', { name: 'Two coordination problems, two PostgreSQL mechanisms', exact: true }),
  ).toBeVisible();
  await expect(
    content.getByRole('heading', { name: 'Retry and recovery are explicit state transitions', exact: true }),
  ).toBeVisible();
  await expect(
    content.getByRole('heading', { name: 'Evidence today vs. evidence still planned', exact: true }),
  ).toBeVisible();
  await expect(
    content.getByText(/PostgreSQL is sufficient while the workload remains a bounded snapshot pipeline/),
  ).toBeVisible();

  const architecture = content.getByRole('img', {
    name: /Snapshot Ingestion architecture: a provider XML snapshot is streamed by a fetch worker/,
  });
  await expect(architecture).toBeVisible();
  await expect(architecture).toHaveAttribute('src', 'snapshot-ingestion-architecture.svg');
  const currentSrc = await architecture.evaluate(image => (image as HTMLImageElement).currentSrc);
  expect(currentSrc).toContain('snapshot-ingestion-architecture-mobile.svg');

  await expect(
    content.getByRole('link', { name: 'Snapshot Ingestion / Plan Service source repository', exact: true }),
  ).toHaveAttribute('href', 'https://github.com/egobb/plan-service');
  await expect(
    content.getByRole('link', { name: 'When Postgres Is Enough: engineering write-up', exact: true }),
  ).toHaveAttribute(
    'href',
    '/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/',
  );
});
