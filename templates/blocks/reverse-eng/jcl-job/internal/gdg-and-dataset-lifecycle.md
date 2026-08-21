---
slug: gdg-and-dataset-lifecycle
title: "GDG and Dataset Lifecycle"
applies-to: [re-jcl-job-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 150
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 5. GDG and Dataset Lifecycle

Generation Data Groups (GDGs) and other lifecycle-managed datasets that this repo's jobs read or write. GDG generation handling is critical for downstream consumers — `(+1)` writes a new generation that becomes the next `(0)`.

### 5.1 GDG Base Inventory

| GDG Base | Limit | Scratch Behaviour | Roll-Off Behaviour | Notes |
|---|---|---|---|---|
| PROD.BILLING.OUTPUT | 7 | NOSCRATCH | EMPTY | 7 generations retained |
| PROD.BILLING.ERR    | 7 | SCRATCH   | EMPTY | rolled-off generations are scratched |
| PROD.CUSTOMER.SNAP  | 30 | NOSCRATCH | EMPTY | 30-day snapshot history |

### 5.2 GDG Generation Use Per Job

| Job | Step.DD | GDG Base | Generation | I/O | Notes |
|---|---|---|---|---|---|
| [JOBNAME] | STEP010.BILLDD | PROD.BILLING.OUTPUT | (+1) | output | new generation per run |
| [JOBNAME] | STEP020.INPUT  | PROD.BILLING.OUTPUT | (0)  | input  | reads current (the +1 from the previous run) |
| [JOBNAME] | STEP030.PRIORDD | PROD.BILLING.OUTPUT | (-1) | input | restart-from-checkpoint reads the previous generation |

### 5.3 Cross-Job GDG Roll Coordination

Document how predecessor and successor jobs hand off GDG generations. Misalignment is the highest-impact failure mode.

| Predecessor | Writes Generation | Successor | Reads Generation | Coordination Mechanism |
|---|---|---|---|---|
| BILLEXTR | PROD.CUSTOMER.SNAP(+1) | BILLPOST | PROD.CUSTOMER.SNAP(0) | scheduler dependency (BILLEXTR must complete before BILLPOST starts) |

### 5.4 Non-GDG Dataset Lifecycle

For datasets without GDG, document retention and scratch policy.

| DSN Pattern | Retention | Scratch Mechanism |
|---|---|---|
| PROD.BILLING.WORK.* | 1 day | step `EXEC PGM=IDCAMS` deletes at end of job |
| PROD.BILLING.EXTRACT.YYMMDD | indefinite | none (manual cleanup) |
| PROD.BILLING.TMP.&JOBNAME | job duration | DISP=(NEW,DELETE,DELETE) |

### 5.5 RACF / Top Secret / ACF2 Considerations

Document who can write each dataset class. Cross-reference the security-and-racf-considerations block.

| DSN Class | Read | Write | Allocate |
|---|---|---|---|
| PROD.BILLING.* | BILLOPS, BILLDEV (read) | BILLOPS only | BILLOPS only |
| PROD.CUSTOMER.* | BILLOPS, AUDITOR (read) | CUSTOPS only | CUSTOPS only |

### 5.6 Tape vs. DASD

| DSN Pattern | Storage | Notes |
|---|---|---|
| PROD.BILLING.ARCHIVE.* | tape | mount required; tape robot serves automatically |
| PROD.BILLING.OUTPUT | DASD | online generations |
