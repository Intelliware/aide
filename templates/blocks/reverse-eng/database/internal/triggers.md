---
slug: triggers
title: "Triggers"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 210
---

## 11. Triggers

### 11.1 Trigger Overview

Triggers automatically execute logic when data changes. They enforce business rules that can't be captured by constraints alone.

| Trigger Name | Table | Event | Purpose | Timing |
|--------------|-------|-------|---------|--------|
| `tr_users_updated_at` | users | BEFORE UPDATE | Auto-update `updated_at` timestamp | ~1ms |
| `tr_orders_created` | orders | AFTER INSERT | Send order confirmation email | ~50ms (queues email) |
| `tr_order_status_changed` | orders | AFTER UPDATE | Send status notification to user | ~100ms (calls email service) |
| `tr_inventory_decrement` | order_items | AFTER INSERT | Decrement product inventory | ~10ms |
| `tr_audit_log` | [multiple] | AFTER INSERT/UPDATE/DELETE | Log all changes to audit table | ~5ms |

### 11.2 [Trigger Name Example: `tr_orders_created`]

**Trigger Definition:**
```sql
CREATE TRIGGER tr_orders_created
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    -- Queue email notification
    INSERT INTO email_queue (recipient_email, template, data, created_at)
    SELECT u.email, 'order_confirmation',
           json_object('order_id', NEW.order_id, 'order_total', NEW.total_amount),
           NOW()
    FROM users u
    WHERE u.user_id = NEW.user_id;

    -- Update materialized view cache
    DELETE FROM cache_user_orders WHERE user_id = NEW.user_id;
END;
```

**When It Fires:** Immediately after INSERT into orders table

**What It Does:**
1. Inserts email task into email queue (async; sent later)
2. Invalidates user's cached order list

**Performance Impact:**
- Adds ~50ms to INSERT (mostly I/O to email queue)
- Does NOT block order creation (email happens async)

**Exceptions/Errors:**
- If email queue is full: INSERT fails; order transaction rolls back
- If cache DELETE fails: Order still created; cache inconsistency (non-fatal; fixed on next refresh)

**Developer Implications:**
- Expecting email immediately after order? No; check email_queue table (email sent asynchronously, typically within 5 minutes)
- Order INSERT takes ~50ms longer due to trigger
- Don't bypass trigger (don't directly INSERT with skipTriggers)

---

# Part 5 — Security and Access
