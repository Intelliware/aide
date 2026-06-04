# Frequently Asked Questions (FAQ)

> Common questions and answers about the Atlassian CLI

---

## Installation

### Q: Do I need to install the CLI globally?

**A:** Yes, run `npm link` from the atlassian-cli directory to make the `atl` command available globally. This lets you run commands from any directory.

### Q: What Node.js version is required?

**A:** Node.js 14.0.0 or higher is required. Run `node --version` to check your version.

### Q: I get "atl: command not found" - what's wrong?

**A:** Try these steps:
1. Run `npm link` again from the tools/atlassian-cli directory
2. Check if npm global bin is in your PATH: `npm config get prefix`
3. Add `{prefix}/bin` to your PATH if needed

---

## Authentication

### Q: Where do I get my Personal Access Token?

**A:** 
- **Jira**: Go to https://jira.example.com → Profile → Personal Access Tokens
- **Confluence**: Go to https://confluence.example.com → Profile → Personal Access Tokens

### Q: Can I use the same token for Jira and Confluence?

**A:** Yes, if your PAT has permissions for both. Set `ATLASSIAN_TOKEN` in your .env file and it will be used for both services.

### Q: My token stopped working - what happened?

**A:** Tokens can expire or be revoked. Check:
1. Run `atl auth status` to diagnose
2. Verify the token is still valid in your Atlassian settings
3. Generate a new token if needed

---

## Usage

### Q: What's the difference between `atl j` and `atl jira`?

**A:** They're the same! `j` is a short alias for `jira`. Similarly, `c` is an alias for `confluence`.

### Q: How do I fetch fresh data ignoring cache?

**A:** Add the `--fresh` flag:
```bash
atl j issue PROJ-123 --fresh
atl c page 12345 --fresh
```

### Q: How do I find a Confluence page ID?

**A:** The page ID is in the URL:
- `https://confluence.example.com/pages/viewpage.action?pageId=12345678` → ID is `12345678`
- `https://confluence.example.com/spaces/SPACE/pages/12345678/Title` → ID is `12345678`

### Q: Can I search for issues?

**A:** Yes, use JQL queries:
```bash
atl j search "project = CEAJ AND status = 'In Progress'"
```

---

## Caching

### Q: Where are cached files stored?

**A:** By default, files are stored in `cache/` relative to your workspace root:
- Jira issues: `cache/jira/{PROJECT}/{ISSUE-KEY}/`
- Confluence pages: `cache/confluence/{SPACE}/{PAGE-ID}/`

Configurable via `OUTPUT_DIR` in `.env`.

### Q: How do I clear the cache?

**A:**
```bash
atl cache clear              # Clear all
atl cache clear --jira       # Clear Jira cache only
atl cache clear --confluence # Clear Confluence cache only
```

### Q: How long is data cached?

**A:** By default, data is cached until you fetch with `--fresh`. The metadata file tracks when it was fetched.

---

## Troubleshooting

### Q: I'm getting rate limit errors

**A:** Atlassian APIs have rate limits. Try:
1. Avoid using `--fresh` too frequently
2. Use cached data when possible
3. Wait a few minutes between large batch operations

### Q: I'm behind a corporate firewall/VPN

**A:** Ensure your firewall allows connections to:
- `jira.example.com` (Jira)
- `confluence.example.com` (Confluence)

### Q: Commands hang or timeout

**A:** This might be a network issue. Try:
1. Check your internet connection
2. Verify URLs in your .env are correct
3. Test with `curl https://jira.example.com/rest/api/2/serverInfo`

---

## Integration

### Q: Can I use this with AI agents?

**A:** Yes! Skills are provided for GitHub Copilot. See [AI-INTEGRATION.md](../AI-INTEGRATION.md) for details.

### Q: Can I pipe output to other tools?

**A:** Yes, the CLI outputs clean text suitable for piping:
```bash
atl j issue PROJ-123 | grep "Status"
```

---

**Still have questions?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or open an issue.
