# REST API Design Standards

## Purpose

These standards ensure REST APIs across the organization are consistent, predictable, and easy to consume. Uniform resource naming, status codes, pagination, and error formats reduce integration friction, improve developer experience, and make APIs self-documenting regardless of which team built them.

## Applicability

All projects that expose HTTP REST APIs, whether public-facing, internal service-to-service, or BFF (backend-for-frontend). Applies to any language or framework; code examples use TypeScript for illustration.

## Rules

### API-01: Use Plural Nouns for Resource Paths

**Severity:** Error
**Rule:** Resource paths must use plural nouns and must not contain verbs or action words.
**Why:** RESTful URLs model resources as collections; HTTP methods already express the action.

**Compliant:**

```typescript
app.get("/api/v1/orders", listOrders);
app.post("/api/v1/users", createUser);
```

**Non-compliant:**

```typescript
app.get("/api/v1/getOrders", listOrders);
app.post("/api/v1/createUser", createUser);
```

---

### API-02: Use HTTP Methods Correctly

**Severity:** Error
**Rule:** Use GET for reads, POST for creation, PUT for full replacement, PATCH for partial update, and DELETE for removal.
**Why:** Misusing methods breaks cacheability, violates client expectations, and causes subtle bugs with proxies and middleware.

**Compliant:**

```typescript
app.get("/api/v1/orders/:id", getOrder);
app.patch("/api/v1/orders/:id", updateOrderFields);
```

**Non-compliant:**

```typescript
app.post("/api/v1/orders/get", getOrder);
app.post("/api/v1/orders/:id/update", updateOrderFields);
```

---

### API-03: Return Correct HTTP Status Codes

**Severity:** Error
**Rule:** Return the semantically correct status code for every response: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 500 Internal Server Error.
**Why:** Returning 200 with an error body defeats client error handling, retry logic, and monitoring tools.

**Compliant:**

```typescript
if (!order) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Order not found" } });
return res.status(201).json({ data: createdOrder });
```

**Non-compliant:**

```typescript
if (!order) return res.status(200).json({ success: false, message: "Order not found" });
return res.status(200).json({ data: createdOrder, statusCode: 201 });
```

---

### API-04: Version APIs Consistently

**Severity:** Error
**Rule:** Every API must be versioned using either URL path prefixing (`/api/v1/`) or a request header (`Accept: application/vnd.myapp.v1+json`), and the chosen strategy must be consistent across the entire service.
**Why:** Unversioned APIs cannot evolve without breaking consumers; mixing strategies makes routing unpredictable.

**Compliant:**

```typescript
app.use("/api/v1/orders", ordersV1Router);
app.use("/api/v2/orders", ordersV2Router);
```

**Non-compliant:**

```typescript
app.use("/api/v1/orders", ordersV1Router);
app.use("/api/orders", ordersV2Router); // no version prefix
```

---

### API-05: Use Consistent Pagination

**Severity:** Error
**Rule:** Paginated endpoints must return a `meta` object containing `total`, `pageSize`, and either `page`/`totalPages` (offset-based) or `cursor`/`nextCursor` (cursor-based); use cursor-based for real-time or frequently-changing data and offset-based for static or reporting data.
**Why:** Inconsistent pagination forces every consumer to write bespoke paging logic and breaks generic SDK helpers.

**Compliant:**

```typescript
return res.json({
  data: orders,
  meta: { total: 142, page: 2, pageSize: 20, totalPages: 8 },
});
```

**Non-compliant:**

```typescript
return res.json({ orders, count: 142 });
```

---

### API-06: Support Filtering and Sorting via Query Parameters

**Severity:** Warning
**Rule:** Use query parameters for filtering (`?status=active`) and sorting (`?sort=-createdAt` for descending); never use the request body for filtering on GET requests.
**Why:** Query-parameter filtering is cacheable, bookmarkable, and aligns with HTTP semantics; request bodies on GET are unsupported by many clients.

**Compliant:**

```typescript
// GET /api/v1/orders?status=active&sort=-createdAt
const { status, sort } = req.query;
```

**Non-compliant:**

```typescript
// GET /api/v1/orders with body { "filter": { "status": "active" } }
const { filter } = req.body;
```

---

### API-07: Use a Consistent Error Response Format

**Severity:** Error
**Rule:** All error responses must use the envelope `{ error: { code: string, message: string, details?: unknown } }` with the same shape regardless of status code.
**Why:** A uniform error shape lets consumers write a single error-handling path and simplifies SDK generation.

**Compliant:**

```typescript
return res.status(422).json({
  error: { code: "VALIDATION_ERROR", message: "Email is required", details: [{ field: "email" }] },
});
```

**Non-compliant:**

```typescript
return res.status(422).json({ message: "Email is required" });
return res.status(500).json({ err: "Something went wrong" });
```

---

### API-08: Use a Consistent Success Response Envelope

**Severity:** Warning
**Rule:** All success responses must use the envelope `{ data: T, meta?: object }` where `data` is the resource or array of resources and `meta` holds pagination, timing, or other ancillary information.
**Why:** A predictable success shape enables generic client deserialization and keeps resource data separate from metadata.

**Compliant:**

```typescript
return res.json({ data: order, meta: { requestId: "abc-123" } });
```

**Non-compliant:**

```typescript
return res.json(order);
return res.json({ order, requestId: "abc-123" });
```

---

### API-09: Make Unsafe Operations Idempotent

**Severity:** Error
**Rule:** PUT and DELETE must be idempotent by design; POST endpoints that create critical resources (payments, orders) must accept an `Idempotency-Key` header and return the same response for duplicate keys.
**Why:** Network retries are inevitable; non-idempotent mutations cause duplicate records, double charges, and data corruption.

**Compliant:**

```typescript
app.post("/api/v1/payments", async (req, res) => {
  const existing = await findByIdempotencyKey(req.headers["idempotency-key"]);
  if (existing) return res.status(200).json({ data: existing });
  const payment = await createPayment(req.body);
  return res.status(201).json({ data: payment });
});
```

**Non-compliant:**

```typescript
app.post("/api/v1/payments", async (req, res) => {
  const payment = await createPayment(req.body);
  return res.status(201).json({ data: payment });
});
```

---

### API-10: Use Kebab-Case for URL Paths

**Severity:** Warning
**Rule:** All URL path segments must use kebab-case (`/order-items`), not camelCase or snake_case.
**Why:** URLs are case-insensitive by convention and kebab-case is the most readable and widely adopted format for URIs.

**Compliant:**

```typescript
app.get("/api/v1/order-items", listOrderItems);
app.get("/api/v1/user-profiles/:id", getUserProfile);
```

**Non-compliant:**

```typescript
app.get("/api/v1/orderItems", listOrderItems);
app.get("/api/v1/user_profiles/:id", getUserProfile);
```

---

### API-11: Nest Sub-Resources Under Parents (Max 2 Levels)

**Severity:** Warning
**Rule:** Sub-resources must be nested under their parent (`/orders/{id}/items`); nesting must not exceed two levels — deeper relationships should be promoted to top-level resources with query-parameter filters.
**Why:** Shallow nesting keeps URLs readable and routes manageable; deep nesting creates rigid hierarchies that are hard to evolve.

**Compliant:**

```typescript
app.get("/api/v1/orders/:orderId/items", listOrderItems);
app.get("/api/v1/shipments?orderId=123", listShipments); // promoted to top-level
```

**Non-compliant:**

```typescript
app.get("/api/v1/orders/:orderId/items/:itemId/shipments/:shipmentId/tracking", getTracking);
```

---

### API-12: Include Rate Limit Headers

**Severity:** Convention
**Rule:** Rate-limited endpoints must return `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers on every response.
**Why:** Rate limit headers let clients self-throttle, avoid hard failures, and implement backoff without guessing.

**Compliant:**

```typescript
res.set("X-RateLimit-Limit", "100");
res.set("X-RateLimit-Remaining", "57");
res.set("X-RateLimit-Reset", "1713480000");
return res.json({ data: results });
```

**Non-compliant:**

```typescript
return res.status(429).json({ error: { code: "RATE_LIMITED", message: "Too many requests" } });
// no rate limit headers — client has no idea when to retry
```

## Customization

- **API-04 (Versioning strategy):** The most commonly debated rule. URL path versioning (`/api/v1/`) is the default recommendation for its visibility and simplicity, but teams building hypermedia or GraphQL-adjacent APIs may prefer header-based versioning or no versioning with additive evolution. Pick one strategy per organization.
- **API-05 (Cursor vs offset pagination):** Cursor-based pagination is recommended for feeds, event streams, and data that changes frequently. Offset-based pagination is simpler and acceptable for reporting, admin dashboards, and data that is relatively static. Teams should document which style they use and why.
- **API-08 (Success envelope shape):** Some organizations prefer `{ success: boolean, data: T, error?: E }` as a single unified envelope for both success and error responses. This is acceptable as long as it is applied consistently. The key requirement is that every endpoint returns the same top-level shape.
