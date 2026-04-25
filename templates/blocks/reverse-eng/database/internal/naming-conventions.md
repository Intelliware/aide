---
slug: naming-conventions
title: "Naming Conventions"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 140
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
