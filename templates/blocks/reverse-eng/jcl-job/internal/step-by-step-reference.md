---
slug: step-by-step-reference
title: "Step-by-Step Reference"
applies-to: [re-jcl-job-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 120
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 2. Step-by-Step Reference

For each job, document every step in execution order: stepname, EXEC kind (PGM or PROC), parameter overrides, DD list, SYSIN content, control cards.

### 2.1 Per-Job Reference Format

For each job, use the following sub-section template:

```
Job: [JOBNAME]
Source: [path/to/JOBNAME.jcl]
JOB statement parameters: CLASS=[A], MSGCLASS=[X], NOTIFY=[&SYSUID], REGION=[size]M
Scheduler markers: [Control-M //*$$ ORDER, JES2 /*JOBPARM, …]

Step | EXEC | Target | Override Parameters | DD Names | SYSIN? | Notes
-----|------|--------|---------------------|----------|--------|------
STEP010 | PGM | [PROGNAME] | REGION=4M | STEPLIB, CUSTDD, BILLDD, ERRDD, SYSOUT, SYSUDUMP | no | reads/writes per FD bindings
STEP020 | PROC | [PROCNAME] | INDATE=&LYY&LMM&LDD | (resolved in PROC expansion) | n/a | conditional on STEP010 RC
STEP030 | PGM | IDCAMS | (none) | SYSPRINT, SYSIN | yes | DELETE work file
```

### 2.2 SYSIN Content (control cards)

For steps with SYSIN DD, document the inline control-card content. Long SYSIN bodies belong in the IDCAMS / SORT / IEBGENER patterns block; brief SYSIN appears here.

| Job | Step | SYSIN Content (excerpt) |
|---|---|---|
| [JOBNAME] | STEP030 | `DELETE PROD.BILLING.WORK.G0001V00 NONVSAM` |

### 2.3 PARM= Values

For every step that passes a `PARM=` value to the program, document the value and the program's interpretation.

| Job | Step | PARM= Value | Program Interpretation |
|---|---|---|---|
| [JOBNAME] | STEP010 | `'BATCH=YES,LOG=DEBUG'` | enables debug log output |

### 2.4 Symbolic Substitutions Used

| Job | Symbolic | Used In | Resolution At Run Time |
|---|---|---|---|
| [JOBNAME] | `&SYSUID` | NOTIFY parameter | submitting user ID |
| [JOBNAME] | `&LYY&LMM&LDD` | INDATE PROC parameter | local date YYMMDD |

### 2.5 Cross-Step Dependencies

Conditional execution and sticky DDs that span steps are documented in the condition-codes-and-restart-points block; this section lists them at the high level.

| Job | Dependency | Notes |
|---|---|---|
| [JOBNAME] | STEP020 only runs if STEP010 RC <= 4 | `COND=(0,LT,STEP010)` reversed |
