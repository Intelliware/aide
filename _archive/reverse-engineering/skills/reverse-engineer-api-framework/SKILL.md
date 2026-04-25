---
name: reverse-engineer-api-framework
description: >
  Reverse engineer an API/backend framework into structured documentation. Produces Part A (internal
  framework docs for maintainers) and Part B (implementer docs for API developers). Use this skill
  whenever the user mentions documenting a backend framework, API framework, server-side library,
  middleware framework, or reusable backend components. Trigger for "document the API framework",
  "reverse engineer the backend library", "extract framework docs for the backend". Do NOT use for
  individual API repositories — use reverse-engineer-api instead.
---

# Reverse Engineer API Framework Documentation

You are guiding the user through extracting documentation from an existing API/backend framework.

## Before You Start — Load Context

1. `phases/canonical-reverse-engineering-shape.md` — Foundations
2. `phases/reverse-engineer-api-framework-phase.md` — API Framework-specific process
3. `templates/api-framework-doc-template.md` — Output template
4. `../_shared/templates/change-tracker-template.md` — Change tracking

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| **Part A** | Framework maintainers | Full internals: architecture, middleware pipeline, DI, build, internal patterns | Stays in framework repo |
| **Part B** | API developers using the framework | Public API, extension points, configuration, patterns, recipes | Knowledge repository |

**Rule:** Part B is always a strict subset of Part A.

## Workflow

Follow the 7-Step Workflow with API Framework-specific guidance:

### Phase 1: Discovery and Inventory
- Inventory middleware, services, decorators, guards, interceptors, pipes, DI tokens, configuration options

### Phase 2: Foundation
- Framework architecture, request pipeline, DI system, configuration, error handling conventions

### Phase 3: Component-by-Component Extraction
- For each component: public API, configuration options, extension points, behavior
- Distinguish between internal implementation and consumer-facing API

### Phase 4: Patterns, Recipes, and Migration
- Common usage patterns, anti-patterns, testing utilities, migration guides

### Phase 5: Verification and Finalization

## Key Rules

- **Document the request pipeline thoroughly** — this is the heart of an API framework
- **Extension points are critical** — consumers need to know exactly how to customize behavior
- **Configuration options need actual defaults verified against source code**
- **Part B is a strict subset of Part A**
