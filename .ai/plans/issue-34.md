# Issue #34 — Automated visual review pipeline

## Status

complete

## Requirement source

- https://github.com/egobb/portfolio-roadmap/issues/34

## Final delivery context

The implementation is reconciled with the merged issue #14 information architecture and the merged issue #35 responsive fixes.

Current product base used for final verification:

- issue #14 merge: `74b7e702c457d879cd47f5a016a750d04a45872c`;
- issue #35 merge: `28cd3a4ef17570818581c177ade98e06cb7bd628`;
- #34 reconciliation merge: `6657b20a3c9e9d284a600d387aec06dba2ea84b6`.

The final workflow is isolated from production deployment, uses read-only repository permissions, builds the exact PR head, serves only runner-local static output, and retains evidence on success and failure.

## Approach

Use repository-owned Playwright infrastructure and a dedicated pull-request GitHub Actions workflow. Every run builds the exact pull-request head revision, serves `public/` on runner-local `127.0.0.1`, runs Chromium against a deterministic page/viewport matrix, emits current screenshots plus Playwright results, compares accepted visual baselines, and uploads the complete visual-review evidence even on failure.

The full evidence matrix contains six representative routes at desktop, tablet, and mobile widths. A focused six-snapshot baseline set covers the most valuable visual-regression surfaces while all 18 page/viewport combinations continue to receive current screenshots and structural checks.

## Tasks

- [x] T1 — Define isolated PR visual-review workflow and preserve production deploy isolation.
- [x] T2 — Add reproducible Node/Playwright dependency and configuration.
- [x] T3 — Add representative page, viewport, structural, navigation, mobile-menu, and keyboard tests.
- [x] T4 — Add current screenshot capture and machine-readable manifest generation.
- [x] T5 — Add artifact/report retention and local developer documentation.
- [x] T6 — Bootstrap-deliver branch/PR and obtain real GitHub Actions runtime evidence.
- [x] T7 — Inspect generated screenshots and accept deterministic baseline snapshots.
- [x] T8 — Demonstrate an intentional visual-regression failure, revert the temporary change, and obtain green CI again.
- [x] T9 — Run final verification and record the verdict.

## Final test design

Representative pages:

- Home;
- Projects;
- Engineering writing;
- About;
- Posts;
- one real long-form PostgreSQL article.

Viewports:

- desktop `1440 × 900`;
- tablet `768 × 1024`;
- mobile `390 × 844`.

This produces 18 page/viewport checks plus three interaction checks:

- desktop navigation and active state;
- mobile menu interaction;
- keyboard mobile-menu smoke path.

Accepted visual-regression snapshots:

- Home — desktop, tablet, mobile;
- Projects — mobile;
- About — mobile;
- representative long article — mobile.

Every page/viewport still produces a current full-page screenshot regardless of whether it is part of the committed baseline subset.

## Verification evidence

### Clean product matrix after #35

After reconciling #34 with the responsive fixes, the existing structural/interaction suite passed on exact branch revision `6657b20a3c9e9d284a600d387aec06dba2ea84b6`.

### Accepted baseline bootstrap

The snapshot path configuration was corrected to preserve the image extension (`{arg}{ext}`), then the six accepted baselines were generated from the already reviewed clean rendered state and committed to the branch.

Bootstrap verification run:

- run: `32961418379`;
- source revision: `6a9bf45baef29dc57ff205ff056afbdd2761ce31`;
- baseline commit created by the bootstrap: `bbc797d2c822a51060729890e017a55afc1d03c1`;
- result: PASS.

The temporary bootstrap write permission was then removed. The final workflow uses `contents: read`.

Read-only baseline-enabled verification run:

- run: `32961733977`;
- revision: `b47f322e57488fe9626b2e466658d94c12d2090b`;
- result: PASS.

### Intentional regression proof

A temporary visible sentence was added only to `/projects/` to prove that an unexpected visual change fails CI.

Regression revision:

- `f100d3ee4f802b8095d3815b67422fddffafe8dd`.

Regression run:

- run: `32961925409`;
- result: expected FAILURE;
- failed page/viewport: Projects / mobile only;
- HTTP status: 200;
- console errors: 0;
- broken images: 0;
- horizontal overflow: false;
- pixel difference: 35,734 pixels, ratio 0.08;
- artifact ID: `9604222743`.

The failure artifact contains:

- `projects-mobile-expected.png`;
- `projects-mobile-actual.png`;
- `projects-mobile-diff.png`.

This demonstrates that visual regressions are blocking failures while the evidence pipeline still finalizes the manifest and uploads artifacts.

### Revert and green verification

The temporary Projects sentence was reverted byte-for-byte to the product state from `main`.

Revert revision:

- `73e75f37e567bd4b604d3fbd39ebb24082dcf088`.

Verification run:

- run: `32962118702`;
- result: PASS;
- artifact ID: `9604293794`.

The accepted baselines therefore detect an intentional change and return to green after the change is removed.

## Final verdict

PASS.

The pipeline now satisfies the issue contract:

- clean Hugo build from the exact PR revision;
- runner-local Chromium rendering only;
- deterministic 18-page/viewport evidence matrix;
- 21 current Playwright checks;
- current screenshots retained on all runs;
- committed accepted visual baselines;
- blocking expected/actual/diff visual regression evidence;
- navigation, mobile-menu, keyboard, overflow, image, and console checks;
- machine-readable manifest and HTML report;
- artifact upload on success and failure;
- read-only visual-review permissions;
- no pull-request production deployment.

## Rollback

Revert the issue #34 infrastructure commits. Production `.github/workflows/hugo.yml` remains independent and was not broadened to deploy pull requests.
