---
name: reverse-engineer-web-app
description: "Use when the user asks to document a web application, front-end app, SPA, React/Angular/Vue/Svelte app, or any user-facing web application repository. Produces Part A (internal app docs) and Part B (app overview & integration guide). Do NOT use for frameworks/libraries — use reverse-engineer-ui-framework instead."
---

# Reverse Engineer Web Application Documentation

Drives a 5-stage extraction workflow that turns an existing web application codebase into two documentation parts: Part A (full internals for app developers) and Part B (overview & integration guide for other teams and the knowledge base).

## Overview

Web applications are technology-agnostic in this skill — the workflow is identical for React, Angular, Vue, Svelte, or any modern SPA. The substance is the same: routing, state, components, API integration, cross-cutting concerns. This skill captures both the developer-facing internals (Part A) and the integration-facing summary (Part B).

## When to use

- User asks to document a web application, front-end app, SPA
- The codebase is consumed by end users via a browser, not by other developers as a dependency
- User has been routed here by `analyze-repository` after web-app classification

## When NOT to use

- The repo is a UI framework / component library — use `reverse-engineer-ui-framework`
- The repo is a backend API — use `reverse-engineer-api`
- The repo is a mobile app — use `reverse-engineer-mobile-app`

## Inputs

- Path to the web application repository
- Source version being documented
- Reference: `references/elicitation-patterns/repo-scope-discovery.md` for scope-discovery elicitation
- Optional: existing app documentation, deployment runbooks

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | App developers, maintainers | Full internals: architecture, components, routing, state, styling, build | Stays in app repo |
| Part B | Other teams, integrators | App purpose, features, APIs consumed, deployment, team ownership | Knowledge base |

## Workflow

### Stage 1: Discovery and Inventory
- Inventory all routes, components, features, state management, API integrations
- Identify the framework (React/Angular/Vue/Svelte) and key patterns
- Run `steps/scaffold.md` to establish file structure for Part A and Part B BEFORE any content extraction

### Stage 2: Global Infrastructure
- Architecture, project structure, routing, state management, API service, auth, error handling, styling

### Stage 3: Feature-by-Feature Extraction
- For each feature: routing, components, state, API calls, guards
- Document both the implementation (Part A) and what external teams need to know (Part B)

### Stage 4: Cross-Cutting Concerns
- i18n, a11y, performance, security, testing, anti-patterns, dev workflows

### Stage 5: Verification and Finalization
- Run `steps/verify.md` to execute the full extraction-verification gate
- Log all changes using the `track-change` skill

## Key Rules

- **Technology-agnostic** — the process works for React, Angular, Vue, Svelte, or any framework
- **Part B focuses on what OTHER teams need** — purpose, API consumption, deployment, not internal details
- **Document the real data flow** — routing → state → API → rendering, not just individual components
- **Identify cross-cutting concerns once** — auth, error handling, styling apply to every feature

## Compositions

- `templates/compositions/re-web-app-internal.yaml` — Part A blocks
- `templates/compositions/re-web-app-consumer.yaml` — Part B blocks (validation pass will surface coverage gaps)

## Output

- Part A: `<repo>/docs/web-app-internal/` (stays in source repo)
- Part B: `<KB>/source-docs/<repo-slug>/web-app-consumer.md`
- `extraction-status.md` and `CHANGE-TRACKER.md` inside the source repo

## Next skill

`build-knowledge-base` — aggregates Part B into the central KB index.

## Common mistakes

- Documenting components in isolation without capturing the routing→state→API→render data flow
- Leaking internal component-implementation details into Part B
- Skipping cross-cutting concerns (i18n, a11y, perf) — they affect every feature
- Treating feature documentation as exhaustive — capture features, not every component
- Generating content during scaffolding — `steps/scaffold.md` produces structure-only
