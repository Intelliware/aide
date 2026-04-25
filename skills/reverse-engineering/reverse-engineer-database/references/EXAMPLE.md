# reverse-engineer-database — Worked Example

## Scenario

User has a PostgreSQL 16 database for OrderHub at `~/code/orderhub-db`, managed via Flyway (47 migrations). The schema includes 32 tables, 8 views, 12 stored procedures, 6 triggers, RLS policies on tenant-scoped tables.

User says: *"Document the database at ~/code/orderhub-db."*

## Stage 1 — Discovery and Inventory

```
DB engine: PostgreSQL 16
Migration tool: Flyway (47 migrations: V1__init through V47__add_partial_indexes)
Schemas: public, audit, archive
Tables: 32 (orders, customers, products, line_items, payments, ...)
Views: 8 (vw_active_orders, vw_revenue_by_day, ...)
Functions / sprocs: 12 (fn_calculate_order_total, sp_archive_old_orders, ...)
Triggers: 6 (audit triggers on orders/payments, soft-delete on customers, ...)
Indexes: 84 (12 partial, 4 partitioned)
RLS policies: enabled on 9 tenant-scoped tables
FK relationships: 41 (mapped for ERD)
```

`steps/scaffold.md` proposes Part A as 14 files under `docs/database-internal/`, Part B1 as `data-dictionary.md` + `erd.mmd`, Part B2 as `database-consumer-guide.md`. User approves.

## Stage 2 — Schema Documentation

For each of the 32 tables, document columns (verified against DDL):

```
public.orders
  Source DDL: V1__init.sql:42-78, V12__add_idempotency_key.sql, V31__alter_status_enum.sql
  Columns:
    id              UUID            NOT NULL   PRIMARY KEY  DEFAULT uuid_generate_v4()
    customer_id     UUID            NOT NULL   FK→customers.id  ON DELETE RESTRICT
    status          order_status    NOT NULL   DEFAULT 'pending'
    total_cents     BIGINT          NOT NULL   CHECK (total_cents >= 0)
    idempotency_key TEXT            NULL       UNIQUE WHERE deleted_at IS NULL
    created_at      TIMESTAMPTZ     NOT NULL   DEFAULT now()
    updated_at      TIMESTAMPTZ     NOT NULL   DEFAULT now()
    deleted_at      TIMESTAMPTZ     NULL
  Indexes:
    idx_orders_customer_id (customer_id) WHERE deleted_at IS NULL
    idx_orders_status (status) WHERE deleted_at IS NULL
  RLS:
    POLICY orders_tenant_isolation USING (customer_id IN (SELECT id FROM customers WHERE tenant_id = current_setting('app.tenant_id')::uuid))
```

## Stage 3 — Stored Procedures and Business Logic

For each sproc, document body logic:

```
fn_calculate_order_total(order_id UUID) RETURNS BIGINT
  Source: V8__order_calculations.sql, modified V31
  Body logic:
    1. SUM(line_items.quantity * line_items.unit_price_cents) AS subtotal
    2. + COALESCE(SUM(taxes.amount_cents), 0)
    3. - COALESCE((SELECT amount_cents FROM discounts WHERE order_id = $1), 0)
    4. Returns subtotal + tax - discount
  Error handling: returns 0 if order has no line_items (verified)
  Transaction: read-only, no transaction boundary management
```

## Stage 4 — Cross-Cutting Concerns

- **Security:** RLS on tenant-scoped tables, encryption-at-rest (TDE), column-level encryption on `customers.tax_id`.
- **Performance:** partial indexes on soft-delete columns; `orders` partitioned by `created_at` quarterly.
- **Migration strategy:** Flyway forward-only; rollback via inverse migration files (`U<version>__*.sql`); locking strategy = advisory lock during migration.

## Stage 5 — Consumer Documentation and ERD

Generate ERD:

```mermaid
erDiagram
  customers ||--o{ orders : places
  orders ||--o{ line_items : contains
  products ||--o{ line_items : "appears in"
  orders ||--o| payments : "paid by"
  customers }o--|| tenants : "belongs to"
  ...
```

Consumer guide covers:
- Connection (host, port, credentials via env)
- Read patterns: `SELECT ... FROM vw_active_orders WHERE customer_id = $1` (uses idx_orders_customer_id)
- Write patterns: always set `app.tenant_id` GUC before INSERT/UPDATE
- Transactions: use READ COMMITTED for reads, REPEATABLE READ for multi-statement order updates
- Pagination: keyset `WHERE created_at < $cursor ORDER BY created_at DESC LIMIT 50`
- Anti-pattern: don't query `archive.*` from application code; use `sp_archive_old_orders` instead

## Stage 6 — Verification and Finalization

`steps/verify.md`:

- Completeness: 32/32 tables, 8/8 views, 12/12 sprocs, 6/6 triggers, 84/84 indexes. Pass.
- Accuracy: spot-checked 5 tables and 3 sprocs. 1 failure — `orders.total_cents` documented as `INTEGER`, but actual DDL shows `BIGINT`. Corrected.
- Consistency: no DBA-internal details (replication topology) leaked into Part B1/B2. Pass.
- Domain checks:
  - DDL parity: all corrections applied.
  - FK cascade explicit: 41/41 FKs document ON DELETE behavior. Pass.
  - ERD parity: 32/32 entities, 41/41 edges. Pass.
  - RLS / permissions: 9/9 tenant-scoped tables documented. Pass.

Verification report: 1 failure, 0 warnings. GO after correction.

## Outputs

```
~/code/orderhub-db/docs/database-internal/      ← Part A
  ├── 01-database-overview.md
  ├── 02-environment-and-configuration.md
  ├── 03-schema-overview-and-erd.md
  ├── 04-naming-conventions.md
  ├── ... (10 more)
  ├── extraction-status.md
  └── CHANGE-TRACKER.md

~/code/orderhub-knowledge-base/source-docs/orderhub-db/
  ├── data-dictionary.md            ← Part B1
  ├── erd.mmd                       ← Part B1
  └── database-consumer-guide.md    ← Part B2
```

## Hand-off

> "Reverse-engineering of orderhub-db is complete. Next, run `build-knowledge-base` to aggregate Part B1 + B2 into the central KB index."
