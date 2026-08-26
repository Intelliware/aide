---
slug: pick-operation
sequence: 3
depends-on-prior: true
---

# Step 3 — Pick operation

Pick the merge operation. The choice is constrained by the type at
the target path (scalar, table, array-of-scalars, array-of-tables
with `code`/`id`).

## Purpose

Translate user intent ("change this", "drop that", "add one")
into one of the five merge operations the merger understands per
`config/SCHEMAS.md` § 1.3-1.4.

## Operation menu

| Operation | When valid | Effect |
|---|---|---|
| `override` | target is a scalar (or table leaf value) | Higher layer replaces lower-layer value. |
| `merge-table` | target is a table | Recursively merges keys; lower-layer keys not mentioned are preserved. |
| `append` | target is an array | For arrays-of-tables with `code`/`id`, an entry with a new key is appended; for plain arrays, see `replace-array`. |
| `replace-array` | target is an array of scalars | The whole list is replaced. Plain arrays don't append. |
| `suppress` | target is an entry inside an array-of-tables merged by `code`/`id` | Drops the matching base entry from the merged result. |
| `add-hook` | target is a skill's `[[hooks]]` array | Adds a new hook entry with the specified event, skill, priority, and optional condition. |
| `suppress-hook` | target is an existing hook entry | Removes a hook inherited from a lower layer using `_suppress: true`. |

## Sub-steps

1. Inspect the type of the value at the target path (use the merged
   config from step 02 sub-step 2A.4 / 2B). If unknown, ask the user
   to choose a type explicitly.
2. Filter the operation menu to the valid options.
3. Present them with short rationales and ask which one applies.
4. Validate the user's choice against the constraints:
   - `suppress` requires the array entry to be `code`/`id`-keyed
     (per `config/SCHEMAS.md` § 1.4 rule 1).
   - `append` on a `code`/`id`-keyed array-of-tables requires the
     new entry to include the key (per § 1.3 row "Array of tables
     with code/id").
   - `replace-array` on an array-of-tables loses by-key merge —
     warn the user and confirm.
5. Carry the operation forward as a step input for step 04.

### Hook-specific flow (when operation = `add-hook` or `suppress-hook`)

6. For `add-hook`:
   - Elicit hook fields: `code` (unique identifier), `event` (`before`/`after`),
     `skill` (must exist in catalog), `priority` (1-999, default 500).
   - Optionally elicit: `optional` (bool), `prompt` (required if optional),
     `condition` (expression).
   - Validate the target skill exists (per `config/SCHEMAS.md` rule 14).
   - Validate no circular dependency would be created (rule 19).
7. For `suppress-hook`:
   - Elicit the `code` of the hook to suppress.
   - Verify the hook exists in a lower layer.

## Hard gates

- The operation MUST be valid against the target's type.
- For `suppress`: the key field MUST be set; if the user provided a
  value, ignore it (the suppress entry should contain only the key
  and `_suppress = true`).

## Exit criteria

- [ ] Operation chosen and validated against the target type.
- [ ] User has acknowledged any warnings (e.g. for `replace-array`).

## Next

Step 04 — author-override.
