# Inputs and Outputs — review-test-failures
## Inputs
| Name | Required? | Source | Purpose |
|---|---|---|---|
| Failure set | yes | Hand-off from `execute-quality-increments` / `execute-increments` / a CI run, or user-provided | The failures to triage (scenarios, error messages, stack traces) |
| Quality package automation-and-cicd block | yes | `{paths.quality_package}/<feature-id>/quality/automation-and-cicd.md` | Pinned evidence locations (report path, log path, screenshot path) — read here, never hard-coded in this skill |
| Failure categories | yes | `references/failure-categories.md` (generic) + `templates/blocks/quality/failure-categories.md` (team-overridable block) | The classification taxonomy and remediation hints |
| `project.toml` | yes | `{project-root}/project.toml` | Paths, repos, `[project.testing].qe_repo`, test-stack pins, team customisation overrides |
| Per-test report data | recommended | path declared in automation-and-cicd (e.g. JUnit XML, Allure JSON, framework-native reporter output) | Per-test JSON / XML for deeper triage |
| Execution log | recommended | path declared in automation-and-cicd | Full execution trace |
| Screenshots / artifacts | recommended | path declared in automation-and-cicd | Visual / artefact evidence per failure |
| Knowledge base | optional | `{paths.knowledge_base_path}/` via `navigate-knowledge-base` | Cross-reference shared utilities, known patterns, prior-failure history |
| Test suite codebase | optional | `[project.testing].qe_repo` resolved through `[[project.repos]]`; fallback to the in-scope code repo | Direct lookup of locators / fixtures / shared helpers when the KB is unavailable |
## Outputs
| Output | Destination | Format | Notes |
|---|---|---|---|
| Per-failure classification + remediation | Chat (interactive) | Markdown block per failure | Always produced; one at a time, awaits user approval before advancing |
| Final summary table | Chat | Markdown table | After all failures triaged |
| Action items (routed) | Chat | Checklist mapping each finding → specific framework skill | Always produced when actions exist |
| `change-tracker.md` row | `{paths.quality_package}/<feature-id>/quality/change-tracker.md` | Markdown table | Single row recording the triage session (Trigger note: `Failure triage`). Includes total failures, per-category counts, and a link to the chat summary. |
## Side effects
- **None on test code, application code, fixtures, logs, screenshots,
  the KB, the implementation package, or the assembled quality
  package.** Read-only across the board.
- **One** `Failure triage` row appended to `change-tracker.md` per
  invocation. The session summary itself lives in chat, not on disk.
- **No** automatic bug-log creation. Application defects are *routed*
  to `manage-bugs` for the user to confirm and log; this skill never
  writes to the bug log directly.
- **No** automatic JIRA / external-tracker writes. Recommended next
  actions are surfaced; the user invokes whichever tracker integration
  they have configured.
## Customisation hooks
- `config/customizations/review-test-failures.toml` may override:
  - The **failure-categories taxonomy** (add team-specific categories,
    drop categories that don't apply, override remediation hints per
    category). Sourced from
    `templates/blocks/quality/failure-categories.md` which the team
    can shadow with `templates/blocks/quality/_user/failure-categories.md`.
  - The **per-failure presentation template** (the markdown shape
    used in Step 2).
  - The **bug-routing target** — defaults to `manage-bugs`; may be
    set to a project-specific bug-logging skill if one is configured.
  - The **bulk-mode threshold** — when more than N failures are
    present, ask whether to triage all individually or group obvious
    duplicates first. Default N = 10.
- The **evidence locations** (report / log / screenshot paths) are
  read from the quality package's `automation-and-cicd.md` block —
  not from this skill or its customizations. The team pins them once
  in the package; every skill that needs them reads from there.
- The **test-stack pins** (framework, runner, build tool) used to
  parse error messages are read from `project.toml`
  `[project.elicitation]` and the automation-and-cicd block.