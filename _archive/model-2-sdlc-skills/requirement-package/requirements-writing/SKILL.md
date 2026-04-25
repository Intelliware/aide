---
name: requirements-writing
description: Writes and assembles a complete requirements package, including executive summary, personas, objectives, journeys, functional requirements, business rules, data, permissions, NFRs, assumptions, constraints, scope, and change tracker. Use when the user says "requirements writing", "write requirements", "draft requirements", "create the requirements spec", "write functional requirements", "assemble the requirements package", or wants to skip discovery and analysis.
---

# Requirements Writing

Use this skill to write and assemble the requirements package.

## Instructions

1. Read [requirements-writing-workflow.md](references/requirements-writing-workflow.md).
2. Determine which upstream phases ran by checking for discovery and analysis artifacts.
3. Follow the workflow one step at a time.
4. Do not read all reference files upfront.
5. After each artifact is produced, present it to the user and wait for acknowledgement.
6. Write outputs under `docs/<feature>/requirements-package/requirements/` and assemble `docs/<feature>/requirements-package/requirements-package.md`.

## Supported Entry Paths

- Discovery and analysis completed: consume both upstream artifact sets.
- Discovery completed, analysis skipped: use discovery outputs and elicit missing scope, constraints, dependencies, and risks.
- Discovery and analysis skipped: start from who, what, and why; gather existing artifacts; treat system claims as assumptions.

## Key Rules

- Do not fail only because upstream phases were skipped.
- Explain confidence trade-offs when analysis is missing.
- Initialize and maintain the change tracker.
- Do not start formal review until the assembled requirements package is complete.
