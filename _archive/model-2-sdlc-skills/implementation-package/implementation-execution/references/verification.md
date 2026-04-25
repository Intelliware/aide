# Verification

## Purpose

Verify that a feature or fix actually works before declaring done — enforcing the verification-before-completion principle. Iron rule: no success or completion claim without fresh verification in the same turn. Before any commit, task completion, or PR, the agent must: (1) identify the proof command or verification step, (2) run it fully in the current turn (not from memory or a prior run), (3) read the complete output, (4) only then claim success with the evidence. Applies to: task completion (run the task's success criteria and show output), commits (full test suite passes — show the run), PR readiness (all tests green — show the run), and delegated work (verify via VCS diff and commands, not subagent reports alone). Prevents the common failure mode where the agent says "all tests pass" based on a stale run, an assumption, or a partial output read. Verification checks three dimensions: (1) Completeness — all tasks done, all acceptance criteria implemented, all scenarios from the spec have corresponding code and tests; (2) Correctness — implementation matches the design spec's intent, edge cases handled, error states match spec definitions, tests assert the right behavior not just that code runs; (3) Coherence — design decisions from the plan are reflected in the code structure, naming conventions match project-context.md, patterns consistent with the codebase, no drift between plan and implementation. A verification pass must report on all three dimensions — a task is not done until all three are satisfied.

## What This Does

Enforces the principle that no work is declared complete without fresh, evidence-based proof in the current turn. This skill prevents the most common AI agent failure mode: claiming success based on a stale test run, a prior session's results, an assumption, or a partial output read.

This is not a testing skill — it does not create tests. It is a **verification discipline** that validates work is actually done before the agent asserts that it is.

## When to Use

- After completing any implementation phase (before marking status as `done`)
- Before any commit
- Before any PR submission
- When reviewing delegated subagent work
- When the implementation workflow requires verification at any checkpoint

## Iron Rule

**No success or completion claim without fresh verification in the same turn.**

This means:
- "Fresh" — Run the command now, not from memory or a prior run
- "Same turn" — In this agent response, not a previous one
- "Complete output" — Read the full output, not just the exit code or last line
- "Claim with evidence" — Cite the specific output that proves the claim

---

## The Verification Protocol

```
┌──────────────────────────────────────────────────────────────────┐
│  VERIFICATION PROTOCOL                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. IDENTIFY ──► What proof is needed?                           │
│     Read the phase's AI Gate, Success Criteria, and ACs          │
│                                                                  │
│  2. RUN ────────► Execute each proof command                     │
│     Full command, not truncated. In this turn, not from memory.  │
│                                                                  │
│  3. READ ───────► Read the COMPLETE output                       │
│     Not just the exit code. Not just the last line.              │
│     Not "it looks like it passed."                               │
│                                                                  │
│  4. EVALUATE ──► Check all three dimensions                      │
│     Completeness, Correctness, Coherence                         │
│                                                                  │
│  5. REPORT ────► State the verdict with evidence                 │
│     "All 47 tests pass (output above). All 6 ACs are met."      │
│     NOT "tests pass" without showing the run.                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Identify What to Verify

From the phase specification, extract every verification requirement:

| Source | What to Extract |
|--------|----------------|
| **Automated Verification (AI Gate)** | Specific commands to run and their expected outputs |
| **Success Criteria** | Binary checklist items — each must be evaluated |
| **Inline ACs (all types)** | Acceptance criteria embedded in plan steps — each must be checked. This includes FR ACs (`AC-REQ-`), business rule ACs (`AC-BR-`), data ACs (`AC-DATA-`), permission ACs (`AC-ACR-`, `AC-PERM-`), NFR ACs (`AC-NFR-`), and error-path ACs from any artifact type |
| **Test plan** | Which test suites must pass (unit, integration, component, E2E) |

**Build a verification checklist** before running anything:

```
Verification Checklist for Phase [ID]:
□ Command 1: [command] — expected: [expected output]
□ Command 2: [command] — expected: [expected output]
□ Success Criterion 1: [criterion] — how to verify: [method]
□ Success Criterion 2: [criterion] — how to verify: [method]
□ AC-REQ-NNN-N: [FR acceptance criterion] — verified by: [test name or command]
□ AC-BR-NNN-N: [business rule AC] — verified by: [test name or command]
□ AC-DATA-NNN-N: [data AC] — verified by: [test name or command]
□ AC-ACR-NNN-N / AC-PERM-NNN-N: [permission AC] — verified by: [test name or command]
□ AC-NFR-CAT-NNN-N: [NFR AC, including degraded-mode] — verified by: [test name or command]
□ Error-path ACs: [any error-path AC from any type] — verified by: [test name or command]
□ Full test suite: [command] — expected: all pass, 0 failures
□ Build/compile: [command] — expected: clean build, 0 warnings
□ Lint: [command] — expected: 0 errors
```

### Step 2 — Run Each Proof Command

Execute every command from the checklist. For each:

| Requirement | Detail |
|------------|--------|
| Run it now | In this turn, not from a prior run or memory |
| Run it fully | Do not truncate the command or skip flags |
| Capture output | The full stdout and stderr |
| Note the exit code | 0 = success, non-zero = failure |

**Order of execution:**
1. Build/compile first — if it does not build, nothing else matters
2. Lint — if it has errors, fix them before running tests
3. Unit tests — the fastest feedback
4. Integration tests — if applicable
5. Component tests — if applicable
6. E2E tests — if applicable
7. Phase-specific AI Gate commands

### Step 3 — Read the Complete Output

For each command output:

| What to Read | Why |
|-------------|-----|
| Total test count | Confirms all tests ran, not a subset |
| Pass/fail count | Confirms 0 failures |
| Specific failure messages | If any failure exists, read the full message — do not dismiss |
| Warnings | May indicate issues even if tests pass |
| Skipped tests | Skipped tests are hidden failures — investigate why |
| Coverage report | If the phase requires coverage thresholds |

**Banned phrases before complete reading:**
- "Tests should pass" — did they?
- "It looks like" — is it or isn't it?
- "Based on our implementation" — show the output
- "All tests pass" — show the run

### Step 4 — Evaluate Three Dimensions

Every verification must assess all three dimensions. A phase is not complete until all three are satisfied.

#### Dimension 1: Completeness

> "Did we build everything the plan specified?"

| Check | How to Verify |
|-------|--------------|
| All plan steps executed | Walk through each step in the phase — was it implemented? |
| All ACs met (all types) | For each inline AC — FR ACs (`AC-REQ-`), business rule ACs (`AC-BR-`), data ACs (`AC-DATA-`), permission ACs (`AC-ACR-`, `AC-PERM-`), NFR ACs (`AC-NFR-`), and error-path ACs — identify the test or evidence that satisfies it |
| All scenarios covered | For each scenario in the design spec, confirm a corresponding test exists. For error-path ACs, confirm the failure/degraded scenario has a test |
| No steps skipped | Compare the plan step list against the files created/modified |
| All deliverables present | Check the phase's Outcome section — are all listed deliverables present? |

**Evidence format:** List each AC (by its full ID — `AC-REQ-`, `AC-BR-`, `AC-DATA-`, `AC-ACR-`, `AC-PERM-`, `AC-NFR-`) and the specific test that covers it.

#### Dimension 2: Correctness

> "Did we build it right?"

| Check | How to Verify |
|-------|--------------|
| Implementation matches design spec intent | Read the inline design spec, then read the code — do they match? |
| Edge cases handled | Are the error and edge cases from the spec implemented, not just the happy path? |
| Error states match spec | Do error responses, exception types, and error messages match what the spec defines? |
| Tests assert correct behavior | Do tests assert on the right values, not just that code runs without exception? |
| No hardcoded values that should be configurable | Check for magic numbers, hardcoded URLs, or embedded credentials |

**Evidence format:** Cite specific test assertions that prove correctness.

#### Dimension 3: Coherence

> "Does it fit with everything else?"

| Check | How to Verify |
|-------|--------------|
| Naming matches project-context.md | File names, class names, variable names follow documented conventions |
| Patterns match codebase | New code follows the same patterns as existing code (DI, error handling, logging) |
| No drift from plan | The implementation matches the plan — no added scope, no dropped scope, no changed interfaces |
| Integration points work | New code integrates cleanly with existing code — no broken imports, no type mismatches |

**Evidence format:** Confirm conventions are followed; list any deviations.

### Step 5 — Report the Verdict

State the verification result with evidence:

**If all three dimensions pass:**

```
## Verification — Phase [ID]: PASS

### Proof Commands
- `npm test`: 47 tests, 47 passed, 0 failed (output above)
- `npm run build`: Clean build, 0 errors, 0 warnings
- `npm run lint`: 0 errors, 0 warnings

### Completeness
All [N] acceptance criteria (across all types) are met:
- AC-REQ-NNN-N: [FR criterion] — verified by test [test name] (line N)
- AC-BR-NNN-N: [business rule criterion] — verified by test [test name] (line N)
- AC-DATA-NNN-N: [data criterion] — verified by test [test name] (line N)
- AC-PERM-NNN-N: [permission criterion] — verified by test [test name] (line N)
- AC-NFR-CAT-NNN-N: [NFR criterion] — verified by test [test name] (line N)
- Error-path ACs: [N] verified

### Correctness
- All [N] test assertions verify correct behavior
- Error cases: [list error scenarios] — all tested
- Edge cases: [list edge cases] — all tested

### Coherence
- File naming: matches project convention ([convention])
- Code patterns: matches existing [pattern] pattern
- No scope drift from plan
```

**If any dimension fails:**

```
## Verification — Phase [ID]: FAIL

### Failures
1. [Dimension]: [specific failure]
   - Evidence: [what was found]
   - Required: [what was expected]
   - Action: [what must be fixed]

### What Passed
- [List passing dimensions with evidence]
```

---

## Verification Contexts

### Task Completion

Before marking a task/phase as `done`:
- Run the phase's AI Gate commands
- Check all Success Criteria
- Evaluate all three dimensions
- Present evidence to the user

### Commit

Before committing code:
- Full test suite passes (fresh run, show output)
- Build/compile succeeds (show output)
- Lint passes (show output)
- No `TODO`, `FIXME`, or `HACK` comments introduced (unless explicitly planned)

### PR Readiness

Before declaring PR-ready:
- All phases included in the PR are individually verified
- Full test suite passes against the combined changes
- No merge conflicts
- Branch is up to date with the target branch

### Delegated Subagent Work

When reviewing work from a subagent:
- Do not trust the subagent's report alone
- Read the code via VCS diff
- Run the test commands independently
- Verify the three dimensions from your own reading of the code

---

## Regression Verification

When fixing a bug (via `systematic-debugging.md`):

1. Write a failing test that exposes the bug
2. Run the test — confirm it fails (RED)
3. Implement the fix
4. Run the test — confirm it passes (GREEN)
5. **Revert the fix** — confirm the test fails again
6. **Restore the fix** — confirm the test passes again
7. Run the full test suite — confirm no regressions

Steps 5-6 prove the fix (not something else) caused the test to pass. This prevents false confidence from coincidental passes.

---

## Banned Behaviors

| Banned Behavior | Why | What to Do Instead |
|----------------|-----|-------------------|
| Claiming "tests pass" without showing the run | Stale results or assumptions are not evidence | Run the tests, show the output |
| Reading only the exit code | Exit code 0 with skipped tests or warnings is not "all pass" | Read the full output — test count, failures, skips, warnings |
| Using "should," "probably," or "seems" in verification | Uncertainty is not verification | State facts with evidence |
| Verifying from a prior turn's output | The code may have changed since then | Run commands fresh in this turn |
| Accepting a subagent's "all tests pass" claim | Subagents can make the same mistakes | Verify independently via diff and commands |
| Declaring completion before all three dimensions are checked | Incomplete or incoherent code is not done | Check Completeness, Correctness, and Coherence — all three |

---

## Completion Criteria

- [ ] Every proof command from the AI Gate has been run in this turn
- [ ] Full test suite output has been read (test count, pass/fail, skips, warnings)
- [ ] Build/compile output confirms clean build
- [ ] Lint output confirms 0 errors
- [ ] Completeness dimension: all ACs across all types (`AC-REQ-`, `AC-BR-`, `AC-DATA-`, `AC-ACR-`, `AC-PERM-`, `AC-NFR-`, and error-path ACs) mapped to evidence
- [ ] Correctness dimension: implementation matches spec intent; edge/error cases covered
- [ ] Coherence dimension: naming, patterns, and integration match project conventions
- [ ] Verdict stated with specific evidence (not assertions without proof)
- [ ] No banned behaviors (no "should pass," no stale results, no partial reads)

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Agent says "all tests pass" based on a test run from 10 minutes ago — code has changed since | Iron Rule requires fresh verification in the same turn |
| Agent reads the exit code (0) but misses that 12 tests were skipped | Step 3 requires reading total count, pass/fail count, AND skipped count |
| Agent claims phase is done but missed an acceptance criterion | Completeness dimension maps every AC to its evidence |
| Agent's tests pass but test the wrong thing — assertions are too loose | Correctness dimension checks that assertions verify correct behavior, not just that code runs |
| Agent's code works but doesn't follow project conventions — inconsistent naming and patterns | Coherence dimension checks naming, patterns, and integration with existing codebase |
| Agent trusts a subagent's claim that work is complete without independent verification | Delegated work verification requires independent diff reading and command execution |
| Agent fixes a bug but the test happened to pass coincidentally — the fix is wrong | Regression verification protocol (revert-then-restore) catches coincidental passes |
| Agent claims completion before checking all dimensions — completeness OK but correctness fails | All three dimensions must be evaluated — partial verification is not verification |
