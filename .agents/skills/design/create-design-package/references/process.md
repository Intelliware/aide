# Process — create-design-package

The deep how-to for the skill's macro workflow. Lifted and adapted from `solution-design-package/skills/create-solution-design-package/SKILL.md` and its 11-step design process.

## The 11-step design process (macro)

Each step maps to one or more blocks declared by the active composition (`templates/compositions/greenfield-design-package.yaml` is the canonical reference; brownfield-enhancement-spec drops some blocks).

1. **Solution Overview** — architecture pattern, drivers, C4 Level 1 + Level 2 diagrams. Block: `design/solution-overview`. Use `references/elicitation-patterns/architecture-discovery.md`.
2. **Technology Stack** — frameworks, languages, databases with **pinned versions**. Block: `design/technology-stack`. Use `references/elicitation-patterns/technology-stack-selection.md`.
3. **Solution Architecture** — component topology, deployment shape. Block: `design/solution-architecture`. C4 Level 3 (component) diagrams.
4. **Frontend Design** — routing, state management, component structure (gated by `has_ui`). Block: `design/frontend-design`.
5. **Backend Design** — layered architecture, domain model, API conventions (gated by `has_backend`). Block: `design/backend-design`.
6. **API Design** — endpoint specs, request/response schemas, **error patterns**. Block: `design/api-design` (gated by `exposes_api`).
7. **Database Design** — table definitions, ERD, migration strategy, index strategy. Block: `design/database-design` (gated by `has_persistence`).
8. **Security Design** — authentication, authorization, data security, secrets, compliance posture. Block: `design/security-design`.
9. **Integration Design** — external services, workflows, state machines, idempotency, retries (gated by `has_external_integrations`). Block: `design/integration-design`. Use `references/elicitation-patterns/integration-discovery.md`.
10. **Deployment, Observability, Testing** — environments, CI/CD, infra; logging, metrics, tracing, alerts; test pyramid, environments, data management. Blocks: `design/deployment-devops`, `design/observability-operations`, `design/testing-strategy`.
11. **NFR Technical Specs** — performance budgets, scalability targets, resilience targets. Block: `design/non-functional-requirements-technical`. Use `references/elicitation-patterns/nfr-translation.md` to translate requirements-stage NFRs into technical-stage targets.

In addition: workflow-business-rules-design, dashboard-reporting-design, ux-design, and risk-assessment blocks are conditionally included per their `decision-gates`. ADRs are authored as separate documents using `templates/blocks/knowledge-base/adr-template.md`; the design package references them by ID.

## The 7-step per-file workflow (micro)

Applied to every block when filling content:

| # | Step | Halt condition |
|---|---|---|
| 0 | Section relevance check (unconditional) | Ask Yes / No (with reason) / Skip / Not sure for every block. Record outcome in the completeness tracker before drafting. |
| 1 | Define scope of the section | If scope is unclear, elicit before drafting |
| 2 | Draft from `templates/blocks/design/<slug>.md` | If template is missing, halt and report — do not invent structure |
| 3 | Verify understanding by summarizing back | If user disagrees, return to step 1 |
| 4 | Trace every decision to a requirement, constraint, or baseline observation | If a decision cannot be traced, flag and confirm |
| 5 | Refine based on feedback | Continue until user acknowledges |
| 6 | Mark complete; append `Added` row to design change tracker | Tracker append must succeed before next block |

**Step 3 (Verify understanding) is non-skippable.** Even if the section seems trivially correct, summarize back what you understood and what you produced and wait for acknowledgement. Skipping this step is the most common cause of late-stage drift between artifact and intent.

## Composition awareness

Always resolve which blocks apply by reading the active composition's `blocks:` and `decision-gates:` lists. Honor `optional: true` (offer to skip) and `include-if: <expr>` (skip when expr resolves false). For backbone-only projects, the resolved set may be just solution-overview + technology-stack + architecture + security + ops/test + NFR + change-log.

## Key rules

- **Every design decision traces to a requirement, constraint, or architecture-baseline observation.** If it doesn't, either the requirement is missing (return to `create-requirements-package`) or the design is speculative (drop it).
- **Technology choices are explicit and pinned.** "latest" is not a version. "v3.x" is not a version. `Spring Boot 3.2.1` is a version.
- **API contracts specify error responses** — not just success paths. Status codes, error envelopes, retry semantics.
- **Scaffolding before content** — copy block templates, run scoping, then fill section by section.
- **The Requirements Package is the north star** — constantly reference it; consume the requirements `change-tracker.md` for delta detection.
- **C4 diagrams use the same pinned versions** as `design/technology-stack`. Drift = bug.
- **ADRs live in the knowledge base** when present (`{paths.knowledge_base_path}/adr/`); fall back to `{paths.design_package}/<feature-id>/design/adr/` when KB is absent.

## Internal step naming

This skill uses "Step N" inside its workflow. It does not use "Phase 1/2/3/4" — `phase` is reserved for stage shape and `increment` for the implementation chunk in `create-implementation-package`.
