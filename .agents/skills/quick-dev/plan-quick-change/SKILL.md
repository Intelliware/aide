---
name: plan-quick-change
description: "Use when a quick-dev spec has been agreed and the user says \"plan this\", \"create the quick plan\", \"plan the quick change\", \"break this into increments\", or wants to set up the lightweight implementation plan before coding. Authors a small set of increments (typically 1–3) using a reduced increment shape and runs a clarity gate before execution. Second of three quick-dev skills."
---

# Plan Quick Change

## Overview

Authors a lightweight implementation plan from an agreed quick-dev spec. The plan is a small set of increments — typically 1 to 3 — each conforming to a reduced increment shape (Identity, Goal, Plan, AC mapping, AI Gate, Human Gate, Success Criteria; the elaborate `Dependencies` and `Outcome` sections are inlined into Goal/Plan when the change is genuinely small). Includes a codebase-orientation read so the plan's file paths and patterns reflect the actual code, and an escape hatch if orientation reveals the change is too large.

Derived from the legacy `expedited-implementation-package`'s orient + plan steps. Anchors against `references/canonical-increment-shape.md` (the reduced version).

## When to use

- A quick-dev spec exists and is confirmed
- User says "plan this", "create the quick plan", "set up increments"
- Codebase is accessible — orientation requires reading affected files
- Change is still within quick-dev scope after orientation

## When NOT to use

- No quick-dev spec yet — invoke `document-quick-change` first
- Spec exists but has unresolved `[NEEDS CLARIFICATION]` markers — return to documenting
- Orientation reveals scope creep (>5–7 files, cross-module, new data model, new API endpoint) — apply the escape hatch and recommend the full pipeline
- A plan already exists — go straight to `execute-quick-change`

## Inputs

See `references/INPUTS-OUTPUTS.md`.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode B, before step 1. If `features.toml` is absent, skip feature resolution; the change is identified by its `<name>`. Either way, read and write paths follow that file's *Quick-dev layout*, not the § *Not opted in* table. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` in select-only mode (`caller: plan-quick-change`) rather than guessing which feature's spec to load — do not fall back to creating one, because the spec this skill plans against is written by `document-quick-change` first. If it resolves, confirm the spec in the requirements-stage quick-dev directory (`{paths.requirements_package}/<feature-id>/<feature-id>-quick-dev-spec.md` in legacy mode) matches the active feature before reading it.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

1. **Read the quick-dev spec** — load `{paths.requirements_package}/<feature-id>/<feature-id>-quick-dev-spec.md`, the path `quick-dev-spec.yaml` declares and `document-quick-change` writes (the `[stages.requirements]` SoD directory when that stage sets one). Confirm no markers remain and the user has confirmed it. Read §12.2a Solution Constraints alongside the FRs and ACs — the planner must respect them when shaping the increments.
2. **Codebase orientation** — read the affected files (the spec's "Where" / FR file references). Identify patterns, conventions, test infrastructure. See `steps/01-orient.md`.
3. **Escape-hatch check** — if orientation reveals the change is too large, halt and recommend the full elaborate pipeline. See `steps/02-escape-hatch.md`.
4. **Decompose into increments** — group ACs into 1–3 increments. Each increment must produce a working system state, be independently verifiable, and trace to one or more ACs. Cross-check that the proposed approach for each increment honors every §12.2a Solution Constraint — an increment whose plan would have to violate a constraint to ship is not a legal increment.
5. **Populate the reduced increment shape** — Identity (INC-XXX, name, AC mapping), Goal, Plan (file paths + steps), AI Gate (test commands + expected results), Human Gate (review steps), Success Criteria. See `steps/03-populate-shape.md`.
6. **Clarity gate** — no markers, all sections, file paths specified, AC mappings present, no speculative increments. If it fails, return to step 1 or 2.
7. **Write and confirm** — resolve the planning-stage directory per the precondition's *Quick-dev layout* (`[stages.planning]`, repo scope taken from where the spec sits — never asked), run its `write_role` check, then write to `{paths.implementation_package}/<feature-id>/<feature-id>-quick-dev-plan.md`. Get explicit user approval before handoff.

## Output

See `references/INPUTS-OUTPUTS.md`. A plan file with 1–3 increments per the reduced shape, plus a confirmed handoff to `execute-quick-change`.

## Next skill

`execute-quick-change`

## Common mistakes

- Planning before orientation — file paths and patterns end up wrong
- Skipping the escape hatch when the change is actually too large for quick-dev
- Producing too many increments — quick-dev should be 1–3; if more are needed, the change is probably full-pipeline material
- Speculative increments not traceable to ACs
- Filling `Dependencies` and `Outcome` for the sake of it on a one-increment plan
- Returning success while a `[NEEDS CLARIFICATION]` marker still exists in the plan
- Planning an increment whose intended approach violates a §12.2a Solution Constraint (the executor cannot rescue this with a Solution Pivot — constraints survive pivots)
