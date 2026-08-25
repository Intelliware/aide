# generate-re-skill — Worked Example

## Scenario

The user has been routed here from `analyze-repository`, which could not match `~/code/graphql-order-service` to any of the eleven existing RE domain types. The repository is a GraphQL API server built with Apollo Server and TypeScript.

User says: *"My repository doesn't match any of your existing types. It's a GraphQL server, not a REST API. Can you create a new RE skill for it?"*

## Stage 1 — Preliminary Stack Analysis

The skill reads the repository structure:

```
~/code/graphql-order-service/
├── package.json                 # apollo-server, graphql, type-graphql
├── src/
│   ├── schema/                  # .graphql schema files
│   ├── resolvers/               # Query and Mutation resolvers
│   ├── dataloaders/             # DataLoader instances for N+1 prevention
│   ├── directives/              # Custom schema directives (@auth, @rateLimit)
│   ├── context/                 # Request context builder
│   ├── services/                # Business logic
│   └── entities/                # TypeORM entities
└── codegen.yml                  # GraphQL code generator config
```

Detected characteristics:
- **Language:** TypeScript
- **Framework:** Apollo Server 4.x with type-graphql
- **Architectural style:** Schema-first with code generation
- **Key patterns:** Resolvers, DataLoaders, custom directives, context injection
- **Why existing types don't fit:**
  - Not `api` — no REST endpoints, no OpenAPI contract
  - Not `api-framework` — not a reusable library
  - Unique concerns: schema introspection, resolver chains, N+1 query prevention

**Proposed domain slug:** `graphql-server`

User confirms: *"Yes, 'graphql-server' is accurate."*

## Stage 2 — Web Research

The skill searches for current GraphQL documentation patterns:

- **Search queries:**
  - "GraphQL API documentation best practices 2026"
  - "Apollo Server documentation patterns"
  - "GraphQL schema documentation tools"

- **Key findings:**
  - Schema introspection enables auto-generated reference docs
  - Resolver documentation should include DataLoader dependencies
  - Custom directives need explicit documentation (not introspectable)
  - Context setup is critical for understanding auth/permissions
  - N+1 prevention patterns (DataLoaders) are a common documentation gap
  - Subscription patterns differ significantly from queries/mutations

- **Common documentation sections in the industry:**
  - Schema overview with type relationships
  - Authentication and authorization (often directive-based)
  - Query patterns and resolver chains
  - Mutation patterns with input validation
  - Subscription patterns (if applicable)
  - Error handling and extensions
  - Performance (DataLoaders, query complexity limits)

## Stage 3 — Define Template Structure

The skill proposes the Part A block list:

| Order | Block Slug | Title | Optional | Decision Gate |
|-------|------------|-------|----------|---------------|
| 110 | graphql-overview | GraphQL Service Overview | false | — |
| 120 | schema-architecture | Schema Architecture | false | — |
| 130 | type-system | Type System and Relationships | false | — |
| 140 | resolvers | Resolver Patterns | false | — |
| 150 | dataloaders | DataLoader Implementation | true | has_dataloaders |
| 160 | context-and-injection | Context and Dependency Injection | false | — |
| 170 | authentication-directives | Authentication and Authorization | false | — |
| 180 | custom-directives | Custom Directives | true | has_custom_directives |
| 190 | subscriptions | Subscription Patterns | true | has_subscriptions |
| 200 | input-validation | Input Validation | false | — |
| 210 | error-handling | Error Handling and Extensions | false | — |
| 220 | performance | Performance and Query Complexity | false | — |
| 230 | testing | Testing Resolvers and Schema | false | — |
| 240 | codegen | Code Generation Setup | true | has_codegen |
| 250 | build-and-deploy | Build and Deployment | false | — |

Part B (consumer) block list:

| Order | Block Slug | Title | Optional |
|-------|------------|-------|----------|
| 110 | getting-started | Getting Started | false |
| 120 | authentication | Authentication | false |
| 130 | querying | Querying Data | false |
| 140 | mutations | Making Changes | false |
| 150 | subscriptions | Real-time Updates | true |
| 160 | error-handling | Error Handling | false |
| 170 | best-practices | Best Practices | false |

User approves: *"This looks comprehensive. Add a block for federation if we ever expand to federated GraphQL."*

Skill adds: `| 260 | federation | Apollo Federation | true | has_federation |`

## Stage 4 — Generate Skill Artifacts

The skill generates:

**SKILL.md** (`reverse-engineer-graphql-server/SKILL.md`):
```markdown
---
name: reverse-engineer-graphql-server
description: "Use when the repository is a GraphQL API server (Apollo, Yoga, Mercurius, etc.)..."
---

# Reverse Engineer GraphQL Server Documentation

Drives a 5-stage extraction workflow that turns an existing GraphQL server codebase into Part A (internal docs) and Part B (consumer guide).

## Overview
...
```

**Compositions:**
- `templates/compositions/re-graphql-server-internal.yaml` — 16 blocks with decision gates
- `templates/compositions/re-graphql-server-consumer.yaml` — 7 blocks

**Block templates:**
- `templates/blocks/reverse-eng/graphql-server/internal/graphql-overview.md`
- `templates/blocks/reverse-eng/graphql-server/internal/schema-architecture.md`
- ... (14 more internal blocks)
- `templates/blocks/reverse-eng/graphql-server/consumer/getting-started.md`
- ... (6 more consumer blocks)

**Steps:**
- `reverse-engineer-graphql-server/steps/scaffold.md`
- `reverse-engineer-graphql-server/steps/verify.md`

## Stage 5 — Iterative Review

The skill presents each major section:

> **SKILL.md — Overview section:**
> ```markdown
> GraphQL servers differ from REST APIs in several ways that affect documentation...
> ```
> **Rationale:** This explains why a separate skill is needed and sets expectations for what the documentation will cover.

User requests: *"Emphasize that schema introspection doesn't replace documentation — directives, business rules, and performance characteristics aren't introspectable."*

Skill updates the Overview section accordingly.

After three iterations, user approves all artifacts.

## Stage 6 — Execution Option

Skill asks:

> The `reverse-engineer-graphql-server` skill is ready. Would you like to:
>
> **A) Run it now** — I'll document `~/code/graphql-order-service` using the new skill.
>
> **B) Save for later** — The skill is registered. Invoke it later with: *"Reverse engineer my GraphQL server at ~/code/graphql-order-service."*

User chooses A.

## Hand-off

Skill emits:

> "Handing off to `reverse-engineer-graphql-server` to document `~/code/graphql-order-service`. The extraction will follow the standard 5-stage workflow and end at the close-out gate."

The new skill takes over and begins Stage 1 (Discovery and Inventory).

## Generated Artifacts Summary

```
.agents/skills/reverse-engineering/reverse-engineer-graphql-server/
├── SKILL.md                                    # 142 lines
├── references/
│   ├── OVERVIEW.md                             # 62 lines
│   ├── INPUTS-OUTPUTS.md                       # 108 lines
│   └── EXAMPLE.md                              # 103 lines
└── steps/
    ├── scaffold.md                             # 90 lines
    └── verify.md                               # 85 lines

templates/compositions/
├── re-graphql-server-internal.yaml             # 16 blocks
└── re-graphql-server-consumer.yaml             # 7 blocks

templates/blocks/reverse-eng/graphql-server/
├── internal/                                   # 16 block templates
└── consumer/                                   # 7 block templates
```

The skill passes `python scripts/build-registry.py` validation and appears in the registry.
