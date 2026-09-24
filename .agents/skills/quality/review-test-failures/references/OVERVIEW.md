# Overview — review-test-failures
## Purpose
Interactively walk through test failures one at a time, classify each
as a **script issue** (test artifact is wrong), a **real application
defect** (production code is wrong), an **environment / data issue**
(infrastructure or fixtures are wrong), or a **flaky / non-deterministic
failure** (the test is non-deterministic and needs hardening). Propose
a concrete remediation per failure, wait for explicit user approval,
and produce a structured final summary with action items routed to
named framework skills.
The skill is **read-only**. It never modifies test code, application
code, fixtures, or logs. The only artefact it writes is the optional
final-summary record appended to the quality package's
`change-tracker.md` (Trigger note: `Failure triage`).
## When to use
- After a `execute-quality-increments` or `execute-increments` test
  run reports failures
- After a CI test run hands off a failure set
- User provides raw test output, a results directory, or screenshots
  and asks for triage
- User says "my tests failed", "analyse the failures", "what went
  wrong", "review the failed scenarios"
## When NOT to use
- The user wants to **build or amend test artifacts** →
  `execute-quality-increments` (TC flow) or `execute-increments`
  (inline tests)
- The user wants to **execute application code** → `execute-increments`
- The user wants to **audit coverage** → `audit-quality-coverage`
- The user wants to **review the quality package** →
  `review-quality-package`
- The user wants to **manage bugs in the application-bug log** —
  log a single bug → `manage-bugs`. (This skill triages whole batches
  of failures and *routes* application defects to `manage-bugs` as
  part of its summary.)
- There are no failures to review
## Position in workflow
```
execute-quality-increments ──(failures)──┐
execute-increments        ──(failures)──┤
CI test run               ──(failures)──┴──► review-test-failures
                                                     │
                                ┌────────────────────┼────────────────────┐
                                ▼                    ▼                    ▼
                       Script issue        Application defect      Environment / flake
                       → execute-          → manage-bugs           → recommend
                         quality-                                    environment fix
                         increments or                               or test-hardening
                         execute-                                    increment
                         increments
```
The skill appears in the workflow graph's `anytime:` block. It does
not gate any other stage. It is the recommended first action when a
test run produces failures the user is unsure about — *triage before
fixing*.
## Position in the merged quality stage
This is the second of the two **operational quality skills**
(the other is `audit-quality-coverage`) lifted and generalised from an
earlier team-internal set. Both are read-only, anytime-invocable, and consume the
artifacts produced by `create-quality-package` plus the knowledge
base. Neither runs as a gate; either can be invoked from inside any
flow (greenfield, brownfield, quick-dev) when a coverage or failure
question arises.