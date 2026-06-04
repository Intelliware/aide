# Overview — review-qe-package

## Purpose

Independently invocable validator for an assembled QE package. Runs four reviews in strict sequence (completeness, consistency, execution readiness, final verdict), producing per-review findings and a final readiness verdict that gates execution handoff.

The skill exists as a separate entry point from `create-qe-package` because users routinely want to validate a QE package without re-running the full creation wizard. Typical scenarios: the user amended test cases after feedback; a downstream execution run flagged a gap; the user wants a quick readiness check before kicking off `execute-qe-increments`.

## When to use

- Assembled QE package exists and validation is wanted before execution handoff
- User says any trigger phrase from the SKILL.md frontmatter
- Re-validating after the QE change tracker recorded amendments
- Re-validating after requirements or design changes that may affect test coverage

## When NOT to use

- QE package not yet assembled — `create-qe-package`
- Validating a requirements, design, or implementation artifact — use the respective review skills
- Executing QE test increments — `execute-qe-increments`

## Position in workflow

```
create-qe-package -> review-qe-package -> execute-qe-increments
```

If readiness returns FAIL, the loop is: fix in `create-qe-package` (or hand-edit), then re-run `review-qe-package` until PASS or accepted PASS WITH OBSERVATIONS.
