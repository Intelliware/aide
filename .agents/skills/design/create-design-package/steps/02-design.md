---
slug: design
sequence: 2
depends-on-prior: false
---

# Step 2 — Design Assembly

Fill every block declared by the active composition (gated blocks honored), applying the 7-Step per-file Workflow to each. Assemble into `{paths.design_package}/{feature-id}/{feature-id}-design.md` at the end. Every per-section output file below is written to `{paths.design_package}/<feature-id>/design/` (the stage feature directory — see `references/ai-principles/feature-precondition.md`; when not opted in, `solutions-package/design/` under the feature's `docs/` folder). Never write these files to the current working directory or the project root.

## Purpose

Convert the requirements package and (when present) the architecture baseline into the structured, traceable, version-pinned design package. Maintain the design change tracker across every write. Produce a package that `review-design-package` can validate and that `create-implementation-package` can decompose into increments.

## Entry paths supported

This step can be entered:
- After Step 1 (with architecture baseline) — standard brownfield path. **This is the only valid brownfield entry.**
- Without Step 1 (greenfield only) — record empty/assumed baseline and proceed.
- After requirements changed — use the requirements `change-tracker.md` to scope updates only to affected sections (per the Requirements Version Tracking protocol in `references/solution-design-workflow.md`).

**Brownfield guard:** If `project.toml` declares brownfield flow and `architecture-baseline.md` does not exist, STOP. Return to `steps/01-discovery.md` and complete it before proceeding. Do not silently assume an empty baseline in brownfield mode — that defeats the purpose of grounding the design in the existing architecture.

## Sub-steps (run in order)

| # | Sub-step | Block | Output |
|---|---|---|---|
| 0 | scoping | (no block — operates on composition) | scoping-result.md (records which gated blocks are IN/OUT for this feature) |
| 1 | solution-overview | `design/solution-overview` | `01-solution-overview.md` |
| 2 | technology-stack | `design/technology-stack` | `02-technology-stack.md` (pinned versions) |
| 3 | solution-architecture | `design/solution-architecture` | `03-solution-architecture.md` |
| 4 | frontend-design (gated) | `design/frontend-design` | `04-frontend-design.md` |
| 5 | backend-design (gated) | `design/backend-design` | `05-backend-design.md` |
| 6 | api-design (gated) | `design/api-design` | `06-api-design.md` |
| 7 | database-design (gated) | `design/database-design` | `07-database-design.md` |
| 8 | security-design | `design/security-design` | `08-security-design.md` |
| 9 | integration-design (gated) | `design/integration-design` | `09-integration-design.md` |
| 10 | workflow-business-rules-design (gated) | `design/workflow-business-rules-design` | `10-workflow-business-rules-design.md` |
| 11 | ux-design (gated) | `design/ux-design` | `11-ux-design.md` |
| 12 | deployment-devops | `design/deployment-devops` | `12-deployment-devops.md` |
| 13 | observability-operations | `design/observability-operations` | `13-observability-operations.md` |
| 14 | testing-strategy | `design/testing-strategy` | `14-testing-strategy.md` |
| 15 | non-functional-requirements-technical | `design/non-functional-requirements-technical` | `15-nfrs-technical.md` |
| 16 | risk-assessment (gated) | `design/risk-assessment` | `16-risk-assessment.md` |
| 17 | adr-authoring | `knowledge-base/adr-template` | one ADR per significant decision under `{paths.knowledge_base_path}/adr/` (fallback `{paths.design_package}/<feature-id>/design/adr/`) |
| 18 | package-synthesis | (assembly) | `{paths.design_package}/{feature-id}/{feature-id}-design.md` (+ `solution-package.md` alias, not opted in only) |

Block ordering matches `templates/compositions/greenfield-design-package.yaml`. Skip blocks marked OUT in scoping; record N/A in the design change-tracker header with the gate condition.

**Iterative blocks:** sub-step 6 (api-design) and sub-step 7 (database-design) contain multiple independent items. For these, apply the per-item acknowledgement loop defined in the block template (`templates/blocks/design/api-design.md`, `templates/blocks/design/database-design.md`) — present each item, get approval, then move on. Do not draft all items in one pass.

## The 7-Step per-file Workflow

Apply to every block:

1. **Section relevance check** (unconditional) — ask Yes / No (with reason) / Skip / Not sure for every block before drafting.
2. **Define scope** of the section in plain language.
3. **Draft** content using the block template under `templates/blocks/design/<slug>.md`.
4. **Verify understanding** by summarizing back before continuing.
5. **Trace** every decision to a requirement, constraint, or baseline observation.
6. **Refine** based on user feedback.
7. **Mark complete** in the design change-tracker; append an `Added` row per tracked decision.

Full instructions live in `references/solution-design-workflow.md` and `references/process.md`.

## Hard gates

- Initialize the design change tracker before any block file is written.
- Do not start formal review (`review-design-package`) until the assembled package is acknowledged.
- All `Skipped` entries in the design change tracker must be revisited and confirmed (or converted to `N/A` with a documented gate condition) before review.
- Technology versions must be pinned. C4 diagram versions must match the technology-stack section.

## Elicitation patterns referenced

- `references/elicitation-patterns/architecture-discovery.md`
- `references/elicitation-patterns/technology-stack-selection.md`
- `references/elicitation-patterns/integration-discovery.md`
- `references/elicitation-patterns/nfr-translation.md`

## Exit criteria

- [ ] Every applicable block is `Complete`, `Skipped` (with revisit), or `N/A` (with gate)
- [ ] `{paths.design_package}/{feature-id}/{feature-id}-design.md` (and, when not opted in, the `solution-package.md` alias) assembled per composition block ordering
- [ ] Design change tracker at v0.1 with one `Added` row per tracked decision
- [ ] User has acknowledged the assembled package

## Acknowledgement checkpoint

Before handing off to `review-design-package`:

1. Summarize the assembled design package — technology stack with pinned versions, included blocks, gated-out blocks, ADRs authored.
2. Ask: "Is the design package ready for formal review?"
3. Wait for explicit confirmation. Do not infer.
4. If the user requests changes, revise the affected sections and repeat the summary.

## Next

Hand off by name to `review-design-package`.
