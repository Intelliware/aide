---
slug: elicit-mission
sequence: 2
depends-on-prior: true
---

# Step 2 — Elicit mission & overview

## Goal

Produce `<KB>/shared/solution-context/00-overview.md` capturing the
solution's mission, value proposition, classification, and (when
applicable) multi-part summary.

## Inputs

- In-memory plan from Step 01.
- `[[project.repos]]` from `project.toml` (drives multi-part summary).
- RE Part A docs at `<KB>/source-docs/<repo>/part-a/**` (auto-fills
  classification: project type, languages, primary architecture pattern).
- ARCHITECTURE.md § 1–2 (background context, cheap read).
- Elicitation pattern: `references/elicitation-patterns/business-objectives.md`.

## Procedure

1. **Auto-fill classification.** Walk RE Part A docs and extract:
   - Project type per repo (api / ui / database / mobile / framework).
   - Primary languages (top 1–2).
   - Architecture pattern (microservice / monolith / SPA + API / mobile-
     first / etc.).
   - Repo count + role split.
2. **Open elicitation conversation** (interactive mode only). Ask in this
   order; stop after each question for the user's answer:
   - "In one sentence, what does this solution do for whom?"
   - "What is the primary value it creates? (cost saved, time saved,
     revenue unlocked, risk reduced)"
   - "What does it deliberately NOT do? (so out-of-scope is explicit)"
   - "If multi-part: how do the parts integrate at a high level?"
3. **Draft `00-overview.md`** with sections:
   - Frontmatter (see template below)
   - § 1 Mission (one paragraph)
   - § 2 Value Proposition (bullet list of 2–4 outcomes)
   - § 3 Out of Scope (bullet list)
   - § 4 Classification (auto-filled table: type, languages, arch
     pattern, repo count)
   - § 5 Multi-Part Summary (conditional — only if `[[project.repos]]`
     has > 1 entry)
   - § 6 Links Forward (to `10-personas-and-use-cases.md`,
     `20-goals-and-kpis.md`, ARCHITECTURE.md § 4 Capability Index)
4. **Present draft to user** (interactive). Accept inline edits or
   re-elicit specific questions.
5. **Write the leaf.** Frontmatter shape:

```yaml
---
solution_context_id: 00-overview
description: >-
  Use when grounding a discussion in the solution's mission, value
  proposition, or out-of-scope boundaries.
triggers:
  - mission
  - value proposition
  - out of scope
  - solution overview
  - what is this system
last_captured: <ISO-8601 date>
last_captured_by: <user_id>
---
```

6. **Non-interactive mode:** skip steps 2 and 4; emit a stub with auto-
   filled classification populated and `TODO(human):` markers (with the
   discovery question as a comment) for every interactive section.

## Acceptance

- `<KB>/shared/solution-context/00-overview.md` exists.
- Frontmatter `description` starts with `Use when `.
- Sections § 1–4 all populated (or TODO-marked in non-interactive mode).
- Multi-part summary present iff `[[project.repos]]` has > 1 entry.

## Outputs

- `<KB>/shared/solution-context/00-overview.md`.

## Hand-off

`steps/03-elicit-personas.md` if in target leaf set; otherwise next
applicable step.
