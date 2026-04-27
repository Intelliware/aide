# build-knowledge-base — Overview

## Purpose

`build-knowledge-base` is the **initial KB construction skill**. It is the
single entry point for populating an empty `knowledge_base_path` from
reverse-engineering Part A/B outputs, and it replaces the legacy
`reverse-engineering/phases/build-knowledge-repository-phase.md` aggregator.
The legacy aggregator's 10-folder structure (`01-architecture-overview/` …
`10-repository-maintenance/`) is preserved verbatim under `synthesized/` so
that downstream tooling, onboarding guides, and ADR archives that depend on
those paths continue to work — but the *primary* index moves to the
schema-driven `ARCHITECTURE.md` + `components/` + `graph.json` triumvirate
defined in `config/SCHEMAS.md` § 3.

The KB lives in its own repo, sibling to the source repos and to
A.I.D.E. The skill operates against the path declared in
`project.toml`'s `[project.paths] knowledge_base_path`. It never reads from
or writes to source repos directly — those are reached only via symlinks
under `<knowledge_base_path>/source-docs/<repo-slug>/`, populated by the RE
stage that runs before this skill.

## When to use

- Brownfield onboarding has produced RE Part A and Part B docs for every
  repo enumerated in `[[project.repos]]` and they have been deposited under
  `<knowledge_base_path>/source-docs/<repo-slug>/`.
- The user explicitly asks to build, scaffold, or initialise the KB.
- `knowledge_base_path` exists and is empty, **or** the user has confirmed
  overwrite of an existing KB. Step 1 (`steps/01-validate-target.md`)
  enforces this.

## When NOT to use

- The KB is already populated and a feature has shipped — use
  `update-knowledge-base`.
- The agent needs a few component files to ground a feature — use
  `navigate-knowledge-base` (which is far cheaper and never writes).
- Source repos have changed since last KB build — use
  `detect-knowledge-base-drift` first to understand what needs updating,
  then `update-knowledge-base`.
- `project.toml` is missing or `knowledge_base_path` is unset — the skill
  errors early with a helpful message.

## Position in workflow

Brownfield onboarding flow:

1. `start-project` (meta) — gathers project intent, calls
   `analyze-repository` per repo.
2. Reverse-engineering stage — produces Part A/B docs per repo, deposits
   them under `<knowledge_base_path>/source-docs/<repo-slug>/`.
3. **`build-knowledge-base`** ← THIS SKILL. Scaffolds the KB.
4. `verify-knowledge-base-coverage` — immediate sweep on first build.
5. `start-project` resumes and routes to the next stage skill (typically
   `create-requirements-package` in brownfield mode).

In greenfield flow this skill is not invoked at all on day one — the KB is
seeded by the design stage's ADRs and grows incrementally via
`update-knowledge-base` as features ship.
