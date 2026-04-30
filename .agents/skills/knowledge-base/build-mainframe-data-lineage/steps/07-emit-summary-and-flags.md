---
slug: 07-emit-summary-and-flags
sequence: 7
depends-on-prior: true
---

# Step 7: Emit Unbound and Flagged + Summary + Overview

Produce the three remaining artefacts: `09-unbound-and-flagged-items.md`, `10-lineage-summary.md`, and `01-lineage-overview.md`. These wrap the lineage tree with consumer-facing navigation and the catalogue of items that did not resolve cleanly during steps 2–6.

## Why

Lineage is produced from imperfect inputs (dynamic CALLs, symbolic DSNs, opaque SQL). Surfacing what didn't resolve in one place is non-negotiable: a downstream consumer who follows `02-copybook-where-used.md` and finds a mention of a flagged item must be able to look up the flag in one canonical location.

The summary and overview are the entry points for the artefact tree.

## Inputs

- All flags accumulated by steps 2–6 (in-memory or persisted as a build-time scratch file)
- The artefact tree produced so far

## Process — Unbound and Flagged

Render `09-unbound-and-flagged-items.md` as a categorised listing:

### 1. Unbound EXEC SQL host variables

Host variables that did not resolve to a working-storage or linkage field. Record the program, the EXEC SQL block, and the unresolved host-var name.

### 2. Unresolved EXEC DLI segments

Segments named in `EXEC DLI` whose corresponding IMS- copybook is missing from the matched copybook library. Record the program, the segment, and the candidate copybook name.

### 3. Dynamic CALL sites

CALL sites with `CALL WS-NAME` form. Record the program, the section, the variable name, and the candidate target programs (drawn from MOVE assignments to `WS-NAME` earlier in the same program — these are the LIKELY-resolved targets, not confirmed ones).

### 4. Symbolic-substitution DSNs

JCL DSNs containing `&` (e.g. `&SYSUID`, `&LDATE`, `&PFX..XYZ`). Record the job, the step, the DD, and the symbolic DSN.

### 5. Programs not invoked from documented JCL

Programs in `program-data-bindings.json` that no JCL step references via `EXEC PGM=`. Record the program. (These are typically callable subprograms invoked via CALL only — that is acceptable, but the flag surfaces them.)

### 6. Divergent-copybook consumers

Programs that copy a copybook listed in any `copybook-conflicts.md`. Record the program, the copybook, and the variant in use.

### 7. Unresolved INCLUDE chains in JCL

INCLUDE references in JCL that did not resolve to a member. Record the job and the INCLUDE name.

### 8. Type-compatibility flags

DB2 columns whose type does not match the host-var PIC; nullable columns missing indicator host-vars. Record the program, the EXEC SQL block, the column, and the host-var.

### 9. CICS COMMAREA byte-size mismatches

LINK / XCTL sites where caller `LENGTH(...)` does not match callee LINKAGE 01-level byte size. Record both sides.

### 10. Suspicious MOVE edges

`MOVE` between fields with mismatched PIC / USAGE that are not flagged as legitimate conversions (e.g. unintended DISPLAY → COMP-3). Record the edge ID from `04-move-chain.json`.

## Process — Summary

Render `10-lineage-summary.md` as a top-level keyed index:

### 1. Quick stats

```
Lineage built: YYYY-MM-DD HH:MM
Contributing repos:
  copybook-library:  billing-copybook (387 copybooks; 401 variants)
  cobol-program:     billing-cobol    (142 programs)
  jcl-job:           billing-jcl      (64 jobs; 219 steps)
Coverage rule outcomes (per step 8): all PASS / 0 failures
Unbound and flagged items: 18 dynamic CALLs, 4 symbolic DSNs, ...
```

### 2. Top-level field index

A flat list of canonical field names with hyperlinks back to `03-field-where-used.md`. Sorted alphabetically. This is the consumer's "I need to look up field X" entry point.

### 3. Top-level copybook index

A flat list of copybook names with hyperlinks back to `02-copybook-where-used.md`. Sorted alphabetically.

### 4. Top-level program index

A flat list of program IDs with their copybook list, EXEC SQL/CICS/DLI counts, and a link to `05-job-program-dataset-chain.md`.

### 5. Top-level dataset index

A flat list of distinct DSNs (with GDG bases) and the jobs that read or write each.

## Process — Overview

Render `01-lineage-overview.md` as a navigation guide:

### 1. What's in this artefact

A short prose summary of the artefact tree's purpose and the questions it answers.

### 2. How to navigate

Per use case, point the reader at the right artefact:

| Use case | Read first |
|---|---|
| "Where is field X used?" | `10-lineage-summary.md` (field index) → `03-field-where-used.md` |
| "Which jobs touch DSN Y?" | `10-lineage-summary.md` (dataset index) → `05-job-program-dataset-chain.md` |
| "Which COBOL field maps to DB2 column X.Y?" | `06-db2-host-variable-bindings.md` |
| "Did this CICS COMMAREA change shape?" | `08-cics-commarea-bindings.md` |
| "What didn't resolve cleanly?" | `09-unbound-and-flagged-items.md` |

### 3. How to refresh

When a contributing RE pass is re-run (because copybooks / programs / JCL changed), this skill must be re-run. The artefact is overwritten in place. Document the trigger:

- After any copybook-library Part B refresh
- After any cobol-program Part A refresh
- After any jcl-job Part A refresh

### 4. Provenance

For each contributing repo, record `last_verified_against_commit` (full 40-char SHA from step 1).

## Output

`<KB>/lineage/mainframe/01-lineage-overview.md`, `09-unbound-and-flagged-items.md`, and `10-lineage-summary.md` populated.

## Halt conditions

- An accumulated flag references an item not in the artefact tree — indicates an internal logic error in steps 2–6; halt and investigate

## Common mistakes

- Hiding flags in a small footnote — they belong in their own artefact
- Auto-resolving dynamic CALLs based on the candidate list — leave them flagged; resolution requires run-time evidence
- Forgetting to surface the divergent-copybook consumers — drift visibility is the highest-impact use case for the flag artefact
- Producing a summary that duplicates the per-artefact content — the summary is an index, not a copy
