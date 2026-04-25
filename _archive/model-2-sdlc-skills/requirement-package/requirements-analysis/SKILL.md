---
name: requirements-analysis
description: Runs the requirements-package analysis phase for a proposed change by defining scope, stakeholders, dependencies, impacts, constraints, gaps, assumptions, decisions, and risks before requirements writing. Use when the user says "requirements analysis", "start requirements analysis", "do requirements analysis", "scope requirements", "map requirements dependencies", "requirements impact analysis", "requirements gap analysis", or "requirements risk analysis".
---

# Requirements Analysis

Use this skill to run the analysis phase for a requirements package.

## Instructions

1. Read [analysis-workflow.md](references/analysis-workflow.md).
2. Follow the workflow one step at a time.
3. Do not read all reference files upfront.
4. After each artifact is produced, present it to the user and wait for acknowledgement.
5. Write outputs under `docs/<feature>/requirements-package/analysis/`.

## Key Rules

- If discovery outputs exist, use them as the primary current-state context.
- Use this only for requirements package analysis; do not use it for solution design analysis or implementation planning.
- If discovery was skipped, capture a confirmed change description before analysis starts.
- Treat unverified current-system claims as assumptions when discovery did not run.
- Do not proceed to requirements writing until the risk register is complete and acknowledged.
