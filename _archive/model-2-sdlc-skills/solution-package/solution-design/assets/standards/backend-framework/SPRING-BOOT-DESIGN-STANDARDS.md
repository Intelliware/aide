# Spring Boot Backend Design Standards

**Applies to:** Spring Boot 3.x+ with Java 17+ or Kotlin, Spring Data JPA/JDBC, and Spring Security. Features gated on specific versions are noted inline (e.g., virtual threads require Java 21+, `ProblemDetail` support requires Spring Boot 3.0+). For Spring Boot 2.x projects, the architectural patterns still apply — adapt to the Jakarta vs. javax namespace difference.

These are the baseline standards the AI uses when designing Spring Boot backend architecture in the solutions package. During Step 3 of the backend design skill, the AI compares existing codebase conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new code should follow the existing pattern or adopt the standard.

These standards operate at the **design level** — they guide architectural decisions about layering, service design, transaction management, error handling, and cross-cutting concerns. They do not prescribe specific code syntax, annotation parameters, or build tool configuration. Implementation-level rules are covered separately in the implementation package's framework standards.

---

## 1. Layering and Package Structure

### Rules

- Organize by **feature/domain**, not by layer — `com.example.orders` contains the controller, service, repository, DTOs, and exceptions for orders; not `com.example.controllers`, `com.example.services`
- Each feature package contains a **clear layer stack**: controller → service → repository — dependencies flow inward only
- The **domain model** (entities, value objects) has no dependency on Spring — pure Java/Kotlin classes with JPA annotations only on the persistence representations
- **DTOs** (request/response) are separate from domain entities — never expose JPA entities directly in API responses
- **Mappers** (entity ↔ DTO) are explicit — use MapStruct or manual mappers; never rely on implicit field-name matching

### Package Structure

```
com.example.app/
  orders/
    OrderController          — REST controller (thin — delegates to service)
    OrderService             — business logic, transactions, rule enforcement
    OrderRepository          — Spring Data interface
    Order                    — JPA entity
    CreateOrderRequest       — inbound DTO
    OrderResponse            — outbound DTO
    OrderMapper              — entity ↔ DTO mapping
    OrderNotFoundException   — domain-specific exception
  refunds/
    RefundController
    RefundService
    ...
  common/
    exception/               — global exception handler, base exceptions
    security/                — security config, auth filters
    config/                  — application config beans
```

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `controllers/`, `services/`, `repositories/` as top-level packages | Related code scattered; a single feature change touches many packages |
| JPA entity returned directly in API response | Exposes internal schema, lazy-loading proxies, and bidirectional relationship cycles to the client |
| Controller contains business logic (validation, calculations, DB calls) | Controller is too fat; logic is untestable without HTTP; move to service |
| Repository injected directly into controller (skipping service layer) | No place for transactions, business rules, or orchestration |

---

## 2. Service Layer Design

### Rules

- One **service per domain aggregate or bounded context** — not one per entity (an `OrderService` handles orders and their line items, not a separate `OrderItemService`)
- Services are the **transaction boundary** — `@Transactional` goes on service methods, never on repositories or controllers
- Services accept **DTOs or primitives** as input and return **DTOs or domain objects** — never accept `HttpServletRequest` or Spring-specific types
- Services receive dependencies via **constructor injection** — Spring auto-wires single-constructor beans; no `@Autowired` on fields
- A service may call **another service** for cross-domain operations — but never call another service's repository directly
- Services are **stateless** — no instance fields that hold request-scoped data; use method parameters

### Transaction Design

| Scenario | `@Transactional` placement | Propagation | Isolation | Rationale |
|----------|---------------------------|-------------|-----------|-----------|
| Single entity create/update | Service method | `REQUIRED` (default) | Default | One unit of work |
| Multi-entity operation (order + items + audit) | Service method | `REQUIRED` | Default | All-or-nothing |
| Read-only query | Service method with `@Transactional(readOnly = true)` | `REQUIRED` | Default | Hints to JPA/DB for optimization |
| Independent side effect (audit log) that must succeed even if parent fails | Separate service method | `REQUIRES_NEW` | Default | Runs in its own transaction |
| Long-running batch | Service method with explicit flush/clear intervals | `REQUIRED` | Default | Prevent OOM from persistence context growth |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `@Transactional` on repository methods | Transaction scope is too narrow; multi-step operations aren't atomic |
| `@Transactional` on controller methods | Holds the transaction open during serialization and HTTP response; too wide |
| `@Autowired` on private fields | Not testable without Spring context or reflection; use constructor injection |
| Service with mutable instance state | Thread-safety issues; Spring beans are singletons by default |
| One service per entity (OrderService, OrderItemService, OrderStatusService) | Over-fragmented; related operations split across services; transaction coordination becomes complex |

---

## 3. Repository and Data Access

### Rules

- Use **Spring Data interfaces** (`JpaRepository`, `CrudRepository`) for standard CRUD — derive queries from method names or `@Query`
- Use **`@Query` with JPQL** for queries that can't be expressed as derived queries — never concatenate query strings
- Use **projections** (interface or DTO projections) for read-heavy queries that don't need full entities — reduces memory and improves performance
- **Pagination** uses `Pageable` and returns `Page<T>` or `Slice<T>` — never load unbounded result sets
- **N+1 prevention**: use `JOIN FETCH` in JPQL, `@EntityGraph`, or projections — never rely on lazy loading in a loop
- Custom repository implementations use the **`{Repository}CustomImpl`** naming convention for Spring Data to auto-detect

### Query Design

| Query type | Approach | Example |
|-----------|----------|---------|
| Simple lookup | Derived query method | `findByStatusAndCreatedAtAfter(Status status, Instant after)` |
| Complex filter + join | `@Query` with JPQL | `@Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.status = :status")` |
| Aggregation / reporting | `@Query` with DTO projection | `@Query("SELECT new OrderSummaryDto(o.status, COUNT(o)) FROM Order o GROUP BY o.status")` |
| Dynamic filter (optional criteria) | Specification or Querydsl predicate | `Specification<Order>` with conditional `and()` clauses |
| Bulk update | `@Modifying @Query` | `@Query("UPDATE Order o SET o.status = :status WHERE o.id IN :ids")` |
| Native SQL (performance-critical) | `@Query(nativeQuery = true)` | Last resort — prefer JPQL for portability |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Loading full entities for read-only list views | Wastes memory; loads unused columns; use projections |
| `findAll()` without pagination | Unbounded result set; OOM on large tables |
| Lazy-loaded collection accessed in a loop outside transaction | `LazyInitializationException`; or N+1 queries if still in transaction |
| String concatenation to build JPQL | SQL injection risk; bypasses parameter binding |
| Business logic in repository (calculation, validation) | Repository is for data access only; logic belongs in service or entity |

---

## 4. Error Handling

### Rules

- Define a **typed exception hierarchy** rooted in a common base exception — each exception type maps to a specific HTTP status
- Use a **`@RestControllerAdvice`** global exception handler that catches all exceptions and maps them to `ProblemDetail` (RFC 9457) responses
- **Operational errors** (validation, not found, business rule) return structured error responses — never stack traces
- **Programming errors** (NPE, ClassCastException) are caught by the global handler and return generic 500 — full details logged server-side
- Never **catch and swallow exceptions** — either handle them meaningfully or let them propagate to the global handler
- **Downstream service failures** throw a specific exception type that includes the downstream service name, so the error handler can log context and return an appropriate error

### Exception Hierarchy

| Exception | HTTP Status | When thrown |
|-----------|------------|------------|
| `ValidationException` | 400 | Request body fails schema validation or business input rules |
| `NotFoundException` | 404 | Entity not found by ID |
| `BusinessRuleException` | 422 | Business rule violated (eligibility, state transition, limits) |
| `ConflictException` | 409 | Duplicate entry, optimistic lock failure, stale data |
| `AuthorizationException` | 403 | Authenticated but not authorized for this operation |
| `ExternalServiceException` | 502 | Downstream service call failed |
| `InternalException` | 500 | Unexpected internal failure (wraps programming errors for logging context) |

### ProblemDetail Response Format (RFC 9457)

```json
{
  "type": "https://api.example.com/errors/business-rule-violation",
  "title": "Business Rule Violation",
  "status": 422,
  "detail": "Order is not eligible for refund — delivery was more than 30 days ago.",
  "instance": "/api/v1/orders/abc-123/refunds",
  "traceId": "req-456-789"
}
```

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Returning stack traces in API responses | Security risk; leaks internal structure |
| Catching `Exception` in service methods and returning `null` | Swallows the error; caller doesn't know something failed |
| Multiple `@ExceptionHandler` methods scattered across controllers | Inconsistent handling; use a single `@RestControllerAdvice` |
| Generic `RuntimeException("something went wrong")` | No error classification; global handler can't map it to a meaningful response |
| Returning `ResponseEntity` with error details directly from service | Service shouldn't know about HTTP; throw exceptions and let the handler map them |

---

## 5. Dependency Injection

### Rules

- **Constructor injection** is the only pattern — no `@Autowired` on fields or setters
- Spring auto-wires **single-constructor beans** without `@Autowired` annotation — keep it clean
- Use **`@Configuration`** classes for third-party bean definitions — not `@Bean` methods scattered in arbitrary classes
- Use **interfaces for services** only when there are genuinely multiple implementations (strategy pattern, test doubles) — don't create interfaces for every service just for the sake of abstraction
- **`@Profile`** for environment-specific beans (dev/test/prod) — not runtime `if` checks on environment variables

### Bean Scope

| Scope | When to use | Example |
|-------|-------------|---------|
| Singleton (default) | Stateless services, repositories, config | `OrderService`, `OrderRepository` |
| Prototype | Stateful objects that need a fresh instance per use | Builders, parsers that accumulate state |
| Request | Request-scoped context (audit context, tenant context) | `RequestContext` holding current user and trace ID |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `@Autowired private OrderRepository repo;` (field injection) | Untestable without Spring context; hidden dependencies; NPE if not injected |
| Interface + implementation for every service (`OrderService` interface + `OrderServiceImpl`) | Unnecessary abstraction when there's only one implementation; adds indirection |
| `@Component` on everything instead of semantic stereotypes | Loses the semantic signal; use `@Service`, `@Repository`, `@Controller` |
| `@Bean` methods in `@Service` or `@Controller` classes | Mixes concerns; bean definitions belong in `@Configuration` classes |

---

## 6. Security Design

### Rules

- Use **Spring Security's filter chain** — define security rules in a `SecurityFilterChain` bean, not by overriding `WebSecurityConfigurerAdapter` (deprecated)
- **Method-level security** (`@PreAuthorize`, `@Secured`) for fine-grained authorization on service methods
- **JWT validation** as a filter in the security chain — extract and validate the token, populate `SecurityContextHolder` with the authenticated principal
- **CORS** configured in the security filter chain — not with `@CrossOrigin` on individual controllers
- **Password encoding** via `PasswordEncoder` bean (BCrypt default) — never store plaintext passwords
- The authenticated user is accessed via `SecurityContextHolder` or injected as a `@AuthenticationPrincipal` method parameter — never parsed from raw headers in service code

### Security Filter Chain Design

| Filter order | Responsibility | Design decision |
|-------------|---------------|----------------|
| 1 | CORS | Allow configured origins, methods, headers |
| 2 | CSRF | Disabled for stateless JWT APIs; enabled for session-based web apps |
| 3 | JWT authentication filter | Extract token from `Authorization` header; validate; populate SecurityContext |
| 4 | Exception translation | Convert Spring Security exceptions to `ProblemDetail` responses |
| 5 | Authorization | `requestMatchers().hasRole()` for endpoint-level; `@PreAuthorize` for method-level |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Security rules in `WebSecurityConfigurerAdapter` | Deprecated in Spring Security 5.7+; removed in 6.0; use `SecurityFilterChain` bean |
| `@CrossOrigin` on individual controllers | Scattered CORS config; easy to miss a controller; centralize in security chain |
| Parsing `Authorization` header manually in service code | Bypasses Spring Security; no token validation; use the filter chain |
| Auth checks via `if (user.getRole().equals("ADMIN"))` in service methods | Fragile; scattered; use `@PreAuthorize("hasRole('ADMIN')")` |

---

## 7. Configuration Management

### Rules

- Use **`application.yml`** (or `.properties`) with **profile-based overrides** (`application-dev.yml`, `application-prod.yml`)
- Externalize **all environment-specific values** — database URLs, API keys, feature flags — never hardcode in Java
- Use **`@ConfigurationProperties`** with a type-safe POJO for structured config groups — not `@Value` for every individual property
- **Secrets** (API keys, database passwords) come from environment variables, a vault (HashiCorp Vault, AWS Secrets Manager), or Spring Cloud Config — never checked into source control
- Define **reasonable defaults** for non-secret configuration — the application should start in dev mode without extra setup

### Configuration Binding

| Config type | Approach | Example |
|------------|----------|---------|
| Structured group (DB, cache, feature settings) | `@ConfigurationProperties(prefix = "app.orders")` bound to a record/class | `app.orders.max-refund-days=30` |
| Single value, rarely used | `@Value("${app.feature.enabled:false}")` with default | Feature toggle |
| Secret | Environment variable or vault, referenced in `application.yml` as `${DB_PASSWORD}` | Never in source control |
| Profile-specific | `application-{profile}.yml` | `application-prod.yml` overrides connection pool size |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Hardcoded `"jdbc:postgresql://localhost:5432/mydb"` in code | Doesn't change between environments; breaks in production |
| `@Value` for 15+ properties in one class | Unstructured; no validation; use `@ConfigurationProperties` |
| Secrets in `application.yml` committed to git | Exposed in version history permanently; use environment variables or vault |
| No default values — app crashes without full config | Friction for developers; local setup requires env vars for everything |

---

## 8. Background Processing

### Rules

- Use **`@Scheduled`** for time-based jobs — with `@SchedulerLock` (ShedLock) for distributed environments to prevent duplicate execution
- Use **`@Async`** for fire-and-forget operations — but configure the thread pool explicitly; never use the default unbounded pool
- Use **Spring Events** (`ApplicationEventPublisher`) for decoupled in-process communication — synchronous by default; make async with `@Async` on the listener
- Use **message queues** (Kafka, RabbitMQ via Spring Cloud Stream) for cross-service async communication — not `@Async`
- Every scheduled job and event listener must be **idempotent** — safe to re-run

### Background Processing Decision

| Scenario | Mechanism | Rationale |
|----------|-----------|-----------|
| Run a cleanup every hour | `@Scheduled(fixedRate = ...)` + ShedLock | Time-based; needs distributed lock to prevent duplicate runs |
| Send notification after order creation | `ApplicationEventPublisher` + `@EventListener` | In-process; decoupled from the order service; async if non-critical |
| Process refund approval across services | Kafka/RabbitMQ message | Cross-service; needs durability and retry; message broker handles delivery |
| Generate a report on demand | `@Async` with a dedicated thread pool | User-triggered; non-blocking; result stored or polled |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `@Scheduled` in a multi-instance deployment without distributed lock | Job runs N times (once per instance); duplicate processing |
| `@Async` with default `SimpleAsyncTaskExecutor` | Creates unbounded threads; no queue; OOM under load |
| `@Async` for cross-service communication | No durability; if the process crashes, the message is lost; use a message broker |
| Blocking the request thread for a long operation | Ties up server threads; use `@Async` or queue the work |

---

## 9. Observability

### Rules

- Use **structured logging** (JSON) with SLF4J/Logback — include `traceId`, `spanId`, `userId`, and `requestPath` in every log entry via MDC
- Use **Spring Boot Actuator** for health checks (`/actuator/health`), metrics (`/actuator/metrics`), and info (`/actuator/info`)
- Define **liveness** (`/actuator/health/liveness`) and **readiness** (`/actuator/health/readiness`) probes — readiness checks downstream dependencies (DB, cache, external services)
- Use **Micrometer** for custom metrics — counters for business events (orders created, refunds processed), timers for operation duration
- **Correlation ID** propagated via MDC — set in a filter at request entry; included in all downstream calls; logged on every line

### Health Check Design

| Probe | What it checks | Failure behavior |
|-------|---------------|-----------------|
| Liveness | Is the JVM running and not deadlocked? | Restart the container |
| Readiness | Can the app serve traffic? (DB connected, cache reachable, required services up) | Remove from load balancer; stop sending traffic |
| Custom indicator (e.g., `orderServiceHealth`) | Is a critical downstream service reachable? | Contributes to readiness; logged for alerting |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Readiness probe that only checks "is the app running" | App serves traffic even when the database is down; use Actuator dependency checks |
| `System.out.println` for logging | No structure, no MDC, no level control; use SLF4J |
| No correlation ID propagation | Cannot trace a request across services or log entries |
| Actuator endpoints exposed without security | Sensitive info (env vars, beans, config) exposed publicly; secure or restrict |

---

## Customization

- **Section 1 (Layering — Feature vs. Layer packaging):** Feature-based packaging (`com.example.orders`) is the default. Very small projects (fewer than 3 features) may use layer-based packaging without significant cost. The key principle is that the chosen structure is applied consistently. Document the structure choice.

- **Section 2 (Service Layer — One service per aggregate):** For simple CRUD domains without complex business logic, a thinner service layer (one service per entity) is acceptable. The aggregate-based boundary becomes critical when entities have cross-entity business rules, state machines, or complex transactions. The design should justify the service boundary decision.

- **Section 4 (Error Handling — ProblemDetail / RFC 9457):** `ProblemDetail` support requires Spring Boot 3.0+. Spring Boot 2.x projects should design a custom error response class that follows the same structure (type, title, status, detail, instance) for forward compatibility. Document the error response format.

- **Section 5 (Dependency Injection — Interfaces for services):** The default is to skip interfaces when there's only one implementation. Teams that mandate interfaces for all services (e.g., for mockability or architectural compliance) may override this rule. The design should document the DI approach and whether interfaces are required for single-implementation services.

- **Section 6 (Security — SecurityFilterChain):** `SecurityFilterChain` bean is the approach for Spring Security 5.7+. Projects on Spring Security 5.6 or earlier must use `WebSecurityConfigurerAdapter`. The design should specify the Spring Security version and the corresponding configuration approach.

- **Section 7 (Configuration — @ConfigurationProperties):** For simple applications with fewer than 10 configuration properties, `@Value` is acceptable. `@ConfigurationProperties` becomes valuable when configuration is structured (nested objects), requires validation, or has many related properties. The design should specify the configuration approach based on complexity.

- **Section 8 (Background Processing — ShedLock):** ShedLock requires a shared data store (database table, Redis, etc.) for distributed locking. Single-instance deployments don't need distributed locks for `@Scheduled` jobs. The design should document the deployment topology and whether distributed locking is needed.

- **Section 9 (Observability — Virtual Threads):** Virtual threads require Java 21+. Projects on Java 17 use platform threads with explicitly configured thread pools. The design should note the Java version and its impact on concurrency design.
