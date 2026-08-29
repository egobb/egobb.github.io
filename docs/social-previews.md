# Social preview metadata

This repository owns the Open Graph and Twitter/X preview contract instead of relying on the theme's generic defaults.

## Preview matrix

| Page | Social image | Title/description source |
|---|---|---|
| Home | `/images/social/default.png` | Explicit entry in `data/social_previews.yaml` |
| Order Tracking | `/images/social/order-tracking.png` | Explicit entry in `data/social_previews.yaml` |
| Snapshot Ingestion | `/images/social/snapshot-ingestion.png` | Explicit entry in `data/social_previews.yaml` |
| Other pages/articles | `/images/social/default.png` | Page title plus description/summary, with site description as final fallback |

All social images are PNG, 1200×630, and intentionally small enough for link-preview crawlers. Open Graph and Twitter/X metadata always use absolute public URLs derived from Hugo's production `baseURL`.

## Implementation

- `layouts/_partials/opengraph.html` overrides the theme/Hugo Open Graph partial.
- `layouts/_partials/twitter_cards.html` overrides the Twitter/X card partial.
- `data/social_previews.yaml` contains the page-specific overrides and common image/card dimensions.
- Home's normal HTML description is explicitly set in `content/_index.md` so standard SEO metadata and social copy remain aligned.

The two flagship projects have their own cards; posts without a social override deliberately use the global card rather than sending crawlers to large historical cover PNGs or AVIF-only assets.

## Validation

`tests/visual/social-metadata.spec.ts` acts as a deterministic metadata inspector and checks:

- exactly one canonical, Open Graph URL/image, and Twitter image tag;
- expected title, description and public canonical URL for Home and both flagship projects;
- `summary_large_image` Twitter cards;
- absolute `https://enriquegoberna.com/...` image URLs;
- `image/png`, width `1200`, height `630` metadata;
- local build resolution and MIME type for every social asset;
- article fallback to the default card.

After merge, validate the same tags against the deployed public URLs so the final evidence is not limited to source configuration or a local build.
