# theframework — Archive → Current Mapping
*Drafted 2026-04-26.*

This document traces how every artifact in `_archive/` was converted into the current skills-based, agentskills.io-compliant SDLC framework. It is a *what-went-where* index — the *why* lives in `_docs/requirements.md` (FR1–FR12, NFR1–NFR5) and the per-skill *how* lives in `_archive/skill-disposition.md`.

## How to read this document

- **Source side:** seven legacy folders under `_archive/` — `_shared`, `implementation-execution`, `implementation-planning`, `model-2-sdlc-skills`, `requirements-package`, `reverse-engineering`, `solution-design-package`.
- **Destination side:** the current root: `.agents/skills/`, `templates/`, `references/`, `config/`, `scripts/`, `AGENTS.md`, `README.md`, `_docs/`.
- **Verdict legend:** KEEP (lifted with light edits) · FOLD (merged into a host skill) · DROP (replaced or removed) · LIFT-PROMOTED (FOLD that *also* spawned a standalone meta skill) · SPLIT (one source → multiple targets) · NEW (no archive ancestor).
- Every row cites the requirement it satisfies (FR1–FR12 / NFR1–NFR5) where applicable.

---

## 1. Vocabulary rename

The migration normalized terminology before any folder move. All current artifacts use the new vocabulary; legacy strings remain only inside `_archive/` and in intentional historical-reference passages flagged by `scripts/validate.py` Check D.

| Legacy term | New term | Where it now appears | Driving FR |
|---|---|---|---|
| "phase" (SDLC-level grouping) | **stage** | `.agents/skills/<stage>/`, `templates/blocks/<stage>/`, READMEs | FR10.1 |
| "phase" (implementation chunk) | **increment** | Canonical Increment Shape, `templates/blocks/planning/`, `INC-XXX` IDs | FR10.1, FR10.3 |
| `PHASE-XXX` / `PHASE-XXX.Y` IDs | `INC-XXX` / `INC-XXX.Y` | All planning + execution artifacts | FR10.3 |
| "Canonical Phase Shape" | **Canonical Increment Shape** | `references/canonical-shapes/canonical-increment-shape.md`, `templates/blocks/planning/` | FR10.1 |
| `phase-status.md` | `increment-status.md` | `.agents/skills/execution/execute-increments/steps/06-status-update.md` | FR10.1 |
| "solution-design" (package + skill) | **design** | `.agents/skills/design/`, `templates/blocks/design/` | decision #1 (2026-04-25) |
| "expedited-implementation-package" | **quick-dev** | `.agents/skills/quick-dev/` | FR2.3 |
| "knowledge-repository" | **knowledge-base** | `.agents/skills/knowledge-base/`, `templates/blocks/knowledge-base/` | FR9 |
| "epic" / "story" / agile vocabulary | (banned) | — | FR10.2 |
| RE internal "Phase 1/2/3" headings | **Stage 1/2/3** | All seven `reverse-engineer-*/SKILL.md` | decision #6 (2026-04-25) |
| Parent-coordinator "package" skills | YAML compositions | `templates/compositions/` | FR4.1, decision #3 |

---

## 2. Skills mapping

The audit covered 30 source skills (`_archive/skill-disposition.md`): 15 KEEP, 12 FOLD, 3 DROP. The current tree contains **32 skills** across 8 stages; the net delta is the +7 net-new (5 KB + `start-project` + `customize-framework`), the +1 net-new `review-implementation-package`, the −3 dropped parent coordinators, the SPLIT of `expedited-implementation-package` into 3, and two LIFT-PROMOTED FOLDs that gained standalone meta homes.

### Index

| Stage | New skills | Net change vs. archive |
|---|---|---|
| meta | 7 | +3 (`start-project`, `customize-framework`, plus LIFT-PROMOTED `scaffold-documentation` & `verify-source`); 3 KEEP retained |
| requirements | 2 | KEEP only; granular sub-skills folded as `steps/` |
| design | 2 | KEEP only; granular sub-skills folded as `steps/` |
| planning | 2 | KEEP `create-implementation-package`; +1 NEW `review-implementation-package` |
| execution | 3 | KEEP `create-pr`; FOLD-target `execute-increments` promoted standalone; +1 NEW `manage-bugs` |
| reverse-engineering | 8 | KEEP analyze-repository + 7 domain RE skills; FOLDs absorbed |
| quick-dev | 3 | SPLIT from one source skill (`expedited-implementation-package`) |
| knowledge-base | 5 | All NEW; one source skill (`build-knowledge-repository`) folded as design seed |
| **Total** | **32** | (30 audited → 32 current) |

### 2.1 Meta stage

| Source path (`_archive/`) | Verdict | New path | FR |
|---|---|---|---|
| `_shared/skills/document-sharding/SKILL.md` | KEEP (renamed) | `.agents/skills/meta/shard-document/` | FR1 |
| `_shared/skills/framework-navigator/SKILL.md` | KEEP + UPGRADED | `.agents/skills/meta/framework-navigator/` | FR8 |
| `_shared/skills/track-change/SKILL.md` | KEEP | `.agents/skills/meta/track-change/` | FR1 |
| `reverse-engineering/skills/scaffold-documentation/SKILL.md` | LIFT-PROMOTED + FOLD | `.agents/skills/meta/scaffold-documentation/` *plus* per-RE-skill `steps/scaffold.md` | FR3 |
| `reverse-engineering/skills/verify-extraction/SKILL.md` | LIFT-PROMOTED + FOLD | `.agents/skills/meta/verify-source/` *plus* per-RE-skill `steps/verify.md` | FR3 |
| (no archive ancestor) | NEW | `.agents/skills/meta/start-project/` — flow-mode bootstrap orchestrator | FR2.4 |
| (no archive ancestor) | NEW | `.agents/skills/meta/customize-framework/` — interactive override authoring | FR5.4 |

`framework-navigator` was lifted but rewritten end-to-end into a goal-mode + catalog-mode router that probes workspace state before recommending (FR8.1–FR8.4); it now consumes the generated registry under `.agents/skills/_registry/`.

### 2.2 Requirements stage

| Source path | Verdict | New path | FR |
|---|---|---|---|
| `requirements-package/skills/create-requirements-package/SKILL.md` | KEEP (primary lift) | `.agents/skills/requirements/create-requirements-package/` | FR2.1 |
| `model-2-sdlc-skills/requirement-package/requirements-discovery/SKILL.md` | FOLD | `.agents/skills/requirements/create-requirements-package/steps/01-discovery.md` + `references/discovery-workflow.md` | FR2.1 |
| `model-2-sdlc-skills/requirement-package/requirements-analysis/SKILL.md` | FOLD | `.agents/skills/requirements/create-requirements-package/steps/03-analysis.md` + `references/analysis-workflow.md` | FR2.1 |
| `model-2-sdlc-skills/requirement-package/requirements-writing/SKILL.md` | FOLD | `.agents/skills/requirements/create-requirements-package/steps/04-writing.md` + `references/requirements-writing-workflow.md` | FR2.1 |
| `model-2-sdlc-skills/requirement-package/requirements-review/SKILL.md` | KEEP | `.agents/skills/requirements/review-requirements-package/` | FR2.1 |

### 2.3 Design stage

| Source path | Verdict | New path | FR |
|---|---|---|---|
| `solution-design-package/skills/create-solution-design-package/SKILL.md` | KEEP (renamed: drop "solution-" prefix) | `.agents/skills/design/create-design-package/` | FR2.1 |
| `model-2-sdlc-skills/solution-package/solution-discovery/SKILL.md` | FOLD | `.agents/skills/design/create-design-package/steps/01-discovery.md` + `references/solution-discovery-workflow.md` | FR2.1 |
| `model-2-sdlc-skills/solution-package/solution-design/SKILL.md` | FOLD | `.agents/skills/design/create-design-package/steps/02-design.md` + `references/solution-design-workflow.md` | FR2.1 |
| `model-2-sdlc-skills/solution-package/solution-review/SKILL.md` | KEEP | `.agents/skills/design/review-design-package/` | FR2.1 |

### 2.4 Planning stage

| Source path | Verdict | New path | FR |
|---|---|---|---|
| `implementation-planning/skills/create-implementation-package/SKILL.md` | KEEP (heavy PHASE→INC rename) | `.agents/skills/planning/create-implementation-package/` | FR2.1, FR10 |
| `model-2-sdlc-skills/implementation-package/implementation-plan/SKILL.md` | FOLD | `.agents/skills/planning/create-implementation-package/` (codebase-analysis, test-planning, plan-readiness as `steps/` + `references/implementation-plan-workflow.md`) | FR2.1 |
| (no archive ancestor) | NEW | `.agents/skills/planning/review-implementation-package/` — review-only counterpart matching the requirements/design review pattern | FR2.1 |

### 2.5 Execution stage

| Source path | Verdict | New path | FR |
|---|---|---|---|
| `model-2-sdlc-skills/implementation-package/implementation-execution/SKILL.md` | FOLD (target promoted) | `.agents/skills/execution/execute-increments/` (TDD + 6-step verify-loop spine) | FR2.1, FR10.3 |
| `implementation-execution/phases/phase-execution-guide.md` | FOLD (content) | `.agents/skills/execution/execute-increments/steps/` and `.agents/skills/execution/manage-bugs/` references | FR2.1 |
| `model-2-sdlc-skills/implementation-package/implementation-pr/SKILL.md` | KEEP | `.agents/skills/execution/create-pr/` | FR2.1 |
| (no archive ancestor) | NEW | `.agents/skills/execution/manage-bugs/` — log/triage/review/close modes | FR2.1 |

### 2.6 Reverse-engineering stage

| Source path | Verdict | New path | FR |
|---|---|---|---|
| `reverse-engineering/skills/analyze-repository/SKILL.md` | KEEP | `.agents/skills/reverse-engineering/analyze-repository/` | FR3.3 |
| `reverse-engineering/skills/reverse-engineer-api/SKILL.md` | KEEP | `.agents/skills/reverse-engineering/reverse-engineer-api/` | FR3.1 |
| `reverse-engineering/skills/reverse-engineer-api-framework/SKILL.md` | KEEP | `.agents/skills/reverse-engineering/reverse-engineer-api-framework/` | FR3.1 |
| `reverse-engineering/skills/reverse-engineer-database/SKILL.md` | KEEP | `.agents/skills/reverse-engineering/reverse-engineer-database/` | FR3.1 |
| `reverse-engineering/skills/reverse-engineer-mobile-app/SKILL.md` | KEEP | `.agents/skills/reverse-engineering/reverse-engineer-mobile-app/` | FR3.1 |
| `reverse-engineering/skills/reverse-engineer-mobile-framework/SKILL.md` | KEEP | `.agents/skills/reverse-engineering/reverse-engineer-mobile-framework/` | FR3.1 |
| `reverse-engineering/skills/reverse-engineer-ui-framework/SKILL.md` | KEEP | `.agents/skills/reverse-engineering/reverse-engineer-ui-framework/` | FR3.1 |
| `reverse-engineering/skills/reverse-engineer-web-app/SKILL.md` | KEEP | `.agents/skills/reverse-engineering/reverse-engineer-web-app/` | FR3.1 |

All 7 domain RE skills additionally received `steps/scaffold.md` and `steps/verify.md` from the LIFT-PROMOTED meta skills (see §2.1) — the FOLD half of those entries.

### 2.7 Quick-dev stage (SPLIT from one source skill)

| Source path | Verdict | New path | FR |
|---|---|---|---|
| `model-2-sdlc-skills/expedited-implementation-package/SKILL.md` | SPLIT (1 → 3) | `.agents/skills/quick-dev/document-quick-change/` | FR2.3 |
|  | SPLIT | `.agents/skills/quick-dev/plan-quick-change/` | FR2.3 |
|  | SPLIT | `.agents/skills/quick-dev/execute-quick-change/` (TDD loop, verify, adversarial PR review) | FR2.3 |

The `references/expedited-implementation-workflow.md` from the source becomes the spine; `change-spec.md`, `codebase-orientation.md`, `tdd-workflow.md`, `pr-reviewer.md`, `systematic-debugging.md`, `verification.md` from `model-2-sdlc-skills/expedited-implementation-package/references/` are distributed across the three split skills' references and steps.

### 2.8 Knowledge-base stage (all NEW)

This stage has no direct archive ancestor for SKILL.md content — every skill was authored fresh. One source skill provided structural inspiration only (folded as a design seed, not a lift).

| Source path | Verdict | New path | FR |
|---|---|---|---|
| `reverse-engineering/skills/build-knowledge-repository/SKILL.md` | FOLD (design seed) | `.agents/skills/knowledge-base/build-knowledge-base/` (10-component model + IS/IS-NOT framing absorbed into references) | FR9.1, FR9.4 |
| (no archive ancestor) | NEW | `.agents/skills/knowledge-base/navigate-knowledge-base/` — selective component retrieval | FR9.4 |
| (no archive ancestor) | NEW | `.agents/skills/knowledge-base/update-knowledge-base/` — update on feature ship | FR9.1.4, FR9.4 |
| (no archive ancestor) | NEW | `.agents/skills/knowledge-base/detect-knowledge-base-drift/` — 4-level drift detection | FR9.4 |
| (no archive ancestor) | NEW | `.agents/skills/knowledge-base/verify-knowledge-base-coverage/` — public-artifact → component map | FR9.4 |

### 2.9 Dropped skills

The three parent-coordinator skills are replaced by YAML compositions (FR4.1).

| Source path | Verdict | Replaced by | FR |
|---|---|---|---|
| `model-2-sdlc-skills/requirement-package/requirements-package/SKILL.md` | DROP | `templates/compositions/greenfield-requirements-package.yaml` | FR4.1 |
| `model-2-sdlc-skills/solution-package/solutions-package/SKILL.md` | DROP | `templates/compositions/greenfield-design-package.yaml` | FR4.1 |
| `model-2-sdlc-skills/implementation-package/implementation-package/SKILL.md` | DROP | `templates/compositions/greenfield-implementation-package.yaml` | FR4.1 |

---

## 3. Templates mapping

### 3.1 Monolithic templates → atomic blocks (FR4.1, FR4.4, FR4.5)

| Source path | New path | Block count |
|---|---|---|
| `requirements-package/templates/<section>.md` (already modular) | `templates/blocks/requirements/<slug>.md` | 17 blocks |
| `solution-design-package/templates/solution-design-package-template.md` (monolithic — decomposed) | `templates/blocks/design/<slug>.md` | 18 blocks |
| `reverse-engineering/templates/<domain>-doc-template.md` (per-domain, decomposed by Part A/B) | `templates/blocks/reverse-eng/<domain>/{internal,consumer}/<slug>.md` | 166 blocks |
| `implementation-planning/phases/canonical-phase-shape.md` (decomposed, renamed) | `templates/blocks/planning/<slug>.md` | 8 blocks |
| `_shared/templates/change-tracker-template.md` | `templates/blocks/shared/change-log.md` (generalized) | 1 block |
| (no archive ancestor) | `templates/blocks/execution/pr/` (PR-description blocks) | 6 blocks |
| (no archive ancestor) | `templates/blocks/knowledge-base/` (component, ADR, repo-summary, capability-index, architecture-index, shared-entity) | 6 blocks |

Every block carries the FR4.5 frontmatter envelope: `slug`, `title`, `applies-to`, `requires-decision-from`, `optional`, `order-hint`.

### 3.2 Compositions (replacing parent-coordinator skills) (FR4.2, FR4.3)

The three DROP parent-coordinators (§2.9) and the multi-domain RE/quick-dev/PR/KB artifacts are now expressed as YAML compositions under `templates/compositions/`:

```
brownfield-enhancement-spec.yaml
greenfield-design-package.yaml
greenfield-implementation-package.yaml
greenfield-requirements-package.yaml
kb-component.yaml
kb-instance-root.yaml
pr-description.yaml
quick-dev-spec.yaml
re-{api,api-framework,database,mobile-app,mobile-framework,ui-framework,web-app}-{consumer,internal}.yaml   (14 files)
```

Reduced templates (e.g., `quick-dev-spec.yaml`) are *smaller compositions over the same trunks* — no parallel template trees (FR4.3).

---

## 4. Supporting documents mapping

### 4.1 Legacy `phases/` directories (canonical shapes + workflow guides)

| Source path | What happened | Where it lives now |
|---|---|---|
| `requirements-package/phases/create-requirements-package.md` | Content distributed | `.agents/skills/requirements/create-requirements-package/references/process.md` |
| `solution-design-package/phases/create-solution-design-package.md` | Content distributed | `.agents/skills/design/create-design-package/references/process.md` |
| `implementation-planning/phases/canonical-phase-shape.md` | Decomposed (8 blocks) **and** renamed | `templates/blocks/planning/*.md` (8 increment-shape blocks) + `references/canonical-shapes/canonical-increment-shape.md` |
| `implementation-planning/phases/create-implementation-package.md` | Content distributed | `.agents/skills/planning/create-implementation-package/references/process.md` |
| `implementation-planning/phases/implementation-plan-refactoring-guide.md` | Frozen historical | (archive only) |
| `implementation-planning/phases/phase-refactoring-checklist.md` | Frozen historical | (archive only) |
| `implementation-execution/phases/phase-execution-guide.md` | Content distributed | `.agents/skills/execution/execute-increments/steps/` + `.agents/skills/execution/manage-bugs/` |
| `reverse-engineering/phases/canonical-reverse-engineering-shape.md` | Per-domain absorbed + canonical kept | `references/canonical-shapes/canonical-re-shape.md` + each `reverse-engineer-*` skill |

### 4.2 Legacy `references/` directories (model-2 workflow docs)

The model-2 skills' `references/` content was distributed into the host skills they folded into — see the per-stage tables in §2 for the exact landing paths. Notably:

- `expedited-implementation-package/references/expedited-implementation-workflow.md` → spine of the three quick-dev skills (§2.7)
- `expedited-implementation-package/references/tdd-workflow.md` → `quick-dev/execute-quick-change/steps/01-tdd-loop.md`
- `expedited-implementation-package/references/pr-reviewer.md` → `execution/create-pr/references/` and `quick-dev/execute-quick-change/steps/03-adversarial-pr-review.md`
- `expedited-implementation-package/references/codebase-orientation.md` → `quick-dev/plan-quick-change/steps/01-orient.md`
- `implementation-package/implementation-plan/references/*` → `planning/create-implementation-package/references/` and `steps/`

### 4.3 Legacy `assets/` directories

| Source path | Disposition |
|---|---|
| `model-2-sdlc-skills/expedited-implementation-package/assets/canonical-phase-shape.md` | Superseded by `references/canonical-shapes/canonical-increment-shape.md` |
| `model-2-sdlc-skills/expedited-implementation-package/assets/change-spec.md` | Folded into `quick-dev/document-quick-change/` |
| `model-2-sdlc-skills/expedited-implementation-package/assets/change-tracker-template.md` | Replaced by `templates/blocks/shared/change-log.md` |
| `model-2-sdlc-skills/expedited-implementation-package/assets/codebase-orientation.md` | → `quick-dev/plan-quick-change/steps/01-orient.md` |
| `model-2-sdlc-skills/expedited-implementation-package/assets/implementation-plan.md` | Folded into `planning/create-implementation-package/` |
| `model-2-sdlc-skills/expedited-implementation-package/assets/phase-execution-guide.md` | → `execution/execute-increments/steps/` |
| `model-2-sdlc-skills/**/assets/standards/**` (TDD / clean-code / per-language / per-framework / per-platform) | **DROP — archived only.** Not promoted to the new structure. Project-side coding-standards selection is a customization concern (FR5) and is not bundled with the framework. |

### 4.4 Legacy meta files

| Source path | Disposition |
|---|---|
| `_shared/SKILL-VALIDATION-TRACKER.md` | Frozen historical tracker; superseded by `scripts/validate.py` (NFR3) |
| `_shared/README.md` | Frozen historical |
| `model-2-sdlc-skills/README.md`, `model-2-sdlc-skills/CLAUDE.md` | Frozen historical orientation; superseded by `AGENTS.md` (FR12) and the new `README.md` |

---

## 5. Net-new capabilities (no archive ancestor)

These exist in the current structure but did not exist in `_archive/`. Each closes a specific FR gap.

| New capability | Location | FR closed |
|---|---|---|
| Knowledge-base stage (5 skills) | `.agents/skills/knowledge-base/` | FR9 (entire) |
| `start-project` orchestrator | `.agents/skills/meta/start-project/` | FR2.4 (flow-mode bootstrap) |
| `customize-framework` orchestrator | `.agents/skills/meta/customize-framework/` | FR5.4 (interactive overrides) |
| YAML compositions | `templates/compositions/` | FR4.1–FR4.3 |
| 4-layer TOML configuration | `config/{framework,framework.user,project,project.user}.toml.example` + `config/customizations/` | FR5.1–FR5.3 |
| Customization examples | `config/customizations/*.toml.example` | FR5.4 |
| KB schemas | `config/SCHEMAS.md`, `config/kb-component-frontmatter.example.yaml`, `config/kb-graph.example.json`, `config/kb-architecture.template.md` | FR9.5, FR9.6 |
| Generated registry | `.agents/skills/_registry/{skills.csv,skills.json,workflow-graph.yaml}` | FR8.4, NFR3 |
| Build-registry script | `scripts/build-registry.py` | NFR3 |
| Validator script | `scripts/validate.py` (Checks A–G) | NFR3 |
| Elicitation patterns library | `references/elicitation-patterns/` (20 files) | FR6.2 |
| Self-documenting skill trio | every `.agents/skills/**/references/{OVERVIEW,INPUTS-OUTPUTS,EXAMPLE}.md` | FR7.1, FR7.2 |
| Canonical shapes (extracted) | `references/canonical-shapes/{canonical-increment-shape,canonical-re-shape}.md` | FR10 |
| Glossary / traceability / AI-principles references | `references/{glossary-conventions,traceability,ai-principles}/` | FR1.4, NFR2 |
| Framework-shipped orientation | `AGENTS.md` (root) | FR12.1–FR12.4 |
| Internal documentation directory | `_docs/` (this file + `requirements.md`) | decision #14 (2026-04-26) |
| Skill `steps/` convention | every multi-step skill (e.g., `execute-increments/steps/01..06`) | decision #2 (granularity = trigger; sub-steps go in `steps/`) |
| `review-implementation-package` skill | `.agents/skills/planning/review-implementation-package/` | FR2.1 (review parity with requirements/design) |
| `manage-bugs` skill | `.agents/skills/execution/manage-bugs/` | FR2.1 (bug log/triage/review/close modes) |

---

## 6. Dropped artifacts

| Artifact | Why dropped | Replaced by |
|---|---|---|
| 3 parent-coordinator skills (`requirements-package`, `solutions-package`, `implementation-package`) | Pure flow-orchestration; coordination is data, not code | YAML compositions (FR4.1) |
| `model-2-sdlc-skills/**/assets/standards/**` (TDD/clean-code/per-language/-framework/-platform standards tree) | Out of framework scope; project-side concern | None — projects supply their own standards via customization (FR5) |
| Legacy "Canonical Phase Shape" terminology | Replaced wholesale | "Canonical Increment Shape" (FR10) |
| Hand-authored skill registries | Drift-prone | Generated registry via `scripts/build-registry.py` (NFR3) |
| `_shared/SKILL-VALIDATION-TRACKER.md` | Manual tracker | `scripts/validate.py` Checks A–G (NFR3) |
| Per-host skill transformation at install time | Rejected as anti-pattern | Spec-conformant `SKILL.md` runs verbatim on Copilot + Cursor (NFR5.2) |

Nothing was deleted — every dropped artifact remains in `_archive/` per FR11.3.

---

## 7. Requirements traceability (reverse index)

For each requirement, the mapping section(s) where it is fulfilled. Use this when validating that the migration closes the requirements set.

| Requirement | Where it is realized in this mapping |
|---|---|
| FR1 (skills-based architecture) | §2 (entire), §5 (self-documenting trio row) |
| FR2.1 (greenfield) | §2.2, §2.3, §2.4, §2.5; §3.2 (greenfield-* compositions) |
| FR2.2 (brownfield) | §2.6 (RE skills), §2.8 (KB stage), §3.2 (`brownfield-enhancement-spec.yaml`) |
| FR2.3 (quick-dev) | §2.7; §3.2 (`quick-dev-spec.yaml`) |
| FR2.4 (mode-aware skills) | §5 (`start-project`), §1 (vocabulary normalized once) |
| FR3 (reverse-engineering) | §2.6 (8 skills); §3.1 (166 RE blocks); §4.1 (canonical-re-shape) |
| FR4 (block-and-composition templates) | §3.1 (blocks), §3.2 (compositions) |
| FR5 (configuration) | §5 (4-layer TOML, customizations, `customize-framework`) |
| FR6 (elicitation) | §5 (elicitation patterns library) |
| FR7 (self-documenting skills) | §5 (OVERVIEW/INPUTS-OUTPUTS/EXAMPLE row) |
| FR8 (help router) | §2.1 (`framework-navigator` upgrade); §5 (`_registry/`) |
| FR9 (knowledge base) | §2.8 (5 KB skills); §3.1 (KB blocks); §5 (KB schemas) |
| FR10 (vocabulary) | §1 (entire) |
| FR11 (reorganization & migration) | §6 (nothing deleted); this whole document |
| FR12 (framework AGENTS.md) | §5 (`AGENTS.md` row) |
| NFR1 (conformance) | §2 (every new skill has agentskills.io frontmatter) |
| NFR2 (progressive disclosure) | §5 (self-documenting trio); §4.2 (workflow docs in `references/`) |
| NFR3 (validation) | §5 (`build-registry.py`, `validate.py`) |
| NFR4 (scope safety) | enforced at runtime by skills; not a structural-mapping concern |
| NFR5 (host portability) | §5 (`AGENTS.md` row); skill location decision #11 (`.agents/skills/`); §6 (no per-host transformation) |

---

*End of mapping. To re-validate that the current structure still matches this mapping, run `python3 scripts/build-registry.py` followed by `python3 scripts/validate.py --summary-md _archive/validation-report.md`.*
