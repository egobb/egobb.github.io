# Accessibility review

This document is the repository-owned checklist and evidence contract for the portfolio accessibility pass tracked by `egobb/portfolio-roadmap#26`.

## Scope

The review covers the public portfolio as a personal engineering site. Accessibility fixes must preserve the purpose, technical content, historical voice, and evidence boundaries of the existing material; this work does not add recruiter, SEO, or seniority positioning.

Representative pages used as the acceptance matrix:

- Home: `/`
- Projects index: `/projects/`
- Case study: `/projects/order-tracking/`
- Article: `/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/`
- About: `/about/`

## Automated audit

`tests/visual/accessibility.spec.ts` performs the following checks in the existing Playwright visual-review job:

- captures a non-blocking **before** Axe 4.13.0 scan against the currently published site;
- scans the exact PR candidate in both light and dark mode;
- fails the candidate on Axe findings with `critical` or `serious` impact;
- validates one H1 per representative page and rejects skipped heading levels in the main content;
- verifies every rendered image has an `alt` attribute;
- verifies the brand image inside its already-labelled home link is decorative (`alt=""`);
- exercises the skip link and visible keyboard focus;
- checks 320 CSS-pixel reflow without horizontal document overflow;
- verifies reduced-motion preferences suppress meaningful transition duration;
- smoke-tests WCAG color contrast for every configured palette in light and dark mode.

Evidence is written under `artifacts/visual-review/accessibility/` and uploaded by the existing `Visual review` workflow together with Playwright reports and screenshots.

## Remediation checklist

- [x] Add a keyboard-visible skip link to the main landmark.
- [x] Give the main landmark a stable target and programmatic focus target.
- [x] Provide a global `:focus-visible` outline for interactive controls.
- [x] Respect `prefers-reduced-motion` for animations, transitions, and smooth scrolling.
- [x] Label primary navigation landmarks.
- [x] Expose `aria-current="page"` in desktop and mobile navigation.
- [x] Connect expandable controls to their popups with `aria-controls` and unique IDs.
- [x] Prevent duplicated accessible names from icons that accompany visible text or labelled buttons.
- [x] Treat the brand image as decorative because the containing link already has the site name.
- [x] Keep a single page-level H1 and prevent skipped heading levels in the Projects index.
- [x] Give repeated project links project-specific accessible names.
- [x] Preserve meaningful author/diagram alternative text and require all rendered images to expose an `alt` attribute.
- [x] Cover narrow viewport/reflow and configured palette contrast in automated checks.

## Manual keyboard and zoom walkthrough

These checks remain part of human review because automation cannot prove the complete assistive-technology experience:

- [ ] Tab and Shift+Tab through Home, Projects, one case study, one article, and About; confirm order follows the visible reading order.
- [ ] Activate the skip link, primary navigation, theme controls, project CTAs, article links, and Contact with keyboard only.
- [ ] Confirm no focused control is obscured by the sticky header or floating controls.
- [ ] Inspect the site at browser zoom levels 200% and 400% and confirm text remains readable without two-dimensional scrolling for ordinary content.
- [ ] Confirm diagram alternatives convey the purpose of each meaningful diagram when images are unavailable.
- [ ] Confirm decorative imagery is silent to a screen reader.

## Known limitations and exceptions

- Axe is an automated detector, not a complete WCAG conformance assessment. Passing scans do not replace the manual checks above.
- Contact is currently a `mailto:` action rather than an HTML form, so there are no form labels, errors, or validation states to audit. The link remains part of keyboard and accessible-name checks.
- The site supports multiple palettes from the upstream `hugo-narrow` theme. The automated contrast matrix protects the configured palettes used by this repository; future theme/palette additions must remain covered by the same test.
- `layouts/baseof.html`, `layouts/single.html`, and the UI partial overrides intentionally mirror the pinned `hugo-narrow` theme contract at submodule commit `8041f75fba60bddee6c2f32daebaef404a35933d`. Re-review these overrides whenever the theme submodule is upgraded.
- Historical article source is preserved. The single-page template normalizes nested Markdown H1 output at render time rather than rewriting dated prose.
