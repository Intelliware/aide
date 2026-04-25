# reverse-engineer-api — Worked Example

## Scenario

The user has been routed here from `analyze-repository`, which classified `~/code/orderhub-backend` as an API repository (NestJS 10.3, TypeORM, PostgreSQL, version 2.4.1).

User says: *"I need to reverse engineer the documentation for my API repository at ~/code/orderhub-backend."*

## Stage 1 — Discovery and Inventory

The skill reads source code under `src/` and produces an inventory:

```
Modules: 12 (auth, users, orders, products, inventory, billing, shipping,
              notifications, audit, reports, admin, health)
Endpoints: 78 across all modules
Middleware: 4 global (logger, cors, helmet, request-id)
Guards: 3 (jwt-auth, roles, throttle)
Interceptors: 2 (transform-response, audit-log)
Pipes: 1 global (validation)
Exception filters: 2 (http-exception, validation-exception)
Entities: 14
DTOs: ~120 (request + response per endpoint)
Database migrations: 47
```

Then runs `steps/scaffold.md`:

1. Proposes file structure for Part A (16 markdown files under `docs/api-internal/`), Part B1 (`openapi.yaml`), Part B2 (`api-consumer-guide.md` with 14 sections).
2. Maps each module to a Part B1 paths section and a Part B2 capability section.
3. User approves.
4. Creates empty files with section headers and TODO markers.
5. Initializes `extraction-status.md` and `CHANGE-TRACKER.md`.

## Stage 2 — Global Infrastructure

Documents the request pipeline once: middleware order, validation pipe behavior, JWT guard behavior, response transformation, exception filter behavior. Captures error response shape (`{ statusCode, message, error, timestamp, path }`). These facts feed every endpoint's documentation in Stage 3.

`extraction-status.md` updated: 5 of 16 Part A files marked complete (overview + global infra).

## Stage 3 — Feature-by-Feature Extraction

For each of the 12 modules, extract:

- **Part A:** controller logic, service logic, repository patterns, business rules, domain model
- **Part B1:** OpenAPI paths, request/response schemas, error responses
- **Part B2:** capability narrative ("Place an order", "Cancel an order", "List orders by customer") with code snippets

Example for the `orders` module:

```
Endpoint POST /orders
  Source: src/orders/orders.controller.ts:42 — @Post() createOrder()
  Request DTO: src/orders/dto/create-order.dto.ts
  Response DTO: src/orders/dto/order-response.dto.ts
  Service: src/orders/orders.service.ts:78 — async create(dto, user)
  Errors thrown: BadRequestException (validation),
                 ConflictException (duplicate idempotency-key),
                 ForbiddenException (user lacks 'orders:create')
```

After each module, runs the inner verification: do all three parts agree?

## Stage 4 — Consumer Documentation

Completes Part B2 cross-cutting sections:
- Getting Started (base URL, first request)
- Authentication (JWT issuance, refresh, scopes)
- Pagination (cursor-based, `?cursor=xxx&limit=50`)
- Error Handling (canonical error shape, retry guidance)

Completes Part B1 cross-cutting OpenAPI components: shared schemas, security schemes, servers.

## Stage 5 — Verification and Finalization

Runs `steps/verify.md`:

- Completeness check: 78/78 endpoints documented; 14/14 entities; 12/12 modules. Pass.
- Accuracy check: spot-checked 8 random endpoints. 1 failure — `GET /orders/:id` documented as returning `Order` entity, but actually returns `OrderResponseDto` (omits `internalNotes` field). Corrected.
- Consistency check: Pass after correction.
- Change-tracking check: 14 sessions logged, all with Parts Affected and source version. Pass.
- Domain checks: spectral lints `openapi.yaml` — clean. Companion guide covers all required sections. Pass.

Verification report: 1 failure, 0 warnings, all corrections applied. GO.

Final commit. CHANGE-TRACKER.md sealed at version `2.4.1-doc.1`.

## Outputs

```
~/code/orderhub-backend/docs/api-internal/        ← Part A (stays here)
  ├── 01-api-overview.md
  ├── 02-environment-and-configuration.md
  ├── 03-layered-architecture.md
  ├── ... (13 more)
  ├── extraction-status.md
  └── CHANGE-TRACKER.md

~/code/orderhub-knowledge-base/source-docs/orderhub-api/
  ├── openapi.yaml                                ← Part B1
  └── api-consumer-guide.md                       ← Part B2
```

## Hand-off

Skill emits:

> "Reverse-engineering of orderhub-api is complete. Next, run `build-knowledge-base` to aggregate the Part B outputs into the central KB index. Trigger phrase: *'Build the knowledge base from the reverse-engineered repos.'*"
