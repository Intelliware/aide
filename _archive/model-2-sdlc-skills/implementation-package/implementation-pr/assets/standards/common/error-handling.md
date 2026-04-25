# Error Handling Standards

## Purpose

These standards establish consistent error handling patterns across the codebase. Proper error handling ensures that failures are observable, debuggable, and recoverable — that users see helpful messages, operators see actionable logs, and developers can trace issues quickly. These rules apply to both synchronous and asynchronous code paths, covering error creation, propagation, logging, and user presentation.

## Applicability

These standards apply to all TypeScript/JavaScript projects including backend services (Node.js, NestJS, Express), frontend applications (React, Next.js), shared libraries, and CLI tools. Language-specific adaptations may be needed for polyglot codebases, but the principles apply universally.

## Rules

### ERR-01: Use Typed Error Classes

**Severity:** Error
**Rule:** Extend a base `AppError` class with an error code, HTTP status, and contextual data — never throw bare `Error` instances.
**Why:** Typed errors enable programmatic handling, consistent serialization, and meaningful error responses without inspecting message strings.

**Compliant:**

```typescript
abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
  readonly context: Record<string, unknown>;

  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
  }
}

class OrderNotFoundError extends AppError {
  readonly code = 'ORDER_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(orderId: string) {
    super(`Order not found: ${orderId}`, { orderId });
  }
}

class InsufficientStockError extends AppError {
  readonly code = 'INSUFFICIENT_STOCK';
  readonly httpStatus = 409;

  constructor(productId: string, requested: number, available: number) {
    super(`Insufficient stock for product ${productId}`, {
      productId,
      requested,
      available,
    });
  }
}

throw new OrderNotFoundError(orderId);
```

**Non-compliant:**

```typescript
// Bare Error — no code, no status, no structured context
throw new Error('Order not found');

// String matching is fragile and breaks when messages change
try {
  await getOrder(id);
} catch (err) {
  if (err.message.includes('not found')) {
    res.status(404).json({ error: err.message });
  }
}
```

---

### ERR-02: Include Error Context

**Severity:** Error
**Rule:** Error messages must describe what operation failed and why, and include relevant identifiers or values needed for debugging.
**Why:** An error message like "Not found" in a log is useless at 3 AM — context turns a mystery into a five-minute fix.

**Compliant:**

```typescript
class PaymentFailedError extends AppError {
  readonly code = 'PAYMENT_FAILED';
  readonly httpStatus = 502;

  constructor(orderId: string, provider: string, reason: string) {
    super(
      `Payment failed for order ${orderId} via ${provider}: ${reason}`,
      { orderId, provider, reason },
    );
  }
}

throw new PaymentFailedError(order.id, 'stripe', 'card_declined');
```

**Non-compliant:**

```typescript
// No indication of what failed, which entity, or why
throw new Error('Payment failed');

// Message has no structured context for log indexing
throw new Error('Something went wrong');

// Entity ID is missing — impossible to correlate in logs
throw new Error('User not authorized');
```

---

### ERR-03: Never Swallow Errors

**Severity:** Error
**Rule:** Every `catch` block must log the error, rethrow it, return a meaningful fallback, or handle it explicitly — empty catch blocks are forbidden.
**Why:** Swallowed errors create silent failures that corrupt data and are extremely difficult to diagnose in production.

**Compliant:**

```typescript
// Option A: Log and rethrow
try {
  await processPayment(order);
} catch (error) {
  logger.error('Payment processing failed', { orderId: order.id, error });
  throw error;
}

// Option B: Handle with a meaningful fallback
try {
  const cached = await cache.get(key);
  return cached;
} catch (error) {
  logger.warn('Cache read failed, falling back to database', { key, error });
  return database.query(key);
}

// Option C: Intentional suppression with explicit documentation
try {
  await analytics.track(event);
} catch (error) {
  // Analytics failures must not break the user flow.
  // This is intentionally non-blocking; the analytics pipeline
  // has its own error monitoring.
  logger.warn('Analytics tracking failed', { event: event.name, error });
}
```

**Non-compliant:**

```typescript
// Silent swallow — the operation disappears into a black hole
try {
  await processPayment(order);
} catch (error) {
  // TODO: handle this later
}

// Even worse — completely empty
try {
  await sendNotification(userId);
} catch {}
```

---

### ERR-04: Use Error Boundaries

**Severity:** Error
**Rule:** Use React error boundaries for UI component trees and global exception filters or middleware for API services — every application must have a single top-level handler for unhandled errors.
**Why:** Without a safety net, a single unhandled error crashes the entire application or returns raw stack traces to users.

**Compliant:**

```typescript
// React: Error boundary component
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('Unhandled UI error', {
      error,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Express: Global error middleware (must be registered last)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const status = err instanceof AppError ? err.httpStatus : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';

  logger.error('Unhandled request error', {
    code,
    path: req.path,
    method: req.method,
    error: err,
  });

  res.status(status).json({
    error: { code, message: getUserMessage(err) },
  });
});
```

**Non-compliant:**

```typescript
// No error boundary — one broken component takes down the whole page
ReactDOM.render(<App />, root);

// No global error handler — Express returns raw stack traces in development
// and generic 500s with no logging in production
app.get('/orders/:id', async (req, res) => {
  const order = await getOrder(req.params.id); // throws? user sees "Cannot read property..."
  res.json(order);
});
```

---

### ERR-05: Separate User-Facing Messages from Internal Details

**Severity:** Error
**Rule:** Never expose stack traces, internal error codes, or system details to end users — return safe, helpful messages while logging full details server-side.
**Why:** Internal details leak implementation specifics (a security risk) and confuse users who cannot act on them.

**Compliant:**

```typescript
class AppError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
  readonly context: Record<string, unknown>;
  readonly userMessage: string;

  constructor(
    internalMessage: string,
    userMessage: string,
    context: Record<string, unknown> = {},
  ) {
    super(internalMessage);
    this.userMessage = userMessage;
    this.context = context;
  }
}

class OrderProcessingError extends AppError {
  readonly code = 'ORDER_PROCESSING_FAILED';
  readonly httpStatus = 500;

  constructor(orderId: string, cause: string) {
    super(
      `Order processing failed: ${cause} [orderId=${orderId}]`,
      'Your order could not be processed. Please try again or contact support.',
      { orderId, cause },
    );
  }
}

// In the error handler middleware
res.status(err.httpStatus).json({
  error: {
    code: err.code,
    message: err.userMessage, // safe for the client
  },
});

logger.error(err.message, { ...err.context, stack: err.stack }); // full details server-side
```

**Non-compliant:**

```typescript
// Stack trace sent directly to the client
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
  });
});

// Database column names and query details exposed
throw new Error(`Column "user_email" violates unique constraint on table "users"`);
// ^ This message reaches the user as-is
```

---

### ERR-06: Validate at Boundaries

**Severity:** Warning
**Rule:** Validate external inputs at system entry points — API controllers, message handlers, form submission handlers — not deep inside business logic.
**Why:** Boundary validation catches bad data early with clear error messages, keeps business logic clean, and prevents invalid state from propagating through the system.

**Compliant:**

```typescript
// Validation at the API boundary using a schema
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

router.post('/orders', async (req, res, next) => {
  const result = CreateOrderSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }

  // Business logic receives already-validated data
  const order = await orderService.create(result.data);
  res.status(201).json(order);
});

// Business logic trusts its inputs — no redundant checks
class OrderService {
  async create(input: CreateOrderInput): Promise<Order> {
    const customer = await this.customers.getOrFail(input.customerId);
    return this.orders.save({ ...input, status: 'pending' });
  }
}
```

**Non-compliant:**

```typescript
// Validation buried deep inside business logic
class OrderService {
  async create(input: any): Promise<Order> {
    if (!input.customerId) throw new Error('Customer ID required');
    if (!Array.isArray(input.items)) throw new Error('Items must be array');
    if (input.items.length === 0) throw new Error('Need at least one item');
    for (const item of input.items) {
      if (!item.productId) throw new Error('Product ID required');
      if (typeof item.quantity !== 'number') throw new Error('Invalid quantity');
      if (item.quantity <= 0) throw new Error('Quantity must be positive');
    }
    // ...finally starts the real work
  }
}
```

---

### ERR-07: Use Result Types for Expected Failures

**Severity:** Convention
**Rule:** Operations with expected failure modes (validation, lookups, external calls) should return a `Result<T, E>` type instead of throwing — reserve exceptions for truly unexpected situations.
**Why:** Result types make failure a visible part of the function signature, forcing callers to handle both paths and eliminating the guesswork of which functions throw and which don't.

**Compliant:**

```typescript
type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

async function findUser(id: string): Promise<Result<User, UserNotFoundError>> {
  const user = await db.users.findById(id);
  if (!user) {
    return err(new UserNotFoundError(id));
  }
  return ok(user);
}

// Caller is forced to handle both paths — can't accidentally ignore the error
const result = await findUser(userId);
if (!result.ok) {
  return res.status(result.error.httpStatus).json({
    error: { code: result.error.code, message: result.error.userMessage },
  });
}

const user = result.value;
```

**Non-compliant:**

```typescript
// Caller has no idea this throws — nothing in the signature indicates it
async function findUser(id: string): Promise<User> {
  const user = await db.users.findById(id);
  if (!user) {
    throw new UserNotFoundError(id);
  }
  return user;
}

// Easy to forget the try/catch, and the error type is invisible
const user = await findUser(userId); // throws? maybe? who knows
```

---

### ERR-08: Handle Async Errors Explicitly

**Severity:** Error
**Rule:** Every Promise must have a `.catch()` handler or be awaited inside a `try/catch` — no fire-and-forget Promises without error handling.
**Why:** Unhandled Promise rejections crash Node.js processes (since v15+) and create silent failures in browsers.

**Compliant:**

```typescript
// Awaited with try/catch
async function processOrder(orderId: string): Promise<void> {
  try {
    const order = await orderRepository.findOrFail(orderId);
    await paymentService.charge(order);
    await notificationService.sendConfirmation(order);
  } catch (error) {
    logger.error('Order processing failed', { orderId, error });
    throw error;
  }
}

// Fire-and-forget with explicit catch (when you intentionally don't need to await)
void notificationService.sendConfirmation(order).catch((error) => {
  logger.error('Failed to send order confirmation', {
    orderId: order.id,
    error,
  });
});

// Promise.all with proper error handling
const results = await Promise.allSettled([
  fetchInventory(productId),
  fetchPricing(productId),
]);

for (const result of results) {
  if (result.status === 'rejected') {
    logger.error('Parallel fetch failed', { reason: result.reason });
  }
}
```

**Non-compliant:**

```typescript
// Fire-and-forget — if this rejects, the process may crash
notificationService.sendConfirmation(order);

// Missing catch on a chained promise
fetchData(url).then((data) => process(data));
// ^ rejection vanishes silently or crashes the process

// Async function called without await or catch
async function cleanup() { /* ... */ }
cleanup(); // returned Promise is ignored
```

---

### ERR-09: Log Errors with Structured Context

**Severity:** Warning
**Rule:** Log errors with a correlation ID, operation name, and relevant entity identifiers as structured fields — not interpolated into the message string.
**Why:** Structured logs are searchable and filterable in log aggregation tools; string-interpolated context is not.

**Compliant:**

```typescript
logger.error('Payment processing failed', {
  correlationId: req.correlationId,
  operation: 'processPayment',
  orderId: order.id,
  customerId: order.customerId,
  amount: order.total,
  provider: 'stripe',
  errorCode: error.code,
  errorMessage: error.message,
  stack: error.stack,
});

// Middleware that attaches correlation ID to every request
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] as string ?? randomUUID();
  next();
});
```

**Non-compliant:**

```typescript
// Unstructured — impossible to filter by orderId in Datadog/Splunk
logger.error(`Payment failed for order ${order.id}: ${error.message}`);

// console.log in production — no level, no structure, no aggregation
console.log('Error:', error);

// Missing context — which order? which user? which operation?
logger.error('Something went wrong', { error });
```

---

### ERR-10: Fail Fast on Unrecoverable Errors

**Severity:** Error
**Rule:** Detect unrecoverable errors — missing environment variables, invalid configuration, unreachable required services — at startup and crash immediately with a clear message.
**Why:** A half-initialized service that limps along causes subtle, hard-to-diagnose failures; crashing at startup makes the problem obvious and prevents data corruption.

**Compliant:**

```typescript
// Validate all required config at startup — before the server starts
function loadConfig(): AppConfig {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'REDIS_URL'] as const;
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    // Crash immediately with a clear, actionable message
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Check your .env file or deployment configuration.`,
    );
  }

  return {
    databaseUrl: process.env.DATABASE_URL!,
    jwtSecret: process.env.JWT_SECRET!,
    redisUrl: process.env.REDIS_URL!,
  };
}

// Called at the top of main — fails before any requests are accepted
async function main() {
  const config = loadConfig();
  const db = await connectDatabase(config.databaseUrl); // throws if unreachable
  const app = createApp(config, db);
  app.listen(3000);
}

main().catch((error) => {
  console.error('Fatal: Application failed to start', error);
  process.exit(1);
});
```

**Non-compliant:**

```typescript
// Silently falls back to undefined — causes cryptic errors later
const dbUrl = process.env.DATABASE_URL || '';

// Defers the crash to the first database call — confusing and delayed
class UserService {
  async getUser(id: string) {
    const db = await connect(process.env.DATABASE_URL); // might be undefined!
    return db.query('SELECT * FROM users WHERE id = $1', [id]);
  }
}

// Catches a fatal error and continues anyway
try {
  await connectDatabase(config.databaseUrl);
} catch (error) {
  logger.error('Database connection failed', { error });
  // Server keeps running... but every request will fail
}
```

## Customization

- **ERR-07 (Result types)** is the most commonly debated rule. Some teams prefer a pure exception-based approach for all error handling, finding Result types add verbosity without proportional benefit — especially in codebases where try/catch is already well-disciplined. Teams that adopt Result types typically apply them selectively to service-layer operations with known failure modes (validation, lookups) while still using exceptions for infrastructure failures. This rule is marked as Convention severity to reflect that either approach can work if applied consistently.

- **Error class hierarchy depth** varies by project size. Small services may only need `AppError` plus 3–4 concrete subclasses. Larger systems often introduce an intermediate layer (e.g., `HttpError`, `DomainError`, `IntegrationError`) to group errors by category. Avoid premature abstraction — start flat and add hierarchy only when you have clear categories with shared behavior.

- **ERR-09 (Structured logging)** assumes a structured logging library (e.g., pino, winston with JSON transport). Teams using simpler logging setups may relax the structured fields requirement but should still include correlation IDs and entity identifiers.

- **ERR-06 (Boundary validation)** specifies Zod in examples, but any schema validation library (Joi, class-validator, io-ts, Valibot) satisfies the rule. The principle is that validation happens at entry points, not the specific tool.

- **ERR-04 (Error boundaries)** examples show React class components for error boundaries since React does not yet support function component error boundaries natively. Teams using libraries like `react-error-boundary` can use the hook-based API instead.
