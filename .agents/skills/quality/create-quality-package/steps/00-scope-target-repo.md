# Step 0 — Scope the target repo (SoD only)

No-op when the quality stage is in legacy mode (`[stages.quality]` declares
neither `dir` nor `colocate_with_source`). In legacy mode the package lives at
`{paths.quality_package}/{feature-id}/{feature-id}-quality.md` — skip to Step 1.

When the quality stage adopts SoD, inherit scope from the upstream packages
rather than re-eliciting it:

- **Directory mode** (`[stages.quality].dir = "..."`). The artifact lives under
  `<host-repo>/<artifact_subdir>/quality/`:
  - **Single-repo:** `<repo-code>/<feature-id>/<feature-id>-quality.md`. The user
    identifies the feature; if `<repo-code>` is ambiguous, prompt.
  - **Cross-cutting:** `_cross-cutting/<feature-id>/<feature-id>-quality.md`. Copy
    the `affects_repos` frontmatter from the upstream requirements/design
    artifacts; it must match (cross-checked during review-coverage).
- **Colocate mode** (`colocate_with_source = true`): single-repo only; artifact
  lives under `<source-repo-path>/<artifact_subdir>/quality/<feature-id>/<feature-id>-quality.md`.

Before writing, confirm `[user].role` from `project.user.toml` satisfies
`[stages.quality].write_role` (typically `Tester`). On mismatch, stop with a
permission error rather than writing.

If executed non-interactively without an explicit `feature-id` (and `scope` when
ambiguous), fail fast with a clear error rather than blocking on a prompt.

See `_docs/sod-multi-repo-proposal.md` § 5 and `config/SCHEMAS.md` § 5 for the
full SoD layout geometry.
