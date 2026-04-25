---
name: create-requirements-package
description: >
  Create a Requirements Package (Phase 1 of the AI SDLC) — the comprehensive set of business requirements
  that drives solution design and implementation. Use this skill whenever the user mentions creating
  requirements, gathering requirements, building a requirements package, writing functional requirements,
  documenting business rules, creating user journeys, or starting Phase 1 of a new project. Trigger for
  "create requirements", "gather requirements", "build the requirements package", "start Phase 1",
  "document the business requirements", "what does the system need to do". This is the starting point
  for any new development effort.
---

# Create Requirements Package

You are guiding the user through creating a comprehensive Requirements Package — the stable business
foundation that drives all downstream phases (solution design, implementation).

## Before You Start — Load Context

1. `phases/create-requirements-package.md` — The complete requirements gathering process
2. `templates/00-index.md` — The index template that links all section files
3. `templates/requirements-package-completeness-tracker.md` — Completeness tracker for recording status of each file (Not Started, In Progress, Skipped, N/A, Complete)
4. `templates/01-*.md` through `templates/14-*.md` — Individual section templates (one file per section)
5. `../_shared/templates/change-tracker-template.md` — Change tracking structure
6. If a knowledge repository exists, read it for context about existing systems

## What the Requirements Package IS

- More comprehensive than a traditional BRD — covers business context, functional requirements, business
  rules, user journeys, data requirements, NFRs, and acceptance criteria
- **Stable foundation** — contains business logic unlikely to change
- **Excludes UI details** — changeable details like screen layouts belong in Solution Design
- **Drives everything downstream** — poor requirements lead to poor solutions and code

## The 9-Step Gathering Process

Follow the process defined in the phase document:

1. **Set Context** — establish project scope, objectives, and stakeholders
2. **Identify Stakeholders and Personas** — who uses the system and how
3. **Gather Functional Requirements** — what the system must do (FR numbering: FR[Area].[Feature].[Detail])
4. **Document Business Rules** — calculations, validations, state machines, conditional logic
5. **Create User Journeys** — functional flow user stories, more comprehensive than typical stories
6. **Define Data Requirements** — entities, attributes, relationships, sources
7. **Specify Permissions and Access Control** — role-based access matrix
8. **Define Non-Functional Requirements** — performance, security, scalability, compliance
9. **Establish Acceptance Criteria** — testable conditions for each requirement

## Workflow

### Phase 1: Context and Scope
- Read existing knowledge repository (if available) for system context
- Establish project objectives, stakeholders, constraints

### Phase 2: Requirements Gathering
- Work through the gathering process, one step at a time
- **After Steps 1-3, run the File Relevance Recommendation** (Step 4 of the gathering process) — AI reviews all template files against gathered context and recommends which to fill in, skip, or mark N/A. User confirms or overrides. Update the completeness tracker.
- **During content creation**, if a file's relevance comes into question, use the Section Relevance Check (Step 0 of the 7-Step Workflow) to re-evaluate. User can say Yes, No (with reason), Skip (come back later), or Not sure (explain and re-ask).
- **After all files**, review the completeness tracker for any "Skipped" files and prompt the user to revisit them.
- Use the 7-Step Workflow from the phase document for each file
- Apply scaffolding: create the template structure first, then fill file by file

### Phase 3: Review and Refinement
- Cross-reference requirements for consistency
- Build the traceability matrix
- Review with stakeholders

### Phase 4: Finalization
- Complete all template sections
- Log in Change Tracker
- Package for handoff to Solution Design

## Key Rules

- **Requirements are STABLE, solution details are CHANGEABLE** — if it's a UI detail or technology choice, it belongs in Solution Design
- **Use FR numbering convention** — FR[Area].[Feature].[Detail] for traceability
- **One section per file** — each section is a separate file for easier AI consumption and maintenance
- **Scaffolding before content** — copy the template files, run relevance checks, then fill section by section
- **Verify understanding constantly** — have AI summarize before proceeding
- **The knowledge repository provides context** — use it to understand existing systems the new solution interacts with
