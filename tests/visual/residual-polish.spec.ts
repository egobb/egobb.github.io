import { test, expect } from '@playwright/test';

const representativeRoutes = [
  '/',
  '/projects/',
  '/writing/',
  '/about/',
  '/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/',
  '/projects/order-tracking/',
  '/projects/snapshot-ingestion/',
];

async function expectQuietSurface(locator: import('@playwright/test').Locator) {
  const style = await locator.evaluate(el => {
    const computed = getComputedStyle(el);
    return {
      transform: computed.transform,
      shadow: computed.boxShadow,
      radius: computed.borderRadius,
    };
  });
  expect(style.transform).toBe('none');
  expect(style.shadow).toBe('none');
  expect(style.radius).toBe('0px');
}

test('representative pages do not mount removed theme-demo chrome or runtime', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const route of representativeRoutes) {
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.ok(), `${route} should render`).toBeTruthy();

    await expect(page.locator('#search-modal, #search-overlay')).toHaveCount(0);

    const scripts = await page.locator('script[src]').evaluateAll(nodes =>
      nodes.map(node => (node as HTMLScriptElement).src),
    );
    expect(scripts.some(src => /\/js\/(main|search|dock|toc)(\.|-)/.test(src))).toBeFalsy();
    expect(scripts.some(src => src.includes('/js/custom/js/custom/'))).toBeFalsy();
  }
});

test('editorial entries remain flat at rest and on hover', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/', { waitUntil: 'networkidle' });
  await expectQuietSurface(page.locator('[data-visual-role="home-hero-card"]'));

  const homeProject = page.locator('[data-visual-role="project-entry"]').first();
  await homeProject.hover();
  await expectQuietSurface(homeProject);

  const homeWriting = page.locator('[data-visual-role="writing-entry"]').first();
  await homeWriting.hover();
  await expectQuietSurface(homeWriting);

  await page.goto('/projects/', { waitUntil: 'networkidle' });
  const project = page.locator('[data-visual-role="project-entry"]').first();
  await project.hover();
  await expectQuietSurface(project);

  await page.goto('/writing/', { waitUntil: 'networkidle' });
  const writing = page.locator('[data-visual-role="writing-entry"]').first();
  await writing.hover();
  await expectQuietSurface(writing);
});

test('the only global shell interactions remain functional on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });

  const scripts = await page.locator('script[src]').evaluateAll(nodes =>
    nodes.map(node => (node as HTMLScriptElement).src),
  );
  expect(scripts.some(src => src.includes('/js/custom/editorial-mobile-menu'))).toBeTruthy();
  expect(scripts.some(src => src.includes('/js/custom/editorial-theme-toggle'))).toBeTruthy();

  const menuToggle = page.locator('#mobile-menu-toggle');
  const menu = page.locator('#mobile-menu');
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  await menuToggle.click();
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeHidden();
  await expect(menuToggle).toBeFocused();

  await expect(page.locator('#portfolio-theme-toggle')).toHaveCount(0);
  const themeToggles = page.locator('.portfolio-theme-toggle');
  await expect(themeToggles).toHaveCount(2);
  const themeToggle = page.locator('.portfolio-mobile-header .portfolio-theme-toggle');
  const before = await themeToggle.getAttribute('aria-pressed');
  await themeToggle.click();
  await expect(themeToggles).toHaveAttribute('aria-pressed', before === 'true' ? 'false' : 'true');
});
