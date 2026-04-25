---
slug: faq-and-troubleshooting
title: "FAQ and Troubleshooting"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 390
---

## 29. FAQ and Troubleshooting

### Q: Why is my query slow?

**A:** Check the EXPLAIN PLAN. Common issues:
- Missing index on WHERE column
- Wrong statistics (run ANALYZE)
- N+1 query pattern (use JOIN)
- Retrieving more data than needed (SELECT * instead of specific columns)

### Q: Can I delete a user?

**A:** Soft delete only: `UPDATE users SET deleted_at = NOW() WHERE user_id = '...'`

Hard delete will fail due to foreign keys (orders reference user).

### Q: How do I handle NULL values?

**A:** Use `IS NULL` or `IS NOT NULL`:
```sql
SELECT * FROM users WHERE phone IS NULL;  -- Users without phone
SELECT * FROM users WHERE phone IS NOT NULL;  -- Users with phone
```

### Q: What isolation level should I use?

**A:** For most transactions, READ COMMITTED is fine. Use SERIALIZABLE if you need absolute consistency (e.g., payment transactions).

---

**Document Version:** 1.0
**Created:** 2026-04-05
**Last Updated:** 2026-04-05
