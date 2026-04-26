---
name: reverse-engineer-ui-framework
description: "Use when the user asks to document a UI framework, component library, design system codebase, Angular/React/Vue library, or reusable UI components. Produces Part A (full framework docs) and Part B (implementer docs for app developers using the library). Do NOT use for application repositories — use reverse-engineer-web-app instead."
---

# Reverse Engineer UI Framework Documentation

Drives a 5-stage extraction workflow that turns an existing UI framework / component library into two documentation parts: Part A (full internals for framework maintainers) and Part B (implementer docs for app developers consuming the library).

## Overview

UI frameworks differ from web apps: they are consumed by other developers as a dependency rather than by end users via a browser. Their value lives in their public component surface, design tokens, and composition philosophy. This skill captures both the framework's internals (Part A) and the strict subset that consumers need (Part B).

## When to use

- User asks to document a UI framework, component library, design system codebase
- The codebase publishes reusable UI components consumed by other apps
- User has been routed here by `analyze-repository` after UI-framework classification

## When NOT to use

- The repo is a single web application that uses third-party components — use `reverse-engineer-web-app`
- The repo is a backend framework — use `reverse-engineer-api-framework`
- The repo is a mobile UI library — use `reverse-engineer-mobile-framework`

## Inputs

- Path to the UI framework repository
- Source version being documented
- Reference: `references/elicitation-patterns/repo-scope-discovery.md` for scope-discovery elicitation
- Optional: existing implementer documentation, Storybook, design tokens

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Framework maintainers | Full internals, architecture, private APIs, build system | Stays in framework repo |
| Part B | App developers using the framework | Public API, components, services, patterns, recipes | Knowledge base |

**Rule:** Part B is always a strict subset of Part A.

## Workflow

### Stage 1: Discovery and Inventory
- Inventory all components, services, directives, pipes, DI tokens
- Record source paths, public API surfaces, and dependencies
- Run `steps/scaffold.md` to establish file structure for Part A and Part B BEFORE any content extraction

### Stage 2: Foundation
- Framework overview, architecture, configuration, theming, design tokens
- Shared types, interfaces, enums

### Stage 3: Component-by-Component Extraction
- For each component: read TS/JS source, template, styles, tests
- Document every @Input, @Output, prop, slot, method, content projection
- Verify defaults against actual property initializers, not assumptions

### Stage 4: Services, Directives, Patterns
- Services, directives, pipes, DI tokens
- Common patterns and recipes, anti-patterns
- Testing utilities for consumers

### Stage 5: Verification and Finalization
- Run `steps/verify.md` to execute the full extraction-verification gate
- Validate the Part B subset rule (every Part B item must exist in Part A)
- Log all changes using the `track-change` skill

## Key Rules

- **Part B is a strict subset of Part A** — never put something in Part B that isn't in Part A
- **Verify every @Input, @Output, prop, and method against source** — AI invents plausible but wrong defaults
- **Document one component at a time** — focused extraction prevents hallucination
- **Include the framework's philosophy** — consumers need to understand design intent, not just API surface

## Compositions

- `templates/compositions/re-ui-framework-internal.yaml` — Part A blocks
- `templates/compositions/re-ui-framework-consumer.yaml` — Part B blocks (validation pass will surface coverage gaps)

## Output

- Part A: `<repo>/docs/ui-framework-internal/` (stays in source repo)
- Part B: `<KB>/source-docs/<repo-slug>/ui-framework-consumer.md`
- `extraction-status.md` and `CHANGE-TRACKER.md` inside the source repo

## Next skill

`build-knowledge-base` — aggregates Part B into the central KB index.

## Common mistakes

- Inventing default values for inputs/props instead of reading the property initializers
- Documenting framework internals in Part B and leaking abstraction
- Skipping the framework philosophy / design intent — consumers need to know "why this shape"
- Omitting content projection / slot documentation — critical for consumer composition
- Generating content during scaffolding — `steps/scaffold.md` produces structure-only
