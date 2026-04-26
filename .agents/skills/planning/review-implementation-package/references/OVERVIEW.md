# review-implementation-package — Overview

## Purpose

This skill is the **pre-execution gate** for the planning stage — the
independently-invocable review skill that validates an assembled
implementation package against the approved requirements package, the
approved design package, and the Canonical Increment Shape. It is the
planning-stage analogue of `review-requirements-package` (after the
requirements stage) and `review-design-package` (after the design stage).

A NO-GO verdict blocks handoff to the execution stage. The user resolves
findings (or returns to `create-implementation-package` for rework), then
re-runs this skill for re-validation.

This skill exists because authors of an implementation package have a
predictable set of blind spots: they are too close to the work they just
produced. The independent review surfaces shape conformance issues, FR
coverage gaps, design coverage gaps, vague verification gates, and dependency
graph problems that the author's own plan-readiness self-check is likely to
miss.

## When to use

- An implementation package has been assembled and the author's own
  plan-readiness self-check has returned GO
- The user is about to authorize execution of increments
- The user explicitly asks for a pre-execution review or implementation-plan
  validation

## When NOT to use

- The package has not been assembled — run `create-implementation-package`
  first
- The user wants to write or refactor increments — use
  `create-implementation-package`
- The user wants to execute increments — that is `execute-increments`. A
  NO-GO from this skill blocks that.
- Post-implementation code review — that is the PR review flow

## Position in workflow

```
planning/create-implementation-package
    └─► (author self-check: plan-readiness review)
        └─► planning/review-implementation-package   ◄── this skill
            ├─► GO   → execution/execute-increments
            └─► NO-GO → back to create-implementation-package
```

This skill is symmetric with the other stage reviews. The pattern across the
framework:

| Stage | Create skill | Review skill |
|---|---|---|
| Requirements | `create-requirements-package` | `review-requirements-package` |
| Design | `create-design-package` | `review-design-package` |
| Planning | `create-implementation-package` | **`review-implementation-package`** (this skill) |

The review skill is independently invocable — users can validate an existing
package without re-running the create skill.
