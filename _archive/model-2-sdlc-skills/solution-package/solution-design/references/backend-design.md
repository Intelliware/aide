# Backend Design

## Purpose

Design the backend architecture for the feature — service layer, domain model, and error handling. Consumes: the technology-stack (backend language, framework, ORM, testing tools — all with pinned versions), the system-design (component boundaries and responsibilities), the data-model-design (entities and relationships the backend operates on), the api-design (endpoint contracts the backend implements), the existing-architecture-assessment (existing backend patterns, package structure, dependency injection approach, transaction management, error handling conventions), and the requirements package (functional requirements for capabilities to implement, business rules for validation logic and conditional behavior, data requirements for data contracts, nonfunctional requirements for performance and reliability targets). For brownfield projects, the new backend design follows existing package structure, naming conventions, dependency injection patterns, and error handling approaches unless the technology stack explicitly introduces a deviation. Covers: service layer design (service boundaries, method signatures, transaction scope), domain model (entities, value objects, aggregates if applicable, domain logic placement), repository / data access layer (query patterns, caching strategy, connection management), validation and business rule enforcement (where rules from the business rules catalog are enforced in the backend), error handling (exception hierarchy, error classification, error propagation, mapping to API error responses), background processing (scheduled jobs, async task execution, queue consumers), and cross-cutting concerns (logging integration, authentication/authorization middleware, request context propagation). Produces backend design that is Section 5 of the solution design package.

## What This Produces

The backend architecture for the feature — how server-side code is structured, where business logic lives, how data is accessed and cached, how errors are handled, and how the backend implements the API contracts defined in Section 7. For brownfield projects, the AI extracts existing backend patterns from the codebase and ensures new code follows the same conventions.

This is Section 5 of the solution design package. It implements the API contracts (Section 7), operates on the data model (Section 6), and lives within the component boundaries defined in the system design (Section 3).

## When to Use

- Always included when the feature has server-side logic
- Runs after `api-design` (Step 5) and before `frontend-design` (Step 7)
- May be omitted only if the feature has no backend impact (confirmed in the design workflow's Step 0)

## Inputs

| Input | Source | Required | If discovery was skipped |
|-------|--------|----------|--------------------------|
| System design | `docs/<feature>/solutions-package/design/03-system-design.md` — component boundaries, responsibilities, communication patterns | Yes | Yes |
| Technology stack | `docs/<feature>/solutions-package/design/02-technology-stack.md` — backend language, framework, ORM, testing tools with pinned versions | Yes | Yes |
| Data model design | `docs/<feature>/solutions-package/design/06-data-model-design.md` — entities, relationships, migrations | Yes | Yes |
| API design | `docs/<feature>/solutions-package/design/07-api-design.md` — endpoint/interface contracts the backend must implement | Yes | Yes |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — Section 3 (Tech Stack: backend framework version, DI approach, ORM), Section 5 (Data Architecture: data access patterns, caching layers) | If discovery ran — identifies the technology and data access approach; backend coding conventions (package structure, naming, layering, error handling patterns) are derived from the codebase in Step 2/3 | Identifies conventions from codebase or user input |
| Requirements package — functional requirements | `docs/<feature>/requirements-package/requirements/functional-requirements.md` — capabilities that map to backend services | Yes | Yes |
| Requirements package — business rules | `docs/<feature>/requirements-package/requirements/business-rules.md` — validation logic, conditional behavior, state transitions to enforce | Yes | Yes |
| Requirements package — NFRs | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` — performance targets, reliability requirements | Yes | Yes |
| Access to the codebase | Local filesystem or repository — service files, repository files, middleware, configuration | Yes (brownfield) — the AI reads the actual code to extract existing patterns | Yes if available; otherwise user provides description |

> **Missing input guard:** If the requirements package or any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

## Did Discovery Run?

**Discovery ran** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` exists:

- Read Section 3 (Tech Stack) — backend framework and version, DI approach, ORM, testing tools.
- Read Section 5 (Data Architecture) — data access patterns, caching strategy, connection management.
- These provide architectural context (what framework and data access approach are in use). Discovery does **not** capture backend coding conventions — package structure, naming patterns, layering approach, error handling style, and DI wiring are derived from the codebase in Steps 2 and 3.

**Discovery was skipped:**

- For brownfield projects with codebase access: the AI uses the system design's component map to identify backend services, then reads the codebase directly to extract existing patterns and conventions.
- For brownfield projects without codebase access: ask the user to describe existing backend patterns. Record as `user-stated`.
- For greenfield projects: no existing backend to reference. Design from scratch using the technology stack and standards.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  1. LOAD — Read all inputs                                       │
│     Read system design (component boundaries), technology stack  │
│     (framework, ORM, DI), data model (entities), API design      │
│     (contracts to implement), requirements (business rules,      │
│     NFRs). If discovery ran: read baseline Sections 3, 5.        │
├──────────────────────────────────────────────────────────────────┤
│  2. EXTRACT EXISTING — Read the codebase to extract existing     │
│     backend patterns (Brownfield only)                           │
│     Read service files, repository/DAO files, middleware,        │
│     configuration, DI setup, error handling.                     │
│     Derive: layering approach, naming, DI, transactions,         │
│     error handling, caching, testing patterns.                   │
├──────────────────────────────────────────────────────────────────┤
│  3. CONVENTIONS — Identify existing conventions, compare         │
│     against standards, ask for reference implementation          │
│     Same pattern as API design Step 3: load standards,           │
│     compare, flag deviations, user chooses.                      │
├──────────────────────────────────────────────────────────────────┤
│  4. LAYERING — Define the backend architecture layers            │
│     Controller → Service → Repository, or                        │
│     Ports & Adapters (hexagonal), or existing approach.          │
│     Define boundaries, dependency direction, DI strategy.        │
├──────────────────────────────────────────────────────────────────┤
│  5. SERVICES — Design service layer                              │
│     For each API contract: define which service handles it.      │
│     Service boundaries, method signatures, transaction scope.    │
│     Map business rules to service methods.                       │
├──────────────────────────────────────────────────────────────────┤
│  6. DOMAIN — Design domain model                                 │
│     Entities, value objects, domain logic placement.             │
│     Where business rules are encoded vs. where they're           │
│     enforced procedurally in services.                           │
├──────────────────────────────────────────────────────────────────┤
│  7. DATA ACCESS — Design repository / data access layer          │
│     Query patterns, N+1 prevention, caching strategy,            │
│     connection management, transaction boundaries.               │
├──────────────────────────────────────────────────────────────────┤
│  8. ERROR HANDLING — Design error handling strategy               │
│     Exception hierarchy, error classification (operational       │
│     vs programming), mapping to API error responses,             │
│     retry strategy for downstream calls.                         │
├──────────────────────────────────────────────────────────────────┤
│  9. BACKGROUND — Design background processing                    │
│     Scheduled jobs, async tasks, event consumers,                │
│     queue processing. (Only if the feature needs it)             │
├──────────────────────────────────────────────────────────────────┤
│  10. CROSS-CUTTING — Design cross-cutting concerns               │
│      Logging, auth middleware, request context propagation,      │
│      correlation IDs, health checks.                             │
├──────────────────────────────────────────────────────────────────┤
│  11. IMPLEMENTATION CONSISTENCY — Define patterns that            │
│      prevent conflicts during implementation                     │
│      Naming conventions, file organization, code patterns        │
│      Ensures AI agents write compatible code                     │
├──────────────────────────────────────────────────────────────────┤
│  12. VALIDATE — Check against constraints and conventions        │
│      Every API contract has an implementing service.             │
│      Every business rule has an enforcement point.               │
│      Error handling maps to API error responses.                 │
│      Traceability is complete.                                   │
├──────────────────────────────────────────────────────────────────┤
│  13. ASSEMBLE — Write the backend design section                 │
│      Produce the structured output. Present for review.          │
└──────────────────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Load Inputs

Read all inputs. If the system design, technology stack, data model design, or API design is not yet complete, stop — this skill depends on all four.

From the technology stack (Section 2), note:
- Backend language and version (e.g., Java 21, TypeScript 5.x, Python 3.12)
- Framework and version (e.g., Spring Boot 3.x, NestJS 10.x, Django 5.x, FastAPI)
- ORM / data access (e.g., Prisma, Hibernate, TypeORM, SQLAlchemy, Entity Framework)
- Dependency injection approach (e.g., Spring DI, NestJS providers, manual wiring)
- Testing framework (e.g., JUnit, Jest, pytest)

From the API design (Section 7), note every contract the backend must implement — including REST endpoints, GraphQL resolvers, gRPC service implementations, event producers/consumers, and WebSocket handlers.

**Backend framework design standards:** Based on the backend framework identified in the technology stack, read the corresponding backend framework design standards file before proceeding to Step 2. These standards define the baseline design patterns (layering, service design, DI, data access, error handling, security, configuration, background processing, and observability) that the AI uses when comparing conventions in Step 3 and making design decisions in Steps 4–11.

| Backend Framework | Standards file |
|-------------------|---------------|
| Spring Boot (Java/Kotlin) | `../assets/standards/backend-framework/SPRING-BOOT-DESIGN-STANDARDS.md` |
| NestJS (TypeScript) | `../assets/standards/backend-framework/NESTJS-DESIGN-STANDARDS.md` |
| Express (Node.js/TypeScript) | `../assets/standards/backend-framework/EXPRESS-DESIGN-STANDARDS.md` |
| Framework not listed | No standards file — use the AI's built-in knowledge of the framework's design patterns |

If the framework has a standards file, the AI uses it as the primary reference for recommended patterns in Step 3 — not built-in knowledge alone. Where the standards file and existing codebase conventions differ, the AI flags the deviation and asks the user whether new code should follow the existing pattern or adopt the standard.

**Version compatibility check:** After loading the standards file, compare the **Applies to** version in the standards file against the **actual version** specified in the technology stack (Section 2). If the project's version is older than the standards' baseline version, alert the user:

**"The [framework] design standards are written for [standards version, e.g., Spring Boot 3.x+], but the technology stack specifies [project version, e.g., Spring Boot 2.7.x]. Some standards may reference features unavailable in your version (e.g., `SecurityFilterChain` bean replaces `WebSecurityConfigurerAdapter` in Spring Security 5.7+; `ProblemDetail` requires Spring Boot 3.0+). I'll flag version-gated recommendations as I encounter them and offer alternatives for your version. If you'd like, I can adjust the standards baseline to match your version."**

If the project version is equal to or newer than the standards baseline, no alert is needed — proceed normally.

**Ask for project-specific standards:** After loading any built-in backend framework standards, ask the user:

**"Do you have any project-specific or organization-specific backend design standards I should follow? This could include:**
- **Architecture guidelines** (mandated layering approach, required design patterns, service decomposition rules)
- **Error handling standards** (required error response format, exception taxonomy, logging requirements)
- **Security standards** (required auth patterns, data classification rules, encryption-at-rest/in-transit requirements)
- **Operational standards** (required health check endpoints, structured logging format, metrics/tracing requirements)
- **Code organization standards** (package/directory structure rules, naming conventions, module boundaries)

**If you have standards files, provide the path or link. I'll use them as the highest-priority reference — they override the built-in standards where they conflict.**"

If the user provides project-specific standards:
- Load and read them before proceeding to Step 2
- In Step 3, use them as the **highest-priority** reference: project-specific standards > built-in backend framework standards > AI built-in knowledge
- Note any conflicts between project-specific standards and built-in standards; present the conflict and ask the user which takes precedence

If no project-specific standards exist, proceed with the built-in standards as the primary reference.

### Step 2 — Extract Existing Backend Patterns from the Codebase (Brownfield Only)

Read the codebase to understand how the existing backend is structured.

**What to read:**

| Pattern Area | What to Look For |
|-------------|-----------------|
| **Layering** | Is there a clear controller → service → repository separation? Or is logic mixed across layers? |
| **Service files** | Service class/function structure, method signatures, dependency injection, transaction annotations |
| **Repository / DAO** | How data is accessed — ORM methods, raw queries, query builders. Is there a repository abstraction or direct ORM use? |
| **DI / wiring** | How dependencies are injected — constructor injection, decorator-based, module registration, manual wiring |
| **Error handling** | Exception classes, global error handlers, how exceptions map to API responses |
| **Middleware** | Auth middleware, logging middleware, request context, correlation IDs |
| **Caching** | Cache layer implementation, TTL patterns, cache invalidation approach |
| **Background jobs** | Job scheduling, queue consumer patterns, async processing |
| **Testing** | Test file organization, mocking approach, test helpers, fixture patterns |
| **Configuration** | Environment variables, config files, feature flags |

**Framework-specific guidance:**

| Framework | Key Files to Read |
|-----------|------------------|
| **Spring Boot** | `@Service` classes, `@Repository` interfaces, `@Configuration` beans, `@ControllerAdvice` for errors, `application.yml` |
| **NestJS** | Modules, providers (`@Injectable`), controllers, guards, interceptors, exception filters, `app.module.ts` |
| **Django** | `views.py` / ViewSets, `models.py`, `serializers.py`, `urls.py`, middleware, `settings.py` |
| **Express** | Route handlers, middleware chain, service modules, error handling middleware |
| **FastAPI** | Route functions, dependency injection (`Depends`), Pydantic models, middleware, exception handlers |
| **ASP.NET Core** | Controllers, services (DI via `Startup.cs` / `Program.cs`), DbContext, middleware pipeline, `appsettings.json` |
| **Rails** | Controllers, models (ActiveRecord), concerns, services (`app/services/`), jobs (`app/jobs/`), initializers |

Present the extracted patterns: **"I've read the existing backend code and identified the following patterns. Please confirm these are accurate, and let me know if there are conventions the code doesn't fully reflect."**

### Step 3 — Identify Conventions and Compare Against Standards

Follow the same approach as the API design skill:

**Step 3a — Ask for a reference implementation.** *"Which existing service or module do you consider the best example of how new backend code should be structured? I'll use it as the primary reference."*

**Step 3b — Derive conventions and compare.**

| Convention | Observed Pattern | Recommended | Aligned? | Deviation |
|-----------|-----------------|-------------|----------|-----------|
| **Layering** | *(e.g., controller → service → repository)* | Clear separation of concerns | | |
| **Service boundaries** | *(e.g., one service per domain entity)* | Service per bounded context or aggregate | | |
| **DI approach** | *(e.g., constructor injection)* | Constructor injection (testable) | | |
| **Transaction management** | *(e.g., @Transactional on service methods)* | Transaction at service layer, not repository | | |
| **Error handling** | *(e.g., custom exception classes)* | Typed exception hierarchy with API mapping | | |
| **Naming** | *(e.g., XxxService, XxxRepository)* | Consistent suffixes per layer | | |
| **Testing** | *(e.g., co-located test files)* | Tests mirror source structure | | |
| **Caching** | *(e.g., no caching / Redis cache-aside)* | Cache-aside with explicit TTL and invalidation | | |

For each deviation, ask the user whether new code should follow the existing pattern or adopt the recommended approach.

For greenfield projects, present the recommended patterns and let the user choose.

### Step 4 — Define the Backend Architecture Layers

Based on the technology stack and extracted conventions, define the architecture:

**Option A — Layered Architecture (most common):**

```
Controller / Handler Layer
  ↓ (receives HTTP/gRPC/event, validates input, delegates to service)
Service Layer
  ↓ (orchestrates business logic, manages transactions, enforces rules)
Repository / Data Access Layer
  ↓ (executes queries, maps to/from domain entities)
Database / External Services
```

**Option B — Hexagonal / Ports & Adapters (for complex domains):**

```
Inbound Adapters (HTTP controllers, gRPC handlers, event consumers, CLI)
  ↓ implements
Inbound Ports (use case interfaces / command handlers)
  ↓ calls
Application Layer (use cases — orchestrate domain logic)
  ↓ calls
Outbound Ports (repository interfaces, gateway interfaces)
  ↑ implemented by
Outbound Adapters (database repositories, API clients, message publishers)
```

For each layer, define:
- **Responsibility boundary** — what belongs in this layer, what does not
- **Dependency direction** — which layer can depend on which (always inward)
- **What never crosses the boundary** — e.g., ORM entities never leak into controllers; HTTP request objects never reach the service layer

Present the choice to the user: **"Based on the existing codebase, the project uses [observed approach]. I recommend [same or different] for the new feature. Here's why: [rationale]. What do you prefer?"**

### Step 5 — Design Service Layer

For each API contract from Section 7, define which service handles it and how:

| API Contract | Service | Method | Transaction | Business Rules Applied |
|-------------|---------|--------|-------------|----------------------|
| *(POST /refunds)* | *(RefundService)* | *(createRefund)* | *(Yes — atomic with refund + line items)* | *(BR-01: eligibility check, BR-03: max refund amount)* |
| *(PATCH /refunds/{id}/approve)* | *(RefundService)* | *(approveRefund)* | *(Yes — status update + audit log)* | *(BR-05: only authorized roles)* |
| *(Event: refund.requested → notification)* | *(NotificationService)* | *(onRefundRequested)* | *(No — idempotent side effect)* | *(BR-07: notification preferences)* |

**Service design rules:**
- One service should not call another service's repository directly — go through the service interface
- Transaction boundaries are at the service layer, not the repository layer
- Each service method documents: inputs, outputs, side effects, transaction scope, and which business rules it enforces
- Services receive dependencies via constructor injection — never instantiate dependencies internally

### Step 6 — Design Domain Model

Define how domain entities are represented in the backend code and where business logic lives:

**Entity design:**

| Entity | Domain Logic | Validation Rules | Notes |
|--------|-------------|-----------------|-------|
| *(Refund)* | *(canBeApproved(), calculateTotal(), isEligible())* | *(amount > 0, status transition rules)* | *(Rich domain entity — validates its own state transitions)* |
| *(RefundLineItem)* | *(None — data holder)* | *(quantity ≥ 1, references valid order item)* | *(Value object — immutable once created)* |

**Domain logic placement decisions:**

| Logic Type | Where It Lives | Example |
|-----------|---------------|---------|
| **Entity-level invariants** | In the entity itself | `refund.canBeApproved()` — checks status is PENDING |
| **Cross-entity business rules** | In the service layer | RefundService checks order eligibility before creating refund |
| **Derived calculations** | In the entity or a domain service | `refund.calculateTotal()` — sums line item amounts |
| **External data-dependent rules** | In the service layer (calls repository/gateway) | Check user's refund history count against limit |

**Rules:**
- Domain entities must not depend on framework, ORM, or infrastructure — pure business logic
- Prefer immutable state transitions: methods return a new state rather than mutating in place
- Validation that requires only the entity's own data belongs in the entity
- Validation that requires external data (database lookups, API calls) belongs in the service layer

### Step 7 — Design Data Access Layer

**Repository design:**

For each entity that requires persistence, define the repository interface:

| Repository | Key Methods | Notes |
|-----------|-------------|-------|
| *(RefundRepository)* | *(save, findById, findByOrderId, findByStatus)* | *(Paginated queries use cursor-based pagination per API design)* |

**Query patterns and N+1 prevention:**

| Query | N+1 Risk | Prevention Strategy |
|-------|---------|-------------------|
| *(List refunds with line items)* | *(Yes — loading line items per refund)* | *(Eager load: JOIN fetch or include clause)* |
| *(List refunds with customer)* | *(Yes — loading customer per refund)* | *(Batch load: collect customer IDs, single query)* |

**Caching strategy:**

| Data | Cache? | Strategy | TTL | Invalidation |
|------|--------|----------|-----|-------------|
| *(Refund by ID)* | *(Yes)* | *(Cache-aside: check cache, miss → DB, populate cache)* | *(5 min)* | *(On status change)* |
| *(Refund list by order)* | *(No)* | *(Changes too frequently, stale data is unacceptable)* | *(N/A)* | *(N/A)* |
| *(Order eligibility check)* | *(Yes)* | *(Cache-aside)* | *(1 min)* | *(On order status change)* |

**Connection management:**
- Connection pool configuration (min/max connections, idle timeout)
- Read replicas for read-heavy queries (if applicable)
- Transaction isolation level (default and per-operation overrides if needed)

### Step 8 — Design Error Handling Strategy

**Exception hierarchy:**

Define a typed exception hierarchy that maps cleanly to API error responses:

| Exception | HTTP Status / gRPC Code | When Thrown | Retryable |
|-----------|------------------------|------------|-----------|
| *(ValidationException)* | *(422 / INVALID_ARGUMENT)* | *(Input fails validation — includes field-level details)* | *(No)* |
| *(NotFoundException)* | *(404 / NOT_FOUND)* | *(Entity not found by ID)* | *(No)* |
| *(ConflictException)* | *(409 / ALREADY_EXISTS)* | *(Duplicate entry, concurrent modification)* | *(Maybe — with fresh state)* |
| *(BusinessRuleException)* | *(422 / FAILED_PRECONDITION)* | *(Business rule violated — e.g., refund not eligible)* | *(No)* |
| *(AuthorizationException)* | *(403 / PERMISSION_DENIED)* | *(Authenticated but not authorized)* | *(No)* |
| *(ExternalServiceException)* | *(502 / UNAVAILABLE)* | *(Downstream service failed)* | *(Yes — with backoff)* |
| *(InternalException)* | *(500 / INTERNAL)* | *(Unexpected failure — never expose details to client)* | *(No)* |

**Error classification rules:**
- **Operational errors** (expected failures: validation, not found, auth) — return a structured error response to the client
- **Programming errors** (unexpected: null pointer, type error, unhandled case) — log full details server-side, return generic 500 to client
- All exceptions are caught by a **centralized error handler** (global exception filter / error middleware) that maps exceptions to API error responses using the format from the API design standards

**Retry strategy for downstream calls:**

| Downstream Call | Retryable | Strategy | Max Retries | Backoff |
|----------------|-----------|----------|-------------|---------|
| *(Payment gateway)* | *(Yes — on timeout/5xx)* | *(Exponential backoff with jitter)* | *(3)* | *(1s, 2s, 4s)* |
| *(Notification service)* | *(Yes — on timeout/5xx)* | *(Exponential backoff)* | *(3)* | *(1s, 2s, 4s)* |
| *(Database)* | *(Only on transient connection failures)* | *(Immediate retry once, then fail)* | *(1)* | *(None)* |

**Circuit breaker** (if the feature calls external services that may be unreliable):
- Define which downstream calls get circuit breakers
- Define failure threshold, open duration, and half-open behavior

### Step 9 — Design Background Processing (If Applicable)

Only include this step if the feature requires background processing (scheduled jobs, async tasks, event consumers).

| Job / Task | Trigger | Idempotent | Failure Handling | Concurrency |
|-----------|---------|-----------|------------------|-------------|
| *(Process refund approvals)* | *(Event: refund.approved)* | *(Yes — check current status before processing)* | *(Retry 3x, then DLQ)* | *(1 consumer per partition)* |
| *(Expire pending refunds)* | *(Scheduled: every hour)* | *(Yes — skip already expired)* | *(Log and continue — don't fail batch for one item)* | *(Single instance with distributed lock)* |

**Rules:**
- Every background job must be idempotent
- Scheduled jobs that run on multiple instances must use a distributed lock (or leader election) to prevent duplicate execution
- Event consumers follow the patterns from the Event-Driven Standards (`../assets/standards/api/EVENT-DRIVEN-STANDARDS.md`)

### Step 10 — Design Cross-Cutting Concerns

**Logging:**

| What to Log | Level | Context Fields |
|------------|-------|---------------|
| *(Request received)* | *(INFO)* | *(requestId, method, path, userId)* |
| *(Business rule evaluated)* | *(DEBUG)* | *(requestId, ruleId, result)* |
| *(Downstream call)* | *(INFO)* | *(requestId, service, method, duration, status)* |
| *(Error handled)* | *(ERROR)* | *(requestId, errorType, message, stackTrace — never in response)* |

- Use **structured logging** (JSON) with consistent field names
- Propagate a **correlation ID / request ID** through all layers and downstream calls
- Never log sensitive data (passwords, tokens, PII) — redact before logging

**Authentication / authorization middleware:**
- Where auth is enforced (middleware / guard / interceptor)
- How the authenticated user context is propagated to service methods
- How per-operation authorization checks work (role-based, ownership-based)

**Health checks:**
- Liveness endpoint (is the process running?)
- Readiness endpoint (can it serve traffic? — checks DB connection, cache connection, downstream service availability)

### Step 11 — Implementation Consistency Rules

Define explicit patterns that prevent conflicts during implementation. This ensures that whether the code is written by a human or an AI agent, the result is consistent and compatible.

**Naming conventions:**

| Element | Convention | Example |
|---------|-----------|---------|
| Service classes | `{Entity}Service` | `RefundService` |
| Repository classes | `{Entity}Repository` | `RefundRepository` |
| Controller classes | `{Entity}Controller` | `RefundController` |
| DTOs (input) | `Create{Entity}Dto`, `Update{Entity}Dto` | `CreateRefundDto` |
| DTOs (output) | `{Entity}ResponseDto` | `RefundResponseDto` |
| Exception classes | `{Category}Exception` | `ValidationException` |
| Test files | `{ClassName}.test.ts` or `{ClassName}Test.java` | `RefundService.test.ts` |
| Config files | Lowercase, descriptive | `database.config.ts` |

**File organization — requirements-to-directory mapping:**

Map each feature area to specific directories so the implementation knows exactly where code goes:

| Feature Area | Directory | Contents |
|-------------|-----------|----------|
| *(Refund creation)* | *(src/modules/refunds/)* | *(controller, service, repository, DTOs, tests)* |
| *(Notification on refund)* | *(src/modules/notifications/)* | *(event handler, notification service)* |
| *(Shared auth)* | *(src/common/guards/ or src/middleware/)* | *(auth guard, role decorator)* |

**Code patterns that must be consistent:**

| Area | Pattern | Rationale |
|------|---------|-----------|
| **Dependency injection** | Constructor injection only; no service locator | Testable, explicit dependencies |
| **Validation** | Validate at the boundary (controller/handler), not deep in the service | Fail fast, clear error location |
| **Transaction scope** | `@Transactional` / transaction wrapper at service method level | Consistent unit of work boundary |
| **Error propagation** | Throw typed exceptions; never catch and re-throw as generic Error | Centralized handler can map correctly |
| **Null handling** | Return `null` from repository for "not found"; service converts to NotFoundException | Consistent pattern across all lookups |
| **Date/time** | Use UTC internally; convert to user timezone only in the response layer | No timezone bugs in business logic |

### Step 12 — Validate

Check the completed backend design against:

- **API contracts** — does every API contract from Section 7 have an implementing service method?
- **Business rules** — does every business rule from the requirements have an enforcement point?
- **Data model** — does every repository method align with the entities and relationships in Section 6?
- **Error handling** — does every exception type map to an API error response defined in Section 7?
- **NFRs** — are performance-critical paths identified with caching, query optimization, or indexing?
- **Consistency** — do all new service/repository/controller files follow the naming and organization conventions?
- **Traceability** — does every new or modified backend component trace to a requirement?

### Step 13 — Assemble

Combine all sections into the backend design output. This becomes Section 5 of the solution design package.

### File Output

Write the completed section to `docs/<feature>/solutions-package/design/05-backend-design.md` using the template at `../assets/backend-design-doc.md` as the output structure.

If this section was determined to be not applicable in the design workflow's Step 0, write a stub file containing: **"Not applicable — [rationale from scoping step]."**

---

## Output Structure

### For Brownfield Projects

**1. Existing Backend Patterns** — patterns extracted from the codebase with convention comparison (from Steps 2–3)

**2. Architecture Layers** — the layering approach (controller → service → repository, or hexagonal) with boundary definitions (from Step 4)

**3. Service Layer Design** — service boundaries, method signatures, transaction scope, business rule mapping (from Step 5)

**4. Domain Model** — entities, value objects, domain logic placement (from Step 6)

**5. Data Access Layer** — repository interfaces, query patterns, N+1 prevention, caching strategy (from Step 7)

**6. Error Handling** — exception hierarchy, error classification, API error mapping, retry strategy, circuit breakers (from Step 8)

**7. Background Processing** — scheduled jobs, async tasks, event consumers (from Step 9, if applicable)

**8. Cross-Cutting Concerns** — logging, auth middleware, correlation IDs, health checks (from Step 10)

**9. Implementation Consistency Rules** — naming conventions, file organization, code patterns, requirements-to-directory mapping (from Step 11)

**10. Requirements Traceability** — every new or modified backend component traces to the requirement that drives it

### For Greenfield Projects

Same structure as brownfield, minus the "Existing Backend Patterns" section. The architecture layers and conventions are established from scratch using the technology stack and standards.

---

## Requirements Traceability

Every new or modified backend component must trace to the requirement that drives it. Existing unchanged components carry forward without traceability.

| Component | Type | Change | Requirement ID | Requirement Summary |
|-----------|------|--------|---------------|---------------------|
| *(RefundService.createRefund)* | *(new service method)* | *(new)* | *(FR-01, BR-01, BR-03)* | *(Users can submit refund requests; eligibility check; max amount rule)* |
| *(RefundRepository.findByOrderId)* | *(new repository method)* | *(new)* | *(FR-01)* | *(Need to check existing refunds for the order)* |
| *(Global error handler — add BusinessRuleException)* | *(modified middleware)* | *(modified)* | *(FR-01)* | *(New exception type for refund eligibility failures)* |

If a component cannot be traced to a requirement, it must be flagged and confirmed with the user before inclusion.

---

## Hand-off Gate

Before proceeding to `frontend-design`, you must:

1. Write the completed backend design in full.
2. Present it to the user for review with the following questions:
   - **Existing patterns:** Does the extracted backend pattern analysis match how the codebase actually works?
   - **Architecture layers:** Is the layering approach correct? Are the boundary rules clear?
   - **Service design:** Are the service boundaries right? Are there missing service methods for any API contract?
   - **Domain model:** Is business logic placed correctly — entity vs. service vs. repository?
   - **Data access:** Are the caching decisions appropriate? Are there N+1 risks I've missed?
   - **Error handling:** Is the exception hierarchy complete? Do the API error mappings look right?
   - **Background processing:** Are the job/event consumer designs correct?
   - **Consistency rules:** Are the naming conventions and code patterns ones you'd want enforced?
   - **Traceability:** Is every new component connected to a requirement?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the backend design is accurate.

## Completion Criteria

- [ ] For brownfield: existing backend patterns are extracted from the codebase (service files, repositories, middleware, configuration) and confirmed by the user
- [ ] If the user nominated a reference implementation, it was used as the primary convention source and compared against recommended patterns
- [ ] Architecture layers are defined with clear responsibility boundaries and dependency direction
- [ ] Every API contract from Section 7 has an implementing service method
- [ ] Every business rule from the requirements has an enforcement point (entity, service, or middleware)
- [ ] Domain entities contain business logic that depends only on their own state; external-data-dependent logic is in the service layer
- [ ] Repository interfaces are defined with query methods, N+1 prevention strategies, and caching decisions
- [ ] Error handling hierarchy is defined with mappings to API error responses from Section 7
- [ ] Retry strategy and circuit breakers are defined for downstream service calls
- [ ] If background processing is needed: jobs, event consumers, and async tasks are designed with idempotency
- [ ] Cross-cutting concerns (logging, auth, correlation IDs, health checks) are defined
- [ ] Implementation consistency rules are defined: naming conventions, file organization, code patterns
- [ ] Requirements-to-directory mapping is complete — the implementation knows exactly where each feature's code lives
- [ ] Requirements traceability is complete — every new or modified component traces to a requirement
- [ ] The user has explicitly confirmed the backend design is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Business logic is scattered across controllers, services, and repositories with no clear placement rules | Step 6 explicitly defines where each type of business logic lives (entity, service, or repository) |
| New backend code uses different patterns from existing code (different naming, different layering, different DI approach) | Step 2 extracts existing patterns; Step 3 compares against standards; user chooses the convention for new code |
| Service methods have unclear transaction boundaries — some operations are partially committed on failure | Step 5 defines transaction scope per service method; Step 4 establishes that transactions belong at the service layer |
| N+1 query problems are discovered during load testing, requiring a redesign | Step 7 explicitly identifies N+1 risks per query and defines prevention strategies upfront |
| Exceptions are caught and re-thrown as generic errors, losing context and making debugging impossible | Step 8 defines a typed exception hierarchy where each exception maps to a specific API error response |
| Downstream service failures cascade and take down the entire system | Step 8 defines retry strategy with exponential backoff and circuit breakers for unreliable downstream calls |
| Background jobs run on multiple instances simultaneously, causing duplicate processing | Step 9 requires distributed locks for scheduled jobs and idempotent event consumers |
| Implementation is inconsistent — different developers or AI agents use different naming, file organization, and code patterns | Step 11 defines explicit consistency rules: naming conventions, file organization, and code patterns that must be followed |
| No one knows where the code for a specific feature should go — code is placed in random directories | Step 11 includes requirements-to-directory mapping, telling the implementation exactly where each feature's code lives |
| Caching is added without invalidation strategy, serving stale data after updates | Step 7 requires explicit TTL and invalidation triggers for every cached data item |
| Error responses from the backend don't match the API error format defined in the API design | Step 8 maps every exception type to the corresponding API error response, cross-checked against Section 7 |
| Existing backend patterns are described from memory and the description is wrong | Step 2 reads the actual codebase to extract patterns — not described from memory or guessed |
