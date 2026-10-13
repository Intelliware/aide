# Example — shard-document

## Trigger phrase

> "Shard `docs/checkout/solutions-package/design.md` — it's 3 800 lines and our reviewers can't comment per-section."

## What the skill did

1. Confirmed source path exists and is markdown.
2. Proposed default destination `docs/checkout/solutions-package/design/` and the user accepted with `[y]`.
3. Ran `npx @kayvan/markdown-tree-parser explode docs/checkout/solutions-package/design.md docs/checkout/solutions-package/design/`.
4. Verified `index.md` and 14 section files were created.
5. Reported completion.
6. Presented the original-document decision tree. User picked `m` (move). Default archive path `docs/checkout/solutions-package/archive/design.md` was accepted.

## What it produced

```
docs/checkout/solutions-package/
├── archive/
│   └── design.md                 # original, moved
└── design/
    ├── index.md
    ├── 01-overview.md
    ├── 02-context.md
    ├── 03-container-diagram.md
    ├── 04-component-diagram.md
    ├── 05-data-model.md
    ├── 06-api-contracts.md
    ├── 07-error-responses.md
    ├── 08-security.md
    ├── 09-observability.md
    ├── 10-deployment.md
    ├── 11-tech-stack.md
    ├── 12-rejected-alternatives.md
    ├── 13-traceability.md
    └── 14-glossary.md
```

Snippet from the generated `index.md`:

```markdown
# design — sharded

- [Overview](01-overview.md)
- [Context](02-context.md)
- [Container Diagram](03-container-diagram.md)
- ...
- [Glossary](14-glossary.md)
```

## Hand-off

The skill emitted the next-skill suggestion:

> "Sharding done. Recommend invoking `track-change` to log the move so the design package's change tracker shows the original was archived on 2026-04-25."
