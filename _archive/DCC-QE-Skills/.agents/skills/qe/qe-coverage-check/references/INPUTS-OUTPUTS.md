# Inputs & Outputs — qe-coverage-check

## Inputs

| Input | Source | Required | Notes |
|---|---|---|---|
| Feature / KB folder name | User-provided or auto-detected from JIRA/INC | Yes | Entry point for the audit |
| `implementation-package/increment-status.md` | `TDBC-knowledge-base/features/<feature>/` | Yes | Master INC list and dev status |
| `implementation-package/plan/test-plan.md` | `TDBC-knowledge-base/features/<feature>/` | Yes | §10 pyramid table — E2E column determines BB-DCC-QE scope per INC |
| `implementation-package/plan/increments/INC-XXX.md` | `TDBC-knowledge-base/features/<feature>/` | Yes | Layer and name per INC |
| `qe-package/qe-increment-status.md` | `TDBC-knowledge-base/features/<feature>/` | No — created if absent | QE status and BB-DCC-QE tags per INC |
| `docs/KNOWLEDGE.md` | `BB-DCC-QE/docs/KNOWLEDGE.md` | No — enhances live drift check | Used to verify tags actually exist in codebase; skip if unavailable |

## Outputs

| Output | Destination | Format | Notes |
|---|---|---|---|
| Coverage report | Chat | Structured markdown — summary table + detail table + gaps table | Always produced |
| Next-action recommendations | Chat | Checklist with `/qe-development` and `/qe-code-scanner` hand-offs | Always produced if gaps exist |
| `qe-increment-status.md` | `TDBC-knowledge-base/features/<feature>/qe-package/` | Markdown | Only written if the file did not previously exist |

## Side Effects

- Creates `qe-package/qe-increment-status.md` if it does not exist (first-run bootstrap)
- Does **not** modify BB-DCC-QE source files
- Does **not** modify an existing `qe-increment-status.md` — read-only if already present
