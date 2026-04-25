# Database Design

## Purpose

Design data schemas, entity relationships, storage strategies, and migration approach for new and modified data structures. Consumes: the existing-architecture-assessment (existing data architecture, ORM configuration, schema conventions, data stores), the system-design (which components own which data), and the requirements package (data requirements for entity definitions and field-level contracts, business rules for validation logic and constraints, assumptions-constraints-scope for data constraints and retention requirements). For brownfield projects, designs schema changes as migrations from the current state — new tables/columns, modified columns, index changes — with explicit coexistence strategy (can old code and new code run against the same schema during deployment?). Covers: entity-relationship diagrams, schema definitions with constraints, schema evolution approach (additive vs. breaking), migration ordering relative to code deployment, data format conventions consistent with existing patterns, referential integrity across existing and new entities, and storage strategy for new data (same database, new database, cache layer). Produces database design that is Section 6 of the solution design package.

## What This Produces

The database schema for the feature — entities, relationships, constraints, indexes, and how the schema evolves from its current state. For brownfield projects, this is a migration plan: what exists, what changes, and how to get there safely. For greenfield projects, this is the full schema from scratch.

This is Section 6 of the solution design package. API design and backend design both depend on it — the API exposes data the schema defines, and the backend reads and writes through the data access patterns established here.

## When to Use

- Always included when the feature involves data persistence (new or modified data entities)
- Runs after `system-design` (Step 3) and before `api-design` (Step 5)
- May be omitted only if the feature has no data persistence impact (confirmed in the design workflow's Step 0)

## Inputs

| Input | Source | Required | If discovery was skipped |
|-------|--------|----------|--------------------------|
| System design | `docs/<feature>/solutions-package/design/03-system-design.md` — component map showing which components own which data, data flow paths | Yes | Yes |
| Technology stack | `docs/<feature>/solutions-package/design/02-technology-stack.md` — database type, version, ORM, migration tool, naming conventions | Yes | Yes |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — Section 5 (Data Architecture: existing data stores, schema management, access patterns, caching) | If discovery ran — identifies which entities are in the affected area and what ORM/migration tool is in use | Identifies affected entities from system design instead |
| Access to the codebase | Local filesystem or repository — ORM entity definitions, migration files, schema files | Yes (brownfield) — the AI reads the actual code to extract existing schema rather than asking the user to describe it | Yes if available; otherwise user provides schema description |
| Requirements package — data requirements | `docs/<feature>/requirements-package/requirements/data-requirements.md` — entities, attributes, relationships, data lifecycle, retention | Yes | Yes |
| Requirements package — business rules | `docs/<feature>/requirements-package/requirements/business-rules.md` — validation rules, constraints, computed fields, state transitions | Yes — determines where validation is enforced in the schema | Yes |
| Requirements package — NFRs | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` — performance targets, data volume expectations, query patterns | Yes — drives indexing and partitioning decisions | Yes |

> **Missing input guard:** If the requirements package or any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

## Did Discovery Run?

**Discovery ran** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` exists:

- Read Section 5 (Data Architecture) — existing data stores, access patterns, schema management approach, caching layers. This tells the AI which entities are in the affected area and where to look in the codebase.
- Note the schema management approach (migration tool, versioning strategy) — all new migrations must follow it.
- Note existing naming conventions (table names, column names, FK format, index naming) — new schema must match.
- Then proceed to Step 2, where the AI reads the actual codebase (ORM models, migration files, schema files) to extract the full column-level schema for the affected entities. The architecture baseline tells the AI *where to look*; the codebase provides the *actual schema*.

**Discovery was skipped** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` does not exist:

- For brownfield projects with codebase access: the AI uses the system design's component map to identify which modules to look in, then reads ORM models or migration files directly to extract the existing schema.
- For brownfield projects without codebase access: ask the user to describe the relevant existing tables/entities, their relationships, and the schema management approach (migration tool, naming conventions). Record as `user-stated`.
- For greenfield projects: no existing schema to reference. Proceed directly to designing the data model.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  1. LOAD — Read all inputs                                       │
│     Read system design (component-to-data ownership), technology │
│     stack (DB, ORM, migration tool, naming conventions),         │
│     requirements (data reqs, business rules, NFRs).              │
│     If discovery ran: read baseline Section 5.                   │
├──────────────────────────────────────────────────────────────────┤
│  2. MAP EXISTING — Extract existing schema from the codebase     │
│     (Brownfield only)                                            │
│     Use the baseline to identify which entities are in the       │
│     affected area, then read the actual codebase (ORM models,    │
│     migration files, schema files) to extract the full schema    │
│     — every column, type, constraint, index, and relationship.   │
│     Pre-populate the "before" picture from the code.             │
├──────────────────────────────────────────────────────────────────┤
│  3. DESIGN ENTITIES — Define new and modified entities            │
│     For each data requirement: define the entity, its            │
│     attributes, types, constraints, and relationships.           │
│     For modifications: specify what changes and what stays.      │
│     Build traceability to requirements.                          │
├──────────────────────────────────────────────────────────────────┤
│  4. RELATIONSHIPS — Define entity relationships                  │
│     Foreign keys, join tables, referential integrity.            │
│     For brownfield: relationships to existing entities.          │
│     Identify cascade rules (delete, update).                     │
├──────────────────────────────────────────────────────────────────┤
│  5. VALIDATION — Determine where validation is enforced          │
│     For each business rule: decide whether it is enforced at     │
│     the database level (constraints, triggers, check             │
│     constraints), ORM level (model validations), application     │
│     level (service layer), or multiple levels.                   │
├──────────────────────────────────────────────────────────────────┤
│  6. INDEXING — Design indexes for query performance              │
│     Based on NFRs (performance targets), expected query          │
│     patterns, and data volume expectations.                      │
│     For brownfield: check existing indexes — avoid duplicates.   │
├──────────────────────────────────────────────────────────────────┤
│  7. CACHING — Determine caching strategy per entity              │
│     For each entity or query pattern: does it need caching?      │
│     If yes: what cache (in-memory, Redis, CDN), TTL,             │
│     invalidation strategy.                                       │
│     If not: confirm no caching is needed and why.                │
├──────────────────────────────────────────────────────────────────┤
│  8. MIGRATION — Design the migration strategy                    │
│     (Brownfield only)                                            │
│     Migration ordering relative to code deployment.              │
│     Coexistence: can old code and new code run against the       │
│     same schema during deployment?                               │
│     Rollback: can the migration be reversed?                     │
├──────────────────────────────────────────────────────────────────┤
│  9. VALIDATE — Check against constraints and conventions         │
│     Naming conventions match technology stack standards.          │
│     Referential integrity is maintained.                         │
│     No constraint or NFR violations.                             │
│     Traceability is complete.                                    │
├──────────────────────────────────────────────────────────────────┤
│  10. ASSEMBLE — Write the database design section                │
│      Produce the structured output. Present for review.          │
└──────────────────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Load Inputs

Read all inputs. If the system design or technology stack is not yet complete, stop — this skill depends on both.

From the system design, note which components own which data. Each entity should be owned by exactly one component (the component that writes to it). Other components may read from it, but ownership determines where schema changes are initiated.

From the technology stack, note:
- Database type and version (e.g., PostgreSQL 16)
- ORM or data access layer (e.g., Hibernate 6.4, Prisma 5.x)
- Migration tool (e.g., Flyway, Liquibase, Prisma Migrate, Alembic)
- Naming conventions from the Standards and Conventions section

**Database design standards:** Based on the database type identified in the technology stack, read the corresponding database design standards file before proceeding to Step 2. These standards define the baseline patterns (naming conventions, data type selection, constraint design, indexing strategy, schema evolution, and data integrity patterns) that the AI uses when making design decisions in Steps 3–9 and validating conventions in Step 9.

| Database | Standards file |
|----------|---------------|
| PostgreSQL | `../assets/standards/database/POSTGRESQL-DESIGN-STANDARDS.md` |
| MySQL | `../assets/standards/database/MYSQL-DESIGN-STANDARDS.md` |
| Oracle | `../assets/standards/database/ORACLE-DESIGN-STANDARDS.md` |
| SQL Server | `../assets/standards/database/SQLSERVER-DESIGN-STANDARDS.md` |
| Database not listed | No standards file — use the AI's built-in knowledge of the database's design patterns |

If the database has a standards file, the AI uses it as the primary reference for naming conventions, type selection, constraint patterns, and indexing decisions — not built-in knowledge alone. Where the standards file and existing schema conventions differ, the AI flags the deviation and asks the user whether new schema should follow the existing pattern or adopt the standard.

**Version compatibility check:** After loading the standards file, compare the **Applies to** version in the standards file against the **actual database version** specified in the technology stack (Section 2). If the project's version is older than the standards' baseline version, alert the user:

**"The [database] design standards are written for [standards version, e.g., MySQL 8.0+], but the technology stack specifies [project version, e.g., MySQL 5.7.38]. Some standards may reference features unavailable in your version (e.g., CHECK constraints are not enforced in MySQL < 8.0.16). I'll flag version-gated recommendations as I encounter them and offer alternatives for your version. If you'd like, I can adjust the standards baseline to match your version."**

If the project version is equal to or newer than the standards baseline, no alert is needed — proceed normally.

**Ask for project-specific standards:** After loading any built-in database standards, ask the user:

**"Do you have any project-specific or organization-specific database design standards I should follow? This could include:**
- **Naming conventions** (custom table/column naming rules, abbreviation dictionaries)
- **Required columns** (standard audit columns, tenant ID columns, soft-delete conventions)
- **Indexing policies** (mandatory indexes, prohibited index types, performance review requirements)
- **Data classification rules** (PII handling, encryption-at-rest requirements, data residency constraints)
- **Schema governance** (DBA review requirements, migration approval process, schema change SLAs)

**If you have standards files, provide the path or link. I'll use them as the highest-priority reference — they override the built-in standards where they conflict."**

If the user provides project-specific standards:
- Load and read them before proceeding to Step 2
- Use them as the **highest-priority** reference: project-specific > built-in database standards > AI built-in knowledge
- Note any conflicts between project-specific and built-in standards; present the conflict and ask which takes precedence

If no project-specific standards exist, proceed with the built-in standards as the primary reference.

### Step 2 — Extract Existing Schema from the Codebase (Brownfield Only)

The AI has access to the codebase. Rather than asking the user to describe the existing schema, the AI reads the actual source files to extract it.

**Step 2a — Identify which entities are in the affected area.**

Use two sources to determine which entities to extract:
- The **system design** (Section 3) — the component map and data flow paths identify which components touch which data
- The **architecture baseline** Section 5 (if discovery ran) — lists data stores and which components access them

From these, build a list of entities the feature will read from, write to, or relate to.

**Step 2b — Read the codebase to extract the full schema.**

Based on the ORM and migration tool identified in the technology stack (Section 2), read the appropriate source files:

| ORM / Tool | What to read |
|-----------|-------------|
| **Prisma** | `schema.prisma` — model definitions, relations, indexes, enums |
| **Hibernate / JPA** | `@Entity` annotated classes — fields, `@Column` annotations, `@ManyToOne`/`@OneToMany` relations, `@Table` indexes |
| **TypeORM** | Entity classes with `@Entity`, `@Column`, `@ManyToOne`, `@Index` decorators |
| **Django ORM** | `models.py` — Model classes, field definitions, `Meta` class for indexes and constraints |
| **SQLAlchemy** | Model classes with `Column`, `ForeignKey`, `relationship`, `Index` definitions |
| **EF Core** | Entity classes + `DbContext` configuration — `HasKey`, `HasIndex`, `HasOne`/`HasMany` |
| **Raw SQL / Flyway / Liquibase** | Migration files in order — reconstruct current schema from the migration history |
| **Knex / Sequelize** | Migration files + model definitions |

For each entity in the affected area, extract:

| Column | Type | Nullable | Default | Constraints | Index |
|--------|------|----------|---------|-------------|-------|
| *(extracted from code)* | *(extracted from code)* | *(extracted from code)* | *(extracted from code)* | *(PK, FK, UNIQUE, CHECK — extracted from code)* | *(index name if indexed)* |

Also extract:
- **Relationships** — FK columns, relationship type (one-to-one, one-to-many, many-to-many), cascade rules as defined in the code
- **Existing indexes** — name, columns, type (btree, unique, partial)
- **Existing constraints** — CHECK constraints, UNIQUE constraints, NOT NULL
- **Enums or lookup values** — if status fields or type fields have defined values

**Step 2c — Present the extracted schema to the user.**

Present the full extracted schema: **"I've read the codebase and extracted the current schema for the entities in the affected area. Here is what I found — please confirm this is accurate, and let me know if there are any entities I've missed or anything the code doesn't reflect (e.g., database-level constraints added outside the ORM)."**

The user confirms, corrects, or adds entities the AI couldn't find in the code (e.g., tables managed by another team, views, stored procedures).

**If discovery was skipped and the AI has codebase access:**
- The AI can still read the codebase directly. Use the system design's component map to identify which modules/services to look in, then read ORM models or migration files from those modules.
- If the AI does not have codebase access, ask the user to describe the relevant existing tables/entities. Record as `user-stated`.

For greenfield projects, skip this step.

### Step 3 — Design New and Modified Entities

For each data requirement from the requirements package, design the entity:

**New entities:**

| Column | Type | Nullable | Default | Constraints | Notes |
|--------|------|----------|---------|-------------|-------|
| *(e.g., id)* | *(UUID)* | *(No)* | *(gen_random_uuid())* | *(PK)* | |
| *(e.g., order_id)* | *(UUID)* | *(No)* | | *(FK → orders.id)* | |
| *(e.g., reason)* | *(VARCHAR(500))* | *(No)* | | *(NOT NULL)* | *(Required per FR-01)* |
| *(e.g., status)* | *(VARCHAR(20))* | *(No)* | *('pending')* | *(CHECK IN ('pending','approved','rejected'))* | *(State machine per BR-03)* |
| *(e.g., created_at)* | *(TIMESTAMPTZ)* | *(No)* | *(NOW())* | | |

**Modified entities** — specify only the changes:

| Entity | Change | Column | Before | After | Reason |
|--------|--------|--------|--------|-------|--------|
| *(e.g., orders)* | *(Add column)* | *(refund_eligible)* | *(N/A)* | *(BOOLEAN DEFAULT true)* | *(FR-02: orders must track refund eligibility)* |
| *(e.g., orders)* | *(Add index)* | *(idx_orders_status_created)* | *(N/A)* | *(btree on (status, created_at))* | *(NFR-01: dashboard query < 500ms)* |

**Unchanged entities** — entities in the affected area that were evaluated and require no changes. State why.

### Step 4 — Define Entity Relationships

For each relationship between entities (existing-to-new, new-to-new, modified):

| From Entity | To Entity | Relationship | FK Column | Cascade Delete | Cascade Update | Status |
|------------|-----------|-------------|-----------|---------------|---------------|--------|
| *(refunds)* | *(orders)* | *(many-to-one)* | *(refunds.order_id → orders.id)* | *(RESTRICT)* | *(CASCADE)* | *(new)* |

For each cascade rule, state the rationale — why deleting/updating the parent should or should not propagate.

Include an ERD (entity-relationship diagram) if the relationships are complex enough to benefit from a visual. Use text-based notation if tools are unavailable:

```
orders (1) ──── (N) order_items
orders (1) ──── (N) refunds
refunds (1) ──── (N) refund_line_items
refund_line_items (N) ──── (1) order_items
```

### Step 5 — Determine Validation Enforcement

For each business rule from the requirements package that involves data validation, decide where it is enforced:

| Business Rule ID | Rule Description | Enforcement Layer | How Enforced |
|-----------------|-----------------|-------------------|--------------|
| *(BR-01)* | *(Refund amount cannot exceed order total)* | *(Database + Application)* | *(CHECK constraint on refunds table; service layer validates before insert)* |
| *(BR-02)* | *(Only orders in 'delivered' status can be refunded)* | *(Application)* | *(Service layer checks order status before creating refund; not a DB constraint because status transitions are business logic)* |
| *(BR-03)* | *(Refund status can only transition pending→approved or pending→rejected)* | *(Database + Application)* | *(CHECK constraint on status column; state machine enforced in service layer)* |

**Guiding principles for enforcement layer:**
- **Database level** — use for invariants that must hold regardless of which application writes to the database (NOT NULL, UNIQUE, CHECK, FK constraints). These are the last line of defense.
- **ORM/model level** — use for validations that benefit from richer logic than SQL constraints can express, but should run on every save (e.g., format validation, cross-field validation).
- **Application/service level** — use for business rules that depend on external state, involve multi-step logic, or need to produce user-friendly error messages.
- **Multiple levels** — use when the rule is critical enough that defense-in-depth is warranted. State explicitly that this is intentional redundancy, not accidental duplication.

### Step 6 — Design Indexes

Based on NFRs (performance targets), expected query patterns from functional requirements, and data volume expectations:

| Index Name | Table | Columns | Type | Rationale |
|-----------|-------|---------|------|-----------|
| *(idx_refunds_order_id)* | *(refunds)* | *(order_id)* | *(btree)* | *(FK lookup — every refund query joins on order_id)* |
| *(idx_refunds_status_created)* | *(refunds)* | *(status, created_at)* | *(btree)* | *(NFR-01: dashboard needs to query pending refunds sorted by date; expected 10k refunds/month)* |

**Data volume considerations.** For each new entity, state:
- Expected row count at launch and at 1 year
- Expected query patterns (which columns are filtered, sorted, or joined on)
- Whether partitioning should be considered (if volume warrants it)

For brownfield: check existing indexes on modified tables to avoid duplicates or conflicts.

### Step 7 — Determine Caching Strategy

For each entity or frequently queried data pattern, determine whether caching is needed:

| Entity / Query Pattern | Cache Needed? | Cache Type | TTL | Invalidation Strategy | Rationale |
|----------------------|--------------|-----------|-----|----------------------|-----------|
| *(e.g., refund status lookup)* | *(No)* | — | — | — | *(Low read frequency; always needs current state)* |
| *(e.g., order eligibility check)* | *(Yes)* | *(Redis)* | *(5 min)* | *(Invalidate on order status change)* | *(Called on every refund page load; eligibility changes infrequently)* |

If no entities need caching, state: **"No caching required — all data access patterns are adequately served by direct database queries given the expected volume and performance targets."**

### Step 8 — Design the Migration Strategy (Brownfield Only)

For each schema change, define the migration:

**Migration ordering:**

| Order | Migration | Description | Reversible? | Requires Downtime? |
|-------|-----------|-------------|------------|-------------------|
| 1 | *(Add refunds table)* | *(New table — additive, no impact on existing code)* | *(Yes — DROP TABLE)* | *(No)* |
| 2 | *(Add refund_eligible column to orders)* | *(New nullable column with default — additive)* | *(Yes — DROP COLUMN)* | *(No)* |
| 3 | *(Backfill refund_eligible for existing orders)* | *(Data migration — set refund_eligible based on order status and age)* | *(No — data transformation is not reversible)* | *(No — runs as background job)* |
| 4 | *(Add NOT NULL constraint to refund_eligible)* | *(Requires backfill to complete first)* | *(Yes — DROP CONSTRAINT)* | *(No)* |

**Coexistence strategy.** Can old code and new code run against the same schema during deployment?

- **Additive changes** (new tables, new nullable columns) — old code ignores them; coexistence is safe.
- **Breaking changes** (column removal, type change, NOT NULL on existing column) — old code will fail. These require a phased migration:
  1. Deploy schema change with backward compatibility (e.g., add new column, keep old column)
  2. Deploy new code that writes to both old and new columns
  3. Migrate data
  4. Deploy code that reads only from new column
  5. Remove old column in a later migration

For each breaking change, specify the phased approach. If all changes are additive, state: **"All schema changes are additive — old code can coexist safely with the new schema during deployment."**

**Migration tool.** All migrations must be written using the migration tool specified in the technology stack (Section 2). State the tool and the migration file naming convention.

### Step 9 — Validate

Check the completed database design against:

- **Naming conventions** — do all table names, column names, FK names, and index names follow the conventions from the technology stack (Section 2)?
- **Referential integrity** — are all FK relationships valid? Do cascade rules make sense?
- **NFRs** — are indexes sufficient for the performance targets? Are data volume expectations addressed?
- **Business rules** — is every business rule that involves data validation accounted for in the enforcement table (Step 5)?
- **System design** — does each entity belong to a component identified in the system design? Are there entities with no owning component?
- **Traceability** — does every new or modified entity trace to a data requirement or functional requirement?

### Step 10 — Assemble

Combine all sections into the database design output. This becomes Section 6 of the solution design package.

### File Output

Write the completed section to `docs/<feature>/solutions-package/design/06-data-model-design.md` using the template at `../assets/data-model-doc.md` as the output structure.

If this section was determined to be not applicable in the design workflow's Step 0, write a stub file containing: **"Not applicable — [rationale from scoping step]."**

---

## Output Structure

### For Brownfield Projects

**1. Existing Schema** — entities in the affected area with current columns, relationships, and indexes (from Step 2)

**2. Schema Delta**
- New entities (full definitions with columns, types, constraints)
- Modified entities (changes only, with before/after)
- Unchanged entities (with rationale for no change)

**3. Entity Relationships** — ERD and relationship table including new-to-existing relationships (from Step 4)

**4. Validation Enforcement** — business rules mapped to enforcement layers (from Step 5)

**5. Indexing Strategy** — new and modified indexes with rationale and data volume considerations (from Step 6)

**6. Caching Strategy** — per-entity caching decisions (from Step 7)

**7. Migration Strategy** — ordered migrations with coexistence strategy and rollback plan (from Step 8)

**8. Requirements Traceability** — every new or modified entity/column traces to the requirement that drives it

### For Greenfield Projects

**1. Entity Definitions** — all entities with full column definitions

**2. Entity Relationships** — ERD and relationship table (from Step 4)

**3. Validation Enforcement** — business rules mapped to enforcement layers (from Step 5)

**4. Indexing Strategy** — indexes with rationale and data volume considerations (from Step 6)

**5. Caching Strategy** — per-entity caching decisions (from Step 7)

**6. Requirements Traceability** — every entity/column traces to the requirement that drives it

---

## Requirements Traceability

Every new or modified schema element must trace to the requirement that drives it. Existing unchanged schema carries forward without traceability.

| Schema Element | Change Type | Requirement ID | Requirement Summary |
|---------------|------------|---------------|---------------------|
| *(refunds table)* | *(new)* | *(FR-01, DR-03)* | *(Users can submit refund requests; refund data entity)* |
| *(orders.refund_eligible column)* | *(modified — new column)* | *(FR-02)* | *(Orders must track refund eligibility)* |
| *(idx_refunds_status_created)* | *(new)* | *(NFR-01)* | *(Dashboard query performance < 500ms)* |

If a schema element cannot be traced to a requirement, it must be flagged and confirmed with the user before inclusion.

---

## Hand-off Gate

Before proceeding to `api-design`, you must:

1. Write the completed database design in full.
2. Present it to the user for review with the following questions:
   - **Entities:** Are the new and modified entities correct? Are any entities missing?
   - **Relationships:** Are the FK relationships and cascade rules correct?
   - **Validation:** Is the enforcement layer for each business rule appropriate? Should any rule be enforced at a different level?
   - **Indexes:** Are the indexes sufficient for the expected query patterns and data volumes?
   - **Caching:** Are the caching decisions correct? Is anything over-cached or under-cached?
   - **Migration (brownfield):** Is the migration ordering safe? Is the coexistence strategy adequate for your deployment approach?
   - **Traceability:** Is every new or modified schema element connected to a requirement?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the database design is accurate.

## Completion Criteria

- [ ] All data requirements from the requirements package are addressed — each has a corresponding entity or column
- [ ] For brownfield: existing schema in the affected area is extracted from the codebase (ORM models, migration files, schema files) with full column-level detail and confirmed by the user
- [ ] For brownfield: every entity is classified as new, modified (with change description), or unchanged (with rationale)
- [ ] If the AI has codebase access, existing schema is extracted from the actual code — not described from memory or guessed
- [ ] If the AI does not have codebase access, existing schema is elicited from the user and recorded as `user-stated`
- [ ] Entity relationships are defined with FK columns, cascade rules, and rationale
- [ ] Every business rule involving data validation is mapped to an enforcement layer (database, ORM, application, or multiple)
- [ ] Indexes are designed based on expected query patterns and data volume expectations
- [ ] Caching strategy is determined per entity (or confirmed as not needed)
- [ ] For brownfield: migration strategy is defined with ordering, coexistence strategy, and rollback plan
- [ ] All naming conventions follow the technology stack standards (Section 2)
- [ ] Requirements traceability is complete — every new or modified schema element traces to a requirement
- [ ] The user has explicitly confirmed the database design is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| API and backend design assume a schema that hasn't been defined | Database design runs before API and backend design; both reference this section |
| A new table is created without understanding existing tables it must relate to | Existing schema is extracted from the actual codebase — the AI reads ORM models and migration files to get the real column-level schema, not an approximation |
| Business rules are defined in requirements but have no database-level enforcement | Step 5 maps every business rule to an enforcement layer; rules that should be DB constraints are identified |
| Schema migration breaks running code during deployment | Coexistence strategy explicitly addresses whether old and new code can run against the same schema; breaking changes require phased migration |
| Indexes are an afterthought, leading to slow queries in production | Indexes are designed with data volume expectations and query patterns before the API or backend is built |
| Naming conventions are inconsistent between existing and new tables | Step 9 validates all names against the technology stack conventions |
| A data requirement has no corresponding entity or column, and the gap is discovered during implementation | The traceability table maps every requirement to schema elements; unmapped requirements are flagged |
| Caching decisions are deferred to implementation, leading to inconsistent approaches | Caching strategy is determined per entity during design, with explicit rationale for cache/no-cache decisions |
| Migration ordering causes FK violations or data integrity failures | Migration ordering is explicit, with dependencies between migrations stated |
| Schema change is deployed but cannot be rolled back when issues are found | Each migration states whether it is reversible and what the rollback approach is |
