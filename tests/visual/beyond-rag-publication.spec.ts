import { expect, test } from '@playwright/test';

const route = '/posts/beyond-rag-building-a-stateful-ai-system-for-longitudinal-training-decisions/';
const canonical = `https://enriquegoberna.com${route}`;
const title = 'Beyond RAG: Building a Stateful AI System for Longitudinal Training Decisions';
const description =
  'What changed when a training assistant stopped answering isolated questions and started making decisions against persistent, governed state.';
const fallbackImage = 'https://enriquegoberna.com/images/social/default.png';
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'narrow-mobile', width: 360, height: 800 },
] as const;

async function articleGraph(page: import('@playwright/test').Page) {
  const scripts = page.locator('script[type="application/ld+json"]');
  await expect(scripts).toHaveCount(1);
  const raw = await scripts.first().textContent();
  expect(raw).toBeTruthy();
  const parsed = JSON.parse(raw!);
  expect(parsed['@context']).toBe('https://schema.org');
  expect(Array.isArray(parsed['@graph'])).toBeTruthy();
  return (parsed['@graph'] as Array<Record<string, unknown>>).find(node => node['@type'] === 'Article');
}

test('Beyond RAG publication shell, hierarchy and capability boundary are canonical', async ({ page, request }) => {
  const response = await page.goto(route, { waitUntil: 'networkidle' });
  expect(response?.ok()).toBeTruthy();

  const headings = await page
    .locator('#main-content h1, #main-content h2, #main-content h3, #main-content h4, #main-content h5, #main-content h6')
    .evaluateAll(elements =>
      elements.map(element => ({
        level: Number(element.tagName.slice(1)),
        text: element.textContent?.trim() || '',
      })),
    );

  const h1s = headings.filter(heading => heading.level === 1);
  expect(h1s).toEqual([{ level: 1, text: title }]);

  const skippedLevels: Array<{ from: number; to: number; text: string }> = [];
  for (let index = 1; index < headings.length; index += 1) {
    const previous = headings[index - 1];
    const current = headings[index];
    if (current.level > previous.level + 1) {
      skippedLevels.push({ from: previous.level, to: current.level, text: current.text });
    }
  }
  expect(skippedLevels, 'article must not skip heading levels').toEqual([]);

  await expect(page.getByRole('heading', { name: 'What the system does not know yet' })).toBeVisible();
  await expect(page.getByText('no athlete-specific finding has been promoted into it yet', { exact: false })).toBeVisible();
  await expect(page.getByText('does not justify claims such as:', { exact: false })).toBeVisible();
  await expect(page.getByText('it autonomously learns the athlete;', { exact: true })).toBeVisible();

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', description);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', fallbackImage);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', description);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', fallbackImage);

  const article = await articleGraph(page);
  expect(article).toMatchObject({
    url: canonical,
    headline: title,
    author: { '@id': 'https://enriquegoberna.com/#person' },
  });
  expect(article?.datePublished).toBeTruthy();
  expect(article?.dateModified).toBeTruthy();

  const socialImage = await request.get(new URL(fallbackImage).pathname);
  expect(socialImage.ok()).toBeTruthy();
  expect(socialImage.headers()['content-type']).toContain('image/png');

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain(`<loc>${canonical}</loc>`);
});

test('Beyond RAG visual and closed loop remain readable at publication viewports', async ({ page }) => {
  test.setTimeout(90_000);

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.ok(), `${route} should render at ${viewport.width}px`).toBeTruthy();

    const visual = page.locator('img[src$="stateful-training-tracking-architecture.svg"]');
    await visual.evaluate(image => image.scrollIntoView({ block: 'center' }));
    await expect.poll(
      () => visual.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0),
      { message: `${viewport.name} lazy-loaded architecture visual should finish loading` },
    ).toBe(true);
    await expect(visual).toBeVisible();
    const visualGeometry = await visual.evaluate((image: HTMLImageElement) => {
      const rect = image.getBoundingClientRect();
      return {
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        width: rect.width,
        right: rect.right,
      };
    });
    expect(visualGeometry.naturalWidth).toBe(480);
    expect(visualGeometry.naturalHeight).toBe(1290);
    expect(visualGeometry.width, `${viewport.name} architecture visual width`).toBeGreaterThanOrEqual(
      viewport.width <= 390 ? 300 : 450,
    );
    expect(visualGeometry.right).toBeLessThanOrEqual(viewport.width + 1);

    const closedLoop = page.locator('pre').filter({ hasText: 'NO_CHANGE decision retained with lineage' });
    await expect(closedLoop).toBeVisible();
    const closedLoopBox = await closedLoop.boundingBox();
    expect(closedLoopBox).not.toBeNull();
    expect(closedLoopBox!.x).toBeGreaterThanOrEqual(0);
    expect(closedLoopBox!.x + closedLoopBox!.width).toBeLessThanOrEqual(viewport.width + 1);

    const pageGeometry = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(pageGeometry.scrollWidth, `${viewport.name} page-level horizontal overflow`).toBeLessThanOrEqual(
      pageGeometry.clientWidth,
    );
  }
});
