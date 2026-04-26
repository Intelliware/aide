# reverse-engineer-api-framework — Worked Example

## Scenario

User has an internal NestJS-based framework (`@orderhub/api-framework` v3.1.0) used by ~6 service repos. It provides custom decorators (@Audited, @Idempotent), shared guards (@Tenant), a unified configuration loader, and a problem-details exception filter.

User says: *"Document the api framework at ~/code/orderhub-api-framework."*

## Stage 1 — Discovery and Inventory

Inventory output:

```
Decorators (public): @Audited, @Idempotent, @Tenant, @CurrentUser
Guards (public): TenantGuard, ScopedJwtGuard
Pipes (public): ZodValidationPipe
Interceptors (public): AuditLogInterceptor, IdempotencyInterceptor
Exception filters (public): ProblemDetailsFilter
Modules (public): CoreModule, ConfigModule, AuditModule, IdempotencyModule
Configuration options: 23 (12 with explicit defaults, 11 environment-driven)
DI tokens (public): 6 (CONFIG, LOGGER, TENANT_RESOLVER, AUDIT_SINK, IDEMPOTENCY_STORE, CLOCK)
Internal-only utilities: ~40 (omitted from Part B)
```

`steps/scaffold.md` proposes:

- Part A: 14 markdown files under `docs/api-framework-internal/`
- Part B: a single `api-framework-consumer.md` driven by the consumer composition

User approves. Scaffolding files created with TODO markers. CHANGE-TRACKER and extraction-status initialized.

## Stage 2 — Foundation

Documents the request-pipeline ordering: middleware (3 global) → ScopedJwtGuard → TenantGuard → ZodValidationPipe (per-handler) → handler → AuditLogInterceptor → IdempotencyInterceptor → ProblemDetailsFilter (on errors).

Documents the DI lifecycle: CONFIG and LOGGER are SINGLETON; TENANT_RESOLVER is REQUEST-scoped; AUDIT_SINK is SINGLETON.

These foundation facts inform every subsequent component documentation.

## Stage 3 — Component-by-Component Extraction

For each public component (e.g. `@Idempotent`):

- **Part A:** `src/idempotency/idempotent.decorator.ts` reads request header `Idempotency-Key`, resolves `IDEMPOTENCY_STORE` token, stores response with TTL = `config.idempotencyTtlSeconds` (default 86400). Internal cache implementation uses `node-cache` with eviction policy LRU.
- **Part B:** `@Idempotent({ ttlSeconds?: number })` — applies idempotency to a controller method. Requires the consumer to register an `IDEMPOTENCY_STORE` provider. Default TTL = 86400 seconds. Reads `Idempotency-Key` header.

Subset rule check: every Part B fact (decorator signature, requirement to register store, default TTL, header name) is also in Part A. Pass.

## Stage 4 — Patterns, Recipes, Migration

- Recipe: "Add audit logging to a controller" (uses `@Audited` + `AUDIT_SINK` provider).
- Recipe: "Build a multi-tenant service" (combines `TenantGuard` + `TENANT_RESOLVER`).
- Anti-pattern: "Don't bypass `ZodValidationPipe` with `@SkipValidation()`" — leaks unvalidated request bodies past the boundary.
- Migration: v2 → v3 — `IDEMPOTENCY_STORE` token replaced `IdempotencyService` injection.

## Stage 5 — Verification and Finalization

`steps/verify.md` runs:

- Completeness: all decorators, guards, pipes, interceptors, filters, modules, DI tokens documented in both parts. Pass.
- Accuracy: spot-checked 6 components. 1 failure — `ZodValidationPipe` documented as throwing `BadRequestException`, but actually throws `ValidationException` (a custom subclass). Corrected.
- Consistency / Subset rule: every Part B item exists in Part A. Pass.
- Domain checks: pipeline ordering documented; extension points have working examples; defaults verified against source. Pass.

Verification report: 1 failure, 0 warnings, all corrections applied. GO.

## Outputs

```
~/code/orderhub-api-framework/docs/api-framework-internal/   ← Part A
  ├── 01-framework-overview.md
  ├── 02-architecture.md
  ├── 03-request-pipeline.md
  ├── ... (11 more)
  ├── extraction-status.md
  └── CHANGE-TRACKER.md

~/code/orderhub-knowledge-base/source-docs/orderhub-api-fw/
  └── api-framework-consumer.md                              ← Part B
```

## Hand-off

> "Reverse-engineering of orderhub-api-fw is complete. Next, run `build-knowledge-base` to aggregate Part B into the central KB index."
