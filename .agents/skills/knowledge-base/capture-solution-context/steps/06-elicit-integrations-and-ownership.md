---
slug: elicit-integrations-and-ownership
sequence: 6
depends-on-prior: true
---

# Step 6 — Elicit external integrations & ownership/RACI

## Goal

Produce two leaves in one step:

- `<KB>/shared/solution-context/40-external-integrations.md` — vendor
  catalog at organisational level (not just code-consumed APIs).
- `<KB>/shared/solution-context/50-ownership-and-raci.md` — team
  ownership, decision authority, on-call structure.

These are bundled because integrations are usually owned by the same
teams the user is mapping in RACI.

## Inputs

- RE Part B "consumer" docs (auto-fills first-pass list of code-
  consumed APIs).
- `[[project.repos]]` (per-repo team ownership).
- ARCHITECTURE.md § 2 (repo map for ownership rows).
- Elicitation patterns:
  `references/elicitation-patterns/integration-discovery.md` and
  `references/elicitation-patterns/ownership-and-raci.md` (NEW — created
  by this skill's authoring task).

## Procedure

### 6.1 External integrations

1. **Auto-fill first pass** by scanning RE Part B consumer sections for
   external API references (Stripe, Twilio, Segment, etc.). Present the
   list to the user and ask "any vendors / SaaS not visible in code?"
   (governance tools, analytics, secrets manager, …).
2. **For each vendor** capture:
   - Name + product
   - Category (PSP, observability, analytics, identity, secrets,
     CRM, ESP, …)
   - Criticality (critical / important / nice-to-have)
   - Owner team
   - Contract status (signed / negotiating / month-to-month / informal)
   - Renewal window (if known)
   - Replacement plan (if any) — `none` is valid
3. **Draft `40-external-integrations.md`** with sections:
   - Frontmatter
   - § 1 Vendor catalog (table)
   - § 2 Critical-path map (which vendors block which user flows)
   - § 3 Replacement plans (table; pointers to ADRs if any)

### 6.2 Ownership & RACI

1. **For each repo in `[[project.repos]]`** elicit RACI rows:
   - Responsible (executes the work)
   - Accountable (signs off; one team)
   - Consulted (input gathered)
   - Informed (kept in the loop)
2. **For each major capability** (from ARCHITECTURE.md § 4) elicit the
   same RACI shape if it differs from the repo's default.
3. **Capture on-call rotation:** which rotation covers which repo /
   capability, escalation path, paging tool.
4. **Draft `50-ownership-and-raci.md`** with sections:
   - Frontmatter
   - § 1 Repo ownership (table)
   - § 2 Capability ownership (table; only when it differs from repo)
   - § 3 On-call rotations (table)
   - § 4 Decision-rights matrix (architecture, security, product)

## Frontmatter

```yaml
---
solution_context_id: 40-external-integrations
description: >-
  Use when assessing vendor exposure for a feature, planning a vendor
  swap, or validating that a critical-path vendor has a replacement
  plan.
triggers:
  - vendors
  - SaaS
  - external integrations
  - third-party APIs
  - PSP
  - vendor swap
  - critical-path vendor
last_captured: <ISO-8601 date>
last_captured_by: <user_id>
related_components: []
---
```

```yaml
---
solution_context_id: 50-ownership-and-raci
description: >-
  Use when routing a feature's review or approval, identifying the
  on-call rotation for an incident, or resolving a decision-rights
  question.
triggers:
  - ownership
  - RACI
  - on-call
  - team
  - decision rights
  - escalation
  - approver
last_captured: <ISO-8601 date>
last_captured_by: <user_id>
related_components: []
---
```

## Acceptance

- Both files exist.
- Vendor catalog has ≥ 1 row OR explicit "no external integrations"
  sentinel.
- Repo-ownership table has one row per `[[project.repos]]` entry.
- On-call section is populated OR explicitly "no formal rotation".

## Outputs

- `<KB>/shared/solution-context/40-external-integrations.md`
- `<KB>/shared/solution-context/50-ownership-and-raci.md`

## Hand-off

`steps/07-emit-and-glossary.md`.
