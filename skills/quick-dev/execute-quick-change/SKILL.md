---
name: execute-quick-change
description: "Use when a quick-dev plan exists and the user says \"execute the quick change\", \"implement the quick plan\", \"run the increments\", or \"do the work and PR it\". Implements each increment with TDD and 3-dimension verification, runs adversarial PR review, creates atomic commits, and closes by handing off to `update-knowledge-base --scope=catalog-only`. Third of three quick-dev skills."
---

# Execute Quick Change

## Overview

Implements the quick-dev plan increment-by-increment with TDD, runs three-dimension verification (Completeness / Correctness / Coherence), invokes adversarial PR review (4-lens: blind / spec compliance / standards compliance / codebase integration), creates atomic commits after explicit user approval, then hands off to `update-knowledge-base --scope=catalog-only` so the KB catalog reflects the change.

Anchors the legacy `expedited-implementation-package`'s execute + deliver phases. Same iron rules: no production code without a failing test first, no success claim without fresh verification in the same turn, never commit without explicit user approval.

## When to use

- A quick-dev plan exists, has passed the clarity gate, and the user has approved it
- User says "execute the quick change", "implement the plan", "run the increments", "do the work and PR it"
- Existing tests pass — clean starting state
- Codebase is accessible

## When NOT to use

- No plan yet — invoke `plan-quick-change` first
- The plan failed the clarity gate — return to `plan-quick-change`
- The change is part of an elaborate flow — use `execute-increments` (planned in task #6) instead
- The PR has already been created and you only need to amend — invoke `create-pr` directly
- The user wants only KB updates — invoke `update-knowledge-base` directly

## Inputs

See `references/INPUTS-OUTPUTS.md`.

## Workflow

1. **Per-increment loop** — for each increment in plan order:
   - **Phase Education** — restate what, how, dependencies, deliverables
   - **Game Plan** — order of operations, key decisions, integration points
   - **Go/No-Go** — present, wait for explicit "go"
   - **Branch** — `feature/<inc-id>-<short-name>`
   - **TDD per task** — RED (failing test) → verify-fail → GREEN (minimal code) → verify-pass → REFACTOR. Iron rule: no production code without a failing test first. See `steps/01-tdd-loop.md`.
   - **3-dimension verification** — Completeness / Correctness / Coherence (`verify-source` for content claims; the AI Gate test commands for code). See `steps/02-verify.md`.
   - **Debug** — if issues arise, run 4-phase systematic RCA before fixing. No fix without root cause.
   - **Approve + commit** — present summary, wait for explicit approval before staging and committing with a conventional commit message.
2. **Adversarial PR review** — 4-lens review of the uncommitted (or staged) diff: blind → spec compliance → standards compliance → codebase integration. Zero findings triggers re-analysis. See `steps/03-adversarial-pr-review.md`.
3. **Fix cycle** — fix Critical and Important findings, re-verify, re-review affected diff.
4. **Commit + PR** — only after explicit user approval; conventional commit messages; PR description generated from the spec, plan, and diff.
5. **KB hand-off** — invoke `update-knowledge-base --scope=catalog-only` so the catalog reflects the change without forcing a full re-synthesis.

## Output

See `references/INPUTS-OUTPUTS.md`. Working tested code, atomic commits, an open PR, and a triggered catalog-only KB update.

## Next skill

`update-knowledge-base` — invoked with `--scope=catalog-only` so the change shows up in the KB catalog without forcing a full re-synthesis. (Authored in task #10.)

## Common mistakes

- Writing production code before a failing test — code must be deleted and redone
- Claiming success without re-running tests in the same turn (no verification from memory)
- Committing without explicit user approval
- Skipping adversarial review when the diff "looks fine"
- Treating zero-findings as success rather than as a re-analysis trigger
- Forgetting the KB catalog update — drift starts here
- Patching symptoms instead of root cause when bugs surface mid-execution
