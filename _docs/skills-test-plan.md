# A.I.D.E. — Skills Test Plan

**Owner:** mike.moerman@electricmind.com
**Authored:** 2026-04-26
**Last revised:** 2026-07-23 — retargeted to `mm/AIDE-core-changes`. This branch carries everything from `mm/add-ack-cobol-repo` (ack-restoration 1.4.0 + COBOL/mainframe RE 1.3.0 + separation-of-duties scaffold) **plus** the post-1.4.5 core changes: a new **`quality/` stage** (5 skills), a new **`reverse-engineer-test-suite`** RE skill, the **pluggable add-on layer** (`aide-addon.toml` manifest, `extra_skill_roots`, `[tools.*]` resolution, `{workspace}` token), and the **source-adapter convention**. Skill count reflows from 36→**42** and stages from 8→**9**. Static counts that were hard-pinned for the old tree are re-pinned here (A.5 Grep1 4→8, Grep2 9→10); new static coverage for the add-on/source-adapter layer lives in A.8–A.10; the new RE skill is C.8.4; the quality stage is a new **Phase Q** slotted at the D.7 user-elected GO. Tests for layers still not on this branch (1.1.0 solution-context, 1.2.0 adversarial review) remain intentionally absent.
**Scope:** End-to-end manual exercise of every skill shipped under `.agents/skills/`. The plan establishes the canonical skill count dynamically in **A.0** (`<SKILL_COUNT>`) so subsequent steps stop hard-coding the total; on `mm/AIDE-core-changes` this resolves to **42 skills across 9 stages** but additions / removals on the branch will reflow without further plan edits. Anchored on Next.js as the framework being reverse-engineered into the central knowledge base; one mainframe sample (plus a small CICS+DB2 supplementary repo) added in Phase C to exercise the 1.3.0 mainframe RE layer. The SoD scaffold is covered statically in A.6 and observed at runtime through D-stage / Q-stage Step-0 no-op assertions (legacy mode) plus an optional D.2-SoD variant that exercises the active SoD path. The add-on and source-adapter layers are covered statically in A.8–A.10.

> **Skill home for `analyze-repository`.** It lives under `.agents/skills/reverse-engineering/` (it's the dispatcher for the RE stage), not under `meta/`. Phase B's "Meta skills" preamble correctly excludes it; Phase C is its home (C.1 / C.1m).

## 0. Execution modes

The plan supports two modes. Pick one before A.1.

### Step-by-step mode (default)

Run one step, pause for the operator's Pass / Fail / Partial / Skip verdict + free-form notes, move on. Right for the first run on any branch and for diagnostic re-runs.

### YOLO mode

Run continuously. Halt only when a step's verdict is **FAIL** or **NEEDS-REVIEW**; otherwise continue silently. Append every verdict to `_docs/skills-test-results.md` as it lands (not buffered to the end), so a YOLO run that crashes mid-flow is still recoverable. At the end of the pass — or on the first halt — surface the consolidated report described under "Final report" below.

### Result classes

Every step resolves to exactly one of four classes:

| Class | Meaning | YOLO behaviour | Results-file row? |
|---|---|---|---|
| **PASS** | Every `[auto]` criterion checks AND the step has zero `[user]` criteria (OR every `[user]` criterion is trivially observable from the auto output and the agent records its own assessment). | Continue silently. Append a one-line PASS row to the results file. | Yes |
| **FAIL** | Any `[auto]` criterion fails — non-zero exit code, missing file, JSON parse error, count mismatch, regex no-match, validator error, broken cross-ref. | Halt. Print the failing criterion + the diff / output that broke it. Wait for the operator. | Yes |
| **NEEDS-REVIEW** | Step has at least one `[user]` criterion that genuinely requires adjudication and the agent cannot resolve it from the auto output alone. | Halt. Pre-summarise the auto-passed criteria so the operator only reviews the `[user]` surface. Wait for verdict. | Yes |
| **SKIP** | Step is intentionally skipped — operator-flagged `OPTIONAL` step (e.g., D.2-SoD), unavailable environment dependency, or out-of-scope on this branch. The step's pass criteria are **not** evaluated. | Continue silently. Append a one-line SKIP row with the skip reason. | Yes (with reason) |

A step with **only** `[auto]` bullets resolves to PASS or FAIL (never NEEDS-REVIEW). A step with **any** `[user]` bullet is at most NEEDS-REVIEW even when everything passes — YOLO halts so the operator can sign the user-judgment slice off. SKIP is orthogonal to the other three: a step is SKIPped *before* its criteria are run, so it can never coexist with PASS / FAIL / NEEDS-REVIEW for the same invocation.

### Pass-criterion tagging convention

Every bullet under **Pass criteria:** carries one of two tags:

- `[auto]` — verifiable from output without human judgment. Examples: exit code, file existence, JSON parses, regex match, line count, validator zero-error, identical-to-prior diff, frontmatter field present.
- `[user]` — requires human judgment. Examples: "no misclassifications", "findings cite specific sections", "verdict is unambiguous", "top-3 are obviously the most relevant", "no rubber-stamp", "fabricated claim flagged" (when the fabrication is non-obvious).

When a criterion straddles both — e.g., "FRs are testable (each has at least one AC)" — the AC-count side is `[auto]`, the testable-judgment side is `[user]`. Tag the more conservative side (lean `[user]` when in doubt).

### Halt classes (FAIL taxonomy)

YOLO **must** halt on these classes regardless of step or phase:

| Class | Examples | Reason |
|---|---|---|
| **Registry / validator failure** | `scripts/validate.py` non-zero, `scripts/build-registry.py` non-zero, an unknown skill referenced, workflow-graph cross-ref broken | Cascades into every later step that reads the registry |
| **Schema-shape failure** | A produced artifact has the wrong frontmatter shape, missing mandatory section, broken `paths:` glob, RE Part A/B not bound to a composition | Downstream skills will silently mis-consume |
| **Gate FAIL verdict** | Any `review-*-package` skill returns FAIL on its readiness gate | Halts the SDLC sequence per the existing pattern; YOLO must not run the next stage |
| **Destructive-setup conflict** | Sandbox dir already populated when a step expects empty (e.g., re-running C.1 over an existing clone) | Indicates the prior run wasn't cleaned up; YOLO must not silently overwrite |

A PASS-WITH-OBSERVATIONS verdict from a `review-*-package` skill is **not** in a halt class — log it as PASS with the observations attached and continue.

### Setup-step idempotence (YOLO only)

YOLO must guarantee a setup step runs once per pass even if invoked twice:

- Sandbox dirs (`recipes-app/`, `recipes-kb/`, `oss-clones/`) created in earlier phases are reused, not recreated.
- Clones already present are reused; skip `git clone` unless the operator explicitly invokes `--reclone`.
- The mainframe sample, if present from an earlier run, is reused.
- Greenfield sibling dirs (`recipes-app-gf/`, `recipes-kb-gf/`) follow the same rule.

In step-by-step mode the operator is the idempotence backstop; YOLO has no operator on the hot path, so the plan itself enforces it.

### Results file

In both modes the agent maintains `_docs/skills-test-results.md`. Created on first non-PASS verdict in step-by-step; created at the start of the pass in YOLO. Format:

```
| Step    | Class        | When              | Auto-pass | User-pass | Notes |
|---|---|---|---|---|---|
| A.1     | PASS         | 2026-04-30T12:01Z | 4/4 | 0/0 | — |
| C.1     | NEEDS-REVIEW | 2026-04-30T12:14Z | 3/4 | 0/3 | "you adjudicate" — operator to confirm 7 classifications |
| C.9.4   | FAIL         | 2026-04-30T12:42Z | 4/5 | 0/0 | "Every host-var resolves" failed; one host-var unbound and not flagged |
| D.2-SoD | SKIP         | 2026-04-30T13:08Z | —   | —   | optional step; operator chose not to exercise active SoD path |
```

YOLO halts immediately after writing a FAIL or NEEDS-REVIEW row. SKIP rows do **not** halt — YOLO continues to the next step.

### Final report (YOLO only)

At the end of the pass (or at the first halt) the agent emits:

1. **Phase × class breakdown** — small table counting PASS / FAIL / NEEDS-REVIEW per phase.
2. **Full results file** — the running ledger above.
3. **One-paragraph narrative** — what shipped clean, what needed adjudication, what failed.
4. **Recommended next action** — re-run from step X after fix, adjudicate the N pending NEEDS-REVIEW items, or close out the pass.

The narrative is the part the operator reads first; the table and ledger are the audit trail.

---

## 1. Goals

1. Verify each of the **`<SKILL_COUNT>`** framework skills (resolved in A.0; 42 on `mm/AIDE-core-changes`) behaves per its `SKILL.md` description on a realistic input.
2. Validate the agentskills.io frontmatter, `references/` progressive-disclosure pattern, and `steps/` decomposition.
3. Exercise all three flows (greenfield, brownfield, quick-dev) end-to-end.
4. Build a usable Next.js-anchored knowledge base from open-source repos that span all 10 reverse-engineering domains (the original 7 plus 3 mainframe domains added in 1.3.0).
5. Verify the additions present on `mm/AIDE-core-changes` land coherently:
   - **Quality stage (9th stage, new)** — the 5 `quality/` skills (`create-quality-package`, `review-quality-package`, `execute-quality-increments`, `audit-quality-coverage`, `review-test-failures`) run end-to-end at the user-elected quality fork (Phase Q); `greenfield-quality-package.yaml` + `brownfield-quality-package.yaml` compositions resolve; the quality create/execute skills carry the ack-restoration sentinels and `create-quality-package` carries the SoD Step 0.
   - **`reverse-engineer-test-suite` (new RE skill)** — `analyze-repository` can route a dedicated/embedded test suite to it (C.8.4); it emits Part A (`re-test-suite-internal.yaml`, ~16 blocks) + Part B (`re-test-suite-consumer.yaml`, ~10 blocks).
   - **Pluggable add-on layer (new)** — `config/SCHEMAS.md` documents `extra_skill_roots`, the `[tools.<name>]` resolution table (§2.6), the `aide-addon.toml` manifest (§2.7), and the `{workspace}` token; `build-registry.py --extra-skill-root` tags add-on skills with an `origin` while core stays `origin = "core"`; `framework.*` cannot override `[tools.*]` (project-layer only). Covered statically + dynamically in A.9–A.10.
   - **Source-adapter convention (new)** — `references/orientation/source-adapters.md` documents the unset/discoverable/not-discoverable resolution; `document-quick-change` reads `requirements_source` and `create-requirements-package` reads `discovery_source`, both from skill customization; adapters seed intake without replacing gates. Covered statically in A.8.
   - **1.3.0 mainframe RE layer** — `analyze-repository` classifies a small COBOL/copybook/JCL sample to the right new domain; the 3 new RE skills emit lineage feed-files; `build-mainframe-data-lineage` aggregates them into `<KB>/lineage/mainframe/` with the design-doc coverage rules satisfied.
   - **Acknowledgement restoration (1.4.0, already integrated on this branch)** — every SDLC create/execute SKILL.md carries a top-level `## Verification rule (always-on)` section; every step file ends with `## Acknowledgement checkpoint`; the 4 large block templates carry the `AUTHORING RULE — sub-section acknowledgement` HTML-comment block; `Section relevance check` is unconditional in process.md and step files.
   - **Separation-of-duties (SoD) scaffold (new on this branch as part of 1.4.5)** — six SDLC skills carry a Step 0 (`scope-target-repo`) that is a no-op in legacy mode and resolves an SoD path + role-permission check when SoD fields are configured; `templates/blocks/shared/affects-repos.md` exists and is wired as optional into the two greenfield compositions; `config/SCHEMAS.md` documents the SoD fields (`dir`, `colocate_with_source`, `write_role`, `output`, `[project].artifact_subdir`, `[user].role`) and validation rules 7–12; `.example` files demonstrate SoD config; the `_cross-cutting/` directory + `affects_repos` frontmatter contract are documented.
6. Surface defects (missing files, broken cross-refs, ambiguous handoffs, schema mismatches) with reproducible repro steps.

> **Out of scope on this branch.** The 1.1.0 solution-context layer (`capture-solution-context`, `generate-ai-rules`, `document-operations`) and the 1.2.0 adversarial-review layer (`review-adversarial`, `review-edge-case-hunter`, the per-package wrapper sub-reviews, `review-reverse-engineering-package`, `review-knowledge-base-package`) are NOT on this branch. Tests for those layers live in the `mm/add-all` test plan and will return here when those branches merge.

## 2. Non-goals

- Performance / latency benchmarking of the host (Cursor / Copilot).
- Re-deriving the framework's design — we test the shipped artifacts as-is.
- Testing every elicitation branch of every skill — we exercise the **golden path** plus one edge case per skill.

## 3. Test environment

| Item | Value |
|---|---|
| Framework repo | `~/Dev/AIDE` (this repo, `mm/AIDE-core-changes` branch — 1.4.5 base = ack 1.4.0 + cobol 1.3.0 + SoD scaffold, **plus** quality stage + `reverse-engineer-test-suite` + add-on layer + source-adapters) |
| Test sandbox root | `~/Dev/framework-tests/` (created during Phase A) |
| Greenfield sandbox project | `~/Dev/framework-tests/recipes-app/` |
| Knowledge-base repo | `~/Dev/framework-tests/recipes-kb/` (sibling repo, separate from the sandbox app) |
| Brownfield clone root | `~/Dev/framework-tests/oss-clones/` |
| Mainframe sample — primary (1.3.0) | `~/Dev/framework-tests/oss-clones/zopeneditor-sample/` — shallow clone of [`IBM/zopeneditor-sample`](https://github.com/IBM/zopeneditor-sample) (~924K). Provides `COBOL/` (SAM1, SAM2, PSAM1 — CALL chain + file I/O), `COPYBOOK/` + `COPYLIB/` + `COPYLIB-MVS/` (CUSTCOPY with `OCCURS`, TRANREC with `REDEFINES`), and `JCL/` + `JCLLIB/` + `JCLPROC/` (ALLOCATE, RUN, INCLUDE, COMPROC). Used by C.1m, C.8.1–C.8.3, and C.9.4. |
| Mainframe sample — supplementary (1.3.0) | `~/Dev/framework-tests/oss-clones/hlasm-cics-cobol-sample/` — shallow clone of [`pratikdastw/hlasm_cics_cobol_sample`](https://github.com/pratikdastw/hlasm_cics_cobol_sample) (~156K). Adds `EXEC SQL` (CUSTDB2.CBL) + `EXEC CICS` (CUSTMAIN.CBL) host-variable coverage that zopeneditor-sample lacks. Used by C.8.1 only, to exercise the host-var inventory path. |
| Host under test | Whatever Mike has open (Claude Code session, Cursor, or VSCode + Copilot — record per phase) |
| Python | system `python3` ≥ 3.11 (for `scripts/build-registry.py`, `scripts/validate.py`, and `tomllib` parses in pass criteria) |

### Required CLI dependencies

A YOLO run will halt on any missing dependency at first use. Install before A.0:

| Tool | Version | Used by | Install hint |
|---|---|---|---|
| `python3` | ≥ 3.11 (for `tomllib`) | A.0–A.7, B.1, D.1, multiple `[auto]` parses | system / pyenv |
| `git` | any modern | every clone, every rollback | system |
| `node` + `npx` | LTS | C.2 OpenAPI lint | nvm / system |
| `@redocly/cli` | latest via `npx` | C.2 (`npx @redocly/cli lint`) | invoked on demand |
| Mermaid renderer | `mmdc` (`@mermaid-js/mermaid-cli`) **or** any host with inline Mermaid preview | C.6 ERD parse, C.8.2 / C.8.3 / C.9.4 Mermaid `[auto]` checks, D.4 C4 diagram parse | `npm i -g @mermaid-js/mermaid-cli` |
| `jq` | ≥ 1.6 | several JSON shape `[auto]` checks (graph.json, copybook-record-graph.json, program-data-bindings.json) | `brew install jq` |
| `gh` | ≥ 2.0 | D.10 step 5 (simulated; live only against a real remote) | `brew install gh` |

### `{project-root}` path interpolation

`project.toml` paths use `{project-root}` interpolation, which expands relative to the directory containing the `project.toml` file. **`~` is not expanded** by the framework's path resolver — use absolute paths or `{project-root}/...` everywhere in `project.toml`. Shell commands in this plan use `~` because the operator is in zsh; that's fine.

### Time / disk budget (rough order-of-magnitude)

| Phase | Wall-clock (step-by-step) | Wall-clock (YOLO best case) | Disk |
|---|---|---|---|
| A (incl. A.8–A.10) | 40–55 min | 12 min | trivial |
| B | 45–60 min | 20 min | trivial |
| C (incl. mainframe + C.8.4 test-suite) | 6.5–11 hours | 3.5–5.5 hours | 1–3 GB (9 shallow clones) |
| D (greenfield SDLC) | 4–6 hours | 2–3 hours | < 100 MB |
| Q (quality stage) | 1.5–2.5 hours | 45–90 min | trivial |
| E (quick-dev) | 30–45 min | 15 min | trivial |
| **Total** | **~14–21 hours** across 2–3 sittings | **~7–11 hours** in one long sitting | ~3 GB peak |

Numbers are estimates — the plan has never been run end-to-end. Track actuals in `_docs/skills-test-results.md` and refine.

> **Sandbox layout invariant:** the framework folder, the application folder, and the KB folder are always **three sibling folders** in one multi-root workspace. We mirror that layout in `framework-tests/` so paths in `project.toml` resolve normally.

## 4. Reverse-engineering candidate repos (Next.js-anchored + mainframe sample)

Selected to exercise all 10 domain RE skills (7 modern-stack + 3 mainframe added in 1.3.0) with small-to-medium open-source codebases. The Next.js / React group keeps the modern KB internally coherent; the mainframe slice uses two real open-source repos (an IBM-authored sample for COBOL/copybook/JCL breadth + a small CICS+DB2 sample for the host-variable path).

| # | Domain | Skill | Candidate repo (URL) | Why |
|---|---|---|---|---|
| 1 | api | `reverse-engineer-api` | [`gothinkster/node-express-realworld-example-app`](https://github.com/gothinkster/node-express-realworld-example-app) | Small REST API with auth + CRUD. Standard reference. Optional alt: a Next.js `app/api/*` slice from candidate #3. |
| 2 | api-framework | `reverse-engineer-api-framework` | [`honojs/hono`](https://github.com/honojs/hono) | Modern, compact JS API framework. Pairs naturally with Next.js Edge runtime. |
| 3 | web-app | `reverse-engineer-web-app` | [`vercel/commerce`](https://github.com/vercel/commerce) | Canonical Next.js (App Router) example. Well-known, manageable size. |
| 4 | ui-framework | `reverse-engineer-ui-framework` | [`shadcn-ui/ui`](https://github.com/shadcn-ui/ui) | The dominant Next.js component library. Tests `peerDependencies` classification path. |
| 5 | database | `reverse-engineer-database` | [`documenso/documenso`](https://github.com/documenso/documenso) (Prisma schema only) | Real Prisma schema with migrations; we point the skill at `packages/prisma/`. |
| 6 | mobile-app | `reverse-engineer-mobile-app` | [`bluesky-social/social-app`](https://github.com/bluesky-social/social-app) | Active React Native + Expo app. |
| 7 | mobile-framework | `reverse-engineer-mobile-framework` | [`nativewind/nativewind`](https://github.com/nativewind/nativewind) | Small RN library with `peerDependencies` — exercises framework-vs-app distinction. |
| 8 | cobol-program | `reverse-engineer-cobol-program` | [`IBM/zopeneditor-sample`](https://github.com/IBM/zopeneditor-sample) — `COBOL/` dir (SAM1.cbl, SAM2.cbl, PSAM1.cbl); supplementary [`pratikdastw/hlasm_cics_cobol_sample`](https://github.com/pratikdastw/hlasm_cics_cobol_sample) (CUSTDB2.CBL, CUSTMAIN.CBL) | zopeneditor-sample exercises DIVISION-by-DIVISION extraction, CALL chain (SAM1→SAM2), and copybook resolution against COPYLIB / COPYLIB-MVS. The CICS+DB2 supplementary repo adds `EXEC SQL` + `EXEC CICS` host-variable inventory coverage that zopeneditor-sample lacks. Emits the `program-call-graph.mmd` + `program-data-bindings.json` lineage feed-files needed by C.9.4. |
| 9 | copybook-library | `reverse-engineer-copybook-library` | [`IBM/zopeneditor-sample`](https://github.com/IBM/zopeneditor-sample) — `COPYBOOK/` + `COPYLIB/` + `COPYLIB-MVS/` (CUSTCOPY.cpy, TRANREC.cpy, …) | Verifies REDEFINES variants (TRANREC) are preserved, OCCURS clauses (CUSTCOPY) are expanded into indexed positions, and the local-vs-MVS library duplication (`COPYLIB` ↔ `COPYLIB-MVS`) fires the divergent-layout detector. Emits `copybook-record-graph.json` + `data-dictionary.md` + `copybook-conflicts.md`. |
| 10 | jcl-job | `reverse-engineer-jcl-job` | [`IBM/zopeneditor-sample`](https://github.com/IBM/zopeneditor-sample) — `JCL/` + `JCLLIB/` + `JCLPROC/` (ALLOCATE.jcl, RUN.jcl, INCLUDE.jcl, RUNASAM1.jcl, COMPROC.jcl) | Verifies PROC expansion (COMPROC), `INCLUDE MEMBER=` resolution, DD inventory, and condition-code restart points. **Known coverage gap:** zopeneditor-sample has no GDG-roll example; that pass-criterion in C.8.3 is downgraded to "GDG-handling code path executes without error against jobs that have no GDGs." Emits `job-flow.mmd` + `dataset-io.json` lineage feed-files. |
| 11 | test-suite | `reverse-engineer-test-suite` | [`honojs/hono`](https://github.com/honojs/hono) — its `src/**/*.test.ts` + `runtime-tests/` (reuses the C.3 clone) | Cohesive Vitest suite spanning unit + multi-runtime integration tests. Exercises test-framework detection, suite-layout mapping, and the run/extend consumer docs. No 11th clone needed. |

Mirror choices (used only if a primary candidate is unavailable / too large): [`nestjs/nest`](https://github.com/nestjs/nest) (api-framework), [`makeplane/plane`](https://github.com/makeplane/plane) (web-app), [`mantinedev/mantine`](https://github.com/mantinedev/mantine) (ui-framework), [`expo/expo`](https://github.com/expo/expo) (mobile-framework). For the mainframe slice, mirror options are [`openmainframeproject/cobol-programming-course`](https://github.com/openmainframeproject/cobol-programming-course) (larger, course-oriented) or [`dscobol/Cobol-Projects`](https://github.com/dscobol/Cobol-Projects) (Hercules/MVS-flavoured, includes VSAM); the design point is breadth (cobol + copybook + JCL all present) not size.

Clones live under `~/Dev/framework-tests/oss-clones/<repo>`. We **shallow-clone** (`--depth 1`) to minimize disk and network use. The mainframe primary clone lives at `~/Dev/framework-tests/oss-clones/zopeneditor-sample/` (using its native `COBOL/`, `COPYBOOK/`, `COPYLIB/`, `COPYLIB-MVS/`, `JCL/`, `JCLLIB/`, `JCLPROC/` directory layout) and the supplementary CICS+DB2 clone at `~/Dev/framework-tests/oss-clones/hlasm-cics-cobol-sample/`. Both are committed upstream, so source-version stamps in Part A frontmatter resolve to upstream commits.

## 5. Forward-engineering scenario

A small, realistic Next.js app, designed so requirements / design / planning / execution all have nontrivial content but the project finishes inside one sitting:

> **The Recipes app.** A single-user Next.js 15 (App Router) recipe manager backed by Prisma + SQLite. Authenticated user can: create recipes, list and search recipes, mark favorites, attach a photo URL, tag recipes, view a public read-only share link. No real users, no production deploy.

We pick this scenario because:
- Three FRs minimum, one NFR (auth), one cross-cutting concern (photo URLs as external content).
- Forces a real data model (recipes, tags, favorites) — exercises design and planning.
- Decomposes naturally into 3–4 increments — exercises `execute-increments` and `manage-bugs`.
- Small enough to build but large enough that the KB has real content to update.

## 6. Quick-dev scenario

After Phase D ships the Recipes app, we add **"Add a `cookTime` field to recipes and surface it on the list view"** as the quick-dev change. Single migration, single component edit, single test — exactly the size `document-quick-change` is designed for.

## 7. Test-step format

Every step below uses this header:

```
### <Phase>.<N>  <skill-name>  —  <one-line intent>
**Trigger phrase:** the exact natural-language phrase to fire the skill in-host.
**Inputs:** what's on disk / in context before the skill runs.
**Expected outputs:** files / artifacts / handoff messages we should see.
**Pass criteria:** bulleted checklist Mike marks Pass / Fail / Partial.
**Rollback:** how to undo what the step wrote (so steps stay independent).
```

We pause for Mike's verdict at the end of each step (step-by-step mode); YOLO mode follows the §0 result-class rules.

---

## Phase A — Static integrity (no skill invocations)

### A.0  Ground-truth skill count  —  resolve `<SKILL_COUNT>` for the rest of the plan
**Trigger:**
```
SKILL_COUNT=$(find .agents/skills -name SKILL.md -type f | wc -l | tr -d ' ')
STAGE_COUNT=$(find .agents/skills -mindepth 1 -maxdepth 1 -type d ! -name _registry | wc -l | tr -d ' ')
echo "SKILL_COUNT=$SKILL_COUNT  STAGE_COUNT=$STAGE_COUNT"
```
**Inputs:** Working tree of `.agents/skills/`.
**Expected outputs:** Two integers exported as variables that downstream pass criteria reference. At time of authoring, `SKILL_COUNT=36` and `STAGE_COUNT=8`. **The expected values are not hard-coded** — they are whatever the working tree actually contains. The role of this step is to *establish ground truth*, not to assert a fixed number.

**Pass criteria:**
- [ ] [auto] Both commands exit 0 and produce non-empty integers.
- [ ] [auto] `SKILL_COUNT ≥ 30` and `STAGE_COUNT ≥ 6` (sanity floor — anything below this means the working tree is broken, not that the framework legitimately shrank).
- [ ] [user] Operator confirms the count is consistent with their expectation for the branch under test (catches an accidental mass-deletion or rogue half-merged branch).

**Rollback:** none — read-only.

> Throughout the rest of this plan, `<SKILL_COUNT>` and `<STAGE_COUNT>` refer to the values resolved here. Steps that previously hard-coded `36` / `8` reference the variable instead. If the variable cannot be resolved in your run environment (no shell), substitute the raw count from `find` by hand and proceed.

### A.1  Registry build  —  regenerate skills.csv + skills.json
**Trigger:** `python3 scripts/build-registry.py`
**Inputs:** Current `.agents/skills/**/SKILL.md` frontmatter.
**Expected outputs:** `.agents/skills/_registry/skills.csv` and `skills.json` written; row count equal to `<SKILL_COUNT>` from A.0; exit code 0; no warnings about missing frontmatter.

**Pass criteria:**
- [ ] [auto] Exit code 0
- [ ] [auto] CSV contains exactly `<SKILL_COUNT>` data rows (header excluded). Verify with `tail -n +2 .agents/skills/_registry/skills.csv | wc -l`.
- [ ] [auto] Diff vs the committed CSV is empty (or only the rebuild-timestamp line)
- [ ] [auto] All 4 new mainframe skills are present: `reverse-engineer-cobol-program`, `reverse-engineer-copybook-library`, `reverse-engineer-jcl-job`, `build-mainframe-data-lineage`
- [ ] [auto] `skills.json` parses (`python3 -c "import json; json.load(open('.agents/skills/_registry/skills.json'))"`)

**Rollback:** `git checkout -- .agents/skills/_registry/`.

### A.2  Validator  —  cross-references + workflow graph
**Trigger:** `python3 scripts/validate.py`
**Inputs:** Registry, `workflow-graph.yaml`, all SKILL.md frontmatter, all `templates/compositions/*.yaml`.
**Expected outputs:** Clean run — 0 errors and ≤ 3 pre-existing warnings (the empty-`requires-decision-from` notes on `templates/blocks/requirements/{completeness-tracker,index}.md` **and** `templates/blocks/quality/index.md` — the last added by the new quality stage; all three are legitimate index/tracking blocks). All 8 checks (A–H) report `(no findings)` or only the known noise.

The validator's checks of interest for this step:
- **Check A** (post-F-002): orphan-block detection counts both composition `blocks:` lists AND direct `templates/blocks/<slug>.md` references inside skill markdown. Should produce no orphan warnings.
- **Check D** (post-F-001): stale `phase` vocabulary check honours per-file `<!-- validate: allow-phase-vocab -->` pragmas. The 9 known migration-doc files carry the pragma; new files without it that introduce phase-vocab will be flagged.
- **Check H** (post-F-005): every `reverse-engineer-*/SKILL.md` cites both compositions by name AND contains the mandatory `## Output structure (mandatory)` section. New RE skills without these will be flagged.

**Pass criteria:**
- [ ] [auto] Exit code 0 (no hard errors)
- [ ] [auto] Exactly 0 Check D phase-vocab warnings (the 9 pragma-bearing files mask their own; new violations would surface here)
- [ ] [auto] Check A reports no orphan blocks (post-F-002 wider lookup) — note `templates/blocks/shared/affects-repos.md` is referenced by both greenfield-requirements-package and greenfield-design-package compositions, so it must NOT show as orphan.
- [ ] [auto] Check H reports no missing-sentinel or missing-composition findings (post-F-005)
- [ ] [auto] Total warnings ≤ 3, all on the known empty-`requires-decision-from` index/tracking blocks (`requirements/completeness-tracker`, `requirements/index`, `quality/index`)
- [ ] [auto] No unresolved skill references in workflow-graph (Check B)
- [ ] [auto] **Pragma debt observation** (not a fail criterion). Run `grep -rln "<!-- validate: allow-phase-vocab -->" .agents/skills/ templates/ _docs/` and append the file list to `_docs/skills-test-results.md` under a `Pragma debt — A.2` heading. The list is expected to contain ~9 files at the time of authoring; the goal is to *surface* this debt each test pass so it doesn't quietly grow. If the count exceeds 12, flag NEEDS-REVIEW so the operator can decide whether the new exemptions are legitimate or need follow-up issues.

**Rollback:** none — read-only.

### A.3  Self-documenting standard  —  every skill has the trio
**Inputs:** `.agents/skills/<stage>/<skill>/references/{OVERVIEW,INPUTS-OUTPUTS,EXAMPLE}.md`
**Expected outputs:** all three files present for every skill in the registry, and every `SKILL.md` ≤ 200 lines per the self-documenting standard.

**Trigger commands** (run from repo root):
```
# Trio coverage — each must equal <SKILL_COUNT>
find .agents/skills -path '*/references/OVERVIEW.md'       | wc -l
find .agents/skills -path '*/references/INPUTS-OUTPUTS.md' | wc -l
find .agents/skills -path '*/references/EXAMPLE.md'        | wc -l

# SKILL.md length — flag any > 200 lines
find .agents/skills -name SKILL.md -type f -exec awk 'END {if (NR > 200) print FILENAME ": " NR " lines"}' {} \;
```

**Pass criteria:**
- [ ] [auto] All three trio counts equal `<SKILL_COUNT>` from A.0. Any miss-match means a skill is missing one or more of the trio files.
- [ ] [auto] No `SKILL.md` exceeds 200 lines (the awk command above prints zero lines when the standard holds). If any file exceeds 200 lines, FAIL with the file list — the standard says SKILL.md links *out* to references, not in-lines them.
- [ ] [auto] No `SKILL.md` is empty (check with `find .agents/skills -name SKILL.md -type f -size 0`).

**Rollback:** none — read-only.

### A.4  Composition manifests resolve to existing blocks
**Trigger:** the validator already covers this; this step re-confirms by hand on one composition.
**Inputs:** `templates/compositions/greenfield-requirements-package.yaml`
**Expected outputs:** every block referenced exists under `templates/blocks/requirements/` (and the new `shared/affects-repos` reference resolves to `templates/blocks/shared/affects-repos.md`).
**Pass criteria:**
- [ ] [auto] All listed blocks resolve to a real file
- [ ] [auto] The optional `shared/affects-repos` block resolves and carries `optional: true` in the composition (the SoD-scaffold block is intentionally optional, fired only on cross-cutting features).
- [ ] [auto] **(new compositions on this branch)** `greenfield-quality-package.yaml`, `brownfield-quality-package.yaml`, `re-test-suite-internal.yaml`, and `re-test-suite-consumer.yaml` all resolve every block to a real file (spot-confirm by hand; the A.2 validator sweep is the authoritative global check).
**Rollback:** none.

### A.5  Acknowledgement sentinels  —  static grep for the ack restoration on this branch
**Trigger:** five commands over `.agents/skills/` and `templates/blocks/`:
```
# 1 — Verification-rule heading on each ack-bearing SKILL.md
grep -rl "## Verification rule (always-on)" .agents/skills/

# 2 — Acknowledgement checkpoint on every step file at the tail of each affected step
grep -rl "## Acknowledgement checkpoint" .agents/skills/

# 3 — AUTHORING-RULE block in the four iterative block templates
grep -rl "AUTHORING RULE — sub-section acknowledgement" templates/blocks/

# 4 — Section-relevance unconditional phrase in process.md AND step files
grep -rl "Section relevance check" .agents/skills/

# 5 — ABSENCE check: the deprecated conditional clause must NOT remain
grep -L "if relevance is in question" \
  .agents/skills/requirements/create-requirements-package/references/process.md \
  .agents/skills/design/create-design-package/references/process.md
```
**Inputs:** Read-only over the branch tree.
**Expected outputs (numerics re-pinned for `mm/AIDE-core-changes`; re-resolve if the branch evolves):**
- **Grep 1** returns exactly **8** SKILL.md files: `requirements/create-requirements-package`, `design/create-design-package`, `planning/create-implementation-package`, `execution/execute-increments`, and the **4 quality skills** that carry the verification rule — `quality/create-quality-package`, `quality/execute-quality-increments`, `quality/audit-quality-coverage`, `quality/review-test-failures`. (Was 4 before the quality stage landed.)
- **Grep 2** returns exactly **10** step files distributed across the ack-bearing skills' `steps/` directories — the 9 pre-quality files plus `quality/create-quality-package/steps/02b-test-case-increments.md`.
- **Grep 3** returns exactly **4** block templates: `templates/blocks/requirements/functional-requirements.md`, `templates/blocks/requirements/business-logic-rules.md`, `templates/blocks/design/api-design.md`, `templates/blocks/design/database-design.md`.
- **Grep 4** returns exactly **4** files: `requirements/.../references/process.md`, `requirements/.../steps/04-writing.md`, `design/.../references/process.md`, `design/.../steps/02-design.md` (the unconditional-relevance edit lives in BOTH process.md and the step that draws on it).
- **Grep 5** (`grep -L`) returns **both** named `process.md` files (i.e., neither contains the deprecated phrase). If either path is *omitted* from the output, the deprecated conditional survived the merge — FAIL.

**Pass criteria:**
- [ ] [auto] Grep 1 file count == 8 (4 SDLC create/execute + 4 quality skills; re-pin if the branch evolves)
- [ ] [auto] Grep 2 file count == 10 (re-pin if the branch evolves; this is brittle by design — surfacing drift is the point)
- [ ] [auto] Grep 3 file count == 4 (exact paths above)
- [ ] [auto] Grep 4 file count == 4 (process.md + step files in both stages)
- [ ] [auto] Grep 5 lists both target paths (i.e., the deprecated conditional clause is absent from both)
- [ ] [auto] No file carries the verbatim `## Verification rule (always-on)` heading more than once (catches accidental duplication during merge). Verify with `grep -c "## Verification rule (always-on)" <file>` returning 1 for each Grep-1 hit.
- [ ] [auto] The 4 block templates carry the `AUTHORING RULE` block **inside an HTML comment** (so it doesn't render in the assembled package). Confirm with `grep -B1 "AUTHORING RULE" templates/blocks/{requirements,design}/*.md` — the line above each match must contain `<!--`.

**Rollback:** none — read-only.

### A.6  SoD scaffold sentinels  —  static checks for the separation-of-duties scaffold (1.4.5, this branch)
**Trigger:** five greps + four file-existence checks:
```
# Step 0 prepended to the six SDLC skills
grep -l "Step 0 — Scope the requirements artifact" .agents/skills/requirements/create-requirements-package/steps/00-scope-target-repo.md
grep -l "Step 0 — Scope the design artifact"        .agents/skills/design/create-design-package/steps/00-scope-target-repo.md
grep -l "Step 0 — Scope the target source repo"     .agents/skills/planning/create-implementation-package/steps/scope-target-repo.md
grep -l "Step 0 — Scope the target source repo"     .agents/skills/execution/execute-increments/steps/00-scope-target-repo.md
grep -l "Step 0 — Scope the target repo (SoD only)" .agents/skills/quality/create-quality-package/steps/00-scope-target-repo.md
grep -l "Step 0 — Locate the upstream artifact (SoD only)" .agents/skills/requirements/review-requirements-package/SKILL.md
grep -l "Step 0 — Locate the upstream artifact (SoD only)" .agents/skills/design/review-design-package/SKILL.md
grep -l "Step 0 — Locate the upstream artifact (SoD only)" .agents/skills/quality/review-quality-package/SKILL.md

# Shared affects-repos block + its frontmatter contract
test -f templates/blocks/shared/affects-repos.md && grep -E "^slug: affects-repos|^applies-to:|^optional: true" templates/blocks/shared/affects-repos.md

# Composition wiring (now 4 compositions: requirements + design + both quality)
grep -A1 "shared/affects-repos" templates/compositions/greenfield-requirements-package.yaml
grep -A1 "shared/affects-repos" templates/compositions/greenfield-design-package.yaml
grep -A1 "shared/affects-repos" templates/compositions/greenfield-quality-package.yaml
grep -A1 "shared/affects-repos" templates/compositions/brownfield-quality-package.yaml

# SCHEMAS.md SoD section
grep -E "(Separation-of-duties \(SoD\) fields|colocate_with_source|write_role|artifact_subdir)" config/SCHEMAS.md

# Example files demonstrate SoD config
grep -l "stages\.requirements\.dir\|colocate_with_source\|write_role" config/project.toml.example
grep -l "\[user\]" config/project.user.toml.example
```
**Inputs:** Read-only over the branch tree.
**Expected outputs:** Every grep / file-existence above resolves to a hit (no empty result and no exit-1).

**Verifier — `order: 0.5` placement (programmatic, replaces the prose "after `header` block, before discovery blocks"):**
```
python3 - <<'PY'
import yaml, sys
def order_of(comp_path, slug):
    with open(comp_path) as f:
        data = yaml.safe_load(f)
    for b in data.get("blocks", []):
        if b.get("slug") == slug:
            return b.get("order"), b.get("optional")
    return None, None
for comp in [
    "templates/compositions/greenfield-requirements-package.yaml",
    "templates/compositions/greenfield-design-package.yaml",
]:
    o, opt = order_of(comp, "shared/affects-repos")
    print(f"{comp}: order={o}, optional={opt}")
PY
```
Expected output (at authoring time):
```
templates/compositions/greenfield-requirements-package.yaml: order=0.5, optional=True
templates/compositions/greenfield-design-package.yaml: order=0.5, optional=True
```

**Layout reality** (so the test assertions match the file, not a fictional schema):
- In **greenfield-requirements-package.yaml** the predecessor at `order: 0` is `requirements/index`; the successor at `order: 1` is `requirements/executive-summary-business-context`. So `affects-repos` (`order: 0.5`) sits between the requirements index and the first content block.
- In **greenfield-design-package.yaml** there is **no `order: 0` block** — `shared/affects-repos` (`order: 0.5`) is the *first* block in the composition; `shared/overview` (`order: 1`) is the immediate successor. The `0.5` value is preserved for symmetry with requirements (and to reserve the slot for a future `design/index` if one is added).

**Step-0 file-naming inconsistency** (flagged here, not silently accepted):

The six SDLC skills implement Step 0 in *three* different shapes:
- `requirements/create-requirements-package/steps/00-scope-target-repo.md` (numeric prefix)
- `design/create-design-package/steps/00-scope-target-repo.md` (numeric prefix)
- `execution/execute-increments/steps/00-scope-target-repo.md` (numeric prefix)
- `planning/create-implementation-package/steps/scope-target-repo.md` ← **no numeric prefix** (this skill's `steps/` directory uses descriptive names rather than numeric ordering throughout)
- `requirements/review-requirements-package/SKILL.md` (heading inside SKILL.md, not a step file)
- `design/review-design-package/SKILL.md` (heading inside SKILL.md, not a step file)

The triple shape is *not* a defect to fix in this test pass — it reflects three different upstream conventions (numeric-prefixed steps in requirements/design/execution, descriptive-named steps in planning, no separate `steps/` for review skills). It IS something an operator should be aware of so the A.6 grep commands aren't mysterious. If the team later decides to unify, it's a refactor for a separate branch.

**Pass criteria:**
- [ ] [auto] All **8** SoD-aware skills carry the Step 0 — verify by running every `grep -l` from the trigger block above and confirming each returns its target path. The set is: 5 create/execute skills with a scope-target-repo step (`create-requirements-package`, `create-design-package`, `create-implementation-package` [descriptive-named `steps/scope-target-repo.md`], `execute-increments`, `create-quality-package`) + 3 review skills with the `## Step 0 — Locate the upstream artifact (SoD only)` heading inside `SKILL.md` (`review-requirements-package`, `review-design-package`, `review-quality-package`). Three shapes are accepted per the inconsistency note above.
- [ ] [auto] `templates/blocks/shared/affects-repos.md` exists and declares `slug: affects-repos`, `optional: true`.
- [ ] [auto] The Python verifier above (extended to all 4 compositions) prints `order=0.5, optional=True` for `greenfield-requirements-package`, `greenfield-design-package`, `greenfield-quality-package`, and `brownfield-quality-package`.
- [ ] [user] **(drift observation, not a hard gate)** `affects-repos.md`'s `applies-to:` frontmatter lists only `[greenfield-requirements-package, greenfield-design-package]`, but the block is now wired into **4** compositions (both quality packages added it). Record this `applies-to`-vs-wiring discrepancy in the results ledger as a follow-up for the framework maintainer; do NOT fail A.6 on it (the block still resolves and renders correctly in all 4).
- [ ] [auto] `config/SCHEMAS.md` contains a `Separation-of-duties (SoD) fields` heading; the `[stages.<stage>]` table lists all four SoD columns (`dir`, `colocate_with_source`, `write_role`, `output`); `[project].artifact_subdir` row is present; `[user].role` row is present.
- [ ] [auto] `config/SCHEMAS.md` contains the SoD validation rules numbered 7–12 (one mode per stage; `dir` exclusive of `colocate_with_source`; `write_role` enum; `[project].artifact_subdir` is a bare relative path; cross-cutting artifact frontmatter `affects_repos` validation).
- [ ] [auto] `config/SCHEMAS.md` § 5 documents the dir-mode AND colocate-mode layout geometries (both subsections present); the dir-mode subsection mentions the `_cross-cutting/` directory; the colocate-mode subsection notes that no `_cross-cutting/` directory exists in colocate mode.
- [ ] [auto] `config/project.toml.example` demonstrates at least one SoD-mode `[stages.<stage>]` block (with `dir` or `colocate_with_source`); `config/project.user.toml.example` demonstrates `[user].role`.
- [ ] [user] The Step 0 files for create-requirements / create-design / create-implementation / execute-increments each declare an explicit "no-op when stage is in legacy mode" early-out clause — operator confirms this is the leading paragraph (NOT buried later) so legacy-mode invocations don't accidentally trip the SoD path.

**Rollback:** none — read-only.

### A.7  SoD validation rule negatives  —  feed the validator deliberately broken `project.toml` fixtures
**Trigger:** craft six tiny TOML fixtures under `scripts/test_fixtures/sod-negatives/` (one per validation rule 7–12 in `config/SCHEMAS.md`), then point `scripts/validate.py` at each via `--project-toml`. **The validator must REJECT each fixture** with the rule-specific error message.

**Inputs:** the six fixtures below (create them as part of this step; rollback deletes the directory):

| # | Fixture | Rule violated | Expected validator message contains |
|---|---|---|---|
| 7 | `both-modes-set.toml` — sets BOTH `[stages.requirements].dir` and `[stages.requirements].colocate_with_source` | Rule 7: `dir` and `colocate_with_source` are mutually exclusive per stage | `mutually exclusive` or `dir.*colocate` |
| 8 | `unknown-write-role.toml` — `[stages.requirements].write_role = "Wizard"` | Rule 8: `write_role` enum (`BA`, `Architect`, `Dev`, `Tester`, `Any`) | `unknown role` or `enum` |
| 9 | `role-mismatch.toml` — `[stages.requirements].write_role = "Architect"` + `[user].role = "BA"` | Rule 9: `[user].role` must satisfy `write_role` for the active stage | `permission` or `role mismatch` |
| 10 | `absolute-artifact-subdir.toml` — `[project].artifact_subdir = "/tmp/output"` | Rule 10: `[project].artifact_subdir` must be a bare relative path | `must be relative` or `bare path` |
| 11 | `cross-cutting-empty-affects.toml` — a fixture artifact under `_cross-cutting/` whose YAML frontmatter has `affects_repos: []` | Rule 11: cross-cutting artifacts MUST list ≥ 1 repo in `affects_repos` | `affects_repos` AND (`empty` or `≥ 1`) |
| 12 | `cross-cutting-unknown-repo.toml` — `affects_repos: [recipes-web, ghost-repo]` where `ghost-repo` is not declared in `[[project.repos]]` | Rule 12: `affects_repos` entries must resolve to declared repo codes | `unknown repo` or `not declared` |

**Pass criteria:**
- [ ] [auto] Each of the 6 invocations exits **non-zero** (validator must reject). A zero-exit on any fixture is a FAIL — the rule is missing or unenforced.
- [ ] [auto] Each error message contains the substring noted in the table (use `grep -i` against captured stderr). If the validator rejects but the message is unrelated, that's also a FAIL — the right rule must fire for the right reason.
- [ ] [user] Operator confirms the validator's error message would be actionable for someone seeing it for the first time (no opaque internal exception traces).

> **Note: this step depends on the validator actually implementing rules 7–12.** If `scripts/validate.py` doesn't currently enforce them (only `config/SCHEMAS.md` documents them), this step will FAIL as written — and that's the *correct* signal: the rules exist on paper but not in code. Capture the FAIL with a note, then file a follow-up issue. Don't paper over this by downgrading to `[user]`.

**Rollback:** `rm -rf scripts/test_fixtures/sod-negatives/`. (Note: the fixtures are now regression-test data for `scripts/test_validate.py` and live as committed test artifacts; in practice you don't roll them back — you only roll back transient working-tree edits to them. Listed here for shape-symmetry with the other A.* steps.)

### A.8  Source-adapter convention  —  static checks for the optional source-adapter seam (new)
**Trigger:** file-existence + greps over the convention spec and its two consuming skills:
```
# 1 — the convention spec exists
test -f references/orientation/source-adapters.md

# 2 — the spec documents the three-way resolution (unset / discoverable / not-discoverable)
grep -Ei "unset|discoverable|not (installed|discoverable)|fall back" references/orientation/source-adapters.md

# 3 — document-quick-change reads `requirements_source`
grep -n "requirements_source" .agents/skills/quick-dev/document-quick-change/SKILL.md

# 4 — create-requirements-package reads `discovery_source`
grep -n "discovery_source" .agents/skills/requirements/create-requirements-package/SKILL.md

# 5 — the .example customizations demonstrate the keys
grep -n "requirements_source" config/customizations/document-quick-change.toml.example
grep -n "discovery_source"    config/customizations/create-requirements-package.toml.example
```
**Inputs:** Read-only over the branch tree.
**Expected outputs:** Every check resolves to a hit.

**Pass criteria:**
- [ ] [auto] `references/orientation/source-adapters.md` exists and its body covers all three resolution states (unset → normal elicitation; set + discoverable → hand off by name to the adapter, which writes a structured package to disk cache the consuming skill then folds into intake; set but not discoverable → surface the gap + name the add-on + offer manual elicitation, never silent skip / hard fail).
- [ ] [auto] `document-quick-change/SKILL.md` references `requirements_source`; `create-requirements-package/SKILL.md` references `discovery_source`.
- [ ] [auto] Both `.example` customization files demonstrate their respective key (commented is acceptable — the point is the key is discoverable to a user).
- [ ] [user] The spec makes clear the adapter **seeds** intake and does **not** replace gates (brownfield discovery still runs Step 1 + `review-requirements-package`; quick-dev still runs the clarity gate).

**Rollback:** none — read-only.

### A.9  Add-on registry manifest + `extra_skill_roots`  —  static + dynamic (new)
**Trigger:** static greps over `config/SCHEMAS.md` + a dynamic build-registry run against a throwaway add-on.
```
# Static: SCHEMAS.md documents the add-on surfaces
grep -n "extra_skill_roots" config/SCHEMAS.md
grep -nE "2\.6 The \`\[tools\.<name>\]\` table|2\.7 The add-on manifest — \`aide-addon.toml\`" config/SCHEMAS.md
grep -n "aide-addon.toml" config/SCHEMAS.md
grep -n "origin" config/SCHEMAS.md

# build-registry.py supports the flag
python3 scripts/build-registry.py --help 2>&1 | grep -- "--extra-skill-root" || grep -n "extra-skill-root\|extra_skill_root" scripts/build-registry.py
```
**Dynamic sub-step (throwaway add-on, then roll back):**
```
# NOTE: discovery requires the nested `<stage>/<skill>/SKILL.md` layout (≥3 path
# parts under .agents/skills). A skill placed directly at skills/<skill>/SKILL.md
# is silently skipped — so the throwaway add-on carries a stage dir (`addon-stage/`).
TMP=$(mktemp -d)
mkdir -p "$TMP/.agents/skills/addon-stage/addon-demo/references"
cat > "$TMP/aide-addon.toml" <<'TOML'
[addon]
name = "demo-addon"
description = "Throwaway add-on for A.9"
provides_skills = ["addon-demo"]
TOML
cat > "$TMP/.agents/skills/addon-stage/addon-demo/SKILL.md" <<'MD'
---
name: addon-demo
description: "Use when the operator is exercising the A.9 add-on registry test — a throwaway skill that proves extra_skill_roots origin tagging works as intended in this scenario."
---
# addon-demo
Throwaway skill for the A.9 dynamic check.
MD
# copy the trio so the skill is registry-legal
for f in OVERVIEW INPUTS-OUTPUTS EXAMPLE; do echo "# $f" > "$TMP/.agents/skills/addon-stage/addon-demo/references/$f.md"; done

# dry-run so we don't mutate the committed registry
python3 scripts/build-registry.py --extra-skill-root "$TMP" --dry-run --verbose 2>&1 | grep -i "addon-demo\|demo-addon\|skills found"
rm -rf "$TMP"
```
**Inputs:** Read-only over the branch tree + a throwaway temp dir.
**Expected outputs:** SCHEMAS.md documents all four surfaces; `build-registry.py` accepts `--extra-skill-root`; the dry-run surfaces `addon-demo` tagged with origin `demo-addon` (from the manifest's `[addon].name`), while core skills remain `origin = "core"`.

**Pass criteria:**
- [ ] [auto] `config/SCHEMAS.md` documents `extra_skill_roots` (array of path), the `[tools.<name>]` table (§2.6), the `aide-addon.toml` manifest (§2.7), and the `origin` tagging rule (core skills = `origin = "core"`).
- [ ] [auto] `scripts/build-registry.py` accepts `--extra-skill-root` (help text or source reference).
- [ ] [auto] The dry-run with `--extra-skill-root <tmp>` includes the throwaway `addon-demo` skill and tags it with origin `demo-addon` (from the manifest), NOT `core`.
- [ ] [auto] The dry-run does **not** mutate the committed `skills.csv` / `skills.json` (`git diff --quiet .agents/skills/_registry/` after the run).
- [ ] [user] Operator confirms a real add-on repo would be discoverable this way (no core edits required to register an add-on skill).

**Rollback:** `rm -rf "$TMP"` (done inline); `git checkout -- .agents/skills/_registry/` if the dry-run guard was bypassed.

### A.10  `{workspace}` token + `[tools.*]` layer guardrail  —  static (new)
**Trigger:** greps over `config/SCHEMAS.md` and the `.example` config files.
```
# {workspace} token documented
grep -n "{workspace}" config/SCHEMAS.md
# [tools.*] is project-layer only — framework.* cannot override it.
# (The text is "**cannot** override `[tools.*]` — ... project-layer concern only", so
#  match on "project-layer concern", not the markdown-bolded "cannot override".)
grep -niE "project-layer concern|override .*\[tools" config/SCHEMAS.md
# install_root uses the {workspace} token in the documented default
grep -n "install_root" config/SCHEMAS.md
```
**Inputs:** Read-only.
**Expected outputs:** `{workspace}` documented as the common parent of workspace roots (fallback: parent of `{framework-root}`); `[tools.*]` documented as project-layer-only (framework layer cannot override); `install_root` default references `{workspace}`.

**Pass criteria:**
- [ ] [auto] `config/SCHEMAS.md` documents the `{workspace}` token semantics (common parent of the multi-root workspace; fallback to parent of `{framework-root}`).
- [ ] [auto] `config/SCHEMAS.md` states that `[tools.*]` is a project-layer concern and `framework.*` **cannot** override it.
- [ ] [user] **(dynamic guardrail — best-effort)** If `scripts/validate.py` enforces the "framework layer must not set `[tools.*]`" rule, add a negative fixture (a `framework.toml` with a `[tools.demo]` block) and confirm the validator rejects it. If the validator does not yet enforce this, record NEEDS-REVIEW with a follow-up issue ("layer guardrail documented but not enforced") rather than fabricating a pass.

**Rollback:** delete any negative fixture created for the dynamic guardrail.

> **End of Phase A — run the §11 teardown checklist** (status sweep + Phase-A-specific rollbacks) before moving to Phase B.

---

## Phase B — Meta skills (`/start-project`, `/framework-navigator`, `/customize-framework`, `/scaffold-documentation`, `/shard-document`, `/track-change`, `/verify-source`)

Sandbox prep (one-time before B.1):
```
mkdir -p ~/Dev/framework-tests/recipes-app
cd       ~/Dev/framework-tests/recipes-app
git init -q
```

### B.1  start-project  —  greenfield bootstrap
**Trigger phrase:** "I want to start the framework on a new greenfield project here."
**Inputs:** Empty `~/Dev/framework-tests/recipes-app/`.
**Expected outputs:**
- `project.toml` written, with `[project] name`, `code`, `domain`, `[project.paths] knowledge_base_path = "../recipes-kb"`.
- `default_flow = "greenfield"`.
- Handoff message names `create-requirements-package` as the next skill.
**Pass criteria:**
- [ ] [auto] `project.toml` parses with `python3 -c "import tomllib; tomllib.loads(open('project.toml').read())"`
- [ ] [user] All 6 elicitation phases ran one at a time (not bundled)
- [ ] [user] Handoff phrase is unambiguous
**Rollback:** `rm project.toml project.user.toml 2>/dev/null`.

### B.2  framework-navigator  —  goal mode
**Trigger phrase:** "I have a Next.js app I'd like to reverse-engineer into the KB. What should I run?"
**Inputs:** No `project.toml` in CWD (run from `~/Dev/framework-tests/`).
**Expected outputs:** Recommendation = `start-project` (because no `project.toml` yet) or, if invoked from `recipes-app/` after B.1, `analyze-repository`.
**Pass criteria:**
- [ ] [auto] Recommendation is a single named skill
- [ ] [auto] Trigger phrase to invoke it is provided verbatim
- [ ] [user] No work is performed by the navigator itself
**Rollback:** none.

### B.3  framework-navigator  —  catalog mode
**Trigger phrase:** "Show me all the skills."
**Expected outputs:** Stage-grouped markdown table with one-line descriptions, listing every skill in the registry.

> The navigator's `SKILL.md` declares **no side effects** — it never writes a structured artifact, only emits markdown into the host chat. The criteria below are operator-judgment checks against that chat output. If you want machine-checkable shape assertions on the registry itself, those live in A.1 (row count) and A.0 (`<SKILL_COUNT>`).

**Pass criteria:**
- [ ] [user] All `<STAGE_COUNT>` stages are represented in the rendered table.
- [ ] [user] All `<SKILL_COUNT>` skills are listed across the stage groups (no duplicates, no omissions). Operator may cross-reference against `.agents/skills/_registry/skills.csv` to count.
- [ ] [user] The `reverse-engineering` stage section lists the 3 mainframe RE skills by exact name: `reverse-engineer-cobol-program`, `reverse-engineer-copybook-library`, `reverse-engineer-jcl-job`.
- [ ] [user] The `knowledge-base` stage section lists `build-mainframe-data-lineage`.

**Rollback:** none.

### B.4  customize-framework  —  scalar override
**Trigger phrase:** "For this project I want `default_flow` to be `brownfield`."
**Inputs:** `project.toml` from B.1.
**Expected outputs:** edit applied via the customize-framework workflow (not a hand-edit by the user) into the right config layer (`project.toml`).
**Pass criteria:**
- [ ] [auto] Skill identifies the right config layer (`project.toml`, not `framework.user.toml`)
- [ ] [auto] Override visible in the file
- [ ] [user] No unrelated lines touched (the override line itself may also gain the SKILL.md-mandated inline rationale comment — that is part of the override, not collateral damage; per F-003 fix)
**Rollback:** flip the value back manually.

### B.5  scaffold-documentation  —  set up RE doc skeleton
**Trigger phrase:** "Scaffold the docs structure for a brownfield reverse-engineering of `vercel/commerce`."
**Inputs:** `project.toml` (B.4 state).
**Expected outputs:** Empty doc tree with placeholders matching the RE composition. **Path note:** `scaffold-documentation/SKILL.md` writes Part A per the RE skill's own scheme — `<target>/docs/<re-domain>-internal/` (e.g. `web-app-internal/`) and Part B under `<knowledge_base_path>/source-docs/<repo-slug>/<re-domain>-consumer/`. The exact root may be nested under a per-repo folder (e.g. `docs/reverse-engineering/vercel-commerce/web-app-internal/`); assert the composition-shaped subtree exists, not a specific hard-coded root.
**Pass criteria:**
- [ ] [auto] Folder tree matches the composition (the `<re-domain>-internal/` + `<re-domain>-consumer/` subtrees exist with one placeholder per non-gated block)
- [ ] [auto] No content authored yet (structure only)
**Rollback:** `rm -rf docs/reverse-engineering docs/*-internal` (and the scaffolded Part-B subtree under the KB).

### B.6  shard-document  —  split a fat markdown file
**Setup:** Create a 400-line markdown file `docs/SAMPLE.md` with multiple H2 sections.
**Trigger phrase:** "Shard `docs/SAMPLE.md` at H2 boundaries."
**Expected outputs:** `docs/sample/<section-slug>.md` per H2; original file resolved (deleted, replaced with index, or left — skill should ask).
**Pass criteria:**
- [ ] [auto] One file per H2
- [ ] [auto] Section bodies preserved intact
- [ ] [user] Original file resolution explicit (not silent)
**Rollback:** `rm -rf docs/sample docs/SAMPLE.md` (the sandbox is `git init`-only with no commit, so `git checkout -- docs/` has no baseline to restore to — use `rm`, or seed an initial commit in the prep block if you prefer `git checkout`).

### B.7  track-change  —  log an edit to the change tracker
**Trigger phrase:** "Log this scaffold work into the change tracker."
**Expected outputs:** `CHANGE-TRACKER.md` initialised at the right path with one entry.
**Pass criteria:**
- [ ] [auto] Entry has Parts Affected, source-version, verification status
- [ ] [auto] Format matches the `templates/blocks/shared/change-log.md` block (the canonical change-tracker block the skill uses)
**Rollback:** `git checkout -- CHANGE-TRACKER.md` (or delete).

### B.8  verify-source  —  audit one assembled artifact
**Setup:** Use the scaffolded RE structure from B.5 + a one-paragraph stub Part A doc with one fabricated claim.
**Trigger phrase:** "Verify this Part A doc against source."
**Expected outputs:** Findings split into completeness / accuracy / consistency / change-tracking.
**Pass criteria:**
- [ ] [user] Fabricated claim flagged
- [ ] [user] No false positives on the verifiable claim
**Rollback:** delete stub.

> **End of Phase B — run the §11 teardown checklist** (status sweep + Phase-B-specific rollbacks) before moving to Phase C.

---

## Phase C — Brownfield: RE + Knowledge Base

Sandbox prep (one-time before C.1):
```
mkdir -p ~/Dev/framework-tests/oss-clones
mkdir -p ~/Dev/framework-tests/recipes-kb
```

Then shallow-clone the 7 modern candidate repos under `oss-clones/` (we'll do this on demand, one repo at a time, to keep disk use bounded — `--depth 1` and `git gc` after). The two mainframe samples are cloned in **C.8.0** (just before the mainframe RE steps).

> **Note on running RE skills inside Claude Code:** the framework declares Claude Code "currently not supported" in `README.md`. We exercise the skills here by treating the assistant as the agent and reading each `SKILL.md` + `steps/*` as the playbook — exactly what a Cursor / Copilot agent would do. If a step relies on `/`-discovery in the host (e.g., elicitation prompts), we simulate it inline.

### Universal Phase-C pass criteria (post-F-005)

These criteria apply to **every** `reverse-engineer-*` invocation in C.2–C.8 and C.8.1–C.8.3. They reflect the post-F-005 framework state where each RE skill's `SKILL.md` carries a mandatory `## Output structure (mandatory)` section binding output to the composition's block list.

For every C.2–C.8 / C.8.1–C.8.3 step, the per-skill pass criteria below must be checked **in addition to** these universal criteria:

- [ ] [auto] **Part A** rendered as a tree under `<source-repo-path>/docs/<re-domain>-internal/`, **not** consolidated into a single `.md`.
- [ ] [auto] **Part B** rendered as a tree under `<knowledge_base_path>/source-docs/<repo-slug>/<re-domain>-consumer/`, also tree-shaped.
- [ ] [auto] **File naming follows `<NN>-<bare-slug>.md`** — `<NN>` is the 1-based zero-padded sort index after sorting blocks by their `order` value; `<bare-slug>` is the block slug with the `reverse-eng/<re-domain>/internal/` (or `…/consumer/`) prefix stripped.
- [ ] [auto] **Gated-out blocks are absent** from disk (no empty placeholder file). A block whose `decision-gates: include-if:` evaluates false is omitted entirely.
- [ ] [auto] **No ad-hoc deep-dive files** outside the `<NN>-<bare-slug>.md` scheme. The composition's block list is canonical.
- [ ] [user] **Subset rule for Part B** preserved — every Part B claim traces back to a fact in Part A; Part B is internal-detail-free.
- [ ] [auto] **Supplementary artifacts** (e.g., `openapi.yaml` for API; `data-dictionary.md` + `erd.mmd` for database; `program-call-graph.mmd` + `program-data-bindings.json` for cobol-program; etc.) live at the **Part-B directory root** alongside the consumer/ tree, not inside it.
- [ ] [auto] **Source repo is a shallow clone** — verify with `git -C <oss-clones>/<repo> rev-parse --is-shallow-repository` returning `true`. The plan's disk budget assumes shallow clones; a full clone may pass everything else but blows past the 3 GB total.

Validator Check H enforces the SKILL.md side; the on-disk shape of the produced artifacts is the operator's adjudication during the test pass.

### C.0  customize-framework (second invocation)  —  populate `[[project.repos]]` for KB build
**Trigger phrase:** "Add the seven brownfield clone repos to `recipes-app/project.toml` as `[[project.repos]]` entries."

> **This is a second invocation of `customize-framework`** (B.4 was the first). Listed in the coverage matrix as such. Mandatory before **C.9** — `build-knowledge-base/steps/01-validate-target.md` halts with a copyable error if `[[project.repos]]` is empty (the post-F-006 fail-loud guard). Without these entries the brownfield flow doesn't reach the KB stage.

**Inputs:** `recipes-app/project.toml` (existing, from B.1 + B.4); the 7 clones already populated under `~/Dev/framework-tests/oss-clones/` from C.1.

**Expected outputs:** Seven `[[project.repos]]` blocks appended to `project.toml`. Use `customize-framework` (in scope = `project-team`) — do not hand-edit, since one of the things this step verifies is that `customize-framework` can author array-of-table TOML correctly.

```toml
[[project.repos]]
code    = "realworld-api"
name    = "RealWorld Node Express API"
path    = "{project-root}/../oss-clones/realworld-api"
role    = "api"

[[project.repos]]
code = "hono"
name = "Hono — multi-runtime API framework"
path = "{project-root}/../oss-clones/hono"
role = "api-framework"

[[project.repos]]
code = "commerce"
name = "vercel/commerce — Next.js storefront"
path = "{project-root}/../oss-clones/commerce"
role = "web-app"

[[project.repos]]
code = "shadcn-ui"
name = "shadcn/ui — UI component scaffold"
path = "{project-root}/../oss-clones/shadcn-ui"
role = "ui-framework"

[[project.repos]]
code = "documenso"
name = "Documenso — Prisma schema only"
path = "{project-root}/../oss-clones/documenso"
role = "database"

[[project.repos]]
code = "bluesky-social"
name = "Bluesky social-app — RN+Expo client"
path = "{project-root}/../oss-clones/bluesky-social"
role = "mobile-app"

[[project.repos]]
code = "nativewind"
name = "NativeWind — Tailwind for React Native"
path = "{project-root}/../oss-clones/nativewind"
role = "mobile-framework"
```

**Pass criteria:**
- [ ] [auto] `project.toml` parses (`python3 -c "import tomllib; tomllib.loads(open('project.toml','rb').read())"` exits 0).
- [ ] [auto] `[[project.repos]]` array contains exactly 7 entries with the codes above.
- [ ] [auto] Every `path` value resolves through `{project-root}` interpolation to an existing directory. Verify in shell: ``for p in $(python3 -c "import tomllib;d=tomllib.load(open('project.toml','rb'));print('\n'.join(r['path'] for r in d['project']['repos']))"); do test -d "${p/\{project-root\}/$(pwd)}" || echo MISSING:$p; done``.
- [ ] [user] No unrelated lines touched (only the array was appended).

**Rollback:** `git -C ~/Dev/framework-tests/recipes-app checkout -- project.toml`.

### C.1  analyze-repository  —  classify all 7 modern candidate repos
**Trigger phrase per repo:** "What kind of project is at `~/Dev/framework-tests/oss-clones/<repo>`? Which RE skill should I run?" (substitute the actual full path per repo — pin the path, don't leave it as `<repo>` in the live invocation).

**Inputs:** A shallow clone (`--depth 1`) of each candidate at `~/Dev/framework-tests/oss-clones/<repo>/`. **Pre-step**: run `for r in realworld-api hono commerce shadcn-ui documenso bluesky-social nativewind; do git -C ~/Dev/framework-tests/oss-clones/$r rev-parse --is-shallow-repository | grep -q true || echo "NOT SHALLOW: $r"; done` and confirm zero `NOT SHALLOW` lines before proceeding. A full clone of any of these repos blows past the 3 GB plan-wide disk budget.

**Expected outputs:** For each repo a structured classification (type, language, stack, recommended skill, monorepo handling). For monorepos (e.g., `shadcn-ui/ui`) sub-projects classified independently. **`shadcn-ui/ui` clarifying note**: it is *not* a monorepo in the package-manager sense — it's a single ui-framework repo with examples. If the dispatcher classifies it as a monorepo, that's an over-trigger; if it classifies it as a single ui-framework repo, the "monorepo cases produce ordered skill list" criterion is *vacuously satisfied* (no monorepo, no ordered list needed). Don't fail the criterion just because the repo isn't actually a monorepo.

**Pass criteria:**
- [ ] [auto] All 7 source repos verified as shallow clones (pre-step grep above produces no output).
- [ ] [auto] 7 repos × 1 classification each = 7 verdicts emitted.
- [ ] [auto] Each verdict ends with the exact next-skill trigger phrase, pinned to a full path under `~/Dev/framework-tests/oss-clones/<repo>/`.
- [ ] [auto] If any repo is classified as a monorepo, that verdict produces an ordered skill list (one entry per sub-project). If no repo is classified as a monorepo, this criterion is vacuously satisfied.
- [ ] [user] No misclassifications (you adjudicate).
**Rollback:** none.

### C.1m  analyze-repository  —  classify the mainframe sample (1.3.0 dispatcher extension)
**Trigger phrase:** "What kind of project is `~/Dev/framework-tests/oss-clones/zopeneditor-sample`? Which RE skill should I run?"
**Inputs:** Cloned `IBM/zopeneditor-sample` at `~/Dev/framework-tests/oss-clones/zopeneditor-sample/` with the upstream layout (`COBOL/`, `COPYBOOK/`, `COPYLIB/`, `COPYLIB-MVS/`, `JCL/`, `JCLLIB/`, `JCLPROC/`, plus PLI / ASM / REXX peer dirs which the dispatcher should treat as additional sub-classifications).
**Expected outputs:** Classification verdict that recognises mainframe content (post-1.3.0 1c′ extension-density step) and emits **two distinct handoffs**:
1. An **RE-stage chain**: `reverse-engineer-copybook-library` → `reverse-engineer-cobol-program` → `reverse-engineer-jcl-job` (the dispatcher's job ends here — it points at RE skills only, not KB skills).
2. A **KB-stage successor note**: "after the three RE skills above complete, run `build-mainframe-data-lineage` against this repo's outputs in the KB stage." The dispatcher *announces* this successor for operator clarity but does not include it in the ordered RE list — `build-mainframe-data-lineage` is a knowledge-base stage skill, not an RE skill, and the dispatcher's contract is bounded to the RE stage.

**Pass criteria:**
- [ ] [auto] Detection signals fire correctly: `.cbl/.cob/.cpy/.pli/.jcl/.proc/.bms/.dbd/.psb` extension census, `IDENTIFICATION DIVISION.` source-line marker, `EXEC CICS/SQL/DLI` markers (absent in zopeneditor-sample — should be reported as zero, not as a missing-detector failure), `JOB`/`STEP`/`SYSIN` JCL markers.
- [ ] [auto] At least three mainframe sub-classifications produced (one each for the COBOL, copybook, and JCL slices). PLI / ASM / REXX dirs may be reported as out-of-scope or routed to "no skill available".
- [ ] [auto] The **RE-stage ordered list** is exactly: `reverse-engineer-copybook-library` → `reverse-engineer-cobol-program` → `reverse-engineer-jcl-job`. Order matters: copybooks emit the canonical record graph before programs reference fields; programs emit data-bindings before JCL pins a step's program.
- [ ] [auto] The **KB-stage successor note** explicitly names `build-mainframe-data-lineage` and clarifies it is a *knowledge-base* stage skill that runs after the RE chain, not part of it. Acceptable phrasings: "After the RE chain completes, the next stage is `build-mainframe-data-lineage` (knowledge-base stage)." or any wording that distinguishes the stage.
- [ ] [auto] Verdict ends with the exact next-skill trigger phrase for the FIRST skill in the RE chain (`reverse-engineer-copybook-library`).
- [ ] [auto] Source repo is a shallow clone (`git -C ~/Dev/framework-tests/oss-clones/zopeneditor-sample rev-parse --is-shallow-repository` == `true`).

**Rollback:** none.

### C.2  reverse-engineer-api  —  RealWorld Express backend
**Trigger phrase:** "Reverse-engineer this API repo at `~/Dev/framework-tests/oss-clones/realworld-api`."
**Expected outputs:**
- **Part A** (internal): tree at `<repo>/docs/api-internal/<NN>-<bare-slug>.md` per `re-api-internal.yaml`'s block list (~25 blocks rendered, depending on elicitation gates).
- **Part B** (consumer): tree at `recipes-kb/source-docs/realworld-api/api-consumer/<NN>-<bare-slug>.md` per `re-api-consumer.yaml` (~13 blocks).
- **Supplementary** (API-skill specific): `recipes-kb/source-docs/realworld-api/openapi.yaml` at the Part-B directory root, sibling to the consumer/ tree.

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] [auto] Part A's filled blocks cover controllers, models, and middleware (e.g., `01-api-overview`, `05-project-structure-and-conventions`, `07-middleware-and-request-pipeline`, `08-authentication-and-authorization-internals`, `12-domain-models-and-business-rules`).
- [ ] [auto] Supplementary `openapi.yaml` validates (use `npx @redocly/cli lint`).
- [ ] [user] Part B's `04-endpoint-catalog.md` (or equivalent) carries at least one end-to-end consumer flow.

**Rollback:** `rm -rf recipes-kb/source-docs/realworld-api && rm -rf <oss-clones>/realworld-api/docs/api-internal`.

### C.3  reverse-engineer-api-framework  —  Hono
**Trigger:** "Reverse-engineer the API framework at `~/Dev/framework-tests/oss-clones/hono`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/api-framework-internal/<NN>-<bare-slug>.md` per `re-api-framework-internal.yaml` (~22 blocks; some gated by `framework_provides_di` / `framework_provides_data_access` / `framework_ships_cli`).
- **Part B**: tree at `recipes-kb/source-docs/hono/api-framework-consumer/<NN>-<bare-slug>.md` per `re-api-framework-consumer.yaml` (~22 blocks).

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] [user] Part B's filled blocks explain install, write a route, add middleware, and deploy targets (e.g., `02-environment-and-configuration`, `04-request-pipeline-and-middleware`, `16-recipes-and-common-patterns`).
- [ ] [user] Internal vs implementer split is clean — Part A's `04-middleware-pipeline` documents `compose.ts` internals; Part B's equivalent block defers internals to Part A.

**Rollback:** `rm -rf recipes-kb/source-docs/hono && rm -rf <oss-clones>/hono/docs/api-framework-internal`.

### C.4  reverse-engineer-web-app  —  vercel/commerce
**Trigger:** "Reverse-engineer the web app at `~/Dev/framework-tests/oss-clones/commerce`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/web-app-internal/<NN>-<bare-slug>.md` per `re-web-app-internal.yaml` (~24 blocks; `12-forms-and-validation` gated by `has_forms`, `14-internationalization-i18n` by `has_i18n`).
- **Part B**: tree at `recipes-kb/source-docs/commerce/web-app-consumer/<NN>-<bare-slug>.md` per `re-web-app-consumer.yaml` (12 blocks).

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] [user] Part A `05-routing-and-navigation` documents the App-Router page structure with rendering strategy per route.
- [ ] [user] Part A `07-component-architecture` calls out the server vs client component split with concrete file names.
- [ ] [user] Part A `13-feature-modules` traces the cart / product / checkout flows with file maps + flow diagrams.

**Rollback:** `rm -rf recipes-kb/source-docs/commerce && rm -rf <oss-clones>/commerce/docs/web-app-internal`.

### C.5  reverse-engineer-ui-framework  —  shadcn-ui/ui
**Trigger:** "Reverse-engineer the UI framework at `~/Dev/framework-tests/oss-clones/shadcn-ui`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/ui-framework-internal/<NN>-<bare-slug>.md` per `re-ui-framework-internal.yaml` (~22 blocks; some gated by `framework_has_directives_or_pipes` / `framework_provides_routing` / `framework_provides_i18n`).
- **Part B**: tree at `recipes-kb/source-docs/shadcn-ui/ui-framework-consumer/<NN>-<bare-slug>.md` per `re-ui-framework-consumer.yaml` (~25 blocks).

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] [auto] Part B's `05-components` lists the component catalog (≥5 components per family or a representative sample).
- [ ] [user] Theming / dark-mode story documented (Part A `13-styling-architecture` + Part B `04-theming-styling-and-responsive-design`).
- [ ] [user] `peerDependencies` framework-vs-application model explicitly called out — for shadcn/ui the unusual answer is "scaffold-and-conventions framework, not a runtime npm dependency".

**Rollback:** `rm -rf recipes-kb/source-docs/shadcn-ui && rm -rf <oss-clones>/shadcn-ui/docs/ui-framework-internal`.

### C.6  reverse-engineer-database  —  documenso Prisma schema
**Trigger:** "Reverse-engineer the database under `~/Dev/framework-tests/oss-clones/documenso/packages/prisma`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/database-internal/<NN>-<bare-slug>.md` per `re-database-internal.yaml` (~23 blocks; gated by `has_views`, `has_materialized_views`, `has_stored_procedures`, `has_triggers`).
- **Part B**: tree at `recipes-kb/source-docs/documenso/database-consumer/<NN>-<bare-slug>.md` per `re-database-consumer.yaml` (6 blocks; `03-working-with-stored-procedures` gated).
- **Supplementary** (database-skill specific): `recipes-kb/source-docs/documenso/data-dictionary.md` + `erd.mmd` at the Part-B directory root.

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] [auto] Every model from `schema.prisma` has a data-dictionary entry in the supplementary `data-dictionary.md`.
- [ ] [auto] Supplementary `erd.mmd` parses as a Mermaid ER diagram with edges for every FK in the schema.
- [ ] [user] Part A `15-migrations-and-versioning` acknowledges the migration history (count + key inflection points).

**Rollback:** `rm -rf recipes-kb/source-docs/documenso && rm -rf <oss-clones>/documenso/packages/prisma/docs/database-internal`.

### C.7  reverse-engineer-mobile-app  —  bluesky/social-app
**Trigger:** "Reverse-engineer the mobile app at `~/Dev/framework-tests/oss-clones/bluesky-social`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/mobile-app-internal/<NN>-<bare-slug>.md` per `re-mobile-app-internal.yaml` (~27 blocks; gated by `has_deep_links`, `has_push_notifications`, `has_native_modules`).
- **Part B**: tree at `recipes-kb/source-docs/bluesky-social/mobile-app-consumer/<NN>-<bare-slug>.md` per `re-mobile-app-consumer.yaml` (~10 blocks; `04-webview-and-embedding` gated by `has_webview_or_embedding`, `08-app-config-via-mdm` by `is_distributed_via_mdm`).

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] [user] Part A `01-application-overview` + `03-project-structure-and-organization` document iOS + Android (and web, when applicable) entry points.
- [ ] [user] Part A `06-navigation-structure` captures the navigation graph (tabs + per-tab native stacks).
- [ ] [user] Part A `11-api-integration-and-networking` (or `08-state-management`) identifies the state-management approach.

**Rollback:** `rm -rf recipes-kb/source-docs/bluesky-social && rm -rf <oss-clones>/bluesky-social/docs/mobile-app-internal`.

### C.8  reverse-engineer-mobile-framework  —  nativewind
**Trigger:** "Reverse-engineer the mobile framework at `~/Dev/framework-tests/oss-clones/nativewind`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/mobile-framework-internal/<NN>-<bare-slug>.md` per `re-mobile-framework-internal.yaml` (~22 blocks; gated by `framework_owns_layout`, `has_ota_updates`).
- **Part B**: tree at `recipes-kb/source-docs/nativewind/mobile-framework-consumer/<NN>-<bare-slug>.md` per `re-mobile-framework-consumer.yaml` (~23 blocks; `15-native-bridge-and-module-documentation` gated by `framework_has_native_bridge`).

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] [user] `peerDependencies` framework-vs-application classification confirmed in Part A `01-architecture-overview` + Part B `01-framework-overview`.
- [ ] [auto] Public API surface documented — Part A `21-source-layout` enumerates the `package.json` `exports` map; Part B `06-services-and-utilities` documents the runtime API.
- [ ] [user] Setup-in-an-Expo-app walk-through included in Part B `03-installation-and-setup` (install + 3 config files + entry CSS + verify).

**Rollback:** `rm -rf recipes-kb/source-docs/nativewind && rm -rf <oss-clones>/nativewind/docs/mobile-framework-internal`.

### C.8.0  Mainframe-sample setup  —  clone primary + supplementary, run supplementary copybook prereq pass
**Trigger:** shell + skill, three sub-steps.

**Sub-step 1 — clone both mainframe samples (shallow):**
```
git clone --depth 1 https://github.com/IBM/zopeneditor-sample            ~/Dev/framework-tests/oss-clones/zopeneditor-sample
git clone --depth 1 https://github.com/pratikdastw/hlasm_cics_cobol_sample ~/Dev/framework-tests/oss-clones/hlasm-cics-cobol-sample
git -C ~/Dev/framework-tests/oss-clones/zopeneditor-sample        gc --aggressive --prune=now
git -C ~/Dev/framework-tests/oss-clones/hlasm-cics-cobol-sample  gc --aggressive --prune=now
```

**Sub-step 2 — supplementary copybook prereq pass.** Run `reverse-engineer-copybook-library` against the **supplementary** repo so its lone copybook (`CUSTDEF.CPY`) is ingested into the KB *before* the supplementary cobol-program pass in C.8.2 needs it. This is a separate invocation of the same skill exercised in C.8.1; without it, the C.8.2 supplementary host-var auto criterion has nothing to bind against.

**Trigger phrase:** "Reverse-engineer the copybook library at `~/Dev/framework-tests/oss-clones/hlasm-cics-cobol-sample/`. This is the supplementary CICS+DB2 sample — its only copybook is `CUSTDEF.CPY`."

**Sub-step 3 — verify both clones are shallow** (`git -C <repo> rev-parse --is-shallow-repository` returning `true` for each).

**Inputs (sub-step 2):** the freshly-cloned supplementary repo at `~/Dev/framework-tests/oss-clones/hlasm-cics-cobol-sample/`.

**Expected outputs (sub-step 2):**
- **Part A**: `<oss-clones>/hlasm-cics-cobol-sample/docs/copybook-library-internal/<NN>-<bare-slug>.md` per `re-copybook-library-internal.yaml`.
- **Part B**: `recipes-kb/source-docs/hlasm-cics-cobol-sample/copybook-library-consumer/<NN>-<bare-slug>.md` per `re-copybook-library-consumer.yaml`.
- **Supplementary**: `recipes-kb/source-docs/hlasm-cics-cobol-sample/{copybook-record-graph.json,data-dictionary.md,copybook-conflicts.md}`.

**Pass criteria:**
- [ ] [auto] Both mainframe clones exist and are shallow (`is-shallow-repository == true` for each).
- [ ] [auto] Supplementary `copybook-record-graph.json` exists at `recipes-kb/source-docs/hlasm-cics-cobol-sample/` and contains at least one record from `CUSTDEF.CPY`. The canonical top-level key is `records[]` (per `reverse-engineer-copybook-library/references/INPUTS-OUTPUTS.md`), each entry carrying a `copybook` field — verify with `jq '.records | length > 0' .../copybook-record-graph.json` returning `true`, plus `jq '[.records[] | select(.copybook == "CUSTDEF")] | length > 0' ...` returning `true`. (Earlier plan revisions queried `.nodes[]`, which diverged from the skill's declared schema — see results follow-up.)
- [ ] [auto] Supplementary `data-dictionary.md` lists the field names from `CUSTDEF.CPY`.
- [ ] [user] Operator confirms `CUSTDEF.CPY` was ingested correctly (visual inspection of one or two field entries).

**Rollback:** `rm -rf ~/Dev/framework-tests/oss-clones/{zopeneditor-sample,hlasm-cics-cobol-sample} && rm -rf recipes-kb/source-docs/hlasm-cics-cobol-sample`.

### C.8.1  reverse-engineer-copybook-library  —  mainframe sample copybooks (1.3.0)
**Trigger phrase:** "Reverse-engineer the copybook library at `~/Dev/framework-tests/oss-clones/zopeneditor-sample/COPYBOOK`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/copybook-library-internal/<NN>-<bare-slug>.md` per `re-copybook-library-internal.yaml` (~12 blocks).
- **Part B**: tree at `recipes-kb/source-docs/zopeneditor-sample/copybook-library-consumer/<NN>-<bare-slug>.md` per `re-copybook-library-consumer.yaml` (~6 blocks).
- **Supplementary** (mandatory for this skill): `recipes-kb/source-docs/zopeneditor-sample/copybook-record-graph.json`, `data-dictionary.md`, `copybook-conflicts.md` at the Part-B directory root.

**Pass criteria** (in addition to the universal Phase-C criteria):
- [ ] [auto] Every `01-` record across the sample copybooks appears as a node in `copybook-record-graph.json` with REDEFINES collapsed into named variants and OCCURS expanded into indexed positions.
- [ ] [auto] `data-dictionary.md` groups fields by naming-convention prefix (e.g., `WS-`, `IO-`, `LS-`, `DB2-`) per the design doc's bucket model.
- [ ] [auto] zopeneditor-sample's `COPYLIB/` and `COPYLIB-MVS/` directories (which by design house local-vs-MVS variants of the same copybook members) are scanned together, and `copybook-conflicts.md` flags any divergent layouts between them. If the two libraries are byte-identical for every shared member, the file may be empty but must still be present with a "no conflicts detected" note.
- [ ] [user] Part B does **not** include internal level-by-level layouts (subset rule honoured).

**Rollback:** `rm -rf recipes-kb/source-docs/zopeneditor-sample/copybook-library-consumer recipes-kb/source-docs/zopeneditor-sample/{copybook-record-graph.json,data-dictionary.md,copybook-conflicts.md} && rm -rf <oss-clones>/zopeneditor-sample/COPYBOOK/docs/copybook-library-internal`.

### C.8.2  reverse-engineer-cobol-program  —  mainframe sample programs (1.3.0)
**Trigger phrase:** "Reverse-engineer the COBOL programs at `~/Dev/framework-tests/oss-clones/zopeneditor-sample/COBOL`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/cobol-program-internal/<NN>-<bare-slug>.md` per `re-cobol-program-internal.yaml` (~16 blocks).
- **Part B**: tree at `recipes-kb/source-docs/zopeneditor-sample/cobol-program-consumer/<NN>-<bare-slug>.md` per `re-cobol-program-consumer.yaml` (~6 blocks).
- **Supplementary** (mandatory): `program-call-graph.mmd`, `program-data-bindings.json`, and `program-exec-inventory.md` per program at the Part-B directory root.

**Pass criteria** (in addition to the universal Phase-C criteria):
- [ ] [auto] Each program's Part A documents all four DIVISIONs and a SECTION/PARAGRAPH outline.
- [ ] [auto] `program-call-graph.mmd` parses as Mermaid; the SAM1→SAM2 CALL chain resolves to nodes inside the deck; `CALL` / `PERFORM` / `XCTL` edges to programs outside the deck are flagged "external".
- [ ] [auto] EXEC CICS / EXEC SQL / EXEC DLI inventories are emitted as empty for zopeneditor-sample (the sample does not contain SQL/CICS/DLI), but the inventory files themselves must be present (zero-row, not absent).
- [ ] [user] Part B contains a "program contract" section (entry points, expected DD names, observable side effects) but no internal PERFORM-level detail.

**Supplementary host-var pass (`hlasm-cics-cobol-sample`):** Re-run the same skill against `~/Dev/framework-tests/oss-clones/hlasm-cics-cobol-sample/`. Output goes to `recipes-kb/source-docs/hlasm-cics-cobol-sample/cobol-program-consumer/`.

> **Prerequisite:** the supplementary copybook prereq pass in **C.8.0 sub-step 2** must have completed successfully, so `recipes-kb/source-docs/hlasm-cics-cobol-sample/copybook-record-graph.json` already contains `CUSTDEF.CPY`. The auto criterion below will fail outright if C.8.0 sub-step 2 was skipped.

**Trigger phrase (supplementary pass):** "Reverse-engineer the COBOL programs at `~/Dev/framework-tests/oss-clones/hlasm-cics-cobol-sample/`. Bind host-vars against the `CUSTDEF.CPY` graph already in `recipes-kb/source-docs/hlasm-cics-cobol-sample/`."

**Pass criteria for this supplementary pass:**
- [ ] [auto] `recipes-kb/source-docs/hlasm-cics-cobol-sample/copybook-record-graph.json` exists (output of C.8.0 sub-step 2). If absent, FAIL with the explicit message "C.8.0 sub-step 2 was not run — re-run before retrying C.8.2 supplementary".
- [ ] [auto] `EXEC SQL` inventory is non-empty (CUSTDB2.CBL has SQL statements with `:host-var` binds).
- [ ] [auto] `EXEC CICS` inventory is non-empty (CUSTMAIN.CBL contains CICS commands).
- [ ] [auto] `program-data-bindings.json` keys at least one `:host-var` from `EXEC SQL ... INTO :var` back to a field defined in `CUSTDEF.CPY`.

**Rollback (split, per-pass — don't blow away the C.8.0 supplementary copybook work unless intended):**
- **Primary pass only**: `rm -rf recipes-kb/source-docs/zopeneditor-sample/cobol-program-consumer recipes-kb/source-docs/zopeneditor-sample/{program-call-graph.mmd,program-data-bindings.json,program-exec-inventory.md} && rm -rf <oss-clones>/zopeneditor-sample/COBOL/docs/cobol-program-internal`
- **Supplementary pass only**: `rm -rf recipes-kb/source-docs/hlasm-cics-cobol-sample/cobol-program-consumer recipes-kb/source-docs/hlasm-cics-cobol-sample/{program-call-graph.mmd,program-data-bindings.json,program-exec-inventory.md}` *(leaves C.8.0's `copybook-record-graph.json` + `data-dictionary.md` intact so the prereq pass doesn't have to re-run)*
- **Both**: run both of the above. To also wipe C.8.0's supplementary copybook ingestion, run **C.8.0's** rollback separately.

### C.8.3  reverse-engineer-jcl-job  —  mainframe sample JCL (1.3.0)
**Trigger phrase:** "Reverse-engineer the JCL at `~/Dev/framework-tests/oss-clones/zopeneditor-sample/JCL`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/jcl-job-internal/<NN>-<bare-slug>.md` per `re-jcl-job-internal.yaml` (~11 blocks).
- **Part B**: tree at `recipes-kb/source-docs/zopeneditor-sample/jcl-job-consumer/<NN>-<bare-slug>.md` per `re-jcl-job-consumer.yaml` (~5 blocks).
- **Supplementary** (mandatory): `job-flow.mmd` + `dataset-io.json` at the Part-B directory root.

**Pass criteria** (in addition to the universal Phase-C criteria):
- [ ] [auto] PROC + INCLUDE expansion is fully resolved in Part A (no `// PROC <name>` references left unresolved unless the proc is genuinely external).
- [ ] [auto] DD inventory (DSN, DISP, GDG generation) is enumerated per step.
- [ ] [user] Condition codes and restart points captured.
- [ ] [auto] `dataset-io.json` records, per job × step × DD, the (DSN, DISP, program-invoked) tuple and resolves the program-invoked field to a node in C.8.2's `program-data-bindings.json` when the program is present in the deck.
- [ ] [auto] `job-flow.mmd` parses as Mermaid and shows step→step edges with DD I/O annotated.

**Rollback:** `rm -rf recipes-kb/source-docs/zopeneditor-sample/jcl-job-consumer recipes-kb/source-docs/zopeneditor-sample/{job-flow.mmd,dataset-io.json} && rm -rf <oss-clones>/zopeneditor-sample/JCL/docs/jcl-job-internal`.

### C.8.4  reverse-engineer-test-suite  —  the Hono test suite (new RE skill)
**Trigger phrase:** "Reverse-engineer the test suite at `~/Dev/framework-tests/oss-clones/hono` (the runtime + src test files)."

> **Repo choice.** `reverse-engineer-test-suite` targets a dedicated/standalone test project, but its `SKILL.md` scopes it to "any standalone test project — regardless of stack," which covers a cohesive embedded suite. We reuse the already-cloned `hono` repo (well-structured Vitest suite across `src/**/*.test.ts` + `runtime-tests/`) rather than add an 11th clone. If you prefer a stricter "dedicated repo" exercise, swap in a standalone test repo and update the trigger path; the pass criteria are unchanged.

**Inputs:** The `hono` shallow clone from C.1 (already present). No new clone.
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/test-suite-internal/<NN>-<bare-slug>.md` per `re-test-suite-internal.yaml` (16 blocks; **note:** this composition currently declares NO `decision-gates` and every block `optional: false`, so all 16 render — blocks that don't apply to a given suite type carry explicit "not applicable" content rather than being omitted. See results follow-up: the framework may want to add suite-type gates).
- **Part B**: tree at `recipes-kb/source-docs/hono/test-suite-consumer/<NN>-<bare-slug>.md` per `re-test-suite-consumer.yaml` (10 blocks, each carrying `kind: test-suite` frontmatter). **Path note:** `re-test-suite-consumer.yaml` / the SKILL.md declare a *default* Part-B path of `{knowledge_base_path}/components/<test-suite-id>/<component>.md`; this test writes to the `source-docs/<repo>/test-suite-consumer/` sibling layout instead (so C.9 build-knowledge-base can consume it uniformly with the other RE Part-B trees). Reconcile the default with the source-docs convention — see results follow-up.

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] [auto] Part A identifies the test framework/runner (Vitest) and the suite layout (unit vs runtime-tests), with concrete file paths.
- [ ] [auto] Part B documents how a consumer runs the suite (install, run command, watch/CI invocation) and how to add a new test.
- [ ] [user] Suite-type classification is accurate (Hono is primarily a unit/integration suite, not E2E/BDD) — gated blocks for suite types that don't apply are absent from disk, not stubbed.

**Rollback:** `rm -rf recipes-kb/source-docs/hono/test-suite-consumer && rm -rf <oss-clones>/hono/docs/test-suite-internal`.

> **Note:** the earlier `hono` output at `recipes-kb/source-docs/hono/api-framework-consumer/` (from C.3) is a **sibling** of this step's `test-suite-consumer/` tree under the same `hono/` dir. Both coexist — one clone, two RE domains. C.9 will map both.

### C.9  build-knowledge-base  —  scaffold the KB
**Trigger:** "From `~/Dev/framework-tests/recipes-app/` (where `project.toml` lives), build the knowledge base into `../recipes-kb/` from the source-docs already deposited under that path."

> Pin the cwd in the trigger because the skill resolves `[project.paths] knowledge_base_path = "../recipes-kb"` relative to `project.toml`'s directory. Earlier versions of this trigger ("Build the knowledge base from the source-docs we just produced") relied on conversational context that a YOLO runner doesn't have.

**Inputs:** All 7 modern-stack RE outputs (from C.2–C.8) plus the mainframe RE outputs from BOTH `zopeneditor-sample` (C.8.1 / C.8.2 primary / C.8.3) and `hlasm-cics-cobol-sample` (C.8.0 sub-step 2 + C.8.2 supplementary pass) deposited under `recipes-kb/source-docs/<repo>/`. `recipes-app/project.toml` declares `knowledge_base_path = "../recipes-kb"`.
**Expected outputs:** Full KB layout under `recipes-kb/`:
- `ARCHITECTURE.md`
- `CLAUDE.md`
- `graph.json`
- `glossary.md`, `change-tracker.md`
- `repos/<slug>/`
- `components/<slug>/<component-id>.md` per public artifact
- `shared/{entities,cross-cutting,adrs,integration-patterns}/`
- `synthesized/01..10/`

> **Note:** the `shared/{solution-context, ai-rules, operations}/` subtrees and the `ARCHITECTURE.md § 0 Solution Overview` section are part of the 1.1.0 layer and are **not** present on this branch. They appear only when `mm/add-context` lands.

**Pass criteria:**
- [ ] [auto] Every public artifact in source-docs maps to ≥1 component file
- [ ] [auto] `graph.json` parses, edges are bidirectionally consistent
- [ ] [auto] Each component has the mandatory frontmatter (description, triggers, paths, depends_on, consumed_by, last_verified_against_commit with full 40-char SHA)
- [ ] [user] No source-doc content duplicated into component bodies
**Rollback:** `rm -rf recipes-kb/{ARCHITECTURE.md,CLAUDE.md,graph.json,glossary.md,change-tracker.md,repos,components,shared,synthesized}`.

### C.9.4  build-mainframe-data-lineage  —  KB aggregator across the mainframe Part B feeds (1.3.0)
**Trigger phrase:** "Build the mainframe data lineage for the recipes-kb knowledge base. Include both the primary `zopeneditor-sample` and the supplementary `hlasm-cics-cobol-sample` repos as feeds."

**Inputs:** Lineage feed-files from BOTH the primary and supplementary mainframe RE passes:

**Primary repo (`zopeneditor-sample`)** — 5 files, from C.8.1 / C.8.2 / C.8.3:
- `recipes-kb/source-docs/zopeneditor-sample/copybook-record-graph.json` (from C.8.1)
- `recipes-kb/source-docs/zopeneditor-sample/program-data-bindings.json` (from C.8.2 primary pass)
- `recipes-kb/source-docs/zopeneditor-sample/program-call-graph.mmd` (from C.8.2 primary pass)
- `recipes-kb/source-docs/zopeneditor-sample/program-exec-inventory.md` (from C.8.2 primary pass)
- `recipes-kb/source-docs/zopeneditor-sample/dataset-io.json` (from C.8.3)

**Supplementary repo (`hlasm-cics-cobol-sample`)** — 4 files, from C.8.0 sub-step 2 + C.8.2 supplementary pass:
- `recipes-kb/source-docs/hlasm-cics-cobol-sample/copybook-record-graph.json` (from C.8.0 sub-step 2)
- `recipes-kb/source-docs/hlasm-cics-cobol-sample/program-data-bindings.json` (from C.8.2 supplementary pass)
- `recipes-kb/source-docs/hlasm-cics-cobol-sample/program-call-graph.mmd` (from C.8.2 supplementary pass)
- `recipes-kb/source-docs/hlasm-cics-cobol-sample/program-exec-inventory.md` (from C.8.2 supplementary pass)

> The supplementary repo is the **only** source of EXEC SQL / EXEC CICS host-vars — `zopeneditor-sample` has none. The "every host-var resolves" auto criterion below depends on the supplementary feeds being present. If you skipped C.8.2's supplementary pass, that criterion will be vacuously satisfied (zero host-vars to check) — note the pass as `Partial` and surface that the host-var path was not actually exercised.

**Expected outputs:** A coherent cross-program lineage artefact under `recipes-kb/lineage/mainframe/` per the `kb-mainframe-data-lineage.yaml` composition:
- `copybook-where-used.md`
- `field-where-used.md`
- `move-chain.md` + `move-chain.json`
- `job-program-dataset-chain.mmd`
- `db2-host-variable-bindings.md` (if any EXEC SQL appeared in C.8.2)
- `ims-segment-bindings.md` (if any EXEC DLI appeared)
- `cics-commarea-bindings.md` (if any EXEC CICS appeared)
- `lineage-summary.md`

**Pass criteria** (these are the design-doc coverage rules — the skill exposes them as an explicit gate):
- [ ] [auto] Every copybook in `copybook-record-graph.json` appears in `copybook-where-used.md` (with empty list explicitly noted for unused copybooks).
- [ ] [auto] Every program in `program-data-bindings.json` appears as a node in `job-program-dataset-chain.mmd` if any JCL references it; otherwise flagged "not invoked from documented JCL".
- [ ] [auto] Every host-var in EXEC SQL inventories resolves to a copybook field or is flagged "unbound" (the deliberate-unbound-host-var case is a recommended sample to author into the deck so this rule has something to fire on).
- [ ] [user] `move-chain.md` traces at least one canonical field from copybook source → program PERFORM → program output → JCL DD → downstream dataset.
- [ ] [auto] `lineage-summary.md` is keyed by canonical field name (the design-doc top-level index).

**Rollback:** `rm -rf recipes-kb/lineage/mainframe`.

### C.10  verify-knowledge-base-coverage  —  baseline coverage report
**Trigger:** "From `~/Dev/framework-tests/recipes-app/`, verify coverage of the KB at `../recipes-kb/`."
**Expected outputs:** Orphan + stale + warning report; baseline run, no deltas.
**Pass criteria:**
- [ ] [auto] No orphans (every component traces to source-docs)
- [ ] [auto] No KB-only entries lacking source backing
**Rollback:** report is informational; nothing to roll back.

### C.11  navigate-knowledge-base  —  feature-grounding query
**Trigger:** "From `~/Dev/framework-tests/recipes-app/` (so the skill picks up `project.toml` and `[project.paths] knowledge_base_path`), find the minimal KB component set in `../recipes-kb/` needed to add OAuth login to a Next.js app like `vercel/commerce`."
**Expected outputs:** A ranked list of component file paths to load, no full-KB read.
**Pass criteria:**
- [ ] [auto] List is ranked
- [ ] [auto] All listed files exist (verify by `test -f <path>` for each)
- [ ] [auto] The skill does **not** read the entire KB itself (verify by tool-call audit / agent transcript)
- [ ] [user] Top-3 are obviously the most relevant (you adjudicate)
**Rollback:** none.

### C.12  detect-knowledge-base-drift  —  inject a drift signal
**Setup:** Touch a file inside `~/Dev/framework-tests/oss-clones/commerce/` (e.g., add a new route file) and commit, so the source HEAD differs from the KB's `last_verified_against_commit`. Capture the resulting SHA into `_docs/.sha-pre-c12` for later rollback.
**Trigger:** "From `~/Dev/framework-tests/recipes-app/`, run a drift sweep against the KB at `../recipes-kb/`."
**Expected outputs:** Drift report flagging the affected component(s) with severity and recommended action.
**Pass criteria:**
- [ ] [auto] Affected component flagged
- [ ] [auto] Untouched repos report no drift
- [ ] [auto] Severity assigned per the layered detection rules
**Rollback:** `git -C ~/Dev/framework-tests/oss-clones/commerce reset --hard "$(cat _docs/.sha-pre-c12)"` (or re-clone if the file is missing).

### C.13  update-knowledge-base  —  apply the drift fix (catalog scope)
**Trigger:** "From `~/Dev/framework-tests/recipes-app/`, update the KB at `../recipes-kb/` for the drift we just detected. Use `--scope=catalog-only`."

> The C.12 drift signal (a new route file in `vercel/commerce`) is **expected to be below all 6 ADR thresholds** documented in `update-knowledge-base/references/OVERVIEW.md` § "ADR emission thresholds": (1) new external dependency, (2) framework replacement, (3) new auth/authz model, (4) new data store, (5) breaking public-interface change, (6) new cross-cutting standard. A simple route addition crosses none of these. So the test scenario sits in the *no-ADR* branch by design.
>
> If you want to also exercise the *yes-ADR* branch in this pass, run a second invocation with the setup-diff modified to add a new external npm dependency to `commerce/package.json` (threshold #1). The pass criteria for that variant are appended below as **C.13b**.

**Pass criteria (no-ADR branch — uses C.12's setup):**
- [ ] [auto] No full rebuild (only matched components touched). Verify with `git -C ~/Dev/framework-tests/recipes-kb diff --name-only HEAD~1 | wc -l` returning a small number (~1–3 component files + change-tracker + graph slice), not the whole KB.
- [ ] [auto] Affected component frontmatter updated (`last_verified_against_commit` advanced to the SHA from C.12's setup).
- [ ] [auto] Graph delta consistent (`graph.json` parses; edges added/removed are bidirectionally consistent).
- [ ] [auto] **No ADR emitted** — verify `git -C ~/Dev/framework-tests/recipes-kb diff --name-only HEAD~1 -- shared/adrs/ | wc -l` returns `0`. The skill must NOT emit an ADR for a sub-threshold change.

**Rollback:** `git -C ~/Dev/framework-tests/recipes-kb checkout -- .`.

### C.13b  update-knowledge-base  —  ADR-threshold variant (OPTIONAL)
> Run only if you want to confirm the ADR emission path fires when a threshold is crossed. Skip on a YOLO pass if you don't have time — record as `Skip`.

**Setup:** Edit `~/Dev/framework-tests/oss-clones/commerce/package.json` to add a new dependency that's not present elsewhere in the deck (e.g., a new auth library — threshold #1: "new external dependency"). Commit.
**Trigger:** "From `~/Dev/framework-tests/recipes-app/`, update the KB at `../recipes-kb/` with `--scope=full` (we want ADR emission this time)."
**Pass criteria:**
- [ ] [auto] An ADR file appears under `~/Dev/framework-tests/recipes-kb/shared/adrs/ADR-NNNN-<slug>.md` (verify with `git -C ~/Dev/framework-tests/recipes-kb diff --name-only HEAD~1 -- shared/adrs/ | wc -l` returning ≥ 1).
- [ ] [auto] The new ADR's filename uses the next sequential `NNNN` (no number reuse). Compute by listing existing ADRs before the run.
- [ ] [user] The ADR's body actually identifies threshold #1 (new external dependency) as the trigger — operator confirms the rationale matches the diff.

**Rollback:** `git -C ~/Dev/framework-tests/recipes-kb checkout -- . && git -C ~/Dev/framework-tests/oss-clones/commerce reset --hard "$(cat _docs/.sha-pre-c12)"`.

> **End of Phase C — run the §11 teardown checklist** (status sweep + Phase-C-specific rollbacks; verify shallow-clones intact and `recipes-kb/source-docs/<repo>/` populated for every step run) before moving to Phase D.

---

## Phase D — Greenfield SDLC on the Recipes app

Sandbox prep (one-time before D.1) — flip flow back to greenfield via `customize-framework` or by re-running `start-project` in a fresh sibling. **A fresh sibling is mandatory here**, not just easy: the `recipes-app/` shell from Phase C is in **brownfield** mode (B.4 set it that way) and points at the 7 OSS clones via `[[project.repos]]`. Phase D needs a clean greenfield project pointing at *itself*, so we build it next door rather than mutate the brownfield project (which Phase C steps may still need to reference).

```
mkdir -p ~/Dev/framework-tests/recipes-app-gf
cd       ~/Dev/framework-tests/recipes-app-gf
git init -q
```

> **Note on SoD scaffold observation in Phase D.** The SoD scaffold is opt-in: a project that does not declare `[stages.<stage>].dir` or `colocate_with_source` runs in legacy mode and Step 0 is a no-op. The Recipes greenfield sandbox is **legacy mode** by default, so D.2 / D.4 / D.6 / D.8 each carry an `[auto]` criterion that Step 0 announced its legacy-mode early-out (semantic match, not verbatim — wording varies, e.g. "…is in legacy mode. Skip this step entirely") and proceeded to Step 1 without prompting. Optionally exercise the SoD path by configuring `[stages.requirements].dir = "ba-repo"` mid-pass (see the optional D.2-SoD variant); the operator records the divergence as a NEEDS-REVIEW.

### Phase D rollback protocol — captured SHAs and stash-first hard resets

Several steps below (D.8, D.10, E.3) use `git reset` for rollback. To make rollback **self-contained** (no operator memory of pre-step SHAs) and **safe** (no surprise destruction of uncommitted work), every step that resets adds two lines to its setup:

1. **Capture the pre-step SHA** to a per-step file under `_docs/.sha-pre-<step>`. The rollback reads it back. Example:
   ```
   git -C ~/Dev/framework-tests/recipes-app-gf rev-parse HEAD > _docs/.sha-pre-d8
   ```
   If the directory has no commits yet, write the literal `EMPTY` instead, and rollback uses `git reset --hard $(git rev-list --max-parents=0 HEAD 2>/dev/null || echo HEAD)`.

2. **Stash uncommitted work before any `git reset --hard`.** A hard reset destroys uncommitted changes silently. The protocol is:
   ```
   git -C <sandbox> stash push -u -m "<step>-pre-rollback" || true   # tolerate "nothing to stash"
   git -C <sandbox> reset --hard "$(cat _docs/.sha-pre-<step>)"
   echo "Note: any pre-rollback uncommitted work is in `git stash list` under message '<step>-pre-rollback'."
   ```

> **Operator warning:** these resets are *destructive of committed work* between the captured SHA and HEAD. Stashing protects uncommitted changes, but commits made between the capture point and the rollback point will be lost. Do not run a Phase-D rollback on a sandbox that holds work you care about. The `_docs/.sha-pre-*` files are gitignored under `.gitignore`'s `_docs/` rule by default — verify before relying on them.

### D.1  start-project  —  greenfield (re-run, clean slate)
**Trigger phrase:** "Bootstrap a greenfield Next.js project called Recipes. Set `[project.paths] knowledge_base_path = \"../recipes-kb\"` so Phase E's `update-knowledge-base` handoff has a real target."
**Expected outputs:** `project.toml` with `default_flow = "greenfield"`, paths set, **`knowledge_base_path = "../recipes-kb"` declared explicitly so the recipes-kb/ created in Phase C is reachable from this sandbox**, glossary seeded with `Recipe`, `Tag`, `Favorite`. Handoff to `create-requirements-package`.

> **Why pin `knowledge_base_path` here.** Phase E's `execute-quick-change` skill emits a closing handoff to `update-knowledge-base --scope=catalog-only`. That handoff resolves against `[project.paths] knowledge_base_path` — if it's missing, the handoff is technically valid but practically a no-op (no KB to update). By declaring the path back to the Phase-C KB, the handoff is testable.

**Pass criteria:**
- [ ] [auto] `project.toml` parses
- [ ] [auto] `[project.paths] knowledge_base_path` is declared and resolves to the existing `~/Dev/framework-tests/recipes-kb/` (verify with `test -d "$(python3 -c "import tomllib;d=tomllib.load(open('project.toml','rb'));print(d['project']['paths']['knowledge_base_path'])")"`).
- [ ] [auto] Glossary contains the three project terms
- [ ] [auto] Handoff phrase names `create-requirements-package` (the next greenfield skill on this branch — `capture-solution-context` does NOT exist here yet; that is 1.1.0 / `mm/add-context`).
**Rollback:** `rm -rf ~/Dev/framework-tests/recipes-app-gf`.

### D.2  create-requirements-package  —  full requirements stage
**Trigger:** "Create the requirements package for Recipes."
**Inputs:** Scenario from §5 of this plan.
**Expected outputs:** Requirements package on disk per `templates/compositions/greenfield-requirements-package.yaml` — overview, exec summary, FRs (≥3), NFRs (auth + perf), ACs, glossary, change-log.
**Pass criteria:**
- [ ] [auto] All composition blocks present
- [ ] [auto] Each FR has at least one AC (count check)
- [ ] [user] FRs are testable (judgment on whether the AC actually makes the FR testable)
- [ ] [auto] No `[NEEDS CLARIFICATION:]` markers left
- [ ] [auto] **(SoD scaffold, legacy-mode behaviour)** Step 0 (`steps/00-scope-target-repo.md`) ran first, observed the project's `[stages.requirements]` has neither `dir` nor `colocate_with_source`, announced its legacy-mode early-out (semantic match, not verbatim — the Step-0 body declares the stage is in legacy mode and no-ops/skips; wording varies, e.g. "…is in legacy mode. Skip this step entirely"), and proceeded to Step 1 without asking the operator any scoping question.
- [ ] [auto] **(SoD scaffold)** No `_cross-cutting/` directory was created and no `affects_repos` frontmatter was emitted in the requirements artifact (the `shared/affects-repos` block is `optional: true` in the composition, so legacy-mode renders without it).
- [ ] [user] **(ack-restoration — observable, not interpretive)** Before drafting begins, the agent emits a chat message that contains BOTH the verbatim heading `## Verification rule (always-on)` AND the rule's first sentence as it appears in the SKILL.md (operator can copy-paste from `requirements/create-requirements-package/SKILL.md` and grep the transcript). Acceptance: substring match, not paraphrase.
- [ ] [user] **(ack-restoration)** Section relevance check fires unconditionally for every block — operator is asked one of {Yes / No (with reason) / Skip / Not sure} for **every** composition block, not only when relevance is in question. Acceptance: operator counts the prompts and confirms the count equals the number of composition blocks (≈ the row count from running the A.6 yaml verifier against `greenfield-requirements-package.yaml`).
- [ ] [user] **(ack-restoration Change C — iterative blocks)** When drafting `functional-requirements.md` and `business-logic-rules.md`, the skill loops per item: state heading → draft → present → ask "Approve, change, or skip?" → wait for input → move on. Operator records: (a) the loop fired, (b) the loop was per-item (not bundled), (c) the loop's "Approve, change, or skip?" prompt was non-skippable (not a polite suggestion the agent could ignore).
- [ ] [user] **(ack-restoration)** Each step file's final action is the `## Acknowledgement checkpoint` summarise-and-wait gate. Acceptance: operator confirms the agent paused for explicit acknowledgement before transitioning to the next step (not just printed the heading and continued).
**Rollback:** `rm -rf docs/requirements`.

### D.2-SoD  (OPTIONAL) create-requirements-package  —  exercise the SoD scaffold path
> Run only if you want to confirm the SoD scoping prompts fire when configured. Skip this step entirely on a YOLO pass and record as `Skip`.

**Setup:** Add to `recipes-app-gf/project.toml`:
```toml
[stages.requirements]
dir         = "ba-repo"
write_role  = "BA"

[[project.repos]]
code = "recipes-web"
name = "Recipes web"
path = "{project-root}"
role = "web-app"

[[project.repos]]
code = "recipes-api"
name = "Recipes API"
path = "{project-root}/api"
role = "api"
```
And create `project.user.toml` with `[user] role = "BA"`.

**Trigger:** "Create the requirements package for the new cross-cutting feature `cookTime-everywhere`."
**Pass criteria:**
- [ ] [auto] Step 0 detected SoD directory mode and asked "single-repo or cross-cutting?".
- [ ] [auto] On answering "cross-cutting" the artifact path resolves under `{project-root}/ba-repo/<artifact_subdir-default>/requirements/_cross-cutting/<feature-id>-requirements.md` (default `artifact_subdir = ".framework-output"`).
- [ ] [auto] The artifact's YAML frontmatter carries `affects_repos: [recipes-web, recipes-api]` and Step 4 emits the `shared/affects-repos` block (now `optional: true` but rendered because the artifact is cross-cutting).
- [ ] [auto] Permission check passed (`[user].role = "BA"` matches `[stages.requirements].write_role = "BA"`).
- [ ] [user] Operator confirms the scoping prompt was a real elicitation (one Q at a time), not a bundled shortcut.
**Rollback:** `git checkout -- project.toml project.user.toml && rm -rf ba-repo`.

### D.3  review-requirements-package  —  gate
**Trigger:** "Review the requirements package."
**Expected outputs:** GO / NO-GO verdict with findings on scope, completeness, consistency, measurability, testability.
**Pass criteria:**
- [ ] [auto] One overall verdict
- [ ] [user] Findings cite specific sections / FR IDs
- [ ] [auto] **(SoD scaffold, legacy-mode)** Review-skill Step 0 (the `## Step 0 — Locate the upstream artifact (SoD only)` section in the SKILL.md) ran, observed legacy mode, and resolved the artifact path via `[project.paths]` exactly as today.
**Rollback:** none.

### D.4  create-design-package  —  full design stage
**Trigger:** "Create the design package."
**Expected outputs:** Design package per `templates/compositions/greenfield-design-package.yaml` — C4 L1 + L2 (and L3 for the recipe service), tech-stack pin (Next.js version, Prisma version, SQLite), API design (Next.js Route Handlers), data model, NFR strategies, traceability matrix back to FRs.
**Pass criteria:**
- [ ] [auto] C4 diagrams render (Mermaid syntax valid)
- [ ] [auto] Every FR appears in the traceability matrix
- [ ] [auto] Tech-stack versions pinned, not "latest" (regex match — no bare `latest` / `*` / `^`-only constraints). **Note:** the pins apply to *runtime* deps; `@types/*` packages track but do not always publish a version equal to their runtime counterpart (e.g. `@types/react-dom` has no `19.2.8`), so `@types` pins may legitimately differ from the runtime pin — check `@types` against npm at install time rather than assuming version equality.
- [ ] [auto] **(SoD scaffold, legacy-mode behaviour)** Step 0 (`steps/00-scope-target-repo.md`) ran first and announced its legacy-mode early-out (semantic match, not verbatim — wording varies, e.g. "…is in legacy mode. Skip this step entirely") before proceeding to Step 1.
- [ ] [user] **(ack-restoration — observable)** Same four observable ack-criteria as D.2, applied to design:
   1. Agent emits the verbatim `## Verification rule (always-on)` heading + first sentence from `design/create-design-package/SKILL.md` before drafting.
   2. Unconditional relevance check fires once per composition block in `greenfield-design-package.yaml` (count must equal block count).
   3. Per-item loop on `api-design.md` and `database-design.md` (the two design-stage iterative blocks): state heading → draft → ask "Approve, change, or skip?" → wait → move on.
   4. Each step file's final action is the `## Acknowledgement checkpoint` summarise-and-wait gate.
**Rollback:** `rm -rf docs/design`.

### D.5  review-design-package  —  gate
**Trigger:** "Review the design."
**Expected outputs:** GO / NO-GO with architecture, security posture, NFR-strategy verdicts.
**Pass criteria:**
- [ ] [user] At least one finding (no rubber-stamp)
- [ ] [user] Overall verdict is unambiguous
- [ ] [auto] **(SoD scaffold, legacy-mode)** Review-skill Step 0 (`## Step 0 — Locate the upstream artifact (SoD only)`) ran, observed legacy mode, and resolved the artifact path via `[project.paths]`.
**Rollback:** none.

### D.6  create-implementation-package  —  decompose into INC-XXX
**Trigger:** "Create the implementation package."
**Expected outputs:** Implementation package with 3–4 `INC-XXX` increments conforming to the Canonical Increment Shape (8 sections).
**Pass criteria:**
- [ ] [auto] Each increment has all 8 canonical sections
- [ ] [user] Order is executable (no forward dependencies)
- [ ] [auto] FR coverage matrix complete
- [ ] [auto] **(SoD scaffold, legacy-mode behaviour)** Step 0 (`steps/scope-target-repo.md`) ran first and announced its legacy-mode early-out (semantic match, not verbatim — wording varies, e.g. "…is in legacy mode. Skip this step entirely").
- [ ] [user] **(ack-restoration — observable)** Two observable assertions for planning (no iterative-block list, so the per-item loop doesn't apply):
   1. Agent emits the verbatim `## Verification rule (always-on)` heading + first sentence from `planning/create-implementation-package/SKILL.md` before drafting.
   2. Each step file's final action is the `## Acknowledgement checkpoint` summarise-and-wait gate (operator confirms a real pause-and-await, not a printed-and-continued).
**Rollback:** `rm -rf docs/planning`.

### D.7  review-implementation-package  —  pre-execution gate
**Trigger:** "Review the implementation package."
**Expected outputs:** GO / NO-GO + per-increment findings.
**Pass criteria:**
- [ ] [auto] Per-increment verdict
- [ ] [auto] Increment-shape compliance confirmed
- [ ] [user] The GO verdict names the quality fork the operator must elect (quality-first vs execute-first). In this test bed we take execute-first through Phase D, then exercise the quality stage as **Phase Q** after D.10 (see the Phase Q preamble).
**Rollback:** none.

### D.8  execute-increments  —  ship INC-001
**Pre-step (mandatory — captures rollback target):**
```
git -C ~/Dev/framework-tests/recipes-app-gf rev-parse HEAD 2>/dev/null > _docs/.sha-pre-d8 || echo EMPTY > _docs/.sha-pre-d8
```

**Trigger:** "Execute INC-001."
**Expected outputs:** Increment INC-001 implemented under `recipes-app-gf/` with TDD (tests-first), AI Gate result, Human Gate result, increment-status updated.
**Pass criteria:**
- [ ] [user] Tests written before code (verify by commit ordering / agent transcript)
- [ ] [auto] Tests pass (test-runner exit code 0)
- [ ] [auto] Increment-status file updated
- [ ] [auto] Closing handoff to `update-knowledge-base` emitted
- [ ] [auto] **(SoD scaffold, legacy-mode behaviour)** Step 0 (`steps/00-scope-target-repo.md`) ran first and announced its legacy-mode early-out (semantic match, not verbatim — wording varies, e.g. "…is in legacy mode. Skip this step entirely"). For execution, this also covers the per-repo invocation loop being collapsed to a single repo.
- [ ] [user] **(ack-restoration — observable)** Agent emits the verbatim `## Verification rule (always-on)` heading + first sentence from `execution/execute-increments/SKILL.md` before executing. The `## Acknowledgement checkpoint` summarise-and-wait gate fires at the end of `02-execute-plan.md` specifically (gates 03/04/05 already had strict halts pre-ack-restoration; the Stage-1 reinforcement was 02 only).

**Rollback (stash-protected per Phase-D protocol):**
```
git -C ~/Dev/framework-tests/recipes-app-gf stash push -u -m "d8-pre-rollback" || true
SHA=$(cat _docs/.sha-pre-d8)
if [ "$SHA" = "EMPTY" ]; then
  git -C ~/Dev/framework-tests/recipes-app-gf reset --hard "$(git -C ~/Dev/framework-tests/recipes-app-gf rev-list --max-parents=0 HEAD 2>/dev/null || echo HEAD)"
else
  git -C ~/Dev/framework-tests/recipes-app-gf reset --hard "$SHA"
fi
```
Any pre-rollback uncommitted work survives in `git stash list` under message `d8-pre-rollback`.

### D.9a  manage-bugs (mid-increment mode)  —  log + triage during D.8 execution
**Setup:** Inject a deliberate bug during D.8's Human-Gate review (e.g., a known failing edge case the operator notices during demo). The increment INC-001 is still **in_progress** at the time `manage-bugs` is invoked.
**Trigger:** "Log a bug for the failing case." then "Triage open bugs."
**Expected outputs:** `bugs-and-issues-log.md` with the entry; triage produces severity + assignee. Skill correctly detects mid-increment mode (an INC-XXX is currently active) and links the bug to the active increment.
**Pass criteria:**
- [ ] [auto] Entry has the canonical fields (id, title, repro, severity, status).
- [ ] [auto] Bug entry's `linked-increment` (or equivalent) field references INC-001.
- [ ] [user] Operator confirms the skill detected mid-increment mode without being told.

**Rollback:** `rm -f ~/Dev/framework-tests/recipes-app-gf/bugs-and-issues-log.md`.

### D.9b  manage-bugs (standalone mode)  —  log + triage with no active increment
**Setup:** After D.8 completes (INC-001 is **done**, no other increment is in_progress), invoke `manage-bugs` for an unrelated issue (e.g., a typo in the README). This exercises the no-active-increment branch — the original D.9's "skill works whether or not an increment is currently being executed" claim is now proved by exercising the second case explicitly.
**Trigger:** "Log a typo bug in the README."
**Expected outputs:** Same `bugs-and-issues-log.md` gains a second entry; triage produces severity + assignee. Skill detects standalone mode and does NOT link the bug to a non-existent active increment.
**Pass criteria:**
- [ ] [auto] Second entry exists with the canonical fields.
- [ ] [auto] `linked-increment` field is empty / null / "none" — NOT an INC-XXX (it would be a bug to link to a closed-out increment).
- [ ] [user] Operator confirms the skill correctly detected the no-active-increment state.

**Rollback:** `git -C ~/Dev/framework-tests/recipes-app-gf checkout -- bugs-and-issues-log.md` (or `rm -f` if the file was first created in D.9a).

### D.10  create-pr  —  package the diff
**Pre-step (mandatory — captures rollback target):**
```
git -C ~/Dev/framework-tests/recipes-app-gf rev-parse HEAD > _docs/.sha-pre-d10
```

**Trigger:** "Create a PR for INC-001."
**Expected outputs:** Atomic conventional commits (one per logical change) + PR description with summary + test plan + (post-F-007) a CHANGELOG.md entry when `[project.change_log]` is enabled.

The skill walks 6 steps: (1) diff review, (2) fix cycle, (3) atomic commits, (4) PR description, (5) PR creation, (6) changelog entry.

**Mode flag — local sandbox vs. real GitHub remote.** The Recipes greenfield sandbox has no GitHub remote, so step 5 is **simulated**: produce the exact `gh pr create --title ... --body-file ...` command in a `pr-create-command.md` file and skip the actual push. Steps 1–4 + 6 run for real. If you re-run this test with a project that has a real remote, run step 5 live.

**Pass criteria:**
- [ ] [auto] Commit messages are conventional (`<type>(<scope>): <subject>` regex). Verify with `git -C ~/Dev/framework-tests/recipes-app-gf log --format=%s "$(cat _docs/.sha-pre-d10)..HEAD" | grep -vE '^[a-z]+(\([a-z0-9-]+\))?: '` returning zero lines.
- [ ] [user] Each commit traces to the INC-XXX or FR it addresses
- [ ] [auto] No "WIP" or noise commits (`git log --format=%s "$(cat _docs/.sha-pre-d10)..HEAD" | grep -iE 'wip|tmp|fixup|squash'` returns zero lines).
- [ ] [auto] PR body has both Summary and Test plan sections (use `templates/compositions/pr-description.yaml`)
- [ ] [auto] **F-007 changelog gate** — verify create-pr step 6 reads `[project.change_log]` from `project.toml`:
    - When **`enabled = true`**: a new entry is prepended to the configured `path` (default `CHANGELOG.md`) under an `Unreleased` section, formatted per `versioning_strategy` + `format`. The block content uses the project-level `parts_affected_vocabulary`.
    - When **`enabled = false` (or table absent)**: step 6 silently skips with no `CHANGELOG.md` write. The skill must NOT silently no-op for some other reason — silent-skip is reserved for the explicit `enabled = false` case.
- [ ] [auto] If running against the local sandbox: a `pr-create-command.md` file exists at the project root AND its body matches the regex `gh pr create.*--title.*--body-file` (verify with `grep -E 'gh pr create.*--title.*--body-file' pr-create-command.md`). A typo'd `gh pr create` invocation must NOT pass this criterion.
- [ ] [auto] No actual push occurred — verify with `git -C ~/Dev/framework-tests/recipes-app-gf log @{u}..HEAD 2>/dev/null` returning either "no upstream" or zero unpushed commits' worth of output (in this sandbox there is no remote so the "no upstream" path is the expected one; if a remote exists, the count must be > 0 indicating local-only commits).

**Rollback (stash-protected per Phase-D protocol; uses `--soft` so the diff is preserved):**
```
git -C ~/Dev/framework-tests/recipes-app-gf stash push -u -m "d10-pre-rollback" || true
git -C ~/Dev/framework-tests/recipes-app-gf reset --soft "$(cat _docs/.sha-pre-d10)"
# Do NOT push. The soft reset un-commits but keeps the working-tree changes.
```

> **End of Phase D — run the §11 teardown checklist** (status sweep + stash-list inspection + Phase-D-specific rollbacks) before moving to Phase E. Note: Phase E continues from D.10's repo state, so a full Phase-D teardown is **only** appropriate if you are NOT proceeding to Phase E.

---

## Phase Q — Quality stage on the Recipes app (new 9th stage)

Sandbox: continues from D.10's repo state (`recipes-app-gf/`, with the D.2 requirements, D.4 design, D.6 implementation package, and D.8's shipped INC-001 all on disk).

> **Why a dedicated phase rather than a mid-D fork.** The framework treats the quality stage as *user-elected at the `review-implementation-package` GO* (D.7): quality-first (gate quality before executing) or execute-first (execute, then reconcile via `audit-quality-coverage`). To keep the YOLO run linear, this test bed exercises the quality stage as a dedicated Phase Q *after* Phase D — which lets us cover **both** paths in one pass: Q.1/Q.2 exercise the quality-first authoring+gate, and Q.4 exercises the execute-first reconciliation audit against the already-shipped INC-001. Record in the ledger that the fork itself was not taken conversationally at D.7 (a linear-run simplification, not a defect).
>
> **SoD legacy-mode note.** The `recipes-app-gf` project is legacy mode (no `[stages.quality]` SoD config), so `create-quality-package`'s Step 0 is a no-op — same assertion shape as D.2/D.4/D.6/D.8.

### Q.1  create-quality-package  —  full quality stage
**Trigger phrase:** "Create the quality package for Recipes."
**Inputs:** The requirements package (D.2), design package (D.4), and implementation package (D.6) on disk under `recipes-app-gf/docs/`.
**Expected outputs:** Quality package on disk per `templates/compositions/greenfield-quality-package.yaml` (~17 blocks) — quality strategy, test design traced to the D.2 acceptance criteria, TC-XXX test-case increments, QE plan / environment, risk-based prioritisation.
**Pass criteria:**
- [ ] [auto] All composition blocks present per `greenfield-quality-package.yaml`.
- [ ] [auto] Test design traces to acceptance criteria — every FR/AC from the requirements package maps to ≥1 test case (coverage matrix present).
- [ ] [auto] At least one TC-XXX test-case increment defined in the reduced increment shape.
- [ ] [auto] **(SoD scaffold, legacy-mode behaviour)** Step 0 (`steps/00-scope-target-repo.md`) ran first, observed `[stages.quality]` has neither `dir` nor `colocate_with_source`, announced its legacy-mode early-out (semantic match, not verbatim — wording varies, e.g. "…is in legacy mode. Skip this step entirely"), and proceeded without a scoping prompt.
- [ ] [user] **(ack-restoration — observable)** Agent emits the verbatim `## Verification rule (always-on)` heading + first sentence from `quality/create-quality-package/SKILL.md` before drafting; the unconditional relevance check fires once per composition block; the per-item loop fires on the test-case-increments block (`steps/02b-test-case-increments.md`: state → draft → "Approve, change, or skip?" → wait); each step file ends with the `## Acknowledgement checkpoint` summarise-and-wait gate.
**Rollback:** `rm -rf ~/Dev/framework-tests/recipes-app-gf/docs/quality`.

### Q.2  review-quality-package  —  gate
**Trigger phrase:** "Review the quality package."
**Expected outputs:** GO / NO-GO verdict with findings on coverage completeness, test-design quality, traceability, and risk coverage.
**Pass criteria:**
- [ ] [auto] One overall verdict.
- [ ] [user] Findings cite specific test cases / FR IDs / coverage gaps (no rubber-stamp).
- [ ] [auto] **(SoD scaffold, legacy-mode)** Review-skill Step 0 (`## Step 0 — Locate the upstream artifact (SoD only)` in the SKILL.md) ran, observed legacy mode, and resolved the artifact path via `[project.paths]`.
**Rollback:** none.

### Q.3  execute-quality-increments  —  implement one TC-XXX
**Pre-step (mandatory — captures rollback target):**
```
git -C ~/Dev/framework-tests/recipes-app-gf rev-parse HEAD > _docs/.sha-pre-q3
```
**Trigger phrase:** "Execute the first quality increment (TC-001)."
**Expected outputs:** The TC-XXX test artifacts implemented under `recipes-app-gf/` (test files added/expanded), test-runner invoked, increment-status updated.
**Pass criteria:**
- [ ] [auto] Test files for TC-001 exist and the test runner exits 0 (or documents expected reds if TC-001 targets an unbuilt behaviour — record which).
- [ ] [auto] Quality increment-status file updated to reflect TC-001 done.
- [ ] [user] The implemented tests actually exercise the acceptance criteria they claim to (operator adjudicates one test).
**Rollback (stash-protected per Phase-D protocol):**
```
git -C ~/Dev/framework-tests/recipes-app-gf stash push -u -m "q3-pre-rollback" || true
git -C ~/Dev/framework-tests/recipes-app-gf reset --hard "$(cat _docs/.sha-pre-q3)"
```

### Q.4  audit-quality-coverage  —  read-only coverage audit (execute-first reconciliation)
**Trigger phrase:** "Audit test coverage against the implementation package."
**Inputs:** The D.6 implementation package (INC-XXX) + D.8's shipped INC-001 + the Q.1 quality package.
**Expected outputs:** A read-only coverage report mapping each implementation increment (INC-XXX) to its test coverage, flagging any increment with no covering test case.
**Pass criteria:**
- [ ] [auto] Report enumerates every INC-XXX from the implementation package with a covered / uncovered verdict.
- [ ] [auto] The audit writes no code and mutates no increment (read-only — verify working tree unchanged after the run except the report file).
- [ ] [user] Uncovered increments (if any) are correctly identified (operator adjudicates against the actual test files).
**Rollback:** report is informational — `rm -f` the report file if one was written; nothing else to roll back.

### Q.5  review-test-failures  —  triage a failing run
**Setup:** Introduce a deliberate failing test (e.g., flip one assertion in a TC-001 test so it fails, or point the skill at a captured failing run log). Capture the pre-edit state so it can be restored.
**Trigger phrase:** "Review the test failures and triage them."
**Expected outputs:** A triage of the failed scenario(s) — root-cause hypothesis, severity, and a recommended action (fix code / fix test / defer), optionally linked to `manage-bugs`.
**Pass criteria:**
- [ ] [auto] Each failing scenario gets a triage entry with a root-cause hypothesis + recommended action.
- [ ] [user] The root-cause hypothesis is plausible for the injected failure (operator adjudicates) — not a generic "re-run it".
**Rollback:** restore the flipped assertion (`git checkout -- <test-file>`).

> **End of Phase Q — run the §11 teardown checklist** (status sweep + stash-list inspection for `q3-pre-rollback`). Phase E continues from this repo state.

---

## Phase E — Quick-dev on the Recipes app

Sandbox: continues from Phase Q's repo state (which continues from D.10).

### E.1  document-quick-change  —  spec the cookTime feature
**Trigger phrase:** "Quick change: add a `cookTime` field to recipes and surface it on the list view."
**Expected outputs:** `docs/cook-time/quick-dev-package/<feature-id>-quick-dev-spec.md` with overview, exec-summary, FRs, ACs, glossary delta.
**Pass criteria:**
- [ ] [auto] Single artifact (not split into requirements + design)
- [ ] [user] At least one Acceptance Criterion is a trigger + observable
- [ ] [auto] No `[NEEDS CLARIFICATION:]` markers left
**Rollback:** `rm -rf docs/cook-time`.

### E.2  plan-quick-change  —  break into 1–3 increments
**Trigger:** "Plan the quick change for the cookTime feature."
**Expected outputs:** Lightweight plan (reduced increment shape), 1–3 increments, clarity-gate verdict, written to **`docs/cook-time/quick-dev-package/cook-time-quick-dev-plan.md`** (path pinned per `plan-quick-change/SKILL.md` step 7: `<feature-folder>/quick-dev-package/<feature-id>-quick-dev-plan.md`).
**Pass criteria:**
- [ ] [auto] File `docs/cook-time/quick-dev-package/cook-time-quick-dev-plan.md` exists.
- [ ] [user] Increments are sized to fit the change (likely 2: schema migration + UI surface).
- [ ] [auto] Clarity gate either PASS or with a small list of asks.
**Rollback:** `rm -f docs/cook-time/quick-dev-package/cook-time-quick-dev-plan.md` (specific path; was previously `rm <plan file>` with no name).

### E.3  execute-quick-change  —  implement, verify, commit
**Pre-step (mandatory — captures rollback target):**
```
git -C ~/Dev/framework-tests/recipes-app-gf rev-parse HEAD > _docs/.sha-pre-e3
```

**Trigger:** "Execute the quick change."
**Expected outputs:** Code change with TDD, 3-dimension verification (unit, behaviour, integration), atomic commits, handoff to `update-knowledge-base --scope=catalog-only` against the KB at `~/Dev/framework-tests/recipes-kb/` (the path declared in D.1's `[project.paths] knowledge_base_path`).
**Pass criteria:**
- [ ] [user] Tests written before code (commit ordering / agent transcript)
- [ ] [auto] All three verification dimensions covered
- [ ] [auto] Final commit clean; PR-ready (working tree clean, conventional commit)
- [ ] [auto] KB update handoff fires AND the handoff names the path declared in `project.toml` (i.e., `../recipes-kb/`, not a placeholder). The handoff itself need not be executed in this pass — but if `recipes-kb/` exists from Phase C, optionally run it and confirm the catalog-only update completes without error.

**Rollback (stash-protected per Phase-D protocol):**
```
git -C ~/Dev/framework-tests/recipes-app-gf stash push -u -m "e3-pre-rollback" || true
git -C ~/Dev/framework-tests/recipes-app-gf reset --hard "$(cat _docs/.sha-pre-e3)"
```

> **End of Phase E — run the §11 teardown checklist** (status sweep + final stash-list inspection). This is the last phase, so this teardown is also the **end-of-pass** sweep — record the consolidated final-report items per §0's "Final report (YOLO only)" structure.

---

## 8. Test-execution conventions

The two execution modes are defined in §0; this section is the operational shorthand for **step-by-step mode**. YOLO mode follows §0's PASS / FAIL / NEEDS-REVIEW taxonomy and does not use the verdict shorthand below.

In step-by-step mode:

- We pause at the **end of every step** for Mike's verdict: Pass / Fail / Partial / Skip + free-form notes.
- A **Fail** records the issue in `_docs/skills-test-results.md` (created on first Fail), names the skill, names the affected artifact, names the fix-owner. (Step-by-step's Fail = §0's FAIL class.)
- A **Partial** records the partial-pass note plus what's missing; we do not block the next step on a partial unless it would cascade. (No direct §0 equivalent — closest is PASS-WITH-OBSERVATIONS for `review-*-package` outputs.)
- A **Skip** records the reason (out of scope today, environment unavailable, etc.) and we move on.
- After each Phase ends, we summarise verdicts as a small table.

When converting a step-by-step run to a YOLO run mid-pass, carry the verdict ledger forward as the §0 results file — the format is the same.

## 9. Coverage matrix

| Skill | Phase.Step | Notes |
|---|---|---|
| start-project | B.1, D.1 | 2 invocations |
| framework-navigator | B.2, B.3 | catalog count criteria are `[user]` per Q2-A |
| customize-framework | B.4, **C.0** | 2 invocations (B.4 = scalar override, C.0 = `[[project.repos]]` enumeration) |
| scaffold-documentation | B.5 | |
| shard-document | B.6 | |
| track-change | B.7 | |
| verify-source | B.8 | |
| analyze-repository | C.1 (×7) + C.1m (mainframe sample) | post-1.3.0 dispatcher extension; 8 invocations |
| reverse-engineer-api | C.2 | |
| reverse-engineer-api-framework | C.3 | |
| reverse-engineer-web-app | C.4 | |
| reverse-engineer-ui-framework | C.5 | |
| reverse-engineer-database | C.6 | |
| reverse-engineer-mobile-app | C.7 | |
| reverse-engineer-mobile-framework | C.8 | |
| reverse-engineer-test-suite | C.8.4 | **new on this branch**; targets the Hono Vitest suite |
| reverse-engineer-copybook-library | C.8.1, **C.8.0 sub-step 2** | new in 1.3.0; 2 invocations (primary + supplementary CICS+DB2 prereq pass) |
| reverse-engineer-cobol-program | C.8.2 (primary + supplementary) | new in 1.3.0; 2 invocations within one step |
| reverse-engineer-jcl-job | C.8.3 | new in 1.3.0 |
| build-knowledge-base | C.9 | |
| build-mainframe-data-lineage | C.9.4 | new in 1.3.0 |
| verify-knowledge-base-coverage | C.10 | |
| navigate-knowledge-base | C.11 | |
| detect-knowledge-base-drift | C.12 | |
| update-knowledge-base | C.13 (+ optional C.13b) | C.13 = no-ADR branch; C.13b = ADR-emitted branch |
| create-requirements-package | D.2 (+ optional D.2-SoD) | post-ack ack-restoration assertions; SoD legacy-mode no-op observed |
| review-requirements-package | D.3 | SoD legacy-mode no-op observed |
| create-design-package | D.4 | ack-restoration assertions; SoD legacy-mode no-op |
| review-design-package | D.5 | SoD legacy-mode no-op |
| create-implementation-package | D.6 | ack-restoration assertions (steps only); SoD legacy-mode no-op |
| review-implementation-package | D.7 | |
| execute-increments | D.8 | ack-restoration on `02-execute-plan.md`; SoD legacy-mode no-op |
| manage-bugs | D.9a (mid-increment), D.9b (standalone) | both modes exercised explicitly |
| create-pr | D.10 | |
| create-quality-package | Q.1 | **new quality stage**; ack-restoration + SoD legacy-mode no-op observed |
| review-quality-package | Q.2 | **new quality stage**; SoD legacy-mode no-op observed |
| execute-quality-increments | Q.3 | **new quality stage** |
| audit-quality-coverage | Q.4 | **new quality stage**; execute-first reconciliation audit (read-only) |
| review-test-failures | Q.5 | **new quality stage**; triage of an injected failing test |
| document-quick-change | E.1 | |
| plan-quick-change | E.2 | |
| execute-quick-change | E.3 | |

**Skill coverage:** every skill in `.agents/skills/_registry/skills.csv` appears at least once in the matrix above (resolved against `<SKILL_COUNT>` from A.0). **Note: the row count is *unique skills*, not *invocations*.** Several skills are exercised more than once — `framework-navigator` (B.2 + B.3), `analyze-repository` (7× modern + 1× mainframe in C.1 / C.1m), `customize-framework` (B.4 + the C.0 `[[project.repos]]` enumeration), `start-project` (B.1 + D.1) — so the *invocation* count exceeds the *skill* count by a non-trivial margin. The "fully covered" claim refers to the skill axis only.

## 10. Out-of-band utilities not separately listed as steps

`framework-navigator` is exercised twice (B.2 + B.3); the registry/validator scripts (`scripts/build-registry.py`, `scripts/validate.py`) are exercised in A.1 + A.2 + A.7 + A.9; the ack-restoration sentinels are statically grep-checked in A.5; the SoD scaffold sentinels (Step-0 placement, `affects-repos` block, SCHEMAS.md SoD section, composition wiring, `.example` files) are statically checked in A.6, validated dynamically against deliberately-broken fixtures in A.7 (rules 7–12), and observed at runtime in D.2 / D.3 / D.4 / D.5 / D.6 / D.8 + Q.1 / Q.2 (legacy-mode no-op) and in the optional D.2-SoD variant (active-mode prompts and permission check). The source-adapter convention is statically checked in A.8; the pluggable add-on layer (`extra_skill_roots`, `aide-addon.toml` manifest, `[tools.*]` resolution, `{workspace}` token) is statically + dynamically checked in A.9–A.10.

## 11. Per-phase teardown checklist

At the end of each phase, run this consolidated sweep before moving on. The goal is to surface any drift that the per-step rollbacks missed, **not** to gate progress — record observations in `_docs/skills-test-results.md` under a `Phase <X> teardown` heading.

### 11.1  Status sweep (every phase)
```
# 1. Framework repo — should be clean (or only have intentional plan / results edits).
git -C ~/Dev/AIDE status --short

# 2. Sandbox project shell(s) — clean if all step rollbacks ran; surface deltas otherwise.
git -C ~/Dev/framework-tests/recipes-app    status --short 2>/dev/null
git -C ~/Dev/framework-tests/recipes-app-gf status --short 2>/dev/null

# 3. KB repo — clean if Phase C / E rollbacks ran.
git -C ~/Dev/framework-tests/recipes-kb status --short 2>/dev/null
```

Append the output of each command to the results file under the phase's teardown heading. **Non-empty output is not a failure** — it's an observation. The operator decides whether the unexpected diff is intentional (e.g., `_docs/skills-test-results.md` itself, which is supposed to grow) or a missed rollback.

### 11.2  Per-phase teardown specifics

| Phase | What to check / sweep |
|---|---|
| A | Validator output captured to results file. `scripts/test_fixtures/sod-negatives/` retained (now regression-test data for `scripts/test_validate.py`, not transient — A.7 rollback no longer applies). No stray edits under `.agents/skills/` from the rebuild. |
| B | `recipes-app/{project.toml, project.user.toml, CHANGE-TRACKER.md, docs/}` reflect only steps you ran. The B.4 brownfield flag remains set (Phase C depends on it). |
| C | `recipes-kb/source-docs/<repo>/` populated for every RE step that ran. `oss-clones/` clones are still shallow (`git rev-parse --is-shallow-repository` per repo). The KB itself (`recipes-kb/{ARCHITECTURE.md, components/, repos/, ...}`) is intact unless C.9 rollback ran. C.12 / C.13 / C.13b setup commits are reset against `_docs/.sha-pre-c12`. |
| D | `recipes-app-gf/` reset against `_docs/.sha-pre-d8` / `.sha-pre-d10` / `.sha-pre-e3` if you intend to teardown to a clean greenfield (or leave the artefacts in place if you want a follow-up sitting). `git stash list` inspected for any `*-pre-rollback` entries to restore. |
| Q | `recipes-app-gf/docs/quality/` populated by Q.1 (retain for reference or remove via Q.1 rollback). `recipes-app-gf/` reset against `_docs/.sha-pre-q3` if the Q.3 test increment should be undone; Q.5's flipped assertion restored via `git checkout`. `git stash list` inspected for `q3-pre-rollback`. |
| E | `recipes-app-gf/` working tree clean (E.3's commit-and-clean-tree criterion). `docs/cook-time/` either retained for reference or removed via E.1 + E.2 rollbacks. |

### 11.3  Stash inspection (Phase D / E only)

The Phase-D rollback protocol stashes uncommitted work before any `git reset --hard`. After teardown, inspect:
```
git -C ~/Dev/framework-tests/recipes-app-gf stash list
```

For each `*-pre-rollback` entry, decide: pop and inspect (if the work is worth recovering), or `stash drop` (if it was incidental). **Do not let `*-pre-rollback` stashes accumulate across runs** — they age out of usefulness fast and clutter `stash list`.

---

**End of plan.** Begin with Phase A.0 against the `mm/AIDE-core-changes` branch (resolves `<SKILL_COUNT>` = 42), then proceed through A.1 → A.10, B, C (through C.8.4), D, **Q**, E. After each phase ends, run §11's teardown checklist before moving to the next phase.
