---
slug: request-pipeline-and-middleware
title: "Request Pipeline and Middleware"
applies-to: [re-api-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 140
---

## 4. Request Pipeline and Middleware

### 4.1 Request Lifecycle Overview

<!-- Show how a request flows through the system. -->

```
Incoming HTTP Request
    ↓
[Global Middleware 1: Logging]
    ↓
[Global Middleware 2: Authentication Check]
    ↓
[Route Matching]
    ↓
[Controller Method]
    ↓
[Service Layer]
    ↓
[Repository/Data Access]
    ↓
[Response Built]
    ↓
[Response Middleware]
    ↓
HTTP Response to Client
```

### 4.2 Built-in Middleware

<!-- Document each middleware component. -->

**[Middleware Name]**
- **Purpose:** [What this middleware does]
- **Configuration:** [Config options, if any]
- **Order:** [Runs at position X in the pipeline]
- **Extension:** [Can applications extend or override this?]

[Repeat for each middleware]

### 4.3 Adding Custom Middleware

```typescript
// Example: how to add custom middleware to the pipeline
```

### 4.4 Error Handling Pipeline

<!-- How errors are caught and converted to responses. -->

```
Error thrown in Controller/Service
    ↓
[Global Exception Handler]
    ↓
[Maps exception type to HTTP status code]
    ↓
[Formats error response]
    ↓
[Error Response Middleware (optional)]
    ↓
HTTP Error Response to Client
```

**Built-in Exception Types:**

| Exception Type | HTTP Status | When Thrown |
|---|---|---|
| [e.g., `BadRequestException`] | 400 | [e.g., "Validation fails"] |
| [exception] | [code] | [when] |
