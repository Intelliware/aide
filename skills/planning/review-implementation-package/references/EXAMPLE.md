# review-implementation-package — Worked Example

The following is a realistic NO-GO review report for an implementation package
that almost passed but had a vague AI Gate, a missing FR mapping on one
increment, and a dependency graph cycle. After the user fixes the listed
issues, this skill is re-run and returns GO.

---

```
# Implementation Package Review

Package: .framework-output/implementation/
Requirements version: req-pkg v1.3 (stamped 2026-04-12)
Design version:       design-pkg v1.1 (stamped 2026-04-18)
Reviewer date:        2026-04-25

## 1. Shape conformance        — PASS

All 9 increments (INC-001 through INC-009) have all 8 sections in order.
Section headings match the Canonical Increment Shape exactly. No legacy
PHASE-XXX IDs remain.

## 2. FR coverage              — FAIL

INC-005 (Refund processing) has empty FR Mapping. Refund processing
implements FR4.2.1 and FR4.2.3 per the Requirements Package — these must be
listed.

All other FRs in the Requirements Package are covered. No invented FR IDs
detected.

## 3. Design coverage          — PASS

Every component in design-pkg's component map appears in at least one
increment's Plan. API endpoints and data entities accounted for.

## 4. Independent executability — PASS

Every increment names specific files / modules / commands. Dependencies are
listed by INC ID. Goals describe state, not effort.

## 5. Verification gates       — FAIL

INC-007 AI Gate reads:
  "1. Run the tests."
  "2. Make sure they pass."

This is too vague. Replace with specific test commands and expected results,
e.g.:
  "1. pnpm test --filter @feature/billing"
  "2. mvn -pl api test -Dtest=BillingService*"
  "Expected: all 14 tests pass; new BillingServiceCreateTest passes."

All other increments' AI Gates are specific. Human Gates are well-formed.

## 6. Dependency graph         — FAIL

Cycle detected:
  INC-006 depends on INC-008
  INC-008 depends on INC-006

The author likely intended INC-006 → INC-008 only. Resolve by removing one
edge.

## 7. Support documents        — PASS

implementation-package.md, increment-status.md, bugs-and-issues-log.md,
change-tracker.md all present. increment-status.md shows all `not-started`.
Version stamps present on the overview.

## 8. Implementation readiness  — NO-GO

## Per-increment findings

### INC-005
  - [Critical] FR Mapping is empty. Add FR4.2.1, FR4.2.3 (refund processing).

### INC-006
  - [Critical] Dependency cycle with INC-008.

### INC-007
  - [Critical] AI Gate too vague. Replace with specific test commands and
    expected results.

### INC-008
  - [Critical] Dependency cycle with INC-006.

## Consolidated issue list

| Severity  | Increment | Finding                         | Required fix                                   |
|-----------|-----------|---------------------------------|------------------------------------------------|
| Critical  | INC-005   | Empty FR Mapping                | Add FR4.2.1, FR4.2.3                          |
| Critical  | INC-006/8 | Dependency cycle                | Remove one edge                               |
| Critical  | INC-007   | AI Gate vague                   | Cite specific test commands + expected results|

## Final verdict

NO-GO

Required fixes before re-validation:
1. Add FR4.2.1 and FR4.2.3 to INC-005's FR Mapping
2. Resolve the INC-006 ⇄ INC-008 dependency cycle
3. Replace INC-007's AI Gate with specific test commands and expected results

Re-invoke `review-implementation-package` after fixes are in place.
```

---

## What this example demonstrates

- **Strict sequence.** The review went all the way through 8 sections and
  collected findings rather than stopping at the first failure. The user
  gets a single coherent issue list, not a stream of partial reports.
- **Severity discipline.** All findings here are Critical because they all
  block executable correctness. Minor findings (e.g., a typo in a Plan item)
  would be reported but would not gate GO.
- **Concrete required fixes.** Each finding names exactly what to change.
  The author can act without further interpretation.
- **Re-invocation pattern.** After fixes, this skill is re-run; if the same
  three issues are now resolved and no new issues are introduced, the
  verdict flips to GO and the package proceeds to `execute-increments`.
- **Permanent record.** The verdict is also written into
  `change-tracker.md`, so the package's history shows the review cycle.
