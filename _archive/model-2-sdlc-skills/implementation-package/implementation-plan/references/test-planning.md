# Test Planning

## Purpose

Comprehensive test planning for a new feature, covering four concerns in a single skill: (1) existing test analysis — analyze the current test suite's coverage levels, patterns and conventions, infrastructure (fixtures, factories, mocks, helpers), runner configuration, and known flaky or skipped tests to ensure new tests integrate cleanly; (2) test strategy — define the implementation-level test approach including coverage targets, mocking strategy, test data approach, integration test boundaries, and test structure conventions for consistent expectations across all implementation plan tasks; (3) regression test planning — map affected code paths to existing tests, flag gaps where existing coverage is insufficient, define new regression tests for the boundary between old and new code, and specify smoke test suites for pre/post-deployment validation; (4) existing test modification planning — identify existing tests that will break due to intentional behavioral changes (modified API contracts, changed business rules, updated UI flows, altered data formats), determine whether each affected test needs updated assertions, updated fixtures, updated setup/teardown, or full replacement, and produce a test modification plan grouped by test file that becomes a task block in the implementation plan sequenced alongside the code changes that cause the breakage. Prevents the common brownfield failure mode where new code and new tests are created but existing tests that now fail are ignored, forcing unplanned rework when the test suite breaks mid-implementation.

## What This Produces

A concrete, code-level test plan for the feature — what the existing test suite looks like in the affected areas, what the test strategy is for new code, which existing tests will break and how to fix them, and where regression coverage gaps exist. This is not an architectural testing strategy (that was done in the solution package's testability design). This is the developer's plan for what happens to actual test files during implementation.

The test plan feeds directly into the implementation plan:
- The **test strategy** becomes the testing conventions that every implementation task follows
- The **test modification plan** becomes task blocks in the implementation plan, sequenced alongside the code changes that cause the breakage
- The **regression plan** identifies new tests that must be added at the boundary between old and new code

## When to Use

- Step 2 of implementation planning — runs after `codebase-analysis` and before `prerequisites-planning`
- Consumes the codebase analysis output (which includes test structure from its Step 6)
- Consumes the architect's testability design (Section 14 of the solution package) as the architectural test strategy to implement against

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Codebase analysis | `docs/<feature>/implementation-package/plan/codebase-analysis.md`, specifically Section 5 (Test Structure) which documents test infrastructure, conventions, and affected tests | Yes |
| Solution design — testability design | `docs/<feature>/solutions-package/design/14-testability-design.md` — test boundaries, mock boundaries, test data strategy, coverage targets, quality gates | Yes — this is the architectural strategy; test planning translates it to code-level actions |
| Solution design — system design | `docs/<feature>/solutions-package/design/03-system-design.md` — component boundaries (define integration test seams) | Yes |
| Solution design — API design | `docs/<feature>/solutions-package/design/07-api-design.md` — endpoint contracts (define API test expectations) | If APIs change |
| Solution design — backend design | `docs/<feature>/solutions-package/design/05-backend-design.md` — service layer, error handling (define unit test expectations) | If backend changes |
| Solution design — frontend design | `docs/<feature>/solutions-package/design/04-frontend-design.md` — component architecture (define UI test expectations) | If frontend changes |
| Solution design — workflow / business rules | `docs/<feature>/solutions-package/design/10-workflow-business-rules.md` — state machines, business rules (define edge case tests) | If workflows/rules exist |
| Requirements package | `docs/<feature>/requirements-package/requirements-package.md` — functional requirements with acceptance criteria, business rules, NFRs | Yes — test plan must trace to requirements |
| Coding standards — testing | `../assets/standards/common/testing/` — unit testing, integration testing, contract testing, mocking strategy, test data management standards | Yes — the organizational gold standard for how tests should be written; discovered patterns are compared against these |
| Coding standards — language/framework | `../assets/standards/languages/{lang}/` and `frameworks/{framework}/` — language/framework-specific testing conventions | Yes — if the language or framework has specific testing standards |
| Access to the codebase | Local filesystem — actual test files, test configuration, test utilities | Yes — the AI reads actual test code |

> **Missing input guard:** If the solution package cannot be found at `docs/<feature>/solutions-package/solution-package.md`, do not proceed. Ask the user to provide the location of the solution design package before beginning test planning.

## How This Differs from the Solution Package's Testability Design

The architect's **testability design** (Section 14) answers: *"What types of tests do we need, where are the test boundaries, and what infrastructure supports testing?"* It is architectural — test pyramid, mock boundary decisions, coverage targets, performance test harness design.

Test **planning** answers: *"What do we actually do to the test files during implementation?"* It is code-level — which test files exist, which will break, what needs updating, what new tests need to be written, and in what order relative to the code changes.

| Testability Design (Architect) | Test Planning (Developer) |
|-------------------------------|--------------------------|
| "Unit tests cover RefundService business logic" | "`refund.service.spec.ts` — 4 new test cases needed: eligibility check, amount calculation, status transition, error path" |
| "Mock the payment gateway in integration tests" | "`__mocks__/payment-gateway.ts` already exists and returns `{ status: 'success' }` — extend it to also return `{ status: 'refund_processed' }`" |
| "80% unit test coverage for new code" | "Current coverage in `src/modules/orders/` is 72% — 3 untested methods in `OrderService` need tests before adding refund logic" |
| "Contract testing between frontend and backend" | "Frontend tests in `refund-form.test.tsx` assert response shape `{ id, status, amount }` — when backend adds `refund_eligible` to the response, the snapshot test will break" |

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  TEST PLANNING — INTERNAL SEQUENCE                                │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read all inputs                                       │
│     Read codebase analysis (test structure section),             │
│     testability design (test boundaries, coverage targets),      │
│     solution design sections, requirements package.              │
├──────────────────────────────────────────────────────────────────┤
│  2. DEEP DIVE — Read existing test files in affected areas       │
│     Go beyond the codebase analysis summary: read actual test    │
│     files, understand what each test asserts, identify           │
│     infrastructure (helpers, fixtures, factories, mocks),        │
│     note flaky/skipped tests, measure current coverage.          │
│     2e. Compare existing test practices against the applicable   │
│     testing standards. Flag deviations.                          │
├──────────────────────────────────────────────────────────────────┤
│  3. TEST STRATEGY — Define implementation-level test approach    │
│     Translate the architect's test boundaries into concrete      │
│     patterns: where test files go, how tests are named,          │
│     how mocks are structured, how test data is created,          │
│     what each implementation task's test expectations are.        │
│     New tests follow the testing standard, not deviating         │
│     codebase patterns.                                           │
├──────────────────────────────────────────────────────────────────┤
│  4. REGRESSION PLAN — Map affected code paths to existing        │
│     tests and identify gaps                                      │
│     For each code path the feature modifies, determine:          │
│     is there an existing test? Is the existing test sufficient?  │
│     Where are the gaps at the boundary between old and new?      │
├──────────────────────────────────────────────────────────────────┤
│  5. TEST MODIFICATION PLAN — Identify tests that will break      │
│     and plan the modifications                                   │
│     For each existing test affected by intentional behavioral    │
│     changes, determine what needs updating: assertions,          │
│     fixtures, setup/teardown, or full replacement.               │
│     Group by test file. Sequence with code changes.              │
├──────────────────────────────────────────────────────────────────┤
│  6. SMOKE TESTS — Define pre/post-deployment smoke suites        │
│     Identify the minimal set of tests that verify the system     │
│     is functional after deployment.                              │
├──────────────────────────────────────────────────────────────────┤
│  7. VALIDATE — Check coverage and completeness                   │
│     Every AC (all types) has a test. Every affected test         │
│     has a modification plan. No untraceable test work.           │
├──────────────────────────────────────────────────────────────────┤
│  8. ASSEMBLE — Write the test plan document                      │
│     Produce the structured output. Present for review.           │
└──────────────────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Load Inputs

Read all inputs. If the codebase analysis is not yet complete, stop — this skill depends on it.

From the **codebase analysis** (Section 5 — Test Structure), note:
- Test framework, file location convention, naming convention, mocking approach
- Tests already identified as affected by the proposed change
- Test infrastructure: fixtures, factories, helpers, custom matchers

From the **testability design** (Section 14), note:
- Test boundaries — which components get unit tests, integration tests, E2E tests
- Mock boundaries — where mocks are used vs. real dependencies
- Coverage targets per test type
- Quality gates in CI/CD
- Test data strategy (factories, fixtures, seed data)

From the **requirements package**, collect ALL acceptance criteria across every artifact type — these define what tests must verify:
- **FR ACs** (`AC-REQ-NNN-N`) — functional requirement acceptance criteria, including error-path ACs
- **Business rule ACs** (`AC-BR-NNN-N`) — rule enforcement criteria (one per branch, error-path for missing ELSE branches)
- **Data ACs** (`AC-DATA-NNN-N`) — data contract criteria (accepted input, rejected input, output shapes, entity creation/rejection)
- **Permission ACs** (`AC-ACR-NNN-N`, `AC-PERM-NNN-N`) — authorization criteria (condition met/not met, authorized/unauthorized, horizontal boundaries)
- **NFR ACs** (`AC-NFR-[CAT]-NNN-N`) — non-functional criteria (threshold verification, degraded-mode behavior for performance/reliability/availability)
- **Error-path ACs** — any AC from any artifact type that describes system behavior on failure

From the **coding standards — testing** (`../assets/standards/common/testing/`), read the applicable files:
- `unit-testing.md` — unit test structure, naming, assertion style, isolation requirements
- `integration-testing.md` — integration test scope, database handling, external service mocking
- `contract-testing.md` — contract test approach (if APIs change)
- `mocking-strategy.md` — mock boundaries, what to mock vs. use real, mock library conventions
- `test-data-management.md` — factory vs. fixture, test data isolation, cleanup
- **Only read standards for test types relevant to this feature.**

From the **coding standards — language/framework**, read the applicable testing sections:
- Language-specific testing conventions (e.g., `languages/typescript/standards.md` testing section)
- Framework-specific testing conventions (e.g., `frameworks/react/standards.md` testing section)

These standards are the **gold standard** for how tests should be written. Discovered test patterns will be compared against them in Step 2, and the test strategy for new code (Step 3) will follow the standard when the codebase deviates.

### Step 2 — Deep Dive into Existing Test Files

The codebase analysis documented test structure at a summary level. This step goes deeper — reading actual test files to understand what is currently tested, how, and where the gaps are.

**Step 2a — Read test files in affected areas.**

For each module in the affected area, read every test file. For each test file, document:

| Test File | Tests | What Each Test Asserts | Coverage Level | Issues |
|-----------|-------|----------------------|---------------|--------|
| *(order.service.spec.ts)* | *(5 tests)* | *(createOrder: happy path, validation error; getOrder: found, not found; cancelOrder: happy path)* | *(3 of 5 public methods tested)* | *(Missing: updateOrder, getOrdersByStatus)* |
| *(order.controller.spec.ts)* | *(3 tests)* | *(POST /orders: 201 response shape; GET /orders/:id: 200 response, 404 not found)* | *(All endpoints tested)* | *(No auth test — no test for 401/403)* |

**Step 2b — Document test infrastructure.**

| Infrastructure | Location | What It Provides |
|---------------|----------|-----------------|
| *(Test factories)* | *(test/factories/order.factory.ts)* | *(`createTestOrder(overrides)` — returns an Order entity with sensible defaults)* |
| *(Mock repository)* | *(test/__mocks__/order.repository.ts)* | *(In-memory implementation of OrderRepository with find, save, delete)* |
| *(Test database setup)* | *(test/setup.ts)* | *(Creates in-memory SQLite database, runs migrations, provides `getTestDataSource()`)* |
| *(Custom matchers)* | *(test/matchers/api-response.ts)* | *(`toMatchApiResponse(expected)` — validates response envelope shape)* |
| *(Shared fixtures)* | *(test/fixtures/orders.json)* | *(Seed data for integration tests — 3 orders with various statuses)* |

**Step 2c — Identify known issues in the existing test suite.**

| Issue | Location | Type | Impact |
|-------|----------|------|--------|
| *(Flaky test)* | *(order.service.spec.ts:45 — "handles concurrent updates")* | *(Timing-dependent — fails intermittently in CI)* | *(Low — skip in CI, runs locally)* |
| *(Skipped test)* | *(order.controller.spec.ts:80 — "handles large payloads")* | *(Marked `it.skip` — reason not documented)* | *(Unknown — investigate before modifying)* |
| *(Missing coverage)* | *(OrderService.updateOrder)* | *(No test exists)* | *(Medium — method will be modified for refund eligibility)* |

**Step 2d — Current coverage snapshot.**

| Module | Line Coverage | Branch Coverage | Notes |
|--------|-------------|----------------|-------|
| *(src/modules/orders/)* | *(72%)* | *(58%)* | *(Gap: updateOrder, getOrdersByStatus untested)* |
| *(src/modules/notifications/)* | *(85%)* | *(79%)* | *(Good coverage — event handler well tested)* |

**Step 2e — Compare existing test practices against testing standards.**

After analyzing the existing test files, compare the discovered testing patterns against the applicable testing standards (loaded in Step 1). This comparison determines where new tests can follow the existing codebase pattern (because it's compliant) vs. where new tests must follow the standard (because the codebase deviates).

| Testing Aspect | Codebase Practice | Standard Requires | Standard Reference | Compliant? | Impact on New Tests |
|---|---|---|---|---|---|
| *(Test data)* | *(Inline data — each test creates its own objects with literal values)* | *(Use factory functions with sensible defaults; override only what the test cares about)* | *(`../assets/standards/common/testing/test-data-management.md`)* | **No** | *(New tests use factories. Create factory functions for new entities.)* |
| *(Mocking)* | *(jest.mock at module level — entire modules mocked)* | *(Mock at the narrowest boundary; prefer dependency injection of test doubles over module-level mocking)* | *(`../assets/standards/common/testing/mocking-strategy.md`)* | **No** | *(New tests inject test doubles via DI rather than using jest.mock. Note: new tests will look different from existing tests.)* |
| *(Test naming)* | *("it('should create order')" — uses "should" prefix)* | *(Describe behavior without "should": "creates order with valid data")* | *(`../assets/standards/common/testing/unit-testing.md`)* | **No** | *(New tests drop "should" prefix per standard.)* |
| *(Assertion style)* | *(Uses expect().toEqual() with deep equality)* | *(Same — deep equality for objects, strict equality for primitives)* | *(`../assets/standards/common/testing/unit-testing.md`)* | **Yes** | *(Follow codebase pattern — it matches the standard.)* |
| *(Test isolation)* | *(beforeEach resets database state)* | *(Each test is independent; use beforeEach for setup, afterEach for cleanup)* | *(`../assets/standards/common/testing/unit-testing.md`)* | **Yes** | *(Follow codebase pattern — it matches the standard.)* |

For each **non-compliant** entry:
1. Note that **new tests must follow the standard**, not the existing codebase pattern.
2. Flag the deviation so the reviewer is aware that new tests will look different from existing tests in this aspect.
3. The deviation in existing tests is informational — it is not this skill's job to fix existing tests, but the divergence should be noted for awareness.

For each **compliant** entry:
1. The codebase pattern is a proven implementation of the standard. New tests follow the codebase pattern — it's both standards-compliant and consistent.

Present the findings: **"I've read the existing test files in the affected areas. Here's what's currently tested, what's missing, and what issues exist. I've also compared the existing test practices against the organization's testing standards — some practices deviate from the standard, and new tests will follow the standard in those areas. Please confirm this matches your understanding, and let me know if there are testing conventions not reflected in the code."**

### Step 3 — Define Implementation-Level Test Strategy

Translate the architect's testability design into concrete patterns the implementation plan will follow. Every implementation task that involves writing or modifying code will reference this strategy for its testing expectations.

**Standards-first principle:** When defining the test strategy for new code, the testing standards are the authority. If existing test patterns in the codebase deviate from the testing standards (as identified in Step 2e), **new tests follow the standard, not the deviating codebase pattern.** New tests are the opportunity to raise the bar. Where new tests will look different from existing tests because the standard differs from the codebase pattern, this is noted so the reviewer understands the intentional difference.

**Step 3a — Test file conventions for new code.**

| Convention | Pattern | Example |
|-----------|---------|---------|
| **Unit test location** | *(Follow existing: co-located / separate directory)* | *(src/modules/orders/refund.service.spec.ts)* |
| **Integration test location** | *(Follow existing pattern)* | *(test/integration/refund.integration.spec.ts)* |
| **E2E test location** | *(Follow existing pattern)* | *(test/e2e/refund-workflow.e2e.spec.ts)* |
| **Test file naming** | *(Match existing: .spec.ts / .test.ts / _test.go / test_.py)* | *(refund.service.spec.ts)* |
| **Test organization** | *(Match existing: describe/it nesting, suite-per-class)* | *(`describe('RefundService', () => { describe('create', () => { ... }) })`)* |
| **Test naming** | *(Describe behavior, not method: "rejects refund when order is not delivered")* | *(`it('rejects refund when order status is not delivered', ...)`)* |

**Step 3b — Mocking strategy for new code.**

The mocking approach for new tests is determined by the **mocking strategy standard** (`../assets/standards/common/testing/mocking-strategy.md`). If the codebase uses a different mocking approach (identified in Step 2e), new tests follow the standard. For each dependency the new code will have, define how it is mocked in tests:

| Dependency | Unit Test Mock | Integration Test Mock | How to Create |
|-----------|---------------|---------------------|---------------|
| *(OrderRepository)* | *(jest.mock or manual mock — return canned data)* | *(Real — test database)* | *(Extend existing `test/__mocks__/order.repository.ts` or use `jest.spyOn`)* |
| *(PaymentGateway)* | *(Manual mock — HTTP client returns canned responses)* | *(Same mock)* | *(Create `test/__mocks__/payment-gateway.ts` following existing mock pattern)* |
| *(NotificationService)* | *(jest.fn() spy — verify called with correct args)* | *(jest.fn() spy — same)* | *(Inject mock via DI; assert call arguments)* |

**Step 3c — Test data approach for new code.**

The test data approach for new tests is determined by the **test data management standard** (`../assets/standards/common/testing/test-data-management.md`). If the codebase uses a different approach (identified in Step 2e), new tests follow the standard.

| Data Need | Approach | Pattern to Follow |
|----------|----------|-------------------|
| *(Refund entity for unit tests)* | *(Factory function)* | *(Create `test/factories/refund.factory.ts` following `order.factory.ts` pattern)* |
| *(Order with refund eligibility for integration tests)* | *(Extend existing fixture)* | *(Add `refund_eligible: true` to `test/fixtures/orders.json` — order ID 3)* |
| *(Full refund workflow data for E2E)* | *(API-driven setup in beforeAll)* | *(Create order via API, then test refund flow)* |

**Step 3d — Coverage targets for new code.**

Adopt the targets from the testability design (Section 14) and translate to specific expectations:

| Scope | Target | How Measured | Gate |
|-------|--------|-------------|------|
| *(New service methods)* | *(80% line coverage minimum)* | *(jest --coverage on changed files)* | *(PR blocks if below)* |
| *(New API endpoints)* | *(Every endpoint has at least one happy-path and one error-path integration test)* | *(Test count per endpoint)* | *(Review gate)* |
| *(State machine transitions)* | *(100% of valid and invalid transitions tested)* | *(Test count matches transition count)* | *(PR blocks if missing)* |
| *(Modified methods)* | *(Coverage must not decrease)* | *(Diff coverage via CI tool)* | *(PR blocks if decreased)* |

**Step 3e — TDD expectations.**

State the TDD discipline expected during implementation:

- **New features:** Write failing test first, watch it fail, write minimal code, watch it pass, refactor. Every implementation task in the plan must include the test step before the code step.
- **Bug fixes:** Write a regression test that reproduces the bug before fixing it. Name it with the bug reference.
- **Modified code:** Run existing tests first, confirm they pass, then make the change, then update tests.

### Step 4 — Regression Test Planning

Map every code path the feature modifies to its existing test coverage, and identify gaps at the boundary between old and new code.

**Step 4a — Code path to test mapping.**

For each code path being modified or that new code integrates with:

| Code Path | Existing Test | Coverage Level | Gap? | Action |
|-----------|-------------|---------------|------|--------|
| *(OrderService.createOrder — adding refund_eligible field)* | *(order.service.spec.ts:12 — tests happy path)* | *(Happy path only)* | *(Yes — no test for refund_eligible default value)* | *(Add test: "sets refund_eligible to true for delivered orders")* |
| *(OrderController.getOrder — response now includes refund_eligible)* | *(order.controller.spec.ts:25 — tests 200 response shape)* | *(Response shape tested)* | *(Yes — assertion doesn't include refund_eligible)* | *(Update assertion in existing test — see Test Modification Plan)* |
| *(OrderEntity — new column refund_eligible)* | *(No test)* | *(None)* | *(Yes — entity is untested)* | *(Add migration test: column exists, default value correct)* |
| *(NotificationService.send — existing, unmodified)* | *(notification.service.spec.ts:10 — tests send with order data)* | *(Full)* | *(No)* | *(No action — existing coverage is sufficient)* |

**Step 4b — Boundary regression tests.**

At the boundary between old and new code, new regression tests are needed to verify the integration works:

| Boundary | New Regression Test | What It Verifies | Priority |
|----------|-------------------|-----------------|----------|
| *(RefundService → OrderService)* | *("RefundService reads order eligibility correctly")* | *(RefundService calls OrderService.findById and correctly interprets refund_eligible flag)* | *(High — core feature dependency)* |
| *(RefundController → existing auth guard)* | *("Refund endpoints enforce authentication")* | *(Unauthenticated request to POST /refunds returns 401)* | *(High — security boundary)* |
| *(Refund event → NotificationService)* | *("Refund creation triggers notification with correct payload")* | *(NotificationService.send is called with refund ID and status)* | *(Medium — side effect verification)* |

**Step 4c — Gap summary.**

| Gap Category | Count | Priority | Action |
|-------------|-------|----------|--------|
| *(Existing code paths with no tests being modified)* | *(2)* | *(High — must add tests before modifying)* | *(Add tests in a pre-change task block)* |
| *(New boundary tests needed)* | *(3)* | *(High — core integration)* | *(Add as part of integration test tasks)* |
| *(Existing tests with insufficient coverage)* | *(1)* | *(Medium — error path not tested)* | *(Extend existing test)* |

### Step 5 — Test Modification Plan

This is the critical step that prevents the brownfield failure mode. For every existing test that will break due to intentional behavioral changes, plan the modification.

**Step 5a — Identify breaking changes and their test impact.**

For each intentional behavioral change in the solution design, identify which existing tests will break:

| Behavioral Change | Source | Affected Tests | How They Break |
|------------------|--------|---------------|---------------|
| *(Order response now includes refund_eligible field)* | *(API design — modified GET /orders/:id response)* | *(order.controller.spec.ts:25, order.e2e.spec.ts:40)* | *(Response shape assertions fail — missing new field)* |
| *(OrderService.createOrder now sets refund_eligible)* | *(Backend design — modified service method)* | *(order.service.spec.ts:12)* | *(Test creates order without refund_eligible — assertion on returned object misses the field)* |
| *(New required field in CreateOrderDto)* | *(API design — modified request schema)* | *(order.controller.spec.ts:10)* | *(Test sends request without refund_eligible — validation rejects it)* |
| *(Notification template includes refund status)* | *(Backend design — modified notification payload)* | *(notification.service.spec.ts:30)* | *(Snapshot test fails — notification content changed)* |

**Step 5b — Modification plan per test file.**

Group modifications by test file so they can become task blocks in the implementation plan:

**Test file: `order.service.spec.ts`**

| Test | Line | Change Type | What to Modify | Sequenced With |
|------|------|------------|---------------|---------------|
| *("creates order with valid data")* | *(12)* | *(Update assertion)* | *(Add `expect(result.refund_eligible).toBe(true)` to the assertion block)* | *(The task that adds refund_eligible to OrderEntity)* |
| *("validates order data")* | *(30)* | *(No change)* | *(Validation logic unchanged — test still passes)* | *(N/A)* |

**Test file: `order.controller.spec.ts`**

| Test | Line | Change Type | What to Modify | Sequenced With |
|------|------|------------|---------------|---------------|
| *("POST /orders creates order")* | *(10)* | *(Update fixture)* | *(Add `refund_eligible: true` to the request body; update response assertion to include the field)* | *(The task that adds refund_eligible to CreateOrderDto)* |
| *("GET /orders/:id returns order")* | *(25)* | *(Update assertion)* | *(Add `refund_eligible` to the expected response shape)* | *(The task that modifies the GET endpoint response)* |

**Test file: `notification.service.spec.ts`**

| Test | Line | Change Type | What to Modify | Sequenced With |
|------|------|------------|---------------|---------------|
| *("sends notification with order data")* | *(30)* | *(Update snapshot)* | *(Update snapshot to include refund status in notification template)* | *(The task that modifies notification template)* |

**Step 5c — Sequencing rule.**

Every test modification must be sequenced with the code change that causes the breakage:

- **Same task:** If the code change and the test are in the same module and file, modify both in the same task.
- **Paired task:** If the code change is in a different file from the test, create a paired task immediately after the code change task that updates the tests.
- **Never after:** Test modifications must never be deferred to a later phase. If a code change breaks a test, the test fix is in the same or immediately next task.

### Step 6 — Smoke Test Definition

Define the minimal set of tests that verify the system is functional after deployment. These are the tests run as a quick health check, not the full suite.

**Pre-deployment smoke tests** (run before cutting over to new code):

| Smoke Test | What It Verifies | Run Time |
|-----------|-----------------|---------|
| *(Health check endpoint)* | *(Application starts, database connected, dependencies reachable)* | *(< 5s)* |
| *(Auth flow)* | *(Login succeeds, token is valid, /api/me returns user)* | *(< 10s)* |
| *(Core CRUD — orders)* | *(Create, read, update existing order — existing functionality works)* | *(< 15s)* |

**Post-deployment smoke tests** (run after deploying new code):

| Smoke Test | What It Verifies | Run Time |
|-----------|-----------------|---------|
| *(All pre-deployment smoke tests)* | *(Existing functionality still works)* | *(< 30s)* |
| *(Create refund — happy path)* | *(New feature works end-to-end)* | *(< 15s)* |
| *(Refund notification)* | *(Side effects work — notification sent)* | *(< 10s)* |

### Step 7 — Validate

Check the test plan against:

- **Requirements traceability** — does every acceptance criterion across all artifact types (FR ACs, business rule ACs, data ACs, permission ACs, NFR ACs, and error-path ACs) have a corresponding test in the regression plan (Step 4) or the test strategy (Step 3)?
- **Test modification completeness** — does every existing test identified as affected (in codebase analysis Step 6 and this skill's Step 5) have a modification plan?
- **Sequencing** — is every test modification sequenced with the code change that causes it?
- **Coverage gaps** — are all gaps identified in Step 4 addressed with new tests?
- **Consistency with testability design** — do the test conventions in Step 3 align with the architect's test boundaries and coverage targets from Section 14?
- **No unknowns** — are there any test files where the AI could not determine the impact? Flag them as `[NEEDS CLARIFICATION]`.

### Step 8 — Assemble

Combine all sections into the test plan document. This becomes the second artifact of the implementation planning phase.

### File Output

Write the completed test plan to `docs/<feature>/implementation-package/plan/test-plan.md`.

---

## Output Structure

**1. Existing Test Analysis** — deep dive into test files in affected areas: what each test asserts, test infrastructure, known issues, current coverage (from Step 2)

**1a. Testing Standards Compliance** — comparison of existing test practices against applicable testing standards, with compliant/non-compliant determination and impact on new tests (from Step 2e)

**2. Test Strategy** — implementation-level test conventions: file locations, naming, mocking patterns, test data factories, coverage targets, TDD expectations. New tests follow the testing standard where the codebase deviates (from Step 3)

**3. Regression Test Plan** — code path to test mapping, boundary regression tests, gap summary (from Step 4)

**4. Test Modification Plan** — breaking changes mapped to affected tests, grouped by test file, modification type and details, sequencing with code changes (from Step 5)

**5. Smoke Tests** — pre-deployment and post-deployment smoke test suites (from Step 6)

**6. Requirements Traceability** — every acceptance criterion mapped to the test(s) that verify it

---

## Requirements Traceability

Every acceptance criterion from the requirements package — across all artifact types — must map to at least one test:

| AC ID | Type | Acceptance Criterion | Test Type | Test Location | Status |
|-------|------|---------------------|-----------|-------------|--------|
| *AC-REQ-001-1* | FR AC | *(User can submit a refund request — happy path)* | *(Integration test)* | *(refund.integration.spec.ts — "POST /refunds creates refund")* | *(New test)* |
| *AC-REQ-001-2* | FR AC (error-path) | *(Refund rejected for ineligible order — 422 with reason)* | *(Integration test)* | *(refund.integration.spec.ts — "POST /refunds rejects ineligible order")* | *(New test)* |
| *AC-BR-015-1* | BR AC | *(Refund accepted at 30-day boundary)* | *(Unit test)* | *(refund.service.spec.ts — "accepts refund at day 30 boundary")* | *(New test)* |
| *AC-BR-015-2* | BR AC | *(Refund rejected at day 31)* | *(Unit test)* | *(refund.service.spec.ts — "rejects refund at day 31")* | *(New test)* |
| *AC-DATA-007-1* | Data AC | *(Refund input accepted with valid fields)* | *(Unit test)* | *(create-refund.dto.spec.ts — "validates valid refund input")* | *(New test)* |
| *AC-DATA-007-2* | Data AC | *(Refund input rejected with missing orderId)* | *(Unit test)* | *(create-refund.dto.spec.ts — "rejects input missing orderId")* | *(New test)* |
| *AC-PERM-004-1* | Perm AC | *(Customer can request own refund)* | *(Integration test)* | *(refund.integration.spec.ts — "authorized customer creates refund")* | *(New test)* |
| *AC-PERM-004-2* | Perm AC | *(Customer cannot request another user's refund)* | *(Integration test)* | *(refund.integration.spec.ts — "rejects cross-user refund request")* | *(New test)* |
| *AC-NFR-PER-001-1* | NFR AC | *(p99 response time ≤ 500ms under 200 concurrent users)* | *(Performance test)* | *(refund.perf.spec.ts — "refund endpoint meets latency target")* | *(New test)* |
| *AC-NFR-PER-001-2* | NFR AC (degraded-mode) | *(System returns 503 with retry-after header when gateway latency exceeds 2s)* | *(Integration test)* | *(refund.integration.spec.ts — "returns 503 when gateway degraded")* | *(New test)* |

If an acceptance criterion of any type has no corresponding test, it must be flagged and confirmed with the user.

---

## Hand-off Gate

Before proceeding to `prerequisites-planning`, you must:

1. Write the completed test plan in full.
2. Present it to the user for review with the following questions:
   - **Existing tests:** Does the analysis of existing tests match your understanding? Are there test conventions or infrastructure I missed?
   - **Test strategy:** Are the test file conventions, mocking patterns, and test data approaches correct for this project? Where new tests will differ from existing tests because the standard requires a different approach, is this acceptable?
   - **Standards compliance:** Are the deviations between existing test practices and testing standards accurately identified? Are there any deviations the team considers intentional?
   - **Regression plan:** Are the identified coverage gaps real? Are there code paths I missed?
   - **Test modifications:** For each existing test that will break, is the modification plan correct? Are there tests I missed that will also break?
   - **Sequencing:** Is the sequencing of test modifications with code changes correct? Should any test modifications be in a different order?
   - **Smoke tests:** Are the smoke test suites sufficient for deployment verification?
   - **Coverage targets:** Are the coverage targets realistic for this project?
   - **Traceability:** Does every acceptance criterion across all artifact types (FR, business rule, data, permission, NFR, and error-path ACs) have a corresponding test?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the test plan is accurate.

## Completion Criteria

- [ ] Every test file in the affected areas has been read and its assertions documented
- [ ] Test infrastructure (factories, mocks, helpers, fixtures) is documented with locations and usage patterns
- [ ] Known issues in the test suite (flaky tests, skipped tests, missing coverage) are documented
- [ ] Current coverage levels per module in the affected area are documented
- [ ] Existing test practices have been compared against applicable testing standards; deviations are flagged with impact on new tests
- [ ] Implementation-level test conventions are defined: file locations, naming, organization, mocking patterns, test data approach — following the testing standard where the codebase deviates
- [ ] Where new test conventions differ from existing codebase patterns due to standards compliance, the differences are explicitly noted for reviewer awareness
- [ ] TDD expectations are stated: test-first for new code, regression test for bug fixes, existing tests pass before and after modifications
- [ ] Every code path being modified has been mapped to its existing test coverage
- [ ] Coverage gaps at the boundary between old and new code are identified with new regression tests planned
- [ ] Every existing test that will break due to intentional behavioral changes is identified
- [ ] Each affected test has a modification plan: what changes (assertions, fixtures, setup/teardown, or full replacement)
- [ ] Test modifications are grouped by test file for implementation plan task blocks
- [ ] Every test modification is sequenced with the code change that causes it — never deferred to a later phase
- [ ] Smoke test suites are defined for pre-deployment and post-deployment verification
- [ ] Every acceptance criterion from the requirements maps to at least one test — this includes all AC types: FR ACs (`AC-REQ-`), business rule ACs (`AC-BR-`), data ACs (`AC-DATA-`), permission ACs (`AC-ACR-`, `AC-PERM-`), NFR ACs (`AC-NFR-`), and error-path ACs from any artifact type
- [ ] No `[NEEDS CLARIFICATION]` markers remain unresolved
- [ ] The user has explicitly confirmed the test plan is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| New code is implemented and new tests are written, but existing tests that now fail are ignored — discovered at the end when "all tests" are run | Step 5 identifies every existing test that will break and produces a modification plan sequenced alongside the code changes |
| Implementation plan has tasks like "write tests" at the end, after all code is written — tests are an afterthought | Step 3e establishes TDD expectations: test-first for new code, test modification paired with code change. The test modification plan (Step 5) produces task blocks for the implementation plan |
| Test modifications are deferred to a "test cleanup phase" after feature code is complete — test suite is broken for the entire feature branch | Step 5c establishes the sequencing rule: every test modification is in the same or immediately next task as the code change that causes it |
| New tests use different patterns from existing tests — different mocking approach, different fixture pattern, different naming convention — without explanation | Step 3 defines test conventions derived from the testing standards and, where compliant, the existing codebase. Where new tests intentionally differ from existing patterns to follow the standard, the difference is documented with the reason |
| Regression tests are not written for the boundary between old and new code — existing code breaks in subtle ways | Step 4b explicitly identifies boundary regression tests that verify the integration between new and existing code |
| A code path is modified but has no existing test coverage — the modification introduces a bug that is never caught | Step 4a maps every modified code path to its existing coverage; gaps are identified and new tests are planned before the code change |
| Coverage targets are defined but not measured — no one knows whether they were achieved | Step 3d defines concrete coverage targets with measurement approach and CI gates |
| Test data is created ad hoc per test — different tests use inconsistent data, tests are fragile | Step 3c defines test data factories and fixture patterns to follow, derived from the test data management standard and, where compliant, existing patterns |
| New tests perpetuate a testing anti-pattern from the codebase (e.g., module-level mocking, inline data, untested error paths) because the AI copied the existing approach | Step 2e compares existing test practices against testing standards. Non-compliant patterns are flagged, and Step 3 establishes the standard as the authority for new test code |
| No one notices that new tests follow different conventions from existing tests — review confusion | The standards compliance comparison (Step 2e) and the test strategy (Step 3) explicitly document where and why new tests differ from existing ones, giving the reviewer clear context |
| Acceptance criteria exist in the requirements but no test verifies them — the feature "works" but doesn't satisfy the requirement | The requirements traceability table maps every acceptance criterion to at least one test; unmapped criteria are flagged |
| Flaky or skipped tests in the affected area cause confusion during implementation — it's unclear whether a failure is new or pre-existing | Step 2c documents known flaky and skipped tests so the implementation knows what to expect |
| AI agents run tests but don't know what "green" looks like — they accept test output that includes known failures | Step 2c and Step 6 establish the baseline: what currently passes, what is known flaky, and what the smoke test expectations are |
