# Assumptions, Constraints & Out of Scope

> **Project:** [project name]
> **Change request:** [brief description]
> **Date:** [date]
> **Prepared by:** [name]
> **Analysis artifacts available:** [Yes — carried forward from analysis / No — elicited from user and requirements phase]

---

## Summary

| Category | Count |
|----------|-------|
| Assumptions — Code-verified | |
| Assumptions — Stakeholder-confirmed | |
| Assumptions — Assumed-pending-confirmation | |
| Assumptions — Verification-In-Progress | |
| Assumptions — Verification-Blocked | |
| Constraints — hard | |
| Constraints — soft | |
| Out-of-scope items | |
| Must-not-touch items | |

---

## Part 1: Assumptions

### Assumption Register

| ID | Statement | Category | Source | Impact if Wrong | Verification Status | Verification Plan | Verification Deadline | Owner | Risk Level | Cross-reference | Depends On |
|----|-----------|----------|-------|----------------|--------------------|--------------------|----------------------|-------|------------|----------------|------------|
| ASMP-001 | [assumption] | [System behavior / User behavior / Data / Business rule / Technical] | [activity or artifact that surfaced it] | [what goes wrong] | [Code-verified / Stakeholder-confirmed / Assumed-pending-confirmation / Verification-In-Progress / Verification-Blocked / Verified-False] | [how and when to verify] | [date by which this must be verified] | [name] | [High / Medium / Low] | [CON-xxx if this assumption also generates a constraint — omit if no overlap] | [ASMP-xxx if this assumption is only valid if another assumption holds — omit if standalone] |

**Verification status definitions:**
- **Code-verified** — confirmed by reading the actual codebase, database schema, or configuration
- **Stakeholder-confirmed** — confirmed in a stakeholder session with a named participant
- **Assumed-pending-confirmation** — not yet verified and no verification attempt has been made
- **Verification-In-Progress** — verification has been initiated; owner has begun the confirmation activity
- **Verification-Blocked** — verification cannot proceed; the required artefact, access, or respondent is unavailable
- **Verified-False** — verification was completed and the assumption was found to be incorrect

### High-Risk Assumptions

Assumptions with High risk level that require urgent verification before implementation.

| ID | Statement | Impact if Wrong | Owner | Verification Deadline |
|----|-----------|----------------|-------|----------------------|
| ASMP-xxx | | | | |

*If no high-risk assumptions, write: No high-risk assumptions identified.*

---

## Part 2: Constraints

### Constraint Register

| ID | Category | Description | Hard / Soft | Source | Owner | Consequence of Violation | Affected Requirements | Waiver Path | Cross-reference |
|----|----------|-------------|-------------|--------|-------|--------------------------|-----------------------|-------------|----------------|
| CON-001 | [Technology / Performance / Data / Operational / Contractual / Regulatory / Organizational] | [constraint statement] | [Hard / Soft] | [observed system behaviour / document / stakeholder / derived] | [name] | [what breaks] | [REQ-xxx] | [Hard: N/A / Soft: approval required from...] | [ASMP-xxx if this constraint depends on an unverified assumption — omit if no overlap] |

### Hard Constraints Summary

| ID | Description | Consequence of Violation |
|----|-------------|--------------------------|
| CON-xxx | | |

### Regulatory / Compliance Constraints

| ID | Regulation | Obligation | Triggered By | Review Status |
|----|-----------|------------|--------------|---------------|
| CON-xxx | [GDPR / PCI-DSS / HIPAA / WCAG / other] | [specific obligation] | [requirement or data type] | [Not started / In review / Confirmed] |

---

## Part 3: Out of Scope

### Scope Exclusions

| ID | Description | Rationale | Decision Maker | Risk if Later Needed | Related Requirements | Future Phase |
|----|-------------|-----------|----------------|---------------------|--------------------|-------------|
| OOS-001 | [what is excluded] | [why excluded — must be substantive: deferred to future phase / too risky at this time / resource constraint / dependency not yet resolved] | [who decided — must have organisational authority to commit to scope exclusions] | [rework cost / schedule impact] | [REQ-xxx affected] | [future phase — must reference an active roadmap initiative, or state "No planned initiative — risk accepted by [name]"] |

### Must-Not-Touch Items

Items in the system that must not be modified by this change — distinct from out-of-scope items.

| ID | Description | Rationale | Risk if Violated | Related Requirements |
|----|-------------|-----------|-----------------|---------------------|
| MNT-001 | [what must not be touched] | [why it must be preserved] | [what breaks] | [REQ-xxx that rely on or reference this item] |

---

## Cross-Check Results

Items found during the completeness sweep (Step 5) that were not in the original sources.

| Item | Type | Found In | Action Taken |
|------|------|----------|-------------|
| [description] | [Assumption / Constraint / Scope exclusion / Must-not-touch] | [which requirements activity or artifact] | [Added to register above] |

*If no new items found, write: Cross-check complete — no additional items found.*

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| [date] | Initial draft | |
