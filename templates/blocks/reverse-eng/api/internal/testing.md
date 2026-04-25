---
slug: testing
title: "Testing"
applies-to: [re-api-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 320
---

## 22. Testing

This section documents the testing harness: which kinds of tests exist, where they live, how they're run, what fixtures/factories are used, and how external dependencies (DB, broker, third-party APIs) are stubbed or replaced. The downstream AI must pick the right test category for new code (unit vs integration vs contract) and follow the existing harness conventions rather than inventing parallel patterns. Extract from the source: the test runner (jest, vitest, pytest, xUnit, Go test), the test directory layout (colocated vs `tests/` mirror), fixture/factory locations, and the pattern for spinning up an in-memory or containerized DB.

To verify, run one test from each layer locally if possible, or at minimum read its setup/teardown and trace what real vs fake dependencies it uses. Confirm the documented coverage targets against the CI configuration — README claims of "90% coverage" are frequently aspirational. Identify whether contract tests (Pact, OpenAPI conformance) exist and how they tie back to the OpenAPI spec referenced in Section 3.

Common confusions: tests labeled "integration" sometimes only mock the DB (so they're really unit tests with extra steps), and tests labeled "unit" sometimes hit a real DB. Use the *actual* dependency surface to categorize, not the directory name. Snapshot tests are easy to over-trust — note explicitly which snapshots are gold-standard vs auto-regenerated.

Hallucination risks: do not assume Testcontainers are used unless the code imports them; do not assume `@nestjs/testing` patterns when the codebase is plain Express; do not invent fixture libraries that don't appear in package.json.

### Suggested template content

#### 22.1 Test Pyramid

| Layer | Runner | Location | Approx Count | Coverage Target |
|-------|--------|----------|--------------|-----------------|
| Unit | {{jest}} | {{co-located *.spec.ts}} | {{~800}} | {{80%}} |
| Integration | {{jest}} | `{{test/integration/}}` | {{~150}} | {{key flows}} |
| Contract | {{Pact / Dredd}} | `{{test/contract/}}` | {{~30}} | {{all public endpoints}} |
| End-to-end | {{Playwright / k6}} | `{{test/e2e/}}` | {{~20}} | {{smoke only}} |

#### 22.2 Running Tests

```bash
# All unit tests
{{e.g., pnpm test}}

# Single file
{{e.g., pnpm test src/users/users.service.spec.ts}}

# Integration suite (spins up Postgres + Redis containers)
{{e.g., pnpm test:integration}}

# With coverage
{{e.g., pnpm test --coverage}}
```

#### 22.3 Unit Test Skeleton

```{{language}}
// Canonical unit test: ARRANGE / ACT / ASSERT, with constructor-injected mocks
{{example}}
```

#### 22.4 Integration Test Skeleton

```{{language}}
// Canonical integration test: real DB (Testcontainers), seeded fixtures, transaction rollback per test
{{example}}
```

#### 22.5 Fixtures and Factories

- **Factory library:** {{e.g., fishery, factory_bot, AutoFixture}}
- **Factory location:** `{{test/factories/}}`
- **Seed data:** `{{test/seeds/}}`

```{{language}}
// Factory usage example
{{example: const user = userFactory.build({ role: 'admin' })}}
```

#### 22.6 Mocking External Services

| Dependency | Strategy |
|------------|----------|
| Database | {{Testcontainers Postgres OR in-memory sqlite}} |
| Cache | {{ioredis-mock OR Testcontainers Redis}} |
| HTTP downstream | {{nock / msw / WireMock}} |
| Message broker | {{in-memory adapter / Testcontainers}} |
| Time | {{@sinonjs/fake-timers}} |
| Auth | {{seam at middleware: inject test principal}} |

#### 22.7 What MUST be Tested

- Every new endpoint: {{1 happy path + 1 auth-failure + 1 validation-failure}}
- Every domain rule: {{unit test on the rule itself}}
- Every error mapping (Section 10): {{exception → HTTP status}}

#### 22.8 What MUST NOT Be in Tests

- {{e.g., real third-party API calls (use recorded fixtures)}}
- {{e.g., shared mutable state across test files}}
- {{e.g., `sleep()` for race conditions — use deterministic synchronization}}
