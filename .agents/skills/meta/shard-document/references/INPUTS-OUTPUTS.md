# Inputs and Outputs — shard-document

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| `source_path` | yes | user input | `/repo/docs/feature-x/solutions-package/design.md` |
| `destination_folder` | no — defaults to `<source_dir>/<source_stem>/` | user input or default | `/repo/docs/feature-x/solutions-package/design/` |
| `original_disposition` | yes (after split) | user choice — one of `d` (delete), `m` (move/archive), `k` (keep) | `d` |
| `archive_path` | only when `original_disposition = m` | user input or default sibling `archive/` | `/repo/docs/feature-x/solutions-package/archive/design.md` |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `<destination_folder>/index.md` | markdown — table of contents pointing at each section file | humans navigating the sharded tree; build-knowledge-base index synthesis |
| `<destination_folder>/<section-slug>.md` (one per H2) | markdown — section body with H2 promoted to H1 | per-section reviewers; downstream skills referencing one section at a time |
| Original document — deleted, moved, or left in place | n/a | `track-change` records the disposition |
| Completion report | inline conversation message | the user |

## Side effects

- Creates `<destination_folder>` if missing
- May create an `archive/` sibling when the user picks `m`
- Removes the source `.md` when the user picks `d`
- Does **not** automatically log the change — caller invokes `track-change` after

## Validation rules

- Source must exist and have `.md` extension; otherwise HALT
- Destination must be writable; otherwise HALT
- After sharding, at least one section file plus `index.md` must exist; otherwise HALT
- `original_disposition` must be answered before the skill returns success
