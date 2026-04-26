# Overview — scaffold-documentation

## Purpose

Scaffolding is the framework's "structure before content" guard. Before any
content is extracted from a source or authored from scratch, the scaffold
skill negotiates a file structure with the user — directories, file names,
section headers, placeholder markers, and the change tracker — and gets
explicit approval. Content fills in afterwards, into known sections, with
known mappings back to inventory.

Why this matters: AI assistants left to "extract the docs" tend to invent
plausible-but-wrong file structures, conjure sections that don't map to any
real artifact, and produce content that has no audit trail back to source.
Scaffolding inverts the order — structure first, approved structure mapped
to inventory, then content. Partially-filled scaffolding shows exactly what
remains, and verification can compare scaffold-vs-content to spot
hallucinations.

This is the meta version. RE skills also embed scaffolding as their first
step (`steps/scaffold.md` per RE skill); this meta version exists for the
non-RE callers — requirements authors scaffolding a requirements package,
design authors scaffolding a design package, KB authors scaffolding a KB
component, quick-dev users scaffolding a single combined spec file. The
content is the same; the slot is what changes.

## When to use

- After inventory or discovery is complete
- Before any extraction or authoring begins
- Restructuring an existing package — propose then migrate
- A new package type is being introduced and a template doesn't yet exist

## When NOT to use

- Package already exists with a stable structure — don't re-scaffold
- Content is drafted; you want to assemble — different job
- RE workflows already include the inline scaffold step
- No inventory yet — scaffolding without inventory invents categories

## Position in workflow

Cross-cutting utility. Used at the start of any authoring or extraction
sequence. Followed by the matching authoring/extraction skill, which fills
the scaffold with verified content.
