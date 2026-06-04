# navigate-knowledge-base — Overview

## Purpose

`navigate-knowledge-base` is the **load-time selector** for the entire
framework. Every stage skill — requirements, design, planning, execution,
quick-dev — needs to ground itself in the KB before doing real work, but the
KB can hold hundreds of components and reading them all blows the agent's
context. This skill performs the read pattern the root `NAVIGATE.md`
mandates (legacy KBs: `CLAUDE.md` — readers resolve `NAVIGATE.md` first
and fall back to `CLAUDE.md` when it is absent): read `ARCHITECTURE.md`
first, hit the Capability Index, walk `graph.json` one hop, return a
minimal ranked list.

The skill never writes. It is **idempotent and side-effect-free** — call it
as often as needed during a stage. Callers consume the returned list how
they like: read all, read top-N, read just frontmatter, or use the list as
input to a follow-up call with a different feature description.

## When to use

- A stage skill is about to start work and needs grounding context. Call
  this skill with the user's feature description or the increment's
  text and feed the result to the stage's reading step.
- An agent in `execute-increments` is about to open source files and
  needs to confirm which components the increment is meant to touch.
- An impact-analysis question arrives ("if I change X, what breaks?") —
  call with `--seed-component-id=X --depth=two-hop`.

## When NOT to use

- The KB does not yet exist — run `build-knowledge-base` first.
- The user explicitly asked for the KB's high-level shape ("describe this
  system") — read `ARCHITECTURE.md` § 1–4 directly; this skill's
  selection-and-ranking machinery is overkill.
- You are about to write to the KB — use `update-knowledge-base`.

## Position in workflow

This skill is the universal pre-step. Typical invocation chain:

```
<stage skill, e.g. create-requirements-package>
   ↓
   navigate-knowledge-base(feature_description)
   ↓
   stage skill reads the returned components, then proceeds with its
   own workflow.
```

In `execute-increments`, the chain is:

```
execute-increments
   ↓
   for each INC-XXX:
     navigate-knowledge-base(increment.goal + increment.plan)
     ↓
     read the returned components for grounding
     ↓
     execute the increment
     ↓
     [at end of all increments] update-knowledge-base
```

## Cost shape

- `ARCHITECTURE.md` read: 5–15 KB. Always paid.
- Capability index match: cheap (string ops on already-loaded text).
- `graph.json` read: 5–50 KB depending on KB size. Paid once per call.
- Component frontmatter scan: O(component count) but only the
  frontmatter block is read via grep — typically <500 bytes per
  component.
- Component body reads: NOT performed by this skill. The caller decides.

Rough end-to-end latency: <1s for KBs with up to ~200 components.
