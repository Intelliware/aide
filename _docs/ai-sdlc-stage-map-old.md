# AI SDLC Stage Map

This reference defines the navigation language for the AI SDLC workflow. It avoids using "package" as a navigation level and keeps the hierarchy focused on stages, phases, activities, and outputs.

## Naming Model

```text
AI SDLC
└── Stage
    ├── Phase
    │   └── Activity
    └── Output
        ├── Section
        └── Implementation Plan
            └── Implementation Unit
                └── Unit Section
                    └── Implementation Step
```

## Full Stage Map

```text
AI SDLC Stage Map
├── Stage 1: Requirements Specification
│   ├── Phase: Discovery
│   │   ├── Activity: Change Description Capture
│   │   ├── Activity: Current Capability Discovery
│   │   ├── Activity: Existing Artifact Review
│   │   └── Activity: Discovery Synthesis
│   │
│   ├── Phase: Analysis
│   │   ├── Activity: Scope Analysis
│   │   ├── Activity: Stakeholder Mapping
│   │   ├── Activity: Dependency Analysis
│   │   ├── Activity: Impact Analysis
│   │   ├── Activity: Gap Analysis
│   │   ├── Activity: Assumption / Decision Capture
│   │   └── Activity: Risk Analysis
│   │
│   ├── Phase: Authoring
│   │   ├── Activity: Executive Summary
│   │   ├── Activity: Stakeholder Personas
│   │   ├── Activity: Business Objectives
│   │   ├── Activity: User Journeys
│   │   ├── Activity: Functional Requirements
│   │   ├── Activity: Business Rules
│   │   ├── Activity: Data Requirements
│   │   ├── Activity: Permissions & Access Control
│   │   ├── Activity: Non-Functional Requirements
│   │   ├── Activity: Assumptions, Constraints & Scope
│   │   └── Activity: Requirements Stage Synthesis
│   │
│   ├── Phase: Review
│   │   ├── Activity: Completeness Review
│   │   ├── Activity: Consistency Review
│   │   ├── Activity: Measurability / Testability Review
│   │   ├── Activity: Traceability Review
│   │   ├── Activity: Feasibility Review
│   │   └── Activity: Handoff Readiness Decision
│   │
│   └── Output
│       ├── Section: Executive Summary
│       ├── Section: Stakeholder Personas
│       ├── Section: Business Objectives
│       ├── Section: User Journeys
│       ├── Section: Functional Requirements
│       ├── Section: Business Rules
│       ├── Section: Data Requirements
│       ├── Section: Permissions & Access Control
│       ├── Section: Non-Functional Requirements
│       ├── Section: Assumptions, Constraints & Scope
│       ├── Section: Stage Status
│       └── Section: Change Tracker
│
├── Stage 2: Solution Design
│   ├── Phase: Discovery
│   │   ├── Activity: Architecture Discovery
│   │   ├── Activity: Technical Debt Assessment
│   │   └── Activity: Existing Architecture Assessment
│   │
│   ├── Phase: Design
│   │   ├── Activity: Scope Design Sections
│   │   ├── Activity: Solution Overview
│   │   ├── Activity: Technology Stack
│   │   ├── Activity: Solution Architecture
│   │   ├── Activity: Data Model Design
│   │   ├── Activity: API Design
│   │   ├── Activity: Backend Design
│   │   ├── Activity: Frontend Design
│   │   ├── Activity: Integration Design
│   │   ├── Activity: Security Design
│   │   ├── Activity: Workflow / Business Rules Design
│   │   ├── Activity: Dashboard / Reporting Design
│   │   ├── Activity: Deployment / DevOps Design
│   │   ├── Activity: Observability Design
│   │   ├── Activity: Testing Strategy Design
│   │   └── Activity: Solution Stage Synthesis
│   │
│   ├── Phase: Review
│   │   ├── Activity: Architecture Review
│   │   ├── Activity: Security Posture Review
│   │   └── Activity: Implementation Readiness Decision
│   │
│   └── Output
│       ├── Section: Solution Overview
│       ├── Section: Technology Stack
│       ├── Section: Solution Architecture
│       ├── Section: Frontend Design
│       ├── Section: Backend Design
│       ├── Section: Database Design
│       ├── Section: API Design
│       ├── Section: Integration Design
│       ├── Section: Security Design
│       ├── Section: Workflow / Business Rules
│       ├── Section: Dashboard / Reporting
│       ├── Section: Deployment / DevOps
│       ├── Section: Observability
│       └── Section: Testing Strategy
│
└── Stage 3: Implementation Delivery
    ├── Phase: Planning
    │   ├── Activity: Codebase Analysis
    │   ├── Activity: Test Planning
    │   ├── Activity: Prerequisites Planning
    │   ├── Activity: Delivery Planning, if applicable
    │   ├── Activity: Project Context Generation
    │   ├── Activity: Implementation Plan Creation
    │   └── Activity: Plan Readiness Review
    │
    ├── Phase: Execution
    │   └── Activity: Execute Implementation Units
    │
    ├── Phase: PR / Handoff
    │   ├── Activity: PR Review
    │   ├── Activity: Commit Creation
    │   ├── Activity: PR Description Creation
    │   └── Activity: Changelog Generation, if applicable
    │
    └── Output
        └── Implementation Plan
            └── Implementation Unit
                ├── Unit Section: Identity
                ├── Unit Section: Goal
                ├── Unit Section: Dependencies
                ├── Unit Section: Implementation Steps
                │   ├── Implementation Step 1
                │   ├── Implementation Step 2
                │   └── Implementation Step 3
                ├── Unit Section: Outcome
                ├── Unit Section: Automated Verification
                ├── Unit Section: Human Verification
                └── Unit Section: Success Criteria
```

## Expedited Implementation Delivery

Expedited implementation delivery is a fast-track route for small-to-medium changes. It is not a fourth stage; it compresses the relevant discovery, planning, execution, verification, and PR handoff activities when separate Requirements Specification and Solution Design stages are not warranted.

