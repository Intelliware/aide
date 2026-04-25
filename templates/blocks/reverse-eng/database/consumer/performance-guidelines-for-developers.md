---
slug: performance-guidelines-for-developers
title: "Performance Guidelines for Developers"
applies-to: [re-database-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 340
---

## 24. Performance Guidelines for Developers

### 24.1 Query Performance Tips

1. **Use indexes:** Most queries benefit from indexes on WHERE columns
2. **Filter early:** Apply WHERE clauses to reduce rows before joins
3. **Avoid N+1:** Use JOIN instead of loop + individual queries
4. **Batch operations:** INSERT 1000 rows in one statement vs. 1000 individual inserts
5. **Use EXPLAIN:** Check execution plans before deploying

**Example EXPLAIN:**
```sql
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE user_id = '550e8400-...' AND created_at > NOW() - INTERVAL '30 days';
```

---

# Part 9 — Reference
