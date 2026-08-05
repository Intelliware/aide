# Inputs / Outputs — review-edge-case-hunter

## Inputs

| Name | Required? | Default | Description |
|---|---|---|---|
| `--target=<path>` | yes | — | Path to the artifact under review. File or directory; same resolution rules as `review-adversarial`. |
| `--stage=<stage>` | no | inferred | One of: `requirements`, `design`, `planning`, `execution`, `reverse-engineering`, `knowledge-base`, `quick-dev`, `meta`. Influences category emphasis (see `OVERVIEW.md` § Stage-specific specializations). |
| `--output-path=<path>` | no | derived | Default for standalone use: `_review/<artifact-slug>/<ISO8601>/review-edge-case-hunter.md`. Wrappers always supply this explicitly. |
| `--target-commit=<sha>` | no | `git rev-parse --short HEAD` | Short SHA recorded in findings frontmatter. |
| `--max-findings=<n>` | no | 50 | Hard cap on findings emitted. |

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Findings file | `--output-path` | `aide-adversarial-findings@1` (Format 4) — see `references/review-patterns/review-output-format.md` |

Same Format 4 schema as `review-adversarial`. The `produced_by` frontmatter field carries `review-edge-case-hunter`; this is the only frontmatter difference.

## Side effects

None. Same as `review-adversarial`.

## Failure modes

Same as `review-adversarial` (target not found / stage invalid / parent dir missing / cap reached / target frontmatter mismatch). See that skill's `INPUTS-OUTPUTS.md` for the table.

## Determinism

Two invocations may produce different findings (model-driven analysis is non-deterministic). The schema is deterministic.

## Performance notes

- Single artifact: typical runtime under a minute.
- Directory targets read the canonical entry file plus sibling files; the skill does not exhaustively enumerate edges across every leaf in a KB instance. State the bound in the findings file rather than implying full coverage; for a KB-wide sweep use `verify-knowledge-base-coverage`.

## Schema version

Currently produces `aide-adversarial-findings@1`.
