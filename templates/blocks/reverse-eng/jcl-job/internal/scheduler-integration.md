---
slug: scheduler-integration
title: "Scheduler Integration"
applies-to: [re-jcl-job-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 180
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 8. Scheduler Integration

Document scheduler-of-record integration. Scheduler markers in JCL drive automatic job ordering, retry, and operator notification.

### 8.1 Scheduler of Record

| Field | Value |
|---|---|
| Scheduler | Control-M / CA-7 / OPC/A / Zeke / JES2 native |
| Version | [version] |
| Source of dependency truth | scheduler export (file or API) |

### 8.2 In-JCL Scheduler Markers

Per scheduler:

| Marker Pattern | Purpose | Example |
|---|---|---|
| `//*$$ ORDER` (Control-M) | declares the job's place in the daily run | `//*$$ ORDER DAILY ROLL` |
| `//*$$ MOD` (Control-M) | modifies job parameters at order time | `//*$$ MOD CLASS=B` |
| `/*JOBPARM` (JES2) | JES2 routing | `/*JOBPARM SYSAFF=SYS1` |
| `/*MESSAGE` (JES2) | operator console message | `/*MESSAGE BILLING POSTING START` |
| `/*ROUTE` (JES2) | route output | `/*ROUTE PRINT REMOTE007` |
| `// SET` (CA-7) | set scheduler symbolic | `// SET LDATE=&LDATE` |

### 8.3 Predecessor / Successor Edges

For each job, document scheduler-confirmed predecessors and successors. When the scheduler export was supplied during RE, populate from that. When unavailable, mark "derived from GDG / DD coupling, not scheduler-confirmed."

| Job | Predecessors | Successors | Source |
|---|---|---|---|
| [JOBNAME] | [BILLEXTR] | [BILLREPT] | scheduler export YYYY-MM-DD |
| [JOBNAME] | [JOB1, JOB2] (GDG-derived) | [JOB3] | derived; not scheduler-confirmed |

### 8.4 Frequency

| Job | Frequency | Calendar |
|---|---|---|
| [JOBNAME] | daily | weekdays only |
| [JOBNAME] | monthly | last business day |
| [JOBNAME] | on-demand | triggered manually |

### 8.5 Retry Policy

| Job | Auto-Retry | Max Attempts | Backoff |
|---|---|---|---|
| [JOBNAME] | yes | 3 | 5 minutes between attempts |
| [JOBNAME] | no  | n/a | manual restart only |

### 8.6 Operator Notification

| Job | Failure Notifies | Success Notifies |
|---|---|---|
| [JOBNAME] | BILLOPS-ONCALL | (none) |
| [JOBNAME] | BILLOPS, AUDITOR | BILLOPS |

### 8.7 Cron / Calendar Equivalents

For cross-team understanding, express the schedule in cron-like terms:

| Job | Mainframe Schedule | Cron Equivalent |
|---|---|---|
| [JOBNAME] | weekday 02:00 | `0 2 * * 1-5` |
| [JOBNAME] | last business day 23:00 | (calendar-aware; no clean cron) |
