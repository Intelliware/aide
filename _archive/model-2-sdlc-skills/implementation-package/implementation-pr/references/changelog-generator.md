# Changelog Generator

## Purpose

Produce a changelog entry from the PR's conventional commits. Group by type, highlight breaking changes.

## What This Does

Produces a changelog entry for the current PR by reading its conventional commits and translating them into human-readable, user-facing change descriptions. Groups changes by category (Added, Changed, Fixed, etc.), highlights breaking changes, and links back to the PR and requirements.

This skill is **conditional** — it only runs if the project maintains a changelog (`CHANGELOG.md` or equivalent). If no changelog exists and the project does not use one, skip this step entirely.

## When to Use

- Step 4 (final step) of the PR workflow — after review is complete
- **Only if** the project maintains a `CHANGELOG.md` or equivalent
- Skip if the project uses GitHub Releases, automated release notes, or no changelog at all

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Commit history | `git log [base]..HEAD` — conventional commits with bodies | Yes |
| Existing changelog | `CHANGELOG.md` or equivalent — for format matching | If exists |
| Changelog entry template | `../assets/changelog-entry.md` | Yes |
| Phase specification | From `implementation-plan.md` — FR mapping for traceability | Yes |
| PR number | From the created PR | Yes |

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  CHANGELOG GENERATOR — SEQUENCE                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CHECK — Does the project maintain a changelog?               │
│     If no → skip entirely                                        │
│                                                                  │
│  2. READ — Existing changelog format and conventions             │
│                                                                  │
│  3. MAP — Conventional commit types to changelog categories      │
│                                                                  │
│  4. TRANSLATE — Commit subjects to user-facing descriptions      │
│                                                                  │
│  5. ASSEMBLE — Group, order, and format the entry                │
│                                                                  │
│  6. PRESENT — Show to user for approval before adding            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Check for Changelog

Look for an existing changelog:
- `CHANGELOG.md`
- `CHANGES.md`
- `HISTORY.md`
- `docs/changelog.md`

If none exists, ask the user: "This project does not have a changelog. Should I create one, or skip this step?"

If the project uses GitHub Releases or automated release tooling instead, skip.

### Step 2 — Read Existing Format

If a changelog exists, read it to match the existing format:

| What to Match | Examples |
|--------------|---------|
| Section headers | `### Added` vs `### New Features` vs `**Features:**` |
| Entry format | `- description (#PR)` vs `* description (commit)` vs bulleted prose |
| Date format | `YYYY-MM-DD` vs `Month DD, YYYY` |
| Version format | `## [1.2.3]` vs `## v1.2.3` vs `## 1.2.3 (date)` |
| Grouping | Keep a Changelog style vs commit-type grouping vs flat list |

Match the existing format exactly. Do not impose a different style.

### Step 3 — Map Commit Types to Changelog Categories

| Commit Type | Changelog Category | Include? |
|------------|-------------------|----------|
| `feat` | **Added** | Always |
| `fix` | **Fixed** | Always |
| `perf` | **Changed** (performance subsection) | Always |
| `refactor` | **Changed** | Only if user-visible (API change, behavior change). Internal refactors are not user-facing. |
| `docs` | **Changed** (documentation) | Only if user-facing documentation (README, API docs). Internal comments are not changelog-worthy. |
| `style` | — | Never — formatting changes are not user-facing |
| `test` | — | Never — test-only changes are not user-facing |
| `chore` | — | Never — build/config changes are not user-facing (unless they affect the user, e.g., dropping a platform) |
| `ci` | — | Never |
| `build` | **Changed** | Only if it affects the user (e.g., changing minimum Node version, dropping a platform) |
| `BREAKING CHANGE` | **Breaking Changes** | Always — at the top of the entry |

### Step 4 — Translate to User-Facing Language

Commit messages are developer-facing. Changelog entries are user-facing. Translate:

| Commit Subject | Changelog Entry |
|---------------|-----------------|
| `feat(orders): add refund eligibility check` | Add refund eligibility check for orders |
| `fix(auth): handle expired token refresh race condition` | Fix authentication failure when token expires during refresh |
| `perf(queries): add index for order lookup by status` | Improve order lookup performance for status-based queries |
| `feat(api)!: change refund endpoint to require order ID in path` | **Breaking:** Refund endpoint now requires order ID in the URL path (see migration guide) |

**Translation rules:**
- Remove the `type(scope):` prefix
- Use full words — not abbreviations or jargon
- Start with a verb (Add, Fix, Improve, Remove, Change)
- Describe the impact to the user, not the implementation detail
- For breaking changes, lead with **Breaking:** and include migration reference

### Step 5 — Assemble the Entry

Group entries by category. Order: Breaking Changes first, then Added, Changed, Fixed, Deprecated, Removed, Security.

Use the template from `../assets/changelog-entry.md` unless the project has a different format (matched in Step 2).

Add traceability:
- Link to the PR: `(#NNN)` or `([#NNN] URL)`
- Link to the FR if user-facing: `— FR-NNN`

### Step 6 — Present and Add

1. Present the changelog entry to the user.
2. Wait for approval.
3. After approval, prepend the entry to the changelog under the `## [Unreleased]` section (or the appropriate version section if the project uses versioned releases).
4. Commit the changelog update:
   ```
   docs(changelog): add entry for [phase description]
   ```

---

## Completion Criteria

- [ ] Changelog existence checked — skill skipped if no changelog exists and user does not want one
- [ ] Existing changelog format matched (headers, entry style, date format)
- [ ] Commit types correctly mapped to changelog categories
- [ ] Only user-facing changes included — internal refactors, tests, and CI changes excluded
- [ ] Breaking changes highlighted at the top with migration guidance
- [ ] Entries translated from developer language to user-facing language
- [ ] PR linked in each entry
- [ ] User has approved the entry before it is added
- [ ] Changelog committed with `docs(changelog):` commit

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Changelog is a raw dump of commit messages — unreadable for users | Step 4 translates developer-facing commits to user-facing descriptions |
| Internal refactors, test additions, and CI changes clutter the changelog | Step 3 mapping excludes non-user-facing commit types |
| Breaking changes are buried in the middle of the changelog — users miss them | Step 5 ordering puts Breaking Changes first |
| Changelog entry uses a different format than the existing changelog | Step 2 reads and matches the existing format |
| Agent creates a changelog for a project that does not use one | Step 1 checks for existing changelog and asks the user |
| Changelog entry says "add refund eligibility check" without linking to the PR or requirement | Step 5 adds PR and FR links for traceability |
