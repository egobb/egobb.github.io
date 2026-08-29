# Media optimization and repository hygiene

This document records the bounded media work for `egobb/portfolio-roadmap#18` after the visual/editorial work from epic #47 was integrated into `main`. The optimization deliberately preserves that accepted composition: it changes delivery and repository hygiene, not the established visual language.

## Source inventory

The largest page-bundle post covers on `main` before this change were:

| Source | Source size | Current use | Optimized delivery |
|---|---:|---|---|
| `content/posts/automating-order-tracking/automatic-order-tracking.png` | 1,355,332 B | article cover | Hugo WebP, max 1200 px |
| `content/posts/lost-in-the-clouds/lost-in-the-clouds.png` | 1,432,144 B | article cover | Hugo WebP, max 1200 px |
| `content/posts/order-tracking-first-steps/order-tracking-first-steps.png` | 1,470,687 B | article cover | Hugo WebP, max 1200 px |
| `content/posts/scaling-order-tracking-kafka/scaling-order-tracking-kafka.png` | 1,486,689 B | article cover | Hugo WebP, max 1200 px |
| `content/posts/welcome-to-the-blog-building-my-portfolio/welcome-to-the-blog-building-my-portfolio.png` | 1,910,794 B | article cover | Hugo WebP, max 1200 px |
| `content/posts/when-postgres-is-enough-snapshot-ingestion-pipeline/when-postgres-is-enough-snapshot-ingestion-pipeline.png` | 1,754,621 B | article cover | Hugo WebP, max 1200 px |

The original page-bundle files remain the source of truth. Hugo derives bounded WebP resources at build time, avoiding destructive recompression and preserving the historical source material.

Epic #47 intentionally changed Writing and related editorial indexes to text-first lists. Those indexes therefore no longer transfer cover thumbnails. This issue does not reintroduce them. The image processor retains a bounded 640 px compatibility path for implicit page-cover callers, but the representative editorial indexes are expected to contain zero cover images.

## Repository source-weight cleanup

Three heavyweight files were unused or duplicate and are removed rather than recompressed:

- `static/images/Profile_Ghibli_3.png` — 2,316,248 B; superseded by the referenced `_small` asset.
- `static/images/nature_profile.jpeg` — 2,915,508 B; superseded by the referenced `_small` asset.
- `static/images/a3a67052-1d63-48d3-b3fb-b77930e6becdcurrent_state_vs_ever_online_diagram.png` — 2,142,564 B; byte-identical duplicate of `static/images/current_state_vs_ever_online_diagram.png` and unreferenced.

Together with the temporary replacement file, this removes roughly 7.47 MB of unnecessary repository payload.

## Runtime evidence and page-weight baselines

The visual-review suite writes `artifacts/visual-review/media-assets.json`. For every representative article cover it records separate **desktop** and **mobile** measurements:

- original source width and height;
- generated WebP width and height;
- browser natural width and height;
- actual rendered width and height;
- transfer size and encoded body size;
- absolute and percentage savings against the committed source PNG.

The gate requires every generated cover to be WebP, no wider than 1200 px, never upscaled, and smaller in encoded bytes than its source PNG. A fresh browser context is used per viewport so both desktop and mobile transfer evidence is meaningful rather than a cache hit.

The same artifact records that the post-#47 Writing index remains image-free rather than restoring thumbnails merely to satisfy the older #18 candidate.

## Architecture-diagram legibility

The current flagship case studies already use responsive SVG architecture diagrams. They are not recompressed or rasterized. The media gate loads both Order Tracking and Snapshot Ingestion at desktop and 390 px mobile widths, records their rendered geometry and resolved source, and asserts a useful visible width in each viewport. The wider visual-review suite continues to provide the authoritative composition/overflow evidence.

## Social, logo, and favicon assets

The files configured by `hugo.yaml` are materialized at the declared paths:

- `/images/og-default.avif` — 1200×630 default social image;
- `/images/logo.svg` — compact site mark;
- `/favicon.svg` — SVG favicon.

Playwright verifies that all three resolve successfully from the built site and return non-empty bodies.

## Repository artefacts removed and prevented

All committed `:Zone.Identifier` metadata and `tables_dynamodb.png~RFc6c39b.TMP` are removed. `.gitignore` rejects both patterns so Windows download metadata and Office-style replacement files do not re-enter the repository.

## Quality boundary

Historical screenshots and explanatory raster diagrams under `static/images/` are not destructively rewritten by this issue. That avoids trading page weight for unreadable technical evidence. The work is restricted to oversized article covers, unused/duplicate source files, configured site assets, and accidental filesystem artefacts.

No generated visual-review screenshots are committed by #18, so the change does not introduce screenshots containing account identifiers, secrets, or employer information.
