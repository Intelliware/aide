---
slug: architecture-overview
title: "Architecture Overview"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 110
---

## 1. Architecture Overview

This block captures the framework's internal architecture from a maintainer's perspective: what subsystems exist, how a request flows from network entry to handler dispatch and back, and what cross-cutting machinery sits alongside that path. Read it before any deeper subsystem block — every later block assumes this skeleton. Verify by tracing a real request through the source: start at the network listener, follow it through routing, middleware, and the handler, and confirm the diagram matches reality.

For an API framework (e.g., Express, Fastify, NestJS, Koa, Hapi, FastAPI, Flask, Django REST, Spring Boot, ASP.NET Core, Rails, Phoenix, Gin, Echo, Axum, Actix), the internal view differs sharply from the consumer view. The consumer sees decorators / route handlers / DI hooks (under whatever names the framework uses); the maintainer sees the parser, dispatcher, lifecycle manager, plugin registry, and integration with the runtime. This block surfaces that internal anatomy and names the subsystems so subsequent blocks can refer to them precisely. Use the framework's own terminology — if the framework calls them "filters" rather than "middleware", record that.

### Suggested template content

**Identity:**

- **Framework name:** {{name}}
- **Repository:** {{repo-url}}
- **Language / runtime:** {{lang-runtime}}
- **Position in stack:** {{position — e.g. "HTTP application framework atop Node 'http'"}}
- **Distributed packages:** {{packages}}

**Subsystem map:**

```
                   ┌──────────────────────────────────────┐
                   │       Network Listener / Server      │  ← block: architecture-overview, source-layout
                   └──────────────────┬───────────────────┘
                                      │
                   ┌──────────────────▼───────────────────┐
                   │          Request Parser              │  ← block: request-parsing-and-validation
                   └──────────────────┬───────────────────┘
                                      │
                   ┌──────────────────▼───────────────────┐
                   │             Router                   │  ← block: routing-internals
                   └──────────────────┬───────────────────┘
                                      │
                   ┌──────────────────▼───────────────────┐
                   │       Middleware Pipeline            │  ← block: middleware-pipeline
                   └──────────────────┬───────────────────┘
                                      │
                   ┌──────────────────▼───────────────────┐
                   │     Handler Dispatch + DI Resolve    │  ← block: dependency-injection
                   └──────────────────┬───────────────────┘
                                      │
                   ┌──────────────────▼───────────────────┐
                   │       Response Serializer            │  ← block: response-serialization
                   └──────────────────┬───────────────────┘
                                      │
                   ┌──────────────────▼───────────────────┐
                   │       Error Handling Pipeline        │  ← block: error-handling-pipeline
                   └──────────────────────────────────────┘

Cross-cutting:
  - Configuration system        ← block: configuration-system
  - Logging                     ← block: logging-architecture
  - Plugin / extension registry ← block: plugin-extension-system
  - Observability hooks         ← block: observability-hooks
```

**Lifecycle phases:**

| Phase | Trigger | Responsibilities |
|---|---|---|
| Bootstrap | Process start | Load config, register plugins, build DI container, initialize router. |
| Listen | Server start | Bind socket(s), warm caches, run pre-start hooks. |
| Request | Per-request | Parse, route, dispatch, serialize, respond. |
| Shutdown | SIGTERM / signal | Drain in-flight, run pre-shutdown hooks, close resources. |

**Concurrency model:** {{model — e.g. "single event loop, async/await", "thread-per-connection", "actor model"}}

**Key invariants:**

- {{invariant-1 — e.g. "A request never bypasses the middleware pipeline; even error paths re-enter for normalization."}}
- {{invariant-2 — e.g. "DI scopes are resolved exactly once per scope boundary."}}
- {{invariant-3 — e.g. "Plugins cannot mutate core types after bootstrap."}}

**Where to start reading the source:**

1. `{{entry-point — e.g. src/server/listen.ts}}`
2. `{{router-source — e.g. src/router/index.ts}}`
3. `{{handler-dispatch-source}}`
4. `{{plugin-registry-source}}`

**Cross-references:**

- See source-layout block for the full module map.
- See conventions-and-idioms block for how the team writes code in this codebase.
