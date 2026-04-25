# End-to-End Testing Standards

## Purpose

These standards establish consistent practices for writing reliable, maintainable end-to-end tests that verify critical user journeys through the full application stack. E2E tests are the most expensive tests to write, run, and maintain — these rules ensure that investment is focused on high-value scenarios, that tests are deterministic and debuggable, and that flakiness is treated as a defect to fix rather than noise to tolerate. A well-maintained E2E suite provides confidence that the system works as users experience it, not just as developers imagine it.

## Applicability

These standards apply to all web applications with a user-facing interface — including React, Next.js, and any frontend served over HTTP. They cover browser-based E2E tests using Playwright (the recommended framework), though the principles apply equally to Cypress, Selenium, or other E2E tools. Teams building API-only services should use integration tests rather than E2E tests and may skip these standards. Mobile applications have platform-specific E2E patterns not covered here.

## Rules

### E2E-01: Scope E2E Tests to Critical User Journeys

**Severity:** Error
**Rule:** E2E tests must cover complete user workflows — signup, purchase, checkout, onboarding — not individual components or utility functions; restrict E2E scope to the journeys whose failure would have the highest business impact.
**Why:** E2E tests are slow, brittle, and expensive to maintain — testing every edge case at the E2E level creates a test suite that takes hours to run and breaks constantly, while unit and integration tests handle those cases faster and more reliably.

**Compliant:**

```typescript
// Tests a complete critical journey: browse → add to cart → checkout → confirmation
import { test, expect } from '@playwright/test';

test('user can complete a purchase', async ({ page }) => {
  await page.goto('/products');

  // Browse and select a product
  await page.getByRole('link', { name: 'Wireless Headphones' }).click();
  await expect(page).toHaveURL(/\/products\/[\w-]+/);

  // Add to cart
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByTestId('cart-count')).toHaveText('1');

  // Navigate to checkout
  await page.getByRole('link', { name: 'Cart' }).click();
  await page.getByRole('button', { name: 'Proceed to checkout' }).click();

  // Fill shipping details
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Address').fill('123 Main St');
  await page.getByLabel('City').fill('Springfield');

  // Complete purchase
  await page.getByRole('button', { name: 'Place order' }).click();

  // Verify confirmation
  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
  await expect(page.getByTestId('order-number')).toContainText('ORD-');
});
```

**Non-compliant:**

```typescript
// E2E test for a single component — this belongs in a unit/component test
test('button changes color on hover', async ({ page }) => {
  await page.goto('/design-system');
  const button = page.getByRole('button', { name: 'Submit' });
  await button.hover();
  const color = await button.evaluate((el) =>
    getComputedStyle(el).backgroundColor,
  );
  expect(color).toBe('rgb(0, 100, 200)');
});

// E2E test for a utility function — this is a unit test
test('formatCurrency formats correctly', async ({ page }) => {
  await page.goto('/test-utils');
  // Never test pure functions via E2E
});
```

---

### E2E-02: Do Not Test Implementation Details

**Severity:** Error
**Rule:** Assert on user-visible outcomes — text content, URL changes, element visibility, downloaded files — never assert on internal state, CSS class names, component props, or DOM structure.
**Why:** Implementation-detail assertions break on every refactor even when user behavior is unchanged, creating a test suite that punishes improvement and provides false negatives.

**Compliant:**

```typescript
test('user sees error message on invalid login', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('wrong@example.com');
  await page.getByLabel('Password').fill('incorrect');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Assert on what the user sees
  await expect(
    page.getByText('Invalid email or password'),
  ).toBeVisible();

  // Assert the user stayed on the login page
  await expect(page).toHaveURL('/login');
});
```

**Non-compliant:**

```typescript
test('login shows error', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('wrong@example.com');
  await page.getByLabel('Password').fill('incorrect');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Asserts on CSS class — breaks when styles are refactored
  const errorDiv = page.locator('.error-message--visible');
  await expect(errorDiv).toHaveClass(/text-red-500/);

  // Asserts on internal React state via DOM attribute
  const form = page.locator('[data-error-count="1"]');
  await expect(form).toBeVisible();

  // Asserts on DOM structure — breaks when markup changes
  const alert = page.locator('div > span.alert-inner > p:first-child');
  await expect(alert).toHaveText('Invalid email or password');
});
```

---

### E2E-03: Use Stable Selectors

**Severity:** Error
**Rule:** Select elements using `data-testid` attributes, ARIA roles (`getByRole`), accessible names (`getByLabel`, `getByText`), or semantic locators — never use CSS class names, tag hierarchies, or auto-generated IDs.
**Why:** CSS classes change during styling refactors, tag hierarchies change during markup refactors, and generated IDs change between renders — all of these break tests without changing behavior.

**Compliant:**

```typescript
test('user adds item to cart', async ({ page }) => {
  await page.goto('/products');

  // ARIA role — survives any refactor that preserves accessibility
  await page.getByRole('button', { name: 'Add to cart' }).click();

  // Accessible label — tied to the user-visible label, not implementation
  await page.getByLabel('Quantity').fill('3');

  // data-testid — explicit, stable, and greppable
  await expect(page.getByTestId('cart-count')).toHaveText('3');

  // Text content — matches what the user reads
  await expect(page.getByText('Item added to cart')).toBeVisible();
});
```

**Non-compliant:**

```typescript
test('user adds item to cart', async ({ page }) => {
  await page.goto('/products');

  // CSS class — breaks when styling framework changes
  await page.locator('.btn-primary.add-to-cart').click();

  // Tag hierarchy — breaks when any parent element changes
  await page.locator('div.product-card > div.actions > button:nth-child(2)').click();

  // Auto-generated ID — different on every render in React 18+
  await page.locator('#react-aria-:r3:').fill('3');

  // XPath — brittle and unreadable
  await page.locator('//div[@class="cart"]/span[1]').toHaveText('3');
});
```

---

### E2E-04: Use Deterministic Waits

**Severity:** Error
**Rule:** Wait for specific conditions — element visible, text appears, URL changes, network request completes — never use fixed-duration sleeps or arbitrary timeouts.
**Why:** Fixed sleeps either waste time (too long) or cause flakiness (too short); deterministic waits adapt to actual application speed and make tests both faster and more reliable.

**Compliant:**

```typescript
test('search results load after query', async ({ page }) => {
  await page.goto('/search');

  await page.getByLabel('Search').fill('typescript');
  await page.getByRole('button', { name: 'Search' }).click();

  // Wait for a specific network response
  await page.waitForResponse(
    (resp) => resp.url().includes('/api/search') && resp.status() === 200,
  );

  // Wait for visible content
  await expect(page.getByTestId('result-count')).toBeVisible();
  await expect(page.getByTestId('result-count')).not.toHaveText('0 results');

  // Playwright's auto-waiting: getByRole waits for the element automatically
  await expect(
    page.getByRole('heading', { name: 'Search results' }),
  ).toBeVisible();
});

test('modal closes after save', async ({ page }) => {
  await page.getByRole('button', { name: 'Edit profile' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.getByLabel('Display name').fill('New Name');
  await page.getByRole('button', { name: 'Save' }).click();

  // Wait for the dialog to disappear — deterministic
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
```

**Non-compliant:**

```typescript
test('search results load', async ({ page }) => {
  await page.goto('/search');

  await page.getByLabel('Search').fill('typescript');
  await page.getByRole('button', { name: 'Search' }).click();

  // Fixed sleep — too slow on fast machines, too fast on CI
  await page.waitForTimeout(3000);

  // Arbitrary timeout hoping the API responds in time
  await page.waitForTimeout(5000);
  const count = await page.getByTestId('result-count').textContent();
  expect(count).not.toBe('0 results');
});
```

---

### E2E-05: Isolate Test Data

**Severity:** Error
**Rule:** Each E2E test must create its own test data via API seeding or factory functions in `beforeAll`/`beforeEach` — never depend on pre-existing database state, shared fixtures, or data created by other tests.
**Why:** Shared test data creates hidden coupling between tests — one test's cleanup deletes another test's data, order-dependent failures appear only in CI, and environment differences cause phantom failures.

**Compliant:**

```typescript
import { test, expect } from '@playwright/test';
import { seedUser, seedProduct, seedOrder, cleanup } from './helpers/seed';

test.describe('Order management', () => {
  let testUser: { email: string; password: string };
  let testOrder: { id: string };

  test.beforeAll(async () => {
    testUser = await seedUser({
      email: `test-${Date.now()}@example.com`,
      password: 'TestPass123!',
    });
    const product = await seedProduct({ name: 'Test Widget', price: 29.99 });
    testOrder = await seedOrder({
      userId: testUser.email,
      items: [{ productId: product.id, quantity: 1 }],
    });
  });

  test.afterAll(async () => {
    await cleanup(testUser.email);
  });

  test('user can view their order', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.goto(`/orders/${testOrder.id}`);
    await expect(page.getByText('Test Widget')).toBeVisible();
    await expect(page.getByText('$29.99')).toBeVisible();
  });
});
```

**Non-compliant:**

```typescript
// Depends on a user that "should exist" in the database
test('user can view orders', async ({ page }) => {
  await page.goto('/login');
  // This account must exist in every environment — who creates it?
  await page.getByLabel('Email').fill('testuser@company.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Depends on orders created by a different test or manual setup
  await page.goto('/orders');
  await expect(page.getByText('Order #1001')).toBeVisible();
  // Fails when the database is reset, when another test deletes this order,
  // or when running against a fresh environment
});
```

---

### E2E-06: Support Parallel Execution

**Severity:** Warning
**Rule:** E2E tests must not share mutable state — no global user accounts, no sequential dependencies, no shared database rows — each test must be self-contained and executable in any order or in parallel.
**Why:** Serial-only test suites don't scale — a 30-minute sequential E2E run becomes a 5-minute parallel run, but only if tests are independent; shared state forces serial execution and creates order-dependent failures.

**Compliant:**

```typescript
// Each test creates its own isolated user and data
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,
});

// tests/checkout.e2e.spec.ts
test.describe('Checkout flow', () => {
  test('guest user can checkout', async ({ page }) => {
    const product = await seedProduct({ name: `Product-${Date.now()}` });
    await page.goto(`/products/${product.id}`);
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Checkout as guest' }).click();
    // ... test owns all its data
  });

  test('registered user can checkout with saved address', async ({ page }) => {
    const user = await seedUser({ withSavedAddress: true });
    await loginAs(page, user);
    const product = await seedProduct({ name: `Product-${Date.now()}` });
    await page.goto(`/products/${product.id}`);
    // ... completely independent from the test above
  });
});
```

**Non-compliant:**

```typescript
// Tests depend on execution order — test 2 needs data from test 1
let orderId: string;

test('step 1: user creates an order', async ({ page }) => {
  // ...
  orderId = await page.getByTestId('order-id').textContent();
});

test('step 2: user pays for the order', async ({ page }) => {
  // Fails if test 1 didn't run first or if tests run in parallel
  await page.goto(`/orders/${orderId}/pay`);
});

test('step 3: user checks order status', async ({ page }) => {
  // Fails if test 2 didn't complete payment
  await page.goto(`/orders/${orderId}`);
  await expect(page.getByText('Paid')).toBeVisible();
});
```

---

### E2E-07: Implement Retry Strategy for Flaky Assertions

**Severity:** Warning
**Rule:** Network-dependent or animation-dependent assertions may use Playwright's built-in retry mechanisms (auto-waiting, `toPass`, `expect.poll`) — but treat persistent flakiness as a bug to diagnose and fix, not noise to suppress with retries.
**Why:** Retries mask real failures — a test that passes on the third attempt is a test that fails two-thirds of the time, indicating a race condition, timing issue, or missing wait condition that will eventually cause a production bug.

**Compliant:**

```typescript
// Playwright's built-in auto-retry for assertions (default 5s timeout)
test('dashboard loads real-time data', async ({ page }) => {
  await page.goto('/dashboard');

  // expect() auto-retries until the condition is met or timeout
  await expect(page.getByTestId('active-users')).not.toHaveText('Loading...');
  await expect(page.getByTestId('active-users')).toBeVisible();
});

// toPass() for complex assertion logic that needs retry
test('webhook delivery completes', async ({ page }) => {
  await page.getByRole('button', { name: 'Send webhook' }).click();

  await expect(async () => {
    const status = await page.getByTestId('delivery-status').textContent();
    expect(status).toBe('Delivered');
  }).toPass({ timeout: 10_000, intervals: [1_000, 2_000, 3_000] });
});

// When a test is genuinely flaky, fix the root cause
// BAD: test.describe.configure({ retries: 3 }); // hides the problem
// GOOD: investigate why the test fails intermittently
```

**Non-compliant:**

```typescript
// Global retries mask flakiness across the entire suite
// playwright.config.ts
export default defineConfig({
  retries: 5,  // every test retries 5 times — flakiness is hidden
});

// Manual retry loop instead of using Playwright's built-in mechanisms
test('data loads', async ({ page }) => {
  await page.goto('/dashboard');

  let loaded = false;
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1000);  // fixed sleep in a loop
    const text = await page.getByTestId('status').textContent();
    if (text === 'Ready') {
      loaded = true;
      break;
    }
  }
  expect(loaded).toBe(true);
});
```

---

### E2E-08: Separate E2E Tests from Other Test Suites

**Severity:** Convention
**Rule:** E2E tests must be in a dedicated directory (`test/e2e/` or `tests/e2e/`) or use a distinct file naming convention (`*.e2e.spec.ts`) — and run on a separate CI schedule or pipeline stage from unit and integration tests.
**Why:** E2E tests are 10–100x slower than unit tests and require a running application — mixing them causes slow feedback loops for developers and makes it impossible to run fast tests independently.

**Compliant:**

```typescript
// Project structure with clear separation
// ├── src/
// │   ├── components/
// │   │   └── Button.tsx
// │   └── services/
// │       └── order.service.ts
// ├── tests/
// │   ├── unit/                    ← fast, no server needed
// │   │   └── order.service.spec.ts
// │   ├── integration/             ← needs database
// │   │   └── order.api.spec.ts
// │   └── e2e/                     ← needs full app running
// │       ├── checkout.e2e.spec.ts
// │       └── helpers/
// │           └── seed.ts

// package.json scripts — each test type runs independently
// "scripts": {
//   "test:unit": "vitest run tests/unit",
//   "test:integration": "vitest run tests/integration",
//   "test:e2e": "playwright test tests/e2e",
//   "test:ci": "npm run test:unit && npm run test:integration",
//   "test:e2e:ci": "npm run test:e2e"
// }

// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.spec.ts',
  webServer: {
    command: 'npm run start:test',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

```yaml
# CI pipeline — E2E runs as a separate job, after unit/integration pass
# .github/workflows/ci.yml
# jobs:
#   unit-and-integration:
#     runs-on: ubuntu-latest
#     steps:
#       - run: npm run test:ci          ← fast, runs first
#
#   e2e:
#     needs: unit-and-integration       ← only if fast tests pass
#     runs-on: ubuntu-latest
#     steps:
#       - run: npx playwright install
#       - run: npm run test:e2e:ci      ← slow, runs separately
```

**Non-compliant:**

```typescript
// E2E tests mixed with unit tests — no separation
// src/components/Button.spec.ts          ← unit test
// src/components/Button.e2e.spec.ts      ← E2E test in same directory
// Both run with 'npm test' — developers wait 10 minutes for unit test feedback

// Or: single test command runs everything
// "scripts": {
//   "test": "jest"  ← runs unit, integration, AND E2E together
// }

// Or: E2E tests use the same config as unit tests
// vitest.config.ts handles both unit and E2E — no way to run them independently
```

## Customization

- **E2E-03 (Selector strategy)** varies by team preference. Some teams prefer `aria-label` and ARIA roles exclusively (the "testing library" philosophy — if it's not accessible, the test shouldn't find it). Others prefer `data-testid` for elements that don't have natural accessible names. Both approaches satisfy this rule; the prohibition is on CSS classes, tag hierarchies, and generated IDs. Teams should standardize on one approach and document it.

- **E2E-01 (Journey count)** depends on project scope. A typical SaaS application has 5–20 critical journeys. E-commerce platforms may have more (browse, search, cart, checkout, returns, account management). Internal tools may have fewer (login, primary workflow, admin). Teams should identify critical journeys based on business impact and user frequency, not code coverage.

- **E2E-07 (Retry count)** should be limited. Playwright's default assertion timeout (5 seconds) with auto-retry is sufficient for most cases. The `toPass()` API is appropriate for genuinely asynchronous operations (webhook delivery, background job completion). Global test retries (in `playwright.config.ts`) should be set to 0 in local development and at most 2 in CI. Any test that needs more than 2 retries has a bug — fix the test, not the retry count.
