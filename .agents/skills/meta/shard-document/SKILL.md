---
name: shard-document
description: "Use when a markdown document has grown too large to navigate (architecture doc, big requirements package, monolithic design file) or when the user says \"shard this doc\", \"split this markdown\", \"break this file into sections\". Splits a single .md at H2 boundaries into a folder of smaller files and resolves what to do with the original."
---

# Shard Document

## Overview

Stage-agnostic utility that splits an oversized markdown document into one file per H2 section using `npx @kayvan/markdown-tree-parser explode`. After the split it forces a deliberate decision about the original file (delete / archive / keep) so a sharded tree and a stale monolith never coexist.

## When to use

- A requirements, design, RE, or KB document is too large to scroll comfortably
- A reviewer wants to comment per-section in PRs
- The user explicitly says "shard", "split", "explode" a markdown file
- Post-extraction cleanup: an RE Part A or Part B got too big

## When NOT to use

- The document is short or already split — sharding adds noise
- The doc has no H2 structure (the parser splits on `##`); first add headings, then shard
- You need bidirectional sync between original and shards — sharding is one-way
- You want to merge files — different job; assemble manually

## Inputs

See `references/INPUTS-OUTPUTS.md`.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

1. **Get source document** — confirm path, verify it exists and is `.md`. HALT if not.
2. **Get destination folder** — default is sibling folder named after the source file stem; confirm or override.
3. **Execute sharding** — run `npx @kayvan/markdown-tree-parser explode <src> <dst>`. HALT on failure.
4. **Verify output** — confirm files were written and `index.md` exists. HALT if not.
5. **Report completion** — show source, destination, file count, index confirmation, any warnings.
6. **Handle the original document** — present delete / move / keep decision tree (see `steps/06-handle-original.md`).

Detailed walkthrough for the steps that have non-trivial decision logic lives in `steps/`.

## Output

See `references/INPUTS-OUTPUTS.md`. In short: a destination folder containing one `.md` per H2 plus an `index.md`, and a resolved disposition for the original file.

## Next skill

`track-change` — log the shard event in the project's change tracker so the file move is auditable.

## Common mistakes

- Skipping Step 6 and leaving both the original and the shards in place — drift guaranteed
- Picking a destination folder that already contains unrelated files — the parser will write alongside them
- Running the npx command without network access — the package is fetched on first use
- Sharding a doc with H1 + body but no H2 sections — output will be empty
