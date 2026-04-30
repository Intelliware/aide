---
slug: lineage-summary
title: "Lineage Summary"
applies-to: [kb-mainframe-data-lineage]
requires-decision-from: [code-reader]
optional: false
order-hint: 200
---

## 10. Lineage Summary

Top-level keyed indices for the artefact tree. Use this as the entry point when looking up a field, copybook, program, or dataset by name.

### 10.1 Quick Stats

```
Lineage built: YYYY-MM-DD HH:MM
Contributing repos:
  copybook-library:  [REPO-SLUG] ([N] copybooks; [M] variants)
  cobol-program:     [REPO-SLUG] ([N] programs)
  jcl-job:           [REPO-SLUG] ([N] jobs; [M] steps)
Coverage rule outcomes (per step 8): all PASS / [N] failures
Unbound and flagged items: see 09-unbound-and-flagged-items.md
```

### 10.2 Field Index (alphabetical by short name)

A flat alphabetical index of canonical fields. Same field name appearing across multiple copybooks lists each occurrence separately.

| Field | Copybooks (variant) | Quick Link |
|---|---|---|
| BA-AMOUNT | LSCOMM (BILLAREA-V1; BILLAREA-V2) | `03-field-where-used.md#ba-amount` |
| BILL-LINE-COUNT | BILLDETLS (BILL-DETAILS) | `03-field-where-used.md#bill-line-count` |
| CUST-AMOUNT | CUSTREC, CUSTREC.LEGACY (drift), IO-CUST-EXTRACT | `03-field-where-used.md#cust-amount` |
| CUST-ID | CUSTREC, DB2-CUSTOMER, IMS-CUSTSEG | `03-field-where-used.md#cust-id` |
| ... | ... | ... |

### 10.3 Copybook Index (alphabetical)

A flat alphabetical index of copybooks.

| Copybook | Library | Variants | Quick Link |
|---|---|---|---|
| BILLAREA | billing-copybook | V1, V2 | `02-copybook-where-used.md#billarea` |
| BILLDETLS | billing-copybook | (one) | `02-copybook-where-used.md#billdetls` |
| CUSTREC | billing-copybook | (one) | `02-copybook-where-used.md#custrec` |
| CUSTREC.LEGACY | billing-copybook (drift) | (one — divergent) | `02-copybook-where-used.md#custrec.legacy` |
| ... | ... | ... | ... |

### 10.4 Program Index (alphabetical)

A flat alphabetical index of programs.

| Program | Execution Context | Copybooks Copied | EXEC Counts (CICS/SQL/DLI) | Quick Link |
|---|---|---|---|---|
| BILLPROC | batch | CUSTREC, BILLREC, ERRREC, ... | 0/2/0 | `05-job-program-dataset-chain.md#billproc` |
| BILLINQ  | cics  | LSCOMM (V2), CUSTREC, ... | 8/3/0 | `05-job-program-dataset-chain.md#billinq` |
| BILLEXTR | ims-bmp | IMS-CUSTSEG, IMS-ADDRSEG | 0/2/4 | `05-job-program-dataset-chain.md#billextr` |
| ... | ... | ... | ... | ... |

### 10.5 Dataset Index (alphabetical by GDG base)

A flat alphabetical index of distinct datasets.

| DSN (or GDG Base) | GDG | Read By | Written By |
|---|---|---|---|
| PROD.BILLING.OUTPUT | yes | BILLREPT, BILLAUDIT (gen 0) | BILLPOST (+1) |
| PROD.CUSTOMER.MASTER | no | BILLPOST, BILLINQ (DISP=SHR) | CUSTMNT |
| PROD.AUDIT.BILLING.&LDATE | no (symbolic) | (downstream audit team) | BILLPOST |
| ... | ... | ... | ... |

### 10.6 EXEC Block Counts

```
EXEC SQL (DB2):    [N] blocks across [M] programs
EXEC DLI (IMS):    [N] blocks across [M] programs
EXEC CICS:         [N] blocks across [M] programs
  - LINK / XCTL:   [N] cross-program control transfers
  - READ / WRITE:  [N] CICS file accesses
  - SEND / RECEIVE: [N] BMS map operations
```

### 10.7 Provenance

| Contributing Repo | Role | Last Verified Commit (40-char SHA) |
|---|---|---|
| [REPO-SLUG] | copybook-library | [SHA] |
| [REPO-SLUG] | cobol-program | [SHA] |
| [REPO-SLUG] | jcl-job | [SHA] |
