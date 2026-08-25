---
slug: failure-modes-and-recovery
title: "Failure Modes and Recovery"
applies-to: [re-jcl-job-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 320
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 15. Failure Modes and Recovery

Per job, the consumer-visible failure modes and the recovery path. Mainframe-internal causes are summarised; deep operational details are in Part A.

### 15.1 Per-Job Failure Matrix

For each job, document the consumer-visible failure modes:

| Job | Failure | Consumer Effect | Recovery |
|---|---|---|---|
| [JOBNAME] | step abend U4038 | output not produced; downstream BILLREPT delayed | rebind DBRM; restart from STEP010 |
| [JOBNAME] | step abend S0C7 | partial output; flagged in ERRDD | inspect input; correct bad records; re-submit |
| [JOBNAME] | RC=8 from STEP020 | output produced but partial; warnings logged | review ERRDD; downstream consumers should hold or proceed per business rule |
| [JOBNAME] | scheduler timeout | job killed by Control-M after SLA | open incident; ops investigates |

### 15.2 Restart Behaviour From a Consumer's Perspective

For each restart scenario, document what consumers should expect.

| Restart Scenario | Consumer Action | Notes |
|---|---|---|
| Restart from STEP010 | downstream consumers wait until job completes | output GDG generation is the same number as the failed run |
| Restart from STEP020 (after STEP010 success) | downstream consumers wait | output GDG already allocated; no new generation produced |
| Job re-run from beginning | output GDG generation rolls forward | the failed-run generation is left in catalogue (for audit) |

### 15.3 Common Root Causes (consumer-friendly summary)

| Symptom | Likely Cause | First Diagnostic Action |
|---|---|---|
| "Job failed, downstream is empty" | step abend before any output produced | check the JES log for the failing step's RC |
| "Job ran but output looks wrong" | partial / corrupt input; RC=8 with warnings | check ERRDD generation for that run |
| "Job didn't run at all" | scheduler dependency unmet (predecessor failed) | check predecessor in the scheduler |

### 15.4 SLA and Escalation

| Job | SLA | Escalation If Missed |
|---|---|---|
| [JOBNAME] | complete by 03:30 | ops oncall paged at 03:35; downstream BILLREPT delayed |
| [JOBNAME] | complete by 06:00 | manual override available via DRPLAN procedure |

### 15.5 Audit / Compliance Notes

For jobs with audit / compliance impact (financial reporting, regulatory submission), document the consumer compliance touchpoints.

| Job | Compliance Touchpoint | Action on Failure |
|---|---|---|
| [JOBNAME] | nightly close — required for D+1 reporting | escalate to compliance officer if not complete by 04:00 |
