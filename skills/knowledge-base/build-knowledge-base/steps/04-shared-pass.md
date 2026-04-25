---
slug: shared-pass
sequence: 4
depends-on-prior: true
---

# Step 4 — Shared pass (entities, cross-cutting, integration patterns)

## Goal

Identify cross-component shared content and promote it to `shared/`. Reconcile
`depends_on` ↔ `consumed_by` symmetry across all components written in step 3.

## Inputs

- Build context with all components written under `components/<repo>/<id>.md`.
- `templates/blocks/knowledge-base/shared-entity.md`.

## Procedure

### 4a — Reconcile depends_on / consumed_by symmetry

1. Walk every `components/**/*.md` and parse frontmatter.
2. Build the inverse map: for each `(A, depends_on=[B,C])`, append `A` to
   `B.consumed_by` and `C.consumed_by`.
3. Walk again; for each existing `consumed_by` entry that is NOT also
   reflected as the inverse `depends_on`, write the missing
   `depends_on` edge into the source component's frontmatter.
4. After the two passes, the two arrays are guaranteed-symmetric across
   the KB.

### 4b — Promote shared entities

1. Build a frequency map of every value appearing in any component's
   `data_entities`.
2. For each entity referenced by **≥2 components from different repos**,
   OR any entity referenced by ≥3 components in any repo combination,
   promote it:
   1. Identify the **owning component** — the component whose repo's
      role matches the entity's source-of-truth (typically the API repo
      that owns the storage). When ambiguous, pick the component with
      the most write-style triggers (`create`, `update`, `archive`).
   2. Render `templates/blocks/knowledge-base/shared-entity.md` with the
      entity's name, owning component, fields (extracted from the
      owning repo's Part B schema section), lifecycle, and `Used By`
      table (derived from the frequency map).
   3. Write to `<kb>/shared/entities/<entity-id>.md` (kebab-case
      `entity-id`).
3. Entities referenced by only one component **stay in that component's
   body** — do not over-promote.

### 4c — Cross-cutting concerns

For each cross-cutting concern (auth/authz, observability/logging,
error-handling, security, performance, versioning):

1. Locate the owning repo — typically the one whose Part B has the
   richest "standards" section.
2. Write a pointer page at `<kb>/shared/cross-cutting/<concern>.md` whose
   body is **a one-paragraph summary plus a relative link into the owning
   repo's Part B doc**. Never reproduce the standard's content.
3. Stash the (concern → owning repo + pointer) mapping for step 6 to
   render into ARCHITECTURE.md § 6.

### 4d — Integration patterns

If RE Part B documents named integration sequences (e.g. "place-order
saga", "refund-flow"), emit one
`<kb>/shared/integration-patterns/<pattern>.md` per pattern with the
sequence diagram and the participating component IDs. Skip if RE doesn't
document any.

### 4e — ADRs

Initial build does **not** synthesise ADRs. The legacy aggregator did so;
we don't, because ADRs are decisions and synthesising decisions
retroactively manufactures false consensus. Leave `<kb>/shared/adrs/`
empty on day one; `update-knowledge-base` step 4 emits ADRs when the
implementation flow makes a decision that crosses an ADR threshold.

## Acceptance

- `depends_on` and `consumed_by` are fully symmetric across all components.
- Entities meeting the promotion threshold have a file in
  `shared/entities/`.
- Each cross-cutting concern listed in `ARCHITECTURE.md` § 6 has a
  pointer page in `shared/cross-cutting/`.
- `shared/adrs/` is empty (intentional).

## Hand-off

`steps/05-emit-graph.md`.
