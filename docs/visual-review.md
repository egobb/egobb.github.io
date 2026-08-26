# Automated visual review

The portfolio uses Playwright and Chromium to generate deterministic rendered evidence for pull requests without publishing PR revisions to the Internet.

## What CI does

For pull requests targeting `main`, `.github/workflows/visual-review.yml`:

1. checks out the exact pull-request head revision with Hugo Narrow submodules;
2. installs Hugo Extended and Node 20;
3. initializes a machine-readable evidence manifest before the build;
4. installs the locked Playwright dependency with `npm ci`;
5. installs Chromium;
6. builds the site with `hugo --minify` and records build success or failure in the manifest;
7. serves the generated `public/` directory on runner-local `127.0.0.1:1313`;
8. runs Playwright against representative pages and viewports, including accepted visual-regression baselines and targeted layout-quality assertions for critical surfaces;
9. persists each page/viewport and interaction result independently so Playwright worker restarts cannot erase prior evidence;
10. finalizes `manifest.json` with `if: always()` and retains screenshots, test results, the HTML report, and manifest as a GitHub Actions artifact even when browser checks fail.

The workflow has read-only repository permissions and does not deploy to GitHub Pages. Production deployment remains owned by `.github/workflows/hugo.yml` on pushes to `main`.

## Representative matrix

Pages:

- `/`
- `/projects/`
- `/writing/`
- `/about/`
- `/posts/`
- `/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/`

Viewports:

- desktop: 1440 × 900
- tablet: 768 × 1024
- mobile: 390 × 844

All 18 page/viewport combinations are rendered, captured as current screenshots, and checked for response status, expected headings where applicable, broken images, unexpected console/page errors, and horizontal overflow.

The Home hero also has explicit layout-quality checks at all three viewports. These checks protect minimum card padding, semantic spacing between the eyebrow/title/supporting copy/CTA group, separation from the Projects section, readable supporting-copy width and line-height, and a minimum primary-CTA height. The measured values are written into each Home result JSON so failures are diagnosable without relying only on pixel diffs.

These layout-quality assertions complement, rather than replace, visual-regression snapshots. A snapshot proves that rendering did not change unexpectedly; the layout assertions prevent an intentionally refreshed baseline from silently accepting an objectively cramped critical surface.

The suite also exercises desktop primary navigation and active states, the mobile menu, and a bounded keyboard interaction path, for a current total of 21 Playwright checks.

## Run locally

Requirements:

- Hugo Extended compatible with `hugo.yaml`;
- Node.js 20+;
- Python 3 (used only for the runner-local static server).

Install once:

```bash
npm ci
npx playwright install chromium
```

Build and run:

```bash
hugo --minify
node scripts/visual-review-manifest.mjs passed
npm run visual:test || true
node scripts/visual-review-finalize.mjs
```

The `|| true` above is only to ensure local evidence finalization when inspecting a failing run; the GitHub Actions test step itself is not softened and still fails the workflow. Playwright starts the local HTTP server automatically.

## Evidence artifact

Every CI run attempts to upload:

```text
artifacts/visual-review/
├── manifest.json
├── interactions/
├── results/
└── screenshots/
    └── <page>/<viewport>.png

playwright-report/
test-results/
```

The manifest is initialized before Hugo builds, so a build failure still leaves machine-readable evidence. Each Playwright test writes its own result file before worker teardown, and an `if: always()` workflow step aggregates those records after the test command. This preserves the full matrix even when Playwright restarts a worker after a failed assertion.

Current page screenshots are captured before structural assertions so failed checks still preserve the rendered state.

Playwright retries and trace recording are disabled for this deterministic visual suite. This keeps failure artifacts bounded; the report, current screenshot, failure screenshot, error context, and visual expected/actual/diff images provide the required evidence without hundreds of megabytes of repeated traces.

## Visual regression baselines

Accepted snapshots are committed under deterministic repository paths:

```text
tests/visual/__snapshots__/<page>-<viewport>.png
```

The baseline set is intentionally smaller than the current-screenshot evidence matrix. Every route and viewport is still captured on every run, while regression snapshots cover representative surfaces where a pixel comparison adds the most value:

- Home — desktop, tablet, and mobile;
- Projects — mobile;
- About — mobile;
- representative long article — mobile.

This gives broad responsive evidence without committing 18 largely redundant full-page images to the repository.

Baseline assertions run automatically in CI; no environment flag is required.

To intentionally update accepted snapshots after reviewing an expected visual change:

```bash
npm run visual:update
```

Never update snapshots only to make CI green. First identify why the rendered output changed, inspect the expected/actual/diff evidence, confirm that the change is intended, and make sure the applicable layout-quality assertions also pass.

### Baseline acceptance protocol

For a deliberate change to a critical surface such as Home, accept a new baseline only after all of the following are true:

1. structural, overflow, console, image, interaction, and applicable layout-quality assertions pass on the new rendering;
2. the current desktop, tablet, and mobile screenshots are visually reviewed for hierarchy, whitespace, wrapping, readability, and CTA emphasis;
3. only the snapshots affected by the intended change are regenerated;
4. the normal, unmodified visual-review workflow is run again against the committed baselines and exact pull-request head.

A snapshot refresh is evidence maintenance, not a substitute for visual approval.

## Failure semantics

- Hugo build failure → workflow fails and preserves the build result in the manifest.
- Browser/interaction/overflow/image/console failure → workflow fails and retains available rendered evidence.
- Critical layout-quality failure → workflow fails with the measured spacing/sizing diagnostics persisted in the page result.
- Unexpected visual diff → workflow fails with Playwright expected/actual/diff results.
- Successful run → current screenshots, manifest, report, layout diagnostics, and baseline comparisons are still retained.

## Production isolation

Pull requests never deploy this site through the visual-review workflow. The runner-local server exists only for the lifetime of the GitHub-hosted job and is not externally exposed.
