---
name: review-requirements-package
description: "Use when the user asks to review, validate, or check readiness of an assembled requirements package; says 'review the requirements package', 'validate requirements', 'check requirements readiness', 'requirements review', 'check scope/completeness/consistency/measurability/testability', 'requirements handoff readiness', 'is the requirements package ready for the architect'. Independently invocable; assumes the package is already assembled."
---

# Review Requirements Package

## Overview

Runs the formal review sequence and final readiness gate against an already-assembled requirements package. Produces findings and a verdict (PASS / PASS WITH OBSERVATIONS / FAIL) per review, ending with `review-requirements-readiness` as the GO/NO-GO gate before design handoff. Independently invocable: the user can run this skill against any existing requirements package without re-running creation.

The review sequence is strict — ten reviews in fixed order, no parallel execution. A FAIL verdict halts the sequence; the user fixes (with this skill's help if asked) and the failed review re-runs from the beginning. If a fix changes content checked by an earlier passed review, that earlier verdict is explicitly re-evaluated.

## When to use

- An assembled `requirements-package.md` exists and the user wants validation before design handoff
- User says: "review the requirements package", "validate requirements", "check requirements readiness", "requirements handoff readiness", "is the requirements package ready"
- Re-validating after a downstream skill (design or implementation) flagged a requirements gap
- Re-validating after the requirements change tracker recorded amendments

## When NOT to use

- The package is not yet assembled — run `create-requirements-package` first
- The user wants validation of a design or implementation package — use `review-design-package` or future `review-implementation-package`
- The user wants to create requirements — `create-requirements-package`

## Inputs

| Name | Required? |
|---|---|
| Assembled `requirements-package.md` | yes |
| `change-tracker.md` | yes |
| `completeness-tracker.md` | yes |
| Analysis artifacts (when present) | yes (for traceability review) |
| `project.toml` | yes (for flow detection and policy gates) |

See `references/INPUTS-OUTPUTS.md` for the full table.

## Workflow

Run reviews strictly in order. Do not parallelize. Present findings and verdict after each review. Stop on any FAIL until resolved.

| Order | Review | What it checks |
|---|---|---|
| 1 | review-scope | Scope is well-defined, bounded, free of creep |
| 2 | review-completeness | No missing requirements, undefined edge cases, coverage gaps |
| 3 | review-consistency | No contradictions, ambiguity, or duplicates |
| 4 | review-measurability | Quantifiable language, SMART scoring |
| 5 | review-testability | Every requirement has verifiable acceptance criteria |
| 6 | review-implementation-leakage | What, not how |
| 7 | review-data-completeness | Data dictionary and impacts fully specified |
| 8 | review-traceability | Forward to acceptance criteria, backward to needs |
| 9 | review-feasibility | No structurally infeasible or constraint-violating requirements |
| 10 | review-requirements-readiness | Final go/no-go gate (last) |

The detailed instructions, halt conditions, and verdict templates live in `references/review-workflow.md`.

## Output

| Artifact | Path | Format |
|---|---|---|
| Per-review findings | `docs/<feature>/requirements-package/review/<review-name>.md` | Markdown — findings + verdict |
| Final readiness verdict | `docs/<feature>/requirements-package/review/readiness-verdict.md` | Markdown — APPROVED / CONDITIONAL / BLOCKED |
| Updated `change-tracker.md` rows | `docs/<feature>/requirements-package/requirements/change-tracker.md` | Markdown table — `Trigger = Review finding` rows for any fix |

## Next skill

- If readiness verdict = APPROVED → `create-design-package`
- If readiness verdict = BLOCKED → back to `create-requirements-package` to address the failing area, then re-run this skill

## Common mistakes

- Running reviews in parallel. The sequence depends on earlier verdicts being settled before later reviews run.
- Skipping ahead. Every review depends on the verdict of the one before it.
- Treating PASS WITH OBSERVATIONS as PASS. Observations must be logged and the user must explicitly accept them.
- Forgetting to re-run an earlier review when a fix materially changes its checked content.
- Authoring requirements during review. This skill validates only — fixes are deferred to `create-requirements-package` (or done with this skill's help in a clearly bracketed fix-then-re-validate cycle).
- Skipping the readiness gate. `review-requirements-readiness` is the last review; without an APPROVED verdict, design handoff is blocked.
- Not appending `Review finding` rows to the change tracker for every fix the review triggers.
