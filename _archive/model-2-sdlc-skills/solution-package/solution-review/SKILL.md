---
name: solution-review
description: Runs the formal solution design review sequence and readiness gate before implementation planning handoff. Use when the user says "solution review", "review solution package", "validate solution design", "check solution readiness", "architecture review", "security posture review", "solution readiness", "implementation handoff", or asks whether a solution package is ready for developers.
---

# Solution Review

Use this skill to validate an assembled solution package before implementation planning handoff.

## Instructions

1. Read [solution-review-workflow.md](references/solution-review-workflow.md).
2. Follow the review sequence strictly in order.
3. Do not run review checks in parallel.
4. Present findings and verdict after each review.
5. Stop on any NO-GO or blocking finding until the user resolves it or asks for help resolving it.

## Key Rules

- Review only after `solution-package.md` has been assembled.
- Run `review-solution-readiness` last.
- A NO-GO readiness verdict blocks implementation handoff.
- If a fix changes content checked by an earlier passed review, explicitly assess whether that earlier verdict is still valid.
