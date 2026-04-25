# Functional Requirements

## Purpose

Draft a functional requirements specification for the feature being built. Specifies what the system must do — the capabilities introduced by this feature — written as forward-looking requirements that developers can implement and testers can verify. Consumes: business objectives (OBJ-xxx) from business-objectives (this phase); user journey maps from user-journeys (this phase); elicited requirements from discovery/elicitation-outputs.md when discovery ran, or elicited directly from the user when discovery was skipped; the change-scope boundaries from analysis; the constraint register from analysis; and the dependency map from analysis. The elicited requirements provide the "what" — the desired feature behavior — while the analysis artifacts provide the "within what limits." Produces a structured functional requirements document — including inline acceptance criteria for every requirement — that feeds into business-rules and the requirements-package. Requirements are typed as New, Modified, Removed, or Prohibited and carry a MoSCoW priority confirmed by the product owner or BSA.

## When to Use

- After user-journeys — functional requirements must address the journey stages designed for each persona; every requirement should be traceable to a journey stage
- When you have confirmed stakeholder requirements (or are ready to elicit them) and a clear scope to write against
- Before business-rules and all subsequent requirements skills — the functional spec is the input they consume

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Business objectives | `business-objectives` (this phase) | Yes — OBJ-xxx entries that every requirement must trace to; load before writing any requirement |
| User journey maps | `user-journeys` (this phase) | Yes — the designed experience that functional requirements must specify; every requirement must trace to at least one journey stage |
| Elicited requirements | `docs/<feature>/requirements-package/discovery/requirements-elicitation.md` if discovery ran; otherwise requirements already stated by the BSA in this session, or elicited directly from the user in Step 1 if none have been stated yet | Yes — the stakeholder-confirmed "what" the feature must do. |
| Change-scope boundaries | `docs/<feature>/requirements-package/analysis/change-scope.md` | If available — defines what is in-scope, out-of-scope, and must-not-touch |
| Constraint register | `docs/<feature>/requirements-package/analysis/constraint-register.md` | If available — hard limits the spec must operate within |
| Dependency map | `docs/<feature>/requirements-package/analysis/dependency-map.md` | If available — integration points and data entities the feature depends on; machine identities (service accounts, API clients, background jobs) documented here must appear as actors in requirements where they initiate behavior |

## Analysis Artifacts — Per-Artifact Detection

This skill checks for each analysis artifact independently. Use what exists; note and work around what does not.

| Artifact | File | If found | If not found |
|----------|------|----------|--------------|
| Change-scope | `docs/<feature>/requirements-package/analysis/change-scope.md` | Load for scope pre-check (Step 1) and SC-xxx links (Step 3) | Elicit scope boundaries from the user in Step 1; record all scope claims as assumptions |
| Constraint register | `docs/<feature>/requirements-package/analysis/constraint-register.md` | Load before writing any requirement; apply CONST-xxx links (Step 3) | Elicit constraints from the user in Step 1; record all constraint claims as assumptions |
| Dependency map | `docs/<feature>/requirements-package/analysis/dependency-map.md` | Load for integration points; apply DEP-xxx links (Step 3) | Elicit integration points from the user in Step 1; record all dependency claims as assumptions |

**If none of the three artifacts exist** (analysis was skipped entirely): elicit scope, constraints, and integration points from the user in Step 1 before writing any requirement. Flag in the open questions table that constraint and integration conflict risk is elevated. Use "analysis not run" markers in place of SC-xxx, CONST-xxx, and DEP-xxx links in Step 3 rather than leaving those fields blank.

---

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  1. LOAD — Gather all inputs                         │
│     Business objectives (OBJ-xxx), user journey      │
│     maps, elicited requirements (or elicit now),     │
│     scope, constraints, dependency map               │
├──────────────────────────────────────────────────────┤
│  2. DRAFT — Write each requirement + its ACs         │
│     Type, priority, capability, actor (human or      │
│     machine), expected outcome, business obj ref,    │
│     journey stage ref, constraints operating.        │
│     Assess behavioral preservation for Modified.     │
│     Write ACs inline — one AC per independently      │
│     testable pass condition. Flag executability gaps. │
├──────────────────────────────────────────────────────┤
│  3. LINK — Cross-reference analysis artifacts        │
│     Trace requirements to change-scope,              │
│     constraint, and dependency entries               │
├──────────────────────────────────────────────────────┤
│  4. VALIDATE — Check against elicited requirements   │
│     Every confirmed stakeholder requirement maps to  │
│     at least one spec item. No orphans.              │
├──────────────────────────────────────────────────────┤
│  5. ASSEMBLE — Populate the requirements-spec        │
│     template; record open questions                  │
└──────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Load Inputs

Read all inputs before writing a single requirement. Requirements written before the constraint register is read risk specifying behavior that violates hard limits. Requirements written before the dependency map is read risk omitting integration requirements.

**Late-arriving requirements:** Requirements surfaced informally after elicitation is complete — via email, messaging tools, or verbal communication — must not be added directly to the spec. Each late-arriving requirement must be brought back through the elicitation confirmation step: assign it a provisional ER-NNN, present it to the product owner or BSA for explicit confirmation, and then proceed through Steps 2–4 for that requirement. If a confirmed late requirement conflicts with an already-written spec item, treat it as a new elicited-requirement conflict and resolve it before assembly.

**If discovery ran:** Load `docs/<feature>/requirements-package/discovery/requirements-elicitation.md`. The confirmed requirements (REQ-NNN entries) and validated assumptions (ASMP-NNN entries) from that document are the elicited requirements this skill consumes. Assign each an ER-NNN ID in the order they appear (ER-001, ER-002, …), mapping the discovery REQ-NNN to the corresponding ER-NNN. Use ER-NNN consistently in all traceability references within this skill. This avoids collision with this spec's own REQ-NNN identifiers.

**If discovery was skipped:** Check whether the BSA has already stated their requirements in this session (e.g., as a posted document, list, or description). If yes, treat those statements as BSA-confirmed requirements — do not re-elicit or ask the BSA to re-confirm what they have already stated. Assign each an ER-NNN ID (ER-001, ER-002, …) in the order they appear, record the description and the BSA as the stakeholder, and proceed to the scope pre-check. If no requirements have been stated yet, ask the user to describe each capability the feature must have, record each as ER-001, ER-002, … with its description and the stakeholder who stated it, present the full list, and receive explicit acknowledgement before moving to Step 2. Do not write a single spec item until requirements are either confirmed as already stated or explicitly acknowledged after elicitation.

Specific things to extract before writing:
- From the **business objectives**: the complete list of OBJ-xxx identifiers from the business-objectives document (this phase). Every requirement must reference at least one OBJ-xxx. If business-objectives has not been completed and acknowledged, do not proceed past Step 1.
- From the **user journey maps**: the designed experience stages that requirements must support — use these as the primary frame before writing any requirement. Every requirement must reference the journey stage it implements.
- From the **elicited requirements**: the stakeholder-confirmed behaviors the feature must have
- From **change-scoping**: exactly which elements are in-scope and which are must-not-touch
- From the **constraint register**: any hard constraints that bound how the feature can behave
- From the **dependency map**: what the feature depends on, including readiness status of each dependency; specifically, identify any machine identities (service accounts, API clients, background jobs, external system integrations) documented as DEP-xxx entries that initiate behavior within the scope of this feature — these must appear as named actors in requirements where they are the trigger

**Elicited requirement conflicts:** Before the scope pre-check, compare all elicited requirements against each other. If two elicited requirements directly contradict each other, do not carry both into drafting. Flag the conflict to the product owner immediately: state both requirements, explain the contradiction, and request an explicit decision — one requirement is deferred, one is revised, or they are reconciled into a single consistent statement. Record the conflict and the resolution as an open question (RQ-OQ-NNN) before proceeding. Do not arbitrarily favor one requirement over another.

**Scope pre-check:** If change-scoping ran and SC-xxx entries exist, before moving to Step 2 compare every elicited requirement against those in-scope entries. If any elicited requirement falls outside the defined scope, flag it to the user immediately: state which change-scope entry it exceeds and ask for an explicit decision — either the scope boundary is extended (change-scoping must be updated before proceeding) or the requirement is deferred. Do not carry out-of-scope requirements into drafting. Do not treat stakeholder confirmation of a requirement as automatic scope-change authority.

If change-scoping did not run (analysis skipped), use the confirmed change description as the scope reference. Any elicited requirement that falls outside the who/what/why of that confirmed change description must be flagged and decided before proceeding.

### Step 2 — Write Each Requirement

**Requirement ID scheme:**
Assign IDs sequentially: REQ-001, REQ-002, … IDs must be unique across the document and must not be renumbered after assignment.

**Requirement structure:**

Every functional requirement documents one observable capability and its relationship to existing behavior:

- **Type:** Whether this requirement is `New`, `Modified`, `Removed`, or `Prohibited` — see type definitions below
- **Existing behavior ref:** For `Modified` and `Removed` requirements only — a reference to the current behavior being changed or retired (free-text description, or a link to the relevant section of the current-capability-baseline or existing process map if available). Leave blank for `New` requirements.
- **Business Objective Ref:** The OBJ-xxx identifier(s) from the business-objectives document that this requirement serves. Required — must not be blank. If no business objective covers this requirement, it is either scope creep (remove it) or a missing objective (add it to business-objectives before proceeding).
- **Journey Stage Ref:** The journey stage this requirement implements, in the format `[journey-name] / [stage-name]` (e.g., `buyer-submit-order / payment-entry`). Required — must not be blank. If no journey stage covers this requirement, flag it as a potential orphaned requirement. For `Prohibited` requirements, first attempt to identify the journey stage most at risk from the prohibited behavior and record it. Only if the prohibition genuinely applies across all journeys with no single stage as the primary control point may `system-wide` be recorded in this field — include a brief rationale explaining why no journey stage applies. Defaulting to `system-wide` without a rationale is not acceptable.
- **Capability:** What the system will be able to do (or will no longer do, for `Removed`)
- **User role / trigger:** Who initiates this behavior and how, or what system event triggers it. For machine-initiated behavior, use the machine identity name (e.g., `reporting-job`, `payments-service`) rather than a human actor.
- **Expected outcome:** The observable result
- **Integration points:** Where this behavior connects to existing systems or data (from the dependency map)
- **Constraints operating:** Any constraint register entries (CONST-xxx) that govern this capability
- **Priority:** The MoSCoW classification for this requirement — `Must`, `Should`, `Could`, or `Won't (this release)`. Required — must not be blank. The author proposes a priority for each requirement during drafting. The product owner or BSA confirms or revises all priority assignments at the hand-off gate — not during drafting. Until confirmed, record the proposed priority with a note "proposed — awaiting PO confirmation" and flag it as a Major open question. A requirement whose priority has not been confirmed by the gate cannot pass the gate.
- **Deprecation date / removal milestone:** For `Removed` requirements only — the point at which the capability ceases to function. Preferred format: calendar date (YYYY-MM-DD). Acceptable alternative: named release identifier (e.g., "v4.2.0") if no confirmed date is available. Sprint numbers are not acceptable — sprints are planning artifacts, not stable calendar anchors. If no date or release is known, record a Blocker open question; do not leave the field blank or use "TBD." Leave blank for `New`, `Modified`, and `Prohibited` requirements.

**Requirement types:**

| Type | Meaning | Implication |
|------|---------|-------------|
| `New` | A capability that does not exist today | No existing behavior to preserve or migrate; regression risk is low |
| `Modified` | A change to an existing capability | Must reference the current behavior being replaced; carry regression and backward-compatibility risk as open questions if unresolved |
| `Removed` | An existing capability being retired or deprecated | Must reference the behavior being removed; the requirement must specify the deprecation path, any migration obligation for current users, and the point at which removal takes effect |
| `Prohibited` | A system behavior that must never occur, whether or not it exists today | Must have an AC confirming the prohibited action cannot be triggered; populate Existing behavior ref only if the behavior currently exists (if it does, prefer `Removed` unless the prohibition is absolute and permanent) |

**Type determination — when to flag uncertainty:** If it is unclear whether a requirement is `New` or `Modified` (e.g., a capability that partially overlaps with existing behavior), record it as `Modified`, reference the overlapping behavior, and raise a `RQ-OQ-NNN` open question asking the product owner to confirm whether the existing behavior is fully replaced, partially retained, or extended.

**Standard sentence format:**

Every functional requirement is written in one of the forms below based on its type and actor:

| Type | Context | Format | Example |
|------|---------|--------|---------|
| `New` / `Modified` | Human or external system actor | `[Actor] can [capability]` | "Authenticated user can export their order history as a CSV file" |
| `New` / `Modified` | Machine identity (service, job, integration) | `[Machine identity] [verb] [object]` | "The reporting-job aggregates transaction records and writes the daily summary to the reporting store within 60 seconds of midnight" |
| `New` / `Modified` | System behavior (no direct actor trigger) | `The system [verb] [object]` (present tense) | "The system delivers confirmation emails within 5 minutes of order placement" |
| `Removed` | Human or external system actor | `[Actor] can no longer [capability]` | "Guest user can no longer save items to a wishlist" |
| `Removed` | Machine identity | `[Machine identity] no longer [verb] [object]` | "The legacy-sync-job no longer writes to the orders_legacy table" |
| `Removed` | System behavior | `The system no longer [verb] [object]` | "The system no longer sends weekly digest emails" |
| `Prohibited` | Human or external system actor | `[Actor] must not be able to [capability]` | "Authenticated user must not be able to view another user's payment details" |
| `Prohibited` | Machine identity (service, job, integration) | `[Machine identity] must not [verb] [object]` | "The payments-service must not write unencrypted card data to the data store" |
| `Prohibited` | System behavior | `The system must not [verb] [object]` | "The system must not include PII in error messages returned to the client" |

Use the human actor form for any requirement describing something a person does. Use the machine identity form when a service account, API client, background job, or external system integration is the named initiator — do not collapse machine actors into "the system"; they must be named so the permissions matrix can reference the requirement by actor. Use the generic system-behavior form for background processing with no named initiator in the dependency map.

**Additional writing rules for `Modified` requirements:**
- State the new behavior only in the capability field — do not embed a before/after comparison in the sentence
- Place the reference to the old behavior in the **Existing behavior ref** field, not in the capability statement
- Raise a `RQ-OQ-NNN` open question for any `Modified` requirement where backward compatibility, data migration, or parallel-run obligations are unknown

**Behavioral Preservation Assessment (required for every `Modified` requirement):**

For each `Modified` requirement, identify adjacent behaviors — behaviors in the surrounding flow that share an actor, data entity, or state transition with the modified capability but are not themselves being changed. This assessment must be completed before moving to the next requirement; it must not be deferred to review.

For each adjacent behavior that a developer could inadvertently alter while implementing the change:
- Add a preservation requirement with type `Modified`, a capability statement in the form `[Actor] continues to be able to [preserved behavior]` or `The system continues to [preserved behavior]`, and an Existing behavior ref pointing to the `Modified` requirement it protects.
- If an adjacent behavior must not change but a corresponding preservation requirement would be redundant (the behavior is already fully specified by other requirements in the spec), record a must-not-touch item for it instead, flagged for consolidation into the assumptions-constraints-scope document at assembly.

**Additional writing rules for `Removed` requirements:**
- The capability statement must describe what will stop working, not just what replaces it
- The expected outcome field must state what happens when a user or system attempts the removed action (e.g., "User receives a message stating the feature is no longer available")
- If any consumer of the removed capability has no documented migration path, raise a `RQ-OQ-NNN` open question before assembly

**Additional writing rules for `Prohibited` requirements:**
- The capability statement must describe the prohibited behavior precisely — not the desired alternative
- Populate the **Existing behavior ref** field only if the behavior currently exists in the system; if it does and must be removed, evaluate whether `Removed` is the more accurate type
- Every `Prohibited` requirement must have an AC confirming the behavior cannot be triggered after the requirement is implemented
- If any existing flow currently depends on the prohibited behavior, raise a `RQ-OQ-NNN` open question identifying the consumer and the migration obligation before assembly

**Writing rules that apply to all requirements:**
- One observable behavior per requirement — if "and" connects two separate behaviors, split them
- No implementation guidance in the spec — state the observable outcome, not the mechanism ("the system delivers confirmation emails within 5 minutes" not "the system uses a queue to deliver confirmation emails")
- Measurable — requirements that cannot be stated with a verifiable threshold or observable condition must be recorded as open questions and resolved before assembly; "where possible" is not an acceptable hedge
- No vague quantifiers — replace "multiple," "several," "many," "some," "few," "various" with specific numbers
- No vague time expressions — replace "as soon as possible," "in a timely manner," "quickly," "eventually," and "near real-time" with specific time thresholds
- Present tense — "The system sends" not "A confirmation email will be sent"

**Acceptance criteria (written inline for every requirement):**

Every requirement must have at least one acceptance criterion (AC) written at the time the requirement is written — not deferred to a later phase. ACs are the pass/fail conditions QE and developers use to verify the requirement is met. An AC is not a test script — it states the externally observable signal that confirms the requirement has been satisfied.

**AC ID scheme:** `AC-[REQ-NNN]-[sequence]` — e.g., `AC-REQ-007-1`, `AC-REQ-007-2`. IDs are unique and permanent. If an AC is removed, its ID is retired, not reused.

**AC format (required for every AC):**

```
AC-[REQ-NNN]-[N]: [Short description]
Given: [the initial state or precondition]
When:  [the specific action or event]
Then:  [the externally observable outcome — specific, not "it works correctly"]
Scope: [unit | integration | end-to-end]
```

**AC writing rules:**
- The `Then` clause must state a specific, observable signal — not a description of the behavior. "HTTP 200 response containing the order ID and status" is an AC. "The order is created successfully" is not.
- Do not reference internal system state (memory, queue depth, cache contents) in the `Then` clause — only externally observable surfaces (API responses, rendered UI, delivered emails, file content, database state via a stable read interface).
- `Removed` requirements must have an AC describing the observable outcome when the removed action is attempted after removal (e.g., "HTTP 404 returned when the deprecated endpoint is called").
- `Modified` requirements must have at least one AC for the new behavior and, where the old behavior will no longer be present, one AC confirming the old behavior is no longer produced.
- Write the minimum number of ACs that fully characterise the requirement — one AC per independently testable pass condition.
- Label ACs that test a single isolated behavior as `unit`. Label ACs that verify behavior across two or more integrated components as `integration`. Label ACs that trace a full user journey end-to-end as `end-to-end`.

**Error-path assessment (required for every `New` and `Modified` requirement):**

Every `New` and `Modified` requirement must be assessed for error paths — what the system does when the capability fails, receives invalid input, or encounters an unavailable dependency. This is not optional. The assessment produces one of two outcomes:

1. **Error path exists → write at least one error-path AC.** The AC must specify the externally observable outcome when the operation fails — the error response, fallback behavior, or user-facing message. An error-path AC uses the same Given/When/Then format, with the `Given` or `When` clause describing the failure condition and the `Then` clause describing the required system behavior on failure.

2. **No meaningful error path → state the determination explicitly.** Write `Error path: None — [reason]` inline after the requirement's ACs. Valid reasons include: the requirement is a display or presentation concern with no user-triggered failure mode; the requirement is a behavioral constraint (e.g., encoding, formatting) where failure is an infrastructure concern covered by NFRs; or the requirement describes a passive property with no input to reject.

Requirements that process user input, integrate with external systems, change system state, or perform calculations almost always have error paths. Requirements that display static content, enforce formatting standards, or constrain internal behavior often do not. When in doubt, write the error-path AC — a redundant AC is less harmful than an undefined failure mode.

**Executability gaps:** While writing ACs, identify any preconditions that cannot currently be met — missing test environments, absent test data, unavailable tooling, or dependencies with unknown readiness. Record each as a readiness gap in the Open Questions table (RQ-OQ-NNN) at the point it is discovered, with a named owner and target resolution date. Do not defer executability gaps to QE planning.

**Open question severity (apply throughout Steps 2–4):** Every open question recorded during drafting must be classified at the point it is created:
- **Blocker** — the requirement cannot be written at all until this is resolved; dependent requirements are also blocked
- **Major** — the requirement is written with a documented assumption; the assumption must be confirmed before handoff
- **Minor** — the requirement is complete; this open question affects a detail (e.g., an AC threshold) that can be resolved without revising the requirement

The Step 5 assembly sweep confirms every open question has a severity; it does not assign severities for the first time.

**Constraint conflicts:**
If an elicited requirement cannot be satisfied within a hard constraint in the constraint register, do not silently omit the requirement or write it as if no conflict exists. Record it as an open question (RQ-OQ-NNN) identifying the requirement, the conflicting constraint, and the decision needed. Present the conflict to the user before assembling the spec. Do not carry unresolved constraint conflicts into the hand-off.

### Step 3 — Link to Analysis Artifacts

These links apply when the corresponding analysis artifacts were produced. If an artifact was not produced, note its absence rather than leaving the field blank — an explicit "analysis not run" marker is preferable to a silent empty cell.

For every requirement:
- **Scope reference:** The SC-xxx entry that includes this capability *(omit if change-scoping did not run)*
- **Constraint references:** Any constraint register entries (CONST-xxx) that bound this requirement *(omit if constraint-extraction did not run)*
- **Dependency references:** DEP-xxx entries from the dependency map for any integration points *(omit if dependency-mapping did not run)*

These links are what distinguish a traceable spec from a requirements document that drifts away from its analysis foundation.

### Step 4 — Validate Against Elicited Requirements

Before mapping, apply a SMART self-check to every requirement you have written. Fix any that fail before assembling.

| Criterion | Check question | Fix if failing |
|-----------|---------------|---------------|
| **Specific** | Is this a single, unambiguous behavior? Could two developers implement it differently? | Split compound requirements; remove ambiguous verbs |
| **Measurable** | Is there a verifiable threshold or observable condition? Can this be confirmed with a clear pass/fail? | Add a quantified threshold; if the threshold is unknown, record as an open question before assembly |
| **Attainable** | Does this requirement fall within the defined scope boundaries and operate within the constraint register without conflict? If the constraint register is absent or flagged as incomplete, the answer is unknown — record a Blocker open question before proceeding. | Raise a scope extension or constraint conflict open question; if the constraint register is absent or incomplete, record a Blocker open question — absence of a documented constraint is not absence of constraint |
| **Relevant** | Does this requirement serve at least one named business objective (OBJ-xxx)? | If no business objective covers this requirement, it is scope creep (remove it) or a missing objective (add it to business-objectives before proceeding) |
| **Time-bound** | Where the requirement involves a timing constraint (response time, delivery window, processing deadline), is a specific, measurable threshold stated? | Replace vague time language with a specific threshold, or flag as an open question if the threshold is unknown |

Any requirement that cannot answer all five questions satisfactorily must be revised before handoff. Do not carry weak requirements forward expecting the review skill to catch them.

**Scope re-check at validation:** During SMART validation, re-evaluate each requirement's scope fit. Requirements that were in-scope when first read may expand as their ACs are written in detail. If a requirement now exceeds the SC-xxx boundaries, flag it to the user immediately — the same scope decision process from Step 1 applies. Do not carry silently expanded requirements into assembly.

Then produce the traceability mapping:

| Elicited requirement | Spec items that satisfy it |
|---------------------|--------------------------|
| ER-001 | REQ-003, REQ-007 |
| ER-002 | REQ-004 |

Every elicited requirement must map to at least one spec item. Every spec item must trace to at least one elicited requirement. Orphaned elicited requirements are scope gaps. Orphaned spec items are scope creep.

**Exception for `Prohibited` requirements:** A `Prohibited` requirement may trace to a constraint register entry (CONST-xxx) rather than an elicited requirement when the prohibition is derived from a hard constraint (e.g., regulatory, security, or data governance). In this case, record the CONST-xxx reference in place of an ER-NNN in the traceability table and note "derived from constraint." A `Prohibited` requirement with no ER-NNN and no CONST-xxx reference is an orphaned spec item and must be removed or justified before assembly.

### Step 5 — Assemble

Populate the `functional-requirements` template.

**Open Questions:** Throughout Steps 2–4, any requirement that cannot be fully specified due to missing information must be recorded in the Open Questions table of the template (RQ-OQ-NNN) at the point the gap is discovered — not deferred to assembly. Severity must be assigned at the point of creation using the Blocker / Major / Minor definitions in Step 2. At Step 5, sweep the draft to confirm every unresolved gap has an entry with: what is unknown, which requirement(s) are affected, the named owner responsible for resolution, a target resolution date, and a severity. Confirm that no Blocker open questions remain unresolved — a spec with unresolved Blockers cannot pass the hand-off gate.

Do not leave requirements partially written and unmarked — either write them fully or record the gap explicitly. A spec with documented open questions is preferable to a spec with quietly incomplete requirements.

**Revision History:** Record an entry in the Revision History table before presenting. Minimum fields per entry: version number, date (YYYY-MM-DD), author name, and a brief description of what changed (e.g., "Initial draft" for v1.0). If a revision is triggered by a downstream skill returning a change request, record which skill triggered the revision and which requirements were affected.

## Output

A populated **functional-requirements** document (use the template at `../assets/functional-requirements.md`).

### File Output

Write the completed functional requirements to `docs/<feature>/requirements-package/requirements/functional-requirements.md`.

Consumed by: business-rules (extracts rules implied by the spec), data-requirements (extracts data inputs, outputs, and structural impact from the spec), permissions-access-control, nonfunctional-requirements, assumptions-constraints-scope, and the package-synthesis.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Requirements that contradict constraints | Step 1 loads the constraint register before writing; Steps 2 and 3 link constraints to all requirements; Step 2 requires constraint conflicts to be raised as open questions before assembly |
| Spec items with no stakeholder backing | Step 4 validates every spec item traces to an elicited requirement |
| Implementation-prescriptive specs that constrain the architect | Step 2 writing rules prohibit implementation guidance in the spec |
| Elicited requirements outside scope silently added to the spec | Step 1 scope pre-check requires an explicit scope decision before out-of-scope requirements reach drafting |
| Incomplete requirements delivered without flagging | Step 5 requires all unresolvable items to be recorded as open questions with a named owner before handoff |
| Discovery was skipped and no requirements have been stated, but the spec proceeds anyway | Step 1 checks whether requirements have already been stated by the BSA in this session; if not, it halts until requirements are provided and confirmed before any spec item is written |
| Requirements with no business justification carried into delivery | Step 2 requires every requirement to reference at least one OBJ-xxx; orphaned requirements are flagged at authoring time, not discovered at synthesis |
| Requirements with no user experience grounding | Step 2 requires every requirement to reference a journey stage; requirements without a stage reference are flagged immediately |
| Machine identities missing from the permissions matrix because they were never named in requirements | Step 1 identifies machine actors from the dependency map; Step 2 requires machine-initiated behavior to use the machine identity name as the actor |
| Modified requirements cause regressions in adjacent untouched behavior | Step 2 Modified writing rules require preservation requirements or must-not-touch items for adjacent behaviors at regression risk |
| QE has no pass/fail conditions at sprint review | Step 2 requires ACs to be written inline for every requirement at the time the requirement is written — not deferred |
| AC pass conditions reference internal state and break when implementation changes | Step 2 AC writing rules require observable `Then` clauses; internal-state references are flagged during writing |
| Contradictory elicited requirements are silently carried into the spec, producing an incoherent functional design | Step 1 elicited-requirement conflict check flags contradictions before drafting begins and requires an explicit product owner decision |
| Must-not / prohibition requirements have no home and are dropped or misclassified as constraints | Step 2 `Prohibited` type provides a first-class category for behavioral prohibitions with dedicated writing rules and required ACs |
| Removed requirements have no deprecation timeline, leaving delivery teams without a target date | Step 2 `Removed` writing rules and the Deprecation date field require the removal milestone to be stated in the requirement |
| Requirements with equal stated priority cannot be cut or sequenced when scope is constrained | Step 2 requires every requirement to carry a MoSCoW priority set by the product owner |
| Requirements expand silently beyond scope during AC authoring and the expansion is never flagged | Step 4 scope re-check re-evaluates scope fit for every requirement after ACs are written |
| AC executability gaps are discovered by QE at sprint review, too late to remediate | Step 2 AC writing requires executability gaps to be recorded as open questions with a named owner at the point of discovery |
| Late-arriving informal requirements bypass elicitation and enter the spec unconfirmed | Step 1 late-arriving requirements rule requires all post-elicitation requirements to go through explicit product owner confirmation before entering the spec |
| Downstream skills silently revise functional requirements without product owner re-confirmation | The hand-off gate downstream change control rule requires revised requirements to be re-confirmed by the product owner or BSA before the downstream skill continues |

## Hand-off Gate

**`functional-requirements` must complete before any other requirements skill begins. Before reading any other requirements reference file, you must:**
1. Write the completed functional spec in full — all requirement entries with their IDs, type, existing behavior ref (where applicable), priority, business objective ref, journey stage ref, capability statements, actor/trigger, expected outcome, integration points, constraints, deprecation date (for `Removed`), and inline ACs.
2. Present it to the **accountable product owner or named BSA** (the person with authority to confirm that requirements are complete and correctly stated for this initiative). "The user" alone is not sufficient sign-off authority for the core requirements artifact — the product owner or BSA must be explicitly identified and their confirmation recorded before the gate is considered passed.
3. Receive explicit, substantive acknowledgement. A substantive acknowledgement confirms specific named requirements, not just a general "looks good." If the product owner or BSA identifies any corrections, return to the relevant step, revise the requirement, and re-present before proceeding.

Only after this gate passes may the mandatory skills begin: `business-rules`, `data-requirements`, `permissions-access-control`, `nonfunctional-requirements`, and `assumptions-constraints-scope`.

**Downstream change control:** When a downstream skill (`business-rules`, `data-requirements`, `permissions-access-control`, or `nonfunctional-requirements`) identifies an ambiguity or gap that requires a functional requirement to be revised, the change must be brought back to this skill. Revise the affected requirement(s), update the revision history, and re-present the revised requirements to the named product owner or BSA for explicit re-confirmation before the downstream skill continues. A downstream skill's discovery of a gap does not grant authority to change a requirement unilaterally.

---

## Completion Criteria

- [ ] Every spec item has a **Business Objective Ref** (OBJ-xxx) — no requirement is left without a direct business justification
- [ ] Every spec item has a **Journey Stage Ref** — no requirement is left without traceability to a user experience stage
- [ ] Every elicited requirement maps to at least one spec item
- [ ] Every spec item traces to at least one elicited requirement
- [ ] SMART self-check passed for every requirement — all five criteria answered satisfactorily
- [ ] All requirements reference any scope entries (SC-xxx) that authorise them — or note "analysis not run" where change-scoping did not run
- [ ] All requirements with integration points reference DEP-xxx entries from the dependency map — or note "analysis not run" where dependency-mapping did not run
- [ ] Every requirement references any constraint register entries (CONST-xxx) that govern it — or note "analysis not run" where constraint-extraction did not run
- [ ] No implementation guidance appears in any requirement
- [ ] All requirements are written in present tense with a single observable behavior
- [ ] Machine identities identified in the dependency map that initiate behavior within the feature's scope appear as named actors in the relevant requirements — none are collapsed into "the system"
- [ ] All constraint conflicts have been raised as open questions and presented to the user — none are silently omitted
- [ ] All out-of-scope elicited requirements have been flagged and an explicit scope decision has been received
- [ ] Open questions are recorded in the template with a named owner and target resolution date
- [ ] Revision history entry exists for the initial draft
- [ ] Every requirement has a `Type` assigned — `New`, `Modified`, `Removed`, or `Prohibited`; no requirement is left untyped
- [ ] Every `Modified` requirement has a populated **Existing behavior ref** — the current behavior being changed is identified
- [ ] Every `Removed` requirement has a populated **Existing behavior ref** and its expected outcome describes the behavior at the removal point
- [ ] Every `Modified` requirement with unresolved backward-compatibility, migration, or parallel-run obligations has a `RQ-OQ-NNN` open question recorded
- [ ] Every `Removed` requirement where any consumer lacks a documented migration path has a `RQ-OQ-NNN` open question recorded
- [ ] Requirements where `New` vs `Modified` is ambiguous have been resolved with the product owner or recorded as open questions
- [ ] Every `Modified` requirement has been assessed for adjacent behaviors at regression risk; preservation requirements or must-not-touch items have been added where warranted
- [ ] Every requirement has at least one AC written inline, in Given/When/Then form with an observable `Then` clause
- [ ] `Modified` requirements have at least one AC covering the new behavior and one confirming the prior behavior is no longer produced (where applicable)
- [ ] `Removed` requirements have an AC describing the observable outcome when the removed action is attempted after removal
- [ ] Every `New` and `Modified` requirement has been assessed for error paths — either at least one error-path AC is written (specifying the observable outcome on failure), or an explicit `Error path: None — [reason]` determination is stated inline
- [ ] Every AC with a `Then` clause referencing only internal system state (not an externally observable surface) has been rewritten to reference an observable signal, or its internal reference has been documented and accepted as a known limitation
- [ ] The hand-off gate acknowledgement was received from the named product owner or BSA — not solely from the session user
- [ ] Every requirement has a `Priority` assigned (`Must`, `Should`, `Could`, or `Won't (this release)`) confirmed by the product owner or BSA
- [ ] Every `Removed` requirement has a populated **Deprecation date / removal milestone** field
- [ ] Every `Prohibited` requirement has an AC confirming the prohibited behavior cannot be triggered
- [ ] Every `Prohibited` requirement where an existing consumer depends on the prohibited behavior has a `RQ-OQ-NNN` open question recorded
- [ ] All conflicts between elicited requirements have been presented to the product owner and an explicit resolution has been recorded before drafting began
- [ ] Every open question is classified as Blocker, Major, or Minor — no open question is left without a severity
- [ ] Revision history entry includes version number, date, author name, and description — minimum fields are populated
- [ ] All late-arriving informal requirements went through product owner confirmation before entering the spec
- [ ] All requirements re-evaluated against scope boundaries after AC authoring; any newly expanded requirements were flagged and decided
- [ ] All executability gaps identified during AC writing are recorded as open questions with a named owner and target resolution date
