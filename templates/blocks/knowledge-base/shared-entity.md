---
slug: shared-entity
title: "Shared Domain Entity (KB)"
applies-to: [kb-instance]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 40
---

# Entity: {{entity_name}}

> **Entity ID:** `{{entity_id}}`
> **Owning component:** [`{{owning_component_id}}`]({{owning_component_doc_path}})
> **Owning repo:** `{{owning_repo_code}}`
> **Source of truth:** {{entity_source_of_truth_pointer}}
> **Last verified against commit:** `{{entity_last_verified_against_commit}}`

This page lives at `knowledge-base/shared/entities/{{entity_id}}.md` and
describes a domain entity that crosses component boundaries. Entities
that are local to one component do _not_ get their own page — they live
in that component's body. Promote an entity here when:

- Two or more components in `data_entities` reference it, or
- The entity has a non-trivial lifecycle (created in repo A, mutated in
  repo B, archived in repo C), or
- Downstream callers need a stable canonical schema independent of any
  one component's storage representation.

---

## 1. Definition

{{entity_definition_one_paragraph}}

State, in plain language: what this entity represents in the business
domain, what real-world thing it models, and what _conceptually_
distinguishes it from neighbouring entities ({{neighbouring_entity_1}},
{{neighbouring_entity_2}}). Avoid implementation talk in this section —
implementation lives in § 3.

---

## 2. Owning Component

| Field | Value |
|---|---|
| `component_id` | [`{{owning_component_id}}`]({{owning_component_doc_path}}) |
| Repo | `{{owning_repo_code}}` |
| Why this component owns it | {{owning_component_rationale}} |
| Storage location (table / collection / index) | {{entity_storage_location}} |
| Identifier strategy | {{entity_identifier_strategy}} |

> Exactly _one_ component owns the canonical record for an entity. Other
> components that read this entity must call into the owning component or
> consume an event it publishes — they MUST NOT write to the storage
> location directly. If the schema disagrees, the owning component wins.

---

## 3. Fields / Schema

| Field | Type | Required | Source of Truth | Notes |
|---|---|---|---|---|
{{entity_fields_table_rows}}

> The `Source of Truth` column points at the file or spec that
> authoritatively defines the field — typically an OpenAPI schema, a
> database migration, or a `.proto` / GraphQL SDL file in the owning
> repo. The KB never owns the schema; it indexes it.

**Invariants** (constraints that hold across all valid instances):

- {{invariant_1}}
- {{invariant_2}}
- {{invariant_n}}

**Validation hooks** (where invariants are enforced in code):

- {{validation_hook_1}}
- {{validation_hook_2}}

---

## 4. Lifecycle

The entity's lifecycle, told as a sequence. Each row names the action,
the component that performs it, and the trigger that initiates it.

| Stage | Action | Performed By | Trigger | Resulting State |
|---|---|---|---|---|
| Created | {{lifecycle_create_action}} | `{{lifecycle_create_component}}` | {{lifecycle_create_trigger}} | {{lifecycle_create_resulting_state}} |
| Updated | {{lifecycle_update_action}} | `{{lifecycle_update_component}}` | {{lifecycle_update_trigger}} | {{lifecycle_update_resulting_state}} |
| Archived / Deleted | {{lifecycle_delete_action}} | `{{lifecycle_delete_component}}` | {{lifecycle_delete_trigger}} | {{lifecycle_delete_resulting_state}} |
| Restored (if applicable) | {{lifecycle_restore_action}} | `{{lifecycle_restore_component}}` | {{lifecycle_restore_trigger}} | {{lifecycle_restore_resulting_state}} |

**State transitions** (only if the entity has a non-trivial state machine):

```mermaid
{{entity_state_machine_mermaid}}
```

> Most entities don't need a state machine — `created → updated*
> → archived` is enough. Reserve the diagram for entities where the
> _allowed_ transitions are a subset of the _possible_ ones (e.g., an
> Order can move `placed → paid → fulfilled → closed` but not skip
> states).

---

## 5. Used By

Components that read or reference this entity. The owning component is
listed for completeness but never appears as a "consumer" of itself.

| Component ID | Repo | Access Mode | Why It Reads This Entity |
|---|---|---|---|
{{entity_used_by_table_rows}}

> `Access Mode` values: `synchronous-read` (HTTP/gRPC call to the owning
> component), `event-subscription` (consumes events published by the
> owner), `replicated-projection` (a `derives-from` edge in
> `graph.json` — the consumer materialises a view), `direct-read`
> (legacy, flag for removal — direct reads of another component's storage
> are an architecture smell).

**Cross-references:**

- Components with `{{entity_id}}` in their `data_entities` frontmatter:
  see Component Catalog in `ARCHITECTURE.md`.
- Edges of `kind: derives-from` ending at the owning component in
  `graph.json` indicate replicated projections of this entity.
