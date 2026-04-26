# create-pr — Overview

## Purpose

Independently invocable PR/handoff skill that packages implementation work
for merge. Reviews the uncommitted diff (adversarially, four lenses), fixes
findings before commit, creates atomic conventional commits, generates a PR
description with traceability, and creates the PR — only with explicit user
approval.

The skill is independent of how the diff was produced. It works equally well
for output of `execute-increments`, `quick-dev/execute-quick-change`, or
manual work. It owns one job: turn working-tree changes into a reviewed,
committed, merge-ready PR.

The review is **adversarial by construction**. The reviewer's role is to
find problems. A review that finds zero issues triggers re-analysis on the
assumption that the reviewer didn't look hard enough.

## When to use

- Working tree contains the changes to package
- The user is ready to hand off for merge
- The user invokes language matching the trigger conditions

## When NOT to use

- Implementation incomplete — finish first
- Working tree clean — nothing to package
- Pre-execution validation of an implementation package — that is
  `review-implementation-package`
- Review of merged code — out of scope; use whatever post-merge review
  tooling the project has

## Position in workflow

```
execution/execute-increments      ──► dirty working tree
quick-dev/execute-quick-change    ──► dirty working tree
manual development                ──► dirty working tree
                                       │
                                       ▼
                              execution/create-pr   ◄── this skill
                                       │
                                       ├─► adversarial diff review
                                       ├─► fix cycle (in-tree)
                                       ├─► atomic commits
                                       ├─► PR description
                                       ├─► PR creation
                                       └─► changelog (optional)
                                       │
                                       ▼
                              human / external review and merge
```

## The four review lenses

The diff review applies four lenses **in order**. Each lens reads
different context and looks for different classes of issues; running them
in sequence catches problems that any single lens would miss.

| # | Lens | What it reads | What it surfaces |
|---|---|---|---|
| 1 | Blind | The diff alone | Things that look wrong / unclear / fragile based purely on the changes |
| 2 | Spec compliance | The increment(s) / FRs / design sections the diff implements | Gaps between spec and implementation; missing edge cases; ACs without tests |
| 3 | Standards compliance | `_assets/standards/` | Violations of language / framework / common rules |
| 4 | Codebase integration | Surrounding codebase context | Convention drift, naming inconsistencies, integration issues |

## Why review-before-commit

If review happened after commit, Critical findings would already be in
history. Fixing them would require either rewriting history (risky) or
adding "fix" commits that pollute the log. By reviewing the **uncommitted**
diff, the skill keeps history clean — only reviewed code gets committed.
