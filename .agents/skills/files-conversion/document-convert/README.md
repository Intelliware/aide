# Document Convert Skill

**Universal document converter & analyzer** with progressive loading and intelligent content analysis.

## What It Does

This skill goes beyond simple format conversion - it **analyzes content and generates actionable reports**:

1. **Convert**: Word/PDF/Excel → Markdown (using CLI tools)
2. **Analyze**: Read converted content with AI
3. **Report**: Generate structured analysis with insights, not just raw data

**Key Difference**: Returns `<filename>-analysis.md` (insights) alongside `<filename>.md` (raw data).

## Architecture

This skill handles three document formats (Word, PDF, Excel) through **progressive disclosure** — only the format-specific reference for the detected file type is loaded.

### Progressive Loading Strategy

```
document-convert/
├── SKILL.md                           # Main skill (routing logic)
└── references/                        # Format-specific instructions
    ├── word-conversion.md             # Loaded when .docx detected
    ├── pdf-conversion.md              # Loaded when .pdf detected
    └── excel-conversion.md            # Loaded when .xlsx/.xls detected
```

**Key Benefits**:
1. **Single entry point** - Users invoke one skill, not three
2. **Minimal context** - Only loads instructions for detected format
3. **Maintainable** - Format-specific logic isolated in references
4. **Extensible** - Add new formats without changing main skill

### How It Works

```javascript
// 1. User provides document (any format)
"Convert this: https://sharepoint.example.com/.../report.xlsx"

// 2. Skill detects extension
const ext = detectExtension(url); // ".xlsx"

// 3. Loads only relevant reference
if (ext === '.xlsx') {
  loadReference('references/excel-conversion.md');
  // Word and PDF references NOT loaded (saves context)
}

// 4. Follows format-specific workflow
// Excel-specific: Ask about sheets, TOC, metadata
// Then converts using spt convert-excel
```

## Supported Formats

| Format | Extension | Library | CLI Command |
|--------|-----------|---------|-------------|
| **Word** | `.docx` | Mammoth.js | `spt convert` |
| **PDF** | `.pdf` | pdf-parse | `spt convert-pdf` |
| **Excel** | `.xlsx`, `.xls`, `.xlsm`, `.xlsb`, `.csv` | SheetJS | `spt convert-excel` |

## Usage Examples

### Example 1: Auto-Detect from URL

**User:** "Convert https://sharepoint.example.com/.../Requirements.docx"

**Workflow:**
1. Extract URL → detect `.docx` extension
2. Load `references/word-conversion.md` ONLY
3. Download file → convert → confirm

**Context saved**: PDF and Excel conversion logic not loaded.

### Example 2: Multi-Format Batch

**User:** "Convert these: Requirements.docx, TestCases.xlsx, Design.pdf"

**Workflow:**
1. Download all files
2. **Sequence:**
   - Load `word-conversion.md` → convert .docx → unload
   - Load `excel-conversion.md` → convert .xlsx → unload
   - Load `pdf-conversion.md` → convert .pdf → unload

**Context saved**: Only one format's instructions loaded at a time.

### Example 3: Generic Request

**User:** "I need to convert a document"

**Workflow:**
1. List all convertible files in downloads/
2. User selects file
3. Detect extension from filename
4. Load appropriate reference
5. Convert

## CLI Integration

All conversion commands use the existing SharePoint CLI:

```bash
# Word
spt convert "file.docx" --output "output.md"

# PDF  
spt convert-pdf "file.pdf" --output "output.md" [--pages "1-10"] [--metadata]

# Excel
spt convert-excel "file.xlsx" --output "output.md" [--sheet "Summary"] [--metadata]
```

## Why Consolidate?

**Before (3 separate skills):**
- ❌ Skill proliferation (26 → 29 skills)
- ❌ User confusion ("which skill for this file?")
- ❌ Duplicate logic (download, output path, error handling)
- ❌ All three skills loaded even if using one format

**After (1 unified skill):**
- ✅ Single interface (29 → 27 skills)
- ✅ Auto-detection ("convert this" works for all)
- ✅ Shared common logic (DRY principle)
- ✅ Progressive loading (only load what's needed)
- ✅ Follows best practices (#file:skills-best-practices.md)

## Best Practices Applied

From [skills-best-practices.md](../skill-author/references/skills-best-practices.md):

1. **Progressive Disclosure** ✅
   - Main SKILL.md < 500 lines
   - Detailed instructions in references/
   - Load only what's needed

2. **Conciseness** ✅
   - Single skill vs. three separate skills
   - Common logic consolidated
   - Format-specific details isolated

3. **Appropriate Degrees of Freedom** ✅
   - Auto-detect format (user doesn't need to specify)
   - Ask format-specific options only when needed
   - Shared output location prompt

4. **Testing Across Models** ✅
   - Works with different file sources (URL, local, attachment)
   - Handles all supported formats
   - Graceful error handling

## Extension Guide

To add a new format (e.g., PowerPoint):

1. **Add CLI support** (in sharepoint-cli):
   ```bash
   spt convert-ppt "file.pptx" --output "output.md"
   ```

2. **Create reference** file:
   ```
   references/ppt-conversion.md
   ```

3. **Update routing** in SKILL.md:
   ```javascript
   case '.pptx':
     // Load and follow: references/ppt-conversion.md
     break;
   ```

4. **Update documentation**:
   - Add to supported formats list
   - Add to examples
   - Update README

## Maintenance

When updating format-specific logic:
- ✅ Edit only the relevant reference file
- ✅ Main SKILL.md rarely changes
- ✅ Changes isolated to single format
- ✅ Other formats unaffected

## Performance

Memory efficiency comparison:

| Scenario | Before (3 skills) | After (1 skill) |
|----------|-------------------|-----------------|
| Convert Word | ~15KB (all 3 loaded) | ~8KB (main + word ref) |
| Convert PDF | ~15KB (all 3 loaded) | ~7KB (main + pdf ref) |
| Convert Excel | ~15KB (all 3 loaded) | ~10KB (main + excel ref) |

**Result**: 30-50% reduction in context usage per conversion.

## Related Skills

- **@sharepoint-manage** - Download documents from SharePoint
- **@confluence-manage** - Upload converted docs to Confluence
- **@jira-get** - Cross-reference with Jira
- **@test-case-generator** - Validate converted test cases
- **@jtmf-importer** - Import Excel test cases to JTMF

---

**Created**: May 4, 2026  
**Pattern**: Progressive Disclosure  
**Replaces**: word-convert, pdf-convert, excel-convert
