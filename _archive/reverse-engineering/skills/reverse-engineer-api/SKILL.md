---
name: reverse-engineer-api
description: >
  Reverse engineer an API repository into structured documentation. Produces three deliverables: Part A
  (internal API docs for maintainers), Part B1 (OpenAPI specification), and Part B2 (consumer companion
  guide). Use this skill whenever the user mentions documenting an API, reverse engineering API docs,
  extracting API documentation from source code, creating OpenAPI specs from existing code, or building
  API consumer guides. Also trigger for "document my REST API", "create API docs from code", "generate
  OpenAPI from source", or any request involving API documentation extraction.
---

# Reverse Engineer API Documentation

You are guiding the user through a systematic process of extracting documentation from an existing API
codebase. This produces three complementary deliverables from a single source of truth.

## Before You Start — Load Context

Read these documents in order:

1. `phases/canonical-reverse-engineering-shape.md` — Core AI Principles, 7-Step Workflow, Scaffolding, Change Tracking foundations
2. `phases/reverse-engineer-api-phase.md` — The complete API-specific process guide
3. `templates/api-internal-doc-template.md` — The output template for Part A
4. `../_shared/templates/change-tracker-template.md` — Change tracking structure

## Documentation Model

This phase produces THREE documentation parts:

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| **Part A** | API maintainers, contributors | Full internal implementation docs | Stays in the API repository |
| **Part B1** | API consumers, SDK generators | OpenAPI 3.x specification | Knowledge repository |
| **Part B2** | API consumers | Narrative companion guide (getting started, workflows, error handling) | Knowledge repository |

**Why three parts?** OpenAPI alone cannot express workflows, tutorials, getting started guides, or error handling strategies. The companion guide fills this gap. See the phase document's "Why OpenAPI Alone is Not Enough" section.

## Workflow

Follow the 7-Step Workflow as defined in the canonical RE shape, using the API-specific prompts and extraction order from the phase document:

### Phase 1: Discovery and Inventory
- Read the API source code to create a complete inventory of endpoints, middleware, services, entities
- Create `extraction-status.md` and `CHANGE-TRACKER.md`
- Use the `scaffold-documentation` skill or follow the phase document's scaffolding section

### Phase 2: Global Infrastructure
- Document the request pipeline, middleware, authentication, error handling, global configuration
- These inform every subsequent endpoint's documentation

### Phase 3: Feature-by-Feature Extraction
- For each feature module: read controller, DTOs, service, repository, entity, tests
- Extract Part A (internal implementation), Part B1 (OpenAPI paths/schemas), Part B2 (workflow examples)
- Verify all three parts for consistency after each feature

### Phase 4: Consumer Documentation
- Complete the companion guide (Part B2): Getting Started, Authentication, Pagination, Error Handling
- Complete cross-cutting OpenAPI components (Part B1): shared schemas, security, servers

### Phase 5: Verification and Finalization
- Use the `verify-extraction` skill to run the full checklist
- Validate the OpenAPI spec with a linter
- Log all changes using the `track-change` skill

## Key Rules

- **Source code is the single source of truth** — never trust Swagger annotations without verification
- **Read the full request pipeline** — middleware, guards, pipes, handler, interceptors, exception filters
- **Verify response shapes against response DTOs**, not entities
- **Document error responses from exception throws**, not assumptions
- **Keep all three parts synchronized** — use the Change Tracker cross-impact rules
- **Extract one feature at a time** — focused extraction produces accurate documentation
