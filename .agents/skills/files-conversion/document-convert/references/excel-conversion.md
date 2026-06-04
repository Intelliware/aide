# Excel Spreadsheet Conversion Instructions

**Formats**: `.xlsx`, `.xls`, `.xlsm`, `.xlsb`, `.csv`  
**Library**: SheetJS (xlsx)  
**CLI Command**: `spt convert-excel`

---

## Conversion Features

- ✅ Converts all sheets to markdown tables
- ✅ Auto-generates table of contents (multi-sheet)
- ✅ Select specific sheets by name or index
- ✅ Preserves table structure and cell data
- ✅ Handles merged cells and formatting
- ✅ Escapes pipe characters in cells
- ✅ Converts newlines in cells to `<br>` tags
- ✅ Optional metadata extraction

---

## Excel-Specific Workflow

### 1. Download from URL (if applicable)

**Already handled in main workflow. Skip if file is local.**

### 2. Verify File Format

```bash
# Check file is valid Excel document
file downloads/<filename>.xlsx
# Expected: "Microsoft Excel 2007+" or "Zip archive"
# If "HTML document": Manual download needed
```

### 3. Preview Sheet Information

**Before asking conversion scope, show user what's in the file:**

```bash
# Read workbook metadata (don't output this to user, use internally)
# Agent can see: sheet names, row counts
```

**Present to user:**
```
📊 File: <filename>.xlsx

Available sheets:
1. SIT Test Cases (45 rows)
2. PAT Test Cases (32 rows)
3. Summary (5 rows)

Conversion options:
- All sheets (includes auto-generated table of contents)
- Specific sheet only

Enter sheet name/number, or press Enter for all sheets: _
```

### 4. Get Conversion Scope

**User response handling:**

- **Empty/Enter** → Convert all sheets
- **Sheet name** → Convert that specific sheet only
- **Number (1-3)** → Convert that sheet by index

### 5. Ask About Additional Options

**If converting all sheets:**
```
Additional options:

Include metadata? (y/n): [author, created date, modified date]
Skip table of contents? (y/n): [for multi-sheet workbooks]

Press Enter to skip all options.
```

**If converting single sheet:**
```
Include metadata? (y/n): [workbook metadata]

Press Enter to skip.
```

### 6. Ask for Output Location

**Prompt user:**
```
📄 Where would you like to save the markdown output?

Options:
1. documentation/converted-docs/ (default, gitignored)
2. documentation/feature-artifacts/ (for test cases, version-controlled)
3. downloads/
4. drafts/
5. Custom path (specify)

Press Enter for default (documentation/converted-docs/)
```

### 7. Convert Spreadsheet

**All sheets (default):**
```bash
spt convert-excel "downloads/<filename>.xlsx" --output "<user-path>/<filename>.md"
```

**With metadata:**
```bash
spt convert-excel "downloads/<filename>.xlsx" --metadata --output "<user-path>/<filename>.md"
```

**Specific sheet by name:**
```bash
spt convert-excel "downloads/<filename>.xlsx" --sheet "Summary" --output "<user-path>/<filename>.md"
```

**Specific sheet by number (1-based index):**
```bash
spt convert-excel "downloads/<filename>.xlsx" --sheet 2 --output "<user-path>/<filename>.md"
```

**Skip table of contents:**
```bash
spt convert-excel "downloads/<filename>.xlsx" --no-toc --output "<user-path>/<filename>.md"
```

**Include blank rows:**
```bash
spt convert-excel "downloads/<filename>.xlsx" --include-blank-rows --output "<user-path>/<filename>.md"
```

### 8. Confirm Success

**Multi-sheet conversion:**
```
✅ Spreadsheet converted successfully!
📊 Sheets converted: 3
   - SIT Test Cases
   - PAT Test Cases
   - Summary
📄 Output: <output-path>/<filename>.md
📋 Table of contents included
📈 Size: <input-size> → <output-size>

You can now:
- Analyze test coverage?
- Extract specific test cases?
- Generate summary report?
```

**Single-sheet conversion:**
```
✅ Sheet converted successfully!
📊 Sheet: Summary (1 of 3 sheets)
📄 Output: <output-path>/<filename>_Summary.md
📈 Size: <input-size> → <output-size>

The Summary sheet has been extracted.
Would you like to analyze the content?
```

---

## Excel Output Structure

### Multi-Sheet Output

```markdown
# Table of Contents

1. [SIT Test Cases](#sit-test-cases)
2. [PAT Test Cases](#pat-test-cases)
3. [Summary](#summary)

---

# SIT Test Cases

| Test Case ID | Description | Expected Result | Status |
| --- | --- | --- | --- |
| TC-001 | Login validation | User logged in | Pass |
| TC-002 | Data entry | Form submitted | Pass |

---

# PAT Test Cases

| Test Case ID | Description | Expected Result | Status |
| --- | --- | --- | --- |
| TC-101 | Performance test | Load < 2s | Pass |

---

# Summary

| Environment | Total | Pass | Fail |
| --- | --- | --- | --- |
| SIT | 45 | 43 | 2 |
| PAT | 32 | 32 | 0 |
```

### Single-Sheet Output

```markdown
# Summary

| Environment | Total | Pass | Fail |
| --- | --- | --- | --- |
| SIT | 45 | 43 | 2 |
| PAT | 32 | 32 | 0 |
```

---

## Excel-Specific Examples

### Example 1: Test Cases (All Sheets)

**User:** "Convert PROJ-123_Test_Cases.xlsx from downloads/"

**Steps:**
1. Preview sheets:
   ```
   📊 File: PROJ-123_Test_Cases.xlsx
   
   Available sheets:
   1. E2E Tests (28 rows)
   2. Regression Tests (15 rows)
   3. Summary (3 rows)
   
   Convert all sheets or specific sheet? [all]: _
   ```
2. User presses Enter → Convert all
3. Ask options → User wants metadata
4. Ask output location → User chooses: `documentation/feature-artifacts/`
5. Convert:
   ```bash
   spt convert-excel "downloads/PROJ-123_Test_Cases.xlsx" \
     --metadata \
     --output "documentation/feature-artifacts/PROJ-123_Test_Cases.md"
   ```
6. Report result with full sheet breakdown

### Example 2: Data Dictionary (Specific Sheet)

**User:** "I only need the Field Definitions sheet from Data_Dictionary.xlsx"

**Steps:**
1. Preview sheets (show all available)
2. User specifies: "Field Definitions"
3. Ask options → User skips (no metadata)
4. Ask output location → User accepts default
5. Convert:
   ```bash
   spt convert-excel "downloads/Data_Dictionary.xlsx" \
     --sheet "Field Definitions" \
     --output "documentation/converted-docs/Field_Definitions.md"
   ```
6. Report single-sheet conversion

### Example 3: Requirements Matrix (CSV)

**User:** Provides URL to Requirements_Matrix.csv

**Steps:**
1. Download CSV file
2. No sheet selection needed (CSV = single sheet)
3. Ask options → User wants metadata
4. Ask output location → User chooses: `documentation/feature-artifacts/`
5. Convert:
   ```bash
   spt convert-excel "downloads/Requirements_Matrix.csv" \
     --metadata \
     --output "documentation/feature-artifacts/Requirements_Matrix.md"
   ```
6. Report result

---

## Excel-Specific Error Handling

### Error: Sheet Not Found

**Cause**: Requested sheet doesn't exist

**Response:**
```
❌ Sheet not found: "Test Scenarios"

Available sheets in this workbook:
1. SIT Test Cases
2. PAT Test Cases
3. Summary

Please specify one of the available sheet names or numbers (1-3).
```

### Error: Password-Protected Workbook

**Cause**: Excel file is password-protected

**Response:**
```
❌ Cannot open password-protected Excel file

The file <filename>.xlsx appears to be password-protected.

Solutions:
1. Remove password protection in Excel:
   - File → Info → Protect Workbook → Encrypt with Password
   - Clear password field → OK
2. Re-save as unprotected file

Note: Password-protected files cannot be converted directly.
```

### Error: Corrupted File

**Cause**: File cannot be parsed by SheetJS

**Response:**
```
❌ Failed to parse Excel file: Unsupported file format

Possible causes:
- File is corrupted
- File is not a valid Excel format
- File uses unsupported Excel variant

Try:
1. Open file in Excel
2. Save As → .xlsx (Excel Workbook)
3. Provide the re-saved file
```

### Warning: Large File

**Cause**: File > 10MB

**Response:**
```
⚠️  Large file detected: <filename>.xlsx (15.2 MB)

Conversion may take longer than usual.

Consider:
1. Converting specific sheets only (use --sheet option)
2. Reducing file size (remove unused data/formatting)
3. Splitting into smaller files

Proceed with conversion? (y/n): _
```

---

## Excel Conversion Quality Notes

**Best Results:**
- ✅ Standard .xlsx/.xls files (Excel 2007+, Excel 97-2003)
- ✅ Simple tables and data
- ✅ CSV files
- ✅ Files with multiple sheets

**Limitations:**
- ⚠️ Complex formulas show results only (not formulas)
- ⚠️ Charts/graphs not converted (no images in Excel converter)
- ⚠️ Conditional formatting not preserved
- ⚠️ Very wide tables may be hard to read in markdown
- ⚠️ Merged cells may lose some formatting
- ❌ Macros not executed (.xlsm)
- ❌ Pivot tables show cached data only

---

## Next Actions After Conversion

**Offer based on content type:**

**Test Cases:**
```
Would you like me to:
- Analyze test coverage by category?
- Identify gaps in test scenarios?
- Generate test summary report?
- Compare with automated tests in codebase?
```

**Requirements Matrix:**
```
Would you like me to:
- Cross-reference with Jira issues?
- Identify orphan requirements?
- Generate traceability report?
- Validate requirement completeness?
```

**Data Dictionary:**
```
Would you like me to:
- Generate database schema documentation?
- Extract field definitions as reference?
- Compare with actual database schema?
- Create API documentation from fields?
```

**Configuration Data:**
```
Would you like me to:
- Validate configuration values?
- Compare environments (DEV vs PROD)?
- Generate configuration documentation?
- Create environment setup guide?
```

---

## Best Practices for Excel Conversion

1. **Default to all sheets** unless user specifically requests one
2. **Always preview sheet information** before conversion
3. **Include table of contents** for multi-sheet workbooks (improves navigation)
4. **Suggest meaningful output location** based on content:
   - Test cases → `documentation/feature-artifacts/`
   - Data dictionaries → `documentation/converted-docs/`
   - Temporary analysis → `downloads/`
5. **Offer to analyze** after conversion (test coverage, data validation, etc.)
6. **Handle empty sheets gracefully** (skip or note as empty)
