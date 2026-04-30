# reverse-engineer-copybook-library — Inputs and Outputs

## Inputs

### Required

- **Repository path** — absolute path to the copybook library (or copybook directory inside a mainframe monorepo).
- **Source version** — Endevor / ChangeMan / Panvalet package, or current main commit.

### Optional

- Existing data dictionary, naming-convention guide, deprecated-copybook list (treat as input to verify, not as a replacement)
- A pointer to the matched COBOL program repo (helps confirm "use this copybook for X" guidance)
- Sample DB2 DCLGEN output (when copybooks are DB2-host-variable copybooks generated from DDL)

### Elicitation

Reference: `references/elicitation-patterns/repo-scope-discovery.md`. Used to confirm:
- Repository path and version
- Naming-convention buckets in use (`WS-`, `IO-`, `LS-`, `DB2-`, `CICS-`, etc.) and their meaning
- Whether DB2 DCLGEN copybooks are mixed in (they are auto-generated from DDL — flag separately)
- Whether IMS DBD-derived copybooks are mixed in
- Scope exclusions (deprecated folders, vendor-shipped copybooks, generated copybooks)

### Project.toml driving values

```toml
[[project.repos]]
code = "billing-copybook"
name = "Billing Copybook Library"
path = "../billing-mainframe/COPYBOOK"
role = "copybook-library"
type = "enterprise-cobol-zos"
```

## Outputs

### Part A — Internal documentation (stays in source repo)

Default location: `<repo>/docs/copybook-library-internal/` driven by `re-copybook-library-internal.yaml`. Coverage:

- Library overview
- Naming-convention buckets
- Per-copybook record reference
- REDEFINES and variant handling
- OCCURS and DEPENDING ON
- Level-88 condition names
- DB2 and IMS host-variable copybooks
- CICS COMMAREA copybooks
- Duplicate and divergent detection
- Deprecated copybooks
- Maintenance rules
- Anti-patterns and pitfalls

### Part B — Consumer documentation (KB)

Location: `{paths.knowledge_base_path}/source-docs/<repo-slug>/copybook-library-consumer/` driven by `re-copybook-library-consumer.yaml`. Coverage:

- How to pick the right copybook
- Canonical record catalogue
- Field index
- Naming-convention key
- COPY with REPLACING patterns
- Integration examples

### Mandatory extracted artefacts (this skill only)

Written at the canonical Part-B directory root, not driven by the block list. Used as input to `reverse-engineer-cobol-program` and `build-mainframe-data-lineage`:

- `copybook-record-graph.json` — every copybook normalised. Schema:

  ```json
  {
    "library_slug": "billing-copybook",
    "source_version": "ENDEVOR-PKG-2026Q2-04",
    "records": [
      {
        "copybook": "CUSTREC",
        "variants": [
          {
            "name": "CUST-RECORD",
            "fields": [
              { "level": "01", "name": "CUST-RECORD" },
              { "level": "05", "name": "CUST-ID",     "pic": "9(10)",    "usage": "DISPLAY" },
              { "level": "05", "name": "CUST-STATUS", "pic": "X",        "usage": "DISPLAY",
                "level-88": [
                  { "name": "CUST-ACTIVE",   "value": "'A'" },
                  { "name": "CUST-INACTIVE", "value": "'I'" }
                ] },
              { "level": "05", "name": "CUST-AMOUNT", "pic": "S9(9)V99", "usage": "COMP-3" }
            ]
          }
        ]
      },
      {
        "copybook": "BILLAREA",
        "variants": [
          { "name": "BILLAREA-V1", "redefines-of": null, "fields": [ ... ] },
          { "name": "BILLAREA-V2", "redefines-of": "BILLAREA-V1", "fields": [ ... ] }
        ]
      }
    ]
  }
  ```

- `data-dictionary.md` — human-readable catalogue, organised by naming-convention bucket
- `copybook-conflicts.md` — divergent-layout report

### Side artefacts

- `extraction-status.md` — inventory checklist
- `CHANGE-TRACKER.md` — Parts Affected = A / B / All

## Hand-off contract

`build-knowledge-base` consumes:
- Part B path (the `copybook-library-consumer/` tree)
- The canonical record graph (`copybook-record-graph.json`)
- Repo-slug
- `last_verified_against_commit` SHA

`reverse-engineer-cobol-program` consumes (when run after this skill in the same project):
- The canonical record graph (`copybook-record-graph.json`) — for resolving each `COPY` statement to a named variant

`build-mainframe-data-lineage` consumes:
- The canonical record graph
- `copybook-conflicts.md`

## Schema validation

`copybook-record-graph.json` must validate against the schema sketched above. Every variant marked `redefines-of` must reference a sibling variant in the same record. Every level-88 must reference an elementary item declared in the same variant. Every field with `OCCURS DEPENDING ON` must declare both the controlling field and the canonical max-occurrences expansion.
