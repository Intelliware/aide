# REST API Design Standards

These are the baseline standards the AI uses when designing REST API contracts. During Step 3 of the API design skill, the AI compares existing codebase conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new endpoints should follow the existing pattern or adopt the standard.

These standards are technology-agnostic. They apply regardless of framework (Spring Boot, Express, Django, etc.).

---

## 1. URL Structure

### Rules

- Resources are **plural nouns**, **lowercase**, **kebab-case**
- No verbs in resource URLs — use HTTP methods for actions
- Nest sub-resources to express ownership (max 2 levels deep)
- Use query parameters for filtering, not URL path segments

### Correct

```
GET    /api/v1/users
GET    /api/v1/users/{id}
POST   /api/v1/users
PUT    /api/v1/users/{id}
PATCH  /api/v1/users/{id}
DELETE /api/v1/users/{id}

GET    /api/v1/users/{id}/orders          # sub-resource
POST   /api/v1/users/{id}/orders

GET    /api/v1/team-members               # kebab-case for multi-word
GET    /api/v1/orders?status=active        # query params for filtering
```

### Incorrect

```
/api/v1/getUsers                 # verb in URL
/api/v1/user                    # singular resource name
/api/v1/team_members             # snake_case in URLs
/api/v1/users/123/getOrders      # verb in nested resource
/api/v1/users/123/orders/456/items/789/details   # too deeply nested
```

### Actions That Don't Map to CRUD

For operations that don't map cleanly to CRUD, use a verb as a sub-resource (sparingly):

```
POST   /api/v1/orders/{id}/cancel
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/reports/{id}/export
```

---

## 2. HTTP Methods

| Method | Idempotent | Safe | Use For | Request Body |
|--------|-----------|------|---------|-------------|
| GET | Yes | Yes | Retrieve resource(s) | No |
| POST | No | No | Create a resource or trigger an action | Yes |
| PUT | Yes | No | Full replacement of a resource | Yes |
| PATCH | No* | No | Partial update of a resource | Yes |
| DELETE | Yes | No | Remove a resource | No (typically) |

*PATCH can be made idempotent with proper implementation.

**Rules:**
- GET must never modify state
- POST is for creation (returns 201) or actions (returns 200)
- PUT replaces the entire resource — all fields must be provided
- PATCH updates only the fields provided — omitted fields are unchanged
- DELETE is idempotent — deleting an already-deleted resource returns 204 or 404 (choose one and be consistent)

---

## 3. HTTP Status Codes

### Success

| Code | When to Use | Notes |
|------|------------|-------|
| 200 OK | GET, PUT, PATCH with response body | Standard success |
| 201 Created | POST that creates a resource | Include `Location` header with URL of created resource |
| 204 No Content | DELETE, PUT/PATCH with no response body | No body in response |

### Client Errors

| Code | When to Use | Notes |
|------|------------|-------|
| 400 Bad Request | Malformed JSON, invalid syntax | Request cannot be parsed |
| 401 Unauthorized | Missing or invalid authentication | Token missing, expired, or invalid |
| 403 Forbidden | Authenticated but not authorized | User lacks permission for this operation |
| 404 Not Found | Resource does not exist | Also use for resources the user isn't allowed to know exist |
| 409 Conflict | Duplicate entry, state conflict | e.g., email already registered, concurrent update conflict |
| 422 Unprocessable Entity | Valid JSON but semantically invalid | e.g., business rule violation, field validation failure |
| 429 Too Many Requests | Rate limit exceeded | Include `Retry-After` header |

### Server Errors

| Code | When to Use | Notes |
|------|------------|-------|
| 500 Internal Server Error | Unexpected failure | Never expose stack traces, SQL errors, or internal details |
| 502 Bad Gateway | Upstream service failed | When proxying to another service that returned an error |
| 503 Service Unavailable | Temporary overload or maintenance | Include `Retry-After` header |

### Common Mistakes to Avoid

- **200 for everything** — Do not return `{ "status": 200, "success": false, "error": "Not found" }`. Use HTTP status codes semantically.
- **500 for validation errors** — Validation failures are client errors (400 or 422), not server errors.
- **200 for created resources** — Use 201 with a `Location` header.
- **Inconsistent 404 vs 403** — If exposing whether a resource exists is a security concern, always return 404 for both "doesn't exist" and "no access".

---

## 4. Response Format

### Single Resource (Success)

```json
{
  "data": {
    "id": "abc-123",
    "email": "alice@example.com",
    "name": "Alice",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Collection (Success with Pagination)

```json
{
  "data": [
    { "id": "abc-123", "name": "Alice" },
    { "id": "def-456", "name": "Bob" }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "per_page": 20,
    "total_pages": 8
  },
  "links": {
    "self": "/api/v1/users?page=1&per_page=20",
    "next": "/api/v1/users?page=2&per_page=20",
    "last": "/api/v1/users?page=8&per_page=20"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "code": "invalid_format"
      },
      {
        "field": "age",
        "message": "Must be between 0 and 150",
        "code": "out_of_range"
      }
    ]
  }
}
```

### Response Format Rules

- Wrap single resources and collections in a `data` key (envelope pattern)
- Collections include `meta` for pagination and `links` for navigation
- Errors use an `error` key with `code` (machine-readable), `message` (human-readable), and optional `details` (field-level errors)
- Never mix success and error shapes — a response is either a `data` response or an `error` response, never both
- All timestamps use **ISO 8601** format in UTC (`2025-01-15T10:30:00Z`)
- IDs should be **opaque strings** (UUIDs preferred over auto-increment integers in APIs)

### Response Envelope Variants

The envelope pattern (`{ "data": ... }`) is recommended for public APIs. For internal APIs, flat responses (returning the resource directly without a wrapper) are acceptable if the team prefers simplicity — but the choice must be consistent across all endpoints.

---

## 5. Pagination

### Offset-Based

```
GET /api/v1/users?page=2&per_page=20
```

**When to use:** Admin dashboards, small datasets (<10K records), search results where users expect page numbers.

**Pros:** Easy to implement, supports "jump to page N".
**Cons:** Slow on large offsets, inconsistent with concurrent inserts/deletes.

### Cursor-Based

```
GET /api/v1/users?cursor=eyJpZCI6MTIzfQ&limit=20
```

```json
{
  "data": [...],
  "meta": {
    "has_next": true,
    "next_cursor": "eyJpZCI6MTQzfQ"
  }
}
```

**When to use:** Infinite scroll, feeds, large datasets, public APIs.

**Pros:** Consistent performance regardless of position, stable with concurrent changes.
**Cons:** Cannot jump to arbitrary page, cursor is opaque.

### Decision Matrix

| Scenario | Recommended |
|----------|------------|
| Admin dashboards, small datasets (<10K) | Offset |
| Infinite scroll, feeds, large datasets | Cursor |
| Public APIs | Cursor (default), offset (optional) |
| Search results | Offset (users expect page numbers) |

### Rules

- Every collection endpoint must be paginated — no unbounded lists
- Default page size should be reasonable (10–50, not 100+)
- Maximum page size must be enforced (e.g., `per_page` capped at 100)
- The pagination style must be consistent across all collection endpoints

---

## 6. Filtering, Sorting, and Search

### Filtering

```
# Simple equality
GET /api/v1/orders?status=active&customer_id=abc-123

# Comparison operators (bracket notation)
GET /api/v1/products?price[gte]=10&price[lte]=100
GET /api/v1/orders?created_at[after]=2025-01-01

# Multiple values (comma-separated for OR)
GET /api/v1/products?category=electronics,clothing
```

### Sorting

```
# Single field (prefix - for descending)
GET /api/v1/products?sort=-created_at

# Multiple fields (comma-separated, applied in order)
GET /api/v1/products?sort=-featured,price,-created_at
```

### Search

```
# Full-text search
GET /api/v1/products?q=wireless+headphones
```

### Sparse Fieldsets

```
# Return only specified fields (reduces payload)
GET /api/v1/users?fields=id,name,email
```

### Rules

- Filter parameter names match the resource field names
- Use bracket notation for comparison operators, not custom prefixes
- Sorting uses a single `sort` parameter with comma-separated fields
- Search uses `q` as the search parameter name
- Invalid filter/sort fields should return 400 with a message, not be silently ignored

---

## 7. Error Handling

### Standard Error Format

Every error response must use this structure:

```json
{
  "error": {
    "code": "string — machine-readable error code (snake_case)",
    "message": "string — human-readable description",
    "details": "array (optional) — field-level errors for validation"
  }
}
```

### Error Code Conventions

Error codes are **snake_case**, **stable** (never renamed), and **documented**:

| Code | HTTP Status | Meaning |
|------|-----------|---------|
| `validation_error` | 400 / 422 | Request body failed validation |
| `invalid_format` | 400 | Malformed request (bad JSON, wrong content type) |
| `not_found` | 404 | Resource does not exist |
| `already_exists` | 409 | Duplicate entry |
| `conflict` | 409 | State conflict (concurrent modification) |
| `unauthorized` | 401 | Missing or invalid authentication |
| `forbidden` | 403 | Authenticated but not authorized |
| `rate_limit_exceeded` | 429 | Too many requests |
| `internal_error` | 500 | Unexpected server failure |

### Rules

- Never expose internal details (stack traces, SQL errors, internal service names) in error responses
- Use the same error format for all endpoints — no endpoint-specific error shapes
- Validation errors include field-level `details` so the client can highlight specific fields
- Error codes are stable identifiers — clients may use them for programmatic error handling
- 500 errors should be logged server-side with full detail but return a generic message to the client

---

## 8. Authentication and Authorization

### Standard Pattern

```
Authorization: Bearer <token>
```

- Use the `Authorization` header with `Bearer` scheme for token-based auth
- For API keys (server-to-server), use a custom header: `X-API-Key: <key>`
- Never pass tokens in query parameters (they appear in logs and browser history)

### Authorization Rules

- **Resource ownership** — users can only access their own resources unless they have an elevated role
- **Role-based access** — document which roles can access each endpoint
- **Consistent enforcement** — every endpoint is either explicitly public or requires authentication; no endpoint is accidentally unprotected
- If an authenticated user requests a resource they don't own, return 403 (or 404 if the existence of the resource is sensitive)

---

## 9. Rate Limiting

### Headers

All rate-limited endpoints should return these headers:

```
X-RateLimit-Limit: 100          # max requests per window
X-RateLimit-Remaining: 95       # remaining in current window
X-RateLimit-Reset: 1640000000   # Unix timestamp when window resets
```

When exceeded:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

### Standard Tiers

| Tier | Limit | Window | Use Case |
|------|-------|--------|----------|
| Anonymous | 30/min | Per IP | Public endpoints |
| Authenticated | 100/min | Per user | Standard API access |
| Premium | 1000/min | Per API key | High-volume integrations |
| Internal | 10000/min | Per service | Service-to-service |

---

## 10. Versioning

### Recommended: URL Path Versioning

```
/api/v1/users
/api/v2/users
```

### Rules

- Start with `/api/v1/` — don't version until you need to
- Maintain at most 2 active versions (current + previous)
- **Non-breaking changes** do not require a new version:
  - Adding new fields to responses
  - Adding new optional query parameters
  - Adding new endpoints
- **Breaking changes** require a new version:
  - Removing or renaming response fields
  - Changing field types
  - Changing URL structure
  - Changing authentication method
  - Making a previously optional field required

### Deprecation Process

1. Announce deprecation with a timeline (6 months for public APIs, less for internal)
2. Add `Sunset` header to deprecated version: `Sunset: Sat, 01 Jan 2027 00:00:00 GMT`
3. Add `Deprecation` header: `Deprecation: true`
4. Log usage of deprecated version to track migration progress
5. Return `410 Gone` after the sunset date

---

## 11. Request Validation

### Rules

- Validate all input with a schema validator (e.g., Zod, Pydantic, Bean Validation, Joi)
- Reject requests with unknown/extra fields (unless the API explicitly allows extensions)
- Return 422 with field-level errors for validation failures
- Apply constraints: min/max length, allowed values, format (email, URL, UUID), required vs optional
- Validate path parameters and query parameters, not just the request body

---

## 12. General Rules

- **Consistency** — once a pattern is established (naming, response shape, error format, pagination), every endpoint follows it. No exceptions.
- **Idempotency** — PUT and DELETE must be idempotent. Consider supporting `Idempotency-Key` header for POST operations that must not be duplicated (e.g., payment processing).
- **HATEOAS (optional)** — for discoverable APIs, include `links` in responses pointing to related resources and actions. Not required for internal APIs.
- **Content negotiation** — always set `Content-Type: application/json`. Accept `application/json` in requests. Return 415 Unsupported Media Type for other content types (unless the API explicitly supports them).
- **CORS** — for browser-consumed APIs, configure CORS headers explicitly. Don't use `Access-Control-Allow-Origin: *` in production with authenticated endpoints.

---

## API Design Checklist

Before finalizing a new REST endpoint design, verify:

- [ ] Resource URL follows naming conventions (plural, kebab-case, no verbs)
- [ ] Correct HTTP method used (GET for reads, POST for creates, etc.)
- [ ] Appropriate status codes returned (not 200 for everything)
- [ ] Input validated with schema (field types, required/optional, constraints)
- [ ] Error responses follow the standard format with codes and messages
- [ ] Pagination implemented for collection endpoints
- [ ] Filtering and sorting follow the standard conventions
- [ ] Authentication required (or explicitly marked as public)
- [ ] Authorization checked (ownership and role-based rules)
- [ ] Rate limiting configured with appropriate tier
- [ ] Response does not leak internal details (stack traces, SQL errors)
- [ ] Consistent naming with existing endpoints
- [ ] Timestamps use ISO 8601 in UTC
- [ ] IDs are opaque strings (UUIDs) in the API layer
