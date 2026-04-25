# Unit Testing Standards

## Purpose

Unit tests are the foundation of a reliable codebase. They verify that individual units of logic behave correctly in isolation, catch regressions early, and serve as living documentation for expected behavior. These standards ensure unit tests are consistent, maintainable, fast, and trustworthy across all projects.

## Applicability

All TypeScript/JavaScript projects that use Jest (or compatible test runners such as Vitest). These rules apply to every unit test file — new and existing — across all services, libraries, and packages in the organization.

## Rules

### UT-01: Use Arrange-Act-Assert Structure

**Severity:** Convention

**Rule:** Structure every test into three visually separated sections — Arrange (set up inputs and dependencies), Act (execute the behavior under test), and Assert (verify the outcome) — with blank lines between each section.

**Why:** A consistent structure makes tests scannable and ensures each test has a clear setup, execution, and verification phase.

**Compliant:**

```typescript
it('calculates the total price including tax', () => {
  // Arrange
  const items = [
    { name: 'Widget', price: 10.00, quantity: 2 },
    { name: 'Gadget', price: 25.00, quantity: 1 },
  ];
  const taxRate = 0.08;

  // Act
  const total = calculateTotal(items, taxRate);

  // Assert
  expect(total).toBe(48.60);
});
```

**Non-compliant:**

```typescript
it('calculates the total price including tax', () => {
  const total = calculateTotal(
    [{ name: 'Widget', price: 10.00, quantity: 2 }, { name: 'Gadget', price: 25.00, quantity: 1 }],
    0.08
  );
  expect(total).toBe(48.60);
});
```

---

### UT-02: Name Tests by Behavior, Not Method

**Severity:** Warning

**Rule:** Name each test to describe the observable behavior being verified, using language that a non-developer could understand — never name tests after the method being called or use vague names like `should work`.

**Why:** Behavior-focused names make test failures immediately understandable and serve as documentation for the system's expected behavior.

**Compliant:**

```typescript
describe('OrderService.refund', () => {
  it('rejects refund when order has not been delivered', () => {
    const order = createOrder({ status: 'shipped' });

    const result = orderService.refund(order);

    expect(result.success).toBe(false);
    expect(result.reason).toBe('Order must be delivered before refund');
  });

  it('applies partial refund when item is opened', () => {
    const order = createOrder({ status: 'delivered', itemCondition: 'opened' });

    const result = orderService.refund(order);

    expect(result.amount).toBe(order.total * 0.8);
  });
});
```

**Non-compliant:**

```typescript
describe('OrderService', () => {
  it('test refund method', () => {
    // ...
  });

  it('should work', () => {
    // ...
  });

  it('refund', () => {
    // ...
  });
});
```

---

### UT-03: One Concept per Test

**Severity:** Warning

**Rule:** Each test must verify one logical behavior or concept — multiple assertions are fine when they verify different facets of the same outcome, but separate behaviors must have separate tests.

**Why:** When a multi-concept test fails, it is unclear which behavior broke, and the failure message is misleading.

**Compliant:**

```typescript
it('creates a user with normalized fields', () => {
  const user = createUser({ name: '  Alice  ', email: 'ALICE@EXAMPLE.COM' });

  expect(user.name).toBe('Alice');
  expect(user.email).toBe('alice@example.com');
  expect(user.createdAt).toBeDefined();
});

it('rejects a user with an invalid email', () => {
  expect(() => createUser({ name: 'Alice', email: 'not-an-email' }))
    .toThrow('Invalid email address');
});
```

**Non-compliant:**

```typescript
it('creates and validates users', () => {
  // Tests creation
  const user = createUser({ name: 'Alice', email: 'alice@example.com' });
  expect(user.name).toBe('Alice');

  // Also tests validation — this is a separate behavior
  expect(() => createUser({ name: 'Alice', email: 'not-an-email' }))
    .toThrow('Invalid email address');

  // Also tests duplicate detection — yet another behavior
  expect(() => createUser({ name: 'Alice', email: 'alice@example.com' }))
    .toThrow('User already exists');
});
```

---

### UT-04: Tests Must Be Independent

**Severity:** Error

**Rule:** Each test must set up its own data, never rely on state produced by another test, and never depend on execution order — tests must pass when run individually, in any order, or in parallel.

**Why:** Shared mutable state causes cascading failures and flaky tests that pass locally but fail in CI.

**Compliant:**

```typescript
describe('CartService', () => {
  it('adds an item to an empty cart', () => {
    const cart = new CartService();

    cart.addItem({ id: 'item-1', price: 10 });

    expect(cart.items).toHaveLength(1);
  });

  it('calculates total for multiple items', () => {
    const cart = new CartService();
    cart.addItem({ id: 'item-1', price: 10 });
    cart.addItem({ id: 'item-2', price: 20 });

    expect(cart.total).toBe(30);
  });
});
```

**Non-compliant:**

```typescript
describe('CartService', () => {
  const cart = new CartService(); // shared mutable state

  it('adds an item to the cart', () => {
    cart.addItem({ id: 'item-1', price: 10 });
    expect(cart.items).toHaveLength(1);
  });

  it('calculates total for multiple items', () => {
    // depends on the previous test having added item-1
    cart.addItem({ id: 'item-2', price: 20 });
    expect(cart.total).toBe(30);
  });
});
```

---

### UT-05: Tests Must Be Deterministic

**Severity:** Error

**Rule:** Tests must produce the same result on every run — never use `Math.random()`, `Date.now()`, or real network calls; use fixed seeds, clock mocking, and test doubles.

**Why:** Non-deterministic tests erode trust in the entire test suite and waste debugging time on phantom failures.

**Compliant:**

```typescript
it('expires a session after 30 minutes of inactivity', () => {
  jest.useFakeTimers();
  const session = new Session({ userId: 'user-1' });

  jest.advanceTimersByTime(30 * 60 * 1000);

  expect(session.isExpired()).toBe(true);
  jest.useRealTimers();
});

it('generates a unique order reference', () => {
  const mockUuid = jest.spyOn(crypto, 'randomUUID').mockReturnValue('fixed-uuid-1234');

  const order = createOrder({ customerId: 'cust-1' });

  expect(order.reference).toBe('ORD-fixed-uuid-1234');
  mockUuid.mockRestore();
});
```

**Non-compliant:**

```typescript
it('expires a session after 30 minutes of inactivity', async () => {
  const session = new Session({ userId: 'user-1' });

  // Waiting for real time — makes the test impossibly slow and flaky
  await new Promise((resolve) => setTimeout(resolve, 30 * 60 * 1000));

  expect(session.isExpired()).toBe(true);
});

it('generates a unique order reference', () => {
  const order = createOrder({ customerId: 'cust-1' });

  // Non-deterministic — the UUID changes every run
  expect(order.reference).toMatch(/^ORD-/);
});
```

---

### UT-06: Test Edge Cases and Error Paths

**Severity:** Warning

**Rule:** Test null/undefined inputs, empty collections, boundary values, error conditions, and any exceptional scenario — happy-path-only coverage creates a false sense of safety.

**Why:** Production bugs cluster at boundaries and error paths, not in the happy path that developers naturally test first.

**Compliant:**

```typescript
describe('parseAge', () => {
  it('parses a valid age string', () => {
    expect(parseAge('25')).toBe(25);
  });

  it('returns null for undefined input', () => {
    expect(parseAge(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseAge('')).toBeNull();
  });

  it('returns null for negative numbers', () => {
    expect(parseAge('-1')).toBeNull();
  });

  it('returns null for non-numeric strings', () => {
    expect(parseAge('abc')).toBeNull();
  });

  it('handles the maximum valid age boundary', () => {
    expect(parseAge('150')).toBe(150);
    expect(parseAge('151')).toBeNull();
  });
});
```

**Non-compliant:**

```typescript
describe('parseAge', () => {
  it('parses a valid age string', () => {
    expect(parseAge('25')).toBe(25);
  });

  // No tests for null, undefined, empty, negative, non-numeric, or boundary values
});
```

---

### UT-07: No Logic in Tests

**Severity:** Warning

**Rule:** Test code must be linear and free of conditional logic — no `if/else`, no `for/while` loops, no `try/catch` wrapping assertions; use parameterized tests (`it.each`) for input variations.

**Why:** Logic in tests can silently skip assertions or hide failures, and makes it harder to understand what a test actually verifies.

**Compliant:**

```typescript
it.each([
  { input: 'hello', expected: 'HELLO' },
  { input: 'World', expected: 'WORLD' },
  { input: '', expected: '' },
  { input: 'already-UPPER', expected: 'ALREADY-UPPER' },
])('converts "$input" to uppercase: "$expected"', ({ input, expected }) => {
  expect(toUpperCase(input)).toBe(expected);
});
```

**Non-compliant:**

```typescript
it('converts strings to uppercase', () => {
  const cases = ['hello', 'World', '', 'already-UPPER'];
  const expected = ['HELLO', 'WORLD', '', 'ALREADY-UPPER'];

  for (let i = 0; i < cases.length; i++) {
    if (cases[i] !== '') {
      expect(toUpperCase(cases[i])).toBe(expected[i]);
    }
  }
  // The empty-string case was silently skipped by the `if` guard
});
```

---

### UT-08: Keep Tests Fast

**Severity:** Error

**Rule:** Individual unit tests must complete in milliseconds — never perform file I/O, database access, or network calls in unit tests; mock all external dependencies.

**Why:** Slow tests discourage developers from running the suite frequently, leading to later detection of regressions and longer feedback loops.

**Compliant:**

```typescript
it('sends a welcome email after registration', async () => {
  const emailService = { send: jest.fn().mockResolvedValue({ messageId: 'msg-1' }) };
  const userService = new UserService(emailService);

  await userService.register({ name: 'Alice', email: 'alice@example.com' });

  expect(emailService.send).toHaveBeenCalledWith(
    expect.objectContaining({
      to: 'alice@example.com',
      template: 'welcome',
    }),
  );
});
```

**Non-compliant:**

```typescript
it('sends a welcome email after registration', async () => {
  const userService = new UserService(new SmtpEmailService()); // real SMTP connection

  await userService.register({ name: 'Alice', email: 'alice@example.com' });

  // Waits for a real email to be delivered, then checks the inbox
  const inbox = await fetchInbox('alice@example.com');
  expect(inbox.messages).toContainEqual(
    expect.objectContaining({ subject: 'Welcome!' }),
  );
});
```

---

### UT-09: Maintain Minimum Coverage Thresholds

**Severity:** Error

**Rule:** New code must achieve at least 80% line coverage; modified files must not have their coverage decrease — enforce thresholds in CI via the Jest `coverageThreshold` configuration.

**Why:** Coverage thresholds prevent untested code from reaching production and create accountability for testing during code review.

**Compliant:**

```jsonc
// jest.config.ts — coverage enforcement
{
  "coverageThreshold": {
    "global": {
      "lines": 80,
      "branches": 75,
      "functions": 80,
      "statements": 80
    }
  }
}
```

```typescript
// The function and all its branches are covered
describe('discountCalculator', () => {
  it('applies no discount for orders under $50', () => {
    expect(calculateDiscount(49.99)).toBe(0);
  });

  it('applies 10% discount for orders between $50 and $100', () => {
    expect(calculateDiscount(75)).toBe(7.5);
  });

  it('applies 20% discount for orders over $100', () => {
    expect(calculateDiscount(200)).toBe(40);
  });
});
```

**Non-compliant:**

```typescript
// Only tests one branch — the other branches are uncovered
describe('discountCalculator', () => {
  it('applies a discount', () => {
    expect(calculateDiscount(75)).toBe(7.5);
  });
});
```

---

### UT-10: Use Descriptive Assertion Messages

**Severity:** Convention

**Rule:** When using generic assertions (`.toBe(true)`, `.toBe(false)`, `.toBeNull()`), include a descriptive message so that failures are self-documenting — use more specific matchers when available.

**Why:** A failure message like `expected true, received false` forces the developer to re-read the test to understand what failed; a descriptive message explains it immediately.

**Compliant:**

```typescript
it('marks an order as eligible for express shipping', () => {
  const order = createOrder({ weight: 2, destination: 'domestic' });

  const eligible = order.isEligibleForExpress();

  // Specific matcher — the failure message is already clear
  expect(eligible).toBe(true);

  // When using a generic check, add a message
  expect(order.shippingOptions.length > 0).toBeTruthy();
  // Better: use a specific matcher instead
  expect(order.shippingOptions).not.toHaveLength(0);
});

it('rejects oversized orders for express shipping', () => {
  const order = createOrder({ weight: 50, destination: 'domestic' });

  expect(order.isEligibleForExpress()).toBe(false);
  expect(order.rejectionReason).toBe('Exceeds maximum weight for express shipping');
});
```

**Non-compliant:**

```typescript
it('checks express shipping', () => {
  const order = createOrder({ weight: 2, destination: 'domestic' });

  // Failure reads: "expected false to be truthy" — what does that mean?
  expect(order.shippingOptions.length > 0).toBeTruthy();

  // No assertion message, no specific matcher, no readable failure
  expect(!!order.isEligibleForExpress()).toBe(true);
});
```

## Customization

- **UT-02 naming style** — Some teams use a `should` prefix (`it('should reject refund when...')`), others use bare behavior descriptions (`it('rejects refund when...')`), and some follow `given-when-then` phrasing. Choose one convention per project and enforce it consistently.
- **UT-09 coverage threshold** — The 80% threshold is a recommended default. Teams may set a lower floor (e.g., 60%) for legacy codebases being brought under test, or a higher target (e.g., 90%) for critical libraries. Adjust `coverageThreshold` in `jest.config.ts` accordingly.
- **UT-10 assertion messages** — Jest's built-in `expect` matchers (`.toEqual`, `.toContain`, `.toThrow`) produce clear default failure messages that often make explicit messages unnecessary. Teams using assertion libraries with less descriptive defaults should enforce messages more strictly.
