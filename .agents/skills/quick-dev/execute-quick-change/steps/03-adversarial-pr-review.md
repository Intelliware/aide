---
slug: adversarial-pr-review
sequence: 3
depends-on-prior: true
---

# Step 3 — Adversarial PR review

Before any commit lands and before the PR opens, run an adversarial 4-lens
review against the uncommitted (or staged) diff. Each lens looks at the diff
through a different question. The review's goal is to find problems — a
review that finds nothing did not look hard enough.

## Lens 1 — Blind review

Review the diff alone. No spec, no plan, no story. Surface anything that
looks wrong, unclear, or fragile on its own merits. Common findings:
unhandled edge cases, opaque names, dead branches, commented-out code,
missing error paths, performance footguns, accessibility gaps.

## Lens 2 — Spec compliance

Read the quick-dev spec. Re-review the diff specifically for:

- ACs not covered by tests
- ACs covered but not satisfied by implementation
- Behaviors implemented that are not in the spec (scope creep)
- Out-of-scope items that crept in

## Lens 3 — Standards compliance

Read all applicable coding standards (language, framework, common,
testing). Re-review the diff for rule violations. Standards are the gold
standard — existing codebase deviations are not acceptable precedent.
Common findings: missing error wrapping, missing observability hooks,
non-conforming naming, missing test cases for edge conditions.

## Lens 4 — Codebase integration

Read the surrounding codebase context — sibling files, imports, the
orientation summary. Review for convention violations, pattern mismatches,
naming inconsistencies, missed reuse of utilities. Common findings: new
toast call instead of the shared `useToast` hook, inline retry logic when a
shared retry utility exists, ad-hoc state management when a shared store
already covers the case.

## Zero-findings rule

If a lens finds nothing, **re-run that lens with a different angle** before
declaring the diff clean. Zero is suspicious — diffs of any complexity
have something. Sustained zero across all four lenses is allowed only when
the diff is genuinely trivial (single-line config rename, typo fix).

## Severity triage

| Severity | Definition | Treatment |
|---|---|---|
| Critical | Bug, data loss risk, security issue, AC violation | Must fix and re-verify before commit |
| Important | Standards violation, missed reuse, accessibility gap | Must fix and re-verify before commit |
| Minor | Style nit, comment improvement | Fix if quick; otherwise log as follow-up |

## Output

A findings list, persisted to
`{paths.implementation_package}/<feature-id>/review-YYYY-MM-DD.md` (the execution-stage
directory — see `references/ai-principles/feature-precondition.md` § Quick-dev layout),
summarized inline.
After Critical and Important findings are fixed, re-run the affected lens
against the updated diff. Loop until clean.

## Then commit

Only after the review is clean and the user has explicitly approved, stage
and commit with conventional commit messages — atomic per AC where possible.
