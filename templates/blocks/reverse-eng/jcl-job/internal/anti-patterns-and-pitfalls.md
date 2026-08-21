---
slug: anti-patterns-and-pitfalls
title: "Anti-Patterns and Pitfalls"
applies-to: [re-jcl-job-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 350
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 10. Anti-Patterns and Pitfalls

Common JCL anti-patterns observed in this repo, recorded so future maintainers can avoid them.

### 10.1 DD and Dataset Anti-Patterns

- **DISP=(NEW,CATLG,CATLG) on output** — silently catalogs failed runs; downstream sees corrupt data.
- **`DCB=*.STEP010.OUTDD` referential DCB** — fragile; breaks when STEP010 is reordered.
- **GDG `(+1)` written from multiple steps in the same job** — second `(+1)` write rolls the first; intent is usually a single output.
- **DSN with hardcoded date suffix** — `PROD.BILLING.20260429` — collides with re-runs; use GDG.

### 10.2 PROC Anti-Patterns

- **PROC parameter with no default and no override** — silent JCL error at run time.
- **PROC override that adds a new step** — only DD overrides are supported; adding steps requires JCL refactor, not override.
- **Symbolic name colliding with PROC parameter** — silent shadowing.

### 10.3 INCLUDE Anti-Patterns

- **Circular INCLUDE** — see proc-and-include-expansion § 3.5.
- **INCLUDE inside an `IF/ENDIF`** — INCLUDE expansion is unconditional; the IF only governs the resulting steps' execution.
- **INCLUDE that contains its own JOB statement** — illegal; flagged.

### 10.4 Condition-Code Anti-Patterns

- **`COND=` referencing a step that doesn't exist** — silent skip.
- **`IF (RC > 0) THEN ... ENDIF` masking abends** — abends do not produce a numeric RC; the predicate is always false on abend.
- **Cleanup step gated on `EVEN` but allocating new datasets** — the cleanup may run on abend with corrupt working state.

### 10.5 Scheduler Anti-Patterns

- **In-JCL Control-M `//*$$ ORDER` that conflicts with the scheduler-side definition** — silent inconsistency.
- **JES2 `/*JOBPARM SYSAFF=` to a system that doesn't exist** — job hangs on input queue.

### 10.6 Symbolic-Substitution Anti-Patterns

- **Unresolved symbolic at run time** — `&SOMETHING` not defined; JES emits a substitution error and abends.
- **Symbolic with an embedded `.` consumed unexpectedly** — `&PFX..XYZ` resolves PFX then XYZ; double-dot syntax is non-obvious.

### 10.7 Repository-Specific Pitfalls

| Pitfall | Affected Jobs | Recommendation |
|---|---|---|
| [Description] | [list] | [recommended fix] |
