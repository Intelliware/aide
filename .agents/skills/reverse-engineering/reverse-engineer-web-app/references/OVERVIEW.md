# reverse-engineer-web-app — Overview

## Purpose

Extract structured documentation from an existing web application (SPA, MPA, SSR/CSR hybrid), producing two complementary parts: Part A (full internals for app developers) and Part B (overview & integration guide for other teams).

## Position in the flow

```
analyze-repository  ──▶  reverse-engineer-web-app  ──▶  build-knowledge-base
                              │
                              ├─ Part A → stays in source repo
                              └─ Part B → KB
```

## Canonical RE foundations

- **Guiding Principle:** "If you cannot point to the line of source code that proves a documented behavior, do not document it as fact."
- **Six AI Principles** apply.
- **7-Step Workflow** is the inner loop per extraction chunk.

## Documentation model — two parts

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | App developers, maintainers | Full internals: architecture, components, routing, state, styling, build, deployment | Stays in app repo |
| Part B | Other teams, integrators | App purpose, features, APIs consumed, deployment, team ownership | KB |

## Technology agnosticism

The workflow is identical for React, Angular, Vue, Svelte, SolidJS, or any modern web framework. The substance you document is the same: routing, state, components, API integration, cross-cutting concerns. Only the syntax of source-code references differs.

## Extraction stages

1. **Discovery and Inventory** — routes, components, features, state slices, API integrations, framework, build tooling. Run `steps/scaffold.md`.
2. **Global Infrastructure** — architecture, project structure, routing, state management, API service, auth, error handling, styling.
3. **Feature-by-Feature Extraction** — for each feature: routing, components, state slice, API calls, guards. Document Part A (implementation) and Part B (what other teams need).
4. **Cross-Cutting Concerns** — i18n, a11y, performance, security, testing, anti-patterns, dev workflows.
5. **Verification and Finalization** — run `steps/verify.md`, finalize change-tracker.

## What to avoid

- Documenting components without their data-flow context (routing → state → API → render)
- Capturing every component instead of every feature
- Leaking internals into Part B (which serves integrators, not contributors)

## Compositions

- `templates/compositions/re-web-app-internal.yaml` — Part A
- `templates/compositions/re-web-app-consumer.yaml` — Part B (validation pass will surface coverage gaps)

## Hand-off

After verification passes, hand off by name to `build-knowledge-base`.
