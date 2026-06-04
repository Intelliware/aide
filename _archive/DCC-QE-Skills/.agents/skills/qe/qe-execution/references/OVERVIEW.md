# Overview — qe-execution

## Purpose

Execute BB-DCC-QE Playwright + Cucumber tests against a target environment and
report results. Supports local, BrowserStack CDP, and BrowserStack SDK modes.

## When to use

- User asks to run/execute tests, a tag, or a feature
- After `qe-development` hands off with tags to run
- User says "run @smoke", "execute my test", "run it"

## When NOT to use

- User wants to build tests → `qe-development`
- User wants to analyze failures from a previous run → `qe-defect-review`

## Position in workflow

```
qe-development ──(hand-off: tags)──► qe-execution ──(hand-off: failures)──► qe-defect-review
```

Middle skill in the QE flow. Independently invocable for running any existing tests.

