---
name: track-change
description: >
  Log documentation changes using the standardized Change Tracker template. Use this skill whenever the
  user says "log a change", "update the change tracker", "record this documentation change", "track this
  update", "add to change log", or after completing any documentation extraction or modification session.
  Also trigger when the user finishes a documentation task and needs to record what was done. This skill
  ensures changes are logged with the correct Parts Affected values, versioning convention, and
  cross-impact assessment.
---

# Track Change

You are helping a user log a documentation change in their Change Tracker file using the standardized
format defined by the framework.

## Before You Start

1. Read `templates/change-tracker-template.md` to understand the universal structure
2. Identify which phase document applies (the user should tell you, or you can check which `docs/` directories exist)
3. Read the relevant phase document's Change Tracking section to get the correct Parts Affected values

## Step 1: Determine Context

Ask the user (or infer from conversation history):

- **What system/repository** was the documentation change for?
- **What changed?** (new extraction, correction, update, restructure, addition, deprecation, removal)
- **Which documentation parts were affected?** (use the Parts Affected values from the relevant phase doc)
- **What source version** does this correspond to?
- **How was the change verified?** (against source code, tests, manual review)
- **Any cross-impact?** (did changes in one part require updates to other parts?)

## Step 2: Check for Existing Change Tracker

Look for `CHANGE-TRACKER.md` in the relevant documentation directory (e.g., `docs/api/CHANGE-TRACKER.md`).

- **If it exists:** Read it to get the current documentation version and the last change number
- **If it doesn't exist:** Create one using the template from `templates/change-tracker-template.md`, populating the Parts Affected reference table with values from the relevant phase document

## Step 3: Log the Change

Add two entries:

1. **Summary row** in the Change Log table:
   ```
   | [next-seq] | YYYY-MM-DD | [type] | [parts affected] | [section/file] | [description] | [source version] | [verified status] |
   ```

2. **Detailed entry** in the Detailed Changes section:
   ```
   ### Change #[next-seq]

   **Date:** YYYY-MM-DD
   **Change Type:** [type]
   **Parts Affected:** [values]
   **Section/File:** [path]
   **Source Version:** [version]

   **Description:** [what and why]
   **Before:** [previous content or N/A]
   **After:** [new content summary]
   **Verification:** [how verified]
   **Cross-Impact:** [other parts affected, or None]
   ```

## Step 4: Version Check

If this change corresponds to a new source version:
- Update the "Current Source Version" at the top of the tracker
- Create a new Change Log section header for the new documentation version
- Increment the documentation version following the `X.Y.Z-doc.N` convention

## Change Types Reference

| Type | When |
| --- | --- |
| Initial Extraction | First-time documentation from source |
| Correction | Fixing an error in existing docs |
| Source Update | Update triggered by source code change |
| Restructure | Reorganizing without changing content |
| Addition | Adding newly discovered/added artifact |
| Deprecation | Marking artifact as deprecated |
| Removal | Removing documentation for removed artifact |

## Important

- Change numbers NEVER reset — always increment from the last number
- Always assess cross-impact: when one part changes, which other parts might need updating?
- Batch related changes under one change number if they stem from the same cause
