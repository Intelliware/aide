# Solution Design Workflow

Folded from `model-2-sdlc-skills/solution-package/solution-design/references/solution-design-workflow.md`. Run as Step 2 of `create-design-package`.

## Purpose

Sequence and scope the design skills that produce the design package. Starts with a scoping step that reads the requirements package and (when present) the architecture baseline to determine which of the 14+ design blocks are needed for this feature, then sequences the applicable skills in dependency order. Not every feature needs every section — a backend-only API change skips frontend design; a feature with no external integrations skips integration design; a feature with no reporting needs skips dashboard/reporting design. The scoping step makes this determination explicit and presents it for user confirmation before any design work begins.

## Sequential execution rule

Execute one sub-step at a time. Read the corresponding block template only when about to execute. After each sub-step:
1. Produce the artifact in full.
2. Present to the user.
3. Wait for acknowledgement.

Do not pre-read all block templates. Do not run sub-steps in parallel unless explicitly noted. Do not begin review before the design package is assembled.

## Requirements traceability — mandatory for every sub-step

Every new or modified design decision must trace back to one of:
- The requirements package (functional requirement, NFR, business rule, data requirement, permission)
- An architecture-baseline constraint (when discovery ran)
- Codebase evidence (cited)
- A user-confirmed input (recorded in the design change tracker)

Existing, unchanged elements carry forward by default and do not require traceability when they are documented in the architecture baseline or explicitly confirmed during skipped-discovery intake.

The traceability chain builds across sub-steps:
1. Solution overview design drivers trace to requirements + constraints + baseline observations.
2. Technology stack new/excluded technologies trace to the requirements or constraints driving them; existing-stack technologies carry forward without traceability entries.
3. Solution architecture: requirements that drive new or modified components are traced; requirements fully satisfied by unchanged components are confirmed as covered without separate trace entries; structural decisions track cascading implications.
4. All detail-design sub-steps (data model, API, backend, frontend, etc.) trace each new/modified decision to the requirement(s) it satisfies.

If a new design decision cannot be traced, flag it and confirm with the user before inclusion. Prevents the AI from inventing requirements or making design decisions that serve no stated need.

## Requirements version tracking — applies to every sub-step

The requirements package's `change-tracker.md` records every discrete change to every tracked item. The design workflow uses it to detect whether the requirements have changed since the last design pass.

How it works:
1. **First consumption (no prior design artifacts):** record the current requirements-package version (from the Package Version Log) in the solution overview. Establishes the baseline — all design decisions in this pass are made against this version.
2. **Re-consumption (design artifacts exist; requirements were revised):** compare the recorded version against the current. If different:
   - Read the Version Diff Summary for every version between recorded and current.
   - Identify which requirements changed and which design sections they affect (use the change tracker's `Impact` field plus the scoping questions).
   - Present the delta: *"The requirements package has been updated from [old] to [new]. The following changes affect the design: [list with affected sections]. I'll update those sections in this pass."*
   - For each affected section, the corresponding sub-step must address the changed requirements explicitly — either revising the decision or confirming the existing decision still holds with documented rationale.
3. **After design is complete:** update the recorded version in the solution overview to the current. Ensures the next consumer (planning or review) knows which requirements version the design was made against.

## Sub-step 0 — Scope the design package

This step runs before any design sub-step. Determines which sections are needed and in what order.

Read:
- The requirements package — specifically functional requirements, data requirements, user journeys, business rules, permissions-access-control, and NFRs.
- The requirements `change-tracker.md` — Package Version Log + Version Diff Summary.
- The architecture baseline (`{paths.design_package}/<feature-id>/discovery/architecture-baseline.md`) when discovery ran — component architecture, tech stack, integration points, areas affected.

If solution discovery was skipped, do not fail. Before scoping:
1. Tell the user that design is starting without an architecture baseline.
2. Ask greenfield or brownfield.
3. For greenfield, record that no existing architecture baseline applies.
4. For brownfield, use available codebase context and ask targeted questions only for architecture details required to scope the design.
5. Record unverified architecture claims as assumptions or design risks in the solution overview.

Then answer the scoping questions: which of the gated blocks (`design/frontend-design`, `design/backend-design`, `design/api-design`, `design/database-design`, `design/integration-design`, `design/workflow-business-rules-design`, `design/dashboard-reporting-design`, `design/ux-design`) apply for this feature? For features with a frontend component, also determine the platform(s) — web, iOS, Android, or a combination — so frontend design is tailored. Present the scoping result to the user for confirmation before proceeding.

## The sequence (post-scoping)

| # | Sub-step | Block | Output | Notes |
|---|---|---|---|---|
| 1 | solution-overview | `design/solution-overview` | `01-solution-overview.md` | C4 Level 1; design drivers |
| 2 | technology-stack | `design/technology-stack` | `02-technology-stack.md` | Pinned versions only |
| 3 | solution-architecture | `design/solution-architecture` | `03-solution-architecture.md` | C4 Level 2 + 3 |
| 4 | frontend-design | `design/frontend-design` | `04-frontend-design.md` | Gated by `has_ui` |
| 5 | backend-design | `design/backend-design` | `05-backend-design.md` | Gated by `has_backend` |
| 6 | api-design | `design/api-design` | `06-api-design.md` | Gated by `exposes_api`; error responses required |
| 7 | database-design | `design/database-design` | `07-database-design.md` | Gated by `has_persistence` |
| 8 | security-design | `design/security-design` | `08-security-design.md` | Always |
| 9 | integration-design | `design/integration-design` | `09-integration-design.md` | Gated by `has_external_integrations` |
| 10 | workflow-business-rules-design | `design/workflow-business-rules-design` | `10-workflow-business-rules-design.md` | Gated by `has_complex_workflows` |
| 11 | ux-design | `design/ux-design` | `11-ux-design.md` | Gated by `has_ui` |
| 12 | deployment-devops | `design/deployment-devops` | `12-deployment-devops.md` | Always |
| 13 | observability-operations | `design/observability-operations` | `13-observability-operations.md` | Always |
| 14 | testing-strategy | `design/testing-strategy` | `14-testing-strategy.md` | Always |
| 15 | non-functional-requirements-technical | `design/non-functional-requirements-technical` | `15-non-functional-requirements-technical.md` | Translates requirements-stage NFRs into technical targets |
| 16 | risk-assessment | `design/risk-assessment` | `16-risk-assessment.md` | Gated by `requires_risk_assessment` |
| 17 | adr-authoring | `knowledge-base/adr-template` | `{paths.knowledge_base_path}/adr/<id>.md` (or fallback) | One ADR per significant decision |
| 18 | package-synthesis | (assembly) | `{paths.design_package}/{feature-id}/{feature-id}-design.md` (+ `solution-package.md` alias, not opted in only) | All blocks assembled per composition order |

## Hard gates

- Initialize the design change tracker before any block file is written.
- Do not start formal review until the package is assembled and acknowledged.
- Every block must be `Complete`, `Skipped` (with revisit), or `N/A` (with gate condition).

## Phase handoff

Hand off by name to `review-design-package`.
