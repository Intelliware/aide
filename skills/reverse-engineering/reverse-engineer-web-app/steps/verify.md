---
slug: verify
sequence: 5
depends-on-prior: true
---

# Step: Verify Extracted Documentation Against Source

Run verification checklists against the extracted documentation to ensure accuracy and completeness.

## When to run

Run at the start of Stage 5 (Verification and Finalization) of the parent reverse-engineer-web-app workflow.

## Why verification is non-negotiable

```
Source Code Accuracy → Documentation Accuracy → Downstream Consumer Accuracy
```

If documentation drifts from source code, every downstream consumer produces incorrect work.

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
- [ ] Default values match actual code defaults
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

### 3. Run Domain-Specific Checks (Web App)

- [ ] Every route in the router config has documentation in Part A
- [ ] Route guards / auth boundaries verified against source
- [ ] State management shape (e.g. Redux slices, Pinia stores, Angular services) verified against source definitions
- [ ] API integration layer documented with actual endpoint URLs and request shapes (verified against the API service module, not invented)
- [ ] Cross-cutting concerns (i18n strategy, a11y testing, perf budgets, security CSP) documented with actual values
- [ ] Build tooling configuration (vite/webpack/angular.json) documented with real settings
- [ ] Deployment shape (CDN, edge, SSR? CSR?) documented in Part B for integrators

### 4. Spot-Check Against Source

For 3-5 representative features:
1. Read the documentation
2. Read the actual source (route + component + state + API call)
3. Compare every documented prop, state field, API URL, behavior
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
- NO-GO on unresolved failures

## Common mistakes

- Verifying components in isolation without checking the data-flow chain
- Trusting JSX/template literal content without checking the actual source values
- Skipping the build-tooling and deployment-shape checks (Part B integrators need them)
- Treating spot-checks as sufficient
