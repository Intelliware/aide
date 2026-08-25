---
slug: anti-patterns-and-pitfalls
title: "Anti-Patterns and Pitfalls"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 350
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 14. Anti-Patterns and Pitfalls

Common COBOL anti-patterns observed in this repo, recorded so future maintainers can avoid them.

### 14.1 Data-Movement Anti-Patterns

- **`MOVE CORRESPONDING` across mismatched groups** — names match but PIC/USAGE differ. Silently corrupts.
- **Implicit `MOVE` between DISPLAY and packed-decimal** — the conversion happens, but truncation/rounding can be unintended.
- **`MOVE` with `JUSTIFIED RIGHT` on receiving fields** — left-padding behaviour surprises new maintainers.

### 14.2 Control-Flow Anti-Patterns

- **`PERFORM THRU` across long ranges** — fragile when paragraphs are reordered.
- **`GO TO` outside paragraph boundary** — modern COBOL forbids; legacy code may still use.
- **Falling through paragraph boundaries** — paragraphs that depend on falling through to the next paragraph instead of an explicit `PERFORM`.

### 14.3 EXEC SQL Anti-Patterns

- **Cursor opened but not always closed** — leaks DB2 thread package state.
- **`SELECT *` in production code** — implicit dependency on column order.
- **No SQLCODE check after EXEC SQL** — silent failures.
- **`COMMIT` inside a CALLed subprogram** — leaks transaction commits across reusable code.

### 14.4 EXEC CICS Anti-Patterns

- **`HANDLE CONDITION ERROR` with no specific handlers** — masks all exceptions.
- **`READ` with `UPDATE` left hanging without `REWRITE` / `UNLOCK`** — record-level locking pile-up.
- **Reading WORKING-STORAGE state across pseudo-conversational RETURN** — non-deterministic; only LOCAL-STORAGE / COMMAREA survives.

### 14.5 EXEC DLI Anti-Patterns

- **Status code ignored after every nth call** — catastrophic.
- **CHKP not aligned with DB transaction boundary** — corrupts on restart.

### 14.6 Repository-Specific Pitfalls

| Pitfall | Programs Affected | Mitigation |
|---|---|---|
| [Description] | [list] | [recommended fix] |
