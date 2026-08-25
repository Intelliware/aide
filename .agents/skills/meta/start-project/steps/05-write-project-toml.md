---
slug: write-project-toml
sequence: 5
depends-on-prior: true
---

# Step 5 — Write `project.toml` (and optionally `project.user.toml`)

Render the elicited values into TOML, run validation, and write the
files. Up to this point the skill has only collected data — this step
is the only one that mutates the filesystem.

## Purpose

Materialize the canonical `project.toml`. Optionally materialize a
`project.user.toml` for personal overrides. Update `.gitignore` so
`project.user.toml` is not committed.

## Sub-steps

1. **Pre-flight validation.** Run every rule from
   `config/SCHEMAS.md` § 4 against the in-memory model:
   - `project.code` regex
   - `[[project.repos]]` `code` uniqueness
   - `[project.testing].qe_repo` resolves to a declared repo code when set
   - at most one `primary = true`
   - `default_flow` ∈ enum
   - path tokens ∈ allowed set
   - `_suppress` not used here (this layer is not a customization)
   On failure, jump back to the offending step and re-elicit.

2. **Render `project.toml`.** Use the `config/project.toml.example`
   layout as the template:
   - replace the example's intro comment block with a single-line
     header: `# Managed by skills/meta/start-project. Edit manually or via skills/meta/customize-framework.`
   - serialize `[project]`, `[project.paths]`, `[project.testing]`,
     `[project.glossary]`, `[project.elicitation]`, `[[project.repos]]`
     in that order
   - omit empty subsections rather than emitting empty headers
   - preserve TOML idioms: triple-quoted strings for multi-line
     descriptions, ordinary strings for single-line, arrays-of-tables
     with one blank line between entries

3. **Backup.** When mode = `rebaseline`, copy the existing file to
   `project.toml.bak` first. Confirm the user can see the backup path
   in the output.

4. **Write `project.toml`.** Atomically (write to `project.toml.tmp`,
   then rename) at `{project-root}/project.toml`.

5. **Optional `project.user.toml`.** Ask the user whether they want a
   personal-layer override. If yes, prompt for which fields to pin
   personally (common: `default_flow`,
   `paths.knowledge_base_path` for an alternate clone location, one or
   two `[project.elicitation]` answers). Render and write to
   `{project-root}/project.user.toml`.

6. **`.gitignore` patch.** When `project.user.toml` was written, append
   `project.user.toml` to `{project-root}/.gitignore` if not already
   present. Create the file if absent.

6b. **`features.toml` — feature-scoped paths, on by default for new projects.**
   When mode = `fresh` **and** no artifact tree already exists (no `docs/`
   containing per-feature directories, no populated stage roots under
   `[project.paths]`), write a comment-only `features.toml` at
   `{project-root}/features.toml`:

   ```toml
   # Feature registry — managed by skills/meta/select-feature.
   # Each [[features]] entry gives one delivery unit a stable ID — a lowercase
   # kebab slug — which becomes a directory segment in every artifact path.
   # See config/SCHEMAS.md § 2.8. Empty is legal and means
   # "feature-scoped, nothing minted yet".
   ```

   Comment-only is deliberate: `config/SCHEMAS.md` § 2.8 declares an
   empty-but-present file legal and calls it "the normal state immediately after
   opt-in", so the file needs no placeholder entry and TOML needs no trick to
   express an empty array of tables. **Do not mint a first feature here** — slug
   proposal and the `docs/` check that informs it live in `select-feature` and
   must not be reimplemented in a second skill. Step 06 does not route through it
   either; the first feature is named when the first feature-scoped skill's
   precondition asks for one, which is when the user is describing actual work
   rather than setting up a project.

   **Skip this sub-step entirely when mode = `rebaseline` or `extend-repos`.**
   Those modes mean artifacts may already exist on flat paths, and turning on
   feature scoping under them changes where the *next* write lands while leaving
   everything already written behind. Migrating an existing tree is a separate
   problem this skill does not solve — see the reconciliation rule in
   `references/ai-principles/feature-precondition.md`, which handles one feature
   at a time and only for the working tree. A project in those modes keeps the
   pre-existing behaviour, and `select-feature` remains available when its owner
   chooses to switch.

   `features.toml` is **committed** — it is project data every contributor shares,
   unlike `[user].active_feature`, which is personal and gitignored. Do not add it
   to `.gitignore`.

7. **Read-back confirmation.** Re-read both files from disk; print a
   compact summary back to the user (project name, code, default flow,
   repo count, KB path). The user confirms or asks for an edit.

## Hard gates

- Validation MUST pass before any file write.
- `project.toml` MUST NOT overwrite an existing file unless mode =
  `rebaseline` (backup taken) or mode = `extend-repos` (only the
  `[[project.repos]]` array is mutated; rest is preserved).

## Exit criteria

- [ ] `project.toml` exists and validates.
- [ ] `project.user.toml` written iff the user supplied personal
      overrides.
- [ ] `.gitignore` updated iff `project.user.toml` was written, and
      `features.toml` was *not* added to it.
- [ ] `features.toml` written iff mode = `fresh` and no artifact tree
      pre-existed; comment-only, with no `[[features]]` entry minted.
- [ ] Read-back acknowledged by the user.

## Next

Step 06 — handoff.
