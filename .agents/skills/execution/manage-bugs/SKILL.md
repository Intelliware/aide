---
name: manage-bugs
description: "Use when the user asks to log a bug, capture an issue, review open bugs, triage bugs for the current increment, close a bug, or manage the bugs-and-issues log. Independently invocable: works whether or not an increment is being executed. Operates on bugs-and-issues-log.md in the implementation package."
---

# Manage Bugs

Independently invocable bug-management skill. Reads and writes
`bugs-and-issues-log.md` in the implementation-package directory. Supports
four operating modes — log, review, triage, close — each invocable on its
own. Bugs and issues are first-class artifacts of the execution stage:
defects, missed requirements, and out-of-scope work that surfaces during
execution all flow through this skill.

## Overview

The execution stage produces three kinds of issues:

1. **Defects** — the implementation does not meet the increment's spec
2. **Missed / new requirements** — a capability that should exist was not
   specified or planned
3. **Deferred work** — items the user wants to handle later (out-of-scope
   for the current increment)

All three are bugs in this skill's vocabulary. Each gets logged with a
stable ID, severity, the increment that surfaced it, reproduction steps,
and a status. Triage assigns or defers them; close records the resolution.

This skill does not fix bugs — that is the job of `execute-increments` (for
in-scope fixes) or a future bug-fix increment. This skill manages the log.

## When to use

- The user says "log a bug", "capture this issue", "track this defect", "we
  need to log a new issue", "review the open bugs", "triage bugs for this
  increment", "close bug #N", "what bugs are blocking us", or "show me the
  bugs log"
- A bug surfaced during `execute-increments` and the user wants to log
  rather than fix in scope
- The user wants to review the backlog of issues independently of any
  active increment

## When NOT to use

- The user wants to **fix** a bug — that is `execute-increments` (for
  in-scope work) or a new bug-fix increment authored via
  `create-implementation-package`
- The user wants to log a code-review finding — those go in the PR review,
  not the bugs log
- The user wants to track requirement changes — those go in the
  requirements-package change tracker

## Inputs

| Input | Source | Required |
|---|---|---|
| Implementation package | `{project.paths.implementation_package}/{feature-id}/` | Yes (for path to `bugs-and-issues-log.md`) |
| `bugs-and-issues-log.md` | `{project.paths.implementation_package}/{feature-id}/bugs-and-issues-log.md` | Yes (created if missing) |
| Increment context | the calling increment ID, if invoked from `execute-increments` | Conditional |
| project.toml | `{project-root}/project.toml` | Yes |

See `references/INPUTS-OUTPUTS.md` for the full inputs/outputs tables and
the bug schema.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode B, before determining the mode. If `features.toml` is absent, skip feature resolution, but still map this skill's paths per that file's § *Not opted in* before reading or writing — they are spelled in the opted-in form. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` (`caller: manage-bugs`, `caller_mode: select-only`) rather than guessing which feature's log to operate on. Create is suppressed because the implementation-package directory is a required input and the log is written inside it — a feature with no package has no log to operate on, so minting one here would produce a feature with nothing in it. "Independently invocable" means independent of an increment *session*, not of the package. If it resolves, echo the feature ID and the resolved log path before the first read or write. Applies to all four modes, including REVIEW.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow — four operating modes

This skill is invoked in exactly **one** of four modes per call. Determine
the mode from the user's intent.

### Mode 1: LOG (create a new bug entry)

Triggered by "log a bug", "capture this issue", "track this defect".

Procedure: see `references/log-mode.md`.

Inputs gathered: title, severity, reproduction steps, current increment
ID (if applicable), affected components, suspected root cause, impact
type (defect / missed-requirement / deferred-work).

Output: a new entry in `bugs-and-issues-log.md` with status `new`.

### Mode 2: REVIEW (read-only inspection of the log)

Triggered by "review open bugs", "show me the bugs", "what bugs do we have",
"bug status report".

Procedure: see `references/review-mode.md`.

Output: a rendered summary of the log, optionally filtered by status,
severity, or increment.

### Mode 3: TRIAGE (assign status, severity, scheduling)

Triggered by "triage bugs", "triage bugs for the current increment",
"prioritize the backlog".

Procedure: see `references/triage-mode.md`.

Output: bug rows updated with status (`new` → `to-do` / `priority` /
`hold`), severity adjustments, scheduling notes.

### Mode 4: CLOSE (record resolution)

Triggered by "close bug #N", "mark fixed", "resolve this issue".

Procedure: see `references/close-mode.md`.

Output: bug row updated to `fixed` (or `wont-fix`) with resolution notes
and the closing commit / increment ID.

## Output

Per invocation:

- Updated `bugs-and-issues-log.md` (rows added, modified, or closed
  depending on mode)
- A summary in chat reporting what changed

## Next skill

Typically back to `execute-increments` if invoked mid-execution, or to
whatever the user was doing. This skill does not unilaterally trigger a
fix; bug fixes are scheduled by the user via:

- `create-implementation-package` (to author a new bug-fix increment), or
- `quick-dev/execute-quick-change` (for small drive-by fixes)

## Common mistakes

- **Logging vague bugs.** Each entry needs reproduction steps that another
  agent can execute, not "X is broken sometimes".
- **Skipping severity.** Severity drives triage. Default to a severity
  rather than leaving it blank.
- **Confusing this skill with a fix-it skill.** This skill manages the
  log; it does not write production code.
- **Writing to the log directly from another skill.** Other skills should
  invoke this one; that keeps the log schema enforcement and the rendering
  logic in one place.
- **Mixing modes in one call.** Do log, then review, then triage as
  separate calls if needed; do not blend.
