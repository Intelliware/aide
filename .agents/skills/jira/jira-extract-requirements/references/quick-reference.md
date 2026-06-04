# Jira Extract Requirements - Quick Reference

## ✅ Core Principle

**CLI tools write only raw JSON to cache. The agent reads the cache and authors all markdown files.**

Never use `atl j deps --out` or any CLI command to generate markdown. Use `jira-get` (or direct `atl` commands) only to populate the cache.

---

## 🎯 Output Location Decision

| Issue Type | Default Output | Options |
|------------|---------------|----------|
| **Feature** | `documentation/requirements-package/{KEY}-{slug}/` | requirements-package, drafts, or link into existing package |
| **Any other type** | `drafts/{KEY}-{slug}/` | requirements-package, drafts, or link into existing package |

Always prompt the user — do not silently pick the default.

---

## 📂 Output Structure (v2)

```text
{output-root}/{ISSUE_KEY}-{title-slug}/
├── README.md                         ← TOC + links checklist
├── sources/
│   └── jira/
│       └── {ISSUE_KEY}-{title-slug}.md   ← root issue content (agent-authored)
└── links/
    ├── {CHILD_KEY}-{child-slug}.md   ← one MD per child/linked issue (agent-authored)
    └── {LINKED_KEY}-{linked-slug}.md
```

---

## 🖥️ Cache Commands

All commands below use the direct `atl` form. If `atl` is not on PATH, prefix with `cd tools && npm run atl --` (probe once per session: `atl --version` — if exit code 0, use `atl` directly).

| Action | Skill Invocation | Direct CLI |
|--------|-----------------|------------|
| **Fetch root + related** | `jira-get: related <ISSUE_KEY>` | `atl j related <ISSUE_KEY>` |
| **Fetch one issue** | `jira-get: issue <ISSUE_KEY>` | `atl j issue <ISSUE_KEY>` |
| **Lightweight timestamp check** | `jira-get: issue <KEY> --fields=updated` | `atl j issue <KEY> --fields=updated` |
| **Force fresh root** | `jira-get: related <ISSUE_KEY> --fresh` | `atl j related <ISSUE_KEY> --fresh` |
| **Force fresh dep** | `jira-get: issue <DEP_KEY> --fresh` | `atl j issue <DEP_KEY> --fresh` |
| **List attachments** | — | `atl j attachments <KEY> --list-only` |
| **Download attachments** | — | `atl j attachments <KEY>` |
| **Re-download attachments** | — | `atl j attachments <KEY> --fresh` |

**Fallback** (when `atl` is not on PATH) — prefix all `atl` commands with:
```bash
cd tools && npm run atl --
```

---

## 🔄 Cache Freshness Check

Runs automatically on **every execution** (first extraction and re-runs) for all `[x]` items in the checklist.

```
For each cached item (root + [x] links):

  1. Read cache/jira/{PROJECT}/{KEY}/.meta.json
     → cached_updated = meta.updated

  2. jira-get: issue {KEY} --fields=updated
     → remote_updated = response.fields.updated

  3. IF remote_updated > cached_updated  → STALE  → jira-get: issue {KEY} --fresh
     ELSE                                → CURRENT → skip
```

**Fallback** (if `--fields=updated` is unsupported): run full `--fresh` fetch; compare returned `updated` field against cached; discard if unchanged.

**Scope:**
- ✅ Root issue
- ✅ All `[x]` link items
- ✅ Any Confluence pages associated with the package (delegate to `confluence-fetch: page {ID} --fields=version`)
- ⏭ `[ ]` pending items — no cache to compare, skip

---

## 📦 Package Update Report

Always printed at the end of every run.

```
📦 Package Update Report — PROJ-123-user-onboarding-feature
Run completed: 2026-04-29T14:32:00Z

✅ Refreshed (remote was updated since last cache):
  • PROJ-123   updated 2026-04-28 → re-authored sources/jira/PROJ-123-user-onboarding-feature.md
  • PROJ-201 updated 2026-04-27 → re-authored links/PROJ-201-page-update-page-update.md

⏭ No changes (cache is current):
  • XYZ-6111  last updated 2026-04-10 — unchanged

⬜ Pending (not yet fetched):
  • DEF-100  — To Do — not yet extracted

⚠ Errors:
  • JKL-88  — fetch failed: 403 Forbidden
```

---

## 📊 Links Checklist Semantics

| Marker | Meaning | Action |
|--------|---------|--------|
| `[x]` | Issue in cache **and** `links/{KEY}.md` authored | Skip unless refresh requested |
| `[ ]` | Not yet fetched or not yet authored | Evaluate fetch/skip heuristic |
| `⏸ skipped` | Intentionally deferred | Note reason inline |

### Fetch / Skip Heuristics

**Fetch when:**
- child item of the root issue
- status is active (`To Do`, `Selected for Development`, `In Progress`, `Blocked`)
- title suggests requirement, implementation, integration, risk, or compliance content
- relationship is stronger than a generic `Relates`

**Usually skip when:**
- issue is terminal (`Done`, `Closed`, `Cancelled`) with no requirement relevance
- administrative ticket with no delivery impact
- weak `Relates` link with no scope signal

---

## 📄 File Content Summary

### `sources/jira/{KEY}-{slug}.md` (root issue)
```markdown
---
source: jira
issue_key: PROJ-123
issue_type: Feature
status: In Progress
---
# PROJ-123 — {TITLE}
## Metadata | Summary | Acceptance Criteria | Description | Comments | Child Items
```

### `links/{DEP_KEY}-{slug}.md` (per linked/child issue)
```markdown
---
source: jira
issue_key: PROJ-201
relationship: child
parent: PROJ-123
---
# PROJ-201 — {TITLE}
## Why This Matters | Issue Content | Relationship to Parent | Open Questions
```

### `README.md`
```markdown
# {TITLE} — Requirements Package
## Contents | Links Checklist
- [x] [XYZ-6111 ...](./links/XYZ-6111-slug.md) — ✅ fetched and authored
- [ ] PROJ-201 — To Do — not yet fetched
```

---

## 📝 Common Scenarios

### Scenario 1: First extraction (Feature type)
```
1. jira-get: related PROJ-123
2. Read cache → detect type = Feature
3. Run freshness check on root (lightweight --fields=updated)
4. Prompt user → user confirms documentation/requirements-package/
5. Create folder structure
6. Author sources/jira/PROJ-123-user-onboarding-feature.md from cache
7. For each key child/linked issue: jira-get: issue {KEY} → author links/{KEY}-{slug}.md
8. Write README.md with checklist
9. Print Package Update Report
```

### Scenario 2: Re-run on existing package (staleness-driven refresh)
```
1. Detect package folder already exists
2. Read README.md → collect all [x] items
3. For root + each [x] item:
   jira-get: issue {KEY} --fields=updated
   Compare remote_updated vs cached .meta.json updated
   STALE  → jira-get: issue {KEY} --fresh → re-author markdown file
   CURRENT → skip
4. Update README.md checklist
5. Print Package Update Report
```

### Scenario 3: Pull one unchecked link from the checklist
```
jira-get: issue PROJ-201
Read cache → author links/PROJ-201-page-update-page-update.md
Mark [x] in README.md checklist
```

### Scenario 4: Check attachments before downloading
```bash
# 1. Check if already cached
ls cache/jira/PROJ/PROJ-201/attachments/

# 2. List what's available (no download)
atl j attachments PROJ-201 --list-only

# 3. Download if requirement-bearing (PDF, DOCX, PPTX, XLSX)
atl j attachments PROJ-201

# 4. Agent reads the file and incorporates relevant content into links/{KEY}.md
#    Do NOT auto-convert with pdf-convert or word-convert unless the user asks
```

### Scenario 5: Link into an existing feature package (option 3)
```
1. User says: "link it into PROJ-123-user-onboarding-feature"
2. jira-get: related {ISSUE_KEY}
3. Author documentation/requirements-package/PROJ-123-user-onboarding-feature/links/{KEY}-{slug}.md
4. Update README.md checklist in the target package
5. Do NOT create a separate top-level package folder
```

---

## ❌ What NOT to Do

```bash
# ❌ Don't use CLI to generate markdown files
atl j deps PROJ-123 --out documentation/requirements-package/.../dependencies

# ❌ Don't flatten all content into one giant file
# Use links/{KEY}-{slug}.md per item

# ❌ Don't auto-convert attachments without checking cache first
# ❌ Don't re-fetch [x] items unless the user explicitly asks for --fresh
```

---

## 🔍 Troubleshooting

### Command not found: atl
```bash
which atl  # Linux/Mac
where atl  # Windows
```

### Cache not found
```bash
jira-get: related PROJ-123
# or direct CLI:
atl j related PROJ-123
```

---

## 📚 Related Documentation

- [SKILL.md](../SKILL.md) - Full workflow and dependency rules
