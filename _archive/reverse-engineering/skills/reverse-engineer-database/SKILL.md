---
name: reverse-engineer-database
description: >
  Reverse engineer a database repository (schema, stored procedures, triggers, views) into structured
  documentation. Produces Part A (internal DB docs for DBAs), Part B1 (data dictionary & ERD), and
  Part B2 (database consumer guide for application developers). Use this skill whenever the user mentions
  documenting a database, reverse engineering schema, extracting database docs, documenting stored
  procedures, creating a data dictionary, or generating ERDs from existing database code. Trigger for
  "document the database", "reverse engineer the schema", "create a data dictionary", "document the
  stored procedures".
---

# Reverse Engineer Database Documentation

You are guiding the user through extracting documentation from an existing database repository.

## Before You Start — Load Context

1. `phases/canonical-reverse-engineering-shape.md` — Foundations
2. `phases/reverse-engineer-database-phase.md` — Database-specific process
3. `templates/database-doc-template.md` — Output template
4. `../_shared/templates/change-tracker-template.md` — Change tracking

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| **Part A** | DBAs, database maintainers | Full internals: schema rationale, triggers, RLS, migration strategy, performance | Stays in DB repo |
| **Part B1** | Application developers, analysts | Data dictionary, ERD, table/column reference | Knowledge repository |
| **Part B2** | Application developers | Consumer guide: how to query, write, handle transactions, common patterns | Knowledge repository |

**Why three parts?** A data dictionary alone (like OpenAPI alone for APIs) cannot express query patterns, transaction boundaries, performance considerations, or common access patterns. The consumer guide fills this gap.

## Workflow

### Phase 1: Discovery and Inventory
- Inventory all tables, views, stored procedures, functions, triggers, indexes, constraints
- Map foreign key relationships for ERD generation

### Phase 2: Schema Documentation
- For each table: columns, types, constraints, defaults, indexes, relationships
- Document naming conventions, schema organization

### Phase 3: Stored Procedures and Business Logic
- For each procedure/function: parameters, return types, business logic, error handling, transaction boundaries

### Phase 4: Cross-Cutting Concerns
- Security (RLS, permissions, encryption), performance (indexing strategy, query patterns), migration strategy

### Phase 5: Consumer Documentation and ERD
- Generate ERD (Mermaid format), complete data dictionary, write consumer guide

### Phase 6: Verification and Finalization

## Key Rules

- **DDL is the source of truth** — verify column types, constraints, and defaults against actual DDL/migration files
- **Document FK cascade rules explicitly** — ON DELETE CASCADE vs RESTRICT matters enormously
- **Stored procedures need parameter-level documentation** — not just the signature
- **The consumer guide teaches query patterns** — not just schema structure
