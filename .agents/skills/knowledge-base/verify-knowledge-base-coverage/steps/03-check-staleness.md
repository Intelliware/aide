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

## Hand-off

`steps/04-emit-report.md`.
