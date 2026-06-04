# Example — review-quality-package

A worked example continuing the refund-processing feature from the
create-quality-package example.

## Trigger

User: *"The quality package is assembled. Run the review and tell me if we're
ready to start coding."*

The orchestrator confirms `.framework-output/quality/refund-processing-quality.md`
exists, the quality change tracker is at v0.1, and the upstream verdicts
(requirements APPROVED, design GO, implementation GO) are present. Invokes
`review-quality-package`.

## Pass 1

The skill ran the reviews in order:

| # | Review | Verdict |
|---|---|---|
| 1 | review-coverage | PASS WITH OBSERVATIONS (1 — INC-006 smoke-only exception accepted) |
| 2 | review-test-design-quality | PASS |
| 3 | review-quality-engineering | FAIL |
| 4..6 | (not reached) | |

Quality-engineering review halted: the automation block pinned Playwright but
left the Pact contract-test version as "latest", and the test-data section did
not state how partner card tokens are provisioned. Verdict file
`review/review-quality-engineering.md` was written with two findings: (a)
unpinned Pact version, (b) test-data provisioning for partner tokens unspecified.

Skill stopped per strict sequence and asked: *"review-quality-engineering
returned FAIL on two items. Want me to help fix the quality package now, or hand
back to create-quality-package?"*

## Fix and Pass 2

User chose "fix now". Fixes:
1. Pinned Pact to 12.1 in `automation-and-cicd.md`.
2. Specified sandbox-vault provisioning for synthetic partner tokens in
   `test-data-and-environments.md`; confirmed no production PAN in fixtures.
3. Appended two `Modified` rows to the change tracker with `Trigger = Review finding`.
4. Re-ran review-quality-engineering from scratch -> PASS.
5. Re-checked review-coverage and review-test-design-quality (unchanged by the
   fix; prior verdicts held).
6. Ran review-metrics-and-gates -> PASS; review-traceability -> PASS.
7. Ran review-quality-readiness:

| Verdict | Reason |
|---|---|
| GO | All blocking findings resolved; the INC-006 smoke-only exception was accepted; every release gate maps to a CI check |

## What it produced

```
docs/refund-processing/quality-package/review/
├── review-coverage.md                 # PASS WITH OBSERVATIONS (accepted)
├── review-test-design-quality.md      # PASS
├── review-quality-engineering.md      # second pass; first pass overwritten
├── review-metrics-and-gates.md        # PASS
├── review-traceability.md             # PASS
└── readiness-verdict.md               # GO
```

The quality change tracker gained two new rows. Handoff message: *"Quality
review is GO. Ready to proceed with execution (run execute-increments)?"*

User confirmed. The orchestrator invoked `execute-increments` with the quality
package as an input alongside the implementation package.
