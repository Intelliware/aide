---
slug: redefines-and-variant-handling
title: "REDEFINES and Variant Handling"
applies-to: [re-copybook-library-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 140
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 4. REDEFINES and Variant Handling

For every copybook with `REDEFINES`, name each variant explicitly and document the selector field.

### 4.1 Variant Inventory

| Copybook | Base Field | REDEFINES Field | Base Variant Name | REDEFINES Variant Name | Selector | Selector Values |
|---|---|---|---|---|---|---|
| [BILLAREA] | BA-V1-AREA | BA-V2-AREA | BILLAREA-V1 | BILLAREA-V2 | BA-VERSION | '1' / '2' |
| [TXNREC]   | TXN-DEBIT  | TXN-CREDIT | TXNREC-DEBIT | TXNREC-CREDIT | TXN-KIND | 'D' / 'C' |

### 4.2 Variant Naming Convention

Variants are named `<COPYBOOK>-<DISCRIMINATOR>` where discriminator is short and evident from the selector field. Avoid generic "VARIANT-1" or "VARIANT-A" — they obstruct the data dictionary.

### 4.3 Multi-Level REDEFINES

When REDEFINES nest (a variant itself contains a REDEFINES), document each level. Multi-level REDEFINES are a code smell — most cases reduce to two single-level variants.

### 4.4 Selector-Less REDEFINES (anti-pattern)

When a REDEFINES exists without a level-88 or other discriminator, flag it. The consuming program must rely on context that is not visible in the copybook — usually a sign of accidental drift.

| Copybook | REDEFINES Pair | Why Flagged | Recommendation |
|---|---|---|---|
| [LEGACYREC] | OLD-AREA / NEW-AREA | no selector | introduce a selector or mark deprecated |

### 4.5 Variant Compatibility Rules

| Compatibility | Allowed | Reasoning |
|---|---|---|
| New variant with greater byte size than base | no | breaks every consumer that allocates by base size |
| New variant with smaller byte size | yes (with FILLER pad) | base size unchanged |
| Variant byte size equal to base | yes | canonical case |
