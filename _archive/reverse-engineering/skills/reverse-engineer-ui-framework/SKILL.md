---
name: reverse-engineer-ui-framework
description: >
  Reverse engineer a UI framework or component library into structured documentation. Produces Part A
  (full framework docs for maintainers) and Part B (implementer docs for app developers). Use this skill
  whenever the user mentions documenting a UI framework, component library, design system codebase,
  Angular/React/Vue library, or reusable UI components. Trigger for "document the component library",
  "reverse engineer the UI framework", "extract framework docs", or any request to document a reusable
  front-end framework from source code. Do NOT use for application repositories — use reverse-engineer-web-app instead.
---

# Reverse Engineer UI Framework Documentation

You are guiding the user through extracting documentation from an existing UI framework/component library.

## Before You Start — Load Context

1. `phases/canonical-reverse-engineering-shape.md` — Foundations
2. `phases/reverse-engineer-ui-framework-phase.md` — UI Framework-specific process
3. `templates/ui-framework-doc-template.md` — Output template
4. `../_shared/templates/change-tracker-template.md` — Change tracking

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| **Part A** | Framework maintainers | Full internals, architecture, private APIs, build system | Stays in framework repo |
| **Part B** | App developers using the framework | Public API, components, services, patterns, recipes | Knowledge repository |

**Rule:** Part B is always a strict subset of Part A.

## Workflow

Follow the 7-Step Workflow with UI Framework-specific guidance from the phase document:

### Phase 1: Discovery and Inventory
- Inventory all components, services, directives, pipes, DI tokens
- Record source paths, public API surfaces, and dependencies

### Phase 2: Foundation
- Framework overview, architecture, configuration, theming, design tokens
- Shared types, interfaces, enums

### Phase 3: Component-by-Component Extraction
- For each component: read TS source, template, styles, tests
- Document every @Input, @Output, method, content projection slot
- Verify defaults against actual property initializers, not assumptions

### Phase 4: Services, Directives, Patterns
- Services, directives, pipes, DI tokens
- Common patterns and recipes, anti-patterns
- Testing utilities for consumers

### Phase 5: Verification and Finalization
- Use `verify-extraction` skill
- Log changes using `track-change` skill

## Key Rules

- **Part B is a strict subset of Part A** — never put something in Part B that isn't in Part A
- **Verify every @Input, @Output, and method against source** — AI invents plausible but wrong defaults
- **Document one component at a time** — focused extraction prevents hallucination
- **Include the framework's philosophy** — consumers need to understand design intent, not just API surface
