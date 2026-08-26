import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {
  assertNoBrokenImages,
  assertNoHorizontalOverflow,
  captureCurrentScreenshot,
  collectConsoleErrors,
  ensureVisualDirectories,
  pages,
  stabilizePage,
  viewports,
  visualRoot,
} from './helpers';

const results: Array<{
  page: string;
  url: string;
  viewport: string;
  screenshot: string;
  consoleErrors: number;
  brokenImages: number;
  horizontalOverflow: boolean;
}> = [];

test.beforeAll(() => ensureVisualDirectories());

test.afterAll(() => {
  fs.mkdirSync(visualRoot, { recursive: true });
  const revision = process.env.VISUAL_REVIEW_REVISION || process.env.GITHUB_SHA || 'local';
  const manifest = {
    revision,
    build: 'passed',
    browser: 'chromium',
    generatedAt: new Date().toISOString(),
    pages: pages.map(item => ({
      name: item.name,
      url: item.url,
      viewports: viewports.map(viewport => viewport.name),
    })),
    checks: {
      consoleErrors: results.reduce((sum, result) => sum + result.consoleErrors, 0),
      brokenImages: results.reduce((sum, result) => sum + result.brokenImages, 0),
      horizontalOverflow: results.some(result => result.horizontalOverflow),
    },
    results,
  };
  fs.writeFileSync(path.join(visualRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
});

for (const viewport of viewports) {
  for (const route of pages) {
    test(`${route.name} renders at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const consoleErrors = await collectConsoleErrors(page);
      const response = await page.goto(route.url, { waitUntil: 'networkidle' });

      expect(response, `No response for ${route.url}`).not.toBeNull();
      expect(response?.ok(), `${route.url} returned ${response?.status()}`).toBeTruthy();
      await stabilizePage(page);

      if (route.heading) {
        await expect(page.getByRole('heading', { name: route.heading, exact: true }).first()).toBeVisible();
      }

      await assertNoBrokenImages(page);
      await assertNoHorizontalOverflow(page);
      expect(consoleErrors, `Console errors on ${route.url}`).toEqual([]);

      const screenshot = await captureCurrentScreenshot(page, route.name, viewport.name);
      const brokenImages = await page.locator('img').evaluateAll(images =>
        images.filter(image => !image.complete || image.naturalWidth === 0).length,
      );
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      results.push({
        page: route.name,
        url: route.url,
        viewport: viewport.name,
        screenshot: path.relative(visualRoot, screenshot),
        consoleErrors: consoleErrors.length,
        brokenImages,
        horizontalOverflow: dimensions.scrollWidth > dimensions.clientWidth,
      });

      // Visual baselines are added only after the first generated screenshots are reviewed and accepted.
      if (process.env.VISUAL_BASELINES === '1') {
        await expect(page).toHaveScreenshot(`${route.name}-${viewport.name}.png`, { fullPage: true });
      }
    });
  }
}
