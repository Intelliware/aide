---
slug: views
title: "Views"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 180
---

## 8. Views

### 8.1 [View Name Example: `vw_user_orders`]

**Type:** Real-Time View (materialized after every order change)

**Purpose:** Denormalized user order summary for dashboard queries. Joins users, orders, and order items to provide quick access to order details without re-joining at query time.

**Source Tables:** users, orders, order_items, products

**Definition:**
```sql
CREATE VIEW vw_user_orders AS
SELECT
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    o.order_id,
    o.order_date,
    o.status as order_status,
    COUNT(oi.order_item_id) as item_count,
    SUM(oi.quantity) as total_quantity,
    SUM(oi.unit_price * oi.quantity) as order_total
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id AND o.deleted_at IS NULL
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE u.deleted_at IS NULL
GROUP BY u.user_id, o.order_id
ORDER BY o.order_date DESC;
```

**Columns:**
- `user_id`: Foreign key to users table
- `email`: User's email
- `first_name`, `last_name`: User's name
- `order_id`: Foreign key to orders table
- `order_date`: When order was placed
- `order_status`: Current status (PENDING, CONFIRMED, SHIPPED, DELIVERED)
- `item_count`: Number of distinct items in order
- `total_quantity`: Total units ordered
- `order_total`: Sum of all items in order

**Usage Examples:**
```sql
-- Get all orders for a user
SELECT * FROM vw_user_orders WHERE user_id = 'abc-123';

-- Get summary of user's spending
SELECT user_id, COUNT(*) as order_count, SUM(order_total) as lifetime_value
FROM vw_user_orders
GROUP BY user_id;

-- Find orders over $1000
SELECT * FROM vw_user_orders WHERE order_total > 1000;
```

**Materialization:** Real-time; refreshes after every order/item change via trigger
