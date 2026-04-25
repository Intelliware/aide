---
slug: mapping-openapi-contract-internal-implementation
title: "Mapping: OpenAPI Contract → Internal Implementation"
applies-to: [re-api-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 130
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
