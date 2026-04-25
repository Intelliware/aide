---
slug: working-with-stored-procedures
title: "Working with Stored Procedures"
applies-to: [re-database-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 310
---

## 21. Working with Stored Procedures

[Reference section 10 for complete procedure documentation]

**Python Example:**
```python
def create_order(user_id, items, address_id):
    with connection.cursor() as cur:
        cur.callproc('sp_create_order', [user_id, items, address_id])
        order_id, total, error_code, error_msg = cur.fetchone()
        return (order_id, total, error_code, error_msg)
```
