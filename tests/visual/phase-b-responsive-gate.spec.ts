import { expect, test } from '@playwright/test';
import {
  captureCurrentScreenshot,
  ensureVisualDirectories,
  getOverflowDiagnostics,
  stabilizePage,
  writeEvidenceResult,
} from './helpers';

const longArticle = '/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/';

const requiredPages = [
  { name: 'home', url: '/' },
  { name: 'projects', url: '/projects/' },
  { name: 'order-tracking-case-study', url: '/projects/order-tracking/' },
  { name: 'snapshot-ingestion-case-study', url: '/projects/snapshot-ingestion/' },
  { name: 'writing', url: '/writing/' },
  { name: 'about', url: '/about/' },
  { name: 'long-article', url: longArticle },
  { name: 'archives', url: '/archives/' },
  { name: 'categories', url: '/categories/' },
  { name: 'tags', url: '/tags/' },
] as const;

async function expectNoPageOverflow(page: import('@playwright/test').Page, label: string) {
  const overflow = await getOverflowDiagnostics(page);
  expect(
    overflow.horizontalOverflow,
    `${label}: ${overflow.scrollWidth}px > ${overflow.clientWidth}px; ${JSON.stringify(overflow.elements)}`,
  ).toBeFalsy();
}

async function settleTheme(page: import('@playwright/test').Page, mode: 'light' | 'dark') {
  await page.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
  });
  await page.evaluate(selectedMode => {
    document.documentElement.dataset.theme = 'default';
    document.documentElement.classList.toggle('dark', selectedMode === 'dark');
  }, mode);
  await page.evaluate(() => document.fonts.ready);
}

test.beforeAll(() => ensureVisualDirectories());

for (const viewport of [
  { name: 'narrow-mobile', width: 360, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`mobile shell, Home actions and footer remain deliberate at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/', { waitUntil: 'networkidle' });
    await stabilizePage(page);

    const menuToggle = page.getByRole('button', { name: 'Menu', exact: true });
    const themeToggle = page.getByRole('button', { name: 'Toggle light and dark appearance' });
    await expect(menuToggle).toBeVisible();
    await expect(themeToggle).toBeVisible();

    for (const control of [menuToggle, themeToggle]) {
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }

    const actions = page.locator('[data-visual-role="home-hero-actions"] a');
    await expect(actions).toHaveCount(3);
    for (const link of await actions.all()) {
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThan(viewport.width - 32);
    }

    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeVisible();
    for (const link of await mobileMenu.getByRole('link').all()) {
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }

    const footerDirection = await page.locator('.portfolio-footer-inner').evaluate(element => getComputedStyle(element).flexDirection);
    expect(footerDirection).toBe('column');
    await expectNoPageOverflow(page, `Home ${viewport.width}px with menu open`);
  });
}

test('1024px breakpoint keeps one clear header model without crowding', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await stabilizePage(page);

  const primaryNavigation = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(primaryNavigation).toBeVisible();
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeHidden();

  const header = page.locator('.portfolio-desktop-header');
  await expect(header).toBeVisible();
  const headerBox = await header.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(headerBox!.height).toBeLessThanOrEqual(64);

  const links = primaryNavigation.getByRole('link');
  for (const link of await links.all()) {
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(1024);
  }
  await expectNoPageOverflow(page, 'Home 1024px header');
});

test('technical long-form content contains horizontal scrolling and wide media', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });

  for (const route of [longArticle, '/projects/order-tracking/', '/projects/snapshot-ingestion/']) {
    await page.goto(route, { waitUntil: 'networkidle' });
    await stabilizePage(page);
    await expectNoPageOverflow(page, `${route} at 360px`);

    const content = page.locator('[data-visual-role="longform-content"]');
    const horizontalSurfaces = content.locator('pre, table');
    for (const surface of await horizontalSurfaces.all()) {
      const style = await surface.evaluate(element => ({
        overflowX: getComputedStyle(element).overflowX,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      }));
      if (style.scrollWidth > style.clientWidth) {
        expect(style.overflowX).toMatch(/auto|scroll/);
      }
    }

    const media = content.locator(':scope > figure, :scope > picture, :scope > p:has(> img:only-child)').first();
    if (await media.count()) {
      const box = await media.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(8);
      expect(box!.x + box!.width).toBeLessThanOrEqual(352);
    }
  }
});

for (const mode of ['light', 'dark'] as const) {
  test(`required Phase B surfaces remain coherent in ${mode} mode`, async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });

    for (const route of requiredPages) {
      const response = await page.goto(route.url, { waitUntil: 'networkidle' });
      expect(response?.ok(), route.url).toBeTruthy();
      await settleTheme(page, mode);
      await expect(page.locator('main h1').first(), `${route.name} h1`).toBeVisible();
      await expect(page.getByRole('banner')).toHaveCount(1);
      await expect(page.getByRole('contentinfo')).toHaveCount(1);
      await expectNoPageOverflow(page, `${route.name} ${mode} 1024px`);
    }
  });
}

test('200% text resize preserves required Phase B content and interactions', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  const evidence: Array<{ page: string; screenshot: string; h1Height: number }> = [];

  for (const route of requiredPages) {
    const response = await page.goto(route.url, { waitUntil: 'networkidle' });
    expect(response?.ok(), route.url).toBeTruthy();
    await page.addStyleTag({
      content: `
        *, *::before, *::after { transition: none !important; animation: none !important; }
        html { font-size: 200% !important; }
      `,
    });
    await page.evaluate(() => document.fonts.ready);

    const h1 = page.locator('main h1').first();
    await expect(h1, `${route.name} h1 at 200%`).toBeVisible();
    const h1Box = await h1.boundingBox();
    expect(h1Box).not.toBeNull();
    expect(h1Box!.height, `${route.name} h1 dominates 200% viewport`).toBeLessThan(768 * 0.7);

    const appearanceToggle = page.getByRole('button', { name: 'Toggle light and dark appearance' });
    const primaryNavigation = page.getByRole('navigation', { name: 'Primary navigation' });
    const menuToggle = page.getByRole('button', { name: 'Menu', exact: true });
    await expect(appearanceToggle).toBeVisible();
    await expect(primaryNavigation, `${route.name} desktop navigation at 200%`).toBeVisible();
    await expect(menuToggle, `${route.name} mobile menu at 200%`).toBeHidden();

    const navigationLinks = primaryNavigation.getByRole('link');
    for (const link of await navigationLinks.all()) {
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(1024);
    }
    await expectNoPageOverflow(page, `${route.name} at 200% text`);

    if (route.name === 'home') {
      await expect(page.getByRole('link', { name: 'Explore projects', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Read engineering notes', exact: true })).toBeVisible();
    }
    if (route.name === 'about') {
      await expect(page.locator('img[alt="Enrique Goberna outdoors"]')).toBeVisible();
    }
    if (route.name === 'projects') {
      await expect(page.getByRole('link', { name: 'Project overview' })).toHaveCount(2);
    }
    if (route.name === 'writing') {
      await expect(page.locator('[data-visual-role="writing-taxonomy-links"]')).toBeVisible();
    }

    const screenshot = await captureCurrentScreenshot(page, route.name, 'text-zoom-200');
    evidence.push({ page: route.name, screenshot, h1Height: Math.round(h1Box!.height) });
  }

  writeEvidenceResult('interactions', 'phase-b-text-zoom-200', {
    status: 'passed',
    candidate: process.env.VISUAL_REVIEW_REVISION || process.env.GITHUB_SHA || 'local',
    scale: '200%',
    pages: evidence,
  });
});
