---
name: document-convert
description: "Use when the user asks to convert or analyze a Word (.docx), Excel (.xlsx/.xls), or PDF (.pdf) document; says 'convert this document', 'analyze this spreadsheet', 'turn this PDF into markdown', or needs document content transformed into markdown with structured analysis. Auto-detects format, converts to markdown, analyzes content, and generates actionable structured reports rather than only raw tables."
---

# Universal Document Converter & Analyzer

Convert and analyze Word, Excel, and PDF documents with intelligent content analysis and structured reporting.

## Reference Documentation

- **[Overview](./references/OVERVIEW.md)** — Purpose, supported formats, when to use, key features
- **[Inputs & Outputs](./references/INPUTS-OUTPUTS.md)** — Input sources, CLI commands, output artifacts, report structures
- **[Example](./references/EXAMPLE.md)** — Complete conversion and analysis scenario

**Format-specific instructions** (loaded progressively):
- **[Word Conversion](./references/word-conversion.md)** — .docx processing details
- **[Excel Conversion](./references/excel-conversion.md)** — .xlsx processing and analysis
- **[PDF Conversion](./references/pdf-conversion.md)** — .pdf processing details

## When NOT to use

- The source is a Confluence page → `confluence-fetch` or `confluence-extract-package`
- The source is a Jira issue → `jira-get` or `jira-extract-requirements`
- The user only wants the raw markdown without analysis — run the underlying `spt convert*` command directly rather than invoking the full skill
- The file is a structured data export (CSV) intended for ingestion, not human analysis — handle as data, not a document
- The `spt` CLI is not installed and the user has not opted into the optional SharePoint integration — halt and explain the prerequisite

## Quick Start

**User**: "Convert this document: https://sharepoint.example.com/.../Requirements.docx"

**Steps**:
1. Detect format from URL → `.docx`
2. Download: `spt download "<url>" --output "downloads/Requirements.docx"`
3. Load `references/word-conversion.md` for Word-specific instructions
4. Ask user for output location
5. Convert: `spt convert "downloads/Requirements.docx" --output "<path>/Requirements.md"`
6. Analyze content → generate `Requirements-analysis.md`
7. Present key insights

## Essential Workflow

1. **Detect input source** (attached file > URL > path > generic request)
2. **Determine format** (extract extension from URL/filename)
3. **Download if URL** (SharePoint/OneDrive support)
4. **Load format-specific instructions** (Word/Excel/PDF)
5. **Ask for output location**
6. **Execute conversion** (format-specific CLI command)
7. **Analyze content** (generate structured report)
8. **Present insights** (not just "conversion complete")

## Supported Formats

| Format | Extensions | Output |
|--------|-----------|---------|
| **Word** | .docx | Summary with decisions, action items |
| **Excel** | .xlsx, .xls, .csv | Analysis with key findings, insights |
| **PDF** | .pdf | Digest with main topics, metrics |

## CLI Commands

```bash
# Download
spt download "<url>" --output "downloads/<filename>"

# Word
spt convert "downloads/<file>.docx" --output "<path>/<file>.md"

# Excel
spt convert-excel "downloads/<file>.xlsx" --output "<path>/<file>.md"

# PDF
spt convert-pdf "downloads/<file>.pdf" --output "<path>/<file>.md"
```

## Output Pattern

**Always create TWO files**:
1. `{filename}.md` — Raw markdown (reference)
2. `{filename}-analysis.md` — Structured analysis (primary output)

**Default location**: `documentation/converted-docs/` (gitignored)

## Progressive Loading

**Load only the reference file needed**:
- Detect `.docx` → load `references/word-conversion.md`
- Detect `.xlsx` → load `references/excel-conversion.md`
- Detect `.pdf` → load `references/pdf-conversion.md`

This minimizes context usage.

## Analysis Reports

**Excel → Analysis Report**:
- Executive Summary
- Key Findings
- Detailed Analysis by section
- Recommendations
- Action Items

**Word → Structured Summary**:
- Document Type & Purpose
- Key Sections
- Critical Information (decisions, requirements)
- Dependencies & References
- Next Steps

**PDF → Content Digest**:
- Source Information
- Main Topics
- Key Points Summary
- Important Data/Metrics
- Action Items

## Best Practices

1. ✅ **Auto-detect format** — Don't ask user unless ambiguous
2. ✅ **Progressive disclosure** — Load only needed reference file
3. ✅ **Generate analysis** — Not just raw markdown
4. ✅ **Verify downloads** — Check for HTML auth pages
5. ✅ **Default location** — `documentation/converted-docs/`
6. ❌ **Never skip analysis** — Always provide insights

## Error Handling

| Error | Action |
|-------|--------|
| **Unsupported format** | List supported formats |
| **File not found** | Verify path, check spelling |
| **Download auth failure** | Ask user to download manually |
| **Password-protected** | Ask user to remove password |
| **Conversion failed** | Check file isn't corrupted |

## Common Scenarios

**URL with unknown format**:
- Extract extension from URL
- Load appropriate reference file
- Execute conversion + analysis

**Generic "convert a document"**:
- List convertible files in `downloads/`
- User selects
- Detect format → proceed

**Multiple documents**:
- Download all first (parallel)
- Convert sequentially (load appropriate reference for each)
- Generate batch summary

## Related Skills

- **jira-get** — Cross-reference converted requirements with Jira
- **confluence-fetch** — Upload converted docs to Confluence

## Additional Resources

- [SharePoint Tools Documentation](../../../../tools/README.md)
