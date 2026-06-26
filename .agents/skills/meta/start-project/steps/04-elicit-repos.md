---
slug: elicit-repos
sequence: 4
depends-on-prior: true
---

# Step 4 — Elicit repos (multi-repo case)

Run when the user confirms the project spans more than one repository,
or when mode = `extend-repos` (entered directly from step 01). Skip
when the project is single-repo and `{project-root}` is the only repo.

## Purpose

Author the `[[project.repos]]` array-of-tables. Each entry is keyed by
`code`, which is the merge key for any future override or extension —
so this step is the moment to pick stable codes that survive renames.

## Sub-steps

1. Confirm whether the project is multi-repo at all. A project with one
   repo (the one containing `project.toml`) does not need any
   `[[project.repos]]` entries — skip this step entirely in that case.
2. For each repo, loop the following questions:
   - `code` — kebab-case identifier (validate `^[a-z][a-z0-9-]*$`,
     unique within the array)
   - `name` — human-readable title for headings
   - `path` — filesystem path; can be `"."` for the repo containing
     `project.toml`, or a token-prefixed path like
     `{project-root}/../api-orders`
   - `role` — one of `api`, `ui`, `mobile`, `framework`, `database`,
     `infra`, `shared-library`, `tooling`, `test-automation`, `qe`
     (validated against the enum)
   - `type` — optional free-form tech hint (e.g.
     `node-typescript-nest`, `dotnet-8`, `react-vite-typescript`)
   - `primary` — boolean. At most one entry may be `primary = true`;
     the skill enforces this on each loop iteration. If the user marks
     a second entry primary, it asks which one wins and clears the
     other.
3. After each entry, ask "another repo?" Loop until `done`.
  If Step 03 captured `[project.testing].qe_repo`, confirm that the
  final list contains a `[[project.repos]]` entry with that `code`.
  If not, prompt to add it now. Recommend `role = "test-automation"`
  for dedicated QE suites; allow `role = "qe"` when that is the team's
  preferred vocabulary.
4. When mode = `extend-repos`, the loop appends to (not replaces) the
   existing array; the merger's array-of-tables-by-code semantics mean
   adding a new `code` is a clean append, while reusing an existing
   `code` triggers a per-entry recursive merge — surface that to the
   user explicitly so they understand whether they're adding or
   editing.

## Validation

- `code` regex: `^[a-z][a-z0-9-]*$`
- `code` uniqueness within the array
- `role` ∈ allowed enum
- `[project.testing].qe_repo`, when set, resolves to one repo entry
- At most one `primary = true`
- `path` resolves to an existing directory (warn but allow if not, in
  case the user is creating the directory imminently)

## Hard gates

- An entry without a valid `code` blocks completion of this step.
- A duplicate `code` re-prompts.
- A captured `qe_repo` with no matching `[[project.repos]]` entry blocks
  completion until the user adds the repo or clears `qe_repo`.
- More than one `primary = true` re-prompts the second offender.

## Exit criteria

- [ ] All repo entries collected (or step skipped because single-repo).
- [ ] All validation passed.
- [ ] User has confirmed the final list before exit.

## Next

Step 05 — write-project-toml.
