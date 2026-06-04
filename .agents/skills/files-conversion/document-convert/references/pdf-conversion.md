# PDF Document Conversion Instructions

**Format**: Portable Document Format `.pdf`  
**Library**: pdf-parse  
**CLI Command**: `spt convert-pdf`

---

## Conversion Features

- ✅ Text extraction from text-based PDFs
- ✅ Preserves paragraph structure
- ✅ Handles basic tables and lists
- ✅ Optional metadata inclusion
- ✅ Page range filtering
- ⚠️ **Quality varies by source**:
  - Best: Text-based PDFs (exported from Word, generated)
  - Fair: Multi-column layouts (may need cleanup)
  - Poor: Scanned PDFs (requires OCR, not supported)

---

## PDF-Specific Workflow

### 1. Download from URL (if applicable)

**Already handled in main workflow. Skip if file is local.**

### 2. Verify File Format

```bash
# Check file is valid PDF document
file downloads/<filename>.pdf
# Expected: "PDF document"
# If "HTML document": Manual download needed
```

### 3. Ask About Conversion Options

**For PDF files, ask:**
```
📑 Ready to convert: <filename>.pdf

Conversion options:

1. Page range: [Enter range like "1-10", or press Enter for all pages]
2. Include metadata? (y/n): [PDF metadata - author, creation date, etc.]

Press Enter to skip all options (convert all pages, no metadata).
```

**Parse user response:**
- Page range: `--pages "1-10"`
- Metadata: `--metadata`

### 4. Ask for Output Location

**Prompt user:**
```
📄 Where would you like to save the markdown output?

Options:
1. documentation/converted-docs/ (default, gitignored)
2. documentation/feature-artifacts/ (version-controlled)
3. downloads/
4. drafts/
5. Custom path (specify)

Press Enter for default (documentation/converted-docs/)
```

**Note**: If no output specified, PDF converter defaults to `documentation/converted-docs/<filename>.md`

### 5. Convert Document

**Basic conversion (default path):**
```bash
spt convert-pdf "downloads/<filename>.pdf"
# Outputs to: documentation/converted-docs/<filename>.md
```

**Custom output path:**
```bash
spt convert-pdf "downloads/<filename>.pdf" --output "<user-path>/<filename>.md"
```

**With page range:**
```bash
spt convert-pdf "downloads/<filename>.pdf" --pages "1-10" --output "<user-path>/<filename>.md"
```

**With metadata:**
```bash
spt convert-pdf "downloads/<filename>.pdf" --metadata --output "<user-path>/<filename>.md"
```

**Combined options:**
```bash
spt convert-pdf "downloads/<filename>.pdf" \
  --pages "5-25" \
  --metadata \
  --output "<user-path>/<filename>.md"
```

### 6. Confirm Success

```
✅ PDF converted successfully!
📄 Input:  <input-path>
📄 Output: <output-path>
📑 Pages:  <page-count> (or page range if specified)
📈 Size:   <input-size> → <output-size>

You can now:
- Read the markdown content
- Extract specific sections
- Analyze the document
```

**If metadata was included:**
```
Metadata:
- Author: <author>
- Created: <creation-date>
- Pages: <total-pages>
```

**Quality warning (if applicable):**
```
⚠️  Note: This appears to be a scanned PDF.
Text extraction quality may be limited.
Consider using OCR software if content is unreadable.
```

---

## PDF Output Structure

### With Metadata

```markdown
# Document Metadata

**Title:** Financial Report Q4 2025
**Author:** John Doe
**Created:** 2025-12-15
**Modified:** 2026-01-03
**Pages:** 45

---

## Executive Summary

Text content extracted from PDF...

## Financial Analysis

Tables and data extracted from PDF...
```

### Without Metadata

```markdown
## Executive Summary

Text content extracted from PDF...

## Financial Analysis

Tables and data extracted from PDF...
```

---

## PDF-Specific Examples

### Example 1: Full Document Conversion

**User:** "Convert this PDF: https://sharepoint.example.com/.../Specifications.pdf"

**Steps:**
1. Download: `spt download "<url>" --output "downloads/Specifications.pdf"`
2. Verify: `file downloads/Specifications.pdf`
3. Ask options:
   - Page range: User presses Enter (all pages)
   - Metadata: User says "y"
4. Ask output location → User chooses: `documentation/feature-artifacts/`
5. Convert:
   ```bash
   spt convert-pdf "downloads/Specifications.pdf" \
     --metadata \
     --output "documentation/feature-artifacts/Specifications.md"
   ```
6. Report result with metadata summary

### Example 2: Extract Specific Pages

**User:** "I only need pages 10-25 from the Design_Document.pdf"

**Steps:**
1. Verify file exists in downloads/
2. Ask options:
   - Page range: User provides "10-25"
   - Metadata: User says "n"
3. Ask output location → User accepts default
4. Convert:
   ```bash
   spt convert-pdf "downloads/Design_Document.pdf" \
     --pages "10-25" \
     --output "documentation/converted-docs/Design_Document_p10-25.md"
   ```
5. Report:
   ```
   ✅ PDF pages 10-25 converted successfully!
   📄 Output: documentation/converted-docs/Design_Document_p10-25.md
   📑 Pages: 16 pages extracted
   ```

### Example 3: Scanned PDF (Poor Quality Warning)

**User:** "Convert Scanned_Requirements.pdf"

**Steps:**
1. Verify file exists
2. Ask options → User accepts defaults
3. Convert:
   ```bash
   spt convert-pdf "downloads/Scanned_Requirements.pdf" \
     --output "documentation/converted-docs/Scanned_Requirements.md"
   ```
4. Check output quality → Detect poor extraction
5. Report with warning:
   ```
   ✅ PDF converted (with limitations)
   📄 Output: documentation/converted-docs/Scanned_Requirements.md
   
   ⚠️  Warning: This appears to be a scanned PDF.
   Text extraction quality is limited. Consider:
   - Using OCR software (Adobe Acrobat, ABBYY FineReader)
   - Requesting original source document
   - Manual transcription if critical
   
   Would you like me to attempt analysis despite quality issues?
   ```

---

## PDF-Specific Error Handling

### Error: HTML Instead of PDF

**Cause**: Downloaded authentication page instead of PDF

**Response:**
```
⚠️  Downloaded file is HTML, not PDF

The URL requires browser authentication.

Please:
1. Open this link in your browser: <url>
2. Click "Download" button
3. Save to: downloads/<filename>.pdf
4. Confirm when ready

I'll then convert the file.
```

### Error: Encrypted/Password-Protected PDF

**Cause**: PDF requires password to open

**Response:**
```
❌ Cannot open password-protected PDF

The file <filename>.pdf is encrypted.

Solutions:
1. Remove password protection:
   - Open in Adobe Acrobat
   - File → Properties → Security → No Security
   - Save
2. Provide unprotected version

Note: Password-protected PDFs cannot be converted directly.
```

### Error: Corrupted PDF

**Cause**: File cannot be parsed

**Response:**
```
❌ Failed to parse PDF file

Possible causes:
- File is corrupted
- File is not a valid PDF
- File uses unsupported PDF features

Try:
1. Open file in PDF reader (verify it opens)
2. Re-save or export as new PDF
3. Provide the re-saved file
```

### Warning: Scanned PDF Detected

**Cause**: PDF is image-based (no text layer)

**Response:**
```
⚠️  Scanned PDF detected

This PDF contains scanned images without text layer.
Text extraction quality will be very poor.

Recommended alternatives:
1. Use OCR software first:
   - Adobe Acrobat Pro (Tools → Enhance Scans → Recognize Text)
   - ABBYY FineReader
   - Google Drive (upload, open with Google Docs)
2. Request original source document if available

Proceed with limited conversion anyway? (y/n): _
```

---

## PDF Conversion Quality Notes

**Best Results (Text-based PDFs):**
- ✅ PDFs exported from Word, Google Docs
- ✅ Generated PDFs (reports, invoices)
- ✅ PDFs with selectable text
- ✅ Simple single-column layouts

**Fair Results (May Need Cleanup):**
- ⚠️ Multi-column layouts (text may be out of order)
- ⚠️ Complex table structures (may lose formatting)
- ⚠️ PDFs with unusual fonts
- ⚠️ Forms with fillable fields

**Poor Results (Not Recommended):**
- ❌ Scanned documents without OCR
- ❌ Image-only PDFs
- ❌ Heavily formatted/designed documents
- ❌ PDFs with DRM protection

**Limitations:**
- No images extracted (unlike Word converter)
- No charts/graphs preserved
- Complex layouts may scramble text order
- Tables may lose structure
- Headers/footers may be duplicated
- Page numbers may interfere with content

---

## Next Actions After Conversion

**Offer based on content type:**

**Technical Specifications:**
```
Would you like me to:
- Summarize key requirements?
- Extract API specifications?
- Identify technical constraints?
- Generate implementation checklist?
```

**Reports/Analysis:**
```
Would you like me to:
- Summarize findings?
- Extract key metrics/data?
- Identify recommendations?
- Create executive summary?
```

**Meeting Minutes:**
```
Would you like me to:
- Extract action items?
- Summarize decisions made?
- Identify next steps?
- Create follow-up task list?
```

**User Documentation:**
```
Would you like me to:
- Extract step-by-step procedures?
- Create quick reference guide?
- Identify FAQ candidates?
- Generate troubleshooting guide?
```

---

## Best Practices for PDF Conversion

1. **Verify PDF type first** (text-based vs scanned)
2. **Warn users about scanned PDFs** before proceeding
3. **Suggest page ranges** for large documents (faster, focused)
4. **Include metadata** for formal documentation
5. **Check output quality** after conversion
6. **Offer alternative** if quality is poor (OCR, source doc)
7. **Set expectations** about limitations (no images, layout issues)

---

## PDF vs Word: When to Recommend Alternative

**If user provides PDF but Word version might exist:**

```
📑 I can convert this PDF, but note:

- PDF conversion may lose formatting
- Images will not be extracted
- Tables may not preserve structure

If a Word (.docx) version exists, that would provide:
- Better formatting preservation
- Image extraction
- Higher quality tables

Do you have access to the original Word document?
If not, I'll proceed with PDF conversion.
```
