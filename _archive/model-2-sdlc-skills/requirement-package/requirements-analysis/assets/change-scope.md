# Change Scope

> **Project:** [project name]
> **Change request:** [brief description]
> **Date scoped:** [date]
> **Scope validity date:** [date after which re-validation is required if requirements work has not started]
> **Baseline reference:** [link or filename of current-capability-baseline]
> **Accountable stakeholder:** [name / role]

---

## In-Scope

Items that will change in this delivery. Requirements will be written and implementation planned for each.

| ID | Description | Affected Capability / Process Area | Minimum Change Required | Rationale | Baseline Reference |
|----|-------------|----------------------------|-----------------------|-----------|-------------------|
| SC-001 | [what changes] | [capability / information area / process / rule] | [the smallest change that satisfies the requirement] | [why it must be in-scope] | [baseline section] |

---

## Out-of-Scope

Items explicitly excluded from this delivery. Adjacent to the change but not required. May be addressed in a follow-up.

| ID | Description | Rationale for Exclusion | Risk If Accidentally Changed | Follow-up? |
|----|-------------|------------------------|------------------------------|------------|
| OS-001 | [what is excluded] | [why it is excluded now] | [consequence if unintentionally changed] | [Yes / No / Log separately] |

---

## Must-Not-Touch

Items that must not change as a side effect of this delivery. Any modification to these elements is a defect. Each item is a candidate for a preservation requirement.

| ID | Capability / Business Area | Reason It Must Not Change | Consequence of Unintended Change | Linked Preservation Requirement |
|----|---------------------------|--------------------------|----------------------------------|----------------------|
| MNT-001 | [capability / process / information field / rule] | [what users, connected systems, or commitments depend on this] | [what breaks if it changes] | [PRES-REQ-xxx — populated during requirements phase] |

---

## Shared Capabilities

Capabilities used by both the change area and other parts of the system. These are the primary source of unplanned scope expansion.

| Capability | Current Users | Proposed Change | Scope Decision |
|-----------|------------------|-----------------|----------------------|
| [capability name] | [list of features or processes that use it] | [what the change needs to do to this capability] | [Make compatible with existing users / Expand scope to include all users / Rework the approach to avoid shared change] |

---

## Scope Boundary Rules

Explicit criteria for evaluating items discovered during analysis or delivery. Use these before raising a scope change.

1. [rule — e.g., "Any change that affects how connected systems interact with this capability requires a formal scope change unless the capability is listed in the in-scope table above"]
2. [rule — e.g., "Information changes are in-scope only for the areas listed in SC-xxx entries"]
3. [rule — e.g., "Defect fixes are in-scope only if listed as 'must resolve as prerequisite' in the current-capability-baseline known issues section"]
4. [rule — e.g., "Screen and workflow changes are in-scope only for those identified in the process maps linked from the baseline"]

---

## Assumptions

Every scope item whose classification rests on a claim about the existing system that has not been verified against a formal baseline artifact must appear here as a named, numbered entry. Link each assumption to the scope item it supports. If discovery was skipped, all current-state claims must be recorded here.

| # | Assumption | Linked Scope Item | Category | Impact if Wrong |
|---|-----------|------------------|----------|----------------|
| SCOPE-ASMP-001 | [the unverified claim — e.g., "The checkout capability is self-contained and shares no process steps with the returns workflow"] | [SC-xxx / OS-xxx / MNT-xxx] | [System behaviour / Integration point / Shared capability / Boundary] | [which classification goes wrong if this assumption is false] |

> Each assumption here must also be added to `docs/<feature>/requirements-package/analysis/assumption-log.md`. If an assumption is later invalidated, re-evaluate every scope item linked to it.

*If no assumptions were required (all classifications are grounded in discovery baseline evidence), write: No assumptions — all scope classifications are evidence-derived.*

---

## Scope Change Log

Record of any scope reclassifications after initial sign-off.

| Date | Item | Moved From | Moved To | Rationale | Approved By |
|------|------|-----------|----------|-----------|-------------|
| | | | | | |
