import { expect, test } from '@playwright/test';
import fs from 'node:fs';
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

const results: VisualResult[] = [];

test.beforeAll(() => ensureVisualDirectories());

test.afterAll(() => {
  fs.mkdirSync(visualRoot, { recursive: true });
  const manifestFile = path.join(visualRoot, 'manifest.json');
  const existing = fs.existsSync(manifestFile)
    ? JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
    : {};
  const manifest = {
    ...existing,
    revision: process.env.VISUAL_REVIEW_REVISION || process.env.GITHUB_SHA || 'local',
    build: existing.build || 'passed',
    browser: 'chromium',
    generatedAt: new Date().toISOString(),
    pages: pages.map(item => ({
      name: item.name,
      url: item.url,
      viewports: viewports.map(viewport => viewport.name),
    })),
    checks: {
      consoleErrors: results.reduce((sum, result) => sum + result.consoleErrors.length, 0),
      brokenImages: results.reduce((sum, result) => sum + result.brokenImages.length, 0),
      horizontalOverflow: results.some(result => result.horizontalOverflow),
      failedPageViewports: results.filter(result => result.status === 'failed').length,
    },
    results,
  };
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
});

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

        expect(result.brokenImages, `Broken image resources on ${route.url}`).toEqual([]);
        expect(result.consoleErrors, `Console errors on ${route.url}`).toEqual([]);
        expect(
          overflow.horizontalOverflow,
          `Horizontal overflow on ${route.url}: ${overflow.scrollWidth}px > ${overflow.clientWidth}px. ` +
            `Overflowing elements: ${JSON.stringify(overflow.elements)}`,
        ).toBeFalsy();

        if (process.env.VISUAL_BASELINES === '1') {
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
        results.push(result);
      }
    });
  }
}
