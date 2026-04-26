---
slug: verify
sequence: 5
depends-on-prior: true
---

# Step: Verify Extracted Documentation Against Source

Run verification checklists against the extracted documentation to ensure accuracy and completeness. Verification is non-negotiable — it is the primary defense against AI hallucinating plausible but incorrect documentation.

## When to run

Run this step at the start of Stage 5 (Verification and Finalization) of the parent reverse-engineer-api-framework workflow, after all content extraction has completed and before the change-tracker is finalized.

## Why verification is non-negotiable

```
Source Code Accuracy → Documentation Accuracy → Downstream Consumer Accuracy
     (Truth)              (Extracted Truth)         (Applied Truth)
```

If documentation drifts from source code, every downstream consumer — human and AI — produces incorrect work.

## Inputs

- All extracted documentation (Part A, Part B)
- Access to the source code being documented
- The artifact inventory from `extraction-status.md`
- The change-tracker

## Process

### 1. Determine Scope

Confirm full vs. section-scoped verification, and that source code is accessible.

### 2. Run the Four Universal Checks

**Completeness Check**
- [ ] All inventoried artifacts have corresponding documentation
- [ ] Extraction status tracker shows 100% complete
- [ ] No placeholder/TODO markers remain in finalized sections
- [ ] Both documentation parts are populated

**Accuracy Check**
- [ ] Every documented behavior can be traced to a specific source code location
- [ ] Default values match actual code defaults (not AI-invented plausible ones)
- [ ] Type signatures and schemas are exact, not simplified
- [ ] No "UNVERIFIED" markers remain unresolved

**Consistency Check**
- [ ] No contradictions between Part A and Part B
- [ ] No internal details leaked into Part B
- [ ] Terminology is consistent across both parts
- [ ] Cross-references are valid

**Change Tracking Check**
- [ ] Every extraction session is logged
- [ ] Parts Affected values are correct (A / B / Both)
- [ ] Source version recorded
- [ ] Verification status recorded

### 3. Run Domain-Specific Checks (API Framework)

- [ ] **Part B subset rule**: every component, configuration option, extension point in Part B exists in Part A
- [ ] Request pipeline ordering documented (middleware → guards → pipes → handler → interceptors → exception filters)
- [ ] Every public extension point has a working consumer-side example
- [ ] Configuration option defaults verified against source initializer values
- [ ] DI token registrations and lifetimes verified against source code
- [ ] Migration guide (if any) verified against actual breaking changes between versions
- [ ] Testing utilities documented match actual exported test helpers

### 4. Spot-Check Against Source

For 3-5 representative components/extension points:
1. Read the documentation
2. Read the source code
3. Compare every documented property, method, parameter, default, behavior
4. Flag discrepancies

### 5. Report Results

Produce a verification report (failures, warnings, recommendations).

### 6. Log Verification

Use `track-change` to record the verification activity in the change-tracker.

## Output

- Verification report
- List of corrections made
- Updated change-tracker entries
- GO/NO-GO determination

## Halt conditions

- Halt if source code is not accessible
- Halt if inventory is missing
- NO-GO if any failure remains unresolved (especially Part B ⊄ Part A violations)

## Common mistakes

- Skipping the Part B ⊆ Part A subset check
- Not verifying extension-point documentation against actual public API surface
- Inventing default config values without source confirmation
- Treating spot-checks as sufficient — every artifact needs the four universal checks
