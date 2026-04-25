# NestJS Backend Design Standards

**Applies to:** NestJS 10+ with TypeScript, using the Express or Fastify HTTP adapter, TypeORM or Prisma for data access, and Passport for authentication. Features gated on specific versions are noted inline (e.g., `@nestjs/swagger` auto-schema generation requires NestJS 10+). For NestJS 9.x projects, the architectural patterns still apply — check decorator/API changes in the migration guide.

These are the baseline standards the AI uses when designing NestJS backend architecture in the solutions package. During Step 3 of the backend design skill, the AI compares existing codebase conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new code should follow the existing pattern or adopt the standard.

These standards operate at the **design level** — they guide architectural decisions about module structure, provider design, error handling, and cross-cutting concerns. They do not prescribe specific TypeScript patterns, decorator parameters, or build configuration. Implementation-level rules are covered separately in the implementation package's framework standards.

---

## 1. Module and Package Structure

### Rules

- Organize by **feature/domain module** — `orders/` contains the controller, service, repository, DTOs, and entities for orders; not `controllers/`, `services/` as top-level directories
- Each feature module is a **NestJS module** (`@Module`) that declares its own controllers, providers, and imports
- **Core module** holds singleton, app-wide providers (guards, interceptors, filters, logging, config) — imported once in `AppModule`
- **Shared module** holds reusable, stateless utilities and DTOs used across features — imported where needed
- **DTOs** (request/response) are separate from entities — never expose ORM entities directly in API responses
- Use **barrel exports** (`index.ts`) at the module level — consumers import from the module, not from internal paths

### Module Structure

```
src/
  orders/
    orders.module.ts           — NestJS module definition
    orders.controller.ts       — REST controller (thin — delegates to service)
    orders.service.ts          — business logic, transactions, rule enforcement
    orders.repository.ts       — data access (or TypeORM repository/Prisma service)
    entities/
      order.entity.ts          — ORM entity
    dto/
      create-order.dto.ts      — inbound DTO with class-validator decorators
      order-response.dto.ts    — outbound DTO
    exceptions/
      order-not-found.exception.ts  — domain-specific exception
    orders.module.spec.ts      — module-level integration test
  refunds/
    refunds.module.ts
    refunds.service.ts
    ...
  common/
    filters/                   — global exception filters
    guards/                    — auth guards
    interceptors/              — logging, transform interceptors
    pipes/                     — validation, transformation pipes
    decorators/                — custom param/method decorators
  config/
    config.module.ts           — @nestjs/config setup
    database.config.ts         — typed config namespace
```

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `controllers/`, `services/`, `repositories/` as top-level directories | Related code scattered; a single feature change touches many directories |
| ORM entity returned directly in controller response | Exposes internal schema, relations, and DB-specific fields to the client |
| Controller contains business logic (validation, DB calls, calculations) | Controller is too fat; logic is untestable without HTTP; move to service |
| Everything in a single `AppModule` | No encapsulation; all providers globally visible; no clear boundaries |
| Importing from internal module paths (`orders/entities/order.entity`) | Tight coupling; barrel exports create a stable public API for the module |

---

## 2. Provider and Service Design

### Rules

- One **service per domain aggregate or bounded context** — `OrdersService` handles orders and their line items, not a separate `OrderItemsService`
- Services are **injectable providers** (`@Injectable()`) — constructor injection via NestJS DI container
- Services accept **DTOs or primitives** as input and return **DTOs or domain objects** — never accept `Request` or `Response` objects
- A service may inject **another service** for cross-domain operations — but never another module's repository directly
- Services are **stateless** — no instance fields that hold request-scoped data; use method parameters or request-scoped providers when needed
- Use **`REQUEST` scope** only when genuinely needed (e.g., tenant context) — it disables singleton optimization and creates a new instance per request

### Dependency Injection

| Scope | When to use | Example |
|-------|-------------|---------|
| `DEFAULT` (singleton) | Stateless services, repositories, config | `OrdersService`, `OrdersRepository` |
| `REQUEST` | Per-request context (tenant, user context) | `TenantContext` holding current tenant from JWT |
| `TRANSIENT` | Stateful utility that needs a fresh instance per injection | Builders, parsers that accumulate state |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Controller method directly calls repository | Skips the service layer; no place for business logic, transactions, or orchestration |
| Service accepts `@Req() request` parameter | Couples service to HTTP; untestable without Express; accept DTOs instead |
| Service with mutable instance state and `DEFAULT` scope | Shared mutable state across requests; race conditions |
| One service per entity (OrdersService, OrderItemsService, OrderStatusService) | Over-fragmented; related operations split; coordination becomes complex |
| `REQUEST`-scoped service used everywhere | Performance overhead; NestJS creates new instance per request; use only when needed |

---

## 3. Data Access and Repository Design

### Rules

- Encapsulate data access in a **repository provider** or use the ORM's built-in repository pattern (TypeORM custom repository, Prisma service)
- Use **TypeORM query builder** or **Prisma client** for complex queries — never concatenate raw SQL strings
- **Pagination** uses `skip/take` (or `limit/offset`) and returns paginated DTOs — never load unbounded result sets
- **Eager/lazy relation loading** is explicit — specify which relations to load per query; don't rely on default eager loading
- **Transactions** are managed explicitly — use TypeORM `DataSource.transaction()`, Prisma `$transaction()`, or NestJS interceptors

### Query Design

| Query type | Approach |
|-----------|----------|
| Simple lookup by ID or field | Repository `findOne` / `findBy` with typed criteria |
| Complex filter + join | Query builder (TypeORM) or Prisma `include` + `where` |
| Aggregation / reporting | Query builder with `select`, `groupBy`, `getRawMany` / Prisma `groupBy` |
| Dynamic filter (optional criteria) | Conditionally build the query — `if (filter.status) qb.andWhere(...)` |
| Bulk update | Query builder `update().set().where()` / Prisma `updateMany` |
| Raw SQL (performance-critical) | `DataSource.query()` or `prisma.$queryRaw` — last resort |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Loading full entities with all relations for list views | Wastes memory; select only needed fields/relations |
| `find()` without pagination | Unbounded result set; memory issues on large tables |
| String concatenation for SQL | Injection risk; bypasses parameter binding |
| Business logic in repository (calculations, validations) | Repository is for data access only; logic belongs in service |
| No explicit transaction for multi-step mutations | Partial writes if one step fails; use explicit transaction blocks |

---

## 4. Error Handling

### Rules

- Define a **typed exception hierarchy** extending `HttpException` — each maps to a specific HTTP status
- Use a **global exception filter** (`@Catch()` on `AllExceptionsFilter`) that catches all exceptions and maps them to a consistent response envelope
- **Operational errors** (validation, not found, business rules) return structured error responses — never stack traces
- **Programming errors** (TypeError, unhandled rejection) are caught by the global filter and return generic 500 — full details logged server-side
- Use **`class-validator`** and **`ValidationPipe`** for DTO validation — validation failures automatically return 400 with field-level errors
- Never **catch and swallow exceptions** — either handle meaningfully or let them propagate to the global filter

### Exception Hierarchy

| Exception | HTTP Status | When thrown |
|-----------|------------|------------|
| `BadRequestException` | 400 | Malformed request (beyond DTO validation) |
| `UnauthorizedException` | 401 | Missing or invalid authentication |
| `ForbiddenException` | 403 | Authenticated but not authorized |
| `NotFoundException` | 404 | Entity not found by ID |
| `ConflictException` | 409 | Duplicate entry, optimistic lock failure |
| `UnprocessableEntityException` | 422 | Business rule violated |
| `BadGatewayException` | 502 | Downstream service call failed |
| `InternalServerErrorException` | 500 | Unexpected internal failure |

### Consistent Error Response

```json
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": "Order is not eligible for refund — delivery was more than 30 days ago.",
  "timestamp": "2025-01-15T10:30:00Z",
  "path": "/api/v1/orders/abc-123/refunds",
  "traceId": "req-456-789"
}
```

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Returning stack traces in API responses | Security risk; leaks internal structure |
| `try/catch` that catches an error and returns `null` | Swallows the error; caller doesn't know something failed |
| Error handling in individual controller methods instead of global filter | Inconsistent formatting; duplication; use global filter |
| Generic `throw new Error("something went wrong")` | No HTTP status mapping; global filter defaults to 500 |

---

## 5. Validation and Pipes

### Rules

- Use **`class-validator`** decorators on DTOs for declarative validation — `@IsString()`, `@IsNotEmpty()`, `@IsEmail()`, `@Min()`, etc.
- Enable **`ValidationPipe`** globally in `main.ts` with `whitelist: true` (strips unknown properties), `forbidNonWhitelisted: true` (rejects unknown properties), and `transform: true` (auto-transforms payloads to DTO instances)
- **Custom validation** (business rules that depend on DB state) belongs in the service layer — not in validators or pipes
- **Transformation pipes** (`ParseIntPipe`, `ParseUUIDPipe`) on route parameters — validate at the edge
- **Nested DTO validation** uses `@ValidateNested()` with `@Type()` from `class-transformer`

### Validation Layers

| Layer | What it validates | Mechanism |
|-------|------------------|-----------|
| Controller (pipe) | Request shape, types, formats, required fields | `ValidationPipe` + `class-validator` decorators |
| Service | Business rules, state-dependent checks, cross-field validation | Imperative checks; throws domain exceptions |
| Repository/DB | Constraints, uniqueness, foreign keys | DB constraints; caught and mapped by exception filter |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Manual `if (!body.name) throw new BadRequestException()` for every field | Verbose; unmaintainable; use `class-validator` decorators |
| `whitelist: false` in `ValidationPipe` | Unknown fields pass through; injection risk; mass-assignment vulnerability |
| Business validation in `class-validator` custom decorator that queries DB | Pipe layer shouldn't have DB access; business validation belongs in service |
| No validation — trusting client input | Crashes on unexpected types; SQL injection; data corruption |

---

## 6. Security Design

### Rules

- Use **Passport strategies** (`@nestjs/passport`) for authentication — JWT strategy for stateless APIs, session strategy for web apps
- Implement **guards** (`@UseGuards()`) for authentication and authorization — not middleware
- **Role-based access** uses a custom `RolesGuard` with a `@Roles()` decorator — checks the JWT claims or user object
- **CORS** configured centrally in `main.ts` via `app.enableCors()` — not per-controller
- Use **Helmet** (`@nestjs/helmet` or `helmet` middleware) for security headers — enabled globally
- **Rate limiting** via `@nestjs/throttler` — applied globally or per-route
- The authenticated user is accessed via a **custom decorator** (`@CurrentUser()`) — never by parsing headers in service code

### Security Layer Design

| Layer | Responsibility | Mechanism |
|-------|---------------|-----------|
| Middleware | Helmet headers, CORS | `app.use(helmet())`, `app.enableCors()` |
| Guard (global) | JWT validation, authentication | `JwtAuthGuard` applies to all routes; `@Public()` decorator skips |
| Guard (route-level) | Role/permission check | `@Roles('admin')` + `RolesGuard` |
| Interceptor | Audit logging of authenticated actions | `AuditInterceptor` logs user, action, resource |
| Pipe | Input sanitization | Strip HTML, enforce types |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Auth check via `if (req.headers.authorization)` in controller | Bypasses Passport; no token validation; scattered logic |
| Auth checks inside service methods (`if (user.role !== 'admin')`) | Scattered; use guards and decorators |
| CORS enabled per-controller with `@Header('Access-Control-Allow-Origin', '*')` | Inconsistent; wildcard is insecure; centralize in `main.ts` |
| No rate limiting | API vulnerable to abuse; use `@nestjs/throttler` |

---

## 7. Configuration Management

### Rules

- Use **`@nestjs/config`** with `ConfigModule.forRoot()` — loads `.env` files and environment variables
- Define **typed config namespaces** using `registerAs()` — access via `ConfigService.get<T>()` with type safety
- **Validate** environment variables at startup using `Joi` or `class-validator` schema — fail fast on missing required config
- **Secrets** come from environment variables or a secrets manager — never checked into source control
- **Default values** for non-secret development config — the app should start locally without extra setup

### Configuration Binding

| Config type | Approach |
|------------|----------|
| Structured group (DB, cache, feature settings) | `registerAs('database', () => ({ host: process.env.DB_HOST, ... }))` |
| Single value | `configService.get<string>('APP_NAME', 'my-app')` with default |
| Secret | Environment variable, referenced in config namespace |
| Environment-specific | `.env.development`, `.env.production`, or environment variables set by deployment |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `process.env.DB_HOST` accessed directly in service code | Scattered; no validation; no type safety; use `ConfigService` |
| Secrets in `.env` files committed to git | Exposed in version history; use `.env.example` with placeholders |
| No startup validation of required env vars | App starts but crashes later when the missing config is first accessed |
| Hardcoded connection strings in code | Doesn't change between environments; breaks in production |

---

## 8. Background Processing

### Rules

- Use **`@nestjs/bull`** (or `@nestjs/bullmq`) with Redis for job queues — retryable, persistent, distributed
- Use **`@Cron()`** from `@nestjs/schedule` for time-based jobs — idempotent; in multi-instance deployments, use a distributed lock or leader election
- Use **NestJS events** (`EventEmitter2` from `@nestjs/event-emitter`) for in-process decoupled communication — synchronous by default; async with `@OnEvent({ async: true })`
- Every queue processor and event handler must be **idempotent** — safe to re-run
- **Long-running HTTP requests** should queue work and return `202 Accepted` with a status endpoint — don't block the request

### Background Processing Decision

| Scenario | Mechanism | Rationale |
|----------|-----------|-----------|
| Send email after registration | Bull queue | Retryable; doesn't block registration response; persisted if service restarts |
| Run cleanup every hour | `@Cron('0 * * * *')` | Time-based; add distributed lock for multi-instance |
| Audit log after order update | `EventEmitter2` + `@OnEvent()` | In-process; decoupled; async if non-critical |
| Process file upload (resize, scan) | Bull queue with concurrency control | CPU-intensive; needs backpressure; retryable |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `setTimeout` / `setInterval` for background work | Not persistent; lost on restart; no retry; no monitoring |
| `@Cron` in multi-instance without lock | Job runs N times; duplicate processing |
| Blocking the request for 30+ seconds while processing | Ties up connection; client times out; use queue + polling |
| Fire-and-forget `Promise` without error handling | Unhandled rejection crashes the process in strict mode |

---

## 9. Observability

### Rules

- Use **structured logging** with a logger (NestJS built-in `Logger`, or `pino`/`winston`) — JSON format in production with `traceId`, `userId`, `requestPath` in every entry
- Use **NestJS interceptors** for automatic request/response logging — log method, path, status code, and duration
- Define **health checks** via `@nestjs/terminus` — liveness (is the process running?) and readiness (are dependencies reachable?)
- Use a **correlation ID** — set in middleware at request entry; propagated via `AsyncLocalStorage` or `cls-hooked`; included in all logs and downstream calls
- **Metrics** via Prometheus client (`prom-client`) or OpenTelemetry — counters for business events, histograms for response times

### Health Check Design

| Probe | What it checks | Failure behavior |
|-------|---------------|-----------------|
| Liveness (`/health/live`) | Is the process running? | Restart the container |
| Readiness (`/health/ready`) | DB connected, Redis reachable, critical services up? | Remove from load balancer |
| Custom indicator | Specific downstream service health | Contributes to readiness; logged for alerting |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `console.log` for logging | No structure; no levels; no JSON; no correlation; use NestJS Logger or pino |
| No correlation ID | Cannot trace a request across services or log entries |
| Health endpoint that only returns `{ status: 'ok' }` | Doesn't check dependencies; app reports healthy when DB is down |
| Actuator-style endpoints exposed without auth | Sensitive info accessible publicly; restrict access |

---

## Customization

- **Section 1 (Module Structure — Feature modules):** Feature-based module structure is the default. Very small applications (fewer than 3 domains) may use a flatter structure with fewer modules. Monorepo setups with NestJS libraries (`@nestjs/cli` libraries) should use library modules for shared code. Document the module strategy.

- **Section 2 (Provider Design — REQUEST scope):** `REQUEST` scope is rarely needed — it disables singleton optimization and creates a new instance per request. Use it only for genuinely request-scoped data (e.g., tenant context from JWT). If tenant isolation is handled differently (database-level, middleware), `DEFAULT` scope is sufficient. The design should justify any `REQUEST`-scoped provider.

- **Section 3 (Data Access — TypeORM vs. Prisma):** The ORM choice (TypeORM, Prisma, MikroORM, Drizzle) is a project decision. The design standard requires that data access is encapsulated in a repository pattern regardless of ORM. The specific query API, migration approach, and entity definition style depend on the chosen ORM. Document the ORM choice and its implications for the repository pattern.

- **Section 5 (Validation — class-validator vs. Zod):** `class-validator` with `ValidationPipe` is the NestJS convention. Projects preferring Zod can use a custom `ZodValidationPipe`. The key requirement is that validation happens at the controller boundary with declarative schemas. Document the validation library choice.

- **Section 6 (Security — Passport strategies):** Passport is the default auth approach for NestJS. Projects using custom auth (e.g., direct JWT verification without Passport, or third-party auth services like Auth0/Firebase Auth) should adapt the guard pattern while preserving the principle: auth is enforced via guards, not inline controller checks.

- **Section 8 (Background Processing — Bull vs. alternatives):** Bull/BullMQ with Redis is the default queue recommendation. Projects using other message brokers (RabbitMQ via `@nestjs/microservices`, Kafka, AWS SQS) should adapt the queue design patterns while preserving idempotency and retry requirements. Document the queue infrastructure choice.

- **Section 9 (Observability — Logger choice):** NestJS built-in `Logger` is sufficient for simple applications. Production applications with high throughput should consider `pino` (via `nestjs-pino`) for structured JSON logging with better performance. The design should specify the logger and the log format (JSON vs. text).
