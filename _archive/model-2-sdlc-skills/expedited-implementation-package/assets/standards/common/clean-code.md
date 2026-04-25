# Clean Code Standards

## Purpose

These standards translate Robert C. Martin's Clean Code principles into concrete, checkable rules for everyday development. Clean code is code that reads clearly, does what the reader expects, and is easy to modify safely. These rules cover function design, class structure, composition patterns, and code hygiene. For SOLID principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion), see CDP-01 through CDP-05 in `code-design-principles.md` — they are not repeated here.

## Applicability

These standards apply to all TypeScript/JavaScript projects including backend services (Node.js, NestJS, Express), frontend applications (React, Next.js), shared libraries, and CLI tools. While the examples use TypeScript, the principles apply to any language. Teams should configure linters (ESLint, Biome) to enforce measurable rules (function length, parameter count, complexity) automatically where possible.

## Rules

### CC-01: Functions Should Be Small

**Severity:** Warning
**Rule:** Aim for functions between 5 and 20 lines; any function exceeding 30 lines should be reviewed and likely split into smaller functions.
**Why:** Small functions are easier to name, easier to test, easier to reason about, and easier to reuse — a long function is almost always doing more than one thing.

**Compliant:**

```typescript
async function processOrder(order: Order): Promise<OrderResult> {
  const validated = validateOrder(order);
  const priced = applyPricing(validated);
  const saved = await saveOrder(priced);
  await sendConfirmation(saved);
  return saved;
}
```

**Non-compliant:**

```typescript
async function processOrder(order: Order): Promise<OrderResult> {
  // 15 lines of validation...
  // 10 lines of pricing calculation...
  // 8 lines of database operations...
  // 12 lines of email formatting and sending...
  // 5 lines of audit logging...
  // 50+ lines in a single function doing five distinct jobs
}
```

---

### CC-02: Functions Should Do One Thing

**Severity:** Error
**Rule:** A function should perform a single task at a single level of abstraction — if its body can be divided into sections with separate headings, extract those sections into their own functions.
**Why:** Functions that do multiple things are hard to name accurately, difficult to test in isolation, and change for multiple reasons.

**Compliant:**

```typescript
function validateOrder(order: Order): ValidatedOrder {
  assertHasItems(order);
  assertValidTotals(order);
  assertShippingAddress(order);
  return { ...order, validated: true };
}
```

**Non-compliant:**

```typescript
function handleOrder(order: Order): void {
  if (order.items.length === 0) throw new Error('No items');
  if (order.total <= 0) throw new Error('Invalid total');
  const tax = order.total * 0.08;
  const total = order.total + tax;
  db.orders.insert({ ...order, total, tax });
  mailer.send(order.email, `Order confirmed: $${total}`);
  // Validates, calculates, persists, and notifies — four responsibilities
}
```

---

### CC-03: One Level of Abstraction Per Function

**Severity:** Warning
**Rule:** Do not mix high-level orchestration with low-level implementation details in the same function — a function that calls `validateOrder()` should not also contain inline regex or raw SQL.
**Why:** Mixing abstraction levels forces the reader to constantly switch mental gears, obscuring the function's intent behind implementation noise.

**Compliant:**

```typescript
async function registerUser(input: RegistrationInput): Promise<User> {
  const validated = validateRegistration(input);
  const hashed = await hashPassword(validated.password);
  return createUser({ ...validated, passwordHash: hashed });
}

function validateRegistration(input: RegistrationInput): ValidatedInput {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new ValidationError('Invalid email format');
  }
  return input as ValidatedInput;
}
```

**Non-compliant:**

```typescript
async function registerUser(input: RegistrationInput): Promise<User> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new Error('Invalid email');
  }
  const salt = await crypto.randomBytes(16);
  const hash = await crypto.pbkdf2(input.password, salt, 100000, 64, 'sha512');
  const result = await db.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
    [input.email, hash.toString('hex')],
  );
  return mapRowToUser(result.rows[0]);
  // Mixes email regex, crypto details, and raw SQL with orchestration
}
```

---

### CC-04: Limit Function Parameters

**Severity:** Warning
**Rule:** Functions should accept at most 3 parameters — functions requiring 4 or more should use an options or config object. Boolean flag parameters are a code smell; extract to two separate functions instead.
**Why:** Long parameter lists are hard to remember, easy to misorder, and make call sites unreadable — an options object is self-documenting and order-independent.

**Compliant:**

```typescript
interface SearchOptions {
  query: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

function searchProducts(options: SearchOptions): Promise<SearchResult> {
  // Parameters are named, ordered doesn't matter, easy to extend
}
```

**Non-compliant:**

```typescript
function searchProducts(
  query: string, page: number, pageSize: number,
  sortBy: string, sortOrder: string, includeArchived: boolean,
): Promise<SearchResult> { /* ... */ }

// Call site is unreadable — what do these positional args mean?
searchProducts('shoes', 1, 20, 'price', 'asc', false);

// Boolean flag: should be two functions
function getUsers(includeInactive: boolean) { /* ... */ }
// Better: getActiveUsers() and getAllUsers()
```

---

### CC-05: No Side Effects in Query Functions

**Severity:** Error
**Rule:** Functions that return a value must not modify state — follow Command-Query Separation: commands change state and return void, queries return data and change nothing.
**Why:** Side effects in query functions create hidden dependencies; calling `getUser()` should be safe to call multiple times without changing the system.

**Compliant:**

```typescript
// Query: returns data, no side effects
function getOrderTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Command: changes state, returns void
async function markOrderShipped(orderId: string): Promise<void> {
  await db.orders.update(orderId, { status: 'shipped', shippedAt: new Date() });
}
```

**Non-compliant:**

```typescript
function getOrderTotal(order: Order): number {
  order.status = 'calculated'; // hidden side effect!
  order.calculatedAt = new Date();
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
// Calling getOrderTotal() mutates the order — callers don't expect this
```

---

### CC-06: Organize Classes Top-Down

**Severity:** Convention
**Rule:** Place public methods at the top of a class, followed by protected methods, then private helpers — a reader should understand the class's API by reading from top to bottom.
**Why:** Top-down organization lets readers quickly scan what a class does (public interface) before diving into how it does it (private implementation).

**Compliant:**

```typescript
class UserService {
  async createUser(input: CreateUserInput): Promise<User> {
    const validated = this.validateInput(input);
    return this.persistUser(validated);
  }

  async getUser(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  private validateInput(input: CreateUserInput): ValidatedInput { /* ... */ }
  private async persistUser(input: ValidatedInput): Promise<User> { /* ... */ }
}
```

**Non-compliant:**

```typescript
class UserService {
  private validateInput(input: CreateUserInput): ValidatedInput { /* ... */ }
  private async persistUser(input: ValidatedInput): Promise<User> { /* ... */ }
  private formatResponse(user: User): UserDto { /* ... */ }

  async createUser(input: CreateUserInput): Promise<User> { /* ... */ }
  async getUser(id: string): Promise<User | null> { /* ... */ }
  // Public API is buried below private helpers
}
```

---

### CC-07: Keep Classes Small and Focused

**Severity:** Warning
**Rule:** A class with more than approximately 200 lines or more than 5–7 public methods is likely violating the Single Responsibility Principle — see CDP-01.
**Why:** Large classes are hard to navigate, hard to test, and tend to accumulate unrelated responsibilities over time; small classes are easier to understand and compose.

**Compliant:**

```typescript
class PasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

**Non-compliant:**

```typescript
class UserManager {
  async createUser() { /* ... */ }
  async deleteUser() { /* ... */ }
  async updateProfile() { /* ... */ }
  async changePassword() { /* ... */ }
  async resetPassword() { /* ... */ }
  async verifyEmail() { /* ... */ }
  async uploadAvatar() { /* ... */ }
  async getLoginHistory() { /* ... */ }
  async exportUserData() { /* ... */ }
  async importUsers() { /* ... */ }
  // 10+ public methods, 500+ lines — this is a god class
}
```

---

### CC-08: Prefer Composition Over Inheritance

**Severity:** Warning
**Rule:** Use delegation and interfaces to share behavior between classes — reserve inheritance for genuine "is-a" relationships with stable base classes.
**Why:** Inheritance creates tight coupling between parent and child; changes to the base class ripple through all subclasses, and deep hierarchies become rigid and hard to refactor.

**Compliant:**

```typescript
interface Logger { log(message: string): void; }

class OrderService {
  constructor(private logger: Logger, private repo: OrderRepository) {}

  async create(order: Order): Promise<void> {
    await this.repo.save(order);
    this.logger.log(`Order ${order.id} created`);
  }
}
```

**Non-compliant:**

```typescript
class BaseService {
  protected logger = new ConsoleLogger();
  protected db = new DatabaseClient();
  protected cache = new RedisClient();
}

class OrderService extends BaseService {
  // Inherits logger, db, cache — even if it doesn't need cache
  // Cannot swap logger implementation without modifying BaseService
  // Testing requires setting up the entire base class dependency tree
}

class UserService extends BaseService {
  // Same tight coupling — changes to BaseService affect all services
}
```

---

### CC-09: Avoid Primitive Obsession

**Severity:** Convention
**Rule:** Use domain-specific types instead of raw primitives for concepts with meaning, validation, or formatting — `EmailAddress` not `string`, `Money` not `number`, `OrderId` not `string`.
**Why:** Primitives carry no semantic meaning; a `string` parameter could be a name, an email, a URL, or a SQL injection — domain types make invalid states unrepresentable and provide a natural place for validation.

**Compliant:**

```typescript
class EmailAddress {
  readonly value: string;
  constructor(input: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
      throw new ValidationError(`Invalid email: ${input}`);
    }
    this.value = input.toLowerCase();
  }
}

class Money {
  constructor(readonly amount: number, readonly currency: string) {
    if (amount < 0) throw new ValidationError('Amount cannot be negative');
  }
  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Currency mismatch');
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

**Non-compliant:**

```typescript
// Primitives everywhere — no validation, no type safety
function sendInvoice(email: string, amount: number, currency: string): void {
  // Is email validated? Can amount be negative? Is currency a valid ISO code?
  // Nothing prevents: sendInvoice("not-an-email", -100, "FAKE")
}

// Easy to mix up parameters of the same type
function transfer(from: string, to: string, amount: number): void { /* ... */ }
transfer(toAccount, fromAccount, amount); // swapped — compiles fine, transfers backward
```

---

### CC-10: Eliminate Dead Code

**Severity:** Warning
**Rule:** Remove unused functions, unreachable branches, commented-out code, and unused imports — dead code must not remain in the codebase.
**Why:** Dead code confuses readers who cannot tell whether it is intentionally preserved or accidentally left behind; it creates false signals in search results and inflates cognitive load.

**Compliant:**

```typescript
function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

**Non-compliant:**

```typescript
function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// function calculateTotalV2(items: OrderItem[]): number {
//   // TODO: use this when we switch to new pricing
//   return items.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);
// }

function legacyCalculateTotal(items: any[]): number {
  // Nobody calls this — it was replaced 6 months ago
  let total = 0;
  for (const item of items) { total += item.price * item.qty; }
  return total;
}
```

---

### CC-11: Follow the Boy Scout Rule

**Severity:** Convention
**Rule:** Leave code cleaner than you found it — when modifying a file, fix one small improvement: rename an unclear variable, extract a helper, remove dead code, add a missing type annotation.
**Why:** Continuous small improvements prevent codebase decay; without them, technical debt accumulates until a costly rewrite is required.

**Compliant:**

```typescript
// While fixing a bug in this function, also rename the unclear variable
// Before:
function calc(o: Order): number {
  const x = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
  return x * 1.08;
}

// After (bug fix + cleanup):
function calculateOrderTotal(order: Order): number {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return subtotal * (1 + TAX_RATE);
}
```

**Non-compliant:**

```typescript
// Fixed the bug but left the unclear naming and magic number untouched
function calc(o: Order): number {
  const x = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
  return x * 1.08; // what is 1.08? tax? markup? rounding?
}
// "Not my problem" — the file gets worse with every touch
```

---

### CC-12: Avoid Feature Envy

**Severity:** Warning
**Rule:** A method that uses more data from another class than from its own class belongs in the other class — move it or extract the relevant data into a shared abstraction.
**Why:** Feature envy creates hidden coupling; the envious method breaks when the other class changes its internal structure, and the logic is harder to find because it lives in the wrong place.

**Compliant:**

```typescript
class Order {
  getShippingCost(): number {
    return this.weight > 20
      ? this.shippingAddress.heavyItemRate
      : this.shippingAddress.standardRate;
  }
}

class ShippingAddress {
  readonly standardRate: number;
  readonly heavyItemRate: number;
}
```

**Non-compliant:**

```typescript
class InvoiceService {
  calculateShipping(order: Order): number {
    const address = order.shippingAddress;
    const weight = order.totalWeight;
    const zone = address.zone;
    const rate = zone === 'domestic' ? address.domesticRate : address.internationalRate;
    const surcharge = weight > 20 ? address.heavySurcharge : 0;
    return rate + surcharge;
    // This method knows everything about Order and ShippingAddress
    // but nothing about InvoiceService — it belongs on Order or ShippingAddress
  }
}
```

### CC-13: Keep Files Small

**Severity:** Warning
**Rule:** Aim for files between 200 and 400 lines; any file exceeding 800 lines must be split. Organize files by feature or domain, not by technical layer.
**Why:** Large files accumulate unrelated responsibilities, are difficult to navigate, and produce noisy diffs that obscure meaningful changes — many small, cohesive files are easier to own, review, and test.

**Compliant:**

```
src/
├── orders/
│   ├── create-order.ts          (120 lines — handles order creation)
│   ├── cancel-order.ts          (90 lines — handles cancellation)
│   ├── order.repository.ts      (80 lines — data access)
│   ├── order.validators.ts      (60 lines — validation rules)
│   └── order.types.ts           (40 lines — shared types)
```

**Non-compliant:**

```
src/
├── orders/
│   └── order.service.ts         (1200 lines — creates, cancels, refunds,
│                                  validates, formats, sends emails, audits)
```

---

### CC-14: Code Quality Checklist

**Severity:** Convention
**Rule:** Before marking work complete, verify that all of the following hold — configure linters to enforce the measurable items automatically.
**Why:** A consistent checklist catches common quality issues before code review, reducing review cycles and preventing debt accumulation.

**The checklist:**

- [ ] Code is readable and well-named (CC-09, naming standards)
- [ ] Functions are small (CC-01: aim for ≤20 lines, review at 30+)
- [ ] Functions do one thing (CC-02)
- [ ] Files are focused (CC-13: aim for 200–400 lines, hard limit 800)
- [ ] No deep nesting (CDP-08: ≤3 levels)
- [ ] Proper error handling (ERR-01 through ERR-06)
- [ ] No hardcoded values — use named constants or configuration
- [ ] Immutable updates — no in-place mutation of shared state (see language-specific immutability rules)
- [ ] No dead code (CC-10)
- [ ] Parameter count ≤3 (CC-04)

---

## Customization

- **CC-13 (File size limits)** thresholds are guidelines. Framework conventions may inflate line counts — React components with JSX, NestJS controllers with decorator metadata, and test files with extensive fixtures all tend to be longer. Adjust to your stack but treat any file over 800 lines as a strong signal to split.

- **CC-14 (Code quality checklist)** is a minimum floor. Teams should extend it with project-specific items (e.g., accessibility checks, performance budgets, security review) and automate as many items as possible through linter rules.

- **CC-01 (Function line limits)** are guidelines, not absolute rules. Some complex algorithms, state machines, or data transformations legitimately need longer functions. When a function exceeds 30 lines, the team should review whether extraction would improve clarity — if extracting would just shuffle complexity around without adding understanding, the longer function may be the better choice. Configure the threshold in your linter (e.g., `max-lines-per-function`) and document exceptions.

- **CC-04 (Parameter limits)** vary by team convention. Some teams allow 4 parameters for constructors or factory functions where an options object would add indirection without clarity. The important principle is that call sites should be readable — if a reviewer cannot understand a function call without checking the signature, there are too many parameters.

- **CC-07 (Class size limits)** depend on language and framework conventions. React components with JSX tend to be longer than pure logic classes; NestJS controllers with decorator metadata inflate line counts. Adjust the threshold to match your stack, but treat any class over 300 lines as a strong signal to split regardless of framework.
