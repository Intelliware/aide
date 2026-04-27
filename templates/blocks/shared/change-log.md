---
slug: change-log
title: "Change Log"
applies-to: [greenfield-requirements-package, greenfield-design-package, greenfield-implementation-package, brownfield-enhancement-spec, quick-dev-spec, kb-instance, project-change-log]
requires-decision-from: [architect, qa]
optional: false
order-hint: 95
---

## Change Log

Universal change-tracking block. The same shape works for any artifact —
a requirements package, a design package, an implementation package, a
brownfield enhancement spec, a quick-dev spec, or a knowledge-base
instance. The structure is fixed; what _varies_ is the
**Parts Affected** vocabulary, which each artifact defines for itself
in the table below.

> **Provenance:** lifted from `_shared/templates/change-tracker-template.md`
> with domain-specific vocabularies pulled out of the body so this block
> can be composed into _any_ artifact. The original template enumerated
> Parts Affected values inline per artifact type; here, the inline list
> is replaced by a reference to a per-artifact `Parts Affected` table
> that the consuming artifact populates.

---

### Header

| Field | Value |
|---|---|
| Artifact | {{artifact_name}} |
| Artifact type | {{artifact_type}} |
| Current source version | {{current_source_version}} |
| Current artifact version | {{current_artifact_version}} |
| Stage / Skill of record | {{stage_or_skill_of_record}} |

---

### Versioning Convention

Artifact versions follow the source system's version with an artifact
revision suffix:

- `X.Y.Z-{{artifact_revision_label}}.1` — first revision for source
  version `X.Y.Z`.
- `X.Y.Z-{{artifact_revision_label}}.2` — correction or addition for
  source version `X.Y.Z`.
- `(X.Y.Z+1)-{{artifact_revision_label}}.1` — first revision for the
  next source version.

Replace `{{artifact_revision_label}}` with `doc`, `req`, `design`,
`impl`, or `kb` depending on the artifact. The label is purely
conventional — tooling matches on the version pattern, not the label.

---

### Parts Affected — Reference

The "Parts Affected" column in the Change Log table below uses the
values defined for this artifact. Populate the table below with the
values that apply, then reference them in change rows.

| Value | Meaning |
|---|---|
| {{parts_affected_value_1}} | {{parts_affected_meaning_1}} |
| {{parts_affected_value_2}} | {{parts_affected_meaning_2}} |
| {{parts_affected_value_3}} | {{parts_affected_meaning_3}} |
| {{parts_affected_value_n}} | {{parts_affected_meaning_n}} |
| Multiple | When more than two values apply, list them |

> **Where these values come from.** Each artifact type ships with a
> canonical Parts Affected vocabulary in its stage or skill document
> (e.g., requirements packages list Executive Summary / Functional
> Requirements / Business Rules / …; KB instances list Architecture /
> Component Catalog / Capability Index / Cross-Cutting Concerns / ADRs /
> …). Copy that vocabulary into the table above; do not invent new
> values per change. If you need a value that does not exist in the
> canonical list, fix the canonical list first, then propagate.

---

### Change Types

These types are universal across artifacts — do not extend without
updating the canonical reference.

| Change Type | When to Use |
|---|---|
| Initial Extraction | First-time creation of an artifact section from source. |
| Correction | Fixing an error in existing content (wrong type, wrong default, wrong link, etc.). |
| Source Update | Update triggered by a source-system change (new source version, new feature, modified behaviour). |
| Restructure | Reorganising content without changing the technical substance. |
| Addition | Adding content for a newly discovered or newly added artifact. |
| Deprecation | Marking content as deprecated. |
| Removal | Removing content for a removed artifact. |

---

### Change Log

Append-only. New entries go at the **top** of the most recent version
section so the most recent change is visible first when the file opens.
Sequential numbering does NOT reset across version sections.

#### {{artifact_version_current}} — {{artifact_version_current_date}}

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| {{change_seq_1}} | {{change_date_1}} | {{change_type_1}} | {{change_parts_affected_1}} | {{change_section_1}} | {{change_description_1}} | {{change_source_version_1}} | {{change_verified_1}} |
| {{change_seq_2}} | {{change_date_2}} | {{change_type_2}} | {{change_parts_affected_2}} | {{change_section_2}} | {{change_description_2}} | {{change_source_version_2}} | {{change_verified_2}} |

#### {{artifact_version_previous}} — {{artifact_version_previous_date}}

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
{{change_log_previous_version_rows}}

> **Verified column convention:** populated when the change has been
> validated against source (✅) or is awaiting verification (🔵). The
> exact symbols are project-configurable; what matters is that the
> column distinguishes "verified" from "unverified" at a glance.

---

### Detailed Changes

For non-trivial changes, expand here. Trivial corrections (typos, link
fixes) live in the table only — do not bloat this section with
single-line entries.

#### Change #{{change_seq}}

| Field | Value |
|---|---|
| Date | {{change_date}} |
| Change Type | {{change_type}} |
| Parts Affected | {{change_parts_affected}} |
| Section / File | {{change_section}} |
| Source Version | {{change_source_version}} |

**Description:**
{{change_description_long}}

**Before:**
{{change_before_state}}

**After:**
{{change_after_state}}

**Verification:**
{{change_verification_method}}

**Cross-Impact:**
{{change_cross_impact}}

---

### Cross-Part / Cross-Section Synchronisation

When a change affects one part of the artifact, evaluate the other parts
for impact. The exact patterns are artifact-specific — see the
canonical reference for this artifact type — but the rule is universal:
**no change ships without checking the parts that depend on the changed
part.**

Examples (artifact-agnostic):

| If This Changes... | Check This... |
|---|---|
| A public interface in one section | The other sections that document or consume that interface |
| A schema or data definition | All sections that reference fields of that schema |
| A standard or convention | All sections that follow that standard |
| Source system version | Every section that records source-version-specific behaviour |

The artifact's canonical reference document spells out the specific
pairings that apply. Populate them here from that reference; do not
freelance.
