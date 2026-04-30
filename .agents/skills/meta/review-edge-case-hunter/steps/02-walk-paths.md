# Step 2 — Walk paths and enumerate edges

Goal: walk the target artifact applying the seven edge categories systematically; for each category, enumerate the edges the artifact's domain implies, then collect findings for those NOT addressed.

This is the LLM-driven analytical core of the skill.

## Inputs

- The Step 1 record (`target_path`, `target_artifact`, `stage`).
- The full content of `target_path`. For directory targets: also read sibling files as evidence; findings cite only the canonical entry file.

## Method

For each category below:

1. **Enumerate the edges the artifact's domain implies.** The artifact is about checkout? Then concurrency edges include "two concurrent submits", "cart-tab-A and cart-tab-B", "submit-during-inventory-decrement". The artifact is about a CRUD list view? Then concurrency edges include "two users editing the same record", "delete-while-someone-is-viewing".
2. **Walk the artifact text** and check whether each enumerated edge is addressed. Addressed means: explicitly described, explicitly delegated to a named system, or explicitly excluded as out-of-scope. Silence is NOT addressed.
3. **For each unaddressed edge**, emit a finding with the section that *should* have addressed it cited as evidence.

## The seven categories (apply in order)

### Category 1 — Branching paths

For every conditional behaviour the artifact mentions:

- Every `if X, then Y` — is the `else Y'` path described?
- Every "when the user does A" — what about "when the user does B" or "when the user does nothing"?
- Every flow with a happy path — are the alternative paths enumerated?
- Every state machine — are all transitions explicit, or only the forward ones?

Example unaddressed: "Apply discount code" success path is described; the invalid-code branch mentions HTTP 400 but no UX response.

### Category 2 — Error paths

For every external dependency, I/O, validation, parse, or conversion:

- Timeout
- Connection refused / network failure
- Malformed response / schema mismatch
- Partial failure (write succeeded but ack lost)
- Downstream-error mapping (vendor returns 503 → what does our system surface to the user?)
- Retry policy (retried? how many times? backoff? at-least-once vs at-most-once?)

Example unaddressed: "Tax calculation via TaxService API" with no timeout budget, retry policy, or fallback.

### Category 3 — Boundary conditions

For every numeric, length, count, age, percentage, or quantity:

- Zero
- One
- The maximum (of the type or the domain)
- Maximum + 1 (just over)
- Negative (where applicable — usually a defect signal)

Example unaddressed: "Cart submit" — zero-item case undefined; what does Submit do with empty cart?

### Category 4 — Concurrency edges

For every shared resource, every "user does X happens" with multi-user implications, every state-changing operation:

- Two simultaneous operations on the same resource (race)
- Same user submitting twice (double-submission)
- Lost-update (read-modify-write without optimistic locking)
- Out-of-order arrival of related events
- Idempotency: is the operation safe to retry?

Example unaddressed: "Cart-to-order conversion" with no idempotency or locking strategy.

### Category 5 — Time / clock / timezone edges

For every date, time, schedule, retention period, expiry, or duration:

- Timezone (server vs user, multi-user collaboration across zones)
- DST transition (the missing or repeated hour)
- Clock drift between systems
- End-of-month / end-of-quarter / end-of-year boundary
- Leap year, leap second
- Mid-operation expiry (token expires while request is in flight)

Example unaddressed: "Tax rate" with no policy for tax-rate change between cart-page render and submit.

### Category 6 — Data-shape edges

For every input field, list, document, or payload:

- Empty (`""`, `[]`, `{}`)
- Maximum length / maximum count
- Beyond max (length+1, count+1)
- Malformed (missing required field, extra unknown field, wrong type)
- Multi-byte / Unicode (especially names, addresses, identifiers)
- Nested-empty (list of one empty object)
- Nested-cycle (where applicable)

Example unaddressed: "Address validation" with ASCII-only regex — multi-byte names rejected silently.

### Category 7 — Authorization / permission edges

For every actor, role, scope, or permission gate:

- Missing permission (correct user, wrong permission)
- Partial permission (some operations allowed, others not — does the UI degrade gracefully?)
- Role transition during operation (admin demoted mid-action)
- Impersonation (acting on behalf of another)
- Nested authorization (acting on someone else's data — cart-share, group ownership, parent-account)
- Guest / anonymous (is unauthenticated allowed at all? if yes, what changes?)

Example unaddressed: "Guest checkout" requirement exists but design assumes authenticated user throughout.

## What counts as "handled"

An edge is **handled** if the artifact contains one of:

1. **Explicit address** — an acceptance criterion, a behaviour spec, an ADR, a flow chart, or prose explicitly describing what happens at that edge.
2. **Explicit delegation** — "the X service handles concurrency / partial failure / timezones; we trust its contract here". Delegation must name the system and ideally cite its contract. Bare "the framework handles it" is not delegation.
3. **Explicit exclusion** — "we do not support multi-byte names in v1; tracked for v2 in ADR-014". Exclusion must be intentional and named.

Silence is not handling. If the artifact says nothing, the edge is unhandled.

## Severity scoring

Assign per-finding severity using these rules (consistent with `review-adversarial`):

- `critical` — unhandled edge will produce wrong outcomes (silent data loss, security breach, incorrect business outcome). Authorization edges in money-moving flows; concurrency in checkout / payment / inventory; data-loss in retention rules.
- `high` — unhandled edge will degrade the system noticeably. Synchronous user-facing flow with no fallback; boundary case with undefined UX.
- `medium` — unhandled edge with limited blast radius. Internal-only API; advisory UX issue.
- `low` — unhandled edge unlikely to ever fire. Cosmetic timezone in a logging timestamp.

## Triage assignment

Same default mapping as `review-adversarial`:

- `critical` → `must-fix`
- `high` → `should-fix`
- `medium` → `consider`
- `low` → `wont-fix`

Override: if a `high` finding is severe enough to be critical-equivalent (e.g. a single concurrency edge that would corrupt every order on retry), set triage to `must-fix`.

## Stage-emphasis weights

If `stage` is set, emphasize the categories listed in `references/OVERVIEW.md` § Stage-specific specializations. Emphasize means: more attention; **do not** skip the others.

## Cap at `--max-findings`

If total findings exceed `--max-findings` (default 50), keep highest severities; note truncation in the body.

## Important: report ONLY unhandled edges

The output is unhandled edges. Do **not** list handled edges as positive findings. If you find that `Branching paths` is fully covered, that category produces zero findings — that's a good outcome.

## Output of this step

In-memory list of findings with the same shape as `review-adversarial` Step 2 output:

```yaml
findings:
  - id: ADV-001
    severity: critical
    triage: must-fix
    category: Concurrency
    one_line: 'Two concurrent checkouts for same cart not addressed'
    evidence: 'design-package.md § 3.2 — "Cart-to-order conversion" (and absence of any concurrency section)'
    risk: 'duplicate orders, double charges; classic checkout bug pattern'
    recommendation: 'add explicit Concurrency handling section with idempotency mechanism'
    is_critical_section: true
  - id: ADV-002
    ...
```

`is_critical_section: true` flags findings that need a "Critical findings (claim vs counter)" entry in Step 3. All `critical` findings get one; `high` findings with `triage: must-fix` also get one.

This list feeds Step 3.
