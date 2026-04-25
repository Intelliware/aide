---
slug: services
title: "Services"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 160
---

## 6. Services

<!-- Repeat 6.x for each service. -->

### 6.1 `[ServiceName]`

- **Import:** `import { ServiceName } from '@orgname/framework-core';`
- **Provided in:** [e.g., `'root'` / `FrameworkCoreModule` / must be manually provided]
- **Purpose:** [One sentence.]
- **Stateful:** [Yes/No — does it hold internal state across calls?]

**Generic Type Parameters (if any):**

| Parameter | Constraint    | Description                              |
|-----------|---------------|------------------------------------------|
| `T`       | `[constraint]`| [Description.]                           |

**Public Properties:**

| Property           | Type                   | Description                             |
|--------------------|------------------------|-----------------------------------------|
| `[propertyName]`   | `Observable<type>`     | [What it exposes.]                      |

**Public Methods:**

| Method Signature                                          | Returns              | Description              |
|-----------------------------------------------------------|----------------------|--------------------------|
| `fetchItems(filter?: FilterModel): Observable<Item[]>`    | `Observable<Item[]>` | [What it does.]          |

**Minimal Usage:**
```typescript
// Inject and call — simplest case
```

**Realistic Usage:**
```typescript
// With error handling, loading states, subscriptions
```

**Edge Cases and Gotchas:**
- [List non-obvious behaviors, required initialization order, etc.]
