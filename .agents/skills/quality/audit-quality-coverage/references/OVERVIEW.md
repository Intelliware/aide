# Overview — audit-quality-coverage

## Purpose

Audit test coverage against every increment defined in a feature's
implementation package. Answers the question: *"Have all increments
that require test coverage actually been covered, and is the
coverage we claim to have actually present in the codebase?"*

Produces a structured coverage report showing each increment's status
(fully covered / in-progress / ready but not started / blocked on dev /
drifted / not applicable) plus recommended next actions per gap, each
routed to an existing framework skill.

The skill is **read-only** against the application code, the test
suite, and the knowledge base. It writes exactly one thing: a fresh
`test-case-status.md` in the quality package when the tracker is
absent (first-run convenience). Existing trackers are not modified.

## When to use

- Pre-release: confirm no increment has been missed by the test suite
- After `execute-increments` or `execute-quality-increments` batches:
  verify completeness
- Periodic QA audit: "which ready INCs still have no tests?"
- After `detect-knowledge-base-drift` reports drift: confirm whether
  the test-coverage claims still hold
- From quick-dev: invoked on demand when a small change warrants a
  coverage sanity-check against the surrounding feature

## When NOT to use

- Author the quality package → `create-quality-package`
- Validate the quality package against its own contents →
  `review-quality-package`
- Build test artifacts → `execute-quality-increments`
- Triage failing tests → `review-test-failures`
- Refresh the KB → `update-knowledge-base` /
  `detect-knowledge-base-drift`
- Execute application code → `execute-increments`

## Position in workflow

```
            (any time, independently invocable)
                         │
                         ▼
              audit-quality-coverage
        (reads impl pkg + quality pkg + KB)
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
  Uncovered INC     Drift detected    All covered
  → create- /        → detect-kb-      → confirm + exit
    execute-           drift then
    quality-           update-kb,
    increments         or re-author
                       via execute-
                       quality-
                       increments
```

The skill appears in the workflow graph's `anytime:` block. It does not
gate any other stage. It is the recommended pre-release check before
declaring a feature "tested".

## Position in the merged quality stage

This is one of two **operational quality skills** (the other is
`review-test-failures`) lifted and generalised from an earlier
team-internal set. Both
are read-mostly, anytime-invocable, and consume the artifacts produced
by `create-quality-package` plus the knowledge base. Neither runs as
a gate; either can be invoked from inside any flow (greenfield,
brownfield, quick-dev) when a coverage or failure question arises.


