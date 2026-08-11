---
slug: author-override
sequence: 4
depends-on-prior: true
---

# Step 4 — Author override

Gather the new value(s), render the TOML, preview the result, and
write the file.

## Purpose

This is the only step that mutates the filesystem. Up to here we have
been collecting state; now we render and write.

## Sub-steps

1. **Collect the new value** based on operation type:
   - `override` — single typed value (string, number, boolean, path)
   - `merge-table` — a partial table; ask for one key/value pair at a
     time and confirm each
   - `append` — full entry; for `code`/`id`-keyed arrays, the key
     comes first and is unique against the existing list
   - `replace-array` — the entire new list, comma-separated or one
     per line
   - `suppress` — only the key field; no other values
   - `add-hook` — structured hook entry (see below)
   - `suppress-hook` — only the `code` field plus `_suppress = true`

   **For `add-hook`**, collect:
   ```toml
   [[hooks]]
   code = "<user-provided>"           # Required, unique
   event = "<before|after>"           # Required
   skill = "<skill-name>"             # Required, validated against catalog
   priority = <1-999>                 # Optional, default 500
   optional = <true|false>            # Optional, default false
   prompt = "<prompt text>"           # Required when optional = true
   condition = "<expression>"         # Optional
   ```

   **For `suppress-hook`**, render:
   ```toml
   [[hooks]]
   code = "<code-to-suppress>"
   _suppress = true
   ```

2. **Optional `note`** — short rationale (one line). The skill
   inserts this as an inline comment alongside the override. Example:
   `# Shorter PRDs for marketplace tier — set 2026-04-25 by Mike.`

3. **Render the override TOML.** Read the existing file (if any) so
   we preserve other content. Insert or replace the relevant block.
   Output rules:
   - On a brand-new file, prepend the managed-header block (see
     SKILL.md § Output for the canonical text).
   - On an existing file, leave the existing managed-header alone
     (idempotent).
   - Use TOML idioms: triple-quoted strings for multi-line values,
     ordinary strings for single-line, arrays-of-tables with one
     blank line between entries.
   - Token paths (`{project-root}` etc.) are preserved verbatim.

4. **Preview** the rendered file (full content) and the *predicted*
   merged result at the target path. The merge prediction shows:
   - the value at each layer (or `—` if unset)
   - the EFFECTIVE value after merge
   - for `suppress`, the array before and after suppression
   See the read-back format in `references/INPUTS-OUTPUTS.md` §
   "Merge-preview output."

5. **Confirm.** User says go / change / cancel. On `change`, jump
   back to the appropriate sub-step.

6. **Write atomically.** Write to `<target>.tmp`, then rename to the
   final path. Set permissions sanely (mode 0644).

7. **Patch `.gitignore`** when the target file is `*.user.toml` and
   it was just created (idempotent — append only if not already
   present).

## Hard gates

- The preview MUST be shown before any write.
- The user MUST confirm before the write.
- For `suppress`, the rendered entry MUST contain only the key and
  `_suppress = true`. Any extra fields are stripped with a notice
  (per `config/SCHEMAS.md` § 1.4 rule 2).
- For `append` to a `code`/`id`-keyed array, the key MUST be unique
  against the existing array. A duplicate key triggers a re-prompt
  (because that would mean "edit", not "append" — fall back to
  `merge-table` semantics on the entry).

## Exit criteria

- [ ] File written.
- [ ] `.gitignore` patched if applicable.
- [ ] User confirmed the preview.

## Next

Step 05 — verify-merge.
