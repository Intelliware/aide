---
slug: schema-overview-and-erd
title: "Schema Overview and ERD"
applies-to: [re-database-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 130
---

## 3. Schema Overview and ERD

### 3.1 High-Level Schema Organization

The database is organized around the following core domains:

**Core Domains:**
- **Users Domain:** Users, authentication, roles, permissions
- **Products Domain:** Products, categories, pricing, inventory
- **Orders Domain:** Orders, order items, fulfillment status
- **Transactions Domain:** Payments, refunds, transaction history
- **Analytics Domain:** Materialized views for reporting, denormalized summary tables

**Inter-Domain Relationships:**
- Orders references Users (customer) and Products (ordered items)
- Transactions references Orders
- Analytics tables are refreshed nightly from transactional tables

### 3.2 Entity-Relationship Diagram

```
[DIAGRAM: Show visual ERD here — PNG, SVG, or link to tool like Lucidchart/dbdiagram.io]

Example textual representation:

Users (1) ──→ (M) Orders: One user can have many orders
Orders (1) ──→ (M) OrderItems: One order contains many items
Products (1) ←── (M) OrderItems: One product appears in many orders
Orders (1) ──→ (M) Transactions: One order can have multiple transactions (payments, refunds)
Users (1) ──→ (M) Addresses: One user has multiple addresses
```

**Cardinality Notation:**
- (1) ──→ (M): One-to-Many (PK on left, FK on right)
- (1) ──→ (1): One-to-One
- (M) ──→ (M): Many-to-Many (junction table)

### 3.3 Schema Statistics

| Entity Type | Count | Notes |
|-------------|-------|-------|
| **Tables** | [e.g., 47] | Includes system tables but not temporary tables |
| **Views** | [e.g., 12] | Real-time views; see section 8 for materialized views |
| **Stored Procedures** | [e.g., 23] | See section 10 for complete list |
| **Functions** | [e.g., 5] | Mostly for data transformation |
| **Triggers** | [e.g., 8] | See section 11 for details |
| **Indexes** | [e.g., 156] | Distributed across tables; see section 7 |

---

# Part 2 — Data Structure
