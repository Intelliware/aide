# Example — review-edge-case-hunter

End-to-end worked example showing the skill applied standalone to a design package.

## Setup

Project: `feat-2041-checkout-redesign`. Design package assembled. Requirements package already passed adversarial review (FAIL-then-fixed). User wants edge-case coverage on the design before kicking off implementation planning.

## Invocation

```
review-edge-case-hunter \
  --target=docs/refund-delay-alerts/solutions-package/solution-package.md \
  --stage=design
```

`--output-path` is omitted, so the skill defaults to:

```
_review/refund-delay-alerts-design-package/2026-04-29T14-15-00Z/review-edge-case-hunter.md
```

## What the skill produces

```markdown
---
schema: aide-adversarial-findings@1
target_artifact: design-package
target_path: docs/refund-delay-alerts/solutions-package/solution-package.md
target_commit: a3f9c12
produced_by: review-edge-case-hunter
produced_at: 2026-04-29T14:15:00Z
stage: design
severity_counts: { critical: 1, high: 4, medium: 3, low: 0 }
triage_counts:    { must-fix: 1, should-fix: 4, consider: 3, wont-fix: 0 }
worst_severity: critical
finding_ids: [ADV-001, ADV-002, ADV-003, ADV-004, ADV-005, ADV-006, ADV-007, ADV-008]
---

# Adversarial findings — Design Package refund-delay-alerts

## Triage summary

| ID | Severity | Category | Finding (one line) | Action |
|---|---|---|---|---|
| ADV-001 | critical | Concurrency | Two concurrent checkouts for same cart not addressed | must-fix |
| ADV-002 | high | Error path | Tax-API timeout has no documented fallback | should-fix |
| ADV-003 | high | Authorization | Guest-checkout case not addressed in auth design | should-fix |
| ADV-004 | high | Boundary | Empty-cart submit case missing | should-fix |
| ADV-005 | high | Time/clock | Tax-rate change mid-checkout not addressed | should-fix |
| ADV-006 | medium | Data shape | Multi-byte character in shipping address not addressed | consider |
| ADV-007 | medium | Branching path | "Apply discount code" else-branch (invalid code) silent on UX | consider |
| ADV-008 | medium | Concurrency | Inventory-decrement race not explicitly addressed (delegated to inventory service?) | consider |

## Critical findings (claim vs counter)

### ADV-001 · CRITICAL · Concurrency

> **Original claim** (design-package.md § 3.2 — "Cart-to-order conversion")
> "On submit, the cart is converted to an order via the OrderService.create() call."

> **Adversarial counter**
> Two concurrent submits for the same cart (user double-clicks Submit, or two tabs racing) are not addressed. The design does not state whether OrderService.create() is idempotent, whether cart state has a lock, or whether the second submit returns the first order or creates a duplicate. This is a money-moving flow; without explicit handling, the team will pick one ad hoc during implementation, and may not pick the same one across services.

**Recommended fix:** add an explicit § "Concurrency handling" stating: cart submit is idempotent on a client-side request_id; second concurrent submit returns the first OrderService result; client-side double-click is also debounced.

## All findings

### ADV-001 · critical · Concurrency
- **Evidence:** design-package.md § 3.2 — "Cart-to-order conversion" (and absence of any concurrency section)
- **Risk:** duplicate orders, double charges; classic checkout bug pattern
- **Recommendation:** add explicit Concurrency handling section with idempotency mechanism

### ADV-002 · high · Error path
- **Evidence:** design-package.md § 4.1 — "Tax calculation via TaxService API"
- **Risk:** synchronous user-facing flow with no fallback; timeout = unrecoverable checkout failure
- **Recommendation:** add timeout budget, retry policy, and fallback (e.g. last-known-rate cache, or block submit with clear error)

### ADV-003 · high · Authorization
- **Evidence:** design-package.md § 5 — "Authentication" (all paths assume authenticated user)
- **Risk:** guest checkout is in REQ-007 but the design assumes auth; either guest-checkout is unhandled or REQ-007 is silently out of scope
- **Recommendation:** explicit guest-checkout flow in design, OR explicit "guest checkout out of scope; defer to v2" with REQ-007 marked accordingly

### ADV-004 · high · Boundary
- **Evidence:** design-package.md § 3.1 — "Cart submit" (zero-item case not mentioned)
- **Risk:** Submit button enabled state with empty cart not specified; UX undefined
- **Recommendation:** acceptance criterion: Submit button disabled when cart is empty; error message if API receives empty-cart request anyway

### ADV-005 · high · Time/clock
- **Evidence:** design-package.md § 4.1 — "Tax calculation"
- **Risk:** if tax rate changes between cart-page and submit, which rate applies? Not specified.
- **Recommendation:** lock-in policy: tax rate captured at cart-page render; cart shows captured rate; submit re-validates and surfaces a warning if rate changed.

### ADV-006 · medium · Data shape
- **Evidence:** design-package.md § 6 — "Address validation"
- **Risk:** validation regex is ASCII-only per § 6.2; multi-byte characters in international names will fail
- **Recommendation:** explicit Unicode policy; if rejecting, the rejection is acknowledged in scope

### ADV-007 · medium · Branching path
- **Evidence:** design-package.md § 4.3 — "Discount code application"
- **Risk:** invalid-code path mentions returning HTTP 400 but no UX behaviour; user sees… what?
- **Recommendation:** specify the UX (inline error message, code field cleared, focus retained, etc.)

### ADV-008 · medium · Concurrency
- **Evidence:** design-package.md § 7 — "Inventory decrement"
- **Risk:** the design says "Inventory service handles concurrency", but inventory service contract not cited; this is delegation-without-naming
- **Recommendation:** cite the specific Inventory API contract that provides this guarantee, or acknowledge the assumption explicitly
```

## What happens next

Standalone: user reviews, fixes, re-runs. Wrapped: `worst_severity: critical` → wrapper sub-review verdict FAIL → gate halts.

## How an empty findings case looks

Same as `review-adversarial` — `worst_severity: none`, `finding_ids: []`, body is `No findings.`. Wrappers consume identically.
