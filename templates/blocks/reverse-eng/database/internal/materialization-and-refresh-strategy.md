---
slug: materialization-and-refresh-strategy
title: "Materialization and Refresh Strategy"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 190
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
