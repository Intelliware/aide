---
slug: code-examples
title: "Code Examples"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 380
---

## 28. Code Examples

### Python (with psycopg2)

```python
import psycopg2
from psycopg2.extras import DictCursor
import os
import json

class Database:
    def __init__(self):
        self.connection = psycopg2.connect(
            host=os.environ['DB_HOST'],
            database=os.environ['DB_NAME'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'],
            cursor_factory=DictCursor
        )

    def get_user_orders(self, user_id):
        """Fetch all orders for a user"""
        with self.connection.cursor() as cur:
            cur.execute("""
                SELECT order_id, order_date, total_amount, status
                FROM orders
                WHERE user_id = %s AND deleted_at IS NULL
                ORDER BY order_date DESC
            """, (user_id,))
            return cur.fetchall()

    def create_order(self, user_id, items, address_id):
        """Create order by calling stored procedure"""
        with self.connection.cursor() as cur:
            try:
                cur.callproc('sp_create_order', [
                    user_id,
                    json.dumps(items),
                    address_id
                ])
                return cur.fetchone()
            except psycopg2.IntegrityError as e:
                self.connection.rollback()
                raise ValueError(f"Database integrity error: {e}")
```
