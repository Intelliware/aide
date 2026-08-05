# Review Workflow — review-reverse-engineering-package

Run formal review only after the Part A + Part B doc sets exist for a repo. Each sub-review produces findings and a PASS / PASS WITH OBSERVATIONS / FAIL verdict.

Path shorthand, resolved in the skill's Step 0:

- `<PART-A>` = `<source-repo-path>/docs/<domain>-internal/` — composition-rendered tree plus `extraction-status.md` and `CHANGE-TRACKER.md` at its root
- `<PART-B>` = `<knowledge_base_path>/source-docs/<repo-slug>/<domain>-consumer/` — composition-rendered tree
- Review artifacts are written to `<PART-A>/review/`

Neither part is a single file. The canonical entry file for a whole-tree target is the
lowest-numbered rendered block (`01-*.md`); sub-reviews that read "the doc set" walk the
tree, not one document.

## Mechanical evidence

When the RE skill ran `steps/verify.md` in `review-evidence` mode before handing off, its
report is available and pre-answers the machine-checkable parts of sub-reviews 1, 5, and 6.
Read it first and cite it rather than re-deriving: the report already carries the marker
scan, the `extraction-status.md` reconciliation, the composition block-list diff,
cross-reference resolution, and the `last_verified_against_commit` check.

The report never substitutes for a verdict. It supplies evidence; the sub-review still
judges, and the user still accepts. If the report is absent, run those checks here and
record in the readiness verdict that the sub-reviews ran unaided.

## Sequential execution rule

Run sub-reviews strictly in order. Do not skip ahead and do not run in parallel. After each sub-review, present findings and verdict, and wait for the user's explicit acceptance before writing the verdict file. A FAIL halts the sequence until resolved.

| Order | Sub-review | What it checks | Detail |
|---|---|---|---|
| 1 | review-section-completeness | Every non-gated block in both compositions has a rendered `<NN>-<bare-slug>.md`, non-stub | Baseline is `re-<domain>-internal.yaml` + `re-<domain>-consumer.yaml`; gaps legal only where `decision-gates: include-if:` excluded the block |
| 2 | review-grounding | Every claim references a source file or commit | Threshold: <1% ungrounded for PASS, 1–5% for OBS, >5% for FAIL |
| 3 | review-consistency | Part A and Part B do not contradict each other on contracts, data, integrations | FAIL on any load-bearing contradiction |
| 4 | review-coverage | Public-surface artifacts (APIs, schemas, routes, CLI, jobs, events) all surfaced, plus the domain's supplementary artifacts | FAIL on any unsurfaced public artifact; see § per-domain coverage expectations |
| 5 | review-freshness | `last_verified_against_commit` present, full SHA, within `[knowledge_base] staleness_warning_days` | FAIL if missing, short-form, or outside the window |
| 6 | review-traceability | Component frontmatter `paths` resolve to real files at target commit | FAIL on any zero-match glob |
| 7 | review-adversarial-pass | Invokes `meta/review-adversarial --stage=reverse-engineering` | Verdict per review-verdict-mapping.md |
| 8 | review-edge-cases | Invokes `meta/review-edge-case-hunter --stage=reverse-engineering` | Verdict per review-verdict-mapping.md |
| 9 | review-re-readiness | Final go/no-go gate for KB ingestion | APPROVED / CONDITIONAL / BLOCKED |

## Per-domain coverage expectations (sub-review 4)

Beyond the block list, these domains emit supplementary artifacts that are not
block-driven. Sub-review 4 confirms each exists and is well-formed against the schema in
the producing skill's `references/INPUTS-OUTPUTS.md`.

| Domain | Coverage expectations |
|---|---|
| api | `openapi.yaml` at the `<PART-B>` root; passes a spec linter without errors |
| cobol-program | `program-call-graph.mmd`, `program-data-bindings.json`, `program-exec-inventory.md` |
| copybook-library | `copybook-record-graph.json`, `data-dictionary.md`, `copybook-conflicts.md` |
| jcl-job | `job-flow.mmd`, `dataset-io.json` |
| database | ERD artifact referenced by the consumer tree |
| test-suite | Marker vocabulary mapping and `tests:` cross-links resolve |

The remaining domains (api-framework, web-app, ui-framework, mobile-app,
mobile-framework) have no supplementary artifacts; sub-review 4 covers their public
surface only.

## Sub-review 7 dispatcher (review-adversarial-pass)

```
meta/review-adversarial \
  --target=<PART-A> \
  --stage=reverse-engineering \
  --output-path=<PART-A>/review/adversarial-findings.md
```

After the skill writes the findings file, this sub-review reads its frontmatter `worst_severity` and applies the verdict-mapping table:

| `worst_severity` | Verdict |
|---|---|
| `critical` | FAIL |
| `high` | PASS WITH OBSERVATIONS |
| `medium` | PASS WITH OBSERVATIONS |
| `low` | PASS |
| `none` | PASS |

If `triage_counts.must-fix > 0` AND `worst_severity == high`, MAY upgrade to FAIL (must-fix-on-high escalation).

Write the verdict to `<PART-A>/review/review-adversarial-pass.md` along with a one-line summary citing the findings file.

## Sub-review 8 dispatcher (review-edge-cases)

Identical pattern, with these substitutions:

```
meta/review-edge-case-hunter \
  --target=<PART-A> \
  --stage=reverse-engineering \
  --output-path=<PART-A>/review/edge-case-findings.md
```

Verdict written to `<PART-A>/review/review-edge-cases.md`.

## Verdicts

- PASS — no findings; proceed to next sub-review.
- PASS WITH OBSERVATIONS — non-blocking; user must explicitly accept; recorded in the verdict file.
- FAIL — halt the sequence; resolve before continuing.

## Fail recovery

When a sub-review returns FAIL:

1. Stop the sequence.
2. Present findings and the affected docs / sections.
3. Help the user resolve if asked. RE-output fixes are usually authored by re-running the relevant RE skill.
4. Re-run the failed sub-review from the beginning.
5. If the fix changes content checked by an earlier passed sub-review, re-evaluate that earlier verdict.
6. Append a `Review finding` row to the source-docs change tracker (if one exists; otherwise begin one).

## Readiness gate

`review-re-readiness` runs last. Verdicts:

- APPROVED — all sub-reviews PASS or PASS WITH OBSERVATIONS (accepted), no FAIL outstanding. KB ingestion is permitted.
- CONDITIONAL — APPROVED with one or more documented conditions (e.g., "two ungrounded claims accepted; track for next RE re-run"). User must accept conditions explicitly. KB ingestion permitted with conditions recorded.
- BLOCKED — any sub-review's FAIL is unresolved. KB ingestion is blocked.

## Stage handoff

After readiness returns APPROVED or CONDITIONAL, ask the user:

> RE review is approved for `<repo>`. Are you ready to proceed with KB ingestion?

If yes, recommend `build-knowledge-base` (first ingestion) or `update-knowledge-base` (subsequent). Summarize accepted conditions for the KB ingest skill to record in component frontmatter where applicable.

If no, stop and summarize the approved state.
