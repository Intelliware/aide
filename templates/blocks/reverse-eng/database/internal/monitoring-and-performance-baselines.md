---
slug: monitoring-and-performance-baselines
title: "Monitoring and Performance Baselines"
applies-to: [re-database-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 280
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
