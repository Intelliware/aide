---
slug: working-storage-and-linkage
title: "Working-Storage, Local-Storage, Linkage Sections"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 140
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 4. Working-Storage, Local-Storage, Linkage Sections

For each program, document the DATA DIVISION sections that live outside the FILE SECTION. The file-section content lives in the file-control-and-fd-bindings block.

### 4.1 WORKING-STORAGE Section (per program)

For each top-level (`01`) item, summarise the group and link to source lines. For elementary items declared at `01` (rare in production code), document directly here.

| Program ID | 01-Level | Purpose | Source / Copybook | Source Lines |
|---|---|---|---|---|
| [PROGNAME] | [WS-COUNTERS] | [counters used in 2000-PROCESS] | [inline / COPY WSCNTRS] | [file:N-M] |

### 4.2 LOCAL-STORAGE Section

LOCAL-STORAGE is significant for re-entrant or concurrent programs (CICS, IMS-MPP, multi-threaded batch). Flag any program that mixes WORKING-STORAGE state with LOCAL-STORAGE — that is usually a bug.

| Program ID | 01-Level | Notes |
|---|---|---|
| [PROGNAME] | [LS-WORK-AREAS] | [thread-safe; contrast with WS-COUNTERS] |

### 4.3 LINKAGE Section

For each program, document the LINKAGE shape exposed to callers (CICS COMMAREA, callable subprogram parameters, IMS PCB list). Pair with PROCEDURE DIVISION USING clause.

| Program ID | LINKAGE 01-Level | Caller Type | Copybook | Bound to | Source Lines |
|---|---|---|---|---|---|
| [PROGNAME] | [LK-COMMAREA] | CICS LINK / batch CALL / IMS-BMP | [LSCOMM] | [PROCEDURE DIVISION USING LK-COMMAREA] | [file:N-M] |

### 4.4 SQLCA / SQLDA / DFHEIBLK Inclusions

Programs with embedded EXEC SQL include `SQLCA` (and possibly `SQLDA`); CICS programs include `DFHEIBLK` and `DFHCOMMAREA` automatically. Note where these come from (auto-included by the precompiler vs. explicit `COPY`).
