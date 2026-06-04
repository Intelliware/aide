# document-convert — Inputs & Outputs

## Input Sources

| Source | Priority | Example |
|--------|----------|---------|
| Attached file | 1 (highest) | User attaches file |
| URL | 2 | SharePoint/OneDrive link |
| File path | 3 | Local file path |
| Generic request | 4 | "convert a document" |

## Supported Formats

- `.docx` → Word conversion
- `.xlsx`, `.xls`, `.xlsm`, `.csv` → Excel conversion
- `.pdf` → PDF conversion

## CLI Commands

```bash
# Download from SharePoint/OneDrive
spt download "<url>" --output "downloads/<filename>.<ext>"

# Word conversion
spt convert "downloads/<file>.docx" --output "<path>/<file>.md"

# Excel conversion
spt convert-excel "downloads/<file>.xlsx" --output "<path>/<file>.md"

# PDF conversion
spt convert-pdf "downloads/<file>.pdf" --output "<path>/<file>.md"
```

## Output Artifacts

**For each document**:
- `{filename}.md` — Raw markdown conversion
- `{filename}-analysis.md` — Structured analysis report (primary output)

**Default location**: `documentation/converted-docs/` (gitignored)

## Analysis Report Structure

**Excel** → Analysis with key findings, insights, recommendations  
**Word** → Summary with decisions, action items, dependencies  
**PDF** → Digest with main topics, key points, metrics
