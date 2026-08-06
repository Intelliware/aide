# Elicitation Pattern — Operations Discovery

Used by `document-operations/steps/02-elicit-gaps.md`.

## Context

Fill the gaps the auto-derivation step left as TODOs. Cover four
domains: deployment topology, environments & secrets, SLOs &
monitoring, runbooks & on-call. Privilege measurement reality over
aspiration; tag aspirational items explicitly.

## Conversation script

### Topology

1. "Confirm the auto-derived clouds and regions." Show the list. Ask
   for additions and corrections.
2. "Failover model — automatic? Manual? What's the trigger? Who
   approves?"
3. "Release cadence — how often do you ship to prod?"
4. "Change-freeze windows — peak season, audit periods, embargo dates?"
5. "Deployment strategy — blue-green / canary / rolling / replace?"
6. "Auto-scaling — HPA / fixed / queue-driven / manual?"

### Environments & secrets

1. "Environment matrix — confirm dev / staging / prod (or other)."
2. "Account / project / namespace per env."
3. "Config layering — what overrides what?"
4. "Secret stores — name them and the owner per store."
5. "Rotation cadence per secret class. Automated or manual?"
6. "Bootstrap secrets — how does a new env get its first secret?"

### SLOs & monitoring

For each NFR ceiling captured in `30-constraints-and-compliance.md` § 3:

1. "Is this currently measured? Tool? Dashboard?"
2. "SLO target?"
3. "SLI definition — what numerator over what denominator?"
4. "If not measured, who would measure it?" → tag `aspirational`.

Then:
5. "Error-budget policy — what does the team do when an SLO is
   breached?"
6. "Alert routing — paging tool, service, severities."
7. "Dashboard catalog — link each that the on-call uses."

### Runbooks

1. "What incidents has the team actually responded to in the last
   year?" Each answer is a runbook candidate.
2. For each runbook to author now:
   - Trigger — alert, customer report, automated check?
   - Detection signal — which dashboard or log query?
   - Mitigation steps — numbered, concrete actions.
   - Verification — how do you know mitigation worked?
   - Communication — status page, customer comms, internal channel.
3. Runbooks the user names but doesn't have time to detail get a stub
   with `TODO(author)` and the responsible engineer.

### On-call

1. "Confirm rotations from `50-ownership-and-raci.md`."
2. "Paging tool?"
3. "Escalation tiers 2, 3?"
4. "Handover meeting cadence?"
5. "Shadow / training procedure for new on-call engineers?"
6. "Incident-comms channel(s)?"

## Probes for blind spots

- "If you got paged at 03:00 right now, what would you wish you had
  documented but don't?" (Surfaces the most-missed runbook.)
- "Has there been an incident where the runbook didn't match
  reality?" (Surfaces stale runbooks; flag for refresh.)
- "Who has tribal knowledge that nobody else has?" (Surfaces single-
  point-of-failure people; capture their topics as runbook
  candidates.)

## Anti-patterns

- **Aspirational SLOs presented as real.** If the team isn't measuring
  it, mark `aspirational`. Never claim "99.95 % uptime" without an
  SLI definition + measurement tool.
- **Runbook copy-paste from another system.** Every runbook is
  specific — the trigger, mitigation, and verification must be
  accurate for THIS solution. Refuse generic templates.
- **Documenting only the happy path.** Failure modes are the point.
  The conversation is about what breaks and how it gets fixed.
