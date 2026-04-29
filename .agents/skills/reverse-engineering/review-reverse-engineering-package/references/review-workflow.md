# Review Workflow — review-reverse-engineering-package

Run formal review only after Part A + Part B doc sets exist for a repo at `<knowledge_base_path>/source-docs/<repo-slug>/`. Each sub-review produces findings and a PASS / PASS WITH OBSERVATIONS / FAIL verdict.

## Sequential execution rule

Run sub-reviews strictly in order. Do not skip ahead and do not run in parallel. After each sub-review, present findings and verdict. A FAIL halts the sequence until resolved.

| Order | Sub-review | What it checks | Detail |
|---|---|---|---|
| 1 | review-section-completeness | Every required Part A and Part B section is present and non-stub | See OVERVIEW.md § per-review depth |
| 2 | review-grounding | Every claim references a source file or commit | Threshold: <1% ungrounded for PASS, 1–5% for OBS, >5% for FAIL |
| 3 | review-consistency | Part A and Part B do not contradict each other on contracts, data, integrations | FAIL on any load-bearing contradiction |
| 4 | review-coverage | Public-surface artifacts (APIs, schemas, routes, CLI, jobs, events) all surfaced | FAIL on any unsurfaced public artifact |
| 5 | review-freshness | `last_verified_against_commit` matches source HEAD (or within `[knowledge_base.re_max_drift_commits]`) | FAIL if drift exceeds threshold |
| 6 | review-traceability | Component frontmatter `paths` resolve to real files at target commit | FAIL on any zero-match glob |
| 7 | review-adversarial-pass | Invokes `meta/review-adversarial --stage=reverse-engineering` | Verdict per review-verdict-mapping.md |
| 8 | review-edge-cases | Invokes `meta/review-edge-case-hunter --stage=reverse-engineering` | Verdict per review-verdict-mapping.md |
| 9 | review-re-readiness | Final go/no-go gate for KB ingestion | APPROVED / CONDITIONAL / BLOCKED |

## Sub-review 7 dispatcher (review-adversarial-pass)

```
meta/review-adversarial \
  --target=<KB>/source-docs/<repo-slug>/internal.md \
  --stage=reverse-engineering \
  --output-path=<KB>/source-docs/<repo-slug>/review/adversarial-findings.md
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

Write the verdict to `<KB>/source-docs/<repo-slug>/review/review-adversarial-pass.md` along with a one-line summary citing the findings file.

## Sub-review 8 dispatcher (review-edge-cases)

Identical pattern, with these substitutions:

```
meta/review-edge-case-hunter \
  --target=<KB>/source-docs/<repo-slug>/internal.md \
  --stage=reverse-engineering \
  --output-path=<KB>/source-docs/<repo-slug>/review/edge-case-findings.md
```

Verdict written to `<KB>/source-docs/<repo-slug>/review/review-edge-cases.md`.

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
