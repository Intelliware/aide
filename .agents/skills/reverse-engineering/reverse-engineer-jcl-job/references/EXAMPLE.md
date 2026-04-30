# reverse-engineer-jcl-job — Worked Example

## Scenario

User has a billing-mainframe repo at `~/code/billing-mainframe/JCL/` (64 jobs) plus `~/code/billing-mainframe/PROCLIB/` (23 PROCs) on JES2 / z/OS. Scheduler is Control-M; PROCs use parameter overrides; multiple jobs use GDGs for daily-roll datasets; IDCAMS reorganises VSAM clusters; SORT compresses overnight extracts; one job triggers a CICS COMMAREA refresh via MQ.

Prior steps: `reverse-engineer-copybook-library` and `reverse-engineer-cobol-program` have produced their Part A outputs at the same project.

User says: *"Document the JCL at ~/code/billing-mainframe/JCL."*

## Stage 1 — Discovery and Inventory

```
Jobs:               64  in JCL/
PROCs:              23  in PROCLIB/
INCLUDE members:    18  in JCLLIB/
Scheduler markers:  Control-M (//*$$ ORDER, //*$$ MOD …) on 47 of 64 jobs
GDG datasets:       12 distinct GDG bases
EXEC PGM= calls:    219 (87 distinct programs)
EXEC PROC= calls:   148 (each resolves into 2-7 steps)
IDCAMS:             14 jobs use it
SORT:               31 jobs use DFSORT or SYNCSORT
IEBGENER:           22 jobs use it
EXEC PGM=IKJEFT01:  9 jobs (TSO/E batch — likely DB2 BIND or IKJEFT01-driven scripts)
```

`steps/scaffold.md` proposes Part A as a tree under `docs/jcl-job-internal/` and Part B as a tree under the KB at `source-docs/billing-jcl/jcl-job-consumer/`. User approves. User confirms Control-M is the scheduler of record.

## Stage 2 — Per-Job Step Reference

For BILLPOST (representative batch job):

```
//BILLPOST JOB (ACCT123),'BILLING POST',CLASS=A,MSGCLASS=X,
//        NOTIFY=&SYSUID,REGION=4M
//*$$ ORDER DAILY ROLL
//STEP010  EXEC PGM=BILLPROC,REGION=4M
//STEPLIB  DD DSN=PROD.LOAD.LIB,DISP=SHR
//CUSTDD   DD DSN=PROD.CUSTOMER.MASTER,DISP=SHR
//BILLDD   DD DSN=PROD.BILLING.OUTPUT(+1),DISP=(NEW,CATLG,DELETE),
//            DCB=(LRECL=200,RECFM=FB),
//            SPACE=(CYL,(50,10),RLSE)
//ERRDD    DD DSN=PROD.BILLING.ERR(+1),DISP=(NEW,CATLG,DELETE),...
//SYSOUT   DD SYSOUT=*
//SYSUDUMP DD SYSOUT=*
//
//STEP020  EXEC PROC=BILLPOST.PROC,
//            INDATE=&LYY&LMM&LDD
//
//STEP030  EXEC PGM=IDCAMS,COND=(0,LT,STEP020)
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  DELETE PROD.BILLING.WORK.G0001V00 NONVSAM
//
```

Documented: 3 steps, 5 DDs (STEP010), one PROC EXEC (STEP020 with `INDATE` override), one IDCAMS step (STEP030 with `COND=` predicate referencing STEP020).

## Stage 3 — PROC Expansion and DD Inventory

For BILLPOST.PROC:

```
//BILLPOST.PROC PROC INDATE=,REGION=4M
//STEPA  EXEC PGM=BILLPOST,REGION=&REGION
//STEPLIB DD DSN=PROD.LOAD.LIB,DISP=SHR
//INPUT  DD DSN=PROD.BILLING.OUTPUT(0),DISP=SHR
//OUTPUT DD DSN=PROD.BILLING.POSTED.&INDATE,DISP=(NEW,CATLG,DELETE),...
//STEPB  EXEC PGM=DSNUTILB,COND=(0,LT,STEPA),...
//
```

Resolved view at the BILLPOST EXEC site (with `INDATE=&LYY&LMM&LDD` substituted by JES at run time):

```
STEP020.STEPA — PGM=BILLPOST
  STEPLIB DSN=PROD.LOAD.LIB                    DISP=SHR     io=input
  INPUT   DSN=PROD.BILLING.OUTPUT(0)           DISP=SHR     io=input  gdg=0
  OUTPUT  DSN=PROD.BILLING.POSTED.<INDATE>     DISP=(NEW,…) io=output (symbolic — flagged)
STEP020.STEPB — PGM=DSNUTILB (DB2 utility)
  ...
```

Per-job DD inventory for BILLPOST: 14 distinct DDs, 6 input / 7 output / 1 sysout (excluding SYSOUT/SYSUDUMP). 2 GDG references (`(+1)` for BILLDD, `(0)` for INPUT in PROC). 1 symbolic-substitution DSN (flagged for separate handling in lineage).

## Stage 4 — Cross-Cutting Concerns and Job-Flow Guide

```
Condition codes:
  STEP020 only runs if STEP010 ended with RC <= 4
  STEP030 (IDCAMS DELETE) only runs if STEP020 RC > 0 (cleanup on failure)

Scheduler edges (from Control-M export):
  Predecessor: BILLEXTR (writes PROD.CUSTOMER.MASTER staged copy)
  Successors:  BILLREPT (reads PROD.BILLING.OUTPUT(0) — i.e. the +1 just promoted)

Per-job consumer guide (BILLPOST excerpt):
  Reads:  PROD.CUSTOMER.MASTER  (DISP=SHR; staged by BILLEXTR predecessor)
          PROD.BILLING.OUTPUT(0) (current generation)
  Writes: PROD.BILLING.OUTPUT(+1)  (new generation)
          PROD.BILLING.ERR(+1)
          PROD.BILLING.POSTED.<DATE>
  Failure modes:
    - RC > 4 from STEP010 → BILLDD generation NOT cataloged; ops re-runs from STEP010
    - STEP020 RC > 0 → STEP030 (IDCAMS DELETE) cleans up, but BILLPOSTED is incomplete
```

`job-flow.mmd` produced as Mermaid step→step graph for all 64 jobs.
`dataset-io.json` produced with a row per (job, step, DD).

## Stage 5 — Verification and Finalization

`steps/verify.md`:

- Completeness: 64/64 jobs documented; 23/23 PROCs expanded; 18/18 INCLUDEs resolved. Pass.
- Accuracy: spot-checked 6 jobs (3 batch, 1 IDCAMS-heavy, 1 SORT-heavy, 1 DB2-utility-heavy). 1 failure — BILLPOST documented as having SYSUDUMP DD; actual JCL uses SYSABEND. Corrected.
- Consistency: no run-book content leaked into Part A; no ops-internal commentary leaked into Part B.
- Feed-files:
  - `job-flow.mmd` — 64 job sub-graphs, 219 step nodes, parses as Mermaid. Pass.
  - `dataset-io.json` — 219 step entries; symbolic DSNs flagged separately. Validates against schema. Pass.

Verification report: 1 failure, 0 warnings. GO after correction.

## Outputs

```
~/code/billing-mainframe/JCL/docs/jcl-job-internal/
  ├── 01-job-overview.md
  ├── 02-step-by-step-reference.md
  ├── 03-proc-and-include-expansion.md
  ├── 04-dd-inventory-and-disp.md
  ├── 05-gdg-and-dataset-lifecycle.md
  ├── 06-condition-codes-and-restart-points.md
  ├── 07-idcams-sort-iebgener-patterns.md
  ├── 08-scheduler-integration.md
  ├── 09-security-and-racf-considerations.md
  ├── 10-anti-patterns-and-pitfalls.md
  ├── 11-faq-and-troubleshooting.md
  ├── job-flow.mmd
  ├── dataset-io.json
  ├── extraction-status.md
  └── CHANGE-TRACKER.md

<KB>/source-docs/billing-jcl/jcl-job-consumer/
  ├── 01-what-this-job-does.md
  ├── 02-input-and-output-datasets.md
  ├── 03-predecessor-and-successor-jobs.md
  ├── 04-failure-modes-and-recovery.md
  └── 05-integration-examples.md
```

## Hand-off

> "Reverse-engineering of billing-jcl is complete. Next, run `build-mainframe-data-lineage` — it consumes copybook-record-graph.json + program-data-bindings.json + dataset-io.json across this project to produce cross-program field-level traceability."
