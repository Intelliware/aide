# Step 0 — Scope the requirements artifact

Determine **where the new requirements artifact will be written** and, for
cross-cutting features, **which source repos it covers**. Run this before
any of the existing steps (discovery, analysis, writing).

This is **only relevant when the project has adopted separation-of-duties
(SoD) for the requirements stage** — otherwise this step is a no-op.

## Decision order

### 1. Stage in legacy mode

If the project's `[stages.requirements]` entry has neither `dir` nor
`colocate_with_source`, the requirements stage is in legacy mode. **Skip this
step entirely** and resolve the output path via `[project.paths].requirements_package`
exactly as today.

### 2. SoD directory mode (recommended layout)

If `[stages.requirements].dir` is set (e.g. `dir = "ba-repo"`):

Ask the user — *"Is this a single-repo feature or cross-cutting (spanning
multiple source repos)?"* — and act on the answer:

- **Single-repo:** ask which `<repo-code>` from `[[project.repos]]`. The artifact
  path is `{project-root}/<stages.requirements.dir>/<artifact_subdir>/requirements/<repo-code>/<feature-id>/<feature-id>-requirements.md`.
  No `affects_repos` frontmatter needed (the directory encodes the scope).
- **Cross-cutting:** ask which repos the feature affects (must be ≥ 2 entries
  from `[[project.repos]]`). The artifact path is
  `{project-root}/<stages.requirements.dir>/<artifact_subdir>/requirements/_cross-cutting/<feature-id>/<feature-id>-requirements.md`.
  Capture the chosen repos as `affects_repos` for the artifact's YAML frontmatter
  (Step 4 — writing — emits this).

Pre-fill suggestions: if `[[project.repos]]` has a `primary` entry, suggest
it as the default `<repo-code>` for the single-repo case.

### 3. SoD colocate mode (uncommon for requirements)

If `[stages.requirements].colocate_with_source = true` (an unusual choice for
the requirements stage; recommended layout uses `dir` mode), only single-repo
features are supported — a cross-cutting requirements artifact has no host
repo to live in. Ask which `<repo-code>` and write to
`<source-repo-path>/<artifact_subdir>/requirements/<feature-id>/<feature-id>-requirements.md`.

## Interactive-only contract

This skill is designed for interactive invocation. If executed in a
non-interactive context (no TTY, scripted chain, CI), and the scope choice
cannot be deterministically resolved (no `scope` input provided), **fail fast**
with a clear error rather than blocking on an unanswerable prompt.

## Permission check (post-resolution)

Once the path is fixed, before any write:

- Look up `[stages.requirements].write_role`. If set, compare against
  `[user].role` from `project.user.toml`.
- On mismatch: **refuse the write**, surface the role mismatch as a clear
  error, and exit cleanly.
- If either field is unset, skip the check.

## Output of this step

The chosen artifact path and (when cross-cutting) the `affects_repos` array.
Both are consumed by Step 4 (writing) and the review-handoff to
`review-requirements-package`.

## See also

- `_docs/sod-multi-repo-proposal.md` § 5 (recommended layout) and § 10
  (Step 0 contract for downstream skills)
- `config/SCHEMAS.md` § 2.1 (SoD fields on `[stages.<stage>]`) and § 5
  (layout geometry)
