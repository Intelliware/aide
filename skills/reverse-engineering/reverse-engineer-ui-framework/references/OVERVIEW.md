# reverse-engineer-ui-framework — Overview

## Purpose

Extract structured documentation from an existing UI framework / component library / design system codebase, producing two complementary parts: Part A (full internals for framework maintainers) and Part B (implementer documentation for app developers using the library as a dependency).

## Position in the flow

```
analyze-repository  ──▶  reverse-engineer-ui-framework  ──▶  build-knowledge-base
                              │
                              ├─ Part A → stays in source repo
                              └─ Part B → KB
```

## Canonical RE foundations

- **Guiding Principle:** "If you cannot point to the line of source code that proves a documented behavior, do not document it as fact."
- **Six AI Principles** apply (especially "AI Will Try to Do More Than Asked" — defaults are the most-hallucinated artifact in UI framework documentation).
- **7-Step Workflow** is the inner loop per extraction chunk.

## Documentation model — two parts

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Framework maintainers | Full internals: architecture, internal patterns, build/publish, private APIs | Stays in framework repo |
| Part B | App developers using the framework | Public API surface: components, services, directives, pipes, DI tokens, design tokens, theming, recipes | KB |

**Strict subset rule:** Part B ⊆ Part A. Every entry in Part B must have a corresponding entry in Part A.

## Why UI frameworks differ from web apps

- Consumers are **other developers**, not end users via a browser.
- Value lives in the **public component surface** + **design tokens** + **composition philosophy**.
- The framework's design intent IS part of the consumer's interface — they need to know the "why" to compose correctly.

## Extraction stages

1. **Discovery and Inventory** — components, services, directives, pipes, DI tokens, design tokens, theme system, build/publish. Run `steps/scaffold.md`.
2. **Foundation** — framework overview, architecture, configuration, theming, design tokens, shared types.
3. **Component-by-Component Extraction** — for each component: read source, template, styles, tests. Document every input/output/prop/slot/method. Verify defaults against actual initializers.
4. **Services, Directives, Patterns** — non-component public API + recipes + anti-patterns + testing utilities.
5. **Verification and Finalization** — run `steps/verify.md` (with the Part B subset check and the per-component default-verification check), finalize change-tracker.

## What to avoid

- Inventing default values that "look right" without reading the property initializers
- Documenting framework internals in Part B
- Skipping the framework philosophy section in Part B (consumers compose better with intent context)

## Compositions

- `templates/compositions/re-ui-framework-internal.yaml` — Part A
- `templates/compositions/re-ui-framework-consumer.yaml` — Part B (validation pass will surface coverage gaps)

## Hand-off

After verification passes, hand off by name to `build-knowledge-base`.
