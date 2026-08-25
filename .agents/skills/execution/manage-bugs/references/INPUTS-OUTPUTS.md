# manage-bugs — Inputs and Outputs

## Inputs

| Input | Source | Required | Purpose |
|---|---|---|---|
| `bugs-and-issues-log.md` | `{project.paths.implementation_package}/{feature-id}/bugs-and-issues-log.md` | Yes (auto-created on first call) | The log this skill manages |
| Implementation package directory | `{project.paths.implementation_package}/{feature-id}/` | Yes | Resolves the log path |
| Mode | inferred from user intent | Yes | One of: `LOG`, `REVIEW`, `TRIAGE`, `CLOSE` |
| Calling increment ID | passed by `execute-increments` if invoked from there | Conditional | Stamps "increment-id" field on logged bugs |
| project.toml | `{project-root}/project.toml` | Yes | Resolves paths |

### Per-mode inputs

| Mode | Required user-supplied inputs |
|---|---|
| LOG | title; reproduction steps; suggested severity; suggested impact-type |
| REVIEW | optional filter (status, severity, increment-id) |
| TRIAGE | for each bug being triaged: target status, severity adjustment, scheduling notes |
| CLOSE | bug ID; resolution notes; closing commit SHA or increment-id |

## Outputs

Per invocation, exactly one of:

| Mode | Output |
|---|---|
| LOG | New row appended to `bugs-and-issues-log.md` with status `new`; chat summary citing the new bug ID |
| REVIEW | Rendered summary of the log (optionally filtered) reported in chat; no file changes |
| TRIAGE | Existing rows updated with new status / severity / scheduling notes; chat summary of changes |
| CLOSE | Bug row updated to `fixed` or `wont-fix` with resolution notes, closing commit / increment-id, fixed-date; chat confirmation |

## Bug schema

Every entry in `bugs-and-issues-log.md` carries this schema:

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Stable, sequential: `BUG-001`, `BUG-002`, … |
| `title` | string | yes | One-line description |
| `date-found` | YYYY-MM-DD | yes | When the bug was first logged |
| `found-by` | string | yes | Person or agent that found it |
| `severity` | enum | yes | `critical` / `high` / `medium` / `low` |
| `increment-id` | string | yes | The INC-XXX active when bug surfaced; `none` if pre-execution |
| `status` | enum | yes | `new` / `to-do` / `priority` / `hold` / `fixed` / `wont-fix` |
| `impact-type` | enum | yes | `defect` / `missed-requirement` / `new-requirement` / `deferred-work` |
| `affected-components` | array<string> | no | KB component IDs touched by the bug |
| `repro-steps` | string (multi-line) | yes | Steps another agent can follow to reproduce |
| `suspected-root-cause` | string | no | Where in the system the bug likely resides |
| `requirements-impacted` | array<string> | no | FR IDs the bug touches |
| `design-impacted` | array<path> | no | Design package files the bug touches |
| `resolution-notes` | string | no | Populated by CLOSE mode |
| `closing-commit` | string | no | Full SHA; populated by CLOSE mode |
| `closing-increment-id` | string | no | If fix shipped in a specific INC; populated by CLOSE mode |
| `fixed-date` | YYYY-MM-DD | no | Populated by CLOSE mode |

## File format

`bugs-and-issues-log.md` is a Markdown file. Each bug is a `### BUG-XXX —
<title>` heading followed by a YAML frontmatter block (the schema above)
and a free-form Markdown body for repro steps, root cause notes, and
resolution. Example:

```markdown
### BUG-007 — /api/refunds returns 500 when amount is negative

```yaml
id: BUG-007
title: /api/refunds returns 500 when amount is negative
date-found: 2026-04-25
found-by: agent (during execute-increments INC-005)
severity: medium
increment-id: INC-005
status: new
impact-type: defect
affected-components: [api-billing]
requirements-impacted: [FR4.2.1]
```

**Repro:**

1. POST /api/refunds with `{ "amount": -10 }`
2. Observe 500 response

**Suspected root cause:** input validation runs after the refund-calc
pipeline; needs to be moved earlier.
```

The `manage-bugs` skill is the only writer to this file.
