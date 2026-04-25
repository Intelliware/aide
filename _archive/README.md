# `_archive/`

Frozen snapshot of the pre-unification framework, plus the audit and validation report from the migration.

## Why this exists

Theframework was unified into a skills-based, agentskills.io-compliant SDLC framework. The original folders were consolidated:
- skills lifted/folded into the new `skills/<stage>/` structure
- templates decomposed into reusable blocks under `templates/blocks/`, assembled by YAML compositions under `templates/compositions/`
- a `knowledge-base/` capability added (5 new skills + schemas + block templates)
- two new orchestrators added (`start-project`, `customize-framework`)
- `framework-navigator` upgraded into a goal-mode + catalog-mode help router
- a generated registry (`skills/_registry/skills.csv` + `workflow-graph.yaml`) added
- terminology renamed: PHASE→INC; "phase" (SDLC-level) → "stage"; "phase" (implementation chunk) → "increment"; RE-internal `Phase 1/2/3` → `Stage 1/2/3`

Nothing in `_archive/` is referenced at runtime. It's historical context.

## Skill path mapping (legacy → new)

For every existing skill's verdict and full reasoning, see `skill-disposition.md`. Summary:

| Old path | Verdict | New path |
|---|---|---|
| `_shared/skills/document-sharding/` | KEEP (renamed) | `skills/meta/shard-document/` |
| `_shared/skills/framework-navigator/` | KEEP + UPGRADED | `skills/meta/framework-navigator/` |
| `_shared/skills/track-change/` | KEEP | `skills/meta/track-change/` |
| `requirements-package/skills/create-requirements-package/` | KEEP | `skills/requirements/create-requirements-package/` |
| `solution-design-package/skills/create-solution-design-package/` | KEEP (renamed) | `skills/design/create-design-package/` |
| `implementation-planning/skills/create-implementation-package/` | KEEP (PHASE→INC) | `skills/planning/create-implementation-package/` |
| `reverse-engineering/skills/analyze-repository/` | KEEP | `skills/reverse-engineering/analyze-repository/` |
| `reverse-engineering/skills/build-knowledge-repository/` | FOLD (KB seed) | `skills/knowledge-base/build-knowledge-base/` |
| `reverse-engineering/skills/reverse-engineer-{api,api-framework,database,mobile-app,mobile-framework,ui-framework,web-app}/` | KEEP (7 skills) | `skills/reverse-engineering/reverse-engineer-*/` |
| `reverse-engineering/skills/scaffold-documentation/` | LIFT-PROMOTED + FOLD | `skills/meta/scaffold-documentation/` + per-RE `steps/scaffold.md` |
| `reverse-engineering/skills/verify-extraction/` | LIFT-PROMOTED + FOLD | `skills/meta/verify-source/` + per-RE `steps/verify.md` |
| `model-2-sdlc-skills/expedited-implementation-package/` | KEEP (3-way split) | `skills/quick-dev/{document,plan,execute}-quick-change/` |
| `model-2-sdlc-skills/implementation-package/implementation-execution/` | FOLD | `skills/execution/execute-increments/` |
| `model-2-sdlc-skills/implementation-package/implementation-package/` | DROP | (replaced by YAML compositions) |
| `model-2-sdlc-skills/implementation-package/implementation-plan/` | FOLD | `skills/planning/create-implementation-package/` (steps + references) |
| `model-2-sdlc-skills/implementation-package/implementation-pr/` | KEEP | `skills/execution/create-pr/` |
| `model-2-sdlc-skills/requirement-package/requirements-analysis/` | FOLD | `skills/requirements/create-requirements-package/steps/03-analysis.md` |
| `model-2-sdlc-skills/requirement-package/requirements-discovery/` | FOLD | `skills/requirements/create-requirements-package/steps/01-discovery.md` |
| `model-2-sdlc-skills/requirement-package/requirements-package/` | DROP | (replaced by YAML compositions) |
| `model-2-sdlc-skills/requirement-package/requirements-review/` | KEEP | `skills/requirements/review-requirements-package/` |
| `model-2-sdlc-skills/requirement-package/requirements-writing/` | FOLD | `skills/requirements/create-requirements-package/steps/04-writing.md` |
| `model-2-sdlc-skills/solution-package/solution-design/` | FOLD | `skills/design/create-design-package/steps/02-design.md` |
| `model-2-sdlc-skills/solution-package/solution-discovery/` | FOLD | `skills/design/create-design-package/steps/01-discovery.md` |
| `model-2-sdlc-skills/solution-package/solution-review/` | KEEP | `skills/design/review-design-package/` |
| `model-2-sdlc-skills/solution-package/solutions-package/` | DROP | (replaced by YAML compositions) |

## Template path mapping

| Old path | New path |
|---|---|
| `requirements-package/templates/<section>.md` (already modular) | `templates/blocks/requirements/<slug>.md` (17 blocks) |
| `solution-design-package/templates/solution-design-package-template.md` (monolithic, decomposed) | `templates/blocks/design/<slug>.md` (18 blocks) |
| `reverse-engineering/templates/<domain>-doc-template.md` (decomposed by Part A/B) | `templates/blocks/reverse-eng/<domain>/{internal,consumer}/<slug>.md` (166 blocks) |
| `implementation-planning/phases/canonical-phase-shape.md` (decomposed, renamed) | `templates/blocks/planning/<slug>.md` (8 blocks; phase→increment) |
| `_shared/templates/change-tracker-template.md` | `templates/blocks/shared/change-log.md` (generalized) |

## Other content

| Old path | What happened |
|---|---|
| `requirements-package/phases/` | Frozen here for reference; phase guide content distributed across `skills/requirements/create-requirements-package/references/` |
| `solution-design-package/phases/` | Frozen; content distributed across `skills/design/create-design-package/references/` |
| `implementation-planning/phases/` | Frozen; canonical-phase-shape.md became 8 planning blocks (renamed); create-implementation-package.md content distributed across new skill's references/ |
| `implementation-execution/phases/phase-execution-guide.md` | Frozen; content distributed into `skills/execution/execute-increments/steps/` and `skills/execution/manage-bugs/` |
| `reverse-engineering/phases/` | Frozen; canonical-reverse-engineering-shape.md content lives in each new RE skill |
| `_shared/SKILL-VALIDATION-TRACKER.md` | Frozen historical tracker |
| `model-2-sdlc-skills/README.md`, `model-2-sdlc-skills/CLAUDE.md` | Frozen historical orientation docs |

## Files in this directory

- `skill-disposition.md` — disposition audit (task #1) with full per-skill verdict + reasoning
- `validation-report.md` — final validation pass (task #8)
- `_shared/`, `implementation-execution/`, `implementation-planning/`, `model-2-sdlc-skills/`, `requirements-package/`, `reverse-engineering/`, `solution-design-package/` — the 7 legacy folders (frozen)

## Re-checking the new structure

```
python3 scripts/build-registry.py    # validates frontmatter, line caps, references/ trio
python3 scripts/validate.py          # composition/block cross-refs, workflow-graph resolution, etc.
```
