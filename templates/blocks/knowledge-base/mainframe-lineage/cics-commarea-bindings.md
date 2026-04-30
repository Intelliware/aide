---
slug: cics-commarea-bindings
title: "CICS COMMAREA Bindings"
applies-to: [kb-mainframe-data-lineage]
requires-decision-from: [code-reader]
optional: false
order-hint: 180
---

## 8. CICS COMMAREA Bindings

For every CICS LINK / XCTL chain in any contributing program, document the caller / callee COMMAREA shape, byte size, variant selector, and pseudo-conversational state.

### 8.1 Per-LINK / XCTL Section

For each LINK or XCTL site, render:

```
### [CALLER-PROGRAM].[SECTION] → [CALLEE-PROGRAM]    (verb=LINK/XCTL)
Source lines: [PROGRAM.cbl:N-M]

Caller side:
  COMMAREA layout: 01 LK-COMMAREA COPY LSCOMM (variant=BILLAREA-V2 by BA-VERSION='2')
  Byte length:     200 (from LSCOMM canonical record)
  LENGTH option:   LENGTH(LK-LENGTH), where LK-LENGTH = +200  ✓ matches

Callee side:
  LINKAGE 01-level: 01 LK-COMMAREA COPY LSCOMM (variant=BILLAREA-V2)
  Byte length:      200  ✓
  PROCEDURE DIVISION USING LK-COMMAREA  ✓
```

### 8.2 Variant Selector Validation

For COMMAREA copybooks with REDEFINES variants (e.g. BILLAREA-V1 / BILLAREA-V2 selected by BA-VERSION), confirm:

- Caller sets the selector field before LINK
- Callee reads the selector and selects the correct variant
- Both sides agree on the selector field name and valid values

Mismatches (caller doesn't set selector; callee uses a different selector field; selector values disagree) are flagged in `09-unbound-and-flagged-items.md` § 9.

### 8.3 Byte-Size Mismatches

A LINK / XCTL whose caller `LENGTH(...)` does not match the callee LINKAGE 01-level byte size is a critical issue — silently truncates the COMMAREA. Flagged in § 9.

Common causes:
- Caller uses one variant of a REDEFINES copybook; callee uses a different variant with different size (impossible if the REDEFINES rules are followed, but flag if observed)
- Caller copies an outdated copybook version
- Hand-rolled LINKAGE on the callee that doesn't reuse the canonical copybook

### 8.4 Channels and Containers

For programs migrated to CICS channels and containers (modern CICS), the LINK form is:

```
EXEC CICS LINK PROGRAM('XYZ')
     CHANNEL('BILLING-CHAN')
END-EXEC
```

with per-container PUT / GET. Document each container:

```
### [CALLER] → [CALLEE]    (channel-based LINK)
Channel: BILLING-CHAN
Containers (from caller):
  PUT  CUST-RECORD-CONT (FROM(CUST-RECORD), copybook=CUSTREC)
  PUT  AMOUNT-CONT      (FROM(WS-AMOUNT))
Containers (from callee):
  GET  CUST-RECORD-CONT (INTO(CUST-RECORD), copybook=CUSTREC)
  GET  AMOUNT-CONT      (INTO(LK-AMOUNT))
  PUT  RESULT-CONT      (FROM(LK-RESULT))
```

### 8.5 Pseudo-Conversational State

For pseudo-conversational programs (CICS RETURN with COMMAREA between user interactions), document the cross-pass state preserved in COMMAREA. Detail lives in the cobol-program Part A's `commarea-and-linkage-contract` consumer block; this section cross-links.

### 8.6 Unresolved LINK Targets

LINK / XCTL with `PROGRAM(WS-NAME)` (variable target) is the CICS analogue of dynamic CALL. Flagged in `09-unbound-and-flagged-items.md` § 3 (same section as dynamic CALL); candidate targets are listed if traceable from MOVE assignments to `WS-NAME`.
