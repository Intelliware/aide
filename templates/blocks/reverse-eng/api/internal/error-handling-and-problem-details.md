---
slug: error-handling-and-problem-details
title: "Error Handling and Problem Details"
applies-to: [re-api-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 200
---

## 10. Error Handling and Problem Details

### 10.1 Error Strategy

- **Format:** [e.g., "RFC 7807 Problem Details", "Custom JSON envelope", "Framework default"]
- **Global handler location:** [e.g., `src/common/filters/http-exception.filter.ts`]

### 10.2 Standard Error Response Shape

```json
// The exact JSON shape every error response follows
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    { "field": "email", "message": "must be a valid email address" }
  ],
  "traceId": "abc-123-def"
}
```

### 10.3 Custom Exception Classes

<!-- Every custom exception the codebase uses. AI must throw the RIGHT exception type. -->

| Exception Class                    | HTTP Status | When to Throw                                    |
|------------------------------------|-------------|--------------------------------------------------|
| `NotFoundException`                | 404         | [Entity not found by ID.]                        |
| `BusinessRuleException`           | 422         | [Domain invariant violated.]                     |
| `ConflictException`               | 409         | [Duplicate unique constraint.]                   |
| `ForbiddenException`              | 403         | [Authenticated but not authorized.]              |
| `UnauthorizedException`           | 401         | [No valid authentication.]                       |
| `ValidationException`             | 400         | [Invalid request data — usually auto-thrown.]    |
| `ExternalServiceException`        | 502         | [Third-party integration failure.]               |
| `RateLimitException`              | 429         | [Too many requests.]                             |
| [exception]                        | [status]    | [when]                                           |

### 10.4 Throwing Exceptions — Correct Pattern

```typescript
// Example: throwing the right exception with the right message format
```

```typescript
// Anti-pattern: what NOT to do
```

### 10.5 Error Logging Behavior

<!-- Which errors are logged, at what level, and what context is attached. -->

| Error Type           | Log Level | Additional Context Logged            |
|----------------------|-----------|--------------------------------------|
| 4xx client errors    | `warn`    | [e.g., request path, user ID]        |
| 5xx server errors    | `error`   | [e.g., full stack trace, request body]|
| Unhandled exceptions | `fatal`   | [e.g., everything available]          |

---

# Part 4 — Business Logic
