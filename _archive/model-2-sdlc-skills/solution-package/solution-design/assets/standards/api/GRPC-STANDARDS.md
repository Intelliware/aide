# gRPC API Design Standards

These are the baseline standards the AI uses when designing gRPC services and RPCs. During Step 3 of the API design skill, the AI compares existing codebase conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new services should follow the existing pattern or adopt the standard.

These standards follow the [Google API Design Guide](https://cloud.google.com/apis/design) and the [Buf Style Guide](https://buf.build/docs/best-practices/style-guide) as primary references.

---

## 1. Proto File Organization

### Rules

- One `.proto` file per service (e.g., `order_service.proto`)
- Proto files live in a dedicated directory (e.g., `proto/`, `api/proto/`, or `protos/`)
- Use a clear package hierarchy: `{company}.{domain}.{version}` (e.g., `acme.orders.v1`)
- Every `.proto` file must declare `syntax = "proto3";` at the top
- Set `option go_package`, `option java_package`, etc. for generated code paths

### File Structure

```protobuf
syntax = "proto3";

package acme.orders.v1;

option go_package = "github.com/acme/orders/v1;ordersv1";
option java_package = "com.acme.orders.v1";

import "google/protobuf/timestamp.proto";

// Service definition first
service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (Order);
  rpc GetOrder(GetOrderRequest) returns (Order);
  rpc ListOrders(ListOrdersRequest) returns (ListOrdersResponse);
}

// Request/response messages next
message CreateOrderRequest { ... }
message GetOrderRequest { ... }
message ListOrdersRequest { ... }
message ListOrdersResponse { ... }

// Domain messages last
message Order { ... }
message OrderItem { ... }
```

### Rules

- Service definition appears first, followed by request/response messages, then domain messages
- Import ordering: standard library (`google/`), third-party, then local
- Do not define messages from different domains in the same file

---

## 2. Naming Conventions

### Services

- PascalCase, suffixed with `Service`: `OrderService`, `UserService`, `PaymentService`
- Name describes the domain, not the implementation

### RPCs

- PascalCase, verb + noun: `CreateOrder`, `GetUser`, `ListOrders`, `UpdateOrder`, `DeleteOrder`
- Standard CRUD verbs: `Get` (single), `List` (collection), `Create`, `Update`, `Delete`
- Custom actions: verb + noun (e.g., `CancelOrder`, `ApproveRefund`)

### Messages

- PascalCase for message names
- Request messages: `{RPC}Request` (e.g., `CreateOrderRequest`)
- Response messages: `{RPC}Response` (e.g., `ListOrdersResponse`) — except when the response is the domain object itself (e.g., `GetOrder` returns `Order`, not `GetOrderResponse`)
- snake_case for field names: `order_id`, `created_at`, `line_items`

### Enums

- PascalCase for enum names: `OrderStatus`
- UPPER_SNAKE_CASE for values: `ORDER_STATUS_PENDING`, `ORDER_STATUS_COMPLETED`
- First value must be the `UNSPECIFIED` sentinel: `ORDER_STATUS_UNSPECIFIED = 0`
- Prefix all values with the enum name to avoid conflicts

### Correct

```protobuf
enum OrderStatus {
  ORDER_STATUS_UNSPECIFIED = 0;
  ORDER_STATUS_PENDING = 1;
  ORDER_STATUS_CONFIRMED = 2;
  ORDER_STATUS_CANCELLED = 3;
}
```

### Incorrect

```protobuf
enum OrderStatus {
  PENDING = 0;         // missing UNSPECIFIED, no prefix
  CONFIRMED = 1;
  Cancelled = 2;       // wrong case
}
```

---

## 3. Field Design

### Rules

- Field numbers 1–15 use 1 byte to encode — reserve these for frequently accessed fields
- Never reuse a field number after removing a field — use `reserved` to prevent accidental reuse
- Use `google.protobuf.Timestamp` for timestamps, not `int64` or `string`
- Use `string` for IDs (UUIDs), not `int64` — allows migration to different ID schemes
- Use `google.protobuf.FieldMask` for partial updates
- Prefer wrapper types (`google.protobuf.StringValue`) when you need to distinguish "not set" from "empty/zero" in proto3

### Reserved Fields

```protobuf
message Order {
  reserved 6, 9;
  reserved "legacy_status", "old_total";
  
  string id = 1;
  string customer_id = 2;
  // ...
}
```

### Standard Field Types

| Data | Type | Notes |
|------|------|-------|
| IDs | `string` | UUIDs as strings |
| Timestamps | `google.protobuf.Timestamp` | Not `int64` or `string` |
| Money | `string` or custom `Money` message | `{ string amount = 1; string currency = 2; }` — not `double` (precision issues) |
| Booleans | `bool` | Proto3 default is `false` — consider if "unset" matters |
| Nullable fields | Wrapper types or `optional` keyword | `google.protobuf.StringValue` or `optional string` |
| Collections | `repeated` | Empty list is the default — cannot distinguish "not set" from "empty" |

---

## 4. RPC Design Patterns

### Standard CRUD

```protobuf
service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (Order);
  rpc GetOrder(GetOrderRequest) returns (Order);
  rpc ListOrders(ListOrdersRequest) returns (ListOrdersResponse);
  rpc UpdateOrder(UpdateOrderRequest) returns (Order);
  rpc DeleteOrder(DeleteOrderRequest) returns (google.protobuf.Empty);
}
```

### Request Message Patterns

```protobuf
// GET — single resource by ID
message GetOrderRequest {
  string id = 1;
}

// LIST — with pagination and filtering
message ListOrdersRequest {
  int32 page_size = 1;
  string page_token = 2;
  string filter = 3;       // e.g., "status=pending"
  string order_by = 4;     // e.g., "created_at desc"
}

message ListOrdersResponse {
  repeated Order orders = 1;
  string next_page_token = 2;
  int32 total_size = 3;
}

// CREATE — all required fields
message CreateOrderRequest {
  string customer_id = 1;
  repeated OrderItem items = 2;
}

// UPDATE — partial update with field mask
message UpdateOrderRequest {
  string id = 1;
  Order order = 2;
  google.protobuf.FieldMask update_mask = 3;
}

// DELETE — by ID
message DeleteOrderRequest {
  string id = 1;
}
```

### Streaming Patterns

| Pattern | Use When |
|---------|----------|
| **Unary** (request → response) | Standard CRUD, single operations |
| **Server streaming** (request → stream of responses) | Large result sets, real-time feeds, progress updates |
| **Client streaming** (stream of requests → response) | File uploads, batch ingestion |
| **Bidirectional streaming** | Chat, collaborative editing, real-time sync |

### Rules

- Default to unary RPCs — use streaming only when there's a clear need
- Server streaming for list operations that may return very large result sets
- Always document the expected stream lifecycle (when does the stream end?)

---

## 5. Error Handling

### Standard gRPC Status Codes

| Code | When to Use | Equivalent HTTP |
|------|------------|----------------|
| `OK` | Success | 200 |
| `INVALID_ARGUMENT` | Validation failure, malformed request | 400 |
| `NOT_FOUND` | Resource doesn't exist | 404 |
| `ALREADY_EXISTS` | Duplicate entry | 409 |
| `PERMISSION_DENIED` | Authenticated but not authorized | 403 |
| `UNAUTHENTICATED` | Missing or invalid credentials | 401 |
| `FAILED_PRECONDITION` | Business rule violation, state conflict | 412 / 422 |
| `RESOURCE_EXHAUSTED` | Rate limit exceeded, quota exhausted | 429 |
| `INTERNAL` | Unexpected server failure | 500 |
| `UNAVAILABLE` | Transient failure, try again | 503 |
| `DEADLINE_EXCEEDED` | Request took too long | 504 |
| `UNIMPLEMENTED` | RPC not implemented | 501 |

### Error Details

Use `google.rpc.Status` with error details for rich error information:

```protobuf
import "google/rpc/status.proto";
import "google/rpc/error_details.proto";

// Return structured error details
google.rpc.Status {
  code: 3,  // INVALID_ARGUMENT
  message: "Validation failed",
  details: [
    google.rpc.BadRequest {
      field_violations: [
        { field: "email", description: "Must be a valid email address" },
        { field: "quantity", description: "Must be greater than 0" }
      ]
    }
  ]
}
```

### Rules

- Use the most specific status code — do not use `INTERNAL` for validation errors
- Include a human-readable `message` on every error
- Use `google.rpc.BadRequest` for field-level validation errors
- Use `google.rpc.PreconditionFailure` for business rule violations
- Use `google.rpc.ErrorInfo` for machine-readable error classification
- Never expose internal details (stack traces, database errors) in error messages

---

## 6. Pagination

### Standard Pattern

Use token-based pagination (not offset-based):

```protobuf
message ListOrdersRequest {
  int32 page_size = 1;      // max items to return (capped server-side)
  string page_token = 2;    // opaque token from previous response
}

message ListOrdersResponse {
  repeated Order orders = 1;
  string next_page_token = 2;  // empty string means last page
  int32 total_size = 3;        // total count (optional, can be expensive)
}
```

### Rules

- `page_size` must have a server-enforced maximum (e.g., 100)
- `page_token` is opaque to the client — encode cursor information server-side
- Empty `next_page_token` indicates the last page
- `total_size` is optional — only include if it can be computed cheaply

---

## 7. Versioning and Backward Compatibility

### Package Versioning

```protobuf
package acme.orders.v1;  // v1
package acme.orders.v2;  // breaking changes go in v2
```

### Backward-Compatible Changes (Safe)

- Adding a new field (with a new field number)
- Adding a new RPC to a service
- Adding a new enum value (but not changing the default)
- Adding a new service to a package

### Breaking Changes (Require New Version)

- Removing or renaming a field
- Changing a field's type
- Changing a field number
- Removing an RPC
- Changing an RPC's request or response type
- Renaming a service

### Rules

- Never reuse field numbers — `reserved` removed fields and their numbers
- Never change the type of an existing field
- New fields must have sensible defaults (proto3 zero values)
- Maintain at most 2 active versions
- Use `deprecated = true` option on fields/RPCs being phased out

---

## 8. Authentication and Authorization

### Standard Patterns

| Pattern | Use When |
|---------|----------|
| **Metadata (headers)** with JWT/token | Service-to-service with token propagation |
| **mTLS** | Service-to-service within a mesh, zero-trust environments |
| **Interceptors / middleware** | Centralized auth enforcement |

### Rules

- Pass auth tokens in gRPC metadata (equivalent to HTTP headers), key: `authorization`
- Enforce auth in server interceptors, not in individual RPC implementations
- Use per-RPC authorization checks for role/permission-based access
- Document which RPCs are public vs. authenticated vs. restricted to specific roles

---

## 9. Interceptors

### Standard Interceptors

| Interceptor | Purpose |
|------------|---------|
| **Auth** | Validate token, extract user context |
| **Logging** | Log RPC name, duration, status code, correlation ID |
| **Metrics** | Track RPC latency, error rate, request volume |
| **Retry** | Client-side retry with exponential backoff for UNAVAILABLE |
| **Timeout** | Enforce deadline per RPC |
| **Validation** | Validate request messages before reaching the handler |

### Rules

- Apply interceptors consistently across all RPCs via server/client configuration
- Client-side: set deadlines on every RPC call — never allow unbounded calls
- Server-side: enforce maximum request size to prevent memory exhaustion

---

## 10. Health Checking

### Standard Pattern

Use the [gRPC Health Checking Protocol](https://github.com/grpc/grpc/blob/master/doc/health-checking.md):

```protobuf
service Health {
  rpc Check(HealthCheckRequest) returns (HealthCheckResponse);
  rpc Watch(HealthCheckRequest) returns (stream HealthCheckResponse);
}
```

### Rules

- Every gRPC service must implement the health checking protocol
- Health checks should verify downstream dependencies (database, cache, other services)
- Use `Watch` for load balancers that need streaming health status

---

## gRPC Design Checklist

Before finalizing a new gRPC service design, verify:

- [ ] Proto file uses `syntax = "proto3"` with a versioned package name
- [ ] Service, RPC, message, and enum names follow naming conventions
- [ ] Enum values are prefixed and include `UNSPECIFIED = 0`
- [ ] Request/response messages follow the `{RPC}Request` / `{RPC}Response` pattern
- [ ] Field numbers 1–15 reserved for frequently accessed fields
- [ ] Removed fields use `reserved` to prevent reuse
- [ ] Timestamps use `google.protobuf.Timestamp`, not int64/string
- [ ] Money uses `string` or a `Money` message, not `double`
- [ ] Error handling uses appropriate gRPC status codes with error details
- [ ] List RPCs use token-based pagination with server-enforced page size limits
- [ ] Streaming is used only where justified (large payloads, real-time)
- [ ] Auth is enforced via interceptors, documented per RPC
- [ ] Health checking protocol is implemented
- [ ] Breaking changes go in a new package version
- [ ] Deadlines are set on all client-side RPC calls
