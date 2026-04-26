# manage-bugs — TRIAGE mode

## Purpose

Update existing bug rows: change status, adjust severity, schedule the
fix. Invoked when the user says "triage bugs", "triage bugs for the
current increment", "prioritize the backlog".

## Procedure

1. **Read the log.** Identify open bugs (status in `{new, to-do, priority,
   hold}`).
2. **Render the open list** so the user can see what is being triaged.
3. **For each bug, prompt or accept user direction** on:
   - **Target status** — `new` → `to-do` / `priority` / `hold`
   - **Severity adjustment** — only if the user wants to re-assess
   - **Scheduling note** — free text (e.g., "fold into INC-006 if scope
     permits", "before INC-006; create new INC", "next bug-fix
     increment")
4. **Recommend handoff** for any bug being scheduled into a new increment
   — point at `create-implementation-package` (new bug-fix increment) or
   `execute-increments` (in-scope fold-in) or
   `quick-dev/execute-quick-change` (trivial drive-by).
5. **Apply updates** to the log entries. Preserve all existing fields;
   only update `status`, `severity` (if changed), and `scheduling-note`
   (added if not already present).
6. **Confirm** in chat: render the diff (what changed) and total triage
   actions taken.

## Status transitions

| From | To | Meaning |
|---|---|---|
| `new` | `to-do` | Triaged; will be fixed eventually |
| `new` | `priority` | Triaged; needs to be fixed soon |
| `new` | `hold` | Deferred indefinitely |
| `new` | `wont-fix` | Closed without fixing (with resolution note) |
| `to-do` | `priority` | Promoted in priority |
| `to-do` | `hold` | Demoted; deferred |
| `priority` | `to-do` | Demoted (priority decision reversed) |
| `priority` | `hold` | Deferred despite earlier priority |
| `hold` | `to-do` / `priority` | Picked back up |

A move to `fixed` happens via CLOSE mode, not TRIAGE.

## Halt conditions

- No open bugs → REVIEW mode is more appropriate; halt with that
  recommendation.
- User wants to fix a bug right now → recommend
  `quick-dev/execute-quick-change` or invoke `execute-increments` for an
  in-scope fold-in; do not attempt to fix from this skill.

## Output

- Updated rows in `bugs-and-issues-log.md`
- Chat summary listing each transition with reasons
- Recommendations for which fix-flow to use for newly-priority items
