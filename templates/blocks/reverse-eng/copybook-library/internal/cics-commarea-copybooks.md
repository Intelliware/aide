---
slug: cics-commarea-copybooks
title: "CICS COMMAREA Copybooks"
applies-to: [re-copybook-library-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 180
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 8. CICS COMMAREA Copybooks

CICS COMMAREA copybooks define the per-program contract between caller and callee. Their byte-stable shape is part of the public API of every CICS program that consumes them.

### 8.1 COMMAREA Copybook Inventory

| Copybook | Used By | Direction | Variants | Notes |
|---|---|---|---|---|
| [LSCOMM]      | BILLINQ, BILLUPD | input + output | V1, V2 | selector BA-VERSION |
| [LSTXY1IN]    | TXY1 transaction | input | (none) | 80-byte fixed message |
| [LSDISPCH]    | dispatcher LINK programs | input + output | (none) | adds DISPATCH-STATUS at end |

### 8.2 Byte-Layout Discipline

CICS LINK passes a `LENGTH` option matching the COMMAREA record byte size. Any change to a COMMAREA copybook must:
1. Maintain or extend the byte size only at the trailing `FILLER`
2. Add a new variant via REDEFINES + a new selector value (BA-VERSION='3', etc.)
3. Never reorder existing fields

Document the byte size of every variant.

| Copybook | Variant | Byte Size | Notes |
|---|---|---|---|
| [LSCOMM] | BILLAREA-V1 | 200 | original layout |
| [LSCOMM] | BILLAREA-V2 | 200 | added MULTIPLIER; same total length |
| [LSDISPCH] | (single) | 100 | trailing FILLER reservoir of 16 bytes |

### 8.3 Channels and Containers (modern CICS)

For programs migrated to CICS channels and containers, document the per-container layout copybook here too. Channels and containers replace the legacy COMMAREA model.

| Channel | Container | Layout Copybook | Direction |
|---|---|---|---|
| [BILLING-CHAN] | CUST-RECORD-CONT | CUSTREC | input |
| [BILLING-CHAN] | RESULT-CONT      | RESULTREC | output |

### 8.4 Variant Selector Discipline

Every CICS COMMAREA copybook with REDEFINES must declare a selector field at the head of the record (typically `BA-VERSION` or equivalent). The selector MUST appear OUTSIDE every REDEFINES (i.e., in the unredefined head of the record). Selector-free REDEFINES is flagged as anti-pattern.

### 8.5 Pseudo-Conversational State

For pseudo-conversational CICS programs, the COMMAREA carries cross-pass state. Document which fields are state vs. which are inputs vs. outputs.

| Copybook | Field | Role | Notes |
|---|---|---|---|
| [LSCOMM] | BA-CONV-STATE | state | preserved across RETURN/TRANSID re-entry |
| [LSCOMM] | BA-CUST-ID    | input | populated by caller; not modified |
| [LSCOMM] | BA-RESULT     | output | written by callee |
