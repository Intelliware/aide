---
name: verify-source
description: "Use when the user says \"verify the docs\", \"check this against source\", \"are these claims source-verified\", \"audit the package\", \"validate the spec\", or after assembling any requirements / design / RE / KB package and before declaring it done. Generic content-vs-source verifier — runs completeness, accuracy, consistency, and change-tracking checks against the cited source artifacts (code, tickets, prior packages) for any package type."
---

# Verify Source

## Overview

Cross-stage verification skill. Runs the universal four-check checklist (completeness / accuracy / consistency / change-tracking) plus a spot-check pass against cited sources for any package type — requirements, design, RE, KB component, implementation increment, or quick-dev spec. Catches AI hallucinations, missing artifacts, and cross-part inconsistencies before a package leaves its authoring stage.

This is the generic version. RE-specific deep checks live inside each `reverse-engineer-*` skill's `steps/verify.md`. This meta skill handles the universal portion that applies to all package types.

## When to use

- A package has been assembled or amended and the user wants confidence before handoff
- After a long session where AI hallucination risk is elevated
- Before any review-stage skill runs (requirements review, design review, etc.)
- Drift suspected — sources changed but the doc may not have been updated
- KB component frontmatter `last_verified_against_commit` is stale

## When NOT to use

- The package has not been assembled yet — verification needs something to check
- You want to verify code (not docs) against tests — that's part of the execution stage's verification, not this skill
- The cited source isn't accessible — verification requires source comparison
- For pure RE deep checks, prefer the RE skill's `steps/verify.md` which adds domain-specific items

## Inputs

See `references/INPUTS-OUTPUTS.md`.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

1. **Determine scope** — package path, which parts/sections, full vs. focused, source-access confirmation.
2. **Run universal checks** — completeness, accuracy, consistency, change-tracking. See `references/verify-checklist.md`.
3. **Spot-check against source** — pick 3–5 representative claims and read the cited source artifact(s) directly to confirm.
4. **Run package-type-specific checks** — see the routing table in `references/package-type-checks.md` for which extra checks apply (requirements vs. design vs. RE vs. KB vs. quick-dev).
5. **Report results** — produce a verification report with passed / failed / warning counts and recommendations.
6. **Log verification** — invoke `track-change` (or log manually) with verification status and any corrections made.

## Output

See `references/INPUTS-OUTPUTS.md`. A verification report (Markdown) plus a tracker entry.

## Next skill

- `track-change` — log the verification result and any corrections
- The package's review skill (`review-requirements-package`, `review-design-package`) when verification passes
- The originating authoring skill (e.g. `create-requirements-package`) when verification fails and amendments are needed

## Common mistakes

- Trusting the doc's own claims without spot-checking against source
- Skipping cross-part consistency checks (Part A vs. Part B; design vs. requirements traceability)
- Ignoring `[NEEDS CLARIFICATION]` and `UNVERIFIED` markers — they are by definition unfinished
- Reporting pass when the change tracker is missing entries — incomplete history equals incomplete verification
- Verifying against memory instead of re-reading the source artifact each time
