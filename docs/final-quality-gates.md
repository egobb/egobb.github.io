# Final responsive, navigation and performance quality gates

This document defines the final portfolio quality gate owned by portfolio-roadmap issue #27. It validates the post-Epic-47 editorial baseline after media optimization (#18) and accessibility remediation (#26).

## Scope

The automated gate covers:

- Home
- Projects
- Order Tracking case study
- Snapshot Ingestion case study
- one long engineering article
- About

The responsive matrix is 320, 360, 390, 768, 1024 and 1440 CSS pixels wide. This intentionally overlaps the earlier visual and accessibility reviews, but #27 is the consolidated final regression gate rather than another redesign pass.

## Acceptance mapping

| Acceptance criterion | Automated evidence |
|---|---|
| No horizontal overflow on representative mobile widths | `viewport-matrix.json` across the full 320–1440 matrix |
| Cards, diagrams and code remain usable at narrow widths | Existing `phase-b-responsive-gate.spec.ts`, accessibility reflow coverage, and final no-overflow matrix |
| Header, footer and active navigation states are consistent | `navigation-appearance.json` plus active-route assertions |
| All internal links resolve or intentionally redirect | sitemap crawl plus discovered internal link/asset crawl in `broken-link-report.json` |
| Appearance switching causes no major layout shift | geometry before/after the retained light/dark appearance toggle; maximum allowed delta is 1 CSS pixel |
| Performance baseline is recorded and major regressions are addressed | `performance-baseline.json`, generated on mobile and desktop for all representative pages, with explicit CI budgets |
| Key pages render without missing assets or console errors | `rendering-assets.json` and direct assertions |

The old requirement to validate a multi-theme/theme-demo experience is intentionally not preserved: Epic #47 removed that product behavior. The remaining single light/dark appearance toggle is still validated for layout stability.

## Performance baseline methodology

Performance values are environment-specific and are not user analytics. The baseline is produced from the exact Git revision under test using a minified Hugo production build served locally by the Playwright CI web server.

For each representative page, the gate records mobile (390×844) and desktop (1440×900) browser timing/resource data:

- `responseEndMs`
- `domContentLoadedMs`
- `loadEventMs`
- resource count
- total encoded response bytes
- total transfer bytes
- five largest encoded resources

The initial regression budgets are calibrated from the first exact-revision CI run rather than pretending that an arbitrary byte limit is a historical baseline:

- load event: ≤ 10,000 ms
- encoded resources per normal representative page: ≤ 5,000,000 bytes
- encoded resources for the image-heavy long article: ≤ 13,000,000 bytes
- resources per page: ≤ 140

The first run measured the long article at about 11.0 MB of encoded resources on mobile. That page contains several historical inline diagrams/screenshots and therefore gets a page-specific ceiling with limited headroom instead of weakening the budget for every page. This value is now recorded as baseline evidence, so a material increase is treated as a regression. The image-specific transfer checks introduced by #18 continue to cover optimized covers and architecture assets independently.

## First-run findings and remediation

The first candidate run did what the gate is intended to do and surfaced two real stale internal links in About. They pointed to pre-canonical article slugs and returned 404. The links were corrected to the canonical long-form article routes before the gate was accepted.

Two test-harness issues were also corrected from that run: active-navigation assertions now target the visible desktop navigation rather than matching the hidden mobile copy, and performance evidence is written before budget violations fail the test so future regressions retain diagnostic data.

## CI and evidence

`.github/workflows/quality-gates.yml` runs on issue/phase/epic branches, pull requests to the normal integration branches, and manual dispatch. It:

1. checks out the exact revision, including the Hugo theme submodule;
2. builds the minified production site;
3. runs `tests/visual/final-quality-gate.spec.ts` in Chromium;
4. writes the measured performance baseline to the job log;
5. uploads `artifacts/quality-gates`, Playwright reports and failure diagnostics for 30 days.

The artifact directory contains:

- `viewport-matrix.json`
- `rendering-assets.json`
- `broken-link-report.json`
- `navigation-appearance.json`
- `performance-baseline.json`

A successful workflow run on the exact PR head is the completion evidence for #27 together with the normal full Visual review workflow.
