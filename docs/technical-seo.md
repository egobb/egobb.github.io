# Technical SEO policy and audit

This document records the technical SEO decisions for `enriquegoberna.com`. It is intentionally limited to metadata, canonical identity, crawler/indexing behavior, structured data, and the relationship between project case studies and engineering articles.

## Baseline audit

Baseline inspected: deployed GitHub Pages artifact for `main` commit `c6ff95c4bdc0303b293aa48e64974465104c6177` (29 August 2026).

### What was already correct

- Home, Projects, both flagship case studies, About, Writing, and representative articles emitted absolute `https://enriquegoberna.com/...` canonicals.
- The key portfolio pages already had distinct human-written titles and descriptions.
- Open Graph and Twitter metadata were already owned by the repository through `data/social_previews.yaml`, `opengraph.html`, and `twitter_cards.html`.
- The generated Order Tracking article occupied one canonical public URL; the historical static file at the same output path is shadowed by Hugo's generated page and therefore does not currently create a second public target.

### Gaps found

- No `robots.txt` was emitted.
- The default sitemap contained 52 URLs, including tag and category taxonomy pages that largely repeat article excerpts and inherited the same generic description.
- Taxonomy pages were indexable and included in the sitemap even though their role is browsing, not landing-page search acquisition.
- No JSON-LD was present in the generated HTML.
- Project/article relationships existed in `data/projects.yaml`, but search consumers had no machine-readable representation of those relationships.
- `/posts/` and `/archives/` inherited the generic site description rather than describing their own purpose.

## Canonical and indexing policy

1. Every indexable HTML page owns one absolute self-canonical generated from Hugo's `.Permalink`.
2. Stable article URLs are not changed as part of technical SEO cleanup.
3. Home, section pages, case studies, About, and articles remain `index, follow`.
4. Category and tag pages remain public and navigable but are `noindex, follow` because they are browsing aids with substantial content overlap.
5. Taxonomy and term pages are omitted from `sitemap.xml`.
6. `robots.txt` allows crawling and points crawlers to the canonical sitemap. `noindex` is expressed in page metadata rather than by blocking crawling, so crawlers can see the directive and continue following article links.

## Structured-data policy

The site emits one JSON-LD graph on indexable pages.

### Person

The public owner entity contains only information already intentionally visible on the site:

- name: Enrique Goberna;
- role: Senior Software Engineer;
- homepage URL;
- public GitHub, LinkedIn, and Twitter profiles.

It deliberately excludes email, address/location, telephone, employer entities, ratings, reviews, and credentials.

### WebSite and WebPage

Indexable pages identify the site and their canonical page URL. About uses `AboutPage`; other ordinary pages use `WebPage`.

### Project case studies

Flagship case studies use `CreativeWork`, not a more specific schema type that would imply unsupported source-code or product semantics. The case-study URL is the canonical project identity for the site.

`data/projects.yaml` remains the source of truth for project/article relationships. When a project has an `articlePageRef`, its structured data links to that article with `subjectOf` using the article's resolved canonical permalink rather than assuming the page reference is itself a public URL.

### Engineering articles

Posts use `Article`, including canonical URL, headline, description, author, publication/modification dates, and the related project when `data/projects.yaml` declares one. The reciprocal `Article.about` / `CreativeWork.subjectOf` relationship uses the same canonical entity IDs.

## Search-preview checklist

For Home, Projects, both flagship case studies, About, and a representative article:

- [ ] HTTP response is successful in the generated site.
- [ ] `<title>` is present and distinct among the checked key pages.
- [ ] meta description is present, meaningful, and distinct among the checked key pages.
- [ ] exactly one absolute canonical points to the current public URL.
- [ ] robots metadata matches the intended indexing policy.
- [ ] Open Graph/Twitter metadata still agrees with the canonical URL and social-preview policy.
- [ ] exactly one JSON-LD block parses as JSON and uses `https://schema.org`.
- [ ] structured data describes only visible, supportable facts.

For crawler infrastructure:

- [ ] `/robots.txt` allows crawling and advertises `https://enriquegoberna.com/sitemap.xml`.
- [ ] `/sitemap.xml` contains the intended indexable pages exactly once.
- [ ] sitemap contains no `/tags/` or `/categories/` URLs.
- [ ] tag/category landing and term pages remain reachable but emit `noindex, follow`.

## Automated regression evidence

`tests/visual/technical-seo.spec.ts` implements the checklist against the exact Hugo build used by CI. It also verifies that both flagship case studies expose `CreativeWork` schema, the Order Tracking article/project relationship is reciprocal, and private or unsupported structured-data fields are absent.

Social-card behavior remains covered separately by `tests/visual/social-metadata.spec.ts`; technical SEO changes must not duplicate or replace that policy.

## Known source-level cleanup

`static/posts/scaling-order-tracking-with-kafka-domain-events-and-auto-ingestion/index.html` is currently shadowed by Hugo's generated article at the same output path. It does not create a duplicate in the deployed artifact, so this change leaves it untouched rather than deleting historical source material implicitly. If it is removed later, that should be an explicit cleanup with a check that the generated canonical URL remains stable.
