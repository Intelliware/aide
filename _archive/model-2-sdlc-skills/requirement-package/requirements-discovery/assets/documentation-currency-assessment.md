# Documentation Currency Assessment

> **Project:** [project name]
> **Proposed change:** [brief description of the feature or change request]
> **Assessment date:** [date]
> **Prepared by:** [name]

---

## Artifact Inventory

Full list of all documentation found — reviewed and deprioritised.

| # | Artifact Name / Location | Type | Source | Last Updated | Priority |
|---|--------------------------|------|--------|-------------|----------|
| 1 | [name and path or URL] | [requirements specification / architecture decision record / wiki / operations guide / integration guide / data dictionary / decision log / readme / other] | [Discovery (system review) / BSA-provided / Both] | [date or unknown] | [full review / deprioritised] |

---

## Artifact Reviews

One entry per artifact that received a full review. Deprioritised artifacts are listed in the inventory above only.

---

### [Artifact Name]

| Field | Value |
|-------|-------|
| **Location** | [file path or URL] |
| **Type** | [requirements specification / architecture decision record / wiki / operations guide / integration guide / data dictionary / decision log / other] |
| **Last updated** | [date or unknown] |
| **Currency rating** | [Current / Partially stale / Fully stale / Unknown] |

**Currency evidence:**
[Reference the specific claim from the document and the corresponding entry in the capability inventory that supports or contradicts it — e.g., "The integration guide describes the order creation capability as accepting a discount code; the capability inventory lists no discount code parameter for the order creation capability." Do not write "seems current" — cite the document claim and the inventory entry.]

**Key content summary:**
[What decisions or constraints this artifact documents — 2–5 bullet points]
- [decision or constraint]
- [decision or constraint]

**Settled decisions found:**
[Decisions this artifact establishes that must not be revisited without explicit justification. Leave blank if none.]
- [decision — e.g., "All monetary values are stored as whole numbers — no decimal places (ADR-007)"]

**Documented constraints found:**
[Explicit constraints this artifact establishes — performance, security, compatibility, data, operational. Leave blank if none.]
- [constraint — e.g., "Search results must return within 500ms for up to 50,000 records"]

**Contradictions:**
[Where this document conflicts with the capability inventory (document-to-system) or with another document (document-to-document). Leave blank if none. The agent notes these — the BSA determines which source is correct.]
- **Type:** [Documentation-to-system / Documentation-to-documentation] | **This document claims:** [what this document states] → **Conflicts with:** [what the capability inventory shows, or what the other document states] → **Likely explanation:** [stale document / built differently from specification / possible defect]

**Gaps:**
[Topics the document should cover given its scope but does not — especially gaps relevant to the proposed change. Leave blank if none.]
- [gap — e.g., "No error handling specification for the payment notification integration point"]

**Recommendation:** [Use as-is / Use with caveats (cite which sections) / Do not rely on / Needs stakeholder confirmation]

---

*Repeat the artifact review block above for each fully reviewed artifact.*

---

## Consolidated Outputs

### Settled Decisions

Decisions that constrain the solution space for the proposed change. These feed into **constraint-extraction** and must not be reopened without explicit justification.

| # | Decision | Source Artifact | In Capability Inventory? |
|---|----------|----------------|--------------------------|
| 1 | [decision statement] | [artifact name and section] | [Yes / No / Partially] |

### Documented Constraints

Explicit constraints already established by prior documentation. These feed into **constraint-extraction**.

| # | Constraint | Type | Source Artifact | Currency |
|---|-----------|------|----------------|----------|
| 1 | [constraint statement] | [performance / security / compatibility / data / operational / other] | [artifact name and section] | [Current / Partially stale / Unknown] |

### Contradictions and Gaps Requiring Resolution

Items that need resolution before requirements can be safely written. These become targeted questions for stakeholder input.

| # | Type | Description | Suggested Question or Action |
|---|------|-------------|------------------------------|
| 1 | [Documentation-to-system discrepancy / Documentation discrepancy / Gap] | [what is contradicted or missing] | [question to raise with the relevant stakeholder] |

---

## Summary

| Metric | Count |
|--------|-------|
| Total artifacts found | |
| Artifacts fully reviewed | |
| Artifacts deprioritised | |
| Rated Current | |
| Rated Partially stale | |
| Rated Fully stale | |
| Rated Unknown | |
| Settled decisions extracted | |
| Documented constraints extracted | |
| Contradictions flagged | |
| Gaps flagged | |
