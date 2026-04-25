# PR Creator

## Purpose

Generate a pull request description from the commit history and diff. Summarize changes, link requirements, and document testing done.

## What This Does

Generates a pull request description from the commit history and diff. The description provides sufficient context for human reviewers to understand the change without reading every line of code. It links back to requirements, summarizes design decisions, and documents testing.

This skill runs after the commit creator — it reads the commits that were just created and synthesizes them into a coherent PR description.

## When to Use

- After commits are created (Step 1 of PR workflow)
- Before PR review (Step 3 of PR workflow)
- One PR per phase — each phase is one PR

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Commit history | `git log` for the current branch — commits created by the commit creator | Yes |
| Diff | `git diff [base-branch]...HEAD` — the full changeset | Yes |
| Phase specification | From `implementation-plan.md` — phase identity, goal, FR mapping, ACs | Yes |
| PR description template | `../assets/pr-description.md` | Yes |
| Project PR template | `.github/pull_request_template.md` or `.github/PULL_REQUEST_TEMPLATE/` (if the project has one) | If exists — use the project's template instead of the default |

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  PR CREATOR — SEQUENCE                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DISCOVER TEMPLATE — Check for project PR template            │
│     .github/pull_request_template.md first, then default         │
│                                                                  │
│  2. GATHER — Read commit log, diff stat, and phase spec          │
│                                                                  │
│  3. SYNTHESIZE — Build the PR description from commits           │
│     Group by change type, extract action lines from bodies       │
│                                                                  │
│  4. ENRICH — Add testing summary, breaking changes, checklist    │
│                                                                  │
│  5. VALIDATE — Check completeness and accuracy                   │
│                                                                  │
│  6. PRESENT — Show to user for approval before creating PR       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Discover Template

Check for an existing PR template in this order:
1. `.github/PULL_REQUEST_TEMPLATE/` directory (if multiple templates)
2. `.github/pull_request_template.md`
3. `.github/PULL_REQUEST_TEMPLATE.md`
4. `docs/pull_request_template.md`

If found, use the project's template. Fill every section — no placeholders, no "N/A" unless genuinely not applicable.

If not found, use the default template from `../assets/pr-description.md`.

### Step 2 — Gather Information

Run these commands to build the raw material:

| Command | What It Provides |
|---------|-----------------|
| `git log --oneline [base]..HEAD` | Commit subjects — the backbone of the summary |
| `git log --format='%B---' [base]..HEAD` | Full commit bodies — action lines with decisions, constraints, learnings |
| `git diff --stat [base]...HEAD` | File change summary — which files, how many lines |
| `git diff --name-only [base]...HEAD` | File list — for grouping by area |
| `git diff [base]...HEAD` | Full diff — for verifying claims in the description |

Also read the phase specification to extract:
- Phase ID and name
- FR mapping (which requirements this phase implements)
- Acceptance criteria (for the testing section)
- Goal statement (for the summary)

### Step 3 — Synthesize

Build the PR description by synthesizing commits into sections:

**Summary:** Derive from the phase goal and commit subjects. State what the PR does and why in 2–4 sentences. Include the phase ID and linked FRs.

**Changes:** Group commits by type. For each group, write 1-line descriptions (not the raw commit messages — synthesize them):

| Commit Type | PR Section |
|------------|-----------|
| `feat` | Features |
| `fix` | Fixes |
| `refactor` | Refactoring |
| `perf` | Performance |
| `chore`, `build`, `ci` | Configuration / Infrastructure |
| `docs` | Documentation |
| `test` (standalone) | Testing |

**Files Changed:** From `git diff --stat`, group files by module/layer.

**Design Decisions:** Extract `decision()`, `rejected()`, `constraint()`, and `learned()` action lines from commit bodies. Present them as human-readable bullet points. These are the most valuable part of the PR description — they tell the reviewer *why* the code looks the way it does.

### Step 4 — Enrich

Add sections that commits alone cannot provide:

**Testing:**
- Count new/modified tests from the diff
- Record the test run results (from verification)
- Include the manual test plan from the phase execution guide
- List test commands

**Breaking Changes:**
- If any commit has `BREAKING CHANGE:` footer, pull it into a dedicated section
- Include migration steps

**Checklist:**
- Standard pre-merge checks
- All derived from the commit and verification state

### Step 5 — Validate

| Check | Pass | Fail — fix |
|-------|------|-----------|
| Summary accurately describes the change | Yes | Vague or missing |
| FR/phase links are correct | Yes | Wrong phase ID or FR numbers |
| Changes section accounts for all commits | Yes | Commits are missing from the summary |
| Design decisions are extracted from commit bodies | Yes | Decisions are present in commits but missing from PR description |
| Testing section reflects actual test results | Yes | Claims "all pass" without evidence |
| Breaking changes are documented (if any) | Yes | `BREAKING CHANGE:` in a commit but not in the PR description |
| No placeholder text | Yes | "TODO," "fill in," "N/A" without explanation |
| File list matches `git diff --stat` | Yes | Files missing or extra |
| PR size is reasonable (≤500 lines changed) | Yes | Exceeds limit — check if the phase should have been split |

### Step 6 — Present and Create

1. Present the full PR description to the user.
2. Wait for approval or requested changes.
3. After approval, create the PR:
   ```bash
   git push -u origin HEAD
   gh pr create --title "[type]: [description]" --body "$(cat <<'EOF'
   [PR description]
   EOF
   )"
   ```
4. Confirm with the PR URL.

**PR title format:** Derive from the dominant commit type and the phase goal:
- If all commits are `feat`: `feat(scope): [phase goal summary]`
- If mixed: Use the primary type. Example: `feat(orders): add refund eligibility with validation`

---

## Warnings for Large PRs

If `git diff --stat` shows >500 lines changed (excluding generated files, lock files, test fixtures):

| Lines Changed | Action |
|--------------|--------|
| ≤500 | Normal — proceed |
| 501–800 | **Warning** — note in the PR description that the PR is larger than ideal. Consider if the phase should have been split. |
| >800 | **Flag** — explicitly warn the user. This PR may be too large for effective review. |

---

## Completion Criteria

- [ ] Project PR template used (if one exists) — all sections filled
- [ ] Summary accurately describes the change and links to phase/FRs
- [ ] All commits are accounted for in the Changes section
- [ ] Design decisions from commit bodies are surfaced in the PR description
- [ ] Testing section includes test counts, results, and manual test plan
- [ ] Breaking changes are documented (if any)
- [ ] No placeholder text
- [ ] User has approved the PR description
- [ ] PR is created with correct title and body
- [ ] PR URL is confirmed

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| PR description is a copy-paste of commit messages — no synthesis or context | Step 3 requires synthesizing commits into grouped, human-readable sections |
| Design decisions are buried in commit bodies and the reviewer never sees them | Step 3 explicitly extracts `decision()`, `rejected()`, `constraint()` action lines into a dedicated section |
| PR description says "all tests pass" without evidence | Step 4 requires actual test counts and results from verification |
| PR has no link to requirements — reviewer cannot trace back to what was requested | Step 3 includes phase ID and FR links in the summary |
| PR description uses the project's template but leaves sections as "N/A" placeholders | Step 5 validates that no placeholder text remains |
| PR is created for a 900-line change without anyone noticing | Warnings section flags large PRs and suggests splitting |
| Agent creates PR with a generic title like "Implementation updates" | Step 6 derives the title from the dominant commit type and phase goal |
