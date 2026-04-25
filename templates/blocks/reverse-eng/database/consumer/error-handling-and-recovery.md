---
slug: error-handling-and-recovery
title: "Error Handling and Recovery"
applies-to: [re-database-consumer]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 330
---

## 23. Error Handling and Recovery

### 23.1 Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Duplicate key value violates unique constraint" | Duplicate email or unique key | Check if record exists before INSERT; use INSERT...ON CONFLICT |
| "violates foreign key constraint" | Referencing non-existent record | Verify referenced record exists before INSERT |
| "violates check constraint" | Invalid data (e.g., negative quantity) | Validate data before INSERT |
| "connection timeout" | Database unavailable or too many connections | Retry; check database status |
| "permission denied" | User lacks INSERT/UPDATE/DELETE permission | Use correct database role |

### 23.2 Retry Strategies

```python
import time
from psycopg2.errors import IntegrityError, OperationalError

def execute_with_retry(cursor, query, params, max_retries=3):
    for attempt in range(max_retries):
        try:
            cursor.execute(query, params)
            return cursor.fetchone()
        except IntegrityError as e:
            # Constraint violation; don't retry
            raise
        except OperationalError as e:
            # Connection error; retry with backoff
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                time.sleep(wait_time)
            else:
                raise
```
