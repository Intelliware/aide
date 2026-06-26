---
slug: verify
sequence: 3
depends-on-prior: true
---

# Step 3 — Verify Implementation

## Purpose

Confirm the implemented artifacts are correct with **fresh evidence in
the current turn**. No claim of completion may rely on remembered or
inferred state.

## Procedure

### 3a. Scaffolding increments

Run the verification checks listed in the increment's **Verification**
section. Common checks:

- **Build / compile succeeds** — run the build's compile target and
  confirm success
- **Runner is discoverable** — confirm the runner class / suite
  definition compiles and the test framework can find it
- **Empty suite executes cleanly** — run the runner with no tests
  selected; confirm it starts and exits without error
- **Dependencies resolved** — confirm new dependencies download / install
  without conflicts (no version clashes, no transitive surprises)
- **Configuration loaded** — confirm test-profile and framework
  configuration files are parsed without warnings

### 3b. Test-case increments

Run the verification checks listed in the increment's **Verification**
section. Common checks:

- **File exists** — confirm each artifact file was created at the correct
  path in the resolved test-artifact target repo
- **Syntax valid** — feature / spec files parse; step definitions / test
  classes compile; configuration / fixture files have valid format
- **Wiring correct** — step definitions / matchers match the steps
  declared in the feature / spec file (no undefined, no ambiguous)
- **Test executes** — if infrastructure is available and the execution
  strategy permits local execution, run the test and confirm it passes
  (or fails for documented reasons). If infrastructure is not available
  locally, note this explicitly and verify compilation / syntax only,
  documenting the CI-only execution path

### 3c. Evidence capture

All verification must produce **fresh evidence in the current turn**:

- Run the actual command and capture the output (paste the relevant
  excerpt)
- Do not cite remembered results from earlier turns
- Do not infer success from absence of an error message

If a check fails, report the failure with the output and halt. Debug and
fix before proceeding. Do not advance past a failed verification.

If a failure traces to a defect in the **production code** under test
(rather than the test artifact), log the symptom and route to
`manage-bugs`; do not patch production code from this skill.

If a failure traces to the **plan itself** (the plan is wrong, the
artifact is right), capture the discrepancy for step 5b (change-tracker
with `Trigger = Plan gap`).

## Next

Proceed to `steps/04-user-review.md`.
