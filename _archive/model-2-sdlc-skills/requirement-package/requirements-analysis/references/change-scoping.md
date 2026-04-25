# Change Scoping

## Purpose

Scope a change to an existing system — define minimum blast radius, explicitly separate what must change from what must remain untouched, identify shared capabilities affected by the change, and establish scope boundaries that prevent creep into adjacent areas. Produces in-scope/out-of-scope/must-not-touch lists that feed into dependency-mapping, impact-analysis, constraint-extraction, and the requirements-package.

## When to Use

- Step 2 in the analysis-workflow sequence — run immediately after the current-capability-baseline is complete (or after stakeholder-mapping if discovery was skipped)
- Before any other analysis skill — change-scoping defines the boundaries that all subsequent analysis skills operate within
- Any time a proposed change touches an existing system, no matter how small it appears

## What This Produces

Three lists — in-scope, out-of-scope, and must-not-touch — plus a set of named assumptions and the boundary rules used to evaluate anything discovered later. These lists are the contract that prevents scope creep throughout the project.

## Terminology Used in This Skill

The following terms are used consistently throughout this skill. Where a term from an input artifact (such as the baseline) uses different language, map it to these definitions before proceeding.

| Term | Definition |
|------|------------|
| **Capability area** | A named grouping of related business activities or functions — for example, "order placement" or "returns processing." Capability areas are the primary unit of classification in this skill. |
| **Process step** | A discrete action or decision within a capability area. |
| **Business rule** | A constraint or condition that governs how a capability area operates or produces its output. |
| **Integration point** | A boundary at which the system exchanges information with an external party — another system, a third party, or a regulatory body. The nature of the exchange (what information, under what conditions, with what guarantees) constitutes the contract at that point. |
| **Shared capability** | A capability area used by more than one part of the system. Changes to a shared capability affect every part of the system that depends on it. |
| **Scope item** | Any capability area, process step, business rule, integration point, or data area that has been identified for classification. A scope item is the atomic unit of the in-scope, out-of-scope, and must-not-touch lists. |
| **Adjacent** | Related to the change area through a shared capability, a common data area, or a directly connected process step — but not itself required to change in order to satisfy confirmed requirements. Adjacency is assessed at the capability level, not by organizational proximity or by how closely two capabilities happen to be documented. |
| **Assumption** | A claim about the existing system that has not been verified against a formal discovery artifact. Assumptions are first-class entries in the change-scope artifact and must be named, numbered, and linked to the scope items they underpin. |

## The Trichotomy

Most scoping produces two lists (in / out). Brownfield changes require three:

| List | Meaning |
|------|---------|
| **In-scope** | Will change. Requirements will be written. Architect will design. Developer will implement. |
| **Out-of-scope** | Will not change in this delivery. May change in a follow-up. Adjacent but explicitly excluded. |
| **Must-not-touch** | Must not change as a side effect. Any accidental modification is a defect. Protected by preservation requirements in the requirements phase. |

Must-not-touch is the critical addition. It protects existing behavior that users, integrations, or contracts depend on — and it directly drives preservation requirements in the requirements phase.

## Did Discovery Run?

**Discovery completed** if the following exist:
- `docs/<feature>/requirements-package/discovery/current-capability-baseline.md` (from current-capability-synthesis)
- `docs/<feature>/requirements-package/discovery/elicitation-outputs.md` (confirmed requirements from requirements-elicitation)

If discovery completed → use the baseline's change area as the seed (Step 1) and the elicited requirements as the in-scope anchor.

**Discovery was skipped** if either artifact is missing:
- Derive the seed directly from the proposed change description and any context the user provides
- All system claims about the existing system are assumptions — record the absence of a formal discovery pass in the change-scope artifact header
- Every assumption derived in this state must be entered as a named, numbered assumption in the Assumptions section of the artifact (see Assumptions guidance at the end of Step 3)
- The risk of incomplete scope is elevated; if Step 2 (shared capability tracing) reveals the change touches more than one capability area, recommend going back and running discovery before continuing

## Inputs

| Input | Source | Required | If discovery was skipped |
|-------|--------|----------|------------------------|
| Existing-system-baseline | current-capability-synthesis | If available | Derive seed from change description and user-stated context; all current-state claims are assumptions — record each as a named entry |
| Confirmed requirements from elicitation | `docs/<feature>/requirements-package/discovery/elicitation-outputs.md` | If available | Elicit desired outcomes directly from the user in Step 1; do not proceed past Step 1 until requirements are stated and confirmed |
| Proposed change description | `docs/<feature>/requirements-package/discovery/change-description.md` or `docs/<feature>/requirements-package/analysis/change-description.md` | Yes | Must exist — captured in discovery Step 0 or analysis Step 0 |
| Known-issues catalogue | current-capability-synthesis (known-issues section of baseline) | No — only when considering prerequisite fixes in Step 3 | Not available — prerequisite fix assessment is deferred or based on user-stated known issues |

> **Missing input guard:** If an expected input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[full path]` but it was not found. This input is [required/recommended] for this skill. Should I proceed without it, or can you provide it?"*

## Workflow

```
┌──────────────────────────────────────────────────┐
│  1. START — Read the change area from baseline   │
│     The baseline already identified which        │
│     capability areas, process steps, and         │
│     integration points the change touches.       │
│     Use it as the seed.                          │
├──────────────────────────────────────────────────┤
│  2. EXPAND — Trace shared capabilities           │
│     Identify capabilities shared between the     │
│     change area and the rest of the system.      │
│     Shared capabilities are where blast radius   │
│     grows unexpectedly.                          │
├─────────────────────────┬────────────────────────┤
│  3. CLASSIFY            │ ← repeat Steps 2–3     │
│     In / Out /          │   until stable; see    │
│     Must-not-touch      │   iteration note below │
├─────────────────────────┴────────────────────────┤
│  4. RULE — Define scope boundary criteria        │
│     Write the rules used to classify, so any     │
│     item discovered later can be evaluated       │
│     consistently.                                │
├──────────────────────────────────────────────────┤
│  5. VALIDATE — Check with stakeholder(s)         │
│     Confirm in-scope list matches the intended   │
│     change. Confirm must-not-touch list with     │
│     the Accountable stakeholder.                 │
├──────────────────────────────────────────────────┤
│  6. ASSEMBLE — Populate the change-scope template│
└──────────────────────────────────────────────────┘
```

> **Steps 2 and 3 iterate.** Tracing shared capabilities in Step 2 regularly expands the candidate set, which requires re-classifying items in Step 3, which may reveal additional shared capabilities. Repeat Steps 2 and 3 until no new scope items emerge across two consecutive passes. If the candidate set continues to grow beyond two passes, stop and assess whether the delivery should be decomposed (see "When the Change Is Too Large" below) before classifying further. If shared capability tracing begins surfacing the majority of the system, document systemic coupling as a delivery risk in `docs/<feature>/requirements-package/analysis/decision-log.md` and agree a fixed boundary with the Accountable stakeholder (identified during stakeholder-mapping) rather than continuing to classify indefinitely.

## When the Change Is Too Large

*This assessment is made after Steps 2 and 3 are complete — not at the outset. The indicators below require a populated in-scope list and must-not-touch list to evaluate.*

If the completed Steps 2–3 iteration reveals that the in-scope list spans multiple largely independent capability areas, or that the blast radius cannot be bounded without absorbing a disproportionate share of the system, the change may need to be decomposed before downstream analysis proceeds.

Indicators that decomposition should be considered:
- The in-scope list contains capability areas that have no shared process steps, business rules, or integration points with each other
- Satisfying any single confirmed requirement independently would constitute a viable, useful delivery
- The must-not-touch list is so extensive that in-scope changes cannot be validated without resolving the entire list first

If any of these indicators are present, raise the question of decomposition with the Accountable stakeholder before proceeding to Step 4. Record the discussion and the decision in `docs/<feature>/requirements-package/analysis/decision-log.md`. If decomposition is agreed, produce a separate change-scope artifact for each delivery increment and treat each as an independent scoping exercise from Step 1.

## Scope Validity

The change-scope artifact is valid as of the date it is approved at the hand-off gate. It does not remain valid indefinitely.

Re-validate the scope if any of the following occur before requirements are complete:
- A related project modifies a shared capability listed in the scope document
- A confirmed requirement is added, removed, or materially changed
- A must-not-touch constraint is relaxed or tightened by a stakeholder decision
- More than eight weeks pass between initial sign-off and the start of requirements work (adjust this threshold to the project's delivery rhythm — eight weeks is a default starting point, not a universal standard)
- Requirements work has been underway for more than eight weeks without scope being formally reconfirmed — long requirements phases create the same risk of drift as a long pre-work gap

When re-validation is triggered, treat any revised classification as a scope change: update the Scope Change Log, obtain fresh stakeholder confirmation for affected items, and record the event in `docs/<feature>/requirements-package/analysis/decision-log.md`. Downstream artifacts (dependency-mapping, impact-analysis) that have already been produced against the prior scope must be reviewed for impact.

## Step Details

### Step 1 — Read the Change Area from the Baseline

The current-capability-baseline's change area section already identified which capability areas, process steps, and integration points the change touches. Use this as the starting seed — do not re-derive it from scratch.

**If no baseline exists** (discovery was skipped): derive the seed directly from the proposed change description and confirmed requirements. List every capability area, process step, and integration point the change explicitly mentions and treat this as the initial candidate set. Every claim about the existing system derived here is an assumption — record each as a named, numbered entry in the Assumptions section of the artifact. Record the absence of a baseline in the change-scope artifact header.

For each seed item, determine:
- What specifically must change (a capability area, a process step, a business rule, a data area)?
- What is the minimum change needed to satisfy the confirmed requirements, as stated?
- What adjacent scope items are necessarily affected as a direct consequence?

**Minimum blast radius:** when two or more delivery options are identified during elicitation or stakeholder discussion, select the option that satisfies confirmed requirements while affecting the fewest shared capabilities and placing the fewest must-not-touch items at risk. This is a scoping decision, not a design decision — the analyst is choosing the smallest scope that satisfies the requirements, not prescribing how the change is to be made. Record the comparison and the chosen option in `docs/<feature>/requirements-package/analysis/decision-log.md` when: (a) a narrower option was explicitly considered and rejected, or (b) the rationale for the chosen option is not self-evident from the requirement.

### Step 2 — Trace Shared Capabilities

Shared capabilities are the primary source of unplanned scope expansion. A change to a shared capability can have downstream effects on every part of the system that depends on it.

**For each in-scope item, ask:**
- What other capability areas or process steps depend on this capability?
- If the behavior or contract of this capability changes, do those dependent capability areas need to change too?
- Can the confirmed requirements be satisfied by adding to the capability's scope without removing or altering existing behavior? Or do the requirements require existing behavior or contracts to change?
- If existing behavior or contracts must change, which downstream capability areas are affected?

The last two questions define what must be protected (must-not-touch) and what must be brought into scope — they do not determine how the change is made. Decisions about how to make the change belong to the architect.

**Identifying dependents:** use the baseline's connected systems map, existing documentation, and stakeholder knowledge. If dependent capability identification is uncertain, record the uncertainty as a named assumption in the Assumptions section and flag the capability as a shared-capability risk in the artifact. Do not assume a capability has no dependents because none are immediately visible.

If changing a shared capability requires other capability areas to also change, either:
- Expand scope explicitly (document the decision in `docs/<feature>/requirements-package/analysis/decision-log.md`), or
- Raise the constraint with the Accountable stakeholder and obtain a decision on whether to reduce scope or accept the dependency

**Choosing between expand and escalate:**
- Choose **expand scope** when dependent capability areas must change regardless of what the confirmed requirements say, and the delivery timeline and resourcing can absorb the additional work.
- Choose **escalate to the Accountable stakeholder** when the scope impact is disproportionate to the requirement being satisfied, or when absorbing the dependent change would exceed delivery constraints. The Accountable stakeholder will decide whether to reduce scope, accept the dependency, or treat it as a delivery risk.
- If neither option is viable within delivery constraints, this is a delivery risk, not a scope question. Record it in `docs/<feature>/requirements-package/analysis/decision-log.md` and do not proceed until a decision is reached.

### Step 3 — Classify Everything

For every scope item identified in the change area or adjacent to it, assign it to exactly one list. Adjacent means: related through a shared capability, a common data area, or a directly connected process step — not merely close in the documentation or the organisation chart.

**In-scope:**
- The confirmed requirements require this capability area or process step to change
- This item must change as a direct consequence of another in-scope item changing
- This is a prerequisite fix identified in the known-issues catalogue (marked "must fix as prerequisite")

**Out-of-scope:**
- Adjacent to the change but not required by confirmed requirements for this delivery
- Could be improved but the change request does not include it ("fix while we're here" items — log separately for future consideration)
- A dependent capability area where the confirmed requirements can be satisfied without altering its existing behavior or contracts

**Must-not-touch:**
- Existing behavior or contracts at integration points that external parties — other systems, third parties, or regulatory bodies — demonstrably depend on. Acceptable forms of evidence include: written confirmation from the external party, a documented contractual or regulatory obligation, or confirmation by the Accountable stakeholder that an active live integration relies on the current behavior. Absence of visible evidence is not sufficient to dismiss the protection — flag as a shared-capability risk and record the uncertainty as a named assumption.
- Business rules or process steps where any deviation from current behavior would breach a regulatory obligation, a contractual commitment, or a legally binding constraint
- Business rules or process steps that are explicitly relied upon by downstream capability areas outside the change area, where changing the rule would force those areas into scope or create an unacknowledged dependency
- Any capability area, process step, or data area where the delivery team has been explicitly instructed by the Accountable stakeholder that it must not change

For each must-not-touch item, document two things: (1) **why it must not change** — which users, integration points, or downstream capability areas depend on it and in what way; and (2) **consequence of unintended change** — what breaks, who is affected, and how severely. These populate the corresponding columns in the `change-scope` template and directly feed into preservation requirements in the requirements phase.

**Assumptions:** for every scope item whose classification rests on a claim about the existing system that has not been verified against a formal baseline artifact, record a named, numbered assumption in the Assumptions section of the artifact. Link each assumption to the scope item it supports. If an assumption is later invalidated, re-evaluate every scope item linked to it.

### Step 4 — Define Scope Boundary Rules

Write explicit criteria for evaluating items discovered later. During implementation, adjacent issues regularly surface. Without boundary rules, every discovery becomes a scope negotiation.

**A well-formed boundary rule** names the category of change it governs, states the default classification (in-scope or out-of-scope), and identifies the exception condition that overrides the default. If a rule requires subjective interpretation to apply, rewrite it until it does not.

At minimum, write one rule covering each of: integration point contract changes, data area changes, user-facing process changes, and defect fixes. Write additional rules for any category that appeared repeatedly during Steps 2–3.

**Example rules:**
- "Any change that alters the contract of an existing integration point is out-of-scope unless it is the specific integration point named in requirement REQ-012"
- "Changes to the order and order-line data areas are in-scope; changes to any other data area are out-of-scope"
- "Process changes are in-scope only for the checkout capability area identified in the baseline process map"
- "Defect fixes are in-scope only if they are listed as prerequisites in the known-issues section of the baseline"

### Step 5 — Validate

Two confirmations are required before proceeding:

1. **In-scope list** — confirm with every requestor who raised or is named on the change request (identified during stakeholder-mapping) that the in-scope list captures the intended change and nothing important is missing. If there are multiple requestors and they disagree on what belongs in scope, do not proceed. Document the disagreement in `docs/<feature>/requirements-package/analysis/decision-log.md`, identify the Accountable stakeholder as the tiebreaker, and obtain a single definitive ruling before continuing. Ambiguous scope is not a valid input to downstream analysis.

2. **Must-not-touch list** — confirm with the Accountable stakeholder (identified during stakeholder-mapping) that the elements listed are genuinely protected and will have preservation requirements written for them.

Discrepancies between confirmed requirements and the in-scope list must be reconciled here before downstream analysis proceeds.

**If a confirmed requirement cannot be satisfied without changing a must-not-touch item**, this is a constraint conflict. Do not attempt to resolve it unilaterally. Record it in `docs/<feature>/requirements-package/analysis/decision-log.md`, surface it to the Accountable stakeholder, and pause downstream analysis until a formal decision is reached. The decision will either: relax the must-not-touch constraint (and require a preservation plan), descope the requirement, or reframe the scope. All three outcomes must be reflected in the artifact before proceeding.

**If the requestor population and the Accountable stakeholder cannot agree on scope**, document the full disagreement in `docs/<feature>/requirements-package/analysis/decision-log.md` and escalate. Do not proceed with ambiguous scope.

### Step 6 — Assemble

Populate the `change-scope` template (`../assets/change-scope.md`) and write the completed artifact to `docs/<feature>/requirements-package/analysis/change-scope.md`. The template structure and field definitions are defined in the template file. Do not replicate or paraphrase the template structure here — the template is the authoritative source.

The Scope Change Log within the artifact must be initialised regardless of whether any changes have occurred. It is not optional.

## Output

A populated **change-scope** document. Template structure and field definitions are in `../assets/change-scope.md`.

### File Output

Write the completed change scope to `docs/<feature>/requirements-package/analysis/change-scope.md`.

Consumed by: dependency-mapping, impact-analysis, constraint-extraction, gap-analysis, risk-analysis, and the requirements-package.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| "Fix while we're here" scope creep | Out-of-scope list explicitly excludes adjacent improvements; boundary rules give a documented reference |
| Accidentally disrupting a shared capability's dependents | Step 2 traces shared capabilities and forces an explicit decision about each |
| Must-not-touch items changed as a side effect | The must-not-touch list with consequences drives preservation requirements in the requirements phase |
| Scope disputes late in delivery | Scope boundary rules give a documented decision framework for items discovered during implementation |
| Impact analysis and dependency mapping with no defined boundary | Without a scope document, those skills have no anchor |
| New dependency discovered mid-delivery that invalidates approved scope | Scope change log and boundary rules provide a structured path to reclassify the item rather than absorbing it silently |
| Confirmed requirements that conflict with must-not-touch constraints | Step 5 forces explicit escalation before downstream analysis begins — unresolved conflicts cannot silently propagate |
| Scope derived with no baseline (discovery skipped) | Step 1 provides an explicit fallback, names every unverified claim as a numbered assumption, and flags the elevated risk in the artifact header |
| Multiple requestors with conflicting scope views | Step 5 requires a single definitive ruling from the Accountable stakeholder before downstream analysis proceeds |
| Scope document becoming stale during a long analysis phase | Scope validity criteria define the re-validation triggers and the process for updating downstream artifacts |
| Oversized change absorbed without question | Decomposition guidance provides a structured path to split the change before downstream analysis is wasted |
| Classification of items adjacent to the change area based on proximity rather than dependency | The definition of "adjacent" and the classification criteria in Step 3 anchor decisions to verified dependency, not organisational or documentary proximity |

## Hand-off Gate

**`change-scoping` must complete before any other analysis skill begins. Before reading any other analysis reference file, you must:**
1. Write the completed `change-scope` artifact in full — in-scope list, out-of-scope list, must-not-touch list with consequences, shared capability decisions, named assumptions, and scope boundary rules.
2. Present it to the Accountable stakeholder (identified during stakeholder-mapping) for review and confirmation.
3. Receive explicit written acknowledgement from the Accountable stakeholder before proceeding.

Only after this gate passes may the next step begin: `dependency-mapping` (analysis-workflow step 3).

---

## Completion Criteria

- [ ] Every item in the baseline change area — or in the seed item set if no baseline exists — is classified as in-scope, out-of-scope, or must-not-touch
- [ ] Shared capabilities in the change area are identified with their dependent capability list
- [ ] The in-scope list represents the minimum change needed to satisfy confirmed requirements
- [ ] Must-not-touch items have consequences documented
- [ ] Scope boundary rules are written and can evaluate any future discovered item without requiring subjective interpretation
- [ ] In-scope list validated with every named requestor; any disagreements resolved by the Accountable stakeholder and recorded in `docs/<feature>/requirements-package/analysis/decision-log.md`
- [ ] Must-not-touch list validated with the Accountable stakeholder
- [ ] No unresolved constraint conflicts between confirmed requirements and must-not-touch items (any open conflicts are escalated and recorded in `docs/<feature>/requirements-package/analysis/decision-log.md` before proceeding)
- [ ] All unverified system claims are recorded as named, numbered assumptions in the Assumptions section, linked to the scope items they support
- [ ] Scope change log is initialised (even if empty)
- [ ] If decomposition was considered, the decision (proceed as one change or split) is recorded in `docs/<feature>/requirements-package/analysis/decision-log.md`
- [ ] Scope validity date is recorded in the artifact header
