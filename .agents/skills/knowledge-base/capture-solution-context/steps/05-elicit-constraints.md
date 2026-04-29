---
slug: elicit-constraints
sequence: 5
depends-on-prior: true
---

# Step 5 — Elicit constraints & compliance

## Goal

Produce `<KB>/shared/solution-context/30-constraints-and-compliance.md`
capturing the regulatory regimes, contractual obligations, and
non-functional ceilings that shape every solution decision.

## Inputs

- `20-goals-and-kpis.md` § 2 KPI table (NFR ceilings often mirror
  guardrail KPIs).
- ARCHITECTURE.md § 1 (industry / domain context).
- Elicitation patterns: `references/elicitation-patterns/non-functional-discovery.md` and (when defined) `regulatory-compliance.md`.

## Procedure

1. **Open elicitation conversation.** For each of these categories,
   ask the user to either populate or explicitly mark "none":
   - **Regulatory** — PCI DSS, GDPR, HIPAA, SOC 2, ISO 27001, FedRAMP,
     industry-specific (e.g. PSD2, FERPA, CCPA, …).
   - **Contractual** — SLAs (uptime, latency, support response), data
     residency, exclusivity, audit rights.
   - **Non-functional ceilings** — performance budgets, scale ceilings,
     security must-haves, accessibility level, browser/device support
     matrices.
   - **Operational** — data retention windows, key-rotation cadence,
     backup-restore objectives, change-freeze windows.
   - **Architectural** — must-use vendors, must-not-use vendors, language
     bans, deployment-region constraints.
2. **For each captured constraint** record:
   - Name + scope (project-wide / per-repo / per-feature)
   - Source (regulator / contract / ADR / verbal commitment)
   - Status (active / deprecated / pending)
   - Verification mechanism (audit / automated check / manual review)
   - Linked KPI from `20-goals-and-kpis.md` if any
3. **Draft `30-constraints-and-compliance.md`** with sections:
   - Frontmatter
   - § 1 Regulatory regimes (table)
   - § 2 Contractual obligations (table)
   - § 3 Non-functional ceilings (table; cross-references KPI guardrails)
   - § 4 Operational policies (table)
   - § 5 Architectural prohibitions (table; informs `generate-ai-rules`)
4. **Confirm and save.** "None" is acceptable per category but must be
   stated explicitly — empty sections are forbidden.

## Frontmatter

```yaml
---
solution_context_id: 30-constraints-and-compliance
description: >-
  Use when validating that a feature respects regulatory regimes,
  contractual SLAs, NFR ceilings, or architectural prohibitions before
  it ships.
triggers:
  - constraints
  - compliance
  - regulatory
  - SLA
  - PCI
  - GDPR
  - HIPAA
  - SOC 2
  - non-functional
  - NFR
  - data residency
last_captured: <ISO-8601 date>
last_captured_by: <user_id>
related_components: []
---
```

## Acceptance

- File exists.
- All five sections § 1–5 present and populated (each row OR explicit
  "none — confirmed by <user> on <date>").
- Every constraint has Name, Source, Status, Verification.
- Architectural prohibitions table contains at least the explicit
  "none" sentinel (it is the input to `generate-ai-rules`).

## Outputs

- `<KB>/shared/solution-context/30-constraints-and-compliance.md`.

## Hand-off

`steps/06-elicit-integrations-and-ownership.md`.
