---
slug: anti-patterns-and-pitfalls
title: "Anti-Patterns and Pitfalls"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 350
---

## 25. Anti-Patterns and Pitfalls

### 25.1 Anti-Pattern: SELECT \*

**Problem:**
```sql
SELECT * FROM orders;  -- Fetches all columns; wastes bandwidth if you only need 3
```

**Solution:**
```sql
SELECT order_id, order_date, total_amount FROM orders;  -- Only fetch needed columns
```

### 25.2 Anti-Pattern: N+1 Queries

**Problem:**
```python
# Bad: 1001 queries (1 to fetch users, 1000 to fetch orders per user)
users = db.query("SELECT * FROM users LIMIT 1000")
for user in users:
    orders = db.query(f"SELECT * FROM orders WHERE user_id = {user.id}")
    print(orders)
```

**Solution:**
```python
# Good: 1 query with JOIN
result = db.query("""
    SELECT u.user_id, u.email, o.order_id, o.order_date
    FROM users u
    LEFT JOIN orders o ON u.user_id = o.user_id
    LIMIT 1000
""")
```

### 25.3 Anti-Pattern: Ignoring Soft Deletes

**Problem:**
```sql
SELECT COUNT(*) FROM users;  -- Counts deleted users too!
```

**Solution:**
```sql
SELECT COUNT(*) FROM users WHERE deleted_at IS NULL;  -- Only active users
```
