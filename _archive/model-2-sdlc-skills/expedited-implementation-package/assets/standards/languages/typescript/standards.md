# TypeScript Standards

## Purpose

These standards define TypeScript-specific coding rules that supplement the common standards in `../../common/`. They cover type system usage, language features, and idioms unique to TypeScript. For general principles like error handling, naming, and design patterns, refer to the common standards — this document focuses on how to use TypeScript's type system effectively and avoid its pitfalls.

## Applicability

All TypeScript projects (TypeScript 5.0+). Rules that require a specific TypeScript version are tagged with a **Requires** annotation — the codebase analysis step extracts the project's TypeScript version from `tsconfig.json` and applies only compatible rules.

## Rules

### TS-01: Enable Strict Mode

**Severity:** Error
**Rule:** Set `strict: true` in `tsconfig.json` and never disable `strictNullChecks`, `noImplicitAny`, or `strictFunctionTypes` in production code.
**Why:** Strict mode catches entire categories of bugs at compile time — without it, TypeScript provides a false sense of safety while allowing nulls, implicit `any`, and unsound function types to slip through.

**Compliant:**

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

**Non-compliant:**

```jsonc
// tsconfig.json — strict disabled or individual flags turned off
{
  "compilerOptions": {
    "strict": false,
    "strictNullChecks": false,  // allows null to flow anywhere undetected
    "noImplicitAny": false      // silently types unknown values as any
  }
}
```

---

### TS-02: No `any` Type

**Severity:** Error
**Rule:** Never use `any` — use `unknown` for truly unknown types, generics for flexible types, and type narrowing for unions.
**Why:** `any` disables type checking everywhere it touches, silently propagating through assignments and return values, hiding bugs that TypeScript was designed to catch.

**Compliant:**

```typescript
// unknown + narrowing for external data
function parseConfig(raw: unknown): AppConfig {
  if (!isValidConfig(raw)) {
    throw new ValidationError('Invalid configuration format');
  }
  return raw;
}

// Generics for flexible but type-safe functions
function first<T>(items: ReadonlyArray<T>): T | undefined {
  return items[0];
}

// Union types for known alternatives
function formatId(id: string | number): string {
  return String(id);
}
```

**Non-compliant:**

```typescript
// any disables all checking — the bug below compiles without error
function parseConfig(raw: any): AppConfig {
  return raw.confg; // typo silently returns undefined
}

// any leaks through return types
function getUser(id: string): any {
  return db.query(`SELECT * FROM users WHERE id = $1`, [id]);
}

const user = getUser('123');
user.nmae; // typo — no error, no autocomplete
```

---

### TS-03: Use Discriminated Unions for State

**Severity:** Warning
**Rule:** Model mutually exclusive states with discriminated unions using a literal `type` field — never use optional fields to represent different states.
**Why:** Discriminated unions make illegal states unrepresentable and let the compiler verify exhaustive handling, while optional fields allow impossible combinations like a "success" response with an `error` property.

**Compliant:**

```typescript
type AsyncState<T> =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success'; data: T }
  | { type: 'error'; error: AppError };

function renderOrder(state: AsyncState<Order>): string {
  switch (state.type) {
    case 'idle':
      return 'Ready';
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Order: ${state.data.id}`;
    case 'error':
      return `Failed: ${state.error.message}`;
  }
}
```

**Non-compliant:**

```typescript
// Optional fields allow impossible states: isLoading=true AND error is set
interface AsyncState<T> {
  isLoading?: boolean;
  data?: T;
  error?: AppError;
  isError?: boolean;
}

function renderOrder(state: AsyncState<Order>): string {
  if (state.isLoading) return 'Loading...';
  if (state.error) return `Failed: ${state.error.message}`;
  if (state.data) return `Order: ${state.data.id}`;
  return 'Ready'; // is this idle? or data that's undefined? unclear
}
```

---

### TS-04: Use `const` Assertions for Literal Types

**Severity:** Convention
**Rule:** Use `as const` for config objects, enum-like constants, and any value where you need the literal type preserved instead of widened to `string` or `number`.
**Why:** Without `as const`, TypeScript widens `'active'` to `string` and `200` to `number`, losing the precise type information that enables exhaustive checks and type-safe lookups.

**Compliant:**

```typescript
const HTTP_STATUS = {
  OK: 200,
  NOT_FOUND: 404,
  INTERNAL: 500,
} as const;

type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS]; // 200 | 404 | 500

const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'editor' | 'viewer'
```

**Non-compliant:**

```typescript
// Without as const, types widen — loses all precision
const HTTP_STATUS = {
  OK: 200,       // type is number, not 200
  NOT_FOUND: 404, // type is number, not 404
  INTERNAL: 500,  // type is number, not 500
};

const ROLES = ['admin', 'editor', 'viewer'];
type Role = (typeof ROLES)[number]; // string — useless
```

---

### TS-05: Use Nullish Coalescing and Optional Chaining

**Severity:** Warning
**Rule:** Use `??` instead of `||` for default values and `?.` instead of `&&` chains for nested access.
**Why:** `||` treats `0`, `''`, and `false` as falsy, causing bugs when these are legitimate values; `??` only falls back on `null` and `undefined`.

**Compliant:**

```typescript
// ?? preserves falsy-but-valid values
const port = config.port ?? 3000;         // 0 is kept, only null/undefined falls back
const label = config.label ?? 'default';  // '' is kept as a valid empty label
const enabled = config.enabled ?? true;   // false is kept, not replaced with true

// ?. for safe nested access
const city = user?.address?.city;
const first = orders?.[0]?.items?.[0];
```

**Non-compliant:**

```typescript
// || replaces 0, '', and false — three distinct bug categories
const port = config.port || 3000;         // port=0 silently becomes 3000
const label = config.label || 'default';  // label='' silently becomes 'default'
const enabled = config.enabled || true;   // enabled=false silently becomes true

// Verbose manual null checks
const city = user && user.address && user.address.city;
```

---

### TS-06: Use Type Guards for Narrowing

**Severity:** Warning
**Rule:** Write custom type guard functions with `value is Type` return types for runtime type checks — never cast with `as` unless there is no alternative.
**Why:** Type guards validate at runtime and narrow the type safely, while `as` assertions override the compiler with no runtime check, hiding bugs that only surface in production.

**Compliant:**

```typescript
// See ERR-01 for the AppError class hierarchy; this covers TypeScript-specific narrowing
function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

function isNetworkError(error: unknown): error is Error & { code: string } {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  );
}

function handleError(error: unknown): void {
  if (isAppError(error)) {
    logger.error(error.message, { code: error.code, context: error.context });
  } else if (isNetworkError(error)) {
    logger.error('Network error', { code: error.code });
  } else {
    logger.error('Unknown error', { error });
  }
}
```

**Non-compliant:**

```typescript
// as casts bypass the type system — no runtime validation
function handleError(error: unknown): void {
  const appError = error as AppError; // if error is a string, this silently "works"
  logger.error(appError.message, { code: appError.code }); // runtime crash: no .code
}

// Double assertion — a sign you're fighting the type system
const config = rawData as unknown as AppConfig;
```

---

### TS-07: Use Utility Types

**Severity:** Convention
**Rule:** Use built-in utility types — `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`, `Readonly<T>`, `Required<T>` — instead of manually recreating equivalent types.
**Why:** Utility types are standardized, tested, and immediately recognized by every TypeScript developer; hand-rolled equivalents add noise and risk subtle differences.

**Compliant:**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

type UpdateUserInput = Partial<Pick<User, 'name' | 'email'>>;

type UserSummary = Pick<User, 'id' | 'name'>;

type CreateUserInput = Omit<User, 'id'>;

type UserLookup = Record<string, User>;

type ImmutableUser = Readonly<User>;
```

**Non-compliant:**

```typescript
// Manually recreating Partial<Pick<User, 'name' | 'email'>>
interface UpdateUserInput {
  name?: string;
  email?: string;
}
// ^ Silently drifts from User if User.name changes type

// Manually recreating Record<string, User>
interface UserLookup {
  [key: string]: User;
}
```

---

### TS-08: Prefer Union Types over Enums

**Severity:** Convention
**Rule:** Use string literal union types (`type Status = 'active' | 'inactive'`) instead of `enum` — reserve `enum` for cases where you need reverse mapping from values to names.
**Why:** Enums emit runtime JavaScript objects, have surprising nominal typing behavior (numeric enums accept any number), and don't tree-shake well; union types are zero-cost and behave predictably.

**Compliant:**

```typescript
// String literal union — zero runtime cost, fully type-safe
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  status: OrderStatus;
}

// Exhaustive handling with a union
function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'confirmed': return 'Confirmed';
    case 'shipped': return 'Shipped';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
  }
}
```

**Non-compliant:**

```typescript
// enum emits a runtime object and has surprising behavior
enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

// Numeric enums are worse — any number is assignable
enum Priority {
  Low,    // 0
  Medium, // 1
  High,   // 2
}

const p: Priority = 999; // compiles with no error
```

---

### TS-09: Use `import type` for Type-Only Imports

**Severity:** Convention
**Rule:** Use `import type` when importing types, interfaces, or type aliases that are not used as values at runtime.
**Why:** `import type` is erased at compile time, keeps type-level and value-level imports visually distinct, and enables better tree-shaking by making the bundler's job unambiguous.

**Compliant:**

```typescript
import type { User, Role } from './types';
import type { Request, Response } from 'express';

import { UserService } from './user-service'; // value import — used at runtime

export function createHandler(service: UserService) {
  return async (req: Request, res: Response): Promise<void> => {
    const user: User = await service.findById(req.params.id);
    res.json(user);
  };
}
```

**Non-compliant:**

```typescript
// Mixing type-only and value imports without distinction
import { User, Role, UserService } from './user-service';
// User and Role are only used as types but imported alongside the runtime value
```

---

### TS-10: Define Return Types on Public Functions

**Severity:** Warning
**Rule:** Exported functions and public class methods must have explicit return type annotations — private functions and closures may rely on type inference.
**Why:** Explicit return types prevent accidental return type changes from silently propagating to consumers, serve as documentation, and produce clearer error messages at the function boundary rather than at distant call sites.

**Compliant:**

```typescript
// Exported — explicit return type
export async function findOrder(id: string): Promise<Order | null> {
  return orderRepository.findById(id);
}

export function calculateTotal(items: ReadonlyArray<LineItem>): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Private helper — inference is fine
function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}
```

**Non-compliant:**

```typescript
// Exported with no return type — if the implementation changes,
// consumers break with confusing errors far from the source
export async function findOrder(id: string) {
  const result = await orderRepository.findById(id);
  return result; // return type inferred from implementation detail
}
```

---

### TS-11: Use `readonly` for Immutable Data

**Severity:** Warning
**Rule:** Mark properties, parameters, and arrays as `readonly` when they should not be mutated — use `readonly` on properties, `ReadonlyArray<T>`, and `Readonly<T>` for objects.
**Why:** `readonly` prevents accidental mutation at compile time, making data flow predictable and eliminating a common source of subtle bugs, especially in shared state and function parameters.

**Compliant:**

```typescript
interface OrderLineItem {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: number;
}

interface Order {
  readonly id: string;
  readonly items: ReadonlyArray<OrderLineItem>;
  status: OrderStatus; // intentionally mutable
}

function calculateTotal(items: ReadonlyArray<OrderLineItem>): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

// Readonly<T> for fully immutable snapshots
function freezeOrder(order: Order): Readonly<Order> {
  return Object.freeze({ ...order });
}
```

**Non-compliant:**

```typescript
// Mutable parameter — caller's array can be accidentally modified
function processItems(items: OrderLineItem[]): void {
  items.sort((a, b) => a.unitPrice - b.unitPrice); // mutates the caller's array
  items.push({ productId: 'fee', quantity: 1, unitPrice: 5 }); // surprise!
}
```

---

### TS-12: Use Branded Types for Domain Identifiers

**Severity:** Convention
**Rule:** Create branded types for domain identifiers to prevent accidentally interchanging structurally identical but semantically different values.
**Why:** A `string` is a `string` to TypeScript — without branding, nothing stops you from passing a `userId` where an `orderId` is expected, a bug that compiles cleanly and fails silently at runtime.

**Compliant:**

```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

function createUserId(id: string): UserId {
  return id as UserId;
}

function createOrderId(id: string): OrderId {
  return id as OrderId;
}

function getOrder(orderId: OrderId): Promise<Order> {
  return orderRepository.findById(orderId);
}

const userId = createUserId('user-123');
const orderId = createOrderId('order-456');

getOrder(orderId);  // compiles
getOrder(userId);   // compile error: UserId is not assignable to OrderId
```

**Non-compliant:**

```typescript
// Plain strings — nothing prevents mixing them up
function getOrder(orderId: string): Promise<Order> {
  return orderRepository.findById(orderId);
}

const userId = 'user-123';
const orderId = 'order-456';

getOrder(userId); // compiles — wrong ID used, silent data bug
```

### TS-13: Validate at Boundaries with Schema Libraries

**Severity:** Error
**Rule:** Validate all external data — API request bodies, query parameters, environment variables, file content, third-party API responses — using a schema validation library (Zod, Yup, io-ts, or similar) at the system boundary. Never trust external data based on TypeScript types alone.
**Why:** TypeScript types are erased at runtime — a `Request<CreateOrderDto>` provides zero runtime safety. Schema validation catches malformed data at the boundary with clear error messages, before it propagates through the system and causes cryptic failures.

**Compliant:**

```typescript
import { z } from 'zod';

const CreateOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  }),
});

type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export async function handleCreateOrder(req: Request, res: Response): Promise<void> {
  const result = CreateOrderSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: result.error.issues } });
    return;
  }
  const order = await orderService.create(result.data);
  res.status(201).json({ data: order });
}
```

**Non-compliant:**

```typescript
interface CreateOrderInput {
  customerId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export async function handleCreateOrder(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateOrderInput; // type assertion — no runtime check
  const order = await orderService.create(input); // null/undefined fields crash later
  res.status(201).json({ data: order });
}
```

---

### TS-14: Use `Promise.all` for Independent Async Operations

**Severity:** Warning
**Rule:** When multiple async operations are independent (no operation depends on the result of another), execute them concurrently with `Promise.all` or `Promise.allSettled` — never `await` them sequentially.
**Why:** Sequential `await` on independent operations serializes work unnecessarily, multiplying latency by the number of operations. `Promise.all` runs them concurrently, bounded only by the slowest call.

**Compliant:**

```typescript
async function fetchDashboard(userId: string): Promise<Dashboard> {
  const [profile, orders, notifications] = await Promise.all([
    userService.fetchProfile(userId),
    orderService.fetchRecent(userId),
    notificationService.fetchUnread(userId),
  ]);

  return { profile, orders, notifications };
}

// When partial failure is acceptable, use Promise.allSettled
async function fetchOptionalData(userId: string): Promise<OptionalData> {
  const results = await Promise.allSettled([
    recommendationService.fetch(userId),
    analyticsService.fetchInsights(userId),
  ]);

  return {
    recommendations: results[0].status === 'fulfilled' ? results[0].value : [],
    insights: results[1].status === 'fulfilled' ? results[1].value : null,
  };
}
```

**Non-compliant:**

```typescript
async function fetchDashboard(userId: string): Promise<Dashboard> {
  const profile = await userService.fetchProfile(userId);        // waits ~200ms
  const orders = await orderService.fetchRecent(userId);         // waits ~300ms
  const notifications = await notificationService.fetchUnread(userId); // waits ~100ms
  // Total: ~600ms sequential vs ~300ms concurrent

  return { profile, orders, notifications };
}
```

---

### TS-15: Use Immutable Update Patterns

**Severity:** Error
**Rule:** Always create new objects and arrays via spread or functional methods (`map`, `filter`, `reduce`) — never mutate existing objects, arrays, or their properties in place. This applies to function parameters, shared state, and any data flowing between modules.
**Why:** In-place mutation creates hidden side effects — callers do not expect their data to change when passed to a function. Immutable updates make data flow predictable, prevent entire categories of concurrency and React rendering bugs, and make state changes traceable.

**Compliant:**

```typescript
function updateUser(user: User, name: string): User {
  return { ...user, name };
}

function addItem(items: ReadonlyArray<Item>, newItem: Item): ReadonlyArray<Item> {
  return [...items, newItem];
}

function removeItem(items: ReadonlyArray<Item>, id: string): ReadonlyArray<Item> {
  return items.filter(item => item.id !== id);
}

function updateItemQuantity(
  items: ReadonlyArray<OrderItem>,
  id: string,
  quantity: number,
): ReadonlyArray<OrderItem> {
  return items.map(item => item.id === id ? { ...item, quantity } : item);
}
```

**Non-compliant:**

```typescript
function updateUser(user: User, name: string): User {
  user.name = name; // mutates the caller's object
  return user;
}

function addItem(items: Item[], newItem: Item): Item[] {
  items.push(newItem); // mutates the caller's array
  return items;
}

function removeItem(items: Item[], id: string): void {
  const index = items.findIndex(item => item.id === id);
  items.splice(index, 1); // mutates in place
}
```

---

### TS-16: Use `satisfies` for Type Validation Without Widening

**Severity:** Convention
**Requires:** TypeScript 4.9+
**Rule:** Use the `satisfies` operator to validate that an expression matches a type while preserving the narrowest inferred type — use `satisfies` instead of type annotations or `as` assertions when you want both validation and narrow inference.
**Why:** A type annotation widens the value to the declared type, losing literal information. An `as` assertion skips validation entirely. `satisfies` gives you both: the compiler checks conformance and preserves the precise type.

**Compliant:**

```typescript
type RouteConfig = Record<string, { path: string; auth: boolean }>;

const routes = {
  home: { path: '/', auth: false },
  dashboard: { path: '/dashboard', auth: true },
  settings: { path: '/settings', auth: true },
} satisfies RouteConfig;

routes.home.path;    // type is '/' — literal preserved
routes.dashboard;    // autocomplete works with exact keys
```

**Non-compliant:**

```typescript
// Type annotation widens — loses literal types
const routes: RouteConfig = {
  home: { path: '/', auth: false },
  dashboard: { path: '/dashboard', auth: true },
};

routes.home.path;    // type is string — not '/'

// as assertion — no validation, typos compile silently
const routes = {
  home: { pth: '/', auth: false }, // typo: 'pth' not caught
} as RouteConfig;
```

---

### TS-17: Use `using` for Deterministic Resource Cleanup

**Severity:** Convention
**Requires:** TypeScript 5.2+
**Rule:** Use `using` and `await using` declarations with `Symbol.dispose` / `Symbol.asyncDispose` for resources that require deterministic cleanup — database connections, file handles, locks, temporary files.
**Why:** `using` guarantees cleanup when the variable goes out of scope, even if an exception is thrown, eliminating the try/finally boilerplate and the risk of forgetting to release resources.

**Compliant:**

```typescript
class DatabaseConnection implements Disposable {
  [Symbol.dispose](): void {
    this.release();
  }

  private release(): void {
    // return connection to pool
  }
}

async function processOrder(orderId: string): Promise<void> {
  using conn = await connectionPool.acquire();
  const order = await conn.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  // conn is automatically released when this scope exits
}
```

**Non-compliant:**

```typescript
async function processOrder(orderId: string): Promise<void> {
  const conn = await connectionPool.acquire();
  try {
    const order = await conn.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  } finally {
    conn.release(); // easy to forget, verbose boilerplate
  }
}
```

---

## Customization

- **TS-13 (Schema validation library)** defaults to Zod in examples but any schema validation library (Yup, io-ts, Valibot, ArkType) that provides runtime validation with TypeScript type inference is acceptable. The key requirement is that external data is validated at runtime at the boundary, not merely typed with `as` assertions.

- **TS-16 (`satisfies`)** requires TypeScript 4.9+. Projects on older TypeScript versions should use type annotations and accept the type widening trade-off.

- **TS-17 (`using` declarations)** requires TypeScript 5.2+ and a runtime polyfill for `Symbol.dispose` in environments that don't support it natively. Projects on older TypeScript versions should continue using try/finally for resource cleanup.

- **TS-08 (Union types vs enums)** is the most debated rule. Some teams prefer `enum` for IDE autocompletion, namespace grouping, and iterability (`Object.values(MyEnum)`). The key concern with enums is numeric enum unsoundness and runtime overhead — string enums are the safer choice if you choose the enum path.

- **TS-12 (Branded types)** adds ceremony (factory functions, explicit casting) that may not be worth the cost for small projects or internal tools with low domain complexity. Consider branding selectively for identifiers that are commonly confused (e.g., multiple UUID-typed fields in the same function signature).

- **TS-10 (Explicit return types)** is relaxed by some teams who prefer full inference everywhere, relying on tests and integration checks to catch return type drift. This works in small teams but tends to cause friction as codebases and contributor counts grow.
