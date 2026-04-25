---
slug: repo-summary
title: "Repository Summary (KB)"
applies-to: [kb-instance]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 20
---

# {{repo_name}} — Repository Summary

> **Repo code:** `{{repo_code}}`
> **Role:** {{repo_role}}
> **Type:** {{repo_type}}
> **Path in source tree:** `{{repo_path}}`
> **Primary:** {{repo_is_primary}}
> **Last indexed commit:** {{repo_last_indexed_commit}}

This page is the per-repository entry point inside the
`{{project_name}}` knowledge base. Every repo enumerated in
`project.toml`'s `[[project.repos]]` carries a file at
`knowledge-base/repos/{{repo_code}}/README.md` with this shape. The
`ARCHITECTURE.md` Repository Map (§ 2) links here.

---

## 1. Purpose

{{repo_purpose_one_paragraph}}

State in 2–4 sentences what this repository exists to do, what it
deliberately does _not_ do, and what would change if it disappeared. The
"Use-when …" phrasing of individual components flows from this purpose
statement — keep it sharp.

---

## 2. Owner

| Field | Value |
|---|---|
| Owning team | {{owning_team}} |
| Primary maintainer | {{primary_maintainer}} |
| Backup maintainer | {{backup_maintainer}} |
| Contact channel | {{contact_channel}} |
| On-call rotation | {{on_call_rotation}} |

> Ownership lives here, not in individual component docs. Components
> inherit ownership from their repo unless overridden by a `consumed_by`
> caller in another repo with a stronger interest.

---

## 3. Tech Stack

| Layer | Technology / Version | Notes |
|---|---|---|
| Language(s) | {{tech_languages}} | {{tech_languages_notes}} |
| Framework(s) | {{tech_frameworks}} | {{tech_frameworks_notes}} |
| Build / package manager | {{tech_build_tooling}} | {{tech_build_tooling_notes}} |
| Test stack | {{tech_test_stack}} | {{tech_test_stack_notes}} |
| Datastore(s) | {{tech_datastores}} | {{tech_datastores_notes}} |
| Runtime / deploy target | {{tech_runtime}} | {{tech_runtime_notes}} |
| Key dependencies (top 5–10) | {{tech_key_dependencies}} | {{tech_key_dependencies_notes}} |

> Match the `type` hint on the matching `[[project.repos]]` entry in
> `project.toml`. If the two disagree, `project.toml` wins and this page
> needs updating.

---

## 4. Top Components

The components below are the highest-traffic / highest-blast-radius
components in this repo. Full list lives in the Component Catalog of
`ARCHITECTURE.md`.

| Component ID | Type | Description (Use-when …) | Doc |
|---|---|---|---|
{{top_components_table_rows}}

> "Top" is a maintainer judgement call — typically the components with the
> most incoming edges in `graph.json`, or those that show up most often in
> incident retrospectives. Aim for 5–10 rows; if every component is
> "top", the table loses its signal.

---

## 5. Public Interfaces

What other systems can call, consume, or import from this repo. This is
the contract surface the rest of the KB and downstream repos depend on.

| Kind | Identifier | Description | Source of Truth |
|---|---|---|---|
{{public_interfaces_table_rows}}

> `Kind` values: `http-endpoint`, `event-published`, `event-consumed`,
> `exported-symbol`, `cli-command`, `database-table`, `feature-flag`,
> `config-knob`. The `Source of Truth` column points at the file or
> spec (OpenAPI, AsyncAPI, schema migration, etc.) that authoritatively
> defines the interface — _not_ at this KB page.

---

## 6. Internal & Consumer Doc Pointers

The KB does not reproduce repo documentation. It points at it.

| Document | Audience | Location |
|---|---|---|
| Part A — Internal docs | Maintainers of {{repo_code}} | {{part_a_doc_pointer}} |
| Part B — Consumer / Implementer docs | Downstream callers | {{part_b_doc_pointer}} |
| API contract (OpenAPI / AsyncAPI / GraphQL SDL) | Tooling, integration tests | {{api_contract_pointer}} |
| Architecture Decision Records (repo-local) | Maintainers, architects | {{repo_local_adrs_pointer}} |
| Runbooks / on-call playbooks | On-call engineers | {{runbooks_pointer}} |
| Onboarding guide | New contributors | {{onboarding_pointer}} |

> All paths above are relative to the source repo's root, not to the KB
> root. If a document doesn't exist yet, leave the cell blank rather than
> linking to a placeholder — `verify-knowledge-base` flags placeholder
> links and they create false trust.
