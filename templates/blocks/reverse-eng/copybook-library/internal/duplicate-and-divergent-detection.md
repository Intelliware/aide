---
slug: duplicate-and-divergent-detection
title: "Duplicate and Divergent Detection"
applies-to: [re-copybook-library-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 190
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 9. Duplicate and Divergent Detection

Same-name copybooks with byte-different content across folders, branches, or libraries is one of the highest-impact failure modes in mainframe shops. This section documents every case found, classifies each (legitimate variant vs. drift), and proposes resolution.

### 9.1 Divergent-Layout Inventory

| Copybook Name | Locations | Byte-Hash Differences | Classification | Resolution |
|---|---|---|---|---|
| [CUSTREC] | COPYBOOK/CUSTREC.cpy, COPYBOOK.LEGACY/CUSTREC.cpy | 7 fields vs. 6 fields; CUST-AMOUNT COMP-3 vs. DISPLAY | drift | LEGACY excluded from new programs; flag any program still using LEGACY |
| [TXNREC]  | COPYBOOK/TXNREC.cpy, COPYBOOK.UAT/TXNREC.cpy | UAT adds TXN-TRACE-ID at trailing FILLER | legitimate variant | promote UAT to canonical; deprecate plain TXNREC |
| [WSDATE]  | COPYBOOK/WSDATE.cpy, COPYBOOK.SHARED/WSDATE.cpy | identical | not divergent | safe to consolidate |

### 9.2 Detection Method

| Method | Description |
|---|---|
| Byte-level hash | SHA-1 over normalised whitespace and case-folded source |
| Structural hash | hash over the canonical record graph (post-REDEFINES, post-OCCURS expansion) — semantic equivalence even if formatting differs |

### 9.3 Drift Classification

| Class | Definition | Example |
|---|---|---|
| **Drift** | Same intent, divergent layout — a bug | CUSTREC adds a field in COPYBOOK but not in LEGACY |
| **Legitimate variant** | Different intent, deliberate divergence | UAT adds a tracing field; expected to differ |
| **Aliased duplicate** | Same intent, identical layout, multiple paths | safe to consolidate; flag as drift risk |

### 9.4 Per-Program Impact (forward reference to lineage)

Every program that copies a divergent copybook is flagged in the lineage skill's `field-where-used.md`. This section documents the divergence; the lineage skill amplifies it across consumers.

### 9.5 Resolution Protocol

1. Classify each divergence (drift / legitimate / aliased)
2. For drift: reconcile to a single canonical layout; deprecate the others
3. For legitimate variant: rename one to make the divergence explicit (e.g. `TXNREC` → `TXNREC-UAT`)
4. For aliased duplicate: pick one canonical path; symlink or merge the others
5. Track resolution in the change-tracker (Parts Affected: A)
