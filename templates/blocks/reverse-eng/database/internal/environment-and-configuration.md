---
slug: environment-and-configuration
title: "Environment and Configuration"
applies-to: [re-database-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 120
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
