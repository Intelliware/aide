---
slug: verify
sequence: 5
depends-on-prior: true
---

# Step: Verify Extracted Documentation Against Source

Run verification checklists against the extracted documentation to ensure accuracy and completeness.

## When to run

Run at the start of Stage 5 (Verification and Finalization) of the parent reverse-engineer-mobile-framework workflow.

## Why verification is non-negotiable

```
Source Code Accuracy → Documentation Accuracy → Downstream Consumer Accuracy
```

Mobile framework verification is critical because consumers integrate against the documented API across multiple platforms — wrong defaults or platform-specific quirks omitted produce real production bugs.

## Inputs

- All extracted documentation (Part A, Part B)
- Access to the source code (per platform)
- The artifact inventory from `extraction-status.md`
- The change-tracker

## Process

### 1. Determine Scope

Confirm full vs. section-scoped verification, and source-code accessibility (per platform).

### 2. Run the Four Universal Checks

**Completeness Check**
- [ ] All inventoried artifacts have corresponding documentation
- [ ] Extraction status tracker shows 100% complete
- [ ] No placeholder/TODO markers remain
- [ ] Both documentation parts are populated

**Accuracy Check**
- [ ] Every documented behavior traced to a specific source location (per platform)
- [ ] Default values match actual code defaults (per platform)
- [ ] Type signatures match actual public API surface (per platform)
- [ ] No "UNVERIFIED" markers remain unresolved

**Consistency Check**
- [ ] No contradictions between Part A and Part B
- [ ] No internal details leaked into Part B
- [ ] Terminology consistent across platforms
- [ ] Cross-references valid

**Change Tracking Check**
- [ ] Every extraction session logged
- [ ] Parts Affected values correct (A / B / Both)
- [ ] Source version recorded
- [ ] Verification status recorded

### 3. Run Domain-Specific Checks (Mobile Framework)

- [ ] **Part B subset rule**: every public API, configuration option, extension point in Part B exists in Part A
- [ ] **Platform support matrix**: every platform listed has documentation; gaps are explicit
- [ ] **Distribution mechanism documented** for every supported platform: AAR (Maven coordinates), CocoaPod (pod name + version constraint), SPM (URL + version), npm (package name + peer deps)
- [ ] **Per-platform code examples**: every public API has at least one working code example per supported platform (Kotlin / Swift / JS)
- [ ] **Configuration option defaults** verified against per-platform source initializers
- [ ] **Platform-specific behavior** explicitly documented when it differs (e.g. permission flow on Android vs. iOS)
- [ ] **Migration guide** verified against actual breaking changes between versions
- [ ] **Testing utilities** documented match actual exports per platform
- [ ] **ABI / API stability** policy documented (especially relevant for AAR / Pods)

### 4. Spot-Check Against Source

For 3-5 representative public APIs, on EACH supported platform:
1. Read the documentation
2. Read the source on that platform
3. Compare every documented method, parameter, default, behavior, code example
4. Flag discrepancies

### 5. Report Results

Produce a verification report (broken out by platform).

### 6. Log Verification

Use `track-change` to record the verification activity.

## Output

- Verification report (per-platform breakdown)
- Corrections list
- Updated change-tracker entries
- GO/NO-GO determination

## Halt conditions

- Halt if source not accessible for any supported platform
- Halt if inventory missing
- NO-GO on unresolved failures (especially Part B ⊄ Part A or missing per-platform examples)

## Common mistakes

- Verifying one platform thoroughly and assuming the others match
- Skipping per-platform code examples
- Not checking distribution-mechanism details against the actual published artifact
- Treating spot-checks as sufficient — every public API needs the four universal checks per platform
