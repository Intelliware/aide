# PostgreSQL Database Design Standards

**Applies to:** PostgreSQL 14+. Features gated on specific versions are noted inline (e.g., `GENERATED ALWAYS AS IDENTITY` requires PostgreSQL 10+, metadata-only `DEFAULT` on `ADD COLUMN` requires PostgreSQL 11+, `MERGE` statement requires PostgreSQL 15+). For older PostgreSQL versions, the design patterns still apply — use the version-appropriate syntax.

These are the baseline standards the AI uses when designing PostgreSQL schemas in the solutions package. During Step 3 of the data model design skill, the AI compares existing schema conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new schema should follow the existing pattern or adopt the standard.

These standards operate at the **design level** — they guide architectural decisions about data types, naming, constraints, indexing, and schema evolution. They do not prescribe ORM configuration, connection pooling settings, or operational concerns (backup, replication, monitoring). Implementation-level rules are covered separately in the implementation package.

---

## 1. Naming Conventions

### Rules

- **Tables**: plural, `snake_case` — e.g., `orders`, `order_items`, `refund_line_items`
- **Columns**: singular, `snake_case` — e.g., `order_id`, `created_at`, `total_amount`
- **Primary keys**: `id` — always named `id` on the owning table
- **Foreign keys**: `<referenced_table_singular>_id` — e.g., `order_id`, `user_id`, `category_id`
- **Junction tables** (many-to-many): `<table1>_<table2>` in alphabetical order — e.g., `orders_products`, `roles_users`
- **Indexes**: `idx_<table>_<columns>` — e.g., `idx_orders_status`, `idx_orders_customer_id_created_at`
- **Unique constraints**: `uq_<table>_<columns>` — e.g., `uq_users_email`
- **Check constraints**: `chk_<table>_<description>` — e.g., `chk_orders_total_positive`
- **Foreign key constraints**: `fk_<table>_<referenced_table>` — e.g., `fk_order_items_orders`
- **Enums**: singular, `snake_case` — e.g., `order_status`, `payment_method`
- **Boolean columns**: prefix with `is_` or `has_` — e.g., `is_active`, `has_shipped`, `is_refund_eligible`

### Correct

```
orders                      -- plural table name
orders.id                   -- PK named 'id'
orders.customer_id          -- FK references customers.id
orders.is_active            -- boolean with is_ prefix
order_items                 -- snake_case multi-word table
idx_orders_status           -- index naming
uq_users_email              -- unique constraint naming
chk_orders_total_positive   -- check constraint naming
```

### Incorrect

| Pattern | Problem |
|---------|---------|
| `Order`, `OrderItem` (PascalCase) | Not PostgreSQL convention; confusing because PG folds unquoted identifiers to lowercase |
| `orderItems` (camelCase) | Requires quoting in all SQL; inconsistent with PG ecosystem |
| `orders.orders_id` (redundant table name in PK) | Verbose; `id` is sufficient on the owning table |
| `orders.active` (boolean without `is_`/`has_` prefix) | Ambiguous — is it a status string or a boolean? |
| `idx1`, `idx2` (meaningless index names) | Cannot identify purpose from the name; use descriptive naming |

---

## 2. Data Type Selection

### Rules

- **Primary keys**: `UUID` (using `gen_random_uuid()`) for distributed systems or public-facing IDs; `BIGINT GENERATED ALWAYS AS IDENTITY` for internal sequential IDs — never `SERIAL` (legacy syntax)
- **Timestamps**: always `TIMESTAMPTZ` (with time zone) — never `TIMESTAMP` (without time zone); store in UTC
- **Text**: `TEXT` for variable-length strings with no meaningful upper bound; `VARCHAR(n)` only when a specific length limit is a business rule (not a storage optimization)
- **Money/currency**: `NUMERIC(precision, scale)` — never `MONEY` (locale-dependent) or `FLOAT`/`DOUBLE PRECISION` (rounding errors)
- **Booleans**: `BOOLEAN` with explicit `DEFAULT` — never use `SMALLINT` or `CHAR(1)` to represent boolean values
- **JSON**: `JSONB` for structured semi-structured data — never `JSON` (no indexing, no binary storage, no in-place operators)
- **Enums**: `VARCHAR` with a `CHECK` constraint, or a reference table — use PostgreSQL `ENUM` type only if the set of values is truly fixed and will never change (enum values cannot be removed or reordered without recreating the type)
- **IP addresses**: `INET` or `CIDR` — not `VARCHAR`
- **Date-only values**: `DATE` — not `TIMESTAMPTZ` with time stripped
- **Arrays**: PostgreSQL arrays (`TEXT[]`, `INTEGER[]`) are acceptable for simple, non-relational lists — never for data that should be a separate table with its own attributes

### Type Selection Quick Reference

| Data | Correct type | Incorrect type | Rationale |
|------|-------------|---------------|-----------|
| Primary key (public API) | `UUID DEFAULT gen_random_uuid()` | `SERIAL`, `INTEGER` | UUIDs are non-sequential, safe to expose externally |
| Primary key (internal) | `BIGINT GENERATED ALWAYS AS IDENTITY` | `SERIAL` | Modern syntax; prevents manual ID insertion |
| Timestamps | `TIMESTAMPTZ DEFAULT NOW()` | `TIMESTAMP` | Without time zone causes bugs in multi-timezone systems |
| Price / amount | `NUMERIC(12,2)` | `FLOAT`, `MONEY` | FLOAT has rounding errors; MONEY is locale-dependent |
| Status | `VARCHAR(30)` + `CHECK` | `ENUM` type | Check constraint values can be added/removed without DDL type changes |
| Free-form text | `TEXT` | `VARCHAR(255)` (arbitrary limit) | Arbitrary length limits add no value and cause truncation bugs |
| Semi-structured data | `JSONB` | `JSON`, `TEXT` | JSONB supports indexing, containment operators, and partial updates |
| Tags / simple lists | `TEXT[]` | Comma-delimited `TEXT` | Arrays support proper indexing (GIN) and membership operators |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `SERIAL` for primary keys | Legacy syntax; doesn't prevent manual ID insertion; use `GENERATED ALWAYS AS IDENTITY` |
| `TIMESTAMP` without time zone | Ambiguous — does not store time zone info; causes bugs when servers are in different zones |
| `FLOAT` or `DOUBLE PRECISION` for money | Rounding errors: `0.1 + 0.2 ≠ 0.3` in floating point |
| `VARCHAR(255)` as a default "safe" length | Arbitrary; either the length is a real business constraint or use `TEXT` |
| `JSON` instead of `JSONB` | Cannot index; no binary storage; no containment operators; slower queries |
| `ENUM` type for values that may change | Adding values requires `ALTER TYPE`; removing values requires dropping and recreating the type |

---

## 3. Constraint Design

### Rules

- Every table must have a **primary key** — no exceptions
- Every foreign key must have an **explicit constraint** with a named constraint and defined cascade behavior
- Use `NOT NULL` as the **default** — columns should be nullable only when there is a genuine business reason for absence of a value (not just "we don't have it yet")
- Use `CHECK` constraints for **domain validation** — status values, positive amounts, date ranges, format patterns
- Use `UNIQUE` constraints for **business uniqueness rules** — email addresses, external reference IDs, natural keys
- Use `EXCLUSION` constraints for **range overlaps** — booking slots, date ranges that must not overlap (PostgreSQL-specific)
- **Default values** should be meaningful — `NOW()` for timestamps, `gen_random_uuid()` for UUIDs, `true`/`false` for booleans, `'pending'` for initial status

### Constraint Design Table

For each entity in the schema design, specify constraints:

| Column | Constraint | Type | Rationale |
|--------|-----------|------|-----------|
| `id` | `PRIMARY KEY` | PK | Entity identity |
| `email` | `uq_users_email` | UNIQUE | Business rule: one account per email |
| `order_id` | `fk_order_items_orders` | FK → orders.id ON DELETE CASCADE | Items belong to an order; delete items when order is deleted |
| `status` | `chk_orders_status` | CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) | Business rule: status must be one of the defined values |
| `total_amount` | `chk_orders_total_positive` | CHECK (total_amount >= 0) | Business rule: amount cannot be negative |
| `start_date` / `end_date` | `chk_events_date_range` | CHECK (end_date > start_date) | Business rule: end must be after start |

### Cascade Rule Selection

| Relationship | Recommended cascade | Rationale |
|-------------|-------------------|-----------|
| Parent owns children exclusively (order → order_items) | `ON DELETE CASCADE` | Children have no meaning without the parent |
| Reference to a shared entity (order → customer) | `ON DELETE RESTRICT` | Don't delete a customer just because one order is deleted |
| Soft-delete system (records are never physically deleted) | `ON DELETE RESTRICT` | Physical deletes should not happen; RESTRICT prevents accidental data loss |
| Audit/history records | `ON DELETE SET NULL` or `ON DELETE RESTRICT` | Audit trail should survive the deletion of the source entity |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| No primary key on a table | Cannot uniquely identify rows; breaks replication, ORM assumptions, and join correctness |
| Nullable column with no business justification | Allows inconsistent data; every query must handle NULL; prefer NOT NULL with a default |
| `ON DELETE CASCADE` on a reference to a shared entity | Deleting a customer cascades to all their orders, payments, and history — catastrophic data loss |
| No CHECK constraint on status columns | Invalid status values can be inserted; no database-level enforcement |
| FK without a named constraint | Auto-generated names are hard to reference in migrations and error messages |

---

## 4. Indexing Strategy

### Rules

- Every **foreign key** column gets a B-tree index — PostgreSQL does not auto-index FKs (unlike MySQL/InnoDB)
- Columns that appear in **WHERE**, **ORDER BY**, or **JOIN** clauses with high frequency get indexes
- **Composite indexes** follow the left-prefix rule — order columns from most selective (or most frequently filtered) to least
- Use **partial indexes** to index only the rows that matter — e.g., `WHERE is_active = true` or `WHERE status = 'pending'`
- Use **GIN indexes** for `JSONB` columns, array columns, and full-text search (`tsvector`)
- Use **unique indexes** to enforce uniqueness constraints — prefer `UNIQUE` constraint (which creates an index) over a standalone unique index
- **Do not over-index** — each index adds write overhead; only index for known query patterns identified in the requirements or NFRs
- **Covering indexes** (`INCLUDE` clause) — use when a query can be satisfied entirely from the index without touching the table

### Index Type Selection

| Use case | Index type | Example |
|----------|-----------|---------|
| Equality and range queries (most common) | B-tree (default) | `CREATE INDEX idx_orders_status ON orders (status)` |
| Composite filter + sort | B-tree composite | `CREATE INDEX idx_orders_customer_created ON orders (customer_id, created_at DESC)` |
| Only a subset of rows need indexing | Partial index | `CREATE INDEX idx_orders_pending ON orders (created_at) WHERE status = 'pending'` |
| JSONB containment or key-exists queries | GIN | `CREATE INDEX idx_orders_metadata ON orders USING GIN (metadata)` |
| Array membership (`@>`, `&&`) | GIN | `CREATE INDEX idx_products_tags ON products USING GIN (tags)` |
| Full-text search | GIN on `tsvector` | `CREATE INDEX idx_products_search ON products USING GIN (search_vector)` |
| Geospatial queries | GiST (PostGIS) | `CREATE INDEX idx_locations_coords ON locations USING GIST (coordinates)` |
| Range overlap exclusion | GiST | `CREATE INDEX idx_bookings_range ON bookings USING GIST (during WITH &&)` |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| No index on foreign key columns | Slow joins and cascade deletes; PostgreSQL does not auto-create FK indexes |
| Index on every column | Write overhead; wasted storage; most indexes are never used |
| Composite index with low-selectivity column first | Index is ineffective; put the most selective column first |
| B-tree index on a JSONB column | B-tree can only index the whole JSON value as a blob; use GIN for key/value queries |
| Index on a column with very low cardinality (e.g., boolean) | B-tree is ineffective; consider a partial index on the minority value instead |

---

## 5. Schema Evolution and Migrations

### Rules

- All schema changes must be expressed as **versioned, forward-only migration files** — never modify the database manually
- Migrations must be **idempotent** where possible — re-running a migration should not fail
- **Additive changes** (new table, new nullable column, new index) are safe — old code ignores them
- **Breaking changes** (drop column, rename column, change type, add NOT NULL to existing column) require a **multi-phase migration**
- New columns on existing tables should be **nullable or have a DEFAULT** — adding a NOT NULL column without a default locks the table and fails if rows exist
- **Large table changes** (backfilling data, adding indexes on tables with millions of rows) must use `CONCURRENTLY` for index creation and batched updates for data migrations

### Safe vs. Breaking Changes

| Change | Safe? | Deployment strategy |
|--------|-------|-------------------|
| Add new table | Yes | Deploy migration, then deploy code |
| Add nullable column | Yes | Deploy migration, then deploy code |
| Add column with DEFAULT (PG 11+) | Yes | PG 11+ adds defaults without rewriting the table; deploy migration, then code |
| Add index (small table) | Yes | Deploy migration normally |
| Add index (large table, millions of rows) | Caution | Use `CREATE INDEX CONCURRENTLY` — does not lock the table but takes longer |
| Drop column | Breaking | Phase 1: deploy code that stops reading/writing the column; Phase 2: drop column |
| Rename column | Breaking | Phase 1: add new column; Phase 2: backfill + dual-write; Phase 3: switch reads; Phase 4: drop old column |
| Change column type | Breaking | Same phased approach as rename — add new column, migrate data, switch, drop |
| Add NOT NULL to existing column | Breaking | Phase 1: add DEFAULT; Phase 2: backfill existing rows; Phase 3: add NOT NULL constraint |
| Drop table | Breaking | Ensure no code references the table; deploy code first, then migration |

### Multi-Phase Migration Template

For breaking changes, specify the phases:

| Phase | Migration | Code change | Can roll back? |
|-------|-----------|-------------|---------------|
| 1 | Add new column (nullable) | Code writes to both old and new columns | Yes — drop new column |
| 2 | Backfill new column from old column | No code change | Yes — data is duplicated |
| 3 | — | Code reads from new column only | Yes — revert to reading old column |
| 4 | Drop old column | — | No — data is gone |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `ALTER TABLE ADD COLUMN ... NOT NULL` on a populated table without a DEFAULT | Fails immediately — existing rows have no value for the new column |
| `CREATE INDEX` (without `CONCURRENTLY`) on a table with millions of rows | Locks the table for the duration; blocks all writes |
| Dropping a column before removing all code references | Running code crashes with column-not-found errors |
| Manual DDL changes not captured in migration files | Schema drift between environments; unpredictable deployments |
| Single migration that adds a column, backfills data, and adds NOT NULL | If the backfill fails midway, the migration is partially applied; split into separate migrations |

---

## 6. Partitioning

### Rules

- Consider partitioning when a table is expected to exceed **tens of millions of rows** and queries consistently filter on a partitioning key
- Use **range partitioning** for time-series data (logs, events, audit trails) — partition by month or quarter
- Use **list partitioning** for data that segments by a discrete value (tenant, region, status category)
- Use **hash partitioning** for even distribution when no natural range or list key exists
- Partition pruning must be effective — the partition key must appear in the most common query WHERE clauses
- Do not partition small tables — the overhead of partition management exceeds any benefit below millions of rows

### Partitioning Decision

| Question | If yes | If no |
|----------|--------|-------|
| Will the table exceed 50M rows within a year? | Consider partitioning | Do not partition |
| Do queries consistently filter on one column (date, tenant, region)? | That column is the partition key | Partitioning may not help — queries scan all partitions |
| Is data retention required (delete data older than N months)? | Range partitioning — drop old partitions instead of DELETE | Not a reason to partition on its own |
| Is the table heavily written with minimal reads? | Partitioning may help write throughput | Optimize indexes instead |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Partitioning a table with < 1M rows | Overhead exceeds benefit; a well-indexed non-partitioned table is faster |
| Partition key not used in queries | No partition pruning; every query scans all partitions — worse than a single table |
| Too many partitions (daily partitions on high-volume data) | Thousands of partitions degrade planner performance; use monthly or quarterly |
| Partitioning as a substitute for proper indexing | Partitioning reduces the rows per partition but does not replace indexes within partitions |

---

## 7. Data Integrity Patterns

### Rules

- Use **soft deletes** (`deleted_at TIMESTAMPTZ DEFAULT NULL`) when business requirements need audit trails or undo — add a partial index excluding deleted rows for query performance
- Use **optimistic locking** (`version INTEGER DEFAULT 1`) for entities with concurrent write risk — the application checks the version on update and rejects stale writes
- Use **audit columns** on every table: `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()` — use a trigger or ORM hook to maintain `updated_at`
- Use **row-level security** (RLS) for multi-tenant schemas where tenant isolation must be enforced at the database level — not just the application level
- Define **data retention rules** per entity — which tables have retention policies and how old data is archived or purged

### Standard Audit Columns

Every table should include:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `created_at` | `TIMESTAMPTZ` | `NOW()` | When the row was created |
| `updated_at` | `TIMESTAMPTZ` | `NOW()` | When the row was last modified (maintained via trigger or ORM) |
| `created_by` | `UUID` or `VARCHAR` | — | Who created the row (FK to users or external identity) |
| `updated_by` | `UUID` or `VARCHAR` | — | Who last modified the row |

Optional:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `deleted_at` | `TIMESTAMPTZ` | `NULL` | Soft delete marker — NULL means active |
| `version` | `INTEGER` | `1` | Optimistic locking — incremented on each update |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| No `created_at` / `updated_at` on tables | Cannot audit when data changed; debugging production issues is significantly harder |
| Soft deletes without a partial index | Every query must add `WHERE deleted_at IS NULL`; full table scan includes deleted rows |
| No optimistic locking on concurrently edited entities | Last-write-wins; user's changes are silently overwritten |
| Tenant isolation enforced only in application code | A single application bug exposes all tenants' data; RLS provides defense-in-depth |

---

## 8. Performance Design Considerations

### Rules

- Design for the **expected query patterns** from functional requirements and NFRs — not for hypothetical queries
- Prefer **joins** over subqueries for readability and optimizer effectiveness — PostgreSQL's query planner handles joins well
- Use `EXPLAIN ANALYZE` as the validation tool for index effectiveness during design review (note: this is a design consideration, not an implementation step — the architect should describe which queries need to be fast and what indexes support them)
- **Connection limits** and **statement timeouts** are operational concerns — but the schema design should note if any query pattern is expected to be long-running (batch reports, exports) so the backend design can plan for separate connection pools
- **Materialized views** are appropriate for expensive aggregations that don't need real-time data — define the refresh strategy (on-demand, scheduled, triggered)

### Query Pattern Documentation

For each major query pattern the feature requires, specify:

| Query pattern | Frequency | Tables involved | Filter columns | Sort | Expected rows scanned | Index needed |
|--------------|-----------|----------------|---------------|------|----------------------|-------------|
| List pending refunds for dashboard | High (every page load) | refunds | status, created_at | created_at DESC | < 1000 (pending subset) | `idx_refunds_pending` (partial, WHERE status = 'pending') |
| Get order with items and refunds | Medium (on detail view) | orders, order_items, refunds | orders.id | — | 1 order + N items | FK indexes on order_id |
| Monthly refund report | Low (scheduled) | refunds, orders | refunds.created_at range | — | Full month (~10k rows) | Range index on created_at |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Designing indexes without knowing the query patterns | Indexes may not match actual queries; wasted write overhead |
| `SELECT *` in the design (fetching all columns when only a few are needed) | Over-fetches data; prevents covering index optimization; more I/O |
| No consideration for data growth | Queries that work at 1,000 rows may not work at 10,000,000 |
| Materialized view with no refresh strategy | Data goes stale; no one knows when or how it updates |

---

## Customization

- **Section 2 (Data Type Selection — UUID vs. BIGINT IDENTITY):** The choice between UUID and BIGINT depends on the use case. BIGINT is more compact, faster to index, and appropriate for internal-only tables. UUID is preferred when IDs are exposed externally, when distributed ID generation is needed (no central sequence), or when data merges across systems are expected. Document the choice and rationale per table.

- **Section 2 (Data Type Selection — TIMESTAMPTZ vs. TIMESTAMP):** TIMESTAMPTZ is the default for all time-aware columns. Use bare `TIMESTAMP` (without time zone) only for values that represent a fixed moment in a specific known timezone (e.g., a scheduled event display time in a local timezone). Document any bare `TIMESTAMP` usage with the business reason.

- **Section 4 (Indexing — Partial Indexes):** Partial indexes are powerful for skewed data distributions (e.g., indexing only `WHERE status = 'active'` when 95% of rows are `archived`). The design should identify columns with skewed distributions and propose partial indexes where appropriate, but should not default to partial indexes for every column.

- **Section 5 (Schema Evolution — CONCURRENTLY):** `CREATE INDEX CONCURRENTLY` avoids locking the table during index creation but takes longer and cannot run inside a transaction. For small tables (< 1 million rows) in maintenance windows, regular `CREATE INDEX` is acceptable. The design should note which indexes need `CONCURRENTLY` based on table size and availability requirements.

- **Section 6 (Partitioning):** Partitioning adds operational complexity. It is justified for tables expected to exceed tens of millions of rows or with clear time-based access patterns. Small tables (< 1 million rows) should not be partitioned. The design should document the partitioning decision criteria, not partition every table.

- **Section 7 (Data Integrity — Soft Deletes):** Soft deletes add query complexity (every query needs `WHERE deleted_at IS NULL`). For tables where audit trail is not a regulatory requirement and referential integrity is straightforward, hard deletes with an audit log table are an acceptable alternative. Document the chosen approach and the business reason.
