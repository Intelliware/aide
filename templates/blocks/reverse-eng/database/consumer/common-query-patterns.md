---
slug: common-query-patterns
title: "Common Query Patterns"
applies-to: [re-database-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 300
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
