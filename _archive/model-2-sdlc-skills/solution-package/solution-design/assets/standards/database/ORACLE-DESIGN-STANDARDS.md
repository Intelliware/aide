# Oracle Database Design Standards

**Applies to:** Oracle Database 19c+ (the current long-term support release). Features gated on specific versions are noted inline (e.g., `GENERATED ALWAYS AS IDENTITY` requires 12c+, metadata-only `DEFAULT` on `ADD COLUMN` requires 11g+, native `BOOLEAN` columns require 23c, 128-character identifiers require 12.2+). For older Oracle versions, the design patterns still apply — use the version-appropriate syntax.

These are the baseline standards the AI uses when designing Oracle schemas in the solutions package. During Step 3 of the data model design skill, the AI compares existing schema conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new schema should follow the existing pattern or adopt the standard.

These standards operate at the **design level** — they guide architectural decisions about data types, naming, constraints, indexing, partitioning, and schema evolution. They do not prescribe DBA operational concerns (RAC configuration, Data Guard, RMAN backups, tablespace management). Implementation-level rules are covered separately in the implementation package.

These standards assume **Oracle Database 19c or later** (the current long-term support release). Oracle-specific features are noted where they differ from ANSI SQL.

---

## 1. Naming Conventions

### Rules

- **Tables**: plural, `UPPER_SNAKE_CASE` — e.g., `ORDERS`, `ORDER_ITEMS`, `REFUND_LINE_ITEMS` — Oracle folds unquoted identifiers to uppercase
- **Columns**: singular, `UPPER_SNAKE_CASE` — e.g., `ORDER_ID`, `CREATED_AT`, `TOTAL_AMOUNT`
- **Primary keys**: `ID` on the owning table — or `<TABLE_SINGULAR>_ID` if the organization prefers fully qualified PK names
- **Foreign keys**: `<REFERENCED_TABLE_SINGULAR>_ID` — e.g., `ORDER_ID`, `CUSTOMER_ID`
- **Sequences**: `<TABLE>_SEQ` — e.g., `ORDERS_SEQ`, `CUSTOMERS_SEQ`
- **Indexes**: `IDX_<TABLE>_<COLUMNS>` — e.g., `IDX_ORDERS_STATUS`, `IDX_ORDERS_CUST_CREATED`
- **Unique constraints**: `UQ_<TABLE>_<COLUMNS>` — e.g., `UQ_USERS_EMAIL`
- **Check constraints**: `CHK_<TABLE>_<DESCRIPTION>` — e.g., `CHK_ORDERS_TOTAL_POSITIVE`
- **Foreign key constraints**: `FK_<TABLE>_<REFERENCED_TABLE>` — e.g., `FK_ORDER_ITEMS_ORDERS`
- **Triggers**: `TRG_<TABLE>_<PURPOSE>` — e.g., `TRG_ORDERS_AUDIT`, `TRG_ORDERS_UPDATED_AT`
- **Packages**: `PKG_<DOMAIN>` — e.g., `PKG_ORDER_MGMT`, `PKG_REFUND_PROC`
- **Boolean columns**: prefix with `IS_` or `HAS_` — e.g., `IS_ACTIVE`, `HAS_SHIPPED`
- **Maximum identifier length**: 30 characters (Oracle 12.1 and earlier); 128 characters (Oracle 12.2+) — design for 30 to maintain backward compatibility unless the minimum version is 12.2+

### Correct

```
ORDERS                         -- plural, uppercase
ORDERS.ID                      -- PK named ID
ORDERS.CUSTOMER_ID             -- FK references CUSTOMERS.ID
ORDERS.IS_ACTIVE               -- boolean with IS_ prefix
ORDER_ITEMS                    -- snake_case multi-word
IDX_ORDERS_STATUS              -- index naming
UQ_USERS_EMAIL                 -- unique constraint naming
FK_ORDER_ITEMS_ORDERS          -- foreign key naming
ORDERS_SEQ                     -- sequence naming
TRG_ORDERS_UPDATED_AT          -- trigger naming
```

### Incorrect

| Pattern | Problem |
|---------|---------|
| `orders` (lowercase, unquoted) | Oracle folds to uppercase anyway; inconsistent casing in metadata queries |
| `"orders"` (lowercase, quoted) | Forces quoting everywhere; all SQL, ORM mappings, and reports must use exact case |
| `ORDER_ITEMS_ORDER_ITEM_ID` (verbose PK) | Redundant; `ID` is sufficient on the owning table |
| `IX1_ORDERS` (meaningless index name) | Cannot identify purpose; use descriptive naming |
| Names exceeding 30 characters without confirming Oracle version ≥ 12.2 | `ORA-00972: identifier is too long` on older instances |

---

## 2. Data Type Selection

### Rules

- **Primary keys**: `NUMBER(19)` populated by a sequence (or `GENERATED ALWAYS AS IDENTITY` in 12c+) for sequential IDs; `RAW(16)` for UUID storage with `SYS_GUID()` as default
- **Timestamps**: `TIMESTAMP WITH TIME ZONE` — never `DATE` for timestamps (Oracle `DATE` includes time but no time zone); store in UTC
- **Date-only values**: `DATE` — acceptable for date-only values since Oracle `DATE` includes time (set to midnight)
- **Text**: `VARCHAR2(n)` — always `VARCHAR2`, never `VARCHAR` (Oracle reserves `VARCHAR` for future use with different semantics); use `CLOB` for text exceeding 4000 bytes (or 32767 bytes with `MAX_STRING_SIZE=EXTENDED`)
- **Money/currency**: `NUMBER(precision, scale)` — e.g., `NUMBER(15,2)` — never `BINARY_FLOAT` or `BINARY_DOUBLE` (rounding errors)
- **Booleans**: `NUMBER(1)` with `CHECK (column IN (0, 1))` — Oracle has no native boolean column type (PL/SQL has `BOOLEAN` but it cannot be stored in a table column); Oracle 23c introduces native `BOOLEAN` columns
- **Integers**: `NUMBER(10)` for regular integers, `NUMBER(19)` for large integers — `INTEGER` is an alias for `NUMBER(38)` which is unnecessarily wide
- **JSON**: `JSON` column type (Oracle 21c+) or `CLOB` with `IS JSON` check constraint (Oracle 12c+) — supports JSON indexing, `JSON_VALUE`, `JSON_QUERY`, and `JSON_TABLE`
- **Binary data**: `RAW(n)` for up to 2000 bytes; `BLOB` for larger binary data
- **Enums/status values**: `VARCHAR2(30)` with `CHECK` constraint — no native ENUM type

### Type Selection Quick Reference

| Data | Correct type | Incorrect type | Rationale |
|------|-------------|---------------|-----------|
| Primary key (sequential) | `NUMBER(19) GENERATED ALWAYS AS IDENTITY` | `NUMBER` (unspecified precision) | Explicit precision prevents 38-digit numbers; identity column eliminates sequence boilerplate |
| Primary key (UUID) | `RAW(16) DEFAULT SYS_GUID()` | `VARCHAR2(36)` | RAW(16) is 20 bytes smaller per row than the string representation |
| Timestamps | `TIMESTAMP(6) WITH TIME ZONE` | `DATE` | DATE has no time zone; causes bugs in distributed systems |
| Date only | `DATE` (time set to midnight) | `TIMESTAMP` (unnecessary precision) | DATE is sufficient; simpler date arithmetic |
| Price / amount | `NUMBER(15,2)` | `BINARY_FLOAT`, `BINARY_DOUBLE` | Floating point has rounding errors |
| Status | `VARCHAR2(30)` + `CHECK` | `NUMBER` with magic codes | Self-documenting; no lookup table needed for simple status |
| Free-form text (< 4000 bytes) | `VARCHAR2(4000)` | `CLOB` (unnecessary overhead) | VARCHAR2 is inline; CLOB is stored out-of-row with LOB locator overhead |
| Free-form text (> 4000 bytes) | `CLOB` | `VARCHAR2(4000)` (truncation risk) | CLOB handles arbitrarily large text |
| Boolean | `NUMBER(1) CHECK (col IN (0, 1))` | `CHAR(1)` ('Y'/'N') | Numeric boolean is more portable; consistent with ORM mappings |
| JSON (Oracle 21c+) | `JSON` | `VARCHAR2` or `CLOB` without IS JSON | Native JSON type validates syntax and enables optimized storage |
| JSON (Oracle 12c–19c) | `CLOB CHECK (col IS JSON)` | `CLOB` without check | IS JSON constraint prevents invalid JSON from being stored |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `NUMBER` without precision/scale | Accepts up to 38 digits; wastes space and allows implausibly large values |
| `VARCHAR` instead of `VARCHAR2` | Oracle reserves VARCHAR for future use with potentially different comparison semantics |
| `DATE` for timestamps in multi-timezone systems | No time zone info; times are ambiguous |
| `CHAR(1)` for booleans ('Y'/'N') | Requires padding awareness; ORM mapping is inconsistent; use `NUMBER(1)` |
| `BINARY_FLOAT` for money | `0.1 + 0.2 ≠ 0.3` in binary floating point |
| `VARCHAR2(255)` as default length | Arbitrary; either the length is a business constraint or use `VARCHAR2(4000)` |

---

## 3. Constraint Design

### Rules

- Every table must have a **primary key** — no exceptions
- Every foreign key must have an **explicit named constraint** with defined cascade behavior
- Use `NOT NULL` as the **default** — nullable only when there is a genuine business reason
- Use `CHECK` constraints for **domain validation** — status values, positive amounts, ranges
- Use `UNIQUE` constraints for **business uniqueness** — email, external IDs, natural keys
- **Default values** should be meaningful — `SYSTIMESTAMP` for timestamps, `SYS_GUID()` for UUIDs, `0`/`1` for booleans
- Oracle supports **deferred constraints** (`DEFERRABLE INITIALLY DEFERRED`) — use for circular references or batch load scenarios where FK order matters within a transaction

### Cascade Rule Selection

| Relationship | Recommended cascade | Rationale |
|-------------|-------------------|-----------|
| Parent owns children exclusively (ORDER → ORDER_ITEMS) | `ON DELETE CASCADE` | Children have no meaning without the parent |
| Reference to shared entity (ORDER → CUSTOMER) | No cascade (default RESTRICT behavior) | Don't delete a customer because one order is removed |
| Soft-delete system | No cascade | Physical deletes should not occur; rely on application-level soft delete |
| Audit/history records | `ON DELETE SET NULL` | Audit trail should survive deletion of the source entity |

### Oracle-Specific Constraint Notes

| Concern | Oracle behavior |
|---------|----------------|
| `ON DELETE SET NULL` | Supported — sets FK column to NULL when parent is deleted |
| `ON DELETE CASCADE` | Supported — deletes child rows when parent is deleted |
| `ON UPDATE CASCADE` | **Not supported** — Oracle does not support cascading updates on FK; design PKs to be immutable |
| Deferred constraints | Supported via `DEFERRABLE INITIALLY DEFERRED`; useful for batch inserts with circular references |
| Unique constraint on NULLs | Oracle treats multiple NULLs as distinct in unique constraints — multiple rows can have NULL in a unique column (unlike SQL Server) |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| No primary key | Every table needs a PK for ORM mapping, replication, and join correctness |
| Relying on `ON UPDATE CASCADE` | Not available in Oracle; PKs must be immutable or updates handled in application code |
| Nullable boolean without CHECK constraint | Three-state logic (NULL, 0, 1); use `NOT NULL DEFAULT 0` + `CHECK (col IN (0, 1))` |
| FK without a named constraint | Auto-generated names like `SYS_C00123456` are meaningless in error messages and migrations |

---

## 4. Indexing Strategy

### Rules

- Oracle **does not automatically index foreign key columns** — every FK column must have an explicit index to avoid table-level locks during parent deletes/updates
- **B-tree indexes** are the default and correct choice for high-cardinality columns (equality, range, sort)
- **Bitmap indexes** are for **read-heavy, low-cardinality columns in data warehouse workloads only** — never on OLTP tables (bitmap indexes cause severe locking contention on concurrent writes)
- **Function-based indexes** for queries that filter on expressions — e.g., `UPPER(EMAIL)`, `TRUNC(CREATED_AT)`
- **Composite indexes** follow the left-prefix rule — most selective or most frequently filtered column first
- **Reverse key indexes** for sequences and identity columns in RAC environments — prevent hot blocks when multiple nodes insert sequentially
- **Index-organized tables** (IOTs) for lookup tables where the PK is the primary access path and the table is small
- Do not **over-index** — each index adds redo log overhead on writes; only index for known query patterns

### Index Type Selection

| Use case | Index type | Example |
|----------|-----------|---------|
| Equality and range queries | B-tree (default) | `CREATE INDEX IDX_ORDERS_STATUS ON ORDERS (STATUS)` |
| Composite filter + sort | B-tree composite | `CREATE INDEX IDX_ORDERS_CUST_CREATED ON ORDERS (CUSTOMER_ID, CREATED_AT DESC)` |
| Case-insensitive search | Function-based | `CREATE INDEX IDX_USERS_EMAIL_UPPER ON USERS (UPPER(EMAIL))` |
| Date-only queries on timestamp columns | Function-based | `CREATE INDEX IDX_ORDERS_CREATED_DATE ON ORDERS (TRUNC(CREATED_AT))` |
| Low-cardinality column in DW | Bitmap (DW only) | `CREATE BITMAP INDEX IDX_ORDERS_STATUS_BMP ON ORDERS (STATUS)` |
| Text search | Oracle Text (CONTEXT index) | `CREATE INDEX IDX_PRODUCTS_DESC ON PRODUCTS (DESCRIPTION) INDEXTYPE IS CTXSYS.CONTEXT` |
| JSON field queries | Function-based on JSON_VALUE | `CREATE INDEX IDX_ORDERS_REGION ON ORDERS (JSON_VALUE(METADATA, '$.region'))` |
| RAC sequential insert hot block prevention | Reverse key | `CREATE INDEX IDX_ORDERS_ID_REV ON ORDERS (ID) REVERSE` |

### Foreign Key Index Requirement

| FK Column | Index required? | Why |
|-----------|----------------|-----|
| Every FK column | **Yes** | Without an index, Oracle acquires a table-level lock on the child table during parent DELETE/UPDATE — this serializes all DML on the child table |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| No index on FK columns | Table-level locks on child table during parent row operations; severe concurrency bottleneck |
| Bitmap index on an OLTP table | Bitmap indexes lock entire bitmap segments; one writer blocks all others on that segment |
| Index on every column | Excessive redo log; slow DML; most indexes never used by the optimizer |
| Composite index with low-selectivity column first | Optimizer cannot skip to the selective column; put the most filtered column first |
| No function-based index for `WHERE UPPER(email) = :val` queries | Full table scan because the index on `EMAIL` doesn't match `UPPER(EMAIL)` |

---

## 5. Partitioning

### Rules

- Oracle partitioning is a **licensed option** (Enterprise Edition) — confirm licensing before designing partitioned tables
- Use **range partitioning** for time-series data (transactions, audit logs, events) — partition by month or quarter
- Use **list partitioning** for discrete categories (region, tenant, status category)
- Use **hash partitioning** for even data distribution when no natural range/list key exists
- Use **composite partitioning** (range-hash, range-list) for large tables that benefit from two partition dimensions
- **Interval partitioning** (Oracle 11g+) auto-creates range partitions as data arrives — use for time-series to avoid manual partition maintenance
- **Partition pruning** must be effective — the partition key must appear in the most common query WHERE clauses
- Design partition granularity to keep partitions between **1M–100M rows** — too few rows per partition adds overhead; too many defeats the purpose

### Partitioning Decision

| Question | If yes | If no |
|----------|--------|-------|
| Will the table exceed 50M rows? | Consider partitioning | Likely unnecessary |
| Do queries filter on one column consistently (date, region, tenant)? | That column is the partition key | Partitioning may not help |
| Is data retention required (purge data older than N years)? | Range partition — `ALTER TABLE DROP PARTITION` is instant vs. `DELETE` on millions of rows | Less compelling reason to partition |
| Is the table a fact table in a star schema? | Partition by date; enable partition-wise joins | Partitioning still helps large fact tables |
| Is the Oracle Enterprise Edition Partitioning option licensed? | Proceed with design | **Cannot use partitioning** — optimize indexes instead |

### Oracle-Specific Partitioning Features

| Feature | Use case |
|---------|----------|
| Interval partitioning | Time-series — auto-creates monthly/quarterly partitions without DDL |
| Reference partitioning | Child table inherits partition scheme from parent via FK — ORDER_ITEMS partitioned the same as ORDERS |
| Partition exchange (`EXCHANGE PARTITION`) | Bulk data loading — load into a staging table, then swap it in as a partition |
| Online partition operations (12c+) | Move, split, merge partitions without blocking DML |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Partitioning a table with < 1M rows | Overhead exceeds benefit |
| Partition key not in query WHERE clauses | No partition pruning; every query scans all partitions |
| Daily partitions on very high-volume tables | Thousands of partitions degrade optimizer performance; use monthly or quarterly |
| Designing partitioned tables without confirming Enterprise Edition licensing | Partitioning is a paid option; will fail on Standard Edition |

---

## 6. Schema Evolution and Migrations

### Rules

- All schema changes must be expressed as **versioned migration scripts** — never modify the database with ad-hoc DDL
- Oracle DDL is **auto-committed** — each DDL statement is an implicit commit; this cannot be rolled back within a transaction
- **Online DDL** (Oracle 12c+): many `ALTER TABLE` operations support `ONLINE` keyword — allows concurrent DML during the change
- **Adding a column**: add as `NULL` first; backfill; then add `NOT NULL` constraint — adding a `NOT NULL` column without a default on a populated table fails
- **Adding a column with DEFAULT** (Oracle 11g+): `ALTER TABLE ADD column DEFAULT value` stores the default in metadata only (not written to every row) — this is instant regardless of table size
- **Edition-based redefinition** (EBR): for zero-downtime schema changes in enterprise deployments — allows old and new code to run against different "editions" of the schema simultaneously
- **DBMS_REDEFINITION**: for online table reorganization (changing column order, partitioning strategy, storage) without blocking access

### Safe vs. Breaking Changes

| Change | Safe? | Oracle behavior |
|--------|-------|----------------|
| Add new table | Yes | No impact on existing objects |
| Add nullable column | Yes | Instant — no table modification needed |
| Add column with DEFAULT (11g+) | Yes | Metadata-only change — instant regardless of table size |
| Add index (small table) | Yes | Brief lock at start and end |
| Add index (large table) | Caution | Use `CREATE INDEX ... ONLINE` to allow concurrent DML |
| Drop column | Breaking | Phase 1: stop reading/writing in code; Phase 2: `ALTER TABLE SET UNUSED` (instant); Phase 3: `ALTER TABLE DROP UNUSED COLUMNS` (background) |
| Rename column (12c+) | Breaking | `ALTER TABLE RENAME COLUMN` is DDL (auto-commit); phase out old references first |
| Change column type | Breaking | Phased: add new column, backfill, switch code, drop old |
| Add NOT NULL to existing column | Breaking | Phase 1: backfill NULLs; Phase 2: `ALTER TABLE MODIFY ... NOT NULL` |
| Drop table | Breaking | Ensure no code references; use `DROP TABLE ... PURGE` (skips recycle bin) |

### Oracle-Specific Migration Techniques

| Technique | When to use |
|-----------|-------------|
| `SET UNUSED` + `DROP UNUSED COLUMNS` | Dropping columns on large tables — `SET UNUSED` is instant; actual removal runs in background |
| `CREATE INDEX ... ONLINE` | Adding indexes on tables with active DML — allows concurrent reads and writes |
| `ALTER TABLE ... ENABLE ROW MOVEMENT` | Required before moving rows between partitions or enabling flashback |
| `DBMS_REDEFINITION` | Major table restructuring (re-partitioning, changing PK, reorganizing columns) without downtime |
| Edition-based redefinition (EBR) | Zero-downtime schema evolution — old and new application code see different schema views |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `ALTER TABLE ADD column NOT NULL` on a populated table without a DEFAULT | Fails — existing rows have no value |
| Expecting DDL to be transactional | Oracle auto-commits DDL; cannot roll back a `CREATE TABLE` within a transaction |
| `DROP COLUMN` on a large table during business hours | Locks the table for the duration; use `SET UNUSED` followed by background `DROP UNUSED COLUMNS` |
| `CREATE INDEX` (without `ONLINE`) on an active large table | Blocks DML during index build |
| Manual DDL not captured in migration scripts | Schema drift; unpredictable deployments |

---

## 7. Data Integrity Patterns

### Rules

- Use **soft deletes** (`DELETED_AT TIMESTAMP WITH TIME ZONE DEFAULT NULL`) when audit trails are required — create a function-based index excluding deleted rows
- Use **optimistic locking** (`VERSION NUMBER(10) DEFAULT 1`) for concurrently edited entities
- Use **audit columns** on every table: `CREATED_AT`, `UPDATED_AT`, `CREATED_BY`, `UPDATED_BY` — maintain `UPDATED_AT` via trigger (Oracle has no `ON UPDATE` auto-timestamp)
- Use **Virtual Private Database** (VPD) or **Oracle Label Security** (OLS) for row-level security in multi-tenant schemas — enforced at the database level, not just the application
- Use **Flashback Data Archive** (Total Recall) for regulatory audit requirements — automatically maintains full row-change history without application-level audit tables
- Define **data retention rules** per entity — which tables have retention policies and how old data is archived or purged (partition drop for partitioned tables; archival scripts for non-partitioned)

### Standard Audit Columns

Every table should include:

| Column | Type | Default | Maintained by | Purpose |
|--------|------|---------|---------------|---------|
| `CREATED_AT` | `TIMESTAMP(6) WITH TIME ZONE` | `SYSTIMESTAMP` | Default value on insert | When the row was created |
| `UPDATED_AT` | `TIMESTAMP(6) WITH TIME ZONE` | `SYSTIMESTAMP` | Trigger on update | When the row was last modified |
| `CREATED_BY` | `VARCHAR2(100)` | — | Application or `SYS_CONTEXT('USERENV', 'SESSION_USER')` | Who created the row |
| `UPDATED_BY` | `VARCHAR2(100)` | — | Trigger or application | Who last modified the row |

Optional:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `DELETED_AT` | `TIMESTAMP(6) WITH TIME ZONE` | `NULL` | Soft delete marker |
| `VERSION` | `NUMBER(10)` | `1` | Optimistic locking |

### Audit Trigger Pattern

Oracle does not have `ON UPDATE CURRENT_TIMESTAMP` like MySQL. Use a trigger:

```sql
CREATE OR REPLACE TRIGGER TRG_ORDERS_UPDATED_AT
  BEFORE UPDATE ON ORDERS
  FOR EACH ROW
BEGIN
  :NEW.UPDATED_AT := SYSTIMESTAMP;
END;
```

### Oracle-Specific Integrity Features

| Feature | Use case |
|---------|----------|
| Flashback Data Archive | Regulatory compliance — automatic history of all row changes; queryable with `AS OF TIMESTAMP` |
| Virtual Private Database (VPD) | Multi-tenant row-level security — database transparently adds `WHERE tenant_id = :current_tenant` to every query |
| Oracle Label Security (OLS) | Classification-based access — rows labeled with security classification; users see only their clearance level |
| Unified Auditing | Audit all DML/DDL activity with `AUDIT` policies — built into the database engine |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| No `CREATED_AT` / `UPDATED_AT` on tables | Cannot audit when data changed |
| Application-level audit tables when Flashback Data Archive is available | Reinventing the wheel; FDA is more complete and lower-maintenance |
| Multi-tenant filtering only in application WHERE clauses | One application bug exposes all tenants; VPD enforces at the database level |
| No optimistic locking on concurrently edited entities | Last-write-wins; user's changes silently overwritten |

---

## 8. Performance Design Considerations

### Rules

- Design for the **expected query patterns** from functional requirements and NFRs
- **Oracle's Cost-Based Optimizer** (CBO) is sophisticated but depends on accurate statistics — note in the design that `DBMS_STATS` must be run regularly (this is an operational concern, but schema design should not undermine the optimizer)
- **Bind variables** are essential for Oracle performance — design data access patterns that use bind variables, not literal values in SQL (literal values cause hard parsing and cursor cache flooding)
- **Sequences with CACHE** — use `CACHE 100` or higher for sequences on high-insert tables; `NOCACHE` causes a latch contention bottleneck
- **Materialized views** for expensive aggregations — define refresh strategy (`FAST` refresh with materialized view logs for incremental updates, or `COMPLETE` for full rebuild)
- **Global temporary tables** (`ON COMMIT PRESERVE ROWS` or `ON COMMIT DELETE ROWS`) for session-specific working data — private to each session; no redo/undo overhead
- **Result cache** (`RESULT_CACHE` hint) for frequently executed queries with stable results — cached in SGA, auto-invalidated when underlying data changes

### Query Pattern Documentation

| Query pattern | Frequency | Tables | Filter | Sort | Expected rows | Index / optimization |
|--------------|-----------|--------|--------|------|--------------|---------------------|
| List pending refunds | High | REFUNDS | STATUS, CREATED_AT | CREATED_AT DESC | < 1000 | `IDX_REFUNDS_STATUS_CREATED` |
| Get order with items | Medium | ORDERS, ORDER_ITEMS | ORDERS.ID | — | 1 + N items | PK + FK index |
| Monthly report | Low (batch) | REFUNDS, ORDERS | CREATED_AT range | — | ~10k/month | Partition pruning on CREATED_AT |
| Dashboard aggregation | High | ORDERS | STATUS, CREATED_AT | — | Aggregate | Materialized view with FAST refresh |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Sequences with `NOCACHE` on high-insert tables | Serialized access to sequence dictionary row; bottleneck under concurrent inserts |
| Literal SQL values instead of bind variables | Hard parse for every distinct value; cursor cache overflow; CPU waste |
| `SELECT *` in design (fetching all columns) | Over-fetches; prevents index-only scans; more I/O |
| No partition pruning consideration for large tables | Queries scan all partitions; negates partitioning benefits |
| Materialized view with no refresh strategy | Data goes stale; no one knows when it updates |

---

## Customization

- **Section 1 (Naming — UPPER_SNAKE_CASE):** While Oracle traditionally uses `UPPER_SNAKE_CASE` (and stores unquoted identifiers as uppercase), some organizations use lowercase with quoted identifiers for consistency with other databases. The key requirement is consistency across the schema. Document the chosen convention and apply it uniformly.

- **Section 2 (Data Type Selection — GENERATED ALWAYS AS IDENTITY):** `GENERATED ALWAYS AS IDENTITY` requires Oracle 12c+. Projects on Oracle 11g must use sequences with triggers. The design should specify the Oracle version and the identity generation approach.

- **Section 5 (Partitioning):** Oracle partitioning is a separately licensed feature (Enterprise Edition + Partitioning Option). Verify license availability before designing partitioned tables. For Standard Edition, use alternative approaches (archiving old data, manual range tables). The design must document the licensing constraint.

- **Section 6 (Schema Evolution — SET UNUSED vs. DROP COLUMN):** `SET UNUSED` is preferred for production columns because it's instantaneous, while `DROP COLUMN` requires a table rebuild. However, unused columns still consume dictionary space. For development or staging environments, `DROP COLUMN` is acceptable. The design should specify the environment context.

- **Section 7 (Data Integrity — Virtual Private Database):** VPD (row-level security via policies) is an Enterprise Edition feature. Standard Edition projects should implement row-level filtering at the application layer. The design should note which security model is used and any licensing implications.

- **Section 7 (Data Integrity — Flashback Data Archive):** Flashback Data Archive (Total Recall) is an Enterprise Edition feature that provides automatic temporal tracking. Standard Edition projects needing audit history should design explicit audit tables with triggers or application-level tracking. Document the chosen approach.

- **Section 7 (Data Integrity — Edition-Based Redefinition):** EBR enables zero-downtime schema changes by allowing multiple editions of database objects. It requires significant upfront setup (editioning views, cross-edition triggers) and is appropriate for systems requiring zero-downtime deployments. For systems with maintenance windows, standard DDL is simpler. The design should document whether EBR is warranted.
