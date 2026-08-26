import { Page } from '@playwright/test';
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
  {
    name: 'order-tracking-case-study',
    url: '/projects/order-tracking/',
    heading: 'Order Tracking — Event-Driven Ingestion with Kafka',
  },
  { name: 'writing', url: '/writing/', heading: 'Engineering writing' },
  { name: 'about', url: '/about/', heading: 'About' },
  { name: 'posts', url: '/posts/', heading: null },
  {
    name: 'long-article',
    url: '/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/',
    heading: null,
  },
] as const;

export type OverflowingElement = {
  selector: string;
  left: number;
  right: number;
  width: number;
};

export function ensureVisualDirectories(): void {
  fs.mkdirSync(path.join(visualRoot, 'screenshots'), { recursive: true });
  fs.mkdirSync(path.join(visualRoot, 'results'), { recursive: true });
  fs.mkdirSync(path.join(visualRoot, 'interactions'), { recursive: true });
}

export function writeEvidenceResult(
  directory: 'results' | 'interactions',
  name: string,
  result: unknown,
): void {
  const target = path.join(visualRoot, directory);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, `${name}.json`), JSON.stringify(result, null, 2));
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
  await page.evaluate(() => document.fonts.ready);
}

export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', error => errors.push(error.message));
  return errors;
}

export async function findBrokenImages(page: Page): Promise<string[]> {
  const sources = await page.locator('img[src]').evaluateAll(images =>
    [...new Set(images.map(image => image.getAttribute('src')).filter((src): src is string => Boolean(src)))],
  );

  const broken: string[] = [];
  for (const src of sources) {
    const url = new URL(src, page.url()).toString();
    const response = await page.request.get(url);
    if (!response.ok()) {
      broken.push(`${src} (${response.status()})`);
    }
  }
  return broken;
}

export async function getOverflowDiagnostics(page: Page): Promise<{
  horizontalOverflow: boolean;
  scrollWidth: number;
  clientWidth: number;
  elements: OverflowingElement[];
}> {
  return page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const elements = Array.from(document.querySelectorAll<HTMLElement>('body *'))
      .filter(element => {
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -1 || rect.right > clientWidth + 1);
      })
      .slice(0, 20)
      .map(element => {
        const rect = element.getBoundingClientRect();
        const id = element.id ? `#${element.id}` : '';
        const classes = Array.from(element.classList).slice(0, 3).map(name => `.${name}`).join('');
        return {
          selector: `${element.tagName.toLowerCase()}${id}${classes}`,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      });

    return {
      horizontalOverflow: scrollWidth > clientWidth,
      scrollWidth,
      clientWidth,
      elements,
    };
  });
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
