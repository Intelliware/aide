# Elicitation pattern — `[project.change_log]`

> Used by `start-project/steps/03-elicit-project-context.md` (sub-step 4) and re-readable by `customize-framework` when the user wants to flip changelog state on or off post-bootstrap.

## When this elicitation runs

- During fresh `start-project` runs after the user has confirmed the flow + project identity + paths + glossary.
- During `customize-framework` invocations targeting `[project.change_log]` directly.
- It does **NOT** run during `quick-dev` flow bootstraps unless the user explicitly opts in (default: `enabled = false` for quick-dev).

## What to ask

Single primary question:

> *"Will this project maintain a release-stream `CHANGELOG.md` (a user-facing log of changes per release)? This is distinct from the per-package `CHANGE-TRACKER.md` files the framework writes automatically."*

If the user answers no → write `[project.change_log] enabled = false` and stop. The four sub-fields (`path`, `versioning_strategy`, `format`, `parts_affected_vocabulary`) are not asked.

If the user answers yes → ask the four sub-questions in order. Each has a sensible default; offer "accept all defaults" as a one-line shortcut.

### Sub-question 1 — `path`

> *"Where should `CHANGELOG.md` live? Default: `{project-root}/CHANGELOG.md` (the conventional spot)."*

Validate that any `{...}` token resolves per `config/SCHEMAS.md` § 1.5.

### Sub-question 2 — `versioning_strategy`

> *"How will releases be versioned? `semver` (e.g., `1.2.3`), `calver` (e.g., `2026.04.27`), or `none` (a flat ledger with no version anchors)?"*

Default: `semver`. Drives the version-header convention written into the changelog.

### Sub-question 3 — `format`

> *"Which CHANGELOG format? `keep-a-changelog` (the de facto standard with Added / Changed / Deprecated / Removed / Fixed / Security categories) or `plain` (the canonical block's section structure as-is)?"*

Default: `keep-a-changelog`. The framework's canonical change-log block's change-type taxonomy (Initial Extraction / Source Update / Correction / Restructure / Addition / Deprecation / Removal) maps cleanly onto Keep-a-Changelog's six categories — see `templates/compositions/project-change-log.yaml` notes for the mapping.

### Sub-question 4 — `parts_affected_vocabulary`

> *"What feature-area labels should classify changelog entries? E.g., `auth`, `cart`, `search`, `api`, `ui`, `data`, `config`, `build`, `infra`, `docs`. Type a comma-separated list, or accept the framework's eight-item starter set."*

Default: `["api", "ui", "auth", "data", "config", "build", "infra", "docs"]`.

The list populates the same-named "Parts Affected — Reference" table inside the canonical change-log block when rendered as the project-level changelog. It is **distinct** from per-package vocabularies (each artifact's CHANGE-TRACKER has its own list).

## Carry-forward

Resolve all five fields (or `enabled = false` + skip the rest) into a `[project.change_log]` table. Step 05 writes it.

## Edit-don't-elicit modes

- `customize-framework --scope=project-team --target='[project.change_log]'` re-runs this elicitation in isolation; useful for projects bootstrapped before this section was added to the schema.
- `start-project` re-baseline mode runs this same elicitation but pre-fills the existing values from the on-disk `project.toml`.

## Gotchas

- Don't elicit this for `quick-dev` flow unless the user explicitly opts in. The default-false matches the quick-dev workflow's small-scoped-change posture.
- If the user said "yes" but later wants to switch off, point them at `customize-framework` rather than re-running `start-project` (the latter is destructive).
- When a project has been running without a changelog and then enables it, the next `create-pr` invocation creates `CHANGELOG.md` from scratch with an `Unreleased` section as the first entry.
