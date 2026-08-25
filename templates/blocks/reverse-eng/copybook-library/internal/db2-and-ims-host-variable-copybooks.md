---
slug: db2-and-ims-host-variable-copybooks
title: "DB2 and IMS Host-Variable Copybooks"
applies-to: [re-copybook-library-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 170
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 7. DB2 and IMS Host-Variable Copybooks

For DCLGEN-generated copybooks (DB2) and DBD-derived copybooks (IMS), document the source artefact, the generation tool, and the rules that govern hand-edits.

### 7.1 DCLGEN-Generated DB2 Copybooks

Each `DB2-*` copybook in this library was generated from a DB2 DDL table. They MUST NOT be hand-edited — drift between the copybook and the table silently corrupts host-variable bindings.

| Copybook | DB2 Table | Schema | Last Generated | Notes |
|---|---|---|---|---|
| [DB2-CUSTOMER] | CUSTOMER | PROD | YYYY-MM-DD | INDICATOR variable suffix `-IND` per nullable column |
| [DB2-BILLING]  | BILLING  | PROD | YYYY-MM-DD | none |

### 7.2 DCLGEN Naming Convention

| DDL Column | Host-Variable Field | Indicator Field |
|---|---|---|
| `CUST_ID NOT NULL` | CUST-ID | (none) |
| `CUST_NAME NULLABLE` | CUST-NAME | CUST-NAME-IND (PIC S9(4) COMP) |

### 7.3 IMS DBD-Derived Copybooks

Each `IMS-*` copybook in this library represents an IMS segment as a record layout. Source of truth is the DBD; the copybook is a derived artefact.

| Copybook | DBD | Segment | Last Generated | Notes |
|---|---|---|---|---|
| [IMS-CUSTSEG] | CUSTDB | CUSTSEG | YYYY-MM-DD | sensitive to PCB CUSTPCB |
| [IMS-ADDRSEG] | CUSTDB | ADDRSEG | YYYY-MM-DD | child of CUSTSEG |

### 7.4 Drift Detection

Drift between DDL/DBD and copybook is the highest-impact failure mode in this bucket. Recommended cadence: regenerate every release; diff against the prior generation; abort release if unexpected diff.

| Source Artefact | Drift Detection Tool | Cadence |
|---|---|---|
| DDL CUSTOMER | DCLGEN compare | every release |
| DBD CUSTDB   | DBDGEN-helper compare | every release |

### 7.5 Hand-Edit Anti-Pattern

Hand-edits to DCLGEN/DBDGEN-derived copybooks are flagged as architectural anti-pattern. Even apparently safe edits (renaming a field for clarity) silently break DCLGEN's column-order assumption.
