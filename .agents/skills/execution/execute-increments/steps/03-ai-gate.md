---
slug: 03-ai-gate
sequence: 3
depends-on-prior: true
---

# Step 3 — AI Gate (Automated Verification)

## Purpose

Validate the increment against its Automated Verification (AI Gate)
section. The AI Gate verifies **mechanics** — does it work?

## Iron rules

1. **Fresh evidence in the current turn.** Stale or remembered output does
   not count. Re-run the verification commands now.
2. **Read the full output.** Not just the first or last line. Cite the
   specific pass/fail count and the relevant assertions.
3. **Match expected results.** The AI Gate section names expected results
   for each verification step. Confirm each.
4. **Failure halts the increment.** Do not proceed to the Human Gate if any
   AI Gate step fails. Debug, fix, re-run.

## Procedure

1. **Read the increment's `Automated Verification (AI Gate)` section.**
2. **For each numbered verification step:**
   - Run the command exactly as specified.
   - Read the full output.
   - Cite the relevant pass/fail line.
   - Compare against the section's `Expected:` list.
3. **Aggregate results.** Either all expected results are observed →
   AI Gate PASS, or one or more are not → AI Gate FAIL.
4. **On FAIL:** invoke `steps/02-execute-plan.md` debug cycle. Use
   systematic debugging — root cause, then fix. Re-run AI Gate.
5. **On PASS:** record in chat with cited evidence; proceed to Step 4
   (Human Gate).

## Anti-patterns

- "Tests pass." → not specific. Cite which suite, which command, which
  count.
- "I ran the tests earlier and they passed." → stale. Re-run now.
- "The subagent reported success." → unverified relay. Re-run yourself or
  verify via VCS diff + test commands.
- Skipping the `Expected:` comparison. The AI Gate's job is verifying
  expected results, not just passing tests in general.

## Output of this step

- AI Gate PASS or FAIL determination with cited fresh evidence
- If FAIL: a record of what failed, the root cause, and the fix that was
  applied; a re-run that PASSes before this step closes
