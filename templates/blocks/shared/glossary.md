---
slug: glossary
title: "Glossary"
applies-to: [greenfield-requirements-package, greenfield-design-package, greenfield-implementation-package, brownfield-enhancement-spec, quick-dev-spec, kb-instance]
requires-decision-from: [domain-expert, product-owner]
optional: false
order-hint: 90
---

## Glossary

Project-specific vocabulary used in this document. The glossary exists so
that ambiguous terms (the same word meaning different things in
different stakeholder communities) have one canonical definition and so
that AI agents reading this artifact can ground themselves before
generating downstream content.

**Authoring rules and conventions:** see
`references/glossary-conventions/`. That reference defines case rules,
how to handle aliases, when to mark a term `domain_specific`, and how to
resolve conflicts when two source documents disagree. This block does
not duplicate those rules — it points at them and supplies the table
shape.

---

### Terms

| Term | Definition | Source / Authority |
|---|---|---|
{{glossary_table_rows}}

> Populate the table from `[[project.glossary.entries]]` in
> `project.toml` plus any inline terms first introduced in this
> document. Terms that come from a referenced glossary file
> (`project.glossary.references`) keep their `Source / Authority`
> pointing at that file, not at this artifact — the glossary block is
> a _view_ over the canonical glossary, not a fork of it.

---

### Aliases and Disambiguation

When the same concept has multiple names in different communities,
record the alias here so search and AI grounding both succeed.

| Canonical Term | Aliases | Notes on When Each Is Used |
|---|---|---|
{{glossary_aliases_table_rows}}

> Aliases are not synonyms in the loose sense — they must denote the
> _same_ concept. If two terms _almost_ mean the same thing but with a
> meaningful distinction, give each its own row in the main Terms table
> and cross-reference them in the `Definition` column.

---

### Authoring Conventions (cheatsheet)

The full conventions live at `references/glossary-conventions/`. The
abbreviated cheatsheet below is for authors who don't want to leave the
document. **Always defer to the reference** if it disagrees with this
cheatsheet.

- **Case:** Terms are capitalised as the domain capitalises them
  (`Order`, `OAuth`, `kebab-case`), not normalised to title case.
- **Definition length:** One sentence. If a term needs a paragraph, give
  it a sentence here and link to the explainer (component doc, ADR,
  external standard).
- **Forbidden definitions:** Do not define a term using itself, do not
  define a term using only synonyms, and do not write definitions that
  read "see X" — link X directly.
- **`domain_specific` flag:** Mark a term `domain_specific` if it would
  not appear in a general technical dictionary. This drives downstream
  tooling: `glossary_strict = true` (in `framework.toml`) elevates
  uses of unflagged-but-unknown terms to errors, but tolerates
  domain-specific terms that are simply absent.
- **Conflicts:** When two source glossaries disagree, the authoritative
  source for this artifact's domain wins, and the conflict is recorded
  in `Notes` with a one-line "X says Y; we use Z because…".

---

### Validation Hooks

The following skills consume this block. Keep the table well-formed so
they can:

- `bmad-document-project` / KB build skills — extract terms for the KB's
  cross-cutting glossary index.
- `glossary_strict` checks — match document body text against
  `Term` column; warn (or error, in strict mode) on undefined
  capitalised concepts.
- Translation tooling — uses `Source / Authority` to resolve which
  glossary version drove a translation, so re-translation after a
  glossary update touches only the affected segments.

If a row breaks the table format (missing pipe, embedded newline), the
glossary parser silently drops it and downstream tooling proceeds with
incomplete vocabulary. Validate with `verify-knowledge-base` (KB) or
the package validator (non-KB) before publishing.
