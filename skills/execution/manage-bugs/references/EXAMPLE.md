# manage-bugs — Worked Example

The following shows two real interactions, one in LOG mode (mid-execution)
and one in TRIAGE mode (between increments).

---

## Example 1 — LOG mode (invoked from `execute-increments`)

User context: executing INC-005 (refund processing). During Plan execution,
the agent discovers a defect that is out-of-scope for the current
increment.

```
> Log this as a bug. POST /api/refunds returns 500 when the amount is
> negative — it should return 400 with an RFC7807 error per the design,
> but the validation runs after the refund pipeline starts.

[manage-bugs — LOG mode]

Reading bugs-and-issues-log.md:
  - 6 existing entries; next ID: BUG-007

Gathering schema fields:
  title: /api/refunds returns 500 when amount is negative
  severity: medium (defect, but workaround possible)
  increment-id: INC-005 (passed from execute-increments)
  impact-type: defect
  affected-components: api-billing (from KB lookup of /api/refunds path)
  requirements-impacted: FR4.2.1 (from increment file)
  repro-steps:
    1. POST /api/refunds with { "amount": -10 }
    2. Observe 500 response
  suspected-root-cause: input validation runs after refund-calc pipeline;
    needs to be moved earlier
  found-by: agent (execute-increments)
  date-found: 2026-04-25

Writing BUG-007 to bugs-and-issues-log.md (status: new).

✓ BUG-007 logged. Resuming execute-increments INC-005.
```

What this shows:

- The skill was invoked **from inside** `execute-increments`, which passed
  the active increment ID. The bug entry was stamped with `INC-005`
  automatically.
- Severity was set to `medium` because the bug has a workaround (negative
  amounts are caller-error). A non-recoverable 500 from valid input would
  be `high`.
- Affected component was looked up from the KB rather than guessed.
- The log was appended (not rewritten) — `manage-bugs` is the single
  writer to the file.

---

## Example 2 — TRIAGE mode (between increments)

User context: INC-005 closed. Before authorizing INC-006, the user wants
to triage the backlog.

```
> Triage open bugs.

[manage-bugs — TRIAGE mode]

Reading bugs-and-issues-log.md:
  Open bugs: 4 (status in {new, to-do, priority, hold})

Rendering for triage:

| ID       | Title                                         | Sev    | Inc     | Status |
|----------|-----------------------------------------------|--------|---------|--------|
| BUG-007  | /api/refunds 500 on negative amount           | medium | INC-005 | new    |
| BUG-005  | UI loses scroll position after refresh        | low    | INC-003 | hold   |
| BUG-002  | Deferred: pagination for /api/practitioners   | low    | INC-001 | hold   |
| BUG-001  | Missed req: audit log for refund attempts     | high   | INC-005 | new    |

Triage prompts:

- BUG-001 (missed-requirement, high, audit log): suggest priority — fix
  before INC-006 ships? Or schedule new increment?
- BUG-007 (defect, medium): suggest to-do for next bug-fix increment
- BUG-005, BUG-002: keep hold

> BUG-001 → priority, schedule a new increment for it before INC-006.
> BUG-007 → to-do, fold into INC-006 if scope permits, otherwise next
> bug-fix increment. Others stay on hold.

Writing updates:
  BUG-001 → priority (scheduling-note: "before INC-006; create new INC")
  BUG-007 → to-do (scheduling-note: "fold into INC-006 if scope permits")

✓ Triage complete. Recommend running create-implementation-package to
  author the new audit-log increment for BUG-001.
```

What this shows:

- Triage is independently invocable — no active execution.
- The skill displays only open bugs and supports filters.
- Status transitions are recorded with scheduling notes.
- The skill **does not unilaterally fix anything** — it routes the user
  toward `create-implementation-package` for the new audit-log increment.

---

## What both examples demonstrate

- **Schema enforcement.** Every bug carries the same fields (id, severity,
  increment-id, status, impact-type, repro, etc.). `manage-bugs` is the
  single writer; no other skill reaches into the log.
- **Mode discipline.** Each invocation is one mode. LOG appends; TRIAGE
  updates; the modes do not blur.
- **Cross-skill handoffs by name.** When a fix is needed, the skill
  recommends `create-implementation-package` (for a new increment),
  `execute-increments` (for in-scope fixes), or
  `quick-dev/execute-quick-change` (for trivial drive-by fixes). It never
  attempts to fix code itself.
