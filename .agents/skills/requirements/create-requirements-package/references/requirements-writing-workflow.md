# Requirements Writing Workflow

Folded from `model-2-sdlc-skills/requirement-package/requirements-writing/references/requirements-writing-workflow.md`. Run as Step 4 of `create-requirements-package`.

## Purpose

Sequence the writing skills strictly: executive-summary → stakeholder-personas → business-objectives → user-journeys → functional-requirements → business-rules → data-requirements → permissions-access-control → nonfunctional-requirements → assumptions-constraints-scope → package-synthesis. Each sub-step is conditional on whether analysis ran — if it ran, the sub-step consumes the relevant analysis artifact; if not, the sub-step elicits the information directly.

## Sequential execution rule

Execute one sub-step at a time. Read the corresponding block template (under `templates/blocks/requirements/<slug>.md`) only when about to execute. After each sub-step:
1. Produce the artifact in full.
2. Present to the user.
3. Wait for acknowledgement.

DO NOT:
- Pre-read all block templates.
- Skip a sub-step because a previous sub-step seemed to cover it.
- Run sub-steps in parallel.
- Begin formal review before sub-step 11 (package-synthesis) is complete and the package file is written.

## Change tracker protocol — applies to every sub-step

The change tracker is initialized in sub-step 0a and written to by every sub-step. It consolidates all changes into one navigable view; downstream consumers (architects, design AI agents, implementation AI agents) detect package deltas without re-reading every artifact.

Rules:

1. **First-time authoring** — append one `Added` row per tracked item ID. Description may be `"Initial authoring"`. Trigger: `Initial authoring`. Authorized By: `BSA — initial authoring`.
2. **Hand-off gate correction** — append one `Modified` row per changed item. Description must state what changed. Trigger: `Hand-off gate feedback`. Authorized By: named individual.
3. **Downstream skill discovery** — append one row per changed item. Trigger: `Downstream skill discovery`. Description names the discovering skill.
4. **Review finding** — append one row per changed item. Trigger: `Review finding`. Authorized By: reviewer or BSA.
5. **Assumption falsified** — append one row per revised item. Trigger: `Assumption verified false`. Description references the ASMP-xxx that was falsified.
6. **Do not** backfill from artifact-internal revision histories that predate the tracker.
7. **Do not** duplicate artifact-internal revision history verbatim — both exist; neither replaces the other.

File location: `{paths.requirements_package}/<feature-id>/requirements/change-tracker.md`. Template: `templates/blocks/shared/change-log.md`.

## Sub-step 0a — Resolve feature folder and initialize tracker

1. The feature folder is the **registry's feature ID**, already resolved by this skill's active-feature precondition (`references/ai-principles/feature-precondition.md`). Read it; do not infer one, and do not put the folder name to the user as a question — negotiating it per-session is how the same work acquired two directories.
2. **Not opted in** (no `features.toml`): fall back to the prior behaviour — check for an existing `docs/*/requirements-package/` and reuse it if present, else infer a kebab-case name from the change description and confirm it with the user.
3. Create folder structure if absent: `{paths.requirements_package}/<feature-id>/requirements/` — but resolve the stage feature directory through the precondition's *Resolving the stage feature directory* order first. If this feature's work already sits in a pre-2.7.0 `docs/` working tree, its legacy-tree check halts to ask rather than letting you create a second tree beside it. Not opted in: create `requirements-package/requirements/` under the feature's `docs/` folder instead.
4. Initialize the change tracker (copy `templates/blocks/shared/change-log.md`, populate header at v0.1). If a tracker already exists from a prior iteration, do not overwrite — append a new Package Version Log entry and continue the CHG-NNN sequence.

## Sub-step 0b — Existing-artifact gather (analysis-skipped path only)

When analysis was skipped, gather any existing user artifacts about the proposed change (PRDs, user stories, designs, meeting notes, decision records) before elicitation. Reduces elicitation burden. Different from discovery's existing-artifact-review (which targets system docs); this targets change-related artifacts. Output: `existing-artifacts.md`.

## Did analysis run?

Check for `{paths.requirements_package}/<feature-id>/analysis/stakeholder-map.md` (always produced when analysis runs).

**Analysis ran:** each sub-step independently checks for the specific analysis artifacts it needs and uses them if found. Skills that find artifacts consume them; skills that do not, elicit directly.

**Analysis skipped:** flag to user: *"Analysis was skipped. All requirements will be elicited directly. Every system claim will be treated as an assumption until verified. This increases the risk of requirements rework during implementation."* Run sub-step 0b. Determine routing for sub-step 0:
- If `discovery/change-description.md` exists → discovery ran → skip sub-step 0.
- If both `discovery/change-description.md` and `analysis/change-description.md` are absent → run sub-step 0 first.

## The sequence

| # | Sub-step | Block | Output | Consumes (when analysis ran) |
|---|---|---|---|---|
| 1 | executive-summary | `requirements/executive-summary-business-context` | `01-executive-summary.md` | `change-scope.md`, `impact-analysis.md` |
| 2 | stakeholder-personas | `requirements/stakeholders-personas` | `02-stakeholders-personas.md` | `stakeholder-map.md` |
| 3 | business-objectives | `requirements/business-objectives-success-criteria` | `03-business-objectives.md` | `change-scope.md`, `risk-register.md` |
| 4 | user-journeys | `requirements/user-journeys` | `04-user-journeys.md` | `user-journey-map-future.md` |
| 5 | functional-requirements | `requirements/functional-requirements` + `requirements/functional-specifications` | `05-functional-requirements.md` | `change-scope.md`, `dependency-map.md`, `gap-analysis.md` |
| 6 | business-rules | `requirements/business-logic-rules` | `06-business-rules.md` | `constraint-register.md` |
| 7 | data-requirements | `requirements/data-requirements` | `07-data-requirements.md` | `dependency-map.md`, `impact-analysis.md` |
| 8 | permissions-access-control | `requirements/permissions-access-control` (gated) | `08-permissions.md` | `stakeholder-map.md`, `constraint-register.md` |
| 9 | nonfunctional-requirements | `requirements/non-functional-requirements` | `09-nfrs.md` | `constraint-register.md`, `risk-register.md` |
| 10 | assumptions-constraints-scope | `requirements/assumptions-constraints-out-of-scope` | `10-assumptions-constraints-scope.md` | `assumption-log.md`, `constraint-register.md`, `change-scope.md` |
| 11 | package-synthesis | (assembly) | `requirements-package.md` | all of the above |

## Hard gates

- Initialize the change tracker before any block file is written.
- Do not start formal review until `requirements-package.md` is assembled and acknowledged.
- Do not fail because upstream phases were skipped — explain confidence trade-offs and proceed.

## Exit criteria

- [ ] All applicable sub-steps complete
- [ ] `requirements-package.md` assembled per composition block ordering
- [ ] Change tracker at v0.1 with one `Added` row per tracked item
- [ ] User has acknowledged the assembled package

## Phase handoff

Hand off by name to `review-requirements-package`.
