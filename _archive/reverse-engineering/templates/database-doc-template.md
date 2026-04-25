# [Database Name] — Documentation for AI-Assisted Development

> **Purpose of this document:** This documentation covers the internal architecture, schema design, data structures, and operational patterns of [Database Name]. It is designed to enable AI assistants to correctly implement new features, queries, and procedures within this database, and to enable application developers to consume the database correctly.
>
> **What this document is NOT:** This is not a SQL tutorial or a DBMS reference manual. It assumes readers understand relational databases, SQL, and the specific DBMS version in use (see below).
>
> **Documentation version:** [e.g., 1.0]
> **Database version:** [e.g., PostgreSQL 16.1]
> **DBMS:** [e.g., PostgreSQL, SQL Server 2022, Oracle 23c, MySQL 8.0]
> **Last updated:** [date]

---

## Table of Contents

### Part 1 — Foundation
1. [Database Overview](#1-database-overview)
2. [Environment and Configuration](#2-environment-and-configuration)
3. [Schema Overview and ERD](#3-schema-overview-and-erd)

### Part 2 — Data Structure
4. [Naming Conventions](#4-naming-conventions)
5. [Tables — Detailed Documentation](#5-tables--detailed-documentation)
6. [Constraints and Integrity](#6-constraints-and-integrity)
7. [Indexes and Performance](#7-indexes-and-performance)

### Part 3 — Views and Derived Data
8. [Views](#8-views)
9. [Materialization and Refresh Strategy](#9-materialization-and-refresh-strategy)

### Part 4 — Automation
10. [Stored Procedures and Functions](#10-stored-procedures-and-functions)
11. [Triggers](#11-triggers)

### Part 5 — Security and Access
12. [Security and Access Control](#12-security-and-access-control)
13. [Authentication and Connection](#13-authentication-and-connection)

### Part 6 — Data Management
14. [Reference and Seed Data](#14-reference-and-seed-data)
15. [Migrations and Versioning](#15-migrations-and-versioning)

### Part 7 — Operational
16. [Backup and Recovery](#16-backup-and-recovery)
17. [Data Retention and Archival](#17-data-retention-and-archival)
18. [Monitoring and Performance Baselines](#18-monitoring-and-performance-baselines)

### Part 8 — Consumer Guide
19. [How to Query This Database](#19-how-to-query-this-database)
20. [Common Query Patterns](#20-common-query-patterns)
21. [Working with Stored Procedures](#21-working-with-stored-procedures)
22. [Transactions and Concurrency](#22-transactions-and-concurrency)
23. [Error Handling and Recovery](#23-error-handling-and-recovery)
24. [Performance Guidelines for Developers](#24-performance-guidelines-for-developers)

### Part 9 — Reference
25. [Anti-Patterns and Pitfalls](#25-anti-patterns-and-pitfalls)
26. [New Table Checklist](#26-new-table-checklist)
27. [Glossary and Data Definitions](#27-glossary-and-data-definitions)
28. [Code Examples](#28-code-examples)
29. [FAQ and Troubleshooting](#29-faq-and-troubleshooting)

---

# Part 1 — Foundation

---

## 1. Database Overview

### 1.1 What This Database Is

- **Name:** [Database Name]
- **DBMS:** [e.g., PostgreSQL 16.1 / SQL Server 2022 / Oracle 23c / MySQL 8.0]
- **Purpose:** [One or two sentences — e.g., "Backend data store for the e-commerce platform. Stores customers, products, orders, and transactions for web and mobile applications."]
- **Environment:** [Production / Development / Staging — briefly describe environment scope]

### 1.2 Database Architecture

- **Architecture Style:** [Monolithic / Service-Oriented / Microservice-Adjacent, etc.]
- **Scaling Strategy:** [Read replicas / Sharding / Federated queries / Single instance, etc.]
- **Key Characteristics:** [List 3-4 defining characteristics — e.g., "Normalized OLTP schema. Uses soft deletes for audit trail. Temporal tables for order history. Materialized views for reporting."]

### 1.3 Design Philosophy

| Decision | Rationale |
|----------|-----------|
| [e.g., "Normalized 3NF with selective denormalization"] | [e.g., "Normalize for consistency; denormalize specific tables (Orders summary) for reporting performance"] |
| [e.g., "Soft deletes (logical deletion) instead of hard deletes"] | [e.g., "Preserve audit trail and historical data; prevent accidental data loss"] |
| [e.g., "UUID primary keys for federation and integration"] | [e.g., "Support multi-region deployments and API integration"] |
| [e.g., "All timestamps in UTC"] | [e.g., "Avoid timezone confusion; handle user timezone conversion in application layer"] |

### 1.4 Key Statistics

| Metric | Value | Notes |
|--------|-------|-------|
| **Database Size** | [e.g., 250 GB] | Approximate; includes backups |
| **Largest Tables** | [e.g., Events (500M rows), Logs (1B rows)] | Review growth rate quarterly |
| **Read Queries/sec** | [e.g., 5000-10000] | Peak load; varies by time of day |
| **Write Queries/sec** | [e.g., 500-1000] | Peak load; mostly batch inserts |
| **Backup Schedule** | [e.g., Full daily at 2 AM UTC, incremental hourly] | Recovery time objective (RTO): 4 hours |
| **Availability SLA** | [e.g., 99.9%] | Excludes scheduled maintenance windows |

---

## 2. Environment and Configuration

### 2.1 Prerequisites and Versions

| Dependency | Required Version | Notes |
|------------|------------------|-------|
| [Database] | [e.g., PostgreSQL 16.x] | [e.g., "LTS version; upgrading every 2 years"] |
| [Drive/Storage] | [e.g., SSD, 500 GB minimum] | [e.g., "Spinning disks not supported due to write throughput requirements"] |
| [RAM] | [e.g., 32 GB minimum] | [e.g., "64 GB recommended for buffer pool and queries"] |
| [Network] | [e.g., 10Mbps minimum] | [e.g., "1Gbps connection recommended for bulk operations"] |
| [Authentication] | [e.g., LDAP / Active Directory] | [e.g., "Service accounts use service principal names (SPNs)"] |

### 2.2 Connection Information

#### Development Environment

```
Host: [e.g., db-dev.internal.example.com]
Port: [e.g., 5432]
Database: [e.g., ecommerce_dev]
Username: [e.g., app_dev (ask for credentials in team chat)]
Connection String: [e.g., postgresql://user:pass@host:5432/dbname]
Tools: [e.g., pgAdmin 4, DBeaver Community]
```

#### Staging Environment

```
Host: [e.g., db-staging.internal.example.com]
Port: [e.g., 5432]
Database: [e.g., ecommerce_staging]
Username: [e.g., app_staging (ask for credentials in team chat)]
Connection String: [e.g., postgresql://user:pass@host:5432/dbname]
Tools: [e.g., pgAdmin 4, DBeaver Enterprise]
Notes: Read-only access for most users; ask for write access if needed
```

#### Production Environment

```
Host: [Primary: db-prod1.internal.example.com, Read-only replica: db-prod-ro.internal.example.com]
Port: [e.g., 5432]
Database: [e.g., ecommerce]
Username: [e.g., app_prod (service account; restricted permissions)]
Connection String: [e.g., postgresql://user:pass@host:5432/dbname]
Tools: [e.g., Command-line only; no GUI tools; run queries through application layer]
Notes: No direct write access; all changes go through application; queries must be pre-approved
```

### 2.3 Configuration and Parameters

The database uses the following key configuration:

```sql
-- PostgreSQL example (show actual GUC settings)
-- Show parameters: SELECT name, setting, unit FROM pg_settings;

shared_buffers = 16GB          -- Portion of RAM for page caching
effective_cache_size = 48GB    -- Total available RAM for planner
work_mem = 64MB                -- Memory per operation (sort, hash join)
maintenance_work_mem = 2GB     -- Memory for maintenance (vacuum, reindex)
max_connections = 200          -- Maximum concurrent connections
max_locks_per_transaction = 64 -- Locks per transaction (default; increase if needed)
log_min_duration_statement = 0 -- Log slow queries (0 = log all)
random_page_cost = 1.1         -- Assume SSD random I/O cost
```

<!-- DBMS-Specific: Adjust these for SQL Server (sp_configure), Oracle (init.ora), MySQL (my.cnf) -->

### 2.4 Environment-Specific Behaviors

| Behavior | Development | Staging | Production |
|----------|-------------|---------|-----------|
| **Slow Query Log** | All queries logged; duration threshold 100ms | Queries >500ms logged | Only queries >5000ms logged |
| **Backups** | None (use reset script to refresh) | Daily full + hourly incremental | Hourly incremental + daily full |
| **Read-Only Replica** | No | Yes (read-only) | Yes (read-only for reporting) |
| **Row-Level Security** | Disabled | Enabled | Enabled |
| **Query Execution Plans** | EXPLAIN shown in output; plan caching disabled | Plan caching enabled | Plan caching enabled |
| **Maintenance Windows** | None | Sundays 2-4 AM UTC | Sundays 3-5 AM UTC |

---

## 3. Schema Overview and ERD

### 3.1 High-Level Schema Organization

The database is organized around the following core domains:

**Core Domains:**
- **Users Domain:** Users, authentication, roles, permissions
- **Products Domain:** Products, categories, pricing, inventory
- **Orders Domain:** Orders, order items, fulfillment status
- **Transactions Domain:** Payments, refunds, transaction history
- **Analytics Domain:** Materialized views for reporting, denormalized summary tables

**Inter-Domain Relationships:**
- Orders references Users (customer) and Products (ordered items)
- Transactions references Orders
- Analytics tables are refreshed nightly from transactional tables

### 3.2 Entity-Relationship Diagram

```
[DIAGRAM: Show visual ERD here — PNG, SVG, or link to tool like Lucidchart/dbdiagram.io]

Example textual representation:

Users (1) ──→ (M) Orders: One user can have many orders
Orders (1) ──→ (M) OrderItems: One order contains many items
Products (1) ←── (M) OrderItems: One product appears in many orders
Orders (1) ──→ (M) Transactions: One order can have multiple transactions (payments, refunds)
Users (1) ──→ (M) Addresses: One user has multiple addresses
```

**Cardinality Notation:**
- (1) ──→ (M): One-to-Many (PK on left, FK on right)
- (1) ──→ (1): One-to-One
- (M) ──→ (M): Many-to-Many (junction table)

### 3.3 Schema Statistics

| Entity Type | Count | Notes |
|-------------|-------|-------|
| **Tables** | [e.g., 47] | Includes system tables but not temporary tables |
| **Views** | [e.g., 12] | Real-time views; see section 8 for materialized views |
| **Stored Procedures** | [e.g., 23] | See section 10 for complete list |
| **Functions** | [e.g., 5] | Mostly for data transformation |
| **Triggers** | [e.g., 8] | See section 11 for details |
| **Indexes** | [e.g., 156] | Distributed across tables; see section 7 |

---

# Part 2 — Data Structure

---

## 4. Naming Conventions

### 4.1 Table Naming

**Convention:** [e.g., `snake_case`, lowercase, plural noun]

**Examples:**
```
users          -- Correct
user           -- Avoid (singular)
Users          -- Avoid (mixed case)
tbl_users      -- Avoid (unnecessary prefix)
users_list     -- Avoid (redundant suffix)
```

**Special Patterns:**
- **Junction Tables (Many-to-Many):** `[table1]_[table2]` (e.g., `users_roles`)
- **Audit Tables:** `[table_name]_audit` (e.g., `orders_audit`)
- **Reference Tables:** `[reference_type]_ref` (e.g., `order_status_ref`)
- **Summary/Aggregates:** `[entity]_summary` or `[entity]_[metric]` (e.g., `orders_daily_summary`)

### 4.2 Column Naming

**Convention:** [e.g., `snake_case`, lowercase, descriptive, avoid abbreviations]

**Examples:**
```
user_id        -- Correct (use _id suffix for IDs)
user           -- Avoid (ambiguous; is it the ID or the name?)
userId         -- Avoid (camelCase not used)
usr_id         -- Avoid (abbreviation)
```

**Special Patterns:**
- **Primary Keys:** `[table_singular]_id` (e.g., `user_id` in users table)
- **Foreign Keys:** `[referenced_table_singular]_id` (e.g., `user_id` in orders table references users)
- **Boolean Columns:** `is_[adjective]` or `has_[noun]` (e.g., `is_active`, `has_account`)
- **Status Columns:** `[entity]_status` (e.g., `order_status`)
- **Timestamps:** `[verb]ed_at` (e.g., `created_at`, `updated_at`, `deleted_at`)
- **Amounts/Currencies:** `[noun]_[currency]` or `[noun]_cents` (e.g., `price_usd`, `amount_cents`)

### 4.3 Constraint Naming

| Constraint Type | Naming Convention | Example |
|-----------------|-------------------|---------|
| **Primary Key** | `pk_[table_name]` | `pk_users` |
| **Foreign Key** | `fk_[table1]_[table2]` | `fk_orders_users` |
| **Unique Constraint** | `uk_[table]_[column1]_[column2]` | `uk_users_email` |
| **Check Constraint** | `ck_[table]_[constraint_type]` | `ck_orders_amount_positive` |
| **Default Constraint** | `df_[table]_[column]` | `df_users_created_at` |

---

## 5. Tables — Detailed Documentation

### [Table Name] (Example: `users`)

#### 5.1.1 Entity Overview

- **Formal Name:** Users
- **Alias:** None
- **Description:** Registered users of the platform who can create orders, manage account settings, and receive communications
- **Approximate Row Count:** [e.g., 2.5M]
- **Row Size:** [e.g., ~500 bytes average]
- **Growth Rate:** [e.g., ~10K new users/day]
- **Update Frequency:** Real-time (created, updated as users interact with platform)
- **Volatility:** Low (records rarely deleted; mostly updates to settings)
- **Archival Strategy:** Users 5+ years inactive are moved to `users_archive` table

#### 5.1.2 Column Definitions

| Column | Type | Nullable | Constraint | Default | Business Definition | Example | Notes |
|--------|------|----------|-----------|---------|-------------------|---------|-------|
| `user_id` | UUID | NO | PK | `gen_random_uuid()` | Unique identifier for user. Immutable. | `550e8400-e29b-41d4-a716-446655440000` | Generated at insert |
| `email` | VARCHAR(255) | NO | UQ, CK | — | Primary email address for user. Lowercased and trimmed. Used for login. | `alice@example.com` | Applied constraint: `email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z\|a-z]{2,}$'` |
| `password_hash` | VARCHAR(255) | NO | — | — | Bcrypt hash of password. Never store plaintext. | `$2b$12$R9h7cIPz0gi...` | Update only through change password endpoint |
| `first_name` | VARCHAR(100) | NO | — | — | User's given name. | `Alice` | May contain accented characters; use Unicode normalization |
| `last_name` | VARCHAR(100) | NO | — | — | User's family name. | `Smith` | May contain accented characters; use Unicode normalization |
| `phone` | VARCHAR(20) | YES | — | NULL | Phone number in E.164 format. Nullable (not all users provide). | `+14155552671` | Normalized to E.164 format; validation at application layer |
| `is_active` | BOOLEAN | NO | — | `true` | Whether account is active. Inactive users cannot login. | `true` | Updated by change-password and deactivation workflows |
| `created_at` | TIMESTAMP | NO | — | `CURRENT_TIMESTAMP` | Timestamp when user account was created. UTC timezone. | `2024-01-15 10:23:45 UTC` | Set at insert; never updated |
| `updated_at` | TIMESTAMP | NO | — | `CURRENT_TIMESTAMP` | Timestamp when user record was last updated. UTC timezone. | `2024-02-20 14:50:12 UTC` | Updated by trigger `tr_users_updated_at` |
| `deleted_at` | TIMESTAMP | YES | — | NULL | Timestamp when user was deleted (soft delete). NULL if not deleted. | `2024-03-10 09:15:00 UTC` | Soft delete flag; records never hard-deleted |

#### 5.1.3 Constraints

**Primary Key:**
```sql
CONSTRAINT pk_users PRIMARY KEY (user_id)
```
- **Purpose:** Uniquely identify each user
- **Type:** UUID, auto-generated
- **Implications:** Every user must have a unique ID; never reuse IDs even after deletion

**Unique Constraint (Email):**
```sql
CONSTRAINT uk_users_email UNIQUE (email)
```
- **Purpose:** Prevent duplicate email registrations
- **Enforcement:** Database level ensures uniqueness
- **Violation Error:** "Duplicate key value violates unique constraint 'uk_users_email'"
- **Application Handling:** Catch error at application layer; offer "Email already exists, try login" message
- **Note:** Emails are lowercased before insertion to handle case-insensitivity

**Check Constraint (Email Format):**
```sql
CONSTRAINT ck_users_email_format CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
)
```
- **Purpose:** Ensure email looks valid (basic validation)
- **Business Rule:** Only valid email formats are stored
- **Violation Error:** "New row for relation 'users' violates check constraint 'ck_users_email_format'"
- **Application Handling:** Validate before sending to database; use RFC 5322 or send verification email

#### 5.1.4 Indexes

| Index Name | Columns | Type | Strategy | Size | Purpose | Query Examples |
|------------|---------|------|----------|------|---------|-----------------|
| `pk_users` | `user_id` | B-Tree (PK) | — | ~100 MB | Primary key index; used for lookups by ID | `SELECT * FROM users WHERE user_id = '550e8400-...'` |
| `uk_users_email` | `email` | B-Tree (UNIQUE) | — | ~80 MB | Unique constraint index; used for login by email | `SELECT * FROM users WHERE email = 'alice@example.com'` |
| `ix_users_created_at` | `created_at` | B-Tree | — | ~60 MB | Sort and filter by creation date | `SELECT * FROM users WHERE created_at > NOW() - INTERVAL '30 days' ORDER BY created_at DESC` |
| `ix_users_is_active` | `is_active` | B-Tree | — | ~40 MB | Filter active users; combined with other predicates | `SELECT COUNT(*) FROM users WHERE is_active = true` |
| `ix_users_updated_at` | `updated_at` | B-Tree | — | ~60 MB | Sort and filter by update time; used for sync/replication | `SELECT * FROM users WHERE updated_at > ? ORDER BY updated_at` |

#### 5.1.5 Triggers

| Trigger Name | Event | Purpose | Side Effects |
|--------------|-------|---------|--------------|
| `tr_users_updated_at` | BEFORE UPDATE | Automatically update `updated_at` to current timestamp | Sets `updated_at = CURRENT_TIMESTAMP` |
| `tr_users_audit_log` | AFTER INSERT/UPDATE/DELETE | Log all user changes to audit table | Inserts row into `users_audit` with action, timestamp, user ID |
| `tr_users_cache_invalidate` | AFTER UPDATE | Invalidate cache entries for modified user | Publishes message to cache invalidation queue |

**Trigger Details:**

```sql
-- tr_users_updated_at: Always set updated_at to now
CREATE TRIGGER tr_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END;
```

#### 5.1.6 Soft Delete Behavior

Users are never hard-deleted from this table. Instead, `deleted_at` is set to the deletion timestamp.

**Query Impact:**
```sql
-- Standard query (excludes deleted)
SELECT * FROM users WHERE deleted_at IS NULL;

-- Include deleted records
SELECT * FROM users;  -- No WHERE clause

-- Recently deleted (recovery window)
SELECT * FROM users WHERE deleted_at BETWEEN NOW() - INTERVAL '30 days' AND NOW();
```

**Restore Behavior:**
```sql
-- To restore a deleted user
UPDATE users SET deleted_at = NULL WHERE user_id = '550e8400-...';
```

#### 5.1.7 Relationships

**Outgoing Foreign Keys:** None from this table.

**Incoming Foreign Keys:**

| Source Table | FK Constraint | Cardinality | Cascade Rule | Implications |
|--------------|---------------|-------------|--------------|--------------|
| `orders` | `fk_orders_user_id → users.user_id` | 1:M (one user has many orders) | ON DELETE RESTRICT | Cannot delete user if they have orders. Delete orders first. |
| `addresses` | `fk_addresses_user_id → users.user_id` | 1:M (one user has many addresses) | ON DELETE CASCADE | Deleting user cascades to addresses (hard-deleted). |
| `user_settings` | `fk_user_settings_user_id → users.user_id` | 1:1 (one user has one settings record) | ON DELETE CASCADE | Deleting user cascades to settings. |

**Dependency Analysis:**
```
To delete a user:
1. Soft-delete is preferred: SET deleted_at = NOW()
2. If hard-delete required: DELETE all addresses first, then user settings, then user
   (or rely on CASCADE for addresses and settings)
3. Cannot delete if user has orders (FK ON DELETE RESTRICT)
   → Option: DELETE orders first OR move to archive table
```

#### 5.1.8 Special Behaviors

**Email Case-Insensitivity:**
```sql
-- Emails are stored lowercase
INSERT INTO users (email, ...) VALUES (LOWER('Alice@Example.COM'), ...);

-- Query for email (case-insensitive)
SELECT * FROM users WHERE LOWER(email) = LOWER('alice@example.com');
-- OR use case-insensitive collation
SELECT * FROM users WHERE email ILIKE 'alice@example.com';
```

**Timestamp Handling:**
```
All timestamps are in UTC timezone.
- Application layer converts user local time → UTC before storing
- Application layer converts UTC → user local time when displaying
Never store timestamps with timezone info to a TIMESTAMP column (store to TIMESTAMPTZ)
```

**Password Hash Security:**
```
- Password hashes use Bcrypt (cost factor 12)
- Never log, export, or compare passwords
- Hash changes require verification (old password or email verification)
- Never allow plaintext password in logs or error messages
```

---

### [Additional Tables Follow Same Pattern]

<!-- Repeat section 5.1 for each table: orders, products, order_items, etc. -->

---

## 6. Constraints and Integrity

### 6.1 Constraint Strategy

This database enforces data integrity at the database level (using constraints) rather than relying solely on application validation. This approach:
- Prevents invalid data even from direct SQL inserts
- Ensures consistency across all code paths
- Makes constraints visible and documentable

### 6.2 Primary Key Strategy

**Strategy:** UUID (universally unique identifiers)

**Rationale:**
- Support multi-region deployment
- Prevent ID collision across databases
- Enable client-side ID generation (reduce chattiness)
- No auto-increment dependencies

**Generation:**
```sql
-- PostgreSQL
user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

-- SQL Server
user_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

-- MySQL
user_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
```

### 6.3 Foreign Key Constraints

**Strategy:** Referential integrity enforced at database level. Cascade rules are intentional and documented.

**Cascade Rules Used:**

| Rule | When Used | Example | Implication |
|------|-----------|---------|-------------|
| **RESTRICT** | Parent record should not be deletable | User has orders → FK orders.user_id RESTRICT | Delete parent? Error; delete children first |
| **CASCADE** | Child records should be deleted with parent | User deleted → delete user settings automatically | Parent deleted → children auto-deleted |
| **SET NULL** | Child should orphan gracefully | Order item deleted → delete from inventory reserved if needed; set order.item_id = NULL | Parent deleted → child's FK becomes NULL |
| **SET DEFAULT** | Child should revert to default parent | Order assigned to user; if user deleted, revert to default/admin user | Parent deleted → child's FK becomes default |

**Examples in This Database:**

```sql
-- ON DELETE RESTRICT: Cannot delete users with orders
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id)
ON DELETE RESTRICT;

-- ON DELETE CASCADE: Deleting user also deletes their settings
ALTER TABLE user_settings
ADD CONSTRAINT fk_user_settings_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id)
ON DELETE CASCADE;

-- ON DELETE SET NULL: Deleting order item nulls out order reference
ALTER TABLE order_item_logs
ADD CONSTRAINT fk_order_item_logs_item_id
FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id)
ON DELETE SET NULL;
```

### 6.4 Unique Constraints

| Table | Constraint | Rationale | Enforcement |
|-------|-----------|-----------|-------------|
| `users` | email | No duplicate email registrations | Lowercased before comparison |
| `products` | sku | No duplicate product SKUs | Code must validate before insert |
| `order_items` | (order_id, product_id) | No duplicate line items in order | Composite unique; prevents adding same product twice |

### 6.5 Check Constraints

| Constraint | Rule | Violation Behavior |
|-----------|------|-------------------|
| `ck_users_email_format` | Email matches RFC pattern | Violates: "New row violates check constraint 'ck_users_email_format'" |
| `ck_orders_amount_positive` | order amount > 0 | Violates: "New row violates check constraint 'ck_orders_amount_positive'" |
| `ck_order_items_quantity_positive` | quantity > 0 | Violates: "New row violates check constraint 'ck_order_items_quantity_positive'" |

### 6.6 Handling Constraint Violations

**Pattern:** Database rejects invalid data; application must handle errors.

```sql
-- Example: Attempt to insert duplicate email
INSERT INTO users (email, first_name, last_name)
VALUES ('alice@example.com', 'Alice', 'Smith');
-- Error: duplicate key value violates unique constraint "uk_users_email"

-- Application handling (Python with psycopg2 example):
try:
    cursor.execute(
        "INSERT INTO users (email, first_name, last_name) VALUES (%s, %s, %s)",
        ('alice@example.com', 'Alice', 'Smith')
    )
except psycopg2.IntegrityError as e:
    if 'uk_users_email' in str(e):
        return {"error": "Email already exists"}
    raise
```

---

## 7. Indexes and Performance

### 7.1 Indexing Strategy

**Philosophy:** Create indexes for actual query patterns, not theoretical ones. Remove indexes that aren't used.

**Index Types Used:**
- **B-Tree (default):** Most common; supports equality and range queries
- **Hash:** Only equality; used in specific scenarios (large text fields with =)
- **Partial Indexes:** Index subset of rows matching a condition (e.g., `WHERE is_active = true`)
- **Composite Indexes:** Multiple columns for multi-key filtering

### 7.2 Index Maintenance

**Index Fragmentation Monitoring:**
```sql
-- PostgreSQL
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check fragmentation:
-- < 10% fragmented: leave alone
-- 10-30% fragmented: REINDEX during maintenance window
-- > 30% fragmented: REINDEX immediately
```

**Reindex Schedule:**
- Automatic during nightly maintenance (2-4 AM UTC)
- Manual reindex if fragmentation > 30%
- After bulk DELETE operations (rows > 10% of table)

### 7.3 Query Performance Guidelines

**For Application Developers:**

1. **Always use indexes:** Check EXPLAIN PLAN before deploying queries
2. **Avoid SELECT \*:** Name specific columns needed
3. **Use filtering early:** WHERE clause reduces rows before joins
4. **Join on indexed columns:** Foreign keys have indexes
5. **Batch large operations:** 1000-5000 rows per batch; don't do all at once
6. **Monitor slow queries:** Queries > 5 seconds logged automatically

**EXPLAIN Examples:**

```sql
-- PostgreSQL
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE user_id = 'abc-123' AND created_at > NOW() - INTERVAL '30 days';

-- Expected: Seq Scan if few rows, Index Scan if > 10% of table
-- If slower than expected: check index exists, update statistics (ANALYZE orders)
```

---

# Part 3 — Views and Derived Data

---

## 8. Views

### 8.1 [View Name Example: `vw_user_orders`]

**Type:** Real-Time View (materialized after every order change)

**Purpose:** Denormalized user order summary for dashboard queries. Joins users, orders, and order items to provide quick access to order details without re-joining at query time.

**Source Tables:** users, orders, order_items, products

**Definition:**
```sql
CREATE VIEW vw_user_orders AS
SELECT
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    o.order_id,
    o.order_date,
    o.status as order_status,
    COUNT(oi.order_item_id) as item_count,
    SUM(oi.quantity) as total_quantity,
    SUM(oi.unit_price * oi.quantity) as order_total
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id AND o.deleted_at IS NULL
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE u.deleted_at IS NULL
GROUP BY u.user_id, o.order_id
ORDER BY o.order_date DESC;
```

**Columns:**
- `user_id`: Foreign key to users table
- `email`: User's email
- `first_name`, `last_name`: User's name
- `order_id`: Foreign key to orders table
- `order_date`: When order was placed
- `order_status`: Current status (PENDING, CONFIRMED, SHIPPED, DELIVERED)
- `item_count`: Number of distinct items in order
- `total_quantity`: Total units ordered
- `order_total`: Sum of all items in order

**Usage Examples:**
```sql
-- Get all orders for a user
SELECT * FROM vw_user_orders WHERE user_id = 'abc-123';

-- Get summary of user's spending
SELECT user_id, COUNT(*) as order_count, SUM(order_total) as lifetime_value
FROM vw_user_orders
GROUP BY user_id;

-- Find orders over $1000
SELECT * FROM vw_user_orders WHERE order_total > 1000;
```

**Materialization:** Real-time; refreshes after every order/item change via trigger

---

## 9. Materialization and Refresh Strategy

### 9.1 Materialized Views

Some views are pre-computed and stored as physical tables to improve query performance.

| View Name | Type | Refresh Schedule | Size | Purpose |
|-----------|------|------------------|------|---------|
| `vw_daily_sales_summary` | Materialized | Nightly 3 AM UTC | 500 MB | Daily sales aggregates for dashboards |
| `vw_product_popularity` | Materialized | Nightly 3 AM UTC | 50 MB | Product ranking by sales volume |
| `vw_user_lifetime_value` | Materialized | Nightly 3 AM UTC | 200 MB | User spending totals |

**Refresh Job:**
```sql
-- Refresh all materialized views
-- Run daily at 3 AM UTC (off-peak)
-- Duration: ~15 minutes
-- Lock: Locks tables during refresh; transactions must wait
REFRESH MATERIALIZED VIEW CONCURRENTLY vw_daily_sales_summary;
REFRESH MATERIALIZED VIEW CONCURRENTLY vw_product_popularity;
REFRESH MATERIALIZED VIEW CONCURRENTLY vw_user_lifetime_value;
```

**Important for Developers:**
- Materialized views are snapshots; not real-time
- Data is up to 24 hours old
- Do NOT rely on materialized views for transactional consistency
- For real-time data, query base tables directly

---

# Part 4 — Automation

---

## 10. Stored Procedures and Functions

### 10.1 [Stored Procedure Example: `sp_create_order`]

**Purpose:** Create a new order with items, validate inventory, and process payment.

**Signature:**
```sql
CREATE PROCEDURE sp_create_order (
    IN p_user_id UUID,
    IN p_order_items JSON,  -- Array of {product_id, quantity}
    IN p_delivery_address_id UUID,
    OUT p_order_id UUID,
    OUT p_total_amount DECIMAL(12,2),
    OUT p_error_code INT,
    OUT p_error_message VARCHAR(500)
)
LANGUAGE plpgsql
AS $$
```

**Parameters:**

| Parameter | Direction | Type | Required | Description | Example |
|-----------|-----------|------|----------|-------------|---------|
| `p_user_id` | IN | UUID | Yes | ID of user creating order | `'550e8400-...'` |
| `p_order_items` | IN | JSON | Yes | Array of items to order; each item has product_id and quantity | `'[{"product_id": "abc", "quantity": 2}]'` |
| `p_delivery_address_id` | IN | UUID | Yes | Delivery address for order | `'xyz-789'` |
| `p_order_id` | OUT | UUID | — | Generated order ID; populated if successful | `'order-2024-001'` |
| `p_total_amount` | OUT | DECIMAL(12,2) | — | Total order amount in USD cents | `9999.99` |
| `p_error_code` | OUT | INT | — | Error code if operation failed (see table below) | `0` (success) or error code |
| `p_error_message` | OUT | VARCHAR(500) | — | Error message if operation failed | `'Insufficient inventory for product ABC'` |

**Error Codes:**

| Code | Meaning | Recovery |
|------|---------|----------|
| `0` | Success; order created | Use p_order_id for next steps |
| `1001` | User not found | Verify user_id exists |
| `1002` | User account inactive | Activate user account |
| `1003` | Address not found | Verify delivery address belongs to user |
| `1004` | Product not found | Check product_id exists |
| `2001` | Insufficient inventory | Wait for restock or choose different product |
| `2002` | Invalid quantity | Order quantity must be > 0 |
| `3001` | Payment failed | Retry with different payment method |
| `3002` | Transaction already exists | Order already created; check existing orders |
| `9999` | Unknown error | Check logs; contact support |

**Business Logic:**

1. **Validate User:** Check user exists and is active; fail if not (error 1001, 1002)
2. **Validate Address:** Check address exists and belongs to user; fail if not (error 1003)
3. **Validate Items:** Check each product exists; fail if not (error 1004)
4. **Check Inventory:** For each item, verify sufficient quantity available; fail if not (error 2001)
5. **Reserve Inventory:** Decrement inventory for each item
6. **Create Order:** Insert order header with status = 'PENDING'
7. **Create Line Items:** Insert order items with unit prices
8. **Calculate Total:** Sum order items with tax/shipping
9. **Debit Payment:** Call payment processor (external service); fail if payment fails (error 3001)
10. **Commit:** If all steps succeed, commit transaction; order is confirmed
11. **Return:** Return order_id and total_amount; error_code = 0

**Transactionality:**
- **Atomic:** All-or-nothing; if any step fails, all changes rollback
- **Isolation:** Uses SERIALIZABLE isolation level to prevent concurrent order conflicts
- **Lock Duration:** ~500ms average; longer if payment processor is slow

**Example Usage:**

**SQL:**
```sql
CALL sp_create_order(
    p_user_id := '550e8400-e29b-41d4-a716-446655440000',
    p_order_items := '[
        {"product_id": "prod-001", "quantity": 2},
        {"product_id": "prod-002", "quantity": 1}
    ]',
    p_delivery_address_id := 'addr-12345',
    p_order_id := @order_id,
    p_total_amount := @total,
    p_error_code := @error_code,
    p_error_message := @error_msg
);

-- Check result
SELECT @order_id, @total, @error_code, @error_msg;
```

**Python (with psycopg2):**
```python
def create_order(user_id, items, address_id):
    """
    Create order and return (order_id, total, error_code, error_message)

    Args:
        user_id: UUID of user
        items: List of {"product_id": str, "quantity": int}
        address_id: UUID of delivery address

    Returns:
        (order_id, total, error_code, error_message)
    """
    with connection.cursor() as cur:
        try:
            cur.callproc('sp_create_order', [
                user_id,
                json.dumps(items),
                address_id,
            ])
            return cur.fetchone()  # Returns (order_id, total, error_code, error_msg)
        except psycopg2.IntegrityError as e:
            # Handle constraint violations
            return (None, None, 9999, f"Database error: {str(e)}")
        except Exception as e:
            return (None, None, 9999, f"Unexpected error: {str(e)}")

# Example call
order_id, total, code, msg = create_order(
    '550e8400-...',
    [{"product_id": "abc", "quantity": 2}],
    'addr-xyz'
)

if code == 0:
    print(f"Order created: {order_id}, Total: ${total}")
else:
    print(f"Order failed: {msg}")
```

**Transactions and Locks:**
```
Duration of sp_create_order:
- Lock on users table: 50ms (validate user exists)
- Lock on inventory table: 100ms (reserve inventory)
- Lock on orders table: 100ms (insert order)
- Network call to payment processor: 200-500ms (payment)
- Commit: 50ms

Total: 500-700ms

Concurrency:
- While sp_create_order runs, concurrent orders for same user are blocked (row-level lock)
- Same product can be ordered by multiple users (row lock on inventory row, not table)
- Deadlock possible if payment processor is slow AND multiple users order same product
```

**Side Effects:**
- **Triggers Fired:**
  - `tr_orders_created` → sends order confirmation email
  - `tr_inventory_updated` → logs inventory change to audit table
  - `tr_audit_log` → logs procedure call to system audit log
- **External Services Called:**
  - Payment processor (Stripe/PayPal) for payment
  - Email service for confirmation
- **Cache Invalidated:**
  - User's order list cache cleared
  - Product inventory cache cleared

### 10.2 [Additional Procedures Follow Same Pattern]

---

## 11. Triggers

### 11.1 Trigger Overview

Triggers automatically execute logic when data changes. They enforce business rules that can't be captured by constraints alone.

| Trigger Name | Table | Event | Purpose | Timing |
|--------------|-------|-------|---------|--------|
| `tr_users_updated_at` | users | BEFORE UPDATE | Auto-update `updated_at` timestamp | ~1ms |
| `tr_orders_created` | orders | AFTER INSERT | Send order confirmation email | ~50ms (queues email) |
| `tr_order_status_changed` | orders | AFTER UPDATE | Send status notification to user | ~100ms (calls email service) |
| `tr_inventory_decrement` | order_items | AFTER INSERT | Decrement product inventory | ~10ms |
| `tr_audit_log` | [multiple] | AFTER INSERT/UPDATE/DELETE | Log all changes to audit table | ~5ms |

### 11.2 [Trigger Name Example: `tr_orders_created`]

**Trigger Definition:**
```sql
CREATE TRIGGER tr_orders_created
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    -- Queue email notification
    INSERT INTO email_queue (recipient_email, template, data, created_at)
    SELECT u.email, 'order_confirmation',
           json_object('order_id', NEW.order_id, 'order_total', NEW.total_amount),
           NOW()
    FROM users u
    WHERE u.user_id = NEW.user_id;

    -- Update materialized view cache
    DELETE FROM cache_user_orders WHERE user_id = NEW.user_id;
END;
```

**When It Fires:** Immediately after INSERT into orders table

**What It Does:**
1. Inserts email task into email queue (async; sent later)
2. Invalidates user's cached order list

**Performance Impact:**
- Adds ~50ms to INSERT (mostly I/O to email queue)
- Does NOT block order creation (email happens async)

**Exceptions/Errors:**
- If email queue is full: INSERT fails; order transaction rolls back
- If cache DELETE fails: Order still created; cache inconsistency (non-fatal; fixed on next refresh)

**Developer Implications:**
- Expecting email immediately after order? No; check email_queue table (email sent asynchronously, typically within 5 minutes)
- Order INSERT takes ~50ms longer due to trigger
- Don't bypass trigger (don't directly INSERT with skipTriggers)

---

# Part 5 — Security and Access

---

## 12. Security and Access Control

### 12.1 Role-Based Access Control (RBAC)

Database access is controlled by roles with specific permissions.

| Role | Purpose | Users | Permissions |
|------|---------|-------|-----------|
| `db_admin` | Database administration | DBA team | All permissions on all objects |
| `app_user` | Application service account | Production app (read/write) | INSERT/UPDATE/DELETE on transactional tables; SELECT on all tables |
| `app_readonly` | Reporting/analytics (read-only) | Reporting service, BI tools | SELECT only; no INSERT/UPDATE/DELETE |
| `analyst` | Data analyst (ad-hoc queries) | Analytics team | SELECT on all tables; no INSERT/UPDATE/DELETE |
| `support` | Customer support (limited write) | Support team | SELECT all; UPDATE on limited tables (user_settings); no DELETE |

**Permission Matrix:**

| Role | users | orders | products | audit_logs |
|------|-------|--------|----------|-----------|
| **db_admin** | ALL | ALL | ALL | ALL |
| **app_user** | SELECT,INSERT,UPDATE | SELECT,INSERT,UPDATE | SELECT | SELECT |
| **app_readonly** | SELECT | SELECT | SELECT | SELECT |
| **analyst** | SELECT | SELECT | SELECT | SELECT |
| **support** | SELECT | SELECT | SELECT | SELECT |

### 12.2 Row-Level Security (RLS)

Some tables have RLS policies that restrict data visibility based on the current user.

**Example: Support Team Can Only See Their Assigned Users**

```sql
-- Policy: support_team can only see users assigned to them
CREATE POLICY rls_support_user_visibility ON users
FOR SELECT
USING (
    -- If you're db_admin, see all
    current_user_id() IN (SELECT user_id FROM db_admins)
    OR
    -- If you're support, see only assigned users
    user_id IN (
        SELECT user_id FROM support_assignments
        WHERE support_user_id = current_user_id()
    )
);
```

**Application Developer Impact:**
- Queries automatically filtered by RLS
- Example: Support user queries `SELECT * FROM users` → only sees their assigned users
- No special code needed; filtering happens at database layer

---

## 13. Authentication and Connection

### 13.1 Connection Strings

#### Development
```
Type: PostgreSQL (or [DBMS])
Host: db-dev.internal.example.com:5432
Database: ecommerce_dev
Username: app_dev
Password: [ask in team Slack #database-access]
Connection pooling: Disabled (useful for development)

Connection string:
postgresql://app_dev:PASSWORD@db-dev.internal.example.com:5432/ecommerce_dev
```

#### Staging
```
Type: PostgreSQL
Host: db-staging.internal.example.com:5432
Database: ecommerce_staging
Username: app_staging
Password: [stored in secrets manager; contact DevOps]
Connection pooling: pgBouncer (pool size 10)

Connection string (use environment variable):
postgresql://app_staging:${DB_PASSWORD}@db-staging.internal.example.com:5432/ecommerce_staging
```

#### Production
```
Type: PostgreSQL
Primary write: db-prod-primary.internal.example.com:5432
Read-only replica: db-prod-ro.internal.example.com:5432
Database: ecommerce
Username: app_prod (service account)
Password: [stored in secrets manager; rotated every 90 days]
Connection pooling: pgBouncer with failover (pool size 50)

Connection string (use environment variable; handles failover):
postgresql://app_prod:${DB_PASSWORD}@db-prod-primary.internal.example.com:5432/ecommerce?
  application_name=ecommerce_api&
  fallback_application_name=ecommerce_api&
  target_session_attrs=read-write
```

### 13.2 Credential Management

**Never:**
- Hardcode passwords in code
- Commit credentials to Git
- Share passwords via email or chat
- Use personal credentials in production

**Always:**
- Use environment variables for development
- Use secrets manager (HashiCorp Vault, AWS Secrets Manager) for staging/production
- Rotate credentials every 90 days
- Use service accounts (not personal accounts) for applications
- Audit credential usage and access

**Development Setup:**
```bash
# Create .env file (in .gitignore)
export DB_HOST=db-dev.internal.example.com
export DB_PORT=5432
export DB_NAME=ecommerce_dev
export DB_USER=app_dev
export DB_PASSWORD=your_password_here

# Load in shell
source .env

# Connect
psql postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
```

---

# Part 6 — Data Management

---

## 14. Reference and Seed Data

### 14.1 Reference Tables (Lookup Tables)

Reference tables contain static or slowly-changing lists of values.

| Table | Purpose | Rows | Update Frequency | Example Values |
|-------|---------|------|------------------|-----------------|
| `order_status_ref` | Valid order statuses | 5 | Rarely (new status = code deploy) | PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED |
| `payment_method_ref` | Valid payment methods | 4 | Rarely | CREDIT_CARD, DEBIT_CARD, PAYPAL, BANK_TRANSFER |
| `country_ref` | Country codes and names | 195 | Rarely (new country?) | US, CA, GB, ... |
| `currency_ref` | ISO currency codes | 180 | Rarely | USD, EUR, GBP, ... |

**Querying Reference Data:**
```sql
-- Get all valid order statuses
SELECT * FROM order_status_ref;
-- Result: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

-- Validate order status before insert
SELECT COUNT(*) FROM order_status_ref
WHERE status_code = 'PENDING';  -- Returns 1 if valid, 0 if invalid
```

**Application Pattern:**
```python
# Cache reference data in application (doesn't change)
ORDER_STATUSES = {
    'PENDING': 'Order received, awaiting confirmation',
    'CONFIRMED': 'Order confirmed, preparing to ship',
    'SHIPPED': 'Order shipped',
    'DELIVERED': 'Order delivered',
    'CANCELLED': 'Order cancelled'
}

# Validate before querying database
if status not in ORDER_STATUSES:
    raise ValueError(f"Invalid status: {status}")
```

### 14.2 Seed Data

Seed data populates reference tables and basic data needed for the application to function.

**Location:** `database/seed-data/`

**Files:**
- `seed-01-order-statuses.sql` — Insert order statuses
- `seed-02-payment-methods.sql` — Insert payment methods
- `seed-03-countries.sql` — Insert countries
- `seed-04-dev-users.sql` — Dev-only users for testing

**Running Seed Data:**
```bash
# Reset and reseed (development only!)
psql postgresql://... < database/seed-data/00-reset-all.sql
psql postgresql://... < database/seed-data/seed-01-order-statuses.sql
psql postgresql://... < database/seed-data/seed-02-payment-methods.sql
# ... run all seed files in order

# Check result
psql postgresql://... -c "SELECT * FROM order_status_ref;"
```

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

---

## 16. Backup and Recovery

### 16.1 Backup Strategy

| Environment | Frequency | Type | Retention | RTO | RPO |
|-------------|-----------|------|-----------|-----|-----|
| **Development** | Manual only (use reset script) | N/A | N/A | N/A | N/A |
| **Staging** | Daily 2 AM UTC | Full backup | 7 days | 1 hour | 1 hour |
| **Production** | Hourly incremental + daily full | Continuous replication | 30 days full, 90 days incremental | 15 minutes | 5 minutes |

**RTO (Recovery Time Objective):** How long to restore?
**RPO (Recovery Point Objective):** How much data can you lose?

### 16.2 Backup Tools and Procedures

[Document your specific backup tool: pg_dump for PostgreSQL, BACKUP for SQL Server, RMAN for Oracle, etc.]

```sql
-- PostgreSQL full backup (to file)
pg_dump -h db-prod.internal.example.com -U app_prod -d ecommerce > backup-2024-03-10.sql

-- PostgreSQL backup (compressed, faster for large databases)
pg_dump -h db-prod.internal.example.com -U app_prod -d ecommerce | gzip > backup-2024-03-10.sql.gz

-- Restore from backup
psql -h db-restore.internal.example.com -U app_prod -d ecommerce < backup-2024-03-10.sql
```

### 16.3 Point-In-Time Recovery (PITR)

[Document your PITR capabilities]

Production database maintains [e.g., 7 days] of transaction logs, allowing recovery to any point in time.

```
Example: "Database crashed on 2024-03-10 at 2:30 PM UTC"
→ Restore from daily backup (2024-03-09 11 PM)
→ Replay transaction logs from 2024-03-09 11 PM to 2024-03-10 2:30 PM
→ Database recovered to 2024-03-10 2:30 PM with zero data loss
```

---

## 17. Data Retention and Archival

### 17.1 Data Retention Policy

| Table | Retention Period | Archival Strategy | Notes |
|-------|------------------|-------------------|-------|
| `users` | Indefinite (soft delete) | None; never hard-deleted | GDPR: Can request deletion (DPIA required) |
| `orders` | 7 years | Archive to `orders_archive` table after 7 years | Legal requirement; check tax regulations |
| `order_items` | 7 years | With orders | Child records archived with parent |
| `audit_logs` | 3 years | Archive to `audit_logs_archive` after 3 years | Compliance; query archive for old data |
| `email_logs` | 90 days | Delete (not archived) | Insufficient value after 90 days |

### 17.2 Archival Process

**Scheduled Job:** Runs monthly on 1st of month at 2 AM UTC

```sql
-- Archive orders from 7 years ago
INSERT INTO orders_archive
SELECT * FROM orders
WHERE created_at < NOW() - INTERVAL '7 years'
  AND created_at >= (SELECT MAX(created_at) FROM orders_archive);

-- Delete from production table
DELETE FROM orders
WHERE created_at < NOW() - INTERVAL '7 years';

-- Same for order_items (cascade)
DELETE FROM order_items
WHERE order_id NOT IN (SELECT order_id FROM orders);
```

**Archive Database:**
- Separate database instance (`ecommerce_archive`)
- Slower hardware (not optimized for speed)
- Indexed for research/compliance queries
- Rarely accessed; good candidate for cold storage

---

# Part 7 — Operational

---

## 18. Monitoring and Performance Baselines

### 18.1 Key Performance Indicators (KPIs)

| Metric | Baseline | Alert Threshold | Checked |
|--------|----------|-----------------|---------|
| **Query latency (p95)** | 50ms | > 200ms | Every minute |
| **Query latency (p99)** | 100ms | > 500ms | Every minute |
| **Slow queries** | < 10/hour | > 50/hour | Every minute |
| **Connection pool usage** | 40% | > 80% | Every minute |
| **Disk usage** | 250 GB | > 400 GB | Every hour |
| **Disk growth rate** | 50 GB/month | > 100 GB/month | Every day |
| **Backup duration** | 15 minutes | > 30 minutes | Every day |
| **Backup success** | 100% | < 99% | Every day |
| **Replication lag** | < 1 second | > 5 seconds | Every minute |

### 18.2 Monitoring Queries

**Top Slow Queries (PostgreSQL):**
```sql
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 20;
```

**Query Load (Active Queries):**
```sql
SELECT pid, user, application_name, state, query, query_start
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;
```

**Index Usage (Unused Indexes):**
```sql
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY idx_tup_read DESC;
```

---

# Part 8 — Consumer Guide

---

## 19. How to Query This Database

### 19.1 Connection Setup

[Use the connection strings from section 13.1]

**Python Example:**
```python
import psycopg2
from psycopg2.extras import DictCursor
import os

# Load credentials from environment
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT', 5432)
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')

# Connect
connection = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    cursor_factory=DictCursor
)

cursor = connection.cursor()
```

**SQL (Command Line):**
```bash
psql postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
```

---

## 20. Common Query Patterns

### 20.1 Fetching User Orders

```sql
-- Get all orders for a user (active only)
SELECT o.order_id, o.order_date, o.total_amount, o.status
FROM orders o
WHERE o.user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND o.deleted_at IS NULL
ORDER BY o.order_date DESC
LIMIT 10;
```

### 20.2 Filtering and Pagination

```sql
-- Get orders from last 30 days (paginated)
SELECT o.order_id, o.order_date, o.total_amount
FROM orders o
WHERE o.created_at >= NOW() - INTERVAL '30 days'
  AND o.deleted_at IS NULL
ORDER BY o.created_at DESC
LIMIT 20 OFFSET 0;  -- LIMIT 20, OFFSET 20 for next page
```

---

## 21. Working with Stored Procedures

[Reference section 10 for complete procedure documentation]

**Python Example:**
```python
def create_order(user_id, items, address_id):
    with connection.cursor() as cur:
        cur.callproc('sp_create_order', [user_id, items, address_id])
        order_id, total, error_code, error_msg = cur.fetchone()
        return (order_id, total, error_code, error_msg)
```

---

## 22. Transactions and Concurrency

### 22.1 Transaction Best Practices

```python
# Explicit transaction
with connection:
    cursor = connection.cursor()
    cursor.execute("BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE")
    try:
        # Multiple statements
        cursor.execute("INSERT INTO orders ...")
        cursor.execute("UPDATE inventory ...")
        cursor.execute("INSERT INTO transactions ...")
        connection.commit()  # Automatic with context manager
    except Exception as e:
        connection.rollback()  # Automatic on exception
        raise
```

### 22.2 Avoiding Deadlocks

**Deadlock Causes:**
- Two transactions acquire locks in opposite order
- Long-running transactions hold locks while waiting for other resources

**Prevention:**
- Lock tables in consistent order (users → orders → order_items)
- Keep transactions short
- Use appropriate isolation level (SERIALIZABLE = safest but slowest)

---

## 23. Error Handling and Recovery

### 23.1 Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Duplicate key value violates unique constraint" | Duplicate email or unique key | Check if record exists before INSERT; use INSERT...ON CONFLICT |
| "violates foreign key constraint" | Referencing non-existent record | Verify referenced record exists before INSERT |
| "violates check constraint" | Invalid data (e.g., negative quantity) | Validate data before INSERT |
| "connection timeout" | Database unavailable or too many connections | Retry; check database status |
| "permission denied" | User lacks INSERT/UPDATE/DELETE permission | Use correct database role |

### 23.2 Retry Strategies

```python
import time
from psycopg2.errors import IntegrityError, OperationalError

def execute_with_retry(cursor, query, params, max_retries=3):
    for attempt in range(max_retries):
        try:
            cursor.execute(query, params)
            return cursor.fetchone()
        except IntegrityError as e:
            # Constraint violation; don't retry
            raise
        except OperationalError as e:
            # Connection error; retry with backoff
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                time.sleep(wait_time)
            else:
                raise
```

---

## 24. Performance Guidelines for Developers

### 24.1 Query Performance Tips

1. **Use indexes:** Most queries benefit from indexes on WHERE columns
2. **Filter early:** Apply WHERE clauses to reduce rows before joins
3. **Avoid N+1:** Use JOIN instead of loop + individual queries
4. **Batch operations:** INSERT 1000 rows in one statement vs. 1000 individual inserts
5. **Use EXPLAIN:** Check execution plans before deploying

**Example EXPLAIN:**
```sql
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE user_id = '550e8400-...' AND created_at > NOW() - INTERVAL '30 days';
```

---

# Part 9 — Reference

---

## 25. Anti-Patterns and Pitfalls

### 25.1 Anti-Pattern: SELECT \*

**Problem:**
```sql
SELECT * FROM orders;  -- Fetches all columns; wastes bandwidth if you only need 3
```

**Solution:**
```sql
SELECT order_id, order_date, total_amount FROM orders;  -- Only fetch needed columns
```

### 25.2 Anti-Pattern: N+1 Queries

**Problem:**
```python
# Bad: 1001 queries (1 to fetch users, 1000 to fetch orders per user)
users = db.query("SELECT * FROM users LIMIT 1000")
for user in users:
    orders = db.query(f"SELECT * FROM orders WHERE user_id = {user.id}")
    print(orders)
```

**Solution:**
```python
# Good: 1 query with JOIN
result = db.query("""
    SELECT u.user_id, u.email, o.order_id, o.order_date
    FROM users u
    LEFT JOIN orders o ON u.user_id = o.user_id
    LIMIT 1000
""")
```

### 25.3 Anti-Pattern: Ignoring Soft Deletes

**Problem:**
```sql
SELECT COUNT(*) FROM users;  -- Counts deleted users too!
```

**Solution:**
```sql
SELECT COUNT(*) FROM users WHERE deleted_at IS NULL;  -- Only active users
```

---

## 26. New Table Checklist

When adding a new table to the database, follow this checklist:

- [ ] **Table name:** lowercase, plural, snake_case
- [ ] **Primary key:** UUID, auto-generated, named `[table_singular]_id`
- [ ] **Timestamp columns:** `created_at`, `updated_at` (NULL defaults to CURRENT_TIMESTAMP)
- [ ] **Soft delete:** Add `deleted_at` column (timestamp, nullable)
- [ ] **Constraints:** PK, FK, UNIQUE, CHECK constraints defined
- [ ] **Indexes:** Create indexes on frequently filtered columns (FK, status, dates)
- [ ] **Triggers:** `tr_[table]_updated_at` to auto-update `updated_at`
- [ ] **Triggers:** `tr_[table]_audit_log` if auditing required
- [ ] **Documentation:** Add to this document (entity definition, constraints, usage)
- [ ] **Seed data:** Create seed-data file if reference table
- [ ] **Migration:** Create migration file in `database/migrations/`
- [ ] **Test data:** Add to development fixtures
- [ ] **Data retention:** Document retention policy (indefinite vs. X years)
- [ ] **ERD:** Update Entity-Relationship Diagram

---

## 27. Glossary and Data Definitions

### Commonly Used Terms

| Term | Definition | Example |
|------|-----------|---------|
| **Cardinality** | The relationship type between entities (1:1, 1:M, M:M) | User:Order is 1:M (one user can have many orders) |
| **Foreign Key (FK)** | Column that references a primary key in another table | orders.user_id references users.user_id |
| **Soft Delete** | Mark record as deleted (set deleted_at) without removing from database | User account is "deactivated", not removed |
| **Hard Delete** | Permanently remove record from database | Order record deleted; cannot be recovered |
| **Materialized View** | Pre-computed query result stored as physical table; refreshed periodically | vw_daily_sales_summary; refreshed nightly |
| **Isolation Level** | How much row locking occurs in transactions (READ COMMITTED, SERIALIZABLE) | SERIALIZABLE = safest; prevents all anomalies |
| **Deadlock** | Two transactions waiting for locks held by each other | User A waits for lock on Table X, User B holds lock on Table X and waits for Table Y |
| **Index** | Data structure to speed up queries; slows inserts | Index on email column speeds up login queries |

---

## 28. Code Examples

### Python (with psycopg2)

```python
import psycopg2
from psycopg2.extras import DictCursor
import os
import json

class Database:
    def __init__(self):
        self.connection = psycopg2.connect(
            host=os.environ['DB_HOST'],
            database=os.environ['DB_NAME'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'],
            cursor_factory=DictCursor
        )

    def get_user_orders(self, user_id):
        """Fetch all orders for a user"""
        with self.connection.cursor() as cur:
            cur.execute("""
                SELECT order_id, order_date, total_amount, status
                FROM orders
                WHERE user_id = %s AND deleted_at IS NULL
                ORDER BY order_date DESC
            """, (user_id,))
            return cur.fetchall()

    def create_order(self, user_id, items, address_id):
        """Create order by calling stored procedure"""
        with self.connection.cursor() as cur:
            try:
                cur.callproc('sp_create_order', [
                    user_id,
                    json.dumps(items),
                    address_id
                ])
                return cur.fetchone()
            except psycopg2.IntegrityError as e:
                self.connection.rollback()
                raise ValueError(f"Database integrity error: {e}")
```

---

## 29. FAQ and Troubleshooting

### Q: Why is my query slow?

**A:** Check the EXPLAIN PLAN. Common issues:
- Missing index on WHERE column
- Wrong statistics (run ANALYZE)
- N+1 query pattern (use JOIN)
- Retrieving more data than needed (SELECT * instead of specific columns)

### Q: Can I delete a user?

**A:** Soft delete only: `UPDATE users SET deleted_at = NOW() WHERE user_id = '...'`

Hard delete will fail due to foreign keys (orders reference user).

### Q: How do I handle NULL values?

**A:** Use `IS NULL` or `IS NOT NULL`:
```sql
SELECT * FROM users WHERE phone IS NULL;  -- Users without phone
SELECT * FROM users WHERE phone IS NOT NULL;  -- Users with phone
```

### Q: What isolation level should I use?

**A:** For most transactions, READ COMMITTED is fine. Use SERIALIZABLE if you need absolute consistency (e.g., payment transactions).

---

**Document Version:** 1.0
**Created:** 2026-04-05
**Last Updated:** 2026-04-05
