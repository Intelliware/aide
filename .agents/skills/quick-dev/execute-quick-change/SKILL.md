---
name: execute-quick-change
description: "Use when a quick-dev plan exists and the user says \"execute the quick change\", \"implement the quick plan\", \"run the increments\", or \"do the work and PR it\". Implements each increment with TDD and 3-dimension verification, runs adversarial PR review, creates atomic commits, and closes by handing off to `update-knowledge-base --scope=catalog-only`. Third of three quick-dev skills."
---

# Execute Quick Change

## Overview

Implements the quick-dev plan increment-by-increment with TDD, runs three-dimension verification (Completeness / Correctness / Coherence), invokes adversarial PR review (4-lens: blind / spec compliance / standards compliance / codebase integration), creates atomic commits after explicit user approval, halts at the Completion Confirmation Gate until the user confirms the change works in their environment, then hands off to `update-knowledge-base --scope=catalog-only` so the KB catalog reflects the change.

Anchors the legacy `expedited-implementation-package`'s execute + deliver phases.

### Quality stage is bypassed (by design)

Quick-dev intentionally bypasses the dedicated quality stage (`create-quality-package` / `review-quality-package` / `execute-quality-increments` / `audit-quality-coverage` / `review-test-failures`) the same way it bypasses `review-requirements-package` and `review-design-package`. Quality is not skipped — it is folded inline:

- **Test design** lives in the spec's per-AC "How will this be proven?" notes (authored by `document-quick-change`) and in §12.2a's **quality constraints** subsection (test framework, coverage floor, lint/format rules, prohibited test patterns).
- **Quality engineering** lives in this skill's TDD loop, the 3-dimension verification, and the adversarial PR review.
- **QA analysis / release gates** collapse to the Completion Confirmation Gate plus the per-AC proof notes.

If, mid-execution, the scope grows past quick-dev tolerances (new data model, new endpoint, cross-team coordination, architectural decision, high risk/ambiguity) **or** the quality posture needs more than the inline carriers above (multi-environment automation strategy, formal coverage matrix, release-gate metrics, compliance evidence), halt and escalate to the full pipeline (`create-quality-package` and the elaborate flow). See `.agents/skills/quality/README.md` and `create-quality-package/references/quality-in-the-lifecycle.md` for the bypass rationale and the per-stage carrier map.

### Iron rules (no exceptions)

1. **No production code without a failing test first.** Code written ahead of a failing test is deleted and redone.
2. **No success claim without fresh verification in the same turn.** "I ran them earlier" is not acceptable — re-run in the turn that claims success.
3. **Never commit without explicit user approval.**
4. **Zero findings in adversarial review is a re-analysis trigger, not a pass.** A clean review almost always means the lens was wrong, not that the diff is perfect.
5. **Solution Pivot Gate.** If the first implementation attempt fails verification, do not silently iterate. Diagnose the root cause, present **one** alternative approach with rationale and tradeoffs, and wait for explicit user approval of the new approach before writing any new code. Each pivot is a checkpoint. See `steps/02-verify.md`.
6. **Solution constraints survive pivots.** The spec's §12.2a Solution Constraints (no regex, no hardcoded maps, no new dependencies, etc.) must be honored on every iteration — including any pivot. Cross-check candidate fixes against them before proposing.
7. **Completion Confirmation Gate.** Do not treat the change as done once code is written, tests pass, and the PR opens. The change is only complete after the user explicitly confirms the fix works in their environment ("confirmed", "verified", "ship it"). The AI does not self-close. If the user reports the change still doesn't work, treat it as a failed verification and run the Solution Pivot Gate. See `steps/04-confirmation-gate.md`.

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

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode B, before step 1. If `features.toml` is absent, skip feature resolution; the change is identified by its `<name>`. Either way, read and write paths follow that file's *Quick-dev layout*, not the § *Not opted in* table: the plan is read from the planning-stage directory, the spec and `CHANGE-TRACKER.md` from the requirements-stage directory, and review findings are written to the execution-stage directory after its `write_role` check. Repo scope comes from where the plan sits — never asked. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` (`caller: execute-quick-change`, `caller_mode: select-only`) rather than guessing which feature's plan to execute. Create is suppressed because a plan cannot exist for a feature that was just minted — `plan-quick-change`, which produces that plan, is Mode B for the same reason. If it resolves, echo the feature ID before opening the TDD loop.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

1. **Load solution constraints** — before any increment starts, read the spec's §12.2a Solution Constraints and treat them as facts the implementation must honor on every iteration, including any Solution Pivot. If the spec is inline (trivial) and a constraints section was not written, ask the user once before opening the TDD loop.
2. **Per-increment loop** — for each increment in plan order:
   - **Education + game plan + Go/No-Go** — restate what, how, dependencies, deliverables; lay out order of operations; wait for explicit "go".
   - **Branch** — `feature/<inc-id>-<short-name>`.
   - **TDD per task** — RED (failing test) → verify-fail → GREEN (minimal code) → verify-pass → REFACTOR. See `steps/01-tdd-loop.md`.
   - **3-dimension verification** — Completeness / Correctness / Coherence (`verify-source` for content claims; the AI Gate test commands for code). See `steps/02-verify.md`.
   - **Failed verification → Solution Pivot Gate** — if any check fails, run 4-phase RCA, cross-check candidate fixes against solution constraints, then either small-loop fix (no strategy change) or halt and present **one** alternative approach for explicit user approval. No silent iteration. See `steps/02-verify.md`.
   - **Approve + commit** — present summary, wait for explicit approval before staging and committing with a conventional commit message.
3. **Adversarial PR review** — 4-lens review of the uncommitted (or staged) diff: blind → spec compliance → standards compliance → codebase integration. Zero findings triggers re-analysis. See `steps/03-adversarial-pr-review.md`.
4. **Fix cycle** — fix Critical and Important findings, re-verify, re-review affected diff.
5. **Commit + PR** — only after explicit user approval; conventional commit messages; PR description generated from the spec, plan, and diff.
6. **Completion Confirmation Gate** — present the implementation, surface verification evidence, and ask the user to confirm the change works in their environment. **Halt** until explicit confirmation arrives. If the user reports a problem, route back to step 2's Solution Pivot Gate. The skill cannot self-close. See `steps/04-confirmation-gate.md`.
7. **KB hand-off** — only after the Confirmation Gate clears, invoke `update-knowledge-base --scope=catalog-only` so the catalog reflects the change without forcing a full re-synthesis.

## Output

See `references/INPUTS-OUTPUTS.md`. Working tested code, atomic commits, an open PR, and a triggered catalog-only KB update.

## Next skill

`update-knowledge-base` — invoked with `--scope=catalog-only` so the change shows up in the KB catalog without forcing a full re-synthesis. (Authored in task #10.)

## Common mistakes

- Writing production code before a failing test — code must be deleted and redone
- Claiming success without re-running tests in the same turn (no verification from memory)
- Committing without explicit user approval
- Skipping adversarial review when the diff "looks fine"
- Forgetting the KB catalog update — drift starts here
- Patching symptoms instead of root cause when bugs surface mid-execution
- Silently iterating through two or three approaches in the same turn instead of halting at the Solution Pivot Gate to surface the first failure and proposed alternative
- Violating a documented solution constraint during a pivot ("we hit a wall, so I added a regex / a new dependency / a hardcoded map") — solution constraints survive the pivot
- Self-closing the change after tests pass and the PR opens, instead of waiting at the Completion Confirmation Gate for the user to confirm the change works in their environment
- Conflating commit approval with completion confirmation — they are two separate gates and must be asked separately
