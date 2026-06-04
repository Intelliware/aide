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
- Before proposing any shareable test asset (shared utility, fixture,
  page object, builder, custom matcher, scenario outline), walk the
  lateral-thinking checklist in `references/reuse-analysis.md` and
  record the disposition (`Reuse` / `Extend` / `Wrap` / `Create new`)
  in the test-design row. Planning-time reuse keeps the test inventory
  honest; the execution-side gate in `execute-quality-increments` Step
  2a re-verifies each disposition per artifact at write time.
- Skip the testability gate's `not-automatable — waived | monitored`
  rows from Step 0b — those scopes do not produce design rows here.
  `partially-automatable` rows produce both an automated design row
  and a manual-procedure row.

Summarize coverage (cases per level, ACs covered, increments mapped or
excepted, **reuse posture as `N Reuse / M Extend / K Wrap / L Create
new`**) back to the user and wait for acknowledgement before Step 3.
