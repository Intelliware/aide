---
slug: backup-and-recovery
title: "Backup and Recovery"
applies-to: [re-database-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 260
---

## 16. Backup and Recovery

### 16.1 Backup Strategy

| Environment | Frequency | Type | Retention | RTO | RPO |
|-------------|-----------|------|-----------|-----|-----|
| **Development** | Manual only (use reset script) | N/A | N/A | N/A | N/A |
| **Staging** | Daily 2 AM UTC | Full backup | 7 days | 1 hour | 1 hour |
| **Production** | Hourly incremental + daily full | Continuous replication | 30 days full, 90 days incremental | 15 minutes | 5 minutes |

**RTO (Recovery Time Objective):** How long to restore?
**RPO (Recovery Point Objective):** How much data can you lose?

### 16.2 Backup Tools and Procedures

[Document your specific backup tool: pg_dump for PostgreSQL, BACKUP for SQL Server, RMAN for Oracle, etc.]

```sql
-- PostgreSQL full backup (to file)
pg_dump -h db-prod.internal.example.com -U app_prod -d ecommerce > backup-2024-03-10.sql

-- PostgreSQL backup (compressed, faster for large databases)
pg_dump -h db-prod.internal.example.com -U app_prod -d ecommerce | gzip > backup-2024-03-10.sql.gz

-- Restore from backup
psql -h db-restore.internal.example.com -U app_prod -d ecommerce < backup-2024-03-10.sql
```

### 16.3 Point-In-Time Recovery (PITR)

[Document your PITR capabilities]

Production database maintains [e.g., 7 days] of transaction logs, allowing recovery to any point in time.

```
Example: "Database crashed on 2024-03-10 at 2:30 PM UTC"
→ Restore from daily backup (2024-03-09 11 PM)
→ Replay transaction logs from 2024-03-09 11 PM to 2024-03-10 2:30 PM
→ Database recovered to 2024-03-10 2:30 PM with zero data loss
```
