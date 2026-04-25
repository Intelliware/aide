# Blocks

Reusable section blocks composed by manifests in `templates/compositions/`.

Each block file has YAML frontmatter plus the section template content below it:

```yaml
---
slug: functional-requirements
title: "Functional Requirements"
applies-to: [requirements, brownfield-enhancement]
requires-decision-from: [stakeholder, product-owner]
optional: false
---

## Functional Requirements

…template content with `{{placeholder}}` markers…
```

Blocks are content-stable; compositions choose which blocks to include and in what order. Subdirectory naming mirrors `skills/<stage>/` for traceability.
