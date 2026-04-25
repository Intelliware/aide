---
slug: component
title: "Component Document (KB)"
applies-to: [kb-instance]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 30
---

<!--
  Component document template. The block frontmatter above is for the
  composition tooling. The frontmatter that follows the next horizontal
  rule is the PER-COMPONENT frontmatter that ships with each generated
  components/<repo>/<component-id>.md file. Keep them distinct: the top
  block belongs to the framework, the bottom block belongs to the KB
  artifact this template produces.
-->

---

```yaml
---
# Stable kebab-case identifier. Unique across the entire KB. Survives
# renames; never changes once published.
component_id: {{component_id}}

# The PRIMARY repo for this component (the `code` of one [[project.repos]]
# entry in project.toml). For cross-repo components, additional repos
# appear in `paths` via repo-prefixed globs.
repo: {{component_repo}}

# One of: api-feature | ui-feature | framework | mobile-feature
#       | database-schema | shared-library
type: {{component_type}}

# REQUIRED: single sentence in "Use when …" form. Skill-routing matches
# against this phrasing, so the leading literal "Use when " is non-negotiable.
description: >-
  Use when {{component_use_when_clause}}

# Short keyword phrases the orchestrator matches against the user's story
# to select this component. Flat array (no grouping) by design — see
# SCHEMAS.md § 3.2 for the rationale.
triggers:
{{component_triggers_yaml_list}}

# Globs identifying the source files that constitute this component.
# Repo-prefixed entries (`<repo-code>:<glob>`) name a different repo from
# the primary `repo` above; un-prefixed entries are relative to the primary
# repo's root.
paths:
{{component_paths_yaml_list}}

# Other component_ids this component CALLS or IMPORTS. Mirrors outgoing
# edges of kind `calls` / `depends-on` in graph.json.
depends_on:
{{component_depends_on_yaml_list}}

# Inverse: component_ids that call this one. The build-knowledge-base-index
# skill keeps depends_on/consumed_by in sync; humans write whichever side
# is easier to remember.
consumed_by:
{{component_consumed_by_yaml_list}}

# Domain entities this component reads or writes. Joins to the aggregated
# data dictionary in the KB.
data_entities:
{{component_data_entities_yaml_list}}

# Full 40-char SHA of the source commit that backed the last verified
# extraction. NEVER a short hash — full SHAs only.
last_verified_against_commit: {{component_last_verified_against_commit}}

# Identifier of the most recent feature/story whose implementation touched
# this component. Lets retrospectives jump to the docs that need refresh.
# Optional — empty/missing means "no feature has touched this since
# initial extraction."
last_feature_id: {{component_last_feature_id}}

# Path (relative to the source repo's root) to the canonical Part A or
# Part B doc this component is derived from. Empty string is NOT permitted —
# every component has a source.
source_doc: {{component_source_doc}}

# One of: openapi-diff | exported-symbols-diff | route-inventory-diff
#       | schema-diff | manual
# Tells `verify-knowledge-base` which automated drift check to run.
# `manual` is allowed but flags the component for human review on every
# staleness sweep.
verification_signal: {{component_verification_signal}}
---
```

# {{component_human_title}}

## 1. Overview

{{component_overview_two_to_four_paragraphs}}

State, in plain language: what the component does, where it sits in the
flow, and the one or two design choices that shape it. Mention the
component's primary collaborators — both the things it calls
(`depends_on`) and the things that call it (`consumed_by`) — so a reader
can orient without opening `graph.json`.

---

## 2. Key Responsibilities

The bullets below are what this component _is on the hook for_. Each
should map back to one or more entries in `triggers` above. If a
responsibility has no matching trigger, either add the trigger or delete
the responsibility.

- {{responsibility_1}}
- {{responsibility_2}}
- {{responsibility_3}}
- {{responsibility_n}}

**Explicitly NOT in scope** (things readers commonly assume but which live
elsewhere):

- {{out_of_scope_1}} — owned by `{{out_of_scope_1_owner}}`
- {{out_of_scope_2}} — owned by `{{out_of_scope_2_owner}}`

---

## 3. Change-Impact Summary

What changes when this component changes. The orchestrator consults this
section before kicking off any work that touches it.

| Change Type | Likely Blast Radius | Verification Signal |
|---|---|---|
| Public interface change ({{public_interface_kind}}) | {{blast_radius_public_interface}} | {{verification_signal_public_interface}} |
| Internal refactor (no interface change) | {{blast_radius_internal}} | {{verification_signal_internal}} |
| Data-entity schema change | {{blast_radius_data_schema}} | {{verification_signal_data_schema}} |
| Dependency upgrade | {{blast_radius_dependency_upgrade}} | {{verification_signal_dependency_upgrade}} |

**Upstream dependents to notify** (from `consumed_by` plus any
known-but-unmodelled callers): {{upstream_notify_list}}

**Downstream services to monitor post-change** (from `depends_on`):
{{downstream_monitor_list}}

> The verification signals here can be more specific than the single
> `verification_signal` in the frontmatter. Frontmatter says "which
> automated check"; this section says "which check applies to which
> change kind."

---

## 4. Recent Activity

**Last touched by feature:** [`{{component_last_feature_id}}`]({{component_last_feature_link}})

**What that feature changed in this component:**
{{component_last_feature_change_summary}}

**Last verified against commit:** `{{component_last_verified_against_commit}}` ({{component_last_verified_date}})

**Open follow-ups from that change:**

- {{follow_up_1}}
- {{follow_up_2}}

> If a new feature has touched this component since this section was
> written, `build-knowledge-base-index` will refresh it. The skill
> updates `last_feature_id` and the change summary in one pass; human
> editors should leave the link format alone so the regex match still
> works.
