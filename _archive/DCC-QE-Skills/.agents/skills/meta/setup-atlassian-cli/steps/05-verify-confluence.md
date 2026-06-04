---
slug: verify-confluence
sequence: 5
depends-on-prior: true
---

# Step 5 — Verify Confluence connectivity

Run after Step 3 has confirmed JIRA connectivity. This step makes a live API call to Confluence to confirm the Confluence token and network path are both working.

## Purpose

JIRA and Confluence use separate tokens from separate profile pages. A working JIRA connection does not guarantee Confluence works. This step verifies the Confluence token independently with a real API call.

## Sub-steps (run in order)

1. Tell the user: "Testing Confluence connectivity with a live API call…"
2. Run a live Confluence API probe from `tools/atlassian-cli/`:
   ```
   node bin/atl.js confluence page 3579197259
   ```
   This fetches a known real page from Confluence. The expected outcomes are:
   - **`Retrieved page: ...`** (exit code 0) — clear pass: authenticated and connected.
   - **`401 Unauthorized` / `403 Forbidden`** in the error output — token is invalid or expired. Fail.
   - **Network error / ECONNREFUSED / timeout** — connectivity issue (VPN, proxy). Fail.
3. **If the probe succeeds** (exit code 0, output contains `Retrieved page`):
   - Tell the user: "Confluence connection successful."
   - Set confluence-check = `pass`. Proceed to Step 6.
4. **If the probe fails** (401, 403, or network error):
   - Tell the user: "Confluence connectivity failed. Let's diagnose the issue."
   - Load `references/troubleshooting.md` and follow the **Confluence Troubleshooting** section.
   - Walk through diagnosis steps one at a time, waiting for the user's feedback.
   - After diagnosis identifies a fix, return to sub-step 2 and retry.
   - Do not set confluence-check = `pass` until the probe returns exit code 0.

## Hard gates

- The probe MUST exit with code 0 and output must contain `Retrieved page` before this step is considered complete.
- Note: `auth status` only reflects credentials stored via `atl auth login` — it does NOT report `.env`-based credentials. Do not rely on `auth status` as a connectivity check.
- Do NOT proceed to Step 6 while confluence-check is unset or `fail`.

## Exit criteria

- [ ] `node bin/atl.js confluence page 3579197259` returned exit code 0 and output contained `Retrieved page`.
- [ ] confluence-check is set to `pass`.

## Next

Step 6 — provide-guidance.
