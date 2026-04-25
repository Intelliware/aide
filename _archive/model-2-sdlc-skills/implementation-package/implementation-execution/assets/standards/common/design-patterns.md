# Design Patterns Standards

## Purpose

This standard is a pattern catalog with usage guidance — not a mandate to use every pattern everywhere, but a reference for recognizing recurring design problems and applying the right structural solution correctly. Each entry describes the problem a pattern solves, when to apply it, how to implement it properly, and what the non-compliant alternative looks like. Code that works but uses an ad-hoc approach where a well-known pattern would reduce complexity, improve extensibility, or eliminate duplication is flagged during the Standards Compliance Assessment, as is code that attempts a pattern but implements it incorrectly.

## Applicability

These standards apply to all projects. The principles are language-agnostic; all examples use TypeScript. Pattern applicability scales with project complexity — a 200-line script does not need the same structural rigor as a 50-service distributed system. The Customization section provides guidance on calibrating thresholds.

## How to Use This Standard

These rules help AI agents performing a Standards Compliance Assessment in three ways:

1. **Recognize when a pattern should be applied.** Each rule includes a "When to use" trigger — a structural smell or requirement that signals the pattern is appropriate. The assessment flags code that exhibits the trigger but uses an ad-hoc approach.
2. **Implement the pattern correctly when chosen.** Each rule includes a compliant example showing the minimal correct implementation. The assessment flags code that attempts the pattern but violates its structural contract (e.g., a Builder that still requires positional arguments).
3. **Avoid anti-patterns.** The Anti-Patterns section lists structural smells that should always be flagged regardless of which pattern would fix them.

Severity levels indicate assessment behavior: **Error** means always flag, **Warning** means flag with recommendation, **Convention** means flag as a suggestion that the team may accept or override.

## Creational Patterns

### DP-01: Factory Method

**Severity:** Warning
**Rule:** When the exact type of object to create varies based on input or configuration, encapsulate creation behind a factory — never scatter `new` calls inside switch/if chains at the call site.
**Why:** Centralizing creation logic means adding a new type requires changing one factory, not hunting for every switch statement that constructs objects. It also makes testing easier — you can stub the factory.

**Compliant:**

```typescript
interface Notification {
  send(to: string, message: string): Promise<void>;
}

class EmailNotification implements Notification {
  async send(to: string, message: string): Promise<void> {
    await this.emailClient.send({ to, subject: 'Notification', body: message });
  }
}

class SmsNotification implements Notification {
  async send(to: string, message: string): Promise<void> {
    await this.smsGateway.send({ phoneNumber: to, text: message });
  }
}

class PushNotification implements Notification {
  async send(to: string, message: string): Promise<void> {
    await this.pushService.notify({ deviceToken: to, payload: message });
  }
}

class NotificationFactory {
  private static readonly creators: Record<string, () => Notification> = {
    email: () => new EmailNotification(),
    sms: () => new SmsNotification(),
    push: () => new PushNotification(),
  };

  static create(channel: string): Notification {
    const creator = this.creators[channel];
    if (!creator) {
      throw new Error(`Unknown notification channel: ${channel}`);
    }
    return creator();
  }
}

const notification = NotificationFactory.create(user.preferredChannel);
await notification.send(user.contact, 'Your order shipped');
```

**Non-compliant:**

```typescript
async function sendNotification(channel: string, to: string, message: string) {
  if (channel === 'email') {
    const n = new EmailNotification();
    await n.send(to, message);
  } else if (channel === 'sms') {
    const n = new SmsNotification();
    await n.send(to, message);
  } else if (channel === 'push') {
    const n = new PushNotification();
    await n.send(to, message);
  } else {
    throw new Error('Unknown channel');
  }
}
```

---

### DP-02: Builder Pattern

**Severity:** Convention
**Rule:** When constructing objects with 4 or more optional parameters, use a Builder — never use telescoping constructors or rely on positional arguments where callers must pass `undefined` placeholders.
**Why:** Builders make construction self-documenting, prevent argument-order bugs, and allow validation at build time rather than after construction.

**Compliant:**

```typescript
class QueryBuilder {
  private table = '';
  private conditions: string[] = [];
  private orderByField?: string;
  private orderDirection: 'ASC' | 'DESC' = 'ASC';
  private limitValue?: number;
  private offsetValue?: number;
  private selectedFields: string[] = ['*'];

  from(table: string): this {
    this.table = table;
    return this;
  }

  select(...fields: string[]): this {
    this.selectedFields = fields;
    return this;
  }

  where(condition: string): this {
    this.conditions.push(condition);
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByField = field;
    this.orderDirection = direction;
    return this;
  }

  limit(n: number): this {
    this.limitValue = n;
    return this;
  }

  offset(n: number): this {
    this.offsetValue = n;
    return this;
  }

  build(): string {
    if (!this.table) throw new Error('Table is required');
    let query = `SELECT ${this.selectedFields.join(', ')} FROM ${this.table}`;
    if (this.conditions.length) query += ` WHERE ${this.conditions.join(' AND ')}`;
    if (this.orderByField) query += ` ORDER BY ${this.orderByField} ${this.orderDirection}`;
    if (this.limitValue !== undefined) query += ` LIMIT ${this.limitValue}`;
    if (this.offsetValue !== undefined) query += ` OFFSET ${this.offsetValue}`;
    return query;
  }
}

const query = new QueryBuilder()
  .from('orders')
  .select('id', 'total', 'status')
  .where('status = "active"')
  .orderBy('created_at', 'DESC')
  .limit(20)
  .build();
```

**Non-compliant:**

```typescript
function buildQuery(
  table: string,
  fields: string[] | undefined,
  whereClause: string | undefined,
  orderByField: string | undefined,
  orderDirection: string | undefined,
  limit: number | undefined,
  offset: number | undefined,
): string {
  // caller must pass undefined for every unused parameter
}

const query = buildQuery('orders', ['id', 'total'], 'status = "active"', 'created_at', 'DESC', 20, undefined);
```

---

### DP-03: Singleton — Use with Caution

**Severity:** Warning (when misused)
**Rule:** Prefer dependency-injected instances over singletons. Only use the Singleton pattern for true process-level resources (a logger, a configuration loader, a connection pool) — and even then, expose them through DI so they remain testable. Never use mutable singletons that accumulate state.
**Why:** Singletons create hidden coupling, make testing difficult (shared mutable state across tests), and obscure dependency graphs. DI-managed lifetimes give you the same "one instance" guarantee without the downsides.

**Compliant:**

```typescript
class DatabasePool {
  private pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool(config);
  }

  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }
}

// DI container manages the lifetime — one instance, but injectable and testable
container.register('db', { useFactory: () => new DatabasePool(config.database) }, { lifecycle: Lifecycle.Singleton });

class OrderService {
  constructor(private readonly db: DatabasePool) {}

  async getOrder(id: string): Promise<Order> {
    const [order] = await this.db.query<Order>('SELECT * FROM orders WHERE id = $1', [id]);
    return order;
  }
}
```

**Non-compliant:**

```typescript
class AppState {
  private static instance: AppState;
  public currentUser: User | null = null;
  public cart: CartItem[] = [];
  public preferences: Record<string, string> = {};

  private constructor() {}

  static getInstance(): AppState {
    if (!AppState.instance) {
      AppState.instance = new AppState();
    }
    return AppState.instance;
  }
}

// Hidden dependency — any code anywhere can mutate shared state
AppState.getInstance().cart.push(item);

// Tests pollute each other — no way to reset between tests without hacks
AppState.getInstance().currentUser = mockUser;
```

---

## Structural Patterns

### DP-04: Adapter

**Severity:** Convention
**Rule:** When integrating with external APIs, SDKs, or legacy code that has an incompatible interface, wrap it in an Adapter that conforms to your internal interface — never scatter transformation logic at every call site.
**Why:** Adapters isolate external interface changes to one file. When a vendor changes their API, you update one adapter — not twenty call sites. They also make external dependencies testable by programming against your own interface.

**Compliant:**

```typescript
interface PaymentGateway {
  charge(amount: number, currency: string, token: string): Promise<PaymentResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}

class StripeAdapter implements PaymentGateway {
  constructor(private readonly stripe: Stripe) {}

  async charge(amount: number, currency: string, token: string): Promise<PaymentResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      payment_method: token,
      confirm: true,
    });
    return {
      transactionId: intent.id,
      status: intent.status === 'succeeded' ? 'completed' : 'pending',
      amount,
    };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    const refund = await this.stripe.refunds.create({
      payment_intent: transactionId,
      amount: Math.round(amount * 100),
    });
    return { refundId: refund.id, status: refund.status === 'succeeded' ? 'completed' : 'pending' };
  }
}

class OrderService {
  constructor(private readonly payments: PaymentGateway) {}

  async checkout(order: Order, paymentToken: string): Promise<void> {
    const result = await this.payments.charge(order.total, order.currency, paymentToken);
    await this.savePayment(order.id, result);
  }
}
```

**Non-compliant:**

```typescript
class OrderService {
  private stripe = new Stripe(process.env.STRIPE_KEY!);

  async checkout(order: Order, paymentToken: string): Promise<void> {
    // Stripe-specific API shape leaked into business logic
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: order.currency.toLowerCase(),
      payment_method: paymentToken,
      confirm: true,
    });

    await this.savePayment(order.id, {
      transactionId: intent.id,
      status: intent.status === 'succeeded' ? 'completed' : 'pending',
      amount: order.total,
    });
  }

  // If you switch to PayPal, you rewrite every method in this class
}
```

---

### DP-05: Facade

**Severity:** Convention
**Rule:** When client code must coordinate multiple subsystem classes to perform a single logical operation, provide a Facade that offers one cohesive entry point — never require callers to orchestrate 3+ subsystem interactions directly.
**Why:** Facades reduce coupling between clients and complex subsystems. Callers don't need to know the subsystem's internal structure or the order of operations.

**Compliant:**

```typescript
class OrderFacade {
  constructor(
    private readonly inventory: InventoryService,
    private readonly payments: PaymentService,
    private readonly shipping: ShippingService,
    private readonly notifications: NotificationService,
  ) {}

  async placeOrder(order: OrderRequest): Promise<OrderConfirmation> {
    await this.inventory.reserve(order.items);

    try {
      const payment = await this.payments.charge(order.paymentMethod, order.total);
      const shipment = await this.shipping.createShipment(order.items, order.address);
      await this.notifications.sendConfirmation(order.customerId, { payment, shipment });

      return { orderId: payment.transactionId, shipmentTracking: shipment.trackingNumber };
    } catch (error) {
      await this.inventory.release(order.items);
      throw error;
    }
  }
}

// Client code — simple and decoupled from subsystem internals
const confirmation = await orderFacade.placeOrder(orderRequest);
```

**Non-compliant:**

```typescript
async function handleCheckout(req: Request, res: Response) {
  const inventoryService = new InventoryService();
  const paymentService = new PaymentService();
  const shippingService = new ShippingService();
  const notificationService = new NotificationService();

  // Controller is orchestrating 4 subsystems — this logic gets duplicated
  await inventoryService.reserve(req.body.items);

  try {
    const payment = await paymentService.charge(req.body.paymentMethod, req.body.total);
    const shipment = await shippingService.createShipment(req.body.items, req.body.address);
    await notificationService.sendConfirmation(req.body.customerId, { payment, shipment });
    res.json({ orderId: payment.transactionId, tracking: shipment.trackingNumber });
  } catch (error) {
    await inventoryService.release(req.body.items);
    throw error;
  }
}
```

---

### DP-06: Decorator

**Severity:** Convention
**Rule:** When adding cross-cutting behavior (logging, caching, retry, authorization) to objects dynamically, use the Decorator pattern to wrap the original — never create subclass hierarchies for each combination of behaviors.
**Why:** Decorators are composable. You can stack `Retry(Cache(Log(service)))` in any combination. Subclassing forces you to create `CachedRetryingLoggingService`, `RetryingLoggingService`, `CachedLoggingService`, etc. — a combinatorial explosion.

**Compliant:**

```typescript
interface HttpClient {
  request(config: RequestConfig): Promise<Response>;
}

class BaseHttpClient implements HttpClient {
  async request(config: RequestConfig): Promise<Response> {
    return fetch(config.url, { method: config.method, body: config.body, headers: config.headers });
  }
}

class RetryingHttpClient implements HttpClient {
  constructor(private readonly inner: HttpClient, private readonly maxRetries = 3) {}

  async request(config: RequestConfig): Promise<Response> {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.inner.request(config);
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries) await this.delay(2 ** attempt * 100);
      }
    }
    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class LoggingHttpClient implements HttpClient {
  constructor(private readonly inner: HttpClient, private readonly logger: Logger) {}

  async request(config: RequestConfig): Promise<Response> {
    this.logger.info('HTTP request', { url: config.url, method: config.method });
    const start = Date.now();
    const response = await this.inner.request(config);
    this.logger.info('HTTP response', { url: config.url, duration: Date.now() - start, status: response.status });
    return response;
  }
}

// Compose behaviors freely
const client: HttpClient = new LoggingHttpClient(
  new RetryingHttpClient(new BaseHttpClient()),
  logger,
);
```

**Non-compliant:**

```typescript
// Subclass explosion — each combination needs its own class
class LoggingHttpClient extends BaseHttpClient { /* ... */ }
class RetryingHttpClient extends BaseHttpClient { /* ... */ }
class CachingHttpClient extends BaseHttpClient { /* ... */ }
class LoggingRetryingHttpClient extends RetryingHttpClient { /* ... */ }
class LoggingCachingHttpClient extends CachingHttpClient { /* ... */ }
class RetryingCachingHttpClient extends CachingHttpClient { /* ... */ }
class LoggingRetryingCachingHttpClient extends RetryingCachingHttpClient { /* ... */ }
// Need auth? Multiply all of these again...
```

---

## Behavioral Patterns

### DP-07: Strategy

**Severity:** Warning
**Rule:** When a class needs interchangeable algorithms or behaviors that vary by type, extract each variant behind a common interface — eliminate switch statements that branch on a type string to select behavior.
**Why:** Adding a new strategy is an additive change (new class, register it) rather than a modification to an existing switch statement. It follows the Open-Closed Principle.

**Compliant:**

```typescript
interface PricingStrategy {
  calculateDiscount(order: Order): number;
}

class RegularPricing implements PricingStrategy {
  calculateDiscount(_order: Order): number {
    return 0;
  }
}

class MemberPricing implements PricingStrategy {
  calculateDiscount(order: Order): number {
    return order.subtotal * 0.1;
  }
}

class VipPricing implements PricingStrategy {
  calculateDiscount(order: Order): number {
    const baseDiscount = order.subtotal * 0.2;
    const volumeBonus = order.items.length > 5 ? order.subtotal * 0.05 : 0;
    return baseDiscount + volumeBonus;
  }
}

const strategies: Record<string, PricingStrategy> = {
  regular: new RegularPricing(),
  member: new MemberPricing(),
  vip: new VipPricing(),
};

class CheckoutService {
  calculateTotal(order: Order, customerTier: string): number {
    const strategy = strategies[customerTier];
    if (!strategy) throw new Error(`Unknown customer tier: ${customerTier}`);
    const discount = strategy.calculateDiscount(order);
    return order.subtotal - discount;
  }
}
```

**Non-compliant:**

```typescript
class CheckoutService {
  calculateTotal(order: Order, customerTier: string): number {
    let discount = 0;

    switch (customerTier) {
      case 'regular':
        discount = 0;
        break;
      case 'member':
        discount = order.subtotal * 0.1;
        break;
      case 'vip':
        discount = order.subtotal * 0.2;
        if (order.items.length > 5) discount += order.subtotal * 0.05;
        break;
      default:
        throw new Error(`Unknown tier: ${customerTier}`);
    }

    return order.subtotal - discount;
  }
  // Every method that varies by tier has a similar switch — add "enterprise" tier
  // and you're updating 6 methods across the class
}
```

---

### DP-08: Observer / Event Emitter

**Severity:** Convention
**Rule:** When one action triggers multiple independent side effects, decouple producers from consumers using events — never have the producer directly call each consumer.
**Why:** Direct calls create tight coupling: the producer must know about every consumer and changes to one consumer risk breaking the producer. Events let consumers register and evolve independently.

**Compliant:**

```typescript
interface DomainEvent {
  readonly type: string;
  readonly timestamp: Date;
}

interface OrderPlacedEvent extends DomainEvent {
  readonly type: 'order.placed';
  readonly orderId: string;
  readonly customerId: string;
  readonly total: number;
}

type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>;

class EventBus {
  private handlers = new Map<string, EventHandler<any>[]>();

  on<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  async emit<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.type) ?? [];
    await Promise.allSettled(handlers.map(h => h(event)));
  }
}

// Consumers register independently — producer doesn't know they exist
eventBus.on<OrderPlacedEvent>('order.placed', async (event) => {
  await emailService.sendConfirmation(event.customerId, event.orderId);
});

eventBus.on<OrderPlacedEvent>('order.placed', async (event) => {
  await analyticsService.trackPurchase(event.orderId, event.total);
});

eventBus.on<OrderPlacedEvent>('order.placed', async (event) => {
  await loyaltyService.awardPoints(event.customerId, event.total);
});

// Producer emits without knowing who listens
class OrderService {
  constructor(private readonly eventBus: EventBus) {}

  async placeOrder(order: Order): Promise<void> {
    await this.orderRepo.save(order);
    await this.eventBus.emit<OrderPlacedEvent>({
      type: 'order.placed',
      timestamp: new Date(),
      orderId: order.id,
      customerId: order.customerId,
      total: order.total,
    });
  }
}
```

**Non-compliant:**

```typescript
class OrderService {
  constructor(
    private readonly emailService: EmailService,
    private readonly analyticsService: AnalyticsService,
    private readonly loyaltyService: LoyaltyService,
    // Add referral tracking? Inject another dependency and modify this class
  ) {}

  async placeOrder(order: Order): Promise<void> {
    await this.orderRepo.save(order);
    // Producer is tightly coupled to every consumer
    await this.emailService.sendConfirmation(order.customerId, order.id);
    await this.analyticsService.trackPurchase(order.id, order.total);
    await this.loyaltyService.awardPoints(order.customerId, order.total);
  }
}
```

---

### DP-09: Command

**Severity:** Convention
**Rule:** When operations need to be queued, undone, logged, or replayed, encapsulate each operation as a Command object with `execute()` and optionally `undo()` — never perform the operation inline and lose the ability to defer or reverse it.
**Why:** Commands turn operations into first-class objects that can be serialized, queued, batched, audited, and reversed. Inline operations are fire-and-forget with no history.

**Compliant:**

```typescript
interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
  describe(): string;
}

class TransferFundsCommand implements Command {
  constructor(
    private readonly accountService: AccountService,
    private readonly fromAccountId: string,
    private readonly toAccountId: string,
    private readonly amount: number,
  ) {}

  async execute(): Promise<void> {
    await this.accountService.debit(this.fromAccountId, this.amount);
    await this.accountService.credit(this.toAccountId, this.amount);
  }

  async undo(): Promise<void> {
    await this.accountService.debit(this.toAccountId, this.amount);
    await this.accountService.credit(this.fromAccountId, this.amount);
  }

  describe(): string {
    return `Transfer ${this.amount} from ${this.fromAccountId} to ${this.toAccountId}`;
  }
}

class CommandExecutor {
  private history: Command[] = [];

  async execute(command: Command): Promise<void> {
    await command.execute();
    this.history.push(command);
    logger.info('Command executed', { description: command.describe() });
  }

  async undoLast(): Promise<void> {
    const command = this.history.pop();
    if (!command) throw new Error('No commands to undo');
    await command.undo();
    logger.info('Command undone', { description: command.describe() });
  }
}
```

**Non-compliant:**

```typescript
async function transferFunds(fromId: string, toId: string, amount: number): Promise<void> {
  await accountService.debit(fromId, amount);
  await accountService.credit(toId, amount);
  // No way to undo, no audit trail, no queueing — just a direct call
  // If you need to add "undo last transfer," you're rewriting the architecture
}
```

---

### DP-10: State

**Severity:** Warning
**Rule:** When an object's behavior changes based on its internal state and there are 3+ states with meaningfully different behaviors, use the State pattern — replace long switch/if chains on a status field with state objects that encapsulate state-specific behavior.
**Why:** State-specific logic is isolated in its own class, making each state independently testable. Adding a new state doesn't require modifying a growing switch statement — you add a new class.

**Compliant:**

```typescript
interface OrderState {
  cancel(order: Order): Promise<void>;
  ship(order: Order): Promise<void>;
  refund(order: Order): Promise<void>;
}

class PendingState implements OrderState {
  async cancel(order: Order): Promise<void> {
    await order.releaseInventory();
    order.transitionTo(new CancelledState());
  }

  async ship(_order: Order): Promise<void> {
    throw new Error('Cannot ship an order that has not been paid');
  }

  async refund(_order: Order): Promise<void> {
    throw new Error('Cannot refund an unpaid order');
  }
}

class PaidState implements OrderState {
  async cancel(order: Order): Promise<void> {
    await order.processRefund();
    await order.releaseInventory();
    order.transitionTo(new CancelledState());
  }

  async ship(order: Order): Promise<void> {
    await order.createShipment();
    order.transitionTo(new ShippedState());
  }

  async refund(order: Order): Promise<void> {
    await order.processRefund();
    order.transitionTo(new RefundedState());
  }
}

class ShippedState implements OrderState {
  async cancel(_order: Order): Promise<void> {
    throw new Error('Cannot cancel a shipped order — initiate a return instead');
  }

  async ship(_order: Order): Promise<void> {
    throw new Error('Order is already shipped');
  }

  async refund(order: Order): Promise<void> {
    await order.initiateReturn();
    order.transitionTo(new RefundedState());
  }
}

class Order {
  private state: OrderState = new PendingState();

  transitionTo(state: OrderState): void {
    this.state = state;
  }

  async cancel(): Promise<void> { await this.state.cancel(this); }
  async ship(): Promise<void> { await this.state.ship(this); }
  async refund(): Promise<void> { await this.state.refund(this); }
}
```

**Non-compliant:**

```typescript
class Order {
  status: 'pending' | 'paid' | 'shipped' | 'cancelled' | 'refunded' = 'pending';

  async cancel(): Promise<void> {
    switch (this.status) {
      case 'pending':
        await this.releaseInventory();
        this.status = 'cancelled';
        break;
      case 'paid':
        await this.processRefund();
        await this.releaseInventory();
        this.status = 'cancelled';
        break;
      case 'shipped':
        throw new Error('Cannot cancel a shipped order');
      case 'cancelled':
        throw new Error('Already cancelled');
      case 'refunded':
        throw new Error('Already refunded');
    }
  }

  async ship(): Promise<void> {
    switch (this.status) {
      // Another full switch with the same 5 cases...
    }
  }

  async refund(): Promise<void> {
    switch (this.status) {
      // Yet another full switch — every new status multiplies across all methods
    }
  }
}
```

---

### DP-11: Template Method

**Severity:** Convention
**Rule:** When subclasses share a common process structure (same sequence of steps) but vary in how specific steps are performed, define the skeleton in a base class and let subclasses override only the variable steps — never copy-paste the full process across implementations with slight variations.
**Why:** The invariant process logic lives in one place. Adding a step to the process means updating the base class, not hunting for every copy.

**Compliant:**

```typescript
abstract class DataImporter<T> {
  async import(source: string): Promise<ImportResult> {
    const raw = await this.fetch(source);
    const parsed = this.parse(raw);
    const validated = this.validate(parsed);
    const transformed = validated.map(item => this.transform(item));
    const count = await this.save(transformed);
    return { source, importedCount: count, skippedCount: parsed.length - count };
  }

  protected abstract fetch(source: string): Promise<string>;
  protected abstract parse(raw: string): T[];
  protected abstract transform(item: T): Record<string, unknown>;

  protected validate(items: T[]): T[] {
    return items.filter(item => this.isValid(item));
  }

  protected isValid(_item: T): boolean {
    return true;
  }

  protected async save(records: Record<string, unknown>[]): Promise<number> {
    await this.repository.bulkInsert(records);
    return records.length;
  }
}

class CsvProductImporter extends DataImporter<CsvRow> {
  protected async fetch(source: string): Promise<string> {
    return fs.readFile(source, 'utf-8');
  }

  protected parse(raw: string): CsvRow[] {
    return parseCsv(raw);
  }

  protected transform(row: CsvRow): Record<string, unknown> {
    return { name: row.product_name, price: parseFloat(row.price), sku: row.sku };
  }

  protected isValid(row: CsvRow): boolean {
    return !!row.sku && !!row.product_name && !isNaN(parseFloat(row.price));
  }
}

class ApiProductImporter extends DataImporter<ApiProduct> {
  protected async fetch(source: string): Promise<string> {
    const response = await fetch(source);
    return response.text();
  }

  protected parse(raw: string): ApiProduct[] {
    return JSON.parse(raw).products;
  }

  protected transform(product: ApiProduct): Record<string, unknown> {
    return { name: product.title, price: product.cost.amount, sku: product.externalId };
  }
}
```

**Non-compliant:**

```typescript
class CsvProductImporter {
  async import(source: string): Promise<ImportResult> {
    const raw = await fs.readFile(source, 'utf-8');
    const rows = parseCsv(raw);
    const valid = rows.filter(r => !!r.sku && !!r.product_name);
    const records = valid.map(r => ({ name: r.product_name, price: parseFloat(r.price), sku: r.sku }));
    await this.repository.bulkInsert(records);
    return { source, importedCount: records.length, skippedCount: rows.length - records.length };
  }
}

class ApiProductImporter {
  async import(source: string): Promise<ImportResult> {
    // 90% identical to CsvProductImporter.import — same fetch/parse/validate/transform/save flow
    const raw = await (await fetch(source)).text();
    const products = JSON.parse(raw).products;
    const valid = products.filter((p: any) => !!p.externalId && !!p.title);
    const records = valid.map((p: any) => ({ name: p.title, price: p.cost.amount, sku: p.externalId }));
    await this.repository.bulkInsert(records);
    return { source, importedCount: records.length, skippedCount: products.length - records.length };
  }
}
// Adding audit logging to the import flow? Update both classes (and any future importers).
```

---

## Anti-Patterns to Flag

### DP-12: God Class

**Severity:** Error
**Rule:** Flag any class that exceeds 500 lines or has 10+ public methods spanning unrelated responsibilities.
**Why:** God classes violate the Single Responsibility Principle. They are hard to test (huge setup), hard to understand (no clear purpose), and hard to change (every modification risks breaking unrelated behavior). Break them into focused collaborators.

**Smell:**

```typescript
class ApplicationManager {
  // User management
  async createUser() { /* ... */ }
  async deleteUser() { /* ... */ }
  async updateUserPreferences() { /* ... */ }
  // Order processing
  async createOrder() { /* ... */ }
  async cancelOrder() { /* ... */ }
  async refundOrder() { /* ... */ }
  // Inventory
  async checkStock() { /* ... */ }
  async reorderSupply() { /* ... */ }
  // Reporting
  async generateSalesReport() { /* ... */ }
  async generateInventoryReport() { /* ... */ }
  // Email
  async sendWelcomeEmail() { /* ... */ }
  async sendOrderConfirmation() { /* ... */ }
  // ... 800 more lines
}
```

---

### DP-13: Service Locator

**Severity:** Warning
**Rule:** Flag code that resolves dependencies at runtime from a global registry instead of declaring them explicitly through constructor injection.
**Why:** Service Locator hides a class's real dependencies. You can't tell what a class needs by reading its constructor — you have to scan the entire method body for `ServiceLocator.get()` calls. This makes refactoring dangerous and testing painful because you must configure a global registry instead of passing mocks directly.

**Smell:**

```typescript
class OrderService {
  async placeOrder(order: Order): Promise<void> {
    // Dependencies are hidden — not visible in the constructor
    const db = ServiceLocator.get<Database>('database');
    const mailer = ServiceLocator.get<Mailer>('mailer');
    const logger = ServiceLocator.get<Logger>('logger');

    await db.save(order);
    await mailer.send(order.customerEmail, 'Order placed');
    logger.info('Order placed', { orderId: order.id });
  }
}
```

**Fix:** Declare dependencies in the constructor so they're explicit, visible, and injectable.

---

### DP-14: Premature Abstraction

**Severity:** Warning
**Rule:** Flag interfaces or abstract classes that have exactly one implementation and no concrete plan for a second — creating abstractions "just in case" violates YAGNI.
**Why:** Premature abstraction adds indirection without value. It doubles the number of files to maintain, makes navigation harder, and often gets the abstraction boundary wrong because you don't yet have enough use cases to know what should vary. Wait for the second use case, then extract the common interface.

**Smell:**

```typescript
// IUserRepository, IUserService, IUserValidator — all with exactly one implementation
interface IUserRepository {
  findById(id: string): Promise<User>;
  save(user: User): Promise<void>;
}

class UserRepository implements IUserRepository {
  // The only implementation — and likely the only one ever needed
}

// Now every consumer references IUserRepository, adding a layer of indirection
// for no testability benefit (you could mock the concrete class just as easily)
```

---

### DP-15: Pattern Overuse

**Severity:** Warning
**Rule:** Flag uses of formal patterns where a simpler approach would suffice — applying a Strategy pattern for two fixed options, creating a Builder for a class with two required parameters, or introducing an Observer for a single subscriber.
**Why:** Patterns have a complexity cost. A Strategy with two options that will never change is better served by an if/else. A Builder for `new Point(x, y)` is ceremony for ceremony's sake. The goal is to reduce complexity, not demonstrate knowledge of design patterns.

**Smell:**

```typescript
// Strategy pattern for a boolean choice — over-engineered
interface SortDirection { sort(items: number[]): number[]; }
class AscendingSort implements SortDirection {
  sort(items: number[]): number[] { return [...items].sort((a, b) => a - b); }
}
class DescendingSort implements SortDirection {
  sort(items: number[]): number[] { return [...items].sort((a, b) => b - a); }
}

// When a simple function would do:
function sort(items: number[], ascending: boolean): number[] {
  return [...items].sort((a, b) => ascending ? a - b : b - a);
}
```

---

## Customization

- **Pattern choice is context-dependent.** Small projects and scripts may not need formal patterns for simple cases. A 300-line Express API with two endpoints doesn't need a Strategy pattern for its two routes. The severity levels indicate when the Standards Compliance Assessment should flag a missing pattern (Warning/Error) vs. when it's merely a suggestion (Convention).

- **DP-15 (Pattern Overuse) threshold** should be calibrated based on project complexity. In microservices with narrow scope, simpler constructs are often preferable. In large monoliths or libraries with many consumers, formal patterns pay for themselves quickly. Teams should define their threshold in terms of: number of variants (Strategy makes sense at 3+), number of parameters (Builder makes sense at 4+), and number of consumers (Observer makes sense at 2+ independent listeners).

- **DP-03 (Singleton)** severity depends on the team's DI setup. In projects with a mature DI container (e.g., NestJS, tsyringe, inversify), any use of the Singleton pattern outside the container should be flagged as Warning. In projects without DI, module-scoped instances (`const logger = createLogger()` at module top level) are an acceptable alternative.

- **DP-08 (Observer)** should not be applied to simple workflows where the producer legitimately needs to know whether all side effects succeeded before proceeding. Event-based decoupling trades transactional guarantees for flexibility — this is appropriate for fire-and-forget side effects (analytics, notifications) but not for steps that must succeed atomically (payment + inventory reservation).

- **DP-14 (Premature Abstraction)** has a notable exception: when an interface is required for testing (e.g., mocking a database client), a single-implementation interface is justified. The rule targets interfaces created for speculative extensibility, not for dependency inversion in tests.
