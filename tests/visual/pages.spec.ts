import { expect, test } from '@playwright/test';
import path from 'node:path';
import {
  captureCurrentScreenshot,
  collectConsoleErrors,
  ensureVisualDirectories,
  findBrokenImages,
  getOverflowDiagnostics,
  pages,
  stabilizePage,
  viewports,
  visualRoot,
  writeEvidenceResult,
} from './helpers';

type VisualResult = {
  page: string;
  url: string;
  viewport: string;
  status: 'passed' | 'failed';
  responseStatus: number | null;
  screenshot: string | null;
  consoleErrors: string[];
  brokenImages: string[];
  horizontalOverflow: boolean;
  overflow: {
    scrollWidth: number;
    clientWidth: number;
    elements: Array<{ selector: string; left: number; right: number; width: number }>;
  } | null;
  error?: string;
};

const visualBaselineMatrix = new Set([
  'home:desktop',
  'home:tablet',
  'home:mobile',
  'projects:mobile',
  'about:mobile',
  'long-article:mobile',
]);

test.beforeAll(() => ensureVisualDirectories());

for (const viewport of viewports) {
  for (const route of pages) {
    test(`${route.name} renders at ${viewport.name}`, async ({ page }) => {
      const result: VisualResult = {
        page: route.name,
        url: route.url,
        viewport: viewport.name,
        status: 'failed',
        responseStatus: null,
        screenshot: null,
        consoleErrors: [],
        brokenImages: [],
        horizontalOverflow: false,
        overflow: null,
      };

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const consoleErrors = collectConsoleErrors(page);

      try {
        const response = await page.goto(route.url, { waitUntil: 'networkidle' });
        result.responseStatus = response?.status() ?? null;
        await stabilizePage(page);

        const screenshot = await captureCurrentScreenshot(page, route.name, viewport.name);
        result.screenshot = path.relative(visualRoot, screenshot);
        result.brokenImages = await findBrokenImages(page);
        result.consoleErrors = [...consoleErrors];

        const overflow = await getOverflowDiagnostics(page);
        result.horizontalOverflow = overflow.horizontalOverflow;
        result.overflow = {
          scrollWidth: overflow.scrollWidth,
          clientWidth: overflow.clientWidth,
          elements: overflow.elements,
        };

        expect(response, `No response for ${route.url}`).not.toBeNull();
        expect(response?.ok(), `${route.url} returned ${response?.status()}`).toBeTruthy();

        if (route.heading) {
          await expect(page.getByRole('heading', { name: route.heading, exact: true }).first()).toBeVisible();
        }

        if (route.name === 'home') {
          const hero = page.locator('.author-section');
          await expect(
            hero.getByText('Senior Backend Engineer · Java · Kafka · Distributed Systems', { exact: true }),
          ).toBeVisible();
          await expect(
            hero.getByRole('heading', { name: 'Building reliable event-driven systems at scale.', exact: true }),
          ).toBeVisible();
          await expect(
            hero.getByText(
              'I design and operate backend platforms where ordering, idempotency, resilience and observability matter—and lead the engineering work needed to make them dependable in production.',
              { exact: true },
            ),
          ).toBeVisible();
          await expect(hero.getByRole('link', { name: 'View selected projects', exact: true })).toHaveAttribute(
            'href',
            '/projects/',
          );
          await expect(hero.getByRole('link', { name: 'Read engineering case studies', exact: true })).toHaveAttribute(
            'href',
            '/writing/',
          );
          await expect(hero.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute(
            'href',
            'https://github.com/egobb',
          );
        }

        expect(result.brokenImages, `Broken image resources on ${route.url}`).toEqual([]);
        expect(result.consoleErrors, `Console errors on ${route.url}`).toEqual([]);
        expect(
          overflow.horizontalOverflow,
          `Horizontal overflow on ${route.url}: ${overflow.scrollWidth}px > ${overflow.clientWidth}px. ` +
            `Overflowing elements: ${JSON.stringify(overflow.elements)}`,
        ).toBeFalsy();

        if (visualBaselineMatrix.has(`${route.name}:${viewport.name}`)) {
          await expect(page).toHaveScreenshot(`${route.name}-${viewport.name}.png`, { fullPage: true });
        }

        result.status = 'passed';
      } catch (error) {
        result.error = error instanceof Error ? error.message : String(error);
        if (!result.screenshot) {
          try {
            const screenshot = await captureCurrentScreenshot(page, route.name, viewport.name);
            result.screenshot = path.relative(visualRoot, screenshot);
          } catch {
            // Preserve the original test failure if a screenshot cannot be captured.
          }
        }
        result.consoleErrors = [...consoleErrors];
        throw error;
      } finally {
        writeEvidenceResult('results', `${route.name}-${viewport.name}`, result);
      }
    });
  }
}
