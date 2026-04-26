# reverse-engineer-database — Inputs and Outputs

## Inputs

### Required

- **Repository path** — absolute path to the database repository (or DDL/migration directory).
- **Source version** — DB engine version (e.g. PostgreSQL 16) + schema version (from migration tool).

### Optional

- Existing data dictionary, ERD, or runbooks (treat as input to verify, not as a replacement)
- Sample queries from consuming applications (reveal real query patterns)
- EXPLAIN/EXPLAIN ANALYZE output from production (informs index documentation)

### Elicitation

Reference: `references/elicitation-patterns/repo-scope-discovery.md`. Used to confirm:
- Repository path and version
- DB engine and version (PostgreSQL, SQL Server, MySQL, Oracle, etc.)
- Migration tool (Flyway, Liquibase, sqitch, custom, etc.)
- Whether RLS / row-level security is in use
- Whether replication / read replicas exist
- Encryption posture (at-rest, in-transit, column-level)
- Scope exclusions (deprecated schemas, archive/staging tables not part of the active model)

### Project.toml driving values

```toml
[[project.repos]]
code = "orderhub-db"
name = "OrderHub Database"
path = "../orderhub-db"
role = "database"
type = "postgresql-16"
```

## Outputs

### Part A — Internal documentation (stays in source repo)

Default location: `<repo>/docs/database-internal/` driven by `re-database-internal.yaml`. Coverage:

- Database overview
- Environment and configuration
- Schema overview and ERD (internal version with rationale)
- Naming conventions
- Tables — detailed documentation
- Views and materialized views
- Stored procedures and functions
- Triggers
- Indexes and partitioning strategy
- Migrations and schema management
- Security (RLS, permissions, encryption)
- Replication, HA, backup/restore
- Performance considerations
- Operational runbooks

### Part B1 — Data dictionary + ERD

Location: `{paths.knowledge_base_path}/source-docs/<repo-slug>/data-dictionary.md` plus `erd.mmd`. Coverage:

- ERD (Mermaid) covering all tables and FK relationships
- Per-table reference: name, schema, purpose, columns (name, type, nullability, default, description), indexes, constraints
- Per-view reference
- Glossary of domain entities

### Part B2 — Consumer guide

Location: `{paths.knowledge_base_path}/source-docs/<repo-slug>/database-consumer-guide.md` driven by `re-database-consumer.yaml`. Coverage:

- Connection setup and credentials
- Common query patterns (read paths, write paths)
- Transaction boundaries and isolation levels
- Pagination and large-result-set strategies
- Performance considerations (index usage, hot tables)
- Anti-patterns (full-table scans, lock escalation triggers)
- Sproc reference for application developers

### Side artifacts

- `extraction-status.md` — inventory checklist
- `CHANGE-TRACKER.md` — Parts Affected = A / B1 / B2 / All

## Hand-off contract

`build-knowledge-base` consumes:
- Part B1 paths (data dictionary + ERD)
- Part B2 path (consumer guide)
- Repo-slug
- `last_verified_against_commit` SHA
- Cross-references to consuming repos (so KB can build dependency edges to APIs/apps that read this DB)
