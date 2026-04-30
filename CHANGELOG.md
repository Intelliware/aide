# A.I.D.E. (AI Integrated Delivery Enablement) — CHANGELOG

> Project-level release-stream change log.
> **Audience:** end users / downstream consumers of A.I.D.E. — not internal SDLC participants (those use per-package CHANGE-TRACKER.md).
> **Format:** Keep-a-Changelog over the canonical change-log block (`templates/blocks/shared/change-log.md`) wrapped by `templates/compositions/project-change-log.yaml`. **This file dogfoods F-007.**

| Field | Value |
|---|---|
| Artifact | A.I.D.E. — release stream |
| Artifact type | project-change-log |
| Current artifact version | `1.4.0` |
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

### `1.4.0` — 2026-04-30

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-30 | Restructure | skills | `.agents/skills/{requirements,design,planning,execution}/` — 4 SKILL.md + 9 step files + 2 process.md refs | Stage 1 of acknowledgement-restoration: promotes "verify understanding" from a single bullet inside the 7-step per-file workflow to a top-level "Verification rule (always-on)" section in every SDLC create/execute SKILL.md, plus an "Acknowledgement checkpoint" sub-section at the tail of each step file and a non-skippable note under the 7-step table in the two process.md references. See `_docs/plan-restore-acknowledgement.md`. | repo @ this commit | ✅ Verified |
| 2 | 2026-04-30 | Restructure | skills | `.agents/skills/{requirements,design}/` — 2 process.md + 2 step files + 2 workflow refs | Stage 2 of acknowledgement-restoration: makes the section relevance check unconditional. Drops the "if relevance is in question" clause from the 7-step Step 0 row and from per-block workflow text. Adds explicit per-sub-step relevance ask to discovery-workflow and analysis-workflow refs. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-30 | Restructure | blocks, skills | `templates/blocks/{requirements,design}/` — 4 block templates + 2 step files | Stage 3 of acknowledgement-restoration: adds "AUTHORING RULE — sub-section acknowledgement" notes (HTML-comment-wrapped so they do not render in the assembled package) to the four large block templates (functional-requirements, business-logic-rules, api-design, database-design) mandating a per-item acknowledgement loop instead of one-pass drafting. Step files flag these blocks as iterative. | repo @ this commit | ✅ Verified |

#### Branch Dependency

Integrated on `mm/add-all` in the design-doc-declared merge order:
mm/add-context (1.1.0) → mm/add-adverserial (1.2.0) → mm/add-cobol (1.3.0) → mm/add-ack (1.4.0).

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
| 2 | 2026-04-29 | Source Update | validator | `.agents/skills/_registry/{skills.csv, skills.json}` | Rebuilt registry on `mm/add-all` to 43 skills (was 35), 0 warnings. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-29 | Source Update | validator | `.agents/skills/_registry/workflow-graph.yaml` | Updated brownfield flow to reference ten domain skills (was seven) and to list build-mainframe-data-lineage as an optional post-build step gated on mainframe-stack presence. | repo @ this commit | ✅ Verified |

---

### `1.2.0` — 2026-04-29

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-29 | Addition | skills | `.agents/skills/meta/review-adversarial/` | New anytime skill performing attitude-driven adversarial review of A.I.D.E. artifacts. Six lenses: weasel words, hidden assumptions, unsupported claims, missing stakeholders, "good news only" framing, scope inflation. Stage-aware via `--stage` hint with frontmatter fallback. Produces Format 4 findings (`aide-adversarial-findings@1`). | repo @ this commit | ✅ Verified |
| 2 | 2026-04-29 | Addition | skills | `.agents/skills/meta/review-edge-case-hunter/` | New anytime skill performing method-driven edge-case review. Seven categories: branching paths, error paths, boundaries, concurrency, time/clock, data shapes, authorization. Reports only unhandled edges. Same Format 4 schema as the adversarial sibling. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-29 | Addition | skills | `.agents/skills/reverse-engineering/review-reverse-engineering-package/` | New per-repo gate skill that validates Part A + Part B before KB ingestion. 9 sub-reviews (section-completeness, grounding, consistency, coverage, freshness, traceability, adversarial-pass, edge-cases, readiness). Wraps the new anytime skills in sub-reviews 7–8. | repo @ this commit | ✅ Verified |
| 4 | 2026-04-29 | Addition | skills | `.agents/skills/knowledge-base/review-knowledge-base-package/` | New periodic global KB audit skill (cadence-based, not per-PR). 10 sub-reviews orchestrating `verify-knowledge-base-coverage` and `detect-knowledge-base-drift` plus seven additional lenses, ending with a readiness verdict. Wraps the new anytime skills in sub-reviews 8–9. | repo @ this commit | ✅ Verified |
| 5 | 2026-04-29 | Addition | references | `references/review-patterns/review-output-format.md`, `review-verdict-mapping.md`, `adversarial-wrapper-pattern.md` | Three new shared references: Format 4 schema spec (`aide-adversarial-findings@1`), severity-to-verdict mapping for wrappers, and the dispatcher pattern documentation cited from all five `review-*-package` skills. Single source of truth for the wrapper integration. | repo @ this commit | ✅ Verified |
| 6 | 2026-04-29 | Addition | docs | `_docs/adversarial-review-design.md` | Stage 1 design note for the layer (281 lines). Defines two new anytime skills, two new review-package skills, wrapper integration into all five review-package skills, the shared output format, the verdict mapping, and the staged delivery plan. | repo @ this commit | ✅ Verified |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-29 | Source Update | skills | `.agents/skills/requirements/review-requirements-package/` | Sequence expanded from 10 to 12 sub-reviews. New sub-reviews `review-adversarial-pass` (10) and `review-edge-cases` (11) inserted before the readiness gate (now 12). Halts on FAIL per existing pattern. | repo @ this commit | ✅ Verified |
| 2 | 2026-04-29 | Source Update | skills | `.agents/skills/design/review-design-package/` | Sequence expanded from 3 to 5 sub-reviews. New `review-adversarial-pass` (3) and `review-edge-cases` (4) inserted before `review-solution-readiness` (now 5). Halts on FAIL per existing pattern. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-29 | Source Update | skills | `.agents/skills/planning/review-implementation-package/` | Sequence expanded from 8 to 10 sub-reviews. New `review-adversarial-pass` (8) and `review-edge-cases` (9) inserted before the implementation-readiness verdict (now 10). Adversarial findings flow into the consolidated issue list rather than halting; severities mapped to Critical/Important/Minor per the wrapper pattern. | repo @ this commit | ✅ Verified |
| 4 | 2026-04-29 | Source Update | skills | `.agents/skills/_registry/workflow-graph.yaml` | Inserted `review-reverse-engineering-package` in brownfield between `reverse-engineer-<dynamic>` and `build-knowledge-base` as a required gate. Added `review-adversarial`, `review-edge-case-hunter`, and `review-knowledge-base-package` to the `anytime` list. | repo @ this commit | ✅ Verified |
| 5 | 2026-04-29 | Source Update | docs | `README.md` | Stage rows for `meta`, `reverse-engineering`, and `knowledge-base` updated to mention the new review skills. | repo @ this commit | ✅ Verified |

---

### `1.1.0` — 2026-04-29

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-29 | Addition | skills | `.agents/skills/knowledge-base/capture-solution-context/` | New 7-step interactive discovery skill that produces six leaves under `<KB>/shared/solution-context/` (mission, personas, goals/KPIs, constraints, external integrations, ownership/RACI) plus a glossary delta — captures the project-scoped context the code can't reveal. | repo @ this commit | ✅ Verified |
| 2 | 2026-04-29 | Addition | skills | `.agents/skills/knowledge-base/generate-ai-rules/` | New 4-step hybrid skill (auto-derive from RE Part A + interactive elicitation) that produces `<KB>/shared/ai-rules/project-context.md` plus optional per-repo overrides when stack divergence warrants. Equivalent in spirit to BMAD's `generate-project-context`, adapted to the multi-repo, KB-resident shape of A.I.D.E. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-29 | Addition | skills | `.agents/skills/knowledge-base/document-operations/` | New 3-step hybrid skill that produces four leaves under `<KB>/shared/operations/` (deployment topology, environments & secrets, SLOs & monitoring, runbooks & on-call) plus split runbook files when the index exceeds 6 rows. | repo @ this commit | ✅ Verified |
| 4 | 2026-04-29 | Addition | blocks | `templates/blocks/knowledge-base/solution-overview.md`, `persona-catalog.md`, `goals-and-kpis.md`, `constraints-and-compliance.md`, `external-integrations.md`, `ownership-and-raci.md`, `ai-rules-project-context.md`, `ops-deployment-topology.md`, `ops-environments-and-secrets.md`, `ops-slos-and-monitoring.md`, `ops-runbooks-and-oncall.md`, `ops-runbook.md` | 12 new block templates that the three new skills compose against. | repo @ this commit | ✅ Verified |
| 5 | 2026-04-29 | Addition | compositions | `templates/compositions/kb-solution-context.yaml`, `kb-ai-rules.yaml`, `kb-operations.yaml` | Three new compositions wrapping the new block templates. | repo @ this commit | ✅ Verified |
| 6 | 2026-04-29 | Addition | references | `references/elicitation-patterns/personas.md`, `ownership-and-raci.md`, `coding-rules.md`, `operations-discovery.md` | Four new elicitation patterns referenced by the new skills' interactive steps. | repo @ this commit | ✅ Verified |
| 7 | 2026-04-29 | Addition | docs | `_docs/solution-context-gap-audit.md` | Stage 1 audit mapping BMAD's `document-project` and `generate-project-context` sections against the existing RE → KB pipeline to drive Stage 2–3 scope. | repo @ this commit | ✅ Verified |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-29 | Source Update | skills | `.agents/skills/knowledge-base/build-knowledge-base/steps/02-scaffold-repos.md` | Scaffold also creates `shared/{solution-context, ai-rules, operations}/` alongside the existing `shared/` subtrees. | repo @ this commit | ✅ Verified |
| 2 | 2026-04-29 | Source Update | skills | `.agents/skills/knowledge-base/build-knowledge-base/steps/06-emit-architecture-index.md` | New § 0 Solution Overview at the top of `ARCHITECTURE.md` linking to the human-grounded subtrees, with `pending` annotations when leaves don't yet exist. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-29 | Source Update | skills | `.agents/skills/knowledge-base/build-knowledge-base/steps/07-emit-claude-md.md` | Read-order block extended to instruct AI agents on when to consult solution-context, ai-rules, and operations leaves. | repo @ this commit | ✅ Verified |
| 4 | 2026-04-29 | Source Update | skills | `.agents/skills/knowledge-base/navigate-knowledge-base/SKILL.md` | New `--include-solution-context` flag (default true); trigger walk extended to the three shared subtrees; new tier values (`solution-context`, `ai-rules`, `operations`) returned alongside component matches without competing with the `--max-components` cap. | repo @ this commit | ✅ Verified |
| 5 | 2026-04-29 | Source Update | skills | `.agents/skills/knowledge-base/detect-knowledge-base-drift/steps/04-l4-coverage-sweep.md` | New L4 sub-steps for solution-context leaf staleness and per-repo coverage. Configurable via `[knowledge_base.solution_context_max_age_days]`. | repo @ this commit | ✅ Verified |
| 6 | 2026-04-29 | Source Update | skills | `.agents/skills/knowledge-base/verify-knowledge-base-coverage/steps/03-check-staleness.md` | New informational warnings for missing shared leaves and repo-orphan solution-context references. | repo @ this commit | ✅ Verified |
| 7 | 2026-04-29 | Source Update | config | `config/framework.toml.example` | Declared `[knowledge_base.solution_context_max_age_days]` (default 90) — drives the new L4 staleness check. | repo @ this commit | ✅ Verified |
| 8 | 2026-04-29 | Source Update | skills | `.agents/skills/_registry/workflow-graph.yaml` | Inserted the three new skills into both `brownfield` (after `verify-knowledge-base-coverage`) and `greenfield` (split between pre-requirements and post-design) sequences. Added all three to `anytime` for refresh-mode use. Re-ran `scripts/build-registry.py`. | repo @ this commit | ✅ Verified |
| 9 | 2026-04-29 | Source Update | docs | `README.md`, `.agents/skills/knowledge-base/README.md` | KB skill count bumped 5 → 8; added "two halves" framing for code-grounded vs human-grounded KB. | repo @ this commit | ✅ Verified |

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
