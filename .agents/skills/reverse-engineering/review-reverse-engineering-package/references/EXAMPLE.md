# Example — review-reverse-engineering-package

End-to-end worked example showing the skill applied to a freshly-RE'd repo before KB ingestion.

## Setup

Project: a multi-repo solution. The `api-orders` repo has just been processed by `analyze-repository` → `reverse-engineer-api-framework` (chosen because the repo is the framework providing the order API rather than a consumer of one). Part A + Part B are written to `<KB>/source-docs/api-orders/`.

```
<knowledge_base_path>/
└── source-docs/
    └── api-orders/
        ├── internal.md          # Part A
        ├── consumer.md          # Part B
        ├── openapi.yaml
        └── (per-section files…)
```

User wants validation before running `build-knowledge-base`.

## Invocation

User: "review the RE output for api-orders"

The skill resolves `<repo-slug> = api-orders`, loads `[[project.repos]]` to find the source-repo path, and begins.

## Sequence (truncated)

### Sub-review 1 — review-section-completeness

Reads `.agents/skills/reverse-engineering/reverse-engineer-api-framework/references/required-sections.md`. Confirms `internal.md` covers every required section (architecture, routing, middleware, persistence, validation, errors, observability, testing, deployment, conventions). All present. PASS.

### Sub-review 2 — review-grounding

Walks every claim in `internal.md` checking for path references. Finds two claims with no source citation:

- "The auth middleware applies rate limiting" — no path
- "Error responses follow RFC 7807" — no example file

Verdict: PASS WITH OBSERVATIONS. User accepts.

### Sub-review 3 — review-consistency

Part A says POST /orders returns `201` on success. Part B says POST /orders returns `200`. Contradiction.

Verdict: FAIL.

User fixes Part B by re-running the RE skill (which re-reads the OpenAPI). Re-runs `review-consistency`. Now PASS.

### Sub-reviews 4–6

review-coverage, review-freshness, review-traceability. All PASS.

### Sub-review 7 — review-adversarial-pass

The skill invokes:

```
meta/review-adversarial \
  --target=<KB>/source-docs/api-orders/internal.md \
  --stage=reverse-engineering \
  --output-path=<KB>/source-docs/api-orders/review/adversarial-findings.md
```

The adversarial skill produces a Format 4 findings file:

```yaml
---
schema: aide-adversarial-findings@1
target_artifact: reverse-engineering-doc
target_path: <KB>/source-docs/api-orders/internal.md
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

## Conditions for KB ingestion

1. Two grounding observations from review-grounding accepted; flagged for the next RE re-run to address.
2. Adversarial review surfaced 2 high-severity findings (claim coverage gaps); re-run RE skill to add citations before next quarterly KB sync.
3. Edge-case review surfaced 3 medium findings; tracked for next RE re-run.

## Recommendation

KB ingestion may proceed. Track conditions in `change-tracker.md` for the api-orders source-docs.
```

## Next skill

User runs `build-knowledge-base` (first time) or `update-knowledge-base` (subsequent), which now ingests the validated docs.

## How a clean run looks

If every sub-review returns PASS, the readiness verdict is APPROVED with no conditions. Three lines, no friction.
