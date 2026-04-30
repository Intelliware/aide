# reverse-engineer-copybook-library — Overview

## Purpose

Extract a coherent cross-library data dictionary from an existing copybook library, producing two complementary parts: Part A (full internals for copybook maintainers and data architects) and Part B (canonical record catalogue + field index for application developers and integrators).

## Position in the flow

```
analyze-repository  ──▶  reverse-engineer-copybook-library  ──▶  build-knowledge-base
                              │                                            │
                              ├─ Part A → stays in source repo             └─▶ build-mainframe-data-lineage
                              ├─ Part B → KB                                  (cross-program traceability)
                              └─ copybook-record-graph.json
                                 → input to lineage + COBOL-program RE
```

In a mainframe monorepo this skill runs FIRST so:
- `reverse-engineer-cobol-program` can resolve `COPY` statements against an already-built canonical record graph
- `build-mainframe-data-lineage` has the canonical field set against which "where-used" claims can be made

## Canonical RE foundations

- **Guiding Principle:** "If you cannot point to the line of source code that proves a documented behavior, do not document it as fact." For a copybook library, "source code" is the `.cpy` file — NOT a Word data dictionary, NOT a vendor extract, NOT a tribal-knowledge wiki page.
- **Six AI Principles** apply.
- **7-Step Workflow** is the inner loop per copybook.

## Documentation model — two parts

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Copybook maintainers, data architects | Per-copybook record dictionary; group hierarchy; naming-convention buckets; duplicate / divergent detection; deprecated copybooks; maintenance rules | Stays in source repo |
| Part B | Application developers, integrators | Coherent data dictionary across the whole library; canonical record catalogue; field index; "use this copybook for X" guidance | KB |

**Why two parts?** A per-file flat dump (Part A only) cannot answer "which copybook should I use for customer addresses" or "which records contain the field `CUST-STATUS`." The cross-library data dictionary in Part B answers exactly those questions.

## Why the .cpy file is the source of truth

Word/Excel data dictionaries drift from copybooks faster than any other artefact in a mainframe shop because copybook edits are routine and dictionary edits are not. The verification step explicitly checks every documented level, PIC, USAGE, REDEFINES, and OCCURS against the .cpy source — never against secondary documentation.

## Three mandatory feed-files for downstream skills

Beyond Part A and Part B blocks, this skill writes three additional artefacts at the Part-B directory root, used by `reverse-engineer-cobol-program` and `build-mainframe-data-lineage`:

- `copybook-record-graph.json` — canonical record graph: every copybook normalised into named records, REDEFINES collapsed into named variants, OCCURS expanded to indexed positions
- `data-dictionary.md` — human-readable rendering organised by naming-convention bucket
- `copybook-conflicts.md` — divergent-layout report (same name, different shapes)

Without `copybook-record-graph.json`, downstream skills cannot perform cross-program field-level lineage.

## Extraction stages

1. **Discovery and Inventory** — every `.cpy`, byte sizes, last-modified, naming-convention buckets, duplicates by content. Run `steps/scaffold.md`.
2. **Per-Copybook Record Extraction** — every level, PIC, USAGE, OCCURS, REDEFINES, FILLER, VALUE, level-88 condition names.
3. **Variants and Conflicts** — name each REDEFINES variant; expand each OCCURS DEPENDING ON; produce `copybook-conflicts.md`; flag deprecated copybooks.
4. **Cross-Library Data Dictionary** — canonical record graph; field index; consumer-facing dictionary by naming-convention bucket; "use this copybook for X" guidance.
5. **Verification and Finalization** — run `steps/verify.md`; verify subset rule; verify canonical record graph; finalize change-tracker.

This skill uses **5 stages** — variants and conflicts are integrated with extraction rather than treated as a separate cross-cutting pass because they cannot be detected per file in isolation.

## Compositions

- `templates/compositions/re-copybook-library-internal.yaml` — Part A
- `templates/compositions/re-copybook-library-consumer.yaml` — Part B

## Hand-off

After verification passes, hand off by name to `build-knowledge-base`. In mainframe stacks, additionally hand off to `reverse-engineer-cobol-program` (next in monorepo order) and ultimately to `build-mainframe-data-lineage`.
