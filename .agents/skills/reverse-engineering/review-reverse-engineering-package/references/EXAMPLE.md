# Example — review-reverse-engineering-package

End-to-end worked example showing the skill applied to a freshly-RE'd repo before KB ingestion.

## Setup

Project: a multi-repo solution. The `api-orders` repo has just been processed by `analyze-repository` → `reverse-engineer-api-framework` (chosen because the repo is the framework providing the order API rather than a consumer of one). At the close-out gate the user chose **review**, so `steps/verify.md` ran in `review-evidence` mode and its report is on hand.

Part A lives in the source repo; Part B lives in the KB:

```
../api-orders/docs/api-framework-internal/        # <PART-A>
├── 01-architecture.md
├── 02-request-pipeline.md
├── 04-persistence.md                             # 03 gated out
├── …
├── extraction-status.md
├── CHANGE-TRACKER.md
└── verification-report.md                        # review-evidence mode output

<knowledge_base_path>/source-docs/api-orders/api-framework-consumer/   # <PART-B>
├── 01-getting-started.md
├── 02-public-api.md
└── …
```

User wants validation before running `build-knowledge-base`.

## Invocation

User: "review the RE output for api-orders"

## Step 0 — Resolve domain and paths

`[[project.repos]]` gives `code = "api-orders"`, `role = "api-framework"`. The Part-A
directory on disk is `docs/api-framework-internal/` — agreement, so the domain resolves to
`api-framework` and both compositions are `re-api-framework-internal.yaml` /
`re-api-framework-consumer.yaml`. Review artifacts will go to `<PART-A>/review/`.

## Sequence (truncated)

### Sub-review 1 — review-section-completeness

Resolves both compositions, sorts by `order`, indexes over the full list. `re-api-framework-internal.yaml` declares 11 blocks; block 03 (`03-graphql-layer`) has `decision-gates: include-if:` on a GraphQL surface the repo does not expose, so its absence is legal and the `03 → 04` gap is explained. The remaining 10 all have authored files.

The mechanical report already carried this diff; the sub-review cites it rather than re-deriving. PASS.

### Sub-review 2 — review-grounding

Walks every claim across the Part A tree checking for path references. Finds two claims with no source citation:

- "The auth middleware applies rate limiting" — no path
- "Error responses follow RFC 7807" — no example file

Verdict: PASS WITH OBSERVATIONS. User accepts.

### Sub-review 3 — review-consistency

Part A says POST /orders returns `201` on success. Part B says POST /orders returns `200`. Contradiction.

Verdict: FAIL.

User fixes Part B by re-running the RE skill (which re-reads the OpenAPI). Re-runs `review-consistency`. Now PASS.

### Sub-reviews 4–6

review-coverage (public surface surfaced; `api-framework` has no supplementary artifacts to check), review-freshness (`last_verified_against_commit` is a full SHA 2 days old, inside the 30-day `staleness_warning_days` window), review-traceability. All PASS.

### Sub-review 7 — review-adversarial-pass

The skill invokes:

```
meta/review-adversarial \
  --target=../api-orders/docs/api-framework-internal/ \
  --stage=reverse-engineering \
  --output-path=../api-orders/docs/api-framework-internal/review/adversarial-findings.md
```

The adversarial skill produces a Format 4 findings file:

```yaml
---
schema: aide-adversarial-findings@1
target_artifact: reverse-engineering-doc
target_path: ../api-orders/docs/api-framework-internal/
target_commit: a3f9c12
produced_by: review-adversarial
produced_at: 2026-04-29T15:02:00Z
stage: reverse-engineering
severity_counts: { critical: 0, high: 2, medium: 4, low: 1 }
worst_severity: high
finding_ids: [ADV-001, ADV-002, ADV-003, ADV-004, ADV-005, ADV-006, ADV-007]
---
```

Wrapper reads `worst_severity: high` → maps to PASS WITH OBSERVATIONS per `references/review-patterns/review-verdict-mapping.md`. User accepts the observations (mostly thin grounding, no fabrications).

### Sub-review 8 — review-edge-cases

Invokes `meta/review-edge-case-hunter --stage=reverse-engineering`. Produces:

```yaml
worst_severity: medium
severity_counts: { critical: 0, high: 0, medium: 3, low: 2 }
```

Verdict: PASS WITH OBSERVATIONS. User accepts.

### Sub-review 9 — review-re-readiness

Reads all eight prior verdicts. Renders:

```markdown
# Readiness Verdict — api-orders RE Package

**Verdict:** CONDITIONAL
**Mechanical evidence:** present (`verification-report.md`, review-evidence mode)

## Conditions for KB ingestion

1. Two grounding observations from review-grounding accepted; flagged for the next RE re-run to address.
2. Adversarial review surfaced 2 high-severity findings (claim coverage gaps); re-run RE skill to add citations before next quarterly KB sync.
3. Edge-case review surfaced 3 medium findings; tracked for next RE re-run.

## Recommendation

KB ingestion may proceed. Track conditions in `CHANGE-TRACKER.md` at the Part-A root.
```

## Next skill

User runs `build-knowledge-base` (first time) or `update-knowledge-base` (subsequent), which now ingests the validated docs.

## How a clean run looks

If every sub-review returns PASS, the readiness verdict is APPROVED with no conditions. Three lines, no friction.
