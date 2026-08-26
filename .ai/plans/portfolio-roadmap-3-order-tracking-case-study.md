# Plan — portfolio-roadmap#3 Order Tracking flagship case study

## Work identity

- Work item: `egobb/portfolio-roadmap#3`
- Implementation/delivery repository: `egobb/egobb.github.io`
- Decision/evidence repositories: `egobb/portfolio-roadmap`, `egobb/order-tracking`
- Change track: `moderate`
- Verification mode: `remote_ci`
- Delivery disposition: `internal` — exclude this plan from final delivery.

## Requirements

- R1 — Open with the problem and constraints before presenting Kafka as the solution.
- R2 — Show the event flow and explain why `orderId`-keyed Kafka messages preserve ordering per order, without implying global ordering.
- R3 — Make trade-offs, failure modes, producer idempotence vs end-to-end idempotency, and operational considerations explicit.
- R4 — Trace strong claims to source code, tests, infrastructure, or clearly labelled portfolio-scale evidence; do not claim missing benchmark/replay/demo evidence.
- R5 — Link the source repository and Kafka migration article.
- R6 — Include at least one useful visual.
- R7 — Keep the case study reachable from the existing Projects hub; public/live verification remains post-merge.

## Tasks

### T1 — Expand the Order Tracking project page
- **Intent:** Replace the current overview with an interview-defensible case study.
- **Files:** `content/projects/order-tracking/index.md`
- **Changes:** Add problem/constraints, synchronous-to-async evolution, Mermaid event-flow diagram, keyed partitioning semantics, domain/hexagonal boundaries, audit/projection behavior, reliability and failure-mode analysis, testing evidence, AWS/Terraform scope, trade-offs, limitations and next steps. Link exact public evidence where useful.
- **Validation:** Hugo/CI render, link resolution, visual checks, manual evidence review against `egobb/order-tracking` and roadmap evidence matrix.
- **Requirements:** R1-R6.

### T2 — Add the case study to visual-route validation
- **Intent:** Ensure the new long project page is exercised at desktop/tablet/mobile widths by the existing Playwright quality gate.
- **Files:** `tests/visual/helpers.ts`
- **Changes:** Add `/projects/order-tracking/` to the `pages` matrix without adding a baseline snapshot requirement.
- **Validation:** Existing Playwright suite must report HTTP success, no console errors, no broken images, and no horizontal overflow for all configured viewports.
- **Requirements:** R6-R7.

### T3 — Verify exact candidate in remote CI
- **Intent:** Obtain authoritative build and visual evidence because the current execution environment cannot clone/run the repository locally.
- **Files:** No product changes.
- **Changes:** Use a workflow-owned verification branch/temporary PR. Confirm required CI jobs ran on the exact candidate SHA and passed.
- **Validation:** GitHub Actions run/job status and logs/artifacts when required.
- **Requirements:** R1-R7.

### T4 — Deliver verified product-only bytes
- **Intent:** Create a clean final branch and review-ready PR with internal workflow files excluded.
- **Files:** Only product paths from T1-T2.
- **Changes:** Recreate the verified file contents from `main`, prove blob/content equivalence to the verified candidate, open final PR, and read back head/base/diff/work-item wording.
- **Validation:** Exact product blob equivalence plus final PR readback.
- **Requirements:** R1-R7.

## Risks and boundaries

- The current code demonstrates keyed publication and an integration test that observes per-order processing order, but a separate reproducible partition-level ordering demonstration remains tracked by roadmap work.
- Kafka producer idempotence is configured, but no explicit end-to-end deduplication key or Kafka/database transaction is present; the case study must label duplicate/redelivery handling as incomplete.
- Clean-checkout reproducibility, canonical exported architecture asset, working demo, replay lab, and performance benchmark are separate roadmap work and must not be presented as completed evidence.
- AWS is a portfolio/preproduction-style Terraform environment, not a production deployment.
- The Projects hub is already deployed and links this stable route. The new case-study content is not considered live until after human merge and public deployment verification.
