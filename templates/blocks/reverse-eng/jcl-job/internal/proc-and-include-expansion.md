---
slug: proc-and-include-expansion
title: "PROC and INCLUDE Expansion"
applies-to: [re-jcl-job-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 130
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 3. PROC and INCLUDE Expansion

For every PROC invocation and every INCLUDE reference, document the expanded view: the steps that actually run, the DDs after override, and the resolved DSNs.

### 3.1 PROC Definitions

For each PROC in PROCLIB:

```
PROC: [PROCNAME]
Source: [path/to/PROCNAME.proc]
Parameters with defaults: INDATE= , REGION=4M
Steps:
  STEPA | EXEC PGM=[PROGNAME] | DDs: STEPLIB, INPUT, OUTPUT, SYSOUT
  STEPB | EXEC PGM=DSNUTILB    | DDs: SYSIN, SYSPRINT, conditionally on STEPA RC
```

### 3.2 PROC Expansion at EXEC PROC Sites

For each `EXEC PROC=` site in a job, produce the resolved view: which PROC step runs, which DD is overridden, the resolved DSN per DD.

| Job | Step | PROC | Parameter Overrides | DD Overrides | Resolved Steps |
|---|---|---|---|---|---|
| [JOBNAME] | STEP020 | BILLPOST.PROC | INDATE=20260429 | none | STEPA + STEPB run |
| [JOBNAME] | STEP020 | BILLPOST.PROC | INDATE=20260430, REGION=8M | OUTPUT DSN=… | STEPA only (overridden DD) |

### 3.3 DD Override Syntax

Document the override patterns observed:

| Override Pattern | Example | Effect |
|---|---|---|
| Full DD override | `//STEP020.OUTPUT DD DSN=NEW.DSN,DISP=...` | replaces the PROC-default DD |
| DUMMY override | `//STEP020.OUTPUT DD DUMMY` | suppresses the DD |
| DSN-only override | `//STEP020.OUTPUT DD DSN=&NEW` | leaves DISP/DCB at PROC default |

### 3.4 INCLUDE Members

INCLUDE members provide reusable JCL fragments (typically shared DD definitions, scheduler tags, JES2 control cards).

| Member | Pulled In By | Purpose |
|---|---|---|
| [MEMBER] | [JOB1, JOB2, PROC1] | shared DD definitions for VSAM access |
| [MEMBER] | [JOB3] | JES2 SETUP statements for tape mounts |

For each INCLUDE site, document the resolution chain:

```
JOB BILLPOST
  ↓
  // INCLUDE MEMBER=BILLDDS
        ↓ resolves to JCLLIB(BILLDDS)
        which contains:
          //CUSTDD DD DSN=...
          //BILLDD DD DSN=...
```

### 3.5 Circular INCLUDE Detection

INCLUDE chains can form cycles. Flag any cycle here:

| Cycle | Members Involved | Resolution |
|---|---|---|
| (none detected) | — | — |
| [example] | A → B → A | break at A; refactor common content into C |
