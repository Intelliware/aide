---
name: scaffold-documentation
description: >
  Create documentation scaffolding — file structure and section headers — before extracting any content.
  Use this skill whenever the user says "create the scaffolding", "set up the doc structure", "propose
  the file structure", "create documentation skeleton", "set up the documentation files", or when
  starting a new documentation effort for any repository type. Also trigger when the user has completed
  an inventory/discovery phase and needs to organize findings into a file structure before extraction
  begins. This skill enforces the "structure before content" principle that prevents AI from inventing
  content prematurely.
---

# Scaffold Documentation

You are helping a user create the documentation file structure and section headers for a repository
before any content is extracted. This enforces the framework's core principle: structure before content.

## Why Scaffolding Matters

- You negotiate structure before investing time in extraction
- Scaffolding maps 1:1 to the inventory from discovery
- It ensures all documentation parts have a home for every piece of information
- It prevents AI from inventing content that doesn't exist in source code
- Partially filled scaffolding shows exactly what remains to be done

## Before You Start

1. Read `phases/canonical-reverse-engineering-shape.md` § Scaffolding Approach for the universal process
2. Identify which phase document applies and read its Documentation Package Components section for the recommended file structure
3. Read the relevant template from `templates/` to understand the expected output structure
4. Confirm the user has completed the discovery/inventory phase — scaffolding should map to real artifacts

## Step 1: Gather Inventory

Ask the user for (or read from an existing extraction-status.md):

- **Repository type** (API, UI framework, web app, database, mobile app, mobile framework, knowledge repository)
- **Artifact inventory** (endpoints, components, tables, procedures, services, etc.)
- **Source version** being documented
- **Any scope exclusions** (deprecated modules, planned-but-not-built features)

## Step 2: Propose File Structure

Based on the phase document's recommended file structure and the inventory:

1. Generate the complete directory tree for all documentation parts (Part A, Part B, etc.)
2. For each file, show:
   - File path
   - Section headers (from the template)
   - Which inventory items map to each section
3. Recommend the extraction order (which sections to fill first)

Present this as a proposal — the user must approve before any files are created.

**Critical Rule:** Show structure and headers ONLY. Do NOT extract or generate any content.

## Step 3: Create the Files

After user approval:

1. Create all directories
2. Create each file with:
   - The filename and title
   - All section headers (## and ### levels)
   - Empty placeholder content markers (e.g., `<!-- TODO: Extract from [source file] -->`)
   - The template's metadata block at the top of each file
3. Create or update the `extraction-status.md` file linking each inventory item to its documentation location
4. Create the `CHANGE-TRACKER.md` file using `../_shared/templates/change-tracker-template.md`

## Step 4: Confirm Readiness

After creating scaffolding, summarize:
- Total files created per documentation part
- Recommended extraction order
- First section to extract (suggest the user invoke the relevant reverse engineering skill)

## Phase-Specific File Structures

Each phase document has a "Documentation Package Components" section with the recommended structure.
Read the relevant one:

| Repository Type | Phase Document | Template |
| --- | --- | --- |
| API | `phases/reverse-engineer-api-phase.md` | `templates/api-internal-doc-template.md` |
| UI Framework | `phases/reverse-engineer-ui-framework-phase.md` | `templates/ui-framework-doc-template.md` |
| Web Application | `phases/reverse-engineer-web-app-phase.md` | `templates/web-app-doc-template.md` |
| API Framework | `phases/reverse-engineer-api-framework-phase.md` | `templates/api-framework-doc-template.md` |
| Database | `phases/reverse-engineer-database-phase.md` | `templates/database-doc-template.md` |
| Mobile App | `phases/reverse-engineer-mobile-app-phase.md` | `templates/mobile-app-doc-template.md` |
| Mobile Framework | `phases/reverse-engineer-mobile-framework-phase.md` | `templates/mobile-framework-doc-template.md` |
