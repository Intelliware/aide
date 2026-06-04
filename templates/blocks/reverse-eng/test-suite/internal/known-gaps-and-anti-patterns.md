---
slug: known-gaps-and-anti-patterns
title: "Known Gaps and Anti-Patterns"
applies-to: [re-test-suite-internal]
requires-decision-from: [code-reader, qe-analyst]
optional: false
order-hint: 250
---

## 15. Known Gaps and Anti-Patterns

Be honest about what the suite doesn't cover yet, and what bad habits are already baked in that future maintainers should NOT propagate. A test suite without a documented gap list slowly accumulates a folklore of "we don't test that because…" — capture it explicitly so it's actionable.

The anti-patterns list is the test-suite equivalent of an architecture's "deliberate technical debt" log. Each entry names a bad pattern observed in the suite, the scenarios that contain it, the right pattern, and the planned remediation. New code that follows the bad pattern is a review reject; new code that follows the right pattern can cite this block as justification.

### Suggested template content

**Known coverage gaps:**

| Gap | Reason | Workaround | Planned remediation |
|---|---|---|---|
| {{gap-1 — e.g. "Concurrent-refund race conditions"}} | {{reason-1 — e.g. "Suite is single-tenant per worker; cannot exercise"}} | {{workaround-1 — e.g. "Covered by integration tests in the billing repo"}} | {{plan-1 — e.g. "Ticket QE-873; planned Q3"}} |
| {{gap-2}} | {{reason-2}} | {{workaround-2}} | {{plan-2}} |

**Anti-patterns observed (do not propagate):**

| Pattern | Where it lives | Right pattern | Remediation status |
|---|---|---|---|
| Hardcoded `sleep(N)` for waits | `{{anti-pattern-1-locations}}` | Use `{{wait-helper}}` from shared utilities | {{status-1 — e.g. "Tracked in QE-901; 12 of 47 instances cleaned up"}} |
| Login via UI form in non-login scenarios | `{{anti-pattern-2-locations}}` | Use `auth.asMerchant()` (api-token-helper) | {{status-2}} |
| Locators by XPath when role / data-testid exists | `{{anti-pattern-3-locations}}` | Prefer role-based, then data-testid (see page-objects-and-step-defs block) | {{status-3}} |
| Cross-scenario state sharing via module-scope variables | `{{anti-pattern-4-locations}}` | Per-scenario builders; no module-scope state | {{status-4}} |
| Tests with no `@inc-NNN` / `@ac-X.Y.Z` traceability tag | `{{anti-pattern-5-locations}}` | Add the tag or delete the scenario | {{status-5 — e.g. "23 untagged scenarios; surfaced by audit-quality-coverage"}} |
| Catch-and-swallow in step-defs | `{{anti-pattern-6-locations}}` | Let the framework's assertion failure propagate; never catch test errors | {{status-6}} |

**Flake roster (current quarantine queue):**

| Scenario | First flaked | Quarantine ticket | Suspected cause |
|---|---|---|---|
| `{{scenario-1}}` | `{{date-1}}` | `{{ticket-1}}` | `{{cause-1}}` |
| `{{scenario-2}}` | `{{date-2}}` | `{{ticket-2}}` | `{{cause-2}}` |

**Architectural debt (suite-level):**

- {{debt-1 — e.g. "Page objects mix two locator strategies; consolidation in flight"}}
- {{debt-2 — e.g. "Builders use Faker for emails but not for phone numbers — phone collisions observed under high parallelism"}}
- {{debt-3}}

**Cross-reference:** the `review-test-failures` skill consults this block during Step 3 (classify-and-remediate) to recognise known anti-patterns and route to the right remediation. Keeping the patterns + remediations current improves triage accuracy.

