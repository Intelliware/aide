# Inputs and Outputs — verify-source

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| `package_path` | yes | user input | `docs/checkout/solutions-package/` |
| `package_type` | yes | user input or inferred | `design` / `requirements` / `re-api` / `kb-component` / `quick-dev-spec` / `implementation-increment` |
| `scope` | yes | user input — `full` or section list | `full` or `["§4 functional requirements", "§12 ACs"]` |
| `source_access` | yes | confirmed by user | "Yes — repo cloned at `../api-orders` on commit `abc123`" |
| `cited_sources` | yes | extracted from the package's traceability fields | OpenAPI spec, source files, prior package paths, ticket IDs |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| Verification report (inline + persisted to `<package_path>/verification-report-YYYY-MM-DD.md`) | markdown — summary + failures + warnings + recommendations | the user; review-stage skills |
| `CHANGE-TRACKER.md` entry (via `track-change`) | tracker row + detail | downstream drift detection |
| Optional: per-claim findings list | structured list of (claim, source, status, evidence) | the authoring skill if amendments are needed |

## Side effects

- Writes a verification report under the package
- Triggers `track-change` to log the verification activity
- Updates KB component `last_verified_against_commit` when the package is a KB component

## Validation rules

- Must read the source artifact directly for the spot-check sample (no memory)
- Spot-check sample is at least 3 claims, ideally 5
- Each failure includes: what was wrong, where in the doc, where in the
  source, and a recommended fix
- Cannot return "pass" while `[NEEDS CLARIFICATION]` or `UNVERIFIED` markers
  remain in the package
- Cannot return "pass" if the change tracker has gaps for the period covered
