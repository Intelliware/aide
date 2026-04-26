# Glossary Authoring Conventions

The framework-wide rules every project glossary follows. The glossary block
template (`templates/blocks/shared/glossary.md`) cites this reference; the
block carries an abbreviated cheatsheet but the rules below are
authoritative when the two disagree.

## Why these rules exist

A glossary is the grounding surface multiple downstream consumers depend on:

- AI agents read it before generating any artifact body so they don't
  hallucinate definitions that contradict the project's domain.
- Reviewers cite it when calling out vocabulary drift across documents.
- KB builders aggregate per-project glossaries into the cross-cutting KB
  glossary index.
- Strict mode (`framework.toml [core] glossary_strict = true`) elevates
  un-defined capitalised terms to validation errors.

If the glossary is undisciplined, every consumer above silently degrades.

## 1. Term-naming rules

### 1.1 Case

Terms are capitalised exactly as the domain capitalises them. The framework
does **not** normalise to title case.

| Domain capitalisation | Glossary entry | Wrong (normalised) |
|---|---|---|
| `Order` (a single business object) | `Order` | `order` |
| `OAuth` (acronym + suffix) | `OAuth` | `Oauth`, `OAUTH` |
| `kebab-case` (a coding convention) | `kebab-case` | `Kebab-Case`, `Kebab-case` |
| `iOS` | `iOS` | `IOS`, `Ios` |

If two domains use different cases for the same concept, pick the one used
by the artifact's primary audience and record the other in **Aliases**.

### 1.2 Forbidden term shapes

- **No abbreviation-only entries.** Define the spelled-out term, then list
  the abbreviation as an alias. (`Pull Request` → entry; `PR` → alias.)
- **No verbs.** Glossaries define nouns, noun phrases, and named concepts.
  "Authenticate" is not a glossary term; "Authentication" is.
- **No multi-concept entries.** Each row is exactly one concept. If you
  catch yourself writing "and" in a term, split it.

### 1.3 Identifier-shaped terms

Code identifiers (`OrderRepository`, `useEffect`, `kafka_topic_name`)
appear as glossary entries only when they carry domain meaning beyond the
mechanical surface. A class named `OrderRepository` that is a thin DAO
does not need a glossary entry; one whose name encodes a non-obvious
business invariant does.

## 2. Definition rules

### 2.1 Length

One sentence. If a definition needs a paragraph, write one sentence here
and link to a longer explainer (component doc, ADR, external spec).

### 2.2 Grounding

Every definition must be reducible to source authority. Acceptable
sources, in priority order:

1. The project's own contract / schema / spec (the artifact ships the
   authority along with the glossary).
2. A referenced standard (RFC, ISO, OpenAPI, etc.) cited by URL or ID.
3. A referenced upstream glossary (`project.glossary.references`).
4. A domain expert's written sign-off, recorded in
   `Source / Authority` as a name + date.

A definition with no traceable authority is a **hallucination risk** —
strict mode rejects it.

### 2.3 Forbidden definition shapes

- **Tautologies.** "An Order is an order in the system" — banned.
- **Synonym chains.** "Cart: a basket. Basket: a cart." — collapse to one
  definition with the other as alias.
- **"See X" definitions.** If the answer lives elsewhere, link the
  reference directly in the definition; do not say "see X."
- **Implementation references in conceptual definitions.** "An Order is a
  row in the `orders` table" defines the storage, not the concept.

## 3. Aliases and disambiguation

Aliases are not loose synonyms — they must denote the **same** concept.
Two terms that mean *almost* the same thing get separate Terms rows with
a cross-reference in the `Definition` column.

| Canonical Term | Aliases | Notes on when each is used |
|---|---|---|
| `Pull Request` | `PR`, `Merge Request` (GitLab) | Use full term in formal docs; `PR` in commit messages. |
| `Practitioner` | `Consultant`, `Resource` (legacy) | Customer-facing docs use `Practitioner`; internal HR systems still surface `Resource`. |

### 3.1 The Notes column is not optional

If you cannot articulate when each form is used, the aliases are
collapsing two distinct concepts. Split them into separate Terms rows.

## 4. The `domain_specific` flag

A term is `domain_specific` if it would not appear in a general technical
dictionary. Examples:

- `Practitioner` (specific to a consultancy domain) — `domain_specific = true`
- `OAuth` (general technical term) — `domain_specific = false`
- `Order` — depends. In an e-commerce project, `domain_specific = true`
  because the project pins a specific definition narrower than the
  dictionary's; in a generic doc, `false`.

Downstream tooling treats the flag as follows:

- `glossary_strict = false`: unknown capitalised terms in body text emit
  warnings regardless of flag.
- `glossary_strict = true`: unknown capitalised terms emit warnings only
  if absent from the glossary AND look like they should be domain
  vocabulary; flagged terms get a tighter check.

## 5. Conflict resolution

When two source glossaries disagree on the same term:

1. Identify the authoritative source for the artifact's domain. (E.g.,
   the requirements package's authoritative source for `Order` is the
   product team's domain glossary, not the API spec.)
2. Adopt the authoritative source's definition.
3. Record the conflict in `Notes / Authority` with a one-line:
   `X says Y; we use Z because <reason>.`
4. If the conflict is structural (the two sources disagree on what the
   term *is*, not just wording), open an ADR and resolve outside the
   glossary; the glossary should not be the place where contested
   semantics get adjudicated.

## 6. Update discipline

Glossaries are append-only-with-revisions, never replace-on-rewrite:

- Adding a term: append a row.
- Editing a definition: edit in place AND log the change in the
  artifact's change-log block (per `references/traceability/`).
- Removing a term: replace the definition with `(retired YYYY-MM-DD —
  reason)` and leave the row. Strict mode rejects strict removal.

This discipline lets KB diffing flag breaking glossary changes — a
silently-removed term that downstream artifacts still cite is a
known-bad failure mode.

## 7. Validation

The following automated checks run against glossary blocks:

- **Format.** Every Terms / Aliases row must be a well-formed pipe table
  row. Malformed rows are silently dropped by the glossary parser, so
  validation surfaces them as errors before publishing.
- **Authority presence.** Every term has a non-empty `Source / Authority`
  cell.
- **Alias resolution.** Every alias resolves to a canonical term that
  exists in the same Terms table.
- **Strict-mode coverage.** When `glossary_strict = true`, body text is
  scanned for capitalised concepts not covered by the glossary; each
  uncovered concept is an error.

Run via `verify-knowledge-base-coverage` (for KB instances) or the
package validator embedded in `review-requirements-package` /
`review-design-package` / `review-implementation-package`.
