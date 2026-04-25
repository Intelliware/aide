---
slug: migrations-and-schema-management
title: "Migrations and Schema Management"
applies-to: [re-api-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 260
---

## 16. Migrations and Schema Management

### 16.1 Migration Tool

- **Tool:** [e.g., "Prisma Migrate", "TypeORM migrations", "Knex migrations", "Flyway", "custom"]
- **Migration directory:** [e.g., `src/database/migrations/`]

### 16.2 Creating a Migration

```bash
# Command to generate a new migration
[e.g., npx prisma migrate dev --name add_products_table]
```

### 16.3 Migration File Conventions

```typescript
// Example migration file — complete and correct
```

### 16.4 Migration Rules

- [e.g., "Migrations must be backward-compatible — never drop a column that's still read by the current deployed version."]
- [e.g., "Every migration must be reversible (include a `down` function)."]
- [e.g., "Never modify a migration that has been merged to
