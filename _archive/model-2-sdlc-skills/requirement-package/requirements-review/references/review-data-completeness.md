# Review — Data Completeness

## Purpose

Verify that data requirements are fully defined — information types, information elements, relationships, constraints, and business rules. Flag missing information referenced in functional requirements.

## When to Use

- After the data requirements document and business rules catalog are completed as part of the requirements phase
- Before architect handoff — incomplete data definitions leave the architect guessing about the data model
- When the functional requirements reference entities or attributes — every reference must have an entry in the data requirements document
- Run after review-completeness (which checks that the data requirements document has an entry for every referenced entity) — this skill goes deeper, checking that each entry is itself complete

## What This Reviews

Data completeness asks: **are the information requirements fully specified?** An entry that exists but is missing business constraints, relationship definitions, or a business rule reference is not complete — it is a partial definition that will produce inconsistent implementation.

This is distinct from review-completeness (which checks that every referenced information type has an entry in the data requirements document) and review-consistency (which checks that information type names agree across artifacts). This skill checks the quality of the information definitions themselves.

The primary artifact under review is the **data requirements document** produced during the requirements phase. All artifacts come from the requirements phase — there is no pre-existing data dictionary or existing system baseline.

**Note on the level of abstraction:** The data requirements document is a business-level document. It uses plain-English names for information types and elements, references BR-xxx for business constraints, and describes information in business terms — not technical data types, null-handling behaviour, or API payload structures. This review checks completeness at the business level, not at the technical implementation level.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Data requirements document | `docs/<feature>/requirements-package/requirements/data-requirements.md` | Yes — primary artifact under review |
| Business rules catalog | `docs/<feature>/requirements-package/requirements/business-rules.md` | Yes — BR-xxx references in the data requirements must align with defined rules |
| Functional requirements | `docs/<feature>/requirements-package/requirements/functional-requirements.md` | Yes — every information type and element referenced in the functional requirements must be fully defined in the data requirements document |

> **Missing input guard:** If any required input listed above cannot be found at its documented path, halt the review and inform the user: *"I cannot proceed with this review because [artifact name] was not found at `[expected path]`. This input is required. Please ensure the artifact exists before running this review."*

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  0. PRE-FLIGHT — SUMMARY TABLE                       │
│     Summary table counts match the actual count of   │
│     Existing, Modified, and New entries in Section 7 │
├──────────────────────────────────────────────────────┤
│  1. ELEMENT COMPLETENESS                             │
│     1a. Section 7 New info types: all columns        │
│         explicitly populated — no blank cells        │
│     1b. Section 7 Existing info types: Element,      │
│         Description, Required, Business Constraint,  │
│         Sensitivity present                          │
│     1c. Info type headers: Business Purpose stated;  │
│         Confirmed status is a passing value          │
│     1d. Sections 1 & 2: every element meets minimum  │
│         content; conditional conditions stated;      │
│         DO-xxx Consumer column populated             │
├──────────────────────────────────────────────────────┤
│  2. RELATIONSHIP COMPLETENESS                        │
│     Every row in Information Relationships has       │
│     relationship type and linking element stated;    │
│     every element-level relationship has a           │
│     corresponding Relationships section row          │
├──────────────────────────────────────────────────────┤
│  3. BUSINESS CONSTRAINT COMPLETENESS                 │
│     Every status/type/yes-no element has its         │
│     complete set of allowed values listed with       │
│     BR reference                                     │
├──────────────────────────────────────────────────────┤
│  4a. CONSTRAINT COMPLETENESS — FORWARD               │
│     Every BR-xxx in the business rules catalog       │
│     that governs an information element is           │
│     referenced in the data requirements document     │
├──────────────────────────────────────────────────────┤
│  4b. SECTION 3 ROW COMPLETENESS — REVERSE            │
│     Every row in Section 3 cites a BR-xxx that       │
│     exists in the business rules catalog             │
├──────────────────────────────────────────────────────┤
│  5. INFORMATION GAPS                                 │
│     Every row in Information Gaps has an Owner       │
│     and Target Resolution date; no gap is            │
│     overdue and unresolved at handoff                │
├──────────────────────────────────────────────────────┤
│  6. SPEC REFERENCE COVERAGE                          │
│     Every information type and element named in      │
│     the functional requirements resolves to an       │
│     entry in the data requirements document          │
└──────────────────────────────────────────────────────┘
```

## Check Details

### Pre-flight — Summary Table Consistency

Before running any element-level checks, verify that the Summary table at the top of the data requirements document is present and internally consistent with Section 7.

Count the information type entries in Section 7 by status:
- Count every information type header tagged **Existing (unchanged)**
- Count every information type header tagged **Modified**
- Count every information type header tagged **New**
- Sum them for the Total

Compare these counts against the Summary table rows. If any count in the Summary table does not match the actual count in Section 7, the document is inconsistent and must be corrected before proceeding — an incorrect Summary table will mislead every downstream consumer of the document.

| Summary table field | Pass condition |
|---------------------|----------------|
| Existing (unchanged) | Count matches the number of Existing information type entries in Section 7 |
| Modified | Count matches the number of Modified information type entries in Section 7 |
| New | Count matches the number of New information type entries in Section 7 |
| Total | Equals Existing + Modified + New |

A mismatch in any row is a **Medium** finding. The pre-flight check must pass before proceeding to Check 1.

---

### Check 1 — Information Element Completeness

#### 1a — Section 7: New information type element rows

For every element in every **New** information type (Section 7), verify all of the following columns are populated. The element name must be in plain English and consistent with the name used in the functional requirements and business rules catalog — not an informal alias invented for the document.

| Column (from template) | Pass condition |
|------------------------|----------------|
| Element | Plain-English name, consistent with the functional requirements and business rules catalog |
| Description | Business-level description of what this information represents — not blank, not a placeholder |
| Required / Conditional | Explicitly stated — "Required" or "Conditional — when (business condition)" — not blank |
| Business Constraint | BR-xxx reference stated explicitly — or "No constraint" explicitly stated if no business rule governs this element |
| Default | A value or "None" explicitly stated — not blank |
| Business Rule | BR-xxx reference — or "None" explicitly stated |
| Sensitivity | Classification stated — PII, internal-only, public, etc. — not blank |
| Relationships | Reference to related information type stated — or "None" explicitly stated |

Any element row with a blank column is **incomplete**. "None" or "No constraint" must be written explicitly — a blank cell does not mean "None."

#### 1b — Section 7: Existing information type element rows

The Existing information type format uses a different column set from New information types. For every element in every **Existing** information type (Section 7), verify the following columns are populated:

| Column (from template) | Pass condition |
|------------------------|----------------|
| Element | Plain-English name, consistent with the functional requirements and business rules catalog |
| Description | Business-level description — not blank |
| Required | Explicitly stated as Yes or No — not blank |
| Business Constraint | Stated explicitly — or "No constraint" explicitly stated |
| Sensitivity | Classification stated — not blank |
| Notes | Free text — may be blank only if there is genuinely nothing to note; a blank is acceptable but must be intentional, not an oversight |

Any Existing information type element row with a blank Element, Description, Required, Business Constraint, or Sensitivity column is **incomplete**.

#### 1c — Section 7: Information type header completeness

For every information type entry in Section 7 — New, Modified, or Existing — verify the header block contains the following:

**Business Purpose** must be populated with a statement describing what the information represents in business terms. A blank Business Purpose, a placeholder such as "[what this information represents]," or a technical description that would only be understood by a developer is **incomplete**. An incomplete Business Purpose is a **Low** finding.

**Confirmed status** must be set to a passing value:

| Information type status | Permitted Confirmed value |
|------------------------|--------------------------|
| New | "Stakeholder-confirmed" |
| Existing | "Yes" |
| Modified | "Current state confirmed / proposed changes stakeholder-confirmed" |

"Assumed — pending confirmation" is **not a passing status**. An information type whose Confirmed field contains this value or is blank is a **High** finding and must be escalated to the BSA before handoff. Do not advance to verdict until every information type entry carries a passing Confirmed value.

#### 1d — Sections 1 & 2: Input and output information element tables

Information element tables in Sections 1 and 2 appear below each DI-xxx and DO-xxx row, as specified in `data-requirements.md` Steps 2 and 3. Apply the following minimum content check to each element defined in those tables:

| Minimum content element | Pass condition |
|-------------------------|----------------|
| Element name | Present, in plain English, and consistent with Section 7 or functional requirements |
| Business Description | Present — describes what the information represents in business terms |
| Required / Conditional | Present — explicitly stated for the element |
| Condition (conditional elements only) | Every element described as conditional must state the business condition that governs its inclusion. Absence of a condition for a conditional element is **incomplete** |
| Business Constraint | Present — BR-xxx reference stated explicitly, or "No constraint" |

Flag any element that appears in the Required Information or Conditional Information list of a DI-xxx or DO-xxx row but has no information element table entry at all.

For every DO-xxx row in Section 2, the Consumer column must be populated — the external system, end user, operations team, or downstream process that consumes this output. A blank Consumer column is **incomplete**.

---

### Check 2 — Relationship Completeness

Review the **Information Relationships** section of the data requirements document. For every row:
- Is the Relationship Type stated (one-to-many, one-to-one, many-to-many)?
- Is the Linked By field identified by name (in plain English)?
- Do both the From information type and the To information type have entries in Section 7?

A row that states "references [Information Type B]" without naming the linking element is **incomplete**.

Also verify consistency in the other direction: every element in a New information type whose Relationships column is populated (not "None") must have a corresponding row in the Information Relationships section. A relationship noted at the element level but absent from the Information Relationships section is **incomplete**.

---

### Check 3 — Business Constraint Completeness

For any information element whose business description implies a restricted set of values — status elements, type elements, category elements, or elements with a defined set of permitted values — verify:

- The complete set of allowed values is stated in the Business Constraint column or in the referenced BR-xxx
- The business rule that governs the allowed values is referenced (BR-xxx) in the Business Constraint or Business Rule column
- There is no "etc." or "and others" — the list must be exhaustive, or explicitly noted as open-ended with a written justification

**Yes/no elements:** For any element whose description implies a yes/no or binary value, the Business Constraint column must still explicitly list the permitted values or reference a BR-xxx. If the values are self-evident and no business rule governs them, the Business Rule column must state "None" explicitly.

---

### Check 4a — Constraint Completeness: Forward

**Scope — what counts as "governs an information element":** A BR-xxx governs an information element for the purpose of this check if it specifies a constraint, validation, or permitted value set on a named piece of business information. This includes rules that define allowed values (e.g., status must be one of a defined set), ranges (e.g., amount must be greater than zero), uniqueness (e.g., unique per customer), required/conditional status, or format (e.g., email format). Rules that specify timing, sequence, UI behaviour, workflow transitions, or role-based access control do not govern an information element and are out of scope for this check.

For every BR-xxx in the business rules catalog that governs an information element (per the scope definition above):
- Find the element it governs in the data requirements document — in the Business Constraint or Business Rule column of the element row (Section 7) or in Section 3 (Information Validation Rules)
- Verify the BR-xxx is referenced

A business rule that says "email must be unique per customer" with no corresponding reference in the element row and no reference in Section 3 is a **data completeness gap**.

---

### Check 4b — Section 3 Row Completeness: Reverse

For every row in **Section 3 (Information Validation Rules)**:
- The Business Rule column must cite a specific BR-xxx identifier
- That BR-xxx must exist in the business rules catalog

A row with no BR-xxx reference, a free-text rule description instead of a BR-xxx, or a BR-xxx that cannot be found in the business rules catalog is **incomplete**. Section 3 is a reference index — it must point to defined rules, not restate or invent them.

---

### Check 5 — Information Gaps

Review the **Information Gaps** section of the data requirements document.

For every row in the Information Gaps table:
- The Owner column must be populated with a named individual or role — blank is **incomplete**
- The Target Resolution column must be populated with a specific date — blank or "TBD" is **incomplete**

**Definition of resolved:** A gap is resolved when (a) the information it describes is fully documented in the appropriate section of the data requirements document (Section 7, 1, or 2 as applicable), (b) the gap row has been removed from the Information Gaps table, and (c) the BSA has confirmed the resolution — recorded as a reviewer note in the findings list. A gap row that remains in the table with its original description is not resolved, regardless of whether related edits have been made elsewhere in the document.

Any gap whose Target Resolution date has passed and that is not resolved per the definition above must be escalated to the BSA. The review cannot return a PASS verdict while an overdue unresolved gap exists in the document.

If the Information Gaps table is empty, confirm this is intentional — record "Information Gaps: none" as a reviewer note in the findings list.

---

### Check 6 — Spec Reference Coverage

Scan the functional requirements for every information type and information element referenced. For each:
- Find the corresponding information type entry in the data requirements document (Section 7)
- Verify the specific information element is present in the information type's element table

Flag any information type or element referenced in the functional requirements that has no matching entry in the data requirements document. This check operates at the element level — review-completeness may have caught missing information types, but this check catches missing element definitions within otherwise-present information types.

---

## Output

A findings list in this format:

| Finding ID | Check | Information Type | Element | Description | Severity | Recommended Action |
|-----------|-------|-----------------|---------|-------------|---------|-------------------|
| DATA-001 | 1a — New info type elements | Order | Queued timestamp | Required/Conditional column is blank — not stated | High | Define as Required or Conditional with business condition |
| DATA-002 | 3 — Business constraint completeness | Order | Order status | Status element lists Pending, Processing — functional requirements reference Cancelled; not in allowed values | High | Add Cancelled to allowed values and link to BR-030 |
| DATA-003 | 4a — Constraint completeness | Customer | Customer email | BR-014 (unique email per customer) has no reference in element row or Section 3 | High | Add BR-014 reference to email element row and Section 3 |
| DATA-004 | 2 — Relationship completeness | Order line item | Order reference | Relationship to Order noted in element row but absent from Information Relationships section | Medium | Add row: Order line item references Order, one-to-many, linked by Order reference |
| DATA-005 | 1d — Input/output element completeness | Payment details | Card type | Conditional element listed in DI-003 with no business condition stated | Medium | State the condition: "present when payment method is credit card" |
| DATA-006 | 1c — Info type header completeness | Notification record | — | Confirmed field is "Assumed — pending confirmation" | High | BSA to confirm information type definition; update Confirmed to "Stakeholder-confirmed" before handoff |
| DATA-007 | 5 — Information gaps | Audit log | — | Gap row has no Owner and no Target Resolution date | Medium | Assign owner and set resolution date; escalate if overdue |
| DATA-008 | 1c — Info type header completeness | Product catalog | — | Business Purpose in header is blank | Low | Add a one-line business purpose statement describing what this information represents in business terms |
| DATA-009 | 4b — Section 3 row completeness | Customer | Customer email | Section 3 row for email element contains free-text rule description with no BR-xxx identifier | High | Replace free-text with the BR-xxx from the business rules catalog that defines this rule |
| DATA-010 | 6 — Spec reference coverage | Invoice | Due date | Functional requirements reference Invoice due date but no Due date element exists in the Invoice information type in Section 7 | High | Add Due date element to Invoice information type in Section 7 with all required columns populated |

**Severity:**
- **High** — missing definition that will cause implementation ambiguity, an untestable requirement, or a confirmed-status gap that blocks handoff
- **Medium** — incomplete definition that will cause testing gaps, inconsistent implementation, or an unresolved gap without an owner and date
- **Low** — documentation gap with no immediate functional impact; must be acknowledged by the BSA before handoff

**Accepted Medium and Low findings:** A Medium or Low finding may be accepted without resolution only if the BSA explicitly acknowledges it by name (citing the Finding ID) and records a resolution plan — either "fix before implementation begins" or "accepted as known risk: [reason]." Undocumented acceptance does not count. Every accepted finding must appear in the findings list with its acknowledgement recorded.

---

## Verdict

- **PASS** — No High findings. All Medium and Low findings are either resolved or BSA-acknowledged with a named resolution plan.
- **FAIL** — One or more High findings remain unresolved, or one or more Medium or Low findings have no BSA acknowledgement and no resolution plan.

---

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Architect receives a document whose Summary table says three New information types but Section 7 contains five — downstream consumers plan for the wrong scope | Pre-flight check requires Summary table counts to match actual Section 7 information type counts before any other check runs |
| Developer defines an information element as optional because the Required/Conditional column was blank, causing missing-data errors in production | Checks 1a and 1b require the Required/Conditional column to be explicitly populated for every element — New and Existing |
| Existing information type elements reach architect handoff with blank Description or Required columns because the review only checked New information types | Check 1b applies the same completeness standard to Existing information type element rows |
| An information type with no stated business purpose is handed to the architect — who must reverse-engineer the intent from the element names | Check 1c requires Business Purpose to be populated for every information type header |
| Developer invents the condition for a conditional input element during implementation | Check 1d requires every conditional element to state its governing business condition |
| Output has no stated consumer — architect cannot determine the integration target | Check 1d requires the Consumer column to be populated for every DO-xxx row |
| An unconfirmed information type definition reaches architect handoff and is implemented based on assumptions | Check 1c requires Confirmed status to be "Stakeholder-confirmed", "Yes", or the appropriate passing value for every information type — an unconfirmed information type is a High finding |
| A status element grows organically with undocumented values as developers add them | Check 3 forces an exhaustive allowed values list at requirements time |
| A yes/no element has no explicit allowed values — developer assumes True/False, tester assumes 1/0 | Check 3 requires yes/no elements to explicitly list permitted values |
| A business rule constraint is enforced in application logic but not in the information requirements, allowing bad data through direct access | Check 4a ensures every BR-xxx that governs an information element is referenced in the data requirements document |
| Section 3 contains a free-text rule that was never formally defined — developer and tester implement it differently | Check 4b requires every Section 3 row to cite a valid BR-xxx from the catalog |
| An information gap with no owner and no resolution date reaches architect handoff undetected | Check 5 requires every gap row to have a named owner and a resolution date |
| A gap row is left in the Information Gaps table after related edits, with no confirmation it is actually resolved | Check 5 defines resolution as: content documented, row removed, BSA confirmed |
| A relationship is noted in an element row but the cardinality is never formally defined — developer invents the cardinality | Check 2 requires every relationship to appear in the Information Relationships section with type and linking element |
| Functional requirements reference an information element that the architect cannot find in the data requirements | Check 6 ensures every information type and element named in functional requirements resolves to a defined entry |

---

## Hand-off Gate

**Review 7 of 10 — strictly sequential. A FAIL verdict must be resolved before reading the next review skill.**

Before reading `review-traceability.md`, you must:
1. Write the completed findings list in full — every check result with its finding, severity, and recommended action.
2. Record the PASS or FAIL verdict.
3. Present findings and verdict to the BSA for review.
4. If **FAIL**: the BSA resolves all High findings and acknowledges all Medium and Low findings with named resolution plans, then updates the affected artifacts. You then re-run **all checks in full** against the updated artifacts — not only the checks that previously failed, because BSA edits to resolve one finding can introduce gaps in other checks.
5. If **PASS**: receive explicit BSA acknowledgement of the verdict and all accepted findings, then read `review-traceability.md`.

---

## Completion Criteria

**Pre-flight — Summary Table Consistency:**
- [ ] Summary table is present in the data requirements document
- [ ] Existing count in Summary table matches the actual count of Existing information type entries in Section 7
- [ ] Modified count in Summary table matches the actual count of Modified information type entries in Section 7
- [ ] New count in Summary table matches the actual count of New information type entries in Section 7
- [ ] Total equals Existing + Modified + New

**Check 1a — New information type element rows:**
- [ ] Every element in every New information type (Section 7) has Element, Description, Required/Conditional, Business Constraint, Default, Business Rule, Sensitivity, and Relationships all explicitly populated — no blank cells

**Check 1b — Existing information type element rows:**
- [ ] Every element in every Existing information type (Section 7) has Element, Description, Required, Business Constraint, and Sensitivity explicitly populated — no blank cells in these columns

**Check 1c — Information type header completeness:**
- [ ] Every information type entry in Section 7 has Business Purpose populated — not blank, not a placeholder
- [ ] Every information type entry in Section 7 has Confirmed status set to a passing value — "Assumed — pending confirmation" is a High finding

**Check 1d — Input and output information element tables:**
- [ ] Every element in the Required Information and Conditional Information columns of every DI-xxx row has an information element table entry with name, business description, required/conditional status, and business constraint
- [ ] Every element in the Required Information and Conditional Information columns of every DO-xxx row has an information element table entry with name, business description, required/conditional status, and business constraint
- [ ] Every conditional element in Sections 1 and 2 states its governing business condition
- [ ] Every DO-xxx row has a Consumer column populated

**Check 2 — Relationship Completeness:**
- [ ] Every row in the Information Relationships section has Relationship Type and Linked By stated
- [ ] Every element-level relationship (Relationships column populated) has a corresponding row in the Information Relationships section

**Check 3 — Business Constraint Completeness:**
- [ ] Every status, type, category, and yes/no element has an exhaustive allowed values list with a BR-xxx reference or explicit "None"

**Check 4a — Constraint Completeness (Forward):**
- [ ] Every BR-xxx in the business rules catalog that governs an information element is referenced in the data requirements document (element row or Section 3)

**Check 4b — Section 3 Row Completeness (Reverse):**
- [ ] Every row in Section 3 cites a valid BR-xxx that exists in the business rules catalog — no free-text rules, no missing BR-xxx identifiers

**Check 5 — Information Gaps:**
- [ ] Every row in the Information Gaps table has a named Owner and a specific Target Resolution date
- [ ] No overdue unresolved gap exists in the document (resolved = content documented, row removed, BSA confirmed)
- [ ] If the table is empty, "Information Gaps: none" is recorded as a reviewer note

**Check 6 — Spec Reference Coverage:**
- [ ] Every information type and element named in the functional requirements resolves to an entry in the data requirements document

**Output and verdict:**
- [ ] All findings documented with Finding ID, check reference, information type, element, description, severity, and recommended action
- [ ] Every accepted Medium or Low finding has BSA acknowledgement by Finding ID and a named resolution plan recorded
- [ ] Verdict recorded as PASS or FAIL with justification
