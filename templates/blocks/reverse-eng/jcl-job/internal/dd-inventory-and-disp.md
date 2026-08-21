---
slug: dd-inventory-and-disp
title: "DD Inventory and DISP"
applies-to: [re-jcl-job-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 140
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 4. DD Inventory and DISP

Per-job DD inventory: every DD across every step (after PROC expansion and INCLUDE resolution), with DSN, DISP, DCB, SPACE, I/O direction, and the program FD it binds to.

### 4.1 Per-Job DD Inventory

For each job, render the per-step DD list. SYSOUT, SYSPRINT, SYSUDUMP, SYSABEND are excluded from this inventory and tracked separately.

| Job | Step | DD Name | DSN | DISP | DCB | SPACE | I/O | Bound Program FD |
|---|---|---|---|---|---|---|---|---|
| [JOBNAME] | STEP010 | CUSTDD | PROD.CUSTOMER.MASTER | SHR | (n/a — existing) | (n/a) | input | BILLPROC.CUST-FILE |
| [JOBNAME] | STEP010 | BILLDD | PROD.BILLING.OUTPUT(+1) | (NEW,CATLG,DELETE) | LRECL=200,RECFM=FB | CYL,(50,10),RLSE | output | BILLPROC.BILL-FILE |
| [JOBNAME] | STEP010 | ERRDD  | PROD.BILLING.ERR(+1) | (NEW,CATLG,DELETE) | LRECL=80,RECFM=FB | CYL,(5,2),RLSE | output | BILLPROC.ERR-FILE |
| [JOBNAME] | STEP020.STEPA | INPUT | PROD.BILLING.OUTPUT(0) | SHR | (n/a) | (n/a) | input | BILLPOST.IN-FILE |
| [JOBNAME] | STEP020.STEPA | OUTPUT | PROD.BILLING.POSTED.&INDATE | (NEW,CATLG,DELETE) | LRECL=200,RECFM=FB | CYL,(50,10) | output | BILLPOST.OUT-FILE |

### 4.2 Sysprint / Sysout / Sysudump (separately tracked)

| Job | Step | DD Name | Routing |
|---|---|---|---|
| [JOBNAME] | (all) | SYSOUT | `SYSOUT=*` (job's MSGCLASS) |
| [JOBNAME] | (all) | SYSPRINT | `SYSOUT=*` |
| [JOBNAME] | (all) | SYSUDUMP / SYSABEND | `SYSOUT=*` |

### 4.3 STEPLIB Conventions

For every step using STEPLIB, document the load library DSN(s).

| Job | Step | STEPLIB DSN(s) |
|---|---|---|
| [JOBNAME] | STEP010 | PROD.LOAD.LIB |
| [JOBNAME] | STEP020 | PROD.LOAD.LIB, DB2.RUNLIB.LOAD |

### 4.4 DCB and Record-Format Patterns

| Recurring Pattern | Where Used | Notes |
|---|---|---|
| LRECL=200, RECFM=FB | billing output | matches BILLREC byte size |
| LRECL=80, RECFM=FB | error logs | one error per record |
| RECFM=VB, LRECL=29978 | variable-length billing | matches BILL-DETAILS OCCURS DEPENDING ON |

### 4.5 SPACE and Volume Discipline

| Convention | Pattern | Rationale |
|---|---|---|
| Primary/secondary cylinders | `SPACE=(CYL,(50,10),RLSE)` | RLSE returns unused tracks |
| Trk allocation for small datasets | `SPACE=(TRK,(5,2),RLSE)` | error files |
| VOLUMES on large GDGs | `VOL=SER=PROD01` | force volume placement |
