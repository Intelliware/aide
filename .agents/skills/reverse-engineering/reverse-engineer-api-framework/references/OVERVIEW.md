# reverse-engineer-api-framework — Overview

## Purpose

Extract structured documentation from an existing API/backend framework, producing two complementary parts: Part A (full internals for maintainers) and Part B (implementer documentation for API developers consuming the framework as a dependency).

## Position in the flow

```
analyze-repository  ──▶  reverse-engineer-api-framework  ──▶  build-knowledge-base
                              │
                              ├─ Part A → stays in source repo
                              └─ Part B → KB
```

## Canonical RE foundations

- **Guiding Principle:** "If you cannot point to the line of source code that proves a documented behavior, do not document it as fact."
- **Six AI Principles** apply (see canonical RE shape).
- **7-Step Workflow** is the inner loop per extraction chunk.

## Documentation model — two parts

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Framework maintainers | Full internals: architecture, request pipeline, DI, build/publish, internal patterns | Stays in framework repo |
| Part B | API developers using the framework | Public API, extension points, configuration, patterns, recipes | KB |

**Strict subset rule:** Part B ⊆ Part A. Every entry in Part B must have a corresponding entry in Part A. The verification step checks this.

## Why API frameworks differ from API services

- Consumers are **other developers**, not end users via HTTP.
- Value lives in **extension points** and **configuration surface**, not endpoint behavior.
- Documentation must distinguish "internal implementation" from "what consumers can rely on".
- The request-pipeline contract IS the public API.

## Extraction stages

1. **Discovery and Inventory** — middleware, services, decorators, guards, interceptors, pipes, DI tokens, configuration options. Run `steps/scaffold.md`.
2. **Foundation** — framework architecture, request pipeline ordering, DI system, configuration model, error handling conventions.
3. **Component-by-Component Extraction** — public API + configuration options + extension points + behavior, one component at a time. Mark each piece as Part A only or Part A + Part B.
4. **Patterns, Recipes, and Migration** — common usage patterns, anti-patterns, testing utilities, version migration guides.
5. **Verification and Finalization** — run `steps/verify.md` (with the Part B subset check), finalize change-tracker.

## Compositions

- `templates/compositions/re-api-framework-internal.yaml` — Part A
- `templates/compositions/re-api-framework-consumer.yaml` — Part B

## Hand-off

After verification passes, hand off by name to `build-knowledge-base`.
