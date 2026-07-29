# reverse-engineer-jcl-job — Inputs and Outputs

## Inputs

### Required

- **Repository path** — absolute path to the JCL repository (or JCL/PROCLIB directories inside a mainframe monorepo).
- **Source version** — Endevor / ChangeMan / Panvalet package, or current main commit.

### Optional

- Existing run books, scheduler exports (Control-M, CA-7, OPC/A, Zeke) listing predecessor/successor edges (treat as input to verify, not as a replacement)
- A pointer to the matched COBOL program repo (helps resolve `EXEC PGM=` to documented programs)
- Sample SYSIN listings or DSN-naming standards documents

### Elicitation

Reference: `references/elicitation-patterns/repo-scope-discovery.md`. Used to confirm:
- Repository path and version
- Scheduler in use (Control-M, CA-7, OPC/A, Zeke, JES2 native)
- Whether GDG / VSAM / IDCAMS / SORT / IEBGENER are in scope
- Whether RACF / Top Secret / ACF2 considerations are in scope
- Symbolic-substitution conventions in use (`&SYSUID`, `&LYY`, custom `&BILLDATE`)
- Scope exclusions (deprecated jobs, archived versions, vendor-shipped JCL)

### Project.toml driving values

```toml
[[project.repos]]
code = "billing-jcl"
name = "Billing JCL Job Decks"
path = "../billing-mainframe/JCL"
role = "jcl-job"
type = "jes2-zos"
```

## Outputs

### Part A — Internal documentation (stays in source repo)

Default location: `<repo>/docs/jcl-job-internal/` driven by `re-jcl-job-internal.yaml`. Coverage:

- Job overview
- Step-by-step reference
- PROC and INCLUDE expansion
- DD inventory and DISP
- GDG and dataset lifecycle
- Condition codes and restart points
- IDCAMS / SORT / IEBGENER patterns
- Scheduler integration
- Security and RACF considerations
- Anti-patterns and pitfalls
- FAQ and troubleshooting

### Part B — Consumer documentation (KB)

Location: `{paths.knowledge_base_path}/source-docs/<repo-slug>/jcl-job-consumer/` driven by `re-jcl-job-consumer.yaml`. Coverage:

- What this job does
- Input and output datasets
- Predecessor and successor jobs
- Failure modes and recovery
- Integration examples

### Mandatory extracted artefacts (this skill only)

Written at the canonical Part-B directory root (the KB `source-docs/<slug>/` directory, alongside the `*-consumer/` tree), not driven by the block list — a KB-stage skill (`build-mainframe-data-lineage`) reads them, so they must live on the KB side, not in the source repo. Used as input to `build-mainframe-data-lineage`:

- `job-flow.mmd` — Mermaid step→step graph with DD I/O annotated
- `dataset-io.json` — job → step → DD → DSN → DISP → program invoked. Schema:

  ```json
  {
    "repo_slug": "billing-jcl",
    "source_version": "ENDEVOR-PKG-2026Q2-04",
    "jobs": [
      {
        "job": "BILLPOST",
        "steps": [
          {
            "stepname": "STEP010",
            "exec": { "kind": "PGM", "name": "BILLPROC" },
            "dd": [
              {
                "ddname": "CUSTDD",
                "dsn":   "PROD.CUSTOMER.MASTER",
                "disp":  "SHR",
                "io":    "input"
              },
              {
                "ddname": "BILLDD",
                "dsn":   "PROD.BILLING.OUTPUT(+1)",
                "disp":  "(NEW,CATLG,DELETE)",
                "io":    "output",
                "gdg":   "+1"
              }
            ]
          }
        ]
      }
    ]
  }
  ```

### Side artefacts

- `extraction-status.md` — inventory checklist
- `CHANGE-TRACKER.md` — Parts Affected = A / B / All

## Hand-off contract

`build-knowledge-base` consumes:
- Part B path
- Repo-slug
- `last_verified_against_commit` SHA

`build-mainframe-data-lineage` consumes:
- The two mandatory extracted artefacts above (`job-flow.mmd`, `dataset-io.json`)
- Repo-slug
- `last_verified_against_commit` SHA

## Schema validation

`dataset-io.json` must validate against the schema sketched above. Every step's `exec.kind` must be `PGM` or `PROC`. Every DD with a `gdg` field must use `+N` / `0` / `-N` notation. Symbolic-substitution DSNs (containing `&`) are flagged but not auto-resolved (a separate "symbolic resolution" pass in lineage handles them with site-specific defaults).
