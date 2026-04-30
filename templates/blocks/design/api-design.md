---
slug: api-design
title: "API Design"
applies-to: [greenfield-design-package, brownfield-enhancement-spec]
requires-decision-from: [architect, lead-dev]
optional: true
order-hint: 6
---

<!--
AUTHORING RULE — sub-section acknowledgement

Do not draft this entire block in one pass. The block contains multiple independent items (FRs / rules / endpoints / tables). For each item:

1. State the item heading and one-sentence scope.
2. Draft the item.
3. Present it to the user.
4. Ask: "Approve, change, or skip?"
5. Apply the answer; do not move to the next item until you have one.

Only after every item has its own acknowledgement, mark the block complete in the completeness tracker.
-->

## 6. API Design

<!-- REST API contracts and endpoint specifications. This section defines the external contract that frontend and consumers integrate with. -->

### 6.1 API Overview

- **Base URL:** [e.g., /api]
- **Authentication:** [e.g., Bearer token (Entra ID JWT)]
- **Content Type:** [e.g., application/json]
- **Error Format:** [e.g., RFC 7807 application/problem+json]

### 6.2 API Versioning Strategy

[e.g., URL path versioning (/api/v1/), header versioning, or no versioning for internal APIs.]

### 6.3 Common Response Patterns

#### Success Response
```json
{
  "id": "uuid",
  "field1": "value",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

#### Paginated Response
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 5,
  "page": 0,
  "size": 20
}
```

#### Error Response (RFC 7807)
```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Validation failed",
  "instance": "/api/practitioners",
  "errors": [...]
}
```

### 6.4 Endpoint Specifications

<!-- Document each endpoint by domain area. For each endpoint: method, path, description, auth, request, response, errors. -->

#### [Domain Area, e.g., Practitioners API]

##### [Method] [Path]

**Description:** [What this endpoint does]
**Authorization:** [Required role(s)]
**Implements:** [FR reference(s)]

**Request:**
```json
{
  "field1": "value (required)",
  "field2": "value (optional)"
}
```

**Response (200/201):**
```json
{
  "id": "uuid",
  "field1": "value"
}
```

**Error Responses:**

| Status | Type | When |
|--------|------|------|
| 400 | Validation Error | [e.g., Required field missing] |
| 401 | Unauthorized | [e.g., No/invalid token] |
| 403 | Forbidden | [e.g., Insufficient role] |
| 404 | Not Found | [e.g., Resource doesn't exist] |
| 409 | Conflict | [e.g., Duplicate entry] |

<!-- Repeat for each endpoint in this domain area, then repeat the domain area section for each area. -->
