---
slug: authentication-and-authorization-internals
title: "Authentication and Authorization Internals"
applies-to: [re-api-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 180
---

## 8. Authentication and Authorization Internals

### 8.1 Authentication Flow

<!-- How the API identifies who is making a request. -->

- **Mechanism:** [e.g., "JWT Bearer token in Authorization header."]
- **Token structure:**

```typescript
// What's inside the JWT / session object after authentication
interface AuthPayload {
  userId: string;
  email: string;
  roles: string[];
  organizationId: string;
  iat: number;
  exp: number;
}
```

- **Where it's set:** [e.g., "AuthMiddleware decodes the token and attaches it to `request.user`."]
- **How to access in code:**

```typescript
// Controller: accessing the current user
```

```typescript
// Service: accessing the current user (if passed through)
```

### 8.2 Authorization Model

<!-- RBAC, ABAC, per-resource, etc. -->

- **Model:** [e.g., "Role-based (RBAC) with per-resource ownership checks."]
- **Roles defined:** [e.g., `admin`, `manager`, `member`, `viewer`]

**Role hierarchy (if applicable):**
```
admin > manager > member > viewer
```

### 8.3 Applying Authorization

```typescript
// Example: protecting a route with role-based access
```

```typescript
// Example: resource-ownership check ("user can only edit their own posts")
```

### 8.4 Internal Service-to-Service Auth

<!-- If applicable — how internal services authenticate with each other. -->

```typescript
// Example: API key, service token, mTLS pattern
```
