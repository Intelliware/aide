# Naming Conventions

## Purpose

Consistent naming conventions reduce cognitive load, make code self-documenting, and enable developers and automated tools to infer intent from identifiers alone. These rules establish a shared vocabulary for naming files, types, functions, variables, database objects, and API endpoints across the codebase.

## Applicability

These rules apply to all application source code, database schemas, API definitions, and configuration files across all projects unless a language-specific override is documented. TypeScript/JavaScript is the primary reference language; see the Customization section for language-specific variations.

## Rules

### NAM-01: File Naming

**Severity:** Error
**Rule:** Name files in kebab-case; use PascalCase only for files that export a single class or component matching the filename.
**Why:** Kebab-case avoids filesystem case-sensitivity issues and provides visual consistency across the project.

**Compliant:**

```typescript
// src/utils/date-formatter.ts
// src/services/payment-service.ts
// src/components/OrderSummary.tsx  (exports component OrderSummary)
```

**Non-compliant:**

```typescript
// src/utils/dateFormatter.ts
// src/services/PaymentService.ts  (not a component file)
// src/utils/Date_Formatter.ts
```

---

### NAM-02: Class and Type Naming

**Severity:** Error
**Rule:** Name classes and types in PascalCase and suffix with their architectural role where applicable (`Service`, `Controller`, `Repository`, `Factory`, `Handler`).
**Why:** Role suffixes communicate purpose at a glance and enforce consistent layering.

**Compliant:**

```typescript
class PaymentService { /* ... */ }
class OrderController { /* ... */ }
type CreateUserRequest = { name: string; email: string };
```

**Non-compliant:**

```typescript
class paymentService { /* ... */ }
class OrderCtrl { /* ... */ }
class Payment { /* ... */ }  // missing role suffix for a service class
```

---

### NAM-03: Function and Method Naming

**Severity:** Error
**Rule:** Name functions and methods in camelCase starting with a verb that describes the action (`create`, `find`, `update`, `delete`, `validate`, `format`, `is`, `has`).
**Why:** Verb-first names make call sites read as actions, improving comprehension of control flow.

**Compliant:**

```typescript
function createOrder(items: CartItem[]): Order { /* ... */ }
function findByStatus(status: string): User[] { /* ... */ }
function validateEmail(email: string): boolean { /* ... */ }
```

**Non-compliant:**

```typescript
function order(items: CartItem[]): Order { /* ... */ }
function statusLookup(status: string): User[] { /* ... */ }
function emailCheck(email: string): boolean { /* ... */ }
```

---

### NAM-04: Variable Naming

**Severity:** Warning
**Rule:** Name variables in camelCase using descriptive, intention-revealing names; single-letter names are permitted only for loop indices and lambda parameters in short expressions.
**Why:** Descriptive names eliminate the need for comments and reduce misunderstanding during code review.

**Compliant:**

```typescript
const orderTotal = calculateTotal(items);
const activeUsers = users.filter(u => u.isActive);
for (let i = 0; i < retries; i++) { /* ... */ }
```

**Non-compliant:**

```typescript
const ot = calculateTotal(items);
const x = users.filter(user => user.isActive);
const data = fetchOrders();  // "data" is not descriptive
```

---

### NAM-05: Boolean Naming

**Severity:** Warning
**Rule:** Prefix boolean variables and properties with `is`, `has`, `should`, `can`, or `was` to form a readable predicate.
**Why:** Predicate prefixes make conditional expressions read as natural-language questions.

**Compliant:**

```typescript
const isActive = user.status === "active";
const hasPermission = roles.includes("admin");
const shouldRetry = attempts < MAX_RETRIES;
```

**Non-compliant:**

```typescript
const active = user.status === "active";
const permission = roles.includes("admin");
const retry = attempts < MAX_RETRIES;
```

---

### NAM-06: Constants

**Severity:** Warning
**Rule:** Name module-level constants in SCREAMING_SNAKE_CASE to distinguish them from mutable variables.
**Why:** The distinct casing signals immutability and module-wide scope at every usage site.

**Compliant:**

```typescript
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 5000;
const API_BASE_URL = "/api/v1";
```

**Non-compliant:**

```typescript
const maxRetries = 3;
const defaultTimeoutMs = 5000;
const api_base_url = "/api/v1";
```

---

### NAM-07: Enum Naming

**Severity:** Error
**Rule:** Name enums in PascalCase with PascalCase members; do not use SCREAMING_SNAKE_CASE for members.
**Why:** PascalCase members align with TypeScript conventions and read cleanly in switch cases and comparisons.

**Compliant:**

```typescript
enum OrderStatus {
  Pending = "PENDING",
  Confirmed = "CONFIRMED",
  Cancelled = "CANCELLED",
}
```

**Non-compliant:**

```typescript
enum ORDER_STATUS {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}
```

---

### NAM-08: Interface Naming

**Severity:** Error
**Rule:** Name interfaces in PascalCase without an `I` prefix.
**Why:** The `I` prefix is redundant in TypeScript where the type system distinguishes interfaces structurally, and it adds noise to every usage site.

**Compliant:**

```typescript
interface UserProfile {
  id: string;
  displayName: string;
}
```

**Non-compliant:**

```typescript
interface IUserProfile {
  id: string;
  displayName: string;
}
```

---

### NAM-09: Database Object Naming

**Severity:** Error
**Rule:** Name tables as plural snake_case nouns and columns as singular snake_case; use `created_at`/`updated_at` for timestamps.
**Why:** Plural table names reflect collections, and snake_case is the universal convention across SQL dialects.

**Compliant:**

```sql
CREATE TABLE user_accounts (
  id UUID PRIMARY KEY,
  email_address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Non-compliant:**

```sql
CREATE TABLE UserAccount (
  Id UUID PRIMARY KEY,
  emailAddress VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

### NAM-10: API Endpoint Naming

**Severity:** Error
**Rule:** Name API path segments as kebab-case plural nouns; do not embed verbs — use HTTP methods to convey the action.
**Why:** RESTful noun-only paths keep the URL scheme predictable and let HTTP semantics express intent.

**Compliant:**

```
GET    /api/v1/order-items
POST   /api/v1/order-items
GET    /api/v1/order-items/:id
DELETE /api/v1/user-accounts/:id
```

**Non-compliant:**

```
GET  /api/v1/getOrderItems
POST /api/v1/createOrderItem
GET  /api/v1/OrderItems/:id
DELETE /api/v1/deleteUser/:id
```

---

### NAM-11: Environment Variables

**Severity:** Error
**Rule:** Name environment variables in UPPER_SNAKE_CASE with a descriptive prefix grouping related values (`DATABASE_`, `FEATURE_`, `AWS_`).
**Why:** UPPER_SNAKE_CASE is the universal shell convention, and prefixes prevent collisions and aid discoverability.

**Compliant:**

```bash
DATABASE_URL="postgres://localhost:5432/app"
FEATURE_REFUNDS_ENABLED="true"
AWS_REGION="us-east-1"
```

**Non-compliant:**

```bash
databaseUrl="postgres://localhost:5432/app"
featureRefundsEnabled="true"
AwsRegion="us-east-1"
```

---

### NAM-12: Abbreviations and Acronyms

**Severity:** Warning
**Rule:** Avoid abbreviations in identifiers; when using acronyms, treat them as words — capitalize only the first letter in camelCase/PascalCase contexts.
**Why:** Full words are unambiguous, and word-cased acronyms keep identifier boundaries readable (e.g., `HttpClient` vs `HTTPClient`).

**Compliant:**

```typescript
const userId = getCurrentUserId();
const httpClient = new HttpClient(config);
function parseJsonResponse(raw: string): ApiResponse { /* ... */ }
```

**Non-compliant:**

```typescript
const userID = getCurrentUserID();
const HTTPClient = new HTTPClient(config);
function parseJSONResp(raw: string): APIResponse { /* ... */ }
```

## Customization

The following rules are commonly adjusted by teams based on language, framework, or organizational preference:

- **NAM-01 (File naming):** Python projects should use `snake_case.py` per PEP 8. Java and C# projects should use `PascalCase` filenames matching the public class name. Framework conventions take precedence (e.g., Next.js page routes, Angular component files).
- **NAM-07 (Enum members):** Some teams prefer SCREAMING_SNAKE_CASE members to match serialized wire values. If adopted, apply consistently across all enums.
- **NAM-08 (Interface prefix):** C#/.NET codebases conventionally use the `I` prefix (`IUserProfile`). Teams working in .NET should override this rule to require the prefix instead of prohibiting it.
- **NAM-09 (Database naming):** Some ORMs (e.g., Rails ActiveRecord) expect singular table names. Teams should align with their ORM's conventions and document the override.
- **NAM-12 (Acronyms):** Go codebases follow the convention of fully capitalizing acronyms (`userID`, `HTTPClient`). Go projects should override this rule to match the language's standard style.
