# Inputs and Outputs — track-change

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| `package_path` | yes | user input or inferred from the active feature's stage feature directory (not opted in: the feature's `docs/<name>/` folder) | `docs/checkout/requirements-package/` |
| `change_type` | yes | user input — one of: Initial Extraction / Correction / Source Update / Restructure / Addition / Deprecation / Removal / Amendment | `Source Update` |
| `parts_affected` | yes | user input — package-specific vocabulary | `Section 4 (Functional Requirements), Section 12 (Acceptance Criteria)` |
| `section_or_file` | yes | user input | `requirements/04-functional-requirements.md` |
| `description` | yes | user input | "Updated FR4.2.3 to reflect new payment-provider error code" |
| `source_version` | yes | user input or detected | `service@v3.4.1` |
| `verification` | yes | user input | "Verified against `payment-service` commit `abc123`" |
| `cross_impact` | yes | user input — `None` is a valid value | "May impact design package §6 error model" |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `<package_path>/CHANGE-TRACKER.md` (created or updated) | markdown table + detailed entries | `verify-source`, `detect-knowledge-base-drift`, future tracker readers |

## Side effects

- Creates the tracker file if it does not exist
- Increments the documentation version (`X.Y.Z-doc.N`) when the source version changes
- Pre-populates the Parts Affected reference table on first creation, using
  the package's own phase doc conventions

## Validation rules

- Change numbers are monotonic — never reset
- Every entry has a Source Version (no empty values)
- Every entry has a Verification field (no empty values; `None` is allowed
  but flags the entry for human review)
- Cross-impact is always assessed; `None` is acceptable but must be explicit
- One change per row + detail entry; batch only when multiple edits stem
  from a single cause
