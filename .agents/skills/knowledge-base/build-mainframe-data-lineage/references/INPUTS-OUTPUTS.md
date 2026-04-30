# build-mainframe-data-lineage — Inputs and Outputs

## Inputs

### Required

- **`project.toml`** with `[project.paths] knowledge_base_path` declared and the path populated (i.e. `build-knowledge-base` has already run)
- **At least one copybook library Part B output** under `<KB>/source-docs/<copybook-repo>/copybook-library-consumer/` containing `copybook-record-graph.json` and `copybook-conflicts.md`
- **At least one COBOL program Part A output** under `<KB>/source-docs/<cobol-repo>/cobol-program-internal/` containing `program-call-graph.mmd`, `program-data-bindings.json`, and `program-exec-inventory.md`
- **At least one JCL job Part A output** under `<KB>/source-docs/<jcl-repo>/jcl-job-internal/` containing `job-flow.mmd` and `dataset-io.json`

### Optional

- Existing tribal data-lineage spreadsheets, dataset catalogues, run books (treat as input to verify, not as a replacement)
- Site-specific symbolic-DSN resolution table (e.g. `&LDATE → YYYYMMDD`) — not required; the artefact flags symbolic DSNs and lets a downstream pass apply substitutions
- Site-specific dynamic-CALL resolution table — not required; dynamic CALLs are flagged in `unbound-and-flagged-items.md`

### Project.toml driving values

```toml
[project.paths]
knowledge_base_path = "../my-project-kb"

# Each contributing repo declared in [[project.repos]] with a role:
[[project.repos]]
code = "billing-copybook"
role = "copybook-library"
path = "../billing-mainframe/COPYBOOK"

[[project.repos]]
code = "billing-cobol"
role = "cobol-program"
path = "../billing-mainframe/COBOL"

[[project.repos]]
code = "billing-jcl"
role = "jcl-job"
path = "../billing-mainframe/JCL"
```

## Outputs

### Primary artefact tree

Default location: `<knowledge_base_path>/lineage/mainframe/` driven by `kb-mainframe-data-lineage.yaml`. Renders one .md file per block (10 blocks), plus two side-artefact files (`move-chain.json`, `job-program-dataset-chain.mmd`):

```
<KB>/lineage/mainframe/
├── 01-lineage-overview.md
├── 02-copybook-where-used.md
├── 03-field-where-used.md
├── 04-move-chain.md
├── 04-move-chain.json                 ← side artefact (machine-readable)
├── 05-job-program-dataset-chain.md
├── 05-job-program-dataset-chain.mmd   ← side artefact (rendered Mermaid)
├── 06-db2-host-variable-bindings.md
├── 07-ims-segment-bindings.md
├── 08-cics-commarea-bindings.md
├── 09-unbound-and-flagged-items.md
└── 10-lineage-summary.md
```

### Schemas

#### `move-chain.json`

```json
{
  "version": 1,
  "edges": [
    {
      "id": "MV-001",
      "src": {
        "program": "BILLPROC",
        "section": "2100-CALC",
        "field": "CUST-RECORD.CUST-ID",
        "copybook": "CUSTREC"
      },
      "verb": "MOVE",
      "dst": {
        "program": "BILLPROC",
        "section": "2100-CALC",
        "field": "WS-CUST-ID-WORK",
        "copybook": null
      },
      "source_lines": "BILLPROC.cbl:142-142"
    },
    {
      "id": "MV-002",
      "src": {
        "program": "BILLPROC",
        "section": "2200-CALL",
        "field": "WS-AMOUNT",
        "copybook": null
      },
      "verb": "CALL_USING",
      "dst": {
        "program": "BILLCALC",
        "section": "LINKAGE",
        "field": "LK-AMOUNT",
        "copybook": null
      },
      "source_lines": "BILLPROC.cbl:158-160"
    }
  ]
}
```

`verb` is one of: `MOVE`, `MOVE_CORRESPONDING`, `COMPUTE`, `CALL_USING`, `EXEC_SQL_INTO`, `EXEC_SQL_VALUES`, `EXEC_DLI_INTO`, `EXEC_CICS_COMMAREA`.

#### `job-program-dataset-chain.mmd`

A Mermaid `graph LR` rendering. Nodes are `Job:JOBNAME`, `Step:JOBNAME.STEPNAME`, `Pgm:PROGNAME`, `DD:STEPNAME.DDNAME`, `DSN:dataset-name`, `Copybook:NAME`. Edges connect job → step → program → DD → DSN → copybook (where the program's FD ↔ DD ↔ copybook chain is documented).

### Side artefacts

- `change-tracker.md` — append-only log of lineage build runs (Parts Affected: lineage)
- No `extraction-status.md` — this skill is a re-runnable aggregator, not an extraction; the contributing RE skills own extraction status

## Hand-off contract

Downstream consumers (`navigate-knowledge-base`,
`verify-knowledge-base-coverage`, `detect-knowledge-base-drift`)
read the artefact tree at `<KB>/lineage/mainframe/`. The artefact is
markdown-first; downstream skills use grep / read / glob just as
they do over the rest of the KB.

## Validation

`steps/08-verify-coverage.md` enforces:

- Every copybook in any contributing `copybook-record-graph.json` appears in `copybook-where-used.md`
- Every program in any contributing `program-data-bindings.json` appears in `field-where-used.md` (as a where-used citation) AND in `job-program-dataset-chain.mmd` (or is flagged "not invoked from documented JCL")
- Every host-var name in every `EXEC SQL` resolves to a copybook field, or appears in `unbound-and-flagged-items.md`
- Every IMS PCB segment in every `EXEC DLI` resolves to an `IMS-*` copybook in the matched copybook library, or is flagged
- Every dynamic `CALL` site appears in `unbound-and-flagged-items.md` with candidate targets listed (not resolved)
- Every symbolic-substitution DSN (containing `&`) appears in `unbound-and-flagged-items.md` (not auto-resolved)
- `move-chain.json` validates against the schema above
