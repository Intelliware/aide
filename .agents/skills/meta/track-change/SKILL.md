---
name: track-change
description: "Use when the user says \"log a change\", \"update the change tracker\", \"record this update\", \"track this edit\", \"add to the change log\", or after finishing any documentation, requirements, design, or code change that touches a tracked package. Logs the change in a standardized CHANGE-TRACKER.md with Parts Affected, source version, and verification status."
---

# Track Change

## Overview

Universal change-log utility. Appends a row + detail entry to a package's `CHANGE-TRACKER.md` using the framework's standard format so any reader can reconstruct what changed, what triggered it, what was verified, and which adjacent artifacts may need updating.

Used by every stage — RE, requirements, design, planning, execution, and KB updates all flow through this skill so log shape stays consistent across the project.

## When to use

- After completing a documentation extraction or correction
- After a requirements or design package amendment
- After a code change that affects an in-package artifact (e.g. an increment closes)
- When the user explicitly invokes "track change" / "log change"
- Whenever a verified shift occurs in a tracked package

## When NOT to use

- The package has no `CHANGE-TRACKER.md` yet — initialize one first from the canonical change-log block at `templates/blocks/shared/change-log.md`
- Trivial conversational edits with no artifact changes — skip the log
- Untracked scratch files outside any package — no tracker to update
- Bulk migration / one-shot regeneration — use a higher-level migration log instead

## Inputs

See `references/INPUTS-OUTPUTS.md`.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

1. **Determine context** — ask the user (or infer): which package/repo, what changed, which Parts Affected, source version, verification approach, cross-impact.
2. **Locate or create the tracker** — find `CHANGE-TRACKER.md` in the package; if missing, create it from the canonical change-log block at `templates/blocks/shared/change-log.md` and pre-populate Parts Affected from the package's own conventions.
3. **Log the change** — append a summary row to the Change Log table and a detailed entry below using the framework's row+detail format.
4. **Version check** — if this corresponds to a new source version, update "Current Source Version" at the top, open a new section header, and increment the documentation version (`X.Y.Z-doc.N`).

## Output

See `references/INPUTS-OUTPUTS.md`. A new entry in `CHANGE-TRACKER.md` with both a one-line summary row and a detailed entry.

## Next skill

Whichever skill the change came from — track-change is a tail action, not a precursor. Common follow-ups: `verify-source` to re-verify the package, or no skill at all (the user resumes their work).

## Common mistakes

- Resetting change numbers — never; they monotonically increase across versions
- Forgetting to assess cross-impact (Parts Affected often touches more than the obvious one)
- Using the wrong Parts Affected vocabulary (it's package-specific — read the package's own conventions)
- Skipping the Source Version field — without it staleness checks break
- Creating a separate tracker per change — there is one tracker per package
