# Inputs & Outputs — setup-atlassian-cli

## Inputs

This skill is fully interactive and probes the environment itself. No inputs are required before invocation.

| Input | Required | Source | Notes |
|---|---|---|---|
| Workspace root path | No | Inferred from VS Code working directory | All `tools/atlassian-cli/` paths resolve from here |
| `JIRA_TOKEN` | Collected interactively in Step 3 | User-provided | Personal Access Token from `track.td.com` |
| `CONFLUENCE_TOKEN` | Collected interactively in Step 3 | User-provided | Personal Access Token from `collaborate.td.com` |

## Outputs

| Artifact | Path | Format | Produced by |
|---|---|---|---|
| Environment config | `tools/atlassian-cli/.env` | dotenv key=value | Step 2 |
| npm dependencies | `tools/atlassian-cli/node_modules/` | npm install output | Step 1 (if absent) |
| CLI command reference block | Emitted to conversation | Structured markdown | Step 5 |

## Side effects

- `tools/atlassian-cli/.env` is created or modified (Step 2)
- `tools/atlassian-cli/node_modules/` is populated via `npm install` if previously absent (Step 1)
- `tools/atlassian-cli/cache/` may receive entries from the connectivity test calls in Steps 3–4

## Validation rules

- `JIRA_TOKEN` and `CONFLUENCE_TOKEN` must be non-blank (Step 3 sub-step 6); full validation happens via live API calls in Steps 4–5
- `JIRA_URL` and `CONFLUENCE_URL` are preserved from `.env.example` defaults and must not be overwritten with custom values
- The `.env` file must not be written before the user confirms the redacted echo-back (Step 2 hard gate)
