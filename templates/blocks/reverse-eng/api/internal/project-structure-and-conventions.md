---
slug: project-structure-and-conventions
title: "Project Structure and Conventions"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 150
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
