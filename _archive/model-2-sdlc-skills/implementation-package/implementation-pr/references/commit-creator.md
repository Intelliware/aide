# Commit Creator

## Purpose

Create conventional commits — atomic changes, proper format (feat/fix/refactor/chore/docs/test), meaningful messages explaining why not what.

## What This Does

Creates atomic, well-structured commits using Conventional Commits format with contextual commit bodies that preserve the *why* behind code changes. The subject line follows the standard `type(scope): description` format for tooling compatibility. The body captures intent, decisions, constraints, and learnings that the diff alone cannot show.

This skill is invoked after the implementation is verified and the user has approved the code. It does not write code — it commits code that the feature implementer has already written.

## When to Use

- After the user approves the implementation (per phase execution guide Step 5)
- After all tests pass and verification is complete
- Before PR creation — commits are the raw material for the PR description

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Verified code changes | Working tree — the approved implementation | Yes |
| Phase specification | From `implementation-plan.md` — phase identity, goal, FR mapping | Yes |
| Implementation history | The session context — what was discussed, decided, and learned | Yes |
| Project commit conventions | From codebase analysis or `project-context.md` — existing commit style | Yes |

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  COMMIT CREATOR — SEQUENCE                                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ASSESS — Review the diff and identify logical units          │
│                                                                  │
│  2. SPLIT — Determine commit boundaries (one concern per commit) │
│                                                                  │
│  3. COMPOSE — Write subject line + contextual body per commit    │
│                                                                  │
│  4. VALIDATE — Check format, atomicity, and traceability         │
│                                                                  │
│  5. STAGE & COMMIT — Stage files and commit with user approval   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Assess the Changes

Run `git diff --stat` and `git diff` to understand the full scope of changes:

| What to Identify | How |
|-----------------|-----|
| Files created | New files that didn't exist before |
| Files modified | Changed files with meaningful diffs |
| Files deleted | Removed files |
| Logical groupings | Which files belong together (e.g., service + its tests, migration + entity) |
| Change magnitude | Total lines changed — informs split strategy |

### Step 2 — Determine Commit Boundaries

Each commit should contain exactly one logical change. Split changes when they serve different purposes.

**Splitting rules:**

| Scenario | Split Strategy |
|----------|---------------|
| Implementation + tests for the same behavior | **One commit** — tests and production code for the same behavior belong together (TDD) |
| Database migration + entity that uses it | **One commit** — migration and entity are coupled |
| Feature code + configuration for the feature | **One commit** — config is part of the feature |
| Two independent features in the same phase | **Two commits** — each feature is a separate logical change |
| Refactoring + new feature that uses the refactoring | **Two commits** — `refactor:` then `feat:` |
| Formatting/style fixes alongside functional changes | **Two commits** — `style:` then `feat:/fix:` |
| Dependency additions + code that uses them | **One commit** if tightly coupled; **two commits** if the dependency is useful independently |

**When the phase is a single logical change (most common):** One commit for the entire phase. Do not split into artificial micro-commits.

### Step 3 — Compose Commit Messages

Each commit message has two parts: a **subject line** (required) and a **contextual body** (when reasoning needs preserving).

#### Subject Line — Conventional Commits Format

```
type(scope): description
```

**Type** — what kind of change:

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature or capability | `feat(orders): add refund eligibility check` |
| `fix` | Bug fix | `fix(auth): handle expired token refresh race condition` |
| `refactor` | Code restructuring without behavior change | `refactor(payments): extract currency conversion to utility` |
| `test` | Test-only changes (adding missing tests, fixing flaky tests) | `test(orders): add edge cases for refund calculation` |
| `docs` | Documentation only | `docs(api): update endpoint descriptions for v2` |
| `style` | Formatting, whitespace, lint fixes — no logic change | `style(services): apply consistent import ordering` |
| `chore` | Build, config, tooling — no production code change | `chore(deps): update jest to v30` |
| `perf` | Performance improvement | `perf(queries): add index for order lookup by status` |
| `ci` | CI/CD pipeline changes | `ci(github): add integration test step to workflow` |
| `revert` | Reverting a previous commit | `revert: feat(orders): add refund eligibility check` |
| `build` | Build system or external dependency changes | `build(docker): update base image to node 22` |

**Scope** — the area of the codebase affected. Use the project's vocabulary (module names, layer names, feature names). Keep scopes consistent across commits:
- Good: `auth`, `orders`, `payments`, `api`, `db`, `cli`
- Bad: `authentication` in one commit, `auth` in the next

**Description** — imperative, present tense, lowercase after the type prefix, no trailing period:
- Good: `add refund eligibility check`
- Bad: `Added refund eligibility check.`

**Length:** ≤72 characters for the full subject line. If it does not fit, the scope or description is too broad — consider splitting the commit.

#### Subject Line for Breaking Changes

Append `!` after the type/scope for breaking changes:

```
feat(api)!: change refund endpoint to require order ID in path
```

#### Contextual Body — Action Lines

The commit body captures the reasoning that the diff cannot show. Each line follows `action-type(scope): description`.

**Action types:**

| Action Type | What It Captures | When to Use |
|-------------|-----------------|-------------|
| `intent(scope)` | What the user wanted and why — their words, not an implementation summary | Most feature work; any change where the motivation is not obvious from the subject |
| `decision(scope)` | What approach was chosen when alternatives existed | When you evaluated options; skip for obvious choices |
| `rejected(scope)` | What was considered and discarded, with the reason | Every time a meaningful alternative was not pursued — always include the reason |
| `constraint(scope)` | Hard limits or boundaries that shaped the approach | When non-obvious limitations influenced the implementation |
| `learned(scope)` | Something discovered that would save time in future sessions | API quirks, undocumented behavior, performance characteristics |

**Rules for action lines:**

| Rule | Detail |
|------|--------|
| Only write action lines that carry signal | If the diff already explains it, do not repeat it |
| Do not pad with noise | Most commits need 1–3 action lines. Trivial commits (typo, dep bump) need zero. |
| Use consistent scopes | If you called it `auth` in one commit, do not call it `authentication` in another |
| Always explain *why* for `rejected` lines | A rejection without a reason is useless — the next developer will re-propose the same thing |
| Do not fabricate context you do not have | If you were not part of the reasoning (prior session, manual edit), only write what the diff evidences |

**When to skip the body entirely:**
- Typo fixes
- Dependency bumps
- Formatting-only changes
- Any commit where the subject line says everything

#### Breaking Change Footer

For breaking changes, add a `BREAKING CHANGE:` footer explaining what breaks and how to migrate:

```
feat(api)!: change refund endpoint to require order ID in path

intent(refunds): align with REST conventions — refund is a sub-resource of order
decision(api-design): /orders/:id/refunds over /refunds?orderId=:id for consistency

BREAKING CHANGE: POST /refunds no longer accepts orderId in the body.
Use POST /orders/:orderId/refunds instead. Response shape is unchanged.
```

#### Traceability Footer

Add a traceability footer linking the commit to the implementation plan and requirements:

```
Implements: PHASE-003
Refs: FR-007, FR-008
```

### Step 4 — Validate

Before staging, check each commit message:

| Check | Pass | Fail — fix |
|-------|------|-----------|
| Subject follows `type(scope): description` format | Yes | Missing type, scope, or colon |
| Subject is ≤72 characters | Yes | Too long — split or shorten |
| Description is imperative, lowercase, no trailing period | Yes | Past tense, uppercase, or period |
| Type is correct for the change | Yes | Using `feat` for a bug fix, `fix` for a refactor |
| Scope matches project vocabulary | Yes | Using a scope that doesn't exist in the project |
| Body action lines only carry signal (if present) | Yes | Restating what the diff shows, or fabricating context |
| Breaking changes have `BREAKING CHANGE:` footer | Yes | Breaking change without migration guidance |
| Commit is atomic — one logical change | Yes | Mixed concerns (feature + unrelated refactor) |
| Traceability footer links to phase/FR | Yes | No traceability |

### Step 5 — Stage and Commit

For each commit:

1. **Stage the files** that belong to this logical change:
   ```bash
   git add <specific files>
   ```
   Do not use `git add .` when splitting into multiple commits — stage only the files for this commit.

2. **Present the commit message** to the user for review before committing.

3. **Commit only after user approval:**
   ```bash
   git commit -m "$(cat <<'EOF'
   type(scope): subject line

   action-type(scope): description
   action-type(scope): description

   Implements: PHASE-NNN
   Refs: FR-NNN
   EOF
   )"
   ```

4. **Confirm** — show the commit hash and summary.

---

## Examples

### Simple phase — single commit, no body needed

```
feat(orders): add refund eligibility check

Implements: PHASE-003
Refs: FR-007
```

### Moderate phase — single commit with context

```
feat(notifications): add email digest for weekly summaries

intent(notifications): users want batch notifications instead of per-event emails
decision(digest-schedule): weekly on Monday 9am — matches user research feedback
constraint(email-provider): SendGrid batch API limited to 1000 recipients per call

Implements: PHASE-005
Refs: FR-012, FR-013
```

### Phase with refactoring prerequisite — two commits

Commit 1:
```
refactor(payments): extract currency conversion to utility

decision(currency-handling): shared utility over inline conversion for reuse across services

Implements: PHASE-007 (step 1)
```

Commit 2:
```
feat(payments): add multi-currency support for EUR and GBP

intent(payments): enterprise customers need EUR and GBP alongside USD
rejected(money-library): accounting.js — lacks sub-unit arithmetic, using currency.js
constraint(stripe): currency required at PaymentIntent creation, cannot change after
learned(stripe): presentment currency vs settlement currency are different concepts

Implements: PHASE-007 (step 2)
Refs: FR-019, FR-020
```

---

## Completion Criteria

- [ ] Every commit follows `type(scope): description` format
- [ ] Subject lines are ≤72 characters, imperative, lowercase, no trailing period
- [ ] Each commit contains exactly one logical change (atomic)
- [ ] Body action lines (if present) carry signal — no noise, no fabricated context
- [ ] Breaking changes have `BREAKING CHANGE:` footer with migration guidance
- [ ] Traceability footers link each commit to phase and FR IDs
- [ ] User has approved each commit message before it was executed
- [ ] All commits are confirmed with hash and summary

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Agent creates one massive commit for the entire phase with "implement phase 3" as the message | Step 2 splitting rules and Step 3 format requirements produce descriptive, atomic commits |
| Agent uses past tense, vague messages ("fixed stuff," "updates") | Step 3 format rules enforce imperative, specific descriptions |
| Commit message explains WHAT changed but not WHY — context is lost for future developers | Contextual body action lines capture intent, decisions, constraints, and learnings |
| Same rejected approach is re-proposed in a future session because no one recorded why it was discarded | `rejected(scope)` action lines preserve what was considered and why it was dropped |
| Commit has no link to the implementation plan or requirements — traceability is broken | Traceability footer (`Implements:`, `Refs:`) links every commit to its phase and FRs |
| Agent commits formatting changes mixed with functional changes — diff is unreadable | Step 2 splitting rules separate style from functional changes |
| Agent fabricates reasoning in the commit body for changes it did not produce | "When You Lack Conversation Context" rules — only write what the diff evidences |
| Agent runs `git add .` when it should have split into multiple commits | Step 5 requires staging specific files per commit |
