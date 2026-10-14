---
name: create-requirements-package
description: "Use when the user asks to create, gather, build, write, or assemble a requirements package; says 'create requirements', 'gather requirements', 'document business requirements', 'start the requirements stage', 'write functional requirements', 'build the requirements package', or wants to begin a new feature/project from a clean slate. Drives the full requirements stage end-to-end: discovery (brownfield), analysis, writing, and assembly into the requirements package — handing off to review-requirements-package."
---

# Create Requirements Package

## Overview

Drives the requirements stage end-to-end: optional brownfield discovery, analysis of scope/dependencies/impacts/risks, structured writing of all 14 requirements sections, and assembly into a single `requirements-package.md` that becomes the stable business foundation for design and implementation. The skill is composition-aware — it resolves blocks against `templates/compositions/greenfield-requirements-package.yaml` (or `brownfield-enhancement-spec.yaml` / `quick-dev-spec.yaml` depending on the project's flow).

The work is sequenced through five phases: discovery (Step 1, brownfield or when `force_discovery = true`), relevance gating (Step 2 — implicit, decides which of the 14 sections apply), analysis (Step 3), writing (Step 4), and review-handoff prep (Step 5). Each step has its own file under `steps/` and a deeper workflow reference under `references/`. The skill never fails because an upstream phase was skipped — Steps 1 and 3 are conditional on the project flow and on the entry path the user chose.

## When to use

- The user is starting a new feature or project and needs requirements before design
- An existing requirements package needs to be re-baselined or extended
- The user explicitly invokes any of the trigger phrases (see frontmatter)
- The user wants to enter at writing only (skip discovery+analysis) — supported via `steps/04-writing.md`
- The user wants discovery only as a current-state baseline — supported via `steps/01-discovery.md`

## When NOT to use

- The package is already assembled and the user only wants validation → use `review-requirements-package`
- The user wants a tiny change, not a full requirements package → use `quick-dev/document-quick-change`
- The user wants to design or plan implementation → use `create-design-package` or `create-implementation-package`
- The user wants to extract documentation from an existing repo → use a `reverse-engineering/reverse-engineer-*` skill

## Inputs

See `references/INPUTS-OUTPUTS.md` for the full table. Required:
- A confirmed feature description (who/what/why) — captured in Step 0 of `steps/01-discovery.md` for brownfield, or in Step 0 of `steps/04-writing.md` for greenfield/standalone
- `project.toml` (for flow detection, paths, glossary, elicitation answers)
- The composition YAML for the active flow (greenfield/brownfield/quick-dev)
- Knowledge base (when present and the flow is brownfield) — consulted via `knowledge-base/navigate-knowledge-base`

## Verification rule (always-on)

After every drafted artifact and before any file write, summarize back to the user what you understood and what you produced; wait for their explicit acknowledgement (or correction) before proceeding. This applies regardless of which step you are on. Halt the step if the user disagrees.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode A, before the write-discipline preconditions below. If `features.toml` is absent, skip feature resolution, but still map this skill's paths per that file's § *Not opted in* before reading or writing — they are spelled in the opted-in form. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` (`caller: create-requirements-package`) rather than inventing a feature ID from the request. If it resolves, echo the feature ID and the resolved output directory before Step 0.

## Preconditions (MUST run before any step)

Before executing Step 0 — and before any discovery, analysis, writing, or assembly work — the AI MUST:

1. **Read and apply** `<AIDE root>/references/ai-principles/write-discipline.md`. "AIDE root" is the folder containing the framework `AGENTS.md` and the `.agents/` directory (typically `./AIDE/` in the user's workspace). The path is **not** skill-local — do not look for it under this skill's own `references/`.
2. **Present the three mandatory user prompts** documented in that file: (a) acknowledgement mode (Interactive / One-pass), (b) output structure (Full structure / Combined), (c) confirmation of the write-on-acknowledge invariant.
3. **Record the user's choices.** They govern every subsequent step.
4. **Do not proceed to Step 0** until the user has explicitly confirmed.

This is a hard precondition, not a style note. The `review-requirements-package` skill treats missing per-section files (the failure mode the contract prevents) as a finding.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Sequenced phases. Run one step at a time. Do not pre-load every reference. The preconditions above MUST already be satisfied before Step 0 starts.

0. `steps/00-scope-target-repo.md` — (SoD only) determine the artifact's host repo and, for cross-cutting features, capture `affects_repos`. No-op when the requirements stage is in legacy mode.
1. `steps/01-discovery.md` — discovery; produce `current-capability-baseline.md`. Runs when brownfield mode is active OR when `force_discovery = true` is set in the skill customization. Skipped only when neither condition is met. Optional **source adapter**: if `discovery_source` is set in this skill's customization, discovery's change-description intake is seeded from an add-on (e.g. a Confluence page) — see `references/orientation/source-adapters.md`.
2. **Relevance gate (implicit)** — after discovery (or directly after Step 0 in greenfield), review the 14 section blocks defined in the active composition's `blocks:` list, run the File Relevance Recommendation against gathered context, and mark each as Fill / Skip / N/A in the completeness tracker. Re-evaluate per-section during Step 4 using the Section Relevance Check (Step 0 of the 7-Step Workflow). User confirms or overrides.
3. `steps/03-analysis.md` — scope, stakeholders, dependencies, impacts, constraints, gaps, assumptions, decisions, risks. Risk register must be complete before writing.
4. `steps/04-writing.md` — fill the 14 section blocks per the active composition, applying the 7-Step per-file Workflow (relevance check, scope, draft, verify, traceability, refine, mark complete). Maintain the completeness tracker.
5. **Assembly + review handoff** — assemble `requirements-package.md`, log the change tracker, hand off by name to `review-requirements-package`.

Use elicitation prompts referenced from the active composition (`references/elicitation-patterns/<pattern>.md`) at every step that requires user input.

## Output

| Artifact | Path | Format |
|---|---|---|
| Assembled requirements package | path resolved per stage mode (SoD: `<host-repo>/<artifact_subdir>/requirements/<repo-code-or-_cross-cutting>/<feature-id>/<feature-id>-requirements.md`; legacy: `{paths.requirements_package}/{feature-id}/{feature-id}-requirements.md`) | Markdown (composed per `templates/compositions/greenfield-requirements-package.yaml`) |
| Per-section files (when sharded) | `{paths.requirements_package}/<feature-id>/requirements/*.md` | Markdown (one block per file) |
| Discovery artifacts (brownfield) | `{paths.requirements_package}/<feature-id>/discovery/*.md` | Markdown |
| Analysis artifacts | `{paths.requirements_package}/<feature-id>/analysis/*.md` | Markdown |
| Change tracker | `{paths.requirements_package}/<feature-id>/requirements/change-tracker.md` | Markdown table |
| Completeness tracker | `{paths.requirements_package}/<feature-id>/requirements/completeness-tracker.md` | Markdown table |

Not opted in (no `features.toml`): the assembled package drops the `<feature-id>/` segment and is also written as the `requirements-package.md` alias, and every working-tree path above moves from `{paths.requirements_package}/<feature-id>/` to `docs/<name>/requirements-package/` — see `references/ai-principles/feature-precondition.md` § *Not opted in*.

## Next skill
review-requirements-package

## Common mistakes

- Reading every reference file upfront. Read `steps/<n>.md` only when about to execute that step; read `references/<workflow>.md` only when the step says to.
- Skipping the relevance gate and filling all 14 sections regardless. The composition's `decision-gates` block declares which sections apply for the active flow — honor them.
- Letting UI details into the requirements package. UI specifics belong in `create-design-package`. Requirements stay stable; design is changeable.
- Forgetting the 7-Step per-file Workflow for each section. See `references/process.md`.
- Using "Phase 1/2/3/4" headings internally — the framework reserves "phase" for the stage's macro shape and "increment" for the implementation chunk. Use "Step N" inside the workflow.
- Failing to initialize the change tracker at the start of Step 4. The tracker is a cross-cutting artifact every skill writes to.
- Treating discovery output as authoritative when discovery did not run — every system claim must be flagged as an assumption.
- Handing off to design without running `review-requirements-package` first.
