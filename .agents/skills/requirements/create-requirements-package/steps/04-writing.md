---
slug: writing
sequence: 4
depends-on-prior: true
---

# Step 4 — Writing and Assembly

Fill every block declared by the active composition, applying the 7-Step per-file Workflow to each. Assemble into the single `requirements-package.md` at the end.

## Purpose

Convert analysis outputs into the structured, traceable, FR-numbered requirements package. Maintain the change tracker across every write. Produce a package that `review-requirements-package` can validate and that `create-design-package` can consume directly.

## Entry paths supported

This step can be entered standalone (skipping Steps 1 and 3) when the user already has analysis-equivalent context:
- Discovery and analysis completed → consume both upstream sets.
- Discovery completed, analysis skipped → use discovery outputs and elicit missing scope/constraints/dependencies/risks.
- Both skipped → start from who/what/why; gather existing user artifacts (Step 0b in `references/requirements-writing-workflow.md`); flag system claims as assumptions.

Do not fail because an upstream phase was skipped. Explain the confidence trade-off and proceed.

## Sub-steps (run in order)

Every output file below is written to `{paths.requirements_package}/<feature-id>/requirements/` — the requirements stage feature directory (`references/ai-principles/feature-precondition.md`). Not opted in: `requirements-package/requirements/` under the feature's `docs/` folder. Never write these files to the current working directory or the project root.

| Step | Block (from the active composition) | Output file |
|---|---|---|
| 0a | (folder + tracker init) | `change-tracker.md` initialized at v0.1 |
| 0b (conditional) | (existing-artifact gather, only when both discovery and analysis skipped) | `existing-artifacts.md` |
| 1 | `requirements/executive-summary-business-context` | `01-executive-summary.md` |
| 2 | `requirements/stakeholders-personas` | `02-stakeholders-personas.md` |
| 3 | `requirements/business-objectives-success-criteria` | `03-business-objectives.md` |
| 4 | `requirements/user-journeys` | `04-user-journeys.md` |
| 5 | `requirements/functional-requirements` + `requirements/functional-specifications` | `05-functional-requirements.md` (FR[Area].[Feature].[Detail]) |
| 6 | `requirements/business-logic-rules` | `06-business-rules.md` |
| 7 | `requirements/data-requirements` | `07-data-requirements.md` |
| 8 | `requirements/permissions-access-control` (gated) | `08-permissions.md` |
| 9 | `requirements/non-functional-requirements` | `09-nfrs.md` |
| 10 | `requirements/assumptions-constraints-out-of-scope` | `10-assumptions-constraints-scope.md` |
| 11 | `requirements/acceptance-criteria` | `11-acceptance-criteria.md` |
| 12 | (assembly) | `{paths.requirements_package}/{feature-id}/{feature-id}-requirements.md` (+ `requirements-package.md` alias, not opted in only) |

Block ordering matches `templates/compositions/greenfield-requirements-package.yaml`. Skip blocks marked N/A in the relevance gate; write them as N/A entries in the completeness tracker, not empty files.

**Iterative blocks:** sub-step 5 (functional-requirements) and sub-step 6 (business-rules) contain multiple independent items. For these, apply the per-item acknowledgement loop defined in the block template (`templates/blocks/requirements/functional-requirements.md`, `templates/blocks/requirements/business-logic-rules.md`) — present each item, get approval, then move on. Do not draft all items in one pass.

## The 7-Step per-file Workflow

Apply to every block:

1. **Section relevance check** (Step 0 of the workflow, unconditional) — ask Yes / No (with reason) / Skip / Not sure for every block before drafting.
2. **Define scope** of the section in plain language.
3. **Draft** content using the block template under `templates/blocks/requirements/<slug>.md`.
4. **Verify understanding** by summarizing back to the user before proceeding.
5. **Trace** every item back to an analysis artifact (constraint, risk, requirement, decision).
6. **Refine** based on user feedback.
7. **Mark complete** in the completeness tracker; append an `Added` row to the change tracker for each tracked item ID.

Full instructions live in `references/requirements-writing-workflow.md` and `references/process.md`.

## Hard gates

- Initialize the change tracker before any block file is written.
- Do not start formal review (`review-requirements-package`) until `requirements-package.md` is assembled and the user has acknowledged it.
- All `Skipped` entries in the completeness tracker must be revisited and confirmed (or converted to `N/A` with a documented gate condition) before review.

## Elicitation patterns referenced

- `references/elicitation-patterns/functional-requirements-discovery.md`
- `references/elicitation-patterns/non-functional-discovery.md`
- `references/elicitation-patterns/data-and-permissions-discovery.md`

## Exit criteria

- [ ] Every block in the active composition is `Complete`, `Skipped` (with revisit), or `N/A` (with gate)
- [ ] `requirements-package.md` assembled per composition block ordering
- [ ] Change tracker at v0.1 with one `Added` row per tracked item
- [ ] User has acknowledged the assembled package

## Acknowledgement checkpoint

Before handing off to `review-requirements-package`:

1. Summarize the assembled requirements package — which sections are filled, which are N/A, which are skipped-with-revisit.
2. Ask: "Is the package ready for formal review?"
3. Wait for explicit confirmation. Do not infer.
4. If the user requests changes, revise the affected sections and repeat the summary.

## Next

Hand off by name to `review-requirements-package`.
