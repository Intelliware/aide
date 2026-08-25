---
slug: faq-and-troubleshooting
title: "FAQ and Troubleshooting"
applies-to: [re-jcl-job-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 360
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 11. FAQ and Troubleshooting

Common issues maintainers and ops hit when working with this JCL repo, and the resolution path.

### 11.1 Why does my job abend with JCL ERROR before any step runs?

Most common causes:
- Symbolic-substitution variable not defined (`&XYZ` referenced but never set)
- INCLUDE member not found
- DD statement referencing a non-existent dataset with `DISP=SHR`
- `EXEC PROC=` naming a PROC that doesn't exist in the active PROCLIB

Check the JES log for the substitution-error or include-not-found message.

### 11.2 Why does STEP020 not run after STEP010 succeeds?

`COND=` is read inversely. `COND=(0,LT,STEP010)` skips STEP020 if `STEP010 RC > 0`. Read the predicate as: "skip this step if the predicate is TRUE."

### 11.3 Why is my GDG generation off by one?

Two common causes:
- A previous run failed mid-job; the `(+1)` was allocated but not catalogued. Use IDCAMS `LISTCAT` to confirm.
- Two steps in the same job both write `(+1)`. The second write rolls the first; intent was usually one output.

### 11.4 Why does my PROC override silently not take effect?

Verify the override syntax. Common errors:
- DD override must be qualified: `//STEP020.OUTPUT DD ...` (not just `//OUTPUT DD ...`)
- Parameter override at EXEC PROC: `EXEC PROC=NAME,INDATE=...` (no extra space)
- DSN override DOES NOT carry over DISP/DCB; you may need to override those too

### 11.5 Why is my SORT producing bad output?

- Missing `SORTOUT` DD or `OUTREC` clause — falls back to default LRECL/RECFM
- Sort key offsets count from byte 1, not 0
- INCLUDE/OMIT filters are applied BEFORE the sort, not after

### 11.6 Why does Control-M say my job is "stuck" but JES shows it as RUN?

Control-M and JES communicate via SMF feeds. Stuck = Control-M hasn't received the SMF type-30 termination record. Causes:
- Job is genuinely still running (long step)
- SMF feed lag (resolves itself within minutes)
- Control-M lost the job in its tables (open ticket)

### 11.7 Repository-Specific FAQs

| Question | Answer |
|---|---|
| [Repo-specific] | [Resolution] |
