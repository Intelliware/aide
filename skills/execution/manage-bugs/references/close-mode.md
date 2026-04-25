# manage-bugs — CLOSE mode

## Purpose

Record bug resolution. Invoked when the user says "close bug #N", "mark
fixed", "resolve this issue".

## Procedure

1. **Read the log.** Locate the target bug by ID. If the bug does not
   exist or is already closed (`fixed` or `wont-fix`), halt with that
   info.
2. **Determine the closing transition:**
   - `fixed` — the bug was resolved (production code change shipped)
   - `wont-fix` — closed without a fix (out of scope, not a real bug,
     resolved by environment change, etc.)
3. **Gather closing fields:**
   - `resolution-notes` — required, free text describing the resolution
   - `closing-commit` — required if `fixed`; the full SHA of the commit
     that landed the fix
   - `closing-increment-id` — required if the fix shipped in a specific
     INC; otherwise omit
   - `fixed-date` — auto-stamp from today
4. **Validate.** A `fixed` close must have a `closing-commit`. A
   `wont-fix` close must have a non-empty `resolution-notes`. If either
   is missing, ask before writing.
5. **Apply the update** to the bug row.
6. **Confirm** in chat: render the closed bug's final state.

## Reopening rule

If a "fixed" bug is found to be unresolved later, do not flip the status
back to `new`. Instead:

1. Log a **new** bug entry referencing the original via a back-link in
   `repro-steps` ("see BUG-007 — original fix did not resolve…").
2. Leave the original `fixed` row intact for historical accuracy.

This keeps the log immutable in spirit — each bug ID has a single life
cycle.

## Halt conditions

- Bug ID not found → ask the user to confirm the ID.
- Bug already closed → confirm the user actually wants to update; if so,
  treat as a correction (rare) and surface a warning.
- `fixed` close without a closing commit → ask for the SHA before
  writing.

## Output

- Updated bug row in `bugs-and-issues-log.md` (status, resolution-notes,
  closing-commit, closing-increment-id, fixed-date)
- Chat confirmation citing the closed bug ID and final status
