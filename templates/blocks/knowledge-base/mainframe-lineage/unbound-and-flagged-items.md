---
slug: unbound-and-flagged-items
title: "Unbound and Flagged Items"
applies-to: [kb-mainframe-data-lineage]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 190
---

## 9. Unbound and Flagged Items

Catalogue of every item that did not resolve cleanly during the lineage build. Surfaced here so a downstream consumer who follows any other artefact in the tree can look up the flag in one canonical location.

### 9.1 Unbound EXEC SQL Host Variables

Host variables in `EXEC SQL` blocks that did not resolve to a working-storage / linkage field.

| # | Program | Section | EXEC SQL block | Host-Var | Source Lines |
|---|---|---|---|---|---|

(Empty when no unbound vars.)

### 9.2 Unresolved EXEC DLI Segments

Segments named in `EXEC DLI` whose corresponding `IMS-*` copybook is missing from the matched copybook library.

| # | Program | EXEC DLI block | Segment | Candidate Copybook | Source Lines |
|---|---|---|---|---|---|

### 9.3 Dynamic CALL / CICS LINK Sites

CALL / LINK sites with variable target. Candidate targets are listed where derivable from MOVE assignments earlier in the program; resolution to the actual target is left to a run-time-evidence pass (out of scope for static lineage).

| # | Program | Section | Verb | Variable | Candidate Targets | Source Lines |
|---|---|---|---|---|---|---|

### 9.4 Symbolic-Substitution DSNs

JCL DSNs containing `&` (e.g. `&SYSUID`, `&LDATE`, `&PFX..XYZ`). These are not auto-resolved.

| # | Job | Step | DD | Symbolic DSN | Likely Substitution |
|---|---|---|---|---|---|

### 9.5 Programs Not Invoked From Documented JCL

Programs in any contributing `program-data-bindings.json` that no JCL step references via `EXEC PGM=`. Typically callable subprograms invoked via CALL only — surfaced for architect review.

| # | Program | Likely Role | Called By |
|---|---|---|---|

### 9.6 Divergent-Copybook Consumers

Programs that copy a copybook listed in any `copybook-conflicts.md`. Drift visibility.

| # | Program | Copybook | Variant in Use | Canonical Variant |
|---|---|---|---|---|

### 9.7 Unresolved INCLUDE Chains in JCL

INCLUDE references that did not resolve to a member.

| # | Job | INCLUDE Member | Resolution Searched |
|---|---|---|---|

### 9.8 Type-Compatibility Failures

DB2 columns whose type does not match the host-var PIC; nullable columns missing indicator host-vars.

| # | Program | EXEC SQL block | Column | Column Type | Host-Var | Host-Var PIC | Issue |
|---|---|---|---|---|---|---|---|

### 9.9 CICS COMMAREA Byte-Size Mismatches

LINK / XCTL sites where caller `LENGTH(...)` does not match callee LINKAGE 01-level byte size.

| # | Caller | Callee | Caller LENGTH | Callee Byte Size | Difference |
|---|---|---|---|---|---|

### 9.10 Suspicious MOVE Edges

Edges with mismatched PIC / USAGE that may be unintended.

| # | Edge ID | Source PIC/USAGE | Dest PIC/USAGE | Concern |
|---|---|---|---|---|

### 9.11 Resolution Discipline

Each entry in any of the above sections is acceptable per the coverage-rule gate (step 8). Acceptance does NOT mean "no action needed" — it means "the lineage build will GO with these items present." Architects and code-readers should triage:

| Triage Class | Action |
|---|---|
| Investigate before next release | open ticket; resolve at the contributing RE pass |
| Accept indefinitely | deliberate (e.g. dynamic CALL into a strategy table); document the acceptance |
| Mitigate in scheduling / runtime | symbolic DSN with documented site default; runtime PARM populates the variable |

Triage decisions are recorded in the change-tracker, not in this artefact.
