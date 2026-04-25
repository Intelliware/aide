# Feature Implementer

## Purpose

Implement a feature from the implementation plan. Follow the plan's task order, file paths, and verification steps.

## What This Does

Executes a single phase from the implementation plan. This is the primary coding skill — it takes a phase specification (with its inline design specs, acceptance criteria, file paths, and verification steps) and produces working, tested code.

This skill does not decide *what* to build — the implementation plan decides that. This skill decides *how* to build it, following TDD discipline and project conventions.

## When to Use

- Called by the implementation workflow for each phase in the plan
- One invocation per phase — do not batch phases
- Works in both inline execution and subagent-driven modes

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Phase specification | The specific phase from `implementation-plan.md` — all 8 canonical sections | Yes |
| Project context | `project-context.md` — naming conventions, patterns, file structure | Yes |
| Coding standards | `../assets/standards/` — common standards (`common/clean-code.md`, `common/code-design-principles.md`, `common/naming-conventions.md`, `common/error-handling.md`, `common/logging.md`, `common/security-practices.md`, `common/code-documentation.md`, `common/dependency-management.md`, `common/design-patterns.md`), language-specific standards (`languages/{lang}/standards.md`), framework-specific standards (`frameworks/{framework}/standards.md`), and platform-specific standards (`platforms/{platform}/standards.md`) applicable to this project | Yes |
| Testing stack versions | From codebase analysis (Section 0 + Section 5) — test framework, assertion library, mocking library, and infrastructure tool versions | Yes |
| Codebase | The actual codebase — for reading existing patterns and integrating | Yes |
| TDD workflow | `tdd-workflow.md` — the RED-GREEN-REFACTOR cycle | Yes |

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  FEATURE IMPLEMENTER — EXECUTION SEQUENCE                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ORIENT — Read and internalize the phase specification        │
│              Read the relevant codebase areas                    │
│              Identify patterns, conventions, and dependencies    │
│                                                                  │
│  2. PLAN — Map phase steps to concrete implementation actions    │
│            Identify the TDD sequence (which behaviors, in        │
│            what order)                                           │
│            Flag anything unclear BEFORE writing code              │
│                                                                  │
│  3. EXECUTE — For each behavior, follow TDD cycle:               │
│              RED → VERIFY RED → GREEN → VERIFY GREEN →           │
│              REFACTOR → VERIFY REFACTOR                          │
│              Repeat until the phase step is complete              │
│                                                                  │
│  4. INTEGRATE — Verify the phase integrates with existing code   │
│                Run the full test suite                            │
│                Check for regressions                             │
│                                                                  │
│  5. VERIFY — Run the phase's Automated Verification (AI Gate)    │
│             Check all Success Criteria                            │
│             Report on Completeness, Correctness, Coherence       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Orient

Before writing any code, build a complete mental model.

**Read the phase specification:**
- Phase Identity — which FRs does this phase implement?
- Goal — what system state should exist when this phase is complete?
- Dependencies — which prior phases must be done? Verify they are.
- Plan — the ordered steps with inline specs, ACs, file paths, patterns
- Outcome — what deliverables does this phase produce?
- Automated Verification — what commands prove it works?
- Human Verification — what does the human reviewer check?
- Success Criteria — the binary checklist for completion

**Read the relevant codebase:**
- Open the files the phase will modify — understand the current state
- Read adjacent files for patterns — how are similar things done?
- Check existing test files — what testing patterns, framework, and API version are used?
- Check import paths — where do modules live?

**Load applicable coding standards:**
- Read `../assets/standards/common/` — clean code (function length, complexity, DRY), code design principles (SOLID, separation of concerns), naming conventions, error handling (typed errors, error classification), logging (structured logging, log levels, redaction), security practices (input validation, auth patterns, secret management), design patterns, code documentation, dependency management
- Read the language-specific standards for the project's language — e.g., `../assets/standards/languages/typescript/standards.md`
- Read the framework-specific standards for the project's framework — e.g., `../assets/standards/frameworks/react/standards.md`
- Read the platform-specific standards if applicable — e.g., `../assets/standards/platforms/android/standards.md`
- **Only read standards for technologies in the project's stack** — the project context (Section 1 — Technology Stack) identifies what applies

**Identify conventions from codebase and project context:**
- File naming — `kebab-case.ts`, `PascalCase.java`, etc.
- Code organization — where do services, repositories, controllers live?
- Error handling — how does the codebase handle errors? Compare against `../assets/standards/common/error-handling.md`
- Logging — what logger, what format? Compare against `../assets/standards/common/logging.md`
- Test organization — co-located or separate `__tests__` directory?

**Flag anything unclear:**
If any plan step is ambiguous, incomplete, or contradicts the codebase, stop and ask. Do not guess. This is the last checkpoint before code is written.

### Step 2 — Plan the TDD Sequence

Map each plan step to a sequence of behaviors that will be test-driven.

**For each plan step:**
1. Identify the behaviors it specifies (from the inline design spec and ACs)
2. Order them: simplest happy path → additional happy paths → error cases → edge cases
3. Each behavior becomes one TDD cycle (RED-GREEN-REFACTOR)

**Example mapping:**

| Plan Step | Behavior | TDD Cycle |
|-----------|----------|-----------|
| "Create UserService with createUser method" | Valid user creation returns user | Cycle 1 |
| (same step) | Duplicate email throws ConflictException | Cycle 2 |
| (same step) | Missing required fields throws ValidationException | Cycle 3 |
| (same step) | Password is hashed before storage | Cycle 4 |

### Step 3 — Execute with TDD

For each behavior in the planned sequence, follow the `tdd-workflow.md` cycle.

**Per plan step:**

1. Create the file(s) at the paths specified in the plan step
2. For each behavior in this step:
   - **RED** — Write a failing test
   - **VERIFY RED** — Run it, confirm failure for the right reason
   - **GREEN** — Write minimal production code
   - **VERIFY GREEN** — Run all tests, confirm green
   - **REFACTOR** — Clean up
   - **VERIFY REFACTOR** — Run all tests, confirm still green
3. After all behaviors in the step are implemented, verify the step's inline ACs are met

**Rules during execution:**

| Rule | Detail |
|------|--------|
| Follow file paths from the plan | Do not create files at different locations unless the plan path is provably wrong |
| Follow patterns from the plan | If the plan says "follow the pattern in UserService," read UserService first |
| Follow coding standards | Apply **all** applicable standards from the standards directory — common standards (clean code, code design principles, naming conventions, error handling, logging, security practices, design patterns, code documentation, dependency management), language-specific standards, framework-specific standards, and platform-specific standards. Common standards apply to every file; language/framework/platform standards apply to files in their respective stack. |
| Follow project conventions | Match the naming, structure, and style of the existing codebase |
| One step at a time | Complete step N before starting step N+1 |
| No scope creep | Implement only what the plan step specifies — no "while I'm here" additions |
| No premature abstraction | Do not introduce abstractions the plan does not call for |

### Step 4 — Integrate

After all plan steps in the phase are complete, **run every verification command and read the output.** Do not skip any step or assume a prior run is still valid.

**Run in this order:**

1. **Build/compile** — run the project's build command and read the full output:
   ```bash
   [build-command]   # e.g., npm run build, ./gradlew build, swift build
   ```
   The project must compile cleanly with zero errors and zero new warnings. If it fails, fix the compilation error before running tests — a build that doesn't compile cannot be tested.

2. **Lint** — run the project's lint command and read the full output:
   ```bash
   [lint-command]   # e.g., npm run lint, ./gradlew ktlintCheck, swiftlint
   ```
   Zero new linting errors. Fix any that were introduced before proceeding.

3. **Full test suite** — run the full test suite (not just the new tests) and read the complete output:
   ```bash
   [full-test-command]   # e.g., npm test, ./gradlew test, swift test
   ```
   Check: total test count (all tests ran, none skipped), pass/fail count (zero failures), no new warnings.

4. **Check for regressions** — if any pre-existing test fails, fix the regression before proceeding. The new code broke existing behavior.

5. **Check imports** — no unused imports, no circular dependencies introduced.

**Show the output** for build, lint, and test commands. The verification skill requires fresh evidence in the same turn — no "tests should pass" without showing the run.

If integration reveals issues, fix them using the same TDD discipline. If the fix requires design changes beyond the phase scope, stop and report the issue — do not make architectural decisions independently.

### Step 5 — Verify

Run through the phase's verification criteria:

**Automated Verification (AI Gate):**
Execute every command listed in the phase's Automated Verification section **now, in this turn.** Run each command, read the full output, and compare against the expected result. Do not claim "should pass" — show the actual output.

**Success Criteria:**
Walk through each binary criterion. Mark each as met or not met.

**Three-Dimension Check:**

| Dimension | Question | Evidence Required |
|-----------|----------|-------------------|
| Completeness | Are all ACs from the plan step inline specs implemented? | List each AC and the test that covers it |
| Correctness | Does the implementation match the design spec's intent? | Show test results proving correct behavior |
| Coherence | Does the code match project conventions and the codebase style? | File paths, naming, patterns match project-context.md |

If any verification fails, fix the issue and re-verify. Do not claim completion with known failures.

---

## Handling Blocked Steps

If a plan step cannot be executed:

| Situation | Action |
|-----------|--------|
| Dependency from a prior phase is missing | Stop — report the missing dependency. Do not implement a workaround. |
| Plan step references a file that doesn't exist | Check if a prior plan step should have created it. If yes, that step was incomplete — report it. |
| Plan step's inline spec contradicts the codebase | Stop — report the contradiction. The plan or the codebase is wrong, but this skill does not decide which. |
| External dependency is unavailable | Stop — report it as a blocker. |
| Plan step is ambiguous or incomplete | Stop — ask for clarification. Do not guess. |

In all cases, set the phase status to `blocked` with a clear description of the blocker.

---

## Output

After phase execution, report:

```
## Phase [ID] — Execution Report

### Status: [DONE / BLOCKED]

### Standards Applied
List every standards file that was loaded and applied during this phase. This provides
visibility into which organizational rules governed the code written.

**Common standards:**
- ../assets/standards/common/clean-code.md — [applied / not applicable]
- ../assets/standards/common/code-design-principles.md — [applied / not applicable]
- ../assets/standards/common/naming-conventions.md — [applied / not applicable]
- ../assets/standards/common/error-handling.md — [applied / not applicable]
- ../assets/standards/common/logging.md — [applied / not applicable]
- ../assets/standards/common/security-practices.md — [applied / not applicable]
- ../assets/standards/common/code-documentation.md — [applied / not applicable]
- ../assets/standards/common/dependency-management.md — [applied / not applicable]
- ../assets/standards/common/design-patterns.md — [applied / not applicable]
- ../assets/standards/common/rest-api-design.md — [applied / not applicable]

**Language standards:**
- ../assets/standards/languages/[lang]/standards.md — [applied / not applicable]

**Framework standards:**
- ../assets/standards/frameworks/[framework]/standards.md — [applied / not applicable]

**Platform standards:**
- ../assets/standards/platforms/[platform]/standards.md — [applied / not applicable]

**Testing standards:**
- ../assets/standards/common/testing/unit-testing.md — [applied / not applicable]
- ../assets/standards/common/testing/integration-testing.md — [applied / not applicable]
- ../assets/standards/common/testing/mocking-strategy.md — [applied / not applicable]
- ../assets/standards/common/testing/test-data-management.md — [applied / not applicable]
- ../assets/standards/languages/[lang]/testing.md — [applied / not applicable]
- ../assets/standards/frameworks/[framework]/testing.md — [applied / not applicable]

**Project-specific standards:**
- [path to any user-provided standards] — [applied / not applicable]
- (None if no project-specific standards were provided)

**Key rules applied:** List 3–5 specific rule IDs from the standards that most
influenced the code written in this phase (e.g., "EH-03: typed error classes",
"NC-02: file naming", "CC-04: function length < 30 lines").

**Version-gated rules skipped:** List any rules that were skipped because the
project's version is older than the rule's Requires tag (e.g., "TS-17: using
declarations — requires TypeScript 5.2+, project is on 5.0").

### Files Created
- path/to/file.ts — [description]

### Files Modified
- path/to/existing-file.ts — [what changed]

### Tests Written
- path/to/file.test.ts — [N tests covering: list of behaviors]

### Test Results
- Unit tests: N passed, 0 failed
- Full suite: N passed, 0 failed
- [Paste full test output]

### Automated Verification
- [Command 1]: [PASS/FAIL] — [output summary]
- [Command 2]: [PASS/FAIL] — [output summary]

### Success Criteria
- [ ] Criterion 1 — [MET / NOT MET]
- [ ] Criterion 2 — [MET / NOT MET]

### Three-Dimension Check
- Completeness: [all ACs covered / gaps listed]
- Correctness: [all tests pass with correct assertions / issues listed]
- Coherence: [matches project conventions and standards / deviations listed]
```

---

## Completion Criteria

- [ ] All plan steps in the phase have been executed in order
- [ ] Every behavior was implemented using TDD (RED-GREEN-REFACTOR)
- [ ] Every plan step's inline ACs are met
- [ ] All new tests pass
- [ ] The full existing test suite passes (no regressions)
- [ ] The project compiles/builds cleanly
- [ ] No new linting errors
- [ ] The phase's Automated Verification commands all pass with expected results
- [ ] All Success Criteria are met
- [ ] Three-dimension check (Completeness, Correctness, Coherence) reports no gaps
- [ ] Standards Applied section is complete — all loaded standards listed with applied/not-applicable status, key rules cited, and any version-gated skips documented

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Agent ignores the plan and implements from its own understanding of the feature | Step 1 ORIENT requires reading the plan; Step 3 rules enforce "follow file paths from the plan" and "no scope creep" |
| Agent creates files at incorrect paths, diverging from the plan and codebase structure | Step 1 reads both the plan paths and the codebase to confirm; Step 3 enforces plan paths |
| Agent writes all production code first then writes passing tests as an afterthought | Step 3 delegates to tdd-workflow which enforces RED before GREEN |
| Agent introduces regressions in existing code without noticing | Step 4 INTEGRATE runs the full test suite, not just new tests |
| Agent claims the phase is done without running verification commands | Step 5 requires executing every AI Gate command and showing output |
| Agent encounters an ambiguity and guesses instead of asking | Step 1 ORIENT and blocked-step handling both enforce "stop and ask" |
| Agent makes architectural decisions beyond the phase scope | Step 3 rules prohibit scope creep; blocked-step handling escalates design changes |
| Agent skips a plan step because it seems redundant with a prior step | Step 3 rules enforce sequential step execution — one step at a time |
| Agent claims to follow standards but no one can verify which standards were actually applied | The Standards Applied section in the execution report lists every standard loaded, key rules applied, and version-gated rules skipped — making standards compliance auditable |
| Agent silently ignores common standards (clean code, error handling, security) and only follows language/framework standards | Step 1 Orient explicitly loads common standards alongside language/framework/platform standards; the execution report requires listing all of them |
