# Review Workflow — review-knowledge-base-package

Run formal periodic review against an existing KB instance at `<knowledge_base_path>/`. Each sub-review produces findings and a PASS / PASS WITH OBSERVATIONS / FAIL verdict.

This skill is periodic by design — typical cadence is monthly or quarterly per `framework.toml [knowledge_base.full_review_cadence]`. For per-PR signals use `detect-knowledge-base-drift`.

## Sequential execution rule

Run sub-reviews strictly in order. Do not skip ahead and do not run in parallel. After each sub-review, present findings and verdict. A FAIL halts the sequence until resolved.

| Order | Sub-review | What it checks |
|---|---|---|
| 1 | review-architecture-index | `ARCHITECTURE.md` exists, well-formed, all sections present, repo map matches `[[project.repos]]` |
| 2 | review-component-coverage | Every public artifact has a leaf — invokes `verify-knowledge-base-coverage` |
| 3 | review-graph-integrity | `graph.json` parses; `depends_on` / `consumed_by` symmetric; no cycles |
| 4 | review-frontmatter-integrity | Required frontmatter fields present per schema across all leaves |
| 5 | review-staleness | Invokes `detect-knowledge-base-drift` at L1 + L4 |
| 6 | review-link-integrity | Internal markdown links resolve; section anchors exist |
| 7 | review-solution-context-coverage | `shared/{solution-context, ai-rules, operations}/` leaves present; per-repo references touch every `[[project.repos]]` entry |
| 7.5 | review-mainframe-lineage-integrity *(conditional)* | **When `<KB>/lineage/mainframe/` exists:** every contributing repo's `program-data-bindings.json` / `copybook-record-graph.json` / `dataset-io.json` is present, parses, and was consumed by `build-mainframe-data-lineage`; `field-where-used.md` covers every canonical field; unbound `EXEC SQL` host-vars are listed in `09-unbound-and-flagged-items.md` with a triage class; provenance SHAs in `01-lineage-overview.md` match each contributing repo's `last_verified_against_commit`; coverage rules 1–10 (per `build-mainframe-data-lineage/steps/08-verify-coverage.md`) all PASS. **Skipped with a recorded `N/A` verdict when the directory is absent.** |
| 8 | review-adversarial-pass | Invokes `meta/review-adversarial --stage=knowledge-base` against `ARCHITECTURE.md` |
| 9 | review-edge-cases | Invokes `meta/review-edge-case-hunter --stage=knowledge-base` against `ARCHITECTURE.md` |
| 10 | review-kb-readiness | Final go/no-go gate (last) |

## Sub-review 2 dispatcher (review-component-coverage)

```
verify-knowledge-base-coverage \
  --output=<KB>/_review/<run-ts>/coverage-report.md
```

Read the coverage report's verdict header. Map:

- "Orphan artifacts found" → FAIL
- "Stale leaves found" only → PASS WITH OBSERVATIONS
- "Coverage clean" → PASS

Write the wrapping verdict to `<KB>/_review/<run-ts>/review-component-coverage.md` with a one-line summary citing the report.

## Sub-review 5 dispatcher (review-staleness)

```
detect-knowledge-base-drift \
  --layer=L1+L4 \
  --output=<KB>/_review/<run-ts>/drift-report.md
```

Read the drift report. Map:

- Any high-severity component drift → FAIL
- Medium drift only → PASS WITH OBSERVATIONS
- Solution-context staleness only → PASS WITH OBSERVATIONS (advisory)
- No drift → PASS

Write the wrapping verdict to `<KB>/_review/<run-ts>/review-staleness.md`.

## Sub-review 8 dispatcher (review-adversarial-pass)

```
meta/review-adversarial \
  --target=<KB>/ARCHITECTURE.md \
  --stage=knowledge-base \
  --output-path=<KB>/_review/<run-ts>/adversarial-findings.md
```

Read findings frontmatter `worst_severity`. Apply verdict-mapping table:

| `worst_severity` | Verdict |
|---|---|
| `critical` | FAIL |
| `high` | PASS WITH OBSERVATIONS |
| `medium` | PASS WITH OBSERVATIONS |
| `low` | PASS |
| `none` | PASS |

If `triage_counts.must-fix > 0` AND `worst_severity == high`, MAY upgrade to FAIL. Write verdict to `<KB>/_review/<run-ts>/review-adversarial-pass.md`.

## Sub-review 9 dispatcher (review-edge-cases)

Identical pattern with `meta/review-edge-case-hunter`:

```
meta/review-edge-case-hunter \
  --target=<KB>/ARCHITECTURE.md \
  --stage=knowledge-base \
  --output-path=<KB>/_review/<run-ts>/edge-case-findings.md
```

Verdict written to `<KB>/_review/<run-ts>/review-edge-cases.md`.

## Verdicts

- PASS — no findings; proceed to next sub-review.
- PASS WITH OBSERVATIONS — non-blocking; user must explicitly accept; recorded in the verdict file.
- FAIL — halt the sequence; resolve before continuing.

## Fail recovery

When a sub-review returns FAIL:

1. Stop the sequence.
2. Present findings.
3. Help the user resolve. KB-level fixes are authored by:
   - `update-knowledge-base` (for missing leaves, drift, graph regeneration)
   - The relevant RE skill (for source-doc fixes)
   - `capture-solution-context` / `generate-ai-rules` / `document-operations` (for missing shared/ leaves)
4. Re-run the failed sub-review from the beginning.
5. If the fix changes content checked by an earlier passed sub-review, re-evaluate that earlier verdict.

## Readiness gate

`review-kb-readiness` runs last. Reads all nine prior verdicts. Verdicts:

- APPROVED — all sub-reviews PASS or PASS WITH OBSERVATIONS (accepted), no FAIL outstanding. KB is healthy.
- CONDITIONAL — APPROVED with one or more documented conditions. User must accept conditions explicitly. Each condition gets a recommended fix-by date based on `framework.toml [knowledge_base.full_review_cadence]`.
- BLOCKED — any sub-review's FAIL is unresolved.

The readiness verdict file always concludes with a "Next review" line setting the next cadence date.

## Cadence note

This skill is intended to be invoked on cadence (cron, scheduled CI). The skill itself does not schedule. Output is written to a fresh ISO-timestamped subdirectory under `<KB>/_review/` so historical audits are preserved.
