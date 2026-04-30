---
slug: verify
sequence: 6
depends-on-prior: true
---

# Step: Verify Extracted Documentation Against Source

Run verification checklists against the extracted documentation to ensure accuracy and completeness.

## When to run

Run at the start of Stage 6 (Verification and Finalization) of the parent reverse-engineer-cobol-program workflow.

## Why verification is non-negotiable

```
Source Code Accuracy → Documentation Accuracy → Downstream Consumer Accuracy → Lineage Accuracy
```

COBOL program verification is critical because: (a) consumers wire JCL DDs and CICS commareas against the documented contract; (b) the lineage skill consumes the three feed-files and amplifies any error across every "where-used" claim it produces.

## Inputs

- All extracted documentation (Part A, Part B)
- The three mandatory feed-files (`program-call-graph.mmd`, `program-data-bindings.json`, `program-exec-inventory.md`)
- Access to the COBOL source
- The program inventory from `extraction-status.md`
- The change-tracker
- The matched copybook-library Part A (if it exists in this project)

## Process

### 1. Determine Scope

Confirm full vs. program-scoped verification, and source accessibility.

### 2. Run the Four Universal Checks

**Completeness Check**
- [ ] All inventoried programs have corresponding documentation
- [ ] Extraction status tracker shows 100% complete
- [ ] No placeholder/TODO markers remain
- [ ] Both documentation parts are populated
- [ ] All three feed-files exist and are non-empty

**Accuracy Check**
- [ ] Every documented PROGRAM-ID matches the IDENTIFICATION DIVISION
- [ ] Every documented FD ↔ SELECT ↔ DD-name mapping matches FILE-CONTROL
- [ ] Every documented PERFORM target is a real paragraph or section in the same program
- [ ] Every static `CALL 'XYZ'` documents `XYZ` as a candidate in the call graph
- [ ] Every dynamic `CALL` site lists candidate targets and is flagged as unresolved
- [ ] Every `EXEC SQL` host variable is declared in WORKING-STORAGE or LINKAGE
- [ ] No "UNVERIFIED" markers remain unresolved

**Consistency Check**
- [ ] No contradictions between Part A and Part B
- [ ] Part B is a strict subset of Part A
- [ ] No run-book content (operational schedules, ops contacts) leaked into Part A or Part B
- [ ] Terminology consistent across programs
- [ ] Cross-references valid

**Change Tracking Check**
- [ ] Every extraction session logged
- [ ] Parts Affected values correct (A / B / All)
- [ ] Source version recorded
- [ ] Verification status recorded

### 3. Run Domain-Specific Checks (COBOL Program)

- [ ] **Source parity:** every documented division, paragraph, EXEC block, and LINKAGE shape traces to a specific COBOL source line
- [ ] **COPY ... REPLACING resolved:** the in-use record after substitution is documented, not the raw copybook
- [ ] **Execution context correct:** batch / CICS / IMS-MPP / IMS-BMP matches the EXEC blocks observed
- [ ] **EXEC SQL host-vars bound:** every host-var resolves to a WORKING-STORAGE or LINKAGE field
- [ ] **EXEC CICS commareas typed:** every CICS LINK/XCTL with COMMAREA documents the LINKAGE-side layout
- [ ] **EXEC DLI PCBs:** every DLI call references a PCB that appears in the LINKAGE PCB list
- [ ] **GOBACK / STOP RUN:** consistent with execution context (CICS programs use GOBACK or RETURN; batch may use STOP RUN)
- [ ] **Feed-file integrity:**
  - `program-call-graph.mmd` parses as Mermaid; every node corresponds to a documented program
  - `program-data-bindings.json` validates against the schema in INPUTS-OUTPUTS.md
  - `program-exec-inventory.md` lists every EXEC block found in source

### 4. Spot-Check Against Source

For 3-5 representative programs (mix execution contexts):
1. Read the documentation
2. Read the actual COBOL source
3. Compare every documented division, paragraph, EXEC block, LINKAGE shape, and CALL target
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

- Halt if COBOL source is not accessible
- Halt if program inventory is missing
- NO-GO on unresolved failures (especially feed-file schema failures or dynamic-CALL claims that contradict source)

## Common mistakes

- Verifying against a run book or PPT extract instead of the COBOL source
- Failing to resolve `COPY ... REPLACING` before recording the in-use record
- Treating a dynamic CALL as resolved without source evidence
- Missing the feed-file integrity check — lineage downstream amplifies any error here
- Spot-checking only batch programs and skipping CICS / IMS-BMP
