# document-convert — Example

## Scenario: Convert Excel Spreadsheet with Analysis

### User Request

> "Convert this timeline spreadsheet: https://sharepoint.example.com/.../Project_Timeline.xlsx"

### Agent Workflow

#### Step 1: Detect Format

Extract URL → detect `.xlsx` extension

#### Step 2: Download File

```bash
spt download "<url>" --output "downloads/Project_Timeline.xlsx"
```

#### Step 3: Load Format-Specific Instructions

Read `references/excel-conversion.md` for Excel-specific workflow

#### Step 4: Ask for Output Location

```
Where to save output?
1. documentation/converted-docs/ (default)
2. documentation/feature-artifacts/
3. Custom path
```

#### Step 5: Convert to Markdown

```bash
spt convert-excel "downloads/Project_Timeline.xlsx" --output "documentation/converted-docs/Project_Timeline.md"
```

#### Step 6: Analyze Content

Read `Project_Timeline.md` → generate analysis:

```markdown
# Project Timeline - Analysis Report

## Executive Summary
Timeline spans Aug 2024 - Mar 2025 with 47 deliverables across 8 workstreams.

## Key Findings
- 12 deliverables due in Sprint 23 (resource bottleneck)
- API Design phase has 2-week delay buffer
- UI Framework missing assigned owner

## Recommendations
1. Assign owner to UI Framework workstream
2. Review resource allocation for Sprint 23
```

Save to `Project_Timeline-analysis.md`

#### Step 7: Present to User

```
✅ Conversion & Analysis Complete!

📄 Raw data: Project_Timeline.md
📊 Analysis: Project_Timeline-analysis.md

Key insights:
- Resource bottleneck in Sprint 23 (12 deliverables)
- UI Framework needs owner assignment
- 2-week buffer in API Design phase

Would you like me to deep dive into any section?
```
