---
slug: what-this-job-does
title: "What This Job Does"
applies-to: [re-jcl-job-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 290
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 12. What This Job Does

Per-job consumer-facing summary. One sub-section per job. Avoid mainframe-internal vocabulary where possible — focus on the job's business effect.

### 12.1 Per-Job Summary Format

For each job, render in this form:

```
Job: [JOBNAME]
Schedule: [daily 02:00 / weekly Mon / monthly LBD / on-demand]
Business Effect:
  - [What this job changes in the world: writes a new billing batch,
     posts billings, archives a generation, computes month-end totals,
     etc.]
Inputs (datasets):
  - [PROD.CUSTOMER.MASTER (current snapshot)]
  - [PROD.BILLING.OUTPUT(0)]
Outputs (datasets):
  - [PROD.BILLING.OUTPUT(+1) — new generation]
  - [PROD.BILLING.ERR(+1)]
Programs Invoked:
  - [BILLPROC, BILLPOST, IDCAMS]
Predecessors:  [BILLEXTR (writes PROD.CUSTOMER.MASTER staged copy)]
Successors:    [BILLREPT (reads the +1 just promoted)]
SLA:
  - Run-time budget: [25 minutes]
  - Latest acceptable completion: [03:30]
```

### 12.2 Job Summary Index

A consumer-friendly index of all jobs in this repo:

| Job | What It Does | When It Runs |
|---|---|---|
| [JOBNAME] | [posts daily billing] | weekday 02:00 |
| [JOBNAME] | [archives prior month's billing] | first business day 23:00 |

### 12.3 Cross-Repo Effects

If a job's outputs are consumed by another team (different repo, different KB), surface that here.

| Job | External Consumer | Coordination Channel |
|---|---|---|
| [JOBNAME] | Reporting team's nightly extract | shared GDG; documented in PROD.BILLING.OUTPUT |
| [JOBNAME] | Audit team's compliance feed | dedicated DSN PROD.AUDIT.BILLING.&LDATE |

### 12.4 What This Job Does NOT Do

For jobs frequently misunderstood, document the boundary explicitly.

| Job | Common Misconception | Reality |
|---|---|---|
| BILLPOST | "posts customer payments" | no — posts billing entries; payment processing is in PAYJOB |
| BILLEXTR | "is the source of truth for customers" | no — it stages a snapshot; CUSTMNT is the master |
