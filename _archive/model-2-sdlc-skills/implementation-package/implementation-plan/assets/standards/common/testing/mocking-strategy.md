# Mocking Strategy Standards

## Purpose

These standards govern how test doubles (mocks, stubs, fakes) are created and used across the codebase. Proper mocking leads to tests that are fast, deterministic, and resilient to refactoring — while poor mocking creates brittle tests that break on every internal change and pass even when the production code is wrong. Following these rules ensures that mocked dependencies stay in sync with real implementations, that tests verify meaningful behavior rather than wiring details, and that the design of production code remains testable without excessive ceremony.

## Applicability

All TypeScript/JavaScript projects using Jest as the test framework. These rules apply to unit tests and integration tests that substitute real dependencies with test doubles. They do not apply to end-to-end tests where real services are exercised.

## Rules

### MOC-01: Mock at the Narrowest Boundary

**Severity:** Error

**Rule:** Mock the specific dependency a unit collaborates with, not the entire module that contains it.

**Why:** Broad module-level mocks couple tests to file structure rather than behavior, causing them to break when files are reorganized and hiding actual import issues.

**Compliant:**

```typescript
import { OrderService } from './order-service';
import { PaymentGateway } from './payment-gateway';

describe('OrderService', () => {
  it('should charge the customer when placing an order', async () => {
    const mockPaymentGateway: PaymentGateway = {
      charge: jest.fn().mockResolvedValue({ transactionId: 'tx-123' }),
    };

    const service = new OrderService(mockPaymentGateway);
    await service.placeOrder({ customerId: 'c-1', amount: 100 });

    expect(mockPaymentGateway.charge).toHaveBeenCalledWith('c-1', 100);
  });
});
```

**Non-compliant:**

```typescript
// Mocks the entire module — every export is replaced, even those not relevant to this test
jest.mock('../../services/payment');

import { OrderService } from './order-service';

describe('OrderService', () => {
  it('should charge the customer when placing an order', async () => {
    const service = new OrderService();
    await service.placeOrder({ customerId: 'c-1', amount: 100 });
    // Test passes but gives no confidence that the real PaymentGateway contract is honored
  });
});
```

---

### MOC-02: Prefer Dependency Injection over Module Mocking

**Severity:** Error

**Rule:** Design production code so that dependencies are received via constructor parameters or function arguments rather than imported and called directly.

**Why:** Dependency injection makes the collaborator explicit, eliminates module-level side effects in tests, and allows different test doubles to be supplied per test without global state.

**Compliant:**

```typescript
interface EmailSender {
  send(to: string, subject: string, body: string): Promise<void>;
}

class NotificationService {
  constructor(private readonly emailSender: EmailSender) {}

  async notifyUser(userId: string, message: string): Promise<void> {
    const user = await this.lookupUser(userId);
    await this.emailSender.send(user.email, 'Notification', message);
  }
}

// In tests — inject a stub directly
const stubEmailSender: EmailSender = { send: jest.fn().mockResolvedValue(undefined) };
const service = new NotificationService(stubEmailSender);
```

**Non-compliant:**

```typescript
// Production code imports and calls the dependency directly — no seam for testing
import { sendEmail } from '../../lib/email';

class NotificationService {
  async notifyUser(userId: string, message: string): Promise<void> {
    const user = await this.lookupUser(userId);
    await sendEmail(user.email, 'Notification', message);
  }
}

// Tests must use jest.mock to intercept the import
jest.mock('../../lib/email');
```

---

### MOC-03: Keep Mocks in Sync with Real Implementations

**Severity:** Error

**Rule:** Type-check all test doubles against the interface or type they replace — never use `as any` to silence type errors on mocks.

**Why:** An untyped mock can drift from the real implementation, causing tests to pass against a contract that no longer exists in production.

**Compliant:**

```typescript
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// Mock is typed against the interface — compiler catches drift
const mockRepo: jest.Mocked<UserRepository> = {
  findById: jest.fn(),
  save: jest.fn(),
};

// If UserRepository adds a new method, this mock will fail to compile
// until it is updated — exactly what we want.
```

**Non-compliant:**

```typescript
// `as any` silences the compiler — mock can have missing or wrong methods
const mockRepo = {
  findById: jest.fn(),
  // save() was removed here but tests still pass because of `as any`
} as any;

const service = new UserService(mockRepo);
```

---

### MOC-04: Verify Interactions, Not Implementation

**Severity:** Warning

**Rule:** Assert on observable outcomes and the arguments passed to collaborators, not on internal call order or exact invocation counts unless ordering is a correctness requirement.

**Why:** Over-specifying interaction details makes tests brittle to harmless refactors like reordering independent calls or adding a caching layer.

**Compliant:**

```typescript
it('should send a welcome email with the user name', async () => {
  const mockMailer: Mailer = { send: jest.fn().mockResolvedValue(undefined) };
  const service = new RegistrationService(mockMailer);

  await service.register({ name: 'Alice', email: 'alice@example.com' });

  expect(mockMailer.send).toHaveBeenCalledWith(
    'alice@example.com',
    expect.stringContaining('Welcome'),
    expect.stringContaining('Alice'),
  );
});
```

**Non-compliant:**

```typescript
it('should send a welcome email with the user name', async () => {
  const mockMailer: Mailer = { send: jest.fn().mockResolvedValue(undefined) };
  const service = new RegistrationService(mockMailer);

  await service.register({ name: 'Alice', email: 'alice@example.com' });

  // Brittle: asserts exact call count and order — breaks if an internal
  // logging call is added or the method is invoked via a helper
  expect(mockMailer.send).toHaveBeenCalledTimes(1);
  expect(mockMailer.send).toHaveBeenNthCalledWith(
    1,
    'alice@example.com',
    'Welcome to Acme',
    'Hello Alice, welcome aboard!',
  );
});
```

---

### MOC-05: Use the Right Test Double Type

**Severity:** Convention

**Rule:** Choose the test double type that matches the test's verification goal — use a stub to supply canned data, a mock to verify interactions, and a fake to provide a lightweight working implementation.

**Why:** Using the wrong double type leads to tests that either verify too little (a mock where a stub suffices adds noise) or too much (asserting calls when only the return value matters).

**Compliant:**

```typescript
// STUB — test only cares about the return value
const stubPricingService: PricingService = {
  getPrice: jest.fn().mockReturnValue(29.99),
};

it('should apply discount to the price from the pricing service', () => {
  const cart = new ShoppingCart(stubPricingService);
  cart.addItem('sku-1');
  expect(cart.total()).toBe(26.99); // 29.99 - 3.00 loyalty discount
});

// FAKE — lightweight in-memory implementation for integration-style tests
class InMemoryOrderRepository implements OrderRepository {
  private orders = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }
}
```

**Non-compliant:**

```typescript
// Uses a mock with interaction verification when the test only needs a return value
const mockPricingService: PricingService = {
  getPrice: jest.fn().mockReturnValue(29.99),
};

it('should apply discount to the price from the pricing service', () => {
  const cart = new ShoppingCart(mockPricingService);
  cart.addItem('sku-1');
  expect(cart.total()).toBe(26.99);

  // Unnecessary — the test already proved correctness via the total() assertion
  expect(mockPricingService.getPrice).toHaveBeenCalledTimes(1);
  expect(mockPricingService.getPrice).toHaveBeenCalledWith('sku-1');
});
```

---

### MOC-06: Avoid Over-Mocking

**Severity:** Warning

**Rule:** If a test requires mocking five or more dependencies, treat it as a design signal that the class under test has too many responsibilities — refactor the production code before adding more mocks.

**Why:** Excessive mocking makes tests hard to read, slow to maintain, and likely to pass even when production behavior is broken because so much of the real system has been replaced.

**Compliant:**

```typescript
// OrderService depends on two collaborators — focused responsibility
class OrderService {
  constructor(
    private readonly repo: OrderRepository,
    private readonly paymentGateway: PaymentGateway,
  ) {}
}

describe('OrderService', () => {
  const mockRepo: jest.Mocked<OrderRepository> = { save: jest.fn(), findById: jest.fn() };
  const mockPayment: jest.Mocked<PaymentGateway> = { charge: jest.fn() };

  it('should save the order after successful payment', async () => {
    mockPayment.charge.mockResolvedValue({ transactionId: 'tx-1' });
    const service = new OrderService(mockRepo, mockPayment);

    await service.placeOrder({ customerId: 'c-1', amount: 50 });

    expect(mockRepo.save).toHaveBeenCalled();
  });
});
```

**Non-compliant:**

```typescript
// Six mocks — the class is doing too much
describe('OrderService', () => {
  const mockRepo = { save: jest.fn(), findById: jest.fn() };
  const mockPayment = { charge: jest.fn() };
  const mockInventory = { reserve: jest.fn() };
  const mockNotifier = { send: jest.fn() };
  const mockLogger = { info: jest.fn(), error: jest.fn() };
  const mockMetrics = { increment: jest.fn() };

  it('should process an order', async () => {
    // Test is unreadable and any failure message is ambiguous
    const service = new OrderService(
      mockRepo, mockPayment, mockInventory, mockNotifier, mockLogger, mockMetrics,
    );
    await service.placeOrder({ customerId: 'c-1', amount: 50 });
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
```

---

### MOC-07: Don't Mock What You Don't Own

**Severity:** Warning

**Rule:** Do not mock third-party library APIs directly — wrap them in a thin adapter that you own and mock the adapter instead.

**Why:** Third-party libraries can change their API between versions; mocking them directly embeds assumptions about their internal contract into your tests, causing silent breakage on upgrade.

**Compliant:**

```typescript
// Adapter wraps the third-party library
interface StorageClient {
  upload(key: string, data: Buffer): Promise<string>;
}

class S3StorageClient implements StorageClient {
  constructor(private readonly s3: S3Client) {}

  async upload(key: string, data: Buffer): Promise<string> {
    await this.s3.send(new PutObjectCommand({ Bucket: 'my-bucket', Key: key, Body: data }));
    return `https://my-bucket.s3.amazonaws.com/${key}`;
  }
}

// Test mocks the adapter — not the S3 SDK
const mockStorage: jest.Mocked<StorageClient> = {
  upload: jest.fn().mockResolvedValue('https://my-bucket.s3.amazonaws.com/file.txt'),
};

const service = new FileService(mockStorage);
```

**Non-compliant:**

```typescript
// Mocking the AWS SDK directly — breaks when SDK internals change
jest.mock('@aws-sdk/client-s3');

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const mockSend = jest.fn().mockResolvedValue({});
(S3Client as jest.Mock).mockImplementation(() => ({ send: mockSend }));

const service = new FileService();
await service.uploadFile('file.txt', Buffer.from('data'));

expect(mockSend).toHaveBeenCalledWith(expect.any(PutObjectCommand));
```

---

### MOC-08: Reset Mocks Between Tests

**Severity:** Error

**Rule:** Call `jest.clearAllMocks()` (or the equivalent per-mock `.mockClear()`) in a `beforeEach` or `afterEach` block so that no mock state leaks between tests.

**Why:** Stale mock return values and recorded calls from a previous test cause false positives, false negatives, and test-order-dependent failures that are extremely hard to diagnose.

**Compliant:**

```typescript
describe('InvoiceService', () => {
  const mockRepo: jest.Mocked<InvoiceRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save a new invoice', async () => {
    const service = new InvoiceService(mockRepo);
    await service.create({ amount: 100 });
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should find an existing invoice', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'inv-1', amount: 100 });
    const service = new InvoiceService(mockRepo);
    const result = await service.getById('inv-1');
    expect(result).toEqual({ id: 'inv-1', amount: 100 });
    // save was NOT called in this test, and thanks to clearAllMocks
    // it has zero recorded calls — no leakage from the previous test
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
```

**Non-compliant:**

```typescript
describe('InvoiceService', () => {
  const mockRepo: jest.Mocked<InvoiceRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
  };

  // No beforeEach/afterEach cleanup

  it('should save a new invoice', async () => {
    const service = new InvoiceService(mockRepo);
    await service.create({ amount: 100 });
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should find an existing invoice', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'inv-1', amount: 100 });
    const service = new InvoiceService(mockRepo);
    const result = await service.getById('inv-1');
    expect(result).toEqual({ id: 'inv-1', amount: 100 });
    // This assertion is FLAKY — save still has 1 recorded call from the previous test
    expect(mockRepo.save).not.toHaveBeenCalled(); // FAILS
  });
});
```

## Customization

- **MOC-02 (Dependency Injection):** Strictness depends on framework. NestJS provides built-in DI via its module system and `@Injectable()` decorators, making constructor injection the natural default. Vanilla Express projects may rely more heavily on `jest.mock()` for module-level function imports — in that case, document the module-mock pattern as the accepted team convention.
- **MOC-06 (Over-Mocking Threshold):** The threshold of "too many mocks" is configurable per team. A common range is 3–5 dependencies. Teams with deeply layered architectures may tolerate higher counts for orchestrator classes, provided each mock is typed and the test remains readable.
- **MOC-07 (Don't Mock What You Don't Own):** This rule may be relaxed for stable, well-typed libraries with strong backward-compatibility guarantees (e.g., `date-fns`, `lodash`). If the library's types are consumed via your own type aliases, the risk is already mitigated.
