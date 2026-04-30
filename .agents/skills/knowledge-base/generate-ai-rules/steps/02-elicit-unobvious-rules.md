---
slug: elicit-unobvious-rules
sequence: 2
depends-on-prior: true
---

# Step 2 — Elicit unobvious rules

## Goal

Capture the rules RE Part A cannot prove — the convention choices,
anti-patterns, mocking discipline, naming, branch/commit norms, and
must-nots that make this project's AI agents safe to drive code.

## Inputs

- Derivation record from Step 01.
- `<KB>/shared/solution-context/30-constraints-and-compliance.md` § 5
  (Architectural prohibitions). Required if it exists; warn if missing.
- Component `verification_signal` distribution from
  `<KB>/components/<repo>/<id>.md` frontmatter.
- Elicitation pattern: `references/elicitation-patterns/coding-rules.md`
  (NEW — created as part of Stage 3 work).

## Procedure (interactive mode)

For each topic below, ask the user 1–3 questions, capture the answer,
and tag it in the in-memory rules record with section + scope (project-
wide / per-repo).

### 2.1 Language-specific rules (§ 2)
- "Are there language features the team has banned in this project?
  (e.g. `any`, `var`, deprecated APIs, decorators)"
- "Are there project-specific idioms that supersede the standard
  language style guide?"

### 2.2 Framework rules (§ 3)
- For each framework in the derivation record:
  - "What framework features are required? (e.g. NestJS guards,
    FastAPI dependencies, Spring AOP)"
  - "What framework features are forbidden? (e.g. circular module
    references, raw SQL in controllers)"
  - "Are there required decorators / annotations on every public
    handler?"

### 2.3 Testing rules (§ 4)
- Show the verification_signal distribution from the component
  catalog. "Does this match how you actually want tests written?"
- "What is the layout convention for test files?"
- "Is there a mocking discipline? (real fixtures vs auto-mocking)"
- "Coverage thresholds, if any?"
- "Required test types per change kind (unit / integration /
  contract)?"

### 2.4 Workflow rules (§ 5)
- "Branch naming convention?"
- "Commit-message convention? (conventional commits, semantic, free-
  form)"
- "PR title and body conventions?"
- "Required CI checks before merge?"

### 2.5 Error-handling rules (§ 6)
- "Custom error types? Where are they defined?"
- "Where do errors get translated to HTTP / RPC responses?"
- "Logging discipline — what is logged, what is never logged
  (PII, secrets)?"

### 2.6 Import / export rules (§ 7)
- "Barrel files allowed? Forbidden?"
- "Path aliases? (e.g. `@/`, `~`)"
- "Import grouping / ordering?"
- "Circular-import policy?"

### 2.7 Architectural must-nots (§ 8) — required input
- Pull every entry from `30-constraints-and-compliance.md` § 5
  verbatim. Ask the user: "Anything additional, beyond what solution
  context already captured?"

## Procedure (non-interactive mode)

- Skip the elicitation conversation.
- For each subsection above, emit a `TODO(human):` placeholder with
  the specific question text in a comment so a reviewer immediately
  sees what is unanswered.
- § 8 (must-nots) still copies from solution context if available.

## Imperative-form rule check

For each captured rule, the skill rephrases it (or asks the user to)
into one of:

- `Always X.`
- `Never Y.`
- `When <condition>, do X.`

Soft suggestions ("we tend to …") are flagged and the user is asked
whether the rule is firm enough to enforce. If not firm, drop it.

## Acceptance

- Every section § 2–7 has at least one rule OR an explicit "no project-
  specific rule for this section" sentinel.
- § 8 contains every entry from `30-constraints-and-compliance.md` § 5
  (when that file exists).
- Every captured rule is in imperative form OR explicitly tagged as a
  guideline (not enforceable).

## Outputs

- In-memory rules record, ready for Step 03.

## Hand-off

`steps/03-emit.md`.
