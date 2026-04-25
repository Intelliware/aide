# manage-bugs — LOG mode

## Purpose

Append a new bug entry to `bugs-and-issues-log.md`. Invoked when the user
says "log a bug", "capture this issue", "track this defect" — typically
mid-execution from `execute-increments`, but also stand-alone.

## Procedure

1. **Read the log** to determine the next sequential bug ID
   (`BUG-001`, `BUG-002`, …). If the log doesn't exist, create it with the
   header from the template.
2. **Gather schema fields** from the user (or, if invoked from another
   skill, from the calling context):
   - `title` — required, one-line
   - `severity` — required: `critical` / `high` / `medium` / `low`
   - `repro-steps` — required, multi-line; another agent must be able to
     follow them
   - `impact-type` — required: `defect` / `missed-requirement` /
     `new-requirement` / `deferred-work`
   - `increment-id` — required; passed by caller, or `none` if pre-exec
   - `affected-components` — recommended; KB component IDs
   - `requirements-impacted` — recommended; FR IDs
   - `design-impacted` — recommended; design file paths
   - `suspected-root-cause` — optional but encouraged
3. **Auto-stamp**:
   - `id` from sequential counter
   - `date-found` from today
   - `found-by` from caller context
   - `status` = `new`
4. **Validate** required fields are populated. If any required field is
   missing, ask the user before writing.
5. **Append** the entry to `bugs-and-issues-log.md` using the standard
   format (Markdown heading + YAML frontmatter + Markdown body).
6. **Confirm** in chat: "BUG-XXX logged (status: new)". If invoked from
   another skill (e.g., `execute-increments`), return control so the
   caller resumes.

## Severity guidance

| Severity | Meaning |
|---|---|
| `critical` | Production-down, data loss, security breach, or blocks all execution |
| `high` | Significant defect with no workaround, or missed requirement essential to the feature |
| `medium` | Defect with a workaround, or missed requirement non-essential to the feature |
| `low` | Cosmetic, minor edge case, or deferred polish |

## Impact-type guidance

| Impact type | When to use |
|---|---|
| `defect` | Implementation does not match the increment's spec |
| `missed-requirement` | Capability that should have been specified but wasn't |
| `new-requirement` | New capability that emerged during execution and should be considered |
| `deferred-work` | In-scope work the user has chosen to defer |

## Halt conditions

- The implementation-package directory cannot be located → ask user for
  path.
- Required fields not provided after prompting → halt; do not write a
  malformed entry.

## Output

- New row in `bugs-and-issues-log.md`
- Chat confirmation citing the new BUG-XXX ID
- Control returns to caller (if invoked from another skill)
