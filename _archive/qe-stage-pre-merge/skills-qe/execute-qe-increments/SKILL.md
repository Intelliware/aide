---
name: execute-qe-increments
description: "Use when the user asks to execute QE test case increments, implement test cases, build the test artifacts, run TC-XXX, work the next QE increment, or turn an approved QE package into working test code. Executes one QE test case increment at a time, producing the actual test artifacts (feature files, step definitions, runners, CSV exports, etc.) and updating the test-case-status tracker."
---

# Execute QE Increments

## Overview

Executes an approved QE package one increment at a time. The package contains two kinds of increments — scaffolding (infrastructure/prep work) and test cases — and this skill handles both. For each increment, it reads the plan, implements the artifacts into the target codebase, verifies correctness, obtains user sign-off, and updates the status tracker.

This mirrors the execution stage's `execute-increments` pattern but for QE test artifacts rather than application code. Scaffolding increments are executed first (they modify build files, create runners, add utilities), then test case increments follow (they produce the actual test files).

## When to use

- An approved QE package exists (PASS or accepted PASS WITH OBSERVATIONS from `review-qe-package`)
- User says: "execute QE increments", "implement the test cases", "build the QE tests", "run TC-XXX", "work the next QE increment", "start QE execution"
- The user is ready to authorize test artifact creation

## When NOT to use

- The QE package has not been reviewed — run `review-qe-package` first
- The user wants to create or amend the QE package — use `create-qe-package`
- The user wants to execute application implementation increments — use `execute-increments`

## Inputs

| Input | Source | Required |
|---|---|---|
| QE package | `{paths.qe_package}/` (with PASS from review) | Yes |
| QE package overview | `{paths.qe_package}/qe-package.md` | Yes |
| Execution strategy | `{paths.qe_package}/execution-strategy.md` | Yes |
| QE plan overview | `{paths.qe_package}/plan/qe-plan-overview.md` | Yes |
| Per-increment files | `{paths.qe_package}/plan/TC-XXX.md` (scaffolding) and `{paths.qe_package}/plan/<category>/TC-XXX.md` (test cases) | Yes |
| Test case status tracker | `{paths.qe_package}/plan/test-case-status.md` | Yes |
| Review readiness verdict | `{paths.qe_package}/review/readiness-verdict.md` | Yes (must be PASS or accepted PASS WITH OBSERVATIONS) |
| Target codebase | filesystem (repo paths from `project.toml`) | Yes |
| `project.toml` | `{project-root}/project.toml` | Yes |

See `references/INPUTS-OUTPUTS.md` for the full table.

## Verification rule (always-on)

After every drafted artifact and before any file write, summarize back to the user what you understood and what you produced; wait for their explicit acknowledgement (or correction) before proceeding. This applies regardless of which step you are on. Halt the step if the user disagrees.

## Workflow

Execute one step at a time. Read each step file only when starting that step. Do not pre-load all step files.

**Before Step 1:** Read the QE package overview, execution strategy, and plan overview for full context. Confirm the review readiness verdict is PASS or accepted PASS WITH OBSERVATIONS. If not, halt and route to `review-qe-package`.

1. `steps/01-load-increment.md` — Load the next increment (scaffolding or test case), verify dependencies are completed, confirm prerequisites
2. `steps/02-implement-artifacts.md` — Implement the artifacts specified in the increment's plan into the target codebase
3. `steps/03-verify.md` — Verify the implementation: syntax, compilation, wiring, and (where possible) execution
4. `steps/04-user-review.md` — Present the implemented artifacts for user acknowledgement
5. `steps/05-status-update.md` — Update `test-case-status.md`, then return to step 1 for the next increment

After an increment closes successfully, return to step 1 for the next increment. Process scaffolding increments first (in dependency order), then test case increments (in dependency order within each category).

Stop when the user has reached the end of the plan or requests a checkpoint.

## Output

Per increment:
- Generated artifacts written to the target codebase (build file changes, runner classes, config files, feature files, step definitions, utilities, CSV rows — whatever the increment plan specifies)
- Updated `test-case-status.md` row (`not-started` → `in-progress` → `completed`)
- Verification evidence captured in chat (fresh in the current turn)

## Next skill

After all increments in the QE package are completed, the QE stage is complete. The user may optionally run the full QE test suite to confirm everything works end-to-end.

## Common mistakes

- **Bundling multiple increments into one execution pass.** Execute one TC-XXX at a time. The increment is the unit of work.
- **Skipping scaffolding increments.** Scaffolding must be completed before any test case increment. Don't jump to test cases.
- **Generating artifacts that don't match the plan.** Every file must trace to the increment's Artifact Plan section — correct path, correct content, correct framework conventions.
- **Forgetting to update `test-case-status.md`.** Status changes are the audit trail; missing updates create false impressions of progress.
- **Implementing without reading the execution strategy.** The artifacts must be compatible with the documented execution approach (runner config, tag conventions, profile names).
- **Claiming completion without fresh verification.** Every "done" claim must cite evidence from the current turn (compilation output, test runner output, file existence check). Never use remembered or stale evidence.
- **Writing production code.** This skill writes test artifacts only. If the increment plan reveals a gap in production code, log it and route to `execute-increments` or `manage-bugs`.
- **Using "phase" terminology.** This skill uses "increment" as the unit of work.
