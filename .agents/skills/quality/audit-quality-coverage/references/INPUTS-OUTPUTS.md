# Inputs and Outputs — audit-quality-coverage

## Inputs

| Name | Required? | Source | Purpose |
|---|---|---|---|
| Feature ID / scope | yes | User-supplied or auto-detected from INC ID, JIRA ID, or open quality package path | Entry point for the audit |
| Implementation package | yes | `{paths.implementation_package}/{feature-id}/` | Source of truth for which increments exist |
| `increment-status.md` | yes | `{paths.implementation_package}/{feature-id}/increment-status.md` | Per-INC dev status (`not-started` / `in-progress` / `completed` / `blocked`) |
| Per-INC files | yes | `{paths.implementation_package}/{feature-id}/INC-XXX.md` (or shard layout) | Per-INC scope, level, NFR mapping; reveals which increments are NFR-only / dev-owned |
| Quality package | yes | `{paths.quality_package}/{feature-id}/{feature-id}-quality.md` (or SoD-resolved path) | The latest assembled package |
| Test-traceability matrix | yes | `{paths.quality_package}/<feature-id>/quality/traceability.md` | Primary source of "which test covers which INC / AC / FR / NFR" |
| Test-design block | yes | `{paths.quality_package}/<feature-id>/quality/test-design.md` | Test levels per scope (the team's pyramid) — distinguishes which INCs require automated coverage vs. dev-owned-only |
| Test-case status tracker | optional (bootstrapped if absent) | `{paths.quality_package}/<feature-id>/quality/plan/test-case-status.md` | TC-XXX implementation status when the team uses the optional TC-XXX flow |
| `project.toml` | yes | `{project-root}/project.toml` | Flow detection, paths, repo list, `[project.testing].qe_repo`, tag conventions |
| Knowledge base | optional — recommended | `{paths.knowledge_base_path}/` via `navigate-knowledge-base` | Enables the live drift check in Step 3 |
| Test suite codebase | optional | `[project.testing].qe_repo` resolved through `[[project.repos]]`; fallback to the in-scope code repo | Direct marker / tag / spec-file search when the KB is unavailable |

## Outputs

| Output | Destination | Format | Notes |
|---|---|---|---|
| Coverage report | Chat | Markdown — summary table + coverage-detail table + gaps table + recommended next actions | Always produced |
| Recommended next-action hand-offs | Chat | Checklist mapping each gap → specific framework skill | Always produced when gaps exist |
| Bootstrapped `test-case-status.md` | `{paths.quality_package}/<feature-id>/quality/plan/test-case-status.md` | Markdown table | **Only written when the tracker did not previously exist.** Existing trackers are not modified. |
| `change-tracker.md` row | `{paths.quality_package}/<feature-id>/quality/change-tracker.md` | Markdown table | Single row with Trigger note `Coverage audit`; records the audit timestamp, the input set used, and the gap count. |

## Side effects

- **First-run bootstrap of `test-case-status.md`** when no tracker exists
  (initialised from the implementation package's INC list and the
  traceability matrix). If the test-case-increment block is not in the
  composition, the bootstrap is skipped — there is no TC layer to track.
- **No** modifications to the application source, the test suite, or
  the knowledge base.
- **No** modifications to an existing `test-case-status.md`,
  `traceability.md`, or quality package contents.
- One `Coverage audit` row appended to the quality package's
  `change-tracker.md` per invocation.

## Customisation hooks

- `config/customizations/audit-quality-coverage.toml` may override:
  - The status vocabulary used in the report (e.g. team-specific
    synonyms for `done` / `ready` / `not-ready` / `blocked`).
  - The summary-table emoji set (defaults: ✅ 🔄 ⚠️ 🔴 ➖).
  - Whether the bootstrapped `test-case-status.md` should be
    created when missing or whether to halt with a route to
    `create-quality-package` instead.
- The test-pyramid / level vocabulary (which INCs require automated
  coverage vs are dev-owned-only) is read from
  `{paths.quality_package}/<feature-id>/quality/test-design.md` —
  never hard-coded in this skill.
- The marker / tag scheme used by Step 3 (the live drift check) is
  read from
  `{paths.quality_package}/<feature-id>/quality/automation-and-cicd.md` —
  never assumed.


