---
slug: how-to-query-this-database
title: "How to Query This Database"
applies-to: [re-database-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 290
---

## 19. How to Query This Database

### 19.1 Connection Setup

[Use the connection strings from section 13.1]

**Python Example:**
```python
import psycopg2
from psycopg2.extras import DictCursor
import os

# Load credentials from environment
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT', 5432)
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')

# Connect
connection = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    cursor_factory=DictCursor
)

cursor = connection.cursor()
```

**SQL (Command Line):**
```bash
psql postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
```
