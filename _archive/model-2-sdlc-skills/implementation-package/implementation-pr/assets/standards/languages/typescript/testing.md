# TypeScript Testing Standards

## Purpose

These standards define TypeScript-specific testing rules that supplement the common testing standards in `../../common/`. They cover type-safe mocking, async testing patterns, assertion precision, and test configuration unique to TypeScript projects. For general testing principles like test structure, naming, and coverage expectations, refer to the common standards.

## Applicability

All TypeScript projects.

## Rules

### TST-01: Use Type-Safe Mocks

**Severity:** Error
**Rule:** Mock objects must satisfy the interface they replace — use `jest.Mocked<T>` or a typed partial mock, never `as any`.
**Why:** Untyped mocks silently drift from the real interface, letting tests pass while production code breaks — the mock becomes a lie about the contract it represents.

**Compliant:**

```typescript
import type { OrderRepository } from './order-repository';

// jest.Mocked<T> preserves the full interface with jest mock types
const mockRepository: jest.Mocked<OrderRepository> = {
  findById: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

// Partial mock with type assertion — valid when you only need a subset
function createMockRepository(
  overrides: Partial<jest.Mocked<OrderRepository>> = {},
): jest.Mocked<OrderRepository> {
  return {
    findById: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  };
}

const repo = createMockRepository({
  findById: jest.fn().mockResolvedValue(testOrder),
});
```

**Non-compliant:**

```typescript
// as any — if OrderRepository adds a required method, this test still passes
const mockRepository = {
  findById: jest.fn(),
} as any;

// Untyped object — no compile error when the interface changes
const mockRepository = {
  findByld: jest.fn(), // typo: findByld instead of findById — undetected
};
```

---

### TST-02: Test Async Code with async/await

**Severity:** Error
**Rule:** Use `async/await` in tests — return the Promise or use `await expect(...).rejects.toThrow()` for error cases; never use raw `.then()` chains.
**Why:** Forgotten `return` on a Promise chain causes the test to pass before the assertion runs; `async/await` makes this structurally impossible. See ERR-08 for the production-code counterpart.

**Compliant:**

```typescript
it('creates an order successfully', async () => {
  const order = await orderService.create(validInput);

  expect(order.id).toBeDefined();
  expect(order.status).toBe('pending');
});

it('rejects invalid input', async () => {
  await expect(orderService.create(invalidInput))
    .rejects.toThrow(ValidationError);
});

it('handles concurrent operations', async () => {
  const results = await Promise.all([
    orderService.create(input1),
    orderService.create(input2),
  ]);

  expect(results).toHaveLength(2);
});
```

**Non-compliant:**

```typescript
// Missing return — test passes before the assertion runs
it('creates an order', () => {
  orderService.create(validInput).then((order) => {
    expect(order.status).toBe('pending'); // never executes if create() rejects
  });
});

// done callback — error-prone and unnecessary with async/await
it('creates an order', (done) => {
  orderService.create(validInput).then((order) => {
    expect(order.status).toBe('pending');
    done();
  }).catch(done);
});
```

---

### TST-03: Mock Modules with Type Safety

**Severity:** Warning
**Rule:** When using `jest.mock()`, provide a typed factory function so the mock's shape is checked against the real module at compile time.
**Why:** Untyped `jest.mock()` calls create a shadow module that can diverge from the real one — the test exercises a fiction, and refactors silently break the contract.

**Compliant:**

```typescript
import { PaymentService } from './payment-service';

jest.mock('./payment-service', () => ({
  PaymentService: jest.fn().mockImplementation(() => ({
    charge: jest.fn<Promise<PaymentResult>, [ChargeInput]>(),
    refund: jest.fn<Promise<RefundResult>, [RefundInput]>(),
  })),
}));

// Alternative: jest.spyOn preserves the original module shape
const chargeSpy = jest.spyOn(paymentService, 'charge')
  .mockResolvedValue({ transactionId: 'tx-123', status: 'captured' });
```

**Non-compliant:**

```typescript
// Untyped mock — no compile error if PaymentService.charge signature changes
jest.mock('./payment-service', () => ({
  PaymentService: jest.fn().mockImplementation(() => ({
    charge: jest.fn(), // what does this return? what arguments does it take?
  })),
}));

// Inline mock with no type information
jest.mock('./payment-service');
const mockCharge = PaymentService.prototype.charge as jest.Mock;
```

---

### TST-04: Use Strict Assertion Matchers

**Severity:** Warning
**Rule:** Use `toBe` for primitives, `toEqual` for deep object comparison, and `toStrictEqual` when undefined properties and class instances matter — never rely on loose equality.
**Why:** Using the wrong matcher hides bugs: `toEqual` ignores `undefined` properties, `toBe` uses reference equality on objects, and `toStrictEqual` catches structural differences that `toEqual` misses.

**Compliant:**

```typescript
// Primitives: toBe (uses Object.is)
expect(result.status).toBe('active');
expect(result.count).toBe(42);
expect(result.enabled).toBe(true);

// Objects: toEqual (deep structural comparison)
expect(result).toEqual({
  id: 'order-1',
  items: [{ productId: 'p-1', quantity: 2 }],
});

// When undefined properties matter: toStrictEqual
expect(result).toStrictEqual({
  id: 'order-1',
  name: 'Test',
  deletedAt: undefined, // toEqual would pass even if deletedAt were missing entirely
});
```

**Non-compliant:**

```typescript
// toBe on objects — compares by reference, not structure
expect(result).toBe({ id: 'order-1' }); // always fails: different object references

// toEqual when undefined properties matter — this passes even if
// result has extra undefined fields or is missing the deletedAt key
expect(result).toEqual({ id: 'order-1', deletedAt: undefined });

// Loose string checks instead of precise assertions
expect(String(result.status)).toBeTruthy(); // what does "truthy" mean for a status?
```

---

### TST-05: Test Discriminated Unions Exhaustively

**Severity:** Warning
**Rule:** When testing code that handles discriminated union types, write a test case for each variant of the union.
**Why:** The compiler catches missing cases in `switch` statements, but tests catch missing or incorrect *behavior* for each variant — a handled case with wrong logic is a bug the compiler cannot see. See TS-03 for the discriminated union pattern.

**Compliant:**

```typescript
type PaymentEvent =
  | { type: 'captured'; transactionId: string }
  | { type: 'declined'; reason: string }
  | { type: 'refunded'; refundId: string; amount: number };

describe('handlePaymentEvent', () => {
  it('records a successful capture', async () => {
    await handlePaymentEvent({ type: 'captured', transactionId: 'tx-1' });
    expect(orderRepo.updateStatus).toHaveBeenCalledWith('confirmed');
  });

  it('notifies the customer on decline', async () => {
    await handlePaymentEvent({ type: 'declined', reason: 'insufficient_funds' });
    expect(notificationService.send).toHaveBeenCalledWith(
      expect.objectContaining({ template: 'payment-declined' }),
    );
  });

  it('issues a credit on refund', async () => {
    await handlePaymentEvent({ type: 'refunded', refundId: 'ref-1', amount: 2500 });
    expect(ledger.credit).toHaveBeenCalledWith(2500);
  });
});
```

**Non-compliant:**

```typescript
// Only tests the happy path — declined and refunded behavior is untested
describe('handlePaymentEvent', () => {
  it('handles payment events', async () => {
    await handlePaymentEvent({ type: 'captured', transactionId: 'tx-1' });
    expect(orderRepo.updateStatus).toHaveBeenCalled();
  });
});
```

---

### TST-06: Assert Error Types, Not Just Messages

**Severity:** Error
**Rule:** Assert on the error class or error code — not just the message string. See ERR-01 for typed error classes; this rule covers how to assert them in tests.
**Why:** Error messages are human-readable text that changes during refactoring; error types and codes are stable contracts — tests that depend on message text break on every copy edit.

**Compliant:**

```typescript
it('throws OrderNotFoundError for missing orders', async () => {
  await expect(orderService.findOrFail('missing-id'))
    .rejects.toThrow(OrderNotFoundError);
});

it('includes the order ID in the error context', async () => {
  try {
    await orderService.findOrFail('missing-id');
    fail('Expected OrderNotFoundError');
  } catch (error) {
    expect(error).toBeInstanceOf(OrderNotFoundError);
    expect((error as OrderNotFoundError).code).toBe('ORDER_NOT_FOUND');
    expect((error as OrderNotFoundError).context).toEqual({ orderId: 'missing-id' });
  }
});
```

**Non-compliant:**

```typescript
// Message text is fragile — breaks when wording changes
it('throws for missing orders', async () => {
  await expect(orderService.findOrFail('missing-id'))
    .rejects.toThrow('not found');
});

// String matching catches unrelated errors that happen to contain 'not found'
it('throws for missing orders', async () => {
  try {
    await orderService.findOrFail('missing-id');
  } catch (error) {
    expect(error.message).toContain('not found'); // matches "Config file not found" too
  }
});
```

---

### TST-07: Use Snapshot Testing Sparingly

**Severity:** Convention
**Rule:** Use snapshot tests only for serializable output like API response shapes or rendered HTML — never for business logic assertions; update snapshots intentionally, not blindly.
**Why:** Snapshot tests that cover logic become "accept whatever the code does" rubber stamps — they test nothing when developers reflexively run `--updateSnapshot` without reviewing changes.

**Compliant:**

```typescript
// API response shape — catches unintentional contract changes
it('returns the expected order response shape', () => {
  const response = serializeOrder(testOrder);
  expect(response).toMatchSnapshot();
});

// Inline snapshot for small, stable structures
it('formats the address correctly', () => {
  const formatted = formatAddress(testAddress);
  expect(formatted).toMatchInlineSnapshot(`
    "123 Main St
    Suite 4
    Springfield, IL 62701"
  `);
});
```

**Non-compliant:**

```typescript
// Business logic tested via snapshot — what is this actually verifying?
it('calculates the order total', () => {
  const result = calculateTotal(items);
  expect(result).toMatchSnapshot(); // is 42.50 correct? nobody knows without reading the snapshot file
});

// Entire component tree snapshot — any layout change causes a diff
it('renders the dashboard', () => {
  const { container } = render(<Dashboard data={mockData} />);
  expect(container).toMatchSnapshot(); // 500-line snapshot that nobody reviews
});
```

---

### TST-08: Configure Test Paths in tsconfig

**Severity:** Convention
**Rule:** Use a separate `tsconfig.test.json` or path mappings so test utilities import from a shared `@test/` alias — keep test helpers organized and type-checked alongside source code.
**Why:** Without path configuration, test helpers use fragile relative imports (`../../../test/helpers`), test files may not be type-checked, and test utilities scatter across the project.

**Compliant:**

```jsonc
// tsconfig.test.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "paths": {
      "@test/*": ["./test/*"]
    },
    "rootDir": "."
  },
  "include": ["src/**/*", "test/**/*"]
}
```

```typescript
// Test files use clean imports
import { createMockOrder, createMockUser } from '@test/factories';
import { setupTestDatabase, teardown } from '@test/setup';

describe('OrderService', () => {
  beforeAll(() => setupTestDatabase());
  afterAll(() => teardown());

  it('creates an order', async () => {
    const user = createMockUser();
    const order = createMockOrder({ customerId: user.id });
    // ...
  });
});
```

**Non-compliant:**

```typescript
// Fragile relative paths that break when files move
import { createMockOrder } from '../../../test/helpers/factories';
import { setupTestDatabase } from '../../../test/helpers/setup';

// Test helpers not included in tsconfig — no type checking
// tsconfig.json has: "include": ["src/**/*"]
// test/ directory is completely excluded from compilation
```

## Customization

- **TST-01 (Type-safe mocking)** approach varies by project. `jest.Mocked<T>` works well for full interface mocks, while `jest.spyOn` is preferable for partial mocking of existing instances. Some teams use libraries like `ts-mockito` or `@golevelup/ts-jest` that offer alternative type-safe mocking APIs.

- **TST-07 (Snapshot testing)** tolerance varies. Some teams ban snapshots entirely in favor of explicit assertions; others use them extensively for UI components with `@testing-library/react`. The key is that snapshot updates must be reviewed in code review, not auto-accepted.

- **TST-03 (Module mocking)** may use `jest.spyOn` as an alternative to `jest.mock()` factories. `jest.spyOn` has the advantage of retaining the real module's type information automatically and allowing selective overrides, but requires an existing instance. Teams using Vitest should adapt these patterns to Vitest's `vi.mock()` and `vi.spyOn()` equivalents.
