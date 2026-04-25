# manage-bugs — REVIEW mode

## Purpose

Read-only inspection of `bugs-and-issues-log.md`. Invoked when the user
says "review open bugs", "show me the bugs", "what bugs do we have", "bug
status report".

## Procedure

1. **Read the log.** Parse all entries.
2. **Apply filters** (if the user requested any):
   - by status (`new`, `to-do`, `priority`, `hold`, `fixed`, `wont-fix`)
   - by severity (`critical`, `high`, `medium`, `low`)
   - by increment (`INC-XXX`)
   - default: open bugs only (status in `{new, to-do, priority, hold}`)
3. **Render** as a table with the most useful columns first:

   ```
   | ID       | Title                | Sev    | Inc     | Status |
   |----------|----------------------|--------|---------|--------|
   | BUG-007  | …                    | medium | INC-005 | new    |
   | …        | …                    | …      | …       | …      |
   ```

4. **Append summary statistics**:
   - Total bugs (and breakdown by status)
   - Open bugs by severity
   - Bugs blocking specific increments
5. **No file changes.** REVIEW mode is read-only.

## Useful filter shortcuts

- "open bugs" → status in `{new, to-do, priority, hold}`
- "blocking" → severity in `{critical, high}` AND status `new` or `to-do`
- "for INC-005" → increment-id = `INC-005`
- "fixed last week" → status `fixed` AND fixed-date in last 7 days

## Output

- Rendered summary in chat (table + statistics)
- Optional: highlight bugs that should be triaged (severity high or
  critical with status `new`)
- No file mutations
