---
slug: elicit-gaps
sequence: 2
depends-on-prior: true
---

# Step 2 — Elicit gaps

## Goal

Fill every TODO in the Step 01 draft. Where measurement is absent, tag
items `aspirational` rather than fabricating values. Where the SRE
team disagrees with the auto-derivation, override.

## Inputs

- Operations draft from Step 01.
- `30-constraints-and-compliance.md` § 3 (NFR ceilings) and § 1
  (regulatory regimes affecting log retention etc.).
- `50-ownership-and-raci.md` § 3 (rotations).
- Elicitation pattern: `references/elicitation-patterns/operations-discovery.md` (NEW).

## Procedure (interactive mode)

### 2.1 Deployment topology
- "Confirm cloud(s) and primary regions auto-derived?"
- "Failover model — automatic or manual? Trigger? Approver?"
- "Release cadence — daily / weekly / on-demand? Any change-freeze
  windows?"
- "Auto-scaling shape — HPA / fixed / queue-driven?"
- "Blue-green / canary / rolling — current default?"

### 2.2 Environments & secrets
- "Environment matrix — confirm dev/staging/prod (or other)."
- "Config layering — what overrides what?"
- "Secret stores — name them. Owner per store."
- "Rotation cadence per secret class."
- "Bootstrap secrets — how does a new env get its first secrets?"

### 2.3 SLOs & monitoring
- For each NFR ceiling captured in `30-constraints-and-compliance.md` § 3,
  ask:
  - "Is this currently measured? If yes, what tool? What dashboard?"
  - "What is the SLO target?"
  - "What is the SLI definition?"
  - "If not measured, who would measure it?" → tag `aspirational`.
- "Error-budget policy — when an SLO is breached, what action does the
  team take?"
- "Alert routing — which tool, which service, who pages?"

### 2.4 Runbooks
- Surface candidate runbooks from Step 01 ("deploy-rollback",
  "failover", any auto-derivable candidates).
- Ask: "What other failure modes have you actually responded to in the
  last year?" Each answer becomes a runbook candidate.
- For each runbook to author now:
  - Trigger condition (alert, customer report, automated check).
  - Detection signal (which dashboard, which log query).
  - Mitigation steps (numbered, concrete).
  - Verification (how do you know the mitigation worked).
  - Communication (status page, customer comms, internal channel).
- Runbooks the user names but doesn't have time to detail get a stub
  with `TODO(author)` and the responsible engineer.

### 2.5 On-call
- Pull rotations from `50-ownership-and-raci.md`. Confirm or override.
- Add: paging tool, escalation tiers (2, 3), handover meeting cadence,
  shadow / training procedure.
- Capture the channel for incident comms (e.g. `#incident-checkout`).

## Procedure (non-interactive mode)

- Skip the elicitation. Promote every TODO from Step 01 into the leaf
  body verbatim, with the discovery question as a comment.
- Pull NFR ceilings from solution-context as `aspirational` SLOs.

## Acceptance

- Every TODO from Step 01's draft has been resolved (filled,
  `aspirational`-tagged, or `TODO(author): <responsible>` for runbooks).
- Every NFR ceiling from constraints has a matching SLO row or
  aspirational tag.
- On-call section reconciled with `50-ownership-and-raci.md`.
- Imperative form on runbook steps (numbered actions, not advice).

## Outputs

- Completed operations record, ready for Step 03.

## Hand-off

`steps/03-emit.md`.
