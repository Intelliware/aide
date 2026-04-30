# reverse-engineer-copybook-library — Worked Example

## Scenario

User has a billing-mainframe repo at `~/code/billing-mainframe/COPYBOOK/` containing 387 `.cpy` files: customer records, billing-area COMMAREAs, DB2 host-variable copybooks (DCLGEN output), IMS segment copybooks, and shared working-storage groups. Naming convention uses prefixes `IO-` (file records), `WS-` (working-storage groups), `LS-` (linkage / commarea), `DB2-` (DCLGEN), `IMS-` (DBD-derived). 14 copybooks have divergent layouts of the same name across `COPYBOOK/` and `COPYBOOK.LEGACY/`.

User says: *"Document the copybook library at ~/code/billing-mainframe/COPYBOOK."*

## Stage 1 — Discovery and Inventory

```
Total .cpy files: 387
By naming bucket:
  IO-       142  (file records)
  WS-        78  (shared working-storage)
  LS-        51  (linkage / commareas)
  DB2-       63  (DCLGEN output)
  IMS-       28  (DBD-derived)
  (other)    25  (no recognised prefix — flagged for user review)

Duplicate / divergent layouts: 14 copybook names appear in both
COPYBOOK/ and COPYBOOK.LEGACY/ with byte-different content.

Deprecated copybooks (header marker `*DEPRECATED*`): 9
```

`steps/scaffold.md` proposes Part A as a tree under `docs/copybook-library-internal/` and Part B as a tree under the KB at `source-docs/billing-copybook/copybook-library-consumer/`. User approves naming buckets and confirms `COPYBOOK.LEGACY/` is in scope (read-only verification of drift) but not the source of truth.

## Stage 2 — Per-Copybook Record Extraction

For CUSTREC.cpy:

```
01  CUST-RECORD.
    05  CUST-ID            PIC 9(10).
    05  CUST-STATUS        PIC X.
        88  CUST-ACTIVE    VALUE 'A'.
        88  CUST-INACTIVE  VALUE 'I'.
        88  CUST-PURGE     VALUE 'P'.
    05  CUST-NAME          PIC X(40).
    05  CUST-ADDRESS.
        10  CUST-LINE1     PIC X(35).
        10  CUST-LINE2     PIC X(35).
        10  CUST-CITY      PIC X(25).
        10  CUST-STATE     PIC X(2).
        10  CUST-POSTAL    PIC X(10).
    05  CUST-AMOUNT        PIC S9(9)V99 USAGE COMP-3.
    05  CUST-FILLER        PIC X(20).
```

Documented levels (8 elementary, 1 group `CUST-ADDRESS`, 1 root group, 3 level-88), every PIC, USAGE (COMP-3 on `CUST-AMOUNT` recorded explicitly), no REDEFINES, no OCCURS.

For BILLAREA.cpy (a CICS COMMAREA copybook with REDEFINES):

```
01  BILLAREA.
    05  BA-VERSION         PIC X.
        88  BA-V1          VALUE '1'.
        88  BA-V2          VALUE '2'.
    05  BA-V1-AREA.
        10  BA-V1-AMOUNT   PIC S9(9)V99 COMP-3.
        10  BA-V1-CURRENCY PIC X(3).
        10  BA-V1-FILLER   PIC X(94).
    05  BA-V2-AREA REDEFINES BA-V1-AREA.
        10  BA-V2-AMOUNT   PIC S9(13)V99 COMP-3.
        10  BA-V2-CURRENCY PIC X(3).
        10  BA-V2-MULTIPLIER PIC S9(5)V9(4) COMP-3.
        10  BA-V2-FILLER   PIC X(80).
```

## Stage 3 — Variants and Conflicts

For BILLAREA: two named variants — `BILLAREA-V1` (BA-V1-AREA) and `BILLAREA-V2` (BA-V2-AREA, REDEFINES). Variant selector is `BA-VERSION` (level-88 condition names `BA-V1` / `BA-V2`).

For BILLDETLS.cpy:

```
01  BILL-DETAILS.
    05  BILL-LINE-COUNT    PIC 9(4).
    05  BILL-LINES OCCURS 0 TO 999 TIMES DEPENDING ON BILL-LINE-COUNT.
        10  BL-PRODUCT     PIC X(15).
        10  BL-QUANTITY    PIC 9(7).
        10  BL-UNIT-PRICE  PIC S9(9)V99 COMP-3.
```

Expanded into canonical positions: `BILLAREA[0]…BILLAREA[998]`, controlling field documented as `BILL-LINE-COUNT`.

`copybook-conflicts.md` lists 14 divergent copybooks. Example:

```
CUSTREC
  COPYBOOK/CUSTREC.cpy        — 7 fields, no FILLER, CUST-AMOUNT COMP-3
  COPYBOOK.LEGACY/CUSTREC.cpy — 6 fields (no CUST-POSTAL), CUST-AMOUNT DISPLAY
Classification: drift (LEGACY predates a 2023-Q3 schema change). Recommendation: do NOT cite LEGACY in any new program; flag any program that still copies LEGACY.
```

## Stage 4 — Cross-Library Data Dictionary

`copybook-record-graph.json` produced. Field index excerpt:

```
CUST-AMOUNT
  CUSTREC          ¦ CUST-RECORD          ¦ 05 ¦ S9(9)V99 ¦ COMP-3
  CUSTREC.LEGACY   ¦ CUST-RECORD          ¦ 05 ¦ 9(11)V99 ¦ DISPLAY
  IO-CUST-EXTRACT  ¦ CUST-EXTRACT-RECORD  ¦ 10 ¦ S9(9)V99 ¦ COMP-3
```

"Use this copybook for X" guidance excerpt:

```
Customer master record         → CUSTREC (current; not the LEGACY variant)
Customer extract for billing   → IO-CUST-EXTRACT
Billing CICS commarea          → BILLAREA (variant per BA-VERSION)
DB2 host-variable for ACCOUNTS → DB2-ACCOUNTS (DCLGEN; do not edit by hand)
IMS CUSTSEG segment            → IMS-CUSTSEG
```

## Stage 5 — Verification and Finalization

`steps/verify.md`:

- Completeness: 387/387 copybooks documented. Pass.
- Accuracy: spot-checked 12 (4 IO-, 3 WS-, 2 LS-, 2 DB2-, 1 IMS-). 1 failure — `IO-CUST-EXTRACT` documented as having `CUST-LINE2` PIC X(35), actual source is X(40). Corrected.
- Consistency: no internal-only commentary leaked into Part B.
- Variants and conflicts:
  - 14 conflicts documented in `copybook-conflicts.md`. Pass.
  - Every REDEFINES variant has a name. Pass.
  - Every OCCURS DEPENDING ON has a controlling field documented. Pass.
- Canonical record graph:
  - 387 copybook entries; 401 named variants (14 extras for REDEFINES variants). Pass.
  - JSON validates against schema in INPUTS-OUTPUTS.md. Pass.

Verification report: 1 failure, 0 warnings. GO after correction.

## Outputs

```
~/code/billing-mainframe/COPYBOOK/docs/copybook-library-internal/
  ├── 01-library-overview.md
  ├── 02-naming-convention-buckets.md
  ├── 03-per-copybook-record-reference.md
  ├── 04-redefines-and-variant-handling.md
  ├── 05-occurs-and-depending-on.md
  ├── 06-level-88-condition-names.md
  ├── 07-db2-and-ims-host-variable-copybooks.md
  ├── 08-cics-commarea-copybooks.md
  ├── 09-duplicate-and-divergent-detection.md
  ├── 10-deprecated-copybooks.md
  ├── 11-maintenance-rules.md
  ├── 12-anti-patterns-and-pitfalls.md
  ├── extraction-status.md
  └── CHANGE-TRACKER.md

<KB>/source-docs/billing-copybook/copybook-library-consumer/
  ├── 01-how-to-pick-the-right-copybook.md
  ├── 02-canonical-record-catalogue.md
  ├── 03-field-index.md
  ├── 04-naming-convention-key.md
  ├── 05-copy-with-replacing-patterns.md
  ├── 06-integration-examples.md
  ├── copybook-record-graph.json
  ├── data-dictionary.md
  └── copybook-conflicts.md
```

## Hand-off

> "Reverse-engineering of billing-copybook is complete. Next, run `reverse-engineer-cobol-program` for the COBOL programs — it will resolve each `COPY` against the canonical record graph produced here."
