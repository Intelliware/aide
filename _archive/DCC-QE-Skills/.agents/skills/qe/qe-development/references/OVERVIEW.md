# Overview — qe-development

## Purpose

Turn a JIRA issue or user-provided test instructions into working Playwright +
Cucumber + Java test automation in BB-DCC-QE, following a phased workflow with
approval checkpoints between each step.

## When to use

- User asks to build, extend, fix, or refactor automated tests in BB-DCC-QE
- User provides a JIRA ticket with acceptance criteria
- User provides alternative test development instructions
- User says "build a test", "create BDD", "add a scenario", "implement this story"

## When NOT to use

- User wants to run existing tests → `qe-execution`
- User wants to analyze failures → `qe-defect-review`
- User just wants to refresh KNOWLEDGE.md → `qe-code-scanner`

## Position in workflow

```
qe-code-scanner (dependency — seeds/refreshes KNOWLEDGE.md)
       │
       ▼
qe-development ──► qe-execution ──► qe-defect-review
```

`qe-development` is the first skill in the main QE flow. It produces test code
and offers a hand-off to `qe-execution` with the tags to run.

