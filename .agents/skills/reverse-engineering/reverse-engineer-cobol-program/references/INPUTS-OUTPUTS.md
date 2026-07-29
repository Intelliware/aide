# reverse-engineer-cobol-program — Inputs and Outputs

## Inputs

### Required

- **Repository path** — absolute path to the COBOL repository (or COBOL source directory inside a mainframe monorepo).
- **Source version** — Endevor / ChangeMan / Panvalet package, or current main commit.
- **Execution context** — for each program: batch / CICS online / IMS-MPP / IMS-BMP. Elicited if not auto-detectable from EXEC blocks.

### Optional

- Existing program contracts, run books, DB2 DBRM listings, CICS PPT/PCT extracts, IMS PSB/PCB listings (treat as input to verify, not as a replacement)
- A pointer to the matched copybook library Part A (for cross-checking copybook inclusion)
- Sample JCL invoking the program (reveals real DD names)
- Sample COMMAREA from a calling CICS program

### Elicitation

Reference: `references/elicitation-patterns/repo-scope-discovery.md`. Used to confirm:
- Repository path and version
- COBOL dialect (Enterprise COBOL on z/OS, GnuCOBOL, Micro Focus, etc.)
- Compile/precompile pipeline (Endevor / ChangeMan; EXEC SQL precompiler; CICS translator; IMS DC/DB)
- Whether CICS / IMS / DB2 / MQ are in scope
- Scope exclusions (deprecated programs, archived versions, vendor-shipped sources)

### Project.toml driving values

```toml
[[project.repos]]
code = "billing-cobol"
name = "Billing COBOL Programs"
path = "../billing-mainframe/COBOL"
role = "cobol-program"
type = "enterprise-cobol-zos"
```

## Outputs

### Part A — Internal documentation (stays in source repo)

Default location: `<repo>/docs/cobol-program-internal/` driven by `re-cobol-program-internal.yaml`. Coverage:

- Program inventory and execution context
- Identification and environment per program
- File-control and FD bindings
- Working-storage / linkage / local-storage breakdown
- Copy statements and REPLACING resolution
- Section / paragraph graph
- Perform graph
- Call / link / xctl graph
- EXEC CICS inventory
- EXEC SQL inventory
- EXEC DLI inventory
- Error handling and abend codes
- Performance and runtime considerations
- Naming conventions
- Anti-patterns and pitfalls
- FAQ and troubleshooting
- Code examples

### Part B — Consumer guide (KB)

Location: `{paths.knowledge_base_path}/source-docs/<repo-slug>/cobol-program-consumer/` driven by `re-cobol-program-consumer.yaml`. Coverage:

- How to invoke this program
- Expected DD bindings (with example DSNs)
- COMMAREA / LINKAGE contract
- Called subprograms and side effects
- Error and abend contract
- Integration examples

### Mandatory extracted artefacts (this skill only)

Written at the canonical Part-B directory root (the KB `source-docs/<slug>/` directory, alongside the `*-consumer/` tree), not driven by the block list — a KB-stage skill (`build-mainframe-data-lineage`) reads them, so they must live on the KB side, not in the source repo. Used as input to `build-mainframe-data-lineage`:

- `program-call-graph.mmd` — Mermaid graph of `CALL`/`PERFORM`/`XCTL` per program
- `program-data-bindings.json` — copybook → DIVISION/SECTION-where-used → key fields, per program. Schema:

  ```json
  {
    "program_id": "BILLPROC",
    "source_path": "COBOL/BILLPROC.cbl",
    "execution_context": "batch",
    "bindings": [
      {
        "copybook": "CUSTREC",
        "section": "FILE",
        "fd": "CUST-FILE",
        "key_fields": ["CUST-ID", "CUST-STATUS"]
      },
      {
        "copybook": "BILLAREA",
        "section": "LINKAGE",
        "key_fields": ["BA-AMOUNT", "BA-CURRENCY"]
      }
    ]
  }
  ```

- `program-exec-inventory.md` — every `EXEC CICS|SQL|DLI` block, with file/SQL/segment names, host variables, and source line ranges

### Side artefacts

- `extraction-status.md` — inventory checklist
- `CHANGE-TRACKER.md` — Parts Affected = A / B / All

## Hand-off contract

`build-knowledge-base` consumes:
- Part B path
- Repo-slug
- `last_verified_against_commit` SHA

`build-mainframe-data-lineage` consumes:
- The three mandatory extracted artefacts above (per program)
- Repo-slug
- `last_verified_against_commit` SHA

## Schema validation

Every documented PERFORM target must resolve to a paragraph or section name in the same program. Every static `CALL 'XYZ'` must list `XYZ` as a candidate target (resolution to actual program is delegated to lineage). Every `EXEC SQL` host-variable name must appear in the documented WORKING-STORAGE / LINKAGE.
