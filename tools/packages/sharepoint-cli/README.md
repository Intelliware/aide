# @ea-workspace/sharepoint-cli

Cross-platform SharePoint CLI for document management on TD Internal and Microsoft 365 SharePoint.

## 🚀 Features

- ✅ **Upload** files to SharePoint
- ✅ **Download** files from SharePoint
- ✅ **List** files in folders
- ✅ **Convert** Word documents (.docx) to Markdown
- ✅ **Convert** PDF documents (.pdf) to Markdown
- ✅ **Convert** Excel spreadsheets (.xlsx, .xls) to Markdown
- ✅ **Search** for files (advanced)
- ✅ **Metadata** management
- ✅ **TD Internal** SharePoint (myteam.td.com) via NTLM
- ✅ **Microsoft 365** SharePoint (*.sharepoint.com) via Graph API
- ✅ Encrypted credential storage
- ✅ Secure logging with credential redaction

## 📦 Installation

From the monorepo root:

```bash
cd tools
npm install
npm run link-all
```

This makes the `spt` command available globally.

## 🔐 Configuration

### Option 1: Environment Variables (.env)

Create a `.env` file in the workspace root:

```bash
# Microsoft 365 SharePoint
SHAREPOINT_API_TOKEN=your-bearer-token

# TD Internal SharePoint (Windows Authentication)
WINDOWS_USERNAME=your-username
WINDOWS_PASSWORD=your-password
WINDOWS_DOMAIN=TD

# Optional
LOG_LEVEL=info
```

### Option 2: Encrypted Storage

Configuration is automatically encrypted and stored locally using `conf`:

```bash
# Credentials are stored encrypted in:
# Windows: %APPDATA%/sharepoint-cli/config.json
# macOS: ~/Library/Preferences/sharepoint-cli/config.json  
# Linux: ~/.config/sharepoint-cli/config.json
```

## 📖 Usage

### Check Status

```bash
spt status
```

### Upload File

```bash
# Upload to TD Internal SharePoint
spt upload document.pdf --site https://myteam.td.com/teams/yoursite --folder "/Shared Documents"

# Upload to Microsoft 365 SharePoint
spt upload report.xlsx --site https://yourtenant.sharepoint.com/sites/yoursite --folder "/Documents" --overwrite
```

### Download File

```bash
# Download from TD Internal
spt download "https://myteam.td.com/.../document.pdf" --output ./local-file.pdf

# Download from Microsoft 365
spt download "https://yourtenant.sharepoint.com/.../report.xlsx" --output ./report.xlsx
```

### List Files

```bash
# List files in folder
spt list --site https://myteam.td.com/teams/yoursite --folder "/Shared Documents"
```

### Platform Info

```bash
# Check platform information for a URL
spt platform https://myteam.td.com/teams/yoursite
```

### Convert Word Documents to Markdown

```bash
# Convert .docx to .md
spt convert "downloads/document.docx" --output "downloads/document.md"

# Convert downloaded Word file
spt download "https://myteam.td.com/.../requirements.docx" --output "downloads/requirements.docx"
spt convert "downloads/requirements.docx" --output "downloads/requirements.md"
```

**Features:**
- Uses Mammoth.js for high-quality conversion
- Preserves headings, lists, tables, and formatting
- Works with Office 2007+ .docx files
- **Note:** `--output` is required for Word documents

### Convert PDF Documents to Markdown

```bash
# Basic conversion (default: saves to documentation/converted-docs/)
spt convert-pdf "downloads/document.pdf"

# Specify custom output path
spt convert-pdf "downloads/document.pdf" --output "custom/path/document.md"

# Include PDF metadata
spt convert-pdf "downloads/report.pdf" --metadata

# Convert specific page range
spt convert-pdf "downloads/large-doc.pdf" --pages "1-10"

# Complete workflow: Download then convert
spt download "https://myteam.td.com/.../specifications.pdf" --output "downloads/specifications.pdf"
spt convert-pdf "downloads/specifications.pdf"
# → Output: documentation/converted-docs/specifications.md
```

**Features:**
- Text extraction from PDF documents
- Preserves paragraph structure
- Handles basic tables and lists
- Optional metadata inclusion
- Page range filtering
- **Default output:** `documentation/converted-docs/` (gitignored)

**Note:** PDF conversion quality depends on the source document:
- ✅ Best: Text-based PDFs (e.g., exported from Word)
- ⚠️ Fair: Multi-column layouts (may need cleanup)
- ❌ Poor: Scanned PDFs (requires OCR first)

### Convert Excel Documents to Markdown

```bash
# Basic conversion - converts all sheets (default: saves to documentation/converted-docs/)
spt convert-excel "downloads/spreadsheet.xlsx"

# Specify custom output path
spt convert-excel "downloads/data.xlsx" --output "custom/path/data.md"

# Convert specific sheet only (by name)
spt convert-excel "downloads/workbook.xlsx" --sheet "Summary"

# Convert specific sheet by number (1-based index)
spt convert-excel "downloads/workbook.xlsx" --sheet 2

# Include Excel metadata
spt convert-excel "downloads/report.xlsx" --metadata

# Skip table of contents for multi-sheet workbooks
spt convert-excel "downloads/multi-sheet.xlsx" --no-toc

# Include blank rows in output
spt convert-excel "downloads/data.xlsx" --include-blank-rows

# Complete workflow: Download then convert
spt download "https://myteam.td.com/.../data.xlsx" --output "downloads/data.xlsx"
spt convert-excel "downloads/data.xlsx"
# → Output: documentation/converted-docs/data.md
```

**Features:**
- Uses SheetJS (xlsx) for robust parsing
- Converts all sheets to markdown tables
- Auto-generates table of contents for multi-sheet workbooks
- Select specific sheets by name or index
- Preserves table structure and cell data
- Handles multiple formats: `.xlsx`, `.xls`, `.xlsm`, `.xlsb`, `.csv`
- Optional metadata extraction
- **Default output:** `documentation/converted-docs/` (gitignored)

**Output format:**
- Each sheet becomes a markdown section with heading
- Data rendered as markdown tables
- Pipe characters in cells are automatically escaped
- Newlines in cells converted to `<br>` tags

**Tips:**
- For large workbooks, use `--sheet` to convert specific sheets
- Multi-sheet workbooks get automatic TOC (disable with `--no-toc`)
- Works great for converting test cases, data dictionaries, requirements matrices

## 🌐 Supported Platforms

### TD Internal SharePoint (myteam.td.com)

- **API**: SharePoint REST API
- **Authentication**: Windows Integrated (on Windows) or NTLM
- **Features**: Full CRUD operations
- **Requirements**: 
  - On Windows: No configuration needed (uses your Windows login)
  - On Linux/macOS: WINDOWS_USERNAME and WINDOWS_PASSWORD in .env

**Supported URLs**:
- ✅ SharePoint document library: `https://myteam.td.com/teams/site/Shared Documents/file.pdf`
- ❌ OneDrive share links: `https://mydrive.td.com/:w:/...` (see limitations below)

### Microsoft 365 SharePoint (*.sharepoint.com)

- **API**: Microsoft Graph API v1.0
- **Authentication**: Bearer Token (OAuth 2.0)
- **Features**: Full CRUD operations
- **Requirements**: SHAREPOINT_API_TOKEN in .env

---

## ⚠️ OneDrive Share Links - Known Limitation

**OneDrive share links cannot be downloaded directly.**

### What doesn't work:

❌ **Share links** (designed for browser viewing):
```bash
# These will fail with a helpful error message:
https://mydrive.td.com/:w:/g/personal/user/UniqueId?...
https://mydrive.td.com/:w:/r/personal/user/Documents/file.docx?d=...
```

These links return HTML pages requiring browser interaction, not the actual file.

### What to do instead:

**Option 1: Get direct file URL**
1. Open the share link in your browser
2. Once loaded, copy the URL from the address bar
3. Use the direct URL (should look like `https://mydrive.td.com/personal/user/Documents/file.docx`)

**Option 2: Manual download**
1. Open share link in browser
2. Click "Download" button
3. Save to `./downloads/` folder

**Option 3: Use SharePoint library URLs**
```bash
# SharePoint document library URLs work directly:
spt download "https://myteam.td.com/teams/site/Shared Documents/file.pdf" \
  --output ./file.pdf
```

### Error message:

When you provide a share link, you'll see:
```
❌ You provided a SHARE LINK (for browser viewing)
✅ To download, you need the DIRECT FILE URL

Option 1: Get direct URL from browser...
Option 2: Manual download...
Option 3: Use SharePoint document library URL...
```

## 📁 Examples

### Complete Workflow

```bash
# 1. Check configuration
spt status

# 2. Upload a file
spt upload presentation.pptx \
  --site https://myteam.td.com/teams/engineering \
  --folder "/Shared Documents/Presentations"

# 3. List uploaded files
spt list \
  --site https://myteam.td.com/teams/engineering \
  --folder "/Shared Documents/Presentations"

# 4. Download file
spt download "https://myteam.td.com/.../presentation.pptx" \
  --output ./backup.pptx
```

## 🔧 Development

### Run Locally

```bash
cd packages/sharepoint-cli
node bin/spt.js --help
```

### Run Tests

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## 🏗️ Architecture

```
sharepoint-cli/
├── src/
│   ├── index.js                     ← Main orchestrator
│   ├── auth/
│   │   └── auth-manager.js          ← NTLM/Bearer auth
│   ├── clients/
│   │   ├── base-client.js           ← Abstract base
│   │   ├── td-internal-client.js    ← TD SharePoint REST API
│   │   ├── microsoft365-client.js   ← MS Graph API
│   │   └── sharepoint-client-factory.js
│   └── operations/
│       ├── upload.js
│       ├── download.js
│       └── list.js
├── bin/
│   └── spt.js                       ← CLI entry point
└── package.json
```

### Shared Utilities

Common utilities are imported from `@ea-workspace/shared-utils`:
- ConfigManager (encrypted config)
- Logger (Winston with credential redaction)
- Validators (input sanitization)
- Error Handler (standardized errors)

## 🚨 Security

- ✅ Credentials encrypted at rest
- ✅ HTTPS-only connections
- ✅ Credential redaction in logs
- ✅ Input validation and sanitization
- ✅ Path traversal prevention

## 🐛 Troubleshooting

### Command not found: spt

```bash
cd tools
npm run link-all
```

### Authentication failed

**TD Internal**: Check WINDOWS_USERNAME and WINDOWS_PASSWORD in .env

**Microsoft 365**: Check SHAREPOINT_API_TOKEN is valid and not expired

### File size limit exceeded

Maximum file size is 250 MB. Use chunked upload for larger files (future feature).

## 📚 Related Documentation

- [Shared Utils](../shared-utils/README.md)
- [Atlassian CLI](../atlassian-cli/README.md)

## 📝 License

MIT © EasyApply Team
