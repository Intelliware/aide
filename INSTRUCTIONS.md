# A.I.D.E. — Install Runbook

> **For agents and humans.** This file is the single source of truth for installing A.I.D.E. into a workspace. It is tool-agnostic: any coding agent (GitHub Copilot, Cursor, JetBrains AI Assistant, Claude, etc.) — or a human — can execute it.
>
> **One-line user prompt to any agent:**
>
> > *"Install AIDE from `https://github.com/TD-Universe/TD-EM-AIDE` by following the instructions in its `INSTRUCTIONS.md` file."*

---

## 1. Inputs

Resolve these before starting. Use the defaults unless the user specifies otherwise.

| Variable          | Default                                     | Purpose                                                                           |
|-------------------|---------------------------------------------|-----------------------------------------------------------------------------------|
| `AIDE_SOURCE_URL` | `https://github.com/TD-Universe/TD-EM-AIDE` | Git URL (or local `file://` path) to fetch from. Forks and mirrors are supported. |
| `AIDE_REF`        | `main`                                      | Branch, tag, or commit SHA to check out.                                          |
| `AIDE_TARGET_DIR` | `./AIDE`                                    | Destination directory inside the user's current workspace.                        |

`AIDE_TARGET_DIR` is interpreted relative to the **workspace root** — the directory the user (or the agent's working directory) is currently in.

---

## 2. Preconditions

1. The agent has identified the workspace root (the folder that will contain `AIDE/` as a subdirectory).
2. Network access to `AIDE_SOURCE_URL` is available — **or** the user has provided a local `file://` path.
3. Either `git` is on `PATH`, **or** the agent can download a tarball/zip archive of `AIDE_REF` from the source host.

---

## 3. Steps

### Step 1 — Resolve inputs
Use defaults silently. Only confirm with the user if they explicitly asked to change a value.

### Step 2 — Detect existing install
If `${AIDE_TARGET_DIR}/AGENTS.md` already exists, ask the user once:
- **Overwrite** — proceed (re-copies the mandatory subset; leaves anything else the user added under `AIDE/` untouched), **or**
- **Abort** — stop.

**Update-intent exception.** If the user's original prompt clearly expressed update intent — e.g. it contained words like *update*, *upgrade*, *refresh*, *re-install*, *reinstall*, *sync*, *pull latest*, or *bring AIDE up to date* — treat that as implicit consent to **Overwrite** and skip the confirm prompt. The runbook is fully idempotent (Step 8 sweeps stale shims; Step 9 refreshes the AIDE managed block in `./AGENTS.md`, preserving any hand-authored content outside it; the canonical tree under `${AIDE_TARGET_DIR}/.agents/` is re-copied verbatim in Step 5), so re-running it on an existing install *is* the update path.

### Step 3 — Fetch the source

> **⚠️ READ THIS FIRST — non-negotiable fetch rules.**
>
> 1. **Probe for `git` before doing anything else.** Run `git --version`. If it returns a version, you **MUST** use `git clone` (below). You are **FORBIDDEN** from falling back to HTTP downloads, the GitHub REST API, or any other fetch method while `git` is available — even if your first `git clone` returned an error. Errors get handled by the failure protocol at the end of this step, not by switching tools.
> 2. **Never preflight or probe with HTTP.** Do **not** call `Invoke-WebRequest`, `curl`, `wget`, `gh api`, `https://api.github.com/...`, or `https://raw.githubusercontent.com/...` to "check whether the repo exists", "list branches", "verify the ref", or fetch any file before cloning. GitHub returns **404 (not 401)** to unauthenticated callers on private repos *on purpose* — a 404 from any of those endpoints is **not evidence the repo is missing**, it is evidence you are not authenticated. `git` uses the user's local credential helper (Windows Credential Manager, macOS Keychain, SSH agent, GitHub CLI, corporate SSO) and will succeed where anonymous HTTP fails.
> 3. **Forbidden fetch verbs (do not use any of these for the source repo):**
>    - `Invoke-WebRequest` / `iwr` / `Invoke-RestMethod`
>    - `curl`, `wget`
>    - `gh api`, `gh repo view`
>    - any direct URL on `api.github.com` or `raw.githubusercontent.com`
>
>    The only sanctioned fetch verbs are `git clone` (preferred) and, **only** when `git --version` itself fails, a tarball/zip download of the source archive.

**Step 3a — Probe for git.**

```powershell
git --version
```

If this succeeds → proceed to **Step 3b** (mandatory). If and only if it errors out (`git` not on PATH at all) → skip to **Step 3c**.

**Step 3b — Clone with local `git` (mandatory when `git` is available).**

```
git clone --depth 1 --branch ${AIDE_REF} ${AIDE_SOURCE_URL} <temp-dir>
```

The user's machine almost certainly already has working credentials configured (SSH key, credential helper, GitHub CLI, corporate SSO). Let `git` be the **single source of truth for reachability** — if this command fails, jump to the failure protocol below; do **not** switch to HTTP to "double-check".

**Step 3c — Fallback (only when `git --version` itself failed).**

Download:

```
${AIDE_SOURCE_URL}/archive/refs/heads/${AIDE_REF}.tar.gz   (or .zip)
```

and extract to `<temp-dir>`. This path is anonymous and will 404 on private repos — if it fails, jump to the failure protocol below.

**On failure (any path — 404, 403, auth prompt, network error, unknown ref):**

Do **not** give up and tell the user the repo "cannot be found". GitHub deliberately returns **404 (not 401)** to unauthenticated requests against private repos — so a 404 from `git clone`, a tarball download, or (worse) any of the forbidden HTTP probes above is almost always *"you aren't authenticated"*, not *"the repo doesn't exist"*. Do **not** switch to `Invoke-WebRequest` / `curl` / `api.github.com` to "verify" — those endpoints are *more* restrictive than `git` and will produce the same misleading 404. Instead, surface the real problem and ask the user for one of the following, in this order of preference:

1. **Use a local clone.** Ask the user to clone the repo themselves with their own credentials and re-run the install with `AIDE_SOURCE_URL=file:///absolute/path/to/their/clone`. This is the most reliable path for private, SSO-gated, or enterprise-mirrored repos.
2. **Provide a token-authenticated URL.** Ask the user for a GitHub personal access token (PAT) with `repo` read scope and retry with:
   ```
   https://<token>@github.com/<owner>/<repo>
   ```
   Treat the token as a secret — do not echo it back, do not write it to `.aide-install.json`, and do not log it. Use it only for the single `git clone` / download invocation.
3. **Confirm the ref.** If only the branch/tag is wrong, ask the user for the correct `AIDE_REF` (the default is `main`; forks and feature branches will differ).
4. **Confirm the URL.** If the user passed a fork or mirror, confirm the spelling and the host (e.g. `github.com` vs. an internal GHES instance).

Report exactly which fetch command failed and the underlying error (status code, stderr) so the user can diagnose. Only stop the install once the user has been given these options and declines to provide any of them.

**Step 3d — Drain the terminal before the next step.**

A successful `git clone` of this repo writes thousands of files and produces a large burst of stdout (progress, "Resolving deltas", final summary). On agents that share a persistent shell session between `run_in_terminal` calls, the shell can be idle while the stdout pipe between the shell and the agent loop is still flushing — issuing a trivial follow-up command (`Test-Path`, `git --version`, `ls`) immediately afterwards can time out on the readiness probe even though the command itself would return in milliseconds.

Two safe patterns; prefer the first:

1. **Chain in the same shell call.** Append the next command to the clone with `;` so the shell serialises them and the agent sees a single stdout transition — e.g. `git clone … ; Test-Path <temp-dir>/AGENTS.md`. No race to lose.
2. **Insert a short drain.** If chaining isn't practical, issue `Start-Sleep -Milliseconds 500` (PowerShell) or `sleep 0.5` (bash) as a standalone call before the next verification command.

### Step 4 — Create the target
```
mkdir -p ${AIDE_TARGET_DIR}
```

### Step 5 — Copy the mandatory subset
Copy these from `<temp-dir>` into `${AIDE_TARGET_DIR}/`:

| Path          | Purpose                                                          |
|---------------|------------------------------------------------------------------|
| `AGENTS.md`   | Framework orientation file auto-attached by agentskills.io hosts |
| `.agents/`    | All skills + committed `_registry/` (catalog + workflow graph)   |
| `config/`     | Schemas + example TOMLs the skills reference                     |
| `templates/`  | Reusable section blocks + YAML compositions                      |
| `references/` | Cross-cutting framework references loaded by skills on demand    |

**Drain the terminal before the next step.** Copying `.agents/` alone is hundreds of files; on agents with a persistent shell session, the previous command's stdout buffer may still be flushing when the next `run_in_terminal` call fires, causing trivial follow-ups (e.g. the Step 6 copy, or the Step 11 `Test-Path` checks) to time out on the readiness probe. Mitigate the same way as Step 3d: prefer chaining the next command in the same shell call with `;`, or insert a short `Start-Sleep -Milliseconds 500` / `sleep 0.5` between calls. This applies after **any** bulk filesystem operation in this runbook, not just this one.

### Step 6 — Copy the optional subset
By default, also copy:
- `README.md` — human reference (not consumed by skills)

Skip if the user opted out.

### Step 7 — Skip everything else
Do **not** copy these (framework-maintenance only, or self-referential):

```
scripts/    CLAUDE.md    CHANGELOG.md    _docs/    _archive/    _bmad/
.git/       .github/     INSTRUCTIONS.md
```

### Step 8 — Generate flat skill-discovery shims at the workspace root

> **⚠️ CRITICAL — read before executing this step.**
>
> This step has exactly **two paths** to keep straight:
>
> | Role                         | Path (relative to workspace root)                            | What you do with it                                                                                                  |
> |------------------------------|--------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
> | **SOURCE** — read only       | `${AIDE_TARGET_DIR}/.agents/skills/<stage>/<skill>/SKILL.md` | Read frontmatter from these files. **Never** create, modify, or delete anything under `${AIDE_TARGET_DIR}/.agents/`. |
> | **DESTINATION** — write only | `./.agents/skills/<skill>/SKILL.md`                          | Create flat shim files here, at the **workspace root**, not inside `AIDE/`.                                          |
>
> If you are about to write to a path that begins with `${AIDE_TARGET_DIR}/` (e.g. `AIDE/.agents/skills/...`), **STOP** — that is the canonical tree, which must remain a verbatim copy of source. The shim destination is always the bare workspace root: `./.agents/skills/<skill>/SKILL.md`.

**Why this step exists.** A.I.D.E. organises skills under stage folders inside its own directory:

```
${AIDE_TARGET_DIR}/.agents/skills/<stage>/<skill>/SKILL.md     ← canonical (SOURCE, never modified)
```

…but agentskills.io hosts scan **workspace-folder-relative** roots such as `.agents/skills/`, and the spec expects a flat layout:

```
./.agents/skills/<skill>/SKILL.md                              ← what hosts scan (DESTINATION)
```

Two problems in one: the canonical files live inside `AIDE/` (off the discovery path), and they're nested two levels deep (wrong shape for flat-scanning hosts like VS Code Copilot, Cursor, and Claude Code).

A single mechanism solves both: the runbook generates one tiny shim per skill **at the workspace root**, in the right flat shape. Each shim carries the canonical frontmatter (so it surfaces in the slash picker with the right name and description) plus a pointer back to the canonical file inside `AIDE/` (so the agent loads the real content when the skill is invoked). No symlinks, no junctions, no copies of the canonical tree — just plain generated files at the workspace root.

**Algorithm:**

0. **Clean prior shims first.** If `./.agents/skills/` already exists at the workspace root, sweep it before generating anything new. Walk its immediate-child folders; for each child folder whose name does **not** begin with `_`:

   - If `<folder>/SKILL.md` exists **and** contains `<!-- aide:generated-shim -->`, delete that `SKILL.md` and then remove the now-empty `<folder>` itself.
   - If `<folder>/SKILL.md` exists but does **not** contain the marker, leave the folder untouched and emit a warning — it is hand-authored.
   - If `<folder>` contains anything other than `SKILL.md`, leave the folder untouched and emit a warning — it is not a pure generated shim.

   This guarantees a clean slate of marker-tagged shims before regeneration, automatically handling skills that were renamed, moved between stages, or removed from the canonical tree since the last install. Hand-authored files and any non-shim content under `./.agents/skills/` are preserved.

1. **Walk SOURCE.** Enumerate every `<stage>/<skill>/SKILL.md` two levels deep under `${AIDE_TARGET_DIR}/.agents/skills/`. Ignore any stage folder whose name begins with `_` (e.g. `_registry`). These files are **read-only** for the rest of this step.

2. **For each SOURCE file**, read it as UTF-8 and split off the YAML frontmatter block — the lines from the first `---` line up to and including the next `---` line. If there is no frontmatter, skip this file and emit a warning.

3. **Determine the skill name.** Take the `name:` value from the frontmatter (strip surrounding quotes if present). If it differs from the `<skill>` folder name, **use the folder name** and warn — folder is authoritative.

4. **Compute the DESTINATION path.** It is always:

   ```
   ./.agents/skills/<skill>/SKILL.md
   ```

   Relative to the workspace root. **Not** `${AIDE_TARGET_DIR}/.agents/skills/<skill>/SKILL.md`. **Not** `${AIDE_TARGET_DIR}/.agents/skills/<stage>/<skill>/SKILL.md`. Just `./.agents/skills/<skill>/SKILL.md`.

   Self-check before continuing: the absolute form of this path must **not** start with the absolute form of `${AIDE_TARGET_DIR}`. If it does, you have the wrong path.

5. **Render the shim content.** It is a string with two parts:

   - **Part A** — the SOURCE file's frontmatter block, verbatim.
   - **Part B** — the body below. The literal text `${AIDE_TARGET_DIR}` in the body is content you write *inside* the file (a pointer the agent will follow later when the skill is invoked); it is **not** a clue about where the file itself goes. Substitute the resolved value (e.g. `AIDE`) into the pointer line so it is immediately openable.

   Body template:

   ```markdown
   <!-- aide:generated-shim -->

   # <skill-name> (discovery shim)

   > This is a generated discovery shim. The canonical skill content lives at:
   >
   > **`${AIDE_TARGET_DIR}/.agents/skills/<stage>/<skill>/SKILL.md`**
   >
   > Load that file for the full SKILL.md (Overview, When to use, Workflow, Output, etc.).
   ```

   The final file is Part A, then a blank line, then Part B.

6. **Write the shim** to the DESTINATION path from step 4. Create parent directories under `./.agents/skills/` as needed.

7. **Idempotency / safety rule.** Step 0 has already removed every marker-tagged shim, so in normal operation the DESTINATION will not exist when step 6 runs. The only way a file can still be there is if it lacks the marker — in which case it is hand-authored. If you find a pre-existing DESTINATION file at write time:
   - Confirm it contains `<!-- aide:generated-shim -->`. If yes, overwrite (this should be rare — only possible if the clean sweep in step 0 was skipped or failed partially).
   - If it does **not** contain that marker, leave it alone and emit a warning. The runbook must never clobber hand-authored files.

**Result.** A single flat layer of generated shim files at `./.agents/skills/<skill>/SKILL.md`. Every supported host — VS Code Copilot, Cursor, Claude Code, JetBrains Copilot — picks them up via its default workspace-folder-relative discovery root. The canonical nested tree inside `AIDE/` is the single source of truth and is unchanged from Step 5; the workspace-root layer is purely the discovery surface.

**Wrong vs. right (sanity check):**

| ❌ Wrong destination                                        | ✅ Right destination                                        |
|------------------------------------------------------------|------------------------------------------------------------|
| `${AIDE_TARGET_DIR}/.agents/skills/start-project/SKILL.md` | `./.agents/skills/start-project/SKILL.md`                  |
| `AIDE/.agents/skills/start-project/SKILL.md`               | `.agents/skills/start-project/SKILL.md`                    |
| Anything under `${AIDE_TARGET_DIR}/`                       | The workspace root (the directory that *contains* `AIDE/`) |

If after running this step the listing of `${AIDE_TARGET_DIR}/.agents/skills/` shows anything beyond the canonical stage subfolders (`meta/`, `requirements/`, `design/`, `_registry/`, …) and a single flat `<skill>/` folder appears there, **the shims were written to the wrong place**. Delete them and re-run with the destination correctly resolved to `./.agents/skills/`.

### Step 9 — Generate / refresh the workspace-root orientation block

Hosts auto-attach `AGENTS.md` from each workspace folder root. AIDE publishes its framework orientation (plus the host-agnostic coding-standards addendum) into `./AGENTS.md` as a **managed block** delimited by sentinel comments, so the file can also hold hand-authored content the user owns. AIDE only ever writes **between** the sentinels; everything outside them is preserved verbatim across installs.

The managed block is **not** a verbatim copy of `${AIDE_TARGET_DIR}/AGENTS.md`. It splices the AIDE-shipped addendum (`references/orientation/workspace-agents-coding-standards.md`) into the source immediately before the `## What this folder is NOT` heading, then wraps the result in the sentinel pair. The addendum file is the single source of truth for that directive; this step composes, never authors.

**Marker constants (literal):**

- `BEGIN` = `<!-- aide:managed:begin — DO NOT EDIT INSIDE THIS BLOCK. Everything between this line and aide:managed:end is generated by AIDE and is OVERWRITTEN on every install/update. Put your own content OUTSIDE the block (above or below). -->`
- `END` = `<!-- aide:managed:end -->`
- `LEGACY` = `<!-- aide:generated-agents -->` (the pre-managed-block whole-file marker; recognised only for migration)

Detection always matches on the stable substrings `aide:managed:begin` and `aide:managed:end`, **not** the full `BEGIN` literal — so the human-readable banner wording can be reworded in a future release without breaking already-installed workspaces.

**A sentinel only counts when it is a sentinel _line_.** To avoid mistaking hand-authored prose for a real marker (a user may legitimately *write about* this mechanism in their own out-of-block content), a line is a begin/end sentinel **only if**, after stripping leading whitespace, it **starts with** `<!-- aide:managed:begin` / `<!-- aide:managed:end` respectively. A line that merely *mentions* the substring mid-sentence (e.g. "don't edit between aide:managed:begin and aide:managed:end") is **not** a sentinel and must be ignored by every count and match below. When you count BEGIN/END occurrences for write-mode selection (modes (b) and (e)) and when you locate the block bounds for replace-in-place, operate on these sentinel **lines** only.

> **⚠️ Use a tool-native file write, not a shell pipeline.**
>
> This step has hung agent chat sessions in the past when implemented as a shell redirection (e.g. `{ echo "<!-- aide:managed:begin ... -->"; cat AIDE/AGENTS.md; } > AGENTS.md` in git-bash, or `Get-Content AIDE/AGENTS.md | Set-Content AGENTS.md` in PowerShell). Failure modes seen in the wild:
> - The terminal returns *"No output was produced by the command"* and the agent loop blocks waiting for stdout that never arrives.
> - The redirect target (`AGENTS.md`) is the same file the host is auto-attaching to chat context; on some platforms (Windows in particular) the file is open-for-read by the IDE, the redirect's truncating open fails or races, and the shell silently hangs.
> - Brace-group redirection (`{ ...; } > file`) is bash-only; it parses as a script block in PowerShell and produces no output / no file.
>
> **Mandatory implementation:** use your in-process file-edit tool (read-file → compose-in-memory → write-file), **not** the terminal. Do not pipe through the shell, do not use `cat`/`Get-Content` redirection, do not use brace-group redirection.

**Algorithm:**

1. **Read SOURCE into memory.** Read `${AIDE_TARGET_DIR}/AGENTS.md` as UTF-8 into a single string `src`. If the file is missing or empty, stop and report — Step 5 did not complete.

2. **Read ADDENDUM into memory.** Read `${AIDE_TARGET_DIR}/references/orientation/workspace-agents-coding-standards.md` as UTF-8 into a single string `addendum`. If the file is missing or empty, emit a warning, set `addendum = ""`, and continue — older AIDE installs may not ship it, and the runbook must remain backward-compatible.

   **Strip the leading SOT comment.** The addendum file opens with an HTML comment block (`<!-- … -->`) that documents the source-of-truth and splice-anchor contract for AIDE maintainers. That comment is build-time plumbing, **not** user-facing orientation, and must not leak into `./AGENTS.md`. If `addendum` begins (after any leading whitespace) with `<!--`, remove everything from that `<!--` through the matching `-->` **inclusive**, then trim any leading blank lines so `addendum` now starts at its first real content (the `## Coding standards (auto-enforced per repo)` heading). Strip only this single leading comment block; leave any later comments untouched. If the file does not start with `<!--`, use it unchanged.

3. **Splice the addendum into `src`.** If `addendum` is non-empty:
   - Locate the literal line `## What this folder is NOT` in `src` (the splice anchor).
   - **If found:** insert `addendum`, followed by a single blank line, immediately **before** that heading line. Preserve all line endings.
   - **If not found:** append `addendum` (preceded by a blank line) to the end of `src` and emit a warning that the splice anchor is missing — the addendum still lands, just not in the preferred position. Treat this as a defect to be fixed in a future AIDE release (the anchor is meant to be stable).
   - Call the resulting string `composed_body`. If `addendum` was empty, `composed_body = src` unchanged.

4. **Build the managed block** in memory:

   ```
   <BEGIN>\n<composed_body>\n<END>\n
   ```

   Ensure exactly one newline before `END` so the end sentinel sits on its own line regardless of whether `composed_body` ended with a newline.

5. **Inspect DESTINATION (`./AGENTS.md`) and choose a write mode:** Count begin/end **sentinel lines** only (per the "sentinel _line_" rule above) — lines that, after leading whitespace, start with `<!-- aide:managed:begin` / `<!-- aide:managed:end`. Prose that merely mentions the substrings does not count.

   - **(a) File does not exist** → **Create.** Write the managed block as the whole file. Line 1 will be `BEGIN`.

   - **(b) File exists and contains exactly one begin sentinel line and one end sentinel line** (begin before end) → **Replace-in-place.** Substitute everything from the `BEGIN` line through the `END` line (inclusive) with the freshly built managed block. Preserve every byte outside the block — content above and below is the user's. **Emit a warning:** *"Refreshed the AIDE managed block in ./AGENTS.md. Any edits made between the aide:managed:begin/end sentinels were discarded by design — put custom content outside the block."*

   - **(c) File exists, no sentinel lines, but line 1 is `LEGACY`** → **Migrate.** The whole file is a pre-managed-block generated copy; replace the entire file with the managed block. Warn: *"Migrated ./AGENTS.md from the legacy whole-file format to the managed-block format."*

   - **(d) File exists, no sentinel lines, not `LEGACY`** → **First adoption on hand-authored file.** **Prepend** the managed block, followed by a blank line, above the user's existing content. The user's bytes are preserved unchanged, pushed below the block. Warn: *"Found a hand-authored ./AGENTS.md. Prepended the AIDE managed block above your content; your content is untouched. Do not edit inside the aide:managed:begin/end sentinels — that region is regenerated on every install."*

   - **(e) File exists with exactly one sentinel line, or `END` precedes `BEGIN`, or more than one begin or end sentinel line** → **Malformed — do not modify.** Leave the file alone, emit a warning naming the anomaly, and skip the rest of this step. Refusing to edit avoids destroying user content around a corrupted block. (The user fixes the sentinels and re-runs.)

6. **Write atomically to DESTINATION via the file-edit tool.** Write the composed string to `./AGENTS.md` in a single write call. Do **not** spawn a shell, do **not** pipe, do **not** redirect. If your tool supports it, prefer write-to-temp-then-rename (`./AGENTS.md.tmp` → `./AGENTS.md`) for atomicity.

7. **Verify** by re-reading `./AGENTS.md` and confirming:
   - The file contains exactly one `aide:managed:begin` and one `aide:managed:end` **sentinel line** (per the sentinel-line rule above), with begin before end.
   - Between the sentinels, the file contains the heading `## Coding standards (auto-enforced per repo)` (the spliced addendum landed) — skip this assertion only if Step 2 set `addendum = ""`.
   - Between the sentinels, the file contains the heading `## What this folder is NOT` (the source body survived intact).
   - In write modes (a) and (c)–(d), the bytes **outside** the block match what was intended (empty for (a); the prior user content for (d); none for (c)).

   If any assertion fails, the write failed silently or the splice corrupted the body — stop and report.

> **Note on idempotency.** Re-running Step 9 is always safe: modes (b)/(c) replace the block, (d) only prepends the first time (subsequent runs see the sentinels and take mode (b)), and (e) protects corrupted files. The user's out-of-block content is invariant across any number of installs.

**Last-resort shell fallback (only if the agent has no file-write tool at all).** Use a write-to-temp-then-rename pattern in a single non-interactive shell invocation, and never redirect into a file the IDE may have open. `$composed` must be the **entire intended file contents** — for replace-in-place (mode b) and first-adoption prepend (mode d) that means the agent has already merged the managed block with the preserved out-of-block bytes in memory; the shell step only writes the final result, it does not splice:

- **PowerShell:** `Set-Content -LiteralPath AGENTS.md.tmp -Value $composed -NoNewline -Encoding utf8; Move-Item -Force AGENTS.md.tmp AGENTS.md`
- **bash:** `printf '%s' "$composed" > AGENTS.md.tmp && mv -f AGENTS.md.tmp AGENTS.md`

Do not use `{ echo ...; cat ...; } > AGENTS.md`, `Get-Content ... | Set-Content AGENTS.md`, or any other pipeline that writes directly to the live `AGENTS.md` — these are the patterns that have hung sessions.

No symlinks. No junctions. Plain file, plain copy. Re-install refreshes it.

### Step 10 — Clean up
Remove `<temp-dir>`.

### Step 11 — Verify the installation
Confirm all the following exist:

- `${AIDE_TARGET_DIR}/AGENTS.md`
- `${AIDE_TARGET_DIR}/.agents/skills/_registry/skills.csv`
- `${AIDE_TARGET_DIR}/config/SCHEMAS.md`
- `${AIDE_TARGET_DIR}/templates/README.md`
- `./.agents/skills/start-project/SKILL.md` (any flat shim from Step 8) — and contains the marker `<!-- aide:generated-shim -->`
- `./AGENTS.md` — contains the `aide:managed:begin` and `aide:managed:end` sentinel lines (one each, begin before end; a *sentinel line* starts with the marker after optional leading whitespace — prose that merely mentions the substring does not count).
- `./AGENTS.md` — contains the heading `## Coding standards (auto-enforced per repo)` **inside** the managed block (Step 9 addendum splice landed), and the SOT comment that opens the addendum source is **not** present (Step 9.2 strip succeeded). Skip both assertions only if `${AIDE_TARGET_DIR}/references/orientation/workspace-agents-coding-standards.md` is missing (older AIDE install).

**Assert the canonical tree was not polluted.** List the immediate children of `${AIDE_TARGET_DIR}/.agents/skills/`. Every entry must be either a stage folder (`meta`, `requirements`, `design`, `planning`, `execution`, `reverse-engineering`, `knowledge-base`, `quick-dev`, …; plus any stage folders contributed by installed add-ons, e.g. `jira`, `confluence`, `files-conversion`) or `_registry`. If you see a flat skill folder there (e.g. `${AIDE_TARGET_DIR}/.agents/skills/start-project/`), Step 8 wrote shims to the wrong place — delete those flat folders from inside `AIDE/` and re-run Step 8 with the destination correctly resolved to `./.agents/skills/` at the workspace root.

If any of the required files are missing or the assertion fails, report which and stop — do not silently continue.

### Step 12 — Record provenance
Write `${AIDE_TARGET_DIR}/.aide-install.json`. The example below shows the schema with **representative values**; the agent fills each field with the real resolved value at install time (counts come from Step 8, timestamps from the system clock, etc.).

```json
{
  "source_url": "https://github.com/TD-Universe/TD-EM-AIDE",
  "ref": "main",
  "commit_sha": "0000000000000000000000000000000000000000",
  "installed_at": "2026-06-01T00:00:00Z",
  "target_dir": "./AIDE",
  "mandatory_paths": ["AGENTS.md", ".agents/", "config/", "templates/", "references/"],
  "optional_paths": ["README.md"],
  "workspace_root_files": {
    "skill_shims_dir": "./.agents/skills",
    "skill_shims_swept": 0,
    "skill_shims_generated": 0,
    "skill_shim_marker": "<!-- aide:generated-shim -->",
    "agents_md": "./AGENTS.md",
    "agents_md_block_begin": "<!-- aide:managed:begin",
    "agents_md_block_end": "<!-- aide:managed:end -->",
    "agents_md_write_mode": "create | replace-in-place | migrate | prepend | malformed-skip"
  }
}
```

### Step 13 — Print next-steps banner
Tell the user:

> A.I.D.E. is installed at `${AIDE_TARGET_DIR}`. Skills should now be discoverable in your IDE's agent chat — type `/` to see them. If they don't appear, reopen the workspace. Next: see `AIDE/README.md` Step 2 (IDE setup) and Step 3 (`/start-project`).

---

## 4. Uninstall

1. Delete `${AIDE_TARGET_DIR}`.
2. Delete `./.agents/skills/<skill>/SKILL.md` files at the workspace root whose body contains `<!-- aide:generated-shim -->`, then remove any now-empty parent folders (including `./.agents/skills/` and `./.agents/` if empty). Skip any shim file lacking the marker — it is hand-authored.
3. In `./AGENTS.md`:
   - If the file contains the `aide:managed:begin` / `aide:managed:end` sentinels → **remove only the managed block** (the sentinels and everything between them), collapsing one adjacent blank line if removal leaves a double blank. Preserve all content outside the block. If the file is left empty (the block was the whole file), delete the file.
   - Else if line 1 is the legacy `<!-- aide:generated-agents -->` marker → delete the file (it is wholly generated).
   - Else → leave the file alone (fully hand-authored).

---

## 5. Troubleshooting

- **Skills don't appear in the slash picker (any host).** Confirm Step 8 ran — `./.agents/skills/start-project/SKILL.md` (or any other skill) must exist at the workspace root and contain `<!-- aide:generated-shim -->`. If only the canonical files inside `${AIDE_TARGET_DIR}/.agents/skills/<stage>/<skill>/SKILL.md` exist, the flat-shim pass was skipped — re-run the installation, then reload the IDE window.
- **AIDE updated but skills look stale.** Each install starts by sweeping every marker-tagged shim under `./.agents/skills/` before regenerating (Step 8 → step 0). Re-running the one-line prompt is always safe and guarantees the workspace-root shims match the current canonical tree — renamed, moved, or deleted skills are picked up automatically.
- **Network blocked / no `git`.** Use the tarball/zip fallback in Step 3, or have the user clone the repo manually and pass `AIDE_SOURCE_URL=file:///absolute/path/to/clone`.
- **`git clone` or download returns 404 / 403 / "repository cannot be found".** This is almost always an **authentication** problem, not a missing repo — especially for private, SSO-gated, or enterprise-mirrored sources. GitHub returns **404 (not 401)** to anonymous callers on private repos by design. Do not report the repo as non-existent, and do **not** switch to `Invoke-WebRequest` / `curl` / `gh api` / `api.github.com` / `raw.githubusercontent.com` to "double-check" — those endpoints are *more* auth-restricted than `git` and will produce the same misleading 404. Follow the failure protocol in Step 3: prefer asking the user to clone locally and pass a `file://` path (their machine's `git` already has working creds), or ask for a PAT and retry with `https://<token>@github.com/<owner>/<repo>`.
- **Private source repo.** The agent needs credentials (a personal access token in the URL, or a pre-authenticated `git` config). Alternatively, pre-clone and pass a `file://` path. Treat any PAT the user provides as a secret — use it only for the single fetch invocation; do not persist it in `.aide-install.json` or echo it back in chat.
- **Hand-authored file at the workspace root.** Step 8 refuses to overwrite any `./.agents/skills/<skill>/SKILL.md` that lacks the `<!-- aide:generated-shim -->` marker. Step 9 treats a hand-authored `./AGENTS.md` (no `aide:managed:begin`/`end` sentinels, not the legacy marker) by **prepending** the AIDE managed block above your content and leaving your content untouched below it — it no longer skips the file. Only edits made *inside* the `aide:managed:begin`/`end` sentinels are lost on re-install; keep your own content outside the block. If the sentinels are malformed (only one present, or out of order), Step 9 refuses to modify the file and warns — fix the sentinels and re-run.
- **Verification command times out immediately after a large copy or clone.** Symptom: a trivial command (`Test-Path`, `git --version`, `ls`, `Get-ChildItem`) reports a timeout when run as the very next `run_in_terminal` call after Step 3's `git clone` or Step 5's bulk copy of `.agents/`, even though the prior bulk command reported success and the file/directory clearly exists. This is **not** a hang of the trivial command — it is the agent's readiness probe racing the previous command's stdout buffer flush on a persistent shell session. The shell is idle; the pipe between shell and agent loop has not drained. Two fixes, in order of preference: (1) chain the verification onto the bulk command in the same shell call with `;` (e.g. `git clone … ; Test-Path <temp-dir>/AGENTS.md`) so the shell serialises them and the agent sees one stdout transition; (2) insert a short drain between calls — `Start-Sleep -Milliseconds 500` in PowerShell, `sleep 0.5` in bash — before the verification. Applies after any bulk filesystem operation, not just clone/copy.
- **Step 9 hung the chat / "No output was produced by the command".** The agent implemented Step 9 as a shell redirection (e.g. `{ echo ...; cat AIDE/AGENTS.md; } > AGENTS.md` or `Get-Content ... | Set-Content AGENTS.md`) writing directly to the live `./AGENTS.md`. Because the IDE auto-attaches that file to chat context, the truncating open races or fails silently and the agent loop blocks waiting on stdout that never arrives. Re-run the install and ensure Step 9 uses the agent's in-process file-edit tool (read-file → write-file in memory), or, as a last resort, the temp-file-then-rename shell pattern documented in Step 9. Never redirect into the live `AGENTS.md`.
- **Source repo is under git.** Add `AIDE/`, `.agents/`, and `AGENTS.md` to the user's project `.gitignore` if they're vendoring AIDE rather than committing it.

---

## 6. Machine-readable manifest

Agents that prefer structured input may parse this block directly instead of the prose above. It is authoritative — if prose and YAML disagree, the YAML wins.

```yaml
aide_install:
  defaults:
    source_url: https://github.com/TD-Universe/TD-EM-AIDE
    ref: main
    target_dir: ./AIDE
  copy:
    - AGENTS.md
    - .agents/
    - config/
    - templates/
    - references/
  fetch:
    probe_first: "git --version"        # MUST run before any fetch attempt
    require_git_when_available: true    # if `git --version` works, `git clone`
                                        # is MANDATORY — no HTTP fallback allowed
    prefer: git_clone                   # uses the user's local credential helper
    forbid_api_preflight: true          # do NOT call GitHub REST to "check existence"
                                        # before cloning — it 404s on private/SSO repos
                                        # that `git clone` would otherwise succeed on
    forbidden_fetch_verbs:              # never use any of these for the source repo
      - Invoke-WebRequest
      - iwr
      - Invoke-RestMethod
      - curl
      - wget
      - gh api
      - gh repo view
    forbidden_fetch_hosts:              # do not hit these hosts at all
      - api.github.com
      - raw.githubusercontent.com
    interpret_404_as: "auth_missing"    # NOT "repo_missing". GitHub returns 404
                                        # (not 401) to anonymous callers on private
                                        # repos by design — a 404 is evidence you
                                        # are not authenticated, not evidence the
                                        # repo doesn't exist.
    archive_fallback_allowed_only_when: "git --version exits non-zero"
    on_failure:                  # in order — never report "repo not found",
                                 # never switch to HTTP to "double-check"
      - ask_user_for_local_clone_and_use_file_url   # AIDE_SOURCE_URL=file:///...
      - ask_user_for_pat_and_retry_with_token_url   # https://<token>@github.com/...
      - ask_user_to_confirm_ref
      - ask_user_to_confirm_url
    token_handling: secret_single_use   # never persist in provenance, never echo
  copy_optional:
    - README.md
  skip:
    - scripts/
    - CLAUDE.md
    - CHANGELOG.md
    - _docs/
    - _archive/
    - _bmad/
    - .git/
    - .github/
    - INSTRUCTIONS.md
  skill_shims:
    # Generated by the agent (no script, no symlinks).
    #
    # SOURCE (read only): walks the canonical nested tree INSIDE AIDE.
    # DESTINATION (write only): one flat shim per skill AT THE WORKSPACE ROOT.
    # The canonical tree inside AIDE is NEVER modified by this step.
    #
    # If you find yourself about to write a file whose path starts with
    # `${AIDE_TARGET_DIR}/`, you have the wrong destination — stop and
    # re-resolve to `./.agents/skills/<skill>/SKILL.md` at the workspace root.
    walk:        "${AIDE_TARGET_DIR}/.agents/skills/<stage>/<skill>/SKILL.md"   # SOURCE (read)
    emit:        "./.agents/skills/<skill>/SKILL.md"                            # DESTINATION (write) — workspace root
    forbidden_emit_prefix: "${AIDE_TARGET_DIR}/"                                # writes under this prefix are a bug
    skip_stages_prefix: "_"             # e.g. _registry
    folder_name_is_authoritative: true  # warn if frontmatter `name` differs
    marker:      "<!-- aide:generated-shim -->"
    clean_first: true                   # sweep all marker-tagged shims under
                                        # `emit:` before regenerating; preserves
                                        # any file lacking the marker (hand-authored)
    overwrite_rule: "only-if-marker-present"
    shim_body_template: |
      <frontmatter-block>

      <!-- aide:generated-shim -->

      # <name> (discovery shim)

      > This is a generated discovery shim. The canonical skill content lives at:
      >
      > **`${AIDE_TARGET_DIR}/.agents/skills/<stage>/<skill>/SKILL.md`**
      >
      > Load that file for the full SKILL.md (Overview, When to use, Workflow, Output, etc.).
      #
      # NOTE: the `${AIDE_TARGET_DIR}/...` reference above is text written
      # INTO the shim body (a pointer the agent follows at skill invocation
      # time). It is NOT a hint about where the shim file itself should go —
      # that is controlled by `emit:` above.
  agents_md:
    # AIDE publishes its orientation + coding-standards addendum into
    # ./AGENTS.md as a MANAGED BLOCK delimited by sentinels, so the file
    # can also carry hand-authored content the user owns. AIDE writes only
    # BETWEEN the sentinels; everything outside is preserved across installs.
    source:  "${AIDE_TARGET_DIR}/AGENTS.md"
    target:  "./AGENTS.md"
    addendum_source: "${AIDE_TARGET_DIR}/references/orientation/workspace-agents-coding-standards.md"
    splice_before_heading: "## What this folder is NOT"  # stable anchor in src
    splice_fallback: append_with_warning                 # if anchor missing
    addendum_required_heading: "## Coding standards (auto-enforced per repo)"
                                                         # asserted in verify
    addendum_missing_behaviour: warn_and_skip_splice     # back-compat with older AIDE
    block:
      begin_marker: "<!-- aide:managed:begin — DO NOT EDIT INSIDE THIS BLOCK. Everything between this line and aide:managed:end is generated by AIDE and is OVERWRITTEN on every install/update. Put your own content OUTSIDE the block (above or below). -->"
      end_marker:   "<!-- aide:managed:end -->"
      detect_on_substring:                # match these substrings, NOT the full
        - "aide:managed:begin"            # begin literal, so the banner wording
        - "aide:managed:end"              # can be reworded without breaking installs
      legacy_marker: "<!-- aide:generated-agents -->"   # pre-block whole-file format; migration only
      write_modes:
        - "no-file             -> create file = block (line 1 is begin)"
        - "both-sentinels      -> replace-in-place between begin..end (warn: in-block edits discarded)"
        - "legacy-line1        -> migrate: replace whole file with block"
        - "no-sentinels-plain  -> first adoption: PREPEND block, preserve user content below (warn)"
        - "malformed-sentinels -> do not modify; warn and skip (prevents data loss)"
      preserves_out_of_block_content: true
      idempotent: true
    write_method: tool_native_file_write   # use the agent's in-process file-edit
                                           # tool (read-file -> write-file). Do NOT
                                           # implement this step as a shell pipeline.
    forbidden_write_patterns:              # these have hung agent sessions in the
                                           # wild (Copilot chat, Windows): the redirect
                                           # target is the same file the IDE has open
                                           # for auto-attach, the truncating open
                                           # races / silently fails, and the shell
                                           # returns "no output" while blocking.
      - "{ echo ...; cat ...; } > AGENTS.md"        # bash brace-group redirect
      - "cat ... > AGENTS.md"                       # any direct cat redirect
      - "Get-Content ... | Set-Content AGENTS.md"   # PowerShell pipeline to live file
      - "Get-Content ... > AGENTS.md"               # PowerShell redirect to live file
      - "any pipeline writing directly to ./AGENTS.md"
    shell_fallback_pattern: write_temp_then_rename  # only if no file-write tool:
                                                    #   write composed string to
                                                    #   AGENTS.md.tmp, then atomic
                                                    #   rename to AGENTS.md.
    verify_after_write:
      - "./AGENTS.md contains exactly one aide:managed:begin and one aide:managed:end, begin before end"
      - "between sentinels: contains addendum_required_heading (unless addendum_source missing)"
      - "between sentinels: contains splice_before_heading (source body intact)"
      - "bytes outside the block unchanged from pre-write (replace/prepend modes)"
  verify:
    - "${AIDE_TARGET_DIR}/AGENTS.md"
    - "${AIDE_TARGET_DIR}/.agents/skills/_registry/skills.csv"
    - "${AIDE_TARGET_DIR}/config/SCHEMAS.md"
    - "${AIDE_TARGET_DIR}/templates/README.md"
    - "${AIDE_TARGET_DIR}/references/orientation/workspace-agents-coding-standards.md"   # Step 9 addendum source
    - "./.agents/skills/start-project/SKILL.md"   # any flat shim from Step 8
    - "./AGENTS.md"
    - "./AGENTS.md contains aide:managed:begin / aide:managed:end sentinels"   # Step 9 managed block
    - "./AGENTS.md contains '## Coding standards (auto-enforced per repo)' inside the block"   # splice landed
  provenance_file: "${AIDE_TARGET_DIR}/.aide-install.json"
```




