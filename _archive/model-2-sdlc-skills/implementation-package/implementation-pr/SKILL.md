---
name: implementation-pr
description: Runs the implementation PR and handoff lifecycle by reviewing the uncommitted diff, fixing findings, creating approved atomic commits, generating a PR description, creating a PR, and optionally generating a changelog entry. Use when the user says "implementation PR", "create implementation PR", "prepare PR", "review implementation diff", "commit implementation changes", "create PR after implementation", or asks for merge-ready handoff.
---

# Implementation PR

Use this skill to review, commit, and prepare implementation work for PR handoff.

## Instructions

1. Read [implementation-pr-workflow.md](references/implementation-pr-workflow.md).
2. Follow the PR/handoff workflow one step at a time.
3. Review the uncommitted diff before committing.
4. Present findings and wait for acknowledgement at each gate.
5. Do not commit or create a PR without explicit user approval.

## Key Rules

- Review happens before commit.
- Critical and important findings must be fixed and re-verified before commit.
- Commits must be atomic and traceable.
- PR description must include implementation summary, tests, and requirements/solution links.
