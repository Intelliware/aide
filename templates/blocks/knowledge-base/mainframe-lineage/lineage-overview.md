---
slug: lineage-overview
title: "Mainframe Data Lineage — Overview"
applies-to: [kb-mainframe-data-lineage]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 110
---

## 1. Mainframe Data Lineage — Overview

### 1.1 What This Artefact Is

This artefact tree provides cross-program data lineage for the mainframe components in this project. It is built by `build-mainframe-data-lineage` from the per-repo Part A outputs of `reverse-engineer-copybook-library`, `reverse-engineer-cobol-program`, and `reverse-engineer-jcl-job`.

### 1.2 Questions This Artefact Answers

| Use Case | Read First |
|---|---|
| "Where is field X used?" | `10-lineage-summary.md` (field index) → `03-field-where-used.md` |
| "Which jobs touch DSN Y?" | `10-lineage-summary.md` (dataset index) → `05-job-program-dataset-chain.md` |
| "Which COBOL field maps to DB2 column X.Y?" | `06-db2-host-variable-bindings.md` |
| "Which IMS segment is read into copybook Z?" | `07-ims-segment-bindings.md` |
| "Did this CICS COMMAREA change shape across LINK?" | `08-cics-commarea-bindings.md` |
| "What didn't resolve cleanly?" | `09-unbound-and-flagged-items.md` |
| "How does field A flow into field B?" | `04-move-chain.md` (or `04-move-chain.json` for machine consumers) |

### 1.3 Provenance

| Contributing Repo | Role | Last Verified Commit |
|---|---|---|
| [REPO-SLUG] | copybook-library | [40-char SHA] |
| [REPO-SLUG] | cobol-program | [40-char SHA] |
| [REPO-SLUG] | jcl-job | [40-char SHA] |

### 1.4 How to Refresh

This artefact is overwritten in place when re-built. Re-run `build-mainframe-data-lineage` after:

- Any copybook-library Part B refresh
- Any cobol-program Part A refresh
- Any jcl-job Part A refresh

Hand-editing any artefact in this tree is forbidden — every claim must trace back to a contributing RE pass's feed-files.

### 1.5 Coverage and Flags

The verify step (8) checked:

| Rule | Status |
|---|---|
| Every copybook documented | PASS / FAIL |
| Every program reachable from JCL or flagged | PASS / FAIL |
| Every EXEC SQL host-var resolved or flagged | PASS / FAIL |
| Every IMS segment resolved or flagged | PASS / FAIL |
| CICS COMMAREA byte sizes match | PASS / FAIL |
| Dynamic CALLs flagged | PASS / FAIL |
| Symbolic DSNs flagged | PASS / FAIL |
| `move-chain.json` schema | PASS / FAIL |
| Mermaid render | PASS / FAIL |
| Cross-references valid | PASS / FAIL |

For details, read `09-unbound-and-flagged-items.md`.
