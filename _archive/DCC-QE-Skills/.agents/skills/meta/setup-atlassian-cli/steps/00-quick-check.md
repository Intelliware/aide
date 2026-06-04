---
slug: quick-check
sequence: 0
depends-on-prior: false
---

# Step 0 — Quick connectivity check

Run first, before any other step. Attempts a live API call to both JIRA and Confluence immediately. If both succeed, the tool is already fully configured and working — skip straight to Step 6 (provide-guidance). Only proceed to Step 1 if something is wrong.

## Purpose

Avoid unnecessary setup work when the tool is already configured and working. Most of the time, a returning user just needs the guidance block refreshed in context — they don't need to reinstall or reconfigure anything.

## Sub-steps (run in order)

1. Tell the user: "Checking existing Atlassian CLI connectivity…"
2. Check whether `tools/atlassian-cli/node_modules` exists AND `tools/atlassian-cli/.env` exists. If either is absent, set quick-check = `skip` and jump to sub-step 7.
3. Run the JIRA connectivity test from `tools/atlassian-cli/`:
   ```
   node bin/atl.js jira search "assignee = currentUser()" --max 1
   ```
   A pass is: exit code 0 and output contains `Found N issue(s)` (including 0). A fail is: any error output or non-zero exit code.
4. Run the Confluence connectivity test from `tools/atlassian-cli/`:
   ```
   node bin/atl.js confluence page 3579197259
   ```
   Use the known-good example page ID from the CLI's own help. A pass is: exit code 0 and output contains `Retrieved page`. A fail is: output contains `401`, `403`, `ECONNREFUSED`, or `ENOTFOUND`. A `404 Not Found` on a *different* page ID is also a pass (auth succeeded, page not found), but since 3579197259 is a known real page this should return 200.
5. **If BOTH tests passed** (JIRA exit code 0, Confluence returned 200 or 404):
   - Tell the user:
     > "Both JIRA and Confluence are reachable and authenticated. Setup is already complete!"
   - Set quick-check = `pass`.
   - **Skip steps 1–5 entirely. Jump directly to Step 6 (provide-guidance).**
6. **If either test failed:**
   - Tell the user which service(s) failed and briefly surface the error (one line each).
   - Tell the user: "Walking through the setup to identify and fix the issue…"
   - Set quick-check = `skip`.
   - Continue to Step 1 (check-node).
7. **If node_modules or .env were absent** (sub-step 2 short-circuit):
   - Tell the user: "CLI is not yet installed/configured — starting setup…"
   - Set quick-check = `skip`.
   - Continue to Step 1 (check-node).

## Hard gates

- Do NOT run `node bin/atl.js` if `node_modules` is absent — it will fail with a module-not-found error. The sub-step 2 pre-check prevents this.
- Do NOT skip to Step 6 unless **both** JIRA and Confluence passed. A partial pass (one working, one broken) must proceed through the full setup.
- Note: `auth status` only reports credentials stored via `atl auth login` — it does NOT reflect `.env`-based credentials. Do not use `auth status` as a connectivity check; use the live API calls above.
- Note: The CLI exits with code 1 on Confluence 404s, so interpret output text, not just the exit code, when diagnosing Confluence failures.

## Exit criteria

- [ ] Both connectivity tests were attempted (or skipped due to missing pre-requisites).
- [ ] quick-check is set to either `pass` (both working → go to Step 6) or `skip` (something needs fixing → go to Step 1).

## Next

**quick-check = `pass`:** Step 6 — provide-guidance (skip steps 1–5).  
**quick-check = `skip`:** Step 1 — check-node.
