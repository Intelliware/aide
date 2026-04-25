---
name: implementation-package
description: Coordinates the full implementation package workflow from implementation planning through TDD execution, verification, PR review, commits, PR creation, and handoff. Use when the user says "implementation package", "start implementation", "implementation planning", "implementation plan", "execute implementation plan", "run TDD implementation", "implementation PR", or asks to move from solution design to working code.
---

# Implementation Package

Use this skill as the parent coordinator for the implementation package lifecycle.

## Instructions

1. Read [implementation-package-workflow.md](references/implementation-package-workflow.md).
2. Ask the user which path they want:
   - Full path: implementation planning, implementation execution, PR/handoff
   - Planning only: produce an approved implementation plan without coding
   - Execution only: execute an existing approved implementation plan
   - PR only: review the working tree and create commits/PR after approval
3. Route to the appropriate phase skill.
4. Between phases, ask whether the user is ready to continue.
5. Do not duplicate phase logic here; defer detailed work to the phase skills.

## Phase Skills

- Start implementation planning with `implementation-plan`.
- Start implementation execution with `implementation-execution`.
- Start PR/handoff with `implementation-pr`.

## Core Rules

- Keep the user in control at phase boundaries.
- Do not start coding unless `review-plan-readiness` returned GO, unless the user explicitly provides and approves an equivalent implementation plan and project context.
- Do not commit without explicit user approval.
- Treat verification evidence as mandatory before claiming completion.
