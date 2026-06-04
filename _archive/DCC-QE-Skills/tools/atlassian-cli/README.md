# Atlassian CLI (`atl`)

CLI for caching Jira issues and Confluence pages as JSON/Markdown for agent-driven analysis, with additional auth, search, dependency, attachment, and update helpers.

## Setup

```bash
cd tools/atlassian-cli
cp .env.example .env
npm install
```

Populate `.env` with the tokens you need:
- `JIRA_URL` and `JIRA_TOKEN`
- `JIRA_TOKEN` or `ATLASSIAN_TOKEN`
- `CONFLUENCE_URL` and `CONFLUENCE_TOKEN`
- `CONFLUENCE_TOKEN` or `ATLASSIAN_TOKEN`

Or run the interactive setup wizard:

```bash
npm run setup
```

## Common commands

```bash
# Run from tools/atlassian-cli/
node bin/atl.js --help
node bin/atl.js auth status
node bin/atl.js cache status

# Jira
node bin/atl.js jira issue RMBJTDBC-18001
node bin/atl.js jira issue RMBJTDBC-18001 --fresh
node bin/atl.js jira search "project = RMBJTDBC ORDER BY updated DESC"
node bin/atl.js jira related RMBJTDBC-18001
node bin/atl.js jira deps RMBJTDBC-18001
node bin/atl.js jira url https://track.td.com/browse/RMBJTDBC-18001

# Confluence
node bin/atl.js confluence page 2787036396
node bin/atl.js confluence page 2787036396 --with-jira
node bin/atl.js confluence tree 2787036396
node bin/atl.js confluence refresh-jira 2787036396
node bin/atl.js confluence url https://collaborate.td.com/spaces/CBAWBBB/pages/2787036396/TDBC+-+Outgoing+Wires+Payment+MVP2+DISCOVERY
```

Additional write-capable commands are also available via `jira create`, `jira update`, `jira transition`, `jira attach`, `confluence create`, `confluence update`, and `confluence attach`.

## Output

All fetched data is cached locally under `./cache/` (configurable via `OUTPUT_DIR`):
- `cache/jira/<PROJECT>/<KEY>/` — issue JSON, `.meta.json`, `.analysis.md`
- `cache/confluence/<SPACE>/<PAGE-ID>-<TITLE>/` — page JSON, `.meta.json`, `.analysis.md`
- `cache/confluence/<SPACE>/<PAGE-ID>-<TITLE>/.tree.json` — page tree metadata for `confluence tree`

## Field mappings

The tool now keeps only the project-specific mapping for `RMBJTDBC` under:
- `src/field-mappings/RMBJTDBC/fields.json`

That mapping is derived from real Jira field metadata and is used when generating markdown sections such as `Acceptance Criteria`.
