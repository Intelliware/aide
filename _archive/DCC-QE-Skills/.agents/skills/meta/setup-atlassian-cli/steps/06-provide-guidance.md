---
slug: provide-guidance
sequence: 6
depends-on-prior: false
---

# Step 6 — Provide AI context guidance

Always runs as the final step. Emits a structured CLI reference block that gives the AI agent (and the user) a clear, copy-paste-ready reference for using the atlassian-cli in all subsequent work.

## Purpose

Other skills that depend on Atlassian CLI need to know exactly how to invoke it. This step emits a canonical reference block into the conversation so it is available in context. It also serves as the completion confirmation of the entire setup skill.

## Sub-steps (run in order)

1. Tell the user: "Setup complete! Here is the CLI reference for future use:"
2. Emit the following guidance block verbatim into the conversation:

---

## Atlassian CLI — Reference Guide

**Working directory:** All commands must be run from `tools/atlassian-cli/`

**General flags:**
- `--fresh` — bypass the local cache and force a live API request (use on any fetch command)
- `--debug` — enable verbose debug output
- `--silent` — suppress all console output except errors

---

### Get a JIRA issue

```bash
node bin/atl.js jira issue <KEY>
# Example:
node bin/atl.js jira issue CEAJ-1234
```

Output is written to `cache/jira/<PROJECT>/<KEY>/<KEY>.analysis.md` and also returned to stdout as markdown.

To force a fresh fetch (bypass cache):
```bash
node bin/atl.js jira issue CEAJ-1234 --fresh
```

---

### Get a Confluence page

```bash
node bin/atl.js confluence page <pageId>
# Example:
node bin/atl.js confluence page 123456789
```

Output is written to `cache/confluence/<SPACE>/<PAGE-ID>-<TITLE>/<PAGE-ID>.analysis.md` and also returned to stdout.

To fetch by full URL:
```bash
node bin/atl.js confluence url "https://collaborate.td.com/display/SPACE/Page+Title"
```

---

### Create a JIRA issue

**Interactive (prompts for fields):**
```bash
node bin/atl.js jira create <PROJECT-KEY>
# Example:
node bin/atl.js jira create CEAJ
```

**Non-interactive (supply fields as JSON):**
```bash
node bin/atl.js jira create <PROJECT-KEY> --data '<json>'
# Example:
node bin/atl.js jira create CEAJ --data '{"fields":{"summary":"My new issue","issuetype":{"name":"Story"},"description":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"Description here"}]}]}}}'
```

---

### Update a JIRA issue

```bash
node bin/atl.js jira update <KEY> --data '<json>'
# Example — update summary and add a label:
node bin/atl.js jira update CEAJ-1234 --data '{"fields":{"summary":"Updated title","labels":["my-label"]}}'
```

To transition an issue to a new status:
```bash
node bin/atl.js jira transition <KEY> -s "<status>"
# Example:
node bin/atl.js jira transition CEAJ-1234 -s "In Progress"
```

---

### Search JIRA issues (JQL)

```bash
node bin/atl.js jira search "<jql>" --max <n>
# Example — find all open stories in CEAJ sprint:
node bin/atl.js jira search "project = CEAJ AND issuetype = Story AND status != Done" --max 20
```

---

### Cache location

All fetched content is cached locally:
```
tools/atlassian-cli/cache/
├── jira/<PROJECT>/<KEY>/
│   ├── <KEY>.json           ← raw API response
│   ├── <KEY>.meta.json      ← fetch metadata
│   └── <KEY>.analysis.md    ← formatted markdown
└── confluence/<SPACE>/<PAGE-ID>-<TITLE>/
    ├── <PAGE-ID>.json
    ├── <PAGE-ID>.meta.json
    └── <PAGE-ID>.analysis.md
```

Use `--fresh` on any command to bypass the cache and fetch directly from the API.

---

3. After emitting the guidance block, tell the user:

   > "The Atlassian CLI is fully set up and verified. You can use the commands above at any time from the `tools/atlassian-cli/` directory. If connectivity ever breaks (expired tokens, VPN issues), re-run `/setup-atlassian-cli` to diagnose and reconfigure."

## Exit criteria

- [ ] The guidance block has been emitted to the conversation.
- [ ] The user has been told setup is complete.

## Next

`<dynamic — return to the invoking skill, or end session if run standalone>`
