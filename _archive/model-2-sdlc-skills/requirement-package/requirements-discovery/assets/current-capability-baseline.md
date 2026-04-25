# Existing System Baseline

> **Project:** [project name]
> **Proposed change:** [brief description of the feature or change request]
> **Baseline date:** [date]
> **Prepared by:** [name]
> **Discovery inputs:** capability review ✓ | documentation review ✓ | process mapping ✓ | user journey mapping ✓ | stakeholder elicitation ✓

---

## System Overview

| Field | Value |
|-------|-------|
| **System name** | [name] |
| **Purpose** | [what the system exists to do — one or two sentences] |
| **Primary users** | [personas, user roles, or user types] |
| **System description** | [high-level description of what the system does and how users interact with it — e.g., web application, mobile app, automated process] |

---

## Current Capabilities Summary

Key feature areas the system currently provides. This is a curated summary — see the full current-capability-inventory for the complete list.

| Capability Area | Key Capabilities | Relevance to Change |
|----------------|-----------------|---------------------|
| [area — e.g., "Order Management"] | [brief description of what this area does] | [Directly affected / Indirectly affected / Unrelated] |

**Information involved:** [Key information types — name and one-line business meaning]

**Screens and surfaces:** [Key pages or screens and what users can do there]

---

## Information Landscape

### Information Stores

| Information Area | Purpose | Approximate Volume |
|-------|---------|-------------------|
| [e.g., order records] | [what it holds] | [small / medium / large / unknown] |

### Information Observations

Key findings from discovery that downstream design must account for.

| Observation | Implication for Proposed Change |
|-------------|--------------------------------|
| [e.g., "order history is a large dataset retrieved page by page"] | [e.g., "new views of order data must support pagination"] |

### Information Standards

| Standard | Detail | Source |
|-----------|--------|---------|
| [e.g., "Currency"] | [e.g., "All monetary values stored without decimal places — rounded to the nearest whole unit"] | [source reference] |
| [e.g., "Dates and times"] | [e.g., "All dates and times stored in a consistent global time standard — no local time zones stored"] | |

---

## Connected Systems

| System | Direction | Connection Type | Notes |
|--------|-----------|-----------------|-------|
| [e.g., Payment service] | [Outbound] | [Real-time exchange] | [e.g., "used for payment processing — timeout behavior not currently handled"] |
| [e.g., Notification service] | [Outbound] | [Background notification] | |
| [e.g., Inventory service] | [Inbound] | [Inbound trigger from external system] | |

---

## As-Is Process Summary

Key workflows the system supports. See detailed process-map documents for step-by-step detail.

| Process | Summary | Relevance to Change | Process Map Reference |
|---------|---------|--------------------|-----------------------|
| [process name] | [one-sentence description] | [Directly affected / Indirectly affected / Unrelated] | [link or filename] |

**Pain points in affected processes:**
- [pain point — from process-mapping — relevant to the change area]

---

## User Journey Summary

Primary journeys for personas affected by the proposed change. See detailed user-journey-map documents for stage-by-stage detail.

| Persona | Journey | Stage Where Change Lands | Journey Map Reference |
|---------|---------|--------------------------|----------------------|
| [persona] | [journey name] | [stage name and intersection type] | [link or filename] |

---

## Documentation Landscape

Summary of artifact review. See the documentation-currency-assessment for full artifact-by-artifact detail.

| Status | Count | Notes |
|--------|-------|-------|
| Artifacts reviewed | | |
| Current | | |
| Partially stale | | |
| Fully stale | | |
| Unknown currency | | |

**Settled decisions in scope for this change:**
- [decision] — [source artifact]

---

## Behavior Confidence Register

Items where confidence in the current behavior is less than fully confirmed. Downstream phases must treat low-confidence items as risks.

| Behavior | Confidence | Evidence | Gap / Risk |
|----------|-----------|----------|-----------|
| [behavioral claim] | [Confirmed / Stakeholder-confirmed / Doc-confirmed / Inferred / Assumed] | [specific evidence source] | [what is at risk if the confidence is wrong] |

---

## Consolidated Constraints

All constraints on the proposed change identified across all discovery inputs. These feed directly into constraint-extraction.

| # | Constraint | Type | Source | Confidence |
|---|-----------|------|--------|-----------|
| 1 | [constraint statement] | [Operational / Performance / Information / Regulatory / Compatibility / Organisational] | [discovery activity and artifact that surfaced it] | [Confirmed / Stakeholder-confirmed / Doc-confirmed] |

---

## Known Issues in the Change Area

Issues that exist in the system today that are relevant to the proposed change. These feed into risk-analysis and constraint-extraction.

| # | Issue | Type | Evidence | Area Affected | Relevance | Implication |
|---|-------|------|----------|--------------|-----------|-------------|
| 1 | [description of the issue] | [Known defect / Performance concern / Inconsistent behavior / Functional limitation] | [source — existing ticket, observed behavior, or documented finding] | [part of system affected] | [Directly in change area / Shares processes with change / Unrelated] | [Must resolve as prerequisite / Must work around / Can ignore for this change] |

---

## Change Area

The parts of the existing system the proposed change will directly interact with.

**Affected capability areas:**
- [capability area and the nature of the interaction]

**Affected process steps:**
- [process name → step number(s) — nature of change: new step / modified step / removed step]

**Affected journey stages:**
- [persona → journey → stage — nature of change: extends / modifies / bridges / replaces]

**Information the change will work with:**
- [information type — read / update / create / remove]

**Connected systems the change will use or affect:**
- [system name — nature of interaction]

**Known issues in the change area:** [count] — see Known Issues table above

---

## Open Questions

Things discovery could not determine. Each is an assumption being made in the interim and a risk if the assumption is wrong.

| # | What Is Unknown | Interim Assumption | Downstream Impact If Wrong | Owner / Next Step |
|---|----------------|-------------------|---------------------------|------------------|
| 1 | [the specific unknown] | [the assumption being made to proceed] | [which downstream phase or deliverable is affected] | [who resolves it and when] |

---

## Summary

| Phase | Key Inputs from This Baseline |
|-------|------------------------------|
| **Change-scoping** | Change area section — affected capabilities, processes, journeys, and information types |
| **Dependency-mapping** | Connected systems, information types in change area |
| **Impact-analysis** | Capability summary, process summary, journey summary, change area |
| **Constraint-extraction** | Consolidated constraints table |
| **Risk-analysis** | Known issues table, behavior confidence register, open questions |
| **Requirements package** | Full baseline — existing system context for requirements definition |
