---
slug: input-and-output-datasets
title: "Input and Output Datasets"
applies-to: [re-jcl-job-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 300
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 13. Input and Output Datasets

Per job, the consumer-facing dataset I/O list. Includes GDG generation behaviour and retention so consumers can wire downstream jobs correctly.

### 13.1 Per-Job Dataset I/O

For each job, render the dataset list:

| Job | DSN | Direction | GDG | Retention | Notes |
|---|---|---|---|---|---|
| [JOBNAME] | PROD.CUSTOMER.MASTER | input | (n/a) | rolling | source of truth; updated by CUSTMNT |
| [JOBNAME] | PROD.BILLING.OUTPUT | output (+1) | yes | 7 generations | new generation each run |
| [JOBNAME] | PROD.BILLING.ERR    | output (+1) | yes | 7 generations | error log |

### 13.2 GDG Roll Coordination

For each GDG written or read by this job, document the coordination with predecessor / successor jobs.

| GDG Base | Generation Written By | Generation Read By | Roll Mechanism |
|---|---|---|---|
| PROD.BILLING.OUTPUT | [JOBNAME] (+1) | BILLREPT (0) | scheduler dependency: BILLREPT runs after [JOBNAME] |
| PROD.CUSTOMER.SNAP  | BILLEXTR (+1) | [JOBNAME] (0) | scheduler dependency: [JOBNAME] runs after BILLEXTR |

### 13.3 Symbolic-DSN Caveats

When a dataset DSN contains a symbolic substitution (e.g. `PROD.BILLING.POSTED.&LDATE`), document the resolution at run time so consumers can predict the effective DSN.

| Job | Symbolic DSN | Resolution | Consumer Action |
|---|---|---|---|
| [JOBNAME] | PROD.BILLING.POSTED.&LDATE | local date YYYYMMDD | reference by date or by GDG-equivalent listing |

### 13.4 Retention and Archival

| DSN Pattern | Retention | Archival | Notes |
|---|---|---|---|
| PROD.BILLING.OUTPUT.G* | 7 generations on DASD | older generations on tape (PROD.ARCHIVE.BILLING) | scratch on roll-off |
| PROD.BILLING.ERR.G* | 7 generations on DASD | none | scratch on roll-off |
| PROD.BILLING.POSTED.* | indefinite | manual | not GDG; date-suffixed |

### 13.5 Consumer Read Patterns

For datasets read by other jobs in this or another repo, document the access pattern (full-file scan vs. keyed read vs. random).

| DSN | Pattern | Notes |
|---|---|---|
| PROD.BILLING.OUTPUT(0) | full sequential | consumed by BILLREPT |
| PROD.CUSTOMER.MASTER | VSAM keyed READ | indexed by CUST-ID |
