---
slug: validate-target
sequence: 1
depends-on-prior: false
---

# Step 1 — Validate target

## Goal

Confirm the KB target path is set, exists, and is safe to populate. Refuse to
proceed otherwise. This step performs no writes.

## Inputs

- `project.toml` at `{project-root}/project.toml`.
- `[project.paths] knowledge_base_path` value (resolved against the path
  rules in `config/SCHEMAS.md` § 1.5).
- The state of the resolved directory.

## Procedure

1. **Read `project.toml`.** If missing, error: "project.toml not found at
   `{project-root}`. Run `start-project` to scaffold it." Stop.
2. **Read `[project.paths] knowledge_base_path`.** If unset, error: "KB
   path is not declared. Set `[project.paths] knowledge_base_path` in
   `project.toml` (typically `\"../<project-code>-kb\"`)." Stop.
3. **Resolve the path.** Apply token expansion per `config/SCHEMAS.md`
   § 1.5. Relative paths resolve under `{project-root}`.
4. **Check existence.** If the directory does not exist, prompt:
   "KB path `<resolved>` does not exist. Create it? (y/N)". On `y`,
   `mkdir -p` it; on anything else, stop.
5. **Check emptiness.** Two cases:
   - **Empty**, or contains only `source-docs/` (RE places that there):
     proceed.
   - **Contains `ARCHITECTURE.md` or `components/` or `graph.json`**:
     this is an existing KB. Prompt: "An existing KB was found at
     `<resolved>`. Overwrite it? Existing files under `components/`,
     `shared/`, and `synthesized/` will be regenerated; `change-tracker.md`
     will be preserved. (y/N)". On anything other than `y`, stop and
     suggest `update-knowledge-base` instead.
6. **Verify required inputs.**
   - **F-006 fail-loud:** if `[[project.repos]]` is empty (or absent),
     **halt with a copyable error**:

     ```
     project.toml has no [[project.repos]] entries. The KB build needs
     each repo enumerated with code/name/path/role.

     For brownfield onboarding, populate the array now:
       1. Run `customize-framework` (scope = project-team) and add one
          [[project.repos]] block per source repo, OR
       2. Re-run `start-project` with multi-repo mode if the project
          was bootstrapped as single-repo by mistake.

     The build-knowledge-base skill DOES NOT scan source-docs/ as a
     fallback; the repo list is required.
     ```

     Stop. Do NOT guess from `<knowledge_base_path>/source-docs/*`
     subdirectories — the dir-scanning fallback was a silent-failure
     mode (F-006) and is explicitly disallowed.
   - For each `[[project.repos]]` entry: confirm a directory exists at
     `<knowledge_base_path>/source-docs/<repo.code>/`. If any repo lacks
     RE source docs, error: "Reverse-engineering output for repo
     `<repo.code>` is missing at `<expected-path>`. Run the RE stage for
     that repo before building the KB." Stop.
   - Confirm each `[[project.repos]]` `path` resolves to an existing
     directory (so we can read commit SHAs in step 3).
7. **Capture commit SHAs.** For each repo, run
   `git -C <repo.path> rev-parse HEAD` and stash the full 40-char SHA in
   the in-memory build context. Used by step 3 (per-component
   `last_verified_against_commit`) and step 6 (Repository Map's `Last
   Indexed Commit` column).

## Acceptance

- `project.toml` parses and contains `[project.paths] knowledge_base_path`.
- The resolved KB path exists and is either empty (modulo `source-docs/`)
  or the user has confirmed overwrite.
- **`[[project.repos]]` has at least one entry** (per F-006 — the
  fail-loud guard above).
- RE source docs are present for every `[[project.repos]]` entry.
- A full SHA is captured for every repo.

## Outputs

- In-memory build context with: resolved KB path, list of repos with full
  SHAs, overwrite-mode flag.

## Hand-off

`steps/02-scaffold-repos.md`.
