# Implementation Plan: Restructure navigation and homepage information architecture

- **Work ID**: portfolio-roadmap#14
- **Status**: blocked
- **Requirement source**: https://github.com/egobb/portfolio-roadmap/issues/14
- **Scope**: Reorganize primary and secondary navigation, add structural `/projects/` and `/writing/` entry points, and put selected projects before engineering writing on the homepage while preserving the current Hugo Narrow visual baseline.
- **Out of scope**: Homepage positioning rewrite (#1), full Projects hub content and project case studies (#2/#3/#4), article rationalization (#15), recruiter contact experience beyond the existing public email (#16), global visual-system work (#13), merge, deployment, and issue closure.

## Success criteria

- AC1: Primary navigation is Home, Projects, Engineering writing, About, Contact.
- AC2: Selected projects appear on the homepage before the engineering-writing list.
- AC3: Categories, tags, archives, and RSS remain discoverable without occupying primary navigation.
- AC4: Existing individual post URLs and `/posts/` remain valid; `/writing/` is additive.
- AC5: The implementation matches `docs/03-target-information-architecture.md` without implementing later case-study/content work.
- AC6: Navigation and new routes use the pinned Hugo Narrow components and remain keyboard/mobile compatible by construction.
- AC7: Hugo Narrow remains the recognizable visual baseline; no global palette, typography, card, or theme-control redesign is introduced.

## Evidence and assumptions

- Observed: `hugo.yaml` — the current primary navigation is Posts, Categories, Tags, Archives, About; Contact exists only in the footer.
- Observed: pinned `hugo-narrow` `layouts/home.html` — homepage renders author block, then recent posts, then page content; there is no slot for a Projects section before writing.
- Observed: pinned `hugo-narrow` navigation templates — both desktop and mobile menus iterate `site.Menus.main`, so menu configuration is the correct extension point.
- Observed: `docs/03-target-information-architecture.md` — preferred route model adds `/projects/` and `/writing/` while preserving individual post URLs.
- Observed: issue #13 is closed `not planned`; visual work must remain feature-scoped.
- Assumption: Hugo section lookup uses local `layouts/projects/list.html` and `layouts/writing/list.html` before the theme templates; validate with a Hugo build when available.

## Approach

Use Hugo's existing extension mechanisms instead of editing the theme submodule. Reconfigure menus in `hugo.yaml`; add two lightweight content section roots; add local list templates for Projects and Engineering writing; override only `layouts/home.html` to insert a reusable selected-projects partial before the writing list. Keep `/posts/` untouched and document that `/writing/` is an additive index, so no redirect is required.

## Design

`hugo.yaml` becomes the source for navigation and the small selected-project registry used by the structural shell. `/writing/` paginates `site.RegularPages` from the existing `posts` section, which preserves article ownership and permalinks. `/projects/` is intentionally a lightweight shell that #2 can enrich later. The local homepage override copies the pinned theme's author block unchanged and changes only section ordering and labels.

## Tasks

- [x] **T1 — Make primary and secondary navigation portfolio-first**
  - Intent: Expose the target primary journey while keeping taxonomy/archive navigation secondary.
  - Files: `hugo.yaml`
  - Changes: Replace the current main menu with Home, Projects, Engineering writing, About, Contact; move Categories, Tags, Archives into the footer; retain RSS; add selected-project metadata under `params.home`.
  - Validation: Parse YAML; assert exact main-menu order and target URLs; assert secondary links remain configured.
  - Dependencies: None
  - Requirements: AC1, AC3, AC7

- [x] **T2 — Add stable Projects and Engineering writing routes**
  - Intent: Ensure every primary navigation destination resolves without moving existing articles.
  - Files: `content/projects/_index.md`, `content/writing/_index.md`, `layouts/projects/list.html`, `layouts/writing/list.html`
  - Changes: Create a lightweight Projects shell and an Engineering writing index that paginates the existing `posts` collection.
  - Validation: Static template inspection; Hugo build and generated-route check when Hugo is available.
  - Dependencies: T1
  - Requirements: AC1, AC4, AC5, AC6

- [x] **T3 — Put selected projects before engineering writing on Home**
  - Intent: Change homepage information hierarchy without redesigning the existing author block.
  - Files: `layouts/home.html`, `layouts/_partials/portfolio/selected-projects.html`
  - Changes: Preserve the pinned theme author section, render two selected-project summaries, then render recent posts under the Engineering writing label and `/writing/` view-all link.
  - Validation: Compare local override with pinned theme author markup; static order assertion; desktop/mobile rendered inspection when Hugo is available.
  - Dependencies: T1, T2
  - Requirements: AC2, AC5, AC6, AC7

- [x] **T4 — Record routing compatibility and theme boundary**
  - Intent: Make redirect and upgrade behavior explicit for later roadmap work.
  - Files: `docs/navigation-and-routing.md`
  - Changes: Document new/additive routes, unchanged post permalinks, absence of redirects in #14, secondary navigation, and the maintenance boundary created by the local homepage override.
  - Validation: Review route table against `hugo.yaml`, content paths, and target IA.
  - Dependencies: T1, T2, T3
  - Requirements: AC3, AC4, AC5, AC7

- [ ] **T5 — Run representative build and interaction validation**
  - Intent: Prove generated routes and primary navigation work at desktop/mobile widths.
  - Files: No source changes expected.
  - Changes: Run Hugo build/server; inspect `/`, `/projects/`, `/writing/`, `/about/`, `/posts/`; check main/footer links and keyboard/mobile menu behavior.
  - Validation: `hugo --minify` or equivalent project build plus rendered desktop/mobile inspection.
  - Dependencies: T1, T2, T3, T4
  - Requirements: AC1, AC2, AC3, AC4, AC6, AC7

## Requirement coverage

| Requirement | Tasks | Validation |
|---|---|---|
| AC1 | T1, T2, T5 | YAML menu assertions; generated routes; rendered navigation |
| AC2 | T3, T5 | Template order assertion; homepage inspection |
| AC3 | T1, T4, T5 | Footer/writing links; rendered link check |
| AC4 | T2, T4, T5 | Route model review; generated `/posts/` and article URL checks |
| AC5 | T2, T3, T4 | Compare implementation to target IA and bounded issue scope |
| AC6 | T2, T3, T5 | Theme component reuse; keyboard/mobile inspection |
| AC7 | T1, T3, T4, T5 | Diff review; no global visual-system changes; rendered comparison |

## Delivery and rollback

Remote review delivery was separately authorized after implementation: create a dedicated branch, commit the issue #14 changes, push it, and open a pull request against `main`. Merge, deployment, and issue closure remain unauthorized. Rollback before merge is closing the PR and deleting the feature branch; source rollback after merge would revert the delivery commit.

## Open decisions

None. The roadmap already decided to preserve Hugo Narrow and use `/writing/` as the preferred writing entry point while keeping existing post URLs stable.

## Execution notes

- T1 completed: modified menu/config preview parses as YAML; main order resolves to Home, Projects, Engineering writing, About, Contact; Categories, Tags, Archives, and RSS remain in the footer; two selected-project entries are configured.
- T2 completed to static evidence: `/projects/` and `/writing/` content roots and local list templates are present; the writing template explicitly paginates the existing `posts` section rather than moving articles.
- T3 completed to static evidence: local `layouts/home.html` preserves the pinned theme author block and renders `portfolio/selected-projects.html` before `content/post-list.html`; writing view-all targets `/writing/`.
- T4 completed: `docs/navigation-and-routing.md` records the additive route model, no-redirect decision, preserved `/posts/<slug>/` URLs, and the local-theme-override maintenance boundary.
- Static validation passed: YAML assertions, Go-template block-balance checks, structural contract assertions, and `git apply --check` against the exact relevant baseline snippets.
- T5 blocked: Hugo is not installed in the execution environment, and a complete runnable checkout with the pinned submodule is unavailable. Required `hugo --minify`/server output plus desktop/mobile and keyboard interaction evidence has not been obtained.
- Remote review delivery was separately authorized after implementation. Branch, commit, push, and PR creation are allowed; merge, deployment, and issue closure remain unauthorized.
