# Overview — qe-coverage-check

## Purpose

Audit BB-DCC-QE test coverage against every increment defined in a feature's
implementation package. Answers the question: "Have all increments that require
BB-DCC-QE automation actually been automated?"

Produces a structured coverage report showing which increments are fully covered,
in-progress, ready but not started, blocked on dev, drifted, or not applicable —
with recommended next actions per gap.

## When to use

- Before a release: confirm no increment has been missed
- After a batch of `qe-development` sessions: verify completeness
- Periodic QA audit: "which ready INCs still have no tests?"
- User supplies a feature name, JIRA ID, or INC ID as the starting point

## When NOT to use

- User wants to build tests → `qe-development`
- User wants to run tests → `qe-execution`
- User wants to analyse failures → `qe-defect-review`

## Position in workflow

```
qe-development ──► qe-code-scanner ──► KNOWLEDGE.md
                                              │
                                              ▼
                                   qe-coverage-check
                                   (reads tracker + KNOWLEDGE.md)
                                              │
                               ┌──────────────┴──────────────┐
                               ▼                             ▼
                     Gaps found                      All covered
                     → /qe-development INC-XXX        → confirm and exit
                     → /qe-code-scanner (drift)
```

`qe-coverage-check` is independently invocable at any point. It is read-only
except for creating `qe-increment-status.md` if it does not yet exist.
