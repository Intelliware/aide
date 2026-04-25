# Elicitation pattern: Data and permissions discovery

## Purpose

Captures the data the system manages — entities, attributes, relationships,
sources, retention rules — and the permission model that governs access to
each entity. Invoked from `create-requirements-package` step 03-analysis
and step 04-writing so the `requirements/data-requirements` block has a
complete entity catalog and a clear answer to "who can read/write/delete
what." This is the canonical input for the design-stage data-architecture
and security-design blocks.

## Inputs needed from user

- Core domain entities (name, description, key attributes)
- Per-entity attributes with type and required/optional flag
- Entity relationships (1:1, 1:N, N:N) and ownership/lifecycle
- Sources of truth (internal master, external feed, user-input, derived)
- PII / sensitive-data classification per attribute
- Retention period per entity
- Permission model: role-by-entity-by-operation matrix (CRUD)
- External data shares / publish-out flows

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Loop: name each core domain entity.** (one entity per loop iteration; add until `done`)
   - **Format:** structured `{name, one_line_description}`
   - **Validation:** name is unique within the project; PascalCase or kebab-case
   - **Maps to:** `requirements.data.entities[]`

2. **For each entity, loop the attributes.** Ask: name, type, required?, sensitivity class.
   - **Format:** structured `{attr_name, type, required, sensitivity}`
   - **Validation:**
     - `type` ∈ `{string, integer, decimal, boolean, date, datetime, uuid, enum, json, binary, reference}`
     - `sensitivity` ∈ `{public, internal, confidential, restricted-pii, restricted-phi, restricted-financial}`
   - **Maps to:** `requirements.data.entities[].attributes[]`

3. **For each entity, list its relationships to other entities.** (loop until `done`)
   - **Format:** structured `{from, to, cardinality, ownership}`
   - **Validation:** `cardinality` ∈ `{1:1, 1:N, N:1, N:N}`; `ownership` ∈ `{owns, references, weak-ref}`
   - **Maps to:** `requirements.data.relationships[]`

4. **For each entity, what is the source of truth?**
   - **Format:** multiple-choice
   - **Options:** `internal-master` (this system owns it) / `external-feed` (synced from elsewhere) / `user-input` (created by end-user action) / `derived` (computed from other entities) / `mixed`
   - **Maps to:** `requirements.data.entities[].source_of_truth`

5. **For each entity, what is the retention period?**
   - **Format:** free-text (duration with unit, or `indefinite`, or `regulatory-defined`)
   - **Validation:** must parse as a duration OR be one of the named tokens
   - **Maps to:** `requirements.data.entities[].retention`

6. **List the application roles that need access.** (e.g. `operator`, `supervisor`, `admin`, `auditor`, `service-account`)
   - **Format:** structured-list
   - **Validation:** at least one role required; names are unique
   - **Maps to:** `requirements.data.roles[]`

7. **Build the permission matrix.** For each (role, entity) pair, ask which operations are allowed: create / read / update / delete / list / export.
   - **Format:** structured matrix `{role, entity, operations[]}`
   - **Validation:** every entity must appear at least once; every role must have at least one allowed entity
   - **Maps to:** `requirements.data.permission_matrix[]`

8. **Are any entities published or shared with external systems?**
   - **Format:** yes/no, then loop `{entity, downstream_system, mechanism}` if yes
   - **Validation:** `mechanism` ∈ `{api-pull, webhook-push, batch-export, event-bus, file-drop, other}`
   - **Maps to:** `requirements.data.external_shares[]`

**Wrap-up:** Confirm the answers in summary form before proceeding. Read back the entity catalog with attribute counts, the relationship list, the per-entity source-of-truth and retention, and the role-by-entity permission matrix. Flag any entity with no allowed operations for any role (likely a gap).

## Output format

Answers populate `requirements/data-requirements`.

```toml
[[requirements.data.entities]]
name = "Order"
description = "A customer-placed request for goods."
source_of_truth = "internal-master"
retention = "7 years (regulatory-defined)"

[[requirements.data.entities.attributes]]
name = "customer_id"
type = "uuid"
required = true
sensitivity = "internal"

[[requirements.data.entities.attributes]]
name = "billing_address"
type = "string"
required = true
sensitivity = "restricted-pii"

[[requirements.data.relationships]]
from = "Order"
to = "OrderLine"
cardinality = "1:N"
ownership = "owns"

[[requirements.data.permission_matrix]]
role = "operator"
entity = "Order"
operations = ["create", "read", "update", "list"]
```

## Validation rules

- Each entity must declare at least one attribute.
- Every attribute must have a type drawn from the enum and a sensitivity class.
- The permission matrix must cover every entity for every role; missing cells default to "no access" but the user must explicitly confirm the empty cells.
- Sensitivity classes `restricted-*` raise downstream gates: if any `restricted-pii` / `restricted-phi` / `restricted-financial` attribute exists, the design stage must include a security-design block.
- External-share entries that name a `webhook-push` or `event-bus` mechanism set `project.elicitation.has_external_integrations = true` if not already set.

## Reusable across

- `create-requirements-package` (step 03-analysis seeds; step 04-writing finalizes)
- `greenfield-requirements-package` composition (declared as required elicitation)
