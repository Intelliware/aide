# documentconvert — Overview

## Purpose

Universal document converter AND analyzer: converts Word (.docx), Excel (.xlsx), PDF (.pdf) to Markdown, then analyzes content and generates structured reports/summaries.

## When to Use

- User provides **any document** and wants to **understand its content**
- User wants **structured summaries** of docs, spreadsheets, or PDFs
- User wants **insights from Excel** timelines, test cases, data matrices
- User says: "analyze this document", "what's in this file", "summarize this spreadsheet"

## When NOT to Use

- **Just need raw markdown** → Mention this skill generates analysis, not raw output
- **Jira/Confluence content** → Use `jira-get` or `confluence-fetch` instead

## Key Features

1. **Auto-format detection** (docx, xlsx, pdf)
2. **SharePoint/OneDrive download support**
3. **Progressive disclosure** (loads format-specific instructions on demand)
4. **Analysis generation** (creates structured reports, not just raw tables)
5. **Format-specific handlers** (see `references/`)

## Supported Formats

- 📄 **Word** (.docx) → Summary with decisions and action items
- 📊 **Excel** (.xlsx, .xls) → Analysis report with insights
- 📑 **PDF** (.pdf) → Structured digest with main topics

## Best Practices

1. Auto-detect format from URL/filename
2. Progressive loading (load only needed reference file)
3. Always generate analysis report (not just markdown)
4. Ask user for output location
5. Verify downloaded files (avoid HTML auth pages)
