---
slug: service-layer-patterns
title: "Service Layer Patterns"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 210
---

## 11. Service Layer Patterns

### 11.1 Service Structure

```typescript
// Canonical service skeleton showing:
// - Constructor injection
// - Standard method signatures (return types, error handling)
// - How transactions are used
// - How authorization is checked
```

### 11.2 Transaction Management

<!-- How and when to wrap operations in transactions. -->

- **Pattern:** [e.g., "Unit of Work injected per request", "Manual transaction wrapping via `TransactionService`", "Decorator-based `@Transactional()`"]

```typescript
// Example: wrapping a multi-step operation in a transaction
```

**When to use transactions:**
- [e.g., "Any operation that writes to more than one table."]
- [e.g., "Any operation that reads-then-writes (check-then-act)."]

**When NOT to use transactions:**
- [e.g., "Read-only operations."]
- [e.g., "Single-row inserts/updates (already atomic)."]

### 11.3 Service-to-Service Calls

<!-- How one feature's service calls another within the same codebase. -->

```typescript
// Example: OrderService calling ProductService to check stock
```

**Rules:**
- [e.g., "Services may only call other services, never other repositories directly."]
- [e.g., "Avoid circular service dependencies — extract shared logic to a common service."]

### 11.4 Method Naming Conventions

| Operation              | Method Name Pattern       | Example                              |
|------------------------|---------------------------|--------------------------------------|
| Get one by ID          | `findById(id)`            | `findById(productId: string)`        |
| Get one with conditions| `findOne(criteria)`       | `findOneBySlug(slug: string)`        |
| Get list / search      | `findAll(query)`          | `findAll(query: ListProductsQuery)`  |
| Create                 | `create(dto)`             | `create(dto: CreateProductDto)`      |
| Update                 | `update(id, dto)`         | `update(id: string, dto: UpdateDto)` |
| Delete                 | `delete(id)` / `remove`   | `delete(id: string)`                 |
| Business action        | `[verb][Noun]()`          | `publishProduct(id)`, `approveOrder(id)` |
| Existence check        | `exists(criteria)`        | `existsByEmail(email: string)`       |
