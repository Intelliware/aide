# Example — verify-source

## Trigger phrase

> "Verify the design package at `docs/checkout/solutions-package/` against the source. The payment-service team made breaking changes last week and I want to know if any of our claims are now wrong."

## What the skill did

1. Confirmed scope: full design package, source-access via clones at
   `../api-orders` (`abc123`) and `../api-billing` (`def456`).
2. Ran the universal four checks:
   - **Completeness**: 14/14 sections populated; no TODO markers.
   - **Accuracy**: spot-checked 5 claims against source.
   - **Consistency**: cross-checked design §6 (error model) against
     requirements §4.2.3 — found one mismatch.
   - **Change tracking**: tracker had no entry for the post-payment-service-update review.
3. Spot-check found two failures:
   - §6.4 still references `INSUFFICIENT_FUNDS`; the source code uses
     `FUNDS_DECLINED` as of `def456`.
   - §7.2 documents a `/refunds` endpoint with `POST` only; the source
     also exposes `GET /refunds/:id` since `def456` (missing in design).
4. Layered design-specific check (`design` package type): traceability —
   every requirement has at least one design section. **Pass.**
5. Wrote `docs/checkout/solutions-package/verification-report-2026-04-25.md`.
6. Suggested `track-change` to log the verification activity.

## What it produced

Snippet from the report:

```markdown
## Verification Report — Checkout Design Package

**Date:** 2026-04-25
**Scope:** Full
**Documentation Version:** 2.1.0-doc.4
**Source Versions:** api-orders@abc123, api-billing@def456

### Summary
- Total checks: 22
- Passed: 19
- Failed: 2
- Warnings: 1

### Failures
1. **§6.4 — Error code drift**
   - Doc: `INSUFFICIENT_FUNDS`
   - Source (`api-billing/src/payment/errors.ts:42` @ `def456`): `FUNDS_DECLINED`
   - Recommended fix: amend §6.4 and FR4.2.3 in upstream requirements package.

2. **§7.2 — Missing endpoint**
   - Doc lists `POST /refunds` only.
   - Source exposes both `POST /refunds` and `GET /refunds/:id` (added @ `def456`).
   - Recommended fix: add §7.2.4 documenting `GET /refunds/:id`.

### Warnings
- Change tracker has no entry between `2026-03-30` and today; one verification
  pass logged here will close the gap.

### Recommendations
1. Amend §6.4 and §7.2 (Critical).
2. Cascade FR4.2.3 amendment back to requirements (High).
3. Log this verification via `track-change` (High).
```

## Hand-off

The skill suggested:

> "Two failures need amendment. Re-invoke `create-design-package` to amend
> §6.4 and §7.2, cascade FR4.2.3 in the requirements package, then re-run
> `verify-source` to confirm green."
