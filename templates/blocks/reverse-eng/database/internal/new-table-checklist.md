---
slug: new-table-checklist
title: "New Table Checklist"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 360
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
