---
slug: scaffold-repos
sequence: 2
depends-on-prior: true
---

# Step 2 — Scaffold per-repo entries and KB skeleton

## Goal

Create the entire directory skeleton, the per-repo `README.md` and
`CLAUDE.md` files, and the seed files (`glossary.md`, `change-tracker.md`)
without yet emitting any component leaves.

## Inputs

- Build context from step 1 (resolved path, repo list, SHAs, overwrite flag).
- `[[project.repos]]` array.
- `templates/blocks/knowledge-base/repo-summary.md`.
- `project.toml` `[project.glossary]` if present.
- RE Part B "purpose" or "overview" sections for each repo.

## Procedure

1. **Create skeleton directories** (idempotent — `mkdir -p`):

   ```
   <knowledge_base_path>/
   ├── repos/
   ├── components/
   ├── shared/{entities/, cross-cutting/, adrs/, integration-patterns/}/
   └── synthesized/{01-architecture-overview/ … 10-repository-maintenance/}/
   ```

   Use the exact 10-folder names listed in `references/SYNTHESIZED-FOLDERS.md`.

2. **Seed `glossary.md`.** Read `[project.glossary]` from `project.toml`:
   - Inline `[[project.glossary.entries]]` rows become rendered glossary
     entries.
   - `references` paths are inlined (read each file, concatenate, dedupe
     by `term` with later entries winning).
   - If both are empty, write a stub with a placeholder explaining how to
     add entries.

3. **Initialise `change-tracker.md`.** Single file with header
   `# Change Tracker` and an empty table:
   `| Date | Feature ID | Components Touched | Summary | Author |`. The
   `update-knowledge-base` skill appends rows here.

4. **For each repo in `[[project.repos]]`**:
   1. `mkdir -p <kb>/repos/<repo.code>/`.
   2. `mkdir -p <kb>/components/<repo.code>/`.
   3. Render `templates/blocks/knowledge-base/repo-summary.md` with
      placeholders:
      - `{{repo_name}}` ← `repo.name`
      - `{{repo_code}}` ← `repo.code`
      - `{{repo_role}}` ← `repo.role`
      - `{{repo_type}}` ← `repo.type` (or `"unset"`)
      - `{{repo_path}}` ← `repo.path`
      - `{{repo_is_primary}}` ← `"yes"` or `"no"`
      - `{{repo_last_indexed_commit}}` ← captured SHA from step 1
      - `{{repo_purpose_one_paragraph}}` ← extracted from RE Part B
        overview / purpose section
      - Owner / tech-stack / public-interfaces tables ← extracted from
        RE Part B
      - Doc pointers in § 6 ← relative paths into the source repo
   4. Write to `<kb>/repos/<repo.code>/README.md`.
   5. Write `<kb>/repos/<repo.code>/CLAUDE.md` with a minimal navigation
      header tailored to this repo's role: "When the user's task touches
      this repo, read this README first, then walk
      `<kb>/components/<repo.code>/*.md` and follow `consumed_by` /
      `depends_on` outwards."

5. **Verify symlink integrity for `source-docs/`.** No writes — confirm
   the per-repo source-doc directories exist (already checked in step 1)
   and are readable. They are never copied or modified.

## Acceptance

- All skeleton directories exist.
- `glossary.md` and `change-tracker.md` are present at the KB root.
- Every `[[project.repos]]` entry has both a `README.md` and a
  `CLAUDE.md` under `repos/<code>/`.
- No component files have been written yet (that is step 3).

## Hand-off

`steps/03-emit-components.md`.
