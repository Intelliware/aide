# TDD Workflow

## Purpose

Enforce RED-GREEN-REFACTOR test-driven development. No production code without a failing test first. Delete code written before tests.

## What This Does

Enforces the RED-GREEN-REFACTOR cycle as the mandatory coding discipline for all implementation tasks. This skill is not a testing strategy — it is a **development discipline** that determines the order in which code is written.

The implementation workflow mandates TDD. Every feature phase includes its unit tests. This skill defines exactly how to write them.

## When to Use

- Every implementation task that produces production code
- Called by `feature-implementer.md` for each behavior being implemented
- The default development rhythm — there is no alternative workflow

## The Cycle

```
┌─────────────────────────────────────────────────────────┐
│                  TDD CYCLE — ONE BEHAVIOR                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. RED ────────────► Write ONE failing test             │
│        │                                                │
│        ▼                                                │
│  2. VERIFY RED ────► Run test, confirm failure           │
│        │              Failure must be for the            │
│        │              EXPECTED reason                    │
│        ▼                                                │
│  3. GREEN ─────────► Write MINIMAL production code       │
│        │              Just enough to pass                │
│        ▼                                                │
│  4. VERIFY GREEN ──► Run test, confirm pass              │
│        │              All prior tests still pass         │
│        ▼                                                │
│  5. REFACTOR ──────► Clean up code and tests             │
│        │              No behavior change                 │
│        ▼                                                │
│  6. VERIFY REFACTOR ► Run ALL tests, confirm green       │
│        │                                                │
│        └──────────── Next behavior ─────────────────►   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites — Know the Commands

Before the first TDD cycle, identify the project's build and test commands from the codebase analysis (Section 0 and Section 5):

| Command | Source | Example |
|---------|--------|---------|
| **Build/compile** | Codebase analysis or `package.json` / `pom.xml` / `build.gradle` / `Package.swift` | `npm run build`, `./gradlew build`, `mvn compile`, `swift build` |
| **Run all tests** | Codebase analysis Section 5 (Test runner command) | `npm test`, `./gradlew test`, `mvn test`, `swift test`, `npx vitest` |
| **Run a single test file** | Derived from the test runner | `npx jest path/to/file.test.ts`, `./gradlew test --tests "ClassName"`, `swift test --filter TestClass` |
| **Lint** | Codebase analysis or project config | `npm run lint`, `./gradlew ktlintCheck`, `swiftlint` |

These commands are used at every VERIFY step. If you do not know the test command, find it before writing any code.

---

## Step Details

### Step 1 — RED: Write One Failing Test

Write a single test for the next behavior to implement. One test, one behavior — no batching.

**Rules:**

| Rule | Rationale |
|------|-----------|
| Test exactly one behavior | Multiple behaviors per test make failures ambiguous |
| Name the test after the behavior, not the method | `should_reject_expired_tokens` not `testValidate` |
| Use real types and values, not mocks (unless the dependency is external) | Mocks test mock behavior, not real behavior |
| Assert the outcome, not the implementation | Assert the return value or side effect, not that a private method was called |
| Keep the test short — setup, act, assert | Long tests hide what is being tested |

**What counts as "one behavior":**
- One happy-path scenario (e.g., "valid input returns expected output")
- One error condition (e.g., "null input throws IllegalArgumentException")
- One edge case (e.g., "empty list returns empty result")
- One business rule (e.g., "discount applies only when total exceeds threshold")

**Choosing which behavior to test next:**
1. Start with the simplest happy path — the degenerate case
2. Add complexity incrementally — one constraint at a time
3. Error cases after the happy path works
4. Edge cases last

### Step 2 — VERIFY RED: Confirm the Test Fails

**Actually run the test command now.** Not from memory, not from a prior run. Execute the test runner in the current turn and read the complete output.

```bash
# Run the specific test file (faster feedback):
[single-test-command] path/to/file.test.ts

# Example: npx jest src/orders/order.service.test.ts
# Example: ./gradlew test --tests "OrderServiceTest"
```

**What to check in the output:**

| Check | Pass | Fail — stop and fix |
|-------|------|-------------------|
| Test compiles/parses | Yes — test runner starts and finds the test | Syntax error in test — fix the test before proceeding |
| Production code compiles | Yes — imports resolve, types are correct | Compile error — fix the production code stub (empty class/function) so the test can at least run |
| Test runs | Yes — test framework executes the test | Test framework misconfigured — fix setup |
| Test fails | Yes — with a clear assertion failure or missing implementation | If test passes, it is not testing new behavior — rewrite it |
| Failure reason matches intent | Assertion failure or missing method/class | If it fails for a different reason (import error, null reference, type error), the test is broken — fix it |

**If the test passes immediately**, one of these is true:
- The behavior already exists (check — is this test redundant?)
- The test is not asserting anything meaningful (tautology)
- The test is asserting on a mock you set up to return the expected value

In all cases: delete the test and write one that actually tests new behavior.

### Step 3 — GREEN: Write Minimal Production Code

Write the smallest amount of production code that makes the failing test pass. Nothing more.

**Rules:**

| Rule | Rationale |
|------|-----------|
| Only write code that the failing test demands | Untested code is unverified code |
| Hardcoded values are acceptable if the test passes | The next test will force generalization |
| Do not add error handling the test doesn't require | Error handling comes when an error-case test is RED |
| Do not add parameters the test doesn't use | YAGNI — the next test will drive the signature |
| Do not refactor yet | Refactoring is Step 5, after GREEN is verified |

**The temptation to resist:** Writing "obvious" code that handles cases no test covers. If it is obvious, the test for it will be trivial — write the test first.

### Step 4 — VERIFY GREEN: Confirm All Tests Pass

**Actually run the full test suite now.** Not just the new test — the entire suite, to catch regressions.

```bash
# Run the full test suite:
[full-test-command]

# Example: npm test
# Example: ./gradlew test
# Example: swift test
```

**Also run the build/compile command** to verify no type errors or compilation issues exist beyond what the test runner catches:

```bash
# Build/compile:
[build-command]

# Example: npm run build
# Example: ./gradlew build
# Example: swift build
```

**Read the complete output.** Not just the exit code. Not just the last line. Check:

| Check | Pass | Fail — stop and fix |
|-------|------|-------------------|
| Build/compile succeeds | Yes — zero errors, zero type errors | Compile error — fix the production code (type mismatch, missing import, syntax error) |
| New test passes | Yes | Production code is wrong — fix it (do not change the test to match broken code) |
| All prior tests still pass | Yes | New code broke existing behavior — fix the regression before proceeding |
| No warnings introduced | Yes | Warnings often indicate issues — investigate before moving on |
| Total test count matches expected | Yes — no tests were accidentally skipped | Tests skipped — investigate why |

**If a prior test breaks**, the new code changed behavior it should not have. Fix the production code, not the old test (unless the old test was genuinely wrong, which is rare).

### Step 5 — REFACTOR: Clean Up

With all tests green, improve the code without changing behavior.

**What to refactor:**

| Target | Examples |
|--------|----------|
| Production code | Extract methods, rename variables, remove duplication, simplify conditionals |
| Test code | Extract shared setup, improve assertion messages, remove duplication between tests |
| Both together | Align naming between tests and production code |

**What NOT to do during refactor:**
- Add new behavior (that requires a new RED test)
- Change what a test asserts (that changes the contract)
- Skip running tests after refactoring ("I only renamed a variable")

### Step 6 — VERIFY REFACTOR: Confirm Nothing Broke

**Actually run the full test suite and build again** after refactoring:

```bash
[build-command] && [full-test-command]
```

Read the full output. All tests must still pass. Build must still succeed. No new warnings.

If any test fails or the build breaks after refactoring, the refactoring changed behavior or introduced a type error. Revert the refactoring and try again with a smaller change.

---

## When Production Code Already Exists (Brownfield)

In brownfield scenarios where the task modifies existing code:

1. **Characterization tests first** — Before changing anything, write tests that document the current behavior. Run them. They must pass.
2. **RED for the new behavior** — Write a test for the new/changed behavior. It should fail against the current code.
3. **GREEN** — Modify the production code to pass the new test while keeping characterization tests green.
4. **REFACTOR** — Clean up, all tests still green.

If characterization tests are hard to write (the code is untestable), that is a signal to refactor for testability first — and that refactoring itself follows the TDD cycle.

---

## Iron Rules

These rules are non-negotiable. Violating any of them breaks the TDD discipline.

| # | Rule | What happens on violation |
|---|------|--------------------------|
| 1 | No production code without a failing test first | Delete the untested code and restart with RED |
| 2 | No moving past RED without verifying the test fails | Run the test before writing production code |
| 3 | No moving past GREEN without verifying all tests pass | Run the full suite, not just the new test |
| 4 | No refactoring with failing tests | Get to GREEN first, then refactor |
| 5 | No changing a test to make it pass instead of fixing the code | Tests define the contract — production code must satisfy it |
| 6 | No skipping VERIFY steps | Every RED, GREEN, and REFACTOR step has a mandatory verification |
| 7 | No batching multiple behaviors into one RED-GREEN cycle | One behavior per cycle — always |

---

## Common Rationalizations and Why They Fail

| Rationalization | Why it fails |
|----------------|-------------|
| "I'll write the tests after — same result" | Tests written after production code test the implementation, not the behavior. They are biased toward what was built, not what was needed. |
| "This code is too simple to need a test" | If it is too simple to test, it is too simple to break — and therefore trivial to TDD. If it can break, it needs a test. |
| "I need to see the shape of the code before I can test it" | TDD drives the shape of the code. The test defines the interface the code must satisfy. |
| "Mocking is too complex, I'll test manually" | If mocking is complex, the code has too many dependencies. TDD exposes this — that is a feature, not a bug. |
| "I already know the implementation, writing the test first is slower" | TDD is not slower — it prevents the debugging cycle that follows untested code. The total time is lower. |
| "The test framework doesn't support this pattern easily" | This signals either a framework limitation (rare) or an untestable design (common). Fix the design. |

---

## Red Flags During TDD

If any of these occur, stop and reassess:

| Red flag | What it means | What to do |
|----------|--------------|------------|
| Test is longer than the code it tests | Test is over-specified or setup is too complex | Simplify — test fewer things, extract helpers, or reconsider the interface |
| More than 3 mocks in a single test | Code under test has too many dependencies | Refactor production code to reduce coupling |
| Test name describes implementation, not behavior | "testCallsRepositorySave" vs "testOrderIsPersisted" | Rename to describe behavior |
| GREEN step required more than ~20 lines of code | Too much behavior in one cycle | Split into smaller behaviors with separate tests |
| Refactoring keeps breaking tests | Tests are coupled to implementation details | Rewrite tests to assert on outcomes, not internals |
| Same assertion copied across many tests | Missing abstraction in tests | Extract shared assertion helper |

---

## Completion Checklist

Before declaring a behavior fully implemented via TDD:

- [ ] Every production code path has a test that drove its creation
- [ ] Every test was observed to fail (RED) before production code was written
- [ ] Every test was observed to pass (GREEN) after production code was written
- [ ] The full test suite passes after every GREEN and REFACTOR step
- [ ] No test was modified to match incorrect production code
- [ ] No production code exists that was not demanded by a failing test
- [ ] Refactoring did not change any test assertions

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Agent writes all production code first then retrofits tests that pass by definition | Iron Rule 1 — failing test must exist before production code |
| Agent writes a test that passes immediately and moves on, leaving behavior untested | Step 2 VERIFY RED — test must fail for the expected reason |
| Agent changes a test assertion to match wrong output instead of fixing the code | Iron Rule 5 — tests define the contract, code must satisfy it |
| Agent skips verification after refactoring and introduces a subtle regression | Step 6 VERIFY REFACTOR — full suite runs after every refactor |
| Agent batches five behaviors into one test, making failures ambiguous | Iron Rule 7 — one behavior per cycle |
| Agent uses mocks everywhere, tests pass but production code fails with real dependencies | Step 1 rules — use real types unless the dependency is external |
| Agent claims "tests pass" based on a prior run, not the current code state | VERIFY steps require fresh runs in the current turn |
| Agent writes test code but never actually runs it — test has a syntax error or wrong import that is discovered much later | VERIFY RED requires actually executing the test command and reading the output — compile/parse errors are caught immediately |
| Agent writes production code that does not compile — type errors accumulate across multiple TDD cycles | VERIFY GREEN requires running both the build command and the test suite — compile errors are caught at every GREEN step |
| Agent does not know the test command for the project and skips running tests | Prerequisites section requires identifying the build, test, and lint commands before the first TDD cycle |
