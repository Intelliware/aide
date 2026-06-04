# Troubleshooting — setup-atlassian-cli

Reference loaded by Steps 3 and 4 when a connectivity test fails. Work through the relevant section top-to-bottom, one item at a time, waiting for user feedback at each point.

---

## JIRA Troubleshooting

Used by Step 3 when `node bin/atl.js jira search "assignee = currentUser()" --max 1` fails.

### Diagnosis checklist (run in order)

**1. Check the error message type**

| Error message / symptom | Likely cause | Go to |
|---|---|---|
| `401 Unauthorized` | Token is invalid, expired, or wrong type | Step 2 — token format |
| `403 Forbidden` | Token valid but lacks permission | Step 3 — permission |
| `ECONNREFUSED` / `ENOTFOUND` / timeout | Network/VPN issue | Step 4 — network |
| `ECONNRESET` / `socket hang up` | Proxy is intercepting TLS (SSL inspection) | Step 5 — proxy |
| `400 Bad Request` | Request payload malformed | Check token format |

**2. Verify the JIRA token**

- Open `tools/atlassian-cli/.env` and check the value of `JIRA_TOKEN`.
- Confirm it is a PAT (Personal Access Token), **not** an API key or your password.
- PATs from `track.td.com` are alphanumeric strings, typically 20–40 characters long. They do not contain spaces.
- If the token looks wrong or you are unsure, regenerate it:
  1. Navigate to: https://track.td.com/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens
  2. Click "Create token". Give it a name (e.g. "Copilot CLI"). Copy the value immediately — it is only shown once.
  3. Update `JIRA_TOKEN` in `.env` with the new value.
  4. Re-run Step 3's connectivity test.

**3. Verify JIRA token permissions**

- The PAT must have at least `read` access to JIRA projects.
- When creating the token at `track.td.com`, ensure it is not restricted to specific projects that exclude the ones you work in.
- If you receive 403 after confirming the token is correct, contact the JIRA administrator to check your project permissions.

**4. Check VPN / network connectivity**

- `track.td.com` is only reachable from inside the TD network or via TD VPN.
- Confirm your VPN is connected. Try opening https://track.td.com in a browser — if the login page does not load, VPN is the issue.
- If you cannot connect to VPN, contact TD IT support.

**5. Check for proxy / SSL inspection issues**

- Some TD network paths use SSL inspection (a corporate proxy that intercepts HTTPS). This can cause Node.js to reject the certificate with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` or similar.
- If this is the issue, the `.npmrc` file in `tools/atlassian-cli/` may need to be updated with `cafile=` or `strict-ssl=false`. Check with your team's infrastructure contact for the correct CA certificate path.

---

## Confluence Troubleshooting

Used by Step 5 when `node bin/atl.js confluence page 3579197259` returns a 401, 403, or network error.

### Diagnosis checklist (run in order)

**1. Check the error message type**

| Error message / symptom | Likely cause | Go to |
|---|---|---|
| `401 Unauthorized` | Confluence token invalid or expired | Step 2 — token |
| `403 Forbidden` | Token valid but user lacks Confluence access | Step 3 — permission |
| `ECONNREFUSED` / `ENOTFOUND` / timeout | Network/VPN issue | Step 4 — network |
| `ECONNRESET` / SSL error | Proxy / SSL inspection | Step 5 — proxy |

**2. Verify the Confluence token**

- Open `tools/atlassian-cli/.env` and check the value of `CONFLUENCE_TOKEN`.
- This is a **separate** token from your JIRA token. It is generated on Confluence, not on JIRA.
- If the token looks wrong or you suspect it is expired, regenerate it:
  1. Navigate to: https://collaborate.td.com/plugins/personalaccesstokens/usertokens.action
  2. Click "Create token". Give it a name (e.g. "Copilot CLI"). Copy the value immediately — it is only shown once.
  3. Update `CONFLUENCE_TOKEN` in `.env` with the new value.
  4. Re-run Step 4's connectivity test.

**3. Verify Confluence access**

- Confirm you can log into https://collaborate.td.com in a browser.
- If you can log in but still get 403, your account may not have global Confluence access. Contact your team's Confluence space administrator.

**4. Check VPN / network connectivity**

- `collaborate.td.com` is only reachable from inside the TD network or via TD VPN.
- Confirm VPN is connected and try opening https://collaborate.td.com in a browser.
- If the page does not load, VPN is the issue — contact TD IT support.

**5. Check for proxy / SSL inspection issues**

- Same as JIRA (see JIRA troubleshooting Step 5 above). The same SSL inspection issue can affect both services.

---

## Verifying a token manually (browser test)

If you want to confirm a token is valid without using the CLI, you can test it directly in your browser's developer console or via a curl-equivalent request.

For JIRA — open a browser and navigate to:
```
https://track.td.com/rest/api/2/myself
```
You should be prompted to log in or, if already logged in with the same session, see a JSON response with your user details. If the PAT is used as a Bearer token, the CLI handles this automatically.

For Confluence — open:
```
https://collaborate.td.com/rest/api/content?limit=1
```
A 200 response with JSON confirms Confluence is reachable and your session is authenticated.
