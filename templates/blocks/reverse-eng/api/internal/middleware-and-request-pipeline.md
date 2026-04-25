---
slug: middleware-and-request-pipeline
title: "Middleware and Request Pipeline"
applies-to: [re-api-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 170
---

## 7. Middleware and Request Pipeline

### 7.1 Pipeline Diagram

<!-- The exact order that a request flows through. AI must understand this to know what's available at each stage. -->

```
Client Request
  │
  ▼
[1. Global Middleware]        ← CORS, body parsing, request ID, rate limiting
  │
  ▼
[2. Authentication]           ← JWT verification, session lookup → sets req.user
  │
  ▼
[3. Route Matching]           ← Framework resolves controller + method
  │
  ▼
[4. Guards / Authorization]   ← Role checks, permission checks, resource ownership
  │
  ▼
[5. Validation Pipes]         ← DTO validation, type coercion, sanitization
  │
  ▼
[6. Interceptors (pre)]       ← Logging, timeout, transformation
  │
  ▼
[7. Controller Method]        ← Handler executes → calls Service
  │
  ▼
[8. Interceptors (post)]      ← Response transformation, serialization
  │
  ▼
[9. Exception Filters]        ← Catches any thrown errors → formats error response
  │
  ▼
Client Response
```

### 7.2 Global Middleware

| Order | Middleware                | Purpose                                       | Configuration Location              |
|-------|--------------------------|-----------------------------------------------|-------------------------------------|
| 1     | [e.g., `cors`]           | [CORS handling.]                              | [e.g., `main.ts`]                  |
| 2     | [e.g., `helmet`]         | [Security headers.]                           | [e.g., `main.ts`]                  |
| 3     | [e.g., `requestId`]      | [Attaches UUID to every request.]             | [e.g., `common/middleware/`]        |
| 4     | [e.g., `requestLogger`]  | [Logs method, path, duration.]                | [e.g., `common/middleware/`]        |
| 5     | [e.g., `rateLimiter`]    | [Rate limiting per IP/user.]                  | [e.g., `common/middleware/`]        |
| [n]   | [middleware]              | [purpose]                                     | [location]                          |

### 7.3 How to Add New Middleware

```typescript
// Step-by-step: creating and registering new middleware
```
