---
name: execute-quality-increments
description: "Use when the user asks to execute quality / test-case increments, implement TC-XXX, build the test artifacts, run the next quality increment, or turn an approved quality package into working test code. Executes one test-case increment at a time, producing the actual test artifacts (feature files, step definitions, runners, fixtures, exports) and updating the test-case-status tracker. Optional path after a GO quality package when the team has opted into the TC-XXX increment flow."
---

# Execute Quality Increments

## Overview

Executes an approved quality package one test-case increment at a time. The
package may contain two kinds of increments — **scaffolding** (infrastructure
/ prep work: build-file changes, runner classes, shared utilities, test
config) and **test-case** increments (the actual test artifacts). This skill
handles both. For each increment it reads the plan, resolves the test-artifact
target repo, implements the artifacts into that repo, verifies correctness with fresh evidence, obtains
user sign-off, and updates the status tracker.

This is the doing-side companion to `create-quality-package` /
`review-quality-package` for teams that have opted into the TC-XXX increment
flow (composition gate `project.elicitation.uses_test_case_increments =
true`). Teams that fold test work directly into application `INC-XXX`
execution do not use this skill — their tests are written inside
`execute-increments`'s TDD loop.

The skill mirrors `execute-increments` from the execution stage but is
scoped to **test artifacts only**. It never writes production code. If a
gap in production code is discovered during quality execution, the skill
logs it and routes to `execute-increments` or `manage-bugs`.

## When to use

- An approved quality package exists with a test-case-increment plan
  (verdict GO or accepted CONDITIONAL GO from `review-quality-package`)
- The composition was assembled with the `test-case-increment` block enabled
- User says: "execute quality increments", "implement the test cases",
  "build the test artifacts", "run TC-XXX", "work the next quality
  increment", "start quality execution"
- The user is ready to authorize test-artifact creation

## When NOT to use

- The quality package has not been reviewed — run `review-quality-package` first
- The quality package was authored without the test-case-increment block —
  tests will be written inside `execute-increments` instead
- The user wants to create or amend the quality package — use
  `create-quality-package`
- The user wants to execute application implementation increments — use
  `execute-increments`
- Triaging failures from an existing run — use `review-test-failures`
- Auditing test coverage against the implementation plan — use
  `audit-quality-coverage`

## Inputs

| Input | Source | Required |
|---|---|---|
| Assembled quality package | `{paths.quality_package}/{feature-id}/{feature-id}-quality.md` (with GO from review) | Yes |
| Test-case plan overview | `{paths.quality_package}/<feature-id>/quality/plan/qe-plan-overview.md` | Yes |
| Per-increment files | `{paths.quality_package}/<feature-id>/quality/plan/TC-XXX.md` (scaffolding) and `{paths.quality_package}/<feature-id>/quality/plan/<category>/TC-XXX.md` (test cases) | Yes |
| Test-case status tracker | `{paths.quality_package}/<feature-id>/quality/plan/test-case-status.md` | Yes |
| Review readiness verdict | `{paths.quality_package}/<feature-id>/review/readiness-verdict.md` | Yes (must be GO or accepted CONDITIONAL GO) |
| Test-artifact target repo | `[project.testing].qe_repo` resolved through `[[project.repos]]`; fallback to the in-scope code repo when unset | Yes |
| `project.toml` | `{project-root}/project.toml` | Yes |
| Knowledge base (when present) | `{paths.knowledge_base_path}/` via `navigate-knowledge-base` | Recommended — grounds reuse cross-check on existing test utilities |

See `references/INPUTS-OUTPUTS.md` for the full table.

## Verification rule (always-on)

After every drafted artifact and before any file write, summarize back to
the user what you understood and what you produced; wait for their explicit
acknowledgement (or correction) before proceeding. This applies regardless
of which step you are on. Halt the step if the user disagrees.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode B, before Step 1. If `features.toml` is absent, skip feature resolution, but still map this skill's paths per that file's § *Not opted in* before reading or writing — they are spelled in the opted-in form. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` in select-only mode (`caller: execute-quality-increments`) rather than guessing which feature's TC-XXX increments to run — do not fall back to creating one, because TC-XXX increments come from a quality package that already exists. If it resolves, echo the feature ID before loading the first increment.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Execute one step at a time. Read each step file only when starting that
step. Do not pre-load all step files.

**Before Step 1:** Read the quality package overview, the test-case plan
overview, and the relevant section blocks for full context. Confirm the
review readiness verdict is GO or accepted CONDITIONAL GO. If not, halt and
route to `review-quality-package`.

**Target resolution rule:** Before writing any artifact, read `project.toml`.
If `[project.testing].qe_repo` is set, resolve it to the matching
`[[project.repos]].code` and use that repo as the default destination for
QE-owned executable test artifacts. If it is unset, use the current in-scope
code repo. If a TC-XXX file names a different target path, surface the
deviation and wait for explicit user confirmation before writing.

1. `steps/01-load-increment.md` — Load the next increment (scaffolding or
   test case), verify dependencies are completed, confirm prerequisites
2. `steps/02a-reuse-cross-check.md` — **AI Gate.** For every shareable
   artifact the increment will create or modify (utilities, fixtures,
   builders, page objects, assertion helpers, shared step-defs), run a
   KB-grounded lateral-thinking reuse pass: query
   `navigate-knowledge-base --profile=test-suite` (subkinds
   `shared-utilities` + `fixtures`), scan the test suite by behaviour
   (not name), and propose a disposition (`Reuse as-is` / `Extend in
   place` / `Wrap with adapter` / `Create new`). The user approves each
   disposition before Step 2 may write the artifact. The canonical
   checklist + AI-Gate prompt template + decision table live in
   `references/reuse-analysis.md`.
3. `steps/02-implement-artifacts.md` — Implement the artifacts in the
  resolved test-artifact target repo. Step 2a's per-artifact disposition drives **what
   gets written**: `Reuse as-is` adds an import (no new file);
   `Extend in place` adds additive behaviour to an existing file;
   `Wrap with adapter` writes a thin shim; `Create new` follows the
   plan exactly.
4. `steps/03-verify.md` — Verify the implementation: syntax, compilation,
   wiring, and (where possible) execution — with fresh evidence in the
   current turn
5. `steps/04-user-review.md` — Present the implemented artifacts for user
   acknowledgement
6. `steps/05-status-update.md` — Update `test-case-status.md` (per-TC
   status + per-artifact reuse dispositions in `Notes`) and
   `change-tracker.md` (one row per increment with a `Reuse`
   summary column — see `references/reuse-analysis.md` §6), then
   return to step 1 for the next increment

After an increment closes successfully, return to step 1 for the next
increment. Process scaffolding increments first (in dependency order), then
test-case increments (in dependency order within each category).

Stop when the user has reached the end of the plan or requests a checkpoint.

## Output

Per increment:
- Generated artifacts written to the resolved test-artifact target repo (build-file changes,
  runner classes, configuration files, feature files, step definitions,
  fixtures, exports — whatever the increment plan specifies)
- Updated `test-case-status.md` row (`not-started` → `in-progress` →
  `completed`)
- Updated `change-tracker.md` row recording the increment outcome and any
  approved deviations from plan
- Verification evidence captured in chat (fresh in the current turn)

## Next skill

After all increments in the test-case plan are completed, the quality
execution loop is complete. The user may then:

- Run the full test suite per the execution strategy documented in the
  quality package
- Invoke `audit-quality-coverage` to confirm no implementation increment
  was missed
- Invoke `review-test-failures` if the suite reports failures
- Proceed with or resume `execute-increments` for application code

## Common mistakes

- **Bundling multiple increments into one execution pass.** Execute one
  TC-XXX at a time. The increment is the unit of work.
- **Skipping scaffolding increments.** Scaffolding must be completed before
  any test-case increment depending on it. Don't jump to test cases.
- **Generating artifacts that don't match the plan.** Every file must trace
  to the increment's Artifact Plan section — correct path, correct content,
  correct framework conventions documented in the quality package.
- **Skipping the reuse cross-check.** Step 2a is an AI Gate — every
  shareable artifact needs an approved disposition before Step 2 may
  write. The KB query (`navigate-knowledge-base --profile=test-suite
  --profile-subkind=shared-utilities --profile-subkind=fixtures`) plus
  the behaviour-based codebase scan are both mandatory; see
  `references/reuse-analysis.md` for the checklist, AI-Gate prompt
  template, and decision table. Duplicating utilities is the largest
  single source of long-term test-suite rot.
- **Defaulting to `Create new`.** `Create new` is the only Step 2a
  disposition that grows the surface area; it must be argued for, not
  defaulted to. When in genuine doubt, propose `Extend in place` and
  let the user redirect (see `references/reuse-analysis.md` §3).
- **Writing artifacts without checking Step 2a's disposition record.**
  Step 2's §2b.0 matrix decides what gets written per artifact; the
  agent must apply it, not bypass it.
- **Forgetting to update `test-case-status.md`.** Status changes are the
  audit trail; missing updates create false impressions of progress.
- **Implementing without reading the quality package's automation and
  CI/CD block.** The artifacts must be compatible with the documented
  execution approach (runner config, tag conventions, profile names).
- **Claiming completion without fresh verification.** Every "done" claim
  must cite evidence from the current turn (compilation output, test-runner
  output, file existence check). Never use remembered or stale evidence.
- **Writing production code.** This skill writes test artifacts only. If
  the increment plan reveals a gap in production code, log it and route to
  `execute-increments` or `manage-bugs`.
- **Ignoring `[project.testing].qe_repo`.** When a QE repo is configured,
  it is the default destination for QE-owned artifacts. The code repo is
  only the default when no QE repo is configured or when the user approves
  a plan-specific deviation.
- **Hard-coding tool names into prompts to the user.** The quality package
  already pins the test framework, runner, and build tool — read those
  values rather than assuming.
- **Using "phase" terminology.** This skill uses "increment" as the unit
  of work, per framework vocabulary.

