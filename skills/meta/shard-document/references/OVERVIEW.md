# Overview — shard-document

## Purpose

`shard-document` is the framework's universal large-markdown-splitter. It takes one
`.md` file and produces a folder of smaller files, one per H2 section, plus an
`index.md` that lists them in source order. The mechanism is the
`npx @kayvan/markdown-tree-parser explode` command — this skill's value is the
decision logic around it: choosing the destination, handling failures, and
forcing a clean answer to "what happens to the original".

The skill is stage-agnostic and gets called from many places: requirements
authors shard a 4 000-line requirements package after assembly; RE skills shard
an oversized Part A doc; KB authors shard `ARCHITECTURE.md` once it exceeds
the practical reading limit. Because the call shape is identical regardless of
caller, we centralize it here rather than copy the npx invocation into every
stage skill.

## When to use

- Any markdown document that has grown past comfortable scroll-and-navigate length
- A doc that needs PR-style review per-section (sharding makes diffs scoped)
- Cleanup after a long-running extraction or generation run
- Preparing a doc tree for downstream tools that prefer one-file-per-topic

## When NOT to use

- Document is short, well-organized, or has no H2 sections — sharding adds noise
- You need to merge or recombine — different operation, do it manually
- You want bidirectional sync between original and shards — sharding is one-way
- The destination folder already contains unrelated content the parser would mix into

## Position in workflow

Cross-cutting utility. Typically invoked at the tail end of an authoring or
extraction step once a draft document has stabilized. After sharding, the
caller usually invokes `track-change` to log the disposition, then resumes
their primary workflow against the new sharded folder.
