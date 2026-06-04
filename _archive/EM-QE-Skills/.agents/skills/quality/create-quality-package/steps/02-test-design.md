# Step 2 — Test design (software testing)

Turn acceptance criteria into concrete, deterministic test cases and record full
traceability.

Produce these blocks:

1. **`quality/test-design`** — for each test level in scope, the concrete test
   cases or scenarios. Each case states preconditions, action, and expected
   result. Cases must be deterministic (no "verify it looks right") and
   independently runnable.
2. **`quality/traceability`** (rendered via `shared/traceability`) — the matrix
   linking every test case to at least one acceptance criterion, functional
   requirement, NFR, or `INC-XXX` increment.

Rules:

- Every acceptance criterion must be covered by at least one test case. Every
  increment must either map to coverage or carry an explicit, user-accepted
  exception row (e.g. read-only view with no money-movement risk -> smoke only).
- Every test case must trace to something upstream. A case that traces to
  nothing means either a missing requirement (route back to
  `create-requirements-package`) or a speculative test (drop it).
- Identify the test data each case needs here; the detailed data/environment
  plan is authored in Step 3.
- Prefer the smallest test level that can prove a behavior (unit over
  integration over E2E) to keep the suite fast and stable.

Summarize coverage (cases per level, ACs covered, increments mapped or
excepted) back to the user and wait for acknowledgement before Step 3.
