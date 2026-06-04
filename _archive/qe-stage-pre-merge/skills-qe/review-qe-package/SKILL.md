---
name: review-qe-package
description: "Use when the user asks to review, validate, or check readiness of an assembled QE package; says 'review the QE package', 'validate the test package', 'check QE readiness', 'review test cases', 'are the tests complete', 'QE readiness check'. Independently invocable; assumes the QE package is already assembled."
---

# Review QE Package

## Overview

Runs verification and readiness checks against an already-assembled QE package. Validates completeness, traceability back to requirements/design, consistency of test case organization, and execution strategy coverage. Produces findings and a verdict (PASS / PASS WITH OBSERVATIONS / FAIL). Independently invocable: the user can run this skill against any existing QE package without re-running creation.

## When to use

- An assembled QE package exists and validation is wanted before execution
- User says: "review the QE package", "validate the test package", "review test cases", "check QE readiness"
- Re-validating after amendments to the QE package

## When NOT to use

- The QE package is not yet assembled — run `create-qe-package` first
- The user wants to execute QE test increments — use `execute-qe-increments`
- The user wants validation of requirements or design packages — use the respective review skills

## Inputs

| Name | Required? |
|---|---|
| Assembled QE package (`{paths.qe_package}/`) | yes |
| QE `change-tracker.md` | yes |
| Approved requirements package | yes |
| Approved design package | yes |
| `project.toml` | yes |

See `references/INPUTS-OUTPUTS.md` for the full table.

## Workflow

Run reviews strictly in order. Do not skip ahead and do not run reviews in parallel. Present findings and verdict after each review. A FAIL or blocking finding halts the sequence until resolved.

**Before starting:** Read all previously created packages for full context (requirements, design, implementation, QE package).

| Order | Review | What it validates |
|---|---|---|
| 1 | review-completeness | All test cases trace to requirements/design; no FR/NFR coverage gaps; scaffolding increments cover all prep work; edge cases and negative scenarios represented |
| 2 | review-consistency | Test case organization matches declared categories; no orphaned files; all TC IDs unique; dependency references resolve; status tracker complete |
| 3 | review-execution-readiness | Execution strategy covers all environments; prerequisites documented; artifact target paths valid; tech stack matches embedding strategy; reporting documented |
| 4 | readiness-verdict | Final PASS / PASS WITH OBSERVATIONS / FAIL gate based on reviews 1–3; confirms implementation complete, requirements/design versions current |

The detailed per-review checklists, verdicts, fail recovery protocol, and handoff instructions live in `references/review-workflow.md`.

## Output

| Artifact | Path | Format |
|---|---|---|
| Review findings | `{paths.qe_package}/review/review-findings.md` | Markdown — findings + verdict |
| Readiness verdict | `{paths.qe_package}/review/readiness-verdict.md` | Markdown — PASS / PASS WITH OBSERVATIONS / FAIL |
| Updated change tracker rows | `{paths.qe_package}/change-tracker.md` | Markdown table |

## Next skill

- If verdict = PASS or PASS WITH OBSERVATIONS (user-accepted) → `execute-qe-increments`
- If verdict = FAIL → back to `create-qe-package` to address findings, then re-run this skill

## Common mistakes

- Reviewing without reading all prior packages for traceability context.
- Treating PASS WITH OBSERVATIONS as PASS without logging the observations.
- Skipping execution strategy review — it's a first-class artifact.

