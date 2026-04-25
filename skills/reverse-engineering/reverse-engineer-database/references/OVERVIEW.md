# reverse-engineer-database — Overview

## Purpose

Extract structured documentation from an existing database repository (DDL, migrations, stored procedures, triggers, views), producing three complementary parts: Part A (full internals for DBAs), Part B1 (data dictionary + ERD), and Part B2 (consumer guide for application developers).

## Position in the flow

```
analyze-repository  ──▶  reverse-engineer-database  ──▶  build-knowledge-base
                              │
                              ├─ Part A  → stays in source repo
                              ├─ Part B1 → KB (data dictionary + ERD)
                              └─ Part B2 → KB (consumer guide)
```

## Canonical RE foundations

- **Guiding Principle:** "If you cannot point to the line of source code that proves a documented behavior, do not document it as fact." For a database, "source code" is the DDL, migration files, and stored-procedure bodies — NOT ORM models.
- **Six AI Principles** apply.
- **7-Step Workflow** is the inner loop per extraction chunk.

## Documentation model — three parts

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | DBAs, database maintainers | Full internals: schema rationale, triggers, RLS, migration strategy, performance, replication, backup/restore | Stays in DB repo |
| Part B1 | App developers, analysts | Data dictionary + ERD + table/column reference | KB |
| Part B2 | App developers | Consumer guide: query patterns, transactions, performance considerations | KB |

**Why three parts?** A data dictionary alone (like OpenAPI alone for APIs) cannot express query patterns, transaction boundaries, performance considerations, or common access patterns. The consumer guide fills this gap.

## Why DDL is the source of truth

ORM model definitions can drift from the actual database (e.g. an indexed migration applied without updating the ORM, or a column type altered manually for performance). The verification step explicitly checks every documented type, constraint, and FK cascade against the DDL — never against the ORM.

## Extraction stages

1. **Discovery and Inventory** — tables, views, sprocs, functions, triggers, indexes, constraints, FK map. Run `steps/scaffold.md`.
2. **Schema Documentation** — per-table: columns, types, constraints, defaults, indexes, relationships. Naming conventions, schema organization.
3. **Stored Procedures and Business Logic** — per-sproc: parameters, return types, business logic, error handling, transaction boundaries.
4. **Cross-Cutting Concerns** — security (RLS, permissions, encryption), performance (indexing strategy, query patterns), migration strategy.
5. **Consumer Documentation and ERD** — generate ERD (Mermaid), complete data dictionary, write consumer guide.
6. **Verification and Finalization** — run `steps/verify.md` (DDL parity, FK cascade explicit, ERD parity), finalize change-tracker.

This is the only RE skill with **6 stages** instead of 5 — the additional stage exists because ERD generation + consumer guide composition is too substantial to fold into a single Stage 4.

## Compositions

- `templates/compositions/re-database-internal.yaml` — Part A
- `templates/compositions/re-database-consumer.yaml` — Part B (validation pass will surface coverage gaps)

## Hand-off

After verification passes, hand off by name to `build-knowledge-base`.
