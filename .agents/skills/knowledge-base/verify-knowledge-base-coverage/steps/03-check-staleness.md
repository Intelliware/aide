---
slug: check-staleness
sequence: 3
depends-on-prior: true
---

# Step 3 — Check staleness warnings (wall-clock based)

## Goal

Identify components whose `last_verified_against_commit` is older than
`staleness_warning_days` (default 30) by wall clock. These are warnings,
not errors — staleness is informational here, drift detection is the
authoritative freshness check (delegated to `detect-knowledge-base-drift`).

## Inputs

- All component frontmatter.
- `--staleness-warning-days` value (default 30 from
  `framework.toml [knowledge_base] staleness_warning_days`).

## Procedure

For each component:

1. Read `last_verified_against_commit`.
2. Resolve the date of that commit:
   `git -C <repo.path> show -s --format=%cI <SHA>` → ISO 8601 date.
   - If the SHA is not present in the repo (rare — repo was rebased or
     SHA was wrong from the start), record a `commit_unknown` warning
     and continue.
3. Compute `age_days = (today - commit_date).days`.
4. If `age_days > --staleness-warning-days`, emit a warning:
   - `component_id`.
   - `last_verified_against_commit`.
   - `commit_date` (ISO).
   - `age_days`.
   - `recommended_action`: "Run `detect-knowledge-base-drift` on this
     component; if drift confirmed, run `update-knowledge-base`. If the
     component is genuinely stable and the staleness is acceptable,
     consider extending `staleness_warning_days` in
     `framework.toml`."

## Solution-context coverage warnings

In addition to component staleness, this step emits **coverage warnings**
for the human-grounded shared subtrees. These are project-scoped, not
per-component, so they are listed once per leaf rather than per repo.

For each of these directories, count populated leaves:

| Directory | Expected leaves | Warning when |
|---|---|---|
| `<KB>/shared/solution-context/` | 6 (00, 10, 20, 30, 40, 50) | < 6 leaves present |
| `<KB>/shared/ai-rules/` | 1 (`project-context.md`) | not present |
| `<KB>/shared/operations/` | 4 (00, 10, 20, 30) | < 4 leaves present |

For each missing leaf, emit a warning:

- `kind`: `solution-context-missing-leaf`.
- `expected_path`: which leaf is missing.
- `recommended_action`: "Run `capture-solution-context` /
  `generate-ai-rules` / `document-operations` to create this leaf."

Additionally, for each `[[project.repos]]` entry, grep across all six
solution-context leaves for the repo's `code`. If no reference exists
anywhere, emit:

- `kind`: `solution-context-repo-orphan`.
- `repo_code`: the repo missing references.
- `recommended_action`: "Run `capture-solution-context --refresh-only`
  and ensure `50-ownership-and-raci.md` § 1 lists this repo."

Solution-context warnings are **informational** (severity = low) — they
do not block other flows, but they appear in the coverage report so a
team can see the human-grounded layer is incomplete.

## Note on relationship to drift detection

Coverage's staleness warning is purely time-based. Drift detection's L1
is commits-based. They surface different signals:

- **Coverage warning:** "this component hasn't been re-verified in N
  days, even if no commits touched it." Useful when a verification
  cadence policy is in force ("everything re-verified quarterly").
- **Drift L1:** "this component's repo moved past its stamp AND paths
  overlap." Useful when something has actually happened.

The two are complementary; neither replaces the other.

## Acceptance

- Every component has a wall-clock age computed (or `commit_unknown`
  recorded).
- Warnings list contains every component over the threshold.
- Solution-context coverage check emitted (count of expected vs
  actual leaves per shared subtree; per-repo orphan list).

## Hand-off

`steps/04-emit-report.md`.
