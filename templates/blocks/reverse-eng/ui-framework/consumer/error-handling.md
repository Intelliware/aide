---
slug: error-handling
title: "Error Handling"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 290
---

## 19. Error Handling

### 19.1 Framework Error Types

| Error Class / Code         | When It Occurs                                | How to Handle                          |
|---------------------------|-----------------------------------------------|----------------------------------------|
| `FwConfigError`           | [e.g., "Missing required provider at boot."]  | [e.g., "Check `app.config.ts` setup."]   |
| `FwValidationError`       | [e.g., "Invalid form submission."]            | [e.g., "Display via `fw-error-display`."]|
| `FwHttpError`             | [e.g., "API request failed."]                 | [e.g., "Handled by store; use error template."] |
| `[ErrorClass]`            | [When]                                         | [How]                                  |

### 19.2 Global Error Handler Setup

```typescript
// How to register/configure the framework's global error handler
```

### 19.3 Component-Level Error Handling

```typescript
// Pattern for handling errors within a component
```

```html
<!-- Error display template pattern -->
```

### 19.4 Error Propagation

<!-- How errors flow through the framework: HTTP → Store → Component → UI -->

```
[HTTP Layer] → [Store/Service] → [Component] → [Template]
    │                │                │              │
    │                │                │              └─ <fw-error-display>
    │                │                └─ catchError / error$ stream
    │                └─ FwStore.error$ observable
    └─ Interceptor → FwHttpError → FwErrorHandler
```
