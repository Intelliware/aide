# Inputs and Outputs — scaffold-documentation

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| `package_type` | yes | user input | `requirements` / `design` / `re-api` / `kb-component` / `quick-dev-spec` |
| `package_path` | yes | user input | `docs/checkout/requirements-package/` |
| `inventory` | yes | from `extraction-status.md`, prior discovery, or user-provided list | endpoints, components, tables, FRs, ACs, etc. |
| `template_composition` | yes | inferred from package type | `templates/compositions/greenfield-requirements-package.yaml` |
| `source_version` | yes | user input | `service@v3.4.1` or `requirements-package@1.4.2-doc.7` |
| `scope_exclusions` | no | user input | "deprecated payment-v1 endpoints, planned-but-not-built features" |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `<package_path>/<files-per-template>.md` | markdown — section headers and placeholder markers only, no content | the matching authoring/extraction skill |
| `<package_path>/CHANGE-TRACKER.md` | markdown — initialized from the meta change-tracker template | `track-change` |
| `<package_path>/extraction-status.md` (when applicable) | markdown — table of inventory items mapped to file/section | the authoring skill, verification, navigator |
| Proposal tree (presented inline before file creation) | conversation message | the user, who approves before files are created |

## Side effects

- Creates the package directory and all subdirectories
- Writes one file per section per the chosen composition's block list
- Pre-populates the change tracker's Parts Affected reference table from
  the package's conventions

## Validation rules

- No content beyond section headers and placeholder markers — `<!-- TODO -->`
  is the only "content" allowed
- Scaffolding must map 1:1 to inventory — no orphan sections
- Approval gate is non-negotiable: no files written until user says go
- Every file has a metadata block (title, version, source version) at the top
- `CHANGE-TRACKER.md` is created on first scaffold; never recreate
