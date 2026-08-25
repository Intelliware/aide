---
slug: job-overview
title: "Job Overview"
applies-to: [re-jcl-job-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 110
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 1. Job Overview

### 1.1 Repository Statistics

| Metric | Value |
|---|---|
| Total jobs (`.jcl`) | [N] |
| Total PROCs (`.proc`) | [N] |
| Total INCLUDE members | [N] |
| Distinct programs called via `EXEC PGM=` | [N] |
| Distinct PROCs invoked via `EXEC PROC=` | [N] |
| GDG bases referenced | [N] |
| Symbolic-substitution DSNs (containing `&`) | [N] |
| Scheduler of record | Control-M / CA-7 / OPC/A / Zeke / JES2 |

### 1.2 Job Inventory (one row per job)

| Job | Source File | Purpose | Frequency | Scheduler-Tagged |
|---|---|---|---|---|
| [JOBNAME] | [path/to/JOBNAME.jcl] | [one-line purpose] | daily / weekly / monthly / on-demand | yes / no |

### 1.3 PROC Inventory (one row per PROC)

| PROC | Source File | Used By Jobs | Parameters |
|---|---|---|---|
| [PROCNAME] | [path/to/PROCNAME.proc] | [JOB1, JOB2] | [INDATE=, REGION=4M] |

### 1.4 INCLUDE Member Inventory

| Member | Source File | Pulled In By | Purpose |
|---|---|---|---|
| [MEMBER] | [path/to/MEMBER] | [JOB1, PROC1] | [shared DD definitions] |

### 1.5 Out of Scope

| Job | Reason |
|---|---|
| [JOBNAME] | deprecated / archived |
