---
slug: request-validation-and-transformation
title: "Request Validation and Transformation"
applies-to: [re-api-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 190
---

## 9. Request Validation and Transformation

### 9.1 Validation Approach

- **Library:** [e.g., "class-validator + class-transformer", "Zod", "Joi", "FluentValidation"]
- **Where validation runs:** [e.g., "Global validation pipe applied to all routes. DTOs are validated automatically."]

### 9.2 Writing a Request DTO with Validation

```typescript
// Complete example: a DTO with multiple validation rules, demonstrating:
// - Required fields
// - Optional fields with defaults
// - Type coercion (string → number for query params)
// - Nested objects
// - Arrays
// - Custom validation rules
// - Validation error messages
```

### 9.3 Query Parameter DTOs

```typescript
// Example: query params with type coercion, defaults, and pagination
```

### 9.4 Response DTOs / Serialization

<!-- How responses are shaped before being sent to the client. -->

```typescript
// Example: response DTO that excludes internal fields, transforms dates, etc.
```

### 9.5 Custom Validators

```typescript
// Pattern for creating reusable custom validators
```

### 9.6 File Upload Validation

```typescript
// If applicable: how file uploads are validated (size, type, etc.)
```
