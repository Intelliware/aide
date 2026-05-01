# A.I.D.E. (AI Integrated Delivery Enablement) — CHANGELOG

> Project-level release-stream change log.
> **Audience:** end users / downstream consumers of A.I.D.E. — not internal SDLC participants (those use per-package CHANGE-TRACKER.md).
> **Format:** Keep-a-Changelog over the canonical change-log block (`templates/blocks/shared/change-log.md`) wrapped by `templates/compositions/project-change-log.yaml`. **This file dogfoods F-007.**

| Field | Value |
|---|---|
| Artifact | A.I.D.E. — release stream |
| Artifact type | project-change-log |
| Current artifact version | `1.4.5` |
| Versioning convention | Semver (MAJOR.MINOR.PATCH) |
| Stage / Skill of record | (project-level — managed by `create-pr` step 6 going forward) |

## Versioning convention

A.I.D.E. uses semver:

- **MAJOR** — breaking changes to the skill catalogue, SKILL.md frontmatter shape, composition / block contracts, project.toml schema. Migration steps required.
- **MINOR** — new skills, new compositions, new schema fields, new validator checks. Backwards-compatible for existing projects.
- **PATCH** — bug fixes, doc updates, validator allowlists, non-breaking SKILL.md / step-file edits.

## Parts Affected — Reference (project-level vocabulary)

| Value | Meaning |
|---|---|
| `validator` | `scripts/validate.py` and `scripts/build-registry.py` |
| `skills` | Anything under `.agents/skills/` |
| `compositions` | Anything under `templates/compositions/` |
| `blocks` | Anything under `templates/blocks/` |
| `config` | `config/` (schemas + example files) |
| `references` | Top-level `references/` (cross-cutting framework references) |
| `branding` | Repo-wide naming, top-level identity files |
| `docs` | `_docs/` (framework-internal documentation) |
| `Multiple` | When more than two of the above apply |

## Change Types

Standard change-log block taxonomy. Project-level changelog maps these to Keep-a-Changelog categories at presentation time:

| Change Type | Keep-a-Changelog category |
|---|---|
| Initial Extraction | Added |
| Addition | Added |
| Source Update | Changed |
| Restructure | Changed |
| Correction | Fixed |
| Deprecation | Deprecated |
| Removal | Removed |

---

## Change Log

### `1.4.5` — 2026-05-01

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-30 | Addition | docs | `_docs/sod-multi-repo-proposal.md` | Design proposal for the separation-of-duties (SoD) multi-repo capability — full schema, layout geometry (legacy / SoD directory mode / SoD colocate mode), per-stage adoption story, and validator-rule design (rules 7–12). | repo @ this commit | ✅ Verified |
| 2 | 2026-04-30 | Addition | config | `config/project.toml.example`, `config/project.user.toml.example` | New SoD-aware example project.toml files showing the `[stages.<stage>]` and `[[project.repos]]` shape required to enable SoD per-stage. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-30 | Addition | skills | `.agents/skills/requirements/create-requirements-package/steps/00-scope-target-repo.md`, `.agents/skills/design/create-design-package/steps/00-scope-target-repo.md`, `.agents/skills/execution/execute-increments/steps/00-scope-target-repo.md`, `.agents/skills/planning/create-implementation-package/steps/scope-target-repo.md` | New scope-target-repo step files added at the head of the create / plan / execute workflows. Resolve the host repo for the artifact and (in SoD modes) detect cross-cutting features by reading `[stages.<stage>]` plus the `affects_repos` block. | repo @ this commit | ✅ Verified |
| 4 | 2026-04-30 | Addition | blocks | `templates/blocks/shared/affects-repos.md` | New shared block that SDLC artifact templates include to declare cross-repo impact (`affects_repos` list) when the feature is cross-cutting. | repo @ this commit | ✅ Verified |
| 5 | 2026-05-01 | Addition | validator | `scripts/test_validate.py`, `scripts/test_fixtures/sod-negatives/` (8 fixtures) | New stdlib-only unittest suite covering validator rules 7–12, plus eight negative-test TOML / Markdown fixtures (absolute artifact subdir, both modes set, cross-cutting empty / unknown affects, role mismatch, unknown write role). | repo @ this commit | ✅ Verified |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-01 | Source Update | validator | `scripts/validate.py` | Extended the validator with SoD rules 7–12 and a `--project-toml` CLI flag: artifact-subdir non-absolute, single-mode-per-stage (no `dir` + `colocate_with_source`), known write-role, role-to-stage mapping, cross-cutting `affects_repos` non-empty, cross-cutting `affects_repos` references known repos. Existing rules 1–6 unchanged. | repo @ this commit | ✅ Verified |
| 2 | 2026-04-30 | Source Update | config | `config/SCHEMAS.md` | Documented SoD layout geometry (legacy / directory / colocate modes) and per-stage SoD adoption (`[stages.<stage>]` with `dir`, `colocate_with_source`, `artifact_subdir`, write-role). +113 lines net. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-30 | Source Update | skills | `.agents/skills/requirements/review-requirements-package/SKILL.md`, `.agents/skills/design/review-design-package/SKILL.md` | Added "Step 0 — Locate the upstream artifact (SoD only)" section to both review skills so they resolve the upstream artifact path under legacy / directory / colocate modes. Read-only step (no permission check); non-interactive invocations fail fast on ambiguity. | repo @ this commit | ✅ Verified |
| 4 | 2026-04-30 | Source Update | skills | `.agents/skills/requirements/create-requirements-package/SKILL.md`, `.agents/skills/design/create-design-package/SKILL.md`, `.agents/skills/planning/create-implementation-package/SKILL.md`, `.agents/skills/execution/execute-increments/SKILL.md` | Threaded the new scope-target-repo step into each create / plan / execute SKILL.md as the leading step. | repo @ this commit | ✅ Verified |
| 5 | 2026-04-30 | Source Update | compositions | `templates/compositions/greenfield-requirements-package.yaml`, `templates/compositions/greenfield-design-package.yaml` | Wired the new `shared/affects-repos` block into both greenfield compositions so cross-cutting features can declare repo impact at authoring time. | repo @ this commit | ✅ Verified |
| 6 | 2026-05-01 | Restructure | skills | `.agents/skills/knowledge-base/update-knowledge-base/SKILL.md` + `references/OVERVIEW.md` | Tightened catalog-only matching-criterion language: clarified that update-knowledge-base only updates components whose match criteria are satisfied by the diff and never speculatively touches unmatched components. | repo @ this commit | ✅ Verified |

#### Fixed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-30 | Correction | skills | `.agents/skills/meta/framework-navigator/references/INPUTS-OUTPUTS.md`, `.agents/skills/meta/framework-navigator/references/OVERVIEW.md`, `.agents/skills/meta/framework-navigator/steps/03-match-or-render.md` | Replaced hardcoded "32 skills" assertions with dynamic registry reads. The skill now reflects the current registry size at invocation time instead of drifting whenever new skills land. | repo @ this commit | ✅ Verified |

#### Branch Dependency

This release adds the separation-of-duties (SoD) multi-repo capability on top of `1.4.0` (acknowledgement-restoration). SoD is fully additive — every legacy project keeps working without modification, and SoD adoption is **per-stage**: a stage adopts SoD only when its `[stages.<stage>]` entry declares `dir` or `colocate_with_source`. See `_docs/sod-multi-repo-proposal.md` for the full design.

The compound version label `1.4.5` reflects: ack-restoration `1.4.0` + COBOL/mainframe RE `1.3.0` (merged forward via `mm/add-cobol`) + SoD scaffold (this release). The canonical merge order remains:
mm/add-context (1.1.0) → mm/add-adverserial (1.2.0) → mm/add-cobol (1.3.0) → mm/add-ack (1.4.0) → SoD work captured here.

---

### `1.4.0` — 2026-04-30

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-30 | Restructure | skills | `.agents/skills/{requirements,design,planning,execution}/` — 4 SKILL.md + 9 step files + 2 process.md refs | Stage 1 of acknowledgement-restoration: promotes "verify understanding" from a single bullet inside the 7-step per-file workflow to a top-level "Verification rule (always-on)" section in every SDLC create/execute SKILL.md, plus an "Acknowledgement checkpoint" sub-section at the tail of each step file and a non-skippable note under the 7-step table in the two process.md references. See `_docs/plan-restore-acknowledgement.md`. | repo @ this commit | ✅ Verified |
| 2 | 2026-04-30 | Restructure | skills | `.agents/skills/{requirements,design}/` — 2 process.md + 2 step files + 2 workflow refs | Stage 2 of acknowledgement-restoration: makes the section relevance check unconditional. Drops the "if relevance is in question" clause from the 7-step Step 0 row and from per-block workflow text. Adds explicit per-sub-step relevance ask to discovery-workflow and analysis-workflow refs. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-30 | Restructure | blocks, skills | `templates/blocks/{requirements,design}/` — 4 block templates + 2 step files | Stage 3 of acknowledgement-restoration: adds "AUTHORING RULE — sub-section acknowledgement" notes (HTML-comment-wrapped so they do not render in the assembled package) to the four large block templates (functional-requirements, business-logic-rules, api-design, database-design) mandating a per-item acknowledgement loop instead of one-pass drafting. Step files flag these blocks as iterative. | repo @ this commit | ✅ Verified |

#### Branch Dependency

This release contains the acknowledgement-restoration changes (Changes A / B / C from `_docs/plan-restore-acknowledgement.md`) on top of `mm/add-cobol` (1.3.0). It matches the design-doc-declared `mm/add-ack` 1.4.0 release identity per the canonical merge order:
mm/add-context (1.1.0) → mm/add-adverserial (1.2.0) → mm/add-cobol (1.3.0) → mm/add-ack (1.4.0).
On `mm/add-ack-cobol-repo` this layer was bundled with 1.3.0 (cobol RE) and serves as the foundation for the SoD multi-repo capability shipped in 1.4.5.

---

### `1.3.0` — 2026-04-29

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-29 | Addition | docs | `_docs/cobol-mainframe-re-design.md` | Stage 1 design note for the COBOL/mainframe RE layer: three new RE domain skills, one new KB aggregation skill, analyze-repository extensions, block / composition trees, review-package integration. | repo @ this commit | ✅ Verified |
| 2 | 2026-04-29 | Addition | skills | `.agents/skills/reverse-engineering/reverse-engineer-cobol-program/` | New domain skill: documents COBOL programs into Part A (DIVISION-by-DIVISION reference, PERFORM/CALL graph, FILE-CONTROL/FD bindings, EXEC CICS/SQL/DLI inventories) + Part B (program contract for batch schedulers and integrators). Emits three lineage feed-files (program-call-graph.mmd, program-data-bindings.json, program-exec-inventory.md). | repo @ this commit | ✅ Verified |
| 3 | 2026-04-29 | Addition | skills | `.agents/skills/reverse-engineering/reverse-engineer-copybook-library/` | New domain skill: documents copybook libraries into Part A (per-copybook record reference, REDEFINES variants, OCCURS expansion, level-88 condition names, naming-convention buckets, duplicate / divergent detection) + Part B (canonical record catalogue + field index = the data dictionary). Emits feed-files: copybook-record-graph.json, data-dictionary.md, copybook-conflicts.md. | repo @ this commit | ✅ Verified |
| 4 | 2026-04-29 | Addition | skills | `.agents/skills/reverse-engineering/reverse-engineer-jcl-job/` | New domain skill: documents JCL / PROCLIB into Part A (step-by-step reference, PROC and INCLUDE expansion, DD inventory, GDG and dataset lifecycle, condition codes, IDCAMS/SORT/IEBGENER patterns, scheduler integration, RACF) + Part B (job-flow guide for downstream consumers). Emits feed-files: job-flow.mmd, dataset-io.json. | repo @ this commit | ✅ Verified |
| 5 | 2026-04-29 | Addition | skills | `.agents/skills/knowledge-base/build-mainframe-data-lineage/` | New KB-stage aggregator skill: consumes the three domain skills' feed-files and emits a coherent cross-program data-lineage artefact under `<KB>/lineage/mainframe/` (copybook-where-used, field-where-used, MOVE chain, job→program→dataset chain, EXEC SQL/IMS/CICS bindings, unbound-and-flagged catalogue, summary). Eight-step workflow with explicit coverage-rule gate. | repo @ this commit | ✅ Verified |
| 6 | 2026-04-29 | Addition | blocks | `templates/blocks/reverse-eng/cobol-program/`, `templates/blocks/reverse-eng/copybook-library/`, `templates/blocks/reverse-eng/jcl-job/` | 56 new block templates (16+6 cobol-program, 12+6 copybook-library, 11+5 jcl-job) backing the three new RE domain compositions. | repo @ this commit | ✅ Verified |
| 7 | 2026-04-29 | Addition | blocks | `templates/blocks/knowledge-base/mainframe-lineage/` | 10 new block templates backing the kb-mainframe-data-lineage composition. | repo @ this commit | ✅ Verified |
| 8 | 2026-04-29 | Addition | compositions | `templates/compositions/re-cobol-program-{internal,consumer}.yaml`, `templates/compositions/re-copybook-library-{internal,consumer}.yaml`, `templates/compositions/re-jcl-job-{internal,consumer}.yaml`, `templates/compositions/kb-mainframe-data-lineage.yaml` | Seven new compositions (six per-domain RE pairs plus the lineage aggregator). | repo @ this commit | ✅ Verified |
| 9 | 2026-04-29 | Addition | docs | `_docs/cobol-mainframe-review-integration.md` | Documents the review-package patches that apply post-merge of mm/add-adverserial — extends review-reverse-engineering-package coverage tables for the three new domains and adds a review-mainframe-lineage-integrity sub-review to review-knowledge-base-package. Deferred patch because the target review skills don't exist on this branch. | repo @ this commit | ✅ Verified |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-29 | Source Update | skills | `.agents/skills/reverse-engineering/analyze-repository/` | Extended dispatcher with mainframe detection: new 1c′ extension-density + source-line-marker step (.cbl/.cob/.cpy/.pli/.jcl/.proc/.bms/.dbd/.psb, IDENTIFICATION DIVISION, EXEC CICS/SQL/DLI, JCL JOB/STEP/SYSIN, Endevor / ChangeMan / Panvalet headers), three new dispatch rows (cobol-program / copybook-library / jcl-job), mainframe-monorepo ordering rule (copybook-library → cobol-program → jcl-job → build-mainframe-data-lineage), worked-example variant for a mainframe monorepo. SKILL.md still under 200 lines. | repo @ this commit | ✅ Verified |
| 2 | 2026-04-29 | Source Update | validator | `.agents/skills/_registry/{skills.csv, skills.json}` | Rebuilt registry: 36 skills (was 35), 0 warnings. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-29 | Source Update | validator | `.agents/skills/_registry/workflow-graph.yaml` | Updated brownfield flow to reference ten domain skills (was seven) and to list build-mainframe-data-lineage as an optional post-build step gated on mainframe-stack presence. | repo @ this commit | ✅ Verified |

#### Branch Dependency

This release builds on the design-doc-declared merge order:
mm/add-context (1.1.0) → mm/add-adverserial (1.2.0) → mm/add-cobol (1.3.0).
The review-package integration (Stage 4) is documented as a deferred
patch because it modifies skills introduced by mm/add-adverserial. If
the merge order changes, the version on this branch must be adjusted
accordingly at integration time.

---

### `1.0.1` — 2026-04-27

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-27 | Restructure | skills, blocks | `.agents/skills/reverse-engineering/`, `templates/blocks/reverse-eng/` | Made the reverse-engineering skills and their block libraries technology-agnostic — removed framework-, language-, and platform-specific verbiage from SKILL.md files and reusable blocks so the RE flow applies cleanly to any stack. | repo @ this commit | ✅ Verified |

---

### `1.0.0` — 2026-04-27

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-27 | Addition | branding | repo-wide | Renamed the framework to **A.I.D.E. (AI Integrated Delivery Enablement)** — full form on first mention in README + AGENTS, short form `A.I.D.E.` everywhere else | repo @ this commit | ✅ Verified |
| 2 | 2026-04-27 | Addition | docs | `README.md` header | Project version pinned to `1.0.0`, displayed at the top of the README. Single source of truth for the version. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-27 | Addition | docs | `CHANGELOG.md` (this file) | Added at repo root. Dogfoods F-007 — uses the canonical change-log block via `project-change-log.yaml` composition. | repo @ this commit | ✅ Verified |

#### Changed

(Forward-looking placeholder — entries land here as `Changed` as they ship.)

#### Fixed

(Forward-looking placeholder.)

#### Deprecated

(Forward-looking placeholder.)

#### Removed

(Forward-looking placeholder.)

#### Security

(Forward-looking placeholder.)

---

### `0.x` — pre-1.0 history (compressed)

Pre-1.0 work was not formally versioned. The git log under the previous repo name (`theframework`) carries the per-commit history. Notable milestones, in chronological order:

- **Migration foundation** — skills consolidated under `.agents/skills/`, AGENTS.md authored, host setup simplified.
- **Cursor IDE host support** — host-comparison cheatsheet authored.
- **Stage-mapping reference docs** — `_docs/` set authored to track archive→current stage mapping.
- **BMAD methodology committed** — `_bmad/` brought into version control as a methodology input (config.user.toml gitignored per F-006-style convention).
- **End-to-end test pass** — all 32 skills exercised across 5 phases (A–E); 7 findings raised and resolved:
    - F-001 — validator phase-vocab allowlist via per-file pragma
    - F-002 — Check A widened to count direct skill-markdown refs
    - F-003 — test-plan B.4 pass criterion aligned to SKILL.md
    - F-004 — stale change-tracker-template cross-references corrected
    - F-005 — RE output bound to composition block lists; validator Check H added
    - F-006 — `build-knowledge-base` fail-loud on empty `[[project.repos]]`
    - F-007 — project-level CHANGELOG.md support (the work this file is the first instance of)
- **Test-plan tightened** — Phase A / Phase C / Phase D.10 pass criteria updated to reflect the post-fix framework state.

The 1.0.0 entry above marks the formal start of versioned releases.

## Cross-Part / Cross-Section Synchronisation

| If This Changes... | Check This... |
|---|---|
| README version line | This CHANGELOG's "Current artifact version" cell |
| Block / composition contracts | Update validator checks accordingly; bump MAJOR if breaking |
| Project.toml schema | Update `config/SCHEMAS.md` and `config/project.toml.example` together; bump MINOR for additive fields, MAJOR for breaks |
| New skill added or skill removed | Bump MINOR; record under Added or Removed; rebuild registry |
| Skill description edited | Rebuild registry (`scripts/build-registry.py`); record under Changed |
