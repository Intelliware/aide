# Inputs & Outputs — qe-code-scanner

## Inputs

| Input | Source | Required | Notes |
|---|---|---|---|
| BB-DCC-QE repository | Filesystem (sibling repo or workspace) | Yes | Must be accessible at runtime |

## Outputs

| Output | Location | Format | Committed |
|---|---|---|---|
| KNOWLEDGE.md | `BB-DCC-QE/docs/KNOWLEDGE.md` | Markdown with structured sections (0–24) | Yes |

## Side Effects

- Creates `BB-DCC-QE/docs/` directory if it does not exist
- Completely overwrites `docs/KNOWLEDGE.md` on every run (full rescan, never partial)

