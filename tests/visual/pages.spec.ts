import { expect, test } from '@playwright/test';
import path from 'node:path';
import {
  captureCurrentScreenshot,
  collectConsoleErrors,
  ensureVisualDirectories,
  findBrokenImages,
  getOverflowDiagnostics,
  pages,
  stabilizePage,
  viewports,
  visualRoot,
  writeEvidenceResult,
} from './helpers';

type HomeHeroLayoutDiagnostics = {
  cardInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  gaps: {
    eyebrowToTitle: number;
    titleToSummary: number;
    summaryToActions: number;
    heroToProjects: number;
  };
  summary: {
    width: number;
    fontSize: number;
    lineHeight: number;
  };
  primaryCtaHeight: number;
};

type VisualResult = {
  page: string;
  url: string;
  viewport: string;
  status: 'passed' | 'failed';
  responseStatus: number | null;
  screenshot: string | null;
  consoleErrors: string[];
  brokenImages: string[];
  horizontalOverflow: boolean;
  overflow: {
    scrollWidth: number;
    clientWidth: number;
    elements: Array<{ selector: string; left: number; right: number; width: number }>;
  } | null;
  homeHeroLayout?: HomeHeroLayoutDiagnostics;
  error?: string;
};

const visualBaselineMatrix = new Set([
  'home:desktop',
  'home:tablet',
  'home:mobile',
  'projects:mobile',
  'long-article:mobile',
]);

test.beforeAll(() => ensureVisualDirectories());

for (const viewport of viewports) {
  for (const route of pages) {
    test(`${route.name} renders at ${viewport.name}`, async ({ page }) => {
      const result: VisualResult = {
        page: route.name,
        url: route.url,
        viewport: viewport.name,
        status: 'failed',
        responseStatus: null,
        screenshot: null,
        consoleErrors: [],
        brokenImages: [],
        horizontalOverflow: false,
        overflow: null,
      };

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const consoleErrors = collectConsoleErrors(page);

      try {
        const response = await page.goto(route.url, { waitUntil: 'networkidle' });
        result.responseStatus = response?.status() ?? null;
        await stabilizePage(page);

        const screenshot = await captureCurrentScreenshot(page, route.name, viewport.name);
        result.screenshot = path.relative(visualRoot, screenshot);
        result.brokenImages = await findBrokenImages(page);
        result.consoleErrors = [...consoleErrors];

        const overflow = await getOverflowDiagnostics(page);
        result.horizontalOverflow = overflow.horizontalOverflow;
        result.overflow = {
          scrollWidth: overflow.scrollWidth,
          clientWidth: overflow.clientWidth,
          elements: overflow.elements,
        };

        expect(response, `No response for ${route.url}`).not.toBeNull();
        expect(response?.ok(), `${route.url} returned ${response?.status()}`).toBeTruthy();

        if (route.heading) {
          await expect(page.getByRole('heading', { name: route.heading, exact: true }).first()).toBeVisible();
        }

        if (route.name === 'home') {
          const hero = page.locator('.author-section');
          await expect(
            hero.getByText('Senior Backend Engineer · Java · Kafka · Distributed Systems', { exact: true }),
          ).toBeVisible();
          await expect(
            hero.getByRole('heading', { name: 'Building reliable event-driven systems at scale.', exact: true }),
          ).toBeVisible();
          await expect(
            hero.getByText(
              'I design and operate backend platforms where ordering, resilience and observability matter—and lead the engineering work that makes them dependable in production.',
              { exact: true },
            ),
          ).toBeVisible();
          await expect(hero.getByRole('link', { name: 'View selected projects', exact: true })).toHaveAttribute(
            'href',
            '/projects/',
          );
          await expect(hero.getByRole('link', { name: 'Read case studies', exact: true })).toHaveAttribute(
            'href',
            '/writing/',
          );
          await expect(hero.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute(
            'href',
            'https://github.com/egobb',
          );

          const layout = await page.evaluate<HomeHeroLayoutDiagnostics>(() => {
            const box = (role: string) => {
              const element = document.querySelector<HTMLElement>(`[data-visual-role="${role}"]`);
              if (!element) throw new Error(`Missing visual-role element: ${role}`);
              const rect = element.getBoundingClientRect();
              return {
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
                width: rect.width,
                height: rect.height,
              };
            };

            const card = box('home-hero-card');
            const innerLayout = box('home-hero-layout');
            const eyebrow = box('home-hero-eyebrow');
            const title = box('home-hero-title');
            const summary = box('home-hero-summary');
            const actions = box('home-hero-actions');
            const primaryCta = box('home-hero-primary-cta');

            const summaryElement = document.querySelector<HTMLElement>('[data-visual-role="home-hero-summary"]');
            if (!summaryElement) throw new Error('Missing home hero summary');
            const summaryStyle = window.getComputedStyle(summaryElement);

            const projectsHeading = Array.from(document.querySelectorAll<HTMLElement>('h2, h3')).find(
              element => element.textContent?.trim() === 'Selected projects',
            );
            if (!projectsHeading) throw new Error('Missing Selected projects heading');
            const projectsRect = projectsHeading.getBoundingClientRect();

            return {
              cardInsets: {
                top: Math.round(innerLayout.top - card.top),
                right: Math.round(card.right - innerLayout.right),
                bottom: Math.round(card.bottom - innerLayout.bottom),
                left: Math.round(innerLayout.left - card.left),
              },
              gaps: {
                eyebrowToTitle: Math.round(title.top - eyebrow.bottom),
                titleToSummary: Math.round(summary.top - title.bottom),
                summaryToActions: Math.round(actions.top - summary.bottom),
                heroToProjects: Math.round(projectsRect.top - card.bottom),
              },
              summary: {
                width: Math.round(summary.width),
                fontSize: Number.parseFloat(summaryStyle.fontSize),
                lineHeight: Number.parseFloat(summaryStyle.lineHeight),
              },
              primaryCtaHeight: Math.round(primaryCta.height),
            };
          });
          result.homeHeroLayout = layout;

          const minimumCardInset = viewport.name === 'mobile' ? 22 : 28;
          const maximumCardInset = viewport.name === 'mobile' ? 32 : 36;
          const minimumHeroToProjectsGap = viewport.name === 'mobile' ? 40 : 48;
          const maximumHeroToProjectsGap = viewport.name === 'mobile' ? 56 : 64;

          for (const [side, inset] of Object.entries(layout.cardInsets)) {
            expect(inset, `Home hero ${side} inset is too cramped`).toBeGreaterThanOrEqual(minimumCardInset);
            expect(inset, `Home hero ${side} inset is too spacious for the compact composition`).toBeLessThanOrEqual(
              maximumCardInset,
            );
          }
          expect(layout.gaps.eyebrowToTitle, 'Eyebrow and title are visually cramped').toBeGreaterThanOrEqual(8);
          expect(layout.gaps.titleToSummary, 'Title and supporting copy are visually cramped').toBeGreaterThanOrEqual(
            12,
          );
          expect(layout.gaps.summaryToActions, 'Supporting copy and CTAs are visually cramped').toBeGreaterThanOrEqual(
            18,
          );
          expect(layout.gaps.heroToProjects, 'Hero and projects section are visually cramped').toBeGreaterThanOrEqual(
            minimumHeroToProjectsGap,
          );
          expect(
            layout.gaps.heroToProjects,
            'Hero and projects section are too far apart for the compact composition',
          ).toBeLessThanOrEqual(maximumHeroToProjectsGap);
          expect(layout.summary.width, 'Supporting copy is too wide for comfortable scanning').toBeLessThanOrEqual(620);
          expect(layout.summary.lineHeight / layout.summary.fontSize, 'Supporting copy line-height is too dense').toBeGreaterThanOrEqual(
            1.55,
          );
          expect(layout.primaryCtaHeight, 'Primary CTA is too compressed vertically').toBeGreaterThanOrEqual(40);
        }

        expect(result.brokenImages, `Broken image resources on ${route.url}`).toEqual([]);
        expect(result.consoleErrors, `Console errors on ${route.url}`).toEqual([]);
        expect(
          overflow.horizontalOverflow,
          `Horizontal overflow on ${route.url}: ${overflow.scrollWidth}px > ${overflow.clientWidth}px. ` +
            `Overflowing elements: ${JSON.stringify(overflow.elements)}`,
        ).toBeFalsy();

        if (visualBaselineMatrix.has(`${route.name}:${viewport.name}`)) {
          await expect(page).toHaveScreenshot(`${route.name}-${viewport.name}.png`, { fullPage: true });
        }

        result.status = 'passed';
      } catch (error) {
        result.error = error instanceof Error ? error.message : String(error);
        if (!result.screenshot) {
          try {
            const screenshot = await captureCurrentScreenshot(page, route.name, viewport.name);
            result.screenshot = path.relative(visualRoot, screenshot);
          } catch {
            // Preserve the original test failure if a screenshot cannot be captured.
          }
        }
        result.consoleErrors = [...consoleErrors];
        throw error;
      } finally {
        writeEvidenceResult('results', `${route.name}-${viewport.name}`, result);
      }
    });
  }
}
