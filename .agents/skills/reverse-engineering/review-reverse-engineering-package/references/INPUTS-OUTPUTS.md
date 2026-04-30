# Inputs / Outputs — review-reverse-engineering-package

## Inputs

| Name | Required? | Source | Notes |
|---|---|---|---|
| Part A doc set | yes | `<knowledge_base_path>/source-docs/<repo-slug>/internal.md` plus any per-section files | The "internal" half produced by the dispatched RE skill |
| Part B doc set | yes | `<knowledge_base_path>/source-docs/<repo-slug>/consumer.md` plus any per-section files | The "consumer" half |
| Source repo | yes | `<repo-path>` from `[[project.repos]]` | Used for grounding, freshness, traceability |
| `project.toml` | yes | `<project-root>/project.toml` | For `knowledge_base_path` and `[[project.repos]]` |
| `framework.toml` | optional | `<project-root>/framework.toml` | For `[knowledge_base.re_max_drift_commits]` and other thresholds |
| Domain skill spec | yes | `.agents/skills/reverse-engineering/<domain-skill>/SKILL.md` plus its required-sections reference | Defines what counts as "complete" for sub-review 1 |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `<knowledge_base_path>/source-docs/<repo-slug>/review/<review-name>.md` (one per sub-review, nine total) | Markdown — findings + PASS / PASS WITH OBSERVATIONS / FAIL verdict | The user; subsequent sub-reviews; the readiness gate |
| `<knowledge_base_path>/source-docs/<repo-slug>/review/adversarial-findings.md` | `aide-adversarial-findings@1` | `review-adversarial-pass` wrapper consumes this to compute its verdict |
| `<knowledge_base_path>/source-docs/<repo-slug>/review/edge-case-findings.md` | `aide-adversarial-findings@1` | `review-edge-cases` wrapper consumes this |
| `<knowledge_base_path>/source-docs/<repo-slug>/review/readiness-verdict.md` | Markdown — APPROVED / CONDITIONAL / BLOCKED | `build-knowledge-base` / `update-knowledge-base`; the user |

## Side effects

- Writes per-review findings, adversarial/edge-case findings, and the readiness verdict to the source-docs review/ subdirectory.
- Does NOT modify the Part A or Part B docs themselves.
- Does NOT modify the source repo.
- Does NOT modify the global KB.

## Failure modes

| Condition | Behaviour |
|---|---|
| Part A or Part B doc set missing | Halt with: `RE doc set incomplete for <repo>. Run analyze-repository and the dispatched RE skill first.` |
| Source repo path in `[[project.repos]]` does not exist | Halt with: `Source repo not found at <path>. Check project.toml.` |
| `meta/review-adversarial` or `meta/review-edge-case-hunter` not registered | Halt with a clear error and a pointer to register them via `scripts/build-registry.py`. |
| A sub-review returns FAIL | Halt the sequence; per the standard fail-recovery pattern, fix and re-run from the failed sub-review |

## Composition awareness

If `framework.toml` defines `[knowledge_base.re_max_drift_commits]`, sub-review 5 (review-freshness) uses it as the FAIL threshold. Default: 0 (any drift fails).
