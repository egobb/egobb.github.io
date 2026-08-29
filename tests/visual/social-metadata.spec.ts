import { expect, test } from '@playwright/test';

type SocialCase = {
  name: string;
  route: string;
  canonical: string;
  title: string;
  description: string;
  image: string;
};

const cases: SocialCase[] = [
  {
    name: 'home',
    route: '/',
    canonical: 'https://enriquegoberna.com/',
    title: 'Enrique Goberna — Software Engineering',
    description:
      'Backend systems, architecture decisions and engineering notes about data movement, ordering, failure handling and pragmatic design.',
    image: 'https://enriquegoberna.com/images/social/default.png',
  },
  {
    name: 'order-tracking',
    route: '/projects/order-tracking/',
    canonical: 'https://enriquegoberna.com/projects/order-tracking/',
    title: 'Order Tracking — Event-Driven Ingestion with Kafka',
    description:
      'An event-driven order-tracking backend that preserves per-order ordering while keeping domain rules isolated from infrastructure.',
    image: 'https://enriquegoberna.com/images/social/order-tracking.png',
  },
  {
    name: 'snapshot-ingestion',
    route: '/projects/snapshot-ingestion/',
    canonical: 'https://enriquegoberna.com/projects/snapshot-ingestion/',
    title: 'Snapshot Ingestion — Resilient Coordination with PostgreSQL',
    description:
      'Snapshot ingestion coordinated with PostgreSQL, separating unreliable provider access from reads without adding Kafka before the workload requires it.',
    image: 'https://enriquegoberna.com/images/social/snapshot-ingestion.png',
  },
];

const meta = async (page: import('@playwright/test').Page, selector: string) =>
  page.locator(selector).getAttribute('content');

for (const socialCase of cases) {
  test(`${socialCase.name} exposes intentional social metadata`, async ({ page, request }) => {
    const response = await page.goto(socialCase.route, { waitUntil: 'networkidle' });
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:url"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(1);

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', socialCase.canonical);
    expect(await meta(page, 'meta[property="og:title"]')).toBe(socialCase.title);
    expect(await meta(page, 'meta[property="og:description"]')).toBe(socialCase.description);
    expect(await meta(page, 'meta[property="og:type"]')).toBe('website');
    expect(await meta(page, 'meta[property="og:url"]')).toBe(socialCase.canonical);
    expect(await meta(page, 'meta[property="og:image"]')).toBe(socialCase.image);
    expect(await meta(page, 'meta[property="og:image:secure_url"]')).toBe(socialCase.image);
    expect(await meta(page, 'meta[property="og:image:type"]')).toBe('image/png');
    expect(await meta(page, 'meta[property="og:image:width"]')).toBe('1200');
    expect(await meta(page, 'meta[property="og:image:height"]')).toBe('630');

    expect(await meta(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');
    expect(await meta(page, 'meta[name="twitter:title"]')).toBe(socialCase.title);
    expect(await meta(page, 'meta[name="twitter:description"]')).toBe(socialCase.description);
    expect(await meta(page, 'meta[name="twitter:image"]')).toBe(socialCase.image);

    const imagePath = new URL(socialCase.image).pathname;
    const imageResponse = await request.get(imagePath);
    expect(imageResponse.ok(), `${imagePath} should resolve in the built site`).toBeTruthy();
    expect(imageResponse.headers()['content-type']).toContain('image/png');
    expect((await imageResponse.body()).byteLength).toBeGreaterThan(1_000);
  });
}

test('article without a social override falls back to the default card', async ({ page, request }) => {
  const route = '/posts/scaling-order-tracking-with-kafka-domain-events-and-auto-ingestion/';
  const response = await page.goto(route, { waitUntil: 'networkidle' });
  expect(response?.ok()).toBeTruthy();

  const canonical = 'https://enriquegoberna.com/posts/scaling-order-tracking-with-kafka-domain-events-and-auto-ingestion/';
  const fallbackImage = 'https://enriquegoberna.com/images/social/default.png';

  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
  expect(await meta(page, 'meta[property="og:type"]')).toBe('article');
  expect(await meta(page, 'meta[property="og:url"]')).toBe(canonical);
  expect(await meta(page, 'meta[property="og:image"]')).toBe(fallbackImage);
  expect(await meta(page, 'meta[name="twitter:image"]')).toBe(fallbackImage);
  expect(await meta(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');
  expect(await meta(page, 'meta[property="og:title"]')).toBe(
    'Scaling Order Tracking with Kafka, Domain Events, and Auto-Ingestion',
  );
  expect((await meta(page, 'meta[property="og:description"]'))?.length ?? 0).toBeGreaterThan(40);

  const imageResponse = await request.get(new URL(fallbackImage).pathname);
  expect(imageResponse.ok()).toBeTruthy();
  expect(imageResponse.headers()['content-type']).toContain('image/png');
});
