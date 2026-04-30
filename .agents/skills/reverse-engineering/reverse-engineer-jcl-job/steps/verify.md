---
slug: verify
sequence: 5
depends-on-prior: true
---

# Step: Verify Extracted Documentation Against Source

Run verification checklists against the extracted documentation to ensure accuracy and completeness.

## When to run

Run at the start of Stage 5 (Verification and Finalization) of the parent reverse-engineer-jcl-job workflow.

## Why verification is non-negotiable

```
Source Code Accuracy → Documentation Accuracy → Downstream Consumer Accuracy → Lineage Accuracy
```

JCL verification is critical because: (a) consumers wire downstream jobs against the documented dataset I/O graph; (b) the lineage skill consumes `dataset-io.json` and amplifies any error across every job→program→dataset chain it produces; (c) GDG generation errors silently destroy data when downstream jobs read the wrong generation.

## Inputs

- All extracted documentation (Part A, Part B)
- The two mandatory feed-files (`job-flow.mmd`, `dataset-io.json`)
- Access to the JCL / PROC / INCLUDE source
- The job inventory from `extraction-status.md`
- The change-tracker
- The matched COBOL program repo's Part A (if it exists in this project) for resolving `EXEC PGM=` claims

## Process

### 1. Determine Scope

Confirm full vs. job-scoped verification, and source accessibility.

### 2. Run the Four Universal Checks

**Completeness Check**
- [ ] All inventoried jobs have corresponding documentation
- [ ] All inventoried PROCs have expansion documentation
- [ ] All inventoried INCLUDE members are resolved or flagged unresolved
- [ ] Extraction status tracker shows 100% complete
- [ ] No placeholder/TODO markers remain
- [ ] Both documentation parts are populated
- [ ] Both feed-files exist and are non-empty

**Accuracy Check**
- [ ] Every documented step matches the JCL source (stepname, EXEC kind, PGM/PROC name)
- [ ] Every documented DD matches source (DDNAME, DSN, DISP, DCB, SPACE)
- [ ] Every PROC override at an EXEC PROC site matches source override syntax
- [ ] Every GDG reference (`+N` / `0` / `-N`) matches source
- [ ] Every condition code (`COND=`, `IF (RC=…)`, `EVEN`, `ONLY`) matches source
- [ ] No "UNVERIFIED" markers remain unresolved

**Consistency Check**
- [ ] No contradictions between Part A and Part B
- [ ] Part B is a strict subset of Part A
- [ ] No ops-internal commentary (paging contacts, Control-M operator notes) leaked into Part B
- [ ] Terminology consistent across jobs
- [ ] Cross-references valid

**Change Tracking Check**
- [ ] Every extraction session logged
- [ ] Parts Affected values correct (A / B / All)
- [ ] Source version recorded
- [ ] Verification status recorded

### 3. Run Domain-Specific Checks (JCL Job)

- [ ] **Source parity:** every documented step, DD, DSN, DISP, GDG ref, COND clause traces to a specific JCL or PROC source line
- [ ] **PROC expansion correct:** for each EXEC PROC site, the resolved view matches the PROC source with overrides applied
- [ ] **INCLUDE chain resolved:** every INCLUDE reference resolves to a member, or is flagged unresolved (no silent dropping)
- [ ] **Symbolic substitution flagged:** every DSN containing `&` is recorded with the symbolic name, not auto-resolved
- [ ] **EXEC PGM= resolves:** when a matched COBOL program repo Part A exists, every PGM name resolves; unresolved PGM names are flagged (utility / vendor program acceptable, mystery program is not)
- [ ] **GDG generations consistent:** when job X writes `GDG(+1)` and job Y reads `GDG(0)`, the predecessor/successor relationship is documented in Part B
- [ ] **Scheduler edges:** when scheduler exports were supplied, every edge appears in Part B; when no exports were supplied, predecessor/successor is marked "derived from GDG / DD coupling, not scheduler-confirmed"
- [ ] **Feed-file integrity:**
  - `job-flow.mmd` parses as Mermaid; every node corresponds to a documented step
  - `dataset-io.json` validates against the schema in INPUTS-OUTPUTS.md

### 4. Spot-Check Against Source

For 5-7 representative jobs (mix of: simple PGM-only, PROC-heavy, IDCAMS-driven, SORT-driven, DB2-utility-driven, GDG-rolling):
1. Read the documentation
2. Read the actual JCL source (and any PROC / INCLUDE sources it pulls in)
3. Compare every step, DD, DSN, DISP, GDG ref, override, and COND clause
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

- Halt if JCL source is not accessible
- Halt if job inventory is missing
- NO-GO on unresolved failures (especially feed-file schema failures, unresolved INCLUDE chains, or GDG generation mismatches)

## Common mistakes

- Verifying against a Control-M flow export instead of the JCL source
- Treating PROC expansion as optional — every PROC EXEC site must show the resolved view
- Auto-resolving symbolic DSNs (`&LYY` etc.) instead of flagging them
- Missing GDG generation roll between predecessor / successor jobs
- Skipping INCLUDE-chain resolution
- Spot-checking only the simple PGM-only jobs and skipping PROC / IDCAMS / SORT / DB2-utility cases
