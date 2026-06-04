---
name: setup-atlassian-cli
description: "Use when the user asks to set up the Atlassian CLI, configure the Atlassian CLI, connect to JIRA, connect to Confluence, set up JIRA access, set up Confluence access, install the atlassian CLI tool, configure JIRA tokens, configure Confluence tokens, says 'setup atlassian', 'I can't connect to JIRA', 'I can't connect to Confluence', 'set up the CLI tools', 'configure my PAT tokens', 'get the CLI working', or needs to verify Atlassian connectivity before running another skill that depends on it. Walks step-by-step through: Node.js availability, npm install, .env configuration with PAT tokens, JIRA connectivity verification, Confluence connectivity verification, and emits a CLI command reference for AI context."
---

# Setup Atlassian CLI

## Overview

Guides the user through the complete setup of the `tools/atlassian-cli` CLI tool — the bridge between AI skills and TD's Atlassian services (JIRA at `track.td.com`, Confluence at `collaborate.td.com`). The skill is fully self-contained and interactive: it detects the current state of the environment at each step and only performs the work that is actually needed.

The workflow is sequenced through six steps: Node.js check (Step 0), CLI installation (Step 1), `.env` configuration (Step 2), JIRA connectivity (Step 3), Confluence connectivity (Step 4), and AI-context guidance output (Step 5). Steps 0–4 are hard-gated — each must pass before the next begins. Step 5 always runs and produces the CLI reference block that other skills consume as a prerequisite.

This skill is always run from the workspace root. All paths are relative to the workspace root unless stated otherwise.

## When to use

- The user is running an Atlassian-dependent skill for the first time and the CLI is not yet configured
- The user cannot connect to JIRA or Confluence and wants to diagnose the issue
- The user explicitly invokes any of the trigger phrases (see frontmatter)
- A skill declares `setup-atlassian-cli` as a prerequisite and routes here before continuing
- The `.env` file is missing, incomplete, or contains stale tokens

## When NOT to use

- The CLI is already confirmed working and the user just wants CLI command syntax → the guidance is in `steps/05-provide-guidance.md`, which can be read directly
- The user wants to install a different tool or configure a different service → use the relevant skill or handle directly
- The user wants to create/update JIRA issues or Confluence pages as part of a workflow → those skills call this skill as a prerequisite first; do not re-run setup if it was already completed in the same session

## Inputs

See `references/INPUTS-OUTPUTS.md` for the full table.

No required inputs — the skill is fully interactive and probes the environment itself. Optional context:
- **Workspace root path** — defaults to the current working directory. All `tools/atlassian-cli/` paths resolve from here.
- **Existing `.env`** — if present, values are read and only missing/blank fields are re-prompted.

## Workflow

Run one step at a time. Do not pre-load reference files. Each step file is loaded only when that step begins.

0. `steps/00-quick-check.md` — Attempt a live API call to both JIRA and Confluence immediately. **If both succeed, skip steps 1–5 and jump directly to Step 6.** Only continue to Step 1 if something is missing or broken.

1. `steps/01-check-node.md` — Verify Node.js ≥ 18.0.0 is installed. If not, surface TD-specific install instructions and pause until Node is confirmed available. Hard gate: do not proceed until Node passes.

2. `steps/02-check-install.md` — Check whether `tools/atlassian-cli/node_modules` exists; if not, run `npm install`. Verify the CLI responds to `--help`. Hard gate: CLI must be functional before proceeding.

3. `steps/03-configure-env.md` — Check for `tools/atlassian-cli/.env`; copy `.env.example` if absent. Interactively collect `JIRA_TOKEN` and `CONFLUENCE_TOKEN`. Echo a redacted summary; write values only after user confirmation. Hard gate: both fields must be non-blank.

4. `steps/04-verify-jira.md` — Run a live JIRA search to confirm API connectivity and token validity. On failure, load `references/troubleshooting.md` and walk through diagnosis. Hard gate: JIRA call must succeed.

5. `steps/05-verify-confluence.md` — Fetch a known Confluence page (`confluence page 3579197259`) to confirm connectivity and token validity. On failure, load `references/troubleshooting.md` and walk through diagnosis. Hard gate: Confluence call must succeed.

6. `steps/06-provide-guidance.md` — Emit the canonical CLI command reference block for AI context. This step always runs last and is the terminal output of this skill. Other skills that depend on Atlassian CLI consume this output.

## Output

| Artifact | Path | Format |
|---|---|---|
| Configured environment file | `tools/atlassian-cli/.env` | dotenv key=value |
| Installed dependencies | `tools/atlassian-cli/node_modules/` | npm install output |
| CLI command reference | Emitted to conversation | Structured markdown block |

## Next skill

`<dynamic — return to the skill that invoked setup-atlassian-cli, or exit if run standalone>`

## Common mistakes

- Skipping Step 0 and assuming Node is available. Always check — TD machines may not have Node ≥ 18.0.0 in PATH even if some version is installed.
- Proceeding past a hard gate when the check fails. Each step has an explicit exit condition; do not advance until it is met.
- Writing `.env` before echoing back the redacted values and getting user confirmation. The echo-back in Step 2 is mandatory.
- Using `npm run issue` shorthand instead of `node bin/atl.js jira issue <KEY>` — the npm scripts are convenience wrappers for standalone use and are not appropriate for agent invocations where arguments need to be passed cleanly.
- Running CLI commands from the workspace root. All `node bin/atl.js` commands must be run from inside `tools/atlassian-cli/`.
- Treating a cached result as a connectivity confirmation. Step 3 and Step 4 must produce a live API response (not a cache hit) to pass.
- Assuming the same PAT token works for both JIRA and Confluence — they are separate tokens from separate profile pages.
