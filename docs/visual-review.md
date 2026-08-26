# Automated visual review

The portfolio uses Playwright and Chromium to generate deterministic rendered evidence for pull requests without publishing PR revisions to the Internet.

## What CI does

For pull requests targeting `main`, `.github/workflows/visual-review.yml`:

1. checks out the exact PR revision with Hugo Narrow submodules;
2. installs Hugo Extended and Node 20;
3. installs the locked Playwright dependency with `npm ci`;
4. installs Chromium;
5. builds the site with `hugo --minify`;
6. serves the generated `public/` directory on runner-local `127.0.0.1:1313`;
7. runs Playwright against representative pages and viewports;
8. retains current screenshots, test results, the HTML report, and `manifest.json` as a GitHub Actions artifact even when a browser check fails.

The workflow has read-only repository permissions and does not deploy to GitHub Pages. Production deployment remains owned by `.github/workflows/hugo.yml` on pushes to `main`.

## Representative matrix

Pages:

- `/`
- `/projects/`
- `/writing/`
- `/about/`
- `/posts/`
- `/posts/when-postgres-is-enough-snapshot-ingestion-pipeline/`

Viewports:

- desktop: 1440 × 900
- tablet: 768 × 1024
- mobile: 390 × 844

The suite also checks horizontal overflow, broken images, unexpected console/page errors, desktop primary navigation, the mobile menu, and a bounded keyboard interaction path.

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
npm run visual:test
```

Playwright starts the local HTTP server automatically.

## Evidence artifact

Every CI run attempts to upload:

```text
artifacts/visual-review/
├── manifest.json
└── screenshots/
    └── <page>/<viewport>.png

playwright-report/
test-results/
```

`manifest.json` records the tested revision, page/viewport matrix, and high-level structural check results.

## Visual regression baselines

Current screenshots are always generated. Baseline assertions are intentionally enabled only after a human or independent visual reviewer has inspected and accepted the first deterministic screenshots.

Once accepted baselines exist, run the suite with:

```bash
VISUAL_BASELINES=1 npm run visual:test
```

To intentionally update accepted snapshots after reviewing an expected visual change:

```bash
VISUAL_BASELINES=1 npm run visual:update
```

Never update snapshots only to make CI green. First identify why the rendered output changed and confirm that the change is intended.

CI should set `VISUAL_BASELINES=1` only after the repository contains accepted snapshot files for the complete representative matrix.

## Failure semantics

- Hugo build failure → workflow fails before browser tests.
- Browser/interaction/overflow/image/console failure → workflow fails and retains available evidence.
- Unexpected visual diff after baselines are enabled → workflow fails with Playwright expected/actual/diff results.
- Successful run → current screenshots, manifest, and report are still retained.

## Production isolation

Pull requests never deploy this site through the visual-review workflow. The runner-local server exists only for the lifetime of the GitHub-hosted job and is not externally exposed.
