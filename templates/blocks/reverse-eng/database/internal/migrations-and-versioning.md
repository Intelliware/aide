---
slug: migrations-and-versioning
title: "Migrations and Versioning"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 250
---

## 15. Migrations and Versioning

### 15.1 Migration Strategy

Database schema changes are version-controlled using migrations. Every schema change has a corresponding migration file.

**Migration File Format:** `YYYY-MM-DD_HH-MM-SS_description.sql`

**Examples:**
- `2024-01-15_09-30-00_create_users_table.sql`
- `2024-02-20_14-15-00_add_users_deleted_at_column.sql`
- `2024-03-10_11-00-00_create_orders_audit_table.sql`

**Location:** `database/migrations/`

**Tool:** [Migration tool used, e.g., Flyway, Liquibase, Alembic, etc.]

### 15.2 Naming Conventions in Migrations

**Table Naming:**
- New tables: `CREATE TABLE [name] ...`
- Rename table: `ALTER TABLE [old_name] RENAME TO [new_name];`
- Drop table: `DROP TABLE [name];` (rarely used; prefer soft-delete)

**Column Naming:**
- Add column: `ALTER TABLE [table] ADD COLUMN [column] [type] DEFAULT ...;`
- Rename column: `ALTER TABLE [table] RENAME COLUMN [old] TO [new];`
- Drop column: `ALTER TABLE [table] DROP COLUMN [column];` (rarely used; may break queries)
- Change type: `ALTER TABLE [table] ALTER COLUMN [column] TYPE [new_type];`

**Index Naming:**
- Create index: `CREATE INDEX [index_name] ON [table] ([column]);`
- Drop index: `DROP INDEX [index_name];`

**Constraint Naming:**
- Add constraint: `ALTER TABLE [table] ADD CONSTRAINT [name] [definition];`
- Drop constraint: `ALTER TABLE [table] DROP CONSTRAINT [name];`

### 15.3 Example Migration

```sql
-- File: 2024-02-20_14-15-00_add_users_deleted_at_column.sql
-- Purpose: Add soft-delete column to users table
-- Author: Alice Developer
-- Date: 2024-02-20

BEGIN;

-- Add deleted_at column (soft delete)
ALTER TABLE users
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- Create index for fast filtering of active users
CREATE INDEX ix_users_deleted_at ON users(deleted_at);

-- Update existing queries to filter out deleted users
-- (This is documenting the change, not executing in migration)
-- Previous: SELECT * FROM users;
-- Updated: SELECT * FROM users WHERE deleted_at IS NULL;

-- Trigger to prevent hard deletes (soft delete enforcement)
CREATE TRIGGER tr_users_prevent_delete
BEFORE DELETE ON users
FOR EACH ROW
BEGIN
    RAISE EXCEPTION 'Hard deletes not allowed on users table. Use UPDATE deleted_at instead.';
END;

COMMIT;
```
