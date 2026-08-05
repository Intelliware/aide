---
slug: emit
sequence: 3
depends-on-prior: true
---

# Step 3 — Emit (with divergence check)

## Goal

Render the canonical `project-context.md`, decide whether per-repo
overrides are warranted, and write everything to disk under
`<KB>/shared/ai-rules/`.

## Inputs

- Derivation record from Step 01.
- Rules record from Step 02.
- `--force-overrides` flag if supplied.
- Existing files under `<KB>/shared/ai-rules/`.

## Procedure

### 3.1 Render `project-context.md`

Compose the document with these sections:

```
# AI Rules — Project Context for AI Agents

<!-- This file is the contract for AI agents writing code in this
project. Rules are imperatives. Soft advice is filtered out. -->

## 1. Technology stack & versions
<table from derivation record; one row per (repo, language/framework/test/build cmd)>

## 2. Language-specific rules
<bulleted imperatives, grouped by language when divergent>

## 3. Framework rules
<grouped by framework>

## 4. Testing rules
<bulleted imperatives + layout convention + coverage thresholds>

## 5. Development workflow rules
<branch/commit/PR conventions, CI must-passes>

## 6. Error-handling rules
<custom errors, translation layer, logging discipline>

## 7. Import / export & module rules
<barrel files, path aliases, ordering, circular-imports>

## 8. Architectural must-nots
<verbatim from solution-context § 5 + any additions>

## 9. Cross-links
<paths to operations docs, solution-context leaves, ADR index>
```

### 3.2 Divergence decision

Examine divergence signals from Step 01.

| Signal | Action |
|---|---|
| `lang-diff` (different primary languages) | Almost always emit per-repo overrides for the minority repos. |
| `test-diff` (different test framework families) | Conditional sections in the canonical doc; per-repo override only if rules differ in spirit, not just family. |
| `pkg-diff` (different package managers) | Conditional sections suffice. |
| `validator-diff` | Conditional sections. |
| User-flagged "this rule applies only to repo X" | Per-repo override for repo X. |

When `--force-overrides` is supplied, emit one override per repo
regardless.

### 3.3 Render per-repo overrides (when warranted)

Each per-repo file `<KB>/shared/ai-rules/per-repo/<repo-slug>.md`
opens with:

```
# AI Rules Override — <repo name> (<repo code>)

<!-- This file overrides specific rules from project-context.md for
this repo. Read project-context.md first; treat anything not stated
here as inherited. -->

**Why this override exists:** <one line>
```

Then only the sections that diverge.

### 3.4 Write files

- Write canonical `<KB>/shared/ai-rules/project-context.md`.
- Write any per-repo override files.
- Stamp the change-tracker (`<KB>/change-tracker.md`) with one row.

### 3.5 Audit print

Print:
- Total lines in `project-context.md` and pass/warn/fail against the
  300/500-line thresholds.
- Version-citation diff: every version in § 1 alongside the lock-file
  it came from.
- Override decision summary: which signals fired, which overrides
  emitted, why.

## Acceptance

- `project-context.md` exists and passes the validation gate from
  `references/INPUTS-OUTPUTS.md`.
- Per-repo override files (if any) carry the "Why this override exists"
  header.
- Audit print produced.

## Outputs

- `<KB>/shared/ai-rules/project-context.md`.
- Optional per-repo override files.
- Change-tracker row.

## Hand-off

`steps/04-cross-link.md`.
