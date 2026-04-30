---
name: create-requirements-package
description: "Use when the user asks to create, gather, build, write, or assemble a requirements package; says 'create requirements', 'gather requirements', 'document business requirements', 'start the requirements stage', 'write functional requirements', 'build the requirements package', or wants to begin a new feature/project from a clean slate. Drives the full requirements stage end-to-end: discovery (brownfield), analysis, writing, and assembly into the requirements package — handing off to review-requirements-package."
---

# Create Requirements Package

## Overview

Drives the requirements stage end-to-end: optional brownfield discovery, analysis of scope/dependencies/impacts/risks, structured writing of all 14 requirements sections, and assembly into a single `requirements-package.md` that becomes the stable business foundation for design and implementation. The skill is composition-aware — it resolves blocks against `templates/compositions/greenfield-requirements-package.yaml` (or `brownfield-enhancement-spec.yaml` / `quick-dev-spec.yaml` depending on the project's flow).

The work is sequenced through five phases: discovery (Step 1, brownfield only), relevance gating (Step 2 — implicit, decides which of the 14 sections apply), analysis (Step 3), writing (Step 4), and review-handoff prep (Step 5). Each step has its own file under `steps/` and a deeper workflow reference under `references/`. The skill never fails because an upstream phase was skipped — Steps 1 and 3 are conditional on the project flow and on the entry path the user chose.

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

## Workflow

Sequenced phases. Run one step at a time. Do not pre-load every reference.

1. `steps/01-discovery.md` — brownfield discovery; produce `current-capability-baseline.md`. Skipped when the active composition is `greenfield-requirements-package.yaml`.
2. **Relevance gate (implicit)** — after discovery (or directly after Step 0 in greenfield), review the 14 section blocks defined in the active composition's `blocks:` list, run the File Relevance Recommendation against gathered context, and mark each as Fill / Skip / N/A in the completeness tracker. Re-evaluate per-section during Step 4 using the Section Relevance Check (Step 0 of the 7-Step Workflow). User confirms or overrides.
3. `steps/03-analysis.md` — scope, stakeholders, dependencies, impacts, constraints, gaps, assumptions, decisions, risks. Risk register must be complete before writing.
4. `steps/04-writing.md` — fill the 14 section blocks per the active composition, applying the 7-Step per-file Workflow (relevance check, scope, draft, verify, traceability, refine, mark complete). Maintain the completeness tracker.
5. **Assembly + review handoff** — assemble `requirements-package.md`, log the change tracker, hand off by name to `review-requirements-package`.

Use elicitation prompts referenced from the active composition (`references/elicitation-patterns/<pattern>.md`) at every step that requires user input.

## Output

| Artifact | Path | Format |
|---|---|---|
| Assembled requirements package | `{paths.requirements_path}/{feature-id}-requirements.md` | Markdown (composed per `templates/compositions/greenfield-requirements-package.yaml`) |
| Per-section files (when sharded) | `docs/<feature>/requirements-package/requirements/*.md` | Markdown (one block per file) |
| Discovery artifacts (brownfield) | `docs/<feature>/requirements-package/discovery/*.md` | Markdown |
| Analysis artifacts | `docs/<feature>/requirements-package/analysis/*.md` | Markdown |
| Change tracker | `docs/<feature>/requirements-package/requirements/change-tracker.md` | Markdown table |
| Completeness tracker | `docs/<feature>/requirements-package/requirements/completeness-tracker.md` | Markdown table |

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
