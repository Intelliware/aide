# A.I.D.E. — Skills Test Plan

**Owner:** mike.moerman@electricmind.com
**Authored:** 2026-04-26
**Last revised:** 2026-04-30 — folds in the four release branches now integrated on `mm/add-all` (1.1.0 solution-context, 1.2.0 adversarial review, 1.3.0 COBOL/mainframe RE, 1.4.0 acknowledgement restoration).
**Scope:** End-to-end manual exercise of every skill shipped under `.agents/skills/` (43 skills, 8 stages). Anchored on Next.js as the framework being reverse-engineered into the central knowledge base; one small mainframe sample repo added in Phase C to exercise the mainframe RE layer.

## 1. Goals

1. Verify each of the 43 framework skills behaves per its `SKILL.md` description on a realistic input.
2. Validate the agentskills.io frontmatter, `references/` progressive-disclosure pattern, and `steps/` decomposition.
3. Exercise all three flows (greenfield, brownfield, quick-dev) end-to-end.
4. Build a usable Next.js-anchored knowledge base from open-source repos that span all 10 reverse-engineering domains (the original 7 plus 3 mainframe domains added in 1.3.0).
5. Verify the four post-1.0.1 release-branch additions land coherently on `mm/add-all`:
   - **1.1.0 solution-context layer** — `capture-solution-context`, `generate-ai-rules`, `document-operations` produce the human-grounded `<KB>/shared/` subtrees and slot into both flows at the positions declared in `_docs/solution-context-layer.md`.
   - **1.2.0 adversarial-review layer** — `meta/review-adversarial` and `meta/review-edge-case-hunter` are runnable standalone; the five `review-*-package` skills (3 existing + 2 new for RE and KB) wrap them as sub-reviews 7/8 (or 8/9 for KB) before their readiness gate; the shared Format 4 schema (`aide-adversarial-findings@1`) is honoured by every producer.
   - **1.3.0 mainframe RE layer** — `analyze-repository` classifies a small COBOL/copybook/JCL sample to the right new domain; the 3 new RE skills emit lineage feed-files; `build-mainframe-data-lineage` aggregates them into `<KB>/lineage/mainframe/` with the design-doc coverage rules satisfied.
   - **1.4.0 acknowledgement restoration** — every SDLC create/execute SKILL.md carries a top-level `## Verification rule (always-on)` section; every step file ends with `## Acknowledgement checkpoint`; the 4 large block templates carry the `AUTHORING RULE — sub-section acknowledgement` HTML-comment block; `Section relevance check` is unconditional in process.md and step files.
6. Surface defects (missing files, broken cross-refs, ambiguous handoffs, schema mismatches) with reproducible repro steps.

## 2. Non-goals

- Performance / latency benchmarking of the host (Cursor / Copilot).
- Re-deriving the framework's design — we test the shipped artifacts as-is.
- Testing every elicitation branch of every skill — we exercise the **golden path** plus one edge case per skill.

## 3. Test environment

| Item | Value |
|---|---|
| Framework repo | `~/Dev/A.I.D.E.` (this repo, `mm/add-all` branch — integrated 1.1.0 + 1.2.0 + 1.3.0 + 1.4.0) |
| Test sandbox root | `~/Dev/framework-tests/` (created during Phase A) |
| Greenfield sandbox project | `~/Dev/framework-tests/recipes-app/` |
| Knowledge-base repo | `~/Dev/framework-tests/recipes-kb/` (sibling repo, separate from the sandbox app) |
| Brownfield clone root | `~/Dev/framework-tests/oss-clones/` |
| Mainframe sample (1.3.0) | `~/Dev/framework-tests/oss-clones/mainframe-sample/` — small synthetic deck of `.cbl` + `.cpy` + `.jcl` (10–20 files; user-authored or pulled from a public teaching repo such as `IBM/the-art-of-modern-cobol` or similar). Used only by C.1m, C.8.1–C.8.3, and C.9.4 |
| Host under test | Whatever Mike has open (Claude Code session, Cursor, or VSCode + Copilot — record per phase) |
| Python | system `python3` (for `scripts/build-registry.py` and `scripts/validate.py`) |

> **Sandbox layout invariant:** the framework folder, the application folder, and the KB folder are always **three sibling folders** in one multi-root workspace. We mirror that layout in `framework-tests/` so paths in `project.toml` resolve normally.

## 4. Reverse-engineering candidate repos (Next.js-anchored + mainframe sample)

Selected to exercise all 10 domain RE skills (7 modern-stack + 3 mainframe added in 1.3.0) with small-to-medium open-source codebases. The Next.js / React group keeps the modern KB internally coherent; the mainframe sample is a separate, deliberately-small synthetic deck that exercises the cobol/copybook/jcl skills + `build-mainframe-data-lineage` aggregator without bringing a 100k-line legacy codebase into the test pass.

| # | Domain | Skill | Candidate repo | Why |
|---|---|---|---|---|
| 1 | api | `reverse-engineer-api` | `gothinkster/node-express-realworld-example-app` | Small REST API with auth + CRUD. Standard reference. Optional alt: a Next.js `app/api/*` slice from candidate #3. |
| 2 | api-framework | `reverse-engineer-api-framework` | `honojs/hono` | Modern, compact JS API framework. Pairs naturally with Next.js Edge runtime. |
| 3 | web-app | `reverse-engineer-web-app` | `vercel/commerce` | Canonical Next.js (App Router) example. Well-known, manageable size. |
| 4 | ui-framework | `reverse-engineer-ui-framework` | `shadcn-ui/ui` | The dominant Next.js component library. Tests `peerDependencies` classification path. |
| 5 | database | `reverse-engineer-database` | `documenso/documenso` (Prisma schema only) | Real Prisma schema with migrations; we point the skill at `packages/prisma/`. |
| 6 | mobile-app | `reverse-engineer-mobile-app` | `bluesky-social/social-app` | Active React Native + Expo app. |
| 7 | mobile-framework | `reverse-engineer-mobile-framework` | `nativewind/nativewind` | Small RN library with `peerDependencies` — exercises framework-vs-app distinction. |
| 8 | cobol-program | `reverse-engineer-cobol-program` | `mainframe-sample/programs/` (synthetic; a 3–5 program deck with `WORKING-STORAGE`, `PERFORM`, `CALL`, `EXEC SQL`, `EXEC CICS`) | Smallest realistic deck that exercises DIVISION-by-DIVISION extraction, the PERFORM/CALL graph, and EXEC SQL/CICS host-variable inventory. Emits the `program-call-graph.mmd` + `program-data-bindings.json` lineage feed-files needed by C.9.4. |
| 9 | copybook-library | `reverse-engineer-copybook-library` | `mainframe-sample/copybooks/` (synthetic; ~10 `.cpy` with `01–88` levels, `REDEFINES`, `OCCURS DEPENDING ON`, naming-convention prefixes) | The canonical "data-dictionary producer" — verifies REDEFINES variants are preserved, OCCURS expanded into indexed positions, and divergent-layout detection fires on a deliberately-duplicated copybook name. Emits `copybook-record-graph.json` + `data-dictionary.md` + `copybook-conflicts.md`. |
| 10 | jcl-job | `reverse-engineer-jcl-job` | `mainframe-sample/jcl/` (synthetic; 2–3 jobs with PROC + INCLUDE chains, GDG roll, IDCAMS + SORT control cards) | Verifies PROC expansion, DD inventory, GDG generation, and condition-code restart points. Emits `job-flow.mmd` + `dataset-io.json` lineage feed-files. |

Mirror choices (used only if a primary candidate is unavailable / too large): `nestjs/nest` (api-framework), `makeplane/plane` (web-app), `mantinedev/mantine` (ui-framework), `expo/expo` (mobile-framework). For the mainframe sample, an alternative is to lift a tiny COBOL teaching deck out of any public GnuCOBOL example repo or hand-author the 10–15 files; the design point is breadth (cobol + copybook + JCL all present) not size.

Clones live under `~/Dev/framework-tests/oss-clones/<repo>`. We **shallow-clone** (`--depth 1`) to minimize disk and network use. The mainframe sample lives at `~/Dev/framework-tests/oss-clones/mainframe-sample/{programs,copybooks,jcl}/` and is committed locally so source-version stamps in Part A frontmatter resolve.

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

We pause for Mike's verdict at the end of each step.

---

## Phase A — Static integrity (no skill invocations)

### A.1  Registry build  —  regenerate skills.csv + skills.json
**Trigger:** `python3 scripts/build-registry.py`
**Inputs:** Current `.agents/skills/**/SKILL.md` frontmatter.
**Expected outputs:** `.agents/skills/_registry/skills.csv` and `skills.json` written; 43 rows on `mm/add-all` (= 32 baseline + 3 from 1.1.0 + 4 from 1.2.0 + 4 from 1.3.0; 1.4.0 is restructure-only and adds no skills); exit code 0; no warnings about missing frontmatter.
**Pass criteria:**
- [ ] Exit code 0
- [ ] CSV contains 43 data rows
- [ ] Diff vs the committed CSV is empty (or only the rebuild-timestamp line)
- [ ] All 11 new skills are present: `capture-solution-context`, `generate-ai-rules`, `document-operations`, `review-adversarial`, `review-edge-case-hunter`, `review-reverse-engineering-package`, `review-knowledge-base-package`, `reverse-engineer-cobol-program`, `reverse-engineer-copybook-library`, `reverse-engineer-jcl-job`, `build-mainframe-data-lineage`
**Rollback:** `git checkout -- .agents/skills/_registry/`.

### A.2  Validator  —  cross-references + workflow graph
**Trigger:** `python3 scripts/validate.py`
**Inputs:** Registry, `workflow-graph.yaml`, all SKILL.md frontmatter, all `templates/compositions/*.yaml`.
**Expected outputs:** Clean run — 0 errors and ≤ 2 pre-existing warnings (the empty-`requires-decision-from` notes on `templates/blocks/requirements/{completeness-tracker,index}.md`, both legitimate and well-known). All 8 checks (A–H) report `(no findings)` or only the known noise.

The validator's checks of interest for this step:
- **Check A** (post-F-002): orphan-block detection counts both composition `blocks:` lists AND direct `templates/blocks/<slug>.md` references inside skill markdown. Should produce no orphan warnings.
- **Check D** (post-F-001): stale `phase` vocabulary check honours per-file `<!-- validate: allow-phase-vocab -->` pragmas. The 9 known migration-doc files carry the pragma; new files without it that introduce phase-vocab will be flagged.
- **Check H** (post-F-005): every `reverse-engineer-*/SKILL.md` cites both compositions by name AND contains the mandatory `## Output structure (mandatory)` section. New RE skills without these will be flagged.

**Pass criteria:**
- [ ] Exit code 0 (no hard errors)
- [ ] Exactly 0 Check D phase-vocab warnings (the 9 pragma-bearing files mask their own; new violations would surface here)
- [ ] Check A reports no orphan blocks (post-F-002 wider lookup)
- [ ] Check H reports no missing-sentinel or missing-composition findings (post-F-005)
- [ ] Total warnings ≤ 2, all on the known empty-`requires-decision-from` block frontmatter
- [ ] No unresolved skill references in workflow-graph (Check B)

**Rollback:** none — read-only.

### A.3  Self-documenting standard  —  every skill has the trio
**Inputs:** `.agents/skills/<stage>/<skill>/references/{OVERVIEW,INPUTS-OUTPUTS,EXAMPLE}.md`
**Expected outputs:** all three files present for every skill except where the SKILL.md explicitly notes otherwise.
**Pass criteria:**
- [ ] Spot-check 4 skills (1 from meta, 1 from RE, 1 from KB, 1 from quick-dev) — trio present
- [ ] SKILL.md ≤ 200 lines (sample 4 same as above)
**Rollback:** none — read-only.

### A.4  Composition manifests resolve to existing blocks
**Trigger:** the validator already covers this; this step re-confirms by hand on one composition.
**Inputs:** `templates/compositions/greenfield-requirements-package.yaml`
**Expected outputs:** every block referenced exists under `templates/blocks/requirements/`.
**Pass criteria:**
- [ ] All listed blocks resolve to a real file
**Rollback:** none.

### A.5  Acknowledgement sentinels  —  static grep for the 1.4.0 restoration
**Trigger:** four greps over `.agents/skills/` and `templates/blocks/`:
```
grep -rln "## Verification rule (always-on)" .agents/skills/
grep -rln "## Acknowledgement checkpoint"     .agents/skills/
grep -rln "AUTHORING RULE — sub-section acknowledgement" templates/blocks/
grep -rn  "Section relevance check (unconditional)" .agents/skills/
```
**Inputs:** Read-only over the post-merge tree.
**Expected outputs:**
- Grep 1 returns exactly 4 SKILL.md files: `requirements/create-requirements-package`, `design/create-design-package`, `planning/create-implementation-package`, `execution/execute-increments`.
- Grep 2 returns the step files at the tail of each affected step (multiple per skill).
- Grep 3 returns exactly 4 block templates: `templates/blocks/requirements/functional-requirements.md`, `business-logic-rules.md`, `templates/blocks/design/api-design.md`, `database-design.md`.
- Grep 4 returns hits in both `requirements/.../references/process.md` and `design/.../references/process.md` (Stage-2 unconditional-relevance edit).

**Pass criteria:**
- [ ] All 4 grep counts match the design-doc expectations from `_docs/plan-restore-acknowledgement.md` § 3.
- [ ] No file carries the verbatim `## Verification rule (always-on)` heading more than once (catches accidental duplication during merge).
- [ ] The 4 block templates carry the `AUTHORING RULE` block **inside an HTML comment** (so it doesn't render in the assembled package). Confirm by `grep -B1 "AUTHORING RULE"` showing `<!--` on the line above.
- [ ] The conditional clause "if relevance is in question" is **absent** from the post-merge `process.md` Step 0 row in both create-requirements and create-design (this is the core of Change B; its presence post-merge would mean the unconditional rewrite was lost).

**Rollback:** none — read-only.

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
- [ ] `project.toml` parses with `python3 -c "import tomllib; tomllib.loads(open('project.toml').read())"`
- [ ] All 6 elicitation phases ran one at a time (not bundled)
- [ ] Handoff phrase is unambiguous
**Rollback:** `rm project.toml project.user.toml 2>/dev/null`.

### B.2  framework-navigator  —  goal mode
**Trigger phrase:** "I have a Next.js app I'd like to reverse-engineer into the KB. What should I run?"
**Inputs:** No `project.toml` in CWD (run from `~/Dev/framework-tests/`).
**Expected outputs:** Recommendation = `start-project` (because no `project.toml` yet) or, if invoked from `recipes-app/` after B.1, `analyze-repository`.
**Pass criteria:**
- [ ] Recommendation is a single named skill
- [ ] Trigger phrase to invoke it is provided verbatim
- [ ] No work is performed by the navigator itself
**Rollback:** none.

### B.3  framework-navigator  —  catalog mode
**Trigger phrase:** "Show me all the skills."
**Expected outputs:** Stage-grouped list of all 43 skills with one-line descriptions.
**Pass criteria:**
- [ ] All 8 stages represented
- [ ] All 43 skills listed (including the 11 added across 1.1.0–1.3.0)
- [ ] `meta` stage lists `review-adversarial` + `review-edge-case-hunter`
- [ ] `reverse-engineering` stage lists the 3 mainframe RE skills + `review-reverse-engineering-package`
- [ ] `knowledge-base` stage lists the 3 solution-context skills + `build-mainframe-data-lineage` + `review-knowledge-base-package`
**Rollback:** none.

### B.4  customize-framework  —  scalar override
**Trigger phrase:** "For this project I want `default_flow` to be `brownfield`."
**Inputs:** `project.toml` from B.1.
**Expected outputs:** edit applied via the customize-framework workflow (not a hand-edit by the user) into the right config layer (`project.toml`).
**Pass criteria:**
- [ ] Skill identifies the right config layer (`project.toml`, not `framework.user.toml`)
- [ ] Override visible in the file
- [ ] No unrelated lines touched (the override line itself may also gain the SKILL.md-mandated inline rationale comment — that is part of the override, not collateral damage; per F-003 fix)
**Rollback:** flip the value back manually.

### B.5  scaffold-documentation  —  set up RE doc skeleton
**Trigger phrase:** "Scaffold the docs structure for a brownfield reverse-engineering of `vercel/commerce`."
**Inputs:** `project.toml` (B.4 state).
**Expected outputs:** Empty doc tree under `docs/reverse-engineering/vercel-commerce/` with placeholders matching the RE composition.
**Pass criteria:**
- [ ] Folder tree matches the composition
- [ ] No content authored yet (structure only)
**Rollback:** `rm -rf docs/reverse-engineering`.

### B.6  shard-document  —  split a fat markdown file
**Setup:** Create a 400-line markdown file `docs/SAMPLE.md` with multiple H2 sections.
**Trigger phrase:** "Shard `docs/SAMPLE.md` at H2 boundaries."
**Expected outputs:** `docs/sample/<section-slug>.md` per H2; original file resolved (deleted, replaced with index, or left — skill should ask).
**Pass criteria:**
- [ ] One file per H2
- [ ] Section bodies preserved intact
- [ ] Original file resolution explicit (not silent)
**Rollback:** `git checkout -- docs/`.

### B.7  track-change  —  log an edit to the change tracker
**Trigger phrase:** "Log this scaffold work into the change tracker."
**Expected outputs:** `CHANGE-TRACKER.md` initialised at the right path with one entry.
**Pass criteria:**
- [ ] Entry has Parts Affected, source-version, verification status
- [ ] Format matches `templates/blocks/meta/` change-tracker block
**Rollback:** `git checkout -- CHANGE-TRACKER.md` (or delete).

### B.8  verify-source  —  audit one assembled artifact
**Setup:** Use the scaffolded RE structure from B.5 + a one-paragraph stub Part A doc with one fabricated claim.
**Trigger phrase:** "Verify this Part A doc against source."
**Expected outputs:** Findings split into completeness / accuracy / consistency / change-tracking.
**Pass criteria:**
- [ ] Fabricated claim flagged
- [ ] No false positives on the verifiable claim
**Rollback:** delete stub.

### B.9  review-adversarial  —  attitude-driven anytime review (1.2.0)
**Setup:** Author a deliberately-weak draft requirements section at `~/Dev/framework-tests/scratch/weak-requirements.md` containing weasel words ("performant", "scalable"), an unsupported claim, and a hidden assumption (e.g., "all users have stable internet").
**Trigger phrase:** "Run an adversarial review on `~/Dev/framework-tests/scratch/weak-requirements.md` (--stage=requirements)."
**Inputs:** The weak draft + an explicit `--stage=requirements` hint.
**Expected outputs:** Findings file at `_review/weak-requirements/<timestamp>/review-adversarial.md` carrying the Format-4 schema (`schema: aide-adversarial-findings@1`, `target_artifact`, `target_path`, `target_commit`, `produced_by`, `stage`, `severity_counts`, `triage_counts`, `worst_severity`).
**Pass criteria:**
- [ ] At least one **critical** finding for each weasel word (Measurability lens)
- [ ] At least one **high** finding for the hidden assumption (Hidden assumptions lens)
- [ ] Each finding follows the design-doc structure: original claim → adversarial counter → recommended fix
- [ ] Frontmatter parses; `severity_counts` and `triage_counts` agree with the body
- [ ] Findings file path uses the standalone-mode pattern (`_review/<artifact-slug>/<timestamp>/<skill>.md`), not the wrapper-mode pattern
**Rollback:** `rm -rf _review/weak-requirements/`.

### B.10  review-edge-case-hunter  —  method-driven anytime review (1.2.0)
**Setup:** Reuse the same weak draft as B.9 but extend it with a one-paragraph "system behaviour" section describing a function with implicit edges: pagination over a list (no mention of empty-list, max-page, or concurrent-write), an integer counter (no overflow/underflow handling), a date filter (no timezone or DST handling).
**Trigger phrase:** "Hunt edge cases in `~/Dev/framework-tests/scratch/weak-requirements.md`."
**Expected outputs:** Findings file at `_review/weak-requirements/<timestamp>/review-edge-case-hunter.md` using the same Format-4 schema with `produced_by: review-edge-case-hunter`.
**Pass criteria:**
- [ ] At least one finding under each of three of the seven edge-case categories: boundaries (empty/max), data shapes (overflow), time/clock (timezone)
- [ ] Findings report **only unhandled** edges — present / handled cases are not enumerated
- [ ] No overlap with B.9's findings (the two skills are intentionally orthogonal: attitude-driven vs method-driven)
- [ ] `worst_severity` reflects the worst category found, per `references/review-patterns/review-verdict-mapping.md`
**Rollback:** `rm -rf _review/weak-requirements/`.

---

## Phase C — Brownfield: RE + Knowledge Base

Sandbox prep (one-time before C.1):
```
mkdir -p ~/Dev/framework-tests/oss-clones
mkdir -p ~/Dev/framework-tests/recipes-kb
```

Then shallow-clone the 7 candidate repos under `oss-clones/` (we'll do this on demand, one repo at a time, to keep disk use bounded — `--depth 1` and `git gc` after).

**F-006 fix — `[[project.repos]]` enumeration step.** Before reaching C.9 (`build-knowledge-base`), populate the project.toml with one `[[project.repos]]` block per cloned repo. Run `customize-framework` against the existing `recipes-app/project.toml` (in scope = `project-team`) to add seven entries:

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

This step is **mandatory before C.9** — `build-knowledge-base/steps/01-validate-target.md` halts with a copyable error if the array is empty (the post-F-006 fail-loud guard). Without these entries the brownfield flow doesn't reach the KB stage.

> **Note on running RE skills inside Claude Code:** the framework declares Claude Code "currently not supported" in `README.md`. We exercise the skills here by treating the assistant as the agent and reading each `SKILL.md` + `steps/*` as the playbook — exactly what a Cursor / Copilot agent would do. If a step relies on `/`-discovery in the host (e.g., elicitation prompts), we simulate it inline.

### Universal Phase-C pass criteria (post-F-005)

These criteria apply to **every** `reverse-engineer-*` invocation in C.2–C.8. They reflect the post-F-005 framework state where each RE skill's `SKILL.md` carries a mandatory `## Output structure (mandatory)` section binding output to the composition's block list.

For every C.2–C.8 step, the per-skill pass criteria below must be checked **in addition to** these universal criteria:

- [ ] **Part A** rendered as a tree under `<source-repo-path>/docs/<re-domain>-internal/`, **not** consolidated into a single `.md`.
- [ ] **Part B** rendered as a tree under `<knowledge_base_path>/source-docs/<repo-slug>/<re-domain>-consumer/`, also tree-shaped.
- [ ] **File naming follows `<NN>-<bare-slug>.md`** — `<NN>` is the 1-based zero-padded sort index after sorting blocks by their `order` value; `<bare-slug>` is the block slug with the `reverse-eng/<re-domain>/internal/` (or `…/consumer/`) prefix stripped.
- [ ] **Gated-out blocks are absent** from disk (no empty placeholder file). A block whose `decision-gates: include-if:` evaluates false is omitted entirely.
- [ ] **No ad-hoc deep-dive files** outside the `<NN>-<bare-slug>.md` scheme. The composition's block list is canonical.
- [ ] **Subset rule for Part B** preserved — every Part B claim traces back to a fact in Part A; Part B is internal-detail-free.
- [ ] **Supplementary artifacts** (e.g., `openapi.yaml` for API; `data-dictionary.md` + `erd.mmd` for database) live at the **Part-B directory root** alongside the consumer/ tree, not inside it.

Validator Check H enforces the SKILL.md side; the on-disk shape of the produced artifacts is the operator's adjudication during the test pass.

### C.1  analyze-repository  —  classify all 7 modern candidate repos
**Trigger phrase per repo:** "What kind of project is `<repo>`? Which RE skill should I run?"
**Inputs:** A clone of each candidate at `~/Dev/framework-tests/oss-clones/<repo>/`.
**Expected outputs:** For each repo a structured classification (type, language, stack, recommended skill, monorepo handling). For monorepos (e.g., `shadcn-ui/ui`) sub-projects classified independently.
**Pass criteria:**
- [ ] 7 repos × 1 classification each = 7 verdicts
- [ ] No misclassifications (you adjudicate)
- [ ] Monorepo cases produce ordered skill list
- [ ] Each verdict ends with the exact next-skill trigger phrase
**Rollback:** none.

### C.1m  analyze-repository  —  classify the mainframe sample (1.3.0 dispatcher extension)
**Trigger phrase:** "What kind of project is `~/Dev/framework-tests/oss-clones/mainframe-sample`? Which RE skill should I run?"
**Inputs:** The synthetic mainframe deck at `~/Dev/framework-tests/oss-clones/mainframe-sample/{programs,copybooks,jcl}/`.
**Expected outputs:** Classification verdict that recognises mainframe content (post-1.3.0 1c′ extension-density step) and emits the **mainframe-monorepo ordering rule**: copybook-library → cobol-program → jcl-job → build-mainframe-data-lineage.
**Pass criteria:**
- [ ] Detection signals fire correctly: `.cbl/.cob/.cpy/.pli/.jcl/.proc/.bms/.dbd/.psb` extension census, `IDENTIFICATION DIVISION.` source-line marker, `EXEC CICS/SQL/DLI` markers, `JOB`/`STEP`/`SYSIN` JCL markers (where present in the sample).
- [ ] Three sub-classifications produced (one each for `programs/`, `copybooks/`, `jcl/`).
- [ ] The ordered skill list is exactly: `reverse-engineer-copybook-library` → `reverse-engineer-cobol-program` → `reverse-engineer-jcl-job` → `build-mainframe-data-lineage`. (Order matters: copybooks emit the canonical record graph before programs reference fields; programs emit data-bindings before JCL pins a step's program; lineage is last.)
- [ ] Verdict ends with the exact next-skill trigger phrase for the FIRST skill (`reverse-engineer-copybook-library`).
**Rollback:** none.

### C.2  reverse-engineer-api  —  RealWorld Express backend
**Trigger phrase:** "Reverse-engineer this API repo at `~/Dev/framework-tests/oss-clones/realworld-api`."
**Expected outputs:**
- **Part A** (internal): tree at `<repo>/docs/api-internal/<NN>-<bare-slug>.md` per `re-api-internal.yaml`'s block list (~25 blocks rendered, depending on elicitation gates).
- **Part B** (consumer): tree at `recipes-kb/source-docs/realworld-api/api-consumer/<NN>-<bare-slug>.md` per `re-api-consumer.yaml` (~13 blocks).
- **Supplementary** (API-skill specific): `recipes-kb/source-docs/realworld-api/openapi.yaml` at the Part-B directory root, sibling to the consumer/ tree.

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] Part A's filled blocks cover controllers, models, and middleware (e.g., `01-api-overview`, `05-project-structure-and-conventions`, `07-middleware-and-request-pipeline`, `08-authentication-and-authorization-internals`, `12-domain-models-and-business-rules`).
- [ ] Supplementary `openapi.yaml` validates (use `npx @redocly/cli lint`).
- [ ] Part B's `04-endpoint-catalog.md` (or equivalent) carries at least one end-to-end consumer flow.

**Rollback:** `rm -rf recipes-kb/source-docs/realworld-api && rm -rf <oss-clones>/realworld-api/docs/api-internal`.

### C.3  reverse-engineer-api-framework  —  Hono
**Trigger:** "Reverse-engineer the API framework at `~/Dev/framework-tests/oss-clones/hono`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/api-framework-internal/<NN>-<bare-slug>.md` per `re-api-framework-internal.yaml` (~22 blocks; some gated by `framework_provides_di` / `framework_provides_data_access` / `framework_ships_cli`).
- **Part B**: tree at `recipes-kb/source-docs/hono/api-framework-consumer/<NN>-<bare-slug>.md` per `re-api-framework-consumer.yaml` (~22 blocks).

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] Part B's filled blocks explain install, write a route, add middleware, and deploy targets (e.g., `02-environment-and-configuration`, `04-request-pipeline-and-middleware`, `16-recipes-and-common-patterns`).
- [ ] Internal vs implementer split is clean — Part A's `04-middleware-pipeline` documents `compose.ts` internals; Part B's equivalent block defers internals to Part A.

**Rollback:** `rm -rf recipes-kb/source-docs/hono && rm -rf <oss-clones>/hono/docs/api-framework-internal`.

### C.4  reverse-engineer-web-app  —  vercel/commerce
**Trigger:** "Reverse-engineer the web app at `~/Dev/framework-tests/oss-clones/commerce`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/web-app-internal/<NN>-<bare-slug>.md` per `re-web-app-internal.yaml` (~24 blocks; `12-forms-and-validation` gated by `has_forms`, `14-internationalization-i18n` by `has_i18n`).
- **Part B**: tree at `recipes-kb/source-docs/commerce/web-app-consumer/<NN>-<bare-slug>.md` per `re-web-app-consumer.yaml` (12 blocks).

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] Part A `05-routing-and-navigation` documents the App-Router page structure with rendering strategy per route.
- [ ] Part A `07-component-architecture` calls out the server vs client component split with concrete file names.
- [ ] Part A `13-feature-modules` traces the cart / product / checkout flows with file maps + flow diagrams.

**Rollback:** `rm -rf recipes-kb/source-docs/commerce && rm -rf <oss-clones>/commerce/docs/web-app-internal`.

### C.5  reverse-engineer-ui-framework  —  shadcn-ui/ui
**Trigger:** "Reverse-engineer the UI framework at `~/Dev/framework-tests/oss-clones/shadcn-ui`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/ui-framework-internal/<NN>-<bare-slug>.md` per `re-ui-framework-internal.yaml` (~22 blocks; some gated by `framework_has_directives_or_pipes` / `framework_provides_routing` / `framework_provides_i18n`).
- **Part B**: tree at `recipes-kb/source-docs/shadcn-ui/ui-framework-consumer/<NN>-<bare-slug>.md` per `re-ui-framework-consumer.yaml` (~25 blocks).

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] Part B's `05-components` lists the component catalog (≥5 components per family or a representative sample).
- [ ] Theming / dark-mode story documented (Part A `13-styling-architecture` + Part B `04-theming-styling-and-responsive-design`).
- [ ] `peerDependencies` framework-vs-application model explicitly called out — for shadcn/ui the unusual answer is "scaffold-and-conventions framework, not a runtime npm dependency".

**Rollback:** `rm -rf recipes-kb/source-docs/shadcn-ui && rm -rf <oss-clones>/shadcn-ui/docs/ui-framework-internal`.

### C.6  reverse-engineer-database  —  documenso Prisma schema
**Trigger:** "Reverse-engineer the database under `~/Dev/framework-tests/oss-clones/documenso/packages/prisma`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/database-internal/<NN>-<bare-slug>.md` per `re-database-internal.yaml` (~23 blocks; gated by `has_views`, `has_materialized_views`, `has_stored_procedures`, `has_triggers`).
- **Part B**: tree at `recipes-kb/source-docs/documenso/database-consumer/<NN>-<bare-slug>.md` per `re-database-consumer.yaml` (6 blocks; `03-working-with-stored-procedures` gated).
- **Supplementary** (database-skill specific): `recipes-kb/source-docs/documenso/data-dictionary.md` + `erd.mmd` at the Part-B directory root.

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] Every model from `schema.prisma` has a data-dictionary entry in the supplementary `data-dictionary.md`.
- [ ] Supplementary `erd.mmd` parses as a Mermaid ER diagram with edges for every FK in the schema.
- [ ] Part A `15-migrations-and-versioning` acknowledges the migration history (count + key inflection points).

**Rollback:** `rm -rf recipes-kb/source-docs/documenso && rm -rf <oss-clones>/documenso/packages/prisma/docs/database-internal`.

### C.7  reverse-engineer-mobile-app  —  bluesky/social-app
**Trigger:** "Reverse-engineer the mobile app at `~/Dev/framework-tests/oss-clones/bluesky-social`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/mobile-app-internal/<NN>-<bare-slug>.md` per `re-mobile-app-internal.yaml` (~27 blocks; gated by `has_deep_links`, `has_push_notifications`, `has_native_modules`).
- **Part B**: tree at `recipes-kb/source-docs/bluesky-social/mobile-app-consumer/<NN>-<bare-slug>.md` per `re-mobile-app-consumer.yaml` (~10 blocks; `04-webview-and-embedding` gated by `has_webview_or_embedding`, `08-app-config-via-mdm` by `is_distributed_via_mdm`).

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] Part A `01-application-overview` + `03-project-structure-and-organization` document iOS + Android (and web, when applicable) entry points.
- [ ] Part A `06-navigation-structure` captures the navigation graph (tabs + per-tab native stacks).
- [ ] Part A `11-api-integration-and-networking` (or `08-state-management`) identifies the state-management approach.

**Rollback:** `rm -rf recipes-kb/source-docs/bluesky-social && rm -rf <oss-clones>/bluesky-social/docs/mobile-app-internal`.

### C.8  reverse-engineer-mobile-framework  —  nativewind
**Trigger:** "Reverse-engineer the mobile framework at `~/Dev/framework-tests/oss-clones/nativewind`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/mobile-framework-internal/<NN>-<bare-slug>.md` per `re-mobile-framework-internal.yaml` (~22 blocks; gated by `framework_owns_layout`, `has_ota_updates`).
- **Part B**: tree at `recipes-kb/source-docs/nativewind/mobile-framework-consumer/<NN>-<bare-slug>.md` per `re-mobile-framework-consumer.yaml` (~23 blocks; `15-native-bridge-and-module-documentation` gated by `framework_has_native_bridge`).

**Pass criteria** (in addition to the universal Phase-C criteria above):
- [ ] `peerDependencies` framework-vs-application classification confirmed in Part A `01-architecture-overview` + Part B `01-framework-overview`.
- [ ] Public API surface documented — Part A `21-source-layout` enumerates the `package.json` `exports` map; Part B `06-services-and-utilities` documents the runtime API.
- [ ] Setup-in-an-Expo-app walk-through included in Part B `03-installation-and-setup` (install + 3 config files + entry CSS + verify).

**Rollback:** `rm -rf recipes-kb/source-docs/nativewind && rm -rf <oss-clones>/nativewind/docs/mobile-framework-internal`.

### C.8.1  reverse-engineer-copybook-library  —  mainframe sample copybooks (1.3.0)
**Trigger phrase:** "Reverse-engineer the copybook library at `~/Dev/framework-tests/oss-clones/mainframe-sample/copybooks`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/copybook-library-internal/<NN>-<bare-slug>.md` per `re-copybook-library-internal.yaml` (~12 blocks).
- **Part B**: tree at `recipes-kb/source-docs/mainframe-sample/copybook-library-consumer/<NN>-<bare-slug>.md` per `re-copybook-library-consumer.yaml` (~6 blocks).
- **Supplementary** (mandatory for this skill): `recipes-kb/source-docs/mainframe-sample/copybook-record-graph.json`, `data-dictionary.md`, `copybook-conflicts.md` at the Part-B directory root.

**Pass criteria** (in addition to the universal Phase-C criteria):
- [ ] Every `01-` record across the sample copybooks appears as a node in `copybook-record-graph.json` with REDEFINES collapsed into named variants and OCCURS expanded into indexed positions.
- [ ] `data-dictionary.md` groups fields by naming-convention prefix (e.g., `WS-`, `IO-`, `LS-`, `DB2-`) per the design doc's bucket model.
- [ ] If the sample includes a deliberately-duplicated copybook name (recommended), `copybook-conflicts.md` flags the divergent layout.
- [ ] Part B does **not** include internal level-by-level layouts (subset rule honoured).

**Rollback:** `rm -rf recipes-kb/source-docs/mainframe-sample/copybook-library-consumer recipes-kb/source-docs/mainframe-sample/{copybook-record-graph.json,data-dictionary.md,copybook-conflicts.md} && rm -rf <oss-clones>/mainframe-sample/copybooks/docs/copybook-library-internal`.

### C.8.2  reverse-engineer-cobol-program  —  mainframe sample programs (1.3.0)
**Trigger phrase:** "Reverse-engineer the COBOL programs at `~/Dev/framework-tests/oss-clones/mainframe-sample/programs`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/cobol-program-internal/<NN>-<bare-slug>.md` per `re-cobol-program-internal.yaml` (~16 blocks).
- **Part B**: tree at `recipes-kb/source-docs/mainframe-sample/cobol-program-consumer/<NN>-<bare-slug>.md` per `re-cobol-program-consumer.yaml` (~6 blocks).
- **Supplementary** (mandatory): `program-call-graph.mmd`, `program-data-bindings.json`, and `program-exec-inventory.md` per program at the Part-B directory root.

**Pass criteria** (in addition to the universal Phase-C criteria):
- [ ] Each program's Part A documents all four DIVISIONs and a SECTION/PARAGRAPH outline.
- [ ] `program-call-graph.mmd` parses as Mermaid; `CALL` / `PERFORM` / `XCTL` edges to other programs in the deck resolve to nodes (programs not present in the deck are explicitly flagged "external").
- [ ] `program-data-bindings.json` keys every host variable in any `EXEC SQL ... INTO :host-var` (or out-binding) back to a copybook field present in C.8.1's `copybook-record-graph.json`.
- [ ] EXEC CICS / EXEC SQL / EXEC DLI inventories are non-empty when the source contains them; absent / empty when it does not.
- [ ] Part B contains a "program contract" section (entry points, expected DD names, observable side effects) but no internal PERFORM-level detail.

**Rollback:** `rm -rf recipes-kb/source-docs/mainframe-sample/cobol-program-consumer recipes-kb/source-docs/mainframe-sample/{program-call-graph.mmd,program-data-bindings.json,program-exec-inventory.md} && rm -rf <oss-clones>/mainframe-sample/programs/docs/cobol-program-internal`.

### C.8.3  reverse-engineer-jcl-job  —  mainframe sample JCL (1.3.0)
**Trigger phrase:** "Reverse-engineer the JCL at `~/Dev/framework-tests/oss-clones/mainframe-sample/jcl`."
**Expected outputs:**
- **Part A**: tree at `<repo>/docs/jcl-job-internal/<NN>-<bare-slug>.md` per `re-jcl-job-internal.yaml` (~11 blocks).
- **Part B**: tree at `recipes-kb/source-docs/mainframe-sample/jcl-job-consumer/<NN>-<bare-slug>.md` per `re-jcl-job-consumer.yaml` (~5 blocks).
- **Supplementary** (mandatory): `job-flow.mmd` + `dataset-io.json` at the Part-B directory root.

**Pass criteria** (in addition to the universal Phase-C criteria):
- [ ] PROC + INCLUDE expansion is fully resolved in Part A (no `// PROC <name>` references left unresolved unless the proc is genuinely external).
- [ ] DD inventory (DSN, DISP, GDG generation) is enumerated per step.
- [ ] Condition codes and restart points captured.
- [ ] `dataset-io.json` records, per job × step × DD, the (DSN, DISP, program-invoked) tuple and resolves the program-invoked field to a node in C.8.2's `program-data-bindings.json` when the program is present in the deck.
- [ ] `job-flow.mmd` parses as Mermaid and shows step→step edges with DD I/O annotated.

**Rollback:** `rm -rf recipes-kb/source-docs/mainframe-sample/jcl-job-consumer recipes-kb/source-docs/mainframe-sample/{job-flow.mmd,dataset-io.json} && rm -rf <oss-clones>/mainframe-sample/jcl/docs/jcl-job-internal`.

### C.8.4  review-reverse-engineering-package  —  per-repo gate against the RealWorld API output (1.2.0)
**Setup:** Re-use C.2's RealWorld API Part A + Part B output. (The skill is per-repo; we exercise it once on a meaty modern-stack repo and again on the mainframe sample in C.8.5.)
**Trigger phrase:** "Review the reverse-engineering package for `realworld-api` before KB ingestion."
**Inputs:** Part A under `<oss-clones>/realworld-api/docs/api-internal/`, Part B under `recipes-kb/source-docs/realworld-api/api-consumer/`, supplementary `openapi.yaml`.
**Expected outputs:** A package-review directory at `<recipes-kb>/source-docs/realworld-api/_review/<timestamp>/` containing 9 sub-review files (`review-section-completeness.md`, `review-grounding.md`, `review-consistency.md`, `review-coverage.md`, `review-freshness.md`, `review-traceability.md`, `review-adversarial.md`, `review-edge-case-hunter.md`, `review-readiness.md`) and a top-level verdict.

**Pass criteria:**
- [ ] All 9 sub-reviews ran in order; FAIL on any one halts the sequence per the existing `review-*-package` pattern.
- [ ] Sub-reviews 7 and 8 are the **wrapper-mode** invocations of the new anytime skills — their output paths are inside the package-review directory (not under `_review/<artifact-slug>/`).
- [ ] Frontmatter on the wrapper-mode files carries `produced_by: review-adversarial` (resp. `review-edge-case-hunter`) and `target_artifact: reverse-engineering-package`.
- [ ] The readiness verdict consumes severities per `references/review-patterns/review-verdict-mapping.md`: critical→FAIL halts; high→PASS WITH OBSERVATIONS; medium/low→advisory.
- [ ] Coverage tables in the sub-review match what `re-api-internal.yaml` + `re-api-consumer.yaml` declare (post-1.3.0 the same skill carries extended coverage tables for cobol/copybook/jcl, but those are exercised in C.8.5).

**Rollback:** `rm -rf recipes-kb/source-docs/realworld-api/_review/`.

### C.8.5  review-reverse-engineering-package  —  per-repo gate on the mainframe sample (1.2.0 + 1.3.0 coverage tables)
**Trigger phrase:** "Review the reverse-engineering package for the mainframe-sample repo."
**Inputs:** The three Part A trees produced by C.8.1–C.8.3 + their three Part B trees + the lineage feed-files at the Part-B directory root.
**Expected outputs:** Same 9-sub-review structure as C.8.4 but reading the 1.3.0 coverage-table extensions (cobol-program, copybook-library, jcl-job rows in the `review-section-completeness` block).
**Pass criteria:**
- [ ] The completeness sub-review references the three mainframe domains' block lists (post-1.3.0 extension).
- [ ] The grounding sub-review checks that every claim in Part A traces to a file under `programs/`, `copybooks/`, or `jcl/` (paths in component frontmatter resolve).
- [ ] The traceability sub-review confirms all required lineage feed-files (`copybook-record-graph.json`, `program-data-bindings.json`, `program-call-graph.mmd`, `dataset-io.json`, `job-flow.mmd`) are present at the Part-B directory root.
- [ ] Wrapper sub-reviews 7/8 fire with `--stage=reverse-engineering` and produce Format-4 findings.
**Rollback:** `rm -rf recipes-kb/source-docs/mainframe-sample/_review/`.

### C.9  build-knowledge-base  —  scaffold the KB
**Trigger:** "Build the knowledge base from the source-docs we just produced."
**Inputs:** All 7 modern-stack RE outputs (from C.2–C.8) plus the 3 mainframe RE outputs (from C.8.1–C.8.3) deposited under `recipes-kb/source-docs/<repo>/`. `project.toml` declares `knowledge_base_path = "../recipes-kb"`.
**Expected outputs:** Full KB layout under `recipes-kb/`:
- `ARCHITECTURE.md` — now begins with **§ 0 Solution Overview** (post-1.1.0) linking to `<KB>/shared/{solution-context, ai-rules, operations}/` with `pending` annotations because the leaves do not yet exist (they're produced by C.9.1–C.9.3).
- `CLAUDE.md` — read-order block extended (post-1.1.0) to instruct AI agents on when to consult solution-context, ai-rules, and operations leaves.
- `graph.json`
- `glossary.md`, `change-tracker.md`
- `repos/<slug>/`
- `components/<slug>/<component-id>.md` per public artifact
- `shared/{entities,cross-cutting,adrs,integration-patterns}/` (existing)
- `shared/{solution-context, ai-rules, operations}/` — **new in 1.1.0**, scaffolded empty here, populated in C.9.1–C.9.3.
- `synthesized/01..10/`
**Pass criteria:**
- [ ] Every public artifact in source-docs maps to ≥1 component file
- [ ] `graph.json` parses, edges are bidirectionally consistent
- [ ] Each component has the mandatory frontmatter (description, triggers, paths, depends_on, consumed_by, last_verified_against_commit with full 40-char SHA)
- [ ] No source-doc content duplicated into component bodies
- [ ] **§ 0 Solution Overview** is present at the top of `ARCHITECTURE.md` with `pending` annotations on the three subtree links (post-1.1.0 step 06-emit-architecture-index.md).
- [ ] `shared/{solution-context, ai-rules, operations}/` directories exist (empty is acceptable here; they get filled in C.9.1–C.9.3).
- [ ] `CLAUDE.md` read-order section explicitly mentions the three new subtrees.
**Rollback:** `rm -rf recipes-kb/{ARCHITECTURE.md,CLAUDE.md,graph.json,glossary.md,change-tracker.md,repos,components,shared,synthesized}`.

### C.9.1  capture-solution-context  —  fill the human-grounded leaves (1.1.0)
**Trigger phrase:** "Capture solution context for this project."
**Inputs:** The KB scaffold from C.9 + the operator's answers to the 7-step interactive elicitation (mission, personas, goals/KPIs, constraints, external integrations, ownership/RACI; the Recipes-KB has only 7 source repos, so we treat the project as a synthetic Next.js-anchored multi-repo platform for the purpose of these answers).
**Expected outputs:** Six markdown leaves under `<KB>/shared/solution-context/` (`00-overview.md`, `10-personas-and-use-cases.md`, `20-goals-and-kpis.md`, `30-constraints-and-compliance.md`, `40-external-integrations.md`, `50-ownership-and-raci.md`) plus a glossary delta merged into `recipes-kb/glossary.md`.
**Pass criteria:**
- [ ] All 6 leaves present and non-empty
- [ ] Each leaf carries trigger-style frontmatter (`description: Use when …`, `triggers: [...]`) so `navigate-knowledge-base` can surface them later (post-1.1.0)
- [ ] Glossary delta applied — at least 3 new project terms recorded
- [ ] `--non-interactive` mode (if exercised) leaves `TODO(human):` markers rather than fabricating content
- [ ] `ARCHITECTURE.md` § 0 link annotations flip from `pending` to active (the skill is supposed to update them on emission)
**Rollback:** `rm -rf recipes-kb/shared/solution-context && git -C recipes-kb checkout -- glossary.md ARCHITECTURE.md`.

### C.9.2  generate-ai-rules  —  hybrid auto + interactive (1.1.0)
**Trigger phrase:** "Generate the AI rules for this project."
**Inputs:** RE Part A docs from C.2–C.8 (auto-derivation source: tech-stack versions, build/test commands, lint configs) + interactive answers for the unobvious rules (commit conventions, review etiquette, testing philosophy).
**Expected outputs:** `<KB>/shared/ai-rules/project-context.md` (the canonical rules file) plus `<KB>/shared/ai-rules/per-repo/<repo-slug>.md` only when stack divergence between repos warrants it (the modern-stack group is mostly Next.js; the mainframe-sample is a clear divergence — at minimum one per-repo override is expected here).
**Pass criteria:**
- [ ] `project-context.md` exists and contains both the auto-derived sections (tech-stack pin lines per repo) and the elicited sections (testing, commits, etc.)
- [ ] At least one `per-repo/<slug>.md` exists, almost certainly for `mainframe-sample` (the divergence between Next.js and COBOL is the canonical worked example in `references/EXAMPLE.md`)
- [ ] Auto-derived sections cite their source (the RE Part A frontmatter `last_verified_against_commit` SHA)
- [ ] No `TODO(human):` markers if this run was interactive
**Rollback:** `rm -rf recipes-kb/shared/ai-rules`.

### C.9.3  document-operations  —  hybrid auto + interactive (1.1.0)
**Trigger phrase:** "Document the operations for this project."
**Inputs:** Per-repo CI/CD configs from the cloned repos (e.g., `.github/workflows/`, `vercel.json`, `Dockerfile`s where present) + RE Part B deployment sections + interactive answers for SLOs / on-call / runbooks.
**Expected outputs:** Four leaves under `<KB>/shared/operations/` (`00-deployment-topology.md`, `10-environments-and-secrets.md`, `20-slos-and-monitoring.md`, `30-runbooks-and-oncall.md`). If the runbooks index exceeds 6 rows, additional files appear under `<KB>/shared/operations/runbooks/<runbook-slug>.md`.
**Pass criteria:**
- [ ] All 4 leaves present
- [ ] `00-deployment-topology.md` lists each repo's deploy target (auto-derived from CI configs where possible)
- [ ] `30-runbooks-and-oncall.md` is either ≤6 rows OR splits cleanly into `runbooks/` files
- [ ] `--non-interactive` mode (if exercised on a small subset) leaves `TODO(human):` markers
- [ ] `ARCHITECTURE.md` § 0 link annotations now show all three subtrees as active (post C.9.1–C.9.3)
**Rollback:** `rm -rf recipes-kb/shared/operations`.

### C.9.4  build-mainframe-data-lineage  —  KB aggregator across the 3 mainframe Part B feeds (1.3.0)
**Trigger phrase:** "Build the mainframe data lineage for this knowledge base."
**Inputs:** The 5 lineage feed-files produced by C.8.1–C.8.3:
- `recipes-kb/source-docs/mainframe-sample/copybook-record-graph.json` (from C.8.1)
- `recipes-kb/source-docs/mainframe-sample/program-data-bindings.json` (from C.8.2)
- `recipes-kb/source-docs/mainframe-sample/program-call-graph.mmd` (from C.8.2)
- `recipes-kb/source-docs/mainframe-sample/program-exec-inventory.md` (from C.8.2)
- `recipes-kb/source-docs/mainframe-sample/dataset-io.json` (from C.8.3)
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
- [ ] Every copybook in `copybook-record-graph.json` appears in `copybook-where-used.md` (with empty list explicitly noted for unused copybooks).
- [ ] Every program in `program-data-bindings.json` appears as a node in `job-program-dataset-chain.mmd` if any JCL references it; otherwise flagged "not invoked from documented JCL".
- [ ] Every host-var in EXEC SQL inventories resolves to a copybook field or is flagged "unbound" (the deliberate-unbound-host-var case is a recommended sample to author into the deck so this rule has something to fire on).
- [ ] `move-chain.md` traces at least one canonical field from copybook source → program PERFORM → program output → JCL DD → downstream dataset.
- [ ] `lineage-summary.md` is keyed by canonical field name (the design-doc top-level index).

**Rollback:** `rm -rf recipes-kb/lineage/mainframe`.

### C.10  verify-knowledge-base-coverage  —  baseline coverage report
**Trigger:** "Verify KB coverage."
**Expected outputs:** Orphan + stale + warning report; baseline run, no deltas.
**Pass criteria:**
- [ ] No orphans (every component traces to source-docs)
- [ ] No KB-only entries lacking source backing
**Rollback:** report is informational; nothing to roll back.

### C.11  navigate-knowledge-base  —  feature-grounding query
**Trigger:** "Find the minimal KB component set needed to add OAuth login to a Next.js app like `vercel/commerce`."
**Expected outputs:** A ranked list of component file paths to load, no full-KB read.
**Pass criteria:**
- [ ] List is ranked
- [ ] All listed files exist
- [ ] Top-3 are obviously the most relevant (you adjudicate)
- [ ] The skill does **not** read the entire KB itself
**Rollback:** none.

### C.12  detect-knowledge-base-drift  —  inject a drift signal
**Setup:** Touch a file inside `oss-clones/commerce/` (e.g., add a route) and commit, so the source HEAD differs from the KB's `last_verified_against_commit`.
**Trigger:** "Run a drift sweep."
**Expected outputs:** Drift report flagging the affected component(s) with severity and recommended action.
**Pass criteria:**
- [ ] Affected component flagged
- [ ] Untouched repos report no drift
- [ ] Severity assigned per the layered detection rules
**Rollback:** `git -C oss-clones/commerce reset --hard HEAD~1` (re-clone is fine too).

### C.13  update-knowledge-base  —  apply the drift fix (catalog scope)
**Trigger:** "Update the KB for the change we just detected."
**Expected outputs:** Only the matched components edited; `change-tracker.md` appended; `graph.json` incrementally regenerated; ADR emitted only if a threshold is crossed.
**Pass criteria:**
- [ ] No full rebuild
- [ ] Affected component frontmatter updated (`last_verified_against_commit`)
- [ ] Graph delta consistent
**Rollback:** `git -C recipes-kb checkout -- .`.

### C.14  review-knowledge-base-package  —  periodic global KB audit (1.2.0 + 1.3.0)
**Trigger phrase:** "Review the knowledge base — full periodic audit."
**Inputs:** The fully-built KB from C.9 + C.9.1–C.9.4 + drift-fix from C.13.
**Expected outputs:** A package-review directory at `recipes-kb/_review/<timestamp>/` with 10 sub-review files (`review-architecture-index.md`, `review-component-coverage.md`, `review-graph-integrity.md`, `review-frontmatter-integrity.md`, `review-staleness.md`, `review-link-integrity.md`, `review-solution-context-coverage.md`, `review-adversarial.md`, `review-edge-case-hunter.md`, `review-readiness.md`) plus a top-level verdict.

Sub-review 2 internally calls `verify-knowledge-base-coverage`; sub-review 5 calls `detect-knowledge-base-drift` L1 — verify these are orchestrated, not re-implemented.

The 1.3.0 deferred patch (`_docs/cobol-mainframe-review-integration.md`) calls for an additional `review-mainframe-lineage-integrity` sub-review when `lineage/mainframe/` exists; if your `mm/add-all` carries that patch landed, the count is 11. If the patch is documented-only at this point, the count is 10 and the lineage-integrity check is reported as "not yet integrated" — record that as a finding rather than a Fail.

**Pass criteria:**
- [ ] All sub-reviews ran in order; FAIL on any halts the sequence per the existing pattern.
- [ ] Sub-review 7 (solution-context coverage) confirms the three subtrees from C.9.1–C.9.3 are present and non-empty.
- [ ] Sub-reviews 8 and 9 are wrapper-mode invocations of `review-adversarial` / `review-edge-case-hunter` with `--stage=knowledge-base`; their findings files live inside the package-review directory, not under `_review/<artifact-slug>/`.
- [ ] Final readiness verdict is one of PASS / PASS WITH OBSERVATIONS / FAIL, per `references/review-patterns/review-verdict-mapping.md`.
- [ ] The skill is **not** wired as a per-PR gate (it's intentionally periodic) — confirm by checking `workflow-graph.yaml` does not list it under any flow's `gates:`; it lives under `anytime:`.
- [ ] If the 1.3.0 deferred-patch lineage check is wired, every artifact under `recipes-kb/lineage/mainframe/` is integrity-checked against the source feed-files.

**Rollback:** `rm -rf recipes-kb/_review/`.

---

## Phase D — Greenfield SDLC on the Recipes app

Sandbox prep (one-time before D.1) — flip flow back to greenfield via `customize-framework` or by re-running `start-project` in a fresh sibling. Easiest is a fresh sibling:
```
mkdir -p ~/Dev/framework-tests/recipes-app-gf
cd       ~/Dev/framework-tests/recipes-app-gf
git init -q
```

### D.1  start-project  —  greenfield (re-run, clean slate)
**Trigger phrase:** "Bootstrap a greenfield Next.js project called Recipes."
**Expected outputs:** `project.toml` with `default_flow = "greenfield"`, paths set, glossary seeded with `Recipe`, `Tag`, `Favorite`. Handoff to `capture-solution-context` (post-1.1.0; in greenfield the solution-context layer runs **before** create-requirements-package per `workflow-graph.yaml`).
**Pass criteria:**
- [ ] `project.toml` parses
- [ ] Glossary contains the three project terms
- [ ] Handoff phrase names `capture-solution-context` (not `create-requirements-package`) — this is the post-1.1.0 ordering
**Rollback:** `rm -rf ~/Dev/framework-tests/recipes-app-gf`.

### D.1.5  capture-solution-context  —  greenfield position (1.1.0)
**Trigger phrase:** "Capture solution context for the Recipes project."
**Inputs:** `project.toml` from D.1; the Recipes scenario from §5; no RE Part A docs yet (this is greenfield so the skill is purely interactive).
**Expected outputs:** Six leaves under `<knowledge_base_path>/shared/solution-context/` (the path resolves via `project.toml`; for the greenfield sandbox we point `knowledge_base_path` at `~/Dev/framework-tests/recipes-kb-gf/`).
**Pass criteria:**
- [ ] All 6 leaves emitted with non-empty content (or `TODO(human):` markers if `--non-interactive` was used; the default mode for this test is interactive).
- [ ] Glossary delta merged into the project glossary, not the KB glossary (the project doesn't have a built KB yet — this is the greenfield branch of the skill's logic).
- [ ] Handoff phrase names `create-requirements-package` (the next step in the greenfield sequence).
**Rollback:** `rm -rf ~/Dev/framework-tests/recipes-kb-gf/shared/solution-context && git checkout -- ~/Dev/framework-tests/recipes-app-gf/glossary*.md` (or the equivalent if glossary is project-resident).

### D.2  create-requirements-package  —  full requirements stage
**Trigger:** "Create the requirements package for Recipes."
**Inputs:** Scenario from §5 of this plan + the solution-context leaves from D.1.5 (the requirements package now grounds in human-grounded context).
**Expected outputs:** Requirements package on disk per `templates/compositions/greenfield-requirements-package.yaml` — overview, exec summary, FRs (≥3), NFRs (auth + perf), ACs, glossary, change-log.
**Pass criteria:**
- [ ] All composition blocks present
- [ ] FRs are testable (each has at least one AC)
- [ ] No `[NEEDS CLARIFICATION:]` markers left
- [ ] **(1.4.0 ack-restoration)** The skill announces and reads back the top-level "Verification rule (always-on)" from its SKILL.md before drafting (observable: a chat message restating the rule, not silent).
- [ ] **(1.4.0 ack-restoration)** Section relevance check fires unconditionally for every block — operator is asked Yes / No (with reason) / Skip / Not sure for **every** block, not only when relevance is in question.
- [ ] **(1.4.0 ack-restoration Change C — iterative blocks)** When drafting `functional-requirements.md` and `business-logic-rules.md`, the skill loops per item: state heading → draft → present → ask "Approve, change, or skip?" → wait → next. Operator records that the per-item loop fired and was non-skippable.
- [ ] **(1.4.0 ack-restoration)** Each step file ends with the `## Acknowledgement checkpoint` summarise-and-wait gate before handing to the next step.
**Rollback:** `rm -rf docs/requirements`.

### D.3  review-requirements-package  —  gate (1.2.0 wrappers exercised)
**Trigger:** "Review the requirements package."
**Expected outputs:** GO / NO-GO verdict with findings on scope, completeness, consistency, measurability, testability **plus** the two wrapped sub-reviews `review-adversarial-pass` and `review-edge-cases` that were inserted at positions 10 and 11 in the post-1.2.0 sequence (now 12 sub-reviews; readiness gate is 12 / last).
**Pass criteria:**
- [ ] One overall verdict
- [ ] Findings cite specific sections / FR IDs
- [ ] **(1.2.0)** Sub-review 10 produced a wrapper-mode `review-adversarial.md` inside the package-review directory (not under `_review/<artifact-slug>/`). Frontmatter `produced_by: review-adversarial`, `target_artifact: requirements-package`, `stage: requirements`.
- [ ] **(1.2.0)** Sub-review 11 produced a wrapper-mode `review-edge-case-hunter.md` similarly.
- [ ] **(1.2.0)** Severity → verdict mapping observed: any `critical` halts the sequence; any `high` produces PASS WITH OBSERVATIONS; only `medium`/`low` cleanly pass.
- [ ] **(1.2.0)** If FAIL halted the sequence, the readiness gate (sub-review 12) did NOT run (per the existing FAIL-halts pattern).
**Rollback:** none.

### D.4  create-design-package  —  full design stage
**Trigger:** "Create the design package."
**Expected outputs:** Design package per `templates/compositions/greenfield-design-package.yaml` — C4 L1 + L2 (and L3 for the recipe service), tech-stack pin (Next.js version, Prisma version, SQLite), API design (Next.js Route Handlers), data model, NFR strategies, traceability matrix back to FRs.
**Pass criteria:**
- [ ] C4 diagrams render (Mermaid syntax valid)
- [ ] Every FR appears in the traceability matrix
- [ ] Tech-stack versions pinned, not "latest"
- [ ] **(1.4.0 ack-restoration)** Same four ack-criteria as D.2: Verification rule announced; unconditional relevance check; per-item loop on `api-design.md` and `database-design.md` (the two design-stage iterative blocks); Acknowledgement checkpoint at each step end.
**Rollback:** `rm -rf docs/design`.

### D.5  review-design-package  —  gate (1.2.0 wrappers exercised)
**Trigger:** "Review the design."
**Expected outputs:** GO / NO-GO with architecture, security posture, NFR-strategy verdicts. Post-1.2.0 the sequence is 5 sub-reviews: existing 3 + `review-adversarial-pass` (3) + `review-edge-cases` (4) + `review-solution-readiness` (5).
**Pass criteria:**
- [ ] At least one finding (no rubber-stamp)
- [ ] Overall verdict is unambiguous
- [ ] **(1.2.0)** Wrapper sub-reviews 3 and 4 produced their Format-4 findings files inside the package-review directory with `stage: design`.
- [ ] **(1.2.0)** FAIL on either wrapper sub-review halts the sequence before `review-solution-readiness` runs.
**Rollback:** none.

### D.5.5  generate-ai-rules  —  greenfield position (1.1.0)
**Trigger phrase:** "Generate the AI rules now that the design is fixed."
**Inputs:** The design package from D.4 (tech-stack is now pinned — that's the auto-derivation source the skill needs) + the solution-context leaves from D.1.5.
**Expected outputs:** `<KB>/shared/ai-rules/project-context.md` (one file, no per-repo overrides expected since greenfield has a single repo).
**Pass criteria:**
- [ ] `project-context.md` cites the design package as its tech-stack source (with the pinned versions, not "latest").
- [ ] No `per-repo/` directory created (single-repo project — divergence threshold not met).
- [ ] Handoff phrase names `create-implementation-package` (next greenfield skill).
**Rollback:** `rm -rf <knowledge_base_path>/shared/ai-rules`.

### D.6  create-implementation-package  —  decompose into INC-XXX
**Trigger:** "Create the implementation package."
**Expected outputs:** Implementation package with 3–4 `INC-XXX` increments conforming to the Canonical Increment Shape (8 sections).
**Pass criteria:**
- [ ] Each increment has all 8 canonical sections
- [ ] Order is executable (no forward dependencies)
- [ ] FR coverage matrix complete
- [ ] **(1.4.0 ack-restoration)** Verification rule announced + Acknowledgement checkpoint at each step end (the planning stage has no iterative-block list, so per-item loops do not apply here).
**Rollback:** `rm -rf docs/planning`.

### D.7  review-implementation-package  —  pre-execution gate (1.2.0 wrappers exercised)
**Trigger:** "Review the implementation package."
**Expected outputs:** GO / NO-GO + per-increment findings. Post-1.2.0 the sequence is 10 sub-reviews; sub-reviews 8 (`review-adversarial-pass`) and 9 (`review-edge-cases`) feed findings into the consolidated issue list rather than halting (per the design-doc deviation for the planning stage), severities mapped Critical/Important/Minor.
**Pass criteria:**
- [ ] Per-increment verdict
- [ ] Increment-shape compliance confirmed
- [ ] **(1.2.0)** Wrapper sub-reviews 8 and 9 ran and produced their Format-4 findings files inside the package-review directory with `stage: planning`.
- [ ] **(1.2.0)** Adversarial findings appear in the **consolidated issue list** (planning-stage deviation — not halting). Severities Critical/Important/Minor visible in the issue list.
- [ ] **(1.2.0)** Final implementation-readiness verdict (sub-review 10) ran even when wrappers found Critical issues — confirming the planning-stage deviation from the standard FAIL-halts pattern.
**Rollback:** none.

### D.8  execute-increments  —  ship INC-001
**Trigger:** "Execute INC-001."
**Expected outputs:** Increment INC-001 implemented under `recipes-app-gf/` with TDD (tests-first), AI Gate result, Human Gate result, increment-status updated.
**Pass criteria:**
- [ ] Tests written before code
- [ ] Tests pass
- [ ] Increment-status file updated
- [ ] Closing handoff to `update-knowledge-base` emitted
- [ ] **(1.4.0 ack-restoration)** Verification rule announced; Acknowledgement checkpoint fired at the end of `02-execute-plan.md` (the only step that received Stage-1 reinforcement; gates 03/04/05 already had strict halts).
**Rollback:** `git -C ~/Dev/framework-tests/recipes-app-gf reset --hard <pre-d8-sha>`.

### D.9  manage-bugs  —  log + triage
**Setup:** Inject a deliberate bug during D.8 review (e.g., a known failing edge case).
**Trigger:** "Log a bug for the failing case." then "Triage open bugs."
**Expected outputs:** `bugs-and-issues-log.md` with the entry; triage produces severity + assignee.
**Pass criteria:**
- [ ] Entry has the canonical fields (id, title, repro, severity, status)
- [ ] Skill works whether or not an increment is currently being executed
**Rollback:** `rm bugs-and-issues-log.md`.

### D.10  create-pr  —  package the diff
**Trigger:** "Create a PR for INC-001."
**Expected outputs:** Atomic conventional commits (one per logical change) + PR description with summary + test plan + (post-F-007) a CHANGELOG.md entry when `[project.change_log]` is enabled.

The skill walks 6 steps: (1) diff review, (2) fix cycle, (3) atomic commits, (4) PR description, (5) PR creation, (6) changelog entry.

**Mode flag — local sandbox vs. real GitHub remote.** The Recipes greenfield sandbox has no GitHub remote, so step 5 is **simulated**: produce the exact `gh pr create --title ... --body-file ...` command in a `pr-create-command.md` file and skip the actual push. Steps 1–4 + 6 run for real. If you re-run this test with a project that has a real remote, run step 5 live.

**Pass criteria:**
- [ ] Commit messages are conventional (`<type>(<scope>): <subject>`); each commit traces to the INC-XXX or FR it addresses
- [ ] No "WIP" or noise commits
- [ ] PR body has both Summary and Test plan sections (use `templates/compositions/pr-description.yaml`)
- [ ] **F-007 changelog gate** — verify create-pr step 6 reads `[project.change_log]` from `project.toml`:
    - When **`enabled = true`**: a new entry is prepended to the configured `path` (default `CHANGELOG.md`) under an `Unreleased` section, formatted per `versioning_strategy` + `format`. The block content uses the project-level `parts_affected_vocabulary`.
    - When **`enabled = false` (or table absent)**: step 6 silently skips with no `CHANGELOG.md` write. The skill must NOT silently no-op for some other reason — silent-skip is reserved for the explicit `enabled = false` case.
- [ ] If running against the local sandbox: a `pr-create-command.md` file documents the would-be `gh pr create` invocation; no actual push occurred.

**Rollback:** `git reset --soft <pre-d10-sha>` to un-commit; do **not** push.

### D.10.5  document-operations  —  greenfield position (1.1.0)
**Trigger phrase:** "Document the operations for Recipes."
**Inputs:** The implemented code from D.8 + any CI config that exists (likely a `.github/workflows/ci.yml` if Mike adds one; otherwise the skill enters its `optional-when: "no infra files yet"` branch declared in `workflow-graph.yaml`).
**Expected outputs:** If CI exists: four leaves under `<KB>/shared/operations/` (with the four canonical names from §C.9.3). If no CI exists: the skill stops cleanly with a "no infra files yet" handoff and emits zero leaves — this is the optional-when branch.
**Pass criteria:**
- [ ] If CI exists: all 4 leaves present, deployment topology auto-derived from the workflow file, runbooks index ≤6 rows or split into `runbooks/` files.
- [ ] If no CI: zero leaves emitted; handoff message is exactly the "no infra files yet" wording from the skill's SKILL.md (not a fabricated `TODO(human):` placeholder).
- [ ] Handoff phrase names `update-knowledge-base` (the closing-skill handoff at end of execution) — confirms greenfield-tail position.
**Rollback:** `rm -rf <knowledge_base_path>/shared/operations`.

---

## Phase E — Quick-dev on the Recipes app

Sandbox: continues from D.10's repo state.

### E.1  document-quick-change  —  spec the cookTime feature
**Trigger phrase:** "Quick change: add a `cookTime` field to recipes and surface it on the list view."
**Expected outputs:** `docs/cook-time/quick-dev-package/<feature-id>-quick-dev-spec.md` with overview, exec-summary, FRs, ACs, glossary delta.
**Pass criteria:**
- [ ] Single artifact (not split into requirements + design)
- [ ] At least one Acceptance Criterion is a trigger + observable
- [ ] No `[NEEDS CLARIFICATION:]` markers left
**Rollback:** `rm -rf docs/cook-time`.

### E.2  plan-quick-change  —  break into 1–3 increments
**Trigger:** "Plan the quick change."
**Expected outputs:** Lightweight plan (reduced increment shape), 1–3 increments, clarity-gate verdict.
**Pass criteria:**
- [ ] Increments are sized to fit the change (likely 2: schema migration + UI surface)
- [ ] Clarity gate either PASS or with a small list of asks
**Rollback:** `rm <plan file>`.

### E.3  execute-quick-change  —  implement, verify, commit
**Trigger:** "Execute the quick change."
**Expected outputs:** Code change with TDD, 3-dimension verification (unit, behaviour, integration), atomic commits, handoff to `update-knowledge-base --scope=catalog-only`.
**Pass criteria:**
- [ ] Tests written before code
- [ ] All three verification dimensions covered
- [ ] Final commit clean; PR-ready
- [ ] KB update handoff fires (we don't need to actually run it for this scenario unless the KB exists in this sandbox)
**Rollback:** `git reset --hard <pre-e3-sha>`.

---

## 8. Test-execution conventions

- We pause at the **end of every step** for Mike's verdict: Pass / Fail / Partial / Skip + free-form notes.
- A **Fail** records the issue in `_docs/skills-test-results.md` (created on first Fail), names the skill, names the affected artifact, names the fix-owner.
- A **Partial** records the partial-pass note plus what's missing; we do not block the next step on a partial unless it would cascade.
- A **Skip** records the reason (out of scope today, environment unavailable, etc.) and we move on.
- After each Phase ends, we summarise verdicts as a small table.

## 9. Coverage matrix

| Skill | Phase.Step | Notes |
|---|---|---|
| start-project | B.1, D.1 | |
| framework-navigator | B.2, B.3 | post-1.3.0 catalog must list 43 |
| customize-framework | B.4 | |
| scaffold-documentation | B.5 | |
| shard-document | B.6 | |
| track-change | B.7 | |
| verify-source | B.8 | |
| review-adversarial | B.9, plus wrapper-mode in D.3, D.5, D.7, C.8.4, C.8.5, C.14 | new in 1.2.0 |
| review-edge-case-hunter | B.10, plus wrapper-mode in D.3, D.5, D.7, C.8.4, C.8.5, C.14 | new in 1.2.0 |
| analyze-repository | C.1 (×7) + C.1m (mainframe sample) | post-1.3.0 dispatcher extension |
| reverse-engineer-api | C.2 | |
| reverse-engineer-api-framework | C.3 | |
| reverse-engineer-web-app | C.4 | |
| reverse-engineer-ui-framework | C.5 | |
| reverse-engineer-database | C.6 | |
| reverse-engineer-mobile-app | C.7 | |
| reverse-engineer-mobile-framework | C.8 | |
| reverse-engineer-copybook-library | C.8.1 | new in 1.3.0 |
| reverse-engineer-cobol-program | C.8.2 | new in 1.3.0 |
| reverse-engineer-jcl-job | C.8.3 | new in 1.3.0 |
| review-reverse-engineering-package | C.8.4 (modern) + C.8.5 (mainframe) | new in 1.2.0 |
| build-knowledge-base | C.9 | post-1.1.0 § 0 Solution Overview verified |
| capture-solution-context | C.9.1 (brownfield position), D.1.5 (greenfield position) | new in 1.1.0 |
| generate-ai-rules | C.9.2 (brownfield), D.5.5 (greenfield) | new in 1.1.0 |
| document-operations | C.9.3 (brownfield), D.10.5 (greenfield) | new in 1.1.0 |
| build-mainframe-data-lineage | C.9.4 | new in 1.3.0 |
| verify-knowledge-base-coverage | C.10 | post-1.1.0 also warns on missing shared/ leaves |
| navigate-knowledge-base | C.11 | post-1.1.0 returns solution-context tier matches |
| detect-knowledge-base-drift | C.12 | post-1.1.0 L4 layer adds solution-context staleness |
| update-knowledge-base | C.13 | |
| review-knowledge-base-package | C.14 | new in 1.2.0; periodic gate, not per-PR |
| create-requirements-package | D.2 | post-1.4.0 ack-restoration assertions |
| review-requirements-package | D.3 | post-1.2.0 12 sub-reviews, wrappers exercised |
| create-design-package | D.4 | post-1.4.0 ack-restoration assertions |
| review-design-package | D.5 | post-1.2.0 5 sub-reviews, wrappers exercised |
| create-implementation-package | D.6 | post-1.4.0 ack-restoration (steps only) |
| review-implementation-package | D.7 | post-1.2.0 10 sub-reviews; wrappers feed consolidated issue list |
| execute-increments | D.8 | post-1.4.0 ack-restoration on `02-execute-plan.md` |
| manage-bugs | D.9 | |
| create-pr | D.10 | |
| document-quick-change | E.1 | |
| plan-quick-change | E.2 | |
| execute-quick-change | E.3 | |

43 / 43 skills covered.

## 10. Out-of-band utilities not separately listed as steps

`framework-navigator` is exercised twice (B.2 + B.3); the registry/validator scripts (`scripts/build-registry.py`, `scripts/validate.py`) are exercised in A.1 + A.2; the 1.4.0 acknowledgement-restoration sentinels are statically grep-checked in A.5; the wrapped-adversarial sub-reviews (1.2.0) are exercised whenever any `review-*-package` skill runs (so they pile up additional wrapper-mode evidence in D.3, D.5, D.7, C.8.4, C.8.5, C.14 alongside the standalone B.9/B.10 invocations).

---

**End of plan.** Begin with Phase A.1 against the integrated `mm/add-all` branch.
