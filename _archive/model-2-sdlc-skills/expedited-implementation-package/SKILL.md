---
name: expedited-implementation-package
description: Runs the expedited implementation workflow for small-to-medium changes without separate requirements or solution packages, covering change spec, codebase orientation, implementation plan, TDD execution, verification, PR review, and handoff with an escape hatch to the full implementation package. Use when the user says "expedited implementation", "expedited package", "small change implementation", "fast-track implementation", "quick implementation", "write change spec", "execute expedited plan", or "expedited PR".
---

# Expedited Implementation Package

Use this skill for spec-driven implementation of small-to-medium changes that do not need the full requirements, solution, and implementation package pipeline.

## Instructions

1. Read [expedited-implementation-workflow.md](references/expedited-implementation-workflow.md).
2. Run the full expedited path: change spec, orientation, plan, execution, PR review, approved commits, and handoff.
3. Follow the workflow one step at a time.
4. Read each reference only when the workflow reaches that step.
5. Stop at each handoff prompt and wait for the user's decision.

## Core Rules

- Use the escape hatch if the change exceeds expedited scope; recommend the full `implementation-package` pipeline.
- Do not code before the change spec is clear, orientation is complete, and the implementation plan clarity gate passes. For trivial changes, the change spec may stay inline instead of being written to a file, but orientation, planning, execution, verification, and PR review still run.
- Use TDD and fresh verification evidence before claiming completion.
- Do not commit or create a PR without explicit user approval.
