# Implementation Plan Creator

## Purpose

Break the architect's solution into ordered, bite-sized dev tasks with exact file paths, code changes, and verification steps. Includes task decomposition strategy: evaluates and selects among decomposition strategies (vertical slice, horizontal layer, risk-first, dependency-ordered), documents which strategy was chosen and why given the specific feature, codebase, and risk profile, establishes task granularity rules (each task independently verifiable, produces a working system state, small enough for a single AI agent session), and identifies verification checkpoints in the task sequence. Then populates each task with: the files to create or modify (exact paths from codebase-analysis), the specific change to make (what code to add, modify, or remove), the design specification embedded inline — the relevant excerpt from the solution package (API contract with request/response schemas and error cases, data model definition with column types and constraints, security rules, integration contract) so the agent does not need to reference the solution package, the acceptance criteria embedded inline — the testable pass/fail conditions from the requirements package so test-creator skills have the behavioral specification needed to write meaningful tests, the existing patterns to follow (from codebase-analysis and project-context-generator), the verification steps to confirm the task is complete (tests to run, behavior to check), and the rollback approach if the change breaks something. For brownfield projects, front-loads risk by sequencing high-uncertainty tasks early — database migrations, integration point changes, and modifications to heavily-shared code — so that failures surface before dependent work is built on top. Each task includes traceability references to the solution package section and requirement IDs it implements for audit purposes. Produces phases conforming to the canonical phase shape (see ../assets/canonical-phase-shape.md). Forced uncertainty markers: when the solution package, codebase analysis, or any upstream artifact is ambiguous, incomplete, or contradictory on a point that affects a task, the plan creator must insert a [NEEDS CLARIFICATION: ...] marker with a specific question rather than guessing. The plan cannot proceed to review-plan-readiness with unresolved markers — the workflow returns to the user to resolve each one. This prevents the common failure mode where the agent makes plausible but incorrect assumptions about unclear requirements, leading to implementation that must be reworked after review. Produces the task inventory section of the implementation package — the ordered task list that AI coding agents execute task-by-task.

## What This Produces

An ordered, phased implementation plan where each phase conforms to the **canonical phase shape** (`../assets/canonical-phase-shape.md`). The plan breaks the architect's solution into phases that are independently executable, verifiable, and traceable to requirements. Each phase contains exact file paths, inline design specifications, inline acceptance criteria, verification steps, and rollback guidance — everything an AI coding agent needs to execute the phase without referencing any other document.

This is the primary deliverable of the planning phase. Every subsequent implementation action — task execution, TDD cycles, code review, PR creation — references this plan.

## When to Use

- Step 6 of the implementation planning workflow
- After codebase-analysis, test-planning, prerequisites-planning, delivery-planning (if applicable), and project-context-generator have all completed
- All five upstream artifacts must exist and be user-confirmed before this skill runs

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Solution design | `docs/<feature>/solutions-package/solution-package.md` — system design, technology stack, data model, API design, backend design, frontend design | Yes |
| Requirements package | `docs/<feature>/requirements-package/requirements-package.md` — functional requirements (FRs), acceptance criteria (ACs), data requirements, business rules, NFRs | Yes |
| Codebase analysis | `docs/<feature>/implementation-package/plan/codebase-analysis.md` — file/module map, coding patterns, conventions, integration strategy, standards compliance assessment, technology versions | Yes |
| Test plan | `docs/<feature>/implementation-package/plan/test-plan.md` — test strategy, regression coverage, test modifications, testing standards compliance | Yes |
| Prerequisites plan | `docs/<feature>/implementation-package/plan/prerequisites-plan.md` — dependency additions, environment setup, configuration changes | Yes |
| Delivery plan | `docs/<feature>/implementation-package/plan/delivery-plan.md` (conditional) — migration ordering, phased delivery sequencing, rollback strategy | If applicable |
| Project context | `docs/<feature>/implementation-package/plan/project-context.md` — naming conventions, patterns, gotchas, imports, style rules for AI agents | Yes |
| Canonical phase shape | `../assets/canonical-phase-shape.md` — mandatory structure for every phase | Yes |
| Coding standards | `../assets/standards/` — referenced for pattern guidance in each phase | Yes |

> **Missing input guard:** If the solution package, requirements package, or any required upstream planning output cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

## How This Differs from Other Artifacts

The **solution design** describes *what* to build (components, APIs, data models, contracts). The **codebase analysis** describes *what exists* (files, patterns, conventions, integration points). The **implementation plan** describes *how to build it* — the ordered sequence of code changes that transform the existing codebase into the target state described by the solution design.

The solution design says "create a RefundService with methods X, Y, Z." The codebase analysis says "services live in `src/modules/{feature}/`, use constructor injection, follow the OrderService pattern." The implementation plan says "Phase 3, Step 2: Create `src/modules/orders/refund.service.ts` with constructor-injected `OrderRepository` and `PaymentGateway`. Implement `initiateRefund(orderId: string): Promise<Refund>` following the OrderService pattern. The full API contract is [inline]. The acceptance criteria are [inline]. Verify by running `npm test -- --grep RefundService`."

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  1. LOAD — Read all upstream artifacts                            │
│     Read solution design, requirements, codebase analysis,       │
│     test plan, prerequisites plan, delivery plan (if exists),    │
│     project context, canonical phase shape, coding standards.    │
│     Build a complete mental model of what to build, where it     │
│     goes, and how it should be structured.                       │
├──────────────────────────────────────────────────────────────────┤
│  2. INVENTORY — List every deliverable                            │
│     From the solution design, extract every component, entity,   │
│     API endpoint, service method, configuration change,          │
│     migration, and test that must be created or modified.        │
│     Cross-reference with the codebase analysis integration       │
│     strategy to get exact file paths.                            │
├──────────────────────────────────────────────────────────────────┤
│  3. STRATEGY — Select decomposition strategy                      │
│     Evaluate which decomposition approach fits the feature,      │
│     codebase, and risk profile. Document the choice.             │
├──────────────────────────────────────────────────────────────────┤
│  4. PHASE — Group deliverables into phases                        │
│     Apply the selected strategy to cluster deliverables into     │
│     phases. Each phase must produce a working system state.      │
│     Apply the canonical phase shape to every phase.              │
├──────────────────────────────────────────────────────────────────┤
│  5. ORDER — Sequence phases by dependencies and risk              │
│     Determine which phases block others. Front-load high-risk    │
│     and high-uncertainty work. Identify parallelism.             │
├──────────────────────────────────────────────────────────────────┤
│  6. POPULATE — Fill each phase with inline specs                  │
│     For each phase: embed design specs, acceptance criteria,     │
│     file paths, patterns to follow, verification steps, and     │
│     rollback approach.                                           │
├──────────────────────────────────────────────────────────────────┤
│  7. TRACE — Map requirements to phases                            │
│     Verify every FR and AC (all types) in the requirements       │
│     package is covered by at least one phase. Identify gaps.     │
├──────────────────────────────────────────────────────────────────┤
│  8. UNCERTAINTY — Insert [NEEDS CLARIFICATION] markers            │
│     For any ambiguity, contradiction, or gap in upstream         │
│     artifacts, insert a marker with a specific question.         │
│     Present all markers to the user for resolution.              │
├──────────────────────────────────────────────────────────────────┤
│  9. SELF-REVIEW — Validate the plan against checklists            │
│     Run the plan through the pre-implementation gates            │
│     (simplicity, clarity, integration-first) and the            │
│     coverage check. Fix issues before presenting.                │
├──────────────────────────────────────────────────────────────────┤
│  10. ASSEMBLE — Write the implementation plan document             │
│      Produce the full plan in the canonical format.               │
│      Present to the user for review.                              │
└──────────────────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Load All Upstream Artifacts

Read every artifact produced by steps 1–5 of the planning workflow. Do not proceed if any required artifact is missing or has not been user-confirmed.

Build a unified mental model that answers:

- **What to build** — from the solution design (components, APIs, data models, business logic)
- **What requirements it must satisfy** — from the requirements package (FRs, FR ACs, business rule ACs, data ACs, permission ACs, NFR ACs, and error-path ACs)
- **Where the code goes** — from the codebase analysis (file paths, module structure, integration strategy)
- **What patterns to follow** — from the codebase analysis + project context + coding standards
- **What tests to write** — from the test plan (strategy, coverage targets, test modifications)
- **What prerequisites must come first** — from the prerequisites plan (dependencies, environment, configuration)
- **What delivery constraints exist** — from the delivery plan (migration ordering, phased rollout) if applicable
- **What the canonical phase shape requires** — from the template (8 mandatory sections per phase)

### Step 2 — Build the Deliverable Inventory

Extract every concrete deliverable from the solution design and cross-reference it with the codebase analysis integration strategy:

| Deliverable | Solution Design Section | Codebase Location (from integration strategy) | Action | Dependencies |
|---|---|---|---|---|
| *(e.g., Refund entity)* | *Data model, Section 6* | *`src/modules/orders/refund.entity.ts`* | *Create new file* | *Database migration for refunds table* |
| *(e.g., RefundService)* | *Backend design, Section 5* | *`src/modules/orders/refund.service.ts`* | *Create new file* | *Refund entity, OrderService (existing)* |
| *(e.g., POST /orders/:id/refund)* | *API design, Section 7* | *`src/modules/orders/refund.controller.ts`* | *Create new file* | *RefundService, validation DTOs* |
| *(e.g., OrderService modification)* | *Backend design, Section 5* | *`src/modules/orders/order.service.ts`* | *Modify existing file* | *None* |

**Include everything:**
- New files (entities, services, controllers, DTOs, migrations, config)
- Modified files (adding methods, updating imports, registering providers)
- New tests (unit, integration, component, E2E)
- Modified tests (existing tests affected by the change)
- Configuration changes (environment variables, feature flags)
- Documentation updates (API docs, README)

**Flag missing mappings.** If a solution design component has no corresponding entry in the codebase analysis integration strategy, flag it with `[NEEDS CLARIFICATION: The solution design specifies component X but the codebase analysis does not include an integration mapping for it. Where should this code live?]`.

### Step 3 — Select Decomposition Strategy

Evaluate the deliverable inventory against four decomposition strategies and select the best fit. Document the choice and reasoning.

**Strategy A: Vertical Slice (Feature-First)**

Group deliverables by user-facing feature or user story. Each phase delivers a complete, testable slice of functionality from database to UI.

| Best when | Avoid when |
|---|---|
| Feature has 2–4 independent user stories | All stories share the same database tables and services |
| Stories can be demonstrated independently | Heavy shared infrastructure must be built first |
| Team wants early user feedback per story | Stories are tightly coupled with cross-cutting concerns |

**Strategy B: Horizontal Layer (Bottom-Up)**

Group deliverables by architectural layer. Foundation layers (database, entities, shared services) first, then domain services, then controllers/API, then UI.

| Best when | Avoid when |
|---|---|
| Feature has significant shared infrastructure | Feature is a single, focused CRUD operation |
| Multiple user stories share entities and services | Layer-by-layer execution delays demonstrable value |
| Database schema is complex with many relationships | The team needs user-visible progress early |

**Strategy C: Risk-First**

Order phases by uncertainty and blast radius. High-risk work first: database migrations, modifications to heavily-shared code, external integration points, and unfamiliar technology. Low-risk work (standard CRUD, UI, documentation) last.

| Best when | Avoid when |
|---|---|
| Feature modifies shared database tables used by other services | Feature is entirely additive with no shared-code modifications |
| Feature integrates with external APIs or third-party services | All work is low-risk, well-understood CRUD |
| Feature touches code owned by other teams | The team is familiar with every component involved |
| Migration rollback is complex or involves data transformation | |

**Strategy D: Dependency-Ordered (Hybrid)**

Order phases strictly by the dependency graph. Build whatever is needed first, regardless of layer or feature grouping. This is the default when no other strategy is clearly better.

| Best when | Avoid when |
|---|---|
| The dependency graph is deep (A → B → C → D) | Work is mostly independent with few dependencies |
| Circular or cross-cutting dependencies exist | A single strategy (vertical or horizontal) fits cleanly |
| Multiple strategies apply partially | |

**Selection criteria:**

1. Map the deliverable inventory's dependencies into a directed acyclic graph (DAG).
2. Identify whether the DAG has clear vertical slices (feature clusters) or horizontal layers.
3. Assess risk: are there high-uncertainty deliverables (migrations, shared code changes, external integrations)?
4. Select the strategy that minimizes blocked work and surfaces failures earliest.

**Hybrid is common.** Most real features use a mix: a foundational phase (horizontal) for prerequisites and shared infrastructure, followed by vertical slices for feature delivery, with risk-first ordering within each slice. Document the hybrid clearly.

**Record the decision:**

> **Decomposition Strategy:** [Strategy name or Hybrid description]
> **Rationale:** [Why this strategy fits the feature, codebase, and risk profile]
> **Alternative considered:** [Which other strategy was evaluated and why it was rejected]

### Step 4 — Group Deliverables into Phases

Apply the selected strategy to cluster deliverables into phases. **Each phase produces one PR.** The phase execution guide creates one branch per phase (`feature/phase-{id}`), and the PR workflow creates one PR per branch. This means **phase size directly controls PR size** — a phase that is too large produces a PR that is too large to review effectively.

Every phase must:

1. **Produce a working system state** — after the phase completes, the system compiles, all tests pass, and no broken functionality exists. A phase that leaves the system in a non-compilable or test-failing state is too granular or incorrectly scoped.
2. **Be independently verifiable** — the phase has its own automated and human verification steps that can confirm its success without running subsequent phases.
3. **Be executable in a single session** — a phase should represent roughly one "unit of work" for an AI coding agent. If a phase would take more than one focused session (approximately 1–2 hours of implementation), split it.
4. **Produce a reviewable PR** — target **200–400 lines changed** per phase. Any phase that would produce more than **500 lines changed** (excluding generated files, lock files, and test fixtures) must be split. Large PRs have slower review cycles, higher defect rates, and are more likely to be rubber-stamped. When in doubt, split.
5. **Conform to the canonical phase shape** — all 8 sections from `../assets/canonical-phase-shape.md` must be present.

**Splitting an oversized phase:**

When a phase would exceed the 500-line threshold, split it using one of these strategies:

| Strategy | When to use | Example |
|---|---|---|
| **Separate entity from service** | Phase creates both a data model and the service that uses it | Phase A: entity + migration + repository + their unit tests. Phase B: service + business logic + their unit tests |
| **Separate by endpoint** | Phase creates multiple API endpoints | Phase A: POST endpoint + tests. Phase B: GET/list endpoint + tests. Phase C: PATCH endpoint + tests |
| **Separate foundation from feature** | Phase builds shared infrastructure and uses it | Phase A: shared types, utilities, configuration + tests. Phase B: feature code that uses them + tests |
| **Separate by business rule** | Phase implements multiple complex business rules | Phase A: eligibility validation + tests. Phase B: processing logic + tests |

**Tests are never separated from their production code.** The implementation workflow mandates TDD — every phase includes the unit tests for the code it produces. A phase without tests is incomplete; tests without the code they cover are unverifiable. The only exception is **cross-phase integration and E2E tests** that cannot run until multiple phases are in place (see the Test phases row below).

**Standard phase sequence:**

| Phase Type | Content | When |
|---|---|---|
| **Prerequisites** | Dependency installations, environment setup, configuration changes from the prerequisites plan | Always first (unless empty) |
| **Foundational** | Database migrations, shared entities, shared services, shared types, shared utilities — anything that multiple subsequent phases depend on | When shared infrastructure is needed |
| **Feature phases** | Domain services, controllers, DTOs, validation, business logic — grouped by strategy. **Every feature phase includes its own unit tests** (TDD: test first, then implementation) | The bulk of the plan |
| **Integration / Wiring** | Module registration, route wiring, middleware configuration, cross-module connections + their tests | When feature phases produce independent components that need connecting |
| **Cross-phase test phases** | Integration tests, E2E tests, or contract tests that **span multiple feature phases** and cannot run until those phases are all in place. These are the only test-only phases — they exist because the tests have dependencies on code from multiple prior phases | Only when tests require code from multiple completed phases |
| **Polish** | Documentation updates, API documentation, README updates, configuration finalization, cleanup | Last |

**Granularity guideline:** Aim for 3–12 phases for a typical feature. Fewer than 3 suggests the phases are too coarse (and the resulting PRs too large to review effectively) — split them. More than 15 suggests the feature itself may need to be broken into separate delivery cycles, or the phases are too fine-grained (and the PR overhead per phase outweighs the benefit of small PRs).

**The PR size test:** For each phase, mentally estimate the lines of code it will produce. If the estimate exceeds 500 lines changed, the phase is too large. Split it. Small, focused PRs get reviewed faster, get better review feedback, and merge with fewer conflicts.

### Step 5 — Sequence Phases by Dependencies and Risk

**Build the dependency graph:**

For each phase, determine which other phases must complete before it can start. Record these in the phase's Dependencies section.

```
PHASE-001 (Prerequisites)
    └──► PHASE-002 (Database / Entities)
              ├──► PHASE-003 (RefundService)
              │         └──► PHASE-005 (RefundController + API)
              └──► PHASE-004 (OrderService modifications)
                        └──► PHASE-005 (RefundController + API)
                                  └──► PHASE-006 (Integration tests)
                                            └──► PHASE-007 (Polish)
```

**Risk-first ordering within the dependency graph:**

When multiple phases are at the same level in the DAG (no dependency relationship between them), order them by risk — highest risk first:

| Risk Level | Phase Characteristics | Examples |
|---|---|---|
| **High** | Modifies shared database tables, touches heavily-used code, integrates with external services, introduces new technology | Database migrations, shared entity changes, payment gateway integration |
| **Medium** | Creates new code in existing modules, extends existing services, adds new API endpoints | New service classes, new controllers, new DTOs |
| **Low** | Purely additive new code, configuration changes, documentation, test-only changes | New utility functions, README updates, E2E tests |

**Identify parallelism:**

Mark phases that can be executed in parallel (no dependency relationship, no file-system conflicts). This information is used by the implementation workflow in subagent mode.

| Phase | Can Parallel With | Reason |
|---|---|---|
| *PHASE-003* | *PHASE-004* | *Different files, no shared state, both depend only on PHASE-002* |

**Present the dependency graph to the user** as part of the plan output. The graph makes the sequencing rationale visible.

### Step 6 — Populate Each Phase with Inline Specifications

For every phase, fill in all 8 sections of the canonical phase shape. The Plan section (Section 4) is the most critical — it must contain everything an AI coding agent needs to execute the phase without opening any other document.

**What goes into each plan step:**

Each step in the Plan section must include:

1. **Action** — imperative verb describing what to do (Create, Implement, Add, Modify, Configure)
2. **Target** — exact file path(s) from the codebase analysis integration strategy
3. **Design spec (inline)** — the relevant excerpt from the solution package embedded directly. For API endpoints: request/response schemas, status codes, error cases. For entities: column definitions, constraints, relationships. For services: method signatures, business rules, error handling
4. **Acceptance criteria (inline)** — ALL testable pass/fail conditions from the requirements package that apply to this step. These are the ACs that the test-creator skill will use to write tests. Include:
   - **FR ACs** (`AC-REQ-NNN-N`) — functional requirement acceptance criteria, including error-path ACs where the FR has them
   - **Business rule ACs** (`AC-BR-NNN-N`) — rule enforcement ACs for any business rule this step implements
   - **Data ACs** (`AC-DATA-NNN-N`) — data contract ACs for any data input/output/entity this step handles
   - **Permission ACs** (`AC-ACR-NNN-N`, `AC-PERM-NNN-N`) — authorization ACs for any access control this step enforces
   - **NFR ACs** (`AC-NFR-[CAT]-NNN-N`) — non-functional ACs for any quality target this step must satisfy, including degraded-mode ACs where applicable
   
   If a step implements logic governed by a business rule but the BR AC is not embedded, the coding agent will implement the logic without writing a test for rule enforcement. If a step handles data but the data rejection AC is not embedded, negative-path data tests will be missing. Embed every applicable AC — the cost of a redundant AC is negligible compared to an untested behavior
5. **Pattern to follow** — the existing codebase pattern or coding standard to follow, from the codebase analysis and project context. Include a reference to a specific existing file as an example where possible
6. **Verification** — how to verify the step is done (test command, expected output)

**Example plan step (fully populated):**

```markdown
2. Create `src/modules/orders/refund.service.ts`

   **Design spec:**
   - `initiateRefund(orderId: string): Promise<Refund>` — validates order exists and is
     eligible (status = 'delivered', within 30-day window), creates a Refund entity with
     status 'pending', calls PaymentGateway.refund(originalTransactionId, amount), updates
     Refund status to 'completed' or 'failed' based on gateway response. Returns the Refund.
   - `getRefundStatus(refundId: string): Promise<Refund>` — returns the Refund entity by ID.
     Throws NotFoundException if not found.
   - Error cases: OrderNotFoundException (404), RefundNotEligibleException (422),
     PaymentGatewayException (502).

   **Acceptance criteria:**
   - AC-3.1: Refund succeeds for a delivered order within 30 days — Refund entity created
     with status 'completed', payment gateway called with correct transaction ID and amount.
   - AC-3.2: Refund rejected for orders older than 30 days — RefundNotEligibleException
     thrown with reason 'Order exceeds 30-day refund window'.
   - AC-3.3: Refund rejected for non-delivered orders — RefundNotEligibleException thrown
     with reason 'Order status must be delivered'.
   - AC-3.4: Payment gateway failure handled — Refund entity created with status 'failed',
     GatewayException details logged.

   **Pattern:** Follow `OrderService` pattern (constructor injection, `@Transactional()` on
   write methods, typed exceptions). Error handling per `../assets/standards/common/error-handling.md`
   — use typed error classes, not bare throws.

   **Verify:** `npm test -- --grep RefundService` — all tests pass.
```

**What must NOT be in a plan step:**

- Vague instructions: "implement validation" — specify *what* validation and *which rules*
- References to other documents: "see Section 5 of the solution design" — the spec must be inline
- Placeholder content: "add appropriate error handling" — specify *which* errors and *how* to handle them
- Assumptions: "the payment gateway probably uses REST" — verify or mark `[NEEDS CLARIFICATION]`

### Step 7 — Trace Requirements to Phases

Build a traceability matrix that maps every FR and every AC (across all artifact types) from the requirements package to the phase(s) that implement it:

| Requirement / AC | Type | Description | Phase(s) | Notes |
|---|---|---|---|---|
| *FR-3.1* | FR | *Customers can request a refund for delivered orders* | *PHASE-003, PHASE-005* | *Service logic in PHASE-003, API endpoint in PHASE-005* |
| *AC-REQ-3.1-1* | FR AC | *Refund succeeds for eligible orders* | *PHASE-003* | *Inline in step 2* |
| *AC-REQ-3.1-2* | FR AC (error-path) | *Refund rejected for non-delivered orders* | *PHASE-003* | *Inline in step 2* |
| *BR-015* | BR | *Refund eligibility within 30-day window* | *PHASE-003* | *Rule logic in RefundService* |
| *AC-BR-015-1* | BR AC | *Refund accepted at day 30 boundary* | *PHASE-003* | *Inline in step 2* |
| *AC-BR-015-2* | BR AC | *Refund rejected at day 31* | *PHASE-003* | *Inline in step 2* |
| *AC-DATA-007-1* | Data AC | *Refund input accepted with valid fields* | *PHASE-005* | *Inline in API step* |
| *AC-DATA-007-2* | Data AC | *Refund input rejected with missing orderId* | *PHASE-005* | *Inline in API step* |
| *AC-PERM-004-1* | Perm AC | *Customer role can request own refund* | *PHASE-005* | *Inline in auth middleware step* |
| *AC-PERM-004-2* | Perm AC | *Customer cannot request another user's refund* | *PHASE-005* | *Inline in auth middleware step* |
| *NFR-PER-001* | NFR | *Refund endpoint responds within 500ms* | *PHASE-006* | *Performance test in integration test phase* |
| *AC-NFR-PER-001-1* | NFR AC | *p99 response time at or below 500ms under 200 concurrent users* | *PHASE-006* | *Inline in perf test step* |

**Coverage check:**

- Every FR must appear in at least one phase's FR Mapping
- Every AC across all types (`AC-REQ-`, `AC-BR-`, `AC-DATA-`, `AC-ACR-`, `AC-PERM-`, `AC-NFR-`) must appear as an inline acceptance criterion in at least one plan step
- Every error-path AC and every `Error path: None` determination from the requirements must be accounted for — error-path ACs must be embedded inline; `Error path: None` determinations do not need plan steps
- If an FR or AC is not covered, either add a phase/step to cover it or mark `[NEEDS CLARIFICATION: FR-X.Y is in the requirements but no solution design component implements it. Is this intentional?]`

**Present the traceability matrix to the user** as part of the plan output. Gaps are visible immediately.

### Step 8 — Insert [NEEDS CLARIFICATION] Markers

Scan the entire plan for ambiguity, contradiction, or gaps. For each issue, insert a marker at the exact point in the plan where the ambiguity affects a decision:

```markdown
3. Create `src/modules/orders/dto/create-refund.dto.ts`

   **Design spec:**
   - `orderId: string` (required, UUID format)
   - `reason: string` (required, max 500 chars)
   - [NEEDS CLARIFICATION: The solution design mentions a 'refundType' field
     (full vs partial) but the API design shows only full refunds in the
     request schema. Should partial refunds be supported in this phase?
     If yes, what additional fields are needed (e.g., amount, line items)?]
```

**Rules for markers:**

- Every marker must contain a **specific question** — not "this is unclear" but "should X be Y or Z?"
- Markers must be placed **at the point of impact** — in the plan step where the decision matters
- The plan cannot be presented as final while markers remain unresolved — present the plan with markers, resolve them with the user, update the plan, and re-present
- Do not guess. If you are 80% sure of the answer, insert the marker anyway. Wrong guesses caught in implementation cost 10x more than a clarification question asked during planning

**Common sources of ambiguity:**

| Source | Example |
|---|---|
| Solution design and requirements package disagree | Solution design shows 3 error codes; requirements list 5 error scenarios |
| Solution design is silent on an edge case | What happens when the payment gateway times out? |
| Codebase analysis reveals a pattern conflict | Solution design proposes event-driven; codebase uses synchronous calls |
| Multiple valid interpretations exist | "User can cancel" — cancel the order? Cancel the refund? Both? |
| NFR is underspecified | "The system should be fast" — what latency target? |

### Step 9 — Self-Review Against Checklists

Before presenting the plan, run it through three validation passes:

**Simplicity check:**

- [ ] No phase does more than one logical thing
- [ ] No phase would produce more than 500 lines changed (estimated) — phases exceeding this are split
- [ ] Every feature phase includes its unit tests — no test-only phases except for cross-phase integration/E2E tests
- [ ] No speculative phases — every phase traces to at least one FR (or is explicitly foundational)
- [ ] No premature abstraction — phases use framework/library APIs directly rather than wrapping them in custom abstractions unless the plan explicitly justifies the wrapper
- [ ] Phase count is proportional to feature scope (3–12 for typical features)

**Clarity check:**

- [ ] No `[NEEDS CLARIFICATION]` markers remain unresolved (or they are being presented to the user for resolution)
- [ ] Every plan step has a file path, design spec, acceptance criteria, pattern reference, and verification step
- [ ] No vague instructions ("add validation," "handle errors," "implement logic")
- [ ] No cross-references to external documents — all specs are inline

**Coverage check:**

- [ ] Every FR in the requirements package appears in at least one phase's FR Mapping
- [ ] Every FR AC (`AC-REQ-NNN-N`) in the requirements package appears as an inline criterion in at least one plan step
- [ ] Every business rule AC (`AC-BR-NNN-N`) appears as an inline criterion in the plan step that implements the rule
- [ ] Every data AC (`AC-DATA-NNN-N`) appears as an inline criterion in the plan step that handles the data contract
- [ ] Every permission AC (`AC-ACR-NNN-N`, `AC-PERM-NNN-N`) appears as an inline criterion in the plan step that enforces authorization
- [ ] Every NFR AC (`AC-NFR-[CAT]-NNN-N`) appears as an inline criterion in the plan step responsible for meeting the quality target, including degraded-mode ACs where applicable
- [ ] Every error-path AC from any artifact type appears as an inline criterion in the plan step that must handle the failure scenario
- [ ] Every deliverable from the inventory (Step 2) is assigned to a phase
- [ ] Every existing test that will be affected (from the test plan) is addressed by a phase
- [ ] Prerequisites from the prerequisites plan are covered by the first phase(s)
- [ ] Delivery sequencing from the delivery plan (if applicable) is respected

**Integration check:**

- [ ] API contracts, data models, and interface boundaries are defined in the plan before phases that implement them
- [ ] The test plan's strategy (testing standards, coverage targets) is reflected in each phase's verification steps
- [ ] The project context's naming conventions and patterns are referenced in each phase's pattern guidance
- [ ] The codebase analysis's standards compliance assessment is reflected — phases that touch non-compliant areas note the standard to follow for new code

### Step 10 — Assemble the Implementation Plan

Combine all sections into the implementation plan document.

### File Output

Write the completed implementation plan to `docs/<feature>/implementation-package/plan/implementation-plan.md`.

The document structure is:

```
# Implementation Plan

## Plan Summary
- Feature overview (1–2 sentences)
- Decomposition strategy and rationale
- Phase count and estimated scope
- Key risks and mitigations

## Technology Versions
(Carried forward from codebase analysis — determines which standard rules apply)

## Dependency Graph
(Visual representation of phase dependencies)

## Phase Index
| Phase ID | Phase Name | FR Mapping | Dependencies | Risk Level |
|---|---|---|---|---|

## Traceability Matrix
(FR / all AC types to phase mapping from Step 7 — covers AC-REQ, AC-BR, AC-DATA, AC-ACR, AC-PERM, AC-NFR, and error-path ACs)

## Phases

### Phase 1 — [Phase Name]
(Canonical phase shape — all 8 sections)

### Phase 2 — [Phase Name]
(Canonical phase shape — all 8 sections)

...

## Bug-fix Phases
(Initially empty — populated during execution by the phase execution guide)
```

---

## Phase Specification — Canonical Shape Reference

Every phase must contain these 8 sections in this order (see `../assets/canonical-phase-shape.md` for full details):

### 1. Phase Identity

```markdown
**Phase ID**: PHASE-XXX
**Phase Name**: [Descriptive Name]
**FR Mapping**:
- FR-X.Y.Z [Requirement description]
```

Phase IDs are sequential. Foundational phases state `FR Mapping: None (foundational)`.

### 2. Goal

Single sentence describing the **system state** after this phase completes. Not effort — state.

- Good: "The system can process refunds for delivered orders within the 30-day window."
- Bad: "Implement refund processing."

### 3. Dependencies

List Phase IDs that must complete before this phase starts. `None` if no dependencies.

### 4. Plan

Ordered, imperative steps with inline design specs, acceptance criteria, file paths, patterns, and verification. This is the section the AI coding agent executes. Every step must be self-contained — the agent should not need to open any other document.

### 5. Outcome

Measurable deliverables — what exists or works after the phase completes.

### 6. Automated Verification (AI Gate)

Specific test commands and expected outputs. Verifies mechanics — does it work?

### 7. Human Verification (Human Gate)

Review steps requiring human judgment. Verifies intent — does it align with requirements? Keep to 2–4 items.

### 8. Success Criteria

Binary checklist (✅ items). All must be met. Keep to 4–8 items.

---

## Rollback Approach

Every phase that modifies existing code or data should include a rollback note:

| Change Type | Rollback Approach |
|---|---|
| New files only (additive) | Delete the new files; no rollback needed beyond `git revert` |
| Modified existing files | `git revert` the commit; note any data or state that the revert does not undo |
| Database migration (additive — new tables/columns) | Reverse migration that drops the new tables/columns; note data loss implications |
| Database migration (destructive — column removal, type change) | Reverse migration must be prepared and tested before the forward migration runs; document in the delivery plan |
| Configuration change (env vars, feature flags) | Revert the configuration; note any downstream services that cached the old value |
| External integration (API keys, webhook registration) | Deregister webhooks; revoke API keys; note any external state that persists |

Include the rollback approach in the phase's Plan section or as a note after the Success Criteria.

---

## Hand-off Gate

Before proceeding to `review-plan-readiness` (Step 7 of the planning workflow), you must:

1. Write the complete implementation plan with all phases in canonical shape.
2. Resolve all `[NEEDS CLARIFICATION]` markers with the user. If any remain unresolved, the plan cannot proceed to review.
3. Present the plan to the user with the following questions:
   - **Decomposition:** Does the decomposition strategy make sense for this feature? Should any phases be split, merged, or reordered?
   - **Scope:** Are there deliverables missing from the plan? Are there phases that should be out of scope for this cycle?
   - **Sequencing:** Does the phase ordering respect the right dependencies? Is risk appropriately front-loaded?
   - **Traceability:** Does the traceability matrix accurately reflect which phases implement which requirements? Are there gaps?
   - **Inline specs:** Are the inline design specs and acceptance criteria accurate and complete? Do they match the solution design and requirements?
   - **Verification:** Are the automated and human verification steps sufficient to confirm each phase's success?
   - **Granularity:** Are the phases the right size? Too coarse (hard for one session)? Too fine (overhead of phase ceremony)?
4. If the user identifies corrections, update and re-present before proceeding.
5. Do not proceed until the user explicitly confirms the implementation plan is complete and ready for readiness review.

## Completion Criteria

- [ ] All upstream artifacts (codebase analysis, test plan, prerequisites plan, delivery plan if applicable, project context) have been read and incorporated
- [ ] A decomposition strategy has been selected with documented rationale
- [ ] Every deliverable from the solution design has been assigned to a phase
- [ ] Every phase conforms to the canonical phase shape (all 8 sections present)
- [ ] No phase is estimated to produce more than 500 lines changed — phases exceeding this have been split
- [ ] Every feature phase includes unit tests for the code it produces — no phase ships production code without its tests
- [ ] Every plan step contains inline design spec, inline acceptance criteria, exact file paths, pattern to follow, and verification step
- [ ] No vague or placeholder instructions remain in any plan step
- [ ] Every FR in the requirements package appears in at least one phase's FR Mapping
- [ ] Every FR AC (`AC-REQ-NNN-N`) appears as an inline criterion in at least one plan step
- [ ] Every business rule AC (`AC-BR-NNN-N`) appears as an inline criterion in the plan step that implements the rule logic
- [ ] Every data AC (`AC-DATA-NNN-N`) appears as an inline criterion in the plan step that handles the data contract
- [ ] Every permission AC (`AC-ACR-NNN-N`, `AC-PERM-NNN-N`) appears as an inline criterion in the plan step that enforces authorization
- [ ] Every NFR AC (`AC-NFR-[CAT]-NNN-N`) appears as an inline criterion in the plan step responsible for meeting the quality target, including degraded-mode ACs
- [ ] Every error-path AC from any artifact type appears as an inline criterion in the plan step that handles the failure scenario
- [ ] The traceability matrix is complete — no unmapped FRs or ACs of any type (`AC-REQ-`, `AC-BR-`, `AC-DATA-`, `AC-ACR-`, `AC-PERM-`, `AC-NFR-`)
- [ ] Phases are ordered by dependencies and risk (high-risk first within dependency constraints)
- [ ] Parallelism opportunities are identified and documented
- [ ] All `[NEEDS CLARIFICATION]` markers have been resolved with the user
- [ ] Rollback approaches are documented for phases that modify existing code or data
- [ ] Prerequisites from the prerequisites plan are covered by the first phase(s)
- [ ] Delivery sequencing from the delivery plan (if applicable) is respected
- [ ] Self-review checklists (simplicity, clarity, coverage, integration) have been run and passed
- [ ] The user has explicitly confirmed the implementation plan is complete and ready for readiness review

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Plan phases do not conform to the canonical shape — missing verification, success criteria, or FR mapping | Step 10 enforces the canonical phase shape template for every phase; the self-review (Step 9) checks for structural completeness |
| Agent executes a plan step but has to open the solution design to understand what to build | Step 6 embeds the design spec inline in every plan step — the agent has the full contract without referencing another document |
| Agent writes tests but doesn't know the acceptance criteria | Step 6 embeds acceptance criteria inline so test-creator skills have the behavioral specification |
| Plan is ordered by intuition rather than dependencies — phases fail because prerequisites are missing | Step 5 builds an explicit dependency graph and orders phases accordingly |
| Low-risk work is done first, high-risk work deferred — integration failures discovered late | Step 5 applies risk-first ordering within dependency constraints, surfacing high-uncertainty work early |
| Requirements are missing from the plan — discovered during implementation or review | Step 7 builds a traceability matrix mapping every FR and AC (all types: `AC-REQ-`, `AC-BR-`, `AC-DATA-`, `AC-ACR-`, `AC-PERM-`, `AC-NFR-`) to phases; gaps are visible before implementation |
| Agent guesses at ambiguous requirements instead of asking | Step 8 forces `[NEEDS CLARIFICATION]` markers with specific questions; unresolved markers block the plan |
| Plan uses vague instructions ("add validation," "handle errors") that different agents interpret differently | Step 6 requires specific design specs and acceptance criteria; the self-review (Step 9) flags vague instructions |
| Phases are too large for a single AI agent session, causing context loss and incomplete work | Step 4 enforces session-sized phases; the self-review checks that each phase is independently executable |
| Phases leave the system in a broken state (non-compilable, tests failing) | Step 4 requires each phase to produce a working system state |
| Plan has no rollback guidance — a failed phase leaves the system in a half-modified state with no recovery path | The Rollback Approach section provides per-change-type rollback guidance; phases that modify existing code include rollback notes |
| Speculative tasks inflate the plan — "might need later" tasks that trace to no requirement | The simplicity check (Step 9) requires every phase to trace to at least one FR or be explicitly foundational |
| PRs are too large to review effectively — reviewers rubber-stamp or miss defects | Each phase maps to one PR; Step 4 enforces a 500-line-changed ceiling per phase with splitting strategies; the simplicity check (Step 9) verifies no phase exceeds the threshold |
| Unit tests are split into a separate phase from the production code they cover — tests arrive late, TDD is broken, and code ships without verification | Step 4 mandates that every feature phase includes its unit tests; the only test-only phases allowed are cross-phase integration/E2E tests that depend on code from multiple prior phases |
| Plan is structured around the design document's component names rather than the codebase's actual file structure | Step 2 cross-references solution design components with codebase analysis integration strategy to get exact file paths |
