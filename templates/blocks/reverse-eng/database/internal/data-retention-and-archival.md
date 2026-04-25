---
slug: data-retention-and-archival
title: "Data Retention and Archival"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 270
---

## 17. Data Retention and Archival

### 17.1 Data Retention Policy

| Table | Retention Period | Archival Strategy | Notes |
|-------|------------------|-------------------|-------|
| `users` | Indefinite (soft delete) | None; never hard-deleted | GDPR: Can request deletion (DPIA required) |
| `orders` | 7 years | Archive to `orders_archive` table after 7 years | Legal requirement; check tax regulations |
| `order_items` | 7 years | With orders | Child records archived with parent |
| `audit_logs` | 3 years | Archive to `audit_logs_archive` after 3 years | Compliance; query archive for old data |
| `email_logs` | 90 days | Delete (not archived) | Insufficient value after 90 days |

### 17.2 Archival Process

**Scheduled Job:** Runs monthly on 1st of month at 2 AM UTC

```sql
-- Archive orders from 7 years ago
INSERT INTO orders_archive
SELECT * FROM orders
WHERE created_at < NOW() - INTERVAL '7 years'
  AND created_at >= (SELECT MAX(created_at) FROM orders_archive);

-- Delete from production table
DELETE FROM orders
WHERE created_at < NOW() - INTERVAL '7 years';

-- Same for order_items (cascade)
DELETE FROM order_items
WHERE order_id NOT IN (SELECT order_id FROM orders);
```

**Archive Database:**
- Separate database instance (`ecommerce_archive`)
- Slower hardware (not optimized for speed)
- Indexed for research/compliance queries
- Rarely accessed; good candidate for cold storage

---

# Part 7 — Operational
