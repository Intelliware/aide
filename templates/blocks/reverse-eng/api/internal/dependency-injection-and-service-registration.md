---
slug: dependency-injection-and-service-registration
title: "Dependency Injection and Service Registration"
applies-to: [re-api-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 160
---

## 6. Dependency Injection and Service Registration

### 6.1 DI Framework

- **DI system:** [e.g., "NestJS built-in DI", "tsyringe", "Inversify", "ASP.NET Core DI", "Manual composition root"]
- **Registration location:** [e.g., "Each feature's `.module.ts` file. Infrastructure services in `app.module.ts`."]

### 6.2 Registration Patterns

```typescript
// Example: how to register a new service
```

```typescript
// Example: how to register an infrastructure service with an interface token
```

### 6.3 Service Lifetimes

| Lifetime      | When to use                                             | Example                                |
|---------------|---------------------------------------------------------|----------------------------------------|
| Singleton     | [e.g., "Stateless services, config, connection pools."] | `DatabaseService`, `ConfigService`     |
| Scoped        | [e.g., "Per-request state, unit-of-work."]              | `RequestContext`, `UnitOfWork`         |
| Transient     | [e.g., "Stateful helpers that shouldn't be shared."]    | `QueryBuilder` instances               |

### 6.4 Common Mistakes

- [e.g., "Injecting a scoped service into a singleton causes captured dependency bugs."]
- [e.g., "Circular dependencies must be resolved with `forwardRef()` — but prefer restructuring."]

---

# Part 3 — Request Pipeline
