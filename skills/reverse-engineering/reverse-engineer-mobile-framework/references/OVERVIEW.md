# reverse-engineer-mobile-framework — Overview

## Purpose

Extract structured documentation from an existing mobile framework / library / SDK, producing two complementary parts: Part A (full internals for framework maintainers) and Part B (implementer documentation for app developers integrating the framework as a dependency). Covers Android (AAR), iOS (CocoaPod / SPM), and React Native (npm) — frequently from one repository.

## Position in the flow

```
analyze-repository  ──▶  reverse-engineer-mobile-framework  ──▶  build-knowledge-base
                              │
                              ├─ Part A → stays in source repo
                              └─ Part B → KB
```

## Canonical RE foundations

- **Guiding Principle:** "If you cannot point to the line of source code that proves a documented behavior, do not document it as fact."
- **Six AI Principles** apply (especially "Context is Critical" — multi-platform behavior diverges in subtle ways).
- **7-Step Workflow** is the inner loop per extraction chunk.

## Documentation model — two parts

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Framework maintainers | Full internals: architecture, build/publish, internal patterns, per-platform internals | Stays in framework repo |
| Part B | App developers using the framework | Public API, integration guide, per-platform usage, patterns, migration guides | KB |

**Strict subset rule:** Part B ⊆ Part A. Every entry in Part B must have a corresponding entry in Part A.

## Why mobile frameworks differ from mobile apps

- Consumers are **other developers**, not end users on devices.
- Value lives in the **public API surface** + **distribution mechanism** + **per-platform parity**.
- The distribution mechanism (AAR coords, Pod name, SPM URL, npm package) IS part of the public contract.
- Multi-platform support means most public APIs have **two or three implementations** to document and verify.

## Extraction stages

1. **Discovery and Inventory** — public classes, protocols/interfaces, configuration options, extension points; platform support matrix; distribution mechanism. Run `steps/scaffold.md`.
2. **Foundation** — framework architecture, platform support matrix, public API surface, configuration model.
3. **Component-by-Component Extraction** — for each public API: methods + parameters + return types + per-platform behavior + per-platform code examples.
4. **Integration, Patterns, Migration** — integration guide per platform, common patterns, anti-patterns, testing utilities, version migration guides.
5. **Verification and Finalization** — run `steps/verify.md` (with the Part B subset check, per-platform spot-checks, distribution-mechanism check), finalize change-tracker.

## What to avoid

- Documenting one platform thoroughly and skimming the others
- Omitting distribution-mechanism details
- Skipping per-platform code examples
- Letting Part A internals leak into Part B

## Compositions

- `templates/compositions/re-mobile-framework-internal.yaml` — Part A
- `templates/compositions/re-mobile-framework-consumer.yaml` — Part B (validation pass will surface coverage gaps)

## Hand-off

After verification passes, hand off by name to `build-knowledge-base`.
