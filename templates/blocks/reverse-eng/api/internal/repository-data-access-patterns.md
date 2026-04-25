---
slug: repository-data-access-patterns
title: "Repository / Data Access Patterns"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 250
---

## 15. Repository / Data Access Patterns

### 15.1 Base Repository (if applicable)

```typescript
// If there's a base repository class or set of reusable query methods, show it here.
```

### 15.2 Writing a Repository

```typescript
// Canonical repository example showing:
// - Standard CRUD methods
// - Parameterized queries (SQL injection prevention)
// - Joins and eager loading
// - Pagination implementation
// - Filter/sort implementation
// - Transaction participation
```

### 15.3 Query Patterns

**Simple query:**
```typescript
// Example: find by ID
```

**Query with joins:**
```typescript
// Example: load entity with related data
```

**Query with dynamic filters:**
```typescript
// Example: applying optional filter criteria
```

**Aggregate query:**
```typescript
// Example: count, sum, grouped results
```

**Batch operations:**
```typescript
// Example: bulk insert, bulk update
```

### 15.4 N+1 Query Prevention

<!-- This is one of the most dangerous AI mistakes. Be explicit. -->

```typescript
// ANTI-PATTERN: N+1 query
// CORRECT PATTERN: eager loading / batch loading
```

### 15.5 Raw SQL Conventions (if applicable)

```typescript
// How raw SQL is written, parameterized, and where it lives
```
