# generate-ai-rules — Overview

## Purpose

Authors the canonical AI guardrails document for the project. Where
`capture-solution-context` answers "why this solution exists" and
`document-operations` answers "how it runs", this skill answers
"what rules an AI agent must follow when writing code in any of these
repos".

The artefact is meant to be **read by every downstream code-writing
skill** as part of grounding: `quick-dev/execute-quick-change`,
`execution/execute-increments`, and any future scaffolding skill.

## Why hybrid auto + interactive

Two failure modes exist for AI-rules documents:

1. **Pure auto-derivation** produces correct-but-shallow rules ("uses
   TypeScript 5.4, ESLint with airbnb config") that miss every
   project-specific quirk a human would call out ("never use
   barrel exports because circular-import detection is too slow").
2. **Pure interactive** wastes the user's time on rules the code already
   proves and risks contradicting reality (user says "we're on React
   18" while the lock file shows 17.0.2).

The skill auto-fills sections RE Part A can prove from the lock files,
package files, and build/test scripts. It then opens an elicitation
conversation focused on the things RE *cannot* prove: convention
choices, anti-patterns, surprising compatibility constraints, mocking
discipline, branch/commit norms.

## When to use

- After `capture-solution-context`. Constraints captured there
  feed the "must-not" rules.
- Before the project starts running code-writing skills like
  `execute-increments` or `execute-quick-change`.
- After a stack upgrade or new repo joining the project — the auto-
  derived sections need refresh, and any rule depending on a removed
  dependency needs review.

## When NOT to use

- Greenfield projects before any framework is chosen — there is nothing
  for Step 01 to auto-derive from. Wait until the design package fixes
  a stack.
- Per-feature implementation instructions — those belong in the
  requirements package's standards section.

## Position in workflow

Brownfield:
1. `start-project`
2. RE → `build-knowledge-base` → `verify-knowledge-base-coverage`
3. `capture-solution-context`
4. **`generate-ai-rules`** ← THIS SKILL
5. `document-operations`
6. `create-requirements-package`

Greenfield:
1. `start-project`
2. `capture-solution-context`
3. `create-requirements-package` → `create-design-package`
4. **`generate-ai-rules`** (now there is a stack to derive from) ←
   THIS SKILL
5. `create-implementation-package` → `execute-increments`

## Per-repo override policy

The default output is **one** `project-context.md`. Step 03 only emits
per-repo overrides when stack divergence reaches a threshold — a
concrete trigger such as:

- Different primary language (e.g. TypeScript vs C#) across repos.
- Different test framework family.
- Different package-manager.
- A rule that would be actively wrong for at least one repo if applied
  globally.

The skill prefers a single doc with conditional sections ("In Node
repos, do X; in .NET repos, do Y") whenever that fits in < 300 lines.
Per-repo files are an escape hatch, not a default.
