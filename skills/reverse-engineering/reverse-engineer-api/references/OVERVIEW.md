# reverse-engineer-api — Overview

## Purpose

Extract structured documentation from an existing API repository, producing three complementary parts in a single coordinated pass.

## Position in the flow

```
analyze-repository  ──▶  reverse-engineer-api  ──▶  build-knowledge-base
                          (this skill)
                              │
                              ├─ Part A → stays in source repo
                              ├─ Part B1 (OpenAPI) → KB
                              └─ Part B2 (companion guide) → KB
```

## Canonical RE foundations

This skill builds on the canonical reverse-engineering shape:

- **Guiding Principle:** "If you cannot point to the line of source code that proves a documented behavior, do not document it as fact. Flag it as 'UNVERIFIED — needs source confirmation' instead."
- **Six AI Principles:** AI is Intelligent But Not Smart; Context is Critical; AI Will Try to Do More Than Asked; Token Limitations Affect Depth; Verification is Non-Negotiable; AI Has Short Memory.
- **7-Step Workflow** (per extraction chunk): Set context of deliverable → Set context of audience/components → Refine feedback → Create scaffolding → Create content chunk-by-chunk → Add supporting documents → Verify understanding.

The 7-step workflow is the inner loop. The five workflow stages in SKILL.md are the outer loop — each stage runs the 7-step workflow over a different artifact set.

## Documentation model — three parts

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | API maintainers, contributors | Full internal implementation: layered architecture, DI, middleware, error handling, service patterns, ORM internals, business rules | Stays in the API repository |
| Part B1 | API consumers, SDK generators | OpenAPI 3.x spec | Knowledge base |
| Part B2 | API consumers (humans) | Narrative companion guide | Knowledge base |

**Why three parts?** OpenAPI alone cannot express workflows, tutorials, getting started guides, or error handling strategies. The companion guide fills this gap.

## Extraction stages

1. **Discovery and Inventory** — list every endpoint, middleware, service, entity. Run `steps/scaffold.md` to create empty file structure.
2. **Global Infrastructure** — request pipeline, auth, error handling, configuration. These inform every endpoint.
3. **Feature-by-Feature Extraction** — controller + DTOs + service + repository + entity + tests, one feature at a time.
4. **Consumer Documentation** — finalize Part B2 (Getting Started, Auth, Pagination, Errors) and cross-cutting OpenAPI (Part B1).
5. **Verification and Finalization** — run `steps/verify.md`, lint OpenAPI, finalize change-tracker.

## Quality chain

```
Source Code Accuracy → Documentation Accuracy → Downstream Consumer Accuracy
```

Verification is the gate that holds this chain together. Every documented fact must be traceable to a source code line; otherwise it must be flagged "UNVERIFIED" and resolved before finalization.

## Compositions

- `templates/compositions/re-api-internal.yaml` — drives Part A authoring (block set complete)
- `templates/compositions/re-api-consumer.yaml` — drives Part B authoring (block set is currently a stub; validation pass will surface the gap)

## Hand-off

After verification passes, hand off by name to `build-knowledge-base`. That skill aggregates Part B1 + Part B2 (and any other RE'd repos) into the central KB index.
