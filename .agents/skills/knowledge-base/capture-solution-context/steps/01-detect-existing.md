---
slug: detect-existing
sequence: 1
depends-on-prior: false
---

# Step 1 — Detect existing context

## Goal

Determine whether `<KB>/shared/solution-context/` already contains
captured leaves. Pick `mode = create | refresh | replace | cancel`
without performing any writes.

## Inputs

- `project.toml` at `{project-root}/project.toml`.
- `[project.paths] knowledge_base_path` resolved.
- The state of `<KB>/shared/solution-context/`.
- `--refresh-only` flag if supplied.
- `--non-interactive` flag if supplied.

## Procedure

1. **Read `project.toml`.** If missing, error: "project.toml not found.
   Run `start-project` first." Stop.
2. **Resolve `knowledge_base_path`.** If unset or directory does not
   exist, error: "KB has not been built. Run `build-knowledge-base`
   before capturing solution context." Stop.
3. **Verify `<KB>/shared/` exists.** If not, error: "KB shared/
   directory missing. Re-run `build-knowledge-base/steps/02-scaffold-
   repos.md` (it scaffolds `shared/`)." Stop.
4. **Inventory existing solution-context leaves.** List every file
   under `<KB>/shared/solution-context/*.md`. Read each leaf's
   frontmatter `last_captured` date.
5. **Decide mode.**
   - **No existing leaves** → `mode = create`. Continue.
   - **All six leaves present, `--refresh-only` set** → `mode = refresh`.
     Identify only leaves whose `last_captured` exceeds
     `[knowledge_base.solution_context_max_age_days]` (default 90).
     Continue with that subset.
   - **All six leaves present, no `--refresh-only`** → prompt the user:
     ```
     Solution context already captured (6 leaves, last touched <date>).
     Choose:
       [r] Refresh stale leaves only (>90 days old)
       [R] Replace ALL leaves (re-elicit everything)
       [c] Cancel
     ```
     Honour the answer. In `--non-interactive` mode, default to `r`.
   - **Some leaves missing** → prompt the user with the list of missing
     leaves and the option to proceed (`mode = create-missing`) or
     cancel. In `--non-interactive` mode, default to `create-missing`.
6. **Capture invocation context** in the in-memory plan:
   - mode
   - target leaf set (subset to write)
   - interactive flag
   - user identifier (`[project] user_email` or runtime prompt)
   - resolved KB path

## Acceptance

- A mode is decided.
- Target leaf set is non-empty (else stop with "nothing to do").
- The user has confirmed (interactive) or default applied (non-
  interactive).

## Outputs

- In-memory plan: `{mode, target_leaves, interactive, user_id, kb_path}`.

## Hand-off

`steps/02-elicit-mission.md` — but only if `00-overview.md` is in the
target leaf set. Otherwise advance to the next applicable step.
