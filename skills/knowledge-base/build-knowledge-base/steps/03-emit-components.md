---
slug: emit-components
sequence: 3
depends-on-prior: true
---

# Step 3 — Emit per-component leaves

## Goal

Walk each repo's RE Part A + Part B docs and emit one
`components/<repo>/<component-id>.md` per logical component, each carrying
the full per-component frontmatter from `config/SCHEMAS.md` § 3.2.

## Inputs

- Build context from step 2 (skeleton in place, per-repo README/CLAUDE
  written, captured SHAs).
- For each repo: RE Part A under `<kb>/source-docs/<repo>/part-a/**` and
  Part B under `<kb>/source-docs/<repo>/part-b/**`.
- `templates/blocks/knowledge-base/component.md`.
- `templates/compositions/kb-component.yaml`.

## Component identification rules

A "logical component" is the smallest unit that:

- has its own `description` ("Use when …" form),
- has a stable, distinct trigger set,
- and would be the unit of read-time selection by `navigate-knowledge-base`.

Heuristics for splitting RE Part B into components:

| Repo role | Component-id source |
|---|---|
| `api` | One per logical feature/flow — typically each H2 section in Part B's "Use cases" or "Workflows" chapter, or each top-level OpenAPI tag. Not one per endpoint. |
| `ui` | One per top-level route/page or per major feature (cart, checkout, account). |
| `mobile` | One per screen group or feature module. |
| `framework` / `shared-library` | One per major exported subsystem (not per public class). |
| `database` | One per logical schema area (orders schema, billing schema). |
| `infra` / `tooling` | One per pipeline / stack module (infra-orders-stack, ci-deploy-pipeline). |

Aim for **5–30 components per repo**. <5 means under-decomposed; >30 means
over-decomposed.

## Procedure

For each repo `r` in `[[project.repos]]`:

1. **Enumerate candidate components** by walking `r`'s Part B headings,
   OpenAPI tags, route files, exported-symbol manifests, etc. Produce a
   draft list of `(component_id, source_section)` pairs.
2. **Resolve cross-repo components.** If a flow visibly spans more than
   one repo (e.g. `order-checkout-flow` calls into `api-billing`), keep
   it as ONE component on the primary repo. Additional repos appear in
   `paths` via repo-prefixed globs (`api-billing:src/Authorization/**`).
   Add edges to that component's `depends_on` for each foreign repo
   touched.
3. **For each component**, render
   `templates/blocks/knowledge-base/component.md` with frontmatter filled
   from these sources:

   | Frontmatter field | Source |
   |---|---|
   | `component_id` | Stable kebab-case derived from the section heading. |
   | `repo` | `r.code`. |
   | `type` | One of `api-feature` / `ui-feature` / `framework` / `mobile-feature` / `database-schema` / `shared-library`, picked from `r.role` + heuristics. |
   | `description` | Sentence in `Use when …` form, distilled from the Part B heading + first paragraph. The leading literal `Use when ` is non-negotiable. |
   | `triggers` | 5–10 short keyword phrases extracted from Part B (verb-phrases preferred; substrings the user might type). |
   | `paths` | Globs for the source files identified in Part A's "Implementation map" section. Cross-repo entries use `<repo-code>:` prefix. |
   | `depends_on` | Other component_ids this calls / imports. Derive from Part B's "Calls" / "Depends on" tables; cross-reference against components in other repos. |
   | `consumed_by` | Inverse — populated lazily; the shared pass (step 4) reconciles. Leave empty here if you don't yet know. |
   | `data_entities` | Domain entities named in Part B's "Data" section. |
   | `last_verified_against_commit` | The full SHA captured in step 1 for `r`. |
   | `last_feature_id` | Empty string `""` on initial build. |
   | `source_doc` | Relative path inside the repo to the canonical Part B doc this component derives from. Required — empty NOT permitted. |
   | `verification_signal` | `openapi-diff` for `api-feature`; `exported-symbols-diff` for `framework` / `shared-library`; `route-inventory-diff` for `ui-feature` / `mobile-feature`; `schema-diff` for `database-schema`; `manual` only when no automated check applies. |

4. **Render the body.** Fill the component template's § 1–4
   (Overview / Key Responsibilities / Change-Impact Summary / Recent
   Activity) from RE Part A and Part B. Recent Activity § 4 is mostly
   placeholder on initial build (`last_feature_id` empty).

5. **Write** to `<kb>/components/<r.code>/<component_id>.md`.

6. **Reconcile depends_on/consumed_by**: deferred to step 4 once all
   components exist.

## Acceptance

- Every logical component identified in Part A+B has a leaf file.
- Every leaf has all required frontmatter fields populated and
  schema-conformant (descriptions start with `Use when `, SHAs are 40
  chars, etc.).
- Cross-repo components have `paths` entries using the repo-prefix
  convention.
- No leaf is empty below the frontmatter — § 1–4 are filled (Recent
  Activity may have empty sub-fields).

## Hand-off

`steps/04-shared-pass.md`.
