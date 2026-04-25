---
slug: internal-types-and-shared-models
title: "Internal Types and Shared Models"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 390
---

## 29. Internal Types and Shared Models

This section catalogs the API's internal type taxonomy: domain models (entities, value objects), DTOs (request/response), repository result shapes, and cross-cutting types (Result/Either, pagination wrappers, error envelopes). The downstream AI must reuse existing types rather than redefining parallel ones, and must know which types cross which architectural boundaries (e.g., a domain model must not leak through the controller boundary as a response — use a DTO).

Extract from the source: the location of each type category (`src/domain/`, `src/dto/`, `src/types/`, etc.), naming conventions, and any shared "primitive" wrappers (UserId branded types, Money value objects, OpaqueCursor). Identify which types are *generated* (from OpenAPI, Prisma, GraphQL schema) vs hand-written — generated types must not be edited directly.

To verify, pick a representative endpoint and trace every type from request bytes → DTO → domain model → repository row → domain model → response DTO → response bytes. Confirm there is *no* identity confusion (e.g., the same `User` class used as DTO and entity). Confirm shared utility types (Pagination, Result, Maybe) are imported, not redefined per feature.

Be careful about API-contract types vs internal types. The OpenAPI-generated types are the contract; the internal domain types are implementation. They should be related but not identical — confusing them locks the API to its current shape. Also be careful about TypeScript-only constructs (branded types, conditional types) that are convention rather than enforcement — document the convention so the AI knows to follow it.

Hallucination risks: do not invent types that don't exist; do not assume Result/Either patterns if the codebase uses thrown exceptions; do not document a value-object discipline the codebase doesn't actually maintain.

### Suggested template content

#### 29.1 Type Taxonomy

| Category | Location | Naming Convention | Example |
|----------|----------|-------------------|---------|
| Domain entity | `{{src/domain/<feature>/}}` | {{noun, PascalCase}} | `{{User}}` |
| Value object | `{{src/domain/<feature>/values/}}` | {{noun + suffix}} | `{{EmailAddress, Money}}` |
| Request DTO | `{{src/<feature>/dto/}}` | `{{<Verb><Noun>Dto}}` | `{{CreateUserDto}}` |
| Response DTO | `{{src/<feature>/dto/}}` | `{{<Noun>ResponseDto}}` | `{{UserResponseDto}}` |
| Repository row | `{{src/<feature>/repo/}}` | `{{<Noun>Row}}` | `{{UserRow}}` |
| Generated (OpenAPI) | `{{src/generated/openapi/}}` | {{from spec}} | `{{operations['createUser']}}` |
| Generated (DB) | `{{src/generated/db/}}` | {{from Prisma/sqlc}} | `{{Prisma.User}}` |

#### 29.2 Branded / Primitive Wrapper Types

```{{language}}
// e.g., branded IDs to prevent passing UserId where OrderId is expected
export type UserId = string & { readonly __brand: 'UserId' };
export const UserId = (s: string): UserId => s as UserId;
```

| Branded Type | Underlying | Source |
|--------------|------------|--------|
| `UserId` | `string` (UUID) | `{{src/types/ids.ts}}` |
| `OrderId` | `string` (UUID) | `{{src/types/ids.ts}}` |
| `Money` | `{ amount: bigint, currency: ISO4217 }` | `{{src/domain/money.ts}}` |

#### 29.3 Cross-Cutting Wrappers

```{{language}}
// Pagination wrapper used by every list endpoint
export interface Page<T> {
  items: T[];
  pageInfo: { nextCursor: string | null; hasMore: boolean };
}
```

```{{language}}
// Result type if the codebase uses Result rather than throwing
export type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

```{{language}}
// Standard error envelope (matches Section 10.2)
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Array<{ field: string; message: string }>;
}
```

#### 29.4 Boundary Translation Rules

- **HTTP → service:** request DTO is validated, then a service-input record is constructed. Service does not see the raw HTTP DTO.
- **Service → HTTP:** domain object is mapped to a response DTO before serialization. Domain object must not be returned directly.
- **Service → repository:** service may pass domain objects; repository converts to row shape internally.
- **Repository → service:** repository returns domain objects (or row + mapping function), never raw ORM models from outside the repo.

```{{language}}
// Example mapper between layers
{{example: toResponseDto(user: User): UserResponseDto}}
```

#### 29.5 Type Reuse Rules

- {{Reuse OpenAPI-generated types for request/response shapes — never redefine}}
- {{Reuse domain types for service-to-service calls within the codebase}}
- {{Never share a type between a domain entity and a DTO — they evolve independently}}

#### 29.6 Type-Safety Tools in Use

- {{TypeScript strict mode: yes}}
- {{`@typescript-eslint/strict`: yes}}
- {{Runtime validators: Zod (for parsing), io-ts, class-validator}}
- {{Code generation: openapi-typescript, prisma generate, etc.}}
