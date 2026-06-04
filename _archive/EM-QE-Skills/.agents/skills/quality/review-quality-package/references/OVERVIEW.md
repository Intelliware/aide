# Overview — review-quality-package

## Purpose

Independently invocable validator for an assembled quality package. Runs six
reviews in strict sequence, producing per-review verdicts and a final readiness
verdict that gates execution handoff. It is the quality-stage analogue of
`review-requirements-package`, `review-design-package`, and
`review-implementation-package`.

The skill exists as a separate entry point from `create-quality-package` because
users routinely want to validate a package without re-running creation. A
typical scenario: execution surfaced a coverage gap on an increment; the user
fixes the quality package; the user wants only the readiness check before
re-handing off to execution. Bundling review inside `create-quality-package`
would force a re-run of the macro creation workflow even when only validation is
needed.

## When to use

- An assembled quality package exists and validation is wanted before execution
- User says any trigger phrase from the SKILL.md frontmatter
- Re-validating after the change tracker recorded amendments (downstream
  discovery, upstream package changes, gate-feedback)

## When NOT to use

- Package not yet assembled — `create-quality-package`
- Validating a requirements / design / implementation artifact — the matching
  review skill
- Authoring or amending the quality package — `create-quality-package`
- Executing the tests — `execute-increments`

## Position in workflow

```
create-quality-package -> review-quality-package -> execute-increments -> ...
```

If readiness returns NO-GO, the loop is `review-quality-package` then fix in
`create-quality-package` then `review-quality-package` until GO. If the project's
flow is `quick-dev`, this skill is bypassed in favor of the lighter quality
checks built into `quick-dev/document-quick-change` and the 3-dimension
verification in `quick-dev/execute-quick-change`.
