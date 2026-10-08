---
slug: discovery
sequence: 1
depends-on-prior: false
---

# Step 1 — Architecture-Baseline Discovery (brownfield only)

Run only when the active composition or `project.toml` indicates brownfield mode. Greenfield projects skip this step entirely; record an empty architecture baseline assumption in the solution overview and proceed to Step 2.

## Purpose

Build the architect's understanding of the existing system at the architectural level, scoped to the areas affected by the proposed change. Produces a single `architecture-baseline.md` that Step 2 design assembly consumes alongside the requirements package.

## Sequential execution rule

Read one reference at a time. Produce the artifact, present it, wait for acknowledgement, then read the next reference.

## Sub-steps (run in order)

| # | Sub-step | Output (under `{paths.design_package}/<feature-id>/discovery/`) |
|---|---|---|
| 0 | (workflow — no reference) | feature-folder resolution |
| 1 | `references/solution-discovery-workflow.md` § architecture-discovery | `raw-architectural-observations.md` |
| 2 | `references/solution-discovery-workflow.md` § technical-debt-assessment | `technical-debt-assessment.md` |
| 3 | `references/solution-discovery-workflow.md` § existing-architecture-assessment | `architecture-baseline.md` |

The full sequencing rationale, sub-step instructions, and output schemas live in `references/solution-discovery-workflow.md`. Read it just-in-time.

## Knowledge base integration

When `project.paths.knowledge_base_path` is set, query the KB via `knowledge-base/navigate-knowledge-base` before reading source repos directly. The KB encodes synthesized architecture; raw repos are the fallback when the KB is silent.

## Hard gates

- The architecture baseline must be written and acknowledged before Step 2 starts.
- If the requirements package has gaps that prevent scoping the codebase scan, raise them with the BSA directly — do not work around silently.

## Elicitation patterns referenced

- `references/elicitation-patterns/architecture-discovery.md`

## Exit criteria

- [ ] All three sub-step artifacts produced
- [ ] `architecture-baseline.md` written and acknowledged
- [ ] C4 Level 1 + Level 2 diagrams in the baseline reviewed by the user

## Acknowledgement checkpoint

Before proceeding to `steps/02-design.md`:

1. Summarize the architecture baseline, technical-debt assessment, and any constraints surfaced.
2. Ask: "Does the baseline match the architecture you want me to design against?"
3. Wait for explicit confirmation. Do not infer.
4. If the user requests changes, revise the affected discovery artifact(s) and repeat the summary.

## Next

Proceed to `steps/02-design.md`.
