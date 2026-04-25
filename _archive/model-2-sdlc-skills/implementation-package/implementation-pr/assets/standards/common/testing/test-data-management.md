# Test Data Management Standards

## Purpose

These standards define how test data is created, structured, and cleaned up across the test suite. Well-managed test data makes tests self-documenting — a reader can immediately see which values matter and why — while poorly managed test data leads to hidden dependencies between tests, flaky failures caused by shared mutable state, and privacy risks from accidentally embedding real customer information. Following these rules ensures that every test is isolated, deterministic, and expressive about its intent.

## Applicability

All TypeScript/JavaScript projects using Jest as the test framework. These rules apply to unit tests, integration tests, and any automated tests that create domain objects, database records, or API payloads. They do not prescribe a specific ORM or database — the patterns are data-layer agnostic.

## Rules

### TD-01: Use Factory Functions for Test Data

**Severity:** Error

**Rule:** Create reusable factory functions (e.g., `buildOrder(overrides)`) that return domain objects with sensible defaults, accepting an optional overrides parameter for test-specific values.

**Why:** Factory functions eliminate copy-pasted object literals across tests, provide a single place to update when the schema changes, and make each test's intent explicit by highlighting only the fields it cares about.

**Compliant:**

```typescript
interface Order {
  id: string;
  customerId: string;
  status: 'pending' | 'shipped' | 'delivered';
  items: OrderItem[];
  total: number;
  createdAt: Date;
}

function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    customerId: 'customer-1',
    status: 'pending',
    items: [{ sku: 'item-1', quantity: 1, price: 10 }],
    total: 10,
    createdAt: new Date('2025-01-15T10:00:00Z'),
    ...overrides,
  };
}

it('should mark a pending order as shipped', () => {
  const order = buildOrder({ status: 'pending' });
  const result = shipOrder(order);
  expect(result.status).toBe('shipped');
});
```

**Non-compliant:**

```typescript
it('should mark a pending order as shipped', () => {
  // Full object literal duplicated in every test — noisy and error-prone
  const order: Order = {
    id: 'order-1',
    customerId: 'customer-1',
    status: 'pending',
    items: [{ sku: 'item-1', quantity: 1, price: 10 }],
    total: 10,
    createdAt: new Date('2025-01-15T10:00:00Z'),
  };
  const result = shipOrder(order);
  expect(result.status).toBe('shipped');
});
```

---

### TD-02: Override Only What the Test Cares About

**Severity:** Warning

**Rule:** Let factory defaults handle irrelevant fields — the test should only specify values that are directly relevant to the behavior being verified.

**Why:** When a test specifies every field, a reader cannot tell which values actually affect the outcome, making the test harder to understand and more fragile to schema changes.

**Compliant:**

```typescript
it('should apply free shipping for orders over $100', () => {
  const order = buildOrder({ total: 150 });
  const result = calculateShipping(order);
  expect(result.shippingCost).toBe(0);
});

it('should charge standard shipping for orders under $100', () => {
  const order = buildOrder({ total: 50 });
  const result = calculateShipping(order);
  expect(result.shippingCost).toBe(9.99);
});
```

**Non-compliant:**

```typescript
it('should apply free shipping for orders over $100', () => {
  // Every field is specified — impossible to tell that only `total` matters
  const order = buildOrder({
    id: 'order-99',
    customerId: 'customer-42',
    status: 'pending',
    items: [{ sku: 'widget', quantity: 5, price: 30 }],
    total: 150,
    createdAt: new Date('2025-06-01T12:00:00Z'),
  });
  const result = calculateShipping(order);
  expect(result.shippingCost).toBe(0);
});
```

---

### TD-03: Use Deterministic Data Generation

**Severity:** Error

**Rule:** Never use `Math.random()`, `Date.now()`, `uuid()`, or other non-deterministic sources to generate test data — use fixed values or seeded generators so that every test run produces identical results.

**Why:** Non-deterministic data creates flaky tests that pass on one run and fail on the next, making failures nearly impossible to reproduce and debug.

**Compliant:**

```typescript
function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Alice Test',
    email: 'alice@test.example.com',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  };
}

it('should format the user display name', () => {
  const user = buildUser({ name: 'Bob Test' });
  expect(formatDisplayName(user)).toBe('Bob T.');
});
```

**Non-compliant:**

```typescript
function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: crypto.randomUUID(),               // Different every run
    name: 'Alice Test',
    email: `user-${Date.now()}@test.com`,   // Different every run
    createdAt: new Date(),                  // Different every run
    ...overrides,
  };
}

it('should format the user display name', () => {
  const user = buildUser({ name: 'Bob Test' });
  // If any logic depends on id, email, or createdAt this test is flaky
  expect(formatDisplayName(user)).toBe('Bob T.');
});
```

---

### TD-04: Isolate Test Data Between Tests

**Severity:** Error

**Rule:** Each test must create its own data — never rely on data created by another test or on shared mutable fixtures that multiple tests read from and write to.

**Why:** Shared mutable test data creates implicit ordering dependencies between tests, causing cascading failures when tests are run in parallel or in a different order.

**Compliant:**

```typescript
describe('CartService', () => {
  it('should add an item to an empty cart', () => {
    const cart = buildCart();
    const result = addItem(cart, buildItem({ sku: 'A' }));
    expect(result.items).toHaveLength(1);
  });

  it('should calculate total for multiple items', () => {
    const cart = buildCart({
      items: [buildItem({ price: 10 }), buildItem({ price: 20 })],
    });
    expect(calculateTotal(cart)).toBe(30);
  });
});
```

**Non-compliant:**

```typescript
describe('CartService', () => {
  // Shared mutable state — tests depend on each other
  const cart = buildCart();

  it('should add an item to an empty cart', () => {
    addItem(cart, buildItem({ sku: 'A' }));
    expect(cart.items).toHaveLength(1);
  });

  it('should calculate total for multiple items', () => {
    // This test assumes the previous test already added an item
    addItem(cart, buildItem({ sku: 'B', price: 20 }));
    expect(calculateTotal(cart)).toBe(30); // Depends on test execution order
  });
});
```

---

### TD-05: Prefer Factories over Static Fixtures

**Severity:** Warning

**Rule:** Use factory functions instead of static JSON fixture files to generate test data — factories are type-checked, parameterizable, and co-located with tests.

**Why:** JSON fixture files become stale when the schema evolves, provide no compile-time safety, cannot express relationships between fields, and force the reader to open a separate file to understand the test.

**Compliant:**

```typescript
// Factory function — type-checked, parameterizable, easy to understand inline
function buildApiResponse(overrides: Partial<ApiResponse> = {}): ApiResponse {
  return {
    status: 200,
    data: { id: 'res-1', message: 'OK' },
    timestamp: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

it('should parse a successful API response', () => {
  const response = buildApiResponse({ status: 200 });
  const result = parseResponse(response);
  expect(result.isSuccess).toBe(true);
});
```

**Non-compliant:**

```typescript
// Static fixture file: __fixtures__/api-response.json
// { "status": 200, "data": { "id": "res-1", "message": "OK" }, "timestamp": "2025-01-01" }

import fixture from './__fixtures__/api-response.json';

it('should parse a successful API response', () => {
  // No type safety — if ApiResponse adds a required field, this still compiles
  // Reader must open the fixture file to understand what data is being tested
  const result = parseResponse(fixture as ApiResponse);
  expect(result.isSuccess).toBe(true);
});
```

---

### TD-06: Use the Builder Pattern for Complex Objects

**Severity:** Convention

**Rule:** When a domain entity has many relationships or deeply nested structures, use a fluent builder class that constructs the object step by step — e.g., `OrderBuilder.withItems(3).withStatus('delivered').build()`.

**Why:** Builder patterns make complex object construction readable and self-documenting, avoiding deeply nested factory overrides that obscure the test's intent.

**Compliant:**

```typescript
class OrderBuilder {
  private order: Order = {
    id: 'order-1',
    customerId: 'customer-1',
    status: 'pending',
    items: [],
    total: 0,
    createdAt: new Date('2025-01-15T10:00:00Z'),
  };

  withStatus(status: Order['status']): this {
    this.order.status = status;
    return this;
  }

  withItems(count: number): this {
    this.order.items = Array.from({ length: count }, (_, i) => ({
      sku: `item-${i + 1}`,
      quantity: 1,
      price: 10,
    }));
    this.order.total = this.order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return this;
  }

  withCustomer(customerId: string): this {
    this.order.customerId = customerId;
    return this;
  }

  build(): Order {
    return { ...this.order, items: [...this.order.items] };
  }
}

it('should generate an invoice for a delivered order with items', () => {
  const order = new OrderBuilder()
    .withItems(3)
    .withStatus('delivered')
    .build();

  const invoice = generateInvoice(order);
  expect(invoice.lineItems).toHaveLength(3);
  expect(invoice.status).toBe('finalized');
});
```

**Non-compliant:**

```typescript
it('should generate an invoice for a delivered order with items', () => {
  // Deeply nested overrides are hard to read and error-prone
  const order = buildOrder({
    status: 'delivered',
    items: [
      { sku: 'item-1', quantity: 1, price: 10 },
      { sku: 'item-2', quantity: 1, price: 10 },
      { sku: 'item-3', quantity: 1, price: 10 },
    ],
    total: 30,
    customerId: 'customer-1',
    createdAt: new Date('2025-01-15T10:00:00Z'),
  });

  const invoice = generateInvoice(order);
  expect(invoice.lineItems).toHaveLength(3);
  expect(invoice.status).toBe('finalized');
});
```

---

### TD-07: Clean Up Test Data After Each Test

**Severity:** Error

**Rule:** Use transaction rollback, table truncation, or explicit deletion in `afterEach` to remove all test data created during the test — tests must not leave residual data that affects subsequent tests.

**Why:** Leftover data causes test pollution — later tests may find unexpected rows, hit unique constraint violations, or produce wrong counts, leading to non-deterministic failures.

**Compliant:**

```typescript
describe('UserRepository (integration)', () => {
  let connection: DatabaseConnection;

  beforeEach(async () => {
    connection = await createTestConnection();
    await connection.beginTransaction();
  });

  afterEach(async () => {
    await connection.rollbackTransaction();
    await connection.close();
  });

  it('should persist a new user', async () => {
    const repo = new UserRepository(connection);
    await repo.save(buildUser({ id: 'u-1', name: 'Alice' }));

    const found = await repo.findById('u-1');
    expect(found?.name).toBe('Alice');
    // Transaction is rolled back in afterEach — no data leaks
  });
});
```

**Non-compliant:**

```typescript
describe('UserRepository (integration)', () => {
  let connection: DatabaseConnection;

  beforeAll(async () => {
    connection = await createTestConnection();
  });

  // No cleanup — data from each test accumulates
  afterAll(async () => {
    await connection.close();
  });

  it('should persist a new user', async () => {
    const repo = new UserRepository(connection);
    await repo.save(buildUser({ id: 'u-1', name: 'Alice' }));
    const found = await repo.findById('u-1');
    expect(found?.name).toBe('Alice');
    // Row stays in the database — next test may collide on id 'u-1'
  });
});
```

---

### TD-08: Never Use Production Data in Tests

**Severity:** Error

**Rule:** All test data must be synthetic — never use real customer names, real email addresses, production database snapshots, or any data derived from production systems.

**Why:** Production data in tests creates privacy and compliance risks (GDPR, HIPAA), makes tests non-deterministic if the data changes, and can expose sensitive information in CI logs and test reports.

**Compliant:**

```typescript
function buildCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'cust-1',
    name: 'Jane Doe',
    email: 'jane.doe@test.example.com',
    phone: '+1-555-000-0001',
    address: '123 Test Street, Testville, TS 00000',
    ...overrides,
  };
}

it('should format a customer mailing label', () => {
  const customer = buildCustomer({ name: 'John Smith', address: '456 Mock Ave' });
  const label = formatMailingLabel(customer);
  expect(label).toContain('John Smith');
  expect(label).toContain('456 Mock Ave');
});
```

**Non-compliant:**

```typescript
it('should format a customer mailing label', () => {
  // Real customer data copied from the production database
  const customer: Customer = {
    id: '8f14e45f-ceea-467f-a83c-01b23a5e8c72',
    name: 'Sarah Connor',                         // Real name
    email: 'sarah.connor@realcompany.com',         // Real email
    phone: '+1-310-555-1234',                      // Real phone
    address: '1234 Real Blvd, Los Angeles, CA',    // Real address
  };
  const label = formatMailingLabel(customer);
  expect(label).toContain('Sarah Connor');
});
```

## Customization

- **TD-05 (Factories over Fixtures):** Some teams prefer JSON fixture files for snapshot-style or contract testing where the exact wire format must be preserved. In those cases, fixtures should be version-controlled alongside the schema they represent and validated by a CI step that checks them against the current type definitions.
- **TD-06 (Builder Pattern):** Builder complexity should match object complexity. For entities with fewer than five fields and no nested structures, a simple `buildEntity(overrides)` factory is sufficient — introducing a builder class would add unnecessary indirection.
- **TD-07 (Cleanup Strategy):** The cleanup mechanism depends on test infrastructure. Transaction rollback is preferred for relational databases. For document stores or external services, explicit deletion in `afterEach` is typical. Some teams use containerized databases (e.g., Testcontainers) that are destroyed after the test suite, eliminating the need for per-test cleanup.
