---
name: verify-extraction
description: >
  Run verification checklists against extracted documentation to ensure accuracy and completeness.
  Use this skill whenever the user says "verify the documentation", "check the extraction", "run the
  verification checklist", "validate the docs", "is the documentation complete", "audit the extracted
  docs", or after completing a documentation extraction session. Also trigger when the user wants to
  confirm that extracted documentation accurately reflects source code before finalizing. This skill
  catches AI hallucinations, missing artifacts, and cross-part inconsistencies.
---

# Verify Extraction

You are helping a user verify that extracted documentation accurately reflects the source code and
meets the framework's quality standards. Verification is non-negotiable — it is the primary defense
against AI hallucinating plausible but incorrect documentation.

## Before You Start

1. Read `phases/canonical-reverse-engineering-shape.md` § Core AI Principles, especially Principle 5 (Verification is Non-Negotiable)
2. Identify which phase document applies and read its Quick Reference Checklist section
3. Identify the documentation parts that need verification (Part A, Part B, etc.)

## Step 1: Determine Scope

Ask the user:

- **Which repository/system** are we verifying?
- **Which documentation parts** have been extracted? (Part A, Part B, etc.)
- **Full verification or specific section?** (entire extraction vs. a single feature/module)
- **Is source code accessible?** (verification requires comparing docs against source)

## Step 2: Run Common Verification Checks

These apply to ALL repository types:

### Completeness Check
- [ ] All inventoried artifacts have corresponding documentation
- [ ] Extraction status tracker shows 100% complete
- [ ] No placeholder/TODO markers remain in finalized sections
- [ ] All documentation parts are populated (not just Part A)

### Accuracy Check
- [ ] Every documented behavior can be traced to a specific source code location
- [ ] Default values match actual code defaults (not AI-invented plausible ones)
- [ ] Type signatures and schemas are exact, not simplified
- [ ] Version numbers match actual dependency files
- [ ] No "UNVERIFIED" markers remain unresolved

### Consistency Check
- [ ] No contradictions between documentation parts (Part A vs Part B)
- [ ] No internal details leaked into consumer-facing parts
- [ ] Terminology is consistent across all parts
- [ ] Cross-references between parts are valid

### Change Tracking Check
- [ ] Every extraction session is logged in the Change Tracker
- [ ] Parts Affected values are correct per the phase document
- [ ] Source version is recorded for all changes
- [ ] Verification status is recorded for all changes

## Step 3: Run Domain-Specific Checks

Read the relevant phase document's Quick Reference Checklist for domain-specific items:

| Repository Type | Phase Document | Key Domain Checks |
| --- | --- | --- |
| API | `phases/reverse-engineer-api-phase.md` | Endpoint extraction, OpenAPI spec quality, companion guide completeness |
| UI Framework | `phases/reverse-engineer-ui-framework-phase.md` | Component extraction, service extraction, Part A/B subset rule |
| Web App | `phases/reverse-engineer-web-app-phase.md` | Route verification, component hierarchy, API consumption accuracy |
| API Framework | `phases/reverse-engineer-api-framework-phase.md` | Extension point documentation, middleware pipeline, DI patterns |
| Database | `phases/reverse-engineer-database-phase.md` | Per-entity checks, per-procedure checks, FK/constraint verification |
| Mobile App | `phases/reverse-engineer-mobile-app-phase.md` | Platform-specific checks, lifecycle documentation, deep linking |
| Mobile Framework | `phases/reverse-engineer-mobile-framework-phase.md` | Platform-specific APIs, distribution mechanism, integration testing |

## Step 4: Spot-Check Against Source Code

For a representative sample (at least 3-5 artifacts), do a deep comparison:

1. Read the documentation for the artifact
2. Read the actual source code for the artifact
3. Compare every documented property, method, parameter, default value, and behavior
4. Flag any discrepancies as verification failures
5. Check that error conditions documented actually exist in code paths

## Step 5: Report Results

Present a verification report:

```
## Verification Report — [System Name]

**Date:** YYYY-MM-DD
**Scope:** [Full / Section: X]
**Documentation Version:** [version]

### Summary
- Total checks: [N]
- Passed: [P]
- Failed: [F]
- Warnings: [W]

### Failures
[List each failure with: what was wrong, where, and recommended fix]

### Warnings
[List each warning with: what's concerning and how to investigate]

### Recommendations
[Priority-ordered list of actions to take]
```

## Step 6: Log Verification

After verification is complete, use the `track-change` skill (or log manually) to record the verification activity in the Change Tracker, including any corrections made as a result.
