---
slug: how-to-pick-the-right-copybook
title: "How to Pick the Right Copybook"
applies-to: [re-copybook-library-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 290
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 13. How to Pick the Right Copybook

Application developers and integrators should use this section to find the canonical copybook for a given domain need.

### 13.1 By Domain

| Need | Use This Copybook | Notes |
|---|---|---|
| Customer master record | CUSTREC | not the LEGACY variant |
| Customer extract for billing | IO-CUST-EXTRACT | sequential file record |
| Billing CICS COMMAREA | LSCOMM | variant per BA-VERSION |
| DB2 host-variable for ACCOUNTS | DB2-ACCOUNTS | DCLGEN — do not edit |
| IMS CUSTSEG segment | IMS-CUSTSEG | DBD-derived |
| Working-storage counters | WSCNTRS | shared counters group |
| Working-storage date/time | WSDATE | day-of-year, full-date, timestamp |

### 13.2 By Naming Convention Prefix

| Prefix | When to Use |
|---|---|
| `IO-` | when the record is bound to an FD (file I/O) |
| `WS-` | for shared working-storage groups |
| `LS-` | when defining a CICS COMMAREA or batch CALL parameter |
| `DB2-` | for DB2 EXEC SQL host variables |
| `IMS-` | for IMS DLI segment IO areas |
| `CICS-` | for BMS map records or CICS channel containers |

### 13.3 Disambiguation: "I see two copybooks with the same fields"

This happens for two reasons:
1. **Drift** — same intent, divergent layout. See `copybook-conflicts.md` for the canonical choice.
2. **Different intent** — same fields, different domain (e.g. `WS-DATE` vs `IO-DATE-RECORD`). Pick by naming-convention prefix.

### 13.4 Disambiguation: "Which variant of a REDEFINES copybook do I use?"

Read the canonical record catalogue's REDEFINES section. Variant selection is by a level-88 condition on the parent record. Examples:

| Copybook | Selector | Variant for "current" use |
|---|---|---|
| BILLAREA | BA-VERSION | BILLAREA-V2 (V1 is legacy) |
| TXNREC   | TXN-KIND   | depends on the transaction; both V1 and V2 are current |

### 13.5 Disambiguation: "I need a custom record — should I create a new copybook or fork an existing one?"

Always prefer extending an existing copybook (add to trailing FILLER, or add a REDEFINES variant). Create a new copybook only when the new record is genuinely new domain content. Forking is forbidden — it creates drift.
