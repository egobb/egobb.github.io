# Epic 47 · Phase B final aesthetic acceptance

## Decision

**PASS**, subject to the normal Visual Review workflow succeeding on the exact #65 head that contains this acceptance record.

Phase B improves the restrained Phase A result through bounded editorial correction: hierarchy, density, portrait placement, contrast, taxonomy restraint, stable editorial taxonomy naming and stronger responsive evidence. It does **not** introduce a replacement visual language or reopen the completed Phase A redesign work.

## Evidence anchors

| State | Commit / run | Artifact | Purpose |
| --- | --- | --- | --- |
| Phase B baseline (accepted Phase A / start of Phase B) | `417c27556ab6922faf5b75bb692b4d7ec942deb8` · run `33160696419` | `9681541384` · `sha256:69306e90729cd7eef76e7b0b1193717f642f0c1b14684cc71071c7e1df65b708` | Post-Phase-A state reviewed by the second aesthetic audit |
| #64 responsive gate | `b2412c27c8bf2ef7484c40357afe07b138397d59` · run `33173460584` | `9686666627` · `sha256:107b03f6b9feedeeeaad9303a771e737c56450a15a0a5539b576cc2f8986c856` | 60 page/viewport results, five viewport widths, 200% text-resize evidence and interaction checks |
| #63 follow-up exact head | `d6390913f587dc77f4186c1504f7898ae938d91d` · run `33176111370` | `9687750757` · `sha256:ceb58d544d721635d6dd5e1916b7f13325174173136bf4378d037f7e76571c1b` | Final-gate taxonomy-label drift fixed; 60/60 rendered checks passed |
| Final integrated Phase B product before #65 note | `f10c6031ff5c091fae45f4d2f076d75381e9fd59` | squash merge of product PR #47 on top of #58–#64 | Stable phase candidate after all child implementation work |

The exact final #65 head and its workflow run are recorded in `egobb/portfolio-roadmap#65` after CI succeeds, avoiding a self-referential commit SHA in this file.

## Child disposition

| Roadmap issue | Product PR | Outcome |
| --- | --- | --- |
| #58 · Long-form title/heading hierarchy | #39 | Duplicated title path removed, calmer long-title scale and hierarchy regression coverage |
| #59 · Projects index density | #40 | Entries shortened to summary + bounded Decision/Boundary/Limitation evidence; spacing carries separation |
| #60 · About rhythm/portrait | #41 | Existing portrait moved into the opening editorial flow; section rhythm clarified without framing/card treatment |
| #61 · Home hero balance | #42 | H1 proportions reduced, avatar increased to a better identity cue and action hierarchy clarified |
| #62 · Secondary-text contrast | #43 | Default light/dark secondary foreground raised one measured step with rendered contrast checks |
| #63 · Writing taxonomy/legacy indexes | #44 + follow-up #47 | Taxonomy de-emphasized and unified; final-gate drift fixed so technical labels have deterministic editorial casing while stable URLs remain unchanged |
| #64 · Responsive rendered-evidence gate | #45 | 1440/1024/768/390/360 + 200% text resize validated; bounded 1024/enlarged-text nav reflow defect fixed |

All seven child issues are merged into `phase/57-post-remediation-editorial-refinement` and reconciled as completed before this gate.

## Rendered comparison

### Home

**PASS.** The introduction remains left-aligned and editorial, with calmer H1 proportions, a stronger existing-avatar identity cue and a clearer action hierarchy. At 360/390 px the first viewport still communicates purpose and meaningful content without becoming a landing-page composition.

### Projects

**PASS.** The index is materially easier to scan. Each project leads with a concise summary and bounded technical evidence while preserving decisions and limitations. The result remains a single-column editorial flow with no card grid, thumbnail gallery or button wall.

### About

**PASS.** The existing personal photograph participates in the opening desktop composition and appears early in the mobile flow. Section boundaries are clearer through whitespace and heading rhythm, with no decorative framing introduced.

### Writing and taxonomy

**PASS.** `/writing/` no longer overstates Categories and Tags relative to the publication index. Archive remains the useful secondary index, taxonomy roots stay text-first, article-header taxonomy is bounded, and legacy index routes share the same restrained shell.

The final acceptance pass also exposed and resolved unstable multi-word/technical tag display. Labels such as `Spring Boot`, `GitHub Actions`, `AWS`, `DDD`, `DevOps`, `IaC`, `ECS`, `MSK` and `RDS` now render deterministically while their existing taxonomy URLs remain unchanged.

### Long-form and case studies

**PASS.** Long titles are calmer, the Postgres article no longer presents a duplicated title hierarchy, and H1 remains authoritative without consuming the entire first viewport. Prose measure is preserved while code, tables and technical diagrams retain wider usable space.

### Secondary contrast

**PASS.** Dates, summaries, metadata and secondary links are easier to read in light and dark modes while remaining subordinate to primary text. No new accent palette or decorative colour system was introduced.

## Responsive evidence

The accepted #64 and #63 follow-up artifacts both report **60 passed page/viewport results** with:

- 1440×900 desktop;
- 1024×768 compact desktop / header breakpoint;
- 768×1024 tablet;
- 390×844 canonical mobile;
- 360×800 narrow-mobile stress case;
- 200% text resize coverage for required Phase B surfaces.

Required surfaces include Home, Projects, Engineering Writing, About, both flagship case studies, the longest article, Posts/Archives, Categories and Tags.

Machine evidence on the final child head reports:

- 0 failed page/viewport results;
- 0 page-level horizontal-overflow failures;
- 0 representative broken images;
- 0 console/page errors;
- all interaction checks passed;
- mobile menu, action wrapping, footer stacking, internal code/table scrolling, 1024 header behavior and light/dark behavior covered.

## Phase B acceptance questions

1. **Is the duplicated-title defect gone everywhere? — PASS.** One-document-H1 and coherent heading-level regression checks cover public long-form pages; the Postgres duplicate is removed.
2. **Are long titles calmer without losing authority? — PASS.** The longest article/case-study titles occupy less first-viewport height and remain clearly primary.
3. **Is Projects faster to scan while technically honest? — PASS.** Decision and limitation/boundary evidence remains visible while index prose is materially shorter.
4. **Does About reveal the person earlier and have clearer rhythm? — PASS.** The existing portrait is visible in the opening desktop composition and early mobile flow.
5. **Is Home better balanced without becoming a landing page? — PASS.** Smaller H1, stronger avatar cue and clearer primary/secondary actions improve proportion without UI chrome.
6. **Is secondary text readable but subordinate in both themes? — PASS.** Rendered contrast checks and visual review agree.
7. **Do Writing taxonomy and legacy indexes feel like one site? — PASS.** Shared shell/width/appearance behavior is preserved; taxonomy is quieter, text-first and now deterministically named.
8. **Do 360/390/768/1024 renders and 200% text resizing demonstrate intentional composition? — PASS.** The responsive matrix and interaction evidence are tied to exact candidate SHAs.
9. **Were Phase A strengths preserved? — PASS.** Neutral palette, flat editorial surfaces, text-first navigation, personal photography, technical diagrams and technical depth remain intact.
10. **Was any decorative replacement introduced? — PASS.** No new cards, pills, gradients, glow, decorative shadows, skill-logo grids or motion system was added.

## Preservation / regression checklist

- [x] Technical claims and project destinations remain intact.
- [x] Stable public URLs remain intact.
- [x] Personal photography remains intact.
- [x] Architecture diagrams and technical media remain present and usable.
- [x] Code/tables scroll internally where required rather than widening the page.
- [x] Text-first global shell from Phase A remains intact.
- [x] Light / Dark remains the only public appearance control.
- [x] No card/pill/gradient/glow/decorative-shadow replacement language was introduced.
- [x] Hugo + Chromium Playwright passed on the responsive evidence gate and the final #63 corrective head.
- [x] Technical taxonomy names are deterministic while stable term URLs remain unchanged.
- [x] Final #65 exact-head CI is required before the roadmap gate is closed.

## Roadmap reconciliation rule

After the exact #65 head passes CI:

1. merge #65 only into `phase/57-post-remediation-editorial-refinement`;
2. close #65 with exact-head evidence;
3. verify #58–#65 are all completed;
4. close phase issue #57 with this acceptance record and exact evidence;
5. integrate the phase branch into `epic/47-visual-polish-mobile-refinement` through a phase → epic PR;
6. update the existing epic → `main` review PR with Phase B scope and re-run the exact-head main-target Visual Review;
7. **do not auto-merge the epic → `main` PR** and do not close roadmap epic #47 until that manual integration occurs.

If the exact #65 or phase-integration gate fails, this PASS decision is revoked until the bounded failure is resolved.
