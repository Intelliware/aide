# Solution Discovery Workflow

Folded from `model-2-sdlc-skills/solution-package/solution-discovery/references/solution-discovery-workflow.md`. Run as Step 1 of `create-design-package` (brownfield mode only).

## Purpose

Define the entry-point sequence for a brownfield project from the architect's perspective: what to do first when receiving the requirements package for "add feature X to existing app Y." Sequences three sub-steps: architecture-discovery (read the codebase at the architectural level — component topology, framework conventions, deployment manifests, data-layer architecture, integration patterns, security boundaries), technical-debt-assessment (categorize debt as must-fix / should-fix / defer relative to the feature), and existing-architecture-assessment (synthesize all discovery outputs into a single `architecture-baseline.md`). Ensures the architect understands the existing system's architectural reality before designing changes to it; prevents the failure mode where design decisions are made against an idealized or assumed architecture rather than the actual one.

The discovery phase produces the `architecture-baseline.md` document, which is the single discovery input the design phase consumes alongside the BSA's requirements package. Requirements clarification, if needed, happens outside this flow — the architect raises gaps with the BSA directly. Not needed for greenfield projects, where there is no existing architecture to discover; greenfield records an empty baseline assumption and proceeds directly to Step 2.

## Sequential execution rule

Execute one sub-step at a time. Read the corresponding reference only when about to execute. After each sub-step:
1. Produce the output artifact in full.
2. Present to the user.
3. Wait for acknowledgement.

Do not:
- Pre-read all reference files.
- Skip a sub-step because a previous sub-step seemed to cover it.
- Run sub-steps in parallel.

## Sub-step 0 — Resolve feature folder

1. The feature folder is the **registry's feature ID**, already resolved by this skill's active-feature precondition (`references/ai-principles/feature-precondition.md`). Read it; do not infer one, and do not put the folder name to the user as a question — the requirements package this design implements already sits under that folder, so re-negotiating the name here is how a design ends up filed away from its own requirements.
2. **Not opted in** (no `features.toml`): fall back to the prior behaviour — check for an existing `docs/*/requirements-package/` and reuse that feature folder if present, else infer a kebab-case name from the change description / executive summary and confirm it with the user.
3. Create `{paths.design_package}/<feature-id>/discovery/` if absent — resolving it through the precondition's *Resolving the stage feature directory* order, whose legacy-tree check halts to ask when this feature's work already sits in a pre-2.7.0 `docs/` working tree. Not opted in: create `solutions-package/discovery/` under the feature's `docs/` folder instead.

## The sequence

| # | Sub-step | Output (under `{paths.design_package}/<feature-id>/discovery/`) |
|---|---|---|
| 1 | architecture-discovery | `raw-architectural-observations.md` (component topology, framework conventions, deployment manifests, data layer, integration patterns, security boundaries) |
| 2 | technical-debt-assessment | `technical-debt-assessment.md` (must-fix / should-fix / defer per type: code, architecture, infrastructure, test, documentation) |
| 3 | existing-architecture-assessment | `architecture-baseline.md` (single synthesized doc — sole discovery input to design) |

## Why this order

- **Sub-step 1 first.** Technical debt can only be assessed relative to the areas the change will touch. Architecture discovery identifies the component topology and integration points — that tells the debt assessment where to look. Running debt assessment first would require scanning the entire codebase instead of the affected areas.
- **Sub-step 2 before synthesis.** The baseline must include debt categorization so the design phase knows which debt blocks the feature, which the feature will worsen, and which is unrelated.
- **Sub-step 3 last.** Synthesis merges raw observations, debt categorization, and relevant requirements-package sections into a single coherent baseline.

## Knowledge base integration

When `project.paths.knowledge_base_path` is set, query the KB via `knowledge-base/navigate-knowledge-base` before reading source repos directly. The KB encodes synthesized architecture; raw repos are the fallback when the KB is silent. Cross-check `last_verified_against_commit` against `staleness_warning_days` (`framework.toml`); if stale, supplement the KB read with direct codebase reading and flag the gap.

## Hard gates

- The architecture baseline must be written and acknowledged before Step 2 (design assembly) starts.
- If the requirements package has gaps that prevent scoping the codebase scan, raise them with the BSA directly — do not work around them silently.

## Exit criteria

- [ ] All three sub-step artifacts produced
- [ ] `architecture-baseline.md` written and acknowledged
- [ ] User has reviewed the C4 Level 1 + Level 2 diagrams in the baseline

## Phase handoff

After `architecture-baseline.md` is acknowledged, return to `SKILL.md` and proceed to `steps/02-design.md`.
