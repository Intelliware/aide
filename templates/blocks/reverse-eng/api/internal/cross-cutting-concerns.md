---
slug: cross-cutting-concerns
title: "Cross-Cutting Concerns"
applies-to: [re-api-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 230
---

## 13. Cross-Cutting Concerns

### 13.1 Audit Logging

<!-- How create/update/delete actions are tracked. -->

```typescript
// Example: how audit fields are populated (middleware? ORM hook? explicit in service?)
```

### 13.2 Soft Delete

<!-- If the codebase uses soft delete, document exactly how it works. -->

- **Approach:** [e.g., "`deletedAt` timestamp column. All queries filter `WHERE deletedAt IS NULL` by default."]
- **Hard delete:** [e.g., "Never. Soft delete only, enforced at the repository base class."]

```typescript
// Example: how soft delete is implemented in queries
```

### 13.3 Multi-Tenancy (if applicable)

<!-- How tenant isolation is enforced. -->

```typescript
// Example: how tenant ID is injected into queries
```

### 13.4 Pagination

<!-- The standard pagination pattern used everywhere. -->

```typescript
// Request DTO
```

```typescript
// Response envelope
```

```typescript
// Repository implementation
```

### 13.5 Sorting and Filtering

```typescript
// Standard pattern for dynamic sort/filter
```

---

# Part 5 — Data Layer
