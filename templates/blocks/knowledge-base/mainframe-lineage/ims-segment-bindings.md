---
slug: ims-segment-bindings
title: "IMS Segment Bindings"
applies-to: [kb-mainframe-data-lineage]
requires-decision-from: [code-reader]
optional: false
order-hint: 170
---

## 7. IMS Segment Bindings

For every `EXEC DLI` block in any contributing program, map segment-IO areas back to copybook fields and forward to IMS DBD segments.

### 7.1 Per-EXEC-DLI Section

For each EXEC DLI block, render:

```
### [PROGRAM].[SECTION]  (verb=[GU/GN/GHU/REPL/DLET/ISRT/CHKP])
Source lines: [PROGRAM.cbl:N-M]
PCB: [CUST-PCB] (LINKAGE PCB index N; sensitive segments [list])

Statement:
  EXEC DLI GU
       SEGMENT(CUSTSEG)
       INTO(CUST-IO-AREA)
       WHERE(CUST-ID = :WS-CUST-ID)
       USING PCB(CUST-PCB)
  END-EXEC

Segment binding:
  IMS segment: CUSTSEG (DBD: CUSTDB)
  IO-AREA:     CUST-IO-AREA (WORKING-STORAGE 01-level, COPY IMS-CUSTSEG)
  Canonical record: IMS-CUSTSEG.CUST-RECORD
  Sensitivity check: PCB CUST-PCB is sensitive to CUSTSEG  ✓

Where-clause host vars:
  :WS-CUST-ID → WORKING-STORAGE WS-CUST-ID (PIC 9(10))
```

### 7.2 PCB List Mapping

For each program, summarise the LINKAGE PCB list and which segments each PCB handles:

```
Program: BILLEXTR
  PCB index 1: CUST-PCB (DB)   sensitive: CUSTSEG, ADDRSEG    options: GO/GP/GU/IS
  PCB index 2: IO-PCB  (TP)    n/a
```

Sensitivity violations (a program executes a DLI verb against a segment its PCB is not sensitive to) are flagged in `09-unbound-and-flagged-items.md` § 2.

### 7.3 PCB Status Code Routing

For each program, summarise the post-DLI status code handling. Detail lives in the cobol-program Part A's `error-handling-and-abend-codes` block.

### 7.4 Unresolved Segments

`EXEC DLI` segments whose corresponding `IMS-*` copybook is not in the matched copybook library are flagged in `09-unbound-and-flagged-items.md` § 2 (with the candidate copybook name, since IMS- prefix + segment name is the convention).

### 7.5 BMP-Specific Considerations

For batch message-processing programs (BMP), document:
- Checkpoint frequency (`CHKP` calls)
- Restart behaviour (link back to the program's `error-handling-and-abend-codes` block)
- IMS-DB only vs. IMS-DB + IMS-DC mode

### 7.6 IMS-DC vs. IMS-DB

If a program performs both database access (IMS-DB) and message handling (IMS-DC), document each PCB's role separately. The segment-binding view in this section is IMS-DB; IMS-DC message bindings appear in `06-db2-host-variable-bindings.md`'s pattern (substituting "IMS-DC message" for "DB2 column" semantically) — or, if numerous, are split into a future block.
