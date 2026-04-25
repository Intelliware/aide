---
slug: database-and-orm
title: "Database and ORM"
applies-to: [re-api-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 240
---

## 14. Database and ORM

### 14.1 Database Details

- **Database:** [e.g., "PostgreSQL 16"]
- **ORM / Query tool:** [e.g., "Prisma", "TypeORM", "Knex", "Drizzle", "raw pg", "Entity Framework Core"]
- **Schema definition:** [e.g., "Prisma schema at `prisma/schema.prisma`", "TypeORM entities decorated with `@Entity()`"]
- **Connection management:** [e.g., "Connection pool managed by `DatabaseService`, max 10 connections."]

### 14.2 Table Naming Conventions

| Convention               | Example                        | Notes                            |
|--------------------------|--------------------------------|----------------------------------|
| Table names              | [e.g., snake_case, plural]     | `products`, `order_items`        |
| Column names             | [e.g., snake_case]             | `created_at`, `product_id`       |
| Primary keys             | [e.g., `id`, UUID or serial]   | `id UUID DEFAULT gen_random_uuid()` |
| Foreign keys             | [e.g., `[table]_id`]           | `product_id`, `user_id`          |
| Indexes                  | [e.g., `idx_[table]_[columns]`]| `idx_products_category_id`       |
| Unique constraints       | [e.g., `uq_[table]_[columns]`] | `uq_users_email`                 |
| Junction tables          | [e.g., alphabetical]           | `product_tags`                   |

### 14.3 Standard Column Patterns

<!-- Columns that appear on every (or most) tables. -->

```sql
-- Standard columns present on all tables
id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
created_by  UUID        REFERENCES users(id),
-- If soft delete:
deleted_at  TIMESTAMPTZ NULL,
```

### 14.4 ORM Configuration and Conventions

```typescript
// Key ORM configuration (connection, logging, naming strategy, etc.)
```
