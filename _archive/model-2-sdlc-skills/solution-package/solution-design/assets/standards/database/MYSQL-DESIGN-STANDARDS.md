# MySQL Database Design Standards

**Applies to:** MySQL 8.0+ (InnoDB engine). Features gated on specific versions are noted inline (e.g., `CHECK` constraints enforced in 8.0.16+, `ALGORITHM=INSTANT` for `ADD COLUMN` in 8.0.12+, functional indexes in 8.0.13+). For MySQL 5.7, the design patterns still apply but CHECK constraints are not enforced and some DDL optimizations are unavailable.

These are the baseline standards the AI uses when designing MySQL schemas in the solutions package. During Step 3 of the data model design skill, the AI compares existing schema conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new schema should follow the existing pattern or adopt the standard.

These standards operate at the **design level** — they guide architectural decisions about data types, naming, constraints, indexing, and schema evolution. They do not prescribe ORM configuration, connection pooling settings, or operational concerns (replication, backup, monitoring). Implementation-level rules are covered separately in the implementation package.

These standards assume **InnoDB** as the storage engine. MyISAM should not be used for new tables.

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
- **Foreign key constraints**: `fk_<table>_<referenced_table>` — e.g., `fk_order_items_orders`
- **Boolean columns**: prefix with `is_` or `has_` — e.g., `is_active`, `has_shipped`, `is_refund_eligible`
- **Database and table names**: always lowercase — MySQL on case-sensitive filesystems (Linux) treats `Orders` and `orders` as different tables; lowercase prevents cross-platform bugs

### Correct

```
orders                      -- plural, lowercase, snake_case
orders.id                   -- PK named 'id'
orders.customer_id          -- FK references customers.id
orders.is_active            -- boolean with is_ prefix
order_items                 -- snake_case multi-word table
idx_orders_status           -- index naming
uq_users_email              -- unique constraint naming
fk_order_items_orders       -- foreign key constraint naming
```

### Incorrect

| Pattern | Problem |
|---------|---------|
| `Order`, `OrderItem` (PascalCase) | Case-sensitive on Linux; breaks portability between OS; MySQL convention is lowercase |
| `orderItems` (camelCase) | Inconsistent with MySQL ecosystem; requires backtick quoting |
| `orders.orders_id` (redundant table name in PK) | Verbose; `id` is sufficient on the owning table |
| `orders.active` (boolean without `is_`/`has_` prefix) | Ambiguous — is it a status string or a boolean? |
| `idx1`, `idx2` (meaningless index names) | Cannot identify purpose from the name |

---

## 2. Data Type Selection

### Rules

- **Primary keys**: `BIGINT UNSIGNED AUTO_INCREMENT` for sequential internal IDs; `CHAR(36)` or `BINARY(16)` for UUID PKs — `BINARY(16)` is more storage-efficient but less readable; `CHAR(36)` is easier to debug
- **Timestamps**: `DATETIME(6)` (microsecond precision) or `TIMESTAMP` — store in UTC; set `time_zone = '+00:00'` on the connection. Note: `TIMESTAMP` has a Y2038 limit and is limited to the range 1970–2038; `DATETIME` has no such limit
- **Text**: `VARCHAR(n)` with a meaningful business-driven length limit; `TEXT` for values that can exceed 65,535 bytes or have no practical upper bound — avoid `TEXT` in columns that participate in indexes (MySQL limits index prefix length on TEXT)
- **Money/currency**: `DECIMAL(precision, scale)` — never `FLOAT` or `DOUBLE` (rounding errors)
- **Booleans**: `TINYINT(1)` with `DEFAULT 0` or `DEFAULT 1` — MySQL has no native `BOOLEAN`; `TINYINT(1)` is the convention (aliased as `BOOL`/`BOOLEAN`)
- **Enums**: `ENUM('value1', 'value2', ...)` is acceptable in MySQL for stable value sets — adding a value at the end is a metadata-only change in MySQL 8.0+; however, `VARCHAR` with application-level validation is safer if the values change frequently
- **JSON**: `JSON` column type (MySQL 5.7+) — supports generated columns and functional indexes for query performance; prefer over storing JSON as `TEXT`
- **IP addresses**: `VARBINARY(16)` with `INET6_ATON()`/`INET6_NTOA()` for dual-stack support — or `INT UNSIGNED` with `INET_ATON()`/`INET_NTOA()` for IPv4 only — not `VARCHAR`
- **Date-only values**: `DATE` — not `DATETIME` with time zeroed out

### Type Selection Quick Reference

| Data | Correct type | Incorrect type | Rationale |
|------|-------------|---------------|-----------|
| Primary key (sequential) | `BIGINT UNSIGNED AUTO_INCREMENT` | `INT` (signed, limited range) | BIGINT avoids overflow; UNSIGNED doubles the range; INT maxes at ~2.1 billion |
| Primary key (UUID) | `BINARY(16)` or `CHAR(36)` | `VARCHAR(36)` | BINARY(16) saves 20 bytes per row and is faster to compare |
| Timestamps | `DATETIME(6)` in UTC | `TIMESTAMP` (Y2038 limit), `VARCHAR` | DATETIME has no range limit; microsecond precision avoids ordering ambiguity |
| Price / amount | `DECIMAL(12,2)` | `FLOAT`, `DOUBLE` | Floating point has rounding errors |
| Status | `ENUM('pending','confirmed','shipped')` or `VARCHAR(30)` | `TINYINT` with magic numbers | ENUM is self-documenting; magic integers require lookup |
| Free-form text | `TEXT` or `MEDIUMTEXT` | `VARCHAR(10000)` | VARCHAR max is 65,535 bytes (row size limit); TEXT is stored off-page |
| Semi-structured data | `JSON` | `TEXT` | JSON type validates syntax on insert; supports functional indexes and `->>`/`->>` operators |
| Boolean | `TINYINT(1) DEFAULT 0` | `CHAR(1)` ('Y'/'N'), `ENUM('yes','no')` | TINYINT(1) is the MySQL boolean convention; ORMs map it natively |

### UUID Primary Key Considerations

MySQL/InnoDB uses a **clustered index** on the primary key. Random UUIDs cause page splits and fragmentation on insert-heavy tables. Design options:

| Approach | Tradeoff |
|----------|----------|
| `BINARY(16)` with UUID v7 (time-sorted) | Best of both: globally unique + insert-ordered; requires application to generate v7 UUIDs |
| `BINARY(16)` with UUID v4 (random) | Random inserts cause page splits; acceptable for low-write tables |
| `BIGINT AUTO_INCREMENT` PK + `BINARY(16)` UUID as a `UNIQUE` secondary column | Best InnoDB performance (sequential PK) + safe external identifier (UUID); two columns to manage |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `INT` for primary keys on high-volume tables | Maxes at ~2.1 billion; migration to BIGINT on a large table is expensive |
| `FLOAT` or `DOUBLE` for money | Rounding: `0.1 + 0.2 = 0.30000000000000004` |
| `TIMESTAMP` for dates beyond 2038 | Y2038 bug: TIMESTAMP cannot represent dates after 2038-01-19 |
| `VARCHAR(255)` as a default "safe" length | Either the length is a business constraint or it's arbitrary; choose deliberately |
| `TEXT` column in a composite index | MySQL indexes only a prefix of TEXT columns; queries may not use the index as expected |
| `TINYINT` magic numbers for status (0 = pending, 1 = active, 2 = deleted) | Requires documentation or lookup to understand; ENUM or VARCHAR is self-documenting |

---

## 3. Constraint Design

### Rules

- Every table must have a **primary key** — InnoDB requires one; if you don't define one, InnoDB creates a hidden one (which you can't use)
- Every foreign key must have an **explicit named constraint** with defined cascade behavior
- Use `NOT NULL` as the **default** — columns should be nullable only when there is a genuine business reason for absence
- Use `CHECK` constraints (MySQL 8.0.16+) for **domain validation** — status values, positive amounts, date ranges
- Use `UNIQUE` constraints for **business uniqueness rules** — email addresses, external reference IDs
- **Default values** should be meaningful — `CURRENT_TIMESTAMP(6)` for timestamps, `0`/`1` for booleans, initial status for ENUM columns

### Constraint Design Table

| Column | Constraint | Type | Rationale |
|--------|-----------|------|-----------|
| `id` | `PRIMARY KEY` | PK | Entity identity; InnoDB clustered index |
| `email` | `uq_users_email` | UNIQUE | One account per email |
| `order_id` | `fk_order_items_orders` | FK → orders.id ON DELETE CASCADE | Items belong to an order |
| `status` | `chk_orders_status` | CHECK (status IN ('pending', 'confirmed', 'shipped')) | Valid status values (MySQL 8.0.16+) |
| `total_amount` | `chk_orders_total_positive` | CHECK (total_amount >= 0) | Amount cannot be negative |

### Cascade Rule Selection

| Relationship | Recommended cascade | Rationale |
|-------------|-------------------|-----------|
| Parent owns children exclusively (order → order_items) | `ON DELETE CASCADE` | Children have no meaning without the parent |
| Reference to a shared entity (order → customer) | `ON DELETE RESTRICT` | Don't delete a customer because one order is deleted |
| Soft-delete system | `ON DELETE RESTRICT` | Physical deletes should not happen; RESTRICT prevents accidental loss |
| Audit/history records | `ON DELETE SET NULL` or `ON DELETE RESTRICT` | Audit trail should survive deletion of source |

### MySQL-Specific Constraint Notes

| Concern | MySQL behavior |
|---------|---------------|
| CHECK constraints | Enforced in MySQL 8.0.16+; silently ignored in earlier versions — verify the target MySQL version |
| Foreign key checks | Only InnoDB enforces foreign keys; MyISAM ignores them — always use InnoDB |
| ENUM validation | MySQL rejects values not in the ENUM list on insert (acts like a check constraint for that column) |
| Partial indexes | Not supported in MySQL — cannot create an index with a WHERE clause; use generated columns as a workaround |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| No primary key | InnoDB creates a hidden 6-byte clustered index you can't use; replication and point-in-time recovery depend on PKs |
| CHECK constraint on MySQL < 8.0.16 | Silently ignored — the constraint is parsed but not enforced |
| `ON DELETE CASCADE` on a reference to a shared entity | Deleting one customer cascades to all their orders, payments, history |
| Foreign key without a name | Auto-generated names are inconsistent and hard to reference in migrations |
| Nullable boolean (allowing NULL, TRUE, FALSE = three states) | Three-state logic causes bugs; use NOT NULL DEFAULT 0 or DEFAULT 1 |

---

## 4. Indexing Strategy

### Rules

- InnoDB **automatically indexes foreign keys** — unlike PostgreSQL, you do not need to add a separate index; however, verify the auto-created index covers your query pattern (it indexes only the FK column, not composites)
- The **primary key is the clustered index** in InnoDB — row data is physically ordered by PK; this makes sequential PKs (AUTO_INCREMENT) significantly faster for inserts than random UUIDs
- **Composite indexes** follow the left-prefix rule — a composite index on `(a, b, c)` supports queries on `(a)`, `(a, b)`, and `(a, b, c)` but not `(b)` or `(c)` alone
- **Covering indexes** (including all columns a query needs) allow **index-only scans** — InnoDB can serve the query without reading the table data
- Use **prefix indexes** on long VARCHAR or TEXT columns — `INDEX idx_name (column(20))` indexes only the first N characters; choose a prefix length that provides good selectivity
- Do not create **redundant indexes** — an index on `(a)` is redundant if an index on `(a, b)` exists; MySQL does not automatically deduplicate
- Use **descending indexes** (MySQL 8.0+) when the primary sort order is descending — `INDEX idx_created_desc (created_at DESC)`

### Index Type Selection

| Use case | Index type | Example |
|----------|-----------|---------|
| Equality and range queries | B-tree (default) | `CREATE INDEX idx_orders_status ON orders (status)` |
| Composite filter + sort | B-tree composite | `CREATE INDEX idx_orders_customer_created ON orders (customer_id, created_at DESC)` |
| Full-text search | FULLTEXT | `CREATE FULLTEXT INDEX idx_products_search ON products (name, description)` |
| JSON field queries | Functional index (MySQL 8.0.13+) | `CREATE INDEX idx_orders_region ON orders ((CAST(metadata->>'$.region' AS CHAR(50))))` |
| Spatial/geospatial | SPATIAL (R-tree) | `CREATE SPATIAL INDEX idx_locations_coords ON locations (coordinates)` |
| Unique business constraint | UNIQUE | `CREATE UNIQUE INDEX uq_users_email ON users (email)` |

### InnoDB Clustered Index Implications

| Design decision | Impact |
|----------------|--------|
| `AUTO_INCREMENT BIGINT` PK | Sequential inserts; minimal page splits; optimal InnoDB write performance |
| Random UUID PK | Random inserts cause page splits and fragmentation; use UUID v7 (time-sorted) or a sequential PK with UUID as a secondary unique column |
| Wide PK (e.g., composite or long string) | Every secondary index stores a copy of the PK; wide PKs inflate all indexes |
| No explicit PK | InnoDB creates a hidden 6-byte PK; secondary indexes reference it but you can't query by it |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Index on `(a)` when index on `(a, b)` exists | Redundant — the composite index covers single-column queries on `a` |
| Index on every column | Write overhead; storage waste; most indexes unused |
| FULLTEXT index for exact-match lookups | FULLTEXT is for natural language search; use B-tree for exact match |
| No index on columns used in WHERE/ORDER BY | Full table scans on large tables; slow queries |
| Composite index with wrong column order | `(status, customer_id)` doesn't help queries that filter only on `customer_id` |

---

## 5. Schema Evolution and Migrations

### Rules

- All schema changes must be **versioned migration files** — never modify the database manually
- **Additive changes** (new table, new nullable column, new index) are safe — old code ignores them
- **Breaking changes** (drop column, rename, type change, add NOT NULL) require **multi-phase migration**
- **Online DDL**: MySQL 8.0 supports many `ALTER TABLE` operations without locking the table (using `ALGORITHM=INPLACE` or `ALGORITHM=INSTANT`) — but not all changes; verify per-change
- **Large table alterations**: for tables with millions of rows, use `pt-online-schema-change` (Percona) or `gh-ost` (GitHub) if `ALTER TABLE` would lock the table for too long
- New columns should be **nullable or have a DEFAULT** — `ALGORITHM=INSTANT` (MySQL 8.0.12+) can add a nullable column or a column with a default without table rebuild

### Safe vs. Breaking Changes

| Change | Safe? | MySQL 8.0 DDL behavior |
|--------|-------|----------------------|
| Add new table | Yes | No table lock |
| Add nullable column | Yes | `ALGORITHM=INSTANT` — no table rebuild |
| Add column with DEFAULT | Yes | `ALGORITHM=INSTANT` (MySQL 8.0.12+) — no table rebuild |
| Add index (small table) | Caution | `ALGORITHM=INPLACE` — allows reads during build; blocks some writes briefly |
| Add index (large table) | Caution | `ALGORITHM=INPLACE` may take minutes/hours; consider `pt-online-schema-change` |
| Drop column | Breaking | Phase 1: stop reading/writing the column in code; Phase 2: drop column |
| Rename column | Breaking | Phase 1: add new column; Phase 2: dual-write + backfill; Phase 3: switch reads; Phase 4: drop old |
| Change column type | Breaking | May require table rebuild (`ALGORITHM=COPY`); phased approach recommended |
| Add NOT NULL to existing column | Breaking | Phase 1: backfill NULLs; Phase 2: add NOT NULL constraint |
| Change ENUM values (add to end) | Yes | `ALGORITHM=INSTANT` if adding to the end of the list only |
| Change ENUM values (reorder/remove) | Breaking | Requires table rebuild |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `ALTER TABLE ... ADD COLUMN ... NOT NULL` on a populated table without a DEFAULT | Fails — existing rows have no value; or MySQL sets an implicit default (silent data corruption) |
| `ALTER TABLE` on a 100M-row table without checking DDL algorithm | Could lock the table for hours; use `pt-online-schema-change` or `gh-ost` |
| Dropping a column before removing code references | Running code crashes with unknown column errors |
| Manual DDL not captured in migration files | Schema drift; unpredictable deployments across environments |
| Adding an ENUM value in the middle of the list | Requires table rebuild; add to the end for instant DDL |

---

## 6. Character Set and Collation

### Rules

- Use **`utf8mb4`** as the character set — never `utf8` (MySQL's `utf8` is a 3-byte subset that cannot store emoji, many CJK characters, or mathematical symbols)
- Use **`utf8mb4_0900_ai_ci`** (MySQL 8.0+ default) or **`utf8mb4_unicode_ci`** (MySQL 5.7) as the collation — `ai` = accent-insensitive, `ci` = case-insensitive
- Set character set and collation at the **database level** — individual tables and columns inherit unless overridden
- Override collation at the column level only when a specific column needs case-sensitive or binary comparison (e.g., password hashes, tokens)

### Correct

```sql
CREATE DATABASE app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

-- Column-level override for case-sensitive comparison
ALTER TABLE users
  MODIFY token VARCHAR(255)
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_bin;
```

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `CHARACTER SET utf8` | MySQL `utf8` is only 3 bytes; cannot store emoji (🎉), many CJK characters, or math symbols |
| No explicit character set (relying on server default) | Server default may be `latin1` on older installations; data corruption on non-ASCII input |
| `utf8mb4_general_ci` collation | Less accurate Unicode sorting than `utf8mb4_0900_ai_ci`; legacy collation |
| Different collations on columns that are joined | Collation mismatch errors on joins; or implicit collation coercion that prevents index use |

---

## 7. Data Integrity Patterns

### Rules

- Use **soft deletes** (`deleted_at DATETIME(6) DEFAULT NULL`) when audit trails or undo are required — add a generated column + index for efficient filtering of active rows (MySQL lacks partial indexes)
- Use **optimistic locking** (`version INT UNSIGNED DEFAULT 1`) for entities with concurrent write risk
- Use **audit columns** on every table: `created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)`, `updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`
- Use **generated columns** (MySQL 5.7+) for computed values that need indexing — e.g., extracting a JSON field, computing a hash, or creating an `is_deleted` boolean from `deleted_at`

### Standard Audit Columns

Every table should include:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `created_at` | `DATETIME(6)` | `CURRENT_TIMESTAMP(6)` | When the row was created |
| `updated_at` | `DATETIME(6)` | `CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)` | Auto-maintained on every update |
| `created_by` | `BIGINT UNSIGNED` or `VARCHAR(100)` | — | Who created the row |
| `updated_by` | `BIGINT UNSIGNED` or `VARCHAR(100)` | — | Who last modified the row |

Optional:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `deleted_at` | `DATETIME(6)` | `NULL` | Soft delete marker — NULL means active |
| `version` | `INT UNSIGNED` | `1` | Optimistic locking |

### Soft Delete Workaround for Missing Partial Indexes

MySQL does not support partial indexes. To efficiently query only non-deleted rows:

```sql
-- Add a generated column
ALTER TABLE orders
  ADD COLUMN is_deleted TINYINT(1)
  GENERATED ALWAYS AS (IF(deleted_at IS NULL, 0, 1)) STORED;

-- Index on the generated column
CREATE INDEX idx_orders_active ON orders (is_deleted, status, created_at);
```

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| No `created_at` / `updated_at` | Cannot audit when data changed; debugging is significantly harder |
| Manual `updated_at` maintenance (application code sets it) | Easy to miss; use `ON UPDATE CURRENT_TIMESTAMP(6)` for automatic maintenance |
| Soft deletes with `WHERE deleted_at IS NULL` on every query and no index strategy | Full scans include deleted rows; use a generated column + index |
| No optimistic locking on concurrently edited entities | Silent data loss from last-write-wins |

---

## 8. Performance Design Considerations

### Rules

- Design for the **expected query patterns** from functional requirements and NFRs
- Understand the **clustered index** — InnoDB stores rows in PK order; PK choice directly affects read and write performance
- Avoid **`SELECT *`** in the design — specify which columns each query pattern needs; this informs covering index decisions
- **COUNT(*) on large InnoDB tables** is slow (no cached row count) — if exact counts are needed, consider a summary/counter table
- **Temporary tables and filesort**: queries with `ORDER BY` on non-indexed columns or `GROUP BY` may create temp tables on disk — index the sort columns

### Query Pattern Documentation

For each major query pattern the feature requires, specify:

| Query pattern | Frequency | Tables | Filter columns | Sort | Expected volume | Index needed |
|--------------|-----------|--------|---------------|------|----------------|-------------|
| List pending refunds | High | refunds | status, created_at | created_at DESC | < 1000 (pending subset) | `idx_refunds_status_created (status, created_at DESC)` |
| Get order with items | Medium | orders, order_items | orders.id | — | 1 + N items | PK + FK index (auto) |
| Monthly report | Low | refunds, orders | refunds.created_at range | — | ~10k/month | `idx_refunds_created_at` |
| Count active users | Medium | users | is_deleted, last_active_at | — | All active rows | Generated column index or summary table |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Random UUID v4 as clustered PK on a write-heavy table | Page splits on every insert; fragmented B-tree; use AUTO_INCREMENT or UUID v7 |
| No understanding of which queries are performance-critical | Indexes are guesswork; some critical queries go unoptimized |
| `COUNT(*)` on a table with millions of rows as a dashboard metric | Slow full index scan every time; use a counter table updated by triggers or application logic |
| `ORDER BY` on non-indexed columns in paginated queries | Creates temporary tables; degrades as data grows |

---

## Customization

- **Section 2 (Data Type Selection — AUTO_INCREMENT vs. UUID):** AUTO_INCREMENT is friendlier to InnoDB's clustered index (sequential inserts, no page splits). UUID v4 causes random inserts and fragmentation. If UUIDs are required (distributed systems, external exposure), prefer UUID v7 (time-ordered) or `BINARY(16)` storage with `UUID_TO_BIN()` (MySQL 8.0+). Document the ID strategy per table.

- **Section 2 (Data Type Selection — ENUM):** MySQL `ENUM` is convenient for small, stable value sets but is painful to alter (requires `ALTER TABLE` to add values). For value sets that change, use a lookup table or application-level constants with a `VARCHAR` column. The design should state which approach is used and why.

- **Section 3 (Constraint Design — CHECK constraints):** `CHECK` constraints are enforced only in MySQL 8.0.16+. Projects on earlier versions must enforce these rules at the application layer. The design should document which constraints rely on database enforcement vs. application enforcement.

- **Section 5 (Schema Evolution):** `ALGORITHM=INSTANT` (MySQL 8.0.12+) allows certain DDL changes without table rebuild, but only for specific operations (adding nullable columns at end, renaming indexes). For operations that require a table rebuild on large tables, `pt-online-schema-change` or `gh-ost` is recommended. The design should identify which migrations can use `INSTANT` and which need an online migration tool.

- **Section 6 (Character Set):** `utf8mb4` is the default for all new tables and columns. Projects that have legacy tables using `utf8` (3-byte, doesn't support emoji or some CJK characters) should plan migration to `utf8mb4` but may defer it if the migration is high-risk. Document any tables that remain on `utf8` and the migration plan.

- **Section 8 (Performance — Partitioning):** MySQL partitioning adds complexity and has limitations (no foreign keys referencing partitioned tables, unique keys must include partition key). Partition only tables expected to exceed tens of millions of rows with clear range-based access patterns. Document the partitioning criteria.
