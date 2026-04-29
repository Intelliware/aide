# Elicitation Pattern — Coding Rules

Used by `generate-ai-rules/steps/02-elicit-unobvious-rules.md`.

## Context

Capture the imperatives an AI agent must follow when writing code in
this project. Ground the conversation in concrete pitfalls — abstract
"best practices" produce noise. Drive every captured rule into one of
these forms:

- `Always X.`
- `Never Y.`
- `When <condition>, do X.`

Soft suggestions ("we tend to …") are flagged and the user is asked
whether the rule is firm enough to enforce. If not firm, drop it.

## Conversation script

### Section 2 — Language rules

1. "Are there language features your team has banned? (e.g. `any`,
   `var`, decorators in TypeScript; reflection in Java; `unsafe` in
   Rust)"
2. "Are there project idioms that supersede the language style guide?
   (e.g. union types over enums, exhaustive switches, no inline
   default-export)"

### Section 3 — Framework rules

For each framework:
1. "What framework features are required on every public handler /
   route / action?"
2. "What features are forbidden? (e.g. circular module imports, raw
   SQL in controllers, direct database access from action methods)"
3. "Are there decorators / annotations that gate the build? (e.g.
   `@ApiOperation` for OpenAPI generation)"

### Section 4 — Testing rules

Show the `verification_signal` distribution from the component
catalog. Then:

1. "Where do test files live? (co-located vs `tests/` tree)"
2. "What is the mocking discipline? (real fixtures vs auto-mocking)"
3. "Coverage thresholds, if any?"
4. "For each component verification_signal, what test type maps to
   it?"
5. "Are there test categories that are required for every change?
   (regression test for a bug fix, contract test for an API change)"

### Section 5 — Workflow rules

1. "Branch naming?"
2. "Commit-message format?"
3. "PR title and body conventions?"
4. "Required CI checks before merge?"
5. "Squash / rebase / merge policy?"

### Section 6 — Error-handling

1. "Custom error types — where defined, when thrown?"
2. "Error → HTTP status translation — where does it happen?"
3. "Logging discipline — what is logged, what is never logged
   (PII, secrets, full request bodies)?"
4. "Sentry / observability — what gets reported, what gets suppressed?"

### Section 7 — Imports / modules

1. "Barrel files allowed?"
2. "Path aliases?"
3. "Import grouping / ordering?"
4. "Circular-import policy?"

### Section 8 — Architectural must-nots

Pull every entry from `30-constraints-and-compliance.md` § 5 and
ask: "Anything additional, beyond what solution-context already
captured?"

## Imperative-form check

After each rule is captured, restate it back to the user in
imperative form. If they hesitate, dig into the condition that makes
the rule apply — that is often the missing context.

## Anti-patterns

- **Rules without pitfalls.** "Use clean architecture" → ask "what
  would go wrong if we didn't?" The answer is the real rule.
- **Cargo-culted conventions.** "We use airbnb because everyone does"
  → ask whether the team has actually read it. If not, the linter is
  the rule, not airbnb.
- **Per-repo rules masquerading as project rules.** If a rule applies
  to one repo only, capture it as a per-repo override; don't pollute
  the canonical doc.
