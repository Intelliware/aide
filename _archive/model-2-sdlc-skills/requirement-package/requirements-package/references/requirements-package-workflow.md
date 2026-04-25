# Requirements Package Workflow

This workflow coordinates the requirements package phases. It does not contain the detailed phase logic; each phase skill owns its own workflow, references, templates, and quality gates.

## Initial Routing

Ask the user which path they want to run:

| Path | Use when | Start with |
|------|----------|------------|
| Full path | Existing system, material change, or uncertain current-state behavior | `requirements-discovery` |
| Skip discovery | Current system is already understood, but scope and delivery impacts need analysis | `requirements-analysis` |
| Skip discovery and analysis | Change is small, well understood, or the user only needs a requirements draft | `requirements-writing` |
| Review only | A requirements package already exists and needs formal validation | `requirements-review` |

If the user is unsure, recommend the full path for complex brownfield work and recommend skipping discovery only when current behavior is already documented and trusted.

## Phase Chain

Run the selected phase and then stop at each phase boundary for user confirmation.

```text
requirements-discovery
  -> ask whether to start requirements-analysis

requirements-analysis
  -> ask whether to start requirements-writing

requirements-writing
  -> ask whether to start requirements-review

requirements-review
  -> if approved, ask whether to proceed with architect handoff
```

## Skip-Phase Rules

When a phase is skipped:

1. State the trade-off clearly before continuing.
2. Do not fail only because upstream artifacts are missing.
3. Ask targeted questions to fill the minimum inputs needed by the next phase.
4. Record unverified current-system claims as assumptions.
5. Flag elevated rework risk in the downstream artifact.

## Output Location

All generated project outputs should use:

```text
docs/<feature>/requirements-package/
```

The `<feature>` name should be inferred from the confirmed change description, converted to kebab-case, and confirmed with the user before files are written.

## Architect Handoff Package

The architect receives the formally reviewed assembled package at:

```text
docs/<feature>/requirements-package/requirements-package.md
```

The package contains these twelve sections, assembled from the phase outputs:

| Section | Contents | Source reference |
|---------|----------|------------------|
| 1. Executive Summary | Feature overview, scope boundaries, key risks | `executive-summary` |
| 2. Stakeholder Personas | Influence grid, RACI, persona definitions | `stakeholder-personas` |
| 3. Business Objectives | Measurable outcomes, success metrics, priorities | `business-objectives` |
| 4. User Journeys | Per-persona journey maps with satisfaction and friction assessment | `user-journeys` |
| 5. Functional Requirements | Delta specification | `functional-requirements` |
| 6. Business Rules | Rule catalog linked to triggering requirements | `business-rules` |
| 7. Data Requirements | Business information requirements with lifecycle tags | `data-requirements` |
| 8. Permissions & Access Control | Role definitions, permission matrix, authorization rules | `permissions-access-control` |
| 9. Non-Functional Requirements | Quality targets by category with baselines and targets | `nonfunctional-requirements` |
| 10. Assumptions, Constraints & Scope | Consolidated assumptions, constraints, and scope exclusions | `assumptions-constraints-scope` |
| 11. Package Status | Self-review verdict, reconciliation results, traceability summary | `package-synthesis` |
| 12. Change Tracker | Package version log, change register, Version Diff Summary | Orchestrator plus all writing references |

`requirements-review` must return an approved handoff verdict before the package is handed to the architect.

## Common Mistakes To Avoid

| Mistake | What goes wrong | Correct approach |
|---------|-----------------|------------------|
| Skipping discovery or analysis without understanding the trade-off | Requirements operate at reduced confidence; system claims become assumptions and rework risk rises | Use the routing rules above; downstream phases must record confidence degradation and may recommend going back |
| Writing NFRs before the functional spec | NFRs have no system context; thresholds become guesses | Keep NFRs after functional requirements, business rules, data, and permissions sections |
| Writing functional requirements before user journeys | Individually correct requirements can produce a fragmented or contradictory user experience | Keep user journeys before functional requirements |
| Handing off before formal review passes | The architect receives unresolved defects | `requirements-review` and the readiness gate must approve handoff |
| Filling templates without running references | Template rows have no analytical foundation | Treat references as the process and assets as output structures |

## Parent Completion

This parent workflow is complete when one of these is true:

- The user chooses a phase and the appropriate phase skill has started.
- The user decides not to continue and receives a concise summary of recommended next steps.
- The formal review phase returns an approved handoff verdict.
