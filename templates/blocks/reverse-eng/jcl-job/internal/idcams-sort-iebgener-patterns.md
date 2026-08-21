---
slug: idcams-sort-iebgener-patterns
title: "IDCAMS / SORT / IEBGENER Patterns"
applies-to: [re-jcl-job-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 170
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 7. IDCAMS / SORT / IEBGENER Patterns

Common control-card patterns used in this repo. Each pattern documents what it does, the steps it appears in, and the SYSIN body verbatim.

### 7.1 IDCAMS Patterns

| Pattern | Purpose | Steps Using It | SYSIN Excerpt |
|---|---|---|---|
| DELETE NONVSAM | clean up work files | [JOB1.STEP030, JOB2.STEP040] | `DELETE PROD.BILLING.WORK.G0001V00 NONVSAM` |
| DELETE / DEFINE CLUSTER | reorganise VSAM | [JOB3.STEP010] | `DELETE PROD.CUST.MASTER.IX CLUSTER ; DEFINE CLUSTER (NAME(...) ...)` |
| REPRO | copy / merge | [JOB4.STEP020] | `REPRO INFILE(IN1) OUTFILE(OUT1)` |
| LISTCAT | inventory check | [JOB5.STEP005] | `LISTCAT ENT(PROD.BILLING.OUTPUT) ALL` |
| ALTER | rename / re-catalog | [JOB6.STEP010] | `ALTER PROD.OLD NEWNAME(PROD.NEW)` |

### 7.2 SORT Patterns

DFSORT or SYNCSORT — same control-card grammar. Document each recurring pattern.

| Pattern | Purpose | Steps Using It | Control Cards Excerpt |
|---|---|---|---|
| Single-key sort | order by CUST-ID | [JOB1.SORT020] | `SORT FIELDS=(1,10,CH,A)` |
| Multi-key sort | CUST-ID then DATE | [JOB2.SORT010] | `SORT FIELDS=(1,10,CH,A,11,8,CH,A)` |
| INCLUDE filter | active customers only | [JOB3.SORT040] | `INCLUDE COND=(11,1,CH,EQ,C'A')` |
| OUTREC reformat | strip trailing FILLER | [JOB4.SORT030] | `OUTREC FIELDS=(1,200)` |
| MERGE | combine sorted inputs | [JOB5.MERGE010] | `MERGE FIELDS=(1,10,CH,A)` |

### 7.3 IEBGENER Patterns

IEBGENER copies datasets and concatenates. Document each pattern.

| Pattern | Purpose | Steps Using It | SYSIN Excerpt |
|---|---|---|---|
| Plain copy | one-to-one | [JOB1.STEP040] | (empty SYSIN; SYSUT1→SYSUT2) |
| With record selection | first N records | [JOB2.STEP050] | `GENERATE MAXFLDS=1` + `RECORD FIELD=(...)` |

### 7.4 IDCAMS / SORT / IEBGENER Anti-Patterns

- **IDCAMS DELETE without IF MAXCC=0** — silently masks failures.
- **SORT with no `SORTOUT` or `OUTREC`** — produces sorted file at default block size; consumer mismatches.
- **IEBGENER as a replacement for COPY** — slow on large GDGs; prefer SORT COPY (`SORT FIELDS=COPY`) or REPRO.

### 7.5 RC Conventions

| Utility | RC=0 | RC=4 | RC=8 | RC=12+ |
|---|---|---|---|---|
| IDCAMS | success | warnings (e.g. dataset not found on DELETE) | one or more commands failed | catastrophic |
| SORT | success | data flagged | input/output error | catastrophic |
| IEBGENER | success | (rare) | input/output error | catastrophic |
