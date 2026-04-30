# Inputs / Outputs — review-knowledge-base-package

## Inputs

| Name | Required? | Source | Notes |
|---|---|---|---|
| `<knowledge_base_path>/` | yes | `project.toml [project.paths] knowledge_base_path` | The KB instance to audit |
| `project.toml` | yes | `<project-root>/project.toml` | For paths and `[[project.repos]]` |
| `framework.toml` | optional | `<project-root>/framework.toml` | For `[knowledge_base.full_review_cadence]`, `[knowledge_base.solution_context_max_age_days]`, etc. |
| Source repos | yes | per `[[project.repos]]` | For sub-review 5 (staleness via `detect-knowledge-base-drift`) |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `<KB>/_review/<ISO8601>/<review-name>.md` (one per sub-review, ten total) | Markdown — findings + verdict | The user; subsequent sub-reviews; readiness gate |
| `<KB>/_review/<ISO8601>/adversarial-findings.md` | `aide-adversarial-findings@1` | `review-adversarial-pass` wrapper consumes |
| `<KB>/_review/<ISO8601>/edge-case-findings.md` | `aide-adversarial-findings@1` | `review-edge-cases` wrapper consumes |
| `<KB>/_review/<ISO8601>/readiness-verdict.md` | Markdown — APPROVED / CONDITIONAL / BLOCKED | The user; tracked for cadence |
| `<KB>/_review/<ISO8601>/coverage-report.md` | Markdown — output of `verify-knowledge-base-coverage` | Sub-review 2 input |
| `<KB>/_review/<ISO8601>/drift-report.md` | Markdown — output of `detect-knowledge-base-drift` | Sub-review 5 input |

`<ISO8601>` is the audit run's timestamp (`YYYY-MM-DDTHH-MM-SSZ`). Each run gets its own subdirectory; historical audits are preserved.

## Side effects

- Writes review artifacts to `<KB>/_review/<ISO8601>/`.
- Invokes `verify-knowledge-base-coverage` (sub-review 2), `detect-knowledge-base-drift` (sub-review 5), `meta/review-adversarial` (sub-review 8), `meta/review-edge-case-hunter` (sub-review 9). Each writes its own output file as configured by the wrapper.
- Does NOT modify any leaf, `ARCHITECTURE.md`, `CLAUDE.md`, `graph.json`, or `glossary.md`.
- Does NOT modify source repos.

## Failure modes

| Condition | Behaviour |
|---|---|
| `knowledge_base_path` missing or empty | Halt with: `KB not found at <path>. Run build-knowledge-base first.` |
| `verify-knowledge-base-coverage` not registered | Halt with a clear error and a pointer to `scripts/build-registry.py` |
| `detect-knowledge-base-drift` not registered | Same pattern |
| `meta/review-adversarial` or `meta/review-edge-case-hunter` not registered | Same pattern |
| A sub-review returns FAIL | Halt the sequence; per the standard fail-recovery pattern |
| `_review/` directory cannot be created | Halt with permissions error |

## Cadence configuration

`framework.toml [knowledge_base.full_review_cadence]` (optional, default `quarterly`) — informational only; the skill does not schedule itself. Other tooling (cron, CI scheduled jobs) invokes this skill on cadence.

## Composition awareness

The skill respects the same `[[project.repos]]` enumeration as the rest of the KB pipeline. If a repo is removed from `project.toml`, sub-review 7 (solution-context coverage) accounts for it; sub-review 5 (staleness) does not check leaves for the removed repo.
