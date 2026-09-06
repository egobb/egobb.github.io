import { expect, test } from '@playwright/test';

const route = '/posts/beyond-rag-building-a-stateful-ai-system-for-longitudinal-training-decisions/';
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'narrow-mobile', width: 360, height: 800 },
] as const;

test('Beyond RAG architecture visual remains readable and bounded across article widths', async ({ page }) => {
  test.setTimeout(90_000);

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.ok(), `${route} should render at ${viewport.width}px`).toBeTruthy();

    const visual = page.locator('img[src$="stateful-training-tracking-architecture.svg"]');
    await expect(visual).toHaveCount(1);
    await visual.evaluate(image => image.scrollIntoView({ block: 'center' }));
    await expect.poll(
      () => visual.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0),
      { message: `${viewport.name} lazy-loaded architecture visual should finish loading` },
    ).toBe(true);
    await expect(visual).toBeVisible();
    await expect(visual).toHaveAttribute('alt', /canonical persistent state/i);

    const geometry = await visual.evaluate((image: HTMLImageElement) => {
      const rect = image.getBoundingClientRect();
      return {
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        width: rect.width,
        height: rect.height,
        viewportWidth: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
      };
    });

    expect(geometry.naturalWidth, `${viewport.name} intrinsic width`).toBe(480);
    expect(geometry.naturalHeight, `${viewport.name} intrinsic height`).toBe(1290);
    expect(geometry.width, `${viewport.name} rendered width`).toBeGreaterThanOrEqual(
      viewport.width <= 390 ? 300 : 450,
    );
    expect(geometry.width, `${viewport.name} visual must stay inside viewport`).toBeLessThanOrEqual(
      geometry.viewportWidth,
    );
    expect(
      geometry.documentWidth,
      `${viewport.name} page must not overflow horizontally`,
    ).toBeLessThanOrEqual(geometry.viewportWidth);
  }
});

test('Beyond RAG architecture remains understandable without the image alone', async ({ page }) => {
  const response = await page.goto(route, { waitUntil: 'networkidle' });
  expect(response?.ok()).toBeTruthy();

  await expect(page.getByRole('heading', { name: 'The architecture: retrieval is only one path through the system' })).toBeVisible();
  await expect(page.getByText('The same architecture is useful without the image:', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A real closed loop where the correct decision was NO_CHANGE' })).toBeVisible();
  await expect(page.locator('pre').filter({ hasText: 'NO_CHANGE decision retained with lineage' })).toBeVisible();
});
