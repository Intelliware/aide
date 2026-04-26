---
name: reverse-engineer-database
description: "Use when the user asks to document a database (schema, stored procedures, triggers, views), reverse-engineer a schema, extract database docs, create a data dictionary, or generate ERDs from existing database code. Produces Part A (internal DB docs for DBAs), Part B1 (data dictionary & ERD), and Part B2 (database consumer guide for application developers)."
---

# Reverse Engineer Database Documentation

Drives a 6-stage extraction workflow that turns an existing database repository into three complementary documentation deliverables: Part A (internal docs for DBAs), Part B1 (data dictionary & ERD), and Part B2 (consumer guide for application developers).

## Overview

Database documentation has three legitimate audiences (DBAs, query-pattern consumers, application developers) and a data dictionary alone — like OpenAPI alone for APIs — does not serve all three. This skill produces all three from a single coordinated pass against the DDL, migrations, stored procedures, and triggers.

## When to use

- User asks to document a database, schema, stored procedures, triggers, views
- User wants a data dictionary and ERD generated from existing DDL
- User wants a database consumer guide (query patterns, transaction boundaries, performance)
- User has been routed here by `analyze-repository` after database classification

## When NOT to use

- The repo is an API that happens to include a few migration files — `reverse-engineer-api` covers it; this skill becomes a secondary pass only if migrations + sprocs are non-trivial
- The repo is a NoSQL document store with no schema-as-code (e.g. ad-hoc Mongo) — adapt the workflow but be explicit that DDL-as-source-of-truth no longer applies

## Inputs

- Path to the database repository (or DDL/migration directory)
- Source version being documented (DB engine version + schema version)
- Reference: `references/elicitation-patterns/repo-scope-discovery.md` for scope-discovery elicitation
- Optional: existing data dictionary, ERD, runbooks

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | DBAs, database maintainers | Full internals: schema rationale, triggers, RLS, migration strategy, performance | Stays in DB repo |
| Part B1 | Application developers, analysts | Data dictionary, ERD, table/column reference | Knowledge base |
| Part B2 | Application developers | Consumer guide: how to query, write, handle transactions, common patterns | Knowledge base |

A data dictionary alone (like OpenAPI alone for APIs) cannot express query patterns, transaction boundaries, performance considerations, or common access patterns. The consumer guide fills this gap.

## Workflow

### Stage 1: Discovery and Inventory
- Inventory all tables, views, stored procedures, functions, triggers, indexes, constraints
- Map foreign key relationships for ERD generation
- Run `steps/scaffold.md` to establish file structure for Part A, Part B1, and Part B2 BEFORE any content extraction

### Stage 2: Schema Documentation
- For each table: columns, types, constraints, defaults, indexes, relationships
- Document naming conventions, schema organization

### Stage 3: Stored Procedures and Business Logic
- For each procedure/function: parameters, return types, business logic, error handling, transaction boundaries

### Stage 4: Cross-Cutting Concerns
- Security (RLS, permissions, encryption), performance (indexing strategy, query patterns), migration strategy

### Stage 5: Consumer Documentation and ERD
- Generate ERD (Mermaid format), complete data dictionary, write consumer guide

### Stage 6: Verification and Finalization
- Run `steps/verify.md` to execute the full extraction-verification gate
- Validate the ERD against actual FK constraints
- Log all changes using the `track-change` skill

## Key Rules

- **DDL is the source of truth** — verify column types, constraints, and defaults against actual DDL/migration files
- **Document FK cascade rules explicitly** — ON DELETE CASCADE vs RESTRICT matters enormously
- **Stored procedures need parameter-level documentation** — not just the signature
- **The consumer guide teaches query patterns** — not just schema structure
- **Indexes and partitioning are part of the contract** — they affect query plans visible to consumers

## Compositions

- `templates/compositions/re-database-internal.yaml` — Part A blocks
- `templates/compositions/re-database-consumer.yaml` — Part B blocks (validation pass will surface coverage gaps)

## Output

- Part A: `<repo>/docs/database-internal/` (stays in source repo)
- Part B1: `<KB>/source-docs/<repo-slug>/data-dictionary.md` + `erd.mmd`
- Part B2: `<KB>/source-docs/<repo-slug>/database-consumer-guide.md`
- `extraction-status.md` and `CHANGE-TRACKER.md` inside the source repo

## Next skill

`build-knowledge-base` — aggregates Part B1 + B2 into the central KB index.

## Common mistakes

- Documenting an ORM model as ground truth instead of the DDL
- Omitting FK cascade rules (ON DELETE / ON UPDATE behaviors)
- Stopping at schema and skipping stored-procedure business logic
- Producing a data dictionary without consumer query patterns
- Generating content during scaffolding — `steps/scaffold.md` produces structure-only
