import { expect, test } from '@playwright/test';

const routes = [
  { name: 'home', url: '/', secondary: '.home-hero-text-link' },
  { name: 'projects', url: '/projects/', secondary: '[data-visual-role="project-entry"] .text-muted-foreground' },
  { name: 'writing', url: '/writing/', secondary: 'main .text-muted-foreground' },
  { name: 'about', url: '/about/', secondary: '.portfolio-about-header .text-muted-foreground' },
  {
    name: 'long-article',
    url: '/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/',
    secondary: '[data-visual-role="article-meta"]',
  },
];

function contrastRatio(foreground: string, background: string) {
  const rgb = (value: string) => {
    const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
    if (!channels || channels.length !== 3) throw new Error(`Unsupported colour: ${value}`);
    return channels.map(channel => channel / 255);
  };
  const luminance = (value: string) => rgb(value)
    .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const first = luminance(foreground);
  const second = luminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
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

async function renderedColours(page: import('@playwright/test').Page, secondarySelector: string) {
  return page.evaluate(selector => {
    const toSrgb = (colour: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Unable to create colour conversion context');
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = colour;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
      return `rgb(${r}, ${g}, ${b})`;
    };

    const effectiveBackground = (element: HTMLElement) => {
      let current: HTMLElement | null = element;
      while (current) {
        const background = getComputedStyle(current).backgroundColor;
        if (background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') return toSrgb(background);
        current = current.parentElement;
      }
      return document.documentElement.classList.contains('dark') ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    };

    const secondaryElement = document.querySelector<HTMLElement>(selector);
    const primaryElement = document.querySelector<HTMLElement>('main h1');
    if (!secondaryElement || !primaryElement) throw new Error(`Missing contrast target: ${selector}`);
    return {
      secondaryBackground: effectiveBackground(secondaryElement),
      primaryBackground: effectiveBackground(primaryElement),
      secondary: toSrgb(getComputedStyle(secondaryElement).color),
      primary: toSrgb(getComputedStyle(primaryElement).color),
    };
  }, secondarySelector);
}

for (const mode of ['light', 'dark'] as const) {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    test(`secondary hierarchy remains readable in ${mode} at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of routes) {
        const response = await page.goto(route.url, { waitUntil: 'networkidle' });
        expect(response?.ok(), route.url).toBeTruthy();
        await settleTheme(page, mode);

        const secondary = page.locator(route.secondary).first();
        const primary = page.locator('main h1').first();
        await expect(secondary, `${route.name} secondary text`).toBeVisible();
        await expect(primary, `${route.name} primary heading`).toBeVisible();

        const colours = await renderedColours(page, route.secondary);
        const secondaryContrast = contrastRatio(colours.secondary, colours.secondaryBackground);
        const primaryContrast = contrastRatio(colours.primary, colours.primaryBackground);
        expect(secondaryContrast, `${route.name} ${mode} secondary contrast`).toBeGreaterThanOrEqual(4.5);
        expect(primaryContrast, `${route.name} ${mode} primary hierarchy`).toBeGreaterThan(secondaryContrast + 0.75);
      }
    });
  }
}

test('header, footer and long-form metadata retain readable secondary hierarchy', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/', { waitUntil: 'networkidle' });
  await settleTheme(page, 'light');

  const values = await page.evaluate(() => {
    const toSrgb = (colour: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Unable to create colour conversion context');
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = colour;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
      return `rgb(${r}, ${g}, ${b})`;
    };

    const effectiveBackground = (element: HTMLElement) => {
      let current: HTMLElement | null = element;
      while (current) {
        const background = getComputedStyle(current).backgroundColor;
        if (background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') return toSrgb(background);
        current = current.parentElement;
      }
      return 'rgb(255, 255, 255)';
    };

    const targets = [
      ['header', document.querySelector<HTMLElement>('.portfolio-nav-link')],
      ['footer', document.querySelector<HTMLElement>('.portfolio-footer')],
      ['metadata', document.querySelector<HTMLElement>('[data-visual-role="article-meta"]')],
    ] as const;
    if (targets.some(([, element]) => !element)) throw new Error('Missing secondary hierarchy target');
    return {
      token: getComputedStyle(document.documentElement).getPropertyValue('--color-muted-foreground').trim(),
      surfaces: targets.map(([name, element]) => ({
        name,
        colour: toSrgb(getComputedStyle(element!).color),
        background: effectiveBackground(element!),
      })),
    };
  });

  expect(values.token).toContain('0.5');
  for (const surface of values.surfaces) {
    expect(
      contrastRatio(surface.colour, surface.background),
      `${surface.name} steady-state secondary contrast`,
    ).toBeGreaterThanOrEqual(4.5);
  }
});
