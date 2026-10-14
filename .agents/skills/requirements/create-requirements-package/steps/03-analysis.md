---
slug: analysis
sequence: 3
depends-on-prior: true
---

# Step 3 — Analysis

Run after the relevance gate and (when applicable) after Step 1 discovery. Analysis is mandatory for greenfield-elaborate and brownfield-elaborate flows; it may be skipped only when the active composition is `quick-dev-spec.yaml`.

## Purpose

Produce the analytical foundation the requirements writing step consumes. No requirement is written without an analysis basis — every functional requirement traces to a stakeholder need, every NFR traces to a constraint, every assumption is logged.

## Sequential execution rule

Read one reference at a time. Each step writes a discrete artifact under `{paths.requirements_package}/<feature-id>/analysis/`. Update the assumption-log and decision-log after every sub-step (running checkpoint, not a separate skill invocation).

## Sub-steps (run in order)

| Step | Output |
|---|---|
| 0 (conditional) | `change-description.md` (only if discovery did not run) |
| 1 (always) | `stakeholder-map.md` (discovery does not produce this) |
| 2 | `change-scope.md` (in-scope / out-of-scope / must-not-touch) |
| 3 | `dependency-map.md` (what the change needs FROM the system) |
| 4 | `impact-analysis.md` (what the change does TO the system) |
| 5 | `constraint-register.md` (business / regulatory / operational / performance) |
| 6 | `process-map-future.md` (future-state workflows) |
| 7 | `user-journey-map-future.md` (future-state experience flows) |
| 8 | `gap-analysis.md` (current vs future readiness gaps) |
| 9 | `assumption-log.md` (consolidated) |
| 10 | `decision-log.md` (consolidated) |
| 11 | `risk-register.md` (broadest view, consumes everything above) |

The full step-by-step instructions, decision rules, and per-artifact templates live in `references/analysis-workflow.md`. Read it just-in-time.

## Hard gates

- If discovery ran, reuse its outputs. If discovery was skipped, every system claim must be flagged as an assumption and seeded into the assumption-log immediately.
- `risk-register.md` is the last artifact and the gate to writing — do not start `steps/04-writing.md` until risks are catalogued and acknowledged.

## Elicitation patterns referenced

- `references/elicitation-patterns/stakeholder-discovery.md`
- `references/elicitation-patterns/non-functional-discovery.md`
- `references/elicitation-patterns/data-and-permissions-discovery.md`

## Exit criteria

- [ ] All 11 sub-step artifacts produced (or minimally recorded)
- [ ] Risk register acknowledged
- [ ] Assumption-log and decision-log up to date

## Acknowledgement checkpoint

Before proceeding to `steps/04-writing.md`:

1. Summarize the risk register, constraint register, and gap analysis in chat.
2. Ask: "Have I captured the analysis correctly? Anything missing or wrong?"
3. Wait for explicit confirmation. Do not infer.
4. If the user requests changes, revise the affected artifact(s) and repeat the summary.

## Next

Proceed to `steps/04-writing.md`.
