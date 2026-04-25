---
slug: layered-architecture
title: "Layered Architecture"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 140
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
