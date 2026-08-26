import { expect, Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export const visualRoot = path.resolve('artifacts/visual-review');

export const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

export const pages = [
  { name: 'home', url: '/', heading: null },
  { name: 'projects', url: '/projects/', heading: 'Projects' },
  { name: 'writing', url: '/writing/', heading: 'Engineering writing' },
  { name: 'about', url: '/about/', heading: 'About' },
  { name: 'posts', url: '/posts/', heading: null },
  {
    name: 'long-article',
    url: '/posts/when-postgres-is-enough-snapshot-ingestion-pipeline/',
    heading: null,
  },
] as const;

export function ensureVisualDirectories(): void {
  fs.mkdirSync(path.join(visualRoot, 'screenshots'), { recursive: true });
}

export async function stabilizePage(page: Page): Promise<void> {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        caret-color: transparent !important;
      }
    `,
  });
}

export async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', error => errors.push(error.message));
  return errors;
}

export async function assertNoBrokenImages(page: Page): Promise<void> {
  const broken = await page.locator('img').evaluateAll(images =>
    images
      .filter(image => !image.complete || image.naturalWidth === 0)
      .map(image => image.getAttribute('src') || '<missing src>'),
  );
  expect(broken, `Broken images: ${broken.join(', ')}`).toEqual([]);
}

export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

export async function captureCurrentScreenshot(
  page: Page,
  pageName: string,
  viewportName: string,
): Promise<string> {
  const directory = path.join(visualRoot, 'screenshots', pageName);
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, `${viewportName}.png`);
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
  return file;
}
