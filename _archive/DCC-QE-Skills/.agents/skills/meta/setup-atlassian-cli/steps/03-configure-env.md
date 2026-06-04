---
slug: configure-env
sequence: 3
depends-on-prior: true
---

# Step 3 — Configure .env

Run after Step 1 has confirmed the CLI is installed. This step ensures `tools/atlassian-cli/.env` exists and contains valid credentials for JIRA and Confluence.

## Purpose

The CLI reads authentication details from `.env`. Two values must be populated by the user: a Personal Access Token for JIRA and a Personal Access Token for Confluence. This step collects those values interactively and writes them safely, only after the user has confirmed what will be written.

## Sub-steps (run in order)

1. Tell the user: "Checking .env configuration…"
2. Check whether `tools/atlassian-cli/.env` exists.
3. **If `.env` is absent:**
   - Tell the user: "No `.env` found — copying from `.env.example`…"
   - Copy `tools/atlassian-cli/.env.example` to `tools/atlassian-cli/.env`.
4. Read the current contents of `tools/atlassian-cli/.env`.
5. Identify which of the two required fields are missing or still contain placeholder values:
   - `JIRA_TOKEN` — missing or equals `your-jira-pat-token`
   - `CONFLUENCE_TOKEN` — missing or equals `your-confluence-pat-token`
6. **For each missing/placeholder field, prompt the user in sequence:**

   **JIRA_TOKEN:**
   > "Please provide your JIRA Personal Access Token.
   >
   > You can generate one at:
   > https://track.td.com/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens
   >
   > Open that link in your browser, click 'Create token', give it a name (e.g. 'Copilot'), and paste the token here:"
   - Accept any non-blank string. Do not validate the token format — it will be tested in Step 3.

   **CONFLUENCE_TOKEN:**
   > "Please provide your Confluence Personal Access Token.
   >
   > You can generate one at:
   > https://collaborate.td.com/plugins/personalaccesstokens/usertokens.action
   >
   > Open that link in your browser, click 'Create token', give it a name (e.g. 'Copilot'), and paste the token here:"
   - Accept any non-blank string. Do not validate the token format — it will be tested in Step 4.

7. If both fields were already populated with non-placeholder values, tell the user: "All required `.env` fields are already set." and skip to sub-step 8.
8. **Before writing, echo a redacted summary back to the user:**
   ```
   About to write the following to tools/atlassian-cli/.env:

   JIRA_URL=https://track.td.com          (unchanged)
   CONFLUENCE_URL=https://collaborate.td.com  (unchanged)
   JIRA_TOKEN=<first 4 chars>...<last 4 chars>  (redacted)
   CONFLUENCE_TOKEN=<first 4 chars>...<last 4 chars>  (redacted)
   ```
   Ask: "Does this look correct? Type 'yes' to write, or 'no' to re-enter the values."
9. **If the user confirms 'yes':**
   - Write only the changed fields into `tools/atlassian-cli/.env`, preserving all other lines (especially `JIRA_URL` and `CONFLUENCE_URL`).
   - Tell the user: ".env updated successfully."
   - Set env-check = `pass`. Proceed to Step 3.
10. **If the user says 'no':**
    - Return to sub-step 6 and re-collect the values.

## Hard gates

- NEVER write the `.env` file before the user has confirmed the redacted echo-back.
- NEVER log or display a full token value — always redact to `<first 4 chars>...<last 4 chars>`.
- Both fields (`JIRA_TOKEN`, `CONFLUENCE_TOKEN`) MUST be non-blank before this step exits.
- `JIRA_URL` and `CONFLUENCE_URL` MUST be preserved as `https://track.td.com` and `https://collaborate.td.com` respectively — do not overwrite them.

## Exit criteria

- [ ] `tools/atlassian-cli/.env` exists.
- [ ] `JIRA_TOKEN` and `CONFLUENCE_TOKEN` are both set to non-blank, non-placeholder values.
- [ ] The user has confirmed the redacted echo-back before the file was written.
- [ ] env-check is set to `pass`.

## Next

Step 4 — verify-jira.
