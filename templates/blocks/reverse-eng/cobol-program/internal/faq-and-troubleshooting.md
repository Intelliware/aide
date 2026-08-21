---
slug: faq-and-troubleshooting
title: "FAQ and Troubleshooting"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 360
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 15. FAQ and Troubleshooting

Common issues maintainers hit when working in this COBOL repository, and the resolution path.

### 15.1 Why does program X abend with U4038?

Typically SQLCODE -805 (DBRM not bound). Confirm: (a) the BIND step ran for this DBRM in the latest deploy; (b) the package matches the COLLECTION the program runs under. See exec-sql-inventory § 9.5 for DBRMs and bindings.

### 15.2 Why does my COMMAREA arrive truncated?

Caller LENGTH option, callee `LENGTH OF DFHCOMMAREA`, and the COPYBOOK shape may all disagree. Fix in this order:
1. Confirm callee LINKAGE 01-level matches the canonical COMMAREA copybook.
2. Confirm caller passes `LENGTH(LK-LENGTH)` matching the canonical record byte size.
3. Check for `REDEFINES` variants and that BA-VERSION (or equivalent selector) is set.

### 15.3 Why is `CALL 'XYZ'` failing at run time with not-found?

Static `CALL 'XYZ'` requires `XYZ` in the STEPLIB load library. Dynamic `CALL WS-NAME` requires:
- `WS-NAME` populated to a literal at run time
- The named module present in STEPLIB
- `CALL` compiled with `DYNAM` or the program statically linked against a CALL-then-load helper

### 15.4 Why does my MOVE produce garbage?

Most common cause: PIC mismatch between source and receiving field — particularly DISPLAY ↔ COMP-3 conversions. Verify both sides in the working-storage-and-linkage and copy-statements blocks. Run a code-reader review to confirm both fields' canonical record from the matched copybook library.

### 15.5 Why won't my new EXEC SQL compile?

Likely missing `INCLUDE SQLCA` or running before the DB2 precompile step. The compilation pipeline is documented in identification-and-environment § 2.3.

### 15.6 Repository-Specific FAQs

| Question | Answer |
|---|---|
| [Repo-specific] | [Resolution] |
