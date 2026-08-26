# Navigation and routing

This document records the information-architecture changes introduced for portfolio roadmap issue #14.

## Primary navigation

The primary navigation is intentionally portfolio-first:

1. Home
2. Projects
3. Engineering writing
4. About
5. Contact

Categories, tags, archives, and RSS remain available as secondary navigation in the footer. Categories, tags, and archives are also linked from the Engineering writing index.

## Route model

| Route | Purpose | Compatibility |
|---|---|---|
| `/` | Portfolio homepage | Existing route, unchanged |
| `/projects/` | Entry point for selected projects | New route; #2 will enrich the content |
| `/writing/` | User-facing Engineering writing index | New route; lists the existing `posts` section |
| `/posts/<slug>/` | Individual engineering articles | Existing routes, unchanged |
| `/posts/` | Legacy chronological posts index | Retained and reachable directly; no redirect in #14 |
| `/about/` | About page | Existing route, unchanged |
| `/categories/` | Secondary taxonomy | Existing route, retained |
| `/tags/` | Secondary taxonomy | Existing route, retained |
| `/archives/` | Secondary archive | Existing route, retained |

## Redirect plan

No redirect is required for issue #14 because no existing public URL changes ownership or path. The new `/writing/` route is an additional entry point that renders the existing `posts` collection; individual article permalinks remain under `/posts/<slug>/`.

A future content-rationalization issue may choose to redirect or retire `/posts/`, but that is explicitly out of scope here and must preserve article URLs.

## Theme boundary

The implementation keeps Hugo Narrow as the visual baseline. The site overrides the homepage and adds section-specific list templates only because the pinned theme does not expose an extension point for inserting Projects before the writing feed or for listing `posts` under a separate `/writing/` route.

When upgrading the theme submodule, compare the upstream `layouts/home.html` with the local override before accepting the upgrade.
