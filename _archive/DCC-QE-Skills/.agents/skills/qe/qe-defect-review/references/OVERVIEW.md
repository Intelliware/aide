# Overview — qe-defect-review

## Purpose

Interactively walk through test failures one at a time, classify each as a
script issue or real application defect, propose remediation, and produce a
structured summary of all failure causes.

## When to use

- After qe-execution reports failures
- User provides failure logs or execution output
- User says "my tests failed", "analyze failures", "review the results"

## When NOT to use

- No failures to review
- User wants to build tests → `qe-development`
- User wants to run tests → `qe-execution`

## Position in workflow

```
qe-development ──► qe-execution ──(hand-off: failures)──► qe-defect-review
                                                                │
                                                                ▼
                                                    (optional) qe-development
                                                    (to fix script issues)
```

Final skill in the main QE flow. Can hand back to `qe-development` if test
script fixes are needed.

