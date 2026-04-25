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
| Implementation package (if available) | `{project.paths.implementation_package}/` | If present |
| Requirements / design references | upstream packages | If present (for traceability) |
| Coding standards | `_assets/standards/` | If present |
| project.toml | `{project-root}/project.toml` | Yes |

See `references/INPUTS-OUTPUTS.md` for full inputs/outputs tables.

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
4. **PR description** — generated from the commit history and diff;
   includes summary, changes, test plan, and traceability links to
   requirements / design / increments
5. **PR creation** — only with explicit user approval; reports the PR URL
6. **Changelog entry** — conditional, only if the project maintains a
   changelog

For step-by-step procedure, see `references/implementation-pr-workflow.md`.

## Output

- Adversarial review findings (chat) with severity ratings
- Fixed working tree (no Critical findings remain)
- Atomic commits with conventional commit messages
- PR description (chat or PR body)
- PR URL (if `gh pr create` was authorized)
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
- **Auto-creating the PR without approval.** Never run `gh pr create`
  without explicit user authorization.
- **Vague PR descriptions.** "Implements the feature" is not a
  description. Cite the increments / FRs / files affected and the test
  evidence.
- **Forgetting traceability.** Every commit and the PR body should cite
  INC IDs, FR IDs, or design sections where applicable.
