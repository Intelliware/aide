# Contract Testing Standards

## Purpose

These standards establish consistent practices for verifying that services honor their API contracts — the agreed-upon request/response shapes, status codes, and behavioral guarantees between consumers and providers. Contract testing catches integration-breaking changes before they reach production by encoding expectations as executable tests, run on both sides of the boundary. Without contract tests, teams discover breaking changes only at deployment time (or worse, in production), leading to cascading failures across services.

## Applicability

These standards apply to all TypeScript/JavaScript services that communicate over HTTP, gRPC, or message queues — including backend microservices, BFF (Backend-for-Frontend) layers, API gateways, and any service that consumes or provides an API. They apply to both internal service-to-service communication and public-facing APIs. Teams using monolithic architectures with well-defined module boundaries can adopt these standards at the module level.

## Rules

### CT-01: Use Consumer-Driven Contracts

**Severity:** Error
**Rule:** The consumer must define the contract — specifying the fields, types, and status codes it depends on — and the provider must verify against those consumer-defined expectations.
**Why:** Consumer-driven contracts ensure providers never break the consumers that depend on them, because the contract reflects actual usage rather than the provider's assumptions about what matters.

**Compliant:**

```typescript
// Consumer side: defines what it expects from the Orders API
import { PactV4, MatchersV3 } from '@pact-foundation/pact';

const provider = new PactV4({
  consumer: 'CheckoutService',
  provider: 'OrdersAPI',
});

describe('Orders API contract', () => {
  it('returns order details for a valid order ID', async () => {
    await provider
      .addInteraction()
      .given('order 123 exists')
      .uponReceiving('a request for order 123')
      .withRequest('GET', '/orders/123')
      .willRespondWith(200, (builder) => {
        builder.jsonBody({
          id: MatchersV3.string('123'),
          status: MatchersV3.string('confirmed'),
          total: MatchersV3.decimal(49.99),
          items: MatchersV3.eachLike({
            productId: MatchersV3.string('prod-001'),
            quantity: MatchersV3.integer(2),
          }),
        });
      })
      .executeTest(async (mockServer) => {
        const client = new OrdersClient(mockServer.url);
        const order = await client.getOrder('123');

        expect(order.id).toBe('123');
        expect(order.status).toBe('confirmed');
        expect(order.items.length).toBeGreaterThan(0);
      });
  });
});
```

**Non-compliant:**

```typescript
// Provider defines the contract unilaterally — consumers have no say
// Provider team writes: "Here's our API spec, conform to it"
// Consumer discovers the 'total' field was renamed to 'amount' only after deployment

describe('Orders API', () => {
  it('returns order', async () => {
    const res = await request(app).get('/orders/123');
    expect(res.status).toBe(200);
    // Provider tests only check that the provider works, not that consumers are satisfied
    expect(res.body).toHaveProperty('amount'); // was 'total' — consumer is now broken
  });
});
```

---

### CT-02: Verify Contracts on Both Sides

**Severity:** Error
**Rule:** Consumer tests must verify the client handles the expected response correctly, and provider tests must verify the API produces responses that satisfy all consumer contracts — both sides must pass independently.
**Why:** A consumer test alone proves the client can handle a mocked response; a provider test alone proves the API produces some output — only both together prove the integration actually works.

**Compliant:**

```typescript
// Consumer side: verifies the client handles the expected response
// (see CT-01 for the full consumer Pact test)

// Provider side: verifies the API satisfies all consumer contracts
import { Verifier } from '@pact-foundation/pact';

describe('OrdersAPI provider verification', () => {
  it('satisfies all consumer contracts', async () => {
    const verifier = new Verifier({
      providerBaseUrl: 'http://localhost:3000',
      pactBrokerUrl: process.env.PACT_BROKER_URL,
      provider: 'OrdersAPI',
      providerVersion: process.env.GIT_SHA,
      publishVerificationResult: true,
      stateHandlers: {
        'order 123 exists': async () => {
          await seedDatabase({
            orders: [{ id: '123', status: 'confirmed', total: 49.99 }],
          });
        },
      },
    });

    await verifier.verifyProvider();
  });
});
```

**Non-compliant:**

```typescript
// Only the consumer has tests — provider never verifies
// Consumer Pact test generates a contract file, but no one checks it
// against the real provider

// Or: only the provider has tests — consumer side is untested
describe('OrdersAPI', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/orders/123');
    expect(res.status).toBe(200);
    // No Pact verification — consumer contracts are ignored
  });
});
```

---

### CT-03: Validate API Schemas in CI

**Severity:** Error
**Rule:** Use automated schema validation (OpenAPI, JSON Schema) in CI to detect drift between the API specification and the actual implementation — schema mismatches are contract violations.
**Why:** API documentation that diverges from the implementation creates false confidence — consumers code against the spec, but the runtime behavior is different.

**Compliant:**

```typescript
// openapi-validator.spec.ts — runs in CI on every PR
import SwaggerParser from '@apidevtools/swagger-parser';
import { createApp } from '../src/app';
import request from 'supertest';
import { OpenApiValidator } from 'express-openapi-validator';

describe('API schema validation', () => {
  it('OpenAPI spec is valid and parseable', async () => {
    const api = await SwaggerParser.validate('./openapi.yaml');
    expect(api.openapi).toMatch(/^3\./);
  });

  it('actual responses match the OpenAPI spec', async () => {
    const app = createApp();

    // Middleware validates every response against the spec
    app.use(
      OpenApiValidator.middleware({
        apiSpec: './openapi.yaml',
        validateRequests: true,
        validateResponses: true,
      }),
    );

    const res = await request(app).get('/orders/123');
    // If the response doesn't match the spec, the validator throws
    expect(res.status).toBe(200);
  });
});
```

```yaml
# CI pipeline step (e.g., GitHub Actions)
# .github/workflows/ci.yml
- name: Validate OpenAPI spec
  run: |
    npx @stoplight/spectral-cli lint openapi.yaml --ruleset .spectral.yaml
    npx swagger-cli validate openapi.yaml
```

**Non-compliant:**

```typescript
// OpenAPI spec exists but is never validated — it's a stale document
// No CI step checks it, no tests verify responses against it

// The spec says 'total' is a number, but the implementation returns a string
// No one notices until a consumer parses it and gets NaN
{
  "id": "123",
  "total": "49.99"  // spec says number, implementation returns string
}
```

---

### CT-04: Detect Breaking Changes Before Deployment

**Severity:** Error
**Rule:** Contract tests must detect breaking changes — field removal, type changes, addition of new required fields, status code changes — and block deployment when a consumer contract is violated.
**Why:** A single breaking change in a provider can cascade across every consumer that depends on the changed field, causing production outages that are difficult to diagnose and expensive to roll back.

**Compliant:**

```typescript
// Pact Broker's can-i-deploy check — runs before deployment
// Blocks release if any consumer contract would break

// In CI pipeline:
// npx pact-broker can-i-deploy \
//   --pacticipant OrdersAPI \
//   --version $GIT_SHA \
//   --to-environment production

// Breaking change detection in the provider test
describe('OrdersAPI backward compatibility', () => {
  it('still includes deprecated fields during migration period', async () => {
    const res = await request(app).get('/orders/123');

    // 'total' is being renamed to 'amount', but 'total' must remain
    // until all consumers have migrated
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('amount');
    expect(res.body.total).toBe(res.body.amount);
  });
});

// Consumer test catches the breaking change early
// If the provider removes 'total', the consumer Pact test fails
// because the consumer's contract still expects 'total'
```

**Non-compliant:**

```typescript
// Provider removes a field without checking consumer contracts
interface OrderResponseV2 {
  id: string;
  amount: number; // renamed from 'total' — no migration period
  // 'total' field deleted — every consumer parsing 'total' is now broken
}

// No can-i-deploy check — breaking change goes straight to production
// Deploy script:
// npm run build && npm run deploy  ← no contract verification step
```

---

### CT-05: Version Contracts Explicitly

**Severity:** Warning
**Rule:** When a contract changes intentionally, version it explicitly — consumers upgrade to the new contract version on their own timeline, and old versions remain supported until all consumers have migrated.
**Why:** Silently changing a contract is indistinguishable from a bug; explicit versioning makes contract evolution intentional, traceable, and safe for consumers who can't upgrade immediately.

**Compliant:**

```typescript
// Consumer specifies which contract version it depends on
const provider = new PactV4({
  consumer: 'CheckoutService',
  provider: 'OrdersAPI',
  // Consumer version tracks which commit generated this contract
});

// Provider supports multiple versions simultaneously
import { Router } from 'express';

const v1Router = Router();
const v2Router = Router();

v1Router.get('/orders/:id', async (req, res) => {
  const order = await orderService.getOrder(req.params.id);
  res.json({
    id: order.id,
    total: order.total,       // v1 field name
    status: order.status,
  });
});

v2Router.get('/orders/:id', async (req, res) => {
  const order = await orderService.getOrder(req.params.id);
  res.json({
    id: order.id,
    amount: order.total,      // v2 renamed field
    currency: order.currency, // v2 new field
    status: order.status,
  });
});

app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);
```

**Non-compliant:**

```typescript
// Contract changes silently — no version bump, no migration path
app.get('/orders/:id', async (req, res) => {
  const order = await orderService.getOrder(req.params.id);
  res.json({
    id: order.id,
    amount: order.total,  // was 'total' last week — changed without versioning
    status: order.status,
  });
});

// Consumers have no way to know the contract changed
// No version in the URL, headers, or Pact contract metadata
// Consumer code still reads 'total' and gets undefined
```

---

### CT-06: Run Contract Tests in the CI Pipeline

**Severity:** Error
**Rule:** Contract verification must run on every pull request — not just before releases — and a broken contract must block merging.
**Why:** Contract tests that only run before releases catch breaking changes too late; the offending commit is buried under days of other changes and is expensive to revert.

**Compliant:**

```typescript
// Contract tests in the test suite — run alongside unit tests
// package.json
// "scripts": {
//   "test": "jest",
//   "test:contract": "jest --testPathPattern=contract",
//   "test:ci": "npm run test && npm run test:contract"
// }

// CI configuration — contract tests are a required check
// .github/workflows/ci.yml
// jobs:
//   contract-tests:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v4
//       - run: npm ci
//       - run: npm run test:contract
//       - name: Publish contracts to Pact Broker
//         run: npx pact-broker publish ./pacts
//           --consumer-app-version=${{ github.sha }}
//           --branch=${{ github.ref_name }}
//       - name: Can I deploy?
//         run: npx pact-broker can-i-deploy
//           --pacticipant MyService
//           --version=${{ github.sha }}
//           --to-environment=production

// jest.config.ts — contract tests are included in CI but can run independently
const config = {
  projects: [
    { displayName: 'unit', testMatch: ['**/*.spec.ts'] },
    { displayName: 'contract', testMatch: ['**/*.contract.ts'] },
  ],
};
```

**Non-compliant:**

```typescript
// Contract tests exist but only run manually
// Developer runs them locally "when they remember"
// CI pipeline:
// jobs:
//   test:
//     steps:
//       - run: npm run test:unit    ← only unit tests
//       - run: npm run build
//       - run: npm run deploy       ← no contract verification

// Or: contract tests run but failures don't block merging
// GitHub branch protection does not require the contract-tests job
// A broken contract merges, and the provider deploys with the break
```

## Customization

- **CT-01 (Consumer-driven contracts)** is the default for cross-team APIs where consumers must be protected. Some teams use provider-driven contracts for internal APIs within a single team's ownership boundary, where the provider team controls both sides. Provider-driven contracts are simpler but offer weaker guarantees — they verify the provider works, not that specific consumers are satisfied. Teams adopting provider-driven contracts should document this decision and ensure the provider team actively coordinates with internal consumers on changes.

- **CT-03 (Schema validation tools)** vary by ecosystem. Spectral is the most full-featured OpenAPI linter with custom ruleset support. `swagger-cli validate` is a lightweight alternative for basic structural validation. `openapi-generator` can validate specs as a side effect of code generation. Teams should choose based on their existing toolchain — the rule requires automated validation, not a specific tool.

- **CT-05 (Versioning strategy)** depends on API architecture. URL path versioning (`/api/v1/`, `/api/v2/`) is the most explicit and cacheable. Header versioning (`Accept: application/vnd.myapi.v2+json`) keeps URLs clean but is harder to test manually. Query parameter versioning (`?version=2`) is occasionally used but is generally discouraged. Teams should standardize on one approach and document the deprecation timeline for old versions.
