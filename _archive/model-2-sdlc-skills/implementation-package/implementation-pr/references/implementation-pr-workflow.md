# Implementation PR Workflow

## Purpose

Sequence the PR lifecycle skills after implementation is complete — adversarial PR review using four sequential lenses (blind, spec compliance, standards compliance, codebase integration), approved commit creation with conventional commit messages, PR description generation from the implementation history and diff, and handoff. The final phase of the implementation package before handoff. Ensures commits are atomic and well-described, the PR description provides sufficient context for human reviewers, and code review covers all quality dimensions before merge. The review is intentionally adversarial — zero findings triggers re-analysis. In subagent mode, ideally uses a different model than the implementer to avoid shared blind spots.

## Sequential Execution Rule — Read This First

**Execute one step at a time. Do not pre-read all reference files before starting.**

Read each reference file only when you are about to execute that step. After you finish a step:

1. Produce the output artifact.
2. Present to the user.
3. Wait for acknowledgement before reading the next reference file.

**DO NOT:**
- Read all reference files upfront and then execute from memory.
- Skip a step.
- Commit code without explicit user approval.

---

## When to Use

- After all implementation tasks are complete and verified
- The full test suite passes
- The user is ready to create a PR or merge

## Scope

This workflow covers the PR lifecycle: commit, describe, review. It does not cover the coding itself — that is the implementation workflow's responsibility.

---

## The Sequence

**Review happens before commit.** The reviewer examines the uncommitted working tree diff so that Critical findings never make it into a commit. Only clean, reviewed code gets committed and pushed as a PR.

```
┌─────────────────────────────────────────────────────────────────┐
│  PR WORKFLOW — PR LIFECYCLE SEQUENCE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. pr-reviewer                 ──► review findings             │
│     Adversarial 4-lens review        Reviews UNCOMMITTED diff   │
│     on the UNCOMMITTED diff:         (working tree) so issues   │
│     blind → spec → standards →       are fixed BEFORE commit    │
│     integration                                                 │
│              │                                                  │
│              ▼                                                  │
│  1a. FIX (if needed)            ──► clean code                  │
│      Fix Critical/Important          Re-run tests after fixes   │
│      findings before proceeding      Re-review if Critical      │
│              │                                                  │
│              ▼                                                  │
│  2. commit-creator              ──► atomic commits              │
│     Stage and commit REVIEWED        Conventional commit        │
│     changes with conventional        messages with traceability │
│     messages                                                    │
│              │                                                  │
│              ▼                                                  │
│  3. pr-creator                  ──► PR description              │
│     Generate PR description          Summary, changes, testing, │
│     from history and diff            requirements links         │
│              │                                                  │
│              ▼                                                  │
│  4. changelog-generator         ──► changelog entry             │
│     (CONDITIONAL — only if           Breaking changes,          │
│     project maintains a              new features, fixes        │
│     changelog)                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Skill Reference

| Step | Skill | Output | Key Rule |
|------|-------|--------|---------|
| 1 | `pr-reviewer` | review findings | Adversarial 4-lens review on the **uncommitted** diff; severity-rated findings; zero findings triggers re-analysis |
| 1a | *(fix cycle)* | clean code | Fix Critical/Important findings; re-run tests; re-review if Critical findings existed |
| 2 | `commit-creator` | atomic commits | Conventional commit messages; why not what; traceability to phase/FR |
| 3 | `pr-creator` | PR description | Generated from history and diff; includes requirements links and testing summary |
| 4 | `changelog-generator` | changelog entry | **Conditional** — only if the project maintains a changelog |

## Adversarial Review Protocol

The PR review is intentionally adversarial — the reviewer's job is to find problems, not to confirm the code works. A review that finds zero issues triggers re-analysis (a review that finds nothing is a review that didn't look hard enough).

### Four Review Lenses (applied in sequence)

| Lens | What it does |
|------|-------------|
| **1. Blind review** | Review the diff alone — no spec, no story. Surface anything that looks wrong, unclear, or fragile based purely on the code changes. |
| **2. Spec compliance** | Read the task's inline design spec and acceptance criteria. Re-review the diff for gaps between what was specified and what was implemented, missing edge cases, and acceptance criteria not covered by tests. |
| **3. Standards compliance** | Read the applicable coding standards (`../assets/standards/languages/`, `../assets/standards/frameworks/`, `../assets/standards/common/`). Re-review the diff for rule violations — every standard rule the project has adopted is checked. Standards are the gold standard; existing codebase patterns that deviate from standards are not acceptable precedent. |
| **4. Codebase integration** | Read the surrounding codebase context (`project-context.md`, affected files). Review for convention violations, pattern mismatches, naming inconsistencies, and integration issues the diff alone cannot reveal. |

### Quality Dimensions (checked across all lenses)

Not every dimension applies to every PR — the reviewer determines which are relevant based on the scope of changes:

| Dimension | What it checks |
|-----------|---------------|
| **Standards compliance** | Every applicable rule from language, framework, and common standards — clean code, error handling, naming, design patterns, testing standards |
| API compliance | REST naming, status codes, errors, pagination, versioning, idempotency |
| Security | Injection, auth, secrets, validation, exposure |
| Test coverage | Adequacy of tests for new/changed paths; tests follow testing standards |
| Error handling | Errors, edges, retries, degradation; follows error handling standards |
| Maintainability | Complexity, coupling/cohesion, readability, SOLID/DRY/YAGNI |
| Performance | N+1, leaks, allocations, hot paths |
| Accessibility | ARIA, keyboard, screen readers, contrast, semantics, WCAG |
| Documentation | API docs, README, comments, changelog for public changes |
| Formatting | Style, lint, formatting vs standards |

### Model Diversity (subagent mode)

When running in subagent mode, ideally use a different model for the reviewer than the one that wrote the code. Same-model review shares the implementer's blind spots.

## Entry Criteria

Before starting the PR phase, confirm:

- [ ] All implementation tasks are complete and verified
- [ ] The full test suite passes
- [ ] The user has approved the implementation (per phase execution guide)

## Exit Criteria

PR phase is complete when:

- [ ] PR review is complete with no unresolved Critical findings (review happens on uncommitted diff)
- [ ] All Critical and Important findings are fixed and re-verified
- [ ] Changes are committed with conventional commit messages (only after review passes)
- [ ] PR description is generated and approved by the user
- [ ] PR is created and URL confirmed
- [ ] Changelog entry is created (if applicable)

## Phase Completion

After the PR is created or ready to create, summarize:

- Review status and any accepted risks
- Commit list and traceability
- PR description location or PR URL
- Changelog status, if applicable
- Remaining reviewer or merge actions

Do not push, commit, or create a PR unless the user explicitly approves those actions.
