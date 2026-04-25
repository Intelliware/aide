# Integration Testing Standards

## Purpose

Integration tests verify that two or more real components work correctly together — databases, APIs, message queues, and other infrastructure. Unlike unit tests, which isolate logic, integration tests catch the failures that emerge at component boundaries: schema mismatches, query errors, serialization bugs, and network behavior. These standards ensure integration tests are reliable, maintainable, and provide genuine confidence in cross-component behavior.

## Applicability

All TypeScript/JavaScript projects that interact with external systems (databases, HTTP APIs, message brokers, caches). These rules apply to any test classified as an integration test — regardless of the specific test runner — across all services in the organization.

## Rules

### IT-01: Define Clear Integration Boundaries

**Severity:** Error

**Rule:** Each integration test must verify the interaction between two or more real components (e.g., service + database, service + external API) — never use integration tests to test logic that can be verified with a unit test against mocked dependencies.

**Why:** Mislabeled integration tests that only test internal logic are slow unit tests — they pay the performance cost of integration without testing any actual integration.

**Compliant:**

```typescript
describe('UserRepository (integration)', () => {
  let db: Database;
  let repository: UserRepository;

  beforeAll(async () => {
    db = await connectToTestDatabase();
    repository = new UserRepository(db);
  });

  afterAll(async () => {
    await db.close();
  });

  it('persists a user and retrieves it by email', async () => {
    const user = { name: 'Alice', email: 'alice@example.com' };

    await repository.save(user);
    const found = await repository.findByEmail('alice@example.com');

    expect(found).toMatchObject({ name: 'Alice', email: 'alice@example.com' });
    expect(found?.id).toBeDefined();
  });

  it('enforces unique email constraint at the database level', async () => {
    await repository.save({ name: 'Bob', email: 'bob@example.com' });

    await expect(
      repository.save({ name: 'Robert', email: 'bob@example.com' }),
    ).rejects.toThrow(/unique constraint/i);
  });
});
```

**Non-compliant:**

```typescript
describe('UserRepository (integration)', () => {
  it('validates email format', () => {
    const repository = new UserRepository(mockDatabase); // mocked DB — this is a unit test

    expect(() => repository.save({ name: 'Alice', email: 'not-an-email' }))
      .toThrow('Invalid email');
  });
});
```

---

### IT-02: Isolate Test Data per Test

**Severity:** Error

**Rule:** Each test must create its own data and clean up after itself — use transactions with rollback, truncate tables in `beforeEach`, or use unique identifiers — never share mutable data between tests.

**Why:** Shared test data causes order-dependent failures, makes tests impossible to run in parallel, and turns CI into a source of phantom flakiness.

**Compliant:**

```typescript
describe('OrderRepository (integration)', () => {
  let db: Database;

  beforeEach(async () => {
    await db.query('BEGIN');
  });

  afterEach(async () => {
    await db.query('ROLLBACK');
  });

  it('saves an order and returns it with a generated ID', async () => {
    const customerId = await insertTestCustomer(db, { name: 'Alice' });
    const order = { customerId, total: 99.99, status: 'pending' };

    const saved = await orderRepository.save(order);

    expect(saved.id).toBeDefined();
    expect(saved.status).toBe('pending');
  });

  it('lists orders for a specific customer', async () => {
    const customerId = await insertTestCustomer(db, { name: 'Bob' });
    await orderRepository.save({ customerId, total: 10, status: 'pending' });
    await orderRepository.save({ customerId, total: 20, status: 'shipped' });

    const orders = await orderRepository.findByCustomer(customerId);

    expect(orders).toHaveLength(2);
  });
});
```

**Non-compliant:**

```typescript
describe('OrderRepository (integration)', () => {
  // Seeded once — every test reads and mutates this shared data
  beforeAll(async () => {
    await db.query("INSERT INTO customers (id, name) VALUES (1, 'Alice')");
    await db.query("INSERT INTO orders (id, customer_id, total) VALUES (1, 1, 99.99)");
  });

  it('finds Alice\'s order', async () => {
    const orders = await orderRepository.findByCustomer(1);
    expect(orders).toHaveLength(1); // breaks if another test inserts an order for customer 1
  });

  it('deletes an order', async () => {
    await orderRepository.delete(1);
    const orders = await orderRepository.findByCustomer(1);
    expect(orders).toHaveLength(0); // breaks the test above if run first
  });
});
```

---

### IT-03: Use Containers for External Dependencies

**Severity:** Warning

**Rule:** Use Testcontainers, docker-compose, or equivalent tooling to spin up real instances of databases, caches, and message brokers — never depend on shared, long-lived infrastructure that may be in an inconsistent state.

**Why:** Shared test infrastructure causes cross-team interference, environment drift, and "works on my machine" failures that waste hours of debugging time.

**Compliant:**

```typescript
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

describe('PaymentRepository (integration)', () => {
  let container: StartedPostgreSqlContainer;
  let db: Database;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16')
      .withDatabase('payments_test')
      .start();

    db = await connectToDatabase({
      host: container.getHost(),
      port: container.getMappedPort(5432),
      database: container.getDatabase(),
      user: container.getUsername(),
      password: container.getPassword(),
    });

    await runMigrations(db);
  }, 60_000);

  afterAll(async () => {
    await db.close();
    await container.stop();
  });

  it('records a payment and marks it as completed', async () => {
    const repo = new PaymentRepository(db);

    const payment = await repo.create({ amount: 100, currency: 'USD' });
    await repo.markCompleted(payment.id);

    const updated = await repo.findById(payment.id);
    expect(updated?.status).toBe('completed');
  });
});
```

**Non-compliant:**

```typescript
describe('PaymentRepository (integration)', () => {
  let db: Database;

  beforeAll(async () => {
    // Connects to a shared dev database — other developers and CI jobs use the same instance
    db = await connectToDatabase({
      host: 'dev-db.internal.company.com',
      port: 5432,
      database: 'payments',
      user: 'dev_user',
      password: 'dev_password',
    });
  });

  it('records a payment', async () => {
    const repo = new PaymentRepository(db);
    const payment = await repo.create({ amount: 100, currency: 'USD' });
    expect(payment.id).toBeDefined(); // may fail if someone else's data conflicts
  });
});
```

---

### IT-04: Test Real Database Operations

**Severity:** Error

**Rule:** Integration tests that target database behavior must use a real database with real queries, real migrations, and real constraints — never mock the database layer in integration tests.

**Why:** Mocking the database in an integration test eliminates the very thing you are trying to test — query correctness, constraint enforcement, migration compatibility, and driver behavior.

**Compliant:**

```typescript
describe('ProductRepository (integration)', () => {
  it('applies full-text search against the real database index', async () => {
    await productRepository.save({ name: 'Wireless Keyboard', category: 'electronics' });
    await productRepository.save({ name: 'Wooden Desk', category: 'furniture' });
    await productRepository.save({ name: 'Wireless Mouse', category: 'electronics' });

    const results = await productRepository.search('wireless');

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.name)).toEqual(
      expect.arrayContaining(['Wireless Keyboard', 'Wireless Mouse']),
    );
  });

  it('cascades delete from category to products', async () => {
    const categoryId = await categoryRepository.create({ name: 'clearance' });
    await productRepository.save({ name: 'Old Item', categoryId });

    await categoryRepository.delete(categoryId);

    const orphaned = await productRepository.findByCategoryId(categoryId);
    expect(orphaned).toHaveLength(0);
  });
});
```

**Non-compliant:**

```typescript
describe('ProductRepository (integration)', () => {
  it('applies full-text search', async () => {
    const mockDb = {
      query: jest.fn().mockResolvedValue([
        { name: 'Wireless Keyboard' },
        { name: 'Wireless Mouse' },
      ]),
    };
    const repo = new ProductRepository(mockDb); // mocked — not an integration test

    const results = await repo.search('wireless');

    expect(results).toHaveLength(2);
    // This passes even if the real SQL query is completely wrong
  });
});
```

---

### IT-05: Handle External Service Dependencies

**Severity:** Warning

**Rule:** For APIs you do not control, use contract tests or HTTP mocking tools (WireMock, MSW) instead of calling real external services in CI — for APIs you do control, test against a real running instance.

**Why:** Calling third-party APIs in CI makes builds dependent on external availability, burns API rate limits, and can produce charges or side effects in production systems.

**Compliant:**

```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const stripeServer = setupServer(
  http.post('https://api.stripe.com/v1/charges', () => {
    return HttpResponse.json({
      id: 'ch_test_123',
      amount: 5000,
      currency: 'usd',
      status: 'succeeded',
    });
  }),
  http.post('https://api.stripe.com/v1/refunds', () => {
    return HttpResponse.json({
      id: 're_test_456',
      status: 'succeeded',
    });
  }),
);

describe('PaymentGateway → Stripe (integration)', () => {
  beforeAll(() => stripeServer.listen());
  afterEach(() => stripeServer.resetHandlers());
  afterAll(() => stripeServer.close());

  it('creates a charge and returns a transaction record', async () => {
    const gateway = new PaymentGateway({ provider: 'stripe' });

    const result = await gateway.charge({ amount: 5000, currency: 'usd' });

    expect(result.transactionId).toBe('ch_test_123');
    expect(result.status).toBe('succeeded');
  });

  it('handles a declined charge gracefully', async () => {
    stripeServer.use(
      http.post('https://api.stripe.com/v1/charges', () => {
        return HttpResponse.json(
          { error: { code: 'card_declined', message: 'Card was declined' } },
          { status: 402 },
        );
      }),
    );

    const gateway = new PaymentGateway({ provider: 'stripe' });

    await expect(gateway.charge({ amount: 5000, currency: 'usd' }))
      .rejects.toThrow('Card was declined');
  });
});
```

**Non-compliant:**

```typescript
describe('PaymentGateway → Stripe (integration)', () => {
  it('creates a charge', async () => {
    // Calls real Stripe API — requires a valid key, costs money, fails if Stripe is down
    const gateway = new PaymentGateway({
      provider: 'stripe',
      apiKey: process.env.STRIPE_SECRET_KEY,
    });

    const result = await gateway.charge({ amount: 5000, currency: 'usd' });
    expect(result.status).toBe('succeeded');
  });
});
```

---

### IT-06: Set Reasonable Timeouts

**Severity:** Warning

**Rule:** Set explicit timeouts on integration tests that account for container startup, network latency, and database operations — flag any individual test that consistently exceeds 30 seconds for optimization.

**Why:** Missing timeouts cause CI pipelines to hang indefinitely on a stalled connection; overly tight timeouts cause false failures on slower CI runners.

**Compliant:**

```typescript
describe('NotificationService (integration)', () => {
  // Container startup can be slow — generous timeout for setup
  beforeAll(async () => {
    await startDependencies();
  }, 60_000);

  it('delivers a notification via the message queue', async () => {
    const service = new NotificationService(queueConnection);

    await service.send({ userId: 'user-1', message: 'Hello' });

    const delivered = await waitForMessage('user-1', { timeoutMs: 5_000 });
    expect(delivered.message).toBe('Hello');
  }, 10_000);

  it('retries delivery on transient queue failure', async () => {
    simulateQueueFailure({ times: 2 });

    await notificationService.send({ userId: 'user-2', message: 'Retry me' });

    const delivered = await waitForMessage('user-2', { timeoutMs: 10_000 });
    expect(delivered.attempts).toBe(3);
  }, 15_000);
});
```

**Non-compliant:**

```typescript
describe('NotificationService (integration)', () => {
  // No timeout — if the queue hangs, CI hangs forever
  it('delivers a notification via the message queue', async () => {
    await service.send({ userId: 'user-1', message: 'Hello' });

    // Polls indefinitely with no timeout
    while (true) {
      const msg = await queue.peek('user-1');
      if (msg) {
        expect(msg.message).toBe('Hello');
        break;
      }
    }
  });
});
```

---

### IT-07: Verify Error Scenarios

**Severity:** Warning

**Rule:** Integration tests must cover failure modes — database connection loss, API error responses, queue unavailability, constraint violations, and timeout behavior — not just happy paths.

**Why:** Systems fail at integration points more often than in isolated logic; untested failure modes become production incidents.

**Compliant:**

```typescript
describe('OrderService → Database (integration)', () => {
  it('throws a clear error when the database connection is lost', async () => {
    await db.close(); // simulate connection loss

    await expect(orderService.createOrder({ customerId: 'c-1', total: 50 }))
      .rejects.toThrow('Database connection unavailable');
  });

  it('rejects an order that violates the foreign key constraint', async () => {
    await expect(
      orderService.createOrder({ customerId: 'nonexistent-customer', total: 50 }),
    ).rejects.toThrow(/foreign key constraint/i);
  });

  it('handles a deadlock by retrying the transaction', async () => {
    const [result1, result2] = await Promise.allSettled([
      orderService.updateStock('product-1', -1),
      orderService.updateStock('product-1', -1),
    ]);

    const results = [result1, result2];
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(2);
  });
});
```

**Non-compliant:**

```typescript
describe('OrderService → Database (integration)', () => {
  it('creates an order', async () => {
    const order = await orderService.createOrder({ customerId: 'c-1', total: 50 });
    expect(order.id).toBeDefined();
  });

  // No tests for connection failure, constraint violations, deadlocks, or timeouts
});
```

---

### IT-08: Separate Integration Tests from Unit Tests

**Severity:** Error

**Rule:** Integration tests must be clearly separated from unit tests — use a distinct file suffix (`.integration.spec.ts`), a dedicated directory (`test/integration/`), or Jest projects — so that each category can be run independently in CI.

**Why:** Mixing integration and unit tests forces developers to run slow integration tests during local development and prevents CI from parallelizing fast and slow test suites.

**Compliant:**

```
project/
├── src/
│   ├── orders/
│   │   ├── order.service.ts
│   │   ├── order.service.spec.ts              ← unit tests
│   │   └── order.service.integration.spec.ts  ← integration tests
│   └── payments/
│       ├── payment.gateway.ts
│       ├── payment.gateway.spec.ts
│       └── payment.gateway.integration.spec.ts
├── jest.config.ts                              ← default: unit tests only
└── jest.integration.config.ts                  ← integration-specific config
```

```typescript
// jest.config.ts — runs only unit tests by default
export default {
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['.integration.spec.ts'],
};

// jest.integration.config.ts — runs only integration tests
export default {
  testMatch: ['**/*.integration.spec.ts'],
  testTimeout: 30_000,
};
```

```jsonc
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:integration": "jest --config jest.integration.config.ts",
    "test:all": "jest && jest --config jest.integration.config.ts"
  }
}
```

**Non-compliant:**

```
project/
├── src/
│   ├── orders/
│   │   ├── order.service.ts
│   │   └── order.service.spec.ts   ← contains both unit and integration tests
│   └── payments/
│       ├── payment.gateway.ts
│       └── payment.gateway.spec.ts ← mixes mocked and real DB tests
└── jest.config.ts                  ← no way to run them separately
```

```typescript
// order.service.spec.ts — unit and integration tests mixed together
describe('OrderService', () => {
  it('validates order total (unit)', () => { /* ... */ });
  it('saves to database (integration)', async () => { /* uses real DB */ });
  it('calculates discount (unit)', () => { /* ... */ });
  it('sends to payment API (integration)', async () => { /* uses real API */ });
});
```

## Customization

- **IT-03 container approach** — Testcontainers is the recommended default for programmatic container management. Teams using CI-provided services (e.g., GitHub Actions service containers) or a shared `docker-compose.yml` may adapt this rule to their pipeline, provided tests still get isolated, ephemeral instances.
- **IT-06 timeout thresholds** — The 30-second flag threshold is a guideline. Teams with complex multi-service integration tests may raise it; teams testing lightweight HTTP interactions may lower it. Set `testTimeout` in the integration Jest config to match your environment.
- **IT-08 separation strategy** — The `.integration.spec.ts` suffix is the recommended convention. Teams may alternatively use a `test/integration/` directory or Jest's `projects` feature to separate test suites. The key requirement is that `npm test` runs only unit tests by default and integration tests require an explicit command.
