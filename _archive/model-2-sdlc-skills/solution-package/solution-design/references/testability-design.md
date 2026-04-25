# Testing Strategy

## Purpose

Design the testing strategy at an architectural level — test types, coverage approach, and automation plan. Consumes: the existing-architecture-assessment (existing test infrastructure, test environment capabilities, mocking patterns), the system-design (new component boundaries and integration seams), and the requirements package (functional requirements for acceptance criteria that must be verifiable, nonfunctional requirements for performance and security test targets). For brownfield projects, assesses whether existing test infrastructure can accommodate the new feature or needs extension — new test environments for new integrations, contract testing between old and new components, test data strategies that account for existing production data patterns. Covers: test infrastructure changes needed, component boundaries that enable isolation testing, integration test seams (where to mock, where to test end-to-end), performance test harness requirements, test data strategy (synthetic vs. anonymized production data), test automation approach, and coverage targets per test type (unit, integration, end-to-end). Produces testing strategy that is Section 14 of the solution design package.

## What This Produces

The testing strategy for the feature at an architectural level — what types of tests are needed, where the test boundaries are, how test data is managed, and what infrastructure supports the testing. This section does not produce test cases or test code — it produces the architectural design that enables effective testing during implementation. It answers: "what do we need in place so that the feature can be tested thoroughly and efficiently?"

This is Section 14 of the solution design package. It is the last design section before assembly and consumes outputs from all prior sections:
- **System design** (Section 3) — component boundaries that define unit test isolation and integration test seams
- **Data model design** (Section 6) — entities that drive test data strategy and migration testing
- **API design** (Section 7) — endpoint contracts that drive contract testing and API integration tests
- **Backend design** (Section 5) — service layer that defines what to unit test, what to integration test
- **Frontend design** (Section 4) — component architecture that defines UI testing approach
- **Integration design** (Section 8) — external system dependencies that must be mocked or stubbed in tests
- **Security design** (Section 9) — auth flows and access control that must be tested
- **Workflow / Business Rules** (Section 10) — state machines and business rules that drive edge case testing
- **Deployment strategy** (Section 12) — CI/CD pipeline where tests run and quality gates are enforced
- **Observability design** (Section 13) — SLOs that drive performance test targets

**What this section covers vs. what other sections cover:**

| Concern | Where It Lives |
|---------|---------------|
| Individual test cases and test code | Implementation phase — not in this section |
| CI/CD pipeline stages and quality gates | Section 12 — Deployment Strategy |
| Performance monitoring in production | Section 13 — Observability Design |
| **Test types and where they apply (unit, integration, E2E, contract, performance)** | **Section 14 — This section** |
| **Test boundaries — where to mock, where to test end-to-end** | **Section 14 — This section** |
| **Test data strategy (creation, management, cleanup)** | **Section 14 — This section** |
| **Test infrastructure changes needed** | **Section 14 — This section** |
| **Coverage targets per test type** | **Section 14 — This section** |
| **Performance and load test design** | **Section 14 — This section** |
| **AI-assisted development test considerations** | **Section 14 — This section** |

## When to Use

- Always included — every feature needs a testing strategy
- Runs after `observability-design` (Step 13) and is the last design skill before solution package assembly (Step 15)
- Even simple changes need a testing section — if only to confirm "follows existing test patterns, standard unit and integration test coverage"

## Inputs

| Input | Source | Required | If discovery was skipped |
|-------|--------|----------|--------------------------|
| System design | `docs/<feature>/solutions-package/design/03-system-design.md` — component map, boundaries, communication patterns | Yes | Yes |
| Data model design | `docs/<feature>/solutions-package/design/06-data-model-design.md` — entities, relationships, migrations | If data model changes | If data model changes |
| API design | `docs/<feature>/solutions-package/design/07-api-design.md` — endpoint contracts, request/response schemas | If APIs change | If APIs change |
| Backend design | `docs/<feature>/solutions-package/design/05-backend-design.md` — service layer, repository layer, error handling | If backend changes | If backend changes |
| Frontend design | `docs/<feature>/solutions-package/design/04-frontend-design.md` — component architecture, state management | If frontend changes | If frontend changes |
| Integration design | `docs/<feature>/solutions-package/design/08-integration-design.md` — external system dependencies, communication patterns | If integrations change | If integrations change |
| Security design | `docs/<feature>/solutions-package/design/09-security-architecture.md` — auth flows, RBAC, data protection | If security changes | If security changes |
| Workflow / Business Rules | Section 10 output — state machines, business rule enforcement | If workflows/rules exist | If workflows/rules exist |
| Deployment strategy | `docs/<feature>/solutions-package/design/12-deployment-strategy.md` — CI/CD pipeline, quality gates | Yes | Yes |
| Observability design | `docs/<feature>/solutions-package/design/13-observability-design.md` — SLOs, performance targets | Yes | Yes |
| Technology stack | `docs/<feature>/solutions-package/design/02-technology-stack.md` — test frameworks (Jest, pytest, JUnit), E2E tools (Playwright, Cypress), coverage tools | Yes | Yes |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — Section 3 (Tech Stack: test framework versions if present in dependency files), Section 4 (Deployment Topology: CI/CD pipeline which may include test stages) | If discovery ran — identifies the test framework in the tech stack and CI/CD pipeline structure; specific test infrastructure details (test organization, mocking patterns, coverage config, fixture patterns) are derived from the codebase in Step 2 | Identifies patterns from codebase or user input |
| Requirements package — functional requirements & all ACs | `docs/<feature>/requirements-package/requirements-package.md` — functional requirements, business rules, data requirements, permissions, NFRs, and all associated acceptance criteria (`AC-REQ-`, `AC-BR-`, `AC-DATA-`, `AC-ACR-`, `AC-PERM-`, `AC-NFR-`) that must be verifiable through tests | Yes | Yes |
| Requirements package — NFRs | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` — performance targets, security requirements, reliability targets that must be tested | Yes | Yes |
| Access to the codebase | Local filesystem or repository — test files, test configuration, mocking patterns, test utilities, CI/CD pipeline test stages | Yes (brownfield) — the AI reads existing test infrastructure | Yes if available; otherwise user provides description |

> **Missing input guard:** If the requirements package or any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

## Did Discovery Run?

**Discovery ran** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` exists:

- Read Section 3 (Tech Stack) — check if test framework versions are captured in the dependency files (e.g., Jest, pytest, JUnit from package.json or requirements.txt). Also note E2E tools if listed (Playwright, Cypress).
- Read Section 4 (Deployment Topology) — check the CI/CD pipeline structure for existing test stages (which tests run on PR, on merge, on deploy).
- These provide architectural context (what test tools are in the tech stack and how the CI/CD pipeline is structured). Discovery does **not** capture test-specific infrastructure details — test organization (co-located vs. separate), mocking patterns, fixture strategies, coverage configuration, and test utility patterns are derived from the codebase in Step 2.

**Discovery was skipped:**

- For brownfield projects with codebase access: the AI reads test configuration files, existing test files, and CI/CD pipeline test stages directly.
- For brownfield projects without codebase access: ask the user to describe existing test infrastructure. Record as `user-stated`.
- For greenfield projects: no existing test infrastructure. Design from scratch using the technology stack.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  TESTING STRATEGY — INTERNAL SEQUENCE                            │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read all inputs                                       │
│     Read all prior design sections, technology stack,            │
│     requirements (acceptance criteria, NFRs).                    │
│     If discovery ran: read baseline Sections 3, 4.               │
├──────────────────────────────────────────────────────────────────┤
│  2. EXTRACT EXISTING — Read the codebase to extract existing     │
│     test infrastructure (Brownfield only)                        │
│     Read test configs, test files, mocking patterns, test        │
│     utilities, coverage reports, CI pipeline test stages.        │
├──────────────────────────────────────────────────────────────────┤
│  3. TEST BOUNDARIES — Define what is tested at each level        │
│     Map components to test types: unit, integration, E2E.        │
│     Define where to mock and where to test end-to-end.           │
├──────────────────────────────────────────────────────────────────┤
│  4. TEST DATA — Design test data strategy                        │
│     How test data is created, managed, isolated, and cleaned.    │
│     Synthetic vs. anonymized production data.                    │
├──────────────────────────────────────────────────────────────────┤
│  5. CONTRACT TESTS — Design contract testing approach            │
│     (if applicable)                                              │
│     API contracts between services, frontend-backend contracts.  │
├──────────────────────────────────────────────────────────────────┤
│  6. PERFORMANCE — Design performance test approach               │
│     Load testing, stress testing, soak testing harness.          │
│     Targets derived from NFRs and SLOs.                          │
├──────────────────────────────────────────────────────────────────┤
│  7. SECURITY — Design security test approach                     │
│     Auth flow testing, authorization testing, input validation.  │
├──────────────────────────────────────────────────────────────────┤
│  8. INFRASTRUCTURE — Identify test infrastructure changes        │
│     New test environments, new tools, CI/CD pipeline changes.    │
├──────────────────────────────────────────────────────────────────┤
│  9. COVERAGE — Define coverage targets and quality gates         │
│     Per test type, per component, linked to CI/CD gates.         │
├──────────────────────────────────────────────────────────────────┤
│  10. AI DEVELOPMENT — Address AI-assisted development risks      │
│      Regression patterns, sandbox parity, verification loops.    │
├──────────────────────────────────────────────────────────────────┤
│  11. VALIDATE — Check against requirements and upstream sections │
├──────────────────────────────────────────────────────────────────┤
│  12. ASSEMBLE — Write the testing strategy section               │
│      Produce the structured output. Present for review.          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Load Inputs

Read all inputs. This is the last design skill — it needs the full picture from all prior sections.

From the **requirements package**, collect ALL acceptance criteria across every artifact type — these define what the testing strategy must be able to verify:
- **FR ACs** (`AC-REQ-NNN-N`) — functional requirement acceptance criteria, including error-path ACs
- **Business rule ACs** (`AC-BR-NNN-N`) — rule enforcement criteria (one per branch, error-path for missing ELSE branches)
- **Data ACs** (`AC-DATA-NNN-N`) — data contract criteria (accepted input, rejected input, output shapes)
- **Permission ACs** (`AC-ACR-NNN-N`, `AC-PERM-NNN-N`) — authorization criteria (condition met/not met, authorized/unauthorized)
- **NFR ACs** (`AC-NFR-[CAT]-NNN-N`) — non-functional criteria (threshold verification, degraded-mode behavior)
- **NFRs** — performance targets (response time, throughput), security requirements (penetration testing, vulnerability scanning), reliability targets (error rates under load)
- **User journeys** — end-to-end flows that define E2E test scenarios

From the **system design** (Section 3), identify:
- Component boundaries — each boundary is a potential test isolation point
- Communication patterns between components — each inter-component communication is an integration test seam

From the **deployment strategy** (Section 12), note:
- CI/CD pipeline stages where tests run — the testing strategy must fit within the pipeline
- Quality gates — what must pass before deployment proceeds

From the **observability design** (Section 13), note:
- SLOs — these define the performance test targets (the system must meet these under load)

### Step 2 — Extract Existing Test Infrastructure from the Codebase (Brownfield Only)

Read test-related code to understand existing patterns.

| Pattern Area | What to Read |
|-------------|-------------|
| **Test framework config** | `jest.config.ts`, `vitest.config.ts`, `pytest.ini`, `pyproject.toml` [tool.pytest], `pom.xml` (surefire/failsafe), `playwright.config.ts` |
| **Test organization** | Directory structure — are tests co-located (`*.test.ts` next to source) or in a separate `tests/` directory? How are unit/integration/E2E tests separated? |
| **Test utilities** | Shared fixtures, test helpers, factory functions, custom matchers, mock utilities |
| **Mocking patterns** | How external dependencies are mocked — dependency injection, module mocking (`jest.mock`), test doubles, in-memory implementations |
| **Test data** | Fixtures, seed data, factory patterns (FactoryBot, Faker), database setup/teardown per test |
| **Coverage config** | Coverage thresholds in CI, coverage report format, excluded paths |
| **E2E infrastructure** | Playwright/Cypress config, Page Object Model patterns, test environment setup, browser matrix |
| **CI pipeline test stages** | Which tests run on PR, which on merge, which on deploy, test parallelization |

**Framework-specific guidance:**

| Framework | Key Files to Read |
|-----------|------------------|
| **Jest / Vitest** | `jest.config.ts` or `vitest.config.ts`, `__mocks__/` directory, `setup.ts`, `.test.ts` files for mocking patterns |
| **Playwright** | `playwright.config.ts`, `tests/e2e/` directory, page objects, fixture files |
| **pytest** | `conftest.py` (fixtures), `pytest.ini` or `pyproject.toml`, `factories.py`, marker usage |
| **JUnit / TestNG** | Test class organization, `@MockBean` / `@SpyBean` usage, `@TestConfiguration` classes, `application-test.yml` |
| **xUnit / NUnit** | Test project organization, mock framework (Moq, NSubstitute), test fixtures, `appsettings.Testing.json` |

Present the extracted patterns: **"I've read the existing test infrastructure and identified the following patterns. Please confirm these are accurate, and let me know if there are test conventions not reflected in the code (e.g., testing standards documented elsewhere, test environment setup done by a platform team)."**

For greenfield projects, skip this step.

### Step 3 — Define Test Boundaries

Map every new or modified component to the test type that covers it. This is the core of the testing strategy — it defines **where to mock** and **where to test end-to-end**.

**Step 3a — Test pyramid for the feature:**

```
        ╱╲
       ╱  ╲         E2E Tests
      ╱ E2E╲        Few, slow, high-confidence
     ╱──────╲       Critical user journeys only
    ╱        ╲
   ╱Integration╲    Integration Tests
  ╱────────────╲    Moderate count, medium speed
 ╱              ╲   Component interactions, API contracts
╱  Unit Tests    ╲   Unit Tests
╱────────────────╲   Many, fast, isolated
                     Business logic, calculations, validations
```

**Step 3b — Component-to-test-type mapping:**

| Component | Unit Tests | Integration Tests | E2E Tests | Notes |
|-----------|-----------|------------------|----------|-------|
| *(RefundService)* | *(Business logic: eligibility check, amount calculation, state transition guards)* | *(Service + repository: create refund with DB, state transitions with side effects)* | *(N/A — covered by user journey E2E)* | *(Domain logic is unit testable; DB interaction is integration)* |
| *(RefundRepository)* | *(N/A — thin data access layer, tested via integration)* | *(Query correctness: findByOrderId, findByStatus with test DB)* | *(N/A)* | *(Don't unit test ORM calls — integration test against a real test DB)* |
| *(RefundController)* | *(Request validation, input parsing)* | *(HTTP request → service → DB → response shape)* | *(N/A — covered by API integration tests)* | *(Thin controller — most logic is in service)* |
| *(Refund state machine)* | *(All state transitions: valid and invalid, guards, side effects)* | *(State transitions with persistence)* | *(Full approval workflow)* | *(State machines deserve exhaustive unit test coverage)* |
| *(Payment gateway client)* | *(Request building, response parsing, error mapping)* | *(N/A — external dependency is mocked)* | *(N/A — use sandbox in staging E2E)* | *(Unit test with mock HTTP; integration test not needed unless testing real gateway in staging)* |
| *(Refund UI — form)* | *(Component rendering, form validation, state management)* | *(N/A)* | *(Submit refund end-to-end)* | *(Unit test component logic; E2E test full user flow)* |
| *(Notification worker)* | *(Message processing logic, template rendering)* | *(Consume message from queue → process → verify side effect)* | *(N/A)* | *(Integration test verifies the queue consumption path)* |

**Step 3c — Mock boundaries:**

Define explicitly where mocks/stubs are used and where real dependencies are used:

| Dependency | In Unit Tests | In Integration Tests | In E2E Tests | Rationale |
|-----------|--------------|---------------------|-------------|-----------|
| *(Database)* | *(Mocked — repository is a mock/stub)* | *(Real — test database with migrations applied)* | *(Real — staging database)* | *(Unit tests must be fast and isolated; integration tests verify query correctness)* |
| *(Payment gateway)* | *(Mocked — HTTP client returns canned responses)* | *(Mocked — same mock, different layer)* | *(Sandbox mode — gateway's test environment)* | *(Never hit real payment gateway in automated tests; use sandbox for E2E in staging)* |
| *(Message queue)* | *(Mocked — publish returns success)* | *(Real — in-memory queue or test container)* | *(Real — staging queue)* | *(Integration tests verify message shape and consumer processing)* |
| *(Auth service)* | *(Mocked — returns a test user context)* | *(Mocked or real — depends on test scope)* | *(Real — use test user credentials)* | *(Auth is a cross-cutting concern; mock for speed, real for E2E)* |

### Step 4 — Design Test Data Strategy

**Step 4a — Test data approach per test type:**

| Test Type | Data Approach | Lifecycle | Isolation |
|----------|-------------|-----------|-----------|
| **Unit tests** | *(In-memory objects created per test; no persistence)* | *(Created in test setup, discarded on teardown)* | *(Complete — each test creates its own data)* |
| **Integration tests** | *(Test database seeded with migrations + fixture data; transactions rolled back per test)* | *(DB created per test suite run, migrations applied once, each test runs in a transaction that rolls back)* | *(Transaction rollback per test — tests don't see each other's data)* |
| **E2E tests** | *(Staging environment with seed data or API-driven setup)* | *(Seed data loaded before test suite; tests create data via API calls; cleanup after suite)* | *(Tests may share the staging environment — design tests to be idempotent and not depend on specific data state)* |

**Step 4b — Test data creation patterns:**

| Pattern | When to Use | Example |
|---------|------------|---------|
| **Factory functions** | Unit and integration tests — create entities with sensible defaults, override specific fields per test | `createRefund({ status: 'pending', amount: 150 })` |
| **Fixtures / seed data** | Integration and E2E tests — baseline data that tests assume exists | `seed/refunds.json` loaded before test suite |
| **Builder pattern** | Complex entities with many relationships | `RefundBuilder().withOrder(order).withLineItems(3).build()` |
| **API-driven setup** | E2E tests — create data via the application's own API endpoints | `POST /api/refunds` in test setup, then test the approval flow |

**Step 4c — Sensitive data handling in tests:**

| Concern | Rule |
|---------|------|
| *(Production data in test environments)* | *(Never — use synthetic data or anonymized snapshots only)* |
| *(PII in test fixtures)* | *(Use obviously fake data — "Jane Test", "test@example.com", not real names/emails)* |
| *(Financial data in test fixtures)* | *(Use round numbers that are clearly synthetic — $100.00, $250.00, not $127.43)* |
| *(API keys / secrets in test config)* | *(Use test/sandbox keys only — never production keys in any test environment)* |

### Step 5 — Design Contract Testing Approach (If Applicable)

Only include this step if the feature involves multiple services or a frontend consuming a backend API where contract drift is a risk.

**Step 5a — Contract boundaries:**

| Producer | Consumer | Contract Type | Tool | How Verified |
|----------|----------|-------------|------|-------------|
| *(Refund API — backend)* | *(Refund UI — frontend)* | *(API response shape)* | *(Pact, MSW, or schema validation)* | *(Producer publishes schema; consumer tests validate against it; CI fails on mismatch)* |
| *(Refund service)* | *(Notification service)* | *(Event payload shape)* | *(Schema registry or Pact for async)* | *(Producer publishes event schema; consumer validates incoming events against it)* |

**Step 5b — Contract testing strategy:**

| Approach | When to Use | Trade-off |
|----------|------------|-----------|
| **Consumer-driven contracts (Pact)** | Multiple consumers of the same API; consumers define what they need | Prevents producer from breaking consumers; adds Pact broker infrastructure |
| **Schema validation** | Single consumer; simpler setup | Validates response shape but doesn't prevent semantic drift |
| **Shared TypeScript types** | Monorepo; frontend and backend share a types package | Type-safe at compile time; no runtime contract verification |
| **OpenAPI spec validation** | API-first design; spec is the single source of truth | Validates against spec; spec must stay current |

### Step 6 — Design Performance Test Approach

**Step 6a — Performance test targets (derived from NFRs and SLOs):**

| Target | Source | Value | Test Type |
|--------|--------|-------|-----------|
| *(Response time — p99)* | *(NFR-02, SLO from Section 13)* | *(< 500ms under normal load)* | *(Load test)* |
| *(Throughput)* | *(NFR-04)* | *(1000 req/s sustained)* | *(Load test)* |
| *(Degradation under peak)* | *(NFR-05)* | *(p99 < 2s at 3x normal load)* | *(Stress test)* |
| *(Memory stability)* | *(NFR-06)* | *(No memory leaks over 24 hours)* | *(Soak test)* |

**Step 6b — Performance test design:**

| Test | Tool | Scenario | Duration | Expected Result |
|------|------|----------|---------|----------------|
| *(Load test — refund creation)* | *(k6, Locust, Gatling, JMeter)* | *(Simulate 100 concurrent users creating refunds)* | *(10 minutes)* | *(p99 < 500ms, error rate < 0.1%, no connection pool exhaustion)* |
| *(Stress test — peak load)* | *(Same tool)* | *(Ramp from 100 to 3000 concurrent users over 15 minutes)* | *(15 minutes)* | *(Graceful degradation — p99 < 2s, no crashes, error rate < 5%)* |
| *(Soak test — stability)* | *(Same tool)* | *(Sustained 500 concurrent users)* | *(4–24 hours)* | *(No memory growth, no connection leaks, consistent latency)* |

**Step 6c — Performance test infrastructure:**

| Need | Approach |
|------|----------|
| *(Load generation)* | *(CI/CD-integrated load test stage, or dedicated load test environment)* |
| *(Test data volume)* | *(Pre-seed database with production-representative data volume — e.g., 1M orders, 100K refunds)* |
| *(Baseline comparison)* | *(Store baseline performance numbers; fail CI if regression exceeds threshold)* |
| *(When to run)* | *(Not on every PR — run on merge to main or on a schedule; run before major releases)* |

### Step 7 — Design Security Test Approach

**Step 7a — Security test coverage:**

| Area | Test Approach | What to Verify | Source |
|------|-------------|---------------|--------|
| *(Authentication)* | *(Integration test — auth middleware)* | *(Unauthenticated requests return 401; expired tokens are rejected; invalid tokens are rejected)* | *(Section 9)* |
| *(Authorization / RBAC)* | *(Integration test — per endpoint)* | *(Each endpoint enforces the correct role; users cannot access other users' data; privilege escalation is blocked)* | *(Section 9, PAC)* |
| *(Input validation)* | *(Unit + integration test)* | *(SQL injection, XSS, oversized payloads, unexpected content types are rejected with 400/422)* | *(Section 7, Section 9)* |
| *(Data protection)* | *(Integration test)* | *(Sensitive fields are not exposed in API responses to unauthorized roles; PII is redacted in logs)* | *(Section 9)* |
| *(Dependency vulnerabilities)* | *(CI pipeline — automated scan)* | *(No known CVEs in production dependencies; critical CVEs block deployment)* | *(Section 12)* |

**Step 7b — Security test automation:**

| Test | When It Runs | Tool | CI Gate? |
|------|-------------|------|---------|
| *(Auth / RBAC integration tests)* | *(Every PR)* | *(Test framework — same as integration tests)* | *(Yes — must pass)* |
| *(Dependency vulnerability scan)* | *(Every PR + daily schedule)* | *(npm audit, safety, Snyk, Trivy)* | *(Yes — critical/high block merge)* |
| *(SAST — static analysis)* | *(Every PR)* | *(Semgrep, SonarQube, CodeQL)* | *(Yes — critical findings block merge)* |
| *(DAST — dynamic testing)* | *(Pre-release — staging environment)* | *(OWASP ZAP, Burp Suite)* | *(No — manual review of findings)* |

### Step 8 — Identify Test Infrastructure Changes

Based on the test boundaries, data strategy, contract testing, performance testing, and security testing defined above, identify what infrastructure changes are needed:

| Infrastructure Need | Current State | Change Required | Priority |
|--------------------|-------------|----------------|----------|
| *(Test database for integration tests)* | *(Exists — shared test DB)* | *(Add refunds table migration to test DB setup)* | *(Must have — integration tests depend on it)* |
| *(Payment gateway sandbox)* | *(Not configured in test environment)* | *(Configure sandbox credentials in staging CI)* | *(Must have — E2E tests need payment sandbox)* |
| *(Test containers for queue)* | *(Not currently used)* | *(Add testcontainers for SQS/RabbitMQ in integration tests)* | *(Should have — enables queue consumer integration tests locally)* |
| *(Load test environment)* | *(Does not exist)* | *(Provision a load test environment with production-representative data volume)* | *(Should have — required for NFR verification before release)* |
| *(Contract testing broker)* | *(Not currently used)* | *(Set up Pact broker or schema registry for API contract tests)* | *(Nice to have — prevents API drift between services)* |

### Step 9 — Define Coverage Targets and Quality Gates

**Step 9a — Coverage targets per test type:**

| Test Type | Coverage Target | What It Measures | Rationale |
|----------|---------------|-----------------|-----------|
| **Unit tests** | *(80% line coverage for new/modified code)* | *(Business logic, calculations, validations, state machines are tested)* | *(High coverage for logic-heavy code; don't chase 100% — test behavior, not lines)* |
| **Integration tests** | *(Every API endpoint has at least one happy-path and one error-path test)* | *(Service + DB interactions work correctly)* | *(Catches query bugs, transaction issues, data mapping errors)* |
| **E2E tests** | *(Every critical user journey from the requirements has an E2E test)* | *(The full flow works from the user's perspective)* | *(Few but high-confidence — catch integration bugs across the full stack)* |
| **Contract tests** | *(Every API contract boundary has a contract test)* | *(Producer and consumer agree on the data shape)* | *(Prevents contract drift — catches breaking changes before deployment)* |

**Step 9b — Quality gates in CI/CD:**

| Gate | Stage | Criteria | Blocks |
|------|-------|---------|--------|
| *(Lint + type check)* | *(PR — first gate)* | *(Zero lint errors, zero type errors)* | *(Merge)* |
| *(Unit tests)* | *(PR — second gate)* | *(All pass, coverage ≥ threshold for changed files)* | *(Merge)* |
| *(Integration tests)* | *(PR — third gate)* | *(All pass)* | *(Merge)* |
| *(Security scan)* | *(PR — fourth gate)* | *(No critical/high vulnerability findings)* | *(Merge)* |
| *(E2E tests)* | *(Post-merge — staging)* | *(All critical journey tests pass)* | *(Production deploy)* |
| *(Performance tests)* | *(Pre-release — scheduled)* | *(Latency and throughput within SLO targets)* | *(Release sign-off)* |

Cross-reference with the deployment strategy (Section 12) — these gates must align with the CI/CD pipeline stages defined there.

### Step 10 — Address AI-Assisted Development Test Risks

When AI agents write implementation code, specific testing patterns prevent systematic blind spots.

**Step 10a — AI regression patterns to test for:**

| Pattern | Risk | Test Strategy |
|---------|------|--------------|
| **Sandbox / production path mismatch** | AI fixes the production code path but forgets the sandbox/test path (or vice versa), so the feature works in one mode but not the other | Assert that test mode and production mode return the same response shape for the same operation |
| **SELECT clause omission** | AI adds a field to the API response but forgets to add it to the database SELECT query, so the field is always null/undefined | Define required response fields in a constant; assert all fields are present and non-undefined in integration tests |
| **Error state leakage** | AI adds error handling but forgets to clear stale data from a previous successful state | Assert that error states clear previous data |
| **Optimistic update without rollback** | AI implements an optimistic UI update but forgets to rollback on API failure | Assert that UI state reverts to previous state on API error |

**Step 10b — Verification loop for AI-generated code:**

Define the verification sequence that must pass before AI-generated code is accepted:

| Step | Check | Tool | Gate |
|------|-------|------|------|
| 1 | *(Build passes)* | *(Build tool)* | *(Hard gate — cannot proceed)* |
| 2 | *(Type check passes)* | *(TypeScript, pyright, mypy)* | *(Hard gate)* |
| 3 | *(Lint passes)* | *(ESLint, Ruff, etc.)* | *(Hard gate)* |
| 4 | *(Unit + integration tests pass)* | *(Test framework)* | *(Hard gate)* |
| 5 | *(Coverage threshold met for changed files)* | *(Coverage tool)* | *(Hard gate)* |
| 6 | *(No new security findings)* | *(SAST tool)* | *(Hard gate for critical/high)* |

**Step 10c — Regression test discipline:**

- When a bug is found in AI-generated code, write a regression test *before* fixing the bug (TDD red-green-refactor)
- Name regression tests with the bug ID: `test_refund_eligibility_BUG_42_regression`
- Regression tests accumulate over time and form a safety net against AI blind spots
- Focus testing effort on areas where bugs have been found, not on 100% coverage of everything

### Step 11 — Validate

Check the completed testing strategy against:

- **Requirements — all AC types** — does every acceptance criterion across all artifact types have a corresponding test in the test boundary map (Step 3)? This includes FR ACs (`AC-REQ-`), business rule ACs (`AC-BR-`), data ACs (`AC-DATA-`), permission ACs (`AC-ACR-`, `AC-PERM-`), NFR ACs (`AC-NFR-`), and error-path ACs from any artifact type.
- **NFRs** — does every performance and security NFR have a corresponding test approach (Steps 6 and 7)? Do degraded-mode ACs for performance/reliability/availability NFRs have corresponding stress/failure tests?
- **System design** — does every component boundary from Section 3 have a test type assigned?
- **API design** — does every API endpoint from Section 7 have integration test coverage planned?
- **Backend design** — are the mock boundaries consistent with the dependency injection approach from Section 5?
- **Deployment strategy** — are the quality gates consistent with the CI/CD pipeline stages from Section 12?
- **Observability** — are the performance test targets consistent with the SLOs from Section 13?
- **State machines** — if Section 10 defines state machines, are all valid and invalid transitions covered in unit tests?
- **Security** — if Section 9 defines RBAC, is every endpoint's access control tested?
- **Traceability** — does every test type and coverage target trace to a requirement?

### Step 12 — Assemble

Combine all sections into the testing strategy output. This becomes Section 14 of the solution design package.

### File Output

Write the completed section to `docs/<feature>/solutions-package/design/14-testability-design.md` using the template at `../assets/testability-design-doc.md` as the output structure.

If this section was determined to be not applicable in the design workflow's Step 0, write a stub file containing: **"Not applicable — [rationale from scoping step]."**

---

## Output Structure

### For Brownfield Projects

**1. Existing Test Infrastructure** — current test frameworks, organization, mocking patterns, coverage levels, CI pipeline test stages (from Step 2)

**2. Test Boundaries** — component-to-test-type mapping, test pyramid for the feature, mock boundaries (from Step 3)

**3. Test Data Strategy** — data approach per test type, creation patterns, sensitive data handling (from Step 4)

**4. Contract Testing** — contract boundaries, testing approach, tooling (from Step 5, if applicable)

**5. Performance Testing** — targets, test scenarios, infrastructure, when to run (from Step 6)

**6. Security Testing** — coverage areas, automation approach, CI integration (from Step 7)

**7. Test Infrastructure Changes** — what needs to be added or modified to support the testing strategy (from Step 8)

**8. Coverage Targets and Quality Gates** — targets per test type, CI/CD gates, gate criteria (from Step 9)

**9. AI Development Test Considerations** — regression patterns, verification loop, regression test discipline (from Step 10)

**10. Requirements Traceability** — every test type and coverage target traces to the requirement that drives it

### For Greenfield Projects

Same structure, omitting Section 1 (Existing Test Infrastructure).

---

## Requirements Traceability

Every test type, coverage target, and quality gate must trace to the requirement it verifies.

| Design Element | Type | Requirement / AC ID | Requirement Summary |
|---------------|------|---------------------|---------------------|
| *(Unit tests — refund eligibility logic)* | *(test boundary)* | *(AC-BR-015-1, AC-BR-015-2)* | *(Refund accepted at 30-day boundary, rejected at day 31)* |
| *(Integration test — create refund endpoint)* | *(test boundary)* | *(AC-REQ-001-1, AC-REQ-001-2)* | *(Refund created for eligible order; rejected for ineligible — error-path AC)* |
| *(Unit test — refund input validation)* | *(test boundary)* | *(AC-DATA-007-1, AC-DATA-007-2)* | *(Valid input accepted; missing orderId rejected)* |
| *(Integration test — refund authorization)* | *(test boundary)* | *(AC-PERM-004-1, AC-PERM-004-2)* | *(Customer requests own refund; cannot access another user's refund)* |
| *(E2E test — refund approval journey)* | *(test boundary)* | *(FR-05, UJ-03)* | *(Refund manager approval flow end-to-end)* |
| *(Load test — p99 ≤ 500ms)* | *(performance test)* | *(AC-NFR-PER-001-1)* | *(p99 response time at or below 500ms under 200 concurrent users)* |
| *(Stress test — degraded-mode behavior)* | *(performance test)* | *(AC-NFR-PER-001-2)* | *(System returns 503 with retry-after header when gateway latency exceeds threshold — degraded-mode AC)* |
| *(Auth/RBAC integration tests)* | *(security test)* | *(AC-ACR-003-1, AC-ACR-003-2)* | *(Separation of duties enforced; elevated approval for high-value)* |
| *(80% unit test coverage)* | *(coverage target)* | *(NFR-07)* | *(Code quality — maintainable, testable codebase)* |

If a test design element cannot be traced to a requirement, it must be flagged and confirmed with the user before inclusion.

---

## Hand-off Gate

Before proceeding to solution package assembly (Step 15), you must:

1. Write the completed testing strategy in full.
2. Present it to the user for review with the following questions:
   - **Test boundaries:** Are the test types assigned to each component correct? Are the mock boundaries appropriate?
   - **Test data:** Is the test data strategy workable? Is the isolation approach correct for your test environments?
   - **Contracts:** If contract testing is included, are the contract boundaries right? Is the tooling appropriate?
   - **Performance:** Are the performance test targets achievable? Is the test infrastructure available?
   - **Security:** Is the security test coverage sufficient? Are the CI gates appropriate?
   - **Infrastructure:** Are the test infrastructure changes realistic? Are there missing infrastructure needs?
   - **Coverage:** Are the coverage targets appropriate? Are the quality gates aligned with your CI/CD pipeline?
   - **AI considerations:** Are the AI regression patterns relevant to your development process?
   - **Traceability:** Is every test design element connected to a requirement?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the testing strategy is accurate.

## Completion Criteria

- [ ] For brownfield: existing test infrastructure is extracted from the codebase (test configs, test files, mocking patterns, CI pipeline test stages) and confirmed by the user
- [ ] Every new or modified component has a test type assigned (unit, integration, E2E, or combination)
- [ ] Mock boundaries are explicitly defined — for each dependency, it is clear when to mock and when to use the real thing
- [ ] Test data strategy is defined per test type: creation patterns, lifecycle, isolation, cleanup
- [ ] Sensitive data rules for test data are defined — no production data, no real PII, no production secrets
- [ ] If multiple services or frontend-backend boundaries exist: contract testing approach is defined
- [ ] If NFRs include performance targets: load test, stress test, and optionally soak test scenarios are designed with tools, duration, and expected results
- [ ] Performance test targets are consistent with SLOs from Section 13
- [ ] Security test coverage includes authentication, authorization/RBAC, input validation, and dependency scanning
- [ ] Security test automation is integrated into CI/CD with appropriate gates
- [ ] Test infrastructure changes are identified with priority (must have / should have / nice to have)
- [ ] Coverage targets are defined per test type — unit coverage percentage, integration per-endpoint coverage, E2E per-journey coverage
- [ ] Quality gates are defined and consistent with CI/CD pipeline stages from Section 12
- [ ] AI-assisted development risks are addressed with specific test patterns
- [ ] Every acceptance criterion across all artifact types has a corresponding test in the test boundary map — FR ACs (`AC-REQ-`), business rule ACs (`AC-BR-`), data ACs (`AC-DATA-`), permission ACs (`AC-ACR-`, `AC-PERM-`), NFR ACs (`AC-NFR-`), and error-path ACs
- [ ] Every performance and security NFR has a corresponding test approach, including degraded-mode ACs for performance/reliability/availability NFRs
- [ ] State machine transitions (if Section 10 exists) have exhaustive unit test coverage planned
- [ ] Requirements traceability is complete
- [ ] The user has explicitly confirmed the testing strategy is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Tests are an afterthought — the architecture makes components untestable because dependencies are tightly coupled | Step 3 defines mock boundaries before implementation; the architecture is designed for testability with explicit isolation points |
| Integration tests hit production databases or real payment gateways, causing data corruption or charges | Step 3c defines mock boundaries per dependency; Step 4c defines sensitive data rules; real external services are only used in sandbox/staging environments |
| Test data is created by hand for each test, is fragile, and breaks when the schema changes | Step 4 defines test data patterns (factories, builders, fixtures) that adapt to schema changes |
| Performance NFRs exist in the requirements but are never tested — the system fails under load in production | Step 6 designs performance tests with targets derived from NFRs and SLOs; Step 9 makes performance testing a quality gate |
| The CI pipeline runs tests but there are no coverage thresholds — untested code ships freely | Step 9 defines coverage targets per test type and quality gates that block deployment if thresholds are not met |
| A contract between frontend and backend breaks silently — the backend changes a response field, the frontend crashes | Step 5 defines contract testing at API boundaries; contract tests fail in CI when producer or consumer changes break the contract |
| Security testing is a manual, pre-release activity — vulnerabilities are found late and delay releases | Step 7 integrates security tests (auth, RBAC, input validation, dependency scanning, SAST) into the CI pipeline on every PR |
| AI agents write code that passes the tests they also wrote, but the tests don't cover the actual failure mode | Step 10 addresses AI-specific blind spots — sandbox/production parity testing, required field assertions, regression test discipline |
| No one knows where integration test seams are — some component interactions are tested end-to-end (slow) when a mock would suffice, and vice versa | Step 3 explicitly maps every component to its test type and defines where mocks are used vs. where real dependencies are needed |
| Tests pass locally but fail in CI because the test environment is different (different DB version, missing services) | Step 8 identifies test infrastructure changes needed; CI/CD alignment (Step 9b) ensures quality gates match the pipeline |
| All tests run on every PR, including slow performance and E2E tests, making the CI pipeline take 45 minutes | Step 9b defines which tests run at which stage — unit and integration on PR, E2E on staging, performance pre-release |
| A bug is fixed but the same bug category reappears in a different part of the codebase because there's no regression test | Step 10c requires regression tests for every bug found, named with the bug ID, forming a growing safety net |
| State machine transitions are partially tested — happy paths work, but an invalid transition causes a crash in production | Step 11 validates that if Section 10 defines state machines, all valid and invalid transitions have unit test coverage planned |
