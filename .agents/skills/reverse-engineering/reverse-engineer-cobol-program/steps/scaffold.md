---
slug: scaffold
sequence: 1
depends-on-prior: false
---

# Step: Scaffold Documentation Structure

Create documentation file structure and section headers BEFORE extracting any content. This enforces the canonical RE principle: structure before content.

## When to run

Run at the start of Stage 1 (Discovery and Inventory) of the parent reverse-engineer-cobol-program workflow, immediately after the program inventory has been completed and before any content extraction begins.

## Why scaffolding matters

- You negotiate structure before investing time in extraction
- Scaffolding maps 1:1 to the inventory from discovery
- Ensures every program has a home for division-by-division content
- Prevents AI from inventing PERFORM/CALL/EXEC content that doesn't exist in source
- Partially filled scaffolding shows exactly which programs remain to extract

## Inputs

- The completed program inventory (programs by execution context, copybooks referenced, EXEC blocks, called subprograms)
- Source version (Endevor / ChangeMan / Panvalet package or commit SHA)
- Any scope exclusions (deprecated programs, archived versions, vendor-shipped sources)
- The matched compositions (`re-cobol-program-internal.yaml`, `re-cobol-program-consumer.yaml`)

## Process

### 1. Gather Inventory

Confirm the discovery output. Read or create `extraction-status.md`. Confirm execution context per program (batch / CICS / IMS-MPP / IMS-BMP). Confirm copybook references resolve (cross-check against the matched copybook-library Part A if available).

### 2. Propose File Structure

Based on the documentation model (Part A, Part B for cobol-program) and the inventory:

1. Generate the complete directory tree for both parts plus the three mandatory feed-files
2. For each file, show file path, section headers, and inventory items mapped to each section
3. Recommend the extraction order: divisions → control flow → bindings → consumer → verification

Show structure ONLY. Do NOT extract or generate content.

### 3. Create the Files

After user approval:

1. Create directories
2. Create files with section headers and TODO markers
3. Create empty feed-files (`program-call-graph.mmd`, `program-data-bindings.json`, `program-exec-inventory.md`) at the Part-B root (the KB `source-docs/<slug>/` directory)
4. Initialize `extraction-status.md` and `CHANGE-TRACKER.md`

### 4. Confirm Readiness

Summarize files created, recommended extraction order, first program to extract.

## Output

- Directory tree for Part A (in repo) and Part B (in KB)
- Empty files with section headers and TODO markers
- Empty feed-files at the Part-B root (the KB `source-docs/<slug>/` directory)
- `extraction-status.md` and `CHANGE-TRACKER.md` initialized

## Halt conditions

- Halt if program inventory is incomplete
- Halt if user has not approved the proposed structure
- Halt if a referenced copybook cannot be resolved against the matched copybook-library Part A (or, if no library Part A exists, against `../COPYBOOK/` or equivalent)
- Halt if either composition referenced by the parent skill cannot be located

## Common mistakes

- Generating content during scaffolding
- Skipping the user-approval gate
- Forgetting the three mandatory feed-files at the Part-B root (the KB `source-docs/<slug>/` directory)
- Not verifying execution-context per program — Part B differs sharply between batch and CICS
- Treating dynamic CALLs as resolved during scaffolding (resolve only when extracting Stage 3)
