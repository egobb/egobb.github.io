import { expect, test } from '@playwright/test';

const origin = 'https://enriquegoberna.com';

type KeyPage = {
  name: string;
  route: string;
  structuredType: 'WebPage' | 'AboutPage' | 'CreativeWork' | 'Article';
};

const keyPages: KeyPage[] = [
  { name: 'home', route: '/', structuredType: 'WebPage' },
  { name: 'projects', route: '/projects/', structuredType: 'WebPage' },
  { name: 'order tracking', route: '/projects/order-tracking/', structuredType: 'CreativeWork' },
  { name: 'snapshot ingestion', route: '/projects/snapshot-ingestion/', structuredType: 'CreativeWork' },
  { name: 'about', route: '/about/', structuredType: 'AboutPage' },
  {
    name: 'representative article',
    route: '/posts/scaling-order-tracking-with-kafka-domain-events-and-auto-ingestion/',
    structuredType: 'Article',
  },
];

const metadata = async (page: import('@playwright/test').Page) => ({
  title: await page.title(),
  description: await page.locator('meta[name="description"]').getAttribute('content'),
  canonical: await page.locator('link[rel="canonical"]').getAttribute('href'),
  robots: await page.locator('meta[name="robots"]').getAttribute('content'),
});

const structuredGraph = async (page: import('@playwright/test').Page) => {
  const scripts = page.locator('script[type="application/ld+json"]');
  await expect(scripts).toHaveCount(1);
  const raw = await scripts.first().textContent();
  expect(raw).toBeTruthy();
  const parsed = JSON.parse(raw!);
  expect(parsed['@context']).toBe('https://schema.org');
  expect(Array.isArray(parsed['@graph'])).toBeTruthy();
  return parsed['@graph'] as Array<Record<string, unknown>>;
};

const graphNode = (graph: Array<Record<string, unknown>>, type: string) =>
  graph.find((node) => node['@type'] === type);

test('key pages expose unique titles, descriptions and absolute self-canonicals', async ({ page }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const keyPage of keyPages) {
    const response = await page.goto(keyPage.route, { waitUntil: 'networkidle' });
    expect(response?.ok(), `${keyPage.name} should resolve`).toBeTruthy();

    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(1);

    const meta = await metadata(page);
    expect(meta.title?.length ?? 0, `${keyPage.name} title`).toBeGreaterThan(4);
    expect(meta.description?.length ?? 0, `${keyPage.name} description`).toBeGreaterThan(40);
    expect(meta.canonical).toBe(new URL(keyPage.route, `${origin}/`).href);
    expect(meta.robots).toBe('index, follow');

    titles.add(meta.title!);
    descriptions.add(meta.description!);
  }

  expect(titles.size).toBe(keyPages.length);
  expect(descriptions.size).toBe(keyPages.length);
});

test('structured data identifies the public owner without private or unsupported claims', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const graph = await structuredGraph(page);

  const person = graphNode(graph, 'Person');
  expect(person).toMatchObject({
    name: 'Enrique Goberna',
    url: `${origin}/`,
    jobTitle: 'Senior Software Engineer',
  });
  expect(person?.sameAs).toEqual([
    'https://github.com/egobb',
    'https://www.linkedin.com/in/enriquegoberna/',
    'https://twitter.com/egobb_',
  ]);

  const serialized = JSON.stringify(graph);
  for (const unsupported of ['aggregateRating', 'review', 'credential', 'worksFor', 'email', 'address', 'telephone']) {
    expect(serialized).not.toContain(`"${unsupported}"`);
  }
});

test('project and article structured data use the canonical relationship graph', async ({ page }) => {
  const orderProject = `${origin}/projects/order-tracking/`;
  const orderArticle = `${origin}/posts/scaling-order-tracking-with-kafka-domain-events-and-auto-ingestion/`;

  await page.goto('/projects/order-tracking/', { waitUntil: 'networkidle' });
  let graph = await structuredGraph(page);
  const project = graphNode(graph, 'CreativeWork');
  expect(project).toMatchObject({
    url: orderProject,
    author: { '@id': `${origin}/#person` },
    subjectOf: {
      '@type': 'Article',
      '@id': `${orderArticle}#article`,
      url: orderArticle,
    },
  });

  await page.goto('/posts/scaling-order-tracking-with-kafka-domain-events-and-auto-ingestion/', {
    waitUntil: 'networkidle',
  });
  graph = await structuredGraph(page);
  const article = graphNode(graph, 'Article');
  expect(article).toMatchObject({
    url: orderArticle,
    author: { '@id': `${origin}/#person` },
    about: {
      '@type': 'CreativeWork',
      '@id': `${orderProject}#project`,
      url: orderProject,
      name: 'Order Tracking — Event-Driven Ingestion with Kafka',
    },
  });
  expect(article?.datePublished).toBeTruthy();
  expect(article?.dateModified).toBeTruthy();
});

test('both flagship project case studies expose CreativeWork schema', async ({ page }) => {
  for (const route of ['/projects/order-tracking/', '/projects/snapshot-ingestion/']) {
    await page.goto(route, { waitUntil: 'networkidle' });
    const graph = await structuredGraph(page);
    const project = graphNode(graph, 'CreativeWork');
    expect(project?.url).toBe(new URL(route, `${origin}/`).href);
    expect((project?.description as string | undefined)?.length ?? 0).toBeGreaterThan(60);
    expect(project?.subjectOf).toBeTruthy();
  }
});

test('taxonomy browse pages are followable but excluded from search indexing', async ({ page }) => {
  for (const route of ['/tags/', '/tags/kafka/', '/categories/', '/categories/portfolio/']) {
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.ok(), `${route} should remain browsable`).toBeTruthy();
    await expect(page.locator('meta[name="robots"]')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  }
});

test('robots and sitemap publish one coherent indexability policy', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBeTruthy();
  const robotsBody = await robots.text();
  expect(robotsBody).toContain('User-agent: *');
  expect(robotsBody).toContain('Allow: /');
  expect(robotsBody).toContain(`Sitemap: ${origin}/sitemap.xml`);

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBeTruthy();
  const xml = await sitemap.text();
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

  expect(locations).toContain(`${origin}/`);
  expect(locations).toContain(`${origin}/projects/`);
  expect(locations).toContain(`${origin}/projects/order-tracking/`);
  expect(locations).toContain(`${origin}/projects/snapshot-ingestion/`);
  expect(locations).toContain(`${origin}/about/`);
  expect(locations).toContain(
    `${origin}/posts/scaling-order-tracking-with-kafka-domain-events-and-auto-ingestion/`,
  );
  expect(locations.some((location) => location.includes('/tags/'))).toBeFalsy();
  expect(locations.some((location) => location.includes('/categories/'))).toBeFalsy();
  expect(new Set(locations).size).toBe(locations.length);
});
