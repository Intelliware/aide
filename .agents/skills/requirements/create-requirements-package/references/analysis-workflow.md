# Analysis Workflow

Folded from `model-2-sdlc-skills/requirement-package/requirements-analysis/references/analysis-workflow.md`. Run as Step 3 of `create-requirements-package`.

## Purpose

Define the analysis sequence run after discovery (or instead of discovery if skipped). Sequences the analysis skills strictly: stakeholder-mapping then change-scoping then dependency-mapping then impact-analysis then constraint-extraction then process-mapping (future-state) then user-journey-mapping (future-state) then gap-analysis then assumption-log consolidation then decision-log consolidation then risk-analysis. Produces the analytical foundation the requirements writing step (Step 4) consumes; no requirement is written without an analysis basis.

## Sequential execution rule

Before each sub-step, ask the user whether the sub-step applies. If they say "Skip" or "No (with reason)", record the outcome and proceed to the next sub-step. Do not assume relevance.

Execute one sub-step at a time. Read the corresponding reference only when about to execute. After each sub-step:
1. Produce the output artifact in full.
2. Present to the user.
3. Wait for acknowledgement.

Do not:
- Pre-read all reference files.
- Skip a sub-step because a previous sub-step seemed to cover it.
- Run sub-steps in parallel.
- Begin Step 4 (Writing) before sub-step 11 (risk-analysis) is complete and acknowledged.

After every sub-step: update the assumption-log and decision-log with new entries surfaced during that sub-step. Running checkpoint, not a separate skill.

## Did discovery run?

Before starting, check for these files:
- `{paths.requirements_package}/<feature-id>/discovery/current-capability-baseline.md`
- `{paths.requirements_package}/<feature-id>/discovery/requirements-elicitation.md`
- `process-map.md` and `user-journey-map.md` from discovery

If all present, discovery ran. Skip sub-step 0 (change-description already exists at `discovery/change-description.md`). Start at sub-step 1.

If any missing, discovery was skipped. Run sub-step 0 first. Flag every system claim as an assumption throughout. Seed the assumption-log immediately.

In both paths, sub-step 1 (stakeholder-mapping) always runs — discovery does not produce a stakeholder map.

## The sequence

| # | Sub-step | Output (under `analysis/`) | Notes |
|---|---|---|---|
| 0 (conditional) | change-description capture | `change-description.md` | Only if discovery skipped |
| 1 (always) | stakeholder-mapping | `stakeholder-map.md` | Change-focused: who approves, who is impacted |
| 2 | change-scoping | `change-scope.md` | In-scope / out-of-scope / must-not-touch |
| 3 | dependency-mapping | `dependency-map.md` | What change needs FROM the system |
| 4 | impact-analysis | `impact-analysis.md` | What change does TO the system |
| 5 | constraint-extraction | `constraint-register.md` | Business / regulatory / operational / performance |
| 6 | process-mapping (future-state) | `process-map-future.md` | Future workflows, deltas vs current |
| 7 | user-journey-mapping (future-state) | `user-journey-map-future.md` | Future experience flows |
| 8 | gap-analysis | `gap-analysis.md` | Current vs future readiness gaps |
| 9 | assumption-log consolidation | `assumption-log.md` | Final consolidated log |
| 10 | decision-log consolidation | `decision-log.md` | Final consolidated log |
| 11 | risk-analysis | `risk-register.md` | Broadest risk view, consumes everything above |

## Why this order

- Sub-step 1 always first — the stakeholder map names who confirms the rest.
- Scope before dependencies and impact — you cannot map dependencies of an undefined change.
- Constraints before future-state mapping — future maps must respect constraints.
- Future-state maps before gap analysis — gap analysis compares current to future.
- Logs before risk — risk analysis consumes assumptions and decisions.
- Risk last — broadest view, requires everything else to be locked.

## Hard gates

- If discovery was skipped, capture a confirmed change description in sub-step 0 before sub-step 1.
- The risk register is the gate to writing — Step 4 does not start until it is acknowledged.

## Exit criteria

- [ ] All applicable sub-steps complete (sub-step 0 only when discovery was skipped)
- [ ] Stakeholder map, scope, dependency map, impact analysis, constraint register, future-state process and journey maps, gap analysis, assumption log, decision log, risk register all written and acknowledged

## Phase handoff

After `risk-register.md` is acknowledged, return to `SKILL.md` and proceed to `steps/04-writing.md`.
