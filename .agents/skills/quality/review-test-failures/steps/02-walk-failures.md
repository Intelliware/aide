---
slug: walk-failures
sequence: 2
depends-on-prior: true
---

# Step 2 — Walk Failures (One at a Time)

## Purpose

Present each failure to the user in a consistent, evidence-first
format, and hand control to Step 3 for classification + remediation.

The iron rule: **one failure at a time, never a dump**. Dumping a
batch of failures and asking the user to react is the single most
common way to mis-classify.

## Procedure

### 2a. Present the failure

For each failure in the canonical list from Step 1, present this
block:

```markdown
## Failure [N] of [total]

**Scenario / spec:** <name>
**File:** <path>
**Failed step / assertion:** <step text or assertion expression>
**Error:** <error message — full first line, then up to 3 lines of context>

**Evidence:**
- Log excerpt: <log_path>:<line-range>
- Report row: <report_path>#<anchor or row>
- Screenshot: <screenshot_path>  (or "none captured")
- TC ID: <TC-XXX> (or "n/a — inline test")
- Run reference: <run-id / timestamp>

**KB context:** <component name(s) from navigate-knowledge-base, or
"no KB configured">
```

Render the full block in chat. Do not summarise; do not skip evidence.
If a piece of evidence is missing, say so explicitly (`screenshot: not
captured this run`) rather than omitting the line.

### 2b. Hand off to Step 3 for classification

Once the failure is presented, immediately proceed to Step 3 (which
classifies it, proposes a remediation, and waits for user approval).
Step 3 returns control here when the user has approved (or overridden)
the classification.

### 2c. Advance only on approval

Do **not** advance to the next failure until Step 3 has recorded the
user's verdict for the current one. If the user asks for more
evidence, more context, or wants to dig into the failure, oblige —
re-read the underlying files, present what you find, then re-ask for
classification.

If the user wants to skip a failure, record `skipped — user deferred`
in the running summary and advance.

If the user wants to stop mid-batch:

- Persist the running summary in chat (so it isn't lost)
- Note which failures were triaged vs. skipped vs. unreviewed
- Tell the user how to resume: "Re-invoke `/review-test-failures`
  with the same failure set; pre-approved triage decisions will be
  carried forward in the summary."
- Stop cleanly; do not advance to Step 4.

### 2d. Loop

Repeat 2a → Step 3 → 2c for each failure in the canonical list. When
the list is exhausted (or the user stops), advance to Step 4 (final
summary).

## Verification rule (always-on, in addition to Step 3's approval gate)

Before advancing the loop, the running summary table (one row per
triaged failure) should be present in chat so the user can scroll
back and see the cumulative state. Append the new row immediately
after each approval.

## Next

After each failure: proceed to `steps/03-classify-and-remediate.md`.
After the loop closes: proceed to `steps/04-final-summary.md`.

