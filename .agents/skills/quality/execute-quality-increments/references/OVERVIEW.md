# Overview — execute-quality-increments

## Purpose

Turns an approved quality package into working test artifacts in the
resolved test-artifact target repo. When `[project.testing].qe_repo` is
configured, that QE repo is the default target; otherwise the skill falls
back to the in-scope code repo. Operates one test-case increment at a time, handling both
scaffolding increments (build-file changes, runner classes, shared
utilities, test configuration) and test-case increments (feature files,
step definitions, fixtures, exports).

The skill mirrors `execute-increments` from the execution stage but is
scoped to **test artifacts only** — it never writes production code. If a
gap in production code is discovered during quality execution, the skill
logs it and routes to `execute-increments` or `manage-bugs`.

Every implementation is verified with fresh evidence in the current turn
(compilation output, test-runner output, file checks) before marking
complete. The user reviews and approves each increment before it moves to
`completed` status.

This skill is **optional**. It only applies when the team has chosen to
decompose test work into discrete `TC-XXX` increments (composition gate
`project.elicitation.uses_test_case_increments = true`). Teams that fold
test work directly into application `INC-XXX` increments write their tests
inside `execute-increments`'s TDD loop and do not invoke this skill.

## When to use

- Quality package has been reviewed and approved (GO or accepted
  CONDITIONAL GO)
- The quality package was assembled with the `test-case-increment` block
  enabled
- User says: "execute quality increments", "implement the test cases",
  "build the test artifacts", "run TC-XXX"
- The user is ready to authorize writing test artifacts to the codebase

## When NOT to use

- Quality package not yet reviewed — `review-quality-package`
- Quality package not yet created — `create-quality-package`
- Quality package was authored without the test-case-increment block —
  tests are written inside regular `execute-increments`
- Executing application implementation increments — `execute-increments`
- Triaging existing test failures — `review-test-failures`
- Auditing coverage gaps — `audit-quality-coverage`

## Position in workflow

```
create-quality-package -> review-quality-package -> execute-quality-increments
                                                            |
                                                            +--> audit-quality-coverage (anytime)
                                                            +--> review-test-failures   (anytime)
```

Scaffolding increments execute first (in dependency order), then test-case
increments follow (respecting inter-test-case dependencies within and
across categories). The skill loops through all increments sequentially
until the plan is fully executed or the user checkpoints.

## Relationship to `execute-increments`

`execute-increments` ships application code following the canonical 8-block
INC-XXX shape. This skill ships test artifacts following the same shape
adapted for test cases (see the `test-case-increment` block in
`templates/blocks/quality/`). The two loops can run interleaved, in
parallel, or sequentially — the quality package's automation and CI/CD
section documents the team's preferred cadence.

