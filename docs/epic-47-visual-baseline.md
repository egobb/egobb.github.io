# Epic 47 visual baseline

This document is the reusable pre-change evidence contract for the **Visual polish and mobile-first refinement** epic. It deliberately records the representative surfaces and known observations before the polish changes are accepted; later issues must compare against the same matrix rather than silently moving the goalposts.

## Coordination status

- `portfolio-roadmap#18` has a validation-only media candidate in product PR `#25`. It is explicitly **do not merge** and is not absorbed into this epic. Media/helper behavior on `main` remains the source of truth.
- `portfolio-roadmap#26` has a validation-only accessibility candidate in product PR `#26`. It is explicitly **do not merge** and is not absorbed into this epic. Header/menu/theme controls changed by this epic must preserve the accessibility semantics and focus expectations documented by that track.
- The epic therefore proceeds from current product `main`, while treating both candidates as compatibility constraints and final-gate context.

## Representative route matrix

The automated visual-review suite captures every route below at **1440×900**, **768×1024**, and **390×844**:

| Surface | Route | Why it is in the baseline |
| --- | --- | --- |
| Home | `/` | Header/nav, hero, selected projects, global shell |
| Projects list | `/projects/` | List hierarchy and responsive cards |
| Order Tracking detail | `/projects/order-tracking/` | Project-detail hierarchy and long-form shell |
| Snapshot Ingestion detail | `/projects/snapshot-ingestion/` | Second project-detail shape and long-form shell |
| Engineering writing | `/writing/` | List hierarchy and navigation state |
| About | `/about/` | Long-form prose and compact/mobile layout |
| Posts | `/posts/` | Theme list/archive-adjacent surface |
| Archives | `/archives/` | Dense information surface and archive styling |
| Representative long article | `/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/` | Prose, headings, blockquotes, code/tables where present, breadcrumb/metadata, long mobile flow |

The configured justified gallery and lightbox features are disabled in `hugo.yaml`, so there is no active public gallery/masonry route to manufacture solely for this audit. If those features are enabled later they require their own representative coverage rather than being inferred from an inactive template.

## Evidence and browser strategy

`tests/visual/helpers.ts` owns the route/viewport matrix and writes deterministic current screenshots under:

```text
artifacts/visual-review/screenshots/<page>/<viewport>.png
```

The path is browser-neutral. `playwright.config.ts` accepts `VISUAL_BROWSER=chromium|firefox`, with Chromium remaining the normal fast gate at this stage. This makes the exact same evidence contract executable under Firefox for the cross-browser gate later in the epic without duplicating or renaming the route matrix.

The visual-review workflow now runs for PRs targeting `phase/**`, `epic/**`, and `main`. This is required by the epic integration hierarchy: issue PRs must receive real checks before they are merged into the phase branch, phase integration must be checked before the epic branch, and the final epic PR must still receive the normal `main` gate.

## Baseline observations to resolve

These are the pre-change observations carried by the epic and its child issues. They are treated as hypotheses to fix and then re-check against rendered evidence, not as permission to redesign unrelated surfaces.

1. **Header/navigation:** desktop typography, spacing, and alignment feel less deliberate than the body; compact/mobile navigation consumes more width than necessary. Existing focus, labeling, menu-toggle, theme-switcher, and icon semantics must not regress.
2. **Projects list/detail:** hierarchy between section label, title, supporting text, links/actions, and adjacent navigation is weaker than the rest of the site. Bare text-symbol navigation should be replaced only through the existing icon mechanism and with accessible names preserved.
3. **Responsive width:** narrow screens devote too much horizontal space to navigation/sidebar chrome. Content must receive materially more usable width without horizontal overflow or desktop changes.
4. **Full-width rhythm:** pages using wider shells do not share one clearly explainable spacing model across breakpoints. The fix should be one shell rule rather than page-specific offsets.
5. **Dark surfaces:** information blocks can collapse visually toward near-black instead of using the theme's existing background/card/muted/border layering.
6. **Typography:** article/page titles, section headings, blockquotes, breadcrumb/metadata, and supporting copy need a clearer but restrained hierarchy. The body font contract should remain stable until the font-loading issue is handled.
7. **Font loading/assets:** the bundled webfont loader configuration is suspected to use `fontdisplay` rather than `fontDisplay`; redundant public font files must be proven unused before removal.
8. **Media/performance:** final conclusions must be reconciled with the validation evidence from roadmap #18 rather than reintroducing ad-hoc media logic.

## Acceptance protocol for subsequent issues

For every visual-polish issue:

1. start from the current phase branch;
2. make the smallest change that addresses the issue's stated surfaces;
3. run the normal visual-review workflow on the issue PR;
4. inspect failures as regressions or intentional rendering changes—never refresh snapshots merely to obtain green CI;
5. preserve no-overflow, no-broken-image, console/page-error, interaction, and existing accessibility contracts;
6. merge only after the issue-specific acceptance criteria and the automated gate are satisfied;
7. use this same route/viewport matrix again for #55 and the final evidence gate #56.

## Baseline status

The baseline is **established** once the issue PR's visual-review workflow completes against the matrix above. The generated artifact is intentionally ephemeral CI evidence; screenshots are not checked into source control unless they are an accepted regression fixture already governed by the visual-review protocol.
