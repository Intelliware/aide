---
slug: discovery
sequence: 1
depends-on-prior: false
---

# Step 1 — Discovery (brownfield only)

Run only when the active composition or `project.toml` indicates brownfield mode (`project.default_flow = "brownfield"` or the composition is `brownfield-enhancement-spec.yaml`). Greenfield projects skip this step entirely and start at the relevance gate.

## Purpose

Build a current-capability baseline of the existing system, scoped to the proposed change and the areas adjacent to it. The AI reads the system and the knowledge base first so every elicitation question to the user is about gaps and decisions, not about explaining what the system already shows.

## Sequential execution rule

Read one reference at a time. Produce the artifact, present it, wait for user acknowledgement, then read the next reference.

## Sub-steps (run in order)

| Step | Reference | Output (under `docs/<feature>/requirements-package/discovery/`) |
|---|---|---|
| 0 | (workflow — no reference) | `change-description.md` (who/what/why; hard gate before Step 1) |
| 1 | `references/discovery-workflow.md` § codebase-discovery | `codebase-discovery.md` |
| 2 | `references/discovery-workflow.md` § existing-artifact-review | `existing-artifact-review.md` |
| 3 | `references/discovery-workflow.md` § process-mapping | `process-map.md` |
| 4 | `references/discovery-workflow.md` § user-journey-mapping | `user-journey-map.md` |
| 5 | `references/discovery-workflow.md` § requirements-elicitation | `requirements-elicitation.md` |
| 6 | `references/discovery-workflow.md` § current-capability-synthesis | `current-capability-baseline.md` |

The full sequencing rationale, sub-step instructions, and elicitation rules live in `references/discovery-workflow.md`. Read it just-in-time — do not pre-read.

When a knowledge base exists at `project.paths.knowledge_base_path`, prefer querying it via `knowledge-base/navigate-knowledge-base` before reading source repos directly. The KB encodes synthesized truth; raw repos are the fallback when the KB is silent.

## Hard gates

- Step 0 must produce a confirmed change description (who/what/why all stated) before any other sub-step runs.
- The change-description file must be written to disk before Step 1 starts.
- Discovery is complete only when `current-capability-baseline.md` is written and the user acknowledges it.

## Elicitation patterns referenced

- `references/elicitation-patterns/stakeholder-discovery.md`
- `references/elicitation-patterns/business-objectives.md`
- `references/elicitation-patterns/functional-requirements-discovery.md`

(These files do not exist yet — referenced by path so the runner knows where to load them when authored.)

## Exit criteria

- [ ] `change-description.md` written and acknowledged
- [ ] All six sub-step artifacts produced (or minimally recorded with the gap explicit)
- [ ] `current-capability-baseline.md` written and acknowledged

## Next

Proceed to the relevance gate (implicit step 2 in the SKILL.md workflow), then `steps/03-analysis.md`.
