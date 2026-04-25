# Example — review-requirements-package

A worked example showing a two-pass review where the first pass found a measurability gap.

## Trigger

User: *"The requirements package for refund-processing is assembled. Can you run the review and tell me if it's ready for the architect?"*

The orchestrator detects the trigger phrase "run the review" and the prerequisite `requirements-package.md` at `.framework-output/requirements/refund-processing-requirements.md`. It invokes `review-requirements-package`.

## Pass 1

The skill runs reviews in strict order. Verdicts:

| # | Review | Verdict |
|---|---|---|
| 1 | review-scope | PASS |
| 2 | review-completeness | PASS |
| 3 | review-consistency | PASS WITH OBSERVATIONS (3 minor) |
| 4 | review-measurability | FAIL |

The measurability review halted on `NFR-PERF.REFUND.LATENCY`: *"Refunds must complete in a reasonable time."* The verdict file `review/review-measurability.md` was written with the finding and the recommended fix: replace "reasonable time" with a quantified SLA (e.g., p95 below 3 seconds for partial refunds under $500, p95 below 8 seconds for refunds at or above $500 due to clearing-house delays).

The skill stopped per the strict-sequence rule and asked the user: *"Review-measurability returned FAIL on NFR-PERF.REFUND.LATENCY. Want me to help fix it now, or hand back to create-requirements-package?"*

## Fix and Pass 2

User chose "fix now". The skill bracketed a fix-then-re-validate cycle:
1. Edited `09-nfrs.md` to add the quantified SLA, sourced from the constraint register entry CONS-PERF-001 and risk register entry RISK-PARTNER-RATELIMITS.
2. Appended a `Modified` row to `change-tracker.md`: `Trigger = Review finding`, `Description = Replaced "reasonable time" with quantified p95 SLAs`, `Authorized By = mike.moerman@electricmind.com`, `Impact = NFR-PERF.REFUND.LATENCY, FR.REFUND.PARTIAL.PROCESS`.
3. Re-ran review-measurability from the beginning -> PASS.
4. Continued the sequence:

| # | Review | Verdict |
|---|---|---|
| 5 | review-testability | PASS |
| 6 | review-implementation-leakage | PASS |
| 7 | review-data-completeness | PASS |
| 8 | review-traceability | PASS |
| 9 | review-feasibility | PASS WITH OBSERVATIONS (1 — partner-API rate limits) |
| 10 | review-requirements-readiness | APPROVED (with conditional note: monitor partner-API limits during design) |

## What it produced

```
docs/refund-processing/requirements-package/review/
├── review-scope.md
├── review-completeness.md
├── review-consistency.md
├── review-measurability.md           # second pass; first pass overwritten
├── review-testability.md
├── review-implementation-leakage.md
├── review-data-completeness.md
├── review-traceability.md
├── review-feasibility.md
└── readiness-verdict.md              # APPROVED with one conditional note
```

The change tracker gained one new `Review finding` row (CHG-188). Handoff message to the user: *"Requirements review is APPROVED. Are you ready to proceed with architect handoff (run create-design-package)?"*

User confirmed. The orchestrator invoked `create-design-package` with the requirements package as primary input.
