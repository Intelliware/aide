# Systematic Debugging

## Purpose

4-phase root cause debugging — investigate, pattern analysis, hypothesis testing, implementation. No fixes without root cause.

## What This Does

Provides a structured, evidence-based approach to diagnosing and fixing bugs. This skill replaces the instinct to "try a quick fix" with a disciplined process that identifies the root cause before any code is changed.

## When to Use

- When a test fails during TDD and the failure is not immediately obvious
- When a regression appears after integration (prior test broke)
- When the implementation produces incorrect results despite passing tests
- When an error occurs in a dependency, environment, or external service
- Called by the implementation workflow when issues arise during execution

## Iron Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | No fix without completing Phase 1 (Investigation) | Fixes without understanding cause regressions |
| 2 | One hypothesis at a time | Multiple changes make it impossible to know which worked |
| 3 | One fix at a time | Same reason — verify each change independently |
| 4 | After 3 failed fix attempts, question the architecture | Repeated failure indicates a design problem, not a code problem |
| 5 | Write a failing test before the fix | The fix must be verified by the same discipline as features (TDD) |

---

## The 4-Phase Process

```
┌──────────────────────────────────────────────────────────────────┐
│  SYSTEMATIC DEBUGGING — 4 PHASES                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHASE 1: INVESTIGATE ──► Gather evidence                        │
│     Read errors, reproduce, trace data flow,                     │
│     instrument at boundaries                                     │
│              │                                                   │
│              ▼                                                   │
│  PHASE 2: ANALYZE ──────► Identify patterns                      │
│     Compare working vs broken, narrow scope,                     │
│     form a single hypothesis                                     │
│              │                                                   │
│              ▼                                                   │
│  PHASE 3: VERIFY ───────► Test the hypothesis                    │
│     Predict what will happen if hypothesis is correct,           │
│     run a discriminating check, confirm or reject                │
│              │                                                   │
│              ▼                                                   │
│  PHASE 4: FIX ──────────► Implement the fix                      │
│     Failing test first, minimal fix, verify,                     │
│     confirm no regressions                                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Phase 1 — Investigate

Gather evidence. Do not theorize yet.

### 1a. Read the Error

| What to Read | What to Extract |
|-------------|----------------|
| Error message | The exact error text — not a paraphrase |
| Stack trace | The call chain — which file, function, and line |
| Error type/code | Exception class, HTTP status, exit code |
| Logs | Preceding log entries that show what happened before the failure |
| Test output | Which assertion failed, expected vs actual values |

**Read the full output.** Not just the last line. Truncated output hides context.

### 1b. Reproduce the Failure

Run the exact command that produces the error. Confirm you see the same failure. If you cannot reproduce it, you cannot fix it.

| Reproducibility | Action |
|----------------|--------|
| Consistently reproduces | Proceed to 1c |
| Intermittent | Record the conditions under which it does and does not reproduce. Look for timing, concurrency, or state-dependent causes. |
| Cannot reproduce | Check environment differences — versions, config, data. The bug may be in setup, not code. |

### 1c. Trace the Data Flow

Follow the data from input to the point of failure:

1. What input was provided? (test input, request body, function arguments)
2. Which function/method received it first?
3. What transformations happened before the failure point?
4. Where exactly did the data diverge from expectations?

For multi-layer systems (controller → service → repository → database), **instrument at component boundaries** — add logging or breakpoints where data crosses a layer. The failure is usually at a boundary where assumptions about data shape or type change.

### 1d. Check Recent Changes

| Check | How |
|-------|-----|
| Git diff | What changed since the last green state? |
| Recent file modifications | Did an unrelated change touch a shared module? |
| Dependency updates | Did a library version change? |
| Configuration changes | Did an environment variable or config file change? |

---

## Phase 2 — Analyze

With evidence gathered, narrow the scope and form a hypothesis.

### 2a. Compare Working vs Broken

| Comparison | What to Look For |
|-----------|-----------------|
| Working test vs failing test | What input difference causes the failure? |
| Current code vs last green commit | What code change introduced the failure? |
| Working environment vs broken environment | What configuration or version difference matters? |

### 2b. Narrow the Scope

Eliminate possibilities systematically:

| Technique | When to Use |
|-----------|-------------|
| Binary search through changes | Many changes since last green — bisect to find the breaking change |
| Simplify the input | Complex input fails — reduce to the minimal failing input |
| Remove components | Multi-component system — isolate which component is responsible |
| Substitute dependencies | Mock or stub a dependency — does the failure go away? Then the dependency (or the interaction with it) is the cause |

### 2c. Form a Single Hypothesis

State the hypothesis clearly:

> "The failure occurs because [specific cause] in [specific location], which results in [observed error] when [specific condition]."

**A good hypothesis:**
- Points to a specific location (file, function, line)
- Explains the mechanism (not just "something is wrong")
- Predicts behavior (if this hypothesis is correct, then X should be true)
- Is falsifiable (there is a check that could disprove it)

**A bad hypothesis:**
- "Something is wrong with the configuration" (too vague)
- "Maybe it's a timing issue" (no specific mechanism)
- "Try updating the dependency" (a guess, not a hypothesis)

---

## Phase 3 — Verify the Hypothesis

Test the hypothesis before changing code.

### 3a. Predict

If the hypothesis is correct, what should be true?

| Prediction Type | Example |
|----------------|---------|
| Data prediction | "If the null comes from the repository, adding a log at line 42 will show null before the service transforms it" |
| Behavioral prediction | "If the timeout is too short, increasing it to 30s will make the test pass" |
| Negative prediction | "If the hypothesis is correct, the test should still fail even when I change input X (because the bug is in the transformation, not the input)" |

### 3b. Run a Discriminating Check

Run a check that distinguishes between your hypothesis and alternatives:

| Check Type | How |
|-----------|-----|
| Logging/instrumentation | Add a targeted log and run the test — does the log show what the hypothesis predicts? |
| Controlled experiment | Change one variable (input, config, mock) and observe — does behavior change as predicted? |
| Counter-test | Construct an input that the hypothesis says should work — does it? |

### 3c. Confirm or Reject

| Result | Action |
|--------|--------|
| Prediction matches observation | Hypothesis confirmed — proceed to Phase 4 |
| Prediction does not match | Hypothesis rejected — return to Phase 2 with new evidence from this check |

Do not force-fit results. If the evidence does not clearly support the hypothesis, reject it and form a new one.

---

## Phase 4 — Fix

The root cause is identified and verified. Now fix it.

### 4a. Write a Failing Test

Before changing any production code, write a test that:
1. Exposes the bug (fails against the current code)
2. Will pass when the bug is fixed
3. Will catch regressions if the bug is reintroduced

This follows the TDD discipline — the fix starts with RED.

### 4b. Implement the Minimal Fix

Change as little code as possible to fix the bug:

| Rule | Rationale |
|------|-----------|
| One change only | If the fix requires two changes, verify each independently |
| Minimal scope | Fix the root cause, not symptoms — but don't refactor while fixing |
| No drive-by improvements | Fix the bug, nothing else — refactoring is a separate step |

### 4c. Verify the Fix

1. Run the failing test — it must now pass (GREEN)
2. Run the full test suite — no regressions
3. If the original failure was from a specific command, re-run that command — it must now succeed
4. Re-run the check from Phase 3b — the discriminating evidence should confirm the fix

### 4d. Regression Guard

Confirm the fix is permanent:
1. The test from 4a must be part of the test suite going forward
2. If possible, add a code comment at the fix site linking to the test (not explaining the fix, just referencing the test that guards it)

---

## Escalation

### After 3 Failed Fix Attempts

If three attempts at Phase 4 have failed (the fix does not resolve the issue or introduces new failures), stop trying to fix and escalate:

1. **Document** what was tried and why each attempt failed
2. **Question the architecture** — the repeated failure likely indicates a design problem:
   - Is the component doing too much?
   - Is the interface contract unclear?
   - Is there a hidden coupling that makes the fix unstable?
3. **Report to the user** with the evidence gathered and a recommendation to reassess the approach

Do not continue cycling through Phase 4 beyond three attempts.

### Agent-Specific Stalls

If the agent itself is looping (repeating the same investigation, asking the same questions, or producing similar failed fixes):

| Signal | Action |
|--------|--------|
| Same error after "fix" | The fix did not address the root cause — return to Phase 2, do not re-attempt Phase 4 |
| Fix succeeds but new error appears | The fix was correct but revealed a deeper issue — start a fresh 4-phase cycle for the new error |
| Cannot reproduce | Check if the environment changed between runs (test isolation, shared state, parallel execution) |
| Cannot form a hypothesis | The investigation (Phase 1) is incomplete — gather more evidence before analyzing |

---

## Output

After debugging, report:

```
## Debug Report — [brief description]

### Root Cause
[One sentence: what was wrong and why]

### Evidence
- [Key observation 1 — what was checked and what was found]
- [Key observation 2]
- [Discriminating check result]

### Fix
- File: [path]
- Change: [what was changed and why]
- Test: [path to regression test]

### Verification
- Regression test: PASS
- Full test suite: PASS (N tests, 0 failures)
- Original failure command: PASS
```

---

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Agent sees an error and immediately tries a "quick fix" without understanding | Iron Rule 1 — no fix without completing Phase 1 |
| Agent changes three things at once and cannot tell which one worked | Iron Rule 2/3 — one hypothesis, one fix at a time |
| Agent loops endlessly trying variations of the same fix | Escalation rule — after 3 failed attempts, stop and reassess |
| Agent fixes the symptom (suppress the error) instead of the root cause | Phase 2 analysis and Phase 3 verification force identification of the actual cause |
| Agent fixes the bug but breaks something else | Phase 4c requires full test suite verification; Phase 4a ensures a regression test exists |
| Agent claims the bug is fixed based on one test passing without checking the full suite | Phase 4c verification requires full suite pass and re-running the original failure |
| Agent cannot reproduce the bug and gives up | Phase 1b provides strategies for intermittent and non-reproducible failures |
