# SQL Server Database Design Standards

**Applies to:** SQL Server 2019+ and Azure SQL Database. Features gated on specific versions are noted inline (e.g., temporal tables require 2016+, row-level security requires 2016+, online DDL with `ONLINE = ON` requires Enterprise Edition, `ALGORITHM=INSTANT` for `ADD COLUMN` requires 2012+ Enterprise). Azure SQL Database supports most Enterprise features regardless of tier.

These are the baseline standards the AI uses when designing SQL Server schemas in the solutions package. During Step 3 of the data model design skill, the AI compares existing schema conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new schema should follow the existing pattern or adopt the standard.

These standards operate at the **design level** — they guide architectural decisions about data types, naming, constraints, indexing, and schema evolution. They do not prescribe operational concerns (Always On Availability Groups, backup strategies, maintenance plans). Implementation-level rules are covered separately in the implementation package.

These standards assume **SQL Server 2019 or later**. Azure SQL Database differences are noted where relevant.

---

## 1. Naming Conventions

### Rules

- **Tables**: plural, `PascalCase` — e.g., `Orders`, `OrderItems`, `RefundLineItems` — SQL Server preserves case but is case-insensitive by default
- **Columns**: singular, `PascalCase` — e.g., `OrderId`, `CreatedAt`, `TotalAmount`
- **Primary keys**: `Id` on the owning table — or `<Table>Id` if the organization prefers fully qualified PK names (e.g., `OrderId` on the `Orders` table)
- **Foreign keys**: `<ReferencedTableSingular>Id` — e.g., `OrderId`, `CustomerId`
- **Schemas**: use schemas to group related objects — e.g., `Sales.Orders`, `Inventory.Products`, `Auth.Users` — never put everything in `dbo`
- **Indexes**: `IX_<Table>_<Columns>` — e.g., `IX_Orders_Status`, `IX_Orders_CustomerId_CreatedAt`
- **Unique constraints**: `UQ_<Table>_<Columns>` — e.g., `UQ_Users_Email`
- **Check constraints**: `CK_<Table>_<Description>` — e.g., `CK_Orders_TotalPositive`
- **Foreign key constraints**: `FK_<Table>_<ReferencedTable>` — e.g., `FK_OrderItems_Orders`
- **Default constraints**: `DF_<Table>_<Column>` — e.g., `DF_Orders_CreatedAt`, `DF_Orders_IsActive`
- **Boolean columns**: prefix with `Is` or `Has` — e.g., `IsActive`, `HasShipped`, `IsRefundEligible`
- **Stored procedures**: `usp_<Domain>_<Action>` — e.g., `usp_Orders_GetByStatus`, `usp_Refunds_Create` — never prefix with `sp_` (reserved for system procedures; SQL Server checks `master` first for `sp_` prefix)

### Correct

```
Sales.Orders                   -- schema-qualified, PascalCase
Sales.Orders.Id                -- PK named Id
Sales.Orders.CustomerId        -- FK references Sales.Customers.Id
Sales.Orders.IsActive          -- boolean with Is prefix
Sales.OrderItems               -- PascalCase multi-word
IX_Orders_Status               -- index naming
UQ_Users_Email                 -- unique constraint naming
FK_OrderItems_Orders           -- foreign key naming
DF_Orders_CreatedAt            -- default constraint naming
```

### Incorrect

| Pattern | Problem |
|---------|---------|
| `orders`, `order_items` (snake_case) | Inconsistent with .NET/SQL Server ecosystem conventions; PascalCase is standard |
| `sp_GetOrders` (sp_ prefix) | SQL Server checks `master.dbo` first for `sp_` procedures; performance penalty and naming collision risk |
| Everything in `dbo` schema | No logical grouping; permissions management is all-or-nothing; harder to navigate |
| `tblOrders` or `tbl_Orders` (Hungarian notation prefix) | Adds no value; the object type is already known from context; clutters names |
| `IX1`, `IX2` (meaningless index names) | Cannot identify purpose; use descriptive naming |

---

## 2. Data Type Selection

### Rules

- **Primary keys**: `BIGINT IDENTITY(1,1)` for sequential internal IDs; `UNIQUEIDENTIFIER DEFAULT NEWSEQUENTIALID()` for UUIDs — use `NEWSEQUENTIALID()` (not `NEWID()`) to maintain clustered index insert performance
- **Timestamps**: `DATETIMEOFFSET(7)` for timestamps with time zone awareness; `DATETIME2(7)` for timestamps in a known single time zone — never `DATETIME` (3.33ms precision, limited range) or `SMALLDATETIME` (minute precision)
- **Date-only values**: `DATE` — not `DATETIME2` with time zeroed
- **Time-only values**: `TIME(7)` — not a string
- **Text**: `NVARCHAR(n)` for Unicode text (supports all languages); `VARCHAR(n)` only when the data is guaranteed ASCII — use `NVARCHAR(MAX)` or `VARCHAR(MAX)` for text exceeding 8000 bytes
- **Money/currency**: `DECIMAL(precision, scale)` — never `MONEY` or `SMALLMONEY` (fixed to 4 decimal places; implicit rounding in division; locale-dependent formatting)
- **Booleans**: `BIT` with explicit `DEFAULT` — SQL Server's native boolean type
- **JSON**: `NVARCHAR(MAX)` with `ISJSON()` check constraint — SQL Server has no native JSON column type but supports `JSON_VALUE`, `JSON_QUERY`, `OPENJSON`, and `JSON_MODIFY`; SQL Server 2022+ supports `JSON_OBJECT` and `JSON_ARRAY`
- **Binary data**: `VARBINARY(n)` for up to 8000 bytes; `VARBINARY(MAX)` for larger; `FILESTREAM` for very large files stored on the filesystem
- **Row versioning**: `ROWVERSION` (formerly `TIMESTAMP`) — automatically updated binary value for optimistic concurrency; not a timestamp despite the legacy name

### Type Selection Quick Reference

| Data | Correct type | Incorrect type | Rationale |
|------|-------------|---------------|-----------|
| Primary key (sequential) | `BIGINT IDENTITY(1,1)` | `INT` (limited to ~2.1 billion) | BIGINT avoids overflow on high-volume tables |
| Primary key (UUID) | `UNIQUEIDENTIFIER DEFAULT NEWSEQUENTIALID()` | `UNIQUEIDENTIFIER DEFAULT NEWID()` | NEWID() generates random UUIDs that fragment the clustered index; NEWSEQUENTIALID() is ordered |
| Timestamps | `DATETIMEOFFSET(7)` | `DATETIME` | DATETIME has 3.33ms precision and range 1753–9999; DATETIMEOFFSET has 100ns precision and time zone |
| Price / amount | `DECIMAL(15,2)` | `MONEY`, `FLOAT` | MONEY rounds silently in division; FLOAT has rounding errors |
| Status | `NVARCHAR(30)` + `CHECK` | `TINYINT` with magic numbers | Self-documenting; no lookup needed |
| Unicode text | `NVARCHAR(100)` | `VARCHAR(100)` | VARCHAR cannot store non-ASCII characters (accented names, CJK, emoji) |
| Free-form text | `NVARCHAR(MAX)` | `NTEXT` (deprecated) | NTEXT is deprecated; NVARCHAR(MAX) supports all string functions |
| Boolean | `BIT DEFAULT 0` | `CHAR(1)` ('Y'/'N'), `TINYINT` | BIT is the native boolean; ORM-friendly; compact storage (8 BIT columns = 1 byte) |
| Optimistic concurrency | `ROWVERSION` | Manual `INT` version column | ROWVERSION is auto-maintained by SQL Server; no trigger needed |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `DATETIME` for new columns | Legacy type; 3.33ms precision; range starts at 1753; use DATETIME2 or DATETIMEOFFSET |
| `MONEY` for financial calculations | Silent rounding in division: `CAST(1 AS MONEY) / CAST(3 AS MONEY) * CAST(3 AS MONEY) = 0.9999` not `1.0000` |
| `NEWID()` as clustered PK default | Random GUIDs fragment the clustered index; massive page splits; use NEWSEQUENTIALID() |
| `VARCHAR` for user-facing text (names, addresses, descriptions) | Cannot store accented characters, CJK, or emoji; use NVARCHAR |
| `NTEXT`, `TEXT`, `IMAGE` (deprecated types) | Deprecated since SQL Server 2005; use `NVARCHAR(MAX)`, `VARCHAR(MAX)`, `VARBINARY(MAX)` |
| `FLOAT` or `REAL` for money | Binary floating point: `0.1 + 0.2 ≠ 0.3` |

---

## 3. Constraint Design

### Rules

- Every table must have a **primary key** — preferably a clustered primary key (which is the default behavior)
- Every foreign key must have an **explicit named constraint** with defined cascade behavior
- Use `NOT NULL` as the **default** — nullable only when absence is a genuine business concept
- Use `CHECK` constraints for **domain validation** — status values, positive amounts, ranges
- Use `UNIQUE` constraints for **business uniqueness** — email, external IDs
- **Default constraints** must be **named** — unnamed defaults are auto-named with random suffixes, making them hard to reference in migrations
- SQL Server **includes NULLs in UNIQUE constraints** — a unique constraint allows only one NULL (unlike Oracle which allows multiple NULLs); use a filtered unique index if multiple NULLs should be allowed

### Cascade Rule Selection

| Relationship | Recommended cascade | Rationale |
|-------------|-------------------|-----------|
| Parent owns children (Order → OrderItems) | `ON DELETE CASCADE` | Children have no meaning without the parent |
| Reference to shared entity (Order → Customer) | `ON DELETE NO ACTION` (default) | Don't delete a customer because one order is removed |
| Soft-delete system | `ON DELETE NO ACTION` | Physical deletes should not occur |
| Self-referencing hierarchy (Employee → Manager) | `ON DELETE NO ACTION` | Cascading self-references can cause cycles; SQL Server forbids cascade on self-referencing FKs in some cases |

### SQL Server-Specific Constraint Notes

| Concern | SQL Server behavior |
|---------|-------------------|
| UNIQUE constraint + NULL | Only one NULL allowed — different from Oracle and PostgreSQL; use a filtered unique index for `WHERE column IS NOT NULL` if multiple NULLs are needed |
| Cascade cycles | SQL Server **rejects** cascade paths that form a cycle (multiple cascade paths to the same table); redesign with `NO ACTION` and handle in application code or triggers |
| Named defaults | Always name default constraints (`CONSTRAINT DF_Orders_IsActive DEFAULT 0`) — unnamed defaults get random names like `DF__Orders__IsAct__1234ABCD` |
| Computed columns | `AS (expression)` — can be `PERSISTED` (stored) and indexed; useful for derived values |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Unnamed default constraints | Auto-generated names are non-deterministic; migration scripts can't reference them reliably |
| Multiple cascade paths to the same table | SQL Server rejects this: "may cause cycles or multiple cascade paths"; use NO ACTION + application logic |
| UNIQUE constraint when multiple NULLs are expected | SQL Server treats NULL as a value in UNIQUE; use filtered index `WHERE column IS NOT NULL` |
| No primary key | ORM issues; replication issues; no clustered index (heap table) — heaps are rarely appropriate |

---

## 4. Indexing Strategy

### Rules

- The **clustered index** determines physical row order — one per table; by default it's the primary key; choose the clustered index based on the most common range scan or sort pattern
- SQL Server **automatically indexes foreign keys** — no (this is a common misconception); FK columns should have explicit non-clustered indexes
- **Non-clustered indexes** for columns in WHERE, JOIN, and ORDER BY clauses
- **Covering indexes** (`INCLUDE` clause) for index-only queries — include non-key columns that the query reads without making them part of the index key
- **Filtered indexes** for indexing a subset of rows — e.g., `WHERE IsDeleted = 0` or `WHERE Status = 'Pending'`; unique to SQL Server and very powerful
- **Columnstore indexes** for analytical/reporting queries on large tables — dramatically faster aggregation on wide tables with millions of rows
- Do not create **redundant indexes** — an index on `(A)` is redundant if `(A, B)` exists

### Index Type Selection

| Use case | Index type | Example |
|----------|-----------|---------|
| Most common range scan / sort | Clustered (one per table) | `CREATE CLUSTERED INDEX IX_Transactions_CreatedAt ON Transactions (CreatedAt)` |
| Equality and range queries | Non-clustered | `CREATE NONCLUSTERED INDEX IX_Orders_Status ON Orders (Status)` |
| Query needs extra columns without key lookup | Covering (INCLUDE) | `CREATE INDEX IX_Orders_Status ON Orders (Status) INCLUDE (CustomerId, TotalAmount)` |
| Index only active/pending rows | Filtered | `CREATE INDEX IX_Orders_Pending ON Orders (CreatedAt) WHERE Status = 'Pending'` |
| Allow multiple NULLs in a "unique" column | Filtered unique | `CREATE UNIQUE INDEX UQ_Users_Email ON Users (Email) WHERE Email IS NOT NULL` |
| Analytical queries (aggregation, scans) | Columnstore | `CREATE NONCLUSTERED COLUMNSTORE INDEX IX_Sales_CS ON Sales (ProductId, Amount, SaleDate)` |
| Full-text search | Full-text index | `CREATE FULLTEXT INDEX ON Products (Name, Description) KEY INDEX PK_Products` |
| JSON field queries | Computed column + index | Add computed column `Region AS JSON_VALUE(Metadata, '$.region')` then index it |

### Clustered Index Selection

| Scenario | Recommended clustered index | Rationale |
|----------|---------------------------|-----------|
| OLTP table with IDENTITY PK | PK (IDENTITY) — default | Sequential inserts; no page splits; narrow key keeps non-clustered indexes small |
| Time-series / event table | `CreatedAt` (or composite `TenantId, CreatedAt`) | Range scans by date are the primary access pattern |
| Table with GUID PK | **Not the GUID** — use IDENTITY as clustered PK; GUID as non-clustered unique | Random GUIDs as clustered PK cause page splits; use NEWSEQUENTIALID() if GUID must be clustered |
| Lookup / reference table | PK — default | Small table; clustered on PK is fine |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `NEWID()` GUID as clustered PK | Random inserts; severe page splits and fragmentation; high I/O |
| No index on FK columns | SQL Server does NOT auto-index FKs; join performance degrades; lock escalation issues on parent updates |
| Redundant indexes (`(A)` and `(A, B)`) | Wastes storage and write overhead; `(A, B)` covers `(A)` queries |
| Wide clustered index key (multiple columns, large data types) | Clustered key is included in every non-clustered index; wide key inflates all indexes |
| Index on every column | Write overhead; storage waste; most unused |

---

## 5. Schema Evolution and Migrations

### Rules

- All schema changes must be **versioned migration scripts** — never modify with ad-hoc SSMS changes
- SQL Server DDL is **transactional** — DDL can be wrapped in `BEGIN TRAN` / `COMMIT` and rolled back on failure (unlike Oracle)
- **Adding a column with DEFAULT**: SQL Server 2012+ with `ONLINE = ON` can add a NOT NULL column with a default as a metadata-only operation on Enterprise Edition — on Standard Edition, it rewrites the table
- **Online index operations**: `CREATE INDEX ... WITH (ONLINE = ON)` on Enterprise Edition allows concurrent DML during index builds
- **Schema changes during deployment**: use `sp_rename` cautiously (it does not update views, procedures, or application code that reference the old name)

### Safe vs. Breaking Changes

| Change | Safe? | SQL Server behavior |
|--------|-------|-------------------|
| Add new table | Yes | No impact |
| Add nullable column | Yes | Metadata-only; instant |
| Add column with DEFAULT (Enterprise, 2012+) | Yes | Metadata-only with `ONLINE = ON`; instant |
| Add column with DEFAULT (Standard Edition) | Caution | Table rewrite — locks table proportional to row count |
| Add non-clustered index (small table) | Yes | Brief locks |
| Add non-clustered index (large table, Enterprise) | Caution | Use `WITH (ONLINE = ON)` for concurrent DML |
| Add non-clustered index (large table, Standard) | Caution | Blocks writes during build; schedule during maintenance |
| Drop column | Breaking | Phase 1: remove code references; Phase 2: drop default constraint; Phase 3: drop column |
| Rename column | Breaking | `sp_rename` works but doesn't update dependent objects; phase out old references |
| Change column type (widening, e.g., INT → BIGINT) | Caution | May require table rebuild depending on the change |
| Change column type (narrowing or type change) | Breaking | Phased: add new column, backfill, switch, drop old |
| Add NOT NULL to existing column | Breaking | Phase 1: backfill NULLs; Phase 2: `ALTER TABLE ALTER COLUMN ... NOT NULL` |

### SQL Server-Specific Migration Notes

| Concern | Design consideration |
|---------|---------------------|
| DDL is transactional | Wrap migration scripts in `BEGIN TRY / BEGIN TRAN / COMMIT / ROLLBACK` for atomic changes |
| Drop column requires dropping constraints first | Must drop default constraints, check constraints, and indexes on the column before dropping it |
| `sp_rename` does not cascade | Renaming a column or table does not update views, stored procedures, or triggers that reference it |
| Enterprise vs. Standard Edition | Online DDL operations (`ONLINE = ON`) are Enterprise-only; Standard Edition blocks concurrent access |
| Azure SQL Database | Most online DDL operations are available regardless of tier (no Enterprise/Standard distinction) |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Dropping a column without first dropping its constraints | Fails with dependency errors; must drop named defaults, checks, indexes first |
| `sp_rename` for a column referenced by views or procedures | Dependent objects break silently; only discovered at runtime |
| Non-transactional migration scripts | Partial failures leave the database in an inconsistent state; wrap in transactions |
| `ALTER TABLE ALTER COLUMN ... NOT NULL` without backfilling NULLs first | Fails if any row has NULL; backfill first |

---

## 6. Schema Design

### Rules

- Use **schemas** (`Sales`, `Inventory`, `Auth`, `Reporting`) to logically group related objects — not the `dbo` default for everything
- Grant permissions at the **schema level** — `GRANT SELECT ON SCHEMA::Sales TO ReportingRole` instead of per-table grants
- Use **synonyms** for cross-database references — isolates the calling code from the physical database location
- Use **views** to expose stable read interfaces over tables that may change — consumers query the view; schema changes are absorbed by updating the view definition
- Use **computed columns** for derived values that are frequently queried — `PERSISTED` computed columns are stored and can be indexed

### Schema Organization

| Schema | Purpose | Example objects |
|--------|---------|----------------|
| `Sales` | Order management, pricing, discounts | `Sales.Orders`, `Sales.OrderItems`, `Sales.Discounts` |
| `Inventory` | Product catalog, stock management | `Inventory.Products`, `Inventory.StockLevels` |
| `Auth` | Authentication, authorization, users | `Auth.Users`, `Auth.Roles`, `Auth.UserRoles` |
| `Reporting` | Materialized views, summary tables for reporting | `Reporting.MonthlySales`, `Reporting.CustomerActivity` |
| `Staging` | ETL staging tables, temporary import tables | `Staging.ImportOrders`, `Staging.RawTransactions` |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Everything in `dbo` | No logical grouping; permissions are per-table; harder to navigate with hundreds of objects |
| Cross-database queries with hardcoded database names | Breaks when database names differ between environments; use synonyms |
| No views over frequently queried tables | Direct table access couples consumers to the physical schema; changes break consumers |

---

## 7. Data Integrity Patterns

### Rules

- Use **soft deletes** (`IsDeleted BIT DEFAULT 0` or `DeletedAt DATETIMEOFFSET DEFAULT NULL`) when audit trails are required — use a filtered index on `WHERE IsDeleted = 0` for query performance
- Use **ROWVERSION** for optimistic concurrency — auto-maintained by SQL Server; no trigger needed; EF Core and other ORMs support it natively
- Use **audit columns** on every table: `CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`
- Use **temporal tables** (system-versioned, SQL Server 2016+) for automatic row-change history — SQL Server maintains a history table transparently; queryable with `FOR SYSTEM_TIME` clause
- Use **row-level security** (RLS, SQL Server 2016+) for multi-tenant schemas — security predicates filter rows transparently at the database level

### Standard Audit Columns

| Column | Type | Default / Maintenance | Purpose |
|--------|------|----------------------|---------|
| `CreatedAt` | `DATETIMEOFFSET(7)` | `DEFAULT SYSDATETIMEOFFSET()` | When the row was created |
| `UpdatedAt` | `DATETIMEOFFSET(7)` | Trigger or application code | When the row was last modified |
| `CreatedBy` | `NVARCHAR(100)` | Application sets on insert | Who created the row |
| `UpdatedBy` | `NVARCHAR(100)` | Trigger or application | Who last modified the row |

Optional:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `IsDeleted` | `BIT` | `0` | Soft delete flag |
| `DeletedAt` | `DATETIMEOFFSET(7)` | `NULL` | Soft delete timestamp |
| `RowVersion` | `ROWVERSION` | Auto-maintained | Optimistic concurrency |

### SQL Server-Specific Integrity Features

| Feature | Use case |
|---------|----------|
| Temporal tables (system-versioned) | Automatic change history — SQL Server maintains a history table; query with `FOR SYSTEM_TIME AS OF`, `BETWEEN`, `CONTAINED IN` |
| Row-level security (RLS) | Multi-tenant filtering — security predicates applied transparently; one bug in app code doesn't expose all tenants |
| Change Data Capture (CDC) | Track row-level changes for ETL/replication — captures INSERT, UPDATE, DELETE in change tables |
| Change Tracking | Lightweight change detection — tracks which rows changed (not the old values); useful for sync scenarios |
| Always Encrypted | Column-level encryption — data encrypted in transit and at rest; keys managed outside SQL Server; database never sees plaintext |
| Dynamic Data Masking | Mask sensitive data for non-privileged users — e.g., show only last 4 digits of SSN |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Manual version column + trigger when ROWVERSION is available | ROWVERSION is simpler, auto-maintained, and ORM-friendly |
| Application-level change history tables when temporal tables are available | Temporal tables are more complete, lower maintenance, and queryable with time-travel syntax |
| Multi-tenant filtering only in application WHERE clauses | One bug exposes all tenants; RLS enforces at the database level |
| No `CreatedAt` / `UpdatedAt` | Cannot audit when data changed |

---

## 8. Performance Design Considerations

### Rules

- The **clustered index** is the single most important performance decision — it determines physical data layout; choose based on the primary access pattern, not just the PK
- **Parameter sniffing** — SQL Server caches query plans based on the first parameter values it sees; design for this by noting queries where data distribution is highly skewed (some parameter values return 10 rows, others return 1 million)
- Use **OPTION (RECOMPILE)** sparingly in the design — note queries where parameter sniffing is likely to cause plan quality issues so the backend design can address it
- **Columnstore indexes** for reporting queries — orders of magnitude faster for aggregation on tables with millions of rows
- **Indexed views** (materialized views) for pre-computed aggregations — define refresh approach (automatically maintained on DML in Enterprise; manual in Standard)
- **Table-valued parameters** (TVPs) for batch operations — pass multiple rows to a stored procedure without temp tables or string splitting
- **TempDB contention** — note queries that use heavy sorting, spills, or temp tables; these compete for TempDB resources

### Query Pattern Documentation

| Query pattern | Frequency | Tables | Filter | Sort | Expected rows | Index / optimization |
|--------------|-----------|--------|--------|------|--------------|---------------------|
| List pending refunds | High | Refunds | Status, CreatedAt | CreatedAt DESC | < 1000 | Filtered index `WHERE Status = 'Pending'` |
| Get order with items | Medium | Orders, OrderItems | Orders.Id | — | 1 + N items | Clustered PK + FK index |
| Monthly report | Low | Refunds, Orders | CreatedAt range | — | ~10k/month | Non-clustered index on CreatedAt |
| Dashboard totals | High | Orders | Status | — | Aggregate | Indexed view or columnstore index |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Random GUID (`NEWID()`) as clustered PK | Page splits on every insert; severe fragmentation; high I/O |
| No consideration for parameter sniffing on skewed data | Cached plan optimized for one value performs terribly for another |
| `SELECT *` in the design | Over-fetches; prevents covering index use; more I/O |
| No columnstore index for large reporting tables | Row-by-row aggregation when columnstore can batch-process millions of rows in milliseconds |
| Heap tables (no clustered index) | Forwarding pointers cause extra I/O; no physical ordering; rarely appropriate for OLTP |

---

## Customization

- **Section 1 (Naming — PascalCase):** PascalCase is the SQL Server convention. Organizations using cross-database tools or codebases that standardize on `snake_case` across all databases may override this. The key requirement is consistency across the schema. Document the chosen convention.

- **Section 2 (Data Type Selection — NEWSEQUENTIALID vs. NEWID):** `NEWSEQUENTIALID()` is preferred for clustered PKs because it avoids page splits. However, sequential GUIDs are predictable, which may be a concern for externally exposed IDs. For external-facing IDs, consider `NEWID()` with a non-clustered PK and a separate clustered index on a sequential column (e.g., `IDENTITY` column). Document the trade-off.

- **Section 2 (Data Type Selection — DECIMAL vs. MONEY):** `DECIMAL` is recommended because `MONEY` has fixed scale (4 decimal places) and unexpected behavior in division. However, some organizations have existing schemas that use `MONEY` extensively. The design should document the chosen approach and not mix them within the same schema.

- **Section 5 (Schema Evolution — Temporal Tables):** Temporal tables (system-versioned) require SQL Server 2016+. Projects on SQL Server 2014 or earlier must use manual history tables with triggers. Azure SQL Database supports temporal tables in all tiers. The design should note the SQL Server version and choose accordingly.

- **Section 6 (Schema Design — Schemas):** Schema separation (e.g., `Sales`, `Inventory`, `Auth`) is recommended for large databases with distinct domain boundaries. Small databases with fewer than 20 tables may use `dbo` only. The design should specify the schema strategy based on the application's domain complexity.

- **Section 7 (Data Integrity — Row-Level Security):** RLS requires SQL Server 2016+ or Azure SQL Database. Projects on earlier versions must implement row-level filtering at the application layer. RLS adds overhead to every query against the secured table — evaluate the performance impact during design.

- **Section 8 (Performance — Columnstore Indexes):** Columnstore indexes are beneficial for analytics and reporting queries on large tables (millions of rows) but add write overhead. OLTP-only tables with frequent inserts/updates should not use columnstore unless they also serve reporting queries. The design should identify which tables have reporting workloads.
