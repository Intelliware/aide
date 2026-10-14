---
slug: next-actions
sequence: 5
depends-on-prior: true
---

# Step 5 — Next Actions

## Purpose

For every gap surfaced in Step 4, offer a concrete next-action
hand-off — always to a named framework skill, never a vague
recommendation. If no gaps were found, confirm and exit cleanly.

## Procedure

### 5a. No-gaps path

If every INC's verdict is `✅ Fully covered` or `➖ Not applicable`:

> ✅ Coverage audit complete. All required INCs are covered and every
> claimed marker was verified in the suite.
>
> Would you like to:
> 1. Take a snapshot in the KB now (`/update-knowledge-base`)
> 2. Schedule the next audit
> 3. Exit

### 5b. Gaps path — action mapping

For each gap row in the report, route per the table below. Present
the routed action; let the user pick one to invoke (or exit).

| Verdict | Gap shape | Recommended next skill |
|---|---|---|
| ⚠️ Ready but not started | Dev done, coverage required, no TC implemented (TC-XXX flow used) | `/execute-quality-increments` (pass the next-ready TC ID) |
| ⚠️ Ready but not started | Dev done, coverage required, no TC and no inline tests written (TC-XXX flow not used) | `/execute-increments` (re-open the INC's TDD loop to add the missing test); if the test-design itself is missing the case, route to `/create-quality-package` first |
| ⚠️ Ready but not started | Dev done, no coverage planned in the matrix at all | `/create-quality-package` (extend test-design + traceability), then resume above |
| 🔄 In-progress | TC `in-progress` | (no hand-off — note current owner; offer to resume `/execute-quality-increments` with the same TC) |
| 🔴 Blocked on dev | INC dev status `not-started` / `in-progress` / `blocked` | `/execute-increments` (ship the application increment first) |
| ⚠️ Drift | Tracker says covered but marker missing | `/detect-knowledge-base-drift` to confirm the source-of-truth gap. Then: `/execute-quality-increments` (re-author the missing artifact) **or** `/create-quality-package` (correct the matrix if the coverage claim was wrong). The user chooses based on intent. |
| ⚠️ Anomaly | INC file missing or unreadable | `/review-implementation-package` (the implementation package itself is inconsistent — fix it before the next audit) |
| ⚠️ KB freshness warning | KB exists but is older than the drift threshold | `/detect-knowledge-base-drift` then `/update-knowledge-base`, then re-run `/audit-quality-coverage` |

Group multiple gaps by recommended action when sensible (e.g. "3 INCs
need `/execute-quality-increments` — invoke it once and step through
TC-006, TC-007, TC-009?"). Never bundle different action types into
one invocation.

### 5c. Hand-off

If the user picks an action:

> Invoking `/<skill>` with <inputs derived from the gap>…

Pass the relevant context as inputs (INC ID, TC ID, scope) so the
downstream skill skips redundant elicitation.

If the user wants to exit without acting, that is fine — the audit
report and the `change-tracker.md` row are already persisted.

### 5d. Verification rule

Before exiting, summarise:

> **Audit closed.**
> - Gaps found: <N>
> - Actions taken: <list — or "none, user chose to defer">
> - Audit record:
>   `{paths.quality_package}/<feature-id>/quality/change-tracker.md` (latest
>   row, Trigger: Coverage audit)
> - Tracker bootstrap: <yes / no>

Wait for explicit user acknowledgement before terminating the skill.

## Common errors to avoid

- Recommending "talk to QA" or "investigate" — every action must name
  a specific framework skill.
- Invoking a downstream skill silently. Always show the user the
  command you are about to invoke and let them confirm.
- Routing every drift case to the same skill. The user's intent
  decides whether to re-author the artifact or correct the matrix.
  Ask before assuming.
- Skipping the change-tracker row when the user exits without
  acting. The audit happened; record it regardless.

## End of skill

This is the final step. Control returns to the orchestrator (or the
user) after 5c / 5d.

