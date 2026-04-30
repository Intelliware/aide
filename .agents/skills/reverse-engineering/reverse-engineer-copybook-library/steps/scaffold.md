---
slug: scaffold
sequence: 1
depends-on-prior: false
---

# Step: Scaffold Documentation Structure

Create documentation file structure and section headers BEFORE extracting any content. This enforces the canonical RE principle: structure before content.

## When to run

Run at the start of Stage 1 (Discovery and Inventory) of the parent reverse-engineer-copybook-library workflow, immediately after the copybook inventory has been completed and before any per-copybook extraction begins.

## Why scaffolding matters

- You negotiate naming-convention buckets and divergent-layout scope before extraction
- Scaffolding maps 1:1 to the inventory from discovery
- Ensures every copybook has a home for record-by-record content
- Prevents AI from inventing PIC clauses or REDEFINES variants that don't exist in source
- Partially filled scaffolding shows exactly which copybooks remain to extract

## Inputs

- The completed copybook inventory (file count, naming-convention buckets, byte-level duplicate detection)
- Source version (Endevor / ChangeMan / Panvalet package or commit SHA)
- Naming-convention buckets agreed with user
- Any scope exclusions (legacy folders read-only, vendor-shipped copybooks, generated copybooks)
- The matched compositions (`re-copybook-library-internal.yaml`, `re-copybook-library-consumer.yaml`)

## Process

### 1. Gather Inventory

Confirm the discovery output. Read or create `extraction-status.md`. Confirm naming-convention buckets and divergent-layout scope with the user.

### 2. Propose File Structure

Based on the documentation model (Part A, Part B for copybook-library) and the inventory:

1. Generate the complete directory tree for both parts plus the three mandatory feed-files at the Part-B root
2. For each file, show file path, section headers, and inventory items mapped to each section
3. Recommend the extraction order: per-copybook records → variants and conflicts → cross-library dictionary

Show structure ONLY. Do NOT extract or generate content.

### 3. Create the Files

After user approval:

1. Create directories
2. Create files with section headers and TODO markers
3. Create empty feed-files (`copybook-record-graph.json`, `data-dictionary.md`, `copybook-conflicts.md`) at the Part-B root
4. Initialize `extraction-status.md` and `CHANGE-TRACKER.md`

### 4. Confirm Readiness

Summarize files created, recommended extraction order, first copybook to extract.

## Output

- Directory tree for Part A (in repo) and Part B (in KB)
- Empty files with section headers and TODO markers
- Empty feed-files at the Part-B root
- `extraction-status.md` and `CHANGE-TRACKER.md` initialized

## Halt conditions

- Halt if copybook inventory is incomplete (especially the duplicate-detection pass)
- Halt if user has not approved the proposed structure or naming-convention buckets
- Halt if either composition referenced by the parent skill cannot be located

## Common mistakes

- Generating content during scaffolding
- Skipping the user-approval gate on naming-convention buckets — Part B's "use this copybook for X" guidance depends on these
- Forgetting the three mandatory feed-files at the Part-B root
- Treating duplicate detection as optional — divergent layouts must be in scope from Stage 1
