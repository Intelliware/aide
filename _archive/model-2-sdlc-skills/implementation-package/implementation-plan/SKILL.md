---
name: implementation-plan
description: Runs implementation planning after an approved solution package by analyzing the codebase, planning tests, prerequisites, delivery sequencing, project context, implementation tasks, and plan readiness. Use when the user says "implementation plan", "implementation planning", "create implementation plan", "plan implementation", "developer handoff planning", or asks to prepare coding agents before implementation. Do not use for requirements discovery or solution discovery.
---

# Implementation Plan

Use this skill to produce the implementation package and approved implementation plan.

## Instructions

1. Read [implementation-plan-workflow.md](references/implementation-plan-workflow.md).
2. Follow the workflow one step at a time.
3. Do not read all reference files upfront.
4. After each artifact is produced, present it to the user and wait for acknowledgement.
5. Write outputs under `docs/<feature>/implementation-package/`.

## Key Rules

- Use this only for implementation planning; do not use it for requirements discovery or solution architecture discovery.
- Confirm the solution package exists or ask the user to provide its location before planning starts.
- Keep analysis scoped to code areas affected by the approved solution.
- Do not proceed to coding until `review-plan-readiness` returns GO.
