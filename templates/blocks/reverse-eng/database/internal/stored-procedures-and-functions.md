---
slug: stored-procedures-and-functions
title: "Stored Procedures and Functions"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 200
---

## 10. Stored Procedures and Functions

### 10.1 [Stored Procedure Example: `sp_create_order`]

**Purpose:** Create a new order with items, validate inventory, and process payment.

**Signature:**
```sql
CREATE PROCEDURE sp_create_order (
    IN p_user_id UUID,
    IN p_order_items JSON,  -- Array of {product_id, quantity}
    IN p_delivery_address_id UUID,
    OUT p_order_id UUID,
    OUT p_total_amount DECIMAL(12,2),
    OUT p_error_code INT,
    OUT p_error_message VARCHAR(500)
)
LANGUAGE plpgsql
AS $$
```

**Parameters:**

| Parameter | Direction | Type | Required | Description | Example |
|-----------|-----------|------|----------|-------------|---------|
| `p_user_id` | IN | UUID | Yes | ID of user creating order | `'550e8400-...'` |
| `p_order_items` | IN | JSON | Yes | Array of items to order; each item has product_id and quantity | `'[{"product_id": "abc", "quantity": 2}]'` |
| `p_delivery_address_id` | IN | UUID | Yes | Delivery address for order | `'xyz-789'` |
| `p_order_id` | OUT | UUID | — | Generated order ID; populated if successful | `'order-2024-001'` |
| `p_total_amount` | OUT | DECIMAL(12,2) | — | Total order amount in USD cents | `9999.99` |
| `p_error_code` | OUT | INT | — | Error code if operation failed (see table below) | `0` (success) or error code |
| `p_error_message` | OUT | VARCHAR(500) | — | Error message if operation failed | `'Insufficient inventory for product ABC'` |

**Error Codes:**

| Code | Meaning | Recovery |
|------|---------|----------|
| `0` | Success; order created | Use p_order_id for next steps |
| `1001` | User not found | Verify user_id exists |
| `1002` | User account inactive | Activate user account |
| `1003` | Address not found | Verify delivery address belongs to user |
| `1004` | Product not found | Check product_id exists |
| `2001` | Insufficient inventory | Wait for restock or choose different product |
| `2002` | Invalid quantity | Order quantity must be > 0 |
| `3001` | Payment failed | Retry with different payment method |
| `3002` | Transaction already exists | Order already created; check existing orders |
| `9999` | Unknown error | Check logs; contact support |

**Business Logic:**

1. **Validate User:** Check user exists and is active; fail if not (error 1001, 1002)
2. **Validate Address:** Check address exists and belongs to user; fail if not (error 1003)
3. **Validate Items:** Check each product exists; fail if not (error 1004)
4. **Check Inventory:** For each item, verify sufficient quantity available; fail if not (error 2001)
5. **Reserve Inventory:** Decrement inventory for each item
6. **Create Order:** Insert order header with status = 'PENDING'
7. **Create Line Items:** Insert order items with unit prices
8. **Calculate Total:** Sum order items with tax/shipping
9. **Debit Payment:** Call payment processor (external service); fail if payment fails (error 3001)
10. **Commit:** If all steps succeed, commit transaction; order is confirmed
11. **Return:** Return order_id and total_amount; error_code = 0

**Transactionality:**
- **Atomic:** All-or-nothing; if any step fails, all changes rollback
- **Isolation:** Uses SERIALIZABLE isolation level to prevent concurrent order conflicts
- **Lock Duration:** ~500ms average; longer if payment processor is slow

**Example Usage:**

**SQL:**
```sql
CALL sp_create_order(
    p_user_id := '550e8400-e29b-41d4-a716-446655440000',
    p_order_items := '[
        {"product_id": "prod-001", "quantity": 2},
        {"product_id": "prod-002", "quantity": 1}
    ]',
    p_delivery_address_id := 'addr-12345',
    p_order_id := @order_id,
    p_total_amount := @total,
    p_error_code := @error_code,
    p_error_message := @error_msg
);

-- Check result
SELECT @order_id, @total, @error_code, @error_msg;
```

**Python (with psycopg2):**
```python
def create_order(user_id, items, address_id):
    """
    Create order and return (order_id, total, error_code, error_message)

    Args:
        user_id: UUID of user
        items: List of {"product_id": str, "quantity": int}
        address_id: UUID of delivery address

    Returns:
        (order_id, total, error_code, error_message)
    """
    with connection.cursor() as cur:
        try:
            cur.callproc('sp_create_order', [
                user_id,
                json.dumps(items),
                address_id,
            ])
            return cur.fetchone()  # Returns (order_id, total, error_code, error_msg)
        except psycopg2.IntegrityError as e:
            # Handle constraint violations
            return (None, None, 9999, f"Database error: {str(e)}")
        except Exception as e:
            return (None, None, 9999, f"Unexpected error: {str(e)}")

# Example call
order_id, total, code, msg = create_order(
    '550e8400-...',
    [{"product_id": "abc", "quantity": 2}],
    'addr-xyz'
)

if code == 0:
    print(f"Order created: {order_id}, Total: ${total}")
else:
    print(f"Order failed: {msg}")
```

**Transactions and Locks:**
```
Duration of sp_create_order:
- Lock on users table: 50ms (validate user exists)
- Lock on inventory table: 100ms (reserve inventory)
- Lock on orders table: 100ms (insert order)
- Network call to payment processor: 200-500ms (payment)
- Commit: 50ms

Total: 500-700ms

Concurrency:
- While sp_create_order runs, concurrent orders for same user are blocked (row-level lock)
- Same product can be ordered by multiple users (row lock on inventory row, not table)
- Deadlock possible if payment processor is slow AND multiple users order same product
```

**Side Effects:**
- **Triggers Fired:**
  - `tr_orders_created` → sends order confirmation email
  - `tr_inventory_updated` → logs inventory change to audit table
  - `tr_audit_log` → logs procedure call to system audit log
- **External Services Called:**
  - Payment processor (Stripe/PayPal) for payment
  - Email service for confirmation
- **Cache Invalidated:**
  - User's order list cache cleared
  - Product inventory cache cleared

### 10.2 [Additional Procedures Follow Same Pattern]
