---
slug: level-88-condition-names
title: "Level-88 Condition Names"
applies-to: [re-copybook-library-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 160
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 6. Level-88 Condition Names

Level-88 condition names define logical predicates over an elementary field. Document each condition name, the parent elementary item, and the value(s) that make the condition true.

### 6.1 Condition-Name Inventory

| Copybook | Parent Field | Condition Name | Values | Notes |
|---|---|---|---|---|
| [CUSTREC] | CUST-STATUS | CUST-ACTIVE   | 'A' | normal billing |
| [CUSTREC] | CUST-STATUS | CUST-INACTIVE | 'I' | suspended |
| [CUSTREC] | CUST-STATUS | CUST-PURGE    | 'P' | scheduled for archive |
| [BILLAREA] | BA-VERSION | BA-V1 | '1' | legacy variant |
| [BILLAREA] | BA-VERSION | BA-V2 | '2' | current variant |
| [TXNREC]   | TXN-KIND   | TXN-DEBIT  | 'D' | debit transaction |
| [TXNREC]   | TXN-KIND   | TXN-CREDIT | 'C' | credit transaction |

### 6.2 Selector-Use Pattern

Many level-88 names act as selectors for REDEFINES variants (e.g. `BA-V1` / `BA-V2` select between BILLAREA-V1 / BILLAREA-V2). Cross-reference the redefines-and-variant-handling block.

### 6.3 Range Conditions (THRU)

Some level-88 names define ranges:

| Copybook | Parent Field | Condition Name | Range | Notes |
|---|---|---|---|---|
| [CUSTREC] | CUST-AGE | CUST-MINOR  | VALUES 0 THRU 17 | not directly billed |
| [CUSTREC] | CUST-AGE | CUST-ADULT  | VALUES 18 THRU 64 | standard billing |
| [CUSTREC] | CUST-AGE | CUST-SENIOR | VALUE 65 OR GREATER | discount applies |

### 6.4 Validation Rules

- [ ] Every level-88 references a parent elementary item declared in the same record / variant
- [ ] Every level-88 VALUE matches the parent's PIC / USAGE
- [ ] Range conditions (THRU / OR GREATER) are documented as ranges, not enumerated values
- [ ] No level-88 with overlapping VALUES (silent ambiguity)

### 6.5 Anti-Patterns

- **Level-88 declared with no VALUE** — illegal in standard COBOL; flag as drift.
- **Level-88 VALUE that doesn't match parent PIC** — silent runtime mismatch.
- **Two level-88s with the same VALUE on the same parent** — semantic ambiguity.
