---
slug: constraints-and-integrity
title: "Constraints and Integrity"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 160
---

## 6. Constraints and Integrity

### 6.1 Constraint Strategy

This database enforces data integrity at the database level (using constraints) rather than relying solely on application validation. This approach:
- Prevents invalid data even from direct SQL inserts
- Ensures consistency across all code paths
- Makes constraints visible and documentable

### 6.2 Primary Key Strategy

**Strategy:** UUID (universally unique identifiers)

**Rationale:**
- Support multi-region deployment
- Prevent ID collision across databases
- Enable client-side ID generation (reduce chattiness)
- No auto-increment dependencies

**Generation:**
```sql
-- PostgreSQL
user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

-- SQL Server
user_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

-- MySQL
user_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
```

### 6.3 Foreign Key Constraints

**Strategy:** Referential integrity enforced at database level. Cascade rules are intentional and documented.

**Cascade Rules Used:**

| Rule | When Used | Example | Implication |
|------|-----------|---------|-------------|
| **RESTRICT** | Parent record should not be deletable | User has orders → FK orders.user_id RESTRICT | Delete parent? Error; delete children first |
| **CASCADE** | Child records should be deleted with parent | User deleted → delete user settings automatically | Parent deleted → children auto-deleted |
| **SET NULL** | Child should orphan gracefully | Order item deleted → delete from inventory reserved if needed; set order.item_id = NULL | Parent deleted → child's FK becomes NULL |
| **SET DEFAULT** | Child should revert to default parent | Order assigned to user; if user deleted, revert to default/admin user | Parent deleted → child's FK becomes default |

**Examples in This Database:**

```sql
-- ON DELETE RESTRICT: Cannot delete users with orders
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id)
ON DELETE RESTRICT;

-- ON DELETE CASCADE: Deleting user also deletes their settings
ALTER TABLE user_settings
ADD CONSTRAINT fk_user_settings_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id)
ON DELETE CASCADE;

-- ON DELETE SET NULL: Deleting order item nulls out order reference
ALTER TABLE order_item_logs
ADD CONSTRAINT fk_order_item_logs_item_id
FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id)
ON DELETE SET NULL;
```

### 6.4 Unique Constraints

| Table | Constraint | Rationale | Enforcement |
|-------|-----------|-----------|-------------|
| `users` | email | No duplicate email registrations | Lowercased before comparison |
| `products` | sku | No duplicate product SKUs | Code must validate before insert |
| `order_items` | (order_id, product_id) | No duplicate line items in order | Composite unique; prevents adding same product twice |

### 6.5 Check Constraints

| Constraint | Rule | Violation Behavior |
|-----------|------|-------------------|
| `ck_users_email_format` | Email matches RFC pattern | Violates: "New row violates check constraint 'ck_users_email_format'" |
| `ck_orders_amount_positive` | order amount > 0 | Violates: "New row violates check constraint 'ck_orders_amount_positive'" |
| `ck_order_items_quantity_positive` | quantity > 0 | Violates: "New row violates check constraint 'ck_order_items_quantity_positive'" |

### 6.6 Handling Constraint Violations

**Pattern:** Database rejects invalid data; application must handle errors.

```sql
-- Example: Attempt to insert duplicate email
INSERT INTO users (email, first_name, last_name)
VALUES ('alice@example.com', 'Alice', 'Smith');
-- Error: duplicate key value violates unique constraint "uk_users_email"

-- Application handling (Python with psycopg2 example):
try:
    cursor.execute(
        "INSERT INTO users (email, first_name, last_name) VALUES (%s, %s, %s)",
        ('alice@example.com', 'Alice', 'Smith')
    )
except psycopg2.IntegrityError as e:
    if 'uk_users_email' in str(e):
        return {"error": "Email already exists"}
    raise
```
