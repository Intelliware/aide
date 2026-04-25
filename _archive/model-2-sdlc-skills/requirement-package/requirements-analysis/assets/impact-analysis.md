# Impact Analysis

> **Project:** [project name]
> **Change request:** [brief description]
> **Date analysed:** [date]
> **Change scope reference:** [link or filename]
> **Dependency map reference:** [link or filename]

> **If discovery was skipped:** all consumer and dependency claims are derived from stakeholder input; confidence defaults to Low until independently verified. Record baseline absence in each affected entry's Notes field.
> **In-flight parallel work:** [list any other features under active development that also modify in-scope components, or "None identified"]

---

## Impact Register

One row per impact. Group by the in-scope change-scope item that causes it.

### Impacts from [SC-001: description of in-scope item]

| ID | Affected Element | Category | Nature | Severity | Confidence | Evidence | Mitigation | Mitigation Owner | Notes |
|----|-----------------|----------|--------|----------|------------|----------|-----------|-----------------|-------|
| IMP-001 | [consumer / process / team / customer group] | [Upstream consumer / Downstream recipient / Shared business asset / Business process & workflow / Customer & end-user experience / Operational readiness / Financial & contractual obligations / Security & compliance / Team ownership] | [Breaking / Behavioral / Performance / Configuration / Obligation — one or more] | [High / Medium / Low] | [High / Medium / Low] | [business process documentation / baseline section / stakeholder confirmation: name, date / inferred: basis] | [Update / Preserve parallel capability / Notify / Coordinate / Accept / Monitor] | [team or person] | [constraints, unknowns, open questions, in-flight parallel work flags — required field] |

> **High-severity mitigation rule:** Accept and Monitor are not appropriate for High-severity impacts. These require Update, Preserve parallel capability, or Coordinate. Any exception requires explicit BSA sign-off recorded in the Notes field.
>
> **Notify requires:** record who will be notified, by when, and who confirms receipt — "Notify" without a confirmed follow-up is not a complete mitigation.

*Repeat the impact table for each in-scope change-scope item.*

---

## Cross-Team Coordination Required

| Impact ID | Affected Team | Nature of Coordination | Timeline Dependency | Contact | Escalated to Risk? |
|-----------|--------------|----------------------|--------------------|---------|--------------------|
| IMP-xxx | [team name] | [Notify / Joint effort / Approval / Interface contract renegotiation] | [Must complete before feature ships / Can follow] | [name] | [Yes — RISK-xxx / No] |

---

## Severity Summary

| Severity | Count | IDs |
|----------|-------|-----|
| High — requires Update, Preserve parallel capability, or Coordinate | | |
| Medium | | |
| Low | | |
| **Total impacts** | | |

**High-severity impacts for BSA review:** [list IMP IDs or "None"]
