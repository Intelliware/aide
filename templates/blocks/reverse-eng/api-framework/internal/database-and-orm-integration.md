---
slug: database-and-orm-integration
title: "Database and ORM Integration"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, architect]
optional: true
order-hint: 230
---

## 13. Database and ORM Integration

If the framework provides built-in database support or ORM integration, document the integration layer here. Mark optional — many API frameworks intentionally avoid coupling to a database. Cover: connection pool management, transaction propagation, request-scoped sessions, and the ORM hooks (event listeners, query interceptors) that are exposed to plugins or user code.

If the framework merely exposes hooks for a third-party ORM / data-access layer (e.g., TypeORM, Prisma, Sequelize, MikroORM, Drizzle, Knex, Mongoose, SQLAlchemy, Django ORM, Hibernate / JPA, Entity Framework Core, Dapper, GORM, Diesel, Active Record, Ecto, etc.), document the adapter layer and what guarantees the framework adds (e.g., automatic per-request transaction binding, error translation). Verify by tracing one request that performs a write, especially around error handling — does a thrown error roll back automatically, or is it the user's responsibility?

### Suggested template content

**Integration mode:** {{mode — e.g. "Adapter for [ORM/data-access library]", "Built-in query builder", "Bring your own"}}

**Connection pool management:**

- Pool implementation: {{impl}}.
- Lifecycle: created in `beforeStart`, drained in `beforeShutdown`.
- Per-request acquisition: {{acquisition-policy — e.g. "lazy on first query, returned on response"}}.
- Pool sizing: read from config (`db.pool.min`, `db.pool.max`); validated at start.
- Health check: `db.ping()` runs every {{health-interval}}; failures marked in readiness probe.

**Source files:**

- Pool wrapper: `{{path}}`
- Request-scope binding: `{{path}}`
- Transaction manager: `{{path}}`
- ORM hooks: `{{path}}`

**Request-scoped session:**

- A DB session/connection is bound to `ctx.db` lazily.
- Session is released on response — success OR error.
- Plugins can intercept via `plugin.onSessionAcquire` / `onSessionRelease`.

**Transaction propagation:**

| Mode | Behavior |
|---|---|
| `none` (default) | Each query auto-commits |
| `per-request` | Implicit BEGIN on first query, COMMIT on success, ROLLBACK on error |
| `manual` | User opens `ctx.db.transaction(fn)` |

- Mode is configured per-route via decorator/middleware.
- Nested transactions use savepoints where supported; otherwise rejected.

**Error translation:**

- DB-specific errors (`UniqueViolation`, `ForeignKeyViolation`, deadlock retries) are mapped to framework error types via `{{translator-path}}`.
- Mapped errors flow through the standard error pipeline (see error-handling-pipeline block).
- Unmapped errors → `InternalError`; logged with full DB error and SQL.

**ORM hooks exposed to plugins:**

| Hook | When | Use case |
|---|---|---|
| `beforeQuery(sql, params)` | Pre-execute | Logging, query rewriting |
| `afterQuery(sql, params, rows, ms)` | Post-execute | Metrics, slow-query log |
| `onTransactionBegin(tx)` | Begin | Audit |
| `onTransactionCommit(tx)` | Commit | Outbox flush |
| `onTransactionRollback(tx)` | Rollback | Compensation |

**Migration support:**

- Built-in migration runner: {{yes-no-and-tool}}.
- See build-and-packaging block for migration distribution.

**Multi-tenancy:**

- Per-request tenant binding via `ctx.tenant.id` → automatic schema/database routing if configured.
- Tenant context flows through `AsyncLocalStorage` (or equivalent); no manual passing required.

**Plugin extension API:**

| Method | Purpose |
|---|---|
| `registerOrmAdapter(adapter)` | Replace default adapter |
| `addQueryInterceptor(fn)` | Inspect/rewrite queries |
| `mapDbError(predicate, mapper)` | Add error translation rule |

**Common pitfalls:**

- Holding a `ctx.db` reference past the response — connection is returned to pool; further use throws.
- Long-running queries inside per-request transactions — block the connection; rate-limit at the route level.
- Catching DB errors in middleware and returning a non-error response without rolling back — transaction commits dirty state.
- Concurrent queries on a single per-request session — most pools are not safe; use `Promise.all` only where the adapter explicitly supports it.

**Cross-references:**

- See dependency-injection block for how `ctx.db` is wired.
- See observability-hooks block for query metrics.
