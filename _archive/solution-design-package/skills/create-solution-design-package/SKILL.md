---
name: create-solution-design-package
description: >
  Create a Solution Design Package (Phase 2 of the AI SDLC) — the technical blueprint that translates
  requirements into a buildable plan. Use this skill whenever the user mentions creating a solution design,
  designing the solution, building technical specs, creating API designs, designing the database schema,
  choosing the technology stack, or starting Phase 2. Trigger for "create the solution design", "design
  the solution", "build the technical blueprint", "start Phase 2", "how should we build this", "create
  the architecture". Requires a completed Requirements Package as input.
---

# Create Solution Design Package

You are guiding the user through creating a Solution Design Package — the technical blueprint that
translates business requirements into implementation-ready specifications.

## Before You Start — Load Context

1. `phases/create-solution-design-package.md` — The complete solution design process
2. `templates/solution-design-package-template.md` — The output template
3. `../_shared/templates/change-tracker-template.md` — Change tracking structure
4. **Read the Requirements Package** — this is your primary input
5. If a knowledge repository exists, read it for architectural context

## What the Solution Design Package IS

- The **technical blueprint** bridging WHAT (requirements) and HOW (code)
- Covers: architecture, technology stack, frontend/backend design, API contracts, database schema,
  security, integration, deployment, testing strategy
- **Changeable** — unlike requirements, design decisions may evolve during implementation
- **Traceable** — every design decision maps back to one or more requirements

## The 11-Step Design Process

Follow the process defined in the phase document:

1. **Solution Overview** — architecture pattern, C4 diagrams
2. **Technology Stack** — frameworks, languages, databases with pinned versions
3. **Frontend Design** — routing, state management, component structure
4. **Backend Design** — layered architecture, domain model, API conventions
5. **API Design** — endpoint specifications, request/response schemas, error patterns
6. **Database Design** — table definitions, ERD, migration strategy
7. **Security Design** — authentication, authorization, data security
8. **Integration Design** — external services, workflows, state machines
9. **Deployment and DevOps** — environments, CI/CD, infrastructure
10. **Testing Strategy** — test pyramid, environments, data management
11. **NFR Technical Specs** — performance budgets, scalability targets

## Workflow

### Phase 1: Requirements Analysis
- Read and internalize the Requirements Package
- Identify key architectural drivers (NFRs, scale, security, integration)
- Map requirements to design areas

### Phase 2: Architecture and Technology
- Define the architecture pattern and create C4 diagrams
- Select and pin technology stack versions
- Create scaffolding for all design sections

### Phase 3: Detailed Design
- Work through each design area section by section
- Use the 7-Step Workflow for each section
- Ensure traceability back to requirements

### Phase 4: Review and Finalization
- Cross-reference all design sections for consistency
- Validate API contracts against frontend and backend designs
- Validate database schema against data requirements
- Log in Change Tracker

## Key Rules

- **Every design decision traces to a requirement** — if it doesn't, either the requirement is missing or the design is speculative
- **Technology choices must be explicit and pinned** — "latest" is not a version
- **API contracts must specify error responses** — not just success paths
- **Scaffolding before content** — create template structure first
- **The Requirements Package is your north star** — constantly reference it
