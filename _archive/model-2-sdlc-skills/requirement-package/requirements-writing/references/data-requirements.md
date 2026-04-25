# Data Requirements

## Purpose

Document business information inputs required, information outputs produced (including failure-path outputs), information validation rules, sensitivity classifications, retention requirements, and new or modified information types introduced by the feature — all at the business requirements level, not at the technical implementation level. Consumes: the functional spec from functional-requirements (which identifies what information the feature consumes and produces), the dependency map from dependency-mapping (which identifies information types the feature depends on from the existing system), and the business rules catalog from business-rules (which encodes validation logic that governs information elements). If the analysis phase ran, also consumes: the constraint register from constraint-extraction (hard business-level limits including retention mandates). Produces a business-level data requirements document consumed by the requirements-package, the architect (for technical design decisions), the developer's feature-implementer, and QE for data-level test coverage.

## Level of Abstraction — Guardrails

This skill produces a **business information requirements** document — it describes WHAT information the business needs and produces to support the feature. It does NOT prescribe HOW systems represent, store, or exchange that information.

**The architect and developers determine technical representation.** This document defines the business requirement.

Apply these guardrails throughout every step:

| Do | Do not |
|-----|--------|
| Use plain-English names for information types and elements (e.g., "Customer identifier", "Funding amount in CAD", "Registration status") | Use camelCase, PascalCase, or code-style naming (e.g., `customerId`, `FundAccountRequestPayload`, `amountCad`) |
| Describe information in business terms (e.g., "The amount the customer wants to transfer, in Canadian dollars") | Write API-contract-level specifications with null-handling behaviour and technical validation patterns |
| State business-level constraints by referencing BR-xxx (e.g., "Must comply with BR-002 — positive amount within configured limit") | Specify technical data types, payload shapes, response codes, or internal error-handling logic |
| Name information types using the business concept they represent (e.g., "Interac registration status", "Eligible receiving account list", "Funding request details") | Name information types as if they are code classes or API payloads (e.g., `InteracRegistrationStatus`, `FundAccountRequestPayload`) |
| State what happens from a business perspective when information is absent (e.g., "Required — the feature cannot proceed without this") | Specify implementation-level behaviour (e.g., "Reject input if missing", "Return HTTP 400") |
| Group information elements by business meaning | Group by technical entity or API boundary |

**Test:** Before writing any table row, ask: "Could a business stakeholder read this and understand it without knowing the system's internal design?" If no, rewrite at a higher level of abstraction.

## When to Use

- After business-rules has produced the business rules catalog (step 6 in the requirements sequence — this skill is step 7)
- When the feature consumes, produces, or transforms data
- Before developer handoff — gives developers and the architect a single business-level reference for what information the feature requires, produces, must validate, must protect, and must retain

## What This Produces

A business information requirements document organised around four pillars:

1. **Information inputs** — what business information the feature consumes, from where, its sensitivity classification, and the business rules that govern it
2. **Information outputs** — what business information the feature produces or returns on both success and failure paths, to whom, and the business rules that govern it
3. **Information validation rules** — constraints on inputs and outputs (referencing business rules, not duplicating them), including what the business requires the system to do when a constraint is violated
4. **Impact to business information** — information types the feature introduces or modifies, including sensitivity, retention, downstream consumers, and migration requirements

## Inputs

| Input | Source | Required | If not available |
|-------|--------|----------|-----------------|
| Functional spec | functional-requirements | Yes — identifies what information the feature consumes and produces | — |
| Dependency map | `docs/<feature>/requirements-package/analysis/dependency-map.md` | If available — identifies information types the feature depends on from the existing system | Analysis skipped: identify information dependencies from the functional spec and stakeholder consultation; record each as an assumption and flag as an undocumented dependency |
| Business rules catalog | business-rules | Yes — validation and integration rules that govern information elements; business-rules (step 6) completes before this skill runs (step 7), so BR-xxx identifiers must already exist | — |
| Constraint register | `docs/<feature>/requirements-package/analysis/constraint-register.md` | If available — provides hard business-level limits including retention requirements and regulatory mandates | Analysis skipped: elicit hard business-level limits and retention requirements from the stakeholder; record as assumptions |
| Impact analysis | `docs/<feature>/requirements-package/analysis/impact-analysis.md` | If available — identifies downstream consumers of information types the feature writes to | Analysis skipped: identify downstream consumers through stakeholder consultation; record each gap as an assumption and flag the consumer list as potentially incomplete |

## Workflow

```
┌──────────────────────────────────────────────────────────┐
│  1. COLLECT — Identify all information types in scope    │
│     From spec: information the feature consumes or       │
│     produces. From dep map: existing information types   │
│     depended on. Note sensitivity class per type.        │
├──────────────────────────────────────────────────────────┤
│  2. MAP INPUTS — For each trigger event,                 │
│     document what information it consumes, from what     │
│     source, what elements it needs (business-level),     │
│     sensitivity, and governing business rules            │
├──────────────────────────────────────────────────────────┤
│  3. MAP OUTPUTS — For each trigger event,                │
│     document what information it produces or returns on  │
│     the success path AND the failure path, what elements │
│     it includes, to what consumer                        │
├──────────────────────────────────────────────────────────┤
│  4. LINK VALIDATION — For each input and output,         │
│     reference the business rules that govern it          │
│     (do not restate — cite BR-xxx); cross-check          │
│     against constraint register if available;            │
│     document retention requirements per info type;       │
│     PAUSE if any BR-xxx gap is unresolved                │
├──────────────────────────────────────────────────────────┤
│  5. INFORMATION TYPES — Define new and modified          │
│     information types: business-level elements,          │
│     sensitivity, retention, downstream consumers,        │
│     integration points, migration requirements           │
├──────────────────────────────────────────────────────────┤
│  6. VALIDATE — Confirm definitions with the BSA          │
│     Record date, name, and medium of confirmation.       │
│     External system info types require owner sign-off.   │
├──────────────────────────────────────────────────────────┤
│  7. ASSEMBLE — Populate the data-requirements template   │
│     with business-level content; apply abstraction check │
└──────────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Collect Information Types in Scope

**From the functional spec (information types the feature consumes or produces):**
- Nouns that represent business information: Customer profile, Account details, Transaction record, Registration status
- Any spec item that uses "stores," "saves," "records," "creates," "submits," "returns," or "displays" in reference to a named piece of business information

**From the dependency map (existing information types depended on):**
- All DEP-xxx entries whose dependency type is a data entity, type definition, or model
- These information types require documentation of what the feature expects — even if the feature does not modify them

**For each information type identified, record its sensitivity classification:** PII, PCI-scoped, PHI, commercially sensitive, internal-only, or public. This classification is carried forward into Steps 2, 3, and 5. If the classification is unknown, escalate to the BSA before proceeding — do not leave it blank.

**Naming convention:** Name each information type using the business concept it represents, in plain English. For example: "Interac registration status", "Eligible receiving account list", "Allowed external institution list" — not `InteracRegistrationStatus` or `AllowedOfiList`.

Only include information types within the feature's scope. Do not document the entire data model.

### Step 2 — Map Information Inputs

For each trigger event (system event, user-initiated operation, integration call, or scheduled process) that causes the feature to consume information, document:

| Field | What to capture |
|-------|----------------|
| **Trigger event** | The business event or user action that causes information to be consumed |
| **Source** | Where the information comes from (external system, current system state, user entry, external integration) |
| **Information type** | The business information consumed — named in plain English |
| **Required information** | Which pieces of information must be present for the business operation to succeed |
| **Conditional information** | Which pieces of information are conditionally present, with the business condition that governs their inclusion |
| **Information elements** | The business-level description of each piece of information the feature needs — see the information elements guidance below |
| **Sensitivity** | The sensitivity classification from Step 1, applied at element level where elements within an information type carry different classifications |
| **Dependency reference** | Link to DEP-xxx from the dependency map; if no DEP-xxx exists for this input, flag it as an undocumented dependency and raise it with the BSA |

**Defining "information elements":** For each element, document: a plain-English name, a brief business description of what it represents, whether it is required or conditional (with the business condition), the governing business rule (BR-xxx) if any, and sensitivity. Use a structured table.

**What NOT to include in information elements:** Do not specify technical data types (text, number, date), null-handling or default-value behaviour at the implementation level, specific format constraints (e.g., "ISO 8601"), or technical validation patterns. State the business constraint (e.g., "Must be a positive amount within the configured limit — BR-002") and let the architect determine the technical representation.

**If a business constraint does not yet have a BR-xxx reference:** Flag it as a gap and raise it with the BSA (per Step 4).

Group by feature flow (e.g., all inputs for the eligibility flow together, all inputs for the funding-details flow together).

### Step 3 — Map Information Outputs

For each trigger event that produces or returns information, document **both the success path and the failure path**. Failure-path outputs — error responses, rejection notifications, and failure records — are information the feature produces, and must be documented with the same rigour as success-path outputs.

| Field | What to capture |
|-------|----------------|
| **Trigger event** | The business operation that produces the output |
| **Output path** | Success or Failure — document each path separately; do not collapse them |
| **Destination** | Where the information goes (external system, system store, screen display, downstream process) |
| **Information type** | The business information produced — named in plain English |
| **Required information** | Which pieces of information are always present in the output on this path |
| **Conditional information** | Which pieces of information are conditionally present, with the business condition that governs their inclusion |
| **Information elements** | The business-level description of each piece of information the feature produces — same guidance as Step 2 |
| **Sensitivity** | The sensitivity classification at element level where elements carry different classifications |
| **Consumer** | Who or what consumes this output (external system, end user, operations team, downstream process, external integration) |
| **Dependency reference** | Link to DEP-xxx if the output writes to or interacts with an existing information type; omit for wholly new information types the feature introduces |

### Step 4 — Link Validation Rules, Retention, and Constraint Behaviour

**Validation rule references:** For each information element that has a business constraint:
- Reference the corresponding business rule (BR-xxx) — do not restate the rule. Because business-rules (step 6) completes before this skill runs (step 7), BR-xxx identifiers must already exist.
- If no business rule exists for a constraint that should be validated, flag it as a gap in the data requirements document and raise it with the BSA. **This skill pauses at this step and does not proceed to Step 5 until the BSA has either resolved the gap in the business rules catalog or accepted the gap in writing with a documented rationale.** Do not proceed past handoff with an unresolved gap.
- For each constrained element, document the required business outcome when the constraint is violated (e.g., the operation is rejected with a defined message to the user, the request cannot proceed, the user is directed to an alternative path). State these as business requirements, not implementation instructions.

**If the constraint register is available (analysis ran):** For each information element, also cross-check against the constraint register. Hard business-level limits documented there (retention requirements, regulatory mandates) must be reflected in the information element description even if no business rule covers them.

**Retention requirements:** For every information type the feature creates or writes to, document the data retention requirement — how long records must be kept, and what happens when the retention period expires (archive, purge, anonymise). Source retention requirements from the constraint register if available; if not, elicit them from the BSA. Retention requirements cannot be left blank. If the stakeholder confirms that no retention policy applies to a given information type, record that confirmation explicitly with the stakeholder's name and date.

This prevents duplication between data requirements and business rules. The data requirements document says "this element is constrained" and "this is the required business outcome on violation" and points to the rule; the business rules catalog says "this is the constraint logic."

### Step 5 — Define New and Modified Business Information

For every information type the feature introduces — information that does not exist in the system prior to this feature:

| Field | What to capture |
|-------|----------------|
| **Information type** | Plain-English business name for the information |
| **Business purpose** | What this information represents and why the feature requires it |
| **Sensitivity** | Sensitivity classification from Step 1 — at information-type level and at element level where elements differ |
| **Information elements** | Business-level description of each piece of information — plain-English name, what it represents, required or conditional (with the business condition), governing business rule (BR-xxx), and sensitivity. Same guidance as Step 2 — do not specify technical data types, null-handling behaviour, or format constraints. |
| **Retention requirement** | How long records must be kept and what must happen at expiry (archive, purge, anonymise); must be explicitly stated |
| **Downstream consumers** | What capabilities, screens, or processes will read or write this information — from the impact analysis (if available) or stakeholder consultation |
| **Integration points** | Any DEP-xxx from the dependency map that this information type connects to |
| **Validation rules** | Reference BR-xxx entries that govern this information type's elements |

**Downstream consumer completeness:** If the impact analysis is available, source the consumer list from it. If the analysis phase did not run and the list is sourced from stakeholder consultation, it must be explicitly labelled "sourced from stakeholder consultation — potentially incomplete" and recorded as a risk in the document. Do not treat a stakeholder-provided list as exhaustive — adjacent teams and downstream integrations are routinely omitted. Raise this risk with the BSA.

**Existing information type changes:** If the feature modifies an existing information type (adds elements, changes behaviour of existing elements), document those changes with explicit before-and-after descriptions at the business level and the list of downstream consumers sourced from the impact analysis or stakeholder consultation. Additionally, explicitly determine whether existing records require migration to conform to the new information requirements, and document that determination as a requirement. "No migration required" is an acceptable outcome but must be stated explicitly, not left silent.

### Step 6 — Validate

- **New information type definitions:** Confirm with the BSA. Record the verification as: `Confirmed — [stakeholder name], [date], [medium: e.g. email / meeting note / written sign-off]`.
- **Input and output information elements:** Confirm with the BSA or the team responsible for the information source. Where both the BSA and an external team are involved, both confirmations are required. Record each confirmation with name, date, and medium.
- **Information types crossing integration boundaries:** For any information type that is written to or read by an external system, confirmation is required from the external system owner — not the BSA alone. Record this confirmation separately.

### Step 7 — Assemble

Populate the `data-requirements` template (at `../assets/data-requirements.md`). The template contains sections for: information inputs (by feature flow), information outputs (by feature flow, success and failure paths), validation rule references (by information type), retention requirements (by information type), and new/modified business information.

Organise by feature flow, then by input/output direction within each flow, then by output path (success before failure).

**Abstraction check before writing:** Before populating any table, re-read the Level of Abstraction guardrails at the top of this skill. Every row in the assembled document must be readable by a business stakeholder. If a row contains camelCase names, technical data types, null-handling specifications, or API-level detail, rewrite it at the business level before including it.

**QE-oriented content:** For every information element that carries a business constraint, include in the document:
- At least one example of a value at the boundary of what is permitted, described in business terms
- At least one example of a value that must be rejected, with the business reason it is rejected and the required business outcome (what the user sees, what the system prevents, what alternative is offered)

These are requirements, not test cases. QE must be able to derive data-level test coverage from this document without reverse-engineering requirements from code or from the business rules catalog alone. Examples should use business language (e.g., "Funding amount = $3,000 when the configured limit is $3,000" not "amountCad = configuredLimit").

**Acceptance criteria for information requirements:** Every information input, information output, and new information type must have at least one acceptance criterion written in the document at the time the information requirement is defined — not deferred to a later phase. ACs provide the pass/fail conditions that verify information requirements are met. They complement the QE-oriented boundary/rejection examples by expressing each critical verification as a formal Given/When/Then scenario.

**AC ID scheme:** `AC-DATA-NNN-N` — e.g., `AC-DATA-001-1`, `AC-DATA-001-2`. IDs are unique within the data requirements document and are permanent.

**AC rules for data requirements:**
- Every information input (DI-xxx) must have at least one AC verifying the system accepts correctly formed information and at least one AC verifying the system rejects information that does not meet business requirements.
- Every information output (DO-xxx) must have at least one AC verifying the output on the success path and at least one AC verifying the output on the failure path.
- Every new information type must have at least one AC verifying successful creation with all required information and at least one AC verifying rejection when required information is missing.
- Validation constraint ACs must reference the governing business rule (BR-xxx) and specify the expected business outcome on violation.
- The `Then` clause must reference an externally observable outcome — what the user sees, what the business process does, what state the record enters — not internal processing logic, API responses, or error codes.
- ACs are populated in Section 6 (Acceptance Criteria) of the template.

**Error-path assessment:**

The rejection and failure-path AC rules above cover validation errors and operation failures. Two additional error-path considerations apply:

1. **Information source unavailability:** For every information input (DI-xxx) whose source is an external system or integration, write an AC for what the business requires when the source is unavailable: "Given [the information source is unreachable], When [the trigger event occurs], Then [the system does X — prevents the user from proceeding / shows a specific message / offers an alternative path]." If the information source is user input or local system state that is always available, write `Source unavailability: N/A — source is local` inline.

2. **Partial information:** For every information input with conditional elements, write an AC for what the business requires when a conditional element is absent and its condition is met (the element should be present but isn't): "Given [condition is met but conditional element is absent], When [the operation is performed], Then [the system does X — prevents progression / uses a default / informs the user]." If no conditional elements have conditions that could be violated, write `Partial data: N/A — no conditional elements` inline.

If any section of the template does not apply to this feature, state explicitly why it does not apply. Do not leave sections empty without explanation.

## Output

A populated **data-requirements** document (use the template at `../assets/data-requirements.md`).

### File Output

Write the completed data requirements to `docs/<feature>/requirements-package/requirements/data-requirements.md`.

Consumed by: the requirements-package (embedded in full), the architect (as the business-level information specification that informs technical design decisions), the developer's feature-implementer (the authoritative business information reference during implementation), and QE (the authoritative source for data-level test coverage, including boundary values, rejection examples, and failure-path outcomes).

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Developer reverse-engineers information requirements from existing code instead of a spec | The information inputs and outputs sections provide the authoritative business-level specification |
| A new information type is not fully defined before implementation begins | Step 5 requires business-level element descriptions for every new information type before handoff |
| Validation logic is scattered across business rules, functional spec, and developer memory | Step 4 consolidates validation references in one place per information element |
| New information outputs have no defined requirement — developer invents the contract during implementation | Step 3 defines every output requirement before coding begins |
| Existing information dependencies are undocumented and discovered during integration testing | Step 2 surfaces every information input with its source and business-level description |
| Hard business-level constraints from analysis are not reflected in the information requirement | Step 4 cross-checks the constraint register (when available) against every information element |
| Downstream consumers of new information types are not identified until they break | Step 5 requires downstream consumer identification before handoff |
| PII, PCI, or PHI information is handled without controls because sensitivity was never classified | Step 1 requires sensitivity classification per information type; Steps 2, 3, and 5 carry it to element level |
| Error-path outputs are undefined — developer invents rejection behaviour; QE cannot test negative paths | Step 3 requires failure-path outputs to be documented with the same rigour as success-path outputs |
| Information is retained indefinitely or purged without policy basis — compliance liability | Step 4 requires retention requirements per information type; Step 5 embeds them in new information type definitions |
| Developer makes migration decisions for modified information types without requirements | Step 5 requires explicit migration determination for every existing information type the feature modifies |
| Downstream consumer list accepted as complete from stakeholder consultation — adjacent consumers break silently | Step 5 requires the list to be flagged as potentially incomplete and recorded as a risk when analysis did not run |
| Constraint violation behaviour is undefined — developer invents error handling | Step 4 requires the required business outcome on constraint violation to be stated as a requirement |
| Data requirements prescribe technical implementation — architect receives a spec that constrains design choices | Level of Abstraction guardrails ensure the document stays at the business requirements level throughout |

## Hand-off Gate

**Requires: business-rules catalog completed and acknowledged (step 6 in the requirements sequence). This skill is step 7 and does not begin until business-rules is complete.**

Before reading `permissions-access-control.md`, you must:
1. Confirm that all BR-xxx gaps identified in Step 4 are either resolved in the business rules catalog or accepted in writing by the BSA with a documented rationale. No unresolved gaps proceed past handoff.
2. Write the completed data requirements document in full — every information type with its inputs, outputs (success and failure), validation references, sensitivity classifications, retention requirements, and new/modified information type definitions — all at the business requirements level per the Level of Abstraction guardrails.
3. Present it to the BSA for review.
4. Receive explicit acknowledgement.

---

## Completion Criteria

- [ ] Every information type identified in the functional spec has an entry
- [ ] Every information type from the dependency map that the feature reads or writes has a documented business-level description of what the feature expects
- [ ] All information inputs are documented with trigger event, source, information type (plain-English name), required information, conditional information and their business conditions, sensitivity classification, and dependency reference
- [ ] All information outputs are documented for both the success path and the failure path — with destination, information type, required information, conditional information and their business conditions, sensitivity classification, and consumer
- [ ] All validation constraints reference the corresponding business rule (BR-xxx) — no duplication
- [ ] Required business outcome on constraint violation is documented for every constrained information element
- [ ] Hard business-level limits from the constraint register (if available) are reflected in the relevant information element descriptions; absence of the constraint register is noted explicitly
- [ ] All new information types introduced by the feature are fully defined with business-level element descriptions, purpose, sensitivity classification, retention requirement, downstream consumers, and validation rule references
- [ ] Any existing information types the feature modifies have explicit before-and-after change descriptions, an identified list of downstream consumers (source noted), and an explicit migration determination
- [ ] Data retention requirements are documented for every information type the feature creates or writes to; "no retention policy" is confirmed by a named stakeholder with date, not left blank
- [ ] Data sensitivity classification (PII, PCI, PHI, internally sensitive, or public) is documented for every information element — or explicitly stated as not applicable with justification
- [ ] Downstream consumer lists sourced from stakeholder consultation (where analysis did not run) are explicitly flagged as potentially incomplete and recorded as a risk
- [ ] All unresolved BR-xxx gaps are either resolved in the business rules catalog or accepted in writing by the BSA before handoff
- [ ] All new and modified information type definitions are confirmed — each confirmation records the stakeholder name, date, and medium; external system information types carry a separate owner confirmation
- [ ] QE-oriented content is present for every constrained element: at least one boundary value example and at least one rejection example with expected business outcome, described in business terms
- [ ] Every information input (DI-xxx) has at least one AC for accepted information and at least one AC for rejected information, in Given/When/Then format
- [ ] Every information output (DO-xxx) has at least one AC for the success-path output and at least one AC for the failure-path output
- [ ] Every new information type has at least one AC for successful creation and at least one AC for rejection when required information is missing
- [ ] Every information input from an external system has an AC for source unavailability, or states `Source unavailability: N/A — source is local`
- [ ] Every information input with conditional elements has an AC for the absent-but-expected case, or states `Partial data: N/A — no conditional elements`
- [ ] AC IDs follow the `AC-DATA-NNN-N` scheme and are unique within the document
- [ ] The data-requirements template is fully populated — no section is left empty without an explicit statement of why it does not apply to this feature
- [ ] **Abstraction check:** The entire document uses plain-English names, business-level descriptions, and references to BR-xxx — no camelCase names, technical data types, null-handling specifications, API payload structures, or implementation-level detail
