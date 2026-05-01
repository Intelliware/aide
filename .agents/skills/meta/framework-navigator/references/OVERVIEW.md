# Overview — framework-navigator

## Purpose

The framework-navigator is A.I.D.E.'s help router. It listens for vague,
goal-shaped, or "I'm lost" utterances, probes the workspace to see what state
the project is in, and emits a single downstream-skill recommendation plus the
exact trigger phrase to invoke that skill. It is the safe default whenever the
user does not know which skill to run.

The navigator exists because the unified framework now has dozens of skills
spread across eight stages (meta, requirements, design, planning, execution,
reverse-engineering, knowledge-base, quick-dev) — the exact count drifts as
skills are added or restructured, so the navigator reads `skills/_registry/skills.csv`
at runtime rather than relying on a baked-in number. Without a router, users would
have to memorize the skill catalog and the workflow graph by hand. Instead the
navigator centralizes that matching: it consumes the registry
(`skills/_registry/skills.csv`, `skills.json`), the flow graph
(`skills/_registry/workflow-graph.yaml`), and the project's super-context
(`project.toml`), and it produces one recommendation at a time. It never does
the work itself — it points and steps aside.

## When to use

- The user asks "help" / "what's next" / "where do I start" / "what's my best
  option" / "how do I…" with no specific skill named.
- The user describes a goal in plain English ("I want a quick change to this
  project", "I want to RE this API into the global KB", "help me write
  requirements for a new feature").
- The user asks "what skills are available" / "show me the catalog" / "list all
  the skills" — catalog mode.
- The user is mid-flow and re-orients ("am I on the right track?", "what
  comes after the requirements review?").
- Intent is ambiguous, contradictory, or mentions multiple stages without
  committing to one.

## When NOT to use

- The user has already named a specific skill — invoke that skill directly.
- The user wants the framework configured (overrides, `_suppress`, pinned
  elicitation answers) — route to `customize-framework`.
- The user is bootstrapping a brand-new project — `start-project` is the entry
  point; the navigator may recommend it but should not initialize anything.
- The user is asking a generic coding question unrelated to A.I.D.E.

## Position in workflow

Cross-cutting / anytime. The navigator sits outside the stage sequence and is
listed under `anytime` in `skills/_registry/workflow-graph.yaml`. It is most
often used at session start, when intent is unclear, or whenever the user
re-orients between stages. It does not consume a stage budget and produces no
artifacts.
