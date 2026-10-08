---
slug: final-summary
sequence: 4
depends-on-prior: true
---

# Step 4 — Final Summary

## Purpose

Render the consolidated triage summary, group action items by routing
target, append the audit row to the quality package's change-tracker,
and offer to invoke the next-action skills.

## Procedure

### 4a. Render the summary block

```markdown
## Failure Triage Summary

**Total failures triaged:** <N>
**Date:** <YYYY-MM-DD HH:MM>
**Run reference:** <CI run / local / hand-off ID>
**Failure source:** <execute-quality-increments | execute-increments | CI | user-pasted>

### Triage results

| # | Scenario | Category | Disposition | Cause | Routing | Status |
|---|---|---|---|---|---|---|
| 1 | … | … | Script issue | … | `/execute-quality-increments` | Approved |
| 2 | … | … | App defect | … | `/manage-bugs` | Approved |
| 3 | … | … | Environment | … | (env fix — no skill) | Approved |
| 4 | … | … | Flaky | … | `/execute-quality-increments` | user-override |

### Disposition counts

| Disposition | Count |
|---|---|
| Script issue | A |
| Application defect | B |
| Environment / data | C |
| Flaky / non-deterministic | D |
| Skipped (deferred by user) | E |
```

### 4b. Render action items grouped by routing target

Group the approved rows by routing target so the user can invoke each
target once with all related findings.

```markdown
### Action items (routed)

**Script fixes — invoke `/<script-fix-skill>`:**
- [ ] <failure-1 summary>
- [ ] <failure-4 summary>  (user-override — was flaky; harden the test)

**Application defects — invoke `/manage-bugs`:**
- [ ] <failure-2 summary>  (include evidence from the per-failure
  block above when logging)

**Environment / data fixes (no skill — manual):**
- [ ] <failure-3 summary>  (confirm with environment owner)

**Skipped / deferred (resume later):**
- [ ] <failure-5 summary>
```

If the team's `config/customizations/review-test-failures.toml`
overrides the script-fix or bug-logging routing target, use the
override.

### 4c. Append the change-tracker row

Append one row to
`{paths.quality_package}/<feature-id>/quality/change-tracker.md`:

| Field | Value |
|---|---|
| Date | <YYYY-MM-DD> |
| Change Type | `Audit` |
| Parts Affected | `Quality Package` |
| Section / File | `quality/automation-and-cicd.md` (the evidence source) |
| Description | `Failure triage: <N> failures — <A> script, <B> app-defect, <C> env, <D> flaky, <E> skipped. Run ref: <run-id>.` |
| Source Version | (the quality package version at triage time) |
| Verified | `yes` |
| Trigger note | `Failure triage` |

The row is the audit trail of "this triage happened, here's the
shape of what it found". The per-failure detail lives in chat, not
on disk — re-run the skill against the same failure set to
re-derive the detail.

### 4d. Offer next-action invocation

For each non-empty action-item group, ask:

> The triage produced <K> script fixes, <L> application defects, and
> <M> environment items.
>
> 1. Invoke `/<script-fix-skill>` now with the K script fixes?
> 2. Invoke `/manage-bugs` now with the L application defects?
> 3. Skip and exit (action items remain in this summary for the
>    user to invoke later).

Pass the failure context (failure ID, evidence pointers, KB
component references, routing notes) to the downstream skill as
inputs so it skips redundant elicitation.

### 4e. Verification rule (always-on)

Before closing the skill, summarise:

> **Triage closed.**
> - Failures triaged: <N> (skipped: <E>)
> - Dispositions: <breakdown>
> - Actions taken this turn: <list of invoked skills, or "none —
>   user deferred">
> - Audit record:
>   `{paths.quality_package}/<feature-id>/quality/change-tracker.md`
>   (latest row, Trigger: `Failure triage`)

Wait for explicit user acknowledgement before terminating the skill.

## Common errors to avoid

- **Producing the summary before every failure is triaged.** If the
  user stopped mid-batch in Step 2, Step 4 should reflect that
  partial state honestly — never invent verdicts for unreviewed
  failures.
- **Bundling different routing targets into one invocation.** Script
  fixes go to one skill, bugs to another, environment items to
  manual follow-up. Mixing them confuses the downstream skill.
- **Writing to the bug log directly.** This skill *routes* to
  `manage-bugs`; it never writes a bug entry itself. The user
  confirms each bug at invocation time.
- **Skipping the change-tracker row when the user defers all
  actions.** The triage still happened — record it.
- **Treating "all failures are app defects" as a likely outcome.** A
  clean run that suddenly turns red is usually an environment or
  script issue, not a wave of new app defects. If the triage trends
  heavily toward "app defect", challenge that — ask the user
  whether the suite is wired correctly first.

## End of skill

This is the final step. Control returns to the orchestrator (or the
user) after 4d / 4e.

