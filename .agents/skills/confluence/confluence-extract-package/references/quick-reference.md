# Confluence Extract Package - Quick Reference

## ✅ Core Principle

**CLI tools / skills write only raw JSON to cache. The agent reads the cache and authors all markdown files.**

Never use any CLI command to generate markdown. Use `confluence-fetch` and `jira-get` (or direct `atl` commands) only to populate the cache.

---

## 🎯 Output Location Decision

The recommended default depends on **Step 1b** — whether a related Jira Feature package is found.

| Situation | Recommended Output |
|---|---|
| Linked Jira Feature package exists | Link into `documentation/requirements-package/{KEY}-{slug}/links/` ✅ |
| No related Jira package | `drafts/{page-title-slug}/` |
| User specifies requirements source | `documentation/requirements-package/{page-title-slug}/` |

Always prompt the user — do not silently pick the default.

---

## 📂 Output Structure (v2)

```text
{output-root}/{page-title-slug}/
├── README.md                                 ← TOC + links checklist
├── sources/
│   └── confluence/
│       └── {page-title-slug}.md              ← root page content (agent-authored)
└── links/
    ├── {linked-page-slug}.md                 ← one MD per linked Confluence page
    ├── {ISSUE_KEY}-{slug}.md                 ← one MD per referenced Jira issue
    └── ...
```

Cache (written by skills — never by the agent):
```text
cache/confluence/{SPACE}/{PAGE_ID}/{PAGE_ID}.json     ← full page JSON
cache/confluence/{SPACE}/{PAGE_ID}/.meta.json         ← title, space, version, URL, fetched_at
cache/confluence/{SPACE}/{PAGE_ID}/.jira.json         ← Jira enrichment
cache/jira/{PROJECT}/{ISSUE_KEY}/{ISSUE_KEY}.json     ← Jira issue JSON
cache/jira/{PROJECT}/{ISSUE_KEY}/.meta.json           ← updated, fetched_at
```

---

## 🖥️ Cache Commands

All commands below use the direct `atl` form. If `atl` is not on PATH, prefix with `cd tools && npm run atl --` (probe once per session: `atl --version` — if exit code 0, use `atl` directly).

| Action | Skill Invocation | Direct CLI |
|--------|-----------------|------------|
| **Fetch root page + Jira** | `confluence-fetch: page {ID} --with-jira` | `atl c page {ID} --with-jira` |
| **Lightweight version check** | `confluence-fetch: page {ID} --fields=version` | `atl c page {ID} --fields=version` |
| **Force fresh page** | `confluence-fetch: page {ID} --fresh` | `atl c page {ID} --fresh` |
| **Fetch linked page** | `confluence-fetch: page {LINKED_ID}` | `atl c page {LINKED_ID}` |
| **Search by title** | `confluence-fetch: search "{TITLE}" --space {KEY}` | `atl c search "{TITLE}" --space {KEY}` |
| **Fetch Jira issue** | `jira-get: issue {ISSUE_KEY}` | `atl j issue {ISSUE_KEY}` |
| **Lightweight Jira check** | `jira-get: issue {KEY} --fields=updated` | `atl j issue {KEY} --fields=updated` |
| **Force fresh Jira** | `jira-get: issue {KEY} --fresh` | `atl j issue {KEY} --fresh` |

**Fallback** (when `atl` is not on PATH) — prefix all `atl` commands with:
```bash
cd tools && npm run atl --
```

---

## 🔄 Cache Freshness Check

Runs automatically on **every execution** for all `[x]` items in the links checklist.

### Confluence pages
```
1. Read cache/confluence/{SPACE}/{ID}/.meta.json
   → cached_version = meta.version.number

2. confluence-fetch: page {ID} --fields=version
   → remote_version = response.version.number

3. IF remote_version > cached_version  → STALE  → confluence-fetch: page {ID} --fresh
   ELSE                                → CURRENT → skip
```

### Jira issues
```
1. Read cache/jira/{PROJECT}/{KEY}/.meta.json
   → cached_updated = meta.updated

2. jira-get: issue {KEY} --fields=updated
   → remote_updated = response.fields.updated

3. IF remote_updated > cached_updated  → STALE  → jira-get: issue {KEY} --fresh
   ELSE                                → CURRENT → skip
```

**Fallback** (if `--fields=` flag unsupported): run full `--fresh` fetch; compare returned timestamp vs cached; discard if unchanged.

**Scope:**
- ✅ Root Confluence page
- ✅ All `[x]` linked Confluence pages
- ✅ All `[x]` referenced Jira issues
- ⏭ `[ ]` pending items — no cache to compare, skip

---

## 📦 Package Update Report

Always printed at the end of every run.

```
📦 Package Update Report — {page-title-slug}
Run completed: 2026-04-29T14:32:00Z

✅ Refreshed (remote was updated since last cache):
  • Confluence 123456789 — "Arrival Ready Overview"  version 8 → 12 — re-authored sources/confluence/{slug}.md
  • Jira PROJ-123        updated 2026-04-28 → re-authored links/PROJ-123-user-onboarding-feature.md

⏭ No changes (cache is current):
  • Confluence 987654321 — "Background Policy"  version 4 — unchanged
  • Jira ABC-999         last updated 2026-03-15 — unchanged

⬜ Pending (not yet fetched):
  • Confluence 111222333 — "Integration Spec" — not yet fetched
  • Jira XYZ-6111   — not yet fetched

⚠ Errors:
  • Confluence 999888777 — fetch failed: 403 Forbidden
```

---

## 📊 Links Checklist Semantics

| Marker | Meaning | Action |
|--------|---------|--------|
| `[x]` | Item in cache **and** `links/` file authored | Run freshness check on re-run |
| `[ ]` | Identified but not yet fetched/authored | Evaluate fetch/skip heuristic |
| `⏸ skipped` | Intentionally deferred | Note reason inline (e.g., `403 Forbidden`) |

---

## 📝 Common Scenarios

### Scenario 1: First extraction — Confluence page linked to an existing Jira Feature package
```
1. confluence-fetch: page 123456789 --with-jira
2. Read .meta.json → derive {page-title-slug}
3. Step 1b: Read .jira.json → find Feature PROJ-123 → check documentation/requirements-package/PROJ-123-*/
4. Package found → prompt user (recommended: link into existing package)
5. User confirms option 1 → author links/123456789-{slug}.md inside the Jira package
6. Update that package's README.md checklist
7. Print Package Update Report
```

### Scenario 2: First extraction — no related Jira package
```
1. confluence-fetch: page 123456789 --with-jira
2. Read .meta.json → derive {page-title-slug}
3. Step 1b: .jira.json has no Feature, or no matching package found
4. Prompt user (default: drafts/{slug}/)
5. Create folder structure: sources/confluence/ and links/
6. Author sources/confluence/{slug}.md from cache
7. Create README.md with links checklist
8. For each L0 link — freshness check (MISSING → fetch; STALE → re-fetch; CURRENT → skip)
9. Author links/{linked-slug}.md per fetched item
10. Print Package Update Report
```

### Scenario 3: Re-run on existing package
```
1. Detect package folder already exists
2. Read README.md → collect all [x] items
3. Freshness check on root + all [x] items:
   confluence-fetch: page {ID} --fields=version  →  compare version
   jira-get: issue {KEY} --fields=updated         →  compare updated
4. STALE → re-fetch full content → re-author markdown file
5. CURRENT → skip
6. Update README.md checklist
7. Print Package Update Report
```

### Scenario 4: Large page — many links
```
1. After extracting L0 links, count total (Confluence + Jira)
2. If > 20: show full inventory table to user
3. Ask: "This page has {N} links. Fetch all, or only specific ones?"
4. Fetch only confirmed items; mark others ⏸ skipped — user deferred
```

---

## ❌ What NOT to Do

```bash
# ❌ Don't use CLI to generate markdown
# ❌ Don't re-fetch [x] items without running the freshness check first
# ❌ Don't recursively follow links inside linked pages (L0 only)
# ❌ Don't overwrite sources/confluence/{slug}.md without confirming if manually edited
# ❌ Don't bulk-fetch > 20 links without asking the user first
```

---

## 🔍 Troubleshooting

### Command not found: atl
```bash
which atl  # Linux/Mac
where atl  # Windows
```

### Page ID unknown
```bash
# Search by title in a known space
atl c search "Feature ABC" --space CEAJ
```

### Cache not found for page
```bash
confluence-fetch: page {PAGE_ID} --with-jira
# or direct CLI:
atl c page {PAGE_ID} --with-jira
```

---

## 📚 Related Documentation

- [SKILL.md](../SKILL.md) — Full workflow, step-by-step instructions, and all algorithms
