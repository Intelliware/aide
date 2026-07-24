---
slug: scaffold
sequence: 1
depends-on-prior: false
---

# Step: Scaffold Documentation Structure

Create documentation file structure and section headers BEFORE extracting any content. This enforces the canonical RE principle: structure before content.

## When to run

Run at the start of Stage 1 (Discovery and Inventory) of the parent reverse-engineer-jcl-job workflow, immediately after the job inventory has been completed and before any per-job extraction begins.

## Why scaffolding matters

- You negotiate scheduler-of-record and symbolic-substitution conventions before extraction
- Scaffolding maps 1:1 to the inventory from discovery
- Ensures every job has a home for step-by-step content
- Prevents AI from inventing PROC overrides or DD definitions that don't exist in source
- Partially filled scaffolding shows exactly which jobs remain to extract

## Inputs

- The completed job + PROC + INCLUDE inventory
- Source version (Endevor / ChangeMan / Panvalet package or commit SHA)
- Scheduler of record (Control-M / CA-7 / OPC/A / Zeke / JES2 native)
- Symbolic-substitution conventions confirmed with user
- Any scope exclusions (deprecated jobs, archived versions, vendor-shipped JCL)
- The matched compositions (`re-jcl-job-internal.yaml`, `re-jcl-job-consumer.yaml`)

## Process

### 1. Gather Inventory

Confirm the discovery output. Read or create `extraction-status.md`. Confirm scheduler of record and symbolic-substitution conventions with the user.

### 2. Propose File Structure

Based on the documentation model (Part A, Part B for jcl-job) and the inventory:

1. Generate the complete directory tree for both parts plus the two mandatory feed-files at the Part-B root (the KB `source-docs/<slug>/` directory)
2. For each file, show file path, section headers, and inventory items mapped to each section
3. Recommend the extraction order: per-job step reference → PROC expansion → DD inventory → cross-cutting → consumer guide

Show structure ONLY. Do NOT extract or generate content.

### 3. Create the Files

After user approval:

1. Create directories
2. Create files with section headers and TODO markers
3. Create empty feed-files (`job-flow.mmd`, `dataset-io.json`) at the Part-B root (the KB `source-docs/<slug>/` directory)
4. Initialize `extraction-status.md` and `CHANGE-TRACKER.md`

### 4. Confirm Readiness

Summarize files created, recommended extraction order, first job to extract.

## Output

- Directory tree for Part A (in repo) and Part B (in KB)
- Empty files with section headers and TODO markers
- Empty feed-files at the Part-B root (the KB `source-docs/<slug>/` directory)
- `extraction-status.md` and `CHANGE-TRACKER.md` initialized

## Halt conditions

- Halt if job + PROC + INCLUDE inventory is incomplete
- Halt if user has not approved the proposed structure or symbolic-substitution conventions
- Halt if either composition referenced by the parent skill cannot be located
- Halt if the matched COBOL program repo's Part A is missing AND `EXEC PGM=` calls are widespread (Part B's "what this job does" depends on knowing what each program does)

## Common mistakes

- Generating content during scaffolding
- Skipping the user-approval gate on scheduler-of-record — Part B's predecessor/successor edges depend on this
- Forgetting the two mandatory feed-files at the Part-B root (the KB `source-docs/<slug>/` directory)
- Treating PROC expansion as optional during scaffolding (it is — but the file structure must still leave room for the resolved view)
