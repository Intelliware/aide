---
slug: transactions-and-concurrency
title: "Transactions and Concurrency"
applies-to: [re-database-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 320
---

## 22. Transactions and Concurrency

### 22.1 Transaction Best Practices

```python
# Explicit transaction
with connection:
    cursor = connection.cursor()
    cursor.execute("BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE")
    try:
        # Multiple statements
        cursor.execute("INSERT INTO orders ...")
        cursor.execute("UPDATE inventory ...")
        cursor.execute("INSERT INTO transactions ...")
        connection.commit()  # Automatic with context manager
    except Exception as e:
        connection.rollback()  # Automatic on exception
        raise
```

### 22.2 Avoiding Deadlocks

**Deadlock Causes:**
- Two transactions acquire locks in opposite order
- Long-running transactions hold locks while waiting for other resources

**Prevention:**
- Lock tables in consistent order (users → orders → order_items)
- Keep transactions short
- Use appropriate isolation level (SERIALIZABLE = safest but slowest)
