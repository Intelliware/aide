# Code Documentation Standards

## Purpose

These standards ensure that code is self-documenting where possible and explicitly documented where it is not. Good documentation captures intent, constraints, and non-obvious decisions — not what the code does, but why it does it. Consistent documentation practices reduce onboarding time, prevent knowledge silos, and keep APIs consumable without reading their implementation.

## Applicability

All projects regardless of language or framework. Code examples use TypeScript for illustration, but the principles apply universally — use JSDoc for TypeScript/JavaScript, KDoc for Kotlin, Javadoc for Java, and docstrings for Python.

## Rules

### DOC-01: Document All Public APIs

**Severity:** Error
**Rule:** Every exported function, class, method, and type must have a doc comment with `@param`, `@returns`, and `@throws` tags as applicable.
**Why:** Public APIs are consumed by other developers and tools; undocumented exports force consumers to read implementation details to understand usage.

**Compliant:**

```typescript
/**
 * Calculates the total price including tax and discounts.
 * @param items - Line items with quantity and unit price.
 * @param taxRate - Tax rate as a decimal (e.g., 0.08 for 8%).
 * @returns The final price in cents.
 * @throws {InvalidArgumentError} If taxRate is negative.
 */
export function calculateTotal(items: LineItem[], taxRate: number): number {
```

**Non-compliant:**

```typescript
export function calculateTotal(items: LineItem[], taxRate: number): number {
```

---

### DOC-02: Comment the "Why", Not the "What"

**Severity:** Warning
**Rule:** Comments must explain intent, trade-offs, or constraints — never narrate what the code is already doing.
**Why:** Narrating code adds noise, drifts out of sync, and teaches readers to ignore comments entirely.

**Compliant:**

```typescript
// Circuit-breaker: skip cache during deploys to avoid serving stale config
if (isDeploying) return fetchFromSource(key);
```

**Non-compliant:**

```typescript
// Check if deploying and fetch from source
if (isDeploying) return fetchFromSource(key);
```

---

### DOC-03: No Commented-Out Code

**Severity:** Error
**Rule:** Never commit commented-out code; use version control to preserve old implementations.
**Why:** Commented-out code creates confusion about whether it is dead, pending, or accidentally disabled, and it is never cleaned up.

**Compliant:**

```typescript
export function processOrder(order: Order): Result {
  return validate(order).then(submit);
}
```

**Non-compliant:**

```typescript
export function processOrder(order: Order): Result {
  // const legacy = legacyProcess(order);
  // if (legacy.success) return legacy;
  return validate(order).then(submit);
}
```

---

### DOC-04: Use TODO/FIXME with Ticket Context

**Severity:** Warning
**Rule:** TODO and FIXME comments must include a ticket reference and a description in the format `// TODO(TICKET-123): description`.
**Why:** Bare TODOs accumulate indefinitely because they are not tracked, have no owner, and lack enough context to act on.

**Compliant:**

```typescript
// TODO(PAYMENTS-456): Replace polling with webhook once Stripe integration ships
const status = await pollPaymentStatus(paymentId);
```

**Non-compliant:**

```typescript
// TODO: fix this later
const status = await pollPaymentStatus(paymentId);
```

---

### DOC-05: Document Non-Obvious Behavior

**Severity:** Warning
**Rule:** Magic numbers, complex regex patterns, workarounds, and intentional deviations from convention must have a comment explaining why.
**Why:** Non-obvious code without context forces every future reader to reverse-engineer the original author's reasoning.

**Compliant:**

```typescript
// 86400000ms = 24 hours; token refresh must happen before the IdP's 24h hard expiry
const REFRESH_INTERVAL_MS = 86_400_000;
```

**Non-compliant:**

```typescript
const REFRESH_INTERVAL_MS = 86_400_000;
```

---

### DOC-06: Keep README Current

**Severity:** Warning
**Rule:** The project README must accurately reflect current setup steps, required environment variables, architecture overview, and how to run tests; update it whenever these change.
**Why:** An outdated README is worse than no README — it actively misleads new contributors and wastes onboarding time.

**Compliant:**

```markdown
## Setup
1. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `REDIS_URL`.
2. Run `npm install && npm run db:migrate`.
3. Start the dev server: `npm run dev`.
```

**Non-compliant:**

```markdown
## Setup
1. Run `npm start`.
<!-- Missing env vars, migration step, and prerequisites -->
```

---

### DOC-07: Document Deprecations Explicitly

**Severity:** Error
**Rule:** Deprecated functions, classes, and endpoints must be annotated with `@deprecated` including a migration path and a removal timeline.
**Why:** Silent deprecation leaves consumers unaware they are building on code that will break; explicit annotations give them time and direction to migrate.

**Compliant:**

```typescript
/**
 * @deprecated Since v2.3.0 — use {@link calculateTotalV2} instead. Will be removed in v3.0.0.
 */
export function calculateTotal(items: LineItem[]): number {
```

**Non-compliant:**

```typescript
// don't use this anymore
export function calculateTotal(items: LineItem[]): number {
```

---

### DOC-08: Document API Contracts in Code

**Severity:** Warning
**Rule:** Request/response shapes, validation rules, and error codes must be documented in code via types, schemas, or doc comments — not solely in external wikis or Confluence pages.
**Why:** External documentation drifts from the implementation within weeks; code-level documentation stays in sync because it lives next to the code it describes.

**Compliant:**

```typescript
/** POST /api/v1/orders request body. */
interface CreateOrderRequest {
  /** ISO 4217 currency code (e.g., "USD"). */
  currency: string;
  /** Must contain at least one item. */
  items: OrderItem[];
}
```

**Non-compliant:**

```typescript
interface CreateOrderRequest {
  currency: string;
  items: OrderItem[];
}
// See Confluence page "Order API" for field descriptions
```

## Customization

- **DOC-01 (Annotation style):** The specific doc comment syntax varies by language — JSDoc (`/** */`) for TypeScript/JavaScript, KDoc for Kotlin, Javadoc for Java, docstrings (`"""`) for Python. The requirement to document all public APIs is universal; the tag format adapts to the ecosystem.
- **DOC-04 (TODO vs FIXME semantics):** Some teams distinguish TODO (planned enhancement) from FIXME (known bug or incorrect behavior). Either convention is acceptable as long as the team agrees on the distinction and both require a ticket reference.
- **DOC-06 (README depth):** Early-stage projects may have a minimal README covering setup and running. Mature projects should include architecture diagrams, ADR links, deployment instructions, and contribution guidelines. Scale the depth to the project's maturity and team size.
