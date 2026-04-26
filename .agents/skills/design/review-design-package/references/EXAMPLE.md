# Example — review-design-package

A worked example continuing the refund-processing feature from the design example.

## Trigger

User: *"The design package is assembled. Run the review and tell me if we're ready for implementation planning."*

The orchestrator confirms `.framework-output/design/refund-processing-design.md` exists, the design change tracker is at v0.1, the requirements readiness verdict is APPROVED with one CONDITIONAL note (partner-API rate limits). Invokes `review-design-package`.

## Pass 1

The skill ran the three reviews in order:

| # | Review | Verdict |
|---|---|---|
| 1 | review-architecture | PASS WITH OBSERVATIONS (2 — saga compensation timing; cache invalidation strategy) |
| 2 | review-security-posture | FAIL |
| 3 | review-solution-readiness | (not reached) |

Security-posture review halted on the partner clearing-house integration: the design specified a rotating credential model but did not specify rotation cadence, secret store, or revocation procedure. Verdict file `review/review-security-posture.md` was written with three findings: (a) credential rotation cadence missing, (b) secret store not pinned to `aws-sso` or `vault`, (c) no revocation runbook reference.

Skill stopped per strict sequence and asked: *"Review-security-posture returned FAIL on three credential-rotation items. Want me to help fix the design now, or hand back to create-design-package?"*

## Fix and Pass 2

User chose "fix now". Fixes:
1. Updated `08-security-design.md` to pin AWS Secrets Manager as the secret store, specify 90-day rotation with 7-day overlap, reference the existing revocation runbook in the knowledge base (`../knowledge-base/components/api-billing/credential-rotation-runbook.md`).
2. Authored ADR `0010-secret-rotation-aws-sm.md` and referenced it from `08-security-design.md`.
3. Appended three `Modified` rows to the design change tracker with `Trigger = Review finding`.
4. Re-ran review-security-posture from scratch -> PASS.
5. Re-checked review-architecture (no changes to architecture sections from the fix; previous PASS WITH OBSERVATIONS held).
6. Ran review-solution-readiness:

| Verdict | Reason |
|---|---|
| GO | All blocking findings resolved; the two architecture observations were accepted by the user; the requirements-stage CONDITIONAL note (partner-API rate limits) was acknowledged and addressed in `15-nfrs-technical.md` and ADR 0008 |

## What it produced

```
docs/refund-processing/solutions-package/review/
├── review-architecture.md           # PASS WITH OBSERVATIONS (accepted)
├── review-security-posture.md       # second pass; first pass overwritten
└── readiness-verdict.md             # GO

../knowledge-base/adr/
└── 0010-secret-rotation-aws-sm.md   # new ADR from the fix
```

The design change tracker gained four new rows (3 fix-related, 1 ADR-add). Handoff message: *"Design review is GO. Are you ready to proceed with implementation-package planning (run create-implementation-package)?"*

User confirmed. The orchestrator invoked `create-implementation-package` with the design package, requirements package, and architecture baseline as inputs.
