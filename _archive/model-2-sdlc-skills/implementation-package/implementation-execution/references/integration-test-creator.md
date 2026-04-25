# Integration Test Creator

## Purpose

Generate integration tests for service boundaries — database layers, API clients, message queues, and cross-module interactions.

## What This Does

Produces integration tests that verify behavior across component boundaries — where two or more real components interact. Unlike unit tests (which isolate logic and mock dependencies), integration tests exercise real infrastructure: databases, HTTP APIs, message queues, caches, and file systems.

This skill determines *which boundaries* to test, sets up real or realistic test infrastructure, and generates tests that catch the failures that only emerge at integration points: schema mismatches, query errors, serialization bugs, network behavior, and transaction semantics.

## When to Use

- When the implementation plan's test plan calls for integration-level coverage
- After feature phases that introduce database operations, API calls, or cross-service communication
- For cross-phase integration test phases (tests that span multiple previously implemented phases)
- When the codebase analysis identifies integration points that need verification

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Integration boundary | The specific boundary to test (e.g., service + database, service + external API) | Yes |
| Phase specification | The implementation plan phase(s) being tested | Yes |
| Integration testing standards | `../assets/standards/common/testing/integration-testing.md` | Yes |
| Mocking strategy standards | `../assets/standards/common/testing/mocking-strategy.md` | Yes |
| Contract testing standards | `../assets/standards/common/testing/contract-testing.md` | If API boundaries |
| Framework testing standards | `../assets/standards/frameworks/{framework}/testing.md` | Yes |
| Testing stack versions | From codebase analysis (Section 0 + Section 5) — exact test framework, assertion library, mocking library, and infrastructure tool versions (Testcontainers, supertest, etc.) | Yes |
| Existing test files | The codebase's current integration test patterns | Yes |
| Project context | `project-context.md` — test infrastructure, naming | Yes |

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  INTEGRATION TEST CREATOR — SEQUENCE                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. IDENTIFY — Map the integration boundaries                    │
│     What real components interact? Where does data cross layers? │
│                                                                  │
│  2. INFRASTRUCTURE — Determine test environment setup            │
│     Testcontainers, in-memory DB, test server, sandbox API       │
│                                                                  │
│  3. SCENARIOS — Define what to test at each boundary             │
│     CRUD operations, constraint enforcement, error responses,    │
│     transaction boundaries, serialization round-trips            │
│                                                                  │
│  4. GENERATE — Write the tests                                   │
│     Real components, isolated data, deterministic, cleanup       │
│                                                                  │
│  5. VALIDATE — Check integration test quality                    │
│     Actually tests integration, not a slow unit test             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Identify Integration Boundaries

Map the real component interactions this test suite must cover:

| Boundary Type | Components | What Fails Here |
|--------------|-----------|-----------------|
| **Service → Database** | Repository/DAO + real database | Query syntax errors, schema mismatches, constraint violations, migration gaps |
| **Service → External API** | HTTP client + real/sandbox API | Serialization errors, auth failures, timeout handling, error response parsing |
| **Service → Message Queue** | Producer/consumer + real broker | Message format mismatches, delivery guarantees, dead letter handling |
| **Service → Cache** | Cache client + real cache | Key collisions, TTL behavior, serialization, eviction handling |
| **Service → File System** | File I/O operations + real filesystem | Permission errors, path handling, concurrent access |
| **Cross-module** | Module A + Module B (no mocks between them) | Contract mismatches, type conversion errors, unexpected null propagation |

**Rule:** If both components in the boundary are within the same codebase and can be unit-tested with mocks, this is not an integration test — it is a unit test. Integration tests exist because the boundary behavior cannot be verified without the real component.

### Step 2 — Determine Test Infrastructure

For each boundary, determine how to set up the real dependency:

| Dependency | Test Infrastructure | Setup Pattern |
|-----------|-------------------|---------------|
| **PostgreSQL/MySQL** | Testcontainers or Docker Compose | Start container in `beforeAll`, run migrations, stop in `afterAll` |
| **MongoDB** | Testcontainers or mongodb-memory-server | Start in-memory or container instance |
| **Redis** | Testcontainers or `ioredis` in test mode | Start container or use embedded redis |
| **HTTP API** | WireMock, MSW, Nock, or sandbox environment | Record/replay or manual stub configuration |
| **Message Queue (Kafka/RabbitMQ)** | Testcontainers | Start broker container, create test topics/queues |
| **SMTP** | MailHog or ethereal.email | Capture emails without sending |
| **S3/Cloud Storage** | LocalStack or MinIO | Start local S3-compatible server |

**Match the project's existing infrastructure and versions:** If the codebase uses Testcontainers 1.19, use that version's API. If it uses supertest 6.x, use supertest 6.x patterns. If it uses Docker Compose for tests, follow that pattern. Do not introduce new test infrastructure tools or upgrade to a newer version's API without explicit plan authorization. The codebase analysis (Section 0 and Section 5) provides the exact versions — use them.

### Step 3 — Define Test Scenarios

For each integration boundary, identify the scenarios:

**Database boundaries:**

| Scenario Category | Examples |
|------------------|---------|
| CRUD operations | Create returns entity with generated ID; Read returns null for missing ID; Update modifies only specified fields; Delete removes entity |
| Constraint enforcement | Unique constraint rejects duplicates; Foreign key prevents orphans; NOT NULL rejects missing required fields |
| Query behavior | Filters return correct subset; Pagination returns correct page; Sort order matches specification |
| Transaction semantics | Rollback on failure; Concurrent modification handling; Isolation level behavior |
| Migration correctness | New columns have correct defaults; Indexes exist; Constraints are enforced |

**API boundaries:**

| Scenario Category | Examples |
|------------------|---------|
| Request serialization | Request body matches expected schema; Headers are set correctly; Query parameters are encoded |
| Response deserialization | Response body parses to correct types; Nested objects are deserialized; Dates/timestamps parse correctly |
| Error handling | 4xx responses are caught and transformed; 5xx responses trigger retry or error; Timeout produces expected error |
| Authentication | Auth token is sent; Expired token triggers refresh; Missing token returns 401 |

**Cross-module boundaries:**

| Scenario Category | Examples |
|------------------|---------|
| Contract compliance | Module A's output matches Module B's expected input type | 
| Data transformation | Data survives the round-trip through both modules without loss |
| Error propagation | Module A's error is correctly handled by Module B |

### Step 4 — Generate the Tests

Write integration tests following these rules:

**Data isolation (from integration testing standards IT-02):**
- Each test creates its own data
- Each test cleans up after itself (transaction rollback, truncate, or unique identifiers)
- No shared mutable state between tests
- Tests can run in any order and still pass

**Real components:**
- Use real databases, real HTTP calls (to sandbox/mock server), real message brokers
- The point of integration tests is that mocks cannot catch boundary failures
- Mock only components that are truly external and cannot be replicated in test (e.g., payment processors — use sandbox)

**Setup/teardown pattern:**

```
beforeAll:    Start infrastructure (DB container, mock server)
                Run migrations / seed schema
beforeEach:   Begin transaction or create isolated test data
afterEach:    Rollback transaction or clean up test data
afterAll:     Stop infrastructure
```

**Assertion focus:**
- Assert on the data as seen through the other component (read from DB after write, parse response after request)
- Assert on error types and messages for failure scenarios
- Assert on side effects (message published, cache entry created)

### Step 5 — Validate Integration Test Quality

| Check | Pass | Fail — fix |
|-------|------|-----------|
| Does the test use a real component at the boundary? | Yes — real DB, real HTTP | No — everything is mocked (this is a unit test, not integration) |
| Is test data isolated per test? | Yes — transaction rollback or unique data | No — tests share a row and fail depending on execution order |
| Is the test deterministic? | Yes — same result every time | No — depends on timing, external state, or test ordering |
| Does the test clean up? | Yes — teardown removes all test artifacts | No — leftover data pollutes the next test run |
| Is the test fast enough? | Under 5 seconds for most scenarios | Over 30 seconds — check if setup can be shared or test scoped down |
| Does the test add confidence beyond unit tests? | Yes — it catches something a unit test with mocks cannot | No — it is testing the same logic as a unit test but slower |

---

## Completion Criteria

- [ ] Integration boundaries are explicitly identified — which real components interact
- [ ] Test infrastructure matches the project's existing patterns (Testcontainers, Docker Compose, etc.)
- [ ] Tests use real components at boundaries — not mocked versions
- [ ] Each test has isolated data — no shared mutable state between tests
- [ ] Setup/teardown is correct — infrastructure starts, migrations run, data is cleaned
- [ ] Tests cover CRUD operations, constraint enforcement, error handling, and serialization at each boundary
- [ ] Tests are deterministic — no timing or ordering dependencies
- [ ] Tests follow the project's integration testing conventions (file location, naming, framework)
- [ ] Tests comply with integration testing standards (`IT-01` through `IT-12` or applicable subset)

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| "Integration tests" that mock the database and test only service logic (slow unit tests) | Step 1 boundary identification and Step 5 validation reject tests that don't use real components |
| Integration tests that pass locally but fail in CI due to shared database state | Step 4 data isolation rules ensure each test manages its own data |
| Integration tests that are flaky due to timing or test ordering | Step 5 determinism check catches timing and ordering dependencies |
| Integration test infrastructure is different from the project's existing setup, causing confusion | Step 2 matches the project's existing test infrastructure patterns and specific versions |
| Agent generates Testcontainers tests using API from a different version than what the project uses | Step 2 requires matching the exact versions from codebase analysis — not just the tool, but the version's API |
| Integration tests only cover the happy path — error handling at boundaries is untested | Step 3 scenario categories include error handling, constraint enforcement, and timeout behavior |
| Integration tests are so slow they are skipped in CI | Step 5 performance check flags tests over 30 seconds; Step 2 optimizes infrastructure setup |
