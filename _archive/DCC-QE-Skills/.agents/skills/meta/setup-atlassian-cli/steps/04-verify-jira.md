---
slug: verify-jira
sequence: 4
depends-on-prior: true
---

# Step 4 — Verify JIRA connectivity

Run after Step 2 has confirmed `.env` is configured. This step makes a live API call to JIRA to confirm the credentials and network path are both working.

## Purpose

Having a `.env` with values populated does not guarantee JIRA is reachable. The token might be expired, the email might be wrong, or VPN/proxy settings might block the connection. This step catches those issues immediately with a real API call before the user tries to use the tool for actual work.

## Sub-steps (run in order)

1. Tell the user: "Testing JIRA connectivity with a live API call…"
2. Run the following command from the `tools/atlassian-cli/` directory:
   ```
   node bin/atl.js jira search "assignee = currentUser()" --max 1
   ```
   This searches for the most recent issue assigned to the current user. It requires both a valid token and a valid email, making it an effective end-to-end connectivity test.
3. **If the command succeeds** (exit code 0 and returns JSON/markdown output — even if the result set is empty because no issues are assigned):
   - Tell the user: "JIRA connection successful."
   - Show a brief excerpt of the output (first issue key and summary if present, or "No issues currently assigned" if the result is empty — both are valid success states).
   - Set jira-check = `pass`. Proceed to Step 4.
4. **If the command fails** (non-zero exit code, auth error, network error, or JSON parse error):
   - Tell the user: "JIRA connectivity failed. Let's diagnose the issue."
   - Load `references/troubleshooting.md` and follow the **JIRA Troubleshooting** section.
   - Walk through diagnosis steps one at a time, waiting for the user's feedback at each point.
   - After diagnosis identifies a fix (corrected token, corrected email, VPN connected, etc.), return to sub-step 1 and retry.
   - Do not set jira-check = `pass` until the command succeeds.

## Hard gates

- The JIRA search command MUST return exit code 0 before this step is considered complete. An empty result set (`Found 0 issue(s)`) is acceptable; an error message is not.
- Note: `--fresh` is not a supported flag on `jira search`. The command always makes a live API call.
- Do NOT proceed to Step 5 while jira-check is still unset or `fail`.

## Exit criteria

- [ ] `node bin/atl.js jira search "assignee = currentUser()" --max 1` ran and returned exit code 0.
- [ ] The result was shown to the user (even if empty).
- [ ] jira-check is set to `pass`.

## Next

Step 5 — verify-confluence.
