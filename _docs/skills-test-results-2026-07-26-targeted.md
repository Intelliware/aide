# A.I.D.E. — Skills Test Results — 2026-07-26 (targeted YOLO re-run)

**Branch:** `mm/AIDE-core-changes` **Mode:** YOLO / automated **Host:** Claude Code (simulated agent, parallel subagents)
**Plan:** `_docs/skills-test-plan.md` — **Phase C, targeted subset** (steps touched by the 4 fix commits landed after the 2026-07-24 run)
**Sandbox:** `~/Dev/framework-tests/` (existing 9 clones + KB reused; C.8 subtrees rolled back and regenerated verbatim)
**Scope decision:** operator chose **"Targeted (fixes only)"** — re-run only the Phase C steps affected by commits since 2026-07-24.

## What this run tested

The 2026-07-24 full run passed 0-FAIL but surfaced framework doc/spec drifts as follow-ups. Four commits then landed to fix them:

| Commit | Fix | Test that validates it |
|---|---|---|
| `3536b41` | Pin **sparse `<NN>` block numbering** (gated-out block leaves a gap; survivors keep full-list index) across the 10 RE skills | C.8.0–C.8.4 gap checks + modern-RE spot-check |
| `3536b41` | Align **test-suite Part-B path** to `source-docs/<repo>/test-suite-consumer/` (was `components/<test-suite-id>/`) | C.8.4 |
| `85e1d00` | Move **mainframe feed-files to the Part-B (KB source-docs) root** (were documented at Part-A root) | C.8.2, C.8.3 |
| plan #12 | Realign copybook **record-graph key to `records[]`** (canonical per skill) | C.8.0-sub2, C.8.1 |

**Method:** rolled back the C.8 KB source-docs subtrees + Part-A internal dirs (backed up to scratchpad), then re-ran each affected RE skill **verbatim** via parallel subagents with the explicit rule *"place every file exactly where the skill docs say — do NOT hand-correct paths."* Any file that reappears at the fix-mandated location is proof the committed fix drives correct placement. All `[auto]` criteria then re-verified from disk (jq, `mmdc` render, NN-gap analysis, frontmatter grep).

## Ledger

| Step | Class | Auto-pass | Notes |
|---|---|---|---|
| C.8.0-sub2 re-copybook-library (hlasm CUSTDEF) | PASS | 3/3 | `records[]` key ✓; CUSTDEF record present; 9 CUST-* fields + level-88s in data-dictionary; feeds at Part-B root; **sparse gap at 07** (db2/ims block gated out, 08 kept its index) |
| C.8.1 re-copybook-library (zopeneditor) | PASS | 3/3 | `records[]` key ✓; 4 records (CUSTCOPY/TRANREC/DATETIME/REPTTOTL); TRANREC 5 REDEFINES variants, CUSTCOPY OCCURS 12→[0..11]; conflicts note present ("no conflicts"); feeds at Part-B root; **sparse gaps at 07,08** |
| C.8.2 re-cobol-program (zopeneditor primary) | PASS | 4/4 | **feeds at Part-B root, none leaked to Part-A** ✓; `program-call-graph.mmd` has SAM1→SAM2 edge + renders via mmdc; 3 EXEC inventories present & zero-row; **sparse gap at 08/09/10** |
| C.8.2 re-cobol-program (hlasm supplementary) | PASS | 4/4 | feeds at Part-B root (copybook feeds untouched); **EXEC SQL=2, EXEC CICS=12** (both >0); 7 host-vars bind to CUSTDEF (`resolves_to_copybook`); **sparse gap at 10** (DLI gated out) |
| C.8.3 re-jcl-job (zopeneditor) | PASS | 4/4 | feeds (`job-flow.mmd`,`dataset-io.json`) at Part-B root; job-flow renders via mmdc; `dataset-io.json` resolves ZDERUN.SAM1→SAM1 bindings node; **sparse gap at 05** (GDG gated out, no GDG fabricated) |
| C.8.4 re-test-suite (hono) | PASS-w/-FINDING | 3/3 | **Part B routed to `source-docs/hono/test-suite-consumer/`** (NOT `components/<id>/`) ✓; `kind: test-suite` on all 10 files; Vitest + two-tier layout detected; Part A 01–16 / Part B 01–10 (no gates → dense, correct). **Finding F-1 below.** |
| Spot-check: sparse rule in all 10 RE SKILL.md | PASS | 1/1 | sparse-numbering wording present in all 10 RE skills; on-disk modern Part-B trees show real gaps (realworld 11→14, hono-api 07→09, nativewind 14→16) |

**Result: 6/6 steps PASS on all `[auto]` criteria. 0 FAIL. The 4 committed fixes all produce correct output when the skill is executed following its corrected docs.**

## Findings — the fixes work but are INCOMPLETE (partial-fix doc drift)

Every fix corrected the *behavior-driving* doc(s) but left sibling docs inside the same skill still describing the pre-fix layout, creating an internal contradiction. Each subagent independently flagged this. A future agent that happens to follow the *stale* doc would reproduce the original bug.

### F-1 (HIGH) — mainframe feed-file placement fix (`85e1d00`) is partial
Commit corrected `INPUTS-OUTPUTS.md` + `steps/scaffold.md` to the Part-B root, but these still say **Part-A directory root** in BOTH `reverse-engineer-cobol-program` and `reverse-engineer-jcl-job`:
- `SKILL.md` § "Output structure (mandatory)" — the **primary doc an agent reads first** (2 hits each)
- `references/OVERVIEW.md` (1 hit each)
- `references/EXAMPLE.md` — output tree shows feeds under `docs/<domain>-internal/` (Part A)
- `templates/compositions/re-cobol-program-internal.yaml` notes (1 hit; jcl internal.yaml has none)

**Impact:** an agent following SKILL.md verbatim would drop `program-*.{mmd,json}`, `program-exec-inventory.md`, `job-flow.mmd`, `dataset-io.json` in the source repo — the exact bug #11 aimed to fix — and `build-mainframe-data-lineage` (KB-side) would not find them. **Recommend:** update SKILL.md + OVERVIEW.md + EXAMPLE.md + the internal.yaml note in both skills to the Part-B (KB `source-docs/<slug>/`) root.

### F-2 (HIGH) — test-suite Part-B path fix (`3536b41`) is partial
Commit corrected `SKILL.md` + `re-test-suite-consumer.yaml` to `source-docs/<repo>/test-suite-consumer/`, but these still describe the old `components/<test-suite-id>/` 8-fixed-file layout (with `subkind:` frontmatter):
- `references/INPUTS-OUTPUTS.md`
- `steps/scaffold.md`
- `steps/verify.md`

**Impact:** an agent following `scaffold.md` verbatim would scaffold into `components/<test-suite-id>/` with 8 fixed-name files instead of the 10-block `source-docs` sibling tree that `build-knowledge-base` consumes. **Recommend:** reconcile INPUTS-OUTPUTS.md + scaffold.md + verify.md to the source-docs 10-block layout.

### F-3 (LOW) — copybook EXAMPLE.md feed-file nesting drift
In `reverse-engineer-copybook-library`, `references/EXAMPLE.md` shows the three feeds (`copybook-record-graph.json`, `data-dictionary.md`, `copybook-conflicts.md`) nested *inside* `copybook-library-consumer/`, whereas SKILL.md + INPUTS-OUTPUTS.md place them at the `source-docs/<slug>/` root (one level up). Both copybook subagents flagged it. **Recommend:** fix EXAMPLE.md to the slug root.

### F-4 (LOW, content) — JCL Mermaid dotted-edge label syntax
`reverse-engineer-jcl-job`'s generated `job-flow.mmd` used `-. label .->` dotted-edge labels, which `mmdc` rejected until rewritten to `-.->|label|`. The block-template example syntax may not be mmdc-parseable as written. Non-blocking (final artifact renders), but the template's Mermaid example is worth a spot-fix.

### Minor / non-defect observations
- Plan C.8.2 names `PSAM1.cbl` in the COBOL dir; the actual files are `SAM1.cbl`, `SAM1LIB.cbl`, `SAM2.cbl` (PSAM1 is elsewhere). SAM1→SAM2 is a *dynamic* `CALL identifier`, documented as an unbound edge with candidate `SAM2`. Plan-doc nit, not a framework defect.
- The pre-fix `bluesky-social/mobile-app-consumer` tree on disk is contiguous `01–09` (the old contiguous-renumber behavior follow-up #6 fixed); it's a stale 2026-07-24 artifact, not a fresh run. All freshly-regenerated trees this pass honor sparse numbering.

## Sandbox state / teardown

- **Regenerated (verbatim):** `recipes-kb/source-docs/{zopeneditor-sample,hlasm-cics-cobol-sample}/*` + `recipes-kb/source-docs/hono/test-suite-consumer/` + the six Part-A `docs/*-internal/` dirs in the clones. 53 files.
- **Untouched:** all 9 clones (still shallow), `recipes-kb/components|graph.json|shared|synthesized|...`, `hono/api-framework-consumer/`, `recipes-app*`.
- **Backup:** the 2026-07-24 C.8 outputs are preserved at `…/scratchpad/c8-backup/` (139 files) — restore if a pristine 07-24 KB is wanted. Note: the KB `components/`/`graph.json` were built from the 07-24 source-docs, so there is minor cosmetic drift between the freshly-regenerated source-docs and the already-built components; inconsequential for this test (no C.9 re-run in scope).
- **Framework repo:** no edits — this run only wrote to the sandbox + this ledger.

## Recommended next action

1. **Maintainer:** apply **F-1** and **F-2** — the two partial fixes. They are one-doc-each edits (align SKILL.md/OVERVIEW.md/EXAMPLE.md for mainframe feeds; INPUTS-OUTPUTS.md/scaffold.md/verify.md for the test-suite path) that close the internal contradictions so a verbatim run can't hit the old path. Then F-3, F-4.
2. **Optional:** re-run C.9 `build-knowledge-base` if the KB components should be rebuilt from the freshly-regenerated source-docs (out of scope for this targeted pass).
