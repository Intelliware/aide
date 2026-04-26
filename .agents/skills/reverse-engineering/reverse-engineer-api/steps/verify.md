---
slug: verify
sequence: 5
depends-on-prior: true
---

# Step: Verify Extracted Documentation Against Source

Run verification checklists against the extracted documentation to ensure accuracy and completeness. Verification is non-negotiable — it is the primary defense against AI hallucinating plausible but incorrect documentation.

## When to run

Run this step at the start of Stage 5 (Verification and Finalization) of the parent reverse-engineer-api workflow, after all content extraction has completed and before the change-tracker is finalized.

## Why verification is non-negotiable

The canonical RE quality chain is:

```
Source Code Accuracy → Documentation Accuracy → Downstream Consumer Accuracy
     (Truth)              (Extracted Truth)         (Applied Truth)
```

If the documentation drifts from source code, every downstream consumer — human and AI — produces incorrect work.

## Inputs

- All extracted documentation (Part A, Part B1, Part B2)
- Access to the source code being documented
- The artifact inventory from `extraction-status.md`
- The change-tracker

## Process

### 1. Determine Scope

Confirm:
- Which documentation parts have been extracted
- Whether this is a full verification or a section-scoped check
- That source code is accessible (verification compares docs against source)

### 2. Run the Four Universal Checks

These apply to ALL extractions, regardless of repo type.

**Completeness Check**
- [ ] All inventoried artifacts have corresponding documentation
- [ ] Extraction status tracker shows 100% complete
- [ ] No placeholder/TODO markers remain in finalized sections
- [ ] All documentation parts are populated (not just Part A)

**Accuracy Check**
- [ ] Every documented behavior can be traced to a specific source code location
- [ ] Default values match actual code defaults (not AI-invented plausible ones)
- [ ] Type signatures and schemas are exact, not simplified
- [ ] Version numbers match actual dependency files
- [ ] No "UNVERIFIED" markers remain unresolved

**Consistency Check**
- [ ] No contradictions between documentation parts (Part A vs Part B)
- [ ] No internal details leaked into consumer-facing parts
- [ ] Terminology is consistent across all parts
- [ ] Cross-references between parts are valid

**Change Tracking Check**
- [ ] Every extraction session is logged in the change-tracker
- [ ] Parts Affected values are correct per the documentation model
- [ ] Source version is recorded for all changes
- [ ] Verification status is recorded for all changes

### 3. Run Domain-Specific Checks (API)

- [ ] Every endpoint in the codebase has an entry in Part B1 (OpenAPI) and Part A
- [ ] Path parameters, query parameters, and request body schemas verified against DTOs
- [ ] Response shapes verified against response DTOs (not entities)
- [ ] Error response codes traced to actual exception throws in handler/service code
- [ ] Authentication/authorization decorators verified against guard implementations
- [ ] OpenAPI spec passes a linter (e.g., spectral) without errors
- [ ] Companion guide (Part B2) covers Getting Started, Auth, Pagination, Error Handling
- [ ] Cross-cutting concerns (rate limits, idempotency) documented if present in code

### 4. Spot-Check Against Source

For a representative sample (at least 3-5 endpoints), do a deep comparison:

1. Read the documentation for the artifact
2. Read the actual source code for the artifact
3. Compare every documented property, method, parameter, default value, and behavior
4. Flag any discrepancies as verification failures
5. Check that error conditions documented actually exist in code paths

### 5. Report Results

Produce a verification report:

```
## Verification Report — <System Name>

**Date:** YYYY-MM-DD
**Scope:** Full / Section: X
**Documentation Version:** <version>

### Summary
- Total checks: <N>
- Passed: <P>
- Failed: <F>
- Warnings: <W>

### Failures
<List each failure: what was wrong, where, recommended fix>

### Warnings
<List each warning: what's concerning and how to investigate>

### Recommendations
<Priority-ordered list of actions>
```

### 6. Log Verification

Use the `track-change` skill (or log manually) to record the verification activity in the change-tracker, including any corrections made as a result.

## Output

- Verification report (passed/failed/warnings broken out by check type)
- List of corrections made during verification
- Updated change-tracker entries reflecting the verification activity
- A GO/NO-GO determination for finalization

## Halt conditions

- Halt if the source code is not accessible — verification requires comparison against source.
- Halt if the inventory is missing — incompleteness cannot be assessed without it.
- NO-GO if any Failure remains unresolved at the end of the report — finalization is blocked.

## Common mistakes

- Treating spot-checks as sufficient — every artifact needs at least the four universal checks
- Skipping the OpenAPI lint — schema-level errors are caught only by tooling
- Not logging verification corrections — change-tracker drift defeats the purpose of the gate
- Marking "UNVERIFIED" entries as passed because they're flagged — they remain failures until verified
