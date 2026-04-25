---
slug: indexes-and-performance
title: "Indexes and Performance"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 170
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
