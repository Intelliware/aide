---
slug: update-components
sequence: 2
depends-on-prior: true
---

# Step 2 — Update affected components

## Goal

Re-derive frontmatter and (in `--scope=full`) body sections for every
component in the affected set, plus create any new components identified
in step 1.

## Inputs

- Update context from step 1 (affected list + new-component candidates +
  merge SHAs + feature ID + actor).
- Source repo state at the merge SHAs (read-only).
- Existing component files (will be edited in place).
- `templates/blocks/knowledge-base/component.md` (for new components and
  body re-derivation).

## Procedure

### 2a — Update existing affected components

For each `component_id` in `affected_components`:

1. **Read current frontmatter and body.**

2. **Re-derive frontmatter** from the updated source state:

   | Field | Re-derive in `--scope=full`? | Re-derive in `--scope=catalog-only`? |
   |---|---|---|
   | `component_id` | No (immutable) | No |
   | `repo` | No (immutable) | No |
   | `type` | No (changes only via explicit human override) | No |
   | `description` | Yes | If changed, yes; else leave |
   | `triggers` | Yes — re-extract from updated Part B | No |
   | `paths` | Yes — extend if new files in scope; remove if files deleted | No |
   | `depends_on` | Yes — re-walk imports / call sites | No |
   | `consumed_by` | Computed (step 5 reconciles) | Computed (still in step 5; catalog-only mode skips that step, so leave alone) |
   | `data_entities` | Yes — re-extract from Part B + DTO files | No |
   | `last_verified_against_commit` | **Always set to the merge SHA for this component's repo** | **Always set** |
   | `last_feature_id` | **Always set to feature_id** | **Always set** |
   | `source_doc` | Yes — only changes if Part B was renamed | No |
   | `verification_signal` | No (changes only via explicit human override) | No |

3. **Compare frontmatter old vs new.**
   - If `triggers` changed, set the in-memory flag
     `capability_index_needs_refresh = true` (consumed in step 6).
   - If `depends_on` changed, record the diff in `edge_changes` (consumed
     in step 5).
   - If `paths` shrank to zero (the component lost all its source
     coverage), flag it for human review — possible deletion candidate.
     Do NOT auto-delete.

4. **Re-derive body sections** (`--scope=full` only):
   - § 1 (Overview) — refresh if `description` or `depends_on` /
     `consumed_by` changed.
   - § 2 (Key Responsibilities) — refresh if `triggers` changed.
   - § 3 (Change-Impact Summary) — keep stable unless `depends_on` /
     `consumed_by` changed.
   - § 4 (Recent Activity) — **always rewrite**. Set:
     - `Last touched by feature: [ACME-1247](feature_link)`
     - "What that feature changed in this component: <distilled from
       increment plan + diff for this component>"
     - `Last verified against commit: <merge SHA> (today's date)`
     - `Open follow-ups: <distilled from increment's outcome /
       known-gaps fields>`

5. **Write the file back.** Preserve the exact frontmatter delimiter style
   (single `---` lines), so subsequent reads parse correctly.

### 2b — Create new components

For each entry in `new_component_candidates` from step 1:

1. **Decide whether to create.** Heuristics:
   - The new files form a coherent module (3+ files in a directory, or
     a single feature controller plus its DTOs / tests).
   - The increment plan explicitly names the new feature.
   - In doubt, ASK the caller — do not silently invent a new component.

2. **Render `templates/blocks/knowledge-base/component.md`** with
   placeholders filled:
   - `component_id`: kebab-case derived from feature directory or
     increment goal (e.g. `fraud-screening`).
   - `repo`: from path prefix.
   - `type`: inferred from repo role (`api` → `api-feature`, `ui` →
     `ui-feature`, etc.).
   - `description`: distilled from the increment goal.
   - `triggers`: distilled from increment goal verbs / nouns.
   - `paths`: the new file paths (and their containing globs).
   - `depends_on`: derived from new code's imports / call sites.
   - `consumed_by`: empty initially (existing components updated in 2a
     will list this new component in their depends_on, which step 5
     reconciles into consumed_by).
   - `data_entities`: extracted from new DTO files / Part B updates.
   - `last_verified_against_commit`: merge SHA for the repo.
   - `last_feature_id`: feature_id.
   - `source_doc`: the most relevant Part B doc — typically updated by
     the same feature.
   - `verification_signal`: per repo type defaults.

3. **Render body §§ 1–4** from the increment context.

4. **Write** to `<knowledge_base_path>/components/<repo>/<id>.md`.

5. **Record the new component_id** in `affected_components` so step 5's
   graph update treats it as a new node.

### 2c — Update existing components' depends_on for new components

If step 2b created new components AND existing affected components imported
them, update the depends_on on those existing components (a second pass on
the files written in 2a).

## Acceptance

- Every affected component has updated frontmatter, with at minimum
  `last_verified_against_commit` and `last_feature_id` bumped.
- New components have full conformant frontmatter and bodies.
- Edge changes (`edge_changes`) and the `capability_index_needs_refresh`
  flag are stashed for steps 5 and 6.
- No component was edited that was not in the affected set.

## Hand-off

`steps/03-append-change-tracker.md`.
