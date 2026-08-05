# Inputs / Outputs — review-reverse-engineering-package

## Inputs

Path shorthand used throughout: `<PART-A>` is `<source-repo-path>/docs/<domain>-internal/`
and `<PART-B>` is `<knowledge_base_path>/source-docs/<repo-slug>/<domain>-consumer/`.
Both are composition-rendered trees of `<NN>-<bare-slug>.md` files, not single documents.

| Name | Required? | Source | Notes |
|---|---|---|---|
| Part A doc set | yes | `<PART-A>` | The "internal" tree produced by the dispatched RE skill, rendered against `re-<domain>-internal.yaml` |
| Part B doc set | yes | `<PART-B>` | The "consumer" tree, rendered against `re-<domain>-consumer.yaml` |
| Internal composition | yes | `templates/compositions/re-<domain>-internal.yaml` | The authority on the required Part A block list for sub-review 1 |
| Consumer composition | yes | `templates/compositions/re-<domain>-consumer.yaml` | Same, for Part B |
| `extraction-status.md` | yes | `<PART-A>/extraction-status.md` | Inventory reconciliation for sub-reviews 1 and 4 |
| `CHANGE-TRACKER.md` | yes | `<PART-A>/CHANGE-TRACKER.md` | Session provenance for sub-review 5 |
| Mechanical verification report | recommended | produced by the RE skill's `steps/verify.md` in `review-evidence` mode | Evidence for sub-reviews 1, 5, 6. When absent, those sub-reviews run their own checks from scratch and the readiness verdict records that they were unaided |
| Source repo | yes | `<repo-path>` from `[[project.repos]]` | Used for grounding, freshness, traceability |
| `project.toml` | yes | `<project-root>/project.toml` | For `knowledge_base_path` and `[[project.repos]]` |
| `framework.toml` | optional | `<project-root>/framework.toml` | For `[knowledge_base] staleness_warning_days` (sub-review 5 threshold) |
| Supplementary artifacts | when the domain produces them | `<PART-B>` root (e.g. `openapi.yaml`) or `<PART-A>` root (mainframe feed files) | Not block-driven; sub-review 4 checks them for existence and well-formedness |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `<PART-A>/review/<review-name>.md` (one per sub-review, nine total) | Markdown — findings + PASS / PASS WITH OBSERVATIONS / FAIL verdict | The user; subsequent sub-reviews; the readiness gate |
| `<PART-A>/review/adversarial-findings.md` | `aide-adversarial-findings@1` | `review-adversarial-pass` wrapper consumes this to compute its verdict |
| `<PART-A>/review/edge-case-findings.md` | `aide-adversarial-findings@1` | `review-edge-cases` wrapper consumes this |
| `<PART-A>/review/readiness-verdict.md` | Markdown — APPROVED / CONDITIONAL / BLOCKED | `build-knowledge-base` / `update-knowledge-base`; the user |
| `CHANGE-TRACKER.md` rows | Markdown table — `Trigger = Review finding` rows for any fix the review triggers | The next RE pass; drift detection |

## Side effects

- Writes per-review findings, adversarial/edge-case findings, and the readiness verdict to `<PART-A>/review/`.
- Appends `Review finding` rows to `<PART-A>/CHANGE-TRACKER.md` when a finding leads to a fix.
- Does NOT modify the Part A or Part B docs themselves.
- Does NOT modify the source repo.
- Does NOT modify the global KB.

## Failure modes

| Condition | Behaviour |
|---|---|
| Part A or Part B doc set missing | Halt with: `RE doc set incomplete for <repo>. Run analyze-repository and the dispatched RE skill first.` |
| Domain unresolvable, or `[[project.repos]]` role disagrees with the Part-A directory name | Halt and ask. Never guess — the wrong composition yields confidently wrong completeness findings. |
| Either composition missing from `templates/compositions/` | Halt with: `Composition re-<domain>-<part>.yaml not found; sub-review 1 has no completeness baseline.` |
| Source repo path in `[[project.repos]]` does not exist | Halt with: `Source repo not found at <path>. Check project.toml.` |
| `meta/review-adversarial` or `meta/review-edge-case-hunter` not registered | Halt with a clear error and a pointer to register them via `scripts/build-registry.py`. |
| A sub-review returns FAIL | Halt the sequence; per the standard fail-recovery pattern, fix and re-run from the failed sub-review |

## Composition awareness

Sub-review 1 resolves its completeness baseline from the two compositions, honouring
`order` for the `<NN>` index and `decision-gates: include-if:` for legal omissions. A
numbering gap is only legal where the gated-out block explains it; an unexplained gap
is a finding.

Sub-review 5 (review-freshness) uses `[knowledge_base] staleness_warning_days` from
`framework.toml` as its threshold (default 30). A `last_verified_against_commit` older
than that window is stale; a missing or short-form SHA is a FAIL regardless of age.
