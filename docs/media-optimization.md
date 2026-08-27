# Media optimization and repository hygiene

This document records the bounded media work for portfolio-roadmap issue #18. It is intentionally a performance and repository-hygiene change; it does not rewrite historical articles or alter architecture diagrams merely for visual consistency.

## Repository inventory before this change

The largest page-bundle post covers on `main` were:

| Source | Repository size | Usage before | Delivery after |
|---|---:|---|---|
| `content/posts/automating-order-tracking/automatic-order-tracking.png` | 1,355,332 B | post cover + cards | Hugo WebP, max 1200 px on post / 640 px on cards |
| `content/posts/lost-in-the-clouds/lost-in-the-clouds.png` | 1,432,144 B | post cover + cards | Hugo WebP, max 1200 px on post / 640 px on cards |
| `content/posts/order-tracking-first-steps/order-tracking-first-steps.png` | 1,470,687 B | post cover + cards | Hugo WebP, max 1200 px on post / 640 px on cards |
| `content/posts/scaling-order-tracking-kafka/scaling-order-tracking-kafka.png` | 1,486,689 B | post cover + cards | Hugo WebP, max 1200 px on post / 640 px on cards |
| `content/posts/welcome-to-the-blog-building-my-portfolio/welcome-to-the-blog-building-my-portfolio.png` | 1,910,794 B | post cover + cards | Hugo WebP, max 1200 px on post / 640 px on cards |
| `content/posts/when-postgres-is-enough-snapshot-ingestion-pipeline/when-postgres-is-enough-snapshot-ingestion-pipeline.png` | 1,754,621 B | post cover + cards | Hugo WebP, max 1200 px on post / 640 px on cards |

The original files remain the source of truth. Hugo derives optimized WebP output during the build, avoiding destructive recompression and preserving historical source fidelity.

The repository also contained clearly unused or duplicate heavyweight files. `static/images/Profile_Ghibli_3.png` (2,316,248 B) and `static/images/nature_profile.jpeg` (2,915,508 B) were superseded by their existing `_small` variants and had no source references. `static/images/a3a67052-1d63-48d3-b3fb-b77930e6becdcurrent_state_vs_ever_online_diagram.png` (2,142,564 B) duplicated `static/images/current_state_vs_ever_online_diagram.png` byte-for-byte and was unreferenced. Those files are removed rather than recompressed.

## Rendered-dimension and transfer-size evidence

The authoritative visual-review workflow writes `artifacts/visual-review/media-assets.json`. For every post cover it records:

- original page-resource width and height from Hugo;
- optimized WebP width and height;
- browser natural width and height;
- actual rendered width and height;
- transfer size and encoded body size observed by the browser.

The same check records homepage card-cover dimensions and asserts they never exceed 640 px. Single-post covers never exceed 1200 px, are never upscaled, and must transfer fewer encoded bytes than the source PNG. This artifact is uploaded with the existing visual-review evidence, so representative page-weight evidence remains inspectable for the exact candidate SHA.

## Social and icon assets

The configured files now exist at the paths already declared in `hugo.yaml`:

- `/images/og-default.avif` — 1200×630 AVIF default social image;
- `/images/logo.svg` — compact site mark used by the header;
- `/favicon.svg` — SVG favicon.

Playwright verifies that all three return successful non-empty responses from the built site.

## Repository artefacts removed and prevented

All committed `:Zone.Identifier` metadata and the `tables_dynamodb.png~RFc6c39b.TMP` file are removed. `.gitignore` now rejects both patterns so Windows download metadata and Office-style replacement files do not re-enter the repository.

## Representative page-weight expectation

Before this change, a card or single-post cover resolved directly to its original 1.35–1.91 MB PNG. After this change, the browser receives a Hugo-generated WebP bounded to the rendered use case (640 px cards, 1200 px single posts). CI records the exact encoded body size for every representative post cover and checks it against the original repository size.

Repository source weight also drops by approximately 7.37 MB through deletion of three unreferenced/duplicate heavyweight images, plus the temporary file.

Inline historical screenshots and architecture diagrams under `static/images/` are not destructively rewritten in this change. Current flagship architecture diagrams are SVG resources and remain untouched, preserving legibility at their rendered size.
