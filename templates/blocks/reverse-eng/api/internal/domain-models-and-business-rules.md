---
slug: domain-models-and-business-rules
title: "Domain Models and Business Rules"
applies-to: [re-api-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 220
---

## 12. Domain Models and Business Rules

### 12.1 Entity Definition Pattern

```typescript
// Canonical entity showing:
// - All fields with types
// - Audit fields (createdAt, updatedAt, createdBy)
// - Soft delete (if used)
// - Relationships / foreign keys
// - Any domain methods on the entity
```

### 12.2 Value Objects

<!-- If the codebase uses value objects (e.g., Money, Email, Address). -->

```typescript
// Example value object
```

### 12.3 Entity Relationships and How They're Loaded

| Entity A       | Relationship | Entity B       | Loading Strategy                             |
|----------------|-------------|----------------|----------------------------------------------|
| `Product`      | has many    | `ProductImage` | [e.g., "Eager loaded via JOIN in repository."]|
| `Order`        | belongs to  | `User`         | [e.g., "Lazy — loaded separately when needed."]|
| `Order`        | has many    | `OrderItem`    | [e.g., "Always loaded with order."]           |
| [entity]       | [relation]  | [entity]       | [strategy]                                    |

### 12.4 Business Rule Implementation Pattern

```typescript
// Example: where business rules live (in the entity? in the service?) and how they're enforced.
// Show a real example like "an order cannot be cancelled if it's already shipped."
```

### 12.5 Domain Events (if applicable)

```typescript
// How domain events are defined, dispatched, and handled
```
