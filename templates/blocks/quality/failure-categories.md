---
slug: failure-categories
title: "Failure Categories (team-overridable)"
applies-to: [greenfield-quality-package]
requires-decision-from: [qa-engineer, tester]
optional: true
order-hint: 6.5
include-if: "project.elicitation.uses_team_failure_categories == true"
---
## 6a. Failure Categories (team-overridable)
This block is included **only when the team chooses to maintain its
own failure-categories taxonomy** (composition gate
`project.elicitation.uses_team_failure_categories = true`). When the
gate is `false`, the block is omitted and `review-test-failures` uses
the framework-default taxonomy in
`.agents/skills/quality/review-test-failures/references/failure-categories.md`.
When included, this block lets the team:
1. **Override** the framework-default categories with project-specific
   patterns and remediation hints (e.g. "in this project, an
   `AuthZService timeout` always means the IAM environment is being
   redeployed — retry after 5 minutes").
2. **Add** team-specific categories not in the framework defaults
   (e.g. mainframe-specific or platform-specific failure modes).
3. **Drop** categories that don't apply (e.g. an API-only project
   never sees `Element / selector not found`).
4. **Override** the default routing target per category (e.g. a team
   that doesn't use `manage-bugs` and routes all application defects
   to an external tracker via a tool add-on skill or a custom skill).
`review-test-failures` reads this block first; falls back to the
framework default for any category not redefined here.
### 6a.1 Disposition mapping
Every category in this block must resolve to exactly one of four
dispositions. The framework's iron rule:
| Disposition | Default routing target |
|---|---|
| **Script issue** | `execute-quality-increments` or `execute-increments` |
| **Application defect** | `manage-bugs` |
| **Environment / data** | Recommend env fix; if recurring, route to `manage-bugs` |
| **Flaky / non-deterministic** | `execute-quality-increments` (harden the test) |
Teams may override the routing target per category below, but the
disposition itself is fixed framework vocabulary.
### 6a.2 Project-specific categories
For each category the team wants to override or add, copy the
template below and fill it in.
```markdown
#### Category: <category name>
- **Disposition:** <Script issue | Application defect | Environment / data | Flaky / non-deterministic>
- **Signature:**
  - Error message patterns: `<regex or substring 1>`, `<regex or substring 2>`
  - Stack-trace markers: `<class or function name>`
  - Log markers: `<grep pattern>`
  - Screenshot heuristics: <e.g. "blank page", "modal stuck open">
  - Other: <test-data shape, environment indicator, time-of-day, etc.>
- **Default remediation hint:** <2–3 sentences. Reference the
  specific shared utility, page-object, fixture, or runbook the
  remediation should touch.>
- **Routing override (optional):** `/<skill-name>` (with what inputs
  to pass)
- **Confidence calibration:** When the signature matches but the
  evidence is thin, the skill should: <ask for more evidence /
  present as candidate / route directly>.
- **Known false positives:** <list — patterns that look like this
  but aren't>
```
### 6a.3 Team-shadowable layer
If a team needs to override individual sections of this block at a
per-project level (rather than per-feature), shadow it under
`templates/blocks/quality/_user/failure-categories.md` per the
four-layer config rules in `config/SCHEMAS.md`. The shadow file
follows the same shape as this block and wins over both this block
and the framework default.
### 6a.4 Pre-populated example categories
The team should replace these with their own. They are here only to
illustrate the shape.
#### Category: AuthZ service timeout
- **Disposition:** Environment / data
- **Signature:**
  - Error message patterns: `AuthZ.*Service.*timed out`, `IAM .* 504`
  - Log markers: `authz-service-client.*ConnectionPoolTimeout`
- **Default remediation hint:** The IAM environment runs a nightly
  redeploy; check the IAM team's status channel. If outside the
  redeploy window, escalate to the IAM environment owner.
- **Routing override:** (none — environment fix; if it recurs more
  than once per week, route to `/manage-bugs` to track the
  environment-stability bug)
- **Confidence calibration:** High — the signature is specific.
- **Known false positives:** none observed.
#### Category: Stale shared fixture
- **Disposition:** Script issue (fixture refresh required)
- **Signature:**
  - Error message patterns: `expired`, `No such test user`, `seed data not found`
  - Stack-trace markers: `TestDataBuilder.build`
- **Default remediation hint:** Regenerate the fixture via the
  team's fixture-refresh procedure pinned in the quality package's
  `test-data-and-environments` block.
- **Routing override:** `/execute-quality-increments` with a small
  TC to regenerate the fixture; if the fixture is shared across
  features, prefer to refresh once and reuse rather than per-team.
- **Confidence calibration:** High after fixture regeneration; if
  the failure recurs immediately, escalate as an environment issue.
- **Known false positives:** A genuine application defect can
  *also* look like "no such user" — confirm the fixture is fresh
  before classifying as a defect.
### 6a.5 Versioning and review
This block is reviewed during `review-quality-package` only when
included. The review checks:
- Every category has a disposition from the framework's fixed set
- Every category has at least one signature pattern
- Every routing override names an existing framework skill
- No category silently retries failures (the skill never auto-retries
  failures; that is an explicit framework rule)
Treat updates to this block as part of the normal change-tracker
flow — append a `Quality Package` row when categories are added,
modified, or dropped.