# API Design

## Purpose

Design API contracts for new and modified interfaces — REST endpoints, GraphQL operations, gRPC services, WebSocket channels, event-driven async APIs (Kafka topics, message queues), and webhooks (outbound HTTP callbacks). The API type is determined from the technology stack and the system design's communication patterns — a single feature may involve multiple API types (e.g., REST for client-facing, event-driven for inter-service, webhooks for external consumer notifications). Consumes: the existing-architecture-assessment (existing API patterns, versioning conventions, error response formats, authentication middleware), the system-design (component boundaries and communication patterns that define API surfaces), and the requirements package (functional requirements for required capabilities, data requirements for entity definitions, permissions-access-control for authorization per operation, assumptions-constraints-scope for backward compatibility constraints). For brownfield projects, new interfaces follow the existing conventions discovered in the architecture assessment. Covers: REST endpoint definitions, GraphQL queries/mutations/subscriptions, gRPC service/RPC definitions, WebSocket event contracts, event-driven topic/queue schemas, webhook event delivery contracts, request/response schemas, error handling, authentication and authorization per operation, pagination and filtering, rate limiting, API gateway configuration, and API documentation specifications. Produces API design that is Section 7 of the solution design package.

## What This Produces

The API contracts for the feature — every new and modified interface across all API types the system uses. This may include REST endpoints, GraphQL operations, gRPC services, WebSocket channels, event-driven async APIs, and/or webhooks depending on what the system and the feature require.

For brownfield projects, the AI extracts existing interfaces from the codebase and ensures new ones follow the same conventions.

This is Section 7 of the solution design package. Frontend design consumes it (to know what to call), backend design implements it (to know what to expose), and integration design references it (for inter-service communication contracts).

## When to Use

- Always included when the feature exposes or modifies API endpoints
- Runs after `data-model-design` (Step 4) and before `backend-design` (Step 6)
- May be omitted only if the feature has no API impact (confirmed in the design workflow's Step 0)

## Inputs

| Input | Source | Required | If discovery was skipped |
|-------|--------|----------|--------------------------|
| System design | `docs/<feature>/solutions-package/design/03-system-design.md` — component map, communication patterns, integration seams | Yes | Yes |
| Technology stack | `docs/<feature>/solutions-package/design/02-technology-stack.md` — API conventions, error format, framework, API documentation tool | Yes | Yes |
| Data model design | `docs/<feature>/solutions-package/design/06-data-model-design.md` — entities, columns, relationships (defines what the API exposes) | Yes | Yes |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — Section 6 (Integration Points: integration protocols, sync/async nature), Section 7 (Security Architecture: auth flow, authorization model) | If discovery ran — provides architectural context (protocols, auth); API design conventions are derived from the codebase in Step 3 | Identifies conventions from codebase or user input |
| Requirements package — functional requirements | `docs/<feature>/requirements-package/requirements/functional-requirements.md` — required capabilities that map to API endpoints | Yes | Yes |
| Requirements package — permissions-access-control | `docs/<feature>/requirements-package/requirements/permissions-access-control.md` — who can access what, role-based rules per operation | Yes — determines authorization per endpoint | Yes |
| Requirements package — NFRs | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` — performance targets, rate limiting needs | Yes | Yes |
| Access to the codebase | Local filesystem or repository — controller/route files, GraphQL schema files, protobuf definitions, WebSocket handlers, event producer/consumer config, OpenAPI/Swagger specs | Yes (brownfield) — the AI reads the actual code to extract existing interfaces | Yes if available; otherwise user provides API description |
| API specification files | Existing `openapi.yaml`/`swagger.json` (REST), `schema.graphql` (GraphQL), `.proto` files (gRPC), AsyncAPI specs (event-driven) — if present in the repository | If available — authoritative source for existing contracts | If available |
| API Design Standards | `../assets/standards/api/` — baseline standards per API type: `REST-API-STANDARDS.md`, `GRAPHQL-STANDARDS.md`, `GRPC-STANDARDS.md`, `WEBSOCKET-STANDARDS.md`, `EVENT-DRIVEN-STANDARDS.md`, `WEBHOOK-STANDARDS.md` | Yes — load the file for each API type in scope | Yes |

> **Missing input guard:** If the requirements package or any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

## Did Discovery Run?

**Discovery ran** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` exists:

- Read Section 6 (Integration Points) — integration protocols, sync/async nature, message broker configuration. This tells the AI how the system communicates with external systems and between services, but does **not** contain API design conventions (URL structure, response format, error format, pagination style, etc.).
- Read Section 7 (Security Architecture) — authentication flow, authorization model, how auth is enforced on endpoints.
- These provide architectural context (what protocols are in use, how auth works). The AI still reads the actual codebase (Step 2) to extract the specific endpoints **and** derives API design conventions from the codebase in Step 3. Discovery does not capture API-level conventions — those are always derived from the code.

**Discovery was skipped:**

- For brownfield projects with codebase access: the AI uses the system design's component map to identify which services expose APIs, then reads the codebase directly to extract existing endpoints (Step 2) and derive conventions (Step 3).
- For brownfield projects without codebase access: ask the user to describe the existing API endpoints, conventions, and authentication approach. Record as `user-stated`.
- For greenfield projects: no existing API to reference. Proceed directly to designing the API contracts.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  1. LOAD — Read all inputs                                       │
│     Read system design (component map, communication patterns),  │
│     technology stack (API conventions, error format, framework), │
│     data model (entities the API exposes), requirements          │
│     (functional reqs, permissions, NFRs).                        │
│     If discovery ran: read baseline Sections 6 and 7.            │
├──────────────────────────────────────────────────────────────────┤
│  1b. DETERMINE API TYPES — Identify which API types this         │
│      feature involves                                            │
│      From the technology stack and system design communication   │
│      patterns, determine: REST, GraphQL, gRPC, WebSocket,       │
│      event-driven (Kafka/RabbitMQ/SQS), Webhooks (outbound      │
│      HTTP callbacks), or a combination.                          │
│      Also determine: does the system route through an            │
│      API gateway? (affects rate limiting, auth, routing)         │
├──────────────────────────────────────────────────────────────────┤
│  2. EXTRACT EXISTING — Read the codebase to extract existing     │
│     interfaces in the affected area                              │
│     (Brownfield only)                                            │
│     Read source files appropriate to each API type:              │
│     REST: controllers, OpenAPI specs                             │
│     GraphQL: schema files, resolvers                             │
│     gRPC: .proto files, service implementations                  │
│     WebSocket: handlers, channel/room definitions                │
│     Events: producer/consumer config, topic/queue definitions,   │
│     AsyncAPI specs, message schemas                              │
│     Webhooks: registration endpoints, dispatch code, event       │
│     catalog, retry/signature config                              │
│     Pre-populate the "before" picture from the code.             │
├──────────────────────────────────────────────────────────────────┤
│  3. CONVENTIONS — Identify conventions per API type              │
│     3a. Load API Design Standards for each type in scope         │
│     3b. Ask user for a reference implementation (brownfield)     │
│     3c. Derive conventions and compare against standards         │
│         (runs for ALL API types, flags deviations)               │
│     User chooses per convention: existing pattern or standard.   │
├──────────────────────────────────────────────────────────────────┤
│  4. DESIGN INTERFACES — Define new and modified interfaces       │
│     For each functional requirement: define the operation(s)     │
│     it needs across all applicable API types.                    │
│     For modifications: specify what changes and what stays.      │
│     Build traceability to requirements.                          │
├──────────────────────────────────────────────────────────────────┤
│  5. CONTRACTS — Define schemas per API type                      │
│     REST: request/response bodies, query/path params             │
│     GraphQL: type definitions, input types, return types         │
│     gRPC: protobuf message definitions                           │
│     WebSocket: event payload schemas                             │
│     Events: message/event payload schemas, headers/metadata      │
│     Align with data model entities from Section 6.               │
├──────────────────────────────────────────────────────────────────┤
│  6. AUTH — Define authentication and authorization per operation  │
│     For each operation: is it public or authenticated?           │
│     What roles/permissions are required?                         │
│     Map to permissions-access-control from requirements.         │
├──────────────────────────────────────────────────────────────────┤
│  7. PAGINATION & FILTERING — Define collection contracts         │
│     (REST and GraphQL only)                                      │
│     For list operations: pagination strategy, filtering,         │
│     sorting, search. Follow existing patterns.                   │
├──────────────────────────────────────────────────────────────────┤
│  8. ERRORS — Define error handling per API type                  │
│     REST: HTTP status codes, error response body                 │
│     GraphQL: error extensions, partial response handling         │
│     gRPC: status codes, error details                            │
│     WebSocket: error events, reconnection strategy               │
│     Events: dead-letter queues, poison message handling,         │
│     retry policies                                               │
├──────────────────────────────────────────────────────────────────┤
│  9. VERSIONING — Define versioning strategy for modified         │
│     interfaces (Brownfield only)                                 │
│     REST: URL version, header version, additive changes          │
│     GraphQL: schema evolution, @deprecated directives            │
│     gRPC: protobuf backward compatibility rules                  │
│     Events: schema versioning, envelope version field            │
├──────────────────────────────────────────────────────────────────┤
│  10. VALIDATE — Check against constraints and conventions        │
│      All interfaces follow existing conventions.                 │
│      Every functional requirement has an operation.              │
│      Auth requirements match permissions-access-control.         │
│      Traceability is complete.                                   │
├──────────────────────────────────────────────────────────────────┤
│  11. ASSEMBLE — Write the API design section                     │
│      Produce the structured output. Present for review.          │
└──────────────────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Load Inputs

Read all inputs. If the system design, technology stack, or data model design is not yet complete, stop — this skill depends on all three.

From the technology stack (Section 2), note:
- API conventions (REST, GraphQL, gRPC, or combination)
- Error format (e.g., RFC 7807 Problem Details)
- API documentation tool (e.g., OpenAPI 3.0, Swagger)
- Framework (e.g., Spring Boot, Express, NestJS, Django REST Framework)
- Message broker / event platform (e.g., Kafka, RabbitMQ, SQS) if event-driven

From the data model design (Section 6), note which entities exist — the API exposes representations of these entities, not the raw database schema.

### Step 1b — Determine Which API Types This Feature Involves

A single feature may involve multiple API types. Determine which are in scope by reading the system design's communication patterns:

| Communication Pattern | API Type |
|----------------------|----------|
| Synchronous HTTP between client and server | **REST** or **GraphQL** (whichever the project uses) |
| Synchronous HTTP/gRPC between internal services | **REST** or **gRPC** |
| Asynchronous messaging between services (Kafka, RabbitMQ, SQS, SNS) | **Event-driven** |
| Real-time bidirectional communication (live updates, chat, notifications) | **WebSocket** |
| Outbound HTTP callbacks to external consumers when events occur | **Webhooks** |
| Scheduled or batch data exchange | **Event-driven** or **file-based** (covered in integration design) |

**API Gateway determination:**

Also check whether the system routes requests through an API gateway (e.g., Kong, AWS API Gateway, Apigee, Azure API Management, nginx as gateway). If yes, determine what the gateway handles vs. what the service handles:

| Concern | Gateway-level | Service-level |
|---------|-------------|---------------|
| Rate limiting | Global rate limits, tier-based throttling | Per-endpoint or per-user limits beyond gateway |
| Authentication | Token validation, API key verification | Authorization (role/permission checks) |
| Routing | Path-based routing to backend services | Internal routing within the service |
| Request transformation | Header injection, path rewriting | Business-level transformation |
| CORS | Cross-origin policy enforcement | N/A (handled at gateway) |
| TLS termination | TLS termination at gateway | Internal traffic may be plaintext or mTLS |

Present the determination to the user: **"Based on the system design, this feature involves the following API types: [list]. The system [does/does not] route through an API gateway. I'll design contracts for each type and note gateway-level concerns where applicable. Let me know if I've missed any."**

For each API type in scope, the remaining steps (2–9) execute with type-appropriate guidance.

### Step 2 — Extract Existing API Endpoints from the Codebase (Brownfield Only)

The AI has access to the codebase. Rather than asking the user to describe the existing API, the AI reads the actual source files to extract it.

**Step 2a — Check for API specification files.**

Search the repository for specification files appropriate to each API type in scope:

| API Type | Spec files to search for |
|----------|------------------------|
| **REST** | `openapi.yaml`, `openapi.json`, `openapi.yml`, `swagger.yaml`, `swagger.json`, `swagger.yml`, files in `/docs/api/`, `/api-docs/`, `/spec/` |
| **GraphQL** | `schema.graphql`, `*.graphql` files, `schema.gql`, introspection output files |
| **gRPC** | `*.proto` files, typically in a `/proto/`, `/protos/`, or `/api/` directory |
| **Event-driven** | `asyncapi.yaml`, `asyncapi.json`, Avro schema files (`*.avsc`), JSON Schema files for message payloads |
| **Webhooks** | Webhook registration endpoints, webhook dispatch/delivery code, webhook payload documentation, retry/delivery configuration |

If a specification file exists, it is the **authoritative source** for existing contracts. Read it in full. Extract every operation in the affected area.

**Step 2b — Read source files for each API type in scope.**

Whether or not specification files exist, also read the actual source files to verify and supplement.

**REST — Read controller/route source files:**

| Framework | What to read |
|-----------|-------------|
| **Spring Boot** | `@RestController` / `@Controller` classes — `@GetMapping`, `@PostMapping`, `@RequestBody`, `@PathVariable`, `@RequestParam`, response types |
| **NestJS** | Controller classes — `@Get()`, `@Post()`, `@Body()`, `@Param()`, `@Query()`, DTOs, `@UseGuards()` |
| **Express / Fastify** | Route files — `router.get()`, `router.post()`, request/response handling, middleware chains |
| **Django REST Framework** | ViewSets, Serializers, URL patterns — `@api_view`, `ModelViewSet`, `serializer_class` |
| **ASP.NET Core** | Controller classes — `[HttpGet]`, `[HttpPost]`, `[FromBody]`, `[Authorize]`, action return types |
| **Rails** | `routes.rb` + controller actions — `resources`, `get/post/put/delete`, `before_action`, strong params |
| **FastAPI** | Route functions — `@app.get()`, `@app.post()`, Pydantic models, `Depends()` for auth |

For each REST endpoint, extract:

| Method | URL | Request Body / Params | Response Body | Auth | Status Codes | Consumer |
|--------|-----|----------------------|---------------|------|-------------|----------|
| *(e.g., GET)* | *(/api/v1/orders/{id})* | *(path: id)* | *(Order object with nested items)* | *(JWT, role: user)* | *(200, 404, 401)* | *(frontend)* |

**GraphQL — Read schema and resolver files:**

| Framework | What to read |
|-----------|-------------|
| **Apollo Server** | `schema.graphql` or `typeDefs`, resolver files, context setup for auth |
| **Hasura** | Hasura metadata, custom resolvers, permissions configuration |
| **Nexus / TypeGraphQL** | Type definitions in code, `@Resolver`, `@Query`, `@Mutation` decorators |
| **graphene (Python)** | Schema classes, `ObjectType`, `Mutation`, `resolve_*` methods |

For each GraphQL operation, extract:

| Operation Type | Name | Input Types | Return Type | Auth | Description | Consumer |
|---------------|------|------------|-------------|------|-------------|----------|
| *(e.g., Query)* | *(order)* | *(id: ID!)* | *(Order)* | *(authenticated)* | *(Get order by ID)* | *(frontend)* |
| *(e.g., Mutation)* | *(createRefund)* | *(CreateRefundInput!)* | *(Refund)* | *(role: user)* | *(Create refund request)* | *(frontend)* |

**gRPC — Read protobuf definitions and service implementations:**

| What to read |
|-------------|
| `.proto` files — `service`, `rpc`, `message` definitions, `option` annotations |
| Service implementation classes — actual RPC method implementations, interceptors for auth |

For each gRPC service/RPC, extract:

| Service | RPC | Request Message | Response Message | Streaming | Auth | Consumer |
|---------|-----|----------------|-----------------|-----------|------|----------|
| *(OrderService)* | *(GetOrder)* | *(GetOrderRequest)* | *(Order)* | *(unary)* | *(metadata: token)* | *(service: Gateway Service)* |

**WebSocket — Read handler and channel definitions:**

| Framework | What to read |
|-----------|-------------|
| **Socket.IO** | Event handlers — `socket.on('event')`, `socket.emit()`, namespace/room configuration |
| **Spring WebSocket** | `@MessageMapping`, `@SendTo`, STOMP broker config, `WebSocketHandler` implementations |
| **ActionCable (Rails)** | Channel classes, `stream_from`, `receive`, subscription auth |
| **Native WS** | WebSocket server setup, message parsing, connection lifecycle handlers |

For each WebSocket event/channel, extract:

| Event / Channel | Direction | Payload Schema | Auth | Description | Consumer |
|----------------|-----------|---------------|------|-------------|----------|
| *(order.status.updated)* | *(server → client)* | *({orderId, newStatus, timestamp})* | *(connection-level JWT)* | *(Pushed when order status changes)* | *(frontend)* |

**Event-driven — Read producer/consumer config and message schemas:**

| Tool | What to read |
|------|-------------|
| **Kafka** | Producer/consumer configuration, topic definitions, Avro/JSON schema files, consumer group setup, `@KafkaListener` / `KafkaTemplate` |
| **RabbitMQ** | Exchange/queue/binding definitions, `@RabbitListener`, `RabbitTemplate`, message converter config |
| **SQS/SNS** | Queue/topic ARNs, message handler config, `@SqsListener`, dead-letter queue setup |
| **AsyncAPI spec** | `asyncapi.yaml` / `asyncapi.json` — channels, message schemas, servers |

For each event/message, extract:

| Topic / Queue | Event Name | Direction | Payload Schema | Key / Routing | Consumer Group | DLQ |
|--------------|-----------|-----------|---------------|--------------|---------------|-----|
| *(order-events)* | *(order.created)* | *(publish)* | *({orderId, customerId, items, total})* | *(orderId)* | *(notification-service)* | *(order-events-dlq)* |

**Webhooks — Read webhook registration and dispatch code:**

| What to read |
|-------------|
| Webhook registration endpoints — where consumers register callback URLs, event types they subscribe to |
| Webhook dispatch/delivery code — how payloads are constructed, signed (HMAC), and delivered |
| Retry and failure handling — retry policies, exponential backoff, dead-letter/failure logging |
| Webhook event catalog — which internal events trigger outbound webhook deliveries |

For each webhook event, extract:

| Event Type | Trigger | Payload Schema | Signature Method | Retry Policy | Registration Endpoint | Consumer |
|-----------|---------|---------------|-----------------|-------------|---------------------|----------|
| *(order.completed)* | *(Order moves to COMPLETED)* | *({event, timestamp, data: {orderId, total}})* | *(HMAC-SHA256 in X-Signature header)* | *(3 retries, exponential backoff)* | *(POST /api/v1/webhooks)* | *(external)* |

**Step 2c — Read middleware and auth configuration.**

Read authentication/authorization middleware to understand how auth is enforced:
- Global auth middleware (what applies to all endpoints by default)
- Per-route or per-controller auth decorators/guards
- Role/permission checks

**Step 2d — If specification files and code disagree.**

If any specification file describes interfaces differently from the actual code (e.g., OpenAPI spec says a field is required but the code accepts it as optional; `.proto` file defines a field the service implementation ignores; AsyncAPI spec describes a topic the code doesn't produce to), surface the contradiction to the user: **"The [spec type] and the [source code] disagree on [specific point]. Which is the current truth?"** Do not silently pick one.

**Step 2e — Tag each extracted interface with its consumer.**

Using the system design's component map, tag each extracted interface with its consumer type: `frontend` (called by a user-facing client), `service` (called by another backend service), `external` (called by a third-party system), or a combination. This tagging carries forward into Step 4 and the final output, enabling downstream skills (frontend design, backend design, integration design) to identify which interfaces belong to them.

**Step 2f — Present the extracted API to the user.**

Present the full extracted API with consumer tags: **"I've read the codebase and extracted the existing API endpoints in the affected area, tagged by consumer type. Here is what I found — please confirm this is accurate, and let me know if there are endpoints I've missed, consumer tags that are wrong, or conventions the code doesn't fully reflect."**

The user confirms, corrects, or adds endpoints the AI couldn't find (e.g., endpoints in a different service, legacy endpoints not following the standard pattern).

**If the AI does not have codebase access**, ask the user to describe the existing API endpoints and conventions. Record as `user-stated`.

For greenfield projects, skip this step.

### Step 3 — Identify Existing Conventions per API Type

This step has three sub-steps for brownfield REST APIs: load the standards, ask for a reference, derive conventions, and compare.

**Step 3a — Load API Design Standards for each API type in scope**

Read the standards file for each API type determined in Step 1b:

| API Type | Standards File |
|----------|---------------|
| REST | `../assets/standards/api/REST-API-STANDARDS.md` |
| GraphQL | `../assets/standards/api/GRAPHQL-STANDARDS.md` |
| gRPC | `../assets/standards/api/GRPC-STANDARDS.md` |
| WebSocket | `../assets/standards/api/WEBSOCKET-STANDARDS.md` |
| Event-driven | `../assets/standards/api/EVENT-DRIVEN-STANDARDS.md` |
| Webhooks | `../assets/standards/api/WEBHOOK-STANDARDS.md` |

These are the baselines the AI uses to evaluate the quality of existing patterns for each API type.

**Step 3b — Ask for a reference implementation** (Brownfield only)

Before deriving conventions from the full codebase, ask the user for a reference per API type in scope:

- **REST:** *"Which existing endpoint or controller do you consider the best example of how the API should look?"*
- **GraphQL:** *"Which existing query/mutation or resolver do you consider the best example?"*
- **gRPC:** *"Which existing service or .proto file do you consider the best example?"*
- **Event-driven:** *"Which existing event producer/consumer do you consider the best example?"*
- **WebSocket:** *"Which existing WebSocket handler or event do you consider the best example?"*
- **Webhooks:** *"Which existing webhook implementation do you consider the best example?"*

Combine into a single prompt: **"For each API type this feature uses, is there an existing implementation you consider the gold standard? I'll use it as the primary reference for conventions. If you don't have a preference for any, I'll derive conventions from the most common patterns in the codebase and compare them against the design standards."**

If the user nominates a reference:
- Use that implementation's patterns as the primary convention source for its API type
- Still proceed to Step 3c — the nominated reference is compared against the standards just like any other code. A user-nominated implementation may itself have deviations worth flagging.

If the user has no preference:
- Derive conventions from the most common patterns across the extracted interfaces
- Proceed to Step 3c for quality comparison

In both cases, Step 3c always runs for every API type in scope.

**Step 3c — Derive conventions and compare against standards** (all API types in scope)

For each API type in scope, derive the observed patterns from the extracted interfaces (or user-nominated reference), then compare against the corresponding standards file.

The comparison table follows the same format for every API type:

| Convention | Observed Pattern | Standard | Aligned? | Deviation |
|-----------|-----------------|----------|----------|-----------|
| *(convention name)* | *(what the codebase does)* | *(what the standard recommends)* | *(Yes/No)* | *(description of deviation, if any)* |

**REST** — compare against `REST-API-STANDARDS.md`:

Key conventions to compare: URL structure, resource naming, response wrapper, error format, pagination, status codes, versioning, auth enforcement, date format, ID format.

**GraphQL** — compare against `GRAPHQL-STANDARDS.md`:

Key conventions to compare: type naming (PascalCase types, camelCase fields, UPPER_SNAKE_CASE enums), nullability patterns, mutation input/payload pattern, pagination (Relay connections vs simple lists), error handling (payload-level vs top-level), auth enforcement (directives vs resolver-level), schema documentation.

**gRPC** — compare against `GRPC-STANDARDS.md`:

Key conventions to compare: package naming, message naming ({RPC}Request/{RPC}Response), enum values (UNSPECIFIED sentinel, prefixed values), field types (Timestamp vs int64, string IDs vs int64), error handling (gRPC status codes, error details), pagination (token-based), reserved fields for removed fields.

**Event-driven** — compare against `EVENT-DRIVEN-STANDARDS.md`:

Key conventions to compare: topic/queue naming ({domain}.{entity}.{action}), message envelope (eventId, eventType, source, timestamp, version, correlationId, payload), payload design (self-contained vs callback), partitioning strategy, idempotency (eventId deduplication), DLQ naming and strategy, retry policy, producer pattern (outbox vs fire-and-forget), schema evolution approach.

**WebSocket** — compare against `WEBSOCKET-STANDARDS.md`:

Key conventions to compare: event naming (dot-separated), message format (type/id/timestamp/data envelope), auth approach (handshake vs first message), channel/subscription model, error event format, close codes, heartbeat/keepalive, reconnection strategy, missed event recovery.

**Webhooks** — compare against `WEBHOOK-STANDARDS.md`:

Key conventions to compare: event type naming, payload envelope format (event type, timestamp, delivery ID), signature/verification method (HMAC-SHA256), retry policy (exponential backoff, max attempts), registration API design, event catalog documentation, idempotency (delivery IDs), webhook status/health monitoring.

For each deviation in any API type, present the choice to the user: **"The existing codebase uses [observed pattern], but the recommended standard is [standard pattern]. For new interfaces, should I: (a) follow the existing pattern for consistency, or (b) adopt the standard? If you choose (b), I'll note this as a convention upgrade in the design."**

For greenfield projects, skip the comparison — use the standards directly as the convention baseline, adjusting for any team preferences.

Present all conventions to the user: **"Based on the existing interfaces, here are the conventions I'll follow for each API type. I've compared against the design standards and flagged deviations. Let me know which conventions you'd like to change."**

### Step 4 — Design New and Modified Interfaces

For each functional requirement that maps to an API operation, define the interface(s) it needs. A single requirement may involve multiple API types (e.g., a REST endpoint for the user action + an event published for downstream processing).

**Consumer tagging — every interface must identify its consumer(s).**

Each interface is consumed by a specific type of client. Tag every interface so downstream design skills know which interfaces belong to them:

| Consumer Tag | Meaning | Consumed by |
|-------------|---------|-------------|
| **frontend** | Called by a user-facing client (browser, mobile app) | Frontend design (Section 4) |
| **service** | Called by another backend service | Backend design (Section 5) of the calling service |
| **external** | Called by an external system or third-party | Integration design (Section 8) |
| **frontend + service** | Called by both frontend clients and other services | Both Sections 4 and 5 |

Derive the consumer from the system design's component map: if the caller is a frontend component (web app, mobile app, SPA), the consumer is `frontend`. If the caller is another backend service, the consumer is `service`. If both call the same endpoint, tag it `frontend + service`.

For event-driven and webhook interfaces, the consumer is typically `service` or `external` — but WebSocket events are almost always `frontend`.

**REST — New endpoints:**

| Method | URL | Description | Consumer | Requirement |
|--------|-----|-------------|----------|-------------|
| *(POST)* | *(/api/v1/orders/{orderId}/refunds)* | *(Create a refund request for an order)* | *(frontend)* | *(FR-01)* |
| *(GET)* | *(/api/v1/refunds/{id})* | *(Get refund details)* | *(frontend)* | *(FR-03)* |

**REST — Modified endpoints** — specify only the changes:

| Method | URL | Change | Before | After | Consumer | Reason |
|--------|-----|--------|--------|-------|----------|--------|
| *(GET)* | *(/api/v1/orders/{id})* | *(Add field to response)* | *(No refund_eligible field)* | *(Include refund_eligible: boolean)* | *(frontend)* | *(FR-02)* |

**GraphQL — New operations** (if in scope):

| Operation Type | Name | Input | Return Type | Consumer | Description | Requirement |
|---------------|------|-------|-------------|----------|-------------|-------------|
| *(Mutation)* | *(createRefund)* | *(CreateRefundInput!)* | *(Refund!)* | *(frontend)* | *(Create a refund request)* | *(FR-01)* |
| *(Query)* | *(refund)* | *(id: ID!)* | *(Refund)* | *(frontend)* | *(Get refund by ID)* | *(FR-03)* |
| *(Subscription)* | *(refundStatusChanged)* | *(orderId: ID!)* | *(Refund!)* | *(frontend)* | *(Live refund status updates)* | *(FR-07)* |

**gRPC — New RPCs** (if in scope):

| Service | RPC | Request | Response | Streaming | Consumer | Requirement |
|---------|-----|---------|----------|-----------|----------|-------------|
| *(RefundService)* | *(CreateRefund)* | *(CreateRefundRequest)* | *(Refund)* | *(unary)* | *(service: Notification Service)* | *(FR-01)* |

**Event-driven — New events** (if in scope):

| Topic / Queue | Event Name | Publisher | Consumer(s) | Payload Summary | Requirement |
|--------------|-----------|-----------|-------------|----------------|-------------|
| *(order-events)* | *(refund.requested)* | *(Refund Service)* | *(service: Notification Service, Accounting Service)* | *({refundId, orderId, amount, reason})* | *(FR-01)* |
| *(refund-events)* | *(refund.approved)* | *(Refund Service)* | *(service: Payment Service, Notification Service)* | *({refundId, orderId, approvedBy, amount})* | *(FR-05)* |

**WebSocket — New events** (if in scope):

| Event Name | Direction | Channel / Room | Payload Summary | Consumer | Requirement |
|-----------|-----------|---------------|----------------|----------|-------------|
| *(refund.status.updated)* | *(server → client)* | *(user:{userId})* | *({refundId, newStatus, timestamp})* | *(frontend)* | *(FR-07)* |

**Webhooks — New webhook events** (if in scope):

| Event Type | Trigger | Payload Summary | Signature | Retry Policy | Consumer | Requirement |
|-----------|---------|----------------|-----------|-------------|----------|-------------|
| *(refund.completed)* | *(Refund reaches COMPLETED status)* | *({event, timestamp, data: {refundId, orderId, amount}})* | *(HMAC-SHA256)* | *(5 retries, exponential backoff)* | *(external)* | *(FR-08)* |

If webhooks are in scope, also define the webhook management endpoints:
- Registration (subscribe to event types, specify callback URL and secret)
- Listing (view active subscriptions)
- Deletion (unsubscribe)
- Testing (send a test payload to verify the consumer endpoint)

**Unchanged interfaces** — interfaces in the affected area that were evaluated and need no change. State why.

### Step 5 — Define Schemas per API Type

For each new interface, define the full contract. The format depends on the API type.

**REST** — request/response schemas:

For each endpoint: path params, query params, request body (with field types, required/optional, constraints), and response body. For modified endpoints, show only the delta.

**GraphQL** — type definitions:

For each new or modified type, input type, and enum:
```graphql
type Refund {
  id: ID!
  order: Order!
  status: RefundStatus!
  reason: String!
  lineItems: [RefundLineItem!]!
  createdAt: DateTime!
}

input CreateRefundInput {
  orderId: ID!
  reason: String!
  lineItems: [RefundLineItemInput!]!
}

enum RefundStatus {
  PENDING
  APPROVED
  REJECTED
}
```

**gRPC** — protobuf message definitions:

For each new or modified message:
```protobuf
message CreateRefundRequest {
  string order_id = 1;
  string reason = 2;
  repeated RefundLineItem line_items = 3;
}

message Refund {
  string id = 1;
  string order_id = 2;
  RefundStatus status = 3;
  string reason = 4;
  google.protobuf.Timestamp created_at = 5;
}
```

**Event-driven** — message/event payload schemas:

For each event, define the full payload with field types and constraints. Include the message envelope if the project uses one:
```json
{
  "eventType": "refund.requested",
  "eventId": "UUID",
  "timestamp": "ISO 8601",
  "version": 1,
  "payload": {
    "refundId": "UUID",
    "orderId": "UUID",
    "amount": "decimal",
    "reason": "string (max 500)",
    "lineItems": [{"orderItemId": "UUID", "quantity": "integer"}]
  }
}
```

Also specify:
- **Schema evolution rules** — what changes are backward-compatible (adding optional fields) vs. breaking (removing fields, changing types)
- **Ordering guarantees** — partition key and what ordering is expected by consumers
- **Idempotency** — how consumers handle duplicate events (eventId-based deduplication)

**WebSocket** — event payload schemas:

For each event, define the payload the client receives or sends:
```json
{
  "type": "refund.status.updated",
  "data": {
    "refundId": "UUID",
    "newStatus": "approved",
    "previousStatus": "pending",
    "timestamp": "ISO 8601"
  }
}
```

Also specify: subscription mechanism (what the client sends to subscribe), connection lifecycle (what happens on connect/disconnect/reconnect).

**Webhooks** — webhook event payload schemas:

For each webhook event, define the full delivery payload, including the standard envelope:
```json
{
  "id": "delivery-UUID",
  "type": "refund.completed",
  "timestamp": "ISO 8601",
  "apiVersion": "2024-01-15",
  "data": {
    "refundId": "UUID",
    "orderId": "UUID",
    "amount": 49.99,
    "currency": "USD",
    "status": "completed"
  }
}
```

Also specify:
- **Signature header** — how the payload is signed (e.g., `X-Signature-256: sha256=HMAC(secret, rawBody)`) and how the consumer verifies it
- **Delivery headers** — standard headers included (content type, delivery ID, event type, API version)
- **Retry policy** — number of attempts, backoff schedule, timeout per attempt, what HTTP status codes trigger a retry (e.g., 5xx, timeout) vs. not (e.g., 4xx)
- **Idempotency** — delivery ID for deduplication on the consumer side
- **Webhook management API** — the REST endpoints for subscription CRUD (follows the REST conventions defined earlier)

For all API types: each field must specify type, required/optional, constraints, and which data model entity it maps to.

### Step 6 — Define Authentication and Authorization per Operation

For each operation across all API types, specify auth requirements:

| API Type | Operation | Auth Required | Method | Roles / Permissions | Notes |
|----------|----------|--------------|--------|--------------------|-------|
| *(REST)* | *(POST /refunds)* | *(Yes)* | *(JWT)* | *(user, admin)* | *(User can only refund their own orders)* |
| *(REST)* | *(PATCH /refunds/{id}/approve)* | *(Yes)* | *(JWT)* | *(admin, refund_manager)* | *(Only authorized approvers)* |
| *(GraphQL)* | *(mutation createRefund)* | *(Yes)* | *(context JWT)* | *(user)* | *(Resolver checks ownership)* |
| *(Event)* | *(refund.approved consumer)* | *(service-to-service)* | *(mTLS / shared secret)* | *(Payment Service)* | *(Only authorized services consume)* |
| *(WebSocket)* | *(connection)* | *(Yes)* | *(JWT in handshake)* | *(user)* | *(User receives only their own events)* |
| *(Webhook)* | *(POST /webhooks — registration)* | *(Yes)* | *(API key / JWT)* | *(admin, developer)* | *(Only authorized consumers can register)* |
| *(Webhook)* | *(outbound delivery)* | *(N/A — outbound)* | *(HMAC signature)* | *(N/A)* | *(Consumer verifies via shared secret)* |

Map each authorization rule to the permissions-access-control section of the requirements package.

For event-driven APIs, auth is typically service-to-service rather than user-level. Specify how consumer authorization is enforced (e.g., topic-level ACLs, mTLS between services, shared secrets).

For webhooks, auth has two sides: (1) **registration auth** — who can create/manage subscriptions (typically API key or JWT), and (2) **delivery verification** — how the consumer verifies the payload is authentic (typically HMAC signature with a shared secret).

### Step 7 — Define Pagination, Filtering, and Sorting

For each list/collection endpoint:

| Endpoint | Pagination | Filtering | Sorting | Search |
|----------|-----------|-----------|---------|--------|
| *(GET /refunds)* | *(offset-based: ?page=1&size=20)* | *(?status=pending&created_after=2026-01-01)* | *(?sort=created_at&order=desc)* | *(None)* |

Follow the existing pagination pattern identified in Step 3. Do not introduce a different pagination style unless there is explicit rationale.

### Step 8 — Define Error Handling per API Type

**REST** — HTTP status codes and error response body:

| Endpoint | Status Code | Error Condition | Response Body |
|----------|------------|----------------|---------------|
| *(POST /refunds)* | *(400)* | *(Invalid request body — missing required fields)* | *(Error format per conventions)* |
| | *(404)* | *(Order not found)* | |
| | *(409)* | *(Refund already exists for this order)* | |
| | *(422)* | *(Order not eligible for refund)* | |
| | *(401)* | *(Not authenticated)* | |
| | *(403)* | *(Not authorized — user doesn't own this order)* | |

Use the error format from the technology stack (Section 2). All error responses must follow the same structure.

**GraphQL** — error handling:

| Operation | Error Condition | Handling Approach |
|----------|----------------|-------------------|
| *(createRefund)* | *(Order not found)* | *(Return error in errors array with extensions.code: "NOT_FOUND")* |
| *(createRefund)* | *(Not authorized)* | *(Return error with extensions.code: "FORBIDDEN")* |

Specify whether the project uses: errors array with extension codes, union types for expected errors (e.g., `CreateRefundResult = Refund | NotFoundError | NotEligibleError`), or a combination.

**gRPC** — status codes and error details:

| RPC | gRPC Status | Error Condition | Details |
|-----|------------|----------------|---------|
| *(CreateRefund)* | *(NOT_FOUND)* | *(Order not found)* | *(google.rpc.ErrorInfo with reason)* |
| *(CreateRefund)* | *(FAILED_PRECONDITION)* | *(Order not eligible)* | *(google.rpc.PreconditionFailure)* |

**Event-driven** — failure handling:

| Event | Failure Scenario | Handling Strategy |
|-------|-----------------|-------------------|
| *(refund.requested)* | *(Consumer fails to process)* | *(Retry 3x with exponential backoff, then route to DLQ: refund-events-dlq)* |
| *(refund.requested)* | *(Poison message — cannot be deserialized)* | *(Route directly to DLQ, alert ops team)* |
| *(refund.requested)* | *(Duplicate event received)* | *(Idempotent consumer — deduplicate by eventId, skip processing)* |

For event-driven APIs, define: retry policy (count, backoff strategy), dead-letter queue destination, alerting on DLQ accumulation, and idempotency strategy.

**WebSocket** — error events and connection handling:

| Scenario | Client Behavior | Server Behavior |
|----------|----------------|-----------------|
| *(Invalid subscription request)* | *(Receive error event with code and message)* | *(Send error event, keep connection open)* |
| *(Auth token expired)* | *(Receive auth_expired event, reconnect with new token)* | *(Close connection with 4001 code)* |
| *(Server restart)* | *(Auto-reconnect with exponential backoff)* | *(Client re-subscribes on reconnect)* |

**Webhooks** — delivery failure handling:

| Scenario | Producer Behavior | Consumer Expectation |
|----------|------------------|---------------------|
| *(Consumer returns 5xx)* | *(Retry with exponential backoff: 1min, 5min, 30min, 2hr, 8hr — max 5 attempts)* | *(Consumer should be idempotent — use delivery ID to deduplicate)* |
| *(Consumer returns 4xx)* | *(Do not retry — mark delivery as failed, log for investigation)* | *(Consumer should return 2xx even if event is not relevant)* |
| *(Consumer timeout — no response within 30s)* | *(Treat as failure, apply retry policy)* | *(Consumer should acknowledge quickly, process asynchronously)* |
| *(All retries exhausted)* | *(Mark subscription as unhealthy, notify via dashboard/email, pause deliveries after N consecutive failures)* | *(Consumer should monitor webhook health endpoint)* |

Define: maximum retry count, backoff schedule, timeout per delivery attempt, health monitoring (auto-disable after consecutive failures), and manual re-delivery mechanism.

### Step 9 — Define Versioning Strategy for Modified Interfaces (Brownfield Only)

For each modified interface, define the versioning approach appropriate to its API type:

**REST:**

| Endpoint | Change Type | Strategy | Deprecation |
|----------|-----------|----------|-------------|
| *(GET /orders/{id})* | *(Additive — new field in response)* | *(Same version — adding a field is backward-compatible)* | *(N/A)* |

Additive changes (new optional field in response, new optional query param) — keep the same version. Breaking changes — new version URL, deprecation timeline, dual maintenance period.

**GraphQL:**

| Operation / Type | Change Type | Strategy |
|-----------------|-----------|----------|
| *(Refund type — add approvedAt field)* | *(Additive — new nullable field)* | *(Backward-compatible — existing queries don't request it)* |
| *(createRefund input — remove legacy field)* | *(Breaking)* | *(@deprecated directive on old field, new field added, remove after migration period)* |

GraphQL versioning typically uses schema evolution with `@deprecated` directives rather than URL versioning.

**gRPC:**

| Service / RPC | Change Type | Strategy |
|--------------|-----------|----------|
| *(Refund message — add field)* | *(Additive — new field number)* | *(Backward-compatible per protobuf rules — new field is optional)* |

Protobuf has built-in backward compatibility rules: never reuse field numbers, new fields are always optional, removed fields are reserved.

**Event-driven:**

| Event | Change Type | Strategy |
|-------|-----------|----------|
| *(refund.requested payload — add field)* | *(Additive — new optional field)* | *(Backward-compatible — consumers ignore unknown fields)* |
| *(refund.requested payload — change field type)* | *(Breaking)* | *(New topic version: refund-events-v2, or version field in envelope, dual-publish during migration)* |

For event schema versioning, specify: how consumers handle unknown fields, whether schema registry enforces compatibility, and the migration path for breaking changes (dual-publish, topic-per-version, or envelope version field).

**Webhooks:**

| Event Type | Change Type | Strategy |
|-----------|-----------|----------|
| *(refund.completed — add field)* | *(Additive — new field in payload)* | *(Backward-compatible — consumers should ignore unknown fields)* |
| *(refund.completed — remove field)* | *(Breaking)* | *(New API version in delivery header and payload `apiVersion` field, dual-deliver during migration)* |

Webhook versioning typically uses an `apiVersion` field in the payload and a version header. Consumers register for a specific API version. When breaking changes are needed: publish a new API version, allow consumers to upgrade their subscription, maintain dual-delivery during the migration period, and sunset the old version with advance notice.

### Step 10 — Validate

Check the completed API design against:

- **Conventions** — do all new interfaces follow the conventions identified in Step 3 for their respective API type?
- **Functional requirements** — does every functional requirement that maps to an API operation have a corresponding interface?
- **Permissions** — does every operation's auth specification match the permissions-access-control requirements?
- **Data model** — does every schema align with the entities defined in Section 6?
- **System design** — does each interface belong to the component identified in the system design? Do the communication patterns (sync/async) match?
- **Consumer tagging** — is every interface tagged with its consumer (`frontend`, `service`, `external`)? Does the tag match the system design's component map (i.e., if the system design shows the web app calling an endpoint, is it tagged `frontend`)?
- **NFRs** — are rate limiting and performance targets addressed?
- **Event consistency** — for event-driven APIs: does every published event have at least one consumer? Does every consumed event have a publisher?
- **Webhook consistency** — for webhooks: does every webhook event type map to an internal domain event that triggers it? Is the webhook management API (registration/listing/deletion) complete? Are signature and retry policies defined for all event types?
- **Traceability** — does every new or modified interface trace to a requirement?
- **Standards checklists** — run the Design Checklist from the corresponding standards file against every new interface for each API type

### Step 11 — Assemble

Combine all sections into the API design output. This becomes Section 7 of the solution design package.

**OpenAPI specification generation** (REST only):

For all new and modified REST endpoints, generate an OpenAPI 3.x specification. This specification:
- Includes every new endpoint with path, method, parameters, request body, responses, and security requirements
- Includes modified endpoints with the updated schema
- Does not include unchanged endpoints (those remain in the existing spec, if one exists)
- Uses the conventions established in Step 3 (response format, error format, pagination, auth)
- Can be merged with an existing OpenAPI spec by the implementation team

If the project already has an OpenAPI spec, produce the new spec as a **delta** that can be merged. If the project has no existing spec, produce a standalone spec for the new endpoints.

Present the spec to the user alongside the human-readable design.

### File Output

Write the completed section to `docs/<feature>/solutions-package/design/07-api-design.md` using the template at `../assets/api-design-doc.md` as the output structure.

If this section was determined to be not applicable in the design workflow's Step 0, write a stub file containing: **"Not applicable — [rationale from scoping step]."**

---

## Output Structure

The output is organized by API type. Only include sections for API types that are in scope.

### For Brownfield Projects

**1. API Types in Scope** — which API types this feature involves (from Step 1b)

**2. Existing Interfaces** — interfaces in the affected area extracted from the codebase, organized by API type (from Step 2)

**3. Conventions per API Type** — patterns derived from existing interfaces (from Step 3)

**4. Interface Delta** (per API type, each tagged with consumer)
- New interfaces (full contract definitions, each tagged: `frontend`, `service`, `external`, or combination)
- Modified interfaces (changes only, with before/after, consumer tagged)
- Unchanged interfaces (with rationale for no change)

**5. Schemas** — full schemas for all new interfaces, in the appropriate format per API type (from Step 5)

**6. Authentication & Authorization** — per-operation auth requirements across all API types (from Step 6)

**7. Pagination, Filtering & Sorting** — collection contracts for REST and GraphQL (from Step 7)

**8. Error Handling** — error conditions per API type: HTTP status codes (REST), error extensions (GraphQL), gRPC status codes, DLQ/retry policies (event-driven), reconnection strategy (WebSocket), delivery failure/retry (webhooks) (from Step 8)

**9. Versioning Strategy** — how modified interfaces handle backward compatibility, per API type (from Step 9)

**10. Requirements Traceability** — every new or modified interface traces to the requirement that drives it

**11. OpenAPI Specification** (REST only) — an OpenAPI 3.x specification covering all new and modified REST endpoints (from Step 11)

**12. API Gateway Configuration** (if applicable) — gateway-level concerns for new endpoints: routing rules, rate limit tiers, auth policy delegation, CORS, request transformation (from Step 1b)

**13. Standards Comparison** — summary of where existing patterns deviate from the design standards for each API type, and which conventions the user chose for new interfaces (from Step 3c)

### For Greenfield Projects

**1. API Types in Scope** — which API types this system will use (from Step 1b)

**2. Conventions per API Type** — established patterns (from Step 3, based on REST API Design Standards and user preferences)

**3. Interface Definitions** — all interfaces with full contract definitions, organized by API type, each tagged with consumer type (from Step 4)

**4. Schemas** — full schemas for all interfaces (from Step 5)

**5. Authentication & Authorization** — per-operation auth requirements (from Step 6)

**6. Pagination, Filtering & Sorting** — collection contracts for REST and GraphQL (from Step 7)

**7. Error Handling** — error conditions per API type, including webhook delivery failure handling (from Step 8)

**8. API Gateway Configuration** (if applicable) — gateway routing, rate limits, auth delegation (from Step 1b)

**9. Requirements Traceability** — every interface traces to the requirement that drives it

**10. OpenAPI Specification** (REST only) — an OpenAPI 3.x specification for all REST endpoints (from Step 11)

---

## Requirements Traceability

Every new or modified interface must trace to the requirement that drives it. Existing unchanged interfaces carry forward without traceability.

| API Type | Interface | Consumer | Change Type | Requirement ID | Requirement Summary |
|----------|----------|----------|------------|---------------|---------------------|
| *(REST)* | *(POST /api/v1/orders/{id}/refunds)* | *(frontend)* | *(new)* | *(FR-01)* | *(Users can submit refund requests)* |
| *(REST)* | *(GET /api/v1/orders/{id} — add refund_eligible)* | *(frontend)* | *(modified)* | *(FR-02)* | *(Orders must show refund eligibility)* |
| *(Event)* | *(refund.requested on order-events topic)* | *(service)* | *(new)* | *(FR-01)* | *(Downstream services notified when refund is requested)* |
| *(WebSocket)* | *(refund.status.updated)* | *(frontend)* | *(new)* | *(FR-07)* | *(User sees live refund status updates)* |

If an interface cannot be traced to a requirement, it must be flagged and confirmed with the user before inclusion.

---

## Hand-off Gate

Before proceeding to `backend-design`, you must:

1. Write the completed API design in full, organized by API type.
2. Present it to the user for review with the following questions:
   - **API types:** Have I identified all the API types this feature involves? Are any missing?
   - **Existing interfaces:** Does the extracted API match what is actually deployed? Are there interfaces I've missed?
   - **Conventions:** Are the derived conventions correct per API type? Should any change?
   - **New interfaces:** Are the new interfaces correct and complete across all API types? Are any operations missing?
   - **Contracts:** Are the schemas correct? Are field types, constraints, and required/optional flags right?
   - **Auth:** Are the per-operation auth requirements correct? Do they match the permissions-access-control requirements?
   - **Errors:** Are the error conditions complete? For event-driven: are retry/DLQ/idempotency strategies correct? For webhooks: are delivery retry, signature, and health monitoring strategies correct?
   - **Versioning (brownfield):** Is the versioning strategy for modified interfaces correct per API type?
   - **Traceability:** Is every new or modified interface connected to a requirement?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the API design is accurate.

## Completion Criteria

- [ ] All API types the feature involves are identified and confirmed by the user
- [ ] For brownfield: existing interfaces are extracted from the codebase (controllers, route files, schema files, protobuf definitions, event producer/consumer config) and any specification files (OpenAPI, GraphQL schema, .proto, AsyncAPI) with full detail
- [ ] If specification files exist, they are read as authoritative sources; contradictions with code are surfaced to the user
- [ ] For brownfield: conventions are derived from existing interfaces per API type and confirmed
- [ ] If the AI has codebase access, existing interfaces are extracted from the actual code — not described from memory or guessed
- [ ] If the AI does not have codebase access, existing API is elicited from the user and recorded as `user-stated`
- [ ] Every functional requirement that maps to an API operation has a corresponding interface (across all applicable API types)
- [ ] For brownfield: every interface is classified as new, modified (with change description), or unchanged (with rationale)
- [ ] Schemas are fully defined per API type with types, constraints, required/optional flags
- [ ] All schemas align with data model entities from Section 6
- [ ] Auth requirements are defined per operation and match the permissions-access-control requirements
- [ ] REST/GraphQL collection operations have pagination, filtering, and sorting contracts
- [ ] Error handling is defined per API type (HTTP status codes, GraphQL errors, gRPC status, DLQ/retry for events, reconnection for WebSocket, delivery failure/retry for webhooks)
- [ ] For event-driven APIs: retry policy, DLQ destination, idempotency strategy, and schema evolution rules are defined
- [ ] For webhooks: event catalog, payload envelope, HMAC signature, retry policy, subscription health monitoring, and registration API are defined
- [ ] For brownfield: versioning strategy is defined for modified interfaces per API type
- [ ] All new interfaces follow the conventions identified in Step 3 for their API type
- [ ] For each API type in scope: existing conventions have been compared against the corresponding standards file in `../assets/standards/api/`; deviations are flagged and the user has chosen whether new interfaces follow existing patterns or adopt the standard
- [ ] If user nominated a reference implementation for any API type, it was used as the primary convention source and still compared against standards
- [ ] If the system uses an API gateway: gateway-level concerns (routing, rate limiting, auth delegation, CORS) are documented for new endpoints
- [ ] For REST: an OpenAPI 3.x specification is generated for all new and modified endpoints
- [ ] For each API type: every new interface passes the Design Checklist from its standards file
- [ ] Every interface is tagged with its consumer type (`frontend`, `service`, `external`, or combination) based on the system design's component map
- [ ] Requirements traceability is complete — every new or modified interface traces to a requirement and is tagged with its consumer
- [ ] The user has explicitly confirmed the API design is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Frontend and backend disagree on the API contract because it was never explicitly defined | API contracts are fully specified with schemas before frontend or backend design begins |
| Frontend design doesn't know which API endpoints it consumes vs. which are backend-to-backend | Every interface is tagged with its consumer (`frontend`, `service`, `external`) so downstream skills can filter to their relevant interfaces |
| New interfaces use different conventions from existing ones | Conventions are extracted from existing code per API type and enforced on new interfaces |
| Existing API is described from memory and the description is wrong | The AI reads the actual codebase — controllers, schema files, protobuf definitions, event config — to extract the real API |
| Specification file and actual code disagree, and the design is built against the wrong one | Step 2d explicitly checks for and surfaces contradictions between specs and code |
| An operation is created without auth when the requirement specifies role-based access | Per-operation auth is defined and cross-checked against permissions-access-control requirements |
| A breaking change is deployed without a versioning strategy, breaking existing clients or consumers | Step 9 requires versioning strategy per API type for every modified interface; breaking changes require a migration plan |
| A functional requirement has no corresponding API interface, and the gap is found during implementation | The traceability table maps every requirement to interfaces across all API types; unmapped requirements are flagged |
| Error responses are inconsistent across endpoints | Error handling is defined per API type using the standard format; Step 10 validates consistency |
| Pagination style varies between list endpoints | Pagination contracts are defined per collection operation following the existing pattern |
| An event is published but no consumer is defined, or a consumer expects an event that no service publishes | Step 10 validates that every published event has at least one consumer and vice versa |
| Event consumers fail silently with no retry or dead-letter strategy | Step 8 requires explicit retry policy, DLQ destination, and idempotency strategy for every event |
| The API design only covers REST when the system also uses event-driven communication | Step 1b determines all API types from the system design's communication patterns; the skill adapts to each |
| Schema evolution breaks consumers because no compatibility rules were defined | Step 9 defines schema versioning rules per API type (protobuf compatibility, Avro schema evolution, event envelope versioning) |
| New interfaces copy bad patterns from existing low-quality code | Step 3c compares existing conventions against the design standards for each API type; deviations are flagged and the user explicitly chooses the convention for new interfaces |
| API quality is inconsistent because the AI picks an arbitrary existing implementation as a reference | Step 3b asks the user to nominate a reference implementation per API type; if none is nominated, conventions are derived from the most common patterns and compared against standards |
| Webhook consumers can't verify payload authenticity, leading to security vulnerabilities | Step 5 requires HMAC signature specification with verification examples; `WEBHOOK-STANDARDS.md` enforces timestamp-bound signatures for replay protection |
| Webhook deliveries fail silently with no retry or health monitoring | Step 8 requires explicit retry policy with exponential backoff, health monitoring with auto-disable, and manual re-delivery mechanisms |
| API gateway concerns (rate limiting, auth, routing) are overlooked, causing production issues | Step 1b determines gateway presence; gateway vs. service responsibility split is documented in the output |
| No OpenAPI spec is produced, leaving the implementation team without a machine-readable contract | Step 11 generates an OpenAPI 3.x spec for all new and modified REST endpoints |
