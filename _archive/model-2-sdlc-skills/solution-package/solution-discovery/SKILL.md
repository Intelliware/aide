---
name: solution-discovery
description: Runs optional solution architecture discovery for a solution design package by scanning existing architecture, integration points, deployment shape, data architecture, security boundaries, and technical debt. Use when the user says "solution discovery", "solution architecture discovery", "design discovery", "architecture baseline", "discover architecture for solution design", or asks to understand existing architecture before solution design. Do not use for requirements discovery or implementation planning.
---

# Solution Discovery

Use this skill to run the solution architecture discovery phase.

## Instructions

1. Read [solution-discovery-workflow.md](references/solution-discovery-workflow.md).
2. Follow the workflow one step at a time.
3. Do not read all reference files upfront.
4. After each artifact is produced, present it to the user and wait for acknowledgement.
5. Write outputs under `docs/<feature>/solutions-package/discovery/`.

## Key Rules

- Use this only for solution design architecture discovery; do not use it for requirements discovery or implementation planning.
- Confirm the requirements package exists or ask the user to provide its location before discovery starts.
- Keep discovery scoped to architecture affected by the proposed change.
- Load reference files only when the workflow reaches that step.
- Do not proceed to solution design until the architecture baseline is complete and acknowledged.
