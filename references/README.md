# References

Cross-cutting framework references loaded by skills on demand. None of these duplicate skill content — they're shared anchors that multiple skills cite.

| Subdir | Purpose | Primary file(s) |
|---|---|---|
| `canonical-shapes/` | Canonical structures consumed across stages | `canonical-increment-shape.md`, `canonical-re-shape.md` |
| `ai-principles/` | Eight operational principles every AI-driven skill follows (source-verified facts, scaffold-then-extract, elicit-before-generate, composition-authoritative, progressive disclosure, name-based handoff, halt-on-ambiguity, append-only decisions) | `README.md` |
| `elicitation-patterns/` | Reusable conversational prompts referenced from skills and compositions | 20 patterns — see directory listing |
| `traceability/` | The framework-wide ID schema (FR / NFR / BR / UJ / DR / AC / DES / ADR / INC / IMP / TC / KBC / BUG / CR), numbering rules, and resolution order | `README.md` |
| `glossary-conventions/` | Project-glossary authoring rules — case, definitions, aliases, `domain_specific` flag, conflict resolution, update discipline | `README.md` |

Skills cite these via relative paths in their `SKILL.md` or `references/` files. The `templates/blocks/shared/glossary.md` and `templates/blocks/shared/traceability.md` block templates carry abbreviated cheatsheets and defer to the references above when the two disagree.
