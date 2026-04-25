---
name: requirements-package
description: Coordinates the full requirements package workflow from discovery through analysis, requirements writing, formal review, and architect handoff. Use when the user says "requirements package", "start requirements", "create a requirements package", "run the requirements workflow", "guide me through requirements", or asks whether to run or skip discovery, analysis, writing, or review.
---

# Requirements Package

Use this skill as the parent coordinator for the requirements package lifecycle.

## Instructions

1. Read [requirements-package-workflow.md](references/requirements-package-workflow.md).
2. Ask the user which path they want:
   - Full path: discovery, analysis, requirements writing, review
   - Skip discovery: analysis, requirements writing, review
   - Skip discovery and analysis: requirements writing, review
   - Review only: validate an existing assembled package
3. Route to the appropriate phase skill.
4. Between phases, ask whether the user is ready to continue.
5. Do not duplicate phase logic here; defer detailed work to the phase skills.

## Phase Skills

- Start discovery with `requirements-discovery`.
- Start analysis with `requirements-analysis`.
- Start requirements writing with `requirements-writing`.
- Start formal review with `requirements-review`.

## Core Rules

- Keep the user in control at phase boundaries.
- Do not skip directly to architect handoff unless formal review has approved the package.
- If a prior phase is skipped, explain the confidence trade-off and record unverified system claims as assumptions in the downstream phase.
