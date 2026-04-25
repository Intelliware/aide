# Express.js Backend Design Standards

**Applies to:** Express 4.x+ with Node.js 18+ and TypeScript. For Express 5.x (when stable), the patterns remain the same — the key difference is native `async` route handler support (no `express-async-errors` wrapper needed). If the project uses JavaScript instead of TypeScript, the architectural patterns still apply — adapt the type-related guidance accordingly.

These are the baseline standards the AI uses when designing Express.js backend architecture in the solutions package. During Step 3 of the backend design skill, the AI compares existing codebase conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new code should follow the existing pattern or adopt the standard.

These standards operate at the **design level** — they guide architectural decisions about project structure, middleware design, error handling, and cross-cutting concerns. They do not prescribe specific Express API usage, TypeScript configuration, or package manager setup. Implementation-level rules are covered separately in the implementation package's framework standards.

---

## 1. Project Structure

### Rules

- Organize by **feature/domain** — `orders/` contains the router, service, repository, DTOs, and validation for orders; not `routes/`, `controllers/`, `services/` as top-level directories
- Each feature module has a **clear layer stack**: router → controller → service → repository — dependencies flow inward only
- The **domain model** (types, interfaces, value objects) has no dependency on Express — pure TypeScript types
- **DTOs** (request/response types) are separate from database models — never expose ORM models or raw DB rows directly in API responses
- An **`app.ts`** file creates and configures the Express app (middleware, routes) — `server.ts` handles only `app.listen()` and graceful shutdown
- **Index barrel files** export the public API of each feature — consumers import from the module, not internal paths

### Project Structure

```
src/
  orders/
    orders.router.ts           — Express router (route definitions only)
    orders.controller.ts       — request parsing, response formatting (thin)
    orders.service.ts           — business logic, transactions, rule enforcement
    orders.repository.ts        — data access (Knex, Prisma, Sequelize, raw SQL)
    orders.validation.ts        — Zod/Joi schemas for request validation
    orders.types.ts             — DTOs, interfaces for this domain
    orders.errors.ts            — domain-specific error classes
    index.ts                    — barrel export
  refunds/
    refunds.router.ts
    refunds.service.ts
    ...
  common/
    middleware/                  — auth, error handler, request logger, cors
    errors/                      — base error classes, error handler middleware
    types/                       — shared types, pagination, API envelope
    config/                      — typed config loader
    db/                          — database connection, migration config
  app.ts                         — Express app factory (middleware + routes)
  server.ts                      — listen + graceful shutdown
```

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `routes/`, `controllers/`, `services/` as top-level directories | Related code scattered; a single feature change touches many directories |
| DB model/row returned directly in response | Exposes internal schema, nullable fields, and DB-specific types to the client |
| Route handler contains business logic (validation, DB calls, calculations) | Handler is too fat; logic is untestable without HTTP; move to service |
| Single `app.ts` with all routes, middleware, and `app.listen()` | Mixing concerns; can't import the app for testing without starting the server |
| Everything in one flat `src/` with no grouping | No boundaries; all code globally reachable; hard to navigate |

---

## 2. Router and Controller Design

### Rules

- **Routers** define route paths and HTTP methods — they wire together middleware (auth, validation) and call the controller
- **Controllers** are thin — they extract data from `req` (params, query, body), call the service, and format the response; no business logic
- Each router is **mounted** in `app.ts` at its base path — `app.use('/api/v1/orders', ordersRouter)`
- **Async handlers** must be wrapped to catch rejected promises — use `express-async-errors` (patches Express) or a wrapper function; Express 4.x does not catch async rejections by default
- **Response envelope** is consistent — `{ data, meta }` for success; `{ error }` for failures; define this once in a shared utility
- Controllers return **DTOs** — mapping from service output to response shape happens here, not in the service

### Controller Pattern

| Responsibility | Where it belongs | Example |
|---------------|-----------------|---------|
| Define `GET /orders/:id` | Router | `router.get('/:id', authMiddleware, ordersController.getById)` |
| Extract `req.params.id`, call service, return `res.json()` | Controller | `const order = await ordersService.findById(id); res.json({ data: toOrderDto(order) })` |
| Validate business rules, query DB, apply logic | Service | `ordersService.findById(id)` throws `NotFoundError` if missing |
| Query the database | Repository | `ordersRepository.findById(id)` returns entity or null |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Business logic in route handler (`router.get('/', async (req, res) => { /* 50 lines */ })`) | Fat handler; untestable without HTTP; extract to controller + service |
| No async error wrapper in Express 4.x | Unhandled promise rejection crashes the process or silently hangs the request |
| `res.status(200).json()` mixed with `res.status(404).json()` in same handler | Inconsistent response shape; use service exceptions + error handler middleware |
| Controller calls repository directly (skips service) | No place for business rules, caching, or orchestration |
| Response shape varies per endpoint | Inconsistent API; clients can't reliably parse; use a shared envelope |

---

## 3. Service Layer Design

### Rules

- One **service per domain aggregate or bounded context** — `OrdersService` handles orders and their line items, not a separate `OrderItemsService`
- Services accept **plain objects or primitives** as input and return **plain objects or domain types** — never accept `req`/`res` objects
- Services receive dependencies via **constructor injection** or **factory function parameters** — not by importing singletons
- A service may call **another service** for cross-domain operations — but never another domain's repository directly
- Services are **stateless** — no module-level mutable state; use method parameters
- **Transactions** are managed in the service layer — use the ORM's transaction API; never in controllers or repositories

### Dependency Injection in Express

Express has no built-in DI container. Choose one approach and apply it consistently:

| Approach | When to use | Example |
|----------|-------------|---------|
| **Manual constructor injection** | Small-to-medium projects | `new OrdersService(ordersRepo, refundsService)` wired in a composition root |
| **Factory functions** | When services need config or DB connection | `createOrdersService(db, config)` |
| **DI container** (tsyringe, awilix) | Large projects with deep dependency graphs | Container auto-resolves constructor parameters |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Service function accepts `(req, res)` | Coupled to Express; untestable without HTTP mocking |
| Module-level singleton `const service = new OrdersService()` imported directly | Hidden dependency; can't swap for tests; no DI |
| Service calls another domain's repository directly | Breaks domain boundaries; tightly couples unrelated domains |
| `req.app.locals.db` passed through every function | Implicit dependency; hard to trace; use explicit injection |
| Mutable module-level state (`let cache = {}`) | Shared across requests; race conditions; memory leaks |

---

## 4. Middleware Design

### Rules

- Middleware is **ordered intentionally** in `app.ts` — request lifecycle flows: security headers → CORS → body parsing → request logging → auth → routes → error handler
- **Error-handling middleware** is the last middleware — `(err, req, res, next)` signature; catches all thrown/rejected errors
- **Auth middleware** validates the token and attaches the user to `req` (via a typed extension of `Request`) — downstream handlers access `req.user`
- **Validation middleware** runs before the controller — validates `req.body`, `req.query`, `req.params` against a schema (Zod/Joi); returns 400 on failure
- **Third-party middleware** (helmet, cors, compression) is applied globally in `app.ts` — not per-route unless there's a specific reason
- Middleware is **composable** — each middleware does one thing; chain them on routes as needed

### Middleware Order

| Order | Middleware | Responsibility |
|-------|-----------|---------------|
| 1 | `helmet()` | Security headers (XSS, clickjacking, MIME sniffing) |
| 2 | `cors(options)` | CORS handling |
| 3 | `express.json()` | Body parsing |
| 4 | `requestLogger` | Log method, path, correlation ID |
| 5 | `correlationId` | Generate or extract correlation ID; attach to `req` and `res` headers |
| 6 | Route-level: `authenticate` | Validate JWT; attach `req.user` |
| 7 | Route-level: `validate(schema)` | Validate request body/query/params |
| 8 | Route handlers | Controller logic |
| 9 | `notFoundHandler` | Catch unmatched routes; return 404 |
| 10 | `errorHandler` | Global error handler; formats error response |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Error handler defined before routes | Never reached; Express error handlers must come after route definitions |
| Auth middleware applied globally when some routes are public | Health check, login, and public endpoints blocked; use per-route or `unless()` |
| Body parsing middleware after routes | `req.body` is undefined in handlers |
| Validation logic inside the route handler instead of middleware | Duplicated across handlers; not reusable; clutters the handler |
| Error handler that calls `next(err)` without a handler after it | Error falls through; Express default handler sends HTML stack trace |

---

## 5. Error Handling

### Rules

- Define a **typed error hierarchy** with a base `AppError` class — each error type has a `statusCode`, `code` (machine-readable), and `message` (human-readable)
- All errors flow to the **global error handler middleware** — the single place that formats error responses
- **Operational errors** (validation, not found, business rule) return structured JSON — never stack traces
- **Programming errors** (TypeError, ReferenceError) are caught by the global handler and return generic 500 — full details logged server-side
- **Async errors** must be caught — in Express 4.x, wrap async handlers or use `express-async-errors`; unhandled rejections crash the process
- Never **catch and swallow errors** — either handle meaningfully or re-throw

### Error Hierarchy

| Error class | Status | Code | When thrown |
|-------------|--------|------|------------|
| `ValidationError` | 400 | `VALIDATION_ERROR` | Request body fails schema validation |
| `AuthenticationError` | 401 | `AUTHENTICATION_ERROR` | Missing or invalid token |
| `AuthorizationError` | 403 | `AUTHORIZATION_ERROR` | Authenticated but not authorized |
| `NotFoundError` | 404 | `NOT_FOUND` | Entity not found by ID |
| `ConflictError` | 409 | `CONFLICT` | Duplicate entry, optimistic lock failure |
| `BusinessRuleError` | 422 | `BUSINESS_RULE_VIOLATION` | Business rule violated |
| `ExternalServiceError` | 502 | `EXTERNAL_SERVICE_ERROR` | Downstream service call failed |

### Error Response Format

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Order is not eligible for refund — delivery was more than 30 days ago.",
    "status": 422,
    "traceId": "req-456-789",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `res.status(500).json({ message: err.message, stack: err.stack })` | Stack trace exposed to client; security risk |
| `try/catch` that catches and returns `null` or empty response | Swallows the error; client gets wrong data or empty response |
| Each route handler has its own error formatting | Inconsistent error shape; duplication; use global handler |
| No `express-async-errors` and no wrapper for async handlers | Unhandled rejection hangs the request or crashes the process |
| `throw new Error("something went wrong")` without custom error class | No status code; global handler defaults to 500; no machine-readable code |

---

## 6. Validation

### Rules

- Use **Zod**, **Joi**, or **class-validator** for request validation — declarative schemas, not manual `if` checks
- Validation runs in **middleware** before the controller — failed validation returns 400 with field-level errors before any business logic runs
- Validate **all inputs**: `req.body`, `req.query`, `req.params` — each has its own schema
- **Transformation** (trim strings, parse numbers, set defaults) happens during validation — the controller receives clean, typed data
- **Business validation** (rules that depend on DB state) belongs in the service layer — not in validation middleware

### Validation Layers

| Layer | What it validates | Mechanism |
|-------|------------------|-----------|
| Middleware (schema) | Request shape, types, formats, required fields | Zod/Joi schema; returns 400 |
| Service | Business rules, state-dependent checks, cross-field logic | Imperative checks; throws `BusinessRuleError` |
| Database | Constraints, uniqueness, foreign keys | DB constraints; caught and mapped by error handler |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `if (!req.body.name) return res.status(400).json(...)` for every field | Verbose; unmaintainable; use a schema library |
| Validation inside the service layer for request format checks | Too late; service shouldn't parse HTTP input; validate at the edge |
| Business validation in Zod/Joi schema (e.g., "does this user exist?") | Schema layer shouldn't have DB access; business rules belong in service |
| No query parameter validation | Unexpected types cause crashes; `req.query.page` is always a string — parse and validate |

---

## 7. Security Design

### Rules

- Use **Helmet** for security headers — enabled globally as the first middleware
- **CORS** configured centrally in `app.ts` with explicit allowed origins — not `cors({ origin: '*' })` in production
- **JWT authentication** in middleware — validate token, attach user to `req`; downstream code accesses `req.user`
- **Authorization** via middleware or guards — check roles/permissions before the controller runs
- **Rate limiting** via `express-rate-limit` — applied globally and/or per-route for sensitive endpoints (login, registration)
- **Input sanitization** — validation schemas strip unknown fields; no raw `req.body` properties pass through unvalidated
- **Secrets** come from environment variables — never hardcoded; never committed to source control

### Security Middleware Stack

| Order | Middleware | Purpose |
|-------|-----------|---------|
| 1 | `helmet()` | Security headers |
| 2 | `cors({ origin: allowedOrigins })` | CORS with explicit origins |
| 3 | `rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })` | Rate limiting |
| 4 | `express.json({ limit: '10kb' })` | Body parsing with size limit |
| 5 | Route-level: `authenticate` | JWT validation |
| 6 | Route-level: `authorize('admin')` | Role/permission check |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `cors({ origin: '*' })` in production | Any origin can make requests; CSRF-like attacks possible |
| Auth check via `if (req.headers.authorization)` in controller | Duplicated; no token validation; scattered logic; use middleware |
| No request body size limit | Large payloads can crash the server; set `express.json({ limit: '10kb' })` |
| Secrets hardcoded: `const JWT_SECRET = 'my-secret-key'` | Exposed in source control; use `process.env.JWT_SECRET` |
| No rate limiting on login/registration | Brute-force and credential stuffing attacks possible |

---

## 8. Configuration Management

### Rules

- Load configuration in a **single module** (`config/index.ts`) — reads from `process.env`, validates, and exports a typed config object
- **Validate all required config at startup** — fail fast with a clear error message if a required variable is missing; use Zod or Joi to validate the env schema
- **Secrets** come from environment variables or a secrets manager — never committed; use `.env` locally with `dotenv` (loaded only in development); `.env.example` committed with placeholder values
- **Typed config** — export a frozen config object with typed properties; consumers import the config object, never access `process.env` directly
- **Default values** for non-secret development config — the app should start locally with minimal setup

### Configuration Pattern

| Config type | Approach |
|------------|----------|
| Structured config | `configSchema.parse(process.env)` → typed, validated config object |
| Secret | Environment variable; loaded by deployment platform (not `.env` in production) |
| Environment-specific | Different environment variables per deployment; same code |
| Feature flag | Config property with boolean default; overridden by env var |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `process.env.DB_HOST` accessed directly in service code | Scattered; unvalidated; no type safety; use centralized config |
| `.env` file committed with real secrets | Exposed in version history; use `.env.example` with placeholders |
| No startup validation | App starts but crashes later when the missing config is first accessed |
| Hardcoded `'mongodb://localhost:27017/mydb'` in code | Doesn't change between environments; breaks in production |
| Different config loading in different modules | Inconsistent; some read env vars, some read config files; centralize |

---

## 9. Observability

### Rules

- Use **structured logging** (JSON) with a library (pino, winston) — include `traceId`, `userId`, `method`, `path`, and `duration` in every entry
- **Request logging** via middleware — log every request start and completion with timing
- **Correlation ID** generated or extracted in middleware — set on `req`, propagated to services, included in all logs and downstream calls
- Define **health check endpoints** — `/health/live` (is the process running?) and `/health/ready` (are dependencies reachable?)
- **Graceful shutdown** in `server.ts` — on `SIGTERM`/`SIGINT`, stop accepting new connections, finish in-flight requests, close DB connections, then exit
- **Metrics** via Prometheus client (`prom-client`) — counters for business events, histograms for response times, gauges for active connections

### Health Check Design

| Probe | What it checks | Failure behavior |
|-------|---------------|-----------------|
| Liveness (`/health/live`) | Is the process running and responding? | Restart the container |
| Readiness (`/health/ready`) | DB connected, cache reachable, critical services up? | Remove from load balancer |

### Graceful Shutdown Pattern

| Step | Action |
|------|--------|
| 1 | Receive `SIGTERM` |
| 2 | Stop accepting new connections (`server.close()`) |
| 3 | Wait for in-flight requests to complete (with timeout) |
| 4 | Close DB connection pool |
| 5 | Close cache connections |
| 6 | Exit process |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `console.log` for logging | No structure; no levels; no JSON; no correlation; use pino or winston |
| No correlation ID | Cannot trace a request across services or log entries |
| Health endpoint returns `res.send('OK')` without checking DB | Reports healthy when database is down |
| No graceful shutdown — `process.exit(0)` immediately | In-flight requests dropped; DB connections leaked; data loss |
| Logging sensitive data (passwords, tokens, PII) in request logs | Compliance violation; use redaction |

---

## Customization

- **Section 1 (Project Structure — Feature vs. Layer):** Feature-based structure (`orders/`, `refunds/`) is the default. Very small Express applications (fewer than 3 routes) may use a flatter structure (a single `routes.ts` and `services.ts`). The key principle is that the chosen structure scales with the application. Document the structure choice and the criteria for when to split into feature modules.

- **Section 3 (Service Layer — DI approach):** Express has no built-in DI container. The standard lists three approaches: manual constructor injection, factory functions, and DI containers (tsyringe, awilix). For small projects, manual wiring in a composition root is sufficient. For large projects with deep dependency graphs, a DI container reduces boilerplate. The design should choose one approach and apply it consistently.

- **Section 4 (Middleware — Async error handling):** In Express 4.x, async errors must be explicitly caught. `express-async-errors` patches Express globally. Alternatively, a wrapper function (e.g., `asyncHandler`) can wrap individual handlers. Express 5.x (when stable) handles async errors natively. The design should specify the Express version and the chosen async error strategy.

- **Section 5 (Error Handling — Error hierarchy):** The typed error hierarchy (`AppError` → `NotFoundError`, `ValidationError`, etc.) is the recommended pattern. Projects using a different error structure (e.g., error codes without class hierarchy, or a library like `http-errors`) should adapt the error handler middleware accordingly. The key requirement is that errors are classified and the response format is consistent.

- **Section 6 (Validation — Zod vs. Joi vs. class-validator):** The validation library choice is a project decision. Zod is recommended for TypeScript-first projects (infers types from schemas). Joi is established with a larger ecosystem. `class-validator` pairs well with class-based DTOs. The design should document the chosen library and apply it consistently.

- **Section 8 (Configuration — Startup validation):** The standard requires validating all required env vars at startup. For development environments with many optional services, teams may relax this to validate only critical config at startup and defer optional config validation to first use. Document which config is critical vs. optional.

- **Section 9 (Observability — Logger choice):** `pino` is recommended for performance-sensitive applications (JSON logging with minimal overhead). `winston` is acceptable for applications that need flexible transports (file, console, external services). The design should specify the logger, format (JSON vs. text), and log levels per environment.
