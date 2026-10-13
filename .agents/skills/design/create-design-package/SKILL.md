---
name: create-design-package
description: "Use when the user asks to create, build, write, or assemble a design package; says 'create the design package', 'design the solution', 'build the technical blueprint', 'create the architecture', 'how should we build this', 'start the design stage', 'choose the technology stack', 'design the API/database/frontend/backend'. Drives the full design stage: optional architecture-baseline discovery (brownfield), 11-step design assembly with C4 diagrams, technology pinning, traceability back to requirements — handing off to review-design-package."
---

# Create Design Package

## Overview

Drives the design stage end-to-end: optional brownfield architecture-baseline discovery (Step 1), then assembly of the 11-step design package (Step 2) covering solution overview, technology stack, frontend/backend/API/database designs, security, integration, deployment, observability, testing strategy, and technical NFRs. Composition-aware — resolves blocks against `templates/compositions/greenfield-design-package.yaml` (or the brownfield-enhancement-spec for combined req+design+plan single-doc flows). Renamed from `create-solution-design-package` per `_archive/skill-disposition.md` row 5; the "solution-" prefix is dropped to match the new stage name "design".

The skill is the primary lift target for greenfield-elaborate design and folds in two model-2 sub-phase skills (solution-discovery and solution-design) — that DNA now lives as steps + references inside this single skill, supporting multiple entry paths: discovery-first, design-only (skip discovery), and design-update (after requirements changed).

## When to use

- An approved requirements package exists and the user wants the technical blueprint
- User says: "create the design package", "design the solution", "build the technical blueprint", "create the architecture", "design the API", "design the database", "choose the tech stack", "start the design stage"
- Updating an existing design after the requirements change tracker recorded amendments
- Brownfield enhancement that needs an architecture baseline before design

## When NOT to use

- The design package is already assembled and the user only wants validation → `review-design-package`
- The user is still gathering requirements → `create-requirements-package`
- The user wants to plan implementation → `create-implementation-package`
- The change is trivial → `quick-dev/document-quick-change` (combined doc)

## Inputs

See `references/INPUTS-OUTPUTS.md` for the full table. Required:
- Approved `requirements-package.md` and its `change-tracker.md`
- `project.toml` (for flow detection, paths, repo list, elicitation answers)
- Active composition YAML (`greenfield-design-package.yaml` or `brownfield-enhancement-spec.yaml`)
- Knowledge base (when present and brownfield) — accessed via `knowledge-base/navigate-knowledge-base`

## Verification rule (always-on)

After every drafted artifact and before any file write, summarize back to the user what you understood and what you produced; wait for their explicit acknowledgement (or correction) before proceeding. This applies regardless of which step you are on. Halt the step if the user disagrees.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode A, before the write-discipline preconditions below. If `features.toml` is absent, skip feature resolution, but still map this skill's paths per that file's § *Not opted in* before reading or writing — they are spelled in the opted-in form. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` (`caller: create-design-package`) rather than inventing a feature ID from the request. If it resolves, echo the feature ID and the resolved output directory before Step 0.

## Preconditions (MUST run before any step)

Before executing Step 0 — and before any discovery, design assembly, or handoff work — the AI MUST:

1. **Read and apply** `<AIDE root>/references/ai-principles/write-discipline.md`. "AIDE root" is the folder containing the framework `AGENTS.md` and the `.agents/` directory (typically `./AIDE/` in the user's workspace). The path is **not** skill-local — do not look for it under this skill's own `references/`.
2. **Present the three mandatory user prompts** documented in that file: (a) acknowledgement mode (Interactive / One-pass), (b) output structure (Full structure / Combined), (c) confirmation of the write-on-acknowledge invariant.
3. **Record the user's choices.** They govern every subsequent step.
4. **Do not proceed to Step 0** until the user has explicitly confirmed.

This is a hard precondition, not a style note. The `review-design-package` skill treats missing per-block files (the failure mode the contract prevents) as a finding.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Sequenced phases. Run one step at a time. Do not pre-load every reference. The preconditions above MUST already be satisfied before Step 0 starts.

0. `steps/00-scope-target-repo.md` — (SoD only) inherit the artifact's host repo and `affects_repos` from the upstream requirements artifact. No-op when the design stage is in legacy mode.
1. `steps/01-discovery.md` — **MANDATORY for brownfield flows.** Architecture-discovery → technical-debt-assessment → existing-architecture-assessment, producing `architecture-baseline.md`. Skipped for greenfield only (record empty baseline assumption). Do NOT skip this step in brownfield mode — the architecture baseline is a prerequisite for design assembly.
2. `steps/02-design.md` — scoping (which of the 14+ design blocks apply), then the 11-step design assembly with the 7-Step per-file Workflow, producing block files and assembling `{paths.design_package}/{feature-id}/{feature-id}-design.md` (plus the `solution-package.md` alias only when the project has not opted in — see `references/ai-principles/feature-precondition.md` § Not opted in).
3. **Assembly + review handoff** — final cross-reference pass (API contracts vs frontend/backend, database vs data requirements), update change tracker, hand off by name to `review-design-package`.

The deeper how-to lives in `references/process.md`, `references/solution-discovery-workflow.md`, `references/solution-design-workflow.md`, and `references/c4-diagrams.md`.

## Output

| Artifact | Path | Format |
|---|---|---|
| Assembled design package | path resolved per stage mode (SoD: `<host-repo>/<artifact_subdir>/design/<repo-code-or-_cross-cutting>/<feature-id>/<feature-id>-design.md`; legacy: `{paths.design_package}/{feature-id}/{feature-id}-design.md`) | Markdown (composed per `templates/compositions/greenfield-design-package.yaml`) |
| Per-section block files | `{paths.design_package}/<feature-id>/design/*.md` | Markdown (one block per file) |
| Architecture-baseline (brownfield) | `{paths.design_package}/<feature-id>/discovery/architecture-baseline.md` | Markdown |
| ADR files (one per significant decision) | `{paths.knowledge_base_path}/adr/<id>.md` (or `{paths.design_package}/<feature-id>/design/adr/<id>.md` if KB absent) | Markdown — ADR template from `templates/blocks/knowledge-base/adr-template.md` |
| Change tracker continuation | `{paths.design_package}/<feature-id>/design/change-tracker.md` | Markdown table |
| Design package alias (not opted in only) | `solution-package.md` in the `docs/` working tree | Markdown — pass-through to the assembled design package. Not written on an opted-in project, where the working tree and the assembled artifact share one directory |

## Next skill
review-design-package

## Common mistakes

- Reading every reference upfront. Read `steps/<n>.md` only when about to execute that step; read `references/<workflow>.md` only when the step says to.
- **Skipping discovery (Step 1) in brownfield mode.** The architecture baseline is mandatory for brownfield flows. Without it, design decisions are ungrounded — the agent may propose solutions that conflict with the existing architecture, miss integration constraints, or duplicate existing patterns. Only greenfield projects skip discovery.
- Skipping the scoping step in `steps/02-design.md`. Not every project needs every block — backend-only changes skip `design/frontend-design`; no-integration features skip `design/integration-design`.
- Pinning "latest" as a version. Every framework, language, and database must have an explicit, pinned version.
- API designs that omit error responses. Every endpoint must specify success and error contracts.
- Design decisions that do not trace back to a requirement. If it does not trace, either the requirement is missing (return to `create-requirements-package`) or the design is speculative (drop it).
- Using "Phase 1/2/3/4" headings internally. Use "Step N" — `phase` is reserved for stage shape, `increment` for implementation chunks.
- Forgetting to consult the requirements `change-tracker.md` when a design refresh is triggered. Compare recorded package version vs current; update only affected sections.
- Letting C4 diagrams drift from the technology stack. Every C4 element must reference the same pinned version that appears in `design/technology-stack`.
- Handing off to planning without running `review-design-package`.
