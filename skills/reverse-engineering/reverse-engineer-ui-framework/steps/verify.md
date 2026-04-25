---
slug: verify
sequence: 5
depends-on-prior: true
---

# Step: Verify Extracted Documentation Against Source

Run verification checklists against the extracted documentation to ensure accuracy and completeness.

## When to run

Run at the start of Stage 5 (Verification and Finalization) of the parent reverse-engineer-ui-framework workflow.

## Why verification is non-negotiable

```
Source Code Accuracy → Documentation Accuracy → Downstream Consumer Accuracy
```

If documentation drifts from source code, every downstream consumer produces incorrect work. UI framework verification is especially critical because consumers compose against the documented API — wrong default values produce wrong-looking UIs everywhere.

## Inputs

- All extracted documentation (Part A, Part B)
- Access to the source code
- The artifact inventory from `extraction-status.md`
- The change-tracker

## Process

### 1. Determine Scope

Confirm full vs. section-scoped verification, and source-code accessibility.

### 2. Run the Four Universal Checks

**Completeness Check**
- [ ] All inventoried artifacts have corresponding documentation
- [ ] Extraction status tracker shows 100% complete
- [ ] No placeholder/TODO markers remain
- [ ] Both documentation parts are populated

**Accuracy Check**
- [ ] Every documented behavior traced to a specific source location
- [ ] Default values match actual property initializers
- [ ] Type signatures and prop shapes are exact
- [ ] No "UNVERIFIED" markers remain unresolved

**Consistency Check**
- [ ] No contradictions between Part A and Part B
- [ ] No internal details leaked into Part B
- [ ] Terminology consistent
- [ ] Cross-references valid

**Change Tracking Check**
- [ ] Every extraction session logged
- [ ] Parts Affected values correct (A / B / Both)
- [ ] Source version recorded
- [ ] Verification status recorded

### 3. Run Domain-Specific Checks (UI Framework)

- [ ] **Part B subset rule**: every component, service, directive, pipe, DI token in Part B exists in Part A
- [ ] Every @Input / prop has its **type, default, required-ness** verified against the actual property declaration
- [ ] Every @Output / event has its **payload type** verified against the EventEmitter / callback signature
- [ ] Every public method has its **signature, parameters, return type** verified
- [ ] Content projection slots / children APIs documented match the actual template
- [ ] Design tokens documented match the source token export
- [ ] Theming hooks (CSS custom properties, theme service) verified against actual theming surface
- [ ] Framework philosophy / design intent documented in Part B (consumers need the "why")
- [ ] Testing utilities for consumers documented match actual exports

### 4. Spot-Check Against Source

For 3-5 representative components:
1. Read the documentation
2. Read the actual TS/JS source, template, and styles
3. Compare every documented input, output, prop, default, slot, method
4. Flag discrepancies

### 5. Report Results

Produce a verification report.

### 6. Log Verification

Use `track-change` to record the verification activity.

## Output

- Verification report
- Corrections list
- Updated change-tracker entries
- GO/NO-GO determination

## Halt conditions

- Halt if source not accessible
- Halt if inventory missing
- NO-GO on unresolved failures (especially Part B ⊄ Part A or wrong defaults)

## Common mistakes

- Inventing default values without verifying against property initializers
- Skipping the Part B ⊆ Part A subset check
- Documenting only the public component API without the philosophy
- Treating spot-checks as sufficient — every component needs the four universal checks
