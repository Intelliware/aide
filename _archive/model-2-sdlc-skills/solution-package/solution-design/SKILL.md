---
name: solution-design
description: Designs and assembles a solution design package from a requirements package, optional architecture baseline, and user-confirmed architecture assumptions. Use when the user says "solution design", "start solution design", "design the solution", "create solution package", "write solution design", "assemble solution package", "skip solution discovery", or asks to update solution design after requirements changed.
---

# Solution Design

Use this skill to design and assemble the solution design package.

## Instructions

1. Read [solution-design-workflow.md](references/solution-design-workflow.md).
2. Determine whether solution discovery ran by checking for `docs/<feature>/solutions-package/discovery/architecture-baseline.md`.
3. Follow the workflow one step at a time.
4. Do not read all reference files upfront.
5. After each artifact is produced, present it to the user and wait for acknowledgement.
6. Write section outputs under `docs/<feature>/solutions-package/design/` and assemble `docs/<feature>/solutions-package/solution-package.md`.

## Supported Entry Paths

- Discovery completed: consume the architecture baseline as the current-architecture source of truth.
- Discovery skipped for brownfield: use available codebase/context and user-confirmed architecture assumptions; record missing baseline risk.
- Discovery skipped for greenfield: proceed from requirements with an explicitly empty architecture baseline assumption.
- Requirements changed after design: use the requirements change tracker to update only affected sections.

## Key Rules

- Do not fail only because solution discovery was skipped.
- Explain confidence trade-offs when the architecture baseline is missing.
- Confirm design section scope before writing section outputs.
- Do not start formal solution review until the assembled solution package is complete.
