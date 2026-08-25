# Implementation Plan: Define and implement the portfolio visual system

- **Work ID**: portfolio-roadmap#13
- **Status**: blocked
- **Requirement source**: https://github.com/egobb/portfolio-roadmap/issues/13
- **Scope**: Establish the reusable visual foundation for `egobb/egobb.github.io`: canonical light/dark tokens, shell and reading widths, typography/spacing hierarchy, focus treatment, restrained current-page styling, and reusable hero/CTA/project-card/evidence-summary primitives.
- **Out of scope**: Rewriting portfolio content, creating the Projects hub or case studies, changing homepage positioning copy, deployment, screenshots containing employer data, or changing the Hugo Narrow submodule.

## Success criteria

- AC1: Visual rules follow `portfolio-roadmap/docs/05-visual-direction.md`.
- AC2: Homepage, About, article surfaces, and future project cards use one hierarchy and spacing system.
- AC3: Desktop shell is approximately 1100–1200 px and long-form reading width is approximately 680–760 px, with mobile-safe spacing.
- AC4: Text/action contrast and keyboard focus meet accessibility expectations.
- AC5: The multi-palette selector is removed or constrained while Light/Dark/System mode remains available.
- AC6: Reusable hero, CTA, project-card, and evidence-summary styles exist without introducing stock imagery or decorative effects.
- AC7: Homepage, Projects, one case study, one article, and About are visually reviewed at desktop/mobile in light/dark mode.

## Evidence and assumptions

- Observed: `hugo.yaml` — the current site exposes eleven colour palettes, `showThemeSwitch: true`, Light/Dark/System mode, and `dock: "float"`.
- Observed: Hugo Narrow `layouts/_partials/layout/head/css.html` at submodule commit `8041f75f...` — `assets/css/custom/*.css` is loaded after `compiled.css`.
- Observed: Hugo Narrow exposes stable semantic hooks including `.author-section`, `.post-list`, `.post-meta`, `.prose`, and `.nav-link`.
- Observed: `portfolio-roadmap/docs/05-visual-direction.md` requires a 1100–1200 px shell, 680–760 px reading width, 8-point rhythm, one accent, visible focus, and one canonical light/dark palette.
- Observed: roadmap issues #1 and #2 remain open, so the final homepage CTA hierarchy and Projects page do not yet exist.
- Assumption: CSS custom-property overrides remain compatible with the pinned Narrow compiled stylesheet because its colour utilities consume the same `--color-*` variables.
- Limitation: this execution environment cannot clone GitHub or run Hugo, so required rendered-page and visual-regression evidence cannot be obtained here.

## Approach

Use Narrow's documented custom CSS resource hook rather than forking or editing the theme submodule. Define a single canonical portfolio stylesheet that overrides theme colour variables, establishes design tokens, normalises the existing semantic components, and exposes stable portfolio-specific primitives for #1/#2/#3/#4. Restrict configuration to one palette while keeping Light/Dark/System mode.

This keeps the change reversible: removing the custom stylesheet and restoring `hugo.yaml` returns the site to Narrow defaults.

## Design

- Palette: restrained blue accent with separate AA-compliant light/dark values.
- Layout: 72rem (1152 px) global shell and 46rem (736 px) reading column.
- Spacing: 8 px base rhythm represented as 8/16/24/32/48/64 px tokens.
- Typography: system sans stack, tighter large-heading tracking, readable 1.75 article line-height.
- Components: borders and spacing carry hierarchy; shadows remain minimal; scale/translate hover effects are neutralised.
- Interaction: universal `:focus-visible`, underlined prose links, reduced-motion handling.
- Theme integration: no submodule edits; custom CSS loads after compiled theme CSS.
- Compatibility: stale `data-theme` palette values are neutralised by the portfolio variable layer; Light/Dark/System still controls `.dark`.

## Tasks

- [x] **T1 — Constrain theme configuration to the canonical visual modes**
  - Intent: Remove conflicting palette choice and persistent floating-dock decoration while retaining Light/Dark/System.
  - Files: `hugo.yaml`, `README.md`
  - Changes: Set `showThemeSwitch: false`, keep `showDarkModeSwitch: true`, reduce `themes` to the default entry, switch dock from `float` to `scroll`, and update appearance documentation.
  - Validation: Parse `hugo.yaml`; assert switch/dock/theme values.
  - Dependencies: None
  - Requirements: AC1, AC5

- [x] **T2 — Implement canonical tokens, shell, typography, and accessibility baseline**
  - Intent: Establish one maintainable light/dark design layer over Narrow.
  - Files: `assets/css/custom/portfolio.css`
  - Changes: Add canonical palette variables, 1152/736 px widths, 8-point spacing tokens, typography hierarchy, focus-visible rules, reduced motion, restrained hover behaviour, and current theme-hook normalization.
  - Validation: Parse CSS; calculate contrast for text, muted text, accent links, and CTA foreground/background pairs.
  - Dependencies: T1
  - Requirements: AC1, AC2, AC3, AC4

- [x] **T3 — Normalize existing homepage, About, article, navigation, and writing-card surfaces**
  - Intent: Make current representative pages share the same hierarchy without rewriting content or copying theme layouts.
  - Files: `assets/css/custom/portfolio.css`
  - Changes: Restyle `.author-section`, `.post-list`, `.post-meta`, `.prose`, direct page headers/cards, `.nav-link`, and dock controls; remove decorative prose heading/blockquote effects and hover scaling.
  - Validation: Verify selectors against the pinned Narrow templates and inspect rules for mobile/reduced-motion coverage.
  - Dependencies: T2
  - Requirements: AC1, AC2, AC3, AC4

- [x] **T4 — Expose reusable portfolio primitives for dependent roadmap work**
  - Intent: Give #1/#2/#3/#4 stable visual building blocks without implementing their content.
  - Files: `assets/css/custom/portfolio.css`, `docs/visual-system.md`
  - Changes: Define/document hero, CTA, project-card, evidence-summary, and wide-media primitives plus usage constraints.
  - Validation: Check required class families are present and documented.
  - Dependencies: T2
  - Requirements: AC2, AC6

- [ ] **T5 — Complete rendered visual acceptance matrix**
  - Intent: Obtain the visual evidence required to close the issue.
  - Files: No source changes expected; screenshots are review evidence.
  - Changes: Render Homepage, Projects, one case study, one article, and About at desktop/mobile in light/dark mode; record theme limitations.
  - Validation: `hugo server -D` plus browser review and keyboard-focus pass.
  - Dependencies: T1, T2, T3, T4; Projects/case-study routes from dependent roadmap work
  - Requirements: AC7

## Requirement coverage

| Requirement | Tasks | Validation |
|---|---|---|
| AC1 | T1, T2, T3 | Config/CSS checks against visual-direction rules |
| AC2 | T2, T3, T4 | Shared tokens + current semantic hooks + reusable primitives |
| AC3 | T2, T3 | 72rem shell, 46rem reading column, mobile media query |
| AC4 | T2, T3 | Contrast calculation, `:focus-visible`, reduced motion |
| AC5 | T1, T2 | Palette switch disabled; CSS neutralises stale palette values |
| AC6 | T4 | Required class families and documentation |
| AC7 | T5 | Manual render matrix — BLOCKED in current environment |

## Delivery and rollback

Remote delivery of this implementation as a dedicated branch and review PR was explicitly authorized on 2026-08-25. Merge and deployment remain out of scope and require separate authorization.

Rollback is limited to removing `assets/css/custom/portfolio.css`, removing `docs/visual-system.md`, restoring the affected `hugo.yaml`/`README.md` lines, and deleting this plan.

## Open decisions

None for the foundation. The exact homepage copy/CTA destinations and Projects content remain owned by roadmap issues #1/#2 rather than this issue.

## Execution notes

### T1 — current execution
- Result: completed
- Files: `hugo.yaml`, `README.md`
- Validation: YAML parse/config assertions — PASS
- Deviation: Local artifact workspace used because GitHub cannot be cloned from the execution environment.

### T2 — current execution
- Result: completed
- Files: `assets/css/custom/portfolio.css`
- Validation: CSS parse + WCAG contrast calculations — PASS
- Deviation: None.

### T3 — current execution
- Result: completed
- Files: `assets/css/custom/portfolio.css`
- Validation: selector contract checked against pinned theme templates — PASS (static)
- Deviation: Rendered browser validation remains unavailable.

### T4 — current execution
- Result: completed
- Files: `assets/css/custom/portfolio.css`, `docs/visual-system.md`
- Validation: reusable primitive presence/documentation assertions — PASS
- Deviation: Project-card rendering itself is deferred because roadmap issue #2 is not implemented.

### T5 — current execution
- Result: blocked
- Files: None
- Validation: `hugo server -D` — NOT RUN; Hugo is unavailable and the repository/submodule cannot be cloned.
- Deviation: Visual screenshots and desktop/mobile light/dark review must be completed in an authorized local checkout after dependent project routes exist.
