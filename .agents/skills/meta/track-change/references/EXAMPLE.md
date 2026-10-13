# Example — track-change

## Trigger phrase

> "Log a change — I just updated FR4.2.3 in the checkout requirements package after the payment-service team renamed the `INSUFFICIENT_FUNDS` error code to `FUNDS_DECLINED`."

## What the skill did

1. Inferred package path from the user's reference: `docs/checkout/requirements-package/`.
2. Found existing `CHANGE-TRACKER.md`. Last entry was Change #14, current
   doc version `1.4.2-doc.7`.
3. Asked for missing fields: change type (`Source Update`), source version
   (`payment-service@v3.5.0`), verification (`Verified against
   payment-service commit 9f3ab21`), cross-impact (`Design package §6.4
   error-response model needs the new code`).
4. Appended a summary row (Change #15) and the detailed entry.
5. Updated the "Current Source Version" header to `payment-service@v3.5.0`.
6. Bumped the documentation version to `1.4.2-doc.8`.

## What it produced

Snippet appended to `docs/checkout/requirements-package/CHANGE-TRACKER.md`:

```markdown
| 15 | 2026-04-25 | Source Update | Section 4 (Functional Requirements) | requirements/04-functional-requirements.md | Renamed INSUFFICIENT_FUNDS → FUNDS_DECLINED in FR4.2.3 | payment-service@v3.5.0 | Verified |

### Change #15

**Date:** 2026-04-25
**Change Type:** Source Update
**Parts Affected:** Section 4 (Functional Requirements)
**Section/File:** requirements/04-functional-requirements.md
**Source Version:** payment-service@v3.5.0

**Description:** Updated FR4.2.3 to use the renamed error code `FUNDS_DECLINED`.
**Before:** "...returns the error code `INSUFFICIENT_FUNDS`..."
**After:** "...returns the error code `FUNDS_DECLINED`..."
**Verification:** Verified against payment-service commit 9f3ab21.
**Cross-Impact:** Design package §6.4 error-response model needs the new code.
```

## Hand-off

The skill suggested:

> "The cross-impact note flags the design package. You may want to invoke
> `verify-source` against `docs/checkout/solutions-package/` to confirm §6.4 is
> still consistent."
