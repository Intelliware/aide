---
slug: scaffold
sequence: 1
depends-on-prior: false
---

# Step: Scaffold Documentation Structure

Create documentation file structure and section headers BEFORE extracting any content. This enforces the canonical RE principle: structure before content.

## When to run

Run at the start of Stage 1 (Discovery and Inventory) of the parent reverse-engineer-ui-framework workflow, immediately after the artifact inventory has been completed and before any content extraction begins.

## Why scaffolding matters

- You negotiate structure before investing time in extraction
- Scaffolding maps 1:1 to the inventory from discovery
- It ensures all documentation parts have a home for every piece of information
- It prevents AI from inventing content that doesn't exist in source code
- Partially filled scaffolding shows exactly what remains to be done

## Inputs

- The completed artifact inventory (components, services, directives, pipes, DI tokens, design tokens, theme system)
- Source version being documented
- Any scope exclusions (deprecated v1 components, internal-only utilities)
- The relevant template file for this RE domain

## Process

### 1. Gather Inventory

Confirm the discovery output. Read or create `extraction-status.md`.

### 2. Propose File Structure

Based on the documentation model (Part A and Part B for UI framework) and the inventory:

1. Generate the complete directory tree for both documentation parts
2. For each file, show file path, section headers, and inventory items mapped to each section
3. Recommend the extraction order (foundation → components → services → patterns)

Show structure ONLY. Do NOT extract or generate content.

### 3. Create the Files

After user approval:

1. Create directories
2. Create files with section headers and TODO markers
3. Initialize `extraction-status.md` and `CHANGE-TRACKER.md`

### 4. Confirm Readiness

Summarize files created, recommended extraction order, first section to extract.

## Output

- Directory tree for Part A (in repo) and Part B (in KB)
- Empty files with section headers and TODO markers
- `extraction-status.md` and `CHANGE-TRACKER.md` initialized

## Halt conditions

- Halt if inventory is incomplete
- Halt if user has not approved the proposed structure
- Halt if the template referenced by the parent skill cannot be located

## Common mistakes

- Generating content during scaffolding
- Skipping the user-approval gate
- Not mapping inventory items to sections
- Scaffolding Part A only and forgetting Part B file structures
