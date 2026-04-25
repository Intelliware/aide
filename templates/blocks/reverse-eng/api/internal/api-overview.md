---
slug: api-overview
title: "API Overview"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 110
---

## 1. API Overview

### 1.1 What This API Is

- **Name:** [API Name]
- **Language / Runtime:** [e.g., TypeScript / Node.js 20.x, C# / .NET 8, Python 3.12 / FastAPI, Go 1.22]
- **Framework:** [e.g., NestJS, Express, ASP.NET Core, FastAPI, Gin]
- **Purpose:** [One or two sentences — e.g., "Backend API for the product management platform. Serves the admin dashboard and mobile apps."]
- **OpenAPI spec location:** `[e.g., docs/openapi.yaml, /api/swagger.json at runtime]`

### 1.2 Architecture Style

<!-- Monolith, modular monolith, microservice, serverless, etc. This shapes how the AI structures new code. -->

- **Architecture:** [e.g., "Modular monolith with vertical feature slices."]
- **API style:** [e.g., "REST", "GraphQL", "gRPC", "Mixed REST + GraphQL"]
- **Communication:** [e.g., "Synchronous HTTP between clients and API. Asynchronous messaging (RabbitMQ) between internal services."]

### 1.3 Key Architectural Decisions

<!-- The "why" behind the architecture. Short, factual. These prevent the AI from introducing patterns that conflict with deliberate design choices. -->

| Decision                                      | Rationale                                                   |
|-----------------------------------------------|-------------------------------------------------------------|
| [e.g., "No ORM — raw SQL with query builder"] | [e.g., "Performance-critical queries; need full SQL control."]|
| [e.g., "CQRS for read/write separation"]      | [e.g., "Read models are denormalized for dashboard perf."]  |
| [e.g., "No domain events between modules"]    | [e.g., "Simplicity; direct service calls within monolith."] |
| [decision]                                     | [rationale]                                                 |

### 1.4 Design Principles

- **Principle 1:** [e.g., "Explicit over magic — no auto-wiring, all dependencies registered manually."]
- **Principle 2:** [e.g., "Thin controllers — controllers validate and delegate, business logic lives in services."]
- **Principle 3:** [e.g., "Fail fast — invalid state is caught at the boundary, not deep in the domain."]
- **Principle 4:** [e.g., "Immutable DTOs — request and response objects are never mutated after creation."]
