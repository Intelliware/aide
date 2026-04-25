---
slug: 05-success-criteria
sequence: 5
depends-on-prior: true
---

# Step 5 — Verify Success Criteria

## Purpose

Confirm every binary criterion in the increment's `Success Criteria` section
passes. Success Criteria are the "definition of done" — all must be checked
for the increment to close.

## Iron rules

1. **Every checkbox.** All 4-8 criteria must be verified. Skipping any is
   not allowed.
2. **Binary.** Each criterion is either passed or not. "Mostly done" is not
   passed.
3. **Cite the proof.** Each pass must reference where the proof comes from:
   AI Gate evidence, Human Gate confirmation, or a specific artifact in
   the diff.
4. **A single un-passed criterion halts the increment.** Return to step 2
   (Execute Plan) and address the gap, then re-run from step 3.

## Procedure

1. **Read the increment's `Success Criteria` section.**
2. **For each criterion:**
   - Determine where the proof lives (AI Gate, Human Gate, code artifact)
   - Verify the proof exists
   - Mark the criterion `[x]` (passed) or `[ ]` (not passed)
3. **Render the checklist** with each criterion's pass / fail status and
   the cited proof source.
4. **If all passed:** proceed to Step 6 (status update).
5. **If any failed:** halt. Identify the gap, return to Step 2 (Execute
   Plan) for the missing work, then re-run Steps 3-5.

## Output of this step

- Success Criteria checklist with every item resolved
- Cited proof for each `[x]`
- A clear pass/fail signal on whether the increment can close
