---
name: reverse-engineer-web-app
description: >
  Reverse engineer a web front-end application into structured documentation. Produces Part A (internal
  app docs for developers) and Part B (app overview & integration guide for the knowledge repository).
  Use this skill whenever the user mentions documenting a web application, front-end app, SPA, React app,
  Angular app, Vue app, or any user-facing web application repository. Trigger for "document the web app",
  "reverse engineer the front-end", "extract app docs". Do NOT use for frameworks/libraries — use
  reverse-engineer-ui-framework instead.
---

# Reverse Engineer Web Application Documentation

You are guiding the user through extracting documentation from an existing web application codebase.

## Before You Start — Load Context

1. `phases/canonical-reverse-engineering-shape.md` — Foundations
2. `phases/reverse-engineer-web-app-phase.md` — Web App-specific process
3. `templates/web-app-doc-template.md` — Output template
4. `../_shared/templates/change-tracker-template.md` — Change tracking

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| **Part A** | App developers, maintainers | Full internals: architecture, components, routing, state, styling, build | Stays in app repo |
| **Part B** | Other teams, integrators | App purpose, features, APIs consumed, deployment, team ownership | Knowledge repository |

## Workflow

Follow the 7-Step Workflow with Web App-specific guidance:

### Phase 1: Discovery and Inventory
- Inventory all routes, components, features, state management, API integrations
- Identify the framework (React/Angular/Vue/Svelte) and key patterns

### Phase 2: Global Infrastructure
- Architecture, project structure, routing, state management, API service, auth, error handling, styling

### Phase 3: Feature-by-Feature Extraction
- For each feature: routing, components, state, API calls, guards
- Document both the implementation (Part A) and what external teams need to know (Part B)

### Phase 4: Cross-Cutting Concerns
- i18n, a11y, performance, security, testing, anti-patterns, dev workflows

### Phase 5: Verification and Finalization
- Use `verify-extraction` and `track-change` skills

## Key Rules

- **Technology-agnostic** — the process works for React, Angular, Vue, Svelte, or any framework
- **Part B focuses on what OTHER teams need** — purpose, API consumption, deployment, not internal details
- **Document the real data flow** — routing → state → API → rendering, not just individual components
