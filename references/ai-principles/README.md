# AI Working Principles

The framework-wide principles every AI-driven skill in A.I.D.E.
follows. These are not aspirational values — they are operational
constraints baked into how each skill is authored, validated, and run.

A skill that violates a principle is broken; the validators surface
violations and the review skills (`review-requirements-package`,
`review-design-package`, `review-implementation-package`,
`review-knowledge-base-coverage`) treat them as findings.

## Why these principles exist

LLM agents are powerful but unreliable in a specific way: they will
confidently produce well-formatted output for an under-grounded prompt.
Without explicit constraints, that produces plausible-looking artifacts
that subtly contradict the source code, the requirements, the glossary,
or the prior decisions.

The principles below close that gap by forcing every generation step to
be either (a) traceable to a source the user can verify or (b) flagged as
a gap requiring human input.

---

## Principle 1 — Source-verified facts

**Rule.** Every claim in a generated artifact resolves to a citation in
source material the user can read. "Source material" means: code, data,
prior artifacts, cited standards, or recorded user input. It does **not**
mean "what the model knows."

**Why.** The most expensive failure mode of AI-assisted SDLC is
plausible fabrication. A requirements package that invents a stakeholder
or a design that cites a library version that does not exist costs
hours of debugging and erodes trust in the framework permanently.

**How to apply.**

- Every FR row, design decision, KB component, glossary entry, and
  traceability row carries a `Source / Authority` column. The column is
  not optional.
- When the user has not yet supplied source material, **ask for it**
  before generating. Skills are elicitation-first by design (see
  `references/elicitation-patterns/`).
- "I will infer this from convention" is not a citation. Either the
  convention is documented somewhere citable, or the gap is real and
  must surface to the user.
- When migrating brownfield content into a KB component, link to the
  source repo + commit, never paraphrase without provenance.

**Anti-patterns.**

- Generating prose like "The system uses OAuth for authentication"
  without having read code that confirms it.
- Filling glossary `Source / Authority` cells with `inferred` or `model
  knowledge`. Both are rejected by the validator.
- Citing a Stack Overflow / blog URL without verifying the cited content
  matches the project's actual version of the technology.

---

## Principle 2 — Scaffold-then-extract

**Rule.** When generating a multi-section artifact, scaffold the **full
intended structure** on disk first (empty section files with frontmatter)
and only then fill the sections. Never extract content section-by-section
without the scaffold in place.

**Why.** Scaffolding forces the agent to declare scope before declaring
content. A scaffold mismatch (the agent thought it was generating 12
sections; the composition asks for 14) surfaces immediately as missing
files, not as a 400-line PR with two sections quietly dropped. The
principle also makes coverage gaps visible — empty section files are
easier to scan than an absent section in a long document.

**How to apply.**

- The reverse-engineering skills end Stage 1 with a complete scaffold,
  always. (See `references/canonical-shapes/canonical-re-shape.md`.)
- Composition-driven skills generate the full block list before
  authoring any block content.
- The relevance gate (Step 0 of the requirements / design 7-step
  per-section workflow) is a scaffold check: which scaffolded sections
  apply, which are N/A, which need user clarification.

**Anti-patterns.**

- Generating sections in arrival order ("I'll do Goal, then
  Dependencies, then…") without a scaffold view of the whole
  artifact.
- Letting the agent decide which sections to skip without surfacing
  the decision through the composition's relevance gate.
- "Scaffolding in memory" — the scaffold must be on disk so reviewers
  can audit it.

---

## Principle 3 — Elicit before generating

**Rule.** Before producing artifact body text, the skill asks the user
for the inputs the artifact requires. Generation runs against
**answered** elicitation, not against blank-cheque inferred context.

**Why.** Agents are good at producing plausible content; they are bad at
asking. Without an explicit elicitation step, the agent will fill gaps
silently with assumptions that contradict the user's intent. The cost
of asking is small and recoverable; the cost of regenerating after a
silent assumption diverges is multi-session.

**How to apply.**

- Every skill's SKILL.md cites at least one elicitation pattern from
  `references/elicitation-patterns/`.
- Elicitation is **conversational** — questions one at a time,
  multiple-choice preferred where applicable, never one mega-prompt.
- The elicitation step records the user's answers (in `project.toml`
  `[project.elicitation]`, in a per-stage discovery artifact, or
  inline) so they survive across sessions and feed the next stage.
- Re-elicitation is allowed and expected when an upstream answer
  invalidates a downstream assumption.

**Anti-patterns.**

- Generating an artifact, then asking the user to "review and edit." The
  agent has already committed to assumptions the user now has to undo.
- Bundling 12 elicitation questions into one prompt. Users skip questions
  buried in walls of text.
- Persisting elicitation answers only in chat history. They must land on
  disk.

---

## Principle 4 — Composition is authoritative

**Rule.** The set of sections in any artifact is determined by the
composition manifest (under `templates/compositions/`), not by the
agent. To add or remove a section, edit the composition. Do not
ad-hoc.

**Why.** The composition is the single source of truth for artifact
shape. Letting agents add sections "because it seemed useful" produces
artifact drift across the project (every requirements package looks
slightly different) and breaks downstream skills that expect specific
sections.

**How to apply.**

- Skills resolve their block list from the composition specified by
  `project.toml`'s flow + the skill's own composition mapping.
- The relevance gate (Step 0 of the 7-step workflow) marks blocks
  `Fill` / `Skip` / `N/A` — but cannot add blocks that the composition
  does not list.
- Genuine new-section needs feed back into the composition (a
  `customize-framework` invocation that edits the composition layer),
  not into ad-hoc artifact authoring.

**Anti-patterns.**

- Generating a "bonus" section the composition does not list because
  the agent thought the artifact was incomplete.
- Skipping a composition-required section silently. Skip is allowed; it
  must be marked `Skip` or `N/A` in the relevance gate, never absent.
- Cross-pollinating sections from other compositions because they
  "felt relevant."

---

## Principle 5 — Progressive disclosure

**Rule.** SKILL.md files are ≤200 lines (per FR1.4). Detail lives in
`references/`, loaded on demand. Skills never inline content that
belongs in a reference.

**Why.** Context budgets are finite. A 600-line SKILL.md crowds out the
content the agent actually needs (the source code, the requirements
artifact, the user's elicitation answers). The framework's NFR2 makes
this explicit.

**How to apply.**

- Every skill ships at minimum
  `references/{OVERVIEW.md, INPUTS-OUTPUTS.md, EXAMPLE.md}` (per FR7.1).
- Deep workflows (review checklists, decision rubrics, edge-case
  catalogues) live in additional reference files under `references/`.
- SKILL.md `## Workflow` lists step files by name and points at
  `references/<workflow>.md` for the deep procedure.
- Reference-to-reference includes are by relative path; never `@`-include
  another skill's files (per NFR2).

**Anti-patterns.**

- Inlining the full canonical-shape spec into every skill that uses it.
  (The shape lives in `references/canonical-shapes/`; skills cite it.)
- 400-line SKILL.md files that mix what-to-do with how-to-do-it.
- Reference files that are themselves 1000-line monoliths — split into
  topical references.

---

## Principle 6 — Skill-to-skill handoff by name

**Rule.** When one skill recommends or hands off to another, it does so
by **skill name** (`## Next skill\n<name>`) and the trigger phrase the
user types. Never by `@`-include or by inlining the next skill's
content.

**Why.** Each skill invocation runs in a fresh context window. Inlining
or `@`-including downstream skill content collapses the budget and
defeats the framework's progressive-disclosure design. Name-based
handoff also keeps the orchestrator (`framework-navigator`) authoritative
about flow.

**How to apply.**

- SKILL.md ends with `## Next skill` and one or more candidate skill
  names plus their canonical trigger phrases.
- The orchestrator emits the trigger phrase as a quoted string the user
  pastes.
- Conditional handoffs branch by name, not by inlining: "If
  brownfield → `analyze-repository`; if greenfield →
  `create-requirements-package`."

**Anti-patterns.**

- Recommending a skill via paraphrase ("you should probably do the
  requirements step now"). Use the canonical name and trigger phrase.
- `@`-including a downstream skill's SKILL.md to "preview" what it'll do.
- Doing the next skill's work yourself instead of handing off.

---

## Principle 7 — Halt on ambiguity, never guess

**Rule.** When the agent encounters ambiguous or contradictory input
that cannot be resolved by reading source material, it **halts** with
the specific question, not a best guess. Halting is a feature, not a
failure.

**Why.** Silent guesses compound. A guess in Step 2 of a requirements
package contaminates Step 3, Step 4, and the eventual design. Halting
costs one elicitation round; guessing costs a session re-do.

**How to apply.**

- Each skill's SKILL.md `## Common mistakes` includes "Skipping the halt
  on ambiguous input" or equivalent.
- Halt produces a structured error: what was ambiguous, what was tried,
  what the user must clarify.
- Resume from halt is supported — answers feed into the relevant
  elicitation pattern and the skill continues from the halt point.

**Anti-patterns.**

- "I'll go with the most common interpretation." There is no
  "most common" in a project's domain.
- Halting with "I don't know" instead of a specific actionable
  question.
- Burying a halt-worthy ambiguity in a `Notes` cell and continuing.

---

## Principle 8 — Append-only for decisions

**Rule.** Architecture Decision Records (ADRs), bug log entries, change
log entries, and any other "decision artifact" are append-only. They are
never edited in place to change the record of what was decided.

**Why.** The value of a decision record is its immutability — readers
must be able to see what was decided when, even if a later decision
supersedes it. Editing in place makes the record a moving target, which
is worse than no record at all.

**How to apply.**

- ADRs use the `proposed → accepted → superseded` lifecycle. A
  superseded ADR is **not deleted**; a new ADR is added that cites the
  one being superseded.
- Bug log entries record the resolved state in a follow-up entry, not by
  editing the original.
- Change-log rows describe what changed in the artifact; they are
  appended, never rewritten.

**Anti-patterns.**

- Rewriting an ADR after the fact because "it didn't make sense
  anymore." Add a new one.
- Marking an ADR `accepted` then editing it to weaken the decision.
- Replacing a bug log entry's root-cause text after a re-investigation
  rather than appending the corrected analysis.

---

## Validation

These principles are enforced by:

- **`scripts/validate.py`** — Check C (description discipline), Check D
  (phase language), Check E (block frontmatter), Check G (elicitation
  resolution).
- **The review skills** (`review-requirements-package`,
  `review-design-package`, `review-implementation-package`) — explicitly
  check sourcing and citation completeness in the artifact under review.
- **`verify-knowledge-base-coverage`** — checks KB component frontmatter
  for `last_verified_against_commit`, source-link presence, and the
  decomposition discipline that comes from Principle 5.

A finding from any of the above is a real defect in the artifact, not a
matter of taste.
