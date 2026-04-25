# Requirements Specification

> **Project:** [project name]
> **Change request:** [brief description]
> **Date:** [date]
> **Accountable stakeholder:** [name / role]

---

## Elicited Requirements Mapping

Cross-reference from confirmed elicited requirements to spec items.

| Elicited Req ID | Description | Spec Items |
|----------------|-------------|-----------|
| ER-001 | [stakeholder-stated requirement] | REQ-xxx, REQ-xxx |

---

## Functional Requirements

Each item specifies the type of change, what the system must do (or stop doing), who initiates it, the business objective and journey stage it serves, the expected outcome, any integration points, and the constraints that govern it.

**Type key:** `New` = capability that does not exist today · `Modified` = change to existing capability · `Removed` = existing capability being retired · `Prohibited` = behavior that must never occur

| ID | Type | Priority | Existing Behavior Ref | Business Objective Ref | Journey Stage Ref | Capability | User Role / Trigger | Expected Outcome | Integration Points | Scope Ref | Dependency Refs | Constraint Refs | Deprecation Date / Removal Milestone |
|----|------|----------|-----------------------|------------------------|-------------------|-----------|--------------------|-----------------|--------------------|-----------|----------------|----------------|--------------------------------------|
| REQ-001 | New \| Modified \| Removed \| Prohibited | Must \| Should \| Could \| Won't (this release) | [for Modified/Removed: description of current behavior or link to capability baseline — leave blank for New and Prohibited unless behavior currently exists] | OBJ-xxx | [journey-name] / [stage-name] | [what the system must do — "[Actor] can [capability]", "[Machine identity] [verb] [object]", "The system [verb] [object]", or their Removed/Prohibited equivalents] | [who initiates and how — human actor, machine identity name, or system event] | [observable result — for Removed, describe what happens when the action is attempted after removal] | [DEP-xxx or "none"] | SC-xxx or "analysis not run" | DEP-xxx or "analysis not run" | CONST-xxx or "analysis not run" | [for Removed only: YYYY-MM-DD or named release — leave blank for New, Modified, Prohibited] |

---

## Acceptance Criteria

One or more ACs per requirement. Written in Given/When/Then form. The `Then` clause must state a specific, externally observable outcome — not "it works correctly."

**AC ID format:** `AC-[REQ-NNN]-[sequence]` · **Scope:** `unit` (single isolated behavior) · `integration` (behavior across two or more integrated components — list the unit AC IDs it depends on) · `end-to-end` (traces a full user journey end-to-end)

| AC ID | Req ID | Scope | Given | When | Then |
|-------|--------|-------|-------|------|------|
| AC-REQ-001-1 | REQ-001 | unit \| integration \| end-to-end | [initial system state and actor context] | [specific action or event] | [specific, externally observable outcome] |

---

## Open Questions

Requirements that could not be fully specified due to unresolved information needs.

| ID | Severity | Question | Impact on Spec | Owner | Target Resolution Date |
|----|----------|----------|---------------|-------|----------------------|
| RQ-OQ-001 | Blocker \| Major \| Minor | [what is unknown] | [which requirement(s) are affected] | [person who can answer] | [date] |

---

## Revision History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| v1.0 | [date] | Initial draft | |
