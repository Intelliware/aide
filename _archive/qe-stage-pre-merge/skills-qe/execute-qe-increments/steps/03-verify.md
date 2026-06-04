---
slug: verify
sequence: 3
depends-on-prior: true
---

# Step 3 — Verify Implementation

## Purpose

Confirm the implemented artifacts are correct with fresh evidence in the current turn.

## Procedure

### For scaffolding increments

Run the verification checks listed in the increment's **Verification** section. Common checks:

- **Build compiles:** Run the build command (e.g., `mvn compile`, `npm run build`) and confirm success
- **Runner is on classpath:** Confirm the runner class compiles and is discoverable
- **Empty suite executes:** Run the test runner with no tests and confirm it starts and exits cleanly
- **Dependencies resolved:** Confirm new dependencies download and resolve without conflicts

### For test case increments

Run the verification checks listed in the increment's **Verification** section. Common checks:

- **File exists:** Confirm the artifact file was created at the correct path
- **Syntax valid:** For feature files — confirm Gherkin syntax parses. For step definitions — confirm they compile. For config — confirm valid format.
- **Wiring correct:** Confirm step definitions match the Given/When/Then steps in the feature file (no undefined steps)
- **Test executes:** If infrastructure is available and the execution strategy permits local execution, run the test and confirm it passes. If infrastructure is not available, note this and verify only compilation/syntax.

### Evidence capture

All verification must produce **fresh evidence in the current turn**. This means:
- Run the actual command and capture the output
- Do not cite remembered results from earlier turns
- If a check fails, report the failure with the output and halt

If verification fails, debug and fix before proceeding. Do not proceed past a failed verification.

## Next

Proceed to `steps/04-user-review.md`.
