---
slug: l1-commit-stamp
sequence: 1
depends-on-prior: false
---

# Step 1 — L1 commit-stamp check

## Goal

For every component, determine cheaply whether the source repo has moved
since `last_verified_against_commit` AND whether the moved commits touch
the component's `paths:`. Both conditions = suspect.

## Inputs

- `<knowledge_base_path>/components/**/*.md` (component frontmatter).
- `[[project.repos]]` array (for each `repo`'s `path`).
- Optional `--since` to override the start point.

## Procedure

1. **Capture current HEADs.** For each `[[project.repos]]` entry:
   
   1. **Test if path is a git submodule** by checking if `.git` is a
      file (submodule) vs directory (standalone repo):
      ```bash
      if [ -f "<repo.path>/.git" ]; then
        # Submodule: cd into directory first to ensure git operations
        # resolve within submodule, not parent
        cd <repo.path> && git rev-parse HEAD
      else
        # Standalone repo: use -C flag
        git -C <repo.path> rev-parse HEAD
      fi
      ```
   2. Stash the HEAD SHA. (Cache by repo path for the run.)

2. **For each component file:**

   1. Parse frontmatter: extract `repo`, `paths`, `last_verified_against_commit`.
   2. Compute the start ref: `--since` if provided, else
      `last_verified_against_commit`.
   3. **Same-SHA fast-path:** if `start_ref == HEAD` for the component's
      repo, the component is up-to-date. Record `commits_since=0`,
      `paths_overlap=false`, `verdict=current`. Skip to next component.
   4. **Run git commands with submodule-awareness:**
      - For submodules: `cd <repo.path> && git rev-list <start>..HEAD --count`
      - For standalone repos: `git -C <repo.path> rev-list <start>..HEAD --count`
      
      Stash as `commits_since`.
   5. **Run git diff with submodule-awareness:**
      - For submodules: `cd <repo.path> && git diff --name-only <start> HEAD`
      - For standalone repos: `git -C <repo.path> diff --name-only <start> HEAD`
      
      Cache the file list per (repo, start_ref) — multiple components on
      the same repo can reuse it.
   6. **Path overlap check.**
      - For each path in `paths:`:
        - If un-prefixed, evaluate against the component's `repo`'s file
          list using glob semantics (`fnmatch` / `minimatch`).
        - If prefixed (`<other-repo>:<glob>`), evaluate against
          `<other-repo>`'s file list (compute that file list lazily if
          not yet cached).
        - First match short-circuits to `paths_overlap=true`.
   7. **Cross-repo path consideration.** Components with cross-repo
      `paths:` MUST also have their cross-repo SHAs checked. If any
      cross-repo file list shows changes overlapping the prefixed glob,
      `paths_overlap=true` even if the primary repo is current.
   8. **Severity assignment** for L1 row:
      - If `commits_since == 0` AND no overlap: `current`, no row.
      - If `commits_since > 0` AND no overlap: severity `low`.
      - If `commits_since > 0` AND overlap AND `commits_since ≤ 10`:
        severity `medium`.
      - If `commits_since > 0` AND overlap AND `commits_since > 10`:
        severity `high`.
   9. **Evidence string.** Format: "N commits since `<start>`; paths
      overlap: <list of overlapping globs>".
   10. **Output row** (component_id, layer=L1, severity, evidence) into
      the suspect set.

3. **Suspect filter.** L2 only runs on rows with severity ≥ `low` AND
   `paths_overlap=true`. Pure stamp-stale (no overlap) is reported but
   doesn't progress to L2.

## Acceptance

- Every component has a verdict (current or row).
- Repo HEADs and per-repo file lists are cached so L2 doesn't re-shell-out.
- Suspect set is computed and stashed for step 2.

## Output

In-memory L1 result:

- `suspects: [{component_id, severity, evidence, repo, last_verified, current_head}, …]`
- `current_components: [component_id, …]` (no further checks needed)
- `repo_heads: {repo: sha, …}`
- `repo_file_lists: {(repo, start_ref): [files, …], …}` (cache)

## Hand-off

`steps/02-l2-structural-diff.md`.
