# Codebase Discovery (BA/PO Edition)

## Purpose

AI reads the existing codebase and translates it into a plain-English business capability inventory for BA/PO consumption. The BA/PO does not read code — the AI reads it and surfaces what the system currently does, what rules it enforces, what data it manages, and what gaps need stakeholder clarification. Scoped to the feature request area only. Distinct from developer codebase-analysis and architect architecture-discovery — this skill answers "what does the system do for users and the business?" not "how is it built?"

## What This Is

The AI reads the existing codebase so the BA/PO does not have to.

When a feature request arrives for an existing system, the BA/PO needs to understand what the system already does in the relevant area before writing requirements for what it should do next. Traditionally this means asking developers to explain the system — which is slow, incomplete, and filtered through a technical lens.

This skill replaces that conversation. The AI reads the code, extracts the business picture, and hands the BA/PO a plain-English inventory of:
- **What users can currently do** in the area the change will touch
- **What rules the system enforces** on that behaviour
- **What data the system manages** for those capabilities
- **What is unclear** and needs the BA/PO to confirm

The BA/PO's job is to review the output, confirm or correct it, and use it as the foundation for requirements.

### What "Business Capability" Means Here

A **business capability** is a coherent thing the system can do for a user or the business — expressed as an outcome, not as a technical operation.

A single business capability may be implemented by many routes, functions, or screens working together. The AI does **not** produce one entry per route or function — it groups related technical artifacts into a single capability statement that a non-technical reader can understand and act on.

| Not a business capability | Business capability |
|---|---|
| `POST /api/orders/:id/cancel` | Cancel an Order |
| `OrderService.recalculateTotals()` | Recalculate Order Totals After Discount |
| Three separate PATCH endpoints | Update Customer Contact Details |

If a feature request describes something the codebase shows **no evidence of**, the correct finding is: "No existing capability found in this area." That is a valid and useful discovery — it confirms the feature is genuinely net-new and identifies what, if anything, is adjacent to it.

## When to Use

- A feature request has arrived for an existing system and the BA/PO needs to understand what already exists before writing requirements
- The BA/PO cannot determine from documentation alone what the system currently does in the change area
- The BA/PO wants to avoid writing requirements that conflict with or duplicate existing functionality

## Scope

The AI reads the codebase **only in the area the proposed change will touch** — not the whole system. The goal is to understand the existing context well enough to design the new feature safely, not to audit every feature ever shipped.

In practice:
- **Start from the change** — identify the capability area the feature request describes, then read only the relevant parts of the codebase
- **Follow the thread** — if one capability depends on another, read enough of the dependency to understand what constraints it places on the change area
- **Note but do not detail unrelated areas** — if something is clearly unrelated to the feature request, it is listed by name only and marked as out of scope for this discovery

### Scope Expansion

Initial scope is a starting estimate, not a fixed boundary. The AI must expand scope when reading reveals that a capability outside the initial area:
- **shares data** with a capability in scope (writing to the same entity, reading from the same table or service)
- **enforces a rule** that constrains something in scope (e.g., a status set by capability X determines what capability Y in scope is allowed to do)
- **is triggered by or triggers** a capability in scope

When scope expands, the AI documents the expansion explicitly: what was added to scope, and why. This record appears in Part C of the output so the BA/PO can see exactly how far the discovery reached and make an informed decision if the scope looks too narrow or too broad.

Scope expansion stops when the AI reaches a capability that shares no data and enforces no constraint on anything in scope. At that point, the capability is listed by name as out of scope — not described in detail.

## What the BA/PO Does (and Does Not Do)

| The BA/PO does | The AI does |
|---|---|
| Provide the confirmed feature request description | Read and interpret the code |
| Review the capability inventory for accuracy | Translate technical artifacts into business language |
| Correct misinterpretations | Identify gaps that cannot be answered from code alone |
| Answer the gap questions | Flag contradictions and uncertainties |
| Confirm the inventory before requirements work begins | Write the inventory document to the project folder |

The BA/PO does **not** need to read code, understand file structures, interpret database schemas, or know anything about how the system is built.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Confirmed feature request description | `docs/<feature>/requirements-package/discovery/change-description.md` | Yes — written by the workflow's Step 0 before this skill runs |
| Access to the codebase | Local filesystem or repository | Yes |

## What the AI Reads (Internally)

The AI reads the following types of technical artifacts to build the business picture. The BA/PO does not interact with any of these directly — they are listed here so the AI knows where to look.

- **Entry points** — routes, endpoints, API definitions, and background jobs that reveal what the system can be asked to do
- **User-facing screens** — pages, forms, and navigation structures that reveal what users see and interact with
- **Data definitions** — database schemas, data models, and validation rules that reveal what information the system manages and what constraints it enforces
- **Business logic** — conditional rules, validation messages, permission checks, and state transitions that reveal what the system allows, rejects, or requires
- **Test descriptions** — test names and scenario descriptions that act as a written record of intended behaviour
- **Configuration and flags** — feature flags and configuration-driven behaviour that reveal capabilities that may not be visible to all users
- **Inactive capability signals** — deprecated annotations, unreachable code paths, flags hardcoded to off, commented-out routes, or migration markers that indicate a capability may exist in code but not in production

All findings are translated into plain business language before being presented to the BA/PO.

## How the AI Works — Internal Sequence

The AI performs the following steps internally. These are not steps for the BA/PO — they describe the AI's reading and translation process.

```
┌──────────────────────────────────────────────────────────────────┐
│  1. ANCHOR — What is the feature request area?                   │
│     Re-read the change description. Identify the capability      │
│     area, the users or roles affected, and the data the change   │
│     will likely touch. Use this as the reading filter.           │
├──────────────────────────────────────────────────────────────────┤
│  2. WHAT USERS CAN DO — Current capabilities                     │
│     Read routes, endpoints, screens, and entry points to         │
│     identify what users can currently do in the change area.     │
│     Translate each into a plain-English capability statement.    │
├──────────────────────────────────────────────────────────────────┤
│  3. WHO ACTS ON EACH CAPABILITY — Roles and actors               │
│     Read UI pages, forms, and access control structures only to  │
│     confirm which user roles or system actors can access each    │
│     capability. Record role names in plain business terms.       │
│     Do not document UX flow, screen layout, or navigation        │
│     sequence — that belongs in user journey mapping, not here.   │
├──────────────────────────────────────────────────────────────────┤
│  4. WHAT DATA IS MANAGED — Business data model                   │
│     Read data schemas and models to understand what information  │
│     the system holds, how it is structured, and what             │
│     relationships exist between business concepts.               │
├──────────────────────────────────────────────────────────────────┤
│  5. WHAT THE SYSTEM ENFORCES — Business rules                    │
│     Read validation logic, error messages, permission checks,    │
│     and state transition logic to extract the rules the system   │
│     currently enforces. Express each as a business rule          │
│     statement, not as code.                                      │
├──────────────────────────────────────────────────────────────────┤
│  6. WHAT IS CONFIRMED BEHAVIOUR — Test evidence                  │
│     Read test descriptions and scenario names as evidence of     │
│     what the system is known to do. Flag areas with no test      │
│     evidence as lower-confidence.                                │
├──────────────────────────────────────────────────────────────────┤
│  7. WHAT IS CONDITIONAL OR INACTIVE — Gated, toggled, and dead   │
│     Identify capabilities that are only active for some users,   │
│     in some environments, or under certain conditions.           │
│     Also flag capabilities that appear to be inactive in         │
│     production: unreachable code paths, deprecated annotations,  │
│     flags hardcoded to off, or routes with no active callers.    │
│     These must NOT be presented as live capabilities — they are  │
│     listed separately with status "Appears inactive" and a note  │
│     that the BA/PO should confirm with operations or development  │
│     before treating them as part of the current system state.    │
├──────────────────────────────────────────────────────────────────┤
│  8. ASSEMBLE — Write the capability inventory                    │
│     Produce the plain-English inventory in Parts A–D.            │
│     Write the file to disk. Present to BA/PO for review.         │
└──────────────────────────────────────────────────────────────────┘
```

## Translating Technical Findings into Business Language

Throughout steps 2–7, the AI applies these translation rules. Technical terms must not appear in the output without a plain-English equivalent.

| If the AI finds... | It writes in the inventory... |
|---|---|
| A route or API endpoint | "Users/systems can currently [capability description]" |
| A database table or schema | "The system currently tracks [business concept] — including [key fields in plain terms]" |
| A validation rule or error message | "The system requires / prevents / enforces [rule in business terms]" |
| A permission or authorization check | "Only [role/user type] can [action]" |
| A feature flag | "[Capability] is currently [available/not available] to [who]" |
| A test description | "The system is known to [behaviour from test description]" |
| A state machine or status field | "A [business entity] can be in the following states: [states]. It moves from [state] to [state] when [business event]" |
| An audit trail | "Every time [event], the system records [what is recorded] for [compliance/audit purpose]" |
| An integration with another system | "The system connects to [external system or service] to [business purpose]" |

### Handling Contradictory Evidence

When the AI finds evidence that conflicts — for example, the code enforces one rule but a user-facing message or configuration implies a different one — it does **not** silently pick one interpretation. It records both and flags the contradiction as an unresolved question for the BA/PO to confirm. The BA/PO does not need to read code to resolve it — the AI states both possibilities in plain language and asks the BA/PO which reflects the intended behaviour.

### Handling Uncertainty

Not everything in a codebase is unambiguous. When the AI cannot determine the business meaning of something with confidence, it assigns a confidence level:

- **Confirmed** — supported by two or more independent sources (e.g., the same rule is enforced in the system logic and also stated in a user-facing error message or validation label)
- **Inferred** — supported by one source with no contradicting evidence; likely accurate but not independently verified
- **Uncertain** — ambiguous, conflicting, or opaque — flagged for BA/PO confirmation; never presented as fact

Uncertain findings must have a corresponding gap question in Part B. They are never stated as facts in the inventory.

---

## Output — The Capability Inventory

The AI produces a plain-English **current capability inventory** structured in four parts.

### Part A — What the System Currently Does

One entry per distinct business capability found in the change area. Written for a non-technical reader.

Each entry contains:

**Capability name** — a short, plain-English name (e.g., "Cancel an Order", "View Invoice History")

**Who can do this** — the user type, role, or system actor that uses this capability

**What it does** — a plain-English description of what happens when this capability is used: what the user does, what the system does in response, and what the outcome is

**What the system requires or enforces** — the business rules that apply: what inputs are required, what the system rejects, what conditions must be met, what states are involved. Each rule is written as a business statement (e.g., "An order cannot be cancelled after it has shipped" — not "The cancel handler returns 422 if order.status === 'shipped'")

**What data is involved** — the business information this capability reads or writes, in plain terms (e.g., "Order details, customer address, payment method" — not "orders JOIN customers ON customer_id")

**Who else is involved** — other systems, services, or teams this capability connects to

**Current active status** — one of four states:
  - *Active* — confirmed available in production for the stated user roles
  - *Conditionally active* — available only for certain roles, environments, or under a feature flag
  - *Appears inactive* — code exists but evidence indicates it is not reachable or enabled in production; BA/PO must confirm with development or operations before treating this as part of the current system
  - *Unknown* — active status cannot be determined from the codebase alone; flagged as a gap question in Part B

**How confident we are** — Confirmed / Inferred / Uncertain, with a note explaining uncertainty where applicable

**Relation to the proposed change** — is this capability directly affected by the feature request, adjacent to it, or unrelated?

---

### Part B — What Is Unclear (Gap Questions)

Things the codebase cannot answer and that the BA/PO must confirm. Each gap has:

- **What area it affects** — which capability or data area the gap relates to
- **What is unknown** — stated in plain language, not technical terms
- **The question to ask** — a specific, answerable question for the BA/PO or a subject matter expert

Gap entries arise when:
- A business rule appears to exist (inferred from an error message or UI label) but the AI cannot determine its exact condition or scope
- A capability's availability depends on configuration managed outside the codebase (e.g., a feature flag controlled by a third-party tool)
- A capability has active status "Unknown" — whether it is reachable and enabled in production cannot be determined from the codebase alone
- A capability has active status "Appears inactive" — it must be confirmed with development or operations before being excluded from or included in the current system picture
- A data field exists but its business purpose cannot be determined from names or usage alone
- The code and other evidence contradict each other and the correct interpretation is not determinable from code alone
- A connection to an external system exists but the contract or data exchanged is not visible from the codebase

**Gap questions must be specific and answerable.** "Is this field used?" is not acceptable. "Is the `reference_code` field on an invoice populated automatically by the system or entered manually by the user?" is acceptable.

If no gaps are found, the AI must verify all three of the following before recording a zero-gap result:
- Every capability with Inferred or Uncertain confidence has been examined and the remaining ambiguity does not constitute an unanswered question
- Every connection to an external system identified in the change area has a documented business purpose — no integration is noted without knowing what it does
- Every data field mentioned in Part D whose business purpose was not immediately obvious has been resolved

Only if all three checks pass may the AI record: "No gaps identified — all capability behaviours in the change area could be determined from the codebase." A zero-gap result that cannot pass all three checks is incomplete, not clean.

---

### Part C — Confidence Summary

A brief summary table for the BA/PO:

| Metric | Count |
|--------|-------|
| Capabilities identified in the change area | |
| Directly affected by the proposed change | |
| Adjacent (may be impacted) | |
| Appears inactive (requires confirmation) | |
| Unrelated (noted only) | |
| Capabilities with Confirmed confidence | |
| Capabilities with Inferred confidence | |
| Capabilities with Uncertain confidence | |
| Gap questions requiring BA/PO confirmation | |
| Business rules extracted | |
| Data concepts identified | |

**Scope expansion record** — one row per expansion made during reading. If no expansions were made, record "Scope remained as initially identified — no shared data or rule dependencies found outside the starting area."

| What was added to scope | Why it was added |
|---|---|
| *(capability or area name)* | *(shared data / rule constraint / trigger relationship)* |

---

### Part D — Data Concept Cross-Reference

A table mapping each significant data concept identified in the change area to the capabilities that read or write it. This allows the BA/PO to see which capabilities are coupled through shared data — the primary source of unintended side effects when a new feature changes how data is written, validated, or structured.

| Data Concept | Capabilities that read it | Capabilities that write it | Notes |
|---|---|---|---|
| *(one row per data concept)* | | | |

**How to read this table:** If the proposed change modifies how a data concept is written or structured, every capability listed in the "reads it" column for that concept may be affected. These capabilities should be reviewed during requirements and testing to confirm they still behave correctly.

If no shared data concepts are found, record explicitly: "No shared data dependencies identified in the change area."

---

## Output File

The completed inventory is written to **`docs/<feature>/requirements-package/discovery/codebase-discovery.md`** in the project repository. If the folder structure does not exist, it is created.

### File Output

Write the completed current capability inventory to `docs/<feature>/requirements-package/discovery/codebase-discovery.md`.

This document feeds into: **process-mapping**, **user-journey-mapping**, and **current-capability-synthesis**. Its completeness and accuracy directly affect the quality of all three downstream outputs.

---

## What a Good Inventory Entry Looks Like

**Poor entry (technical, not useful to a BA/PO):**
> `POST /api/orders/:id/cancel` — Calls `OrderService.cancel()`. Validates `order.status !== 'shipped'`. Returns 422 if guard fails. Updates `orders.cancelled_at`. Fires `notification_service.send()`.

**Good entry (business-readable, fully populated):**
>
> **Cancel an Order**
>
> **Who can do this:** Customers (logged-in). Internal support agents can also cancel on behalf of a customer.
>
> **What it does:** A customer selects an order they have placed and requests cancellation. The system marks the order as cancelled and sends the customer a confirmation. The outcome is visible to the customer immediately in their order history.
>
> **What the system requires or enforces:**
> - An order cannot be cancelled after it has been shipped. The system prevents this and displays a message to the customer explaining why.
> - Only the customer who placed the order, or a support agent, can cancel it. Other users cannot cancel orders that are not theirs.
>
> **What data is involved:** Order details (order status, order date, items), customer account, cancellation timestamp.
>
> **Who else is involved:** The notification service — the system sends a cancellation confirmation to the customer when this capability is used.
>
> **Current active status:** Active — available to all logged-in customers and support agents.
>
> **Confidence:** Confirmed — the cancellation rule and the role restriction are each stated in the system logic and in a user-facing message.
>
> **Relation to the proposed change:** Directly affected — the feature request changes when cancellation is permitted.

---

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| BA/PO writing requirements without knowing what already exists | The inventory maps existing capabilities before requirements work begins |
| Developers explaining the system in technical terms that don't translate to requirements | The AI translates technical evidence into business language; the BA/PO receives a business picture |
| Requirements that duplicate existing functionality without knowing it | Existing capabilities are explicitly inventoried so duplication is visible |
| Requirements that conflict with existing rules the BA/PO didn't know about | Business rules are extracted and stated in plain language |
| Uncertain inferences presented as confirmed facts | Confidence levels on every entry make uncertainty explicit |
| Gap questions left unanswered until development reveals them | Part B surfaces gaps before requirements are written, so elicitation can address them |
| Contradictions between code and other evidence silently resolved | Contradictions are recorded as gap questions for BA/PO confirmation |
| A new feature unintentionally breaking behaviour that users depend on | The inventory identifies adjacent and directly affected capabilities so the BA/PO can consider preservation |
| A new feature modifying shared data and breaking capabilities the BA/PO didn't know were coupled | Part D maps every shared data concept to all capabilities that read or write it, making coupling visible before requirements are written |
| A capability that is conditionally active being designed as always-on | Gated and toggled capabilities are identified with their current availability status |
| A deprecated or inactive capability being treated as a live system constraint | Capabilities with evidence of being inactive are explicitly flagged as "Appears inactive" and not presented as part of the current system state |
| The BA/PO spending time in requirements elicitation explaining things the codebase already reveals | The inventory answers what the code can answer, so elicitation focuses only on genuine gaps |

---

## Hand-off Gate

**Before proceeding to the next skill in the sequence:**

1. Write the completed `current-capability-inventory` in full — not a summary, the full populated document.
2. Write the document to `docs/<feature>/requirements-package/discovery/codebase-discovery.md`. The file write must succeed before proceeding.
3. Present the inventory to the BA/PO.
4. Ask explicitly: **"Does this inventory accurately describe what the system currently does in the area the feature request will touch? Are there any capabilities that are missing, incorrect, or described in a way that doesn't match your understanding? Are you aware of any related capabilities — in this area or adjacent to it — that do not appear in this inventory?"**
5. Answer any gap questions from Part B that the BA/PO can answer now.
6. If the BA/PO identifies corrections, update the inventory, overwrite the file, and re-present before proceeding.

Do not interpret silence, a "thank you," or general acknowledgement as acceptance. Wait for an explicit confirmation before proceeding to the next skill.

---

## Completion Criteria

- [ ] The inventory is anchored to the confirmed feature request description from `docs/<feature>/requirements-package/discovery/change-description.md`
- [ ] Every capability in the change area is documented as a coherent business capability — multiple routes or functions that serve the same business outcome are grouped into a single entry, not listed individually
- [ ] Every capability entry states: who uses it, what it does, what rules apply, what data is involved, its active status, and its relation to the proposed change
- [ ] Business rules are written as business statements — each states the condition that applies and what the system does as a result; entries that merely name a rule without stating its actual constraint are not acceptable
- [ ] Data concepts are described in business terms — what information the system manages, not how it is stored
- [ ] Every capability entry has a current active status (Active / Conditionally active / Appears inactive / Unknown); capabilities with status "Appears inactive" are not presented as part of the live system and have a corresponding gap question in Part B
- [ ] Capabilities that are conditionally available (feature flags, environment-specific, role-restricted) state their availability clearly
- [ ] Every capability entry has a confidence level (Confirmed / Inferred / Uncertain); all Uncertain entries have a corresponding gap question in Part B
- [ ] Contradictions between code evidence and other evidence are recorded as gap questions, not silently resolved
- [ ] Adjacent capabilities (those that share data or workflows with the change area) are noted with enough description to understand the constraints they impose
- [ ] Unrelated capabilities are listed by name with a note that they are out of scope — not documented in detail
- [ ] Any scope expansions made during reading are recorded in the Part C scope expansion table with the capability added and the reason; if no expansions were made, this is stated explicitly
- [ ] Part B lists all gap questions as specific, answerable questions; if no gaps exist, all three zero-gap verification checks have been passed and the result is stated explicitly
- [ ] The confidence summary table in Part C is fully populated
- [ ] Part D data concept cross-reference is fully populated; if no shared data is found this is stated explicitly
- [ ] The inventory is written to `docs/<feature>/requirements-package/discovery/codebase-discovery.md` and the file write has succeeded
- [ ] The BA/PO has explicitly confirmed the inventory is accurate and complete enough to proceed
