# Elicitation pattern: Component discovery

## Purpose

Captures the metadata for a single component leaf in the knowledge base:
which repo it lives in, its type, the path globs that delineate its
source code, what it depends on, what consumes it, the data entities it
owns or touches, and the source RE doc that backs it. Invoked from
`build-knowledge-base` (per-component pass) and `update-knowledge-base`
(when adding or revising a component) so each component leaf carries the
mandatory frontmatter that `graph.json` and the capability index regenerate
from.

## Inputs needed from user

- Component ID (kebab-case, unique within the KB)
- Owning repo (`code` from `[[project.repos]]`)
- Component type
- Path globs (which files / directories constitute this component)
- `depends_on` (other components this one calls / imports)
- `consumed_by` (other components that call / import this one)
- `data_entities` (entities owned, read, or written)
- `source_doc` (path to the RE Part A/B doc this component was extracted from)
- Capabilities the component provides (terms used by the inverted index)
- Latest verified commit SHA (for drift-detection later)

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Component ID.** (kebab-case, unique within the KB)
   - **Format:** free-text with regex validation
   - **Validation:** matches `^[a-z][a-z0-9-]*$`; not already used in `<knowledge_base_path>/components/<repo-slug>/`
   - **Maps to:** component frontmatter `id`

2. **Which repo owns this component?**
   - **Format:** multiple-choice (auto-fill from `[[project.repos]].code`)
   - **Validation:** must match an existing entry; offer `add-repo` shortcut if missing
   - **Maps to:** component frontmatter `repo`

3. **Component type.**
   - **Format:** multiple-choice
   - **Options:** `service` / `endpoint` / `module` / `package` / `controller` / `worker` / `scheduled-job` / `library-public-api` / `cli-command` / `data-access` / `domain-entity` / `ui-screen` / `ui-component` / `mobile-screen` / `migration`
   - **Maps to:** component frontmatter `type`

4. **Path globs that delineate the component.**
   - **Format:** structured-list of glob patterns (relative to the repo root)
   - **Validation:** glob syntax checked; warn if glob matches zero files in the repo
   - **Maps to:** component frontmatter `paths[]`

5. **`depends_on`** — list other component IDs this one depends on. (loop until `done`)
   - **Format:** structured-list of component IDs
   - **Validation:** each ID resolves to an existing component file (warn if not — may be a forward reference to a sibling that's about to be authored)
   - **Maps to:** component frontmatter `depends_on[]`

6. **`consumed_by`** — list other component IDs that consume this one. (loop until `done`)
   - **Format:** structured-list of component IDs
   - **Validation:** each ID resolves to an existing component file (warn if not)
   - **Maps to:** component frontmatter `consumed_by[]`

7. **`data_entities`** — list the entities this component owns / reads / writes. (loop)
   - **Format:** structured-list of `{entity, relationship}` where `relationship` ∈ `{owns, reads, writes, reads-writes}`
   - **Validation:** entity names should match `requirements.data.entities[]` if available, or `shared/entities/` files if requirements don't exist
   - **Maps to:** component frontmatter `data_entities[]`

8. **Source RE doc.** (path to the Part A/B doc this component was extracted from — required for traceability)
   - **Format:** path-with-validation
   - **Validation:** path resolves under `<knowledge_base_path>/source-docs/<repo-slug>/`
   - **Maps to:** component frontmatter `source_doc`

9. **Capabilities provided.** (3-7 short capability terms — these populate the inverted index in ARCHITECTURE.md's capability section)
   - **Format:** structured-list of free-text terms
   - **Validation:** 3-7 entries; each ≤ 40 chars; lowercase preferred
   - **Maps to:** component frontmatter `capabilities[]`

10. **`last_verified_against_commit`** — the full 40-char SHA of the source repo when this component was last verified.
    - **Format:** free-text (auto-fill from `git rev-parse HEAD` in the source repo when possible)
    - **Validation:** must be a 40-char hex string; short SHAs are rejected
    - **Maps to:** component frontmatter `last_verified_against_commit`

11. **One-sentence description ("Use when …").** (powers skill routing during navigation)
    - **Format:** free-text starting with `Use when ...`
    - **Validation:** must start with the literal phrase `Use when` (case-insensitive); ≤ 240 chars
    - **Maps to:** component frontmatter `description`

**Wrap-up:** Confirm the answers in summary form before proceeding. Restate the ID, repo, type, paths, depends_on / consumed_by edges, data entities, source doc, capabilities, commit SHA, and the one-sentence description. Confirm before writing the component leaf and regenerating `graph.json`.

## Output format

Answers populate the YAML frontmatter of `<knowledge_base_path>/components/<repo-slug>/<component-id>.md`. The body of the file is then composed from the `knowledge-base/component` block.

```yaml
---
id: order-resolution-service
repo: acme-orders-api
type: service
description: "Use when looking at how stuck orders are unstuck or escalated."
paths:
  - src/order-resolution/**
  - src/shared/order-state-machine.ts
depends_on:
  - acme-orders-api/order-store
  - acme-orders-api/notification-publisher
consumed_by:
  - acme-orders-ui/order-resolution-screen
data_entities:
  - { entity: Order, relationship: reads-writes }
  - { entity: ResolutionAction, relationship: owns }
capabilities:
  - order resolution
  - state machine
  - escalation
source_doc: source-docs/acme-orders-api/part-b-order-resolution.md
last_verified_against_commit: 0a1b2c3d4e5f6789abcdef0123456789abcdef01
---
```

## Validation rules

- `id` matches `^[a-z][a-z0-9-]*$` and is unique under `<knowledge_base_path>/components/<repo-slug>/`.
- `repo` references an existing entry in `[[project.repos]]`.
- `type` ∈ the documented enum.
- `paths[]` use valid glob syntax; each glob must match at least one file in the repo (warn — empty glob is allowed only as a forward reference).
- `last_verified_against_commit` is a full 40-char hex SHA — short SHAs rejected.
- `description` starts with "Use when" (skill routing depends on this exact phrasing; `verify-knowledge-base-coverage` flags violations).
- `source_doc` resolves under `<knowledge_base_path>/source-docs/<repo-slug>/`.
- 3-7 capabilities required (drives the inverted index).

## Reusable across

- `build-knowledge-base` (step 03-emit-components — runs the pattern once per component discovered)
- `update-knowledge-base` (when adding a new component or revising an existing one)
- `kb-component` composition (declared as required elicitation)
