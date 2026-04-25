---
slug: glossary-and-data-definitions
title: "Glossary and Data Definitions"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 370
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
