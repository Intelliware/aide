---
name: requirements-discovery
description: Runs the requirements-package discovery phase for a brownfield feature request before requirements analysis or requirements writing. Use when the user says "requirements discovery", "start requirements discovery", "do requirements discovery", "requirements current-state baseline", "discover current capabilities for requirements", or asks to prepare discovery outputs for a requirements package. Do not use for solution-design discovery or implementation package planning.
---

# Requirements Discovery

Use this skill to run the discovery phase for a requirements package.

## Instructions

1. Read [discovery-workflow.md](references/discovery-workflow.md).
2. Follow the workflow one step at a time.
3. Do not read all reference files upfront.
4. After each artifact is produced, present it to the user and wait for acknowledgement.
5. Write outputs under `docs/<feature>/requirements-package/discovery/`.

## Key Rules

- Capture and confirm who, what, and why before discovery starts.
- Use this only for the requirements package discovery phase; do not use it for solution design discovery or implementation package planning.
- Keep discovery scoped to the proposed change and adjacent current-system behavior.
- Load reference files only when the workflow reaches that step.
- Do not proceed to analysis until the current-capability baseline is complete and acknowledged.
