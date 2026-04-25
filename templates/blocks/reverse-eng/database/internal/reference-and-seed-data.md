---
slug: reference-and-seed-data
title: "Reference and Seed Data"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 240
---

## 14. Reference and Seed Data

### 14.1 Reference Tables (Lookup Tables)

Reference tables contain static or slowly-changing lists of values.

| Table | Purpose | Rows | Update Frequency | Example Values |
|-------|---------|------|------------------|-----------------|
| `order_status_ref` | Valid order statuses | 5 | Rarely (new status = code deploy) | PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED |
| `payment_method_ref` | Valid payment methods | 4 | Rarely | CREDIT_CARD, DEBIT_CARD, PAYPAL, BANK_TRANSFER |
| `country_ref` | Country codes and names | 195 | Rarely (new country?) | US, CA, GB, ... |
| `currency_ref` | ISO currency codes | 180 | Rarely | USD, EUR, GBP, ... |

**Querying Reference Data:**
```sql
-- Get all valid order statuses
SELECT * FROM order_status_ref;
-- Result: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

-- Validate order status before insert
SELECT COUNT(*) FROM order_status_ref
WHERE status_code = 'PENDING';  -- Returns 1 if valid, 0 if invalid
```

**Application Pattern:**
```python
# Cache reference data in application (doesn't change)
ORDER_STATUSES = {
    'PENDING': 'Order received, awaiting confirmation',
    'CONFIRMED': 'Order confirmed, preparing to ship',
    'SHIPPED': 'Order shipped',
    'DELIVERED': 'Order delivered',
    'CANCELLED': 'Order cancelled'
}

# Validate before querying database
if status not in ORDER_STATUSES:
    raise ValueError(f"Invalid status: {status}")
```

### 14.2 Seed Data

Seed data populates reference tables and basic data needed for the application to function.

**Location:** `database/seed-data/`

**Files:**
- `seed-01-order-statuses.sql` — Insert order statuses
- `seed-02-payment-methods.sql` — Insert payment methods
- `seed-03-countries.sql` — Insert countries
- `seed-04-dev-users.sql` — Dev-only users for testing

**Running Seed Data:**
```bash
# Reset and reseed (development only!)
psql postgresql://... < database/seed-data/00-reset-all.sql
psql postgresql://... < database/seed-data/seed-01-order-statuses.sql
psql postgresql://... < database/seed-data/seed-02-payment-methods.sql
# ... run all seed files in order

# Check result
psql postgresql://... -c "SELECT * FROM order_status_ref;"
```
