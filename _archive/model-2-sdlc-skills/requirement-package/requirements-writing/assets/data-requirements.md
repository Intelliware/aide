# Data Requirements

> **Project:** [project name]
> **Change request:** [brief description]
> **Date:** [date]

---

## Summary

| Status | Information Type Count |
|--------|----------------------|
| Existing (unchanged, in scope) | |
| Modified | |
| New | |
| **Total** | |

---

## Section 1 — Information Inputs

What business information the feature consumes, from where, and its sensitivity classification. Grouped by feature flow.

### [Flow Name] Inputs

| Input ID | Trigger Event | Source | Information Type | Required Information | Conditional Information & Business Conditions | Sensitivity | Business Rules | Dependency Ref |
|----------|--------------|-------|-----------------|---------------------|-----------------------------------------------|-------------|---------------|----------------|
| DI-001 | [business event or user action] | [External system / existing system / user entry] | [plain-English name for the information] | [list of required information elements] | [element: business condition that governs its inclusion] | [PII / PCI / PHI / commercially sensitive / internal-only / public] | [BR-xxx] | [DEP-xxx or "undocumented dependency — flagged to BSA"] |

**Information Elements — [Information Type Name]**

| Element | Business Description | Required / Conditional | Business Constraint | Sensitivity |
|---------|---------------------|----------------------|--------------------| ------------|
| [plain-English element name] | [what this information represents in business terms] | [Required — feature cannot proceed without this / Conditional — present when (business condition)] | [BR-xxx reference or "No constraint"] | [PII / internal-only / public / etc.] |

---

## Section 2 — Information Outputs

What business information the feature produces or returns, on both success and failure paths. Grouped by feature flow. Document each path separately — do not collapse success and failure into one row.

### [Flow Name] Outputs

| Output ID | Trigger Event | Output Path | Destination | Information Type | Required Information | Conditional Information & Business Conditions | Sensitivity | Consumer | Business Rules | Dependency Ref |
|-----------|--------------|------------|-------------|-----------------|---------------------|-----------------------------------------------|-------------|----------|---------------|----------------|
| DO-001-S | [business action that produces the output] | **Success** | [External system / system store / screen] | [plain-English name] | [list of required information elements] | [element: business condition] | [PII / PCI / PHI / internally sensitive / public] | [External system / end user / operations / downstream process] | [BR-xxx] | [DEP-xxx or omit for wholly new information types] |
| DO-001-F | [same action] | **Failure** | [error destination] | [plain-English name for the failure information] | [list of required information elements] | [element: business condition] | [classification] | [who receives the failure information] | [BR-xxx] | [DEP-xxx or omit] |

**Information Elements — [Information Type Name]**

| Element | Business Description | Required / Conditional | Business Constraint | Sensitivity |
|---------|---------------------|----------------------|--------------------| ------------|
| [plain-English element name] | [what this information represents in business terms] | [Required / Conditional — present when (business condition)] | [BR-xxx reference or "No constraint"] | [PII / internal-only / public / etc.] |

---

## Section 3 — Information Validation Rules

Consolidated reference to business rules that govern information inputs and outputs. References — does not duplicate — the business rules catalog.

| Information Element | Applies To | Business Rule | Required Business Outcome on Violation | Summary |
|--------------------|-----------|--------------|---------------------------------------|---------|
| [plain-English element name] | [DI-xxx / DO-xxx] | [BR-xxx] | [what the business requires when the constraint is violated — e.g., the user is prevented from proceeding and shown a specific message; the operation is rejected; an alternative path is offered] | [one-line summary of what the rule enforces] |

---

## Section 4 — Retention Requirements

How long each information type the feature creates or writes to must be kept, and what happens when the retention period expires.

| Information Type | Retention Period | Expiry Action | Source | Confirmed By |
|-----------------|-----------------|---------------|--------|-------------|
| [information type name] | [period — e.g., 7 years] | [Archive / Purge / Anonymise] | [constraint register entry / stakeholder confirmation] | [stakeholder name and date, or "No retention policy — confirmed by [name] on [date]"] |

---

## Section 5 — QE-Oriented Examples

For every information element that carries a business constraint: at least one boundary value example and at least one rejection example, described in business terms. These are requirements, not test cases.

| Information Element | Information Type | Boundary Value Example | Rejection Value Example | Rejection Reason | Required Business Outcome on Rejection |
|--------------------|-----------------|----------------------|------------------------|-----------------|--------------------------------------|
| [plain-English element name] | [DI-xxx / DO-xxx] | [value at the boundary of what is permitted, in business terms — e.g., "Funding amount = $3,000 when the configured limit is $3,000"] | [value that must be rejected, in business terms — e.g., "Funding amount = $3,000.01 when the configured limit is $3,000"] | [business reason — which constraint is violated, referencing BR-xxx] | [what the user sees or what the business process does — e.g., "User is shown the limit message and cannot proceed"] |

---

## Section 6 — Acceptance Criteria

Information requirement acceptance criteria in Given/When/Then format. Each AC verifies a specific information requirement — input acceptance, input rejection, output content, or information type creation.

### Information Input Acceptance Criteria

```
AC-DATA-NNN-1: [Short description — valid information accepted]
Given: [A business event with correctly formed information — describe in business terms]
When:  [The business operation is performed]
Then:  [The system accepts the information — state the observable business outcome: user proceeds, record is created, confirmation is shown]
```

```
AC-DATA-NNN-2: [Short description — invalid information rejected]
Given: [A business event with information that does not meet business requirements — describe what is wrong in business terms]
When:  [The business operation is attempted]
Then:  [The system rejects the information — state the business outcome: user is prevented from proceeding, a specific message is shown, an alternative is offered]
```

### Information Output Acceptance Criteria

```
AC-DATA-NNN-3: [Short description — success-path output]
Given: [The triggering business action completes successfully]
When:  [The output is produced]
Then:  [The output contains all required information and is delivered to the stated destination — describe in business terms]
```

```
AC-DATA-NNN-4: [Short description — failure-path output]
Given: [The triggering business action fails — specific failure condition in business terms]
When:  [The failure output is produced]
Then:  [The failure information is delivered to the stated destination with the required content — describe in business terms]
```

### New Information Type Acceptance Criteria

```
AC-DATA-NNN-5: [Short description — information type created with all required information]
Given: [All required information is provided with valid values]
When:  [The creation operation is performed]
Then:  [The information is recorded with all required elements as specified, sensitivity classification applied]

AC-DATA-NNN-6: [Short description — information type creation rejected when required information is missing]
Given: [A required piece of information is absent]
When:  [The creation operation is attempted]
Then:  [The system rejects the creation — state the required business outcome]
```

*If no new information types are introduced by this feature, write: No new information type acceptance criteria — this feature introduces no new business information.*

---

## Section 7 — Impact to Existing Business Information

### Information Type: [Name] — *Existing (unchanged)*

> **Status:** Existing — unchanged by this feature, referenced as a dependency
> **Business purpose:** [what this information represents]
> **Confirmed:** Yes

| Element | Description | Required | Business Constraint | Sensitivity | Notes |
|---------|------------|----------|--------------------| ------------|-------|
| [plain-English name] | [what it represents] | [Yes/No] | [BR-xxx or constraint description] | [PII / internal / public] | |

**Used by:** [list capabilities, screens, or processes that use this information]

---

### Information Type: [Name] — *Modified*

> **Status:** Modified — existing information with changes introduced by this feature
> **Business purpose:** [what this information represents]
> **Confirmed:** Current state confirmed / proposed changes stakeholder-confirmed

#### Current State

| Element | Description | Required | Business Constraint | Sensitivity |
|---------|------------|----------|--------------------| ------------|
| [plain-English name] | [what it represents today] | [Yes/No] | [current constraint] | [PII / internal / public] |

#### Proposed Changes

| Element | Change Type | Before | After | Business Rule | Sensitivity | Risk Reference |
|---------|------------|--------|-------|--------------|-------------|----------|
| [plain-English name] | Added / Modified / Removed | [prior description or N/A] | [new description] | [BR-xxx] | [classification] | [RISK-xxx or none] |

**Migration determination:** [Explicit statement of whether existing records require migration to conform to the new information requirements. "No migration required" must be stated explicitly if applicable.]

**Downstream areas at risk:** [list capabilities, screens, or processes that may be affected — from impact analysis where available; if sourced from stakeholder consultation, label as "sourced from stakeholder consultation — potentially incomplete"]

---

### Information Type: [Name] — *New*

> **Status:** New — introduced by this feature
> **Business purpose:** [what this information represents]
> **Confirmed:** Stakeholder-confirmed / Assumed — pending confirmation

| Element | Description | Required / Conditional | Business Constraint | Default | Business Rule | Sensitivity | Relationships |
|---------|------------|----------------------|--------------------| --------|--------------|-------------|--------------|
| [plain-English name] | [what it represents] | [Required / Conditional — when (condition)] | [constraint in business terms] | [default if any] | [BR-xxx] | [PII / internal / public] | [ref] |

**Downstream consumers:** [list — from impact analysis if available; if from stakeholder consultation, label as "sourced from stakeholder consultation — potentially incomplete — recorded as a risk"]

**Integration points:** [DEP-xxx entries from dependency map this information type connects to, or "none"]

---

## Information Relationships

| From | Relationship | To | Relationship Type | Linked By |
|------------|-------------|---------|-------------|-----|
| [Information Type A] | references | [Information Type B] | one-to-many | [plain-English element name] |

---

## Information Gaps

Information types or requirements that could not be fully documented.

| Information Type | Gap Description | Owner | Target Resolution |
|------------------|----------------|-------|-----------------|
| [name] | [what is unknown] | | |
