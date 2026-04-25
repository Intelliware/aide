# Unit Test Creator

## Purpose

Generate unit tests for a module — cover happy path, edge cases, error conditions, and boundary values.

## What This Does

Produces unit tests for a module or class. This skill determines *what* to test (which behaviors, scenarios, and edge cases), generates tests following project conventions and unit testing standards, and verifies the tests are meaningful (not tautological, not testing mocks).

This skill is called by the TDD workflow during the RED step. It produces the failing test; the feature implementer then writes the production code to make it pass.

## When to Use

- During TDD RED step — to create the next failing test
- When backfilling tests for existing code (brownfield characterization tests)
- When the test plan calls for unit-level coverage of a specific module

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Module under test | The class, function, or module to test | Yes |
| Behavior to test | From the TDD sequence — the specific behavior for this cycle | Yes |
| Inline design spec | From the implementation plan — the intended behavior | Yes |
| Unit testing standards | `../assets/standards/common/testing/unit-testing.md` | Yes |
| Mocking strategy standards | `../assets/standards/common/testing/mocking-strategy.md` | Yes |
| Language testing standards | `../assets/standards/languages/{lang}/testing.md` or `../assets/standards/frameworks/{framework}/testing.md` | Yes |
| Testing stack versions | From codebase analysis (Section 0 + Section 5) — exact test framework, assertion library, and mocking library versions | Yes |
| Existing test files | The codebase's current test patterns | Yes |
| Project context | `project-context.md` — naming conventions, file locations | Yes |

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  UNIT TEST CREATOR — SEQUENCE                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ANALYZE — Understand the behavior to test                    │
│     Read the inline spec, identify inputs/outputs/side effects   │
│                                                                  │
│  2. DISCOVER — Identify the test scenarios                       │
│     Happy path, error conditions, edge cases, boundaries         │
│                                                                  │
│  3. PATTERN — Match the project's test conventions               │
│     Read existing tests, determine framework, structure, naming  │
│                                                                  │
│  4. GENERATE — Write the test                                    │
│     Follow AAA structure, behavior-focused names, minimal mocks  │
│                                                                  │
│  5. VALIDATE — Check test quality before running                 │
│     Not tautological, not testing mocks, assertions are specific │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Analyze the Behavior

For the behavior being tested, identify:

| Element | Question |
|---------|----------|
| Input | What does the function/method receive? Types, ranges, optional fields |
| Output | What does it return? Type, shape, possible values |
| Side effects | Does it write to a database, emit an event, call an external service? |
| Preconditions | What state must exist before the call? |
| Postconditions | What state must exist after the call? |
| Invariants | What must remain true regardless of input? |

### Step 2 — Discover Test Scenarios

For each behavior, identify the scenarios that need coverage:

| Category | How to Identify | Examples |
|----------|----------------|---------|
| **Happy path** | The normal, expected use case — valid input, expected output | Valid user creation returns a user with an ID |
| **Error conditions** | Invalid inputs, violated preconditions, failed dependencies | Null input throws, duplicate email throws, DB connection fails |
| **Edge cases** | Boundary values, empty collections, maximum lengths | Empty string, list with one item, exactly at the max length |
| **Boundary values** | The precise point where behavior changes | Discount at exactly $100 (threshold), one second before expiry |
| **State transitions** | When the behavior depends on current state | Can only cancel an order that is "pending," not "shipped" |

**Prioritization for TDD RED step:** When called during TDD, this skill generates ONE test for the current behavior (not all scenarios at once). The TDD workflow handles ordering — simplest happy path first, then complexity builds.

### Step 3 — Match Project Conventions

Before writing the test, read existing test files to match:

| Convention | What to Match |
|-----------|--------------|
| Test framework + version | Jest 29, Vitest 2.x, JUnit Jupiter 5.10, XCTest, Swift Testing, Kotest 5.8 — use the API for the **detected version**, not a different one |
| Assertion library + version | Built-in (`expect`), AssertJ 3.x, Hamcrest, `jest-dom` 6.x — match the assertion API |
| Mocking library + version | Built-in (`jest.fn()`), Mockito 5.x, `ts-mockito`, `@Mock` annotations — match the mocking API |
| File location | Co-located (`foo.test.ts` next to `foo.ts`) or separate (`__tests__/foo.test.ts`) |
| File naming | `.test.ts`, `.spec.ts`, `Test.java`, `Tests.swift` |
| Describe/it structure | Nested `describe` blocks vs flat `test` calls |
| Assertion style | `expect(x).toBe(y)` vs `Assertions.assertEquals(y, x)` vs `assertThat(x).isEqualTo(y)` vs `XCTAssertEqual(x, y)` vs `#expect(x == y)` |
| Setup/teardown | `beforeEach`/`afterEach`, `@BeforeEach`/`@AfterEach`, `setUp()`/`tearDown()` |
| Mock creation | Manual stubs, `jest.fn()`, `Mockito.mock()`, `@Mock` + `@ExtendWith(MockitoExtension.class)` |

**Version-critical API differences (common sources of compile failures):**

| Framework Transition | API Change | What to Use |
|---------------------|-----------|-------------|
| JUnit 4 → JUnit 5 | `org.junit.Test` → `org.junit.jupiter.api.Test`; `@Before` → `@BeforeEach`; `@RunWith` → `@ExtendWith`; `Assert.assertEquals` → `Assertions.assertEquals` | Check the actual import paths in existing tests |
| Mockito 4 → Mockito 5 | Inline mock maker is default in 5; `mockStatic` API stable; some deprecated methods removed | Check `mockito-core` version in build file |
| XCTest → Swift Testing | `XCTestCase` subclass → top-level `@Test` functions; `XCTAssert*` → `#expect`; `setUp()`/`tearDown()` → init/deinit or `@Suite` | Check Swift version (6.0+ for Swift Testing) and existing test files |
| Jest → Vitest | `jest.fn()` → `vi.fn()`; `jest.mock()` → `vi.mock()`; config file differs | Check `package.json` for which is installed |
| React Testing Library 14 → 15/16 | `render` return type changes; `act` warnings differ; `cleanup` behavior | Check `@testing-library/react` version |

**When no existing tests exist:** Follow the unit testing standards for the project's language/framework, using the testing stack versions detected in the codebase analysis.

### Step 4 — Generate the Test

Write the test following these rules:

**Structure (AAA):**
1. **Arrange** — Set up inputs, dependencies, and state
2. **Act** — Execute the behavior under test (one call)
3. **Assert** — Verify the outcome (return value, thrown error, side effect)

**Naming:**
- Name describes the behavior, not the method: `rejects refund when order is not delivered`
- Use the project's naming convention: `it('should...')`, `@Test fun ...`, etc.

**Mocking rules (from mocking strategy standards):**
- Mock at the narrowest boundary — the specific dependency, not the whole module
- Prefer dependency injection over module-level mocking
- Never mock the unit under test
- Verify mock interactions only when the interaction IS the behavior (e.g., "sends an email")
- For every mock, assert that the mock's contract matches the real implementation's type

**Assertion rules:**
- Assert on the outcome (return value, state change), not on internals
- Use specific assertions: `toBe(48.60)` not `toBeTruthy()`
- One logical assertion per test (multiple `expect` calls are fine if they verify one logical outcome)
- Include meaningful assertion messages for non-obvious checks

### Step 5 — Validate Before Running

Before declaring the test ready, self-check:

| Check | Pass | Fail — fix before running |
|-------|------|--------------------------|
| Do imports match the detected framework version? | Yes — `org.junit.jupiter.api.Test` for JUnit 5, `vi.fn()` for Vitest | No — using JUnit 4 imports on JUnit 5, `jest.fn()` on Vitest, `XCTAssert` on Swift Testing |
| Does the test assert something meaningful? | Yes — it will fail if the behavior is wrong | No — it asserts on a mock return value you set up (tautological) |
| Is the test independent? | Yes — no shared mutable state, no dependency on test execution order | No — uses a global variable or depends on another test running first |
| Is the test deterministic? | Yes — same result every time | No — depends on current time, random values, or external state |
| Does the test name describe behavior? | Yes — you can understand what broke from the name alone | No — it says "test1" or "testCreateUser" |
| Is the assertion specific? | Yes — `toBe(48.60)` or `toThrow(ConflictException)` | No — `toBeTruthy()` or `not.toBeNull()` when the value matters |
| Does the test compile/parse? | Yes — no syntax errors | No — fix before running |

---

## Anti-Patterns to Avoid

| Anti-Pattern | What It Looks Like | What to Do Instead |
|---|---|---|
| **Testing the mock** | Assert that `mockFn.mockReturnValue(42)` returns 42 | Assert on the behavior that uses the mock's return value |
| **No assertion** | Test calls the function but never asserts anything | Add specific assertions on the outcome |
| **Implementation-coupled** | Test asserts that private method `_calculateTax` was called | Assert on the return value that includes tax |
| **Copy-paste tests** | 10 tests with identical structure, only input differs | Use parameterized tests / `test.each` |
| **Over-mocking** | Every dependency is mocked, test passes but production fails | Use real implementations where feasible; mock only external boundaries |
| **Catch-all assertions** | `expect(result).toBeDefined()` when the value matters | Assert on the actual expected value |
| **Flaky setup** | Test depends on database state from a prior test | Each test sets up its own state and cleans up |

---

## Completion Criteria

- [ ] Test follows AAA structure (Arrange-Act-Assert)
- [ ] Test name describes the behavior, not the method
- [ ] Test imports and API calls match the detected testing stack versions (no JUnit 4 on JUnit 5, no jest on Vitest, no XCTest on Swift Testing)
- [ ] Test file is at the correct location with correct naming
- [ ] Mocking follows the mocking strategy standards (narrowest boundary, DI preferred)
- [ ] Assertions are specific and meaningful
- [ ] Test is independent — no shared mutable state
- [ ] Test is deterministic — no time, random, or external dependencies
- [ ] Test is not tautological — it can actually fail if the behavior is wrong
- [ ] Test compiles/parses without errors

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Agent writes tests that always pass regardless of production code (tautological) | Step 5 validation checks for meaningful assertions and mock testing |
| Agent writes tests named "test1," "test2" that are unreadable when they fail | Step 4 naming rules enforce behavior-focused names |
| Agent mocks everything and tests pass but production fails with real dependencies | Step 4 mocking rules limit mocks to external boundaries |
| Agent writes tests with shared mutable state that fail intermittently | Step 5 independence check catches shared state |
| Agent writes tests in a different style than the existing codebase | Step 3 reads existing tests and matches conventions |
| Agent generates JUnit 4 tests on a JUnit 5 project (wrong imports, wrong annotations, wrong assertion API) | Step 3 version-critical API differences table and Step 5 import validation catch framework version mismatches before the test is run |
| Agent uses `jest.fn()` on a Vitest project or `XCTAssert` on a Swift Testing project | Step 3 requires matching the detected testing stack versions; Step 5 validates imports match |
| Agent skips error cases and only tests the happy path | Step 2 scenario discovery covers error conditions, edge cases, and boundaries |
