# Overview — execute-qe-increments

## Purpose

Turns an approved QE package into working test artifacts in the target codebase. Operates one increment at a time, handling both scaffolding increments (build file changes, runner classes, shared utilities, config) and test case increments (feature files, step definitions, CSV exports, etc.).

The skill mirrors `execute-increments` from the execution stage but is scoped to QE test artifacts — it never writes production code. If a gap in production code is discovered during QE execution, the skill logs it and routes to `execute-increments` or `manage-bugs`.

Every implementation is verified with fresh evidence in the current turn (compilation output, test runner output, file checks) before marking complete. The user reviews and approves each increment before it moves to `completed` status.

## When to use

- QE package has been reviewed and approved (PASS or accepted PASS WITH OBSERVATIONS)
- User says: "execute QE increments", "implement the test cases", "build the QE tests", "run TC-XXX"
- The user is ready to authorize writing test artifacts to the codebase

## When NOT to use

- QE package not yet reviewed — `review-qe-package`
- QE package not yet created — `create-qe-package`
- Executing application implementation increments — `execute-increments`

## Position in workflow

```
create-qe-package -> review-qe-package -> execute-qe-increments
```

Scaffolding increments execute first (in order), then test case increments follow (respecting inter-test-case dependencies). The skill loops through all increments sequentially until the plan is fully executed or the user checkpoints.
