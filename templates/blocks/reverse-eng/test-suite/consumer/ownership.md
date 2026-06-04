---
slug: ownership
title: "Ownership"
applies-to: [re-test-suite-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 200
---

## 10. Ownership

Who maintains the suite, who reviews new scenarios, who owns each application area's coverage, and where to file issues or improvement proposals. The reuse pipeline ("can I reuse this helper / extend this builder / propose a new tag?") goes through these owners; without explicit names, consuming skills surface "unowned" findings during the audit pass.

Keep ownership at the team or role level, not at the individual contributor level — individual names go stale; team aliases survive.

### Suggested template content

```yaml
---
kind: test-suite
component-id: {{suite-id}}
sub-component: ownership
---
```

**Suite-level ownership:**

| Role | Owner | Contact | Responsibilities |
|---|---|---|---|
| Suite maintainer | `{{maintainer-team}}` | `{{maintainer-contact}}` | Stack upgrades, runner config, shared utilities, page-object refactors, vocabulary changes |
| QE lead | `{{qe-lead-team}}` | `{{qe-lead-contact}}` | Coverage strategy, flake-rate review, quarantine triage |
| Release manager | `{{release-team}}` | `{{release-contact}}` | Deploy-gate ownership, stage / prod runbook |
| Data steward | `{{data-team}}` | `{{data-contact}}` | Seed-data refresh, builder / fixture review, PII guard |

**Per-application-area coverage ownership:**

| Application area | Coverage owner (team) | Reviewer for new scenarios |
|---|---|---|
| `{{area-1}}` | `{{team-1}}` | `{{reviewer-1}}` |
| `{{area-2}}` | `{{team-2}}` | `{{reviewer-2}}` |
| `{{area-3}}` | `{{team-3}}` | `{{reviewer-3}}` |

**Review routing (consumer-facing):**

| Change type | Routes to |
|---|---|
| New scenario in covered area | Coverage owner for that area |
| New / extended shared utility | Suite maintainer |
| New / extended page object | Suite maintainer |
| New / extended builder or fixture | Data steward + suite maintainer |
| New canonical step-definition phrasing | Suite maintainer |
| Vocabulary / tag changes | Suite maintainer + QE lead |
| Quarantine entry add / remove | QE lead |

**How to file issues:**

| Issue type | Where to file | Template |
|---|---|---|
| Suite bug | `{{issue-tracker}}` → `{{suite-component}}` | `{{bug-template-link}}` |
| Coverage gap | `{{issue-tracker}}` → `{{coverage-component}}` | `{{gap-template-link}}` |
| Flake report | `{{issue-tracker}}` → `{{flake-component}}` | `{{flake-template-link}}` |
| Vocabulary proposal | RFC repo at `{{rfc-repo}}` | `{{rfc-template-link}}` |

**Findings routing (from consuming skills):**

- `audit-quality-coverage` "unowned scenario" findings → assigned to the suite maintainer.
- `audit-quality-coverage` "coverage gap" findings → assigned to the area coverage owner.
- `review-test-failures` "suspected suite bug" classifications → routed to the suite maintainer with the triage summary attached.
- `review-test-failures` "app defect" classifications → routed to the application team, not the suite team.

**Office hours / sync:** {{office-hours — e.g. "Suite maintainer holds open office hours Tuesdays 2pm UTC; QE lead runs the weekly flake review Thursdays 4pm UTC."}}

