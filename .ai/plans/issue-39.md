# Issue 39 — De-assessment the Projects hub

## Identity

- Work item: `egobb/portfolio-roadmap#39`
- Implementation/delivery repo: `egobb/egobb.github.io`
- Base: `main` at `ff504dbfbb6589206d17782bb1ab7d6f94d39d6d`
- Track: `moderate`
- Verification mode: `remote_ci`
- Artifact purpose: technical portfolio documentation; recruitment is secondary.
- Editorial authority: `egobb/portfolio-roadmap/docs/11-authenticity-editorial-guardrails.md`.

## Plan

1. Replace the uniform detailed project schema with a generic optional-section model.
2. Rewrite Order Tracking and Snapshot Ingestion summaries from their existing case-study material, preserving claim boundaries and real limitations.
3. Remove public `Evidence` and redundant `Stack` blocks from the detailed Projects hub while keeping repository, case-study and article links prominent.
4. Add Playwright assertions for the new asymmetric structure, neutral vocabulary and retained links.
5. Run authoritative Hugo + Playwright CI on a verification-only PR; inspect rendered evidence and refresh only the Projects mobile baseline if the visual change is intentional and all non-snapshot checks pass.
6. Re-run the unmodified visual-review workflow against the exact verified candidate.
7. Deliver only product/test/baseline changes to a dedicated final branch; exclude this plan and workflow state.

## Delivery disposition

Internal only. Exclude `.ai/plans/**`, `.ai/workflows/**`, verification-only workflow changes and temporary verification transport from final delivery.
