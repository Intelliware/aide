---
name: create-implementation-package
description: "Use when the user asks to create an implementation plan, set up coding increments, build the implementation package, decompose a design into INC-XXX increments, start the planning stage, or break a solution design into independently executable units. Produces an implementation package whose increments conform to the Canonical Increment Shape."
---

# Create Implementation Package

Decompose an approved Solution Design Package into a sequence of independently
executable increments (INC-XXX), each conforming to the **Canonical Increment
Shape** — the 8-section structure that guarantees every increment is verifiable,
traceable to functional requirements, and gated by both AI and human checks.

## Overview

The implementation package is the bridge from design to working software. It
transforms architectural intent into a sequence of increments that:

- **Map to FRs** — every increment lists the Functional Requirements it implements
- **Are independently executable** — another agent or developer can pick up any
  increment and execute it without further context
- **Are verifiable** — each increment defines an automated gate (mechanics) and a
  human gate (intent) before it is considered done
- **Compose into a delivery sequence** — dependencies between increments are
  explicit, so the package describes both the units and the order

The 8-section Canonical Increment Shape is the load-bearing artifact of this
skill. It is extracted as 8 reusable blocks under
`templates/blocks/planning/`, and this skill assembles them via the composition
at `templates/compositions/greenfield-implementation-package.yaml`.

## When to use

- The user says "create the implementation plan", "build the implementation
  package", "break this into increments", "set up the coding increments", or
  "start planning the build"
- A Solution Design Package has been produced and approved
- A Requirements Package exists (for FR mapping)
- The next stage will be execution by AI agents or developers

## When NOT to use

- The Solution Design Package does not exist or has not been approved → run the
  design stage first
- The work is small enough to ship as a single unit → use `quick-dev/plan-quick-change`
- The user is asking to validate an already-written implementation package →
  use `review-implementation-package`
- The user wants to execute an existing increment → use `execute-increments`

## Inputs

| Input | Source | Required |
|---|---|---|
| Solution Design Package | path resolved from `project.toml` | Yes |
| Requirements Package | path resolved from `project.toml` | Yes (for FR mapping) |
| Canonical Increment Shape blocks | `templates/blocks/planning/*.md` | Yes |
| Composition spec | `templates/compositions/greenfield-implementation-package.yaml` | Yes |
| Codebase access (brownfield only) | local repo | Conditional — required for codebase analysis |

See `references/INPUTS-OUTPUTS.md` for the full inputs/outputs tables.

## Verification rule (always-on)

After every drafted artifact and before any file write, summarize back to the user what you understood and what you produced; wait for their explicit acknowledgement (or correction) before proceeding. This applies regardless of which step you are on. Halt the step if the user disagrees.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode A, before the write-discipline preconditions below. If `features.toml` is absent, skip feature resolution, but still map this skill's paths per that file's § *Not opted in* before reading or writing — they are spelled in the opted-in form. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` (`caller: create-implementation-package`) rather than inventing a feature ID from the request. If it resolves, echo the feature ID and the resolved output directory before Step 0.

## Preconditions (MUST run before any step)

Before executing Step 0 — and before any codebase analysis, increment decomposition, or authoring work — the AI MUST:

1. **Read and apply** `<AIDE root>/references/ai-principles/write-discipline.md`. "AIDE root" is the folder containing the framework `AGENTS.md` and the `.agents/` directory (typically `./AIDE/` in the user's workspace). The path is **not** skill-local — do not look for it under this skill's own `references/`.
2. **Present the three mandatory user prompts** documented in that file: (a) acknowledgement mode (Interactive / One-pass), (b) output structure (Full structure / Combined), (c) confirmation of the write-on-acknowledge invariant.
3. **Record the user's choices.** They govern every subsequent step.
4. **Do not proceed to Step 0** until the user has explicitly confirmed.

This is a hard precondition, not a style note. The `review-implementation-package` skill treats missing per-increment files (the failure mode the contract prevents) as a finding.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Execute one step at a time. Read each step file only when starting that step. The preconditions above MUST already be satisfied before Step 0 starts.

0. **Scope the target source repo** (SoD only) — `steps/scope-target-repo.md`. No-op when the planning stage is in legacy mode.
1. **Codebase analysis** (brownfield only) — `steps/codebase-analysis.md`
2. **Test planning** — `steps/test-planning.md`
3. **Increment decomposition** — propose INC-XXX list and dependencies, get approval
4. **Write each increment** — for each INC-XXX, fill all 8 blocks of the Canonical Increment Shape
5. **Support documents** — generate `bugs-and-issues-log.md`, `change-tracker.md`, `increment-status.md`
6. **Plan-readiness review** — `steps/plan-readiness-review.md` (GO / NO-GO gate)

For the per-increment authoring loop, see
`references/canonical-increment-shape.md` and the 8 planning blocks at
`templates/blocks/planning/`.

## Output

An implementation package at the path resolved for the planning stage. Resolution depends on stage mode (set in `project.toml` `[stages.planning]`):

- **Colocate mode** (`colocate_with_source = true`): `<source-repo-path>/<artifact_subdir>/implementation/<feature-id>/`
- **Directory mode** (`dir = "..."`): `<host-repo>/<artifact_subdir>/implementation/<repo-code>/<feature-id>/`
- **Legacy mode** (no SoD fields): `{project.paths.implementation_package}/{feature-id}/`

In each case the package contains:

- One file per increment named `INC-XXX.md` (composed via
  `greenfield-implementation-package.yaml`)
- `increment-status.md` — status tracker (states: not-started, in-progress, completed, blocked, on-hold)
- `bugs-and-issues-log.md` — initialized empty bug log
- `change-tracker.md` — initialized change log
- `implementation-package.md` — overview that lists all increments and their dependencies

Every increment file contains all 8 sections of the Canonical Increment Shape
in order: Increment Identity, Goal, Dependencies, Plan, Outcome, Automated
Verification (AI Gate), Human Verification (Human Gate), Success Criteria.

## Next skill
review-implementation-package

## Common mistakes

- **Mixing scopes in one increment** — every increment must have a single, cohesive purpose. If you find yourself writing "and also..." in the Goal, split it.
- **Skipping FR mapping** — every increment must list the FRs it implements, or state `FR Mapping: None (foundational)` for infrastructure-only increments.
- **Vague AI Gates** — "tests pass" is not a gate. List specific test commands, names, or assertions with expected results.
- **Plans as explanations** — Plan items must be imperative instructions ("Create X", "Configure Y"), not narratives ("Authentication is implemented using...").
- **Implicit dependencies** — every cross-increment dependency must appear in the Dependencies section by INC ID.
- **Renaming "phase" inconsistently** — this skill uses "increment" everywhere as the chunk-level unit. The word "phase" is reserved for SDLC stages (planning phase, execution phase) and for "deployment phase" in ops contexts.
- **Authoring the shape inline** — do not duplicate the 8-section spec in increment files. Reference the blocks under `templates/blocks/planning/` so the shape stays single-sourced.
