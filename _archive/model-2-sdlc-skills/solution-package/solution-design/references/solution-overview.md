# Solution Overview

## Purpose

Produce the executive view of the solution design — business context, scope, and the high-level approach that orients any reader before they reach the detailed design sections. This is the first section of the solution design package and the first thing the architect, developer, or reviewer reads. Consumes: the requirements package (executive summary for business context, scope boundaries, and key risks; business objectives for success criteria; assumptions-constraints-scope for hard constraints and scope exclusions), and the existing-architecture-assessment (current system context for brownfield projects). For brownfield projects, frames the solution as a change to an existing system — what exists today, what is changing, and why. For greenfield projects, frames the solution as a new build — what is being created and why. Covers: business context summary (what problem is being solved and for whom), solution scope (what is in and out of this design), key design drivers (the requirements and constraints that most influence the design approach), high-level solution approach (one paragraph describing the overall strategy), key risks and mitigations carried forward from requirements, and a dependency summary. Does not contain detailed design decisions — those belong in subsequent sections. Produces the solution overview that is Section 1 of the solution design package.

## What This Produces

The opening section of the solution design package — the first thing an architect, developer, or reviewer reads. It orients the reader to what problem is being solved, what the design covers, what constraints shaped the approach, and what the high-level strategy is, before they encounter any detailed design.

Six sub-sections:

1. **Business context summary** — the business problem or capability gap being addressed, who it affects, and why it matters now (drawn from the requirements package — not restated from scratch)
2. **Solution scope** — what this design covers and what it does not; which of the 14 design sections are included and which are omitted (with rationale)
3. **Key design drivers** — the requirements, constraints, and architectural realities that most influence the design approach
4. **High-level solution approach** — one paragraph describing the overall strategy: what is being built or changed and how, at the level of major components and their interactions
5. **Key risks and mitigations** — risks carried forward from the requirements package that the design must address, plus any new risks identified during design scoping
6. **Dependency summary** — external dependencies, prerequisites, and sequencing constraints that affect the design or its implementation

## When to Use

- Always — this is Section 1 of the solution design package and is always included
- Runs first, before any other design skill
- The design workflow's Step 0 (scoping) determines which sections are in scope; this skill documents that scope determination as part of sub-section 2

## Inputs

| Input | Source | Required | If discovery was skipped |
|-------|--------|----------|--------------------------|
| Requirements package — executive summary | `docs/<feature>/requirements-package/requirements/executive-summary.md` — business need, business context, initiative priority, cost of inaction | Yes | Yes — this is from the requirements package, not discovery |
| Requirements package — scope, constraints, assumptions | `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` — scope boundaries, hard constraints | Yes | Yes |
| Requirements package — business objectives | `docs/<feature>/requirements-package/requirements/business-objectives.md` — success criteria and expected outcomes | Yes | Yes |
| Requirements package — key risks | BSA handoff — critical and high risks from the risk section | Yes | Yes |
| Requirements package — NFRs | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` — non-functional requirements that constrain the design | Yes | Yes |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — system context (Section 1), component architecture (Section 2), constraints register (Section 10), open questions (Section 12) | If discovery ran — pre-populates brownfield context and constraints | User provides existing system context directly |
| Design scope determination | Design workflow Step 0 output — which sections are included, which are omitted, platform determination | Yes — produced by the workflow before this skill runs | Yes |
| User-provided architecture docs | User — design briefs, architecture diagrams, spike/PoC outputs, technical proposals, prior design reviews, informal notes | Optional — asked for in Step 1b; enhances accuracy if available | Optional |

> **Missing input guard:** If the requirements package or any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

## Did Discovery Run?

**Discovery ran** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` exists:
- Read Section 1 (System Context) for the existing system description — what the system is, who uses it, and where it is deployed. Use this to frame the solution as a **change to an existing system**.
- Read Section 2 (Component Architecture) for the component map — understand which components exist and which the proposed change will affect.
- Read Section 10 (Architectural Constraints) for constraints the design must respect — framework limitations, deployment boundaries, data-layer restrictions, must-fix debt items.
- Read Section 12 (Open Questions) for unresolved architectural unknowns that the design must account for or resolve.
- Pre-populate the key design drivers (sub-section 3) with constraints from both the requirements package and the architecture baseline.
- Pre-populate the high-level solution approach (sub-section 4) with awareness of existing components and how the change fits into them.

Present the pre-populated content to the user: **"Based on the requirements package and the architecture baseline, here is the solution overview. The business context is drawn from the requirements package, and the design constraints incorporate both requirements-level constraints and architectural constraints from the codebase. Let me know if anything needs correcting."**

**Discovery was skipped** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` does not exist:
- The existing system architecture is unknown from a discovery perspective.
- For brownfield projects: ask the user to describe the existing system at a high level — what it is, who uses it, and what areas the proposed change will touch. Record this as `user-stated`.
- For greenfield projects: no existing system context is needed. Frame the solution as a new build.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  1. LOAD — Read all inputs                                       │
│     Read the requirements package: executive summary, scope,     │
│     constraints, business objectives, risks, NFRs.               │
│     If discovery ran: read architecture baseline Sections 1,     │
│     2, 10, and 12.                                               │
│     Read the design scope determination from the workflow.   │
├──────────────────────────────────────────────────────────────────┤
│  1b. COLLECT ARCHITECTURE DOCS — Ask the user for any existing   │
│      architecture documentation for the new feature              │
│      Design briefs, architecture diagrams, spike/PoC outputs,    │
│      technical proposals, informal notes or sketches, prior      │
│      design reviews, Confluence/wiki pages, whiteboard photos.   │
│      If provided: read and incorporate into subsequent steps.    │
│      If none: proceed — the AI will work from requirements       │
│      and the architecture baseline (if discovery ran).           │
├──────────────────────────────────────────────────────────────────┤
│  2. BUSINESS CONTEXT — Summarise the business problem            │
│     Draw from the requirements package executive summary.        │
│     Do not rewrite it — condense to 3–5 sentences focused        │
│     on what the architect and developer need to know.            │
│     Frame as context for the design, not as a business case.     │
├──────────────────────────────────────────────────────────────────┤
│  3. SCOPE — Document what the design covers                      │
│     List which of the 14 design sections are included and        │
│     which are omitted, with rationale for each omission.         │
│     Note the platform(s) for frontend if applicable.             │
│     Note brownfield vs. greenfield.                              │
├──────────────────────────────────────────────────────────────────┤
│  4. DRIVERS — Identify the key design drivers                    │
│     Collect from three sources:                                  │
│       - Requirements: NFRs, hard constraints, scope exclusions   │
│       - Architecture baseline (if discovery ran): constraints    │
│         register, must-fix debt, open questions                  │
│       - Business: priority, deadline, cost of inaction           │
│     Rank by influence on the design — most constraining first.   │
├──────────────────────────────────────────────────────────────────┤
│  5. APPROACH — Write the high-level solution approach            │
│     One paragraph. Describe what is being built or changed       │
│     and how, at the level of major components.                   │
│     For brownfield: state what exists, what changes, and what    │
│     is new. Reference existing components by name.               │
│     For greenfield: describe the system being created.           │
│     No implementation detail — no class names, no API paths,     │
│     no database table names. Those belong in later sections.     │
├──────────────────────────────────────────────────────────────────┤
│  6. RISKS — Carry forward key risks and add design risks         │
│     List critical and high risks from the requirements package.  │
│     Add any new risks identified during design scoping (e.g.,    │
│     architectural constraints that make a requirement difficult  │
│     to satisfy, technology gaps, integration complexity).         │
│     For each risk, note whether it has a design mitigation or    │
│     whether it is accepted.                                      │
├──────────────────────────────────────────────────────────────────┤
│  7. DEPENDENCIES — Summarise dependencies and sequencing         │
│     External dependencies from the requirements package.         │
│     Design-level dependencies: which design sections depend on   │
│     which (already determined by the workflow's sequence).   │
│     Prerequisites: anything that must be true before             │
│     implementation can begin (e.g., access to an external API,   │
│     a database migration must complete first).                   │
├──────────────────────────────────────────────────────────────────┤
│  8. ASSEMBLE — Write the solution overview section               │
│     Produce the structured output. Present for review.           │
└──────────────────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Load Inputs

Read all inputs listed in the Inputs table. If any required input is missing, stop and inform the user — do not proceed with incomplete context.

If discovery ran, check for contradictions between the requirements package and the architecture baseline:
- If the requirements package describes the existing system differently from the architecture baseline, record the contradiction and present it to the user before proceeding.
- Do not silently resolve contradictions.

### Step 1b — Collect Architecture Documentation

Before writing anything, ask the user: **"Do you have any existing architecture documentation, design briefs, or technical notes related to this feature? This could include architecture diagrams, spike or PoC outputs, technical proposals, prior design reviews, Confluence/wiki pages, whiteboard photos, or informal notes. If you have any of these, please share them now — they'll help me produce a more accurate solution overview."**

If the user provides documentation:
- Read all provided documents.
- Extract architectural decisions, design direction, component descriptions, and constraints that are relevant to this feature.
- Use them as additional context in Steps 2–7. When the provided documentation contains information that informs a sub-section (e.g., a design brief describes the intended approach), incorporate it rather than deriving everything from scratch.
- If the provided documentation contradicts the requirements package or the architecture baseline, surface the contradiction to the user — do not silently pick one source over the other.
- Record in the solution overview that user-provided architecture documentation was consumed and note which documents were provided.

If the user has no documentation:
- Acknowledge and proceed. The AI will work from the requirements package and the architecture baseline (if discovery ran).
- This is normal — many features begin design without prior architecture documentation.

### Step 2 — Write the Business Context Summary

Condense the requirements package executive summary into 3–5 sentences focused on what is relevant to the design:
- What business problem or capability gap is being addressed
- Who is affected
- Why this is being done now (urgency driver)
- Initiative priority and delivery deadline (if any)

**Do not rewrite the executive summary.** Condense it for a technical audience. The full business case is in the requirements package — this section orients the design reader.

**Do not include solution content.** This sub-section describes the problem, not the design.

### Step 3 — Document the Solution Scope

Using the design workflow's Step 0 output:

**Included sections** — list each design section that is in scope, with a one-sentence description of what it will cover for this feature.

**Omitted sections** — list each design section that is out of scope, with a rationale for why (e.g., "No frontend component — this is a backend-only API change", "No external integrations — the feature operates entirely within the existing system boundary").

**Platform determination** — if frontend is in scope, state the target platform(s): web, iOS, Android, or a combination.

**Project type** — state whether this is brownfield (change to an existing system) or greenfield (new build).

### Step 4 — Identify Key Design Drivers

Collect constraints and requirements that will most influence the design approach. Organize by source:

**From the requirements package:**
- Non-functional requirements (performance targets, scalability needs, security requirements, compliance mandates)
- Hard constraints from assumptions-constraints-scope (technology mandates, budget limits, timeline constraints)
- Scope exclusions that constrain what the design can do

**From the architecture baseline (if discovery ran):**
- Architectural constraints (from Section 10) — framework limitations, deployment boundaries, data-layer restrictions
- Must-fix debt items that the design must account for
- Open questions (from Section 12) that may affect design decisions

**From business context:**
- Initiative priority — affects how much risk the design can accept
- Delivery deadline — affects whether the design can propose phased delivery
- Cost of inaction — affects how aggressive the design should be

Rank by influence on the design — the most constraining driver first. Each driver should state: what it is, where it comes from, and what design freedom it restricts or enables.

**Requirements traceability.** Every design driver must trace to a specific requirement, constraint, or baseline observation. Use this format:

| # | Design Driver | Source | Requirement / Constraint ID | What It Restricts or Enables |
|---|--------------|--------|---------------------------|------------------------------|
| 1 | *(e.g., API response < 200ms p95)* | *(Requirements package — NFR)* | *(NFR-02)* | *(Restricts synchronous chaining; may require caching or async patterns)* |
| 2 | *(e.g., Must use existing Oracle DB)* | *(Architecture baseline — constraint)* | *(CONSTRAINT-04)* | *(Restricts data store choice; new tables must go in the existing schema)* |

This table is the first traceability artifact in the solution design package. Downstream skills will build on it — system design maps requirements to components, technology stack maps new technologies to requirements, and so on. If a design driver cannot be traced to a specific requirement or constraint, it must be flagged and confirmed with the user before being included.

### Step 5 — Write the High-Level Solution Approach

One paragraph (5–8 sentences). Describe the overall design strategy:

**For brownfield projects:**
- What exists today (reference the architecture baseline's component map if discovery ran, or user-stated system description if not)
- What is changing — which existing components are being modified and how
- What is new — what components or capabilities are being introduced
- How the new and changed components interact with the unchanged parts of the system

**For greenfield projects:**
- What is being created
- The major components and their responsibilities
- How the components interact

**Rules:**
- Stay at the component level — name major components, services, or layers, but do not go to class names, API paths, or database table names
- Do not make detailed design decisions — those belong in subsequent sections
- If the design workflow's scoping determined that certain sections are not needed, the approach should be consistent with those omissions (e.g., don't describe a frontend approach if frontend is out of scope)

### Step 6 — Carry Forward Risks and Add Design Risks

**From the requirements package:**
- List critical and high risks. For each, note whether the design addresses it (and how) or whether it is accepted.

**New design-level risks:**
- Risks identified during design scoping — for example:
  - An NFR that the existing architecture may struggle to satisfy
  - A technology gap (existing stack lacks something the feature needs)
  - Integration complexity with external systems
  - Architectural constraints that force a sub-optimal design
- For each new risk, state: what it is, what impact it has, and whether the design mitigates it or accepts it.

### Step 7 — Summarise Dependencies

**External dependencies** — from the requirements package (e.g., access to a third-party API, a vendor deliverable, a data migration by another team).

**Design prerequisites** — things that must be true before implementation can begin (e.g., a staging environment must exist, a database migration must complete, an API contract must be agreed with another team).

**Implementation sequencing constraints** — if the design implies a particular implementation order (e.g., database schema changes must be deployed before the API changes), note that here. This is informational for the implementation phase — the solution overview does not dictate implementation planning.

### Step 8 — Assemble

Combine all sub-sections into the solution overview. This becomes Section 1 of the solution design package.

**Document metadata.** Add to the document header:
- Document version (start at v0.1 for first draft)
- Date of this draft
- Author
- Review status (Draft / Under Review / Approved)

### File Output

Write the completed section to `docs/<feature>/solutions-package/design/01-solution-overview.md` using the template at `../assets/solution-overview-doc.md` as the output structure.

If this section was determined to be not applicable in the design workflow's Step 0, write a stub file containing: **"Not applicable — [rationale from scoping step]."**

---

## Hand-off Gate

Before proceeding to `technology-stack`, you must:

1. Write the completed solution overview in full — all six sub-sections.
2. Present it to the user for review with the following questions:
   - **Business context:** Does this accurately reflect the business problem and urgency? Is it appropriately condensed for a design audience?
   - **Scope:** Are the included and omitted design sections correct? Is the platform determination right?
   - **Design drivers:** Are these the constraints that matter most? Are any missing? Is the ranking reasonable? Does each driver trace to a specific requirement or constraint?
   - **Approach:** Does the high-level strategy make sense? For brownfield: does it correctly describe what exists, what changes, and what is new?
   - **Risks:** Are the carried-forward risks correct? Are there design risks I've missed?
   - **Dependencies:** Are there prerequisites or sequencing constraints I haven't captured?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the solution overview is accurate.

## Completion Criteria

- [ ] Business context summary is drawn from the requirements package — condensed for a design audience, not rewritten from scratch
- [ ] Solution scope lists every included and omitted design section with rationale for omissions
- [ ] Platform determination (web, iOS, Android, or combination) is stated if frontend is in scope
- [ ] Project type (brownfield or greenfield) is stated
- [ ] Key design drivers are collected from requirements package, architecture baseline (if discovery ran), and business context — ranked by influence
- [ ] Every design driver traces to a specific requirement, constraint, or baseline observation in the traceability table
- [ ] Any design driver that cannot be traced to a specific source has been flagged and confirmed with the user
- [ ] If discovery ran, architectural constraints and must-fix debt from the baseline are included in the design drivers
- [ ] If discovery was skipped and this is brownfield, the existing system context is elicited from the user and recorded as `user-stated`
- [ ] High-level solution approach describes the overall strategy at the component level without detailed design decisions
- [ ] For brownfield: the approach states what exists, what changes, and what is new
- [ ] Risks are carried forward from the requirements package; new design-level risks are identified
- [ ] Dependencies and prerequisites are documented
- [ ] Document metadata is present (version, date, author, review status)
- [ ] The user has explicitly confirmed the solution overview is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Detailed design begins without a shared understanding of what problem is being solved | The business context summary ensures every reader starts from the same problem statement |
| Design sections are produced for areas that are out of scope, wasting effort | The solution scope explicitly lists included and omitted sections before design work begins |
| Design decisions are made without awareness of the constraints that should drive them | Key design drivers are collected and ranked before any design skill runs |
| Different design sections make inconsistent assumptions about the overall approach | The high-level solution approach provides a single reference point for all downstream skills |
| Risks from the requirements phase are forgotten during design | Risks are explicitly carried forward and each is noted as addressed or accepted |
| Design assumes a greenfield approach for a brownfield system, or vice versa | Project type is stated explicitly; brownfield approach references existing components |
| Frontend is designed for web when the target is mobile, or designed for a single platform when multiple are needed | Platform determination is documented in the scope sub-section before frontend design begins |
| Architectural constraints from discovery are invisible to the design phase | If discovery ran, constraints from the baseline are incorporated as design drivers |
| The design begins without the user confirming the framing is correct | The hand-off gate requires explicit user confirmation before any downstream design skill runs |
| A design driver is invented by the AI with no connection to any requirement or constraint | Every design driver must trace to a specific source in the traceability table; untraceable drivers are flagged |
