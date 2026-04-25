# [API Name] — Internal Documentation for AI-Assisted Development

> **Purpose of this document:** This documentation covers the internal architecture, implementation patterns, and conventions of [API Name]. It is designed to enable AI assistants to correctly implement new features, endpoints, and services within this codebase.
>
> **What this document is NOT:** This is not the API contract. The external contract (endpoints, request/response schemas, status codes) is defined in the OpenAPI 3.x specification located at `[path/to/openapi.yaml]`. This document describes how to *implement* that contract.
>
> **Documentation version:** [e.g., 2.1.0]
> **API version:** [e.g., 3.4.x]
> **Last updated:** [date]

---

## Table of Contents

### Part 1 — Foundation
1. [API Overview](#1-api-overview)
2. [Environment and Configuration](#2-environment-and-configuration)
3. [Mapping: OpenAPI Contract → Internal Implementation](#3-mapping-openapi-contract--internal-implementation)

### Part 2 — Architecture
4. [Layered Architecture](#4-layered-architecture)
5. [Project Structure and Conventions](#5-project-structure-and-conventions)
6. [Dependency Injection and Service Registration](#6-dependency-injection-and-service-registration)

### Part 3 — Request Pipeline
7. [Middleware and Request Pipeline](#7-middleware-and-request-pipeline)
8. [Authentication and Authorization Internals](#8-authentication-and-authorization-internals)
9. [Request Validation and Transformation](#9-request-validation-and-transformation)
10. [Error Handling and Problem Details](#10-error-handling-and-problem-details)

### Part 4 — Business Logic
11. [Service Layer Patterns](#11-service-layer-patterns)
12. [Domain Models and Business Rules](#12-domain-models-and-business-rules)
13. [Cross-Cutting Concerns](#13-cross-cutting-concerns)

### Part 5 — Data Layer
14. [Database and ORM](#14-database-and-orm)
15. [Repository / Data Access Patterns](#15-repository--data-access-patterns)
16. [Migrations and Schema Management](#16-migrations-and-schema-management)
17. [Caching](#17-caching)

### Part 6 — Infrastructure
18. [Background Jobs and Async Processing](#18-background-jobs-and-async-processing)
19. [Inter-Service Communication](#19-inter-service-communication)
20. [File Storage and External Integrations](#20-file-storage-and-external-integrations)
21. [Observability: Logging, Metrics, and Tracing](#21-observability-logging-metrics-and-tracing)

### Part 7 — Quality
22. [Testing](#22-testing)
23. [Security Implementation](#23-security-implementation)
24. [Performance Patterns and Constraints](#24-performance-patterns-and-constraints)

### Part 8 — Operations
25. [Build, Deploy, and Runtime](#25-build-deploy-and-runtime)
26. [Feature Flags and Toggles](#26-feature-flags-and-toggles)

### Part 9 — Reference
27. [Anti-Patterns](#27-anti-patterns)
28. [New Endpoint / Feature Checklist](#28-new-endpoint--feature-checklist)
29. [Internal Types and Shared Models](#29-internal-types-and-shared-models)
30. [Glossary](#30-glossary)
31. [Appendix A: Complete Feature Implementation Walkthrough](#appendix-a-complete-feature-implementation-walkthrough)

---

# Part 1 — Foundation

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

---

## 2. Environment and Configuration

### 2.1 Prerequisites

| Dependency             | Required Version | Notes                                |
|------------------------|------------------|--------------------------------------|
| [Language/Runtime]     | [e.g., Node 20.x]| [e.g., "LTS only."]                 |
| [Package manager]      | [e.g., pnpm 9.x] |                                      |
| [Database]             | [e.g., PostgreSQL 16] |                                  |
| [Cache]                | [e.g., Redis 7.x] |                                     |
| [Message broker]       | [e.g., RabbitMQ 3.13] |                                  |
| [Other infra]          | [version]        | [notes]                              |

### 2.2 Local Development Setup

```bash
# Step-by-step commands to go from git clone to running locally
# 1. Clone and install
git clone [repo]
cd [repo]
[install command, e.g., pnpm install]

# 2. Start infrastructure (database, cache, etc.)
[e.g., docker compose up -d]

# 3. Run migrations
[e.g., pnpm run migrate]

# 4. Seed development data (if applicable)
[e.g., pnpm run seed]

# 5. Start the API
[e.g., pnpm run dev]

# 6. Verify
[e.g., curl http://localhost:3000/health]
```

### 2.3 Configuration Management

<!-- How configuration is loaded, structured, and accessed in code. -->

- **Configuration source:** [e.g., "Environment variables loaded via `.env` files, validated at startup with Zod schemas."]
- **Configuration access pattern:** [e.g., "Injected via `ConfigService`, never read from `process.env` directly."]

**Configuration schema:**

```typescript
// The complete configuration type/schema — showing every config key the app uses.
// AI needs this to know what config is available when implementing features.

interface AppConfig {
  port: number;                       // Default: 3000
  nodeEnv: 'development' | 'staging' | 'production';

  database: {
    host: string;
    port: number;                     // Default: 5432
    name: string;
    user: string;
    password: string;                 // Source: DB_PASSWORD env var
    poolSize: number;                 // Default: 10
    ssl: boolean;                     // Default: true in production
  };

  redis: {
    host: string;
    port: number;                     // Default: 6379
    password?: string;
  };

  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;             // Default: '15m'
    refreshTokenExpiresIn: string;    // Default: '7d'
  };

  // ... document EVERY config key
}
```

**Environment variable mapping:**

| Config Key              | Env Variable          | Required | Default            |
|-------------------------|-----------------------|----------|--------------------|
| `database.host`         | `DB_HOST`             | Yes      | —                  |
| `database.port`         | `DB_PORT`             | No       | `5432`             |
| `auth.jwtSecret`        | `JWT_SECRET`          | Yes      | —                  |
| [key]                   | [env var]             | [y/n]    | [default]          |

### 2.4 Environment-Specific Behaviors

| Behavior                        | Development            | Staging                | Production             |
|---------------------------------|------------------------|------------------------|------------------------|
| [e.g., "SQL query logging"]     | [Enabled — verbose]    | [Enabled — slow only]  | [Disabled]             |
| [e.g., "Email sending"]         | [Mocked / logged]      | [Sandbox provider]     | [Live provider]        |
| [e.g., "Rate limiting"]         | [Disabled]             | [Enabled — relaxed]    | [Enabled — strict]     |
| [e.g., "CORS origins"]          | [`localhost:*`]        | [`staging.example.com`]| [`app.example.com`]    |
| [behavior]                      | [dev]                  | [staging]              | [prod]                 |

---

## 3. Mapping: OpenAPI Contract → Internal Implementation

<!-- This is the bridge section. AI needs to understand how an OpenAPI operation maps to files and functions in the codebase. -->

### 3.1 Mapping Convention

<!-- Describe the general pattern. -->

| OpenAPI Concept           | Internal Implementation                                           |
|---------------------------|-------------------------------------------------------------------|
| Path (e.g., `/products`)  | [e.g., "Controller file: `src/features/products/products.controller.ts`"] |
| Operation (e.g., `GET /products`) | [e.g., "Controller method: `ProductsController.findAll()`"]|
| Request body schema       | [e.g., "DTO class: `CreateProductDto` in `products/dto/`"]       |
| Response schema           | [e.g., "Response DTO: `ProductResponseDto` in `products/dto/`"]  |
| Path parameters           | [e.g., "Extracted by framework decorator, validated in pipe/middleware."] |
| Query parameters          | [e.g., "Query DTO: `ListProductsQueryDto` in `products/dto/`"]   |
| Security scheme           | [e.g., "Guard/middleware: `AuthGuard` applied at controller or route level."] |
| Tags                      | [e.g., "Map 1:1 to feature modules/folders."]                    |

### 3.2 Concrete Example

**OpenAPI operation:**
```yaml
# What the spec says
GET /api/v1/products
  parameters:
    - name: page
    - name: limit
    - name: category
  responses:
    200: PaginatedProductListResponse
    401: UnauthorizedError
```

**Maps to these internal files:**

| File                                                 | Role                                            |
|------------------------------------------------------|-------------------------------------------------|
| `src/features/products/products.controller.ts`       | Route handler — `findAll()` method              |
| `src/features/products/dto/list-products.query.ts`   | Query parameter validation and typing           |
| `src/features/products/dto/product.response.ts`      | Response shape serialization                    |
| `src/features/products/products.service.ts`          | Business logic — filtering, authorization       |
| `src/features/products/products.repository.ts`       | Database query — SQL/ORM                        |
| `src/features/products/models/product.entity.ts`     | Database entity / table mapping                 |

### 3.3 How DTOs Relate to OpenAPI Schemas

<!-- This is a frequent source of confusion. Be explicit about whether DTOs ARE the OpenAPI schemas (auto-generated) or are separate (manually kept in sync). -->

- **Approach:** [e.g., "DTOs are the source of truth — OpenAPI spec is auto-generated from DTO decorators using `@nestjs/swagger`."]
- **OR:** [e.g., "OpenAPI spec is the source of truth — DTOs are generated from the spec using `openapi-generator`."]
- **OR:** [e.g., "Both are maintained manually and must be kept in sync. Run `pnpm run validate:api` to check for drift."]

```typescript
// Example: how a DTO is defined and how it relates to the OpenAPI schema
```

---

# Part 2 — Architecture

---

## 4. Layered Architecture

### 4.1 Layer Diagram

<!-- Show the layers and the rules governing dependencies between them. -->

```
┌─────────────────────────────────────────────────┐
│  TRANSPORT LAYER (Controllers / Route Handlers)  │  ← HTTP concerns only
│  - Receives requests, returns responses          │  ← Calls Service layer
│  - Request validation (DTOs)                     │  ← No business logic here
│  - Response serialization                        │
├─────────────────────────────────────────────────┤
│  SERVICE LAYER (Business Logic)                  │  ← Orchestrates domain operations
│  - Business rules and workflows                  │  ← Calls Repository layer
│  - Authorization decisions                       │  ← May call other services
│  - Transaction coordination                      │  ← No HTTP or DB concerns
├─────────────────────────────────────────────────┤
│  REPOSITORY / DATA ACCESS LAYER                  │  ← Database interaction only
│  - Queries and mutations                         │  ← Returns domain entities
│  - Query building                                │  ← No business logic
│  - Raw SQL / ORM calls                           │
├─────────────────────────────────────────────────┤
│  DOMAIN MODELS / ENTITIES                        │  ← Pure data structures + invariants
│  - Entity definitions                            │  ← No infrastructure dependencies
│  - Value objects                                 │
│  - Domain-level validation                       │
├─────────────────────────────────────────────────┤
│  INFRASTRUCTURE / EXTERNAL                       │  ← Third-party integrations
│  - Email, file storage, payment gateways         │  ← Wrapped in service interfaces
│  - Message brokers, external APIs                │
└─────────────────────────────────────────────────┘
```

### 4.2 Dependency Rules

<!-- These rules are critical. AI models that violate layer boundaries produce hard-to-maintain code. -->

| Rule                                                           | Violation Example                                    |
|----------------------------------------------------------------|------------------------------------------------------|
| Controllers NEVER access repositories directly.                | `controller.ts` importing `products.repository.ts`   |
| Controllers NEVER contain business logic.                      | `if (user.role === 'admin')` inside a controller     |
| Services NEVER import HTTP-specific types (Request, Response). | `import { Request } from 'express'` in a service     |
| Repositories NEVER call other repositories.                    | `ProductRepo` calling `CategoryRepo` internally      |
| Domain models NEVER import infrastructure code.                | Entity importing a database client or HTTP library    |
| [Additional rule]                                               | [Example violation]                                  |

### 4.3 What Goes Where — Decision Guide

| I need to...                               | It goes in...              | File pattern                              |
|--------------------------------------------|----------------------------|-------------------------------------------|
| Parse/validate an incoming HTTP request     | Controller / DTO           | `feature/dto/create-thing.dto.ts`         |
| Decide if the user can perform an action    | Service (or Guard)         | `feature/feature.service.ts`              |
| Orchestrate a multi-step business operation | Service                    | `feature/feature.service.ts`              |
| Run a database query                        | Repository                 | `feature/feature.repository.ts`           |
| Define a reusable DB query fragment         | Repository helper          | `feature/queries/thing-filters.query.ts`  |
| Define the shape of a DB table row          | Entity / Model             | `feature/models/thing.entity.ts`          |
| Send an email or call an external API       | Infrastructure service     | `infrastructure/email/email.service.ts`   |
| Schedule something for later                | Job / Queue producer       | `feature/jobs/thing-sync.job.ts`          |
| Transform data for the API response         | Response DTO / Serializer  | `feature/dto/thing.response.ts`           |
| [task]                                       | [layer]                    | [file pattern]                            |

---

## 5. Project Structure and Conventions

### 5.1 Directory Structure

```
src/
├── main.ts                        # Application entry point / bootstrap.
├── app.module.ts                  # Root module (or equivalent composition root).
│
├── config/                        # Configuration schemas and loaders.
│   ├── app.config.ts              #   Main config schema and validation.
│   ├── database.config.ts         #   DB-specific configuration.
│   └── [topic].config.ts
│
├── common/                        # Shared infrastructure used across all features.
│   ├── decorators/                #   Custom decorators (e.g., @CurrentUser, @Roles).
│   ├── dto/                       #   Shared DTOs (pagination, sorting, common responses).
│   │   ├── pagination.dto.ts
│   │   └── sort.dto.ts
│   ├── exceptions/                #   Custom exception classes.
│   │   ├── business.exception.ts
│   │   └── not-found.exception.ts
│   ├── filters/                   #   Exception/error filters (global error handler).
│   ├── guards/                    #   Auth guards, role guards.
│   ├── interceptors/              #   Logging, transform, timeout interceptors.
│   ├── middleware/                 #   Express/Koa middleware (if applicable).
│   ├── pipes/                     #   Validation pipes, transformation pipes.
│   ├── types/                     #   Shared TypeScript types/interfaces.
│   └── utils/                     #   Pure utility functions (no side effects).
│
├── database/                      # Database infrastructure.
│   ├── migrations/                #   Schema migrations (timestamped).
│   │   ├── 20240101_001_create_users.ts
│   │   └── 20240115_002_create_products.ts
│   ├── seeds/                     #   Development seed data.
│   ├── connection.ts              #   DB connection setup.
│   └── transaction.ts             #   Transaction helper / wrapper.
│
├── infrastructure/                # External service integrations.
│   ├── email/
│   │   ├── email.service.ts       #   Interface + implementation.
│   │   └── templates/             #   Email templates.
│   ├── storage/
│   │   └── file-storage.service.ts
│   ├── queue/
│   │   └── queue.service.ts
│   └── [integration-name]/
│
├── features/                      # Feature modules — one folder per domain concept.
│   └── [feature-name]/            #   e.g., products/, users/, orders/
│       ├── [feature].controller.ts          # Route handlers.
│       ├── [feature].service.ts             # Business logic.
│       ├── [feature].repository.ts          # Data access.
│       ├── [feature].module.ts              # Module registration (if applicable).
│       ├── dto/                             # Feature-specific DTOs.
│       │   ├── create-[feature].dto.ts      #   Request: creation.
│       │   ├── update-[feature].dto.ts      #   Request: update.
│       │   ├── list-[feature].query.ts      #   Request: query params for list.
│       │   └── [feature].response.ts        #   Response serialization.
│       ├── models/                          # Domain entities and value objects.
│       │   └── [feature].entity.ts
│       ├── jobs/                            # Background jobs for this feature.
│       │   └── [feature]-sync.job.ts
│       ├── events/                          # Domain events (if using event-driven patterns).
│       │   └── [feature]-created.event.ts
│       └── __tests__/                       # Feature-specific tests.
│           ├── [feature].controller.spec.ts
│           ├── [feature].service.spec.ts
│           └── [feature].repository.spec.ts
│
└── test/                          # Test infrastructure and E2E tests.
    ├── setup.ts                   #   Global test setup.
    ├── helpers/                   #   Test factories, fixtures, utilities.
    │   ├── factories/             #     Entity factories (e.g., createTestProduct()).
    │   ├── fixtures/              #     Seed data for integration tests.
    │   └── mocks/                 #     Shared mock implementations.
    └── e2e/                       #   End-to-end API tests.
        └── products.e2e.spec.ts
```

### 5.2 Naming Conventions

| Artifact               | Convention                          | Example                              |
|------------------------|-------------------------------------|--------------------------------------|
| Feature folders        | [e.g., kebab-case, plural noun]     | `products/`, `user-profiles/`        |
| Controller files       | [convention]                        | `products.controller.ts`             |
| Service files          | [convention]                        | `products.service.ts`                |
| Repository files       | [convention]                        | `products.repository.ts`             |
| DTO files (create)     | [convention]                        | `create-product.dto.ts`              |
| DTO files (update)     | [convention]                        | `update-product.dto.ts`              |
| DTO files (response)   | [convention]                        | `product.response.ts`                |
| DTO files (query)      | [convention]                        | `list-products.query.ts`             |
| Entity/Model files     | [convention]                        | `product.entity.ts`                  |
| Migration files        | [convention]                        | `20240115_002_create_products.ts`    |
| Test files             | [convention]                        | `products.service.spec.ts`           |
| Job files              | [convention]                        | `product-sync.job.ts`                |
| Event files            | [convention]                        | `product-created.event.ts`           |
| Interface files        | [convention]                        | [example]                            |
| Constants              | [convention]                        | [example]                            |

### 5.3 Import Conventions and Path Aliases

```jsonc
// tsconfig paths (or equivalent for your language)
{
  "paths": {
    "@config/*":         ["src/config/*"],
    "@common/*":         ["src/common/*"],
    "@features/*":       ["src/features/*"],
    "@infrastructure/*": ["src/infrastructure/*"],
    "@database/*":       ["src/database/*"],
    "@test/*":           ["test/*"]
  }
}
```

**Import ordering convention:**
```typescript
// 1. Language/framework imports
import { Injectable } from '@nestjs/common';

// 2. Third-party library imports
import { z } from 'zod';

// 3. Internal alias imports — infrastructure and common
import { DatabaseService } from '@database/connection';
import { PaginationDto } from '@common/dto/pagination.dto';

// 4. Relative feature imports
import { ProductEntity } from './models/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
```

---

## 6. Dependency Injection and Service Registration

### 6.1 DI Framework

- **DI system:** [e.g., "NestJS built-in DI", "tsyringe", "Inversify", "ASP.NET Core DI", "Manual composition root"]
- **Registration location:** [e.g., "Each feature's `.module.ts` file. Infrastructure services in `app.module.ts`."]

### 6.2 Registration Patterns

```typescript
// Example: how to register a new service
```

```typescript
// Example: how to register an infrastructure service with an interface token
```

### 6.3 Service Lifetimes

| Lifetime      | When to use                                             | Example                                |
|---------------|---------------------------------------------------------|----------------------------------------|
| Singleton     | [e.g., "Stateless services, config, connection pools."] | `DatabaseService`, `ConfigService`     |
| Scoped        | [e.g., "Per-request state, unit-of-work."]              | `RequestContext`, `UnitOfWork`         |
| Transient     | [e.g., "Stateful helpers that shouldn't be shared."]    | `QueryBuilder` instances               |

### 6.4 Common Mistakes

- [e.g., "Injecting a scoped service into a singleton causes captured dependency bugs."]
- [e.g., "Circular dependencies must be resolved with `forwardRef()` — but prefer restructuring."]

---

# Part 3 — Request Pipeline

---

## 7. Middleware and Request Pipeline

### 7.1 Pipeline Diagram

<!-- The exact order that a request flows through. AI must understand this to know what's available at each stage. -->

```
Client Request
  │
  ▼
[1. Global Middleware]        ← CORS, body parsing, request ID, rate limiting
  │
  ▼
[2. Authentication]           ← JWT verification, session lookup → sets req.user
  │
  ▼
[3. Route Matching]           ← Framework resolves controller + method
  │
  ▼
[4. Guards / Authorization]   ← Role checks, permission checks, resource ownership
  │
  ▼
[5. Validation Pipes]         ← DTO validation, type coercion, sanitization
  │
  ▼
[6. Interceptors (pre)]       ← Logging, timeout, transformation
  │
  ▼
[7. Controller Method]        ← Handler executes → calls Service
  │
  ▼
[8. Interceptors (post)]      ← Response transformation, serialization
  │
  ▼
[9. Exception Filters]        ← Catches any thrown errors → formats error response
  │
  ▼
Client Response
```

### 7.2 Global Middleware

| Order | Middleware                | Purpose                                       | Configuration Location              |
|-------|--------------------------|-----------------------------------------------|-------------------------------------|
| 1     | [e.g., `cors`]           | [CORS handling.]                              | [e.g., `main.ts`]                  |
| 2     | [e.g., `helmet`]         | [Security headers.]                           | [e.g., `main.ts`]                  |
| 3     | [e.g., `requestId`]      | [Attaches UUID to every request.]             | [e.g., `common/middleware/`]        |
| 4     | [e.g., `requestLogger`]  | [Logs method, path, duration.]                | [e.g., `common/middleware/`]        |
| 5     | [e.g., `rateLimiter`]    | [Rate limiting per IP/user.]                  | [e.g., `common/middleware/`]        |
| [n]   | [middleware]              | [purpose]                                     | [location]                          |

### 7.3 How to Add New Middleware

```typescript
// Step-by-step: creating and registering new middleware
```

---

## 8. Authentication and Authorization Internals

### 8.1 Authentication Flow

<!-- How the API identifies who is making a request. -->

- **Mechanism:** [e.g., "JWT Bearer token in Authorization header."]
- **Token structure:**

```typescript
// What's inside the JWT / session object after authentication
interface AuthPayload {
  userId: string;
  email: string;
  roles: string[];
  organizationId: string;
  iat: number;
  exp: number;
}
```

- **Where it's set:** [e.g., "AuthMiddleware decodes the token and attaches it to `request.user`."]
- **How to access in code:**

```typescript
// Controller: accessing the current user
```

```typescript
// Service: accessing the current user (if passed through)
```

### 8.2 Authorization Model

<!-- RBAC, ABAC, per-resource, etc. -->

- **Model:** [e.g., "Role-based (RBAC) with per-resource ownership checks."]
- **Roles defined:** [e.g., `admin`, `manager`, `member`, `viewer`]

**Role hierarchy (if applicable):**
```
admin > manager > member > viewer
```

### 8.3 Applying Authorization

```typescript
// Example: protecting a route with role-based access
```

```typescript
// Example: resource-ownership check ("user can only edit their own posts")
```

### 8.4 Internal Service-to-Service Auth

<!-- If applicable — how internal services authenticate with each other. -->

```typescript
// Example: API key, service token, mTLS pattern
```

---

## 9. Request Validation and Transformation

### 9.1 Validation Approach

- **Library:** [e.g., "class-validator + class-transformer", "Zod", "Joi", "FluentValidation"]
- **Where validation runs:** [e.g., "Global validation pipe applied to all routes. DTOs are validated automatically."]

### 9.2 Writing a Request DTO with Validation

```typescript
// Complete example: a DTO with multiple validation rules, demonstrating:
// - Required fields
// - Optional fields with defaults
// - Type coercion (string → number for query params)
// - Nested objects
// - Arrays
// - Custom validation rules
// - Validation error messages
```

### 9.3 Query Parameter DTOs

```typescript
// Example: query params with type coercion, defaults, and pagination
```

### 9.4 Response DTOs / Serialization

<!-- How responses are shaped before being sent to the client. -->

```typescript
// Example: response DTO that excludes internal fields, transforms dates, etc.
```

### 9.5 Custom Validators

```typescript
// Pattern for creating reusable custom validators
```

### 9.6 File Upload Validation

```typescript
// If applicable: how file uploads are validated (size, type, etc.)
```

---

## 10. Error Handling and Problem Details

### 10.1 Error Strategy

- **Format:** [e.g., "RFC 7807 Problem Details", "Custom JSON envelope", "Framework default"]
- **Global handler location:** [e.g., `src/common/filters/http-exception.filter.ts`]

### 10.2 Standard Error Response Shape

```json
// The exact JSON shape every error response follows
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    { "field": "email", "message": "must be a valid email address" }
  ],
  "traceId": "abc-123-def"
}
```

### 10.3 Custom Exception Classes

<!-- Every custom exception the codebase uses. AI must throw the RIGHT exception type. -->

| Exception Class                    | HTTP Status | When to Throw                                    |
|------------------------------------|-------------|--------------------------------------------------|
| `NotFoundException`                | 404         | [Entity not found by ID.]                        |
| `BusinessRuleException`           | 422         | [Domain invariant violated.]                     |
| `ConflictException`               | 409         | [Duplicate unique constraint.]                   |
| `ForbiddenException`              | 403         | [Authenticated but not authorized.]              |
| `UnauthorizedException`           | 401         | [No valid authentication.]                       |
| `ValidationException`             | 400         | [Invalid request data — usually auto-thrown.]    |
| `ExternalServiceException`        | 502         | [Third-party integration failure.]               |
| `RateLimitException`              | 429         | [Too many requests.]                             |
| [exception]                        | [status]    | [when]                                           |

### 10.4 Throwing Exceptions — Correct Pattern

```typescript
// Example: throwing the right exception with the right message format
```

```typescript
// Anti-pattern: what NOT to do
```

### 10.5 Error Logging Behavior

<!-- Which errors are logged, at what level, and what context is attached. -->

| Error Type           | Log Level | Additional Context Logged            |
|----------------------|-----------|--------------------------------------|
| 4xx client errors    | `warn`    | [e.g., request path, user ID]        |
| 5xx server errors    | `error`   | [e.g., full stack trace, request body]|
| Unhandled exceptions | `fatal`   | [e.g., everything available]          |

---

# Part 4 — Business Logic

---

## 11. Service Layer Patterns

### 11.1 Service Structure

```typescript
// Canonical service skeleton showing:
// - Constructor injection
// - Standard method signatures (return types, error handling)
// - How transactions are used
// - How authorization is checked
```

### 11.2 Transaction Management

<!-- How and when to wrap operations in transactions. -->

- **Pattern:** [e.g., "Unit of Work injected per request", "Manual transaction wrapping via `TransactionService`", "Decorator-based `@Transactional()`"]

```typescript
// Example: wrapping a multi-step operation in a transaction
```

**When to use transactions:**
- [e.g., "Any operation that writes to more than one table."]
- [e.g., "Any operation that reads-then-writes (check-then-act)."]

**When NOT to use transactions:**
- [e.g., "Read-only operations."]
- [e.g., "Single-row inserts/updates (already atomic)."]

### 11.3 Service-to-Service Calls

<!-- How one feature's service calls another within the same codebase. -->

```typescript
// Example: OrderService calling ProductService to check stock
```

**Rules:**
- [e.g., "Services may only call other services, never other repositories directly."]
- [e.g., "Avoid circular service dependencies — extract shared logic to a common service."]

### 11.4 Method Naming Conventions

| Operation              | Method Name Pattern       | Example                              |
|------------------------|---------------------------|--------------------------------------|
| Get one by ID          | `findById(id)`            | `findById(productId: string)`        |
| Get one with conditions| `findOne(criteria)`       | `findOneBySlug(slug: string)`        |
| Get list / search      | `findAll(query)`          | `findAll(query: ListProductsQuery)`  |
| Create                 | `create(dto)`             | `create(dto: CreateProductDto)`      |
| Update                 | `update(id, dto)`         | `update(id: string, dto: UpdateDto)` |
| Delete                 | `delete(id)` / `remove`   | `delete(id: string)`                 |
| Business action        | `[verb][Noun]()`          | `publishProduct(id)`, `approveOrder(id)` |
| Existence check        | `exists(criteria)`        | `existsByEmail(email: string)`       |

---

## 12. Domain Models and Business Rules

### 12.1 Entity Definition Pattern

```typescript
// Canonical entity showing:
// - All fields with types
// - Audit fields (createdAt, updatedAt, createdBy)
// - Soft delete (if used)
// - Relationships / foreign keys
// - Any domain methods on the entity
```

### 12.2 Value Objects

<!-- If the codebase uses value objects (e.g., Money, Email, Address). -->

```typescript
// Example value object
```

### 12.3 Entity Relationships and How They're Loaded

| Entity A       | Relationship | Entity B       | Loading Strategy                             |
|----------------|-------------|----------------|----------------------------------------------|
| `Product`      | has many    | `ProductImage` | [e.g., "Eager loaded via JOIN in repository."]|
| `Order`        | belongs to  | `User`         | [e.g., "Lazy — loaded separately when needed."]|
| `Order`        | has many    | `OrderItem`    | [e.g., "Always loaded with order."]           |
| [entity]       | [relation]  | [entity]       | [strategy]                                    |

### 12.4 Business Rule Implementation Pattern

```typescript
// Example: where business rules live (in the entity? in the service?) and how they're enforced.
// Show a real example like "an order cannot be cancelled if it's already shipped."
```

### 12.5 Domain Events (if applicable)

```typescript
// How domain events are defined, dispatched, and handled
```

---

## 13. Cross-Cutting Concerns

### 13.1 Audit Logging

<!-- How create/update/delete actions are tracked. -->

```typescript
// Example: how audit fields are populated (middleware? ORM hook? explicit in service?)
```

### 13.2 Soft Delete

<!-- If the codebase uses soft delete, document exactly how it works. -->

- **Approach:** [e.g., "`deletedAt` timestamp column. All queries filter `WHERE deletedAt IS NULL` by default."]
- **Hard delete:** [e.g., "Never. Soft delete only, enforced at the repository base class."]

```typescript
// Example: how soft delete is implemented in queries
```

### 13.3 Multi-Tenancy (if applicable)

<!-- How tenant isolation is enforced. -->

```typescript
// Example: how tenant ID is injected into queries
```

### 13.4 Pagination

<!-- The standard pagination pattern used everywhere. -->

```typescript
// Request DTO
```

```typescript
// Response envelope
```

```typescript
// Repository implementation
```

### 13.5 Sorting and Filtering

```typescript
// Standard pattern for dynamic sort/filter
```

---

# Part 5 — Data Layer

---

## 14. Database and ORM

### 14.1 Database Details

- **Database:** [e.g., "PostgreSQL 16"]
- **ORM / Query tool:** [e.g., "Prisma", "TypeORM", "Knex", "Drizzle", "raw pg", "Entity Framework Core"]
- **Schema definition:** [e.g., "Prisma schema at `prisma/schema.prisma`", "TypeORM entities decorated with `@Entity()`"]
- **Connection management:** [e.g., "Connection pool managed by `DatabaseService`, max 10 connections."]

### 14.2 Table Naming Conventions

| Convention               | Example                        | Notes                            |
|--------------------------|--------------------------------|----------------------------------|
| Table names              | [e.g., snake_case, plural]     | `products`, `order_items`        |
| Column names             | [e.g., snake_case]             | `created_at`, `product_id`       |
| Primary keys             | [e.g., `id`, UUID or serial]   | `id UUID DEFAULT gen_random_uuid()` |
| Foreign keys             | [e.g., `[table]_id`]           | `product_id`, `user_id`          |
| Indexes                  | [e.g., `idx_[table]_[columns]`]| `idx_products_category_id`       |
| Unique constraints       | [e.g., `uq_[table]_[columns]`] | `uq_users_email`                 |
| Junction tables          | [e.g., alphabetical]           | `product_tags`                   |

### 14.3 Standard Column Patterns

<!-- Columns that appear on every (or most) tables. -->

```sql
-- Standard columns present on all tables
id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
created_by  UUID        REFERENCES users(id),
-- If soft delete:
deleted_at  TIMESTAMPTZ NULL,
```

### 14.4 ORM Configuration and Conventions

```typescript
// Key ORM configuration (connection, logging, naming strategy, etc.)
```

---

## 15. Repository / Data Access Patterns

### 15.1 Base Repository (if applicable)

```typescript
// If there's a base repository class or set of reusable query methods, show it here.
```

### 15.2 Writing a Repository

```typescript
// Canonical repository example showing:
// - Standard CRUD methods
// - Parameterized queries (SQL injection prevention)
// - Joins and eager loading
// - Pagination implementation
// - Filter/sort implementation
// - Transaction participation
```

### 15.3 Query Patterns

**Simple query:**
```typescript
// Example: find by ID
```

**Query with joins:**
```typescript
// Example: load entity with related data
```

**Query with dynamic filters:**
```typescript
// Example: applying optional filter criteria
```

**Aggregate query:**
```typescript
// Example: count, sum, grouped results
```

**Batch operations:**
```typescript
// Example: bulk insert, bulk update
```

### 15.4 N+1 Query Prevention

<!-- This is one of the most dangerous AI mistakes. Be explicit. -->

```typescript
// ANTI-PATTERN: N+1 query
// CORRECT PATTERN: eager loading / batch loading
```

### 15.5 Raw SQL Conventions (if applicable)

```typescript
// How raw SQL is written, parameterized, and where it lives
```

---

## 16. Migrations and Schema Management

### 16.1 Migration Tool

- **Tool:** [e.g., "Prisma Migrate", "TypeORM migrations", "Knex migrations", "Flyway", "custom"]
- **Migration directory:** [e.g., `src/database/migrations/`]

### 16.2 Creating a Migration

```bash
# Command to generate a new migration
[e.g., npx prisma migrate dev --name add_products_table]
```

### 16.3 Migration File Conventions

```typescript
// Example migration file — complete and correct
```

### 16.4 Migration Rules

- [e.g., "Migrations must be backward-compatible — never drop a column that's still read by the current deployed version."]
- [e.g., "Every migration must be reversible (include a `down` function)."]
- [e.g., "Never modify a migration that has been merged to