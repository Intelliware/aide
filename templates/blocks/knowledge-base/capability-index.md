---
slug: capability-index
title: "Capability Index"
applies-to: [kb-instance]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 15
---

## Capability Index

Inverted lookup: **capability → list of `component_id`s that implement
it**. This is the first table the orchestrator hits when a story
arrives; it narrows from "what does the user want" to "which components
are in scope" before any other KB lookup.

This table is intended to live as a section _inside_ `ARCHITECTURE.md`
(typically § 4). When `build-knowledge-base-index` regenerates the root
index, it splices the rendered version of this block into that section.
Maintaining the table here lets compositions reuse the same skeleton
across KB instances without duplicating the surrounding `ARCHITECTURE.md`
prose.

---

| Capability | Component IDs | Owning Repos | Notes |
|---|---|---|---|
{{capability_index_table_rows}}

---

### Authoring rules

1. **Capability strings are short verb-phrases.** Prefer `process refunds`,
   `render checkout page`, `emit invoice PDF`. Avoid nouns-only
   (`invoices`) and avoid full sentences (`The system should be able to
   process refunds when…`). Verb-phrases match how users describe tasks.
2. **One row per capability, not per component.** A capability that two
   components implement gets one row with both `component_id`s in the
   `Component IDs` column (comma-separated). A component that implements
   three capabilities gets three rows — one per capability.
3. **The `Owning Repos` column is derived.** It is the set of `repo`
   values from the listed `component_id`s. The index-builder skill keeps
   this column in sync; humans edit `Component IDs` and let the build
   step refresh `Owning Repos`.
4. **Capabilities are maintained manually.** They are _not_ auto-derived
   from component frontmatter `triggers`. The two serve different
   purposes: triggers are the substring-match keywords for routing,
   capabilities are the curated vocabulary humans use to describe what
   the system can do. Keep both, in sync conceptually but not
   mechanically.
5. **The `Notes` column is for caveats.** Use it to flag partial
   implementations (`Refund processing for digital goods only — physical
   goods refunds via legacy job`), planned deprecations, or
   capability-spanning ADRs. If a row has nothing to caveat, leave the
   cell blank rather than padding with filler.

### What does NOT belong here

- **Cross-cutting concerns** (auth, logging, error handling). Those are
  indexed in `ARCHITECTURE.md` § 6 and live in repo-local Part B docs.
- **Data entities**. Those live under `knowledge-base/shared/entities/`
  and are catalogued via the per-component `data_entities` frontmatter.
- **Aspirational capabilities the system does not yet implement.** If no
  component implements a capability, _do not list it_. The orchestrator
  treats this index as ground truth — adding a phantom capability is the
  worst possible failure mode (see `ARCHITECTURE.md` § 7, point 6).

### Example rows (illustrative — replace with real entries)

| Capability | Component IDs | Owning Repos | Notes |
|---|---|---|---|
| process refunds | `billing-refund-processor` | `api-billing` | Issuer-side refunds only; consumer-side disputes flow via support tooling. |
| place order | `order-checkout-flow` | `api-orders` | Synchronous flow; async retries for payment auth. |
| render checkout page | `web-portal-checkout-page` | `web-portal` | Used by web only — mobile uses `mobile-app-checkout-screen`. |
| emit invoice PDF | `billing-invoice-renderer`, `pdf-rendering-service` | `api-billing`, `shared-pdf` | PDF rendering delegated to `pdf-rendering-service`. |

> The example rows above are guidance for new authors. Delete them once
> the real index has at least three rows of project-specific content —
> they shouldn't ship in a finished KB.
