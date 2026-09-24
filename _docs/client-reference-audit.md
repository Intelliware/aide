# Client-reference audit — A.I.D.E. repository

**Scanned:** 2026-09-24 against `main` (`d61c5eb`)
**Remediation branch:** `chore/remove-client-references`, based on `main`
**Scope:** entire working tree excluding `.git/`
**Purpose:** locate references to a named client (a Canadian bank, referred to below by the two-letter initials that appear in the source) so they can be replaced with neutral placeholders before the framework is shared or distributed further.

> **Handling note.** This document necessarily quotes the strings being removed, so it is itself client-identifying. Delete it once remediation is complete, rather than leaving it in the repo as a permanent record.

---

## Remediation status — 2026-09-24

| Item | Status |
|---|---|
| `_archive/DCC-QE-Skills/` deleted (97 files) | ✅ Done |
| `README.md` — 5 slug references | ✅ Done — now point at the Azure DevOps remote |
| `.env.example` — SharePoint host | ✅ Done — `SHAREPOINT (on-premises)` / `<SHAREPOINT_HOST>` |
| `testability-classification.md` — client vocabulary | ✅ Done |
| `reuse-analysis.md` — toolkit attribution | ✅ Done |
| `audit-quality-coverage/references/OVERVIEW.md` | ✅ Done |
| `review-test-failures/references/OVERVIEW.md` | ✅ Done |
| `_docs/model2-aide-demo-storyboard.md` — audience attribution | ✅ Done |
| `_docs/qe-analysis-3-methods.md` — repo names, vocabulary, root path | ✅ Done — 16 replacements |
| `INSTRUCTIONS.md` — 4 slug references | ⏸️ **Deferred** — see the branch-conflict warning below |
| Bare `DCC` / `DCC-QE` as a method label | ⏸️ **Open decision** — see below |
| Dangling references to the deleted folder | ⏸️ **Open** — 3 paths, see below |

`scripts/validate.py` passes with 0 errors after these changes (5 pre-existing line-count warnings, unrelated).

**On the `README.md` replacement:** the report originally recommended a neutral `<org>/<repo>` placeholder. Instead these now name the real Azure DevOps remote, `https://dev.azure.com/IntelliwareDev/AI_Knowledge_Repo/_git/AIDE`. `IntelliwareDev` is our own organisation, so it is not client-identifying, and it is the repository's actual source — which makes the install prompts correct as well as de-branded. A placeholder is still the right choice for the *GitHub provider* default in `INSTRUCTIONS.md`, where no real GitHub mirror should be assumed.

### Open decision — bare `DCC` / `DCC-QE`

`DCC-QE` is used throughout as the *label* for the now-deleted toolkit, separate from the `BB-DCC-QE` repo name that has already been replaced. If `DCC` is a client business-unit abbreviation, these are client-identifying and should go too. Remaining locations:

| File | Count | Notes |
|---|---|---|
| `_docs/qe-analysis-3-methods.md` | 34 | The merge-analysis document; `DCC-QE` is one of the three compared methods |
| `_archive/qe-stage-pre-merge/README.md` | 7 | Archive note explaining what was ported |
| `CHANGELOG.md` | 1 | Line 555 — a historical release entry |
| `_docs/qe-3-method.drawio` | 1 | Diagram node label |

Active framework files have already been cleared of `DCC`, so nothing client-identifying ships today. Renaming the label in `CHANGELOG.md` means editing a historical record, which is a judgement call worth making deliberately.

### Open — dangling references to the deleted folder

Three paths now point at `_archive/DCC-QE-Skills/`, which no longer exists:

- `_archive/qe-stage-pre-merge/README.md:18`
- `_docs/qe-analysis-3-methods.md:11`
- `_docs/qe-analysis-3-methods.md:85`

These want a note that the material was removed, rather than a path fix.

---

## Summary

| Measure | Result |
|---|---|
| Total matching lines | 121 across 37 files |
| Active framework (excluding `_archive/` and this report) | **19 lines across 6 files** |
| `_archive/` (tracked by git, 582 files) | 102 lines across 31 files |
| Real credentials, tokens or keys found | **None.** `.env.example` contains placeholders only. |
| PII found | None |

No credential rotation is required. The exposure is contractual and reputational — a named client is associated with a delivery framework — not a security incident.

---

## Tier 1 — Active framework (fix first)

Line numbers are **as of `main`**. See the branch-conflict warning under *Remediation constraints* — `INSTRUCTIONS.md` has different line numbers on the `installation_instructions` branch.

| File | Lines (on `main`) | Finding |
|---|---|---|
| `INSTRUCTIONS.md` | 7, 17, 338, 397 | Client GitHub org/repo slug `TD-Universe/TD-EM-AIDE` used as the **default** `AIDE_SOURCE_URL`: in the one-line invocation prompt (7), the input table (17), the provenance example (338), and the machine-readable manifest (397) |
| `README.md` | 58, 66, 74, 84, 90 | Same slug in the install prompt, the input table, the local-clone example, and both update prompts |
| `.env.example` | 38, 40 | Client's internal SharePoint host — `SHAREPOINT (TD Internal)` and `myteam.td.com` |
| `.agents/skills/quality/create-quality-package/references/testability-classification.md` | 149 | `"in TD-team-specific L1–L4 layer vocabulary"` — ships inside the framework's skill references |

**Why `INSTRUCTIONS.md` and `README.md` are the priority.** These are not passing mentions. The slug is the value a customer receives by default when they select the GitHub source provider, so it is both client-identifying *and* factually wrong — the repository's canonical home is the Azure DevOps remote `IntelliwareDev/AI_Knowledge_Repo/AIDE`. Fixing this corrects a defect as well as a disclosure.

## Tier 2 — Internal documentation

| File | Lines | Finding |
|---|---|---|
| `_docs/qe-analysis-3-methods.md` | 96, 132, 136, 237 | Client knowledge-base and repo names — `TDBC-knowledge-base/...`, `BB-DCC-QE/...` |
| `_docs/qe-analysis-3-methods.md` | 138 | `"Layer vocabulary (L1/L2/L3/L4) is TD-specific"` |
| `_docs/qe-analysis-3-methods.md` | 511 | `"Paths are repo-relative (root = TD-EM-AIDE/)"` |
| `_docs/model2-aide-demo-storyboard.md` | 13 | Names the demo audience as a stakeholder at the client |

## Tier 3 — `_archive/` (largest concentration)

`_archive/DCC-QE-Skills/` accounts for nearly all of the 102 archived matches. It is tracked by git, so it is distributed with the repository.

| Finding | Approximate scale |
|---|---|
| Client internal Jira and Confluence hostnames (`track.td.com`, `collaborate.td.com`) | ~25 lines across skill text, troubleshooting references, and CLI source |
| `tools/atlassian-cli/package.json` repository URL pointing at a second client org repo (`TD-Universe/TDBC-Skills`) | 1 line |
| Jira field-mapping directory named after a client project key (`src/field-mappings/RMBJTDBC/`) | directory name + `fields.json` contents |
| Skill text describing the client's internal Node install process, service portal, VPN, and IT support | ~15 lines |
| The directory name `DCC-QE-Skills` itself | — |

Also present: `TDBC` appears in ~15 files under `_archive/DCC-QE-Skills/.agents/skills/qe/` and `tools/`.

---

## Recommended replacements

| Current | Replace with | Rationale |
|---|---|---|
| `https://github.com/TD-Universe/TD-EM-AIDE` | `https://github.com/<org>/<repo>` | A placeholder the user must supply. Do not substitute another real URL — the canonical source is the Azure DevOps remote. |
| `file:///c:/Users/me/repos/TD-EM-AIDE` (`README.md:74`) | `file:///c:/Users/me/repos/AIDE` | Example path only |
| `Paths are repo-relative (root = TD-EM-AIDE/)` | `root = AIDE/` | — |
| `SHAREPOINT (TD Internal)` / `myteam.td.com` | `SHAREPOINT (on-premises)` / `<SHAREPOINT_HOST>` | Matches the placeholder style already used for tokens in that file |
| `TD-team-specific` / `TD-specific` | `client-specific` or `team-specific` | Preserves the meaning exactly |
| `a TD (regulated-bank) stakeholder` | `a regulated-bank stakeholder` | Keeps the useful audience context, drops the attribution |
| `TDBC-knowledge-base/`, `BB-DCC-QE/` | `<kb-repo>/`, `<qe-repo>/` | Illustrative paths in analysis prose |
| `track.td.com`, `collaborate.td.com` | `<JIRA_HOST>`, `<CONFLUENCE_HOST>` | Only if `_archive/DCC-QE-Skills/` is retained |
| `src/field-mappings/RMBJTDBC/` | `src/field-mappings/<PROJECT_KEY>/` | Only if retained |

**On `_archive/DCC-QE-Skills/`:** this is archived reference material, not live framework code. Deleting the directory is cheaper and more complete than scrubbing 31 files, and removes the client-coupled directory name at the same time. Scrub only if the material still has reference value.

---

## Do NOT change — confirmed false positives

These match a bare `TD` token but are unrelated to the client. Renaming them would cause harm.

| Pattern | Location | What it actually is |
|---|---|---|
| `TD-001` … `TD-NNN` | `_archive/model-2-sdlc-skills/solution-package/solution-discovery/references/technical-debt-assessment.md` | **Technical Debt** item IDs |
| `TD-01` … `TD-08` | `test-data-management.md` (4 copies under `_archive/model-2-sdlc-skills/`) | **Test Data** standard IDs |
| `flowchart TD`, `graph TD` | 3 files under `_archive/model-2-sdlc-skills/requirement-package/` | Mermaid **top-down** diagram direction |
| `CICS TD queue`, `WRITEQ TD` | `templates/blocks/reverse-eng/cobol-program/consumer/called-subprograms-and-side-effects.md:45,51` | CICS **Transient Data** — genuine mainframe terminology. Renaming would break the COBOL reverse-engineering template. |

---

## Verification

Re-run the scan after remediation:

```bash
# Active framework only — should return nothing after Tier 1 and 2 are fixed
rg -n --hidden --glob '!.git/**' --glob '!_archive/**' \
  'TD[ -]?Bank|TD-Universe|TD-EM-AIDE|TDBC|RMBJTDBC|\.td\.com|TD-specific|TD-team|TD Internal|TD Enterprise|TD network|TD-approved' .

# Whole tree, including archive
rg -c --hidden --glob '!.git/**' \
  'TD[ -]?Bank|TD-Universe|TD-EM-AIDE|TDBC|RMBJTDBC|\.td\.com|TD-specific|TD-team|TD Internal' . \
  | sort -t: -k2 -rn
```

A bare `\bTD\b` search is not useful on its own — it returns the false positives in the table above plus every occurrence of `TDD`.

---

## Remediation constraints

- **Git history retains the strings.** Replacing them in the working tree fixes everything distributed from that point forward, but the values remain in prior commits. Removing them from history requires a rewrite and a force push. Recommendation: fix forward and accept the history.

### ⚠️ `INSTRUCTIONS.md` will conflict with PR 2321

`INSTRUCTIONS.md` is being rewritten wholesale on the `installation_instructions` branch (PR 2321 — roughly +1289/−153 lines). The two branches see different content:

| | `main` | `installation_instructions` |
|---|---|---|
| Occurrences of the slug | 4 (lines 7, 17, 338, 397) | 2 (lines 35, 684) |

Editing `INSTRUCTIONS.md` on this `main`-based branch is therefore **near-certain to conflict** when PR 2321 merges. Three options, in order of preference:

1. **Fix `INSTRUCTIONS.md` on `installation_instructions` instead** and leave it out of this branch. Two spots there rather than four, no conflict, and it merges with work already in review.
2. **Wait for PR 2321 to merge**, then rebase this branch onto the new `main` and fix the remaining two occurrences.
3. **Fix it here anyway** and resolve the conflict manually at merge time. Only worth it if this branch must land first.

The other five files (`README.md`, `.env.example`, `testability-classification.md`, and both `_docs/` files) are **identical on `main` and on `installation_instructions`**, so they can be fixed on this branch safely under any of the three options.

- **No dependency on the Claude host-support work** (`_docs/claude-host-support-plan.md`, on branch `feat/claude-host-support`). That effort also touches `INSTRUCTIONS.md` and `README.md`, but not these lines.
