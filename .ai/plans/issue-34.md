# Issue #34 — Automated visual review pipeline

## Status

in_progress

## Requirement source

- https://github.com/egobb/portfolio-roadmap/issues/34

## Delivery context

This implementation is intentionally stacked on the current issue #14 branch because `/projects/` and `/writing/` are representative routes required by #34 and are not yet available on `main`.

Bootstrap exception authorized by the user: branch/push/PR may occur before the final `PASS` solely to execute and validate the new CI workflow. Merge, deploy, issue mutation, and branch deletion remain unauthorized.

## Approach

Add repository-owned Playwright infrastructure and an isolated pull-request GitHub Actions workflow. The workflow builds Hugo from the checked-out revision, serves `public/` on runner-local `127.0.0.1`, runs Chromium against a deterministic page/viewport matrix, emits current screenshots plus Playwright results, and uploads the complete visual-review evidence even on failure.

Baseline snapshot creation is a deliberate second step after the first CI run produces current screenshots. Baselines must not be fabricated before the rendered output is visually reviewed.

## Tasks

- [x] T1 — Define isolated PR visual-review workflow and preserve production deploy isolation.
- [x] T2 — Add reproducible Node/Playwright dependency and configuration.
- [x] T3 — Add representative page, viewport, structural, navigation, mobile-menu, and keyboard tests.
- [x] T4 — Add current screenshot capture and machine-readable manifest generation.
- [x] T5 — Add artifact/report retention and local developer documentation.
- [ ] T6 — Bootstrap-deliver branch/PR and obtain first GitHub Actions run.
- [ ] T7 — Inspect generated screenshots and accept baseline snapshots.
- [ ] T8 — Demonstrate an intentional visual-regression failure, revert the temporary change, and obtain final green CI.
- [ ] T9 — Run independent final verification and record verdict.

## Validation

Static checks before bootstrap delivery:

- workflow YAML structure and trigger review;
- exact production workflow remains unchanged;
- package lock matches package manifest;
- Playwright configuration references only Chromium and runner-local server;
- page matrix covers Home, Projects, Engineering writing, About, Posts, and one long article;
- viewport matrix covers 1440x900, 768x1024, and 390x844;
- artifacts are uploaded with `if: always()`;
- no production deployment permissions or external preview host are introduced.

Runtime gate after bootstrap delivery:

- `hugo --minify` passes in Actions;
- Playwright installs and Chromium launches;
- current screenshots and manifest artifact are retrievable;
- structural/navigation/mobile/keyboard checks pass;
- accepted visual baselines are committed only after visual review;
- temporary intentional visual change produces expected/actual/diff evidence;
- reverted final revision returns green.

## Rollback

Revert the issue #34 infrastructure commit(s). Production `.github/workflows/hugo.yml` is intentionally untouched.
