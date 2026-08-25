# Step 0 — Scope the design artifact

Determine **where the new design artifact will be written** and, for
cross-cutting features, **which source repos it covers**. Run this before
discovery and design assembly.

This is **only relevant when the project has adopted separation-of-duties
(SoD) for the design stage** — otherwise this step is a no-op.

## Decision order

### 1. Stage in legacy mode

If the project's `[stages.design]` entry has neither `dir` nor
`colocate_with_source`, the design stage is in legacy mode. **Skip this step
entirely** and resolve the output path via `[project.paths].design_package`
exactly as today.

### 2. SoD directory mode (recommended layout)

If `[stages.design].dir` is set (e.g. `dir = "architect-repo"`):

Read the upstream requirements artifact's path to inherit scope:

- **Upstream artifact under `<host-repo>/<artifact_subdir>/requirements/<repo-code>/...`:**
  this design covers the same single repo. Pin that `<repo-code>`. Output path:
  `{project-root}/<stages.design.dir>/<artifact_subdir>/design/<repo-code>/<feature-id>/<feature-id>-design.md`.
  No `affects_repos` frontmatter needed (directory encodes scope).

- **Upstream artifact under `<host-repo>/<artifact_subdir>/requirements/_cross-cutting/...`:**
  read the upstream `affects_repos` frontmatter. The design inherits the same
  scope. Output path:
  `{project-root}/<stages.design.dir>/<artifact_subdir>/design/_cross-cutting/<feature-id>/<feature-id>-design.md`.
  Copy `affects_repos` into the design artifact's YAML frontmatter (Step 2 —
  design — emits this).

- **Upstream artifact lacks SoD path signal (legacy / pre-SoD requirements):**
  ask the user — *"Is this a single-repo feature (which repo?) or cross-cutting
  (which repos)?"* — pre-filling `primary` from `[[project.repos]]` for the
  single-repo case. Then write to the path determined by the answer.

### 3. SoD colocate mode (uncommon for design)

If `[stages.design].colocate_with_source = true` (an unusual choice for the
design stage; recommended layout uses `dir` mode), only single-repo features
are supported — a cross-cutting design artifact has no host repo to live in.
Inherit the upstream `<repo-code>` and write to
`<source-repo-path>/<artifact_subdir>/design/<feature-id>/<feature-id>-design.md`.

## Interactive-only contract

This skill is designed for interactive invocation. If executed in a
non-interactive context (no TTY, scripted chain, CI), and the scope choice
cannot be deterministically resolved from the upstream artifact's path or a
caller-provided `scope` input, **fail fast** with a clear error.

## Permission check (post-resolution)

Once the path is fixed, before any write:

- Look up `[stages.design].write_role`. If set, compare against `[user].role`
  from `project.user.toml`.
- On mismatch: **refuse the write**, surface the role mismatch as a clear
  error, and exit cleanly.
- If either field is unset, skip the check.

## ADR placement

ADRs (one per significant decision) continue to land at
`{paths.knowledge_base_path}/adr/<id>.md` (or the SKILL.md-documented fallback
when KB is absent). The KB path is unchanged by SoD — the KB is pointed at via
`[project.paths].knowledge_base_path`, not via `[stages]`. ADRs do not move
under SoD.

## Output of this step

The chosen design-artifact path and (when cross-cutting) the `affects_repos`
array inherited from upstream. Both are consumed by Step 2 (design assembly)
and the review-handoff to `review-design-package`.

## See also

- `_docs/sod-multi-repo-proposal.md` § 5 (recommended layout) and § 10
  (Step 0 contract)
- `config/SCHEMAS.md` § 2.1 (SoD fields on `[stages.<stage>]`) and § 5
  (layout geometry)
