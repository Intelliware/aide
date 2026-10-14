---
name: execute-increments
description: "Use when the user asks to execute the implementation plan, run an increment, ship INC-XXX, work the next increment, run the AI gate, run the human gate, or turn an approved implementation package into working code. Executes one increment at a time with TDD, AI Gate, Human Gate, and increment-status updates."
---

# Execute Increments

Execute an approved implementation package one increment at a time. For each
increment, this skill runs the Plan steps with TDD discipline, validates
against the Automated Verification (AI Gate), confirms the Human Verification
(Human Gate), checks Success Criteria, and updates `increment-status.md`.

## Overview

Execution turns an approved implementation package into working code. The
unit of work is one increment (`INC-XXX`). For each increment, the skill:

1. **Loads** the increment file and verifies prerequisites
2. **Executes** the Plan section with TDD (no production code without a
   failing test first)
3. **Runs the AI Gate** — automated verification with fresh evidence in the
   current turn
4. **Runs the Human Gate** — surfaces the human-judgment items and waits for
   sign-off
5. **Verifies Success Criteria** — confirms every binary checkbox passes
6. **Updates `increment-status.md`** — flips the increment to `completed`
7. **Hands off to `update-knowledge-base`** — the closing handoff for each
   shipped increment, so the KB stays current

This skill never claims completion without fresh verification evidence in the
same turn. It never proceeds past a failed gate.

## When to use

- The user says "execute the implementation plan", "run the next increment",
  "ship INC-XXX", "work the next increment", "start coding the package", or
  "run the AI gate / human gate"
- An implementation package exists and `review-implementation-package` has
  returned GO. A Quality Package is **recommended but not required**: if one
  exists on disk it must carry a `review-quality-package` GO before its release
  gates are treated as binding exit criteria; if it is absent, the TDD loop
  anchors on the Acceptance Criteria in the Requirements Package. Whether the
  team runs the quality stage first is a per-run user decision made at the
  `review-implementation-package` GO handoff, not a `project.toml` setting.
- The user is ready to authorize coding

## When NOT to use

- The implementation package has not been reviewed (no GO from
  `review-implementation-package`) — run the review first
- The user wants to log or triage bugs found during execution — use
  `manage-bugs` (independently invocable)
- The user wants to package the diff into commits / a PR — use `create-pr`
- The work is a one-off small change — use `quick-dev/execute-quick-change`

## Inputs

| Input | Source | Required |
|---|---|---|
| Implementation package | resolved per stage mode (SoD: per-repo path; legacy: `{project.paths.implementation_package}/{feature-id}/`) | Yes (with GO from review) |
| Quality package | resolved per stage mode (legacy: `{project.paths.quality_package}/{feature-id}/`) | **Recommended, not required.** When present, it must carry a `review-quality-package` GO before its release gates become binding exit criteria, and it supplies the test design the TDD loop writes. When absent, emit a one-time warning at increment start and proceed using the Acceptance Criteria from the Requirements Package as the test-design anchor. Running the quality stage first is a per-run user choice, not driven by `[project.testing].qe_repo` |
| Target codebase | filesystem | Yes |
| Test runner / build tools | environment | Yes |
| project.toml | `{project-root}/project.toml` | Yes |
| Knowledge base | `{project.paths.knowledge_base_path}/` | If present (component context) |

See `references/INPUTS-OUTPUTS.md` for full inputs/outputs tables.

## Verification rule (always-on)

After every drafted artifact and before any file write, summarize back to the user what you understood and what you produced; wait for their explicit acknowledgement (or correction) before proceeding. This applies regardless of which step you are on. Halt the step if the user disagrees.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode B, before Step 0 (once per session, alongside `steps/00-scope-target-repo.md`). If `features.toml` is absent, skip feature resolution, but still map this skill's paths per that file's § *Not opted in* before reading or writing — they are spelled in the opted-in form. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` in select-only mode (`caller: execute-increments`) rather than guessing which feature's increments to run — do not fall back to creating one, because increments to run come from an implementation package that already exists. If it resolves, echo the feature ID before loading the first increment.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

For each increment, execute the steps in order. **Read each step file only
when you are about to execute that step.** Do not pre-load all step files.

0. `steps/00-scope-target-repo.md` — (SoD only) resolve the target source
   repo for this run. No-op when the execution stage is in legacy mode. Run
   once per session, not per increment.
1. `steps/01-load-increment.md` — load the next `INC-XXX.md`, verify
   dependencies completed, confirm prerequisites
2. `steps/02-execute-plan.md` — execute Plan items with TDD discipline
3. `steps/03-ai-gate.md` — run Automated Verification with fresh evidence
4. `steps/04-human-gate.md` — surface Human Verification items, wait for
   sign-off
5. `steps/05-success-criteria.md` — verify every binary criterion passes
6. `steps/06-status-update.md` — update `increment-status.md`, then hand off
   to `update-knowledge-base`

After the increment closes successfully, return to step 1 for the next
increment, or stop if the user has reached the end of the package or a
checkpoint.

## Output

Per increment:

- Working code (committed by `create-pr`, not by this skill)
- Test artifacts (unit, integration, component, E2E as applicable)
- Verification evidence captured in chat (fresh in the current turn)
- Updated `increment-status.md` row (`not-started` → `in-progress` →
  `completed`)
- Bug entries in `bugs-and-issues-log.md` (if any were logged via
  `manage-bugs`)
- KB updates queued via the handoff to `update-knowledge-base`

## Next skill

`update-knowledge-base` (closing handoff per increment)

After all increments in the package are completed, the user typically moves
to `create-pr` for the diff packaging and PR creation.

## Common mistakes

- **Claiming completion without fresh verification.** Every "done" claim
  must cite output from a command run in the current turn. Never use
  remembered or stale evidence.
- **Skipping TDD.** No production code before a failing test. For non-code
  or genuinely test-inapplicable steps, document why TDD does not apply
  before executing.
- **Bundling multiple increments into one execution pass.** Execute one
  increment at a time. The Canonical Increment Shape is the unit of work.
- **Proceeding past a failed gate.** A failed AI Gate halts the increment;
  debug and fix before proceeding. A failed Human Gate halts pending user
  resolution.
- **Forgetting to update `increment-status.md`.** Status changes are
  visible audit trail; missing updates create false impressions of
  progress.
- **Logging bugs inline instead of via `manage-bugs`.** Bug logging is a
  separate skill so that workflow can run independently. From this skill,
  invoke `manage-bugs` rather than writing to the log directly.
- **Using "phase" terminology in chat or commits.** This skill works on
  increments (`INC-XXX`). The word "phase" refers to SDLC stages or
  operational concepts.
