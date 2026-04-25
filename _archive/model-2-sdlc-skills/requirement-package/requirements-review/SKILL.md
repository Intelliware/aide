---
name: requirements-review
description: Runs the formal requirements package review sequence and final readiness gate before architect handoff. Use when the user says "requirements review", "review the requirements package", "validate requirements", "check requirements readiness", "handoff readiness", "architect handoff", or asks to check scope, completeness, consistency, measurability, testability, data completeness, traceability, or feasibility.
---

# Requirements Review

Use this skill to validate an assembled requirements package before architect handoff.

## Instructions

1. Read [review-workflow.md](references/review-workflow.md).
2. Follow the review sequence strictly in order.
3. Do not run review checks in parallel.
4. Present findings and verdict after each review.
5. Stop on any fail verdict until the user resolves the finding or asks for help resolving it.

## Key Rules

- Review only after `requirements-package.md` has been assembled.
- Run `review-requirements-readiness` last.
- A failed readiness verdict blocks architect handoff.
- If a fix changes content checked by an earlier passed review, explicitly assess whether that earlier verdict is still valid.
