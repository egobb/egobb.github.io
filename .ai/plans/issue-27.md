# Issue 27 — final responsive, navigation and performance quality gates

## Objective

Turn the existing responsive/navigation/performance acceptance criteria into a durable final regression gate against the post-Epic-47 portfolio baseline.

## Preconditions verified

- portfolio-roadmap #14 completed.
- portfolio-roadmap #18 completed.
- portfolio-roadmap #26 completed.
- aesthetic-remediation epic #47 completed and integrated into `main`.
- the obsolete multi-theme/theme-demo behavior removed by #47 is not reintroduced; only the retained light/dark appearance toggle is validated.

## Implementation

1. Add a consolidated Playwright gate covering the representative page set required by #27.
2. Exercise 320, 360, 390, 768, 1024 and 1440 CSS-pixel widths for horizontal overflow.
3. Verify key pages have no console errors or missing images.
4. Crawl sitemap routes plus discovered internal links/assets and fail on unresolved targets.
5. Verify header/footer consistency, active route semantics and appearance-toggle layout stability.
6. Record mobile/desktop browser timing and resource baselines with broad regression budgets.
7. Persist evidence under `artifacts/quality-gates`.
8. Add a dedicated GitHub Actions workflow that runs the gate on the exact candidate revision and uploads the evidence.
9. Document the gate, evidence files, performance methodology and the post-#47 interpretation of the appearance criterion.

## Validation

- Dedicated `Portfolio quality gates` workflow must pass on the PR head.
- Existing full `Visual review` workflow must also pass on the same PR head.
- Review the PR diff for scope creep: no content, claims, design direction or unrelated refactor is allowed.

## Completion evidence expected

- passing quality-gate CI run on exact PR head;
- passing full visual-review CI run on exact PR head;
- generated viewport, link, rendering, navigation/appearance and performance evidence artifacts;
- merge to `main`;
- portfolio-roadmap #27 reconciled and closed only after the merge is verified.
