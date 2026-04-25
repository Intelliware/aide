---
slug: error-handling
title: "Error Handling"
applies-to: [re-api-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 200
---

## 10. Error Handling

### 10.1 Built-in Exception Types

| Exception | HTTP Status | When to Use |
|---|---|---|
| [e.g., `BadRequestException`] | 400 | [e.g., "Validation failures, invalid input"] |
| [exception] | [code] | [usage] |

### 10.2 Throwing and Handling Errors

```typescript
// Example: how to throw errors in controllers and services
```

### 10.3 Global Error Handling

[Document how the framework handles errors, transforms them to HTTP responses]
