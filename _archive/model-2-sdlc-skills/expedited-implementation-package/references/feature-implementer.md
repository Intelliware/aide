# Feature Implementer

## Purpose

Execute implementation plan tasks in order — read the task, follow the specified file paths, make the described change, and verify against the task's success criteria. Works through the plan sequentially, one task at a time. For each task: read the task specification (files, change, success criteria, test approach, inline spec excerpt), execute the change using the TDD workflow (the test is written first via tdd-workflow, then the production code), verify the task's success criteria are met, and move to the next task only after verification passes. Does not skip tasks, reorder tasks, or proceed past a failed verification. If a task fails verification, invokes systematic-debugging before retrying. Follows the patterns and conventions identified during codebase orientation to ensure new code is idiomatic within the existing codebase.

## What This Does

Executes a single phase from the implementation plan. This is the primary coding skill — it takes a phase specification (with its inline specs, acceptance criteria, file paths, and verification steps) and produces working, tested code.

This skill does not decide *what* to build — the implementation plan decides that. This skill decides *how* to build it, following TDD discipline, coding standards, and project conventions.

## When to Use

- Called by the expedited workflow for each phase in the plan
- One invocation per phase — do not batch phases
- After the phase execution guide's pre-execution steps (education, game plan, go/no-go)

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Phase specification | The specific phase from `docs/<feature>/implementation-package/implementation-plan.md` — all 8 canonical sections | Yes |
| Codebase orientation | From Step 2 — patterns, conventions, standards compliance snapshot | Yes |
| Coding standards | `../assets/standards/` — all applicable common, common testing, language, language testing, framework, framework testing, platform, platform testing, and project-specific standards loaded during orientation | Yes |
| Testing stack versions | From orientation — test framework, assertion library, mocking library versions | Yes |
| Codebase | The actual codebase — for reading existing patterns and integrating | Yes |
| TDD workflow | `tdd-workflow` — the RED-GREEN-REFACTOR cycle | Yes |
| Change spec | From Step 1 — the source of truth for what the change should do | Yes |

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  FEATURE IMPLEMENTER — EXECUTION SEQUENCE                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ORIENT — Read and internalize the phase specification        │
│              Read the relevant codebase areas                    │
│              Confirm patterns, conventions, and standards        │
│                                                                  │
│  2. PLAN — Map phase steps to concrete TDD actions               │
│            Identify the TDD sequence (which behaviors, in        │
│            what order)                                           │
│            Flag anything unclear BEFORE writing code              │
│                                                                  │
│  3. EXECUTE — For each behavior, follow TDD cycle:               │
│              RED → VERIFY RED → GREEN → VERIFY GREEN →           │
│              REFACTOR → VERIFY REFACTOR                          │
│              Apply coding standards; follow conventions           │
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

Before writing any code, build a complete mental model of the phase.

**Read the phase specification:**
- Phase Identity — which ACs from the change spec does this phase implement?
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

**Confirm coding standards apply:**
- Review the orientation's standards compliance snapshot
- Confirm the snapshot includes common standards, common testing standards, language/framework/platform standards for the detected stack, and any project-specific standards the user provided
- For each plan step: is the codebase pattern compliant, or should new code follow the standard instead?
- Confirm which standard rules are version-gated and excluded (from orientation)

**Flag anything unclear:**
If any plan step is ambiguous, incomplete, or contradicts the codebase, stop and ask. Do not guess. This is the last checkpoint before code is written.

### Step 2 — Plan the TDD Sequence

Map each plan step to a sequence of behaviors that will be test-driven.

**For each plan step:**
1. Identify the behaviors it specifies (from the inline spec and ACs)
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

For each behavior in the planned sequence, follow the `tdd-workflow` cycle.

**Per plan step:**

1. Create the file(s) at the paths specified in the plan step
2. For each behavior in this step:
   - **RED** — Write a failing test (using the correct test framework and API version from orientation)
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
| Follow coding standards | Apply **all applicable standards loaded during orientation**: common standards, common testing standards, language-specific standards, language testing standards, framework-specific standards, framework testing standards, platform/platform testing standards when applicable, and project-specific standards. Common standards apply to every production file; common testing standards apply to every test file. |
| Standard overrides codebase when there's a deviation | If orientation flagged a non-compliant pattern, follow the standard for new code — not the codebase |
| Follow project conventions where compliant | Match the naming, structure, and style of the existing codebase when it complies with standards |
| Use correct test API versions | Write tests using the framework and assertion library versions detected during orientation |
| One step at a time | Complete step N before starting step N+1 |
| No scope creep | Implement only what the plan step specifies — no "while I'm here" additions |
| No premature abstraction | Do not introduce abstractions the plan does not call for |

### Step 4 — Integrate

After all plan steps in the phase are complete, run every verification command and read the output.

**Run in this order:**

1. **Build/compile** — run the project's build command and read the full output:
   ```bash
   [build-command]
   ```
   Zero errors and zero new warnings. Fix compilation errors before running tests.

2. **Lint** — run the project's lint command and read the full output:
   ```bash
   [lint-command]
   ```
   Zero new linting errors. Fix any introduced before proceeding.

3. **Full test suite** — run the full test suite (not just new tests) and read the complete output:
   ```bash
   [full-test-command]
   ```
   Check: total test count (all tests ran), pass/fail count (zero failures), no new warnings.

4. **Check for regressions** — if any pre-existing test fails, fix the regression. The new code broke existing behavior.

5. **Check imports** — no unused imports, no circular dependencies introduced.

**Show the output** for build, lint, and test commands. The verification skill requires fresh evidence in the same turn.

If integration reveals issues, fix them using the same TDD discipline. If the fix requires design changes beyond the phase scope, stop and report the issue.

### Step 5 — Verify

Run through the phase's verification criteria:

**Automated Verification (AI Gate):**
Execute every command listed in the phase's Automated Verification section **now, in this turn.** Run each command, read the full output, and compare against the expected result.

**Success Criteria:**
Walk through each binary criterion. Mark each as met or not met.

**Three-Dimension Check:**

| Dimension | Question | Evidence Required |
|-----------|----------|-------------------|
| Completeness | Are all ACs from the change spec (mapped to this phase) implemented? | List each AC and the test that covers it |
| Correctness | Does the implementation match the change spec's intent? | Show test results proving correct behavior |
| Coherence | Does the code match project conventions, codebase style, and coding standards? | File paths, naming, patterns match orientation; standard overrides applied where needed |

If any verification fails, fix the issue and re-verify. Do not claim completion with known failures.

---

## Handling Blocked Steps

If a plan step cannot be executed:

| Situation | Action |
|-----------|--------|
| Dependency from a prior phase is missing | Stop — report the missing dependency |
| Plan step references a file that doesn't exist | Check if a prior step should have created it — report if so |
| Plan step's inline spec contradicts the codebase | Stop — report the contradiction |
| External dependency is unavailable | Stop — report it as a blocker |
| Plan step is ambiguous or incomplete | Stop — ask for clarification |

In all cases, set the phase status to `blocked` with a clear description of the blocker.

---

## Output

After phase execution, report:

```
## Phase [ID] — Execution Report

### Status: [DONE / BLOCKED]

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

### Standards Applied
- Common standards: [list loaded common standards applied / not applicable]
- Common testing standards: [list loaded common testing standards applied / not applicable]
- Language standards: [list loaded language standards applied / not applicable]
- Framework standards: [list loaded framework standards applied / not applicable]
- Platform standards: [list loaded platform standards applied / not applicable]
- Project-specific standards: [list user-provided standards applied / not applicable, or "None provided"]
- Key rules applied: [3-5 specific rule IDs or named rules that most influenced the code written]
- Standard overrides: [any place where the codebase deviated and new code followed the standard instead]

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
- [ ] All applicable standards loaded during orientation were followed — common, common testing, language, framework, platform, and project-specific standards as applicable
- [ ] Standard overrides were applied where orientation flagged codebase deviations
- [ ] Tests use the correct framework API for the detected version
- [ ] The phase's Automated Verification commands all pass
- [ ] All Success Criteria are met
- [ ] Three-dimension check (Completeness, Correctness, Coherence) reports no gaps
- [ ] Standards Applied section lists all loaded standards categories, key rules applied, and standard overrides

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Agent ignores the plan and implements from its own understanding | Step 1 requires reading the plan; Step 3 rules enforce "follow file paths" and "no scope creep" |
| Agent creates files at incorrect paths, diverging from the plan | Step 1 reads both the plan paths and the codebase to confirm |
| Agent writes all production code first then writes passing tests as an afterthought | Step 3 delegates to tdd-workflow which enforces RED before GREEN |
| Agent introduces regressions in existing code without noticing | Step 4 runs the full test suite, not just new tests |
| Agent claims the phase is done without running verification commands | Step 5 requires executing every AI Gate command and showing output |
| Agent encounters an ambiguity and guesses instead of asking | Step 1 and blocked-step handling enforce "stop and ask" |
| Agent follows a bad codebase pattern instead of the organizational standard | Step 3 rules require standard overrides where orientation flagged deviations |
| Agent loads common standards during orientation but ignores them during code generation | Step 3 requires applying all loaded standards, including common and common testing standards, during execution |
| Agent generates tests using wrong framework API version | Step 3 requires using the testing stack versions from orientation |
| Agent makes architectural decisions beyond the phase scope | Step 3 rules prohibit scope creep; blocked-step handling escalates design changes |
