# System Design

## Purpose

Create or extend the high-level system architecture for a feature — component topology, module boundaries, inter-component communication patterns, and data flow paths. For brownfield projects, the primary output is the architectural delta — what changes to the existing architecture, what components are new, and what stays untouched — rather than a from-scratch architecture diagram. Consumes the existing-architecture-assessment and the requirements package (functional requirements for required capabilities, change scope for boundaries, assumptions-constraints-scope for hard constraints and dependency map entries). For each modified or new component, specifies: its responsibility, its boundaries, its interactions with existing components, and why the boundary was drawn where it was. For each existing component left unchanged, confirms it was evaluated and explains why no change is needed. Covers: component topology and module boundaries, inter-component communication patterns, data flow paths (existing and new), technology selections (only for new or changed components), and integration seams where new code meets existing code. For greenfield projects, produces a complete system architecture without the delta framing. This is the structural foundation that all other design skills build on — it must complete before frontend, backend, database, API, integration, security, and observability design begin.

## What This Produces

The structural blueprint of the solution — how the system is organized into components, how those components communicate, and how data flows through them. This is Section 3 of the solution design package.

For brownfield projects, the primary output is the **architectural delta** — a clear picture of what changes, what is new, and what stays untouched. For greenfield projects, the output is the complete component topology.

Every downstream design skill references this section to understand where its work sits within the system. API design needs to know which component exposes which endpoints. Backend design needs module boundaries. Frontend design needs to know which services it talks to. Integration design needs to know where external connections sit. This section must be complete before any of those begin.

## When to Use

- Always — this is Section 3 of the solution design package and is always included
- Runs after `technology-stack` (Step 2) and before all detail design skills

## Inputs

| Input | Source | Required | If discovery was skipped |
|-------|--------|----------|--------------------------|
| Solution overview | `docs/<feature>/solutions-package/design/01-solution-overview.md` — high-level approach, scope, design drivers | Yes | Yes |
| Technology stack | `docs/<feature>/solutions-package/design/02-technology-stack.md` — pinned technologies, framework conventions, standards | Yes | Yes |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — Section 2 (Component Architecture), Section 5 (Data Architecture), Section 6 (Integration Points), Section 10 (Constraints) | If discovery ran — pre-populates existing component map | User provides existing system description directly |
| Requirements package — functional requirements | `docs/<feature>/requirements-package/requirements/functional-requirements.md` — required capabilities the system must support | Yes | Yes |
| Requirements package — change scope | `docs/<feature>/requirements-package/analysis/change-scope.md` — what areas are affected | Yes | Yes |
| Requirements package — data requirements | `docs/<feature>/requirements-package/requirements/data-requirements.md` — data entities involved | Yes | Yes |
| Requirements package — NFRs | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` — non-functional requirements that affect structural decisions (scalability, performance, availability) | Yes | Yes |
| User-provided architecture docs | Collected in solution overview Step 1b — design briefs, diagrams, technical proposals | If provided | If provided |

> **Missing input guard:** If the requirements package or any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

## Did Discovery Run?

**Discovery ran** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` exists:

- Read Section 2 (Component Architecture) — the existing component map with responsibilities and communication patterns. This is the starting point. The system design builds on top of it.
- Read Section 5 (Data Architecture) — existing data stores and which components access them. This informs data flow paths.
- Read Section 6 (Integration Points) — existing external system connections. New components must respect or extend these.
- Read Section 10 (Architectural Constraints) — constraints the design must operate within.
- Pre-populate the "unchanged components" list from the existing component map.
- Present to the user: **"Based on the architecture baseline, here are the existing components in the affected area. I'll use this as the starting point to determine what changes, what is new, and what stays unchanged for this feature."**

**Discovery was skipped** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` does not exist:

- For brownfield projects: ask the user to describe the relevant parts of the existing system — what components or services exist in the area this feature touches, how they communicate, and what data stores they use. Record as `user-stated`.
- For greenfield projects: no existing architecture to reference. Proceed directly to designing the component topology.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  1. LOAD — Read all inputs                                       │
│     Read solution overview, technology stack, requirements        │
│     package (functional reqs, change scope, data reqs, NFRs).    │
│     If discovery ran: read architecture baseline Sections 2,     │
│     5, 6, and 10.                                                │
│     If user-provided architecture docs exist: read them.         │
├──────────────────────────────────────────────────────────────────┤
│  2. MAP EXISTING — Identify the existing component landscape     │
│     (Brownfield only)                                            │
│     From the baseline or user input, list every component in     │
│     the affected area with its responsibility and connections.   │
│     This is the "before" picture.                                │
├──────────────────────────────────────────────────────────────────┤
│  3. ANALYSE REQUIREMENTS — Determine structural needs            │
│     Walk through each functional requirement and data            │
│     requirement. For each, determine: which existing component   │
│     handles it (modification), or whether a new component is     │
│     needed. Group requirements by the component they affect.     │
│     Build the requirements-to-component traceability table.      │
│     Flag any requirement with no component home as a gap.        │
├──────────────────────────────────────────────────────────────────┤
│  4. DESIGN DELTA — Determine changes, additions, and unchanged   │
│     (Brownfield only)                                            │
│     For each existing component: does it need modification?      │
│       - If yes: what changes and why.                            │
│       - If no: confirm it was evaluated and why no change is     │
│         needed.                                                  │
│     What new components are needed?                              │
│       - Responsibility, boundaries, rationale for separation.    │
│     For greenfield: design the full topology from scratch.       │
│     Track cascading implications for each major decision —       │
│     what downstream design sections does this affect?            │
├──────────────────────────────────────────────────────────────────┤
│  5. COMMUNICATION — Define inter-component communication         │
│     For every pair of connected components (existing-existing,   │
│     existing-new, new-new):                                      │
│       - Communication pattern: sync (HTTP/gRPC) or async         │
│         (message queue, event bus)                                │
│       - Protocol and format                                      │
│       - Direction (who calls whom, who publishes, who consumes)  │
│     Respect existing patterns from the baseline, codebase, or    │
│     user-confirmed architecture context.                         │
├──────────────────────────────────────────────────────────────────┤
│  6. DATA FLOW — Map how data moves through the system            │
│     For each key operation the feature introduces or modifies:   │
│       - Entry point (where the request originates)               │
│       - Path through components                                  │
│       - Data stores read from and written to                     │
│       - Response path back to the caller                         │
│     For brownfield: show both existing data flows that are       │
│     unchanged and new or modified data flows.                    │
├──────────────────────────────────────────────────────────────────┤
│  7. BOUNDARIES — Justify component boundaries                    │
│     For each boundary decision (why something is a separate      │
│     service vs. a module, why components are split or merged):   │
│       - State the decision                                       │
│       - State the rationale (cohesion, deployment independence,  │
│         team ownership, scalability, existing conventions)       │
│       - State what alternative was considered and why it was     │
│         rejected                                                 │
├──────────────────────────────────────────────────────────────────┤
│  8. INTEGRATION SEAMS — Identify where new meets existing        │
│     (Brownfield only)                                            │
│     For each point where new or modified code connects to        │
│     existing unchanged code:                                     │
│       - What the seam is (e.g., new endpoint on existing         │
│         service, new consumer on existing message bus)           │
│       - What the existing side expects (contracts, conventions)  │
│       - Risks at this seam (breaking changes, performance        │
│         impact, migration needs)                                 │
├──────────────────────────────────────────────────────────────────┤
│  9. VALIDATE — Check structural decisions against constraints    │
│     Verify that the proposed structure does not violate:         │
│       - Architectural constraints from the baseline              │
│       - NFRs (e.g., a scalability requirement that prohibits     │
│         synchronous coupling between two components)             │
│       - Technology stack decisions                               │
│     If a constraint is violated, redesign or explicitly          │
│     document the trade-off with user confirmation.               │
├──────────────────────────────────────────────────────────────────┤
│  10. ASSEMBLE — Write the system design section                  │
│      Produce the structured output. Present for review.          │
└──────────────────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Load Inputs

Read all inputs. If the solution overview or technology stack is not yet complete, stop — this skill depends on both.

If user-provided architecture docs were collected during the solution overview, read them. Design briefs or technical proposals may contain structural decisions that should be incorporated rather than re-derived.

### Step 2 — Map the Existing Component Landscape (Brownfield Only)

Using the architecture baseline Section 2 (or user-stated description if discovery was skipped), list every component in the area the feature touches:

| Component | Responsibility | Communicates With | Pattern |
|-----------|---------------|-------------------|---------|
| *(e.g., Order Service)* | *(Manages order lifecycle)* | *(Payment Service, Notification Service, Orders DB)* | *(REST to Payment, async events to Notification)* |

This is the "before" picture. The user should confirm it is accurate before proceeding.

For greenfield projects, skip this step.

### Step 3 — Analyse Requirements Against Structure and Build Traceability

Walk through each functional requirement and data requirement from the requirements package. For each, determine:

- **Which existing component** is the natural home for this capability? (modification)
- **Is a new component needed?** Only introduce a new component when the capability does not belong in any existing component — not for convenience.

Group requirements by the component they affect. This grouping drives the delta in Step 4.

**Build the requirements-to-component traceability table** as you go. This table traces **new and modified** design decisions to the requirements that drive them. Existing, unchanged capabilities do not need entries — they carry forward by default when documented in the architecture baseline or explicitly confirmed during skipped-discovery intake.

The table should include:
- Requirements that result in a **new** component
- Requirements that result in a **modification** to an existing component
- NFRs that drive a structural decision (e.g., a performance target that forces async processing)

Requirements that are fully satisfied by existing unchanged components do **not** need entries — the unchanged component classification in Step 4 already confirms they are covered.

| Requirement ID | Requirement Summary | Component(s) | How Addressed |
|---------------|--------------------:|--------------|---------------|
| *(e.g., FR-01)* | *(User can submit a refund request)* | *(Order Service [modified], Refund Service [new])* | *(New endpoint on Order Service delegates to new Refund Service)* |
| *(e.g., NFR-03)* | *(Refund processing < 2s p95)* | *(Refund Service [new])* | *(Async processing with Kafka; response returns immediately with status)* |

**Gap check:** After completing the table, verify that every requirement in the requirements package either (a) appears in this traceability table with a new or modified component, or (b) is fully satisfied by an existing unchanged component (confirmed in Step 4). Any requirement that falls into neither category is a gap — either a component is missing from the design or the requirement is out of scope (and must be confirmed as such with the user).

### Step 4 — Design the Architectural Delta (Brownfield) or Full Topology (Greenfield)

**For brownfield — produce three lists:**

**Unchanged components** — components in the affected area that were evaluated and determined to need no change. For each, state why no change is needed. This prevents the failure mode where a component is silently skipped.

**Modified components** — existing components that need changes. For each:
- What is changing (new capability, extended interface, new data access)
- Why this component is the right home for the change
- Impact on the component's existing responsibilities (does it remain cohesive?)

**New components** — components being introduced. For each:
- Responsibility — what it does (single, clear purpose)
- Boundaries — what is inside and what is outside this component
- Why it is a separate component rather than part of an existing one
- How it will be deployed (same deployment unit as an existing component, or independently)

**For greenfield — produce the component list:**

For each component: responsibility, boundaries, deployment approach, and rationale for why it is a distinct component.

**Cascading implications.** After each major structural decision (new component, modified component, new communication path), explicitly identify what downstream design sections it affects:

| Decision | Cascades To | Implication |
|----------|------------|-------------|
| *(e.g., New Refund Service introduced)* | *(API design)* | *(New REST endpoints needed for refund operations)* |
| | *(Data model design)* | *(New refund table with FK to orders)* |
| | *(Security architecture)* | *(Refund endpoints need role-based access — not all users can approve refunds)* |
| | *(Deployment strategy)* | *(New service to deploy — needs its own pipeline or added to existing)* |
| *(e.g., Async event between Order and Notification)* | *(Integration design)* | *(Kafka topic schema, dead-letter queue, consumer group)* |
| | *(Observability design)* | *(Async flow needs distributed tracing across the event boundary)* |

This table accumulates as decisions are made. It serves two purposes: (1) it ensures downstream skills know what is coming, and (2) it catches cascading effects the user should be aware of before confirming the system design.

### Step 5 — Define Inter-Component Communication

For every pair of connected components, define:

| From | To | Pattern | Protocol | Direction | Notes |
|------|----|---------|----------|-----------|-------|
| *(e.g., API Gateway)* | *(Order Service)* | *(sync)* | *(REST/HTTP)* | *(gateway → service)* | *(existing, unchanged)* |
| *(e.g., Order Service)* | *(Notification Service)* | *(async)* | *(Kafka event)* | *(publish → consume)* | *(new — order-created event)* |

**Rules:**
- Respect existing communication patterns from the architecture baseline, codebase evidence, or user-confirmed architecture context. If the existing system uses REST between services, do not introduce gRPC for one new connection without explicit rationale.
- Match the technology stack — use technologies listed in Section 2, not unlisted alternatives.
- For each new communication path, state whether it is synchronous or asynchronous and why.

### Step 6 — Map Data Flow Paths

For each key operation the feature introduces or modifies, trace the data flow:

**Example format:**
```
User submits order →
  API Gateway (routes to Order Service) →
  Order Service (validates, persists to Orders DB) →
  Order Service (publishes order-created event to Kafka) →
  Notification Service (consumes event, sends confirmation email) →
  Response: 201 Created returned to user
```

For brownfield: show which parts of the flow are existing (unchanged), which are modified, and which are new. Use labels like `[existing]`, `[modified]`, `[new]`.

For each data store access, note whether it is a read or write.

### Step 7 — Justify Component Boundaries

For each non-obvious boundary decision, document:

| Decision | Rationale | Alternative Considered | Why Rejected |
|----------|-----------|----------------------|--------------|
| *(e.g., Notification as separate service)* | *(Independent scaling, different deployment cadence, existing convention)* | *(Module within Order Service)* | *(Would couple notification changes to order deployment; existing system already has it separated)* |

Not every boundary needs justification. Focus on decisions where a reasonable alternative exists.

### Step 8 — Identify Integration Seams (Brownfield Only)

For each point where new or modified code connects to existing unchanged code:

| Seam | Existing Side Expects | New Side Provides | Risks |
|------|----------------------|-------------------|-------|
| *(e.g., New endpoint on Order Service)* | *(Existing REST conventions, auth middleware, error format)* | *(New POST /orders/{id}/refund endpoint)* | *(Must follow existing error format RFC 7807; must pass through existing auth middleware)* |

These seams are where bugs and integration failures are most likely. Each one is a checkpoint for downstream design skills (API design, backend design).

### Step 9 — Validate Against Constraints

Check the proposed structure against:
- **Architectural constraints** from the baseline (Section 10) — does the structure respect them?
- **NFRs** — does a scalability requirement prohibit synchronous coupling? Does an availability requirement demand redundancy?
- **Technology stack** — are all technologies used in the structure listed in Section 2?

If a constraint is violated:
- Attempt to redesign within the constraint.
- If redesign is not possible, document the trade-off explicitly and present it to the user for confirmation. Do not silently violate constraints.

### Step 10 — Assemble

Combine all sections into the system design output. This becomes Section 3 of the solution design package.

### File Output

Write the completed section to `docs/<feature>/solutions-package/design/03-system-design.md` using the template at `../assets/system-design-doc.md` as the output structure.

If this section was determined to be not applicable in the design workflow's Step 0, write a stub file containing: **"Not applicable — [rationale from scoping step]."**

---

## Output Structure

### For Brownfield Projects

**1. Existing Component Landscape** — the "before" picture (from Step 2)

**2. Architectural Delta**
- Unchanged components (with rationale for no change)
- Modified components (with change description and impact)
- New components (with responsibility, boundaries, and rationale)

**3. Inter-Component Communication** — table of all connections, labelled as existing/modified/new (from Step 5)

**4. Data Flow Paths** — traced flows for key operations, labelled as existing/modified/new (from Step 6)

**5. Boundary Decisions** — justification for non-obvious structural choices (from Step 7)

**6. Integration Seams** — where new meets existing, with contracts and risks (from Step 8)

**7. Requirements Traceability** — every requirement mapped to the component(s) that address it (from Step 3)

**8. Cascading Implications** — how each major structural decision affects downstream design sections (from Step 4)

### For Greenfield Projects

**1. Component Topology** — all components with responsibilities and boundaries

**2. Inter-Component Communication** — table of all connections (from Step 5)

**3. Data Flow Paths** — traced flows for key operations (from Step 6)

**4. Boundary Decisions** — justification for non-obvious structural choices (from Step 7)

**5. Requirements Traceability** — every requirement mapped to the component(s) that address it (from Step 3)

**6. Cascading Implications** — how each major structural decision affects downstream design sections (from Step 4)

---

## Hand-off Gate

Before proceeding to the detail design skills, you must:

1. Write the completed system design in full.
2. Present it to the user for review with the following questions:
   - **Component map:** Are all components in the affected area accounted for? Are the responsibilities correctly described?
   - **Delta (brownfield):** Are the unchanged/modified/new classifications correct? Is any component missing from the evaluation?
   - **Communication:** Do the communication patterns make sense? Are there existing patterns I should follow that I've missed?
   - **Data flow:** Do the traced flows accurately represent how data will move through the system?
   - **Boundaries:** Are the structural decisions reasonable? Would you draw any boundary differently?
   - **Integration seams (brownfield):** Are the seams identified the right ones? Are there connection points I've missed?
   - **Traceability:** Are all requirements accounted for in the traceability table? Is any requirement missing or mapped to the wrong component?
   - **Cascading implications:** Do the downstream effects I've identified look right? Are there cascading effects I've missed?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the system design is accurate.

## Completion Criteria

- [ ] All components in the affected area are identified — none silently skipped
- [ ] For brownfield: every component is classified as unchanged (with rationale), modified (with change description), or new (with responsibility and boundaries)
- [ ] For greenfield: every component has a responsibility, boundaries, and rationale for separation
- [ ] If discovery ran, the existing component map from the architecture baseline is carried forward and confirmed
- [ ] If discovery was skipped and this is brownfield, the existing components are elicited from the user and recorded as `user-stated`
- [ ] Inter-component communication is defined for every pair of connected components with pattern, protocol, and direction
- [ ] New communication paths respect existing patterns from the architecture baseline (or deviations are justified)
- [ ] All technologies used in the structure are listed in the technology stack (Section 2)
- [ ] Data flow paths are traced for each key operation the feature introduces or modifies
- [ ] For brownfield: data flows are labelled as existing/modified/new
- [ ] Non-obvious boundary decisions are documented with rationale and rejected alternatives
- [ ] For brownfield: integration seams are identified with existing-side expectations and risks
- [ ] The structure does not violate architectural constraints or NFRs (or trade-offs are documented with user confirmation)
- [ ] Requirements traceability table is complete — every functional requirement, data requirement, and NFR has at least one component mapped to it
- [ ] Any requirement with no component mapping has been resolved (component added or requirement confirmed out of scope)
- [ ] Cascading implications are documented — each major structural decision lists which downstream design sections it affects
- [ ] User-provided architecture docs (if any) have been incorporated
- [ ] The user has explicitly confirmed the system design is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Detail design begins without a shared structural picture — different sections assume different component arrangements | The system design is the single reference for component topology; all downstream skills build on it |
| A component in the affected area is silently ignored, and changes to it are discovered late in implementation | Every component in the affected area must be classified as unchanged, modified, or new — none can be skipped |
| A new component is introduced without justification, adding unnecessary complexity | New components require responsibility, boundaries, and rationale for why they are separate |
| Communication between components uses inconsistent patterns (e.g., REST in one place, gRPC in another without reason) | Communication patterns are documented in one table; deviations from existing patterns require justification |
| Data flows are assumed but never explicitly traced, leading to missing interactions or unintended side effects | Data flow paths are explicitly traced for each key operation |
| New code connects to existing code at a seam that was never identified, causing integration failures | Integration seams are explicitly called out with existing-side expectations and risks |
| The structure violates an architectural constraint or NFR that was documented but never checked against the design | Step 9 explicitly validates the structure against all constraints |
| Design assumes the existing architecture without verifying the starting point | For brownfield, the existing landscape is pre-populated from the architecture baseline and confirmed by the user before designing changes |
| A functional requirement has no architectural home and is silently dropped | The requirements traceability table forces every requirement to be mapped to a component; unmapped requirements are flagged as gaps |
| A structural decision has unrecognized downstream effects that surface late in design | Cascading implications are tracked for each major decision, making downstream effects visible before the system design is finalized |
