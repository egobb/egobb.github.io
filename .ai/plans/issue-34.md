# Issue #34 — Automated visual review pipeline

## Status

in_progress

## Requirement source

- https://github.com/egobb/portfolio-roadmap/issues/34

## Delivery context

This implementation is intentionally stacked on the current issue #14 branch because `/projects/` and `/writing/` are representative routes required by #34 and are not yet available on `main`.

Bootstrap exception authorized by the user: branch/push/PR may occur before the final `PASS` solely to execute and validate the new CI workflow. Merge, deploy, issue mutation, and branch deletion remain unauthorized.

## Approach

Add repository-owned Playwright infrastructure and an isolated pull-request GitHub Actions workflow. The workflow builds the exact pull-request head revision, serves `public/` on runner-local `127.0.0.1`, runs Chromium against a deterministic page/viewport matrix, emits current screenshots plus Playwright results, and uploads the complete visual-review evidence even on failure.

Baseline snapshot creation is a deliberate second step after generated screenshots are visually reviewed. Baselines must not be fabricated before the rendered output is accepted.

## Tasks

- [x] T1 — Define isolated PR visual-review workflow and preserve production deploy isolation.
- [x] T2 — Add reproducible Node/Playwright dependency and configuration.
- [x] T3 — Add representative page, viewport, structural, navigation, mobile-menu, and keyboard tests.
- [x] T4 — Add current screenshot capture and machine-readable manifest generation.
- [x] T5 — Add artifact/report retention and local developer documentation.
- [x] T6 — Bootstrap-deliver branch/PR and obtain first GitHub Actions run.
- [ ] T7 — Inspect generated screenshots and accept baseline snapshots.
- [ ] T8 — Demonstrate an intentional visual-regression failure, revert the temporary change, and obtain final green CI.
- [ ] T9 — Run independent final verification and record verdict.

## First runtime evidence

Bootstrap PR: `egobb/egobb.github.io#3`.

First run proved the end-to-end infrastructure boots correctly:

- checkout and submodule initialization passed;
- Hugo Extended installation passed;
- Node/npm dependency installation passed;
- Chromium installation passed;
- `hugo --minify` passed;
- Playwright executed;
- the artifact uploaded with `if: always()`.

The first browser run also exposed test-harness defects that require remediation before product findings can be trusted:

- exact accessible-name selectors failed because theme icons contribute to link accessible names;
- lazy-loaded images were falsely classified as broken via `naturalWidth`;
- the representative long-article slug was stale;
- screenshots/results were recorded after assertions, so failing page/viewports lacked complete current evidence;
- checkout built GitHub's synthetic PR merge revision instead of the exact PR head;
- retry traces made the failure artifact approximately 434 MB.

It also detected horizontal overflow on some tablet/mobile pages. That finding remains intentionally strict and will be re-evaluated after harness false positives are removed.

## Remediation design

- identify navigation destinations by stable `href` and verify active state separately;
- validate image resources by HTTP response rather than viewport-dependent lazy-loading state;
- use the actual representative long-form article path;
- capture current screenshots and diagnostics before assertions and always record a result in `finally`;
- check out the exact PR head SHA and use that same SHA in the manifest/artifact identity;
- initialize `manifest.json` before the Hugo build;
- disable retries/traces for the deterministic visual suite to keep artifacts bounded;
- include overflowing-element diagnostics when overflow is detected;
- pin accepted snapshot paths under `tests/visual/__snapshots__/`.

## Validation

Runtime gate:

- `hugo --minify` passes in Actions;
- Playwright installs and Chromium launches;
- current screenshots and manifest artifact are retrievable for success and failure;
- structural/navigation/mobile/keyboard checks pass or expose real product findings with actionable diagnostics;
- accepted visual baselines are committed only after visual review;
- temporary intentional visual change produces expected/actual/diff evidence;
- reverted final revision returns green.

## Rollback

Revert the issue #34 infrastructure commit(s). Production `.github/workflows/hugo.yml` is intentionally untouched.
