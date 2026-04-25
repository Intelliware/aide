---
slug: testing-harness
title: "Testing Harness"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 240
---

## 14. Testing Harness

Document the framework-provided testing tools: in-process request client, fixture builders, mocking support, and the test-mode toggles. Maintainers and plugin authors need a fast, deterministic way to run an integration test against a real instance of the framework without binding to a port. Verify by running the harness's own self-tests; the harness is the framework's tightest contract with itself.

Distinguish three test layers: unit (compose middleware in isolation), integration (run a full request through an in-process app), and E2E (real network listener). Cover what each layer provides, what it mocks, and which is recommended for each use case.

### Suggested template content

**Test client:**

```{{lang}}
import { createTestApp } from "{{testing-pkg}}";

const app = createTestApp({ plugins: [...] });
const res = await app.inject({
  method: "POST",
  url: "/v1/orders",
  headers: { authorization: "Bearer fake" },
  payload: { sku: "abc" }
});
expect(res.status).toBe(201);
expect(res.json()).toEqual({ id: expect.any(String), sku: "abc" });
```

- `inject()` runs the full pipeline in-process — no port binding, no socket — but with the same middleware/handler/encoder chain as production.
- Synchronous-fast: a test exercising the whole pipeline runs in single-digit milliseconds.

**Source files:**

- Test client: `{{path}}`
- Fixture builders: `{{path}}`
- Mock auth: `{{path}}`
- Mock DB: `{{path}}`

**Layers:**

| Layer | Tool | Mocks | Use when |
|---|---|---|---|
| Unit | `compose([mw1, mw2])` | Everything outside the middleware | Testing one middleware's logic |
| Integration | `createTestApp().inject()` | Outbound network, optionally DB | Verifying end-to-end behavior of a route |
| E2E | `createServer().listen()` + real client | Nothing | Smoke tests, network-layer behavior |

**Mock auth:**

- `withFakeAuth(principal)` → installs a plugin that bypasses real strategies and returns the given principal.
- Per-request override via `inject({ principal })`.

**Mock DB:**

- In-memory adapter: `{{adapter-name}}`.
- Migrations applied on `createTestApp()`.
- Snapshot / restore helpers for per-test isolation.

**Fixture builders:**

```{{lang}}
const order = orderFixture({ sku: "abc" });           // typed, defaults filled in
const orders = orderFixture.many(5, { status: "open" });
```

- All fixtures live in `{{fixtures-path}}`.
- Type-checked against domain models.

**Time, randomness, IDs:**

- Test mode auto-installs deterministic clock and ID generators.
- `fakeTime.advance(ms)` to control time.
- `fakeIds.next()` returns predictable IDs.

**Plugin testing:**

- Plugin authors write tests against `createTestApp({ plugins: [myPlugin] })`.
- The harness exposes `plugin.events` for assertion.
- Plugins MUST not require the real network or filesystem for unit tests.

**Concurrency and isolation:**

- Each test gets a fresh app instance by default.
- Snapshot/restore for the in-memory DB makes fixture setup cheap.
- AsyncLocalStorage state is reset between `inject()` calls.

**CI integration:**

- The framework's own test suite runs in {{ci-platform}}.
- Coverage thresholds: {{thresholds}}.
- Flake budget: zero — flaky tests must be fixed or quarantined immediately.

**Common pitfalls:**

- Sharing app instances across tests → leaked state via singletons.
- Asserting on `Date.now()` or `Math.random()` in tests without using the deterministic helpers.
- Importing the test client from production code (it's in a separate package by design).
- Forgetting to dispose the test app — leaks DB connections in long-running suites.

**Cross-references:**

- See plugin-extension-system block for plugin lifecycle.
- See cli-and-scaffolding block for `framework new test` generators.
