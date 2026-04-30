---
slug: verify
sequence: 5
depends-on-prior: true
---

# Step: Verify Extracted Documentation Against Source

Run verification checklists against the extracted documentation to ensure accuracy and completeness.

## When to run

Run at the start of Stage 5 (Verification and Finalization) of the parent reverse-engineer-copybook-library workflow.

## Why verification is non-negotiable

```
Source Code Accuracy → Documentation Accuracy → Downstream Consumer Accuracy → Lineage Accuracy
```

Copybook verification is critical because: (a) every consuming COBOL program reads field offsets and types from the canonical record graph; (b) the lineage skill amplifies any error across every "where-used" claim it produces; (c) packed-decimal (`COMP-3`) vs. display (`DISPLAY`) errors silently corrupt data when programs MOVE across mismatched fields.

## Inputs

- All extracted documentation (Part A, Part B)
- The three mandatory feed-files (`copybook-record-graph.json`, `data-dictionary.md`, `copybook-conflicts.md`)
- Access to the .cpy source files
- The copybook inventory from `extraction-status.md`
- The change-tracker

## Process

### 1. Determine Scope

Confirm full vs. bucket-scoped verification, and source accessibility.

### 2. Run the Four Universal Checks

**Completeness Check**
- [ ] All inventoried copybooks have corresponding documentation
- [ ] Extraction status tracker shows 100% complete
- [ ] No placeholder/TODO markers remain
- [ ] Both documentation parts are populated
- [ ] All three feed-files exist and are non-empty

**Accuracy Check**
- [ ] Every documented level number matches source
- [ ] Every documented PIC clause matches source byte-for-byte
- [ ] Every documented USAGE matches source (DISPLAY vs. COMP / COMP-3 / COMP-4 / BINARY / NATIONAL)
- [ ] Every REDEFINES variant matches the source REDEFINES target
- [ ] Every OCCURS clause matches source, including DEPENDING ON controlling field
- [ ] Every level-88 condition name and VALUE matches source
- [ ] No "UNVERIFIED" markers remain unresolved

**Consistency Check**
- [ ] No contradictions between Part A and Part B
- [ ] Part B is a strict subset of Part A
- [ ] No copybook-maintainer-internal commentary leaked into Part B
- [ ] Terminology consistent across naming-convention buckets
- [ ] Cross-references valid

**Change Tracking Check**
- [ ] Every extraction session logged
- [ ] Parts Affected values correct (A / B / All)
- [ ] Source version recorded
- [ ] Verification status recorded

### 3. Run Domain-Specific Checks (Copybook Library)

- [ ] **Source parity:** every documented level, PIC, USAGE, REDEFINES, OCCURS, FILLER, VALUE, level-88 traces to a specific .cpy source line
- [ ] **REDEFINES named:** every variant has an explicit name (no anonymous "Variant 2" or "alternative")
- [ ] **OCCURS DEPENDING ON expanded:** every variable-occurrence clause documents the controlling field and the canonical max-occurrence expansion
- [ ] **Naming-convention buckets cover all copybooks:** any copybook not in a bucket is flagged for user review (no "uncategorised" silent bucket)
- [ ] **Divergent layouts:** every same-name-different-content pair is in `copybook-conflicts.md`, with classification (legitimate variant vs. drift)
- [ ] **Deprecated copybooks:** every deprecated copybook is flagged in Part A and excluded from "use this copybook for X" guidance
- [ ] **Canonical record graph:**
  - JSON validates against the schema in INPUTS-OUTPUTS.md
  - Every variant marked `redefines-of` references a sibling variant in the same record
  - Every level-88 references an elementary item in the same variant
  - Every OCCURS-DEPENDING-ON declares both the controlling field and the canonical expansion

### 4. Spot-Check Against Source

For 12-15 representative copybooks (mix all naming-convention buckets):
1. Read the documentation
2. Read the actual .cpy source
3. Compare every level, PIC, USAGE, REDEFINES, OCCURS, FILLER, VALUE, level-88
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

- Halt if .cpy source is not accessible
- Halt if copybook inventory is missing
- NO-GO on unresolved failures (especially canonical-record-graph schema failures or unnamed REDEFINES variants — these silently break downstream lineage)

## Common mistakes

- Verifying against an existing Word/Excel data dictionary instead of the .cpy source
- Treating REDEFINES variants as a single record
- Skipping OCCURS DEPENDING ON expansion
- Failing to surface divergent layouts (silent drift is the highest-impact failure mode)
- Spot-checking only the IO- bucket and skipping DB2-/IMS-/CICS- buckets
