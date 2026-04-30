# reverse-engineer-cobol-program — Worked Example

## Scenario

User has a billing-mainframe repo at `~/code/billing-mainframe/COBOL/` with 142 Enterprise COBOL programs on z/OS — a mix of batch (BILLPROC, BILLPOST, BILLREPT), CICS online (BILLINQ, BILLUPD), and one IMS-BMP program (BILLEXTR). Programs use copybooks from `../COPYBOOK/`, embed EXEC SQL against DB2, and EXEC CICS in the online programs.

Prior step: `reverse-engineer-copybook-library` has already produced the canonical record graph for `../COPYBOOK/`.

User says: *"Document the COBOL programs at ~/code/billing-mainframe/COBOL."*

## Stage 1 — Discovery and Inventory

```
Programs: 142
  Batch:       97 (PROCEDURE DIVISION, no EXEC CICS, optional EXEC SQL)
  CICS online: 41 (EXEC CICS RETURN, COMMAREA-driven entry)
  IMS-BMP:      4 (EXEC DLI, PCB list in LINKAGE)
Copybooks referenced (via COPY): 287 distinct
Programs with EXEC SQL:  73
Programs with EXEC CICS: 41
Programs with EXEC DLI:   4
Static CALL targets: 312 distinct (resolved to programs in this repo: 287; external: 25)
Dynamic CALL sites: 18 (must list candidate targets per site)
```

`steps/scaffold.md` proposes Part A as a tree under `docs/cobol-program-internal/` and Part B as a tree under the KB at `source-docs/billing-cobol/cobol-program-consumer/`. User approves.

## Stage 2 — Identification, Environment, Data Divisions

For BILLPROC (representative batch program):

```
PROGRAM-ID: BILLPROC
SOURCE-COMPUTER: IBM-SYSTEM-Z (WITH DEBUGGING MODE)
FILE-CONTROL:
  SELECT CUST-FILE  ASSIGN TO CUSTDD ORGANIZATION SEQUENTIAL.
  SELECT BILL-FILE  ASSIGN TO BILLDD ORGANIZATION SEQUENTIAL.
  SELECT ERR-FILE   ASSIGN TO ERRDD  ORGANIZATION SEQUENTIAL.
DATA DIVISION:
  FD CUST-FILE.    01 CUST-RECORD COPY CUSTREC.
  FD BILL-FILE.    01 BILL-RECORD COPY BILLREC.
  FD ERR-FILE.     01 ERR-RECORD  COPY ERRREC.
  WORKING-STORAGE:
    01 WS-COUNTERS COPY WSCNTRS.
    01 WS-CALC.    05 WS-AMOUNT  PIC S9(9)V99 COMP-3.
                   05 WS-CURRENCY PIC X(3).
  LINKAGE:        (empty — batch program, no LINKAGE)
COPY statements: 5
  COPY CUSTREC                                — FD CUST-FILE
  COPY BILLREC                                — FD BILL-FILE
  COPY ERRREC                                 — FD ERR-FILE
  COPY WSCNTRS                                — WS counters
  COPY DB2-SQLCA                              — SQL communication area
```

## Stage 3 — Procedure Division and Control Flow

For BILLPROC:

```
PARAGRAPHS / SECTIONS:
  0000-MAINLINE
    PERFORM 1000-INIT
    PERFORM 2000-PROCESS UNTIL EOF-CUST
    PERFORM 9000-TERM
    GOBACK
  1000-INIT     OPEN INPUT  CUST-FILE; OPEN OUTPUT BILL-FILE, ERR-FILE
                EXEC SQL CONNECT TO BILLDB END-EXEC
  2000-PROCESS  READ CUST-FILE; PERFORM 2100-CALC; WRITE BILL-RECORD
  2100-CALC     CALL 'BILLCALC' USING CUST-RECORD WS-CALC
                EXEC SQL SELECT TAX_RATE INTO :WS-TAX FROM TAX_TABLE WHERE ... END-EXEC
  9000-TERM     CLOSE all files; EXEC SQL COMMIT WORK END-EXEC

PERFORM graph: 0000 → {1000, 2000, 9000}; 2000 → 2100
CALL graph:    BILLPROC → BILLCALC (static)
EXEC SQL:      2 statements (CONNECT, SELECT, plus COMMIT)
EXEC CICS:     none
EXEC DLI:      none
```

## Stage 4 — Cross-Cutting Concerns and Bindings

```
File / FD bindings:
  CUST-FILE   ASSIGN CUSTDD  ← CUSTREC copybook
  BILL-FILE   ASSIGN BILLDD  ← BILLREC copybook
  ERR-FILE    ASSIGN ERRDD   ← ERRREC copybook

Subprogram graph:
  BILLPROC → BILLCALC (LINKAGE: 01 LK-CUST-RECORD COPY CUSTREC.
                                01 LK-CALC-AREA   COPY CALCAREA.)

Runtime considerations:
  - TAX_TABLE SELECT inside 2100-CALC runs once per customer; consider cursor or pre-fetch
  - WS-AMOUNT is COMP-3; verify packed-decimal alignment in BILLCALC LINKAGE
```

## Stage 5 — Consumer Documentation

For BILLPROC:

```
Invocation: batch via JCL.
Expected DDs:
  CUSTDD  — DSN=PROD.CUSTOMER.MASTER  DISP=SHR
  BILLDD  — DSN=PROD.BILLING.OUTPUT(+1)  DISP=(NEW,CATLG,DELETE)
  ERRDD   — DSN=PROD.BILLING.ERR(+1)     DISP=(NEW,CATLG,DELETE)
  STEPLIB — load library containing BILLCALC and the COBOL run-time
External side effects:
  - Reads CUSTDD; writes BILLDD and ERRDD
  - DB2 connect to BILLDB; reads TAX_TABLE; commits at end
Called subprograms: BILLCALC (LINKAGE shape above)
Error / abend contract:
  - File-status checks → write to ERRDD; non-zero RC if errors > threshold
  - SQLCODE -805 → ABEND U4038 (DBRM not bound; ops fix)
```

## Stage 6 — Verification and Finalization

`steps/verify.md`:

- Completeness: 142/142 programs documented. Pass.
- Accuracy: spot-checked 5 batch + 3 CICS + 1 IMS-BMP. 1 failure — BILLREPT documented as having `EXEC SQL`, but actual source has only `EXEC CICS` (READ from VSAM via FCT). Corrected.
- Consistency: no run-book content leaked into Part A; no DB2 admin commentary leaked into Part B.
- Feed-files:
  - `program-call-graph.mmd` — 142 nodes, 312 static edges, 18 dynamic edges (unbound). Pass.
  - `program-data-bindings.json` — 142 entries; every entry's copybook list cross-checks against the copybook-library Part A. Pass.
  - `program-exec-inventory.md` — 73 SQL + 41 CICS + 4 DLI blocks. Pass.

Verification report: 1 failure, 0 warnings. GO after correction.

## Outputs

```
~/code/billing-mainframe/COBOL/docs/cobol-program-internal/
  ├── 01-program-inventory.md
  ├── 02-identification-and-environment.md
  ├── 03-file-control-and-fd-bindings.md
  ├── 04-working-storage-and-linkage.md
  ├── 05-copy-statements-and-replacing-rules.md
  ├── 06-paragraph-and-section-graph.md
  ├── 07-call-and-perform-graph.md
  ├── 08-exec-cics-inventory.md
  ├── 09-exec-sql-inventory.md
  ├── 10-exec-dli-inventory.md
  ├── 11-error-handling-and-abend-codes.md
  ├── 12-performance-and-runtime-considerations.md
  ├── 13-naming-conventions.md
  ├── 14-anti-patterns-and-pitfalls.md
  ├── 15-faq-and-troubleshooting.md
  ├── 16-code-examples.md
  ├── program-call-graph.mmd
  ├── program-data-bindings.json
  ├── program-exec-inventory.md
  ├── extraction-status.md
  └── CHANGE-TRACKER.md

<KB>/source-docs/billing-cobol/cobol-program-consumer/
  ├── 01-how-to-invoke-this-program.md
  ├── 02-expected-dd-bindings.md
  ├── 03-commarea-and-linkage-contract.md
  ├── 04-called-subprograms-and-side-effects.md
  ├── 05-error-and-abend-contract.md
  └── 06-integration-examples.md
```

## Hand-off

> "Reverse-engineering of billing-cobol is complete. Next, run `reverse-engineer-jcl-job` for the JCL repo, then `build-mainframe-data-lineage` to aggregate copybook + program + JCL Part A into cross-program field-level traceability."
