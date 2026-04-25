# Skill Disposition Audit — theframework Unification
*Audit completed 2026-04-25. Verdicts are recommendations; final lifting happens in migration task #6 (Lift surviving skills).*

## Summary

- Total skills audited: **30**
- KEEP: **15**
- FOLD: **12**
- DROP: **3**
- SPLIT: **0**
- New skills required to fill coverage gaps: **8** (start-project, customize-framework, build-knowledge-base, navigate-knowledge-base, update-knowledge-base, detect-knowledge-base-drift, verify-knowledge-base-coverage, document-quick-change/plan-quick-change/execute-quick-change derivation set — see gaps section)

The dominant pattern: every model-2 sub-phase skill (discovery / analysis / writing / review per stage) maps to a richer mono-skill in the domain folders; model-2 contributes lighter modular DNA, and the domain folders contribute deeper templates and battle-tested workflow content. The unified target keeps the domain-folder skill as the primary lift target for greenfield-elaborate stages, with model-2's granular reference docs folded in as `steps/` files. Reverse engineering skills lift cleanly with light renaming. Quick-dev derives from model-2's `expedited-implementation-package`. The eight `bmad-*` parent coordinators (`requirements-package`, `solutions-package`, `implementation-package`) DROP because flow orchestration is being rebuilt as YAML compositions in migration task #5.

## Disposition table

| # | Source path | Verdict | Target / fold target | DNA | One-line reason |
|---|---|---|---|---|---|
| 1 | `_shared/skills/document-sharding/SKILL.md` | KEEP | `skills/meta/shard-document/` | shared | Generic doc-sharding utility, cross-stage; rename folder, add YAML frontmatter, add references/. |
| 2 | `_shared/skills/framework-navigator/SKILL.md` | KEEP | `skills/meta/framework-navigator/` | shared | Lifted+upgraded as help router (task #12); needs full rewrite for new stage map and slash-command vocabulary. |
| 3 | `_shared/skills/track-change/SKILL.md` | KEEP | `skills/meta/track-change/` | shared | Universal change-log utility used by every stage; lift verbatim, add references/, no terminology issues. |
| 4 | `requirements-package/skills/create-requirements-package/SKILL.md` | KEEP | `skills/requirements/create-requirements-package/` | greenfield-elaborate | Domain skill with 9-step process, 14 section templates, completeness tracker — primary lift target for requirements stage. |
| 5 | `solution-design-package/skills/create-solution-design-package/SKILL.md` | KEEP | `skills/design/create-design-package/` | greenfield-elaborate | Domain skill with 11-step design process and C4 hooks — primary lift target for design stage. |
| 6 | `implementation-planning/skills/create-implementation-package/SKILL.md` | KEEP | `skills/planning/create-implementation-package/` | greenfield-elaborate | Owns the Canonical Phase Shape (8-section structure) — must be renamed to "increment shape" / INC-XXX. |
| 7 | `reverse-engineering/skills/analyze-repository/SKILL.md` | KEEP | `skills/reverse-engineering/analyze-repository/` | RE-dispatcher | The RE entry-point dispatcher; lift with classification table intact. |
| 8 | `reverse-engineering/skills/build-knowledge-repository/SKILL.md` | FOLD | `skills/knowledge-base/build-knowledge-base/` (new) | KB-seed | Provides the 10-component KB structure; folded as design seed for the NEW build-knowledge-base skill (task #10). |
| 9 | `reverse-engineering/skills/reverse-engineer-api/SKILL.md` | KEEP | `skills/reverse-engineering/reverse-engineer-api/` | RE-domain | One of the 7 domain RE skills; lift verbatim with references/ added. |
| 10 | `reverse-engineering/skills/reverse-engineer-api-framework/SKILL.md` | KEEP | `skills/reverse-engineering/reverse-engineer-api-framework/` | RE-domain | Domain RE skill; lift verbatim. |
| 11 | `reverse-engineering/skills/reverse-engineer-database/SKILL.md` | KEEP | `skills/reverse-engineering/reverse-engineer-database/` | RE-domain | Domain RE skill; lift verbatim. |
| 12 | `reverse-engineering/skills/reverse-engineer-mobile-app/SKILL.md` | KEEP | `skills/reverse-engineering/reverse-engineer-mobile-app/` | RE-domain | Domain RE skill; lift verbatim. |
| 13 | `reverse-engineering/skills/reverse-engineer-mobile-framework/SKILL.md` | KEEP | `skills/reverse-engineering/reverse-engineer-mobile-framework/` | RE-domain | Domain RE skill; lift verbatim. |
| 14 | `reverse-engineering/skills/reverse-engineer-ui-framework/SKILL.md` | KEEP | `skills/reverse-engineering/reverse-engineer-ui-framework/` | RE-domain | Domain RE skill; lift verbatim. |
| 15 | `reverse-engineering/skills/reverse-engineer-web-app/SKILL.md` | KEEP | `skills/reverse-engineering/reverse-engineer-web-app/` | RE-domain | Domain RE skill; lift verbatim. |
| 16 | `reverse-engineering/skills/scaffold-documentation/SKILL.md` | FOLD | each `skills/reverse-engineering/reverse-engineer-*/` (as `steps/scaffold.md`) | RE-shared | Cross-RE utility; the canonical "structure before content" rule belongs as a shared step inside each RE skill's references/. |
| 17 | `reverse-engineering/skills/verify-extraction/SKILL.md` | FOLD | each `skills/reverse-engineering/reverse-engineer-*/` (as `steps/verify.md`) + `skills/meta/verify-source/` | RE-shared | Verification logic is universal; primary fold into RE skills' references; if a meta `verify-source` skill is desired, also lift the generic checklist there. |
| 18 | `model-2-sdlc-skills/expedited-implementation-package/SKILL.md` | KEEP | `skills/quick-dev/execute-quick-change/` (root reference) | rapid-dev | Primary DNA source for quick-dev; its expedited-implementation-workflow.md becomes the spine of the three quick-dev skills. |
| 19 | `model-2-sdlc-skills/implementation-package/implementation-execution/SKILL.md` | FOLD | `skills/execution/execute-increments/` (NEW or repurposed) | rapid-dev | TDD/verification execution loop folds in as the execution stage spine; rename PHASE→INC, "task" stays. |
| 20 | `model-2-sdlc-skills/implementation-package/implementation-package/SKILL.md` | DROP | — | rapid-dev | Pure parent-coordinator routing skill; flow orchestration moves to YAML compositions (task #5). |
| 21 | `model-2-sdlc-skills/implementation-package/implementation-plan/SKILL.md` | FOLD | `skills/planning/create-implementation-package/` (as `references/implementation-plan-workflow.md` + `steps/`) | rapid-dev | Adds rapid-dev planning granularity (codebase analysis, test planning, plan-readiness review) to the elaborate domain skill. |
| 22 | `model-2-sdlc-skills/implementation-package/implementation-pr/SKILL.md` | KEEP | `skills/execution/create-pr/` | rapid-dev | Distinct independently-invocable PR/handoff job — diff review, atomic commits, PR description; lift as standalone execution-stage skill. |
| 23 | `model-2-sdlc-skills/requirement-package/requirements-analysis/SKILL.md` | FOLD | `skills/requirements/create-requirements-package/` (as `steps/03-analysis.md` + `references/analysis-workflow.md`) | rapid-dev | Modular analysis phase folds in as a granular step; the elaborate skill currently treats analysis implicitly. |
| 24 | `model-2-sdlc-skills/requirement-package/requirements-discovery/SKILL.md` | FOLD | `skills/requirements/create-requirements-package/` (as `steps/01-discovery.md` + `references/discovery-workflow.md`) AND `skills/reverse-engineering/analyze-repository/` (cross-link) | rapid-dev | Brownfield current-state baseline workflow; useful for both requirements gathering and RE handoff. |
| 25 | `model-2-sdlc-skills/requirement-package/requirements-package/SKILL.md` | DROP | — | rapid-dev | Parent coordinator; replaced by greenfield/brownfield YAML flow definitions in task #5. |
| 26 | `model-2-sdlc-skills/requirement-package/requirements-review/SKILL.md` | KEEP | `skills/requirements/review-requirements-package/` | rapid-dev | Independently invocable review-only job; lift as a dedicated review skill so it can be triggered standalone. |
| 27 | `model-2-sdlc-skills/requirement-package/requirements-writing/SKILL.md` | FOLD | `skills/requirements/create-requirements-package/` (as `steps/04-writing.md` + `references/requirements-writing-workflow.md`) | rapid-dev | Writing-only entry path adds value as a step file and "skip discovery/analysis" entry path. |
| 28 | `model-2-sdlc-skills/solution-package/solution-design/SKILL.md` | FOLD | `skills/design/create-design-package/` (as `steps/02-design.md` + `references/solution-design-workflow.md`) | rapid-dev | Reinforces design assembly with rapid-dev's "skip discovery" entry-path support. |
| 29 | `model-2-sdlc-skills/solution-package/solution-discovery/SKILL.md` | FOLD | `skills/design/create-design-package/` (as `steps/01-discovery.md` + `references/solution-discovery-workflow.md`) | rapid-dev | Architecture-baseline discovery; valuable for brownfield design — fold in as the optional discovery step. |
| 30 | `model-2-sdlc-skills/solution-package/solution-review/SKILL.md` | KEEP | `skills/design/review-design-package/` | rapid-dev | Independently invocable review-only job; lift as a dedicated review skill. |
| 31 | `model-2-sdlc-skills/solution-package/solutions-package/SKILL.md` | DROP | — | rapid-dev | Parent coordinator; replaced by YAML flow compositions. |

(31 rows / 30 skills — `model-2-sdlc-skills/solution-package/solutions-package/` is row 31; total source-skill count is 30 because `_shared/skills/` has 3, the three domain-folder skills add 3, RE adds 10, model-2 adds 14 = 30.)

## Per-skill detail

### document-sharding (`_shared/skills/document-sharding/SKILL.md`)
- **Verdict:** KEEP
- **Target:** `skills/meta/shard-document/`
- **What this skill currently does:** A 6-step utility wrapping `npx @kayvan/markdown-tree-parser` to split large markdown files at H2 boundaries, then prompt the user to delete/move/keep the original.
- **Why this verdict:** Stage-agnostic, used across requirements/design/RE outputs whenever a document grows past a single-file practical limit. No model-2 equivalent; clean lift.
- **What to preserve when lifting/folding:** All six steps, the halt conditions, and the "Handle Original Document" decision tree (lines 56–95) which embeds important user guidance.
- **Rewrites needed:** Add YAML frontmatter (`name`, `description` in trigger form — file is missing it, see line 1 starts with `# Shard Document` not `---`). Rename folder to `shard-document` (skill name). Add 3-file `references/` (e.g., `references/sharding-rationale.md`, `references/halt-recovery.md`, `references/template-shard-tree.md`).

### framework-navigator (`_shared/skills/framework-navigator/SKILL.md`)
- **Verdict:** KEEP
- **Target:** `skills/meta/framework-navigator/`
- **What this skill currently does:** Routing/orientation skill that maps user intent to a skill, explains the workflow sequence (RE → KB → Requirements → Design → Implementation), and emits the exact trigger phrase to invoke next.
- **Why this verdict:** Existing skill map at lines 44–86 is now stale (uses "Phase 1/2/3" vocabulary, omits quick-dev, missing knowledge-base sub-skills). Migration task #12 explicitly upgrades this — keep as the lift target so the slot exists, then rewrite content.
- **What to preserve when lifting/folding:** The shape: 5-step routing flow (assess state → understand intent → route → explain sequence → invocation phrase). The pattern of routing tables with "Trigger Phrases" and "What It Does" columns.
- **Rewrites needed:** Replace entire skill map with the unified stage tree (requirements / design / planning / execution / reverse-engineering / knowledge-base / quick-dev / meta). Replace "Phase 1/2/3" with "stage" (line 76–78). Replace "phased delivery" terminology in implementation row with "increments". Add knowledge-base 5 skills row. Add quick-dev 3 skills row. Add `start-project` + `customize-framework` rows. Read project.toml to detect mode (greenfield/brownfield/quick-dev) and bias recommendations accordingly. Add 3-file references/ (`references/skill-map.md`, `references/flow-decision-tree.md`, `references/state-detection-rules.md`).

### track-change (`_shared/skills/track-change/SKILL.md`)
- **Verdict:** KEEP
- **Target:** `skills/meta/track-change/`
- **What this skill currently does:** Logs documentation/code changes into a standardized CHANGE-TRACKER.md using a row+detail format with Parts Affected, source version, verification status.
- **Why this verdict:** Universal utility used by every stage; no model-2 equivalent. The Parts Affected concept (line 31) translates cleanly to the new stage vocabulary.
- **What to preserve when lifting/folding:** All four steps, the change-types table (lines 76–84), the cross-impact assessment rule (line 89). The dependency on `templates/change-tracker-template.md`.
- **Rewrites needed:** None to vocabulary directly, but the description should be widened beyond "documentation changes" to include "code changes, requirement amendments, design decisions". Add 3-file references/ (`references/change-tracker-template.md` move from `_shared/templates/`, `references/parts-affected-values.md`, `references/cross-impact-rules.md`).

### create-requirements-package (`requirements-package/skills/create-requirements-package/SKILL.md`)
- **Verdict:** KEEP (primary lift target for requirements stage)
- **Target:** `skills/requirements/create-requirements-package/`
- **What this skill currently does:** Drives a 9-step requirements-gathering process producing 14 section files plus a completeness tracker, with a File Relevance Recommendation (lines 56–58) for skipping/N/A and the 7-Step per-file Workflow.
- **Why this verdict:** Greenfield-elaborate DNA winner. Per the directive, domain folders win as lift targets for greenfield-elaborate stages; this skill carries the templates (templates/01-*.md through 14-*.md), completeness tracker, and FR numbering convention that the model-2 equivalents lack.
- **What to preserve when lifting/folding:** All 14 section templates (`templates/01-*.md` through `templates/14-*.md`), the completeness tracker, the File Relevance Recommendation step, the 7-Step Workflow, the 9-Step Gathering Process, the FR numbering convention (FR[Area].[Feature].[Detail]). The `phases/create-requirements-package.md` reference becomes `references/process.md`.
- **Rewrites needed:** Description is already in trigger form (line 4–10) — keep. Replace "Phase 1 of the AI SDLC" with "requirements stage" (lines 1, 8 description). Inside the Workflow (lines 50–72), the headings "Phase 1/2/3/4" describe internal sub-phases and should be renamed "Step 1: Context", "Step 2: Gathering", "Step 3: Review", "Step 4: Finalization" to free "phase" from this internal use and avoid collision with "increment" in planning. Fold model-2's `requirements-discovery`, `requirements-analysis`, `requirements-writing` workflows in as `steps/01-discovery.md`, `steps/03-analysis.md`, `steps/04-writing.md`. Reorder context-loading list (lines 19–26) to use 3-file references/ minimum.

### create-solution-design-package (`solution-design-package/skills/create-solution-design-package/SKILL.md`)
- **Verdict:** KEEP (primary lift target for design stage)
- **Target:** `skills/design/create-design-package/`
- **What this skill currently does:** Drives an 11-step solution-design process with C4 diagrams, technology stack pinning, and traceability back to requirements; produces a single solution-design-package output.
- **Why this verdict:** Greenfield-elaborate DNA winner; the 11-step process at lines 33–48 is more comprehensive than model-2's `solution-design`. Templates folder already exists.
- **What to preserve when lifting/folding:** The 11-step design process, the requirements-traceability rule (line 74), the technology pinning rule (line 75), the api/error-response rule (line 76), the templates folder.
- **Rewrites needed:** Rename target folder to `create-design-package` (drop "solution-" prefix to match the new stage name "design"). Replace "Phase 2 of the AI SDLC" with "design stage" (line 1, 8). Rename internal "Phase 1/2/3/4" headings (lines 51–70) to "Step N". Fold model-2 `solution-discovery` in as `steps/01-discovery.md` (architecture baseline for brownfield), and `solution-design` in as `steps/02-design.md` (skip-discovery entry path support). Add 3-file references/ minimum (`references/process.md` from current `phases/create-solution-design-package.md`, `references/solution-discovery-workflow.md` from model-2, `references/c4-diagrams.md`).

### create-implementation-package (`implementation-planning/skills/create-implementation-package/SKILL.md`)
- **Verdict:** KEEP (primary lift target for planning stage)
- **Target:** `skills/planning/create-implementation-package/`
- **What this skill currently does:** Decomposes a solution design into "Phases" each conforming to a Canonical Phase Shape (8 mandatory sections: Phase Identity, Goal, Dependencies, Plan, Outcome, AI Gate, Human Gate, Success Criteria), plus support docs (bugs log, change tracker, phase status).
- **Why this verdict:** Owns the most distinctive artifact in the framework — the Canonical Phase Shape — which must survive the migration. Model-2's `implementation-plan` is a thinner workflow that doesn't define this shape and instead does codebase analysis + test planning.
- **What to preserve when lifting/folding:** The Canonical Phase Shape (lines 35–46), the 8 mandatory sections, the FR-mapping rule (line 73), the "AI Gate testable" rule (line 76), the "independently executable" rule (line 77). The `phases/canonical-phase-shape.md` referenced doc.
- **Rewrites needed:** **Heavy terminology rename — this is the highest-impact rename in the whole migration.** "Phase" at the implementation-chunk level becomes "increment" (PHASE-XXX → INC-XXX). Rename "Canonical Phase Shape" → "Canonical Increment Shape", "Phase Identity" → "Increment Identity", "phase-status.md" → "increment-status.md", "Phase Decomposition" → "Increment Decomposition". Replace "Phase 3 of the AI SDLC" with "planning stage". The internal Workflow headers "Phase 1/2/3/4" rename to "Step N". Fold model-2 `implementation-plan` in as `steps/01-codebase-analysis.md` (codebase orientation), `steps/02-test-planning.md`, `steps/03-readiness-review.md`. Add 3-file references/ (`references/canonical-increment-shape.md`, `references/process.md`, `references/implementation-plan-workflow.md`).

### analyze-repository (`reverse-engineering/skills/analyze-repository/SKILL.md`)
- **Verdict:** KEEP
- **Target:** `skills/reverse-engineering/analyze-repository/`
- **What this skill currently does:** Diagnostic skill: scans a repo (package files, dir structure, telltale dependencies), classifies it into one of 7 RE types, handles monorepos/hybrids, and outputs an exact next-skill invocation phrase.
- **Why this verdict:** Pure dispatcher — no overlap with anything else in the audit; both rapid-dev and elaborate flows benefit from it. Brownfield mode entry point.
- **What to preserve when lifting/folding:** The package-file table (lines 39–48), dir-structure table (lines 51–62), dependencies table (lines 65–75), classification table (lines 87–97), the application-vs-framework distinguisher (lines 99–115), monorepo/hybrid handling (lines 119–149), recommendation output template (lines 152–181).
- **Rewrites needed:** Description already in trigger form. Add 3-file references/ (`references/package-file-signals.md`, `references/dir-structure-signals.md`, `references/classification-rules.md`). Update Step 5 hand-off example phrasing to match new slash-command vocabulary if applicable.

### build-knowledge-repository (`reverse-engineering/skills/build-knowledge-repository/SKILL.md`)
- **Verdict:** FOLD
- **Target:** `skills/knowledge-base/build-knowledge-base/` (NEW skill being authored in task #10)
- **What this skill currently does:** Aggregates Part B docs from all RE'd repos and synthesizes 10 components (architecture overview, catalogs, dependency map, ADRs, onboarding/maintenance guides) into a central knowledge repository.
- **Why this verdict:** The directive states the knowledge-base skills are NEW (not lifted). However, this skill's structural content — the 10-component model (lines 36–47), workflow phases (lines 51–73), and IS/IS-NOT framing (lines 27–33) — is the most concrete starting point any new author could have. Treat it as a design seed that survives as `references/` content inside the new skill, not as an SKILL.md lift.
- **What to preserve when lifting/folding:** The 10-component table verbatim (it answers "what is the knowledge base?"). The workflow's 5 phases. The "Source repos are always the source of truth" rule (line 79). The "Synthesize, don't copy" rule (line 81).
- **Rewrites needed:** When folded into the new `build-knowledge-base` skill, rename "knowledge repository" → "knowledge base" throughout. Drop "knowledge-repository-phase.md" reference and replace with the new skill's own process.md. The 10 components likely shrink/extend to support the four other KB skills (`navigate-knowledge-base`, `update-knowledge-base`, `detect-knowledge-base-drift`, `verify-knowledge-base-coverage`).

### reverse-engineer-api (`reverse-engineering/skills/reverse-engineer-api/SKILL.md`)
- **Verdict:** KEEP
- **Target:** `skills/reverse-engineering/reverse-engineer-api/`
- **What this skill currently does:** Drives a 5-phase API extraction workflow producing Part A (internal), Part B1 (OpenAPI), Part B2 (companion guide). Loads the canonical RE shape and api-phase docs.
- **Why this verdict:** One of the 7 mandatory domain RE skills; no overlap with anything else.
- **What to preserve when lifting/folding:** The 3-part documentation model (lines 27–35), the "OpenAPI alone is not enough" rationale (line 36), all 5 workflow phases, the key rules (lines 65–72), the canonical-RE-shape dependency.
- **Rewrites needed:** Description already in trigger form. The "Phase 1/2/3/4/5" workflow headers internally describe extraction stages — keep "phase" here OR rename to "Stage 1/2/...". Recommend renaming to **Stage** to keep "increment" reserved for planning. Add 3-file references/ (`references/canonical-re-shape.md`, `references/api-phase-process.md`, `references/api-templates.md`). Update the `../_shared/templates/change-tracker-template.md` path to point to the new `skills/meta/track-change/` references location.

### reverse-engineer-api-framework (`reverse-engineering/skills/reverse-engineer-api-framework/SKILL.md`)
- **Verdict:** KEEP
- **Target:** `skills/reverse-engineering/reverse-engineer-api-framework/`
- **What this skill currently does:** Documents an API/backend framework producing Part A (full internals) + Part B (implementer subset). 5-phase workflow with focus on request pipeline, DI, extension points.
- **Why this verdict:** One of the 7 mandatory domain RE skills.
- **What to preserve when lifting/folding:** The 2-part model with "Part B is strict subset of Part A" rule (line 30), all 5 workflow phases, key rules.
- **Rewrites needed:** Same as `reverse-engineer-api` — rename internal "Phase" headings to "Stage" for consistency, add 3-file references/.

### reverse-engineer-database (`reverse-engineering/skills/reverse-engineer-database/SKILL.md`)
- **Verdict:** KEEP
- **Target:** `skills/reverse-engineering/reverse-engineer-database/`
- **What this skill currently does:** Documents a database (schema, sprocs, triggers, views) producing Part A, Part B1 (data dictionary + ERD), Part B2 (consumer guide). 6-phase workflow.
- **Why this verdict:** One of the 7 mandatory domain RE skills.
- **What to preserve when lifting/folding:** 3-part model with rationale (line 32), all 6 workflow phases, DDL-as-source-of-truth rule (line 57), FK cascade rule (line 58).
- **Rewrites needed:** Same as `reverse-engineer-api` — rename internal "Phase" → "Stage", 3-file references/.

### reverse-engineer-mobile-app (`reverse-engineering/skills/reverse-engineer-mobile-app/SKILL.md`)
- **Verdict:** KEEP
- **Target:** `skills/reverse-engineering/reverse-engineer-mobile-app/`
- **What this skill currently does:** Documents a mobile application (Android/iOS/RN) producing Part A + Part B; 5-phase workflow with platform-specific concerns and lifecycle.
- **Why this verdict:** One of the 7 mandatory domain RE skills.
- **What to preserve when lifting/folding:** 2-part model, 5 workflow phases, platform-identification-first rule (line 49).
- **Rewrites needed:** Same as `reverse-engineer-api`.

### reverse-engineer-mobile-framework (`reverse-engineering/skills/reverse-engineer-mobile-framework/SKILL.md`)
- **Verdict:** KEEP
- **Target:** `skills/reverse-engineering/reverse-engineer-mobile-framework/`
- **What this skill currently does:** Documents a mobile framework/library (AAR/Pod/SPM/npm) producing Part A + Part B; 5-phase workflow with multi-platform support.
- **Why this verdict:** One of the 7 mandatory domain RE skills.
- **What to preserve when lifting/folding:** 2-part model, 5 workflow phases, distribution-mechanism rule (line 55).
- **Rewrites needed:** Same as `reverse-engineer-api`.

### reverse-engineer-ui-framework (`reverse-engineering/skills/reverse-engineer-ui-framework/SKILL.md`)
- **Verdict:** KEEP
- **Target:** `skills/reverse-engineering/reverse-engineer-ui-framework/`
- **What this skill currently does:** Documents a UI framework / component library producing Part A + Part B; 5-phase workflow including component-by-component extraction with Input/Output/method verification.
- **Why this verdict:** One of the 7 mandatory domain RE skills.
- **What to preserve when lifting/folding:** 2-part model with subset rule (line 30), 5 workflow phases, "verify @Input/@Output against source" rule (line 61), "include philosophy" rule (line 63).
- **Rewrites needed:** Same as `reverse-engineer-api`.

### reverse-engineer-web-app (`reverse-engineering/skills/reverse-engineer-web-app/SKILL.md`)
- **Verdict:** KEEP
- **Target:** `skills/reverse-engineering/reverse-engineer-web-app/`
- **What this skill currently does:** Documents a web/SPA application producing Part A + Part B; 5-phase workflow including routing, state, API integration, cross-cutting concerns.
- **Why this verdict:** One of the 7 mandatory domain RE skills.
- **What to preserve when lifting/folding:** 2-part model, 5 workflow phases, "technology-agnostic" rule (line 53), "real data flow" rule (line 55).
- **Rewrites needed:** Same as `reverse-engineer-api`.

### scaffold-documentation (`reverse-engineering/skills/scaffold-documentation/SKILL.md`)
- **Verdict:** FOLD
- **Target:** Each `skills/reverse-engineering/reverse-engineer-*/` (as `steps/scaffold.md` + shared `references/scaffold-process.md`)
- **What this skill currently does:** A 4-step skill that creates documentation file structure (directories, headers, placeholders) before content extraction; enforces the "structure before content" principle. Routes per repo type using a phase-document table (lines 81–90).
- **Why this verdict:** Not independently invocable in practice — every RE skill calls scaffolding as part of its Phase 1. Promoting it to a top-level skill duplicates routing logic. Folded into each domain RE skill's references/ and as a `steps/01-scaffold.md` file referenced from the workflow.
- **What to preserve when lifting/folding:** The 4-step process (lines 32–73), the file-structure-by-type table (lines 81–90), the "Show structure and headers ONLY" rule (line 55), the canonical-RE-shape dependency.
- **Rewrites needed:** Move into a shared `skills/reverse-engineering/_shared/scaffold-process.md` referenced by each RE skill's `references/`. Drop the standalone trigger phrases.

### verify-extraction (`reverse-engineering/skills/verify-extraction/SKILL.md`)
- **Verdict:** FOLD
- **Target:** Each `skills/reverse-engineering/reverse-engineer-*/` (as `steps/verify.md` + shared `references/verify-checklist.md`); optionally also lifted as `skills/meta/verify-source/` if the meta skill mentioned in scope warrants a generic content-vs-source verifier.
- **What this skill currently does:** Runs verification checklists against extracted documentation: completeness check, accuracy check, consistency check, change-tracking check, plus domain-specific checks per repo type. Spot-checks against source code.
- **Why this verdict:** Same reasoning as `scaffold-documentation` — every RE skill calls verify in its final phase. The generic 4-check structure (lines 38–60) is RE-universal but doesn't need its own skill slot. The directive lists `verify-source` under `skills/meta/`; if that slot is intended for this skill's generic checks, lift the universal portion there as a thin meta utility (description-based: "verify a document against source artifacts"), and keep RE-specific checks inside RE skills.
- **What to preserve when lifting/folding:** The 4 universal checks (completeness/accuracy/consistency/change-tracking), the spot-check methodology (lines 76–84), the verification-report template (lines 90–110), the per-repo-type table (lines 66–74).
- **Rewrites needed:** Split content: (a) generic verification → if `skills/meta/verify-source/` is the desired home, lift core 4-check structure with stage-agnostic phrasing; (b) RE-specific checks → fold per-domain into each RE skill's references/. Update the per-type table to reference new skill paths.

### expedited-implementation-package (`model-2-sdlc-skills/expedited-implementation-package/SKILL.md`)
- **Verdict:** KEEP (primary DNA source for quick-dev)
- **Target:** Drives `skills/quick-dev/document-quick-change/`, `skills/quick-dev/plan-quick-change/`, `skills/quick-dev/execute-quick-change/` — see Coverage Gaps for split rationale.
- **What this skill currently does:** Runs the entire small-to-medium-change workflow inline: change spec → orientation → plan → TDD execution → verification → PR review → handoff. Has an "escape hatch" that recommends the full implementation-package pipeline if scope grows.
- **Why this verdict:** Per the directive, quick-dev derives DNA from this skill, but the new structure splits it into 3 separately-invocable skills (`document-quick-change`, `plan-quick-change`, `execute-quick-change`) so users can enter at any point and so the skills compose into a YAML quick-dev flow.
- **What to preserve when lifting/folding:** The workflow file (`references/expedited-implementation-workflow.md` is the spine — must be split into 3 references, one per resulting skill). The "no code before clarity gate" rule (line 21). The TDD-and-verification rule (line 22). The escape-hatch rule (line 19) — must remain as a step in `execute-quick-change` that detects scope creep and recommends the full implementation-package flow. The change-spec-can-be-inline-for-trivial-changes rule (line 21).
- **Rewrites needed:** Treat as 3-way SPLIT in implementation, even though the verdict above is KEEP-then-derive. The current skill itself becomes the coordinator template that gets replaced by the quick-dev YAML flow composition (task #5). Read its `references/` and `assets/` thoroughly when authoring the 3 child skills.

### implementation-execution (`model-2-sdlc-skills/implementation-package/implementation-execution/SKILL.md`)
- **Verdict:** FOLD
- **Target:** `skills/execution/execute-increments/` (NEW; this is the primary execution-stage skill)
- **What this skill currently does:** Executes an approved implementation plan task-by-task with TDD, verification-before-completion, debugging/testing, and optional subagent-driven development. Has inline-or-subagent execution choice (line 13).
- **Why this verdict:** The new `skills/execution/` stage needs a primary skill ("execute increments") and the directive notes implementation-execution itself isn't a current skill (just a phase guide). Model-2's `implementation-execution` IS effectively that skill; fold it in (or KEEP-rename) as `execute-increments` to align with the new vocabulary. Treating as FOLD because the wrapping logic blends with `phase-execution-guide.md` (currently in `implementation-execution/phases/`) which must come along too.
- **What to preserve when lifting/folding:** The TDD-loop rule (line 20), the "fresh verification evidence" rule (line 21), the no-proceed-past-failure rule (line 22), the inline-vs-subagent choice. The `references/implementation-execution-workflow.md` is critical content. Bring `implementation-execution/phases/phase-execution-guide.md` (the existing legacy phase doc) along as a `references/` document.
- **Rewrites needed:** Heavy terminology pass: "task" stays at the lowest level (it's the unit inside an increment), "implementation plan" becomes "implementation package", "phase" → "increment". Wire it to read `project.toml` mode so it can adapt verification rigor. Also handle bug-management workflow per the spec (the directive says execution covers "execute increments, manage bugs, create PRs").

### implementation-package (`model-2-sdlc-skills/implementation-package/implementation-package/SKILL.md`)
- **Verdict:** DROP
- **Target:** —
- **What this skill currently does:** Parent coordinator that asks the user which path (full / planning-only / execution-only / PR-only), then routes to phase skills.
- **Why this verdict:** Pure routing/orchestration. The new framework moves orchestration to YAML flow definitions (task #5: "Author YAML compositions"). Nothing in the SKILL.md content is unique — the routing logic is replaced by the flow composition; the rules (line 30–33) are already enforced inside the underlying skills.
- **What to preserve when lifting/folding:** Nothing as a skill; but the workflow file `references/implementation-package-workflow.md` has historical value — copy it to `_archive/legacy-references/` as a reference for the YAML composition author.
- **Rewrites needed:** N/A.

### implementation-plan (`model-2-sdlc-skills/implementation-package/implementation-plan/SKILL.md`)
- **Verdict:** FOLD
- **Target:** `skills/planning/create-implementation-package/` (as `references/implementation-plan-workflow.md` + `steps/`)
- **What this skill currently does:** Runs implementation planning after an approved solution package by analyzing the codebase, planning tests, prerequisites, delivery sequencing, project context, implementation tasks, and plan readiness.
- **Why this verdict:** Per directive, for greenfield-elaborate stages, the domain skill wins as lift target — `implementation-planning/skills/create-implementation-package/` (which owns the Canonical Phase Shape) is the lift target. Model-2's contribution here is its modular workflow steps (codebase analysis, test planning, plan-readiness review) which add value as `steps/` files.
- **What to preserve when lifting/folding:** `references/implementation-plan-workflow.md` (the workflow spine), the codebase-analysis step, the test-planning step, the `review-plan-readiness` GO/NO-GO gate (referenced line 23), the "scoped to affected code" rule (line 22).
- **Rewrites needed:** Rename "implementation plan" output path from `docs/<feature>/implementation-package/` (line 16) to align with new docs layout. Update terminology: "phase" → "increment". Wire to use the Canonical Increment Shape from the elaborate skill.

### implementation-pr (`model-2-sdlc-skills/implementation-package/implementation-pr/SKILL.md`)
- **Verdict:** KEEP
- **Target:** `skills/execution/create-pr/`
- **What this skill currently does:** Reviews uncommitted diff, fixes findings, creates approved atomic commits, generates PR description, creates PR, optionally generates changelog. Distinct standalone workflow.
- **Why this verdict:** Independently invocable — users routinely want to run "just the PR step" against working-tree changes regardless of how the changes got there. The directive lists PR creation as a separate execution-stage capability.
- **What to preserve when lifting/folding:** The 5 instructions, the atomic-commits rule (line 22), the review-before-commit rule (line 21), the user-approval-gate rule (line 16). The `references/implementation-pr-workflow.md` file.
- **Rewrites needed:** Description already in trigger form. Generalize the description: not just "implementation work" — should cover quick-dev PRs too. Add 3-file references/ (`references/implementation-pr-workflow.md` already exists, plus add `references/diff-review-checklist.md` and `references/pr-description-template.md`).

### requirements-analysis (`model-2-sdlc-skills/requirement-package/requirements-analysis/SKILL.md`)
- **Verdict:** FOLD
- **Target:** `skills/requirements/create-requirements-package/` (as `steps/03-analysis.md` + `references/analysis-workflow.md`)
- **What this skill currently does:** Runs the analysis sub-phase: scope, stakeholders, dependencies, impacts, constraints, gaps, assumptions, decisions, risks. Writes outputs under `docs/<feature>/requirements-package/analysis/`.
- **Why this verdict:** The domain `create-requirements-package` skill treats analysis implicitly inside its 9-step gathering process (steps 1–4 broadly cover analysis content). Model-2's separation of analysis as its own modular step is valuable for rapid-dev flows but is overhead for elaborate flows; fold as a `steps/` file that the elaborate skill can opt into.
- **What to preserve when lifting/folding:** The risk-register-complete-before-writing rule (line 24), the "discovery outputs as primary current-state context" rule (line 21), the analysis output set (scope/stakeholders/dependencies/impacts/constraints/gaps/assumptions/decisions/risks). The `references/analysis-workflow.md` file.
- **Rewrites needed:** Reframe as a step contributing to the overall create-requirements-package skill, not a coordinator. Drop "Use this only for requirements package analysis" rule (line 21) since context is established by the parent skill.

### requirements-discovery (`model-2-sdlc-skills/requirement-package/requirements-discovery/SKILL.md`)
- **Verdict:** FOLD
- **Target:** `skills/requirements/create-requirements-package/` (as `steps/01-discovery.md` + `references/discovery-workflow.md`); also cross-link from `skills/reverse-engineering/analyze-repository/`
- **What this skill currently does:** Runs requirements-discovery for a brownfield feature: captures who/what/why, builds current-capability baseline, scopes adjacent system behavior.
- **Why this verdict:** Brownfield-flavored discovery; not the same job as RE (which is whole-repo extraction) — discovery here is feature-scoped baseline. Folds as a step in create-requirements-package, with the brownfield flow's YAML composition opting it in.
- **What to preserve when lifting/folding:** The who/what/why-before-discovery rule (line 21), the "scope to proposed change and adjacent behavior" rule (line 23), the current-capability-baseline-complete gate (line 25). The `references/discovery-workflow.md` file.
- **Rewrites needed:** When folded, drop coordinator-style "Do not use for solution-design discovery" rule. Mode-aware behavior: this step is invoked by the brownfield flow, skipped by greenfield.

### requirements-package (`model-2-sdlc-skills/requirement-package/requirements-package/SKILL.md`)
- **Verdict:** DROP
- **Target:** —
- **What this skill currently does:** Parent coordinator routing user to discovery / analysis / writing / review phase skills based on chosen path.
- **Why this verdict:** Same as `implementation-package` (item 20) — pure orchestration that moves to YAML flow compositions.
- **What to preserve when lifting/folding:** Copy `references/requirements-package-workflow.md` to `_archive/legacy-references/` as authoring input for YAML composition.
- **Rewrites needed:** N/A.

### requirements-review (`model-2-sdlc-skills/requirement-package/requirements-review/SKILL.md`)
- **Verdict:** KEEP
- **Target:** `skills/requirements/review-requirements-package/`
- **What this skill currently does:** Runs the formal review sequence and final readiness gate before architect handoff: scope/completeness/consistency/measurability/testability/data-completeness/traceability/feasibility checks.
- **Why this verdict:** Independently invocable — users want to validate an existing assembled requirements package without re-running the gathering process. Distinct enough to warrant its own skill slot.
- **What to preserve when lifting/folding:** The "review only after package assembled" rule (line 19), the strict-sequence rule (line 13), the no-parallel rule (line 14), the failed-readiness-blocks-handoff rule (line 22), the re-validation-on-fix rule (line 23). The `references/review-workflow.md` file.
- **Rewrites needed:** Description already trigger-form. Wire the architect-handoff phrasing to the new design stage entry trigger. Add 3-file references/.

### requirements-writing (`model-2-sdlc-skills/requirement-package/requirements-writing/SKILL.md`)
- **Verdict:** FOLD
- **Target:** `skills/requirements/create-requirements-package/` (as `steps/04-writing.md` + `references/requirements-writing-workflow.md`)
- **What this skill currently does:** Writes and assembles a complete requirements package, supporting three entry paths (full / discovery-only / from-scratch). Writes outputs under `docs/<feature>/requirements-package/requirements/`.
- **Why this verdict:** The elaborate skill (`create-requirements-package`) covers writing as Phase 2/3/4 of its workflow (lines 53–71). Model-2's writing-only entry path is the unique value — folds in as a step the elaborate skill can support for users who already have discovery/analysis artifacts.
- **What to preserve when lifting/folding:** The three supported entry paths (lines 19–23), the "do not fail if upstream skipped" rule (line 27), the change-tracker-init rule (line 29), the formal-review-gate rule (line 30). The `references/requirements-writing-workflow.md`.
- **Rewrites needed:** Drop coordinator framing; reframe as writing-step content. Update output paths to align with new docs layout.

### solution-design (`model-2-sdlc-skills/solution-package/solution-design/SKILL.md`)
- **Verdict:** FOLD
- **Target:** `skills/design/create-design-package/` (as `steps/02-design.md` + `references/solution-design-workflow.md`)
- **What this skill currently does:** Designs and assembles a solution-design package supporting multiple entry paths (with/without discovery, brownfield/greenfield, design-update-after-requirements-changed).
- **Why this verdict:** Domain skill `create-solution-design-package` wins the lift slot (greenfield-elaborate). Model-2's contribution: explicit support for multiple entry paths and "design update after requirements changed" — fold as step + references.
- **What to preserve when lifting/folding:** The four supported entry paths (lines 21–25), the "do not fail if discovery skipped" rule (line 28), the design-update-via-requirements-change-tracker pattern (line 25). The `references/solution-design-workflow.md`.
- **Rewrites needed:** Reframe as step content. Output path realignment.

### solution-discovery (`model-2-sdlc-skills/solution-package/solution-discovery/SKILL.md`)
- **Verdict:** FOLD
- **Target:** `skills/design/create-design-package/` (as `steps/01-discovery.md` + `references/solution-discovery-workflow.md`)
- **What this skill currently does:** Runs optional solution-architecture discovery: scans existing architecture, integration points, deployment shape, data architecture, security boundaries, technical debt. Produces architecture baseline.
- **Why this verdict:** Brownfield-flavored design discovery; folds as the optional Step 1 of the design stage that the brownfield flow opts into and the greenfield flow skips.
- **What to preserve when lifting/folding:** The "scope to architecture affected by change" rule (line 22), the "architecture baseline complete before design" gate (line 24), the requirements-package-must-exist precondition (line 21). The `references/solution-discovery-workflow.md`.
- **Rewrites needed:** Reframe as step content. Drop coordinator-style "Do not use for requirements discovery" rule.

### solution-review (`model-2-sdlc-skills/solution-package/solution-review/SKILL.md`)
- **Verdict:** KEEP
- **Target:** `skills/design/review-design-package/`
- **What this skill currently does:** Runs formal solution-design review and readiness gate before implementation-planning handoff. Strict-sequence reviews, NO-GO blocks handoff.
- **Why this verdict:** Independently invocable — like requirements-review, users want to validate an existing solution package without re-running design.
- **What to preserve when lifting/folding:** The "review only after package assembled" rule (line 19), strict-sequence rule (line 13), NO-GO-blocks-handoff rule (line 22), re-validation-on-fix rule (line 23). The `references/solution-review-workflow.md`.
- **Rewrites needed:** Description trigger-form already. Rename target folder to `review-design-package` (drop "solution-" prefix). Wire the implementation-handoff phrasing to the new planning stage.

### solutions-package (`model-2-sdlc-skills/solution-package/solutions-package/SKILL.md`)
- **Verdict:** DROP
- **Target:** —
- **What this skill currently does:** Parent coordinator routing user to solution-discovery / solution-design / solution-review.
- **Why this verdict:** Pure orchestration → YAML composition.
- **What to preserve when lifting/folding:** Copy `references/solutions-package-workflow.md` to `_archive/legacy-references/` as authoring input.
- **Rewrites needed:** N/A.

## Coverage gaps requiring new skills (not lifted)

These capabilities are not covered by any existing skill (or their lifted form does not satisfy the new structure) and must be authored fresh in later migration tasks:

1. **`skills/meta/start-project/`** — initialize a new project (write `project.toml`, choose mode greenfield/brownfield/quick-dev, scaffold initial doc tree). Authored in **task #7** (Build orchestrators and customization skill).
2. **`skills/meta/customize-framework/`** — author/update customization overrides (BMad-style override mechanism for installed framework skills). Authored in **task #7**.
3. **`skills/knowledge-base/build-knowledge-base/`** — NEW; build the KB structure (10 components, lift design seed from `build-knowledge-repository` per item #8 above). Authored in **task #10**.
4. **`skills/knowledge-base/navigate-knowledge-base/`** — NEW; query/navigate the KB during requirements/design/RE work. Authored in **task #10**.
5. **`skills/knowledge-base/update-knowledge-base/`** — NEW; ingest new Part B docs and re-synthesize cross-cutting components. Authored in **task #10**.
6. **`skills/knowledge-base/detect-knowledge-base-drift/`** — NEW; detect when source repos changed but KB hasn't been updated. Authored in **task #10**.
7. **`skills/knowledge-base/verify-knowledge-base-coverage/`** — NEW; verify all known systems have current KB entries. Authored in **task #10**.
8. **`skills/quick-dev/document-quick-change/`**, **`skills/quick-dev/plan-quick-change/`**, **`skills/quick-dev/execute-quick-change/`** — three new skills derived from `expedited-implementation-package` (item #18 above). The current single skill is split because they need to be independently invocable to support partial entry. Authored in **task #6** (Lift surviving skills) when DNA is split out from the source.

Additional infrastructure (not skills):
- **`skills/execution/manage-bugs/`** — possibly NEW or possibly extracted from `phase-execution-guide.md`. Audit found no dedicated bug-management skill across all 30 sources; the bugs-and-issues-log is referenced inside `create-implementation-package` (line 67) but no skill reads/writes it. Recommend authoring in **task #6**.

## Open questions for human review

1. **`verify-extraction` placement (item #17):** The directive lists `verify-source` under `skills/meta/` but also describes verify as RE-specific. The audit recommends FOLD-into-RE-skills + optional thin meta lift. Confirm whether `skills/meta/verify-source/` should be a generic content-vs-source verifier (covering requirements, design, code) or RE-only (in which case it shouldn't be a meta skill at all).
2. **"Phase" terminology inside RE skills:** Each RE skill uses "Phase 1/2/3/4/5" as internal section headers (extraction stages). The directive renames "phase" → "increment" only at the implementation-chunk level. Recommend renaming RE internal headers to "Stage 1/2/...". Confirm.
3. **Is `manage-bugs` a separate skill or part of `execute-increments`?** The directive says execution covers "execute increments, manage bugs, create PRs" without specifying whether bugs is its own skill. Audit found no existing bug-management skill — this is a coverage gap that needs a decision.
4. **`scaffold-documentation` and `verify-extraction` as cross-stage utilities:** Both could arguably also serve outside RE (e.g., scaffolding a requirements package, verifying a design package against requirements). Confirm whether they remain RE-internal (current recommendation) or get promoted to `skills/meta/`.
5. **`requirements-review` and `solution-review` (now `review-requirements-package` / `review-design-package`):** These reviews currently sit inside their stage folders. Confirm they should NOT also have a planning-stage counterpart (i.e., is there a `review-implementation-package` skill needed before execution begins?). Audit found none in any source.
6. **Output-path conventions:** Model-2 skills write to `docs/<feature>/requirements-package/...`, `docs/<feature>/solutions-package/...`, etc. The new framework's path conventions weren't specified in the audit scope. Several "Rewrites needed" sections say "update output paths" — those updates need a target convention to follow.
7. **`expedited-implementation-package` 3-way split entry-point names:** The audit recommends `document-quick-change` / `plan-quick-change` / `execute-quick-change`. Confirm naming aligns with intended slash-command surface, or specify alternates.
