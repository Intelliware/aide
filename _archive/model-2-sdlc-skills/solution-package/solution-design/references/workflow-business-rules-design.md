# Workflow / Business Rules Design

## Purpose

Design the implementation approach for workflows, state machines, and business rule enforcement. Consumes: the system-design (which components own workflow and rule logic), the backend-design (service layer where rules are enforced), the data-model-design (entities whose state transitions are governed by workflows), the existing-architecture-assessment (existing workflow patterns, state machine implementations, rule engine usage), and the requirements package (business rules catalog for the full set of rules to implement, functional requirements for workflow-driven capabilities, user journeys for end-to-end process flows). For brownfield projects, follows existing workflow and rule enforcement patterns — if the system uses a state machine library, new workflows use the same library; if rules are enforced in service layer code, new rules follow the same pattern. Covers: state machine design (states, transitions, guards, actions for each stateful entity), workflow orchestration (multi-step process flows, approval chains, escalation paths), business rule implementation strategy (where each rule category from the business rules catalog is enforced — validation rules in the API layer, calculation rules in domain services, eligibility rules in authorization middleware, state transition rules in state machines, policy rules in configuration, integration rules at integration boundaries), automation triggers (scheduled events, threshold-based triggers, event-driven automation), and rule conflict resolution at runtime (how precedence is enforced when two rules could fire on the same input). Produces workflow and business rules design that is Section 10 of the solution design package.

## What This Produces

The workflow and business rules architecture for the feature — how stateful entities move through their lifecycle, how multi-step processes are orchestrated, and where every business rule from the requirements is enforced. This section takes the business rules catalog from the requirements package and maps each rule to a specific enforcement point in the design.

This is Section 10 of the solution design package. It builds on:
- **Backend design** (Section 5) — service layer where rules are enforced, domain model where state transitions live
- **Data model design** (Section 6) — entities whose status columns are governed by state machines
- **API design** (Section 7) — operations that trigger state transitions and enforce validation rules

**What this section covers vs. what other sections cover:**

| Concern | Where It Lives |
|---------|---------------|
| Entity column types and CHECK constraints for status fields | Section 6 — Data Model Design |
| Service methods and where business logic is placed (entity vs service) | Section 5 — Backend Design |
| Validation of API request bodies | Section 7 — API Design |
| **State machine design (all states, transitions, guards, actions)** | **Section 10 — This section** |
| **Multi-step workflow orchestration (approval chains, escalation)** | **Section 10 — This section** |
| **Complete business rule enforcement map (every rule → enforcement point)** | **Section 10 — This section** |
| **Automation triggers (scheduled, threshold, event-driven)** | **Section 10 — This section** |
| **Rule conflict resolution** | **Section 10 — This section** |

## When to Use

- Included when the feature involves stateful workflows, state machines, approval chains, or complex business rule enforcement
- Runs after `security-architecture` (Step 9) and before `dashboard-reporting-design` (Step 11)
- May be omitted only if the feature has no stateful workflows and no complex business rules beyond simple validation (confirmed in the design workflow's Step 0)

## Inputs

| Input | Source | Required | If discovery was skipped |
|-------|--------|----------|--------------------------|
| Backend design | `docs/<feature>/solutions-package/design/05-backend-design.md` — service layer, domain model, business rule enforcement points | Yes | Yes |
| Data model design | `docs/<feature>/solutions-package/design/06-data-model-design.md` — entities with status/state columns, CHECK constraints, validation enforcement table | Yes | Yes |
| API design | `docs/<feature>/solutions-package/design/07-api-design.md` — operations that trigger state changes | Yes | Yes |
| System design | `docs/<feature>/solutions-package/design/03-system-design.md` — which components own workflow logic | Yes | Yes |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — Section 2 (Component Architecture: which components handle workflow logic), Section 3 (Tech Stack: workflow engine or state machine library if present) | If discovery ran — identifies which components own workflow logic and whether a workflow engine is in the tech stack; specific workflow patterns (state machine implementation, rule enforcement approach) are derived from the codebase in Step 2 | Identifies patterns from codebase or user input |
| Requirements package — business rules catalog | `docs/<feature>/requirements-package/requirements/business-rules.md` — full set of rules: validation, calculation, eligibility, state transition, policy, integration | Yes | Yes |
| Requirements package — functional requirements | `docs/<feature>/requirements-package/requirements/functional-requirements.md` — workflow-driven capabilities, approval processes | Yes | Yes |
| Requirements package — user journeys | `docs/<feature>/requirements-package/requirements/user-journeys.md` — end-to-end process flows that involve multi-step workflows | Yes | Yes |
| Access to the codebase | Local filesystem or repository — existing state machine implementations, workflow engines, rule enforcement code | Yes (brownfield) — the AI reads existing patterns | Yes if available; otherwise user provides description |

> **Missing input guard:** If the requirements package or any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

## Did Discovery Run?

**Discovery ran** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` exists:

- Read Section 2 (Component Architecture) — identify which components handle workflow logic (e.g., is there a dedicated workflow service, or is state transition logic embedded in domain services?).
- Read Section 3 (Tech Stack) — check whether a workflow engine (Temporal, Camunda, Step Functions) or state machine library (XState, Spring Statemachine) is listed.
- These provide architectural context (where workflow logic lives and what tools exist). Discovery does **not** capture specific workflow patterns — state machine implementations, rule enforcement approaches, and transition guard patterns are derived from the codebase in Step 2.

**Discovery was skipped:**

- For brownfield projects with codebase access: the AI reads existing state machine or workflow code to understand the pattern.
- For brownfield projects without codebase access: ask the user to describe how workflows and state transitions are currently handled. Record as `user-stated`.
- For greenfield projects: no existing patterns. Design from scratch.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  WORKFLOW / BUSINESS RULES DESIGN — INTERNAL SEQUENCE            │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read all inputs                                       │
│     Read backend design (service layer, domain model), data      │
│     model (status columns), API design (operations), business    │
│     rules catalog, functional reqs, user journeys.               │
│     If discovery ran: read baseline Sections 2, 3.               │
├──────────────────────────────────────────────────────────────────┤
│  2. EXTRACT EXISTING — Read the codebase to extract existing     │
│     workflow patterns (Brownfield only)                           │
│     Read state machine code, workflow engine config, rule         │
│     enforcement patterns.                                        │
├──────────────────────────────────────────────────────────────────┤
│  3. STATE MACHINES — Design state machines for stateful entities  │
│     For each entity with a lifecycle: all states, transitions,   │
│     guards (conditions), actions (side effects).                 │
├──────────────────────────────────────────────────────────────────┤
│  4. WORKFLOWS — Design multi-step process flows                  │
│     Approval chains, escalation paths, parallel steps,           │
│     timeout handling, human-in-the-loop steps.                   │
├──────────────────────────────────────────────────────────────────┤
│  5. RULE MAP — Map every business rule to an enforcement point   │
│     For each rule in the catalog: where it is enforced,          │
│     what happens when it fires, and what error is returned.      │
├──────────────────────────────────────────────────────────────────┤
│  6. AUTOMATION — Design automation triggers                      │
│     Scheduled, threshold-based, and event-driven triggers        │
│     that move entities through their lifecycle automatically.    │
├──────────────────────────────────────────────────────────────────┤
│  7. CONFLICTS — Design rule conflict resolution                  │
│     When multiple rules could fire on the same input,            │
│     how is precedence determined?                                │
├──────────────────────────────────────────────────────────────────┤
│  8. VALIDATE — Check against requirements and upstream sections  │
├──────────────────────────────────────────────────────────────────┤
│  9. ASSEMBLE — Write the workflow/business rules section          │
│     Produce the structured output. Present for review.           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Load Inputs

Read all inputs. This skill depends on the backend design and data model design having been completed.

From the **business rules catalog** (requirements package), collect every rule. Rules typically fall into these categories:

| Rule Category | Example | Typical Enforcement Point |
|--------------|---------|--------------------------|
| **Validation** | "Refund amount must be positive" | API layer (request validation) + database (CHECK constraint) |
| **Calculation** | "Refund total = sum of line item amounts" | Domain entity or service method |
| **Eligibility** | "Only delivered orders can be refunded" | Service layer (pre-condition check) |
| **State transition** | "Refund can move from PENDING to APPROVED or REJECTED" | State machine guard |
| **Policy** | "Refunds over $500 require manager approval" | Workflow engine or service layer |
| **Integration** | "Payment reversal must complete before refund is marked COMPLETED" | Integration boundary / saga |
| **Temporal** | "Pending refunds expire after 30 days" | Scheduled job |

From the **data model** (Section 6), identify every entity with a status/state column — these are the entities that need state machines.

From the **backend design** (Section 5), note where business rules are currently enforced (validation enforcement table from data model Step 5, domain logic placement from backend Step 6).

### Step 2 — Extract Existing Workflow Patterns from the Codebase (Brownfield Only)

Read workflow-related code to understand existing patterns.

| Pattern Area | What to Read |
|-------------|-------------|
| **State machines** | State machine library usage (e.g., XState, Spring StateMachine, django-fsm, statesman), hand-coded status transitions in service methods, enum definitions for states |
| **Workflow engines** | Workflow engine configuration (e.g., Temporal, Camunda, Step Functions, Airflow), workflow definitions, step handlers |
| **Rule enforcement** | Where business rules are checked — service methods, middleware, decorators, configuration files, database constraints |
| **Automation** | Scheduled jobs that change entity states, event handlers that trigger transitions, threshold monitors |

Present the extracted patterns: **"I've read the existing workflow and business rule patterns. Here is how the current system handles state transitions, workflows, and rule enforcement. Please confirm these are accurate."**

**Overlap assessment (brownfield only):** If the new feature introduces workflows that overlap with existing ones (e.g., a new "return" workflow that shares states with an existing "refund" workflow), classify each overlap:

| Existing Workflow | Overlap With New Feature | Disposition | Rationale |
|------------------|------------------------|-------------|-----------|
| *(Refund workflow)* | *(New return workflow shares PENDING/APPROVED states)* | *(Merge — unify into a single state machine with a "type" discriminator)* | *(Avoid two parallel state machines for similar processes)* |
| *(Legacy cancellation flow)* | *(New cancellation adds self-service path)* | *(Keep existing + extend — add new transitions to existing state machine)* | *(Existing flow still valid for agent-initiated cancellations)* |

Dispositions: **Keep** (no change), **Extend** (add new states/transitions to existing), **Merge** (consolidate overlapping workflows), **Replace** (new workflow supersedes existing), **Deprecate** (phase out over time).

For greenfield projects, skip this step.

### Step 3 — Design State Machines

For each entity with a lifecycle (identified from the data model's status columns), design the state machine:

**State machine for [Entity Name]:**

| State | Description | Entry Actions | Exit Actions |
|-------|-------------|--------------|-------------|
| *(PENDING)* | *(Initial state — refund request submitted)* | *(Notify user of submission, start 30-day expiry timer)* | *(None)* |
| *(UNDER_REVIEW)* | *(Assigned to a reviewer)* | *(Notify reviewer)* | *(None)* |
| *(APPROVED)* | *(Reviewer approved the refund)* | *(Trigger payment reversal, notify user)* | *(None)* |
| *(REJECTED)* | *(Reviewer rejected the refund)* | *(Notify user with reason)* | *(None)* |
| *(COMPLETED)* | *(Payment reversal confirmed)* | *(Notify user, publish refund.completed event)* | *(None)* |
| *(EXPIRED)* | *(30-day timeout with no action)* | *(Notify user of expiry)* | *(None)* |
| *(CANCELLED)* | *(User cancelled the request)* | *(Notify reviewer if assigned)* | *(None)* |

**Transitions:**

| From | To | Trigger | Guard (Condition) | Action | Requirement |
|------|----|---------|-------------------|--------|-------------|
| *(PENDING)* | *(UNDER_REVIEW)* | *(Reviewer claims the refund)* | *(Reviewer has refund:approve permission)* | *(Assign reviewer)* | *(FR-05)* |
| *(PENDING)* | *(CANCELLED)* | *(User cancels)* | *(User is the creator)* | *(None)* | *(FR-10)* |
| *(PENDING)* | *(EXPIRED)* | *(30-day timeout)* | *(No action taken in 30 days)* | *(Send expiry notification)* | *(BR-08)* |
| *(UNDER_REVIEW)* | *(APPROVED)* | *(Reviewer approves)* | *(Reviewer ≠ creator; amount ≤ $500 OR reviewer is manager)* | *(Initiate payment reversal)* | *(FR-05, BR-05)* |
| *(UNDER_REVIEW)* | *(REJECTED)* | *(Reviewer rejects)* | *(Reviewer ≠ creator)* | *(Record rejection reason)* | *(FR-05)* |
| *(APPROVED)* | *(COMPLETED)* | *(Payment reversal confirmed)* | *(Payment gateway confirms reversal)* | *(Publish refund.completed event)* | *(FR-04)* |

**Time-qualified transitions:** Some transitions require a condition to persist for a sustained period before firing — not just a single threshold crossing. For each time-qualified transition, document:

| From | To | Condition | Qualification Window | Proof Requirement | Requirement |
|------|----|-----------|---------------------|-------------------|-------------|
| *(Example: ACTIVE)* | *(SUSPENDED)* | *(On-time delivery below 85%)* | *(60 consecutive days)* | *(Daily OTD metric log)* | *(BR-12)* |

This prevents premature state changes from transient spikes. The qualification window and any corrective-action requirement (e.g., "issue a warning and allow 30 days to correct before transitioning") are design decisions captured here.

**Side-effect map:** For each transition action, document what data the action reads or writes. This catches "dangerous resets" — where one transition's action silently reverses a side effect set by a previous transition:

| Transition | Action | Sets / Creates | Resets / Removes | Potential Conflict |
|-----------|--------|---------------|-----------------|-------------------|
| *(PENDING → UNDER_REVIEW)* | *(Assign reviewer)* | *(reviewer_id, assigned_at)* | *(None)* | *(None)* |
| *(UNDER_REVIEW → REJECTED)* | *(Record rejection)* | *(rejected_by, rejected_at, rejection_reason)* | *(reviewer_id? — decide: keep or clear)* | *(If reviewer_id is cleared, audit trail loses who reviewed it)* |

If a conflict is identified, document the resolution decision.

**State diagram (text notation):**

```
                    ┌──────────┐
          ┌────────►│ CANCELLED│
          │         └──────────┘
          │
┌─────────┤         ┌───────────┐        ┌──────────┐        ┌───────────┐
│ PENDING ├────────►│UNDER_REVIEW├───────►│ APPROVED ├───────►│ COMPLETED │
└────┬────┘         └─────┬─────┘        └──────────┘        └───────────┘
     │                    │
     │                    ▼
     │              ┌──────────┐
     │              │ REJECTED │
     │              └──────────┘
     ▼
┌─────────┐
│ EXPIRED │
└─────────┘
```

**Design decisions:**
- **Terminal states** — which states are final (no further transitions): COMPLETED, REJECTED, EXPIRED, CANCELLED
- **Allowed transitions only** — any transition not in the table is forbidden; the state machine rejects it
- **Guard enforcement** — guards are checked before the transition executes; if the guard fails, the transition is rejected with a specific error

Repeat for each stateful entity.

### Step 4 — Design Multi-Step Workflows (If Applicable)

Only include this step if the feature involves multi-step processes, approval chains, or coordinated workflows that go beyond a single entity's state machine.

**Workflow: [Workflow Name]**

| Step | Actor | Action | Next Step | Timeout | Escalation |
|------|-------|--------|-----------|---------|-----------|
| *(1. Submit refund)* | *(User)* | *(Create refund request)* | *(2)* | *(N/A)* | *(N/A)* |
| *(2. Auto-assign reviewer)* | *(System)* | *(Assign to available refund manager based on load)* | *(3)* | *(1 hour)* | *(If no reviewer assigned in 1 hour, escalate to team lead)* |
| *(3. Review refund)* | *(Refund Manager)* | *(Approve or reject)* | *(4 if approved, 5 if rejected)* | *(48 hours)* | *(If not reviewed in 48 hours, escalate to manager's supervisor)* |
| *(4. Process payment)* | *(System)* | *(Initiate payment reversal via gateway)* | *(6)* | *(5 minutes)* | *(If payment gateway timeout, retry per integration design)* |
| *(5. Notify rejection)* | *(System)* | *(Send rejection notification to user)* | *(End)* | *(N/A)* | *(N/A)* |
| *(6. Confirm completion)* | *(System)* | *(Mark refund complete, notify user)* | *(End)* | *(N/A)* | *(N/A)* |

**Escalation trigger table** — for workflows with human-in-the-loop steps, define structured escalation rules with timelines:

| Trigger Condition | Action | Timeline | Escalation Level |
|-------------------|--------|----------|-----------------|
| *(Refund not reviewed within 48 hours)* | *(Notify supervisor)* | *(48 hours after assignment)* | *(Level 2 — Manager)* |
| *(Refund not reviewed within 72 hours after L2 notification)* | *(Reassign to another reviewer + notify director)* | *(72 hours after L2)* | *(Level 3 — Director)* |
| *(Refund value > $10,000 and not resolved within 24 hours)* | *(Notify VP)* | *(24 hours after submission)* | *(Level 4 — VP, immediate for high-value)* |

**Workflow design decisions:**
- **Orchestration approach** — is this workflow orchestrated (central coordinator manages steps) or choreographed (each step publishes events for the next)? State the choice and rationale.
- **Human-in-the-loop steps** — which steps require human action? What happens if the human doesn't act within the timeout?
- **Parallel steps** — can any steps run in parallel? (e.g., notify user AND initiate payment simultaneously)
- **Compensation** — if a step fails after a previous step succeeded, what is the rollback? (Cross-reference with integration design Section 8 saga patterns)
- **Idempotency** — can the workflow be restarted from a failed step without side effects?

### Step 5 — Map Every Business Rule to an Enforcement Point

**Step 5a — Classify rules before mapping.** Before assigning enforcement points, group every rule from the catalog into its category. Each category has a default enforcement strategy — this ensures consistent placement across the design:

| Category | Default Enforcement Strategy | Override When |
|----------|------------------------------|---------------|
| **Validation** | API layer (request validation) + database (CHECK constraint) | Simple format checks may be API-only |
| **Calculation** | Domain entity or service method | Read-only calculations may live in query layer |
| **Eligibility** | Service layer — pre-condition check before the operation | If multiple eligibility checks share logic, centralize in a policy service |
| **State transition** | State machine guard | N/A — always in the state machine |
| **Policy** | Workflow engine or service layer, depending on complexity | If the policy is configurable at runtime, use configuration/feature flags |
| **Integration** | Integration boundary / saga | N/A — always at the boundary |
| **Temporal** | Scheduled job or event-driven timer | Event-driven if near-real-time expiry is needed |

Classification ensures rules are not arbitrarily scattered — rules of the same category are enforced in the same architectural layer unless there is a documented reason to deviate.

**Step 5b — Map each rule.** For every rule in the business rules catalog, define exactly where it is enforced:

| Rule ID | Rule Description | Category | Enforcement Point | Error When Violated | Requirement |
|---------|-----------------|----------|-------------------|--------------------|-----------| 
| *(BR-01)* | *(Refund amount cannot exceed order total)* | *(Validation)* | *(API validation + DB CHECK constraint)* | *(422: "Refund amount exceeds order total")* | *(FR-01)* |
| *(BR-02)* | *(Only delivered orders can be refunded)* | *(Eligibility)* | *(Service layer — pre-condition check before creating refund)* | *(422: "Order is not eligible for refund")* | *(FR-01)* |
| *(BR-03)* | *(Refund status transitions follow the state machine)* | *(State transition)* | *(State machine guard — invalid transitions rejected)* | *(409: "Invalid state transition")* | *(FR-05)* |
| *(BR-04)* | *(Refund total = sum of line item amounts)* | *(Calculation)* | *(Domain entity — computed on creation)* | *(N/A — computed, not user-provided)* | *(FR-01)* |
| *(BR-05)* | *(Refunds over $500 require manager approval)* | *(Policy)* | *(State machine guard on UNDER_REVIEW → APPROVED transition)* | *(403: "Manager approval required for refunds over $500")* | *(PAC-04)* |
| *(BR-06)* | *(Creator cannot approve their own refund)* | *(Policy)* | *(State machine guard — check reviewer ≠ creator)* | *(403: "Cannot approve your own refund")* | *(PAC-03)* |
| *(BR-07)* | *(Payment reversal must succeed before refund is COMPLETED)* | *(Integration)* | *(Saga — APPROVED → COMPLETED only after payment gateway confirms)* | *(Refund stays APPROVED; retry per integration design)* | *(FR-04)* |
| *(BR-08)* | *(Pending refunds expire after 30 days)* | *(Temporal)* | *(Scheduled job — checks daily)* | *(N/A — automatic transition)* | *(BR-08)* |

**Cross-check:** After completing the map, verify:
- Every rule in the business rules catalog has an enforcement point
- No rule is enforced in only one place when it should be defense-in-depth (e.g., amount validation should be both API-level and DB-level)
- The enforcement points are consistent with the backend design (Section 5) validation enforcement table and the data model (Section 6) CHECK constraints

### Step 6 — Design Automation Triggers

For rules and transitions that happen automatically (without user action):

| Trigger | Type | What It Does | Frequency / Condition | Idempotent | Requirement |
|---------|------|-------------|----------------------|-----------|-------------|
| *(Expire pending refunds)* | *(Scheduled)* | *(Transition PENDING → EXPIRED for refunds older than 30 days)* | *(Daily at 02:00 UTC)* | *(Yes — skip already expired)* | *(BR-08)* |
| *(Auto-assign reviewer)* | *(Event-driven)* | *(On refund.created event, assign to available reviewer)* | *(On each new refund)* | *(Yes — skip if already assigned)* | *(FR-05)* |
| *(Escalate unreviewed refunds)* | *(Scheduled)* | *(If UNDER_REVIEW for > 48 hours, notify supervisor)* | *(Hourly)* | *(Yes — only escalate once)* | *(NFR-05)* |
| *(Complete refund on payment confirmation)* | *(Event-driven)* | *(On payment.reversal.confirmed event, transition APPROVED → COMPLETED)* | *(On each confirmation event)* | *(Yes — check current status first)* | *(FR-04)* |

**Rules for automation:**
- Every automated trigger must be idempotent
- Scheduled jobs must handle the case where the job runs late or runs twice
- Event-driven triggers must handle duplicate events (deduplication by event ID)
- Every automation must be traceable to a business rule or requirement

### Step 7 — Design Rule Conflict Resolution

When multiple rules could apply to the same operation, define how precedence works:

| Scenario | Conflicting Rules | Resolution | Rationale |
|----------|------------------|-----------|-----------|
| *(Refund request: amount exceeds order total AND order is not delivered)* | *(BR-01: amount check, BR-02: eligibility check)* | *(Evaluate all rules; return all violations in a single error response)* | *(User sees all issues at once rather than fixing one at a time)* |
| *(Refund approval: amount > $500 AND reviewer is the creator)* | *(BR-05: manager required, BR-06: separation of duties)* | *(Both enforced independently — rejection from either blocks approval)* | *(Security rules never override each other)* |

**General resolution principles:**
- **Validation rules** — evaluate all and return all violations simultaneously (fail-all pattern)
- **Authorization/policy rules** — evaluate independently; any rejection blocks the operation
- **Calculation rules** — evaluate in defined order; later calculations may use results from earlier ones
- **State transition rules** — guards are AND-combined by default; all must pass for the transition to proceed
- **Reversibility preference** — when multiple corrective actions are possible (e.g., suspend vs. terminate an account), prefer the most reversible action first. Document the reversibility order for each conflict scenario so that destructive actions are only taken when less destructive alternatives have been exhausted or explicitly overridden.

**Hierarchical rule precedence:** Some rule categories require strict evaluation order — a higher-level rule must be evaluated and fail before a lower-level rule is tried. Document hierarchical chains where they exist:

| Priority | Rule | Escalate to Next Only When |
|----------|------|---------------------------|
| *(1)* | *(Apply standard refund policy)* | *(Standard policy cannot handle the case — e.g., amount exceeds policy limit)* |
| *(2)* | *(Apply exception policy with manager approval)* | *(Exception policy also cannot handle — e.g., exceeds manager authority)* |
| *(3)* | *(Escalate to VP for discretionary decision)* | *(N/A — final level)* |

This prevents higher-authority rules from being invoked unnecessarily when a lower-level rule could have resolved the scenario.

If the project uses a rule engine (e.g., Drools, NRules, custom engine), document:
- How rules are loaded (configuration file, database, hard-coded)
- Execution order (priority-based, salience, first-match)
- How conflicts between rules of equal priority are resolved

If the project does not use a rule engine (most common — rules are enforced in service code), document the evaluation order within the service method.

### Step 8 — Validate

Check the completed workflow and business rules design against:

- **Business rules catalog** — does every rule have an enforcement point? Are any rules missing from the map?
- **Backend design** — are the enforcement points consistent with the validation enforcement table (Section 5, Step 5) and domain logic placement (Section 5, Step 6)?
- **Data model** — are the state/status columns and CHECK constraints from Section 6 consistent with the state machines designed here?
- **API design** — do the operations in Section 7 that trigger state changes align with the transitions defined in the state machines?
- **Security design** — are authorization-related rules (ownership, separation of duties) consistent with Section 9?
- **Integration design** — are integration-dependent rules (payment confirmation before completion) consistent with Section 8 saga patterns?
- **Traceability** — does every state, transition, rule, and automation trigger trace to a requirement?

### Step 9 — Assemble

Combine all sections into the workflow / business rules design output. This becomes Section 10 of the solution design package.

### File Output

Write the completed section to `docs/<feature>/solutions-package/design/10-workflow-business-rules.md` using the template at `../assets/workflow-business-rules-doc.md` as the output structure.

If this section was determined to be not applicable in the design workflow's Step 0, write a stub file containing: **"Not applicable — [rationale from scoping step]."**

---

## Output Structure

### For Brownfield Projects

**1. Existing Workflow Patterns** — how the current system handles state machines, workflows, and rule enforcement (from Step 2)

**2. State Machines** — state machine for each stateful entity: states, transitions, guards, actions, and state diagram (from Step 3)

**3. Multi-Step Workflows** — workflow definitions with steps, actors, timeouts, escalations, and orchestration approach (from Step 4, if applicable)

**4. Business Rule Enforcement Map** — every rule from the catalog mapped to its enforcement point with error behavior (from Step 5)

**5. Automation Triggers** — scheduled, event-driven, and threshold-based triggers (from Step 6)

**6. Rule Conflict Resolution** — precedence rules and resolution strategy (from Step 7)

**7. Requirements Traceability** — every state, transition, rule, and trigger traces to the requirement that drives it

### For Greenfield Projects

Same structure, omitting Section 1 (Existing Workflow Patterns).

---

## Requirements Traceability

Every state machine state, transition, business rule enforcement, and automation trigger must trace to the requirement that drives it.

| Design Element | Type | Requirement ID | Requirement Summary |
|---------------|------|---------------|---------------------|
| *(Refund state machine — PENDING → APPROVED transition)* | *(state transition)* | *(FR-05)* | *(Refund managers can approve refund requests)* |
| *(BR-05 enforcement: refunds > $500 require manager)* | *(business rule)* | *(PAC-04)* | *(High-value refunds require elevated approval)* |
| *(Expire pending refunds — scheduled job)* | *(automation)* | *(BR-08)* | *(Pending refunds expire after 30 days)* |
| *(Auto-assign reviewer on refund.created)* | *(automation)* | *(FR-05)* | *(Refunds must be assigned to a reviewer)* |

If a design element cannot be traced to a requirement, it must be flagged and confirmed with the user before inclusion.

---

## Hand-off Gate

Before proceeding to `dashboard-reporting-design`, you must:

1. Write the completed workflow / business rules design in full.
2. Present it to the user for review with the following questions:
   - **State machines:** Are the states and transitions correct for each entity? Are any states missing? Are the guards right?
   - **Workflows:** Are the multi-step flows correct? Are timeouts and escalations appropriate?
   - **Rule enforcement:** Is every business rule mapped to the right enforcement point? Are any rules missing?
   - **Automation:** Are the triggers correct? Are the frequencies right?
   - **Conflicts:** Is the conflict resolution strategy correct?
   - **Traceability:** Is every design element connected to a requirement?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the design is accurate.

## Completion Criteria

- [ ] For brownfield: existing workflow patterns are extracted from the codebase and confirmed by the user
- [ ] For brownfield: overlapping workflows are assessed with a disposition (Keep / Extend / Merge / Replace / Deprecate)
- [ ] Every entity with a status/state column has a complete state machine: all states, all transitions, all guards, all actions
- [ ] Terminal states are explicitly identified — no orphan states with no outgoing transitions that are not terminal
- [ ] Every transition has a guard (condition) and the behavior when the guard fails is defined
- [ ] Time-qualified transitions document the qualification window, proof requirement, and any corrective-action period
- [ ] Side-effect map is complete — no transition silently reverses another transition's side effect without a documented decision
- [ ] If multi-step workflows exist: steps, actors, timeouts, escalations (with tiered escalation table), and orchestration approach are defined
- [ ] Rules are classified by category before enforcement points are assigned (classification-before-mapping)
- [ ] Every business rule in the requirements catalog has an enforcement point in the rule enforcement map
- [ ] No rule is missing from the map — cross-checked against the business rules catalog
- [ ] Defense-in-depth is applied where appropriate (critical rules enforced at multiple layers)
- [ ] Automation triggers are defined for all time-based and event-driven transitions
- [ ] All automation triggers are idempotent
- [ ] Rule conflict resolution is defined for scenarios where multiple rules could fire simultaneously
- [ ] Hierarchical rule precedence is documented where rules have strict evaluation order
- [ ] Reversibility preference is documented for conflict scenarios with multiple corrective actions
- [ ] State machine states and transitions are consistent with the data model's status columns and CHECK constraints (Section 6)
- [ ] Enforcement points are consistent with the backend design's validation enforcement table (Section 5)
- [ ] Operations that trigger state changes are consistent with the API design (Section 7)
- [ ] Authorization-related rules are consistent with the security design (Section 9)
- [ ] Integration-dependent rules are consistent with the integration design's saga patterns (Section 8)
- [ ] Requirements traceability is complete
- [ ] The user has explicitly confirmed the design is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| An entity has status transitions scattered across service methods with no single view of the lifecycle | Step 3 designs a complete state machine for every stateful entity — all states and transitions in one place |
| An invalid state transition is possible because no one defined which transitions are allowed | The state machine explicitly lists allowed transitions; everything else is forbidden by default |
| A business rule exists in the requirements but has no enforcement point in the code | Step 5 maps every rule from the catalog to an enforcement point; unmapped rules are flagged |
| A business rule is enforced only at the API layer but not in the database, and a direct DB write bypasses it | Step 5 identifies rules that need defense-in-depth (enforcement at multiple layers) |
| A multi-step approval process has no timeout, and a pending approval blocks the workflow indefinitely | Step 4 requires timeouts for every human-in-the-loop step with an escalation path |
| A scheduled automation (expire pending refunds) is not idempotent and processes the same entity twice | Step 6 requires all automation triggers to be idempotent |
| Two business rules conflict (one says allow, one says deny) and the system behaves unpredictably | Step 7 defines conflict resolution — evaluation order and precedence rules |
| A state transition triggers a side effect (send email, initiate payment) but the transition is never formally defined, so the side effect is missed during implementation | State machine design (Step 3) includes entry/exit actions for each state and actions for each transition |
| The data model has a CHECK constraint limiting status values, but the state machine allows a status the CHECK doesn't include (or vice versa) | Step 8 validates consistency between state machines and data model status columns |
| An event-driven automation is expected to fire but no one defined the trigger condition or the event it listens for | Step 6 explicitly defines every automation trigger with its type, condition, and frequency |
| A state transition fires on a transient spike (e.g., one bad day suspends an account) when it should only fire on a sustained condition | Time-qualified transitions (Step 3) require a qualification window — the condition must persist for a defined period before the transition fires |
| One transition's action silently undoes a side effect set by a previous transition (e.g., clearing a reviewer assignment loses the audit trail) | Side-effect map (Step 3) explicitly documents what each action sets and resets, surfacing conflicts for a design decision |
| A destructive corrective action is taken (terminate account) when a less destructive alternative (suspend) was available | Reversibility preference (Step 7) requires the most reversible action to be attempted first, with escalation to destructive actions only when documented conditions are met |
| A higher-authority rule is invoked unnecessarily (VP approval) when a lower-level rule (manager approval) could have resolved the case | Hierarchical rule precedence (Step 7) enforces strict evaluation order — escalate only when the prior level cannot handle the case |
| New feature's workflow overlaps with an existing workflow, creating two parallel state machines for similar processes | Overlap assessment (Step 2) classifies overlaps and decides on Keep / Extend / Merge / Replace / Deprecate before designing the new state machine |
| Business rules of the same type (e.g., all validation rules) are scattered across different architectural layers with no consistency | Classification-before-mapping (Step 5a) groups rules by category and assigns a default enforcement strategy per category |
