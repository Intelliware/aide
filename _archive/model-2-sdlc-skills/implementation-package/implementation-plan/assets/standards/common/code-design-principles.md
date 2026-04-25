# Code Design Principles

## Purpose

These standards codify foundational software design principles — SOLID, coupling, cohesion, complexity management, and key design maxims — into concrete, checkable rules. Good design makes code easier to understand, safer to change, and cheaper to maintain. These principles apply at every level of abstraction: functions, classes, modules, and services. Following them consistently produces systems that evolve gracefully instead of accumulating accidental complexity.

## Applicability

These standards apply to all TypeScript/JavaScript projects including backend services (Node.js, NestJS, Express), frontend applications (React, Next.js), shared libraries, and CLI tools. The SOLID principles originate from object-oriented design but apply equally to functional and module-oriented architectures — "class" can be read as "module" or "component" where appropriate.

## Rules

### CDP-01: Single Responsibility Principle

**Severity:** Error
**Rule:** Every class or module must have exactly one reason to change — if you cannot describe its purpose without the word "and," split it.
**Why:** Classes with multiple responsibilities are harder to test, harder to name, and change for unrelated reasons — a modification to email formatting should not risk breaking order processing.

**Compliant:**

```typescript
class OrderValidator {
  validate(order: Order): ValidationResult {
    const errors: string[] = [];
    if (order.items.length === 0) errors.push('Order must have items');
    if (order.total <= 0) errors.push('Total must be positive');
    return { valid: errors.length === 0, errors };
  }
}

class OrderRepository {
  async save(order: Order): Promise<void> {
    await this.db.orders.insert(order);
  }
}

class OrderNotifier {
  async sendConfirmation(order: Order): Promise<void> {
    await this.mailer.send(order.customerEmail, formatConfirmation(order));
  }
}
```

**Non-compliant:**

```typescript
class OrderManager {
  validate(order: Order): boolean { /* validation logic */ }
  save(order: Order): Promise<void> { /* database logic */ }
  sendEmail(order: Order): Promise<void> { /* email logic */ }
  generateReport(orders: Order[]): string { /* reporting logic */ }
  // Four reasons to change: validation rules, DB schema, email templates, report format
}
```

---

### CDP-02: Open/Closed Principle

**Severity:** Warning
**Rule:** Design modules to be open for extension but closed for modification — add new behavior through new implementations of an abstraction, not by editing existing code.
**Why:** Modifying working code to add a feature risks introducing regressions in existing functionality; extension through abstraction keeps existing behavior stable.

**Compliant:**

```typescript
interface PricingStrategy {
  calculate(items: OrderItem[]): number;
}

class StandardPricing implements PricingStrategy {
  calculate(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}

class DiscountPricing implements PricingStrategy {
  constructor(private discount: number) {}
  calculate(items: OrderItem[]): number {
    const base = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return base * (1 - this.discount);
  }
}

// Adding a new pricing strategy requires no changes to existing code
class OrderService {
  constructor(private pricing: PricingStrategy) {}
  getTotal(items: OrderItem[]): number {
    return this.pricing.calculate(items);
  }
}
```

**Non-compliant:**

```typescript
class OrderService {
  getTotal(items: OrderItem[], discountType: string): number {
    let total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (discountType === 'seasonal') total *= 0.9;
    else if (discountType === 'loyalty') total *= 0.85;
    else if (discountType === 'bulk') total *= 0.8;
    // Every new discount type requires editing this method
    return total;
  }
}
```

---

### CDP-03: Liskov Substitution Principle

**Severity:** Error
**Rule:** Subtypes must be substitutable for their base type without altering program correctness — overridden methods must honor the contract of the parent, not narrow preconditions or widen postconditions.
**Why:** If substituting a subclass changes behavior in unexpected ways, the type hierarchy is a lie — callers cannot trust the base type's contract, and polymorphism becomes a source of bugs.

**Compliant:**

```typescript
interface Shape {
  area(): number;
}

class Rectangle implements Shape {
  constructor(protected width: number, protected height: number) {}
  area(): number { return this.width * this.height; }
}

class Square implements Shape {
  constructor(private side: number) {}
  area(): number { return this.side * this.side; }
}

// Both satisfy the Shape contract — callers can use either interchangeably
function printArea(shape: Shape): void {
  console.log(`Area: ${shape.area()}`);
}
```

**Non-compliant:**

```typescript
class Rectangle {
  constructor(public width: number, public height: number) {}
  area(): number { return this.width * this.height; }
}

class Square extends Rectangle {
  set width(value: number) { this.width = value; this.height = value; }
  set height(value: number) { this.width = value; this.height = value; }
  // Violates LSP: callers of Rectangle expect width and height to be independent
  // rect.width = 5; rect.height = 10; rect.area() should be 50, not 100
}
```

---

### CDP-04: Interface Segregation Principle

**Severity:** Warning
**Rule:** Prefer small, focused interfaces over large ones — a client should not be forced to depend on methods it does not use.
**Why:** Fat interfaces create unnecessary coupling; implementing classes are forced to stub methods they don't need, and callers receive capabilities they shouldn't have.

**Compliant:**

```typescript
interface Readable {
  read(id: string): Promise<Entity | null>;
}

interface Writable {
  save(entity: Entity): Promise<void>;
  delete(id: string): Promise<void>;
}

interface ReadWriteRepository extends Readable, Writable {}

// A reporting service only needs read access
class ReportService {
  constructor(private repo: Readable) {}
  async generate(id: string): Promise<Report> {
    const entity = await this.repo.read(id);
    return buildReport(entity);
  }
}
```

**Non-compliant:**

```typescript
interface Repository {
  read(id: string): Promise<Entity | null>;
  save(entity: Entity): Promise<void>;
  delete(id: string): Promise<void>;
  bulkInsert(entities: Entity[]): Promise<void>;
  migrate(): Promise<void>;
  backup(): Promise<void>;
}

// ReportService only needs read() but depends on the entire interface
class ReportService {
  constructor(private repo: Repository) {}
}
```

---

### CDP-05: Dependency Inversion Principle

**Severity:** Warning
**Rule:** High-level modules must depend on abstractions (interfaces), not on low-level implementation details — inject dependencies rather than importing concrete classes directly.
**Why:** Direct imports of concrete implementations create rigid coupling; swapping a database driver, email provider, or payment gateway should not require editing business logic.

**Compliant:**

```typescript
interface PaymentGateway {
  charge(amount: number, token: string): Promise<PaymentResult>;
}

class OrderService {
  constructor(private payments: PaymentGateway) {}
  async checkout(order: Order, token: string): Promise<void> {
    const result = await this.payments.charge(order.total, token);
    if (!result.success) throw new PaymentFailedError(order.id);
  }
}

// Concrete implementation is injected at the composition root
const stripe = new StripeGateway(config.stripeKey);
const orderService = new OrderService(stripe);
```

**Non-compliant:**

```typescript
import { StripeGateway } from './stripe-gateway';

class OrderService {
  private payments = new StripeGateway(process.env.STRIPE_KEY!);

  async checkout(order: Order, token: string): Promise<void> {
    await this.payments.charge(order.total, token);
    // Switching to Adyen requires editing this class
    // Testing requires a real Stripe connection or mocking the import
  }
}
```

---

### CDP-06: Minimize Coupling

**Severity:** Warning
**Rule:** Follow the Law of Demeter — each unit should only talk to its immediate collaborators, not reach through chains of objects to access distant data.
**Why:** Method chains like `order.getCustomer().getAddress().getCity()` couple the caller to the entire object graph; any structural change in the chain breaks all callers.

**Compliant:**

```typescript
class OrderService {
  getShippingCity(order: Order): string {
    return order.shippingCity;
  }
}

class Order {
  get shippingCity(): string {
    return this.shippingAddress.city;
  }
}
```

**Non-compliant:**

```typescript
class OrderService {
  getShippingCity(order: Order): string {
    return order.getCustomer().getAddress().getCity();
    // Coupled to Customer, Address, and City internals
    // If Address changes to use a Location object, this breaks
  }
}
```

---

### CDP-07: Maximize Cohesion

**Severity:** Warning
**Rule:** Related data and behavior belong together — a class where every method uses most fields has high cohesion; a class where disjoint subsets of methods use disjoint subsets of fields should be split.
**Why:** Low cohesion signals that a class is doing multiple unrelated jobs, making it harder to understand, test, and change without unintended side effects.

**Compliant:**

```typescript
class EmailSender {
  constructor(private smtp: SmtpClient, private from: string) {}
  async send(to: string, subject: string, body: string): Promise<void> {
    await this.smtp.send({ from: this.from, to, subject, body });
  }
  async sendBulk(recipients: string[], subject: string, body: string): Promise<void> {
    await Promise.all(recipients.map((to) => this.send(to, subject, body)));
  }
}
```

**Non-compliant:**

```typescript
class NotificationService {
  private smtp: SmtpClient;       // only used by email methods
  private smsClient: SmsClient;   // only used by SMS methods
  private pushClient: PushClient; // only used by push methods

  sendEmail(to: string, body: string) { /* uses smtp only */ }
  sendSms(phone: string, text: string) { /* uses smsClient only */ }
  sendPush(deviceId: string, payload: object) { /* uses pushClient only */ }
  // Three disjoint groups — should be three separate classes
}
```

---

### CDP-08: Manage Complexity

**Severity:** Warning
**Rule:** Keep cyclomatic complexity at or below 10 per function and nesting depth at or below 3 levels — use early returns, guard clauses, and extraction to flatten logic.
**Why:** Deeply nested, high-complexity functions are difficult to read, test exhaustively, and reason about — every branch doubles the number of paths to verify.

**Compliant:**

```typescript
function getDiscount(customer: Customer): number {
  if (!customer.isActive) return 0;
  if (customer.tier === 'gold') return 0.2;
  if (customer.tier === 'silver') return 0.1;
  if (customer.totalOrders > 100) return 0.05;
  return 0;
}
```

**Non-compliant:**

```typescript
function getDiscount(customer: Customer): number {
  let discount = 0;
  if (customer) {
    if (customer.isActive) {
      if (customer.tier) {
        if (customer.tier === 'gold') {
          discount = 0.2;
        } else {
          if (customer.tier === 'silver') {
            discount = 0.1;
          } else {
            if (customer.totalOrders > 100) {
              discount = 0.05;
            }
          }
        }
      }
    }
  }
  return discount;
}
```

---

### CDP-09: DRY — Don't Repeat Yourself

**Severity:** Convention
**Rule:** Extract duplicated logic when it appears three or more times — but do not prematurely abstract; two similar-looking code paths that change for different reasons are not duplication.
**Why:** True duplication means a bug fix or behavior change must be applied in multiple places (and one will be missed); false duplication creates rigid abstractions that fight future change.

**Compliant:**

```typescript
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

// Used in three places — single source of truth
const orderTotal = formatCurrency(order.total, 'USD');
const refundAmount = formatCurrency(refund.amount, 'USD');
const invoiceBalance = formatCurrency(invoice.balance, 'USD');
```

**Non-compliant:**

```typescript
// Same formatting logic copy-pasted three times
const orderTotal = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD',
}).format(order.total);

const refundAmount = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD',
}).format(refund.amount);

const invoiceBalance = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD',
}).format(invoice.balance);
```

---

### CDP-10: YAGNI — You Aren't Gonna Need It

**Severity:** Convention
**Rule:** Do not build abstractions, extension points, or features "just in case" — implement what is needed now and refactor when the actual requirement emerges.
**Why:** Speculative abstractions add complexity, increase the maintenance surface, and are almost always wrong about the actual future need; when the real requirement arrives, the premature abstraction has to be torn out.

**Compliant:**

```typescript
// Current requirement: send email notifications
class EmailNotifier {
  async notify(userId: string, message: string): Promise<void> {
    const user = await this.users.findOrFail(userId);
    await this.mailer.send(user.email, message);
  }
}
```

**Non-compliant:**

```typescript
// "We might need SMS and push someday" — over-engineering before the need exists
interface NotificationChannel { send(to: string, msg: string): Promise<void>; }
interface NotificationRouter { route(type: string): NotificationChannel; }
interface NotificationTemplate { render(data: unknown): string; }
interface NotificationScheduler { schedule(notification: Notification, at: Date): void; }

class NotificationOrchestrator {
  constructor(
    private router: NotificationRouter,
    private templateEngine: NotificationTemplate,
    private scheduler: NotificationScheduler,
    private retryPolicy: RetryPolicy,
  ) {}
  // 200 lines of framework for a feature that just sends one email
}
```

## Customization

- **CDP-08 (Complexity thresholds)** are guidelines, not hard limits. Some teams allow cyclomatic complexity up to 15 for functions that implement inherently branchy logic (parsers, state machines, complex validation). The important thing is that the threshold is explicitly configured in the linter and exceptions are documented, not that every function hits exactly 10.

- **CDP-09 (Rule of three)** for extraction is a starting heuristic, not a law. Some teams extract on the second occurrence if the logic is complex or error-prone; others tolerate four occurrences of simple one-liners. The key judgment is whether the duplicated code changes for the same reason — if it does, extract it; if it merely looks similar but serves different purposes, leave it.

- **CDP-05 (Dependency Inversion)** strictness depends on project size and complexity. Small projects and scripts may not need DI containers or formal interface extraction — direct imports are fine when there is only one implementation and testability is not a concern. As the project grows and gains multiple implementations or requires mocking for tests, introduce interfaces incrementally rather than mandating them from day one.
