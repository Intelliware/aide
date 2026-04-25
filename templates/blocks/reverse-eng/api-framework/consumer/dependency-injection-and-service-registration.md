---
slug: dependency-injection-and-service-registration
title: "Dependency Injection and Service Registration"
applies-to: [re-api-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 160
---

## 6. Dependency Injection and Service Registration

### 6.1 How Dependency Injection Works

<!-- Clear explanation of how DI works in this framework. -->

[Explanation of DI/IoC in this framework]

### 6.2 Service Registration

```typescript
// How to register services in the DI container
```

### 6.3 Service Lifetimes

| Lifetime | Behavior | When to Use |
|---|---|---|
| Singleton | [e.g., "One instance for entire application"] | [e.g., "Configuration, logger, cache"] |
| Transient | [e.g., "New instance for every injection"] | [e.g., "DTOs, temporary objects"] |
| Request-Scoped | [e.g., "One instance per HTTP request"] | [e.g., "Request context, user session"] |

### 6.4 Injecting Services

```typescript
// Example: how to inject dependencies into controllers and services
```

### 6.5 Overriding Default Providers

```typescript
// Example: how to replace a framework-provided service with a custom implementation
```

---

# Part 3 — Business Logic and Data Patterns
