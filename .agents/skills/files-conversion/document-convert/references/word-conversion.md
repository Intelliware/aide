# Word Document Conversion Instructions

**Format**: Microsoft Word `.docx` (Office 2007+)  
**Library**: Mammoth.js  
**CLI Command**: `spt convert`

---

## Conversion Features

- ✅ Preserves headings (H1-H6)
- ✅ Maintains text formatting (bold, italic, underline)
- ✅ Converts tables to markdown tables
- ✅ Preserves lists (ordered and unordered)
- ✅ **Extracts images to separate files**
  - Creates `<filename>-images/` directory
  - Saves as `image-1.png`, `image-2.jpg`, etc.
  - Uses relative paths in markdown
  - Preserves original image format

---

## Word-Specific Workflow

### 1. Handle Attached Files

**If user attached a .docx file:**

⚠️ **Important**: VS Code chat attachments are not automatically saved to disk.

**Response:**
```
📎 I see you've attached: <filename>.docx

Please save this file first:
1. Right-click the attachment in chat
2. Save to: downloads/<filename>.docx
3. Let me know when ready to convert

Or paste the file path if it's already saved elsewhere.
```

**Wait for user confirmation** before proceeding.

### 2. Download from URL (if applicable)

**Already handled in main workflow. Skip if file is local.**

### 3. Verify File Format

```bash
# Check file is valid Word document
file downloads/<filename>.docx
# Expected: "Microsoft Word 2007+"
# If "HTML document": Manual download needed
```

### 4. Ask for Output Location

**Prompt user:**
```
📄 Ready to convert: <filename>.docx

Where would you like to save the markdown output?

Options:
1. documentation/converted-docs/ (default, gitignored)
2. documentation/feature-artifacts/ (version-controlled)
3. downloads/
4. drafts/
5. Custom path (specify)

Press Enter for default (documentation/converted-docs/)
```

### 5. Convert Document

```bash
spt convert "downloads/<filename>.docx" --output "<user-path>/<filename>.md"
```

**Note**: `--output` is **required** for Word documents.

### 6. Handle Images

**If conversion result includes images:**

```
✅ Document converted successfully!
📄 Markdown: <output-path>/<filename>.md
📸 Images: <output-path>/<filename>-images/ (4 images extracted)

Images are referenced in markdown using relative paths:
- ![alt text](./<filename>-images/image-1.png)
```

**Image directory structure:**
```
<output-path>/
├── <filename>.md
└── <filename>-images/
    ├── image-1.png
    ├── image-2.jpg
    └── image-3.png
```

### 7. Confirm Success

```
✅ Document converted successfully!
📄 Input:  <input-path>
📄 Output: <output-path>/<filename>.md
📊 Size:   <input-size> → <output-size>
📸 Images: <image-count> extracted

You can now:
- Summarize the content?
- Extract specific sections?
- Analyze the document?
```

---

## Word-Specific Examples

### Example 1: Requirements Document

**User:** "Convert this requirements doc: https://sharepoint.example.com/.../Requirements.docx"

**Steps:**
1. Download: `spt download "<url>" --output "downloads/Requirements.docx"`
2. Verify: `file downloads/Requirements.docx`
3. Ask output location → User chooses: `documentation/feature-artifacts/`
4. Convert: `spt convert "downloads/Requirements.docx" --output "documentation/feature-artifacts/Requirements.md"`
5. Report:
   ```
   ✅ Requirements document converted!
   📄 Output: documentation/feature-artifacts/Requirements.md
   📸 Images: documentation/feature-artifacts/Requirements-images/ (2 diagrams)
   ```

### Example 2: Design Specification with Images

**User:** Attaches "UI_Design_Spec.docx" (contains wireframe screenshots)

**Steps:**
1. Request user save attachment to downloads/
2. User confirms: "Saved"
3. Ask output location → User accepts default
4. Convert: `spt convert "downloads/UI_Design_Spec.docx" --output "documentation/converted-docs/UI_Design_Spec.md"`
5. Report:
   ```
   ✅ Design spec converted successfully!
   📄 Markdown: documentation/converted-docs/UI_Design_Spec.md
   📸 Images: documentation/converted-docs/UI_Design_Spec-images/ (12 wireframes)
   
   All wireframe images are preserved and referenced in the markdown.
   Would you like me to analyze the design specifications?
   ```

---

## Word-Specific Error Handling

### Error: HTML Instead of .docx

**Cause**: OneDrive authentication page downloaded instead of file

**Response:**
```
⚠️  Downloaded file is HTML, not Word document

The URL requires browser authentication.

Please:
1. Open this link in your browser: <url>
2. Click "Download" button
3. Save to: downloads/<filename>.docx
4. Confirm when ready

I'll then convert the file.
```

### Error: File Not .docx Format

**Cause**: User provided .doc (old format) or other file

**Response:**
```
❌ Unsupported Word format

File: <filename>.doc
Supported: .docx (Office 2007+)

Please:
1. Open file in Microsoft Word
2. Save As → .docx format
3. Provide the .docx file

Note: .doc files (Word 97-2003) are not supported.
```

### Error: Password-Protected Document

**Cause**: Document requires password to open

**Response:**
```
❌ Cannot open password-protected Word document

Solutions:
1. Remove password protection in Word:
   - File → Info → Protect Document → Encrypt with Password
   - Clear password field → OK
2. Provide unprotected version

Note: Password-protected documents cannot be converted directly.
```

---

## Word Conversion Quality Notes

**Best Results:**
- ✅ Standard Office 2007+ .docx files
- ✅ Documents with headings, lists, tables
- ✅ Text formatting (bold, italic)
- ✅ Embedded images (PNG, JPG, GIF)

**Limitations:**
- ⚠️ Complex layouts may lose formatting
- ⚠️ Text boxes may not preserve position
- ⚠️ SmartArt/Charts converted as images only
- ⚠️ Track changes/comments not preserved
- ❌ Macros not supported (.docm)
- ❌ Old .doc format not supported

---

## Next Actions After Conversion

**Offer based on content type:**

**Requirements Document:**
```
Would you like me to:
- Extract user stories?
- Identify acceptance criteria?
- Cross-reference with Jira issues?
```

**Design Specification:**
```
Would you like me to:
- Summarize design decisions?
- Extract component specifications?
- Generate implementation tasks?
```

**Meeting Notes:**
```
Would you like me to:
- Summarize action items?
- Extract decisions made?
- Create follow-up tasks?
```

**User Guide:**
```
Would you like me to:
- Generate quick reference?
- Extract step-by-step procedures?
- Identify FAQ candidates?
```
