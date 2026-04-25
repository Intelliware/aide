# GraphQL API Design Standards

These are the baseline standards the AI uses when designing GraphQL schemas and operations. During Step 3 of the API design skill, the AI compares existing codebase conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new operations should follow the existing pattern or adopt the standard.

These standards are framework-agnostic. They apply whether the project uses Apollo Server, Hasura, Nexus, TypeGraphQL, graphene, or another library.

---

## 1. Schema Design

### Rules

- Schema-first approach is preferred — define the schema as a `.graphql` file, then implement resolvers
- Code-first (Nexus, TypeGraphQL) is acceptable if the team prefers it, but the generated schema should still follow these standards
- One schema file per domain area (e.g., `order.graphql`, `user.graphql`) composed into a single schema
- The schema is the contract — treat it with the same rigor as an OpenAPI spec

### Type Naming

- **Object types**: PascalCase, singular nouns: `Order`, `User`, `RefundLineItem`
- **Input types**: PascalCase, suffixed with `Input`: `CreateOrderInput`, `UpdateUserInput`
- **Enum types**: PascalCase: `OrderStatus`, `PaymentMethod`
- **Enum values**: UPPER_SNAKE_CASE: `PENDING`, `IN_PROGRESS`, `COMPLETED`
- **Fields**: camelCase: `createdAt`, `orderId`, `lineItems`
- **Query fields**: noun or noun phrase: `order`, `orders`, `currentUser`
- **Mutation fields**: verb + noun: `createOrder`, `updateUser`, `cancelRefund`
- **Subscription fields**: noun + past participle or descriptive: `orderStatusChanged`, `messageReceived`

### Correct

```graphql
type Order {
  id: ID!
  customer: User!
  status: OrderStatus!
  lineItems: [OrderLineItem!]!
  total: Money!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

input CreateOrderInput {
  customerId: ID!
  lineItems: [OrderLineItemInput!]!
}
```

### Incorrect

```graphql
type order { ... }                    # lowercase type name
type OrderType { ... }                # redundant "Type" suffix
input OrderData { ... }               # "Data" instead of "Input"
enum orderStatus { pending, ... }     # lowercase enum, lowercase values

type Mutation {
  order(input: OrderInput): Order     # verb missing from mutation name
}
```

---

## 2. Nullability

### Rules

- Fields that always have a value: **non-null** (`String!`, `Int!`, `[Item!]!`)
- Fields that may be absent: **nullable** (`String`, `DateTime`)
- List fields: use `[Item!]!` (non-null list of non-null items) as the default — an empty list `[]` is returned, never `null`
- ID fields are always non-null: `id: ID!`
- Input fields: required fields are non-null (`name: String!`), optional fields are nullable (`nickname: String`)

### Common Patterns

| Pattern | Type | Meaning |
|---------|------|---------|
| `[Order!]!` | Non-null list, non-null items | Returns `[]` if empty, never `null` |
| `[Order!]` | Nullable list, non-null items | May return `null` (avoid this — prefer empty list) |
| `[Order]!` | Non-null list, nullable items | Items in the list can be `null` (rarely appropriate) |
| `Order!` | Non-null object | Always present |
| `Order` | Nullable object | May be `null` (e.g., a lookup that may fail) |

### Rules

- Prefer non-null where possible — it makes the contract clearer
- Mutations should return non-null results on success (`createOrder: Order!`)
- Query fields that look up by ID may return nullable (`order(id: ID!): Order`) — the item might not exist

---

## 3. Query Design

### Rules

- Single-resource queries: accept `id: ID!`, return nullable type (might not exist)
- Collection queries: return a connection type (for pagination) or `[Type!]!` (for small, bounded lists)
- Avoid deeply nested queries that trigger excessive database joins — set a max query depth
- Use field arguments for filtering, not separate query fields for each filter combination

### Standard Patterns

```graphql
type Query {
  # Single resource by ID
  order(id: ID!): Order

  # Collection with pagination and filtering
  orders(
    first: Int
    after: String
    filter: OrderFilterInput
    orderBy: OrderOrderByInput
  ): OrderConnection!

  # Current authenticated user
  currentUser: User!
}
```

---

## 4. Mutation Design

### Rules

- Every mutation accepts a single `input` argument of a dedicated input type
- Every mutation returns a payload type (not the raw object) to allow for future extension
- Mutation names are verb + noun: `createOrder`, `updateUser`, `deleteRefund`

### Standard Pattern

```graphql
type Mutation {
  createOrder(input: CreateOrderInput!): CreateOrderPayload!
  updateOrder(input: UpdateOrderInput!): UpdateOrderPayload!
  deleteOrder(input: DeleteOrderInput!): DeleteOrderPayload!
  cancelOrder(input: CancelOrderInput!): CancelOrderPayload!
}

input CreateOrderInput {
  customerId: ID!
  lineItems: [OrderLineItemInput!]!
}

type CreateOrderPayload {
  order: Order!
}

input UpdateOrderInput {
  id: ID!
  status: OrderStatus
  shippingAddress: AddressInput
}

type UpdateOrderPayload {
  order: Order!
}
```

### Why Payload Types?

Using a payload type (`CreateOrderPayload`) instead of returning `Order!` directly allows:
- Adding `userErrors` or `errors` field later without breaking the schema
- Including additional context (e.g., `didSendNotification: Boolean`)
- Consistent structure across all mutations

### Error Handling in Mutations

Two standard approaches — choose one and apply consistently:

**Option A: Errors in the payload (recommended for expected business errors)**

```graphql
type CreateOrderPayload {
  order: Order
  userErrors: [UserError!]!
}

type UserError {
  field: [String!]
  message: String!
  code: ErrorCode!
}
```

**Option B: Union return types (stronger typing)**

```graphql
union CreateOrderResult = Order | ValidationError | NotFoundError

type ValidationError {
  message: String!
  fieldErrors: [FieldError!]!
}
```

### Rules

- Use GraphQL-level errors (the `errors` array) only for unexpected/infrastructure errors
- Use payload-level errors for expected business errors (validation, authorization, state conflicts)
- Never use the top-level `errors` array for validation failures — clients can't reliably parse them

---

## 5. Pagination

### Relay Connection Pattern (Recommended)

```graphql
type OrderConnection {
  edges: [OrderEdge!]!
  pageInfo: PageInfo!
  totalCount: Int
}

type OrderEdge {
  node: Order!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Query {
  orders(
    first: Int
    after: String
    last: Int
    before: String
  ): OrderConnection!
}
```

### Simple List (For Small, Bounded Collections)

```graphql
type Query {
  # Only for collections with a known upper bound (e.g., order statuses, user roles)
  orderStatuses: [OrderStatus!]!
}
```

### Rules

- Use the Relay connection pattern for any collection that could grow unbounded
- Use simple lists only for small, bounded collections (enums, config values)
- `first`/`after` for forward pagination, `last`/`before` for backward
- Server must enforce a maximum `first`/`last` value (e.g., 100)
- `totalCount` is optional — only include if it can be computed cheaply
- Cursors are opaque strings — clients must not parse or construct them

---

## 6. Subscriptions

### Rules

- Subscriptions are for real-time updates pushed from server to client
- Name subscriptions as nouns + event description: `orderStatusChanged`, `messageReceived`
- Subscriptions should accept filter arguments to scope what the client receives
- Always include an initial event on subscription (current state) if applicable

### Standard Pattern

```graphql
type Subscription {
  orderStatusChanged(orderId: ID!): OrderStatusEvent!
  messageReceived(channelId: ID!): Message!
}

type OrderStatusEvent {
  order: Order!
  previousStatus: OrderStatus!
  newStatus: OrderStatus!
  changedAt: DateTime!
}
```

### Rules

- Validate that the subscribing user is authorized to receive the events
- Define what happens when the underlying resource is deleted (send a terminal event, then end the subscription)
- Document the expected subscription lifecycle

---

## 7. Error Handling

### GraphQL Error Levels

| Level | When | How |
|-------|------|-----|
| **Top-level `errors` array** | Infrastructure errors: auth failure, query too complex, rate limited, internal error | GraphQL spec `errors` array with `extensions.code` |
| **Payload-level errors** | Business errors: validation failure, not found, state conflict | `userErrors` field or union types in the mutation payload |

### Standard Error Extensions

```json
{
  "errors": [
    {
      "message": "Not authenticated",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### Standard Error Codes (in extensions)

| Code | Meaning |
|------|---------|
| `UNAUTHENTICATED` | Missing or invalid authentication |
| `FORBIDDEN` | Authenticated but not authorized |
| `BAD_USER_INPUT` | Input validation failed |
| `NOT_FOUND` | Requested resource doesn't exist |
| `INTERNAL_SERVER_ERROR` | Unexpected server failure |
| `PERSISTED_QUERY_NOT_FOUND` | The persisted query ID is not recognized |
| `GRAPHQL_VALIDATION_FAILED` | The query itself is invalid GraphQL |

### Rules

- Never expose internal details (stack traces, SQL queries) in error messages
- Use consistent error codes across the schema
- For mutations with expected failure modes, prefer payload-level errors over top-level errors

---

## 8. Authentication and Authorization

### Rules

- Auth is typically handled at the context level — the token is extracted from the HTTP header and the user is placed in the resolver context
- Authorization is per-field or per-resolver, not per-query
- Use schema directives (`@auth`, `@hasRole`) or middleware/guards for declarative authorization
- Document which fields/operations require authentication and which roles are needed

### Standard Patterns

```graphql
# Directive-based (schema-level)
directive @auth(requires: Role!) on FIELD_DEFINITION

type Mutation {
  createOrder(input: CreateOrderInput!): CreateOrderPayload! @auth(requires: USER)
  deleteUser(id: ID!): DeleteUserPayload! @auth(requires: ADMIN)
}

# Or resolver-level checks (code-level)
# Documented in the schema with comments
"""
Requires authentication. Users can only access their own orders.
Admins can access any order.
"""
type Query {
  order(id: ID!): Order
}
```

---

## 9. Performance and Security

### Query Complexity and Depth Limiting

- Set a maximum query depth (e.g., 10 levels) to prevent deeply nested queries
- Set a maximum query complexity score based on field weights
- Reject queries that exceed limits before executing them

### Persisted Queries

- For production public APIs, use persisted (allowlisted) queries — clients send a query ID instead of the full query string
- This prevents arbitrary query attacks and reduces payload size

### Rate Limiting

- Rate limit by user/IP, not by query — a single query can trigger many resolvers
- Track resolver execution count, not just HTTP request count

### N+1 Prevention

- Use DataLoader (or equivalent batching/caching layer) for all resolvers that load related data
- Never make a database call inside a resolver that runs per-list-item

### Rules

- Disable introspection in production (or restrict to authenticated admin users)
- Set maximum query depth and complexity limits
- Use DataLoader for all relationship resolvers
- Consider persisted queries for public-facing APIs

---

## 10. Versioning and Schema Evolution

### Rules

- GraphQL APIs are **not versioned** — the schema evolves in place
- Use `@deprecated` directive to phase out fields

```graphql
type Order {
  id: ID!
  total: Money!
  
  """Use `total` instead."""
  totalAmount: Float @deprecated(reason: "Use `total` instead")
}
```

### Safe Changes (Non-Breaking)

- Adding a new type
- Adding a new field to an existing type
- Adding a new query, mutation, or subscription
- Adding a new enum value (with caution — see below)
- Adding an optional argument to an existing field
- Deprecating a field

### Breaking Changes (Avoid)

- Removing a type or field (deprecate first, then remove after migration)
- Renaming a type or field (add new field, deprecate old, then remove)
- Changing a field's type
- Making a nullable field non-null
- Adding a required argument to an existing field
- Removing an enum value

### Enum Evolution Caution

Adding a new enum value is technically non-breaking, but clients with exhaustive switch statements will break. Document new enum values in release notes and give clients time to update.

### Deprecation Process

1. Add `@deprecated(reason: "...")` to the field
2. Log usage of deprecated fields to track migration progress
3. After all clients have migrated (or after a defined timeline), remove the field

---

## 11. Schema Documentation

### Rules

- Every type, field, and argument should have a description (triple-quote docstring)
- Descriptions should explain what the field represents, not how it's implemented
- Input field descriptions should include constraints (max length, allowed values)

```graphql
"""
A customer order containing one or more line items.
"""
type Order {
  """Unique identifier for the order."""
  id: ID!
  
  """The customer who placed this order."""
  customer: User!
  
  """
  Current status of the order. 
  Transitions: PENDING → CONFIRMED → SHIPPED → DELIVERED.
  Can be CANCELLED from PENDING or CONFIRMED.
  """
  status: OrderStatus!
  
  """Total cost including tax and shipping."""
  total: Money!
}

input CreateOrderInput {
  """ID of the customer placing the order."""
  customerId: ID!
  
  """
  Line items for the order. Must contain at least 1 item.
  Maximum 50 items per order.
  """
  lineItems: [OrderLineItemInput!]!
}
```

---

## 12. Custom Scalars

### Standard Custom Scalars

| Scalar | Format | Use For |
|--------|--------|---------|
| `DateTime` | ISO 8601 UTC string | Timestamps |
| `Date` | `YYYY-MM-DD` | Dates without time |
| `JSON` | Arbitrary JSON object | Unstructured metadata (use sparingly) |
| `URL` | Valid URL string | Links |
| `Email` | Valid email string | Email addresses |
| `UUID` | UUID v4 string | Identifiers |

### Rules

- Define custom scalars for domain-specific types rather than using `String` for everything
- Validate custom scalar values on both input and output
- Document the expected format in the scalar description
- Avoid the `JSON` scalar for structured data — define a proper type instead

---

## GraphQL Design Checklist

Before finalizing a new GraphQL schema design, verify:

- [ ] Types follow naming conventions (PascalCase types, camelCase fields, UPPER_SNAKE_CASE enums)
- [ ] Input types are suffixed with `Input`, used for mutation arguments
- [ ] Mutations return payload types (not raw objects), with `userErrors` for business errors
- [ ] Nullability is intentional — non-null for always-present fields, nullable for optional/lookup
- [ ] Lists use `[Type!]!` (non-null list of non-null items) as default
- [ ] Pagination uses Relay connection pattern for unbounded collections
- [ ] Query depth and complexity limits are defined
- [ ] DataLoader is used for all relationship resolvers (N+1 prevention)
- [ ] Auth is documented per field/operation (who can access what)
- [ ] Introspection is disabled in production (or restricted)
- [ ] Schema evolution uses `@deprecated` — no field removal without deprecation period
- [ ] Every type and field has a description (triple-quote docstring)
- [ ] Custom scalars are defined for domain-specific types (DateTime, Money, etc.)
- [ ] Subscriptions have authorization checks and defined lifecycle
- [ ] Error handling is consistent — payload-level for business errors, top-level for infrastructure
