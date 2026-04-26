---
slug: scaffold
sequence: 1
depends-on-prior: false
---

# Step: Scaffold Documentation Structure

Create documentation file structure and section headers BEFORE extracting any content. This enforces the canonical RE principle: structure before content.

## When to run

Run this step at the start of Stage 1 (Discovery and Inventory) of the parent reverse-engineer-api workflow, immediately after the artifact inventory has been completed and before any content extraction begins.

## Why scaffolding matters

- You negotiate structure before investing time in extraction
- Scaffolding maps 1:1 to the inventory from discovery
- It ensures all documentation parts have a home for every piece of information
- It prevents AI from inventing content that doesn't exist in source code
- Partially filled scaffolding shows exactly what remains to be done

## Inputs

- The completed artifact inventory (endpoints, middleware, services, entities, etc.)
- Source version being documented
- Any scope exclusions (deprecated modules, legacy v1, planned-but-not-built features)
- The relevant template file for this RE domain

## Process

### 1. Gather Inventory

Confirm the discovery output: artifact inventory, source version, scope exclusions. Read or create `extraction-status.md`.

### 2. Propose File Structure

Based on the documentation model (Part A, Part B1, Part B2 for API) and the artifact inventory:

1. Generate the complete directory tree for all documentation parts
2. For each file, show:
   - File path
   - Section headers (from the template, ## and ### levels)
   - Which inventory items map to each section
3. Recommend the extraction order (which sections to fill first)

Present this as a proposal — the user must approve before any files are created.

**Critical Rule:** Show structure and headers ONLY. Do NOT extract or generate any content.

### 3. Create the Files

After user approval:

1. Create all directories
2. Create each file with:
   - Filename and title
   - All section headers (## and ### levels) from the template
   - Empty placeholder markers (e.g., `<!-- TODO: Extract from <source file> -->`)
   - The template's metadata block at the top of each file
3. Create or update `extraction-status.md` linking each inventory item to its documentation location
4. Create `CHANGE-TRACKER.md` using the template referenced by the parent skill

### 4. Confirm Readiness

After creating scaffolding, summarize:
- Total files created per documentation part
- Recommended extraction order
- First section to extract — hand control back to the parent skill's Stage 2

## Output

- Complete directory tree for all documentation parts (Part A in repo; Part B1 + Part B2 in KB)
- Empty files with section headers and TODO markers
- `extraction-status.md` mapping each artifact to its documentation location
- `CHANGE-TRACKER.md` initialized

## Halt conditions

- Halt if the inventory is incomplete — scaffolding without inventory produces a structure that does not match the source.
- Halt if the user has not approved the proposed structure — never create files without approval.
- Halt if the template referenced by the parent skill cannot be located.

## Common mistakes

- Generating content during scaffolding — section bodies must be empty TODO markers, not draft text
- Skipping the user-approval gate — structure changes are cheap before files exist, expensive after
- Not mapping inventory items to sections — leads to artifacts with no documentation home
- Scaffolding Part A only and forgetting Part B file structures — all parts need scaffolding up front
