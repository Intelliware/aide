---
name: solutions-package
description: Coordinates the full solution design package workflow from optional solution architecture discovery through solution design, solution review, and implementation handoff. Use when the user says "solutions package", "solution design package", "start solution design", "run the solution workflow", "guide me through solution design", or asks whether to run or skip solution discovery before design.
---

# Solutions Package

Use this skill as the parent coordinator for the solution design package lifecycle.

## Instructions

1. Read [solutions-package-workflow.md](references/solutions-package-workflow.md).
2. Ask the user which path they want:
   - Full path: optional solution discovery, solution design, solution review
   - Skip solution discovery: start directly at solution design
   - Design update: revise affected sections after requirements changes
   - Review only: validate an existing assembled solution package
3. Route to the appropriate phase skill.
4. Between phases, ask whether the user is ready to continue.
5. Do not duplicate phase logic here; defer detailed work to the phase skills.

## Phase Skills

- Start solution architecture discovery with `solution-discovery`.
- Start solution design with `solution-design`.
- Start formal solution review with `solution-review`.

## Core Rules

- Keep the user in control at phase boundaries.
- Treat solution discovery as optional, even for brownfield work; recommend it when architecture confidence is low.
- Do not skip directly to implementation handoff unless solution review has approved the package.
- If solution discovery is skipped, explain the confidence trade-off and record missing architecture baseline context as an explicit design risk.
