---
slug: integration-examples
title: "Integration Examples"
applies-to: [re-jcl-job-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 330
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 16. Integration Examples

End-to-end examples showing consumers how to integrate with these jobs (read their output, hand off input, hook into the scheduler).

### 16.1 Reading a Job's GDG Output From a Downstream Job

```jcl
//DOWNSTM JOB ...
//*$$ ORDER AFTER BILLPOST
//STEP010  EXEC PGM=DOWNCONS,REGION=4M
//STEPLIB  DD DSN=PROD.LOAD.LIB,DISP=SHR
//INDD     DD DSN=PROD.BILLING.OUTPUT(0),DISP=SHR
//*  ^ reads the current generation — i.e. the (+1) just promoted by BILLPOST
//SYSOUT   DD SYSOUT=*
```

### 16.2 Producing a Predecessor's Required Input

If your job feeds [JOBNAME], it must write a dataset that [JOBNAME] reads. Cross-reference the input-and-output-datasets block for the expected DSN and shape.

```jcl
//FEEDER  JOB ...
//STEP010 EXEC PGM=YOURPROD,REGION=4M
//STEPLIB DD DSN=PROD.LOAD.LIB,DISP=SHR
//OUTDD   DD DSN=PROD.CUSTOMER.STAGED,DISP=(NEW,CATLG,DELETE),
//           DCB=(LRECL=200,RECFM=FB),
//           SPACE=(CYL,(50,10),RLSE)
//*  ^ this DSN matches what [JOBNAME] expects on its CUSTDD
```

### 16.3 Listing a Job's Output for Diagnostics

```jcl
//DIAG    JOB ...
//STEP010 EXEC PGM=IDCAMS
//SYSPRINT DD SYSOUT=*
//SYSIN   DD *
  LISTCAT ENT(PROD.BILLING.OUTPUT) ALL
```

### 16.4 Re-Reading a Prior Generation

Useful for restart-from-checkpoint or auditing.

```jcl
//AUDIT   JOB ...
//STEP010 EXEC PGM=AUDPROC,REGION=4M
//PRIORDD DD DSN=PROD.BILLING.OUTPUT(-1),DISP=SHR
//SYSOUT  DD SYSOUT=*
```

### 16.5 Cross-Repo Integration (consumer in another mainframe team)

For consumers in a different repo / RE pass:
- Identify the producer job in this repo's predecessor-and-successor-jobs block
- Verify the DSN and shape against this repo's input-and-output-datasets block
- Wire the consumer-side scheduler dependency to the producer job

| Cross-Team Edge | Producer (this repo) | Consumer (other repo) | Coordination |
|---|---|---|---|
| BILLPOST → ReportingTeam | PROD.BILLING.OUTPUT(0) | their RPTEXTR job | scheduler-confirmed |
