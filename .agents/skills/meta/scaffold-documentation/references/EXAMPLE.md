# Example — scaffold-documentation

## Trigger phrase

> "Scaffold a design package at `docs/checkout/solutions-package/`. We just finished requirements; the inventory is the 14 functional requirements and four major components."

## What the skill did

1. Read the requirements completeness tracker to confirm the FR list and
   pulled the four components from the user's chat message.
2. Picked the `templates/compositions/greenfield-design-package.yaml`
   composition based on `package_type = design`.
3. Generated a proposal tree:

```
docs/checkout/solutions-package/
├── 01-overview.md
├── 02-context-c4-l1.md
├── 03-container-c4-l2.md
├── 04-component-c4-l3.md
├── 05-data-model.md
├── 06-error-model.md
├── 07-api-contracts.md
├── 08-security.md
├── 09-observability.md
├── 10-deployment.md
├── 11-tech-stack.md
├── 12-rejected-alternatives.md
├── 13-traceability.md
├── 14-glossary.md
├── CHANGE-TRACKER.md
└── extraction-status.md
```

4. For each file, listed the section headers from the template and showed
   how the four components map into the §03 / §04 / §05 sections, and how
   each FR ties to a §07 contract.
5. Presented the proposal and asked for explicit approval. User said "go".
6. Created all directories and files with section headers + `<!-- TODO:
   author from FR4.2.3 + components/checkout-flow -->` placeholders.
7. Initialized `CHANGE-TRACKER.md` with the Parts Affected vocabulary used
   by the design composition.
8. Suggested the next skill.

## What it produced

Snippet from `01-overview.md` after scaffolding (no content yet, just structure):

```markdown
---
title: Checkout Design Package — Overview
package_version: 0.1.0-doc.0
source_version: requirements-package@1.4.2-doc.7
last_updated: 2026-04-25
---

# Checkout Design Package — Overview

## Solution Summary
<!-- TODO: 2 paragraphs — what + style decisions; cite FR1.x, FR2.x -->

## Boundaries
<!-- TODO: in-scope / out-of-scope; cite "Out of Scope" sections in requirements -->

## Reading Order
<!-- TODO: list §02 → §13 with one-line synopsis each -->
```

## Hand-off

> "Scaffold ready. 14 design files plus tracker and status. Next: invoke
> `create-design-package` to fill in §01–§14 in order. The first sections
> to fill are §01 (overview) and §13 (traceability) — together they lock
> down what the rest of the package must support."
