# manage-bugs — Overview

## Purpose

Independently invocable bug-management skill that owns `bugs-and-issues-log.md`
inside the implementation-package directory. Provides four operating modes
— log, review, triage, close — each invocable on its own. Other skills
(notably `execute-increments`) invoke this skill rather than writing to the
log directly, so the log's schema and rendering live in one place.

## Why this is a separate skill (not part of `execute-increments`)

Three reasons:

1. **Independent invocability.** Users routinely want to log a bug, review
   open bugs, or triage the backlog without an active increment. Embedding
   bug management inside `execute-increments` would require launching that
   skill just to add a row to the log.
2. **Single owner of the log schema.** Centralizing read/write in one skill
   means the bug schema (id, severity, status, increment ID, repro,
   resolution) is enforced consistently. Other skills cannot drift.
3. **Separation of concerns.** `execute-increments` runs Plan → AI Gate →
   Human Gate → Success Criteria. `manage-bugs` owns the issues backlog.
   Mixing them creates a 12-step skill that nobody can reason about.

## When to use

- "Log this as a bug" mid-execution
- "Review open bugs" between increments
- "Triage the backlog" before scheduling a new bug-fix increment
- "Close bug #N" after the fix lands
- Any free-standing bug log interaction

## When NOT to use

- Fixing a bug — use `execute-increments` (in-scope) or
  `create-implementation-package` (new bug-fix increment) or
  `quick-dev/execute-quick-change` (drive-by fix)
- PR review findings — those live in the PR, not in this log
- Requirement change requests — those go in the requirements-package change
  tracker

## Position in workflow

```
                ┌──► manage-bugs (LOG)        ◄── invoked by execute-increments
                │                                 when a bug surfaces
                │
   USER  ─►─────┼──► manage-bugs (REVIEW)     ◄── any time
                │
                ├──► manage-bugs (TRIAGE)     ◄── any time
                │
                └──► manage-bugs (CLOSE)      ◄── after fix lands
```

The skill is **stateless across modes** — every call starts by re-reading
the log. The log is the source of truth.

## Bug life-cycle

```
   new ──► to-do ──► priority ──► (fix happens elsewhere) ──► fixed
    │        │
    │        └──► hold (deferred)
    │
    └──► wont-fix
```

The skill manages transitions between these states; the actual fix work
happens in `execute-increments` or a new increment authored by
`create-implementation-package`. The skill records the resolution
(commit SHA, increment ID, resolution notes) when it closes a bug.
