# Phase 6 — Refresh Knowledge

## Purpose
Update `docs/KNOWLEDGE.md` to reflect the newly added code, then offer hand-off.

## Process

1. Invoke `qe-code-scanner` to perform a full rescan of BB-DCC-QE
2. Wait for completion — KNOWLEDGE.md now reflects new step defs, methods, etc.
3. Report to user:
   > "Knowledge refreshed. docs/KNOWLEDGE.md updated with new code."

## Hand-off to qe-execution

Offer:
> "Tests are ready. The tag is `@<tag>` and default environment is PAT4.
> Would you like to run them now? Invoke `qe-execution` to proceed."

Provide the hand-off data:
- Tag(s) to run (from the feature file)
- Recommended environment (default: PAT4)
- Any special flags needed

## Exit criteria
- KNOWLEDGE.md has been refreshed by qe-code-scanner
- User informed of completion
- Hand-off offered

