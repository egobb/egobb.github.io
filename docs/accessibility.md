# Accessibility review

This document records the repository-owned accessibility pass for `egobb/portfolio-roadmap#26`.

## Acceptance matrix

Representative routes:

- Home: `/`
- Projects: `/projects/`
- Case study: `/projects/order-tracking/`
- Article: `/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/`
- About: `/about/`

The Playwright accessibility gate:

- captures a non-blocking Axe 4.13.0 **before** scan from the published site;
- scans the exact candidate in light and dark mode;
- fails on any Axe `serious` or `critical` violation, including WCAG contrast findings;
- checks exactly one H1 and rejects skipped heading levels;
- requires every rendered image to expose an `alt` attribute and rejects unexplained empty alternatives;
- exercises the skip link and visible keyboard focus;
- exercises the mobile navigation disclosure with Enter, Tab and Escape;
- checks 320 CSS-pixel reflow without page-level horizontal overflow;
- emulates `prefers-reduced-motion: reduce` and verifies non-essential transition/animation motion is suppressed.

Machine-readable evidence is written under `artifacts/visual-review/accessibility/` and uploaded by the normal Visual Review workflow.

## Remediation delivered

- Added a first-focusable `Skip to main content` link.
- Added a stable `main#main-content` target with `tabindex="-1"`.
- Added a repository-wide `:focus-visible` indicator for interactive controls.
- Added global reduced-motion safeguards while preserving the existing editorial-shell rule.
- Preserved `aria-current="page"` and labelled primary navigation introduced by Epic #47.
- Corrected the desktop appearance wrapper to a named `group`.
- Changed the mobile navigation from application-menu semantics to a standard disclosure navigation pattern and added `aria-controls`.
- Preserved the 44 px-class mobile targets, heading fixes and secondary-text contrast improvements already verified by Epic #47 Phase B.

## Image policy

Meaningful portfolio photography and technical diagrams retain descriptive alternatives. Decorative images must use `alt=""` and be either explicitly hidden from assistive technology or contained by an already-labelled control/link. Alternative text must not disclose private implementation data.

## Exceptions and limits

- Axe is an automated detector, not a complete WCAG conformance certificate.
- The repository has no HTML contact form; Contact is a `mailto:` destination, so form validation/error-state criteria do not apply.
- Screen-reader UX still benefits from periodic human testing with VoiceOver/NVDA. The regression suite protects the underlying semantics, labels, focus order and alternatives but does not claim to emulate a specific screen reader.
- Browser zoom at 400% is represented by the WCAG reflow-equivalent 320 CSS-pixel gate; the existing Phase B responsive gate separately covers 200% text resizing.
- `layouts/baseof.html` intentionally mirrors the pinned `hugo-narrow` base template at submodule commit `8041f75fba60bddee6c2f32daebaef404a35933d` only to own the skip-link/main-landmark contract. Re-review this override when the theme submodule changes.
