---
name: create-pr
description: "Use when the user asks to create a PR, prepare a pull request, package the diff into commits, review the working-tree diff before committing, generate a PR description, or hand off implementation work for merge. Reviews uncommitted changes, creates atomic conventional commits, and produces a PR description with summary and test plan."
---

# Create PR

Package implementation work for handoff: review the uncommitted working-tree
diff, fix Critical / Important findings, create atomic commits with
conventional commit messages, generate the PR description, and (with user
approval) create the PR. Optionally generate a changelog entry.

## Overview

This skill is independently invocable — users routinely want to run "just
the PR step" against working-tree changes regardless of how those changes
were produced (from `execute-increments`, from `quick-dev/execute-quick-change`,
or from manual development). It does not own the implementation work; it
owns the diff-review-to-PR lifecycle.

The review is intentionally **adversarial**: the reviewer's job is to find
problems, not to confirm the code works. A review that finds zero issues
triggers re-analysis. Review happens **before commit** — Critical findings
must be fixed in the working tree, not in a follow-up commit.

## When to use

- The user says "create a PR", "prepare a pull request", "package the
  changes for merge", "review the diff", "commit and PR", or "hand this
  off"
- Implementation work is complete and the working tree contains the
  changes
- The user wants to package the diff regardless of which skill produced
  the changes

## When NOT to use

- The implementation work is not yet complete — finish via
  `execute-increments` or `quick-dev/execute-quick-change` first
- The working tree is clean (nothing to package) — halt with that info
- The user wants pre-execution validation of an implementation package —
  use `review-implementation-package`
- The user wants to review production code that's already merged — that's
  a different review activity (out of scope for this skill)

## Inputs

| Input | Source | Required |
|---|---|---|
| Working-tree diff | `git diff` (uncommitted changes) | Yes |
| Implementation package (if available) | `{project.paths.implementation_package}/{feature-id}/` | If present |
| Requirements / design references | upstream packages | If present (for traceability) |
| Coding standards | `_assets/standards/` | If present |
| project.toml | `{project-root}/project.toml` | Yes |

See `references/INPUTS-OUTPUTS.md` for full inputs/outputs tables.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode B, before Step 1. If `features.toml` is absent, this is a no-op. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` in select-only mode (`caller: create-pr`) rather than guessing which feature the diff belongs to — do not fall back to creating one, because a diff waiting to be PR'd belongs to a feature that already exists. If it resolves, echo the feature ID and include it in the generated PR description's traceability block.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Execute one step at a time. Wait for explicit user approval before
committing or creating the PR.

1. **Diff review** — adversarial 4-lens review on the **uncommitted** diff
   (blind / spec / standards / integration); produce findings with
   severity
2. **Fix cycle** — address Critical and Important findings in the working
   tree; re-run tests; re-review if Critical findings existed
3. **Commit creation** — atomic commits with conventional commit messages;
   each commit traces to an INC ID or FR where applicable; only after the
   user explicitly approves
4. **PR description** — rendered from the `pr-description` composition
   (`templates/compositions/pr-description.yaml`); blocks cover summary,
   change-list, test plan, traceability, and optionally breaking-changes
   and rollout-notes when the diff warrants them
5. **PR creation** — only with explicit user approval; detects the git host (GitHub → `gh`, Azure DevOps → `az repos`, other → browser URL) and reports the PR URL
6. **Changelog entry** — read `[project.change_log]` from `project.toml`.
   - If the table is absent or `enabled = false`: silently skip (no changelog declared).
   - If `enabled = true`: render an entry against
     `templates/compositions/project-change-log.yaml` and prepend it to
     the configured `path` (default `{project-root}/CHANGELOG.md`),
     under an `Unreleased` section if no released version is being cut,
     or under the new version's section if a release is being tagged.
     Use the `versioning_strategy` and `format` fields to shape the
     header. Map the working-tree diff's affected areas to the
     `parts_affected_vocabulary` from the same table.

For step-by-step procedure, see `references/implementation-pr-workflow.md`.

## Output

- Adversarial review findings (chat) with severity ratings
- Fixed working tree (no Critical findings remain)
- Atomic commits with conventional commit messages
- PR description (chat or PR body)
- PR URL (if `gh pr create` or `az repos pr create` was authorized, otherwise a browser URL)
- Optional changelog entry

## Next skill

Typically the user's next action after PR creation is review by another
agent or human reviewer. The framework does not currently expose an
automated post-PR skill; the handoff is human / external.

If more increments remain in the implementation package, the user may
return to `execute-increments` after the PR is filed.

## Common mistakes

- **Committing before reviewing.** Review happens on the **uncommitted**
  diff so that Critical findings never enter history.
- **Bundling unrelated changes into one commit.** Commits must be atomic
  — one logical change per commit. If the working tree contains multiple
  logical changes, split them.
- **Skipping the adversarial framing.** Zero findings is suspicious, not
  good news. Re-analyze.
- **Auto-creating the PR without approval.** Never run `gh pr create` or
  `az repos pr create` without explicit user authorization.
- **Vague PR descriptions.** "Implements the feature" is not a
  description. Cite the increments / FRs / files affected and the test
  evidence.
- **Forgetting traceability.** Every commit and the PR body should cite
  INC IDs, FR IDs, or design sections where applicable.
