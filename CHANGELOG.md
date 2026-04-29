# A.I.D.E. (AI Integrated Delivery Enablement) — CHANGELOG

> Project-level release-stream change log.
> **Audience:** end users / downstream consumers of A.I.D.E. — not internal SDLC participants (those use per-package CHANGE-TRACKER.md).
> **Format:** Keep-a-Changelog over the canonical change-log block (`templates/blocks/shared/change-log.md`) wrapped by `templates/compositions/project-change-log.yaml`. **This file dogfoods F-007.**

| Field | Value |
|---|---|
| Artifact | A.I.D.E. — release stream |
| Artifact type | project-change-log |
| Current artifact version | `1.1.0` |
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
| 9 | 2026-04-29 | Source Update | docs | `README.md`, `.agents/skills/knowledge-base/README.md` | Skill count bumped 32 → 35; KB skill count bumped 5 → 8; added "two halves" framing for code-grounded vs human-grounded KB. | repo @ this commit | ✅ Verified |

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
