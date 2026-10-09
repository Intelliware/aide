# A.I.D.E. — Install Runbook

> **For agents and humans.** This file is the single source of truth for installing A.I.D.E. into a workspace. It is tool-agnostic: any coding agent (GitHub Copilot, Cursor, JetBrains AI Assistant, Claude, etc.) — or a human — can execute it.
>
> **One-line user prompt to any agent:**
>
> > *"Install the AIDE framework by following the instructions at `<INSTRUCTIONS_LOCATION>`."*
>
> Replace `<INSTRUCTIONS_LOCATION>` with an actual workspace-relative path, absolute path, `file://` URI, or HTTPS URL. If this file is already in the workspace root, use `INSTRUCTIONS.md`.

---

## 0. Choose where to install (multi-repo projects)

AIDE installs into one folder, the **workspace root**. When a project is split across several repos, choose it like this:

1. **Use the existing workspace repo** (the one that holds the `.code-workspace` file or ties the other repos together) if you are allowed to commit to it. This is the default.
2. **Otherwise, create a new sibling repo** (e.g. `<project>-workspace`, or a variant if that name is taken) and install there. Do the same if the workspace repo is closely reviewed (AIDE adds hundreds of files) or if AIDE's documents need different access rules. Give the new repo its own `.code-workspace` file that lists itself and the other repos (`../<repo>`); leave the existing one untouched.
3. **Never install into an application repo** (API, web, database, etc.).

Run the install from the chosen folder. Before starting, confirm the folder with the user.

---

## 1. Inputs

**Ask the user whether the AIDE framework is already available on the local machine, using the following options:**
A. The AIDE repo is already cloned.
B. The AIDE framework has to be downloaded using git.

**Tell the user that option A is the most reliable path for private, SSO-gated, or enterprise-mirrored repos.**

If the user chooses option A, ask for the path to the AIDE framework.

If the user chooses option B, ask which AIDE source provider to use:
A. Azure DevOps (**default**).
B. GitHub.

Then ask whether to use the selected provider's default Git repository URL. If not, ask for a custom fork or mirror URL.

Resolve these before starting.

| Variable          | Default                                     | Purpose                                                                           |
|-------------------|---------------------------------------------|-----------------------------------------------------------------------------------|
| `AIDE_SOURCE_PROVIDER` | `azure-devops` for option B; not applicable to option A | Source provider used when downloading. Supported values are `azure-devops` and `github`. |
| `AIDE_SOURCE_DIR` | `../AIDE` | Points to the location of the AIDE framework. Populated when the user chooses option A. |
| `AIDE_SOURCE_URL` | Azure DevOps: `https://dev.azure.com/IntelliwareDev/AI_Knowledge_Repo/_git/AIDE`; GitHub: `https://github.com/<owner>/<repo>` | Git URL selected from `AIDE_SOURCE_PROVIDER`. Forks and mirrors within the selected provider family are supported. Populated when the user chooses download option B. If the Azure DevOps HTTPS clone fails and the user accepts the SSH fallback, replace this value with the verified SSH clone URL used successfully. |
| `AIDE_REF`        | `main`                                      | Branch, tag, or commit SHA to check out. Populated when the user chooses option B. |
| `AIDE_REF_TYPE`   | `branch`                                    | Type of `AIDE_REF`: `branch`, `tag`, or `commit`.                                 |
| `AIDE_TARGET_DIR` | `./AIDE`                                    | Destination directory inside the user's current workspace.                        |

`AIDE_SOURCE_DIR` and `AIDE_TARGET_DIR` are interpreted relative to the **workspace root** — the directory the user (or the agent's working directory) is currently in. After resolution, `AIDE_TARGET_DIR` must be a strict descendant of the workspace root.

---

## 2. Preconditions

1. The agent has identified the workspace root (the folder that will contain `AIDE/` as a subdirectory).
2. For every source method (`local-directory`, `git-clone`, or `zip`), the resolved source root must contain a regular, non-link `README.md`. After an optional UTF-8 BOM, its first line must be exactly `# A.I.D.E. (AI Integrated Delivery Enablement)`. Validate this identity signature after the source is available and before creating or modifying the target, even when the user opts out of copying `README.md`.
3. When the user chooses option B, network access to `AIDE_SOURCE_URL` must be available.
4. When the user chooses option B and `git` is not on `PATH`, the user must choose whether to install Git or continue with a provider-specific ZIP download.
5. For availability option A, resolve `AIDE_SOURCE_DIR` and `AIDE_TARGET_DIR` to normalized absolute paths, resolving symlinks where supported. The paths must not be identical, and neither may be a descendant of the other. If they overlap, stop and ask the user for a different source or target path; otherwise Step 5 could delete or recursively copy its own source.
6. Resolve `AIDE_TARGET_DIR` and the workspace root to normalized absolute paths, resolving symlinks where supported. The target must be a strict descendant of the workspace root: it must not equal the workspace root and must not be outside it. If validation fails, stop before creating or modifying the target.
7. Before creating, replacing, or removing any destination, inspect the path and its existing components without following links. After resolving the workspace root itself, no component beneath it may be a symbolic link or junction for:
   - `${AIDE_TARGET_DIR}` and its AIDE-managed descendants;
   - `./.agents/skills/<skill>/SKILL.md` and its parent directories;
   - `./AGENTS.md`.

   If a symlink or junction is encountered, stop and report its path. Do not follow it, unlink it, or continue. Re-run this check after creating destination directories and immediately before every destructive operation, including uninstall.

---

## 3. Steps

### Step 1 — Resolve inputs
After the user chooses availability option A or B, collect only the inputs required by that option: the source path for option A, or the source provider and required URL choice for option B. Use the defaults for all remaining values. Only confirm a remaining value if the user explicitly asks to change it.

For download option B, the default pair is `AIDE_REF=main` and `AIDE_REF_TYPE=branch`. If the user changes `AIDE_REF`, ask for `AIDE_REF_TYPE`; never infer it from the ref text.

If the user supplies a custom source URL, parse it locally without a network preflight and confirm that it belongs to the selected provider family: Azure DevOps Services/Server for `azure-devops`, or GitHub.com/GitHub Enterprise Server for `github`. User-declared enterprise hosts are allowed after confirmation. Reject URLs for a different or unsupported Git provider. HTTPS and SSH clone URLs are allowed, but provider ZIP URL construction is available only from an HTTPS web/clone URL; for SSH URLs, the user must use the provider web interface.

### Step 2 — Detect existing install
If any of these candidate AIDE-managed paths already exists under `${AIDE_TARGET_DIR}`, ask the user once:

- `AGENTS.md`
- `.agents/`
- `config/`
- `templates/`
- `references/`
- `README.md`
- `.aide-install.json`

- **Overwrite** — proceed (replaces the AIDE-managed paths listed in Step 5 and any optional path copied in Step 6; leaves unrelated paths under `AIDE/` untouched), **or**
- **Abort** — stop.

**Update-intent exception.** If the user's original prompt clearly expressed update intent specifically for the AIDE installation — e.g. *update AIDE*, *upgrade the AIDE framework*, *refresh this AIDE install*, *re-install AIDE*, *sync AIDE*, *pull the latest AIDE*, or *bring AIDE up to date* — it may provide implicit consent to **Overwrite** only when `${AIDE_TARGET_DIR}/.aide-install.json` exists, parses successfully, validates against the provenance schema, contains no credentials, and its resolved `target_dir` matches the current resolved `AIDE_TARGET_DIR`. If any check fails or provenance is absent, ask the normal Overwrite/Abort question despite the update wording. A standalone occurrence of *update*, *refresh*, *sync*, or another keyword in unrelated context is not consent. The runbook is fully idempotent for verified installs (Step 8 sweeps stale shims; Step 9 refreshes the AIDE managed block in `./AGENTS.md`, preserving any hand-authored content outside it; the canonical tree under `${AIDE_TARGET_DIR}/.agents/` is re-copied verbatim in Step 5), so re-running it on a verified existing install *is* the update path.

### Step 3 — Fetch the source **⚠️ (Applicable only to option B.)**

> **⚠️ READ THIS FIRST — non-negotiable fetch rules.**
>
> 1. **Probe for `git` before doing anything else.** Run `git --version`. If it returns a version, you **MUST** use `git clone` (below). You are **FORBIDDEN** from falling back to HTTP downloads, the provider's REST API, or any other fetch method while `git` is available — even if your first `git clone` returned an error. Errors get handled by the failure protocol at the end of this step, not by switching tools.
> 2. **Never preflight or probe with HTTP.** Do **not** call `Invoke-WebRequest`, `curl`, `wget`, `az repos show`, `gh repo view`, or a provider REST endpoint to "check whether the repo exists", "list branches", "verify the ref", or fetch any file before cloning. HTTP requests may not use the credentials available to the user's Git credential helper and can therefore return misleading authentication or not-found errors. `git` uses the user's local credential helper and is the authoritative reachability check.
> 3. **Forbidden fetch verbs (do not use any of these for the source repo):**
>    - `Invoke-WebRequest` / `iwr` / `Invoke-RestMethod`
>    - `curl`, `wget`
>    - `az repos show`, `gh api`, `gh repo view`
>    - any direct Azure DevOps `_apis/git/...`, `api.github.com`, or `raw.githubusercontent.com` URL used as a preflight probe
>
>    The only sanctioned source-acquisition methods are `git clone` (preferred) and, **only** when `git --version` itself fails and the user selects that fallback, a provider-specific ZIP downloaded by the user through the provider's authenticated web interface. The agent does not perform an HTTP ZIP download.

**Step 3a — Probe for git.**

```powershell
git --version
```

If this succeeds → proceed to **Step 3b** (mandatory). If and only if it errors out (`git` not on `PATH` at all) → proceed to **Step 3c** and ask the user how to continue.

For either Step 3b or the ZIP path in Step 3c, allocate a unique `<temp-dir>` for this installation run. Prefer the operating system's temporary directory. It must be outside `${AIDE_TARGET_DIR}`, must be new or empty, and must not be shared with another process or installation. Record its exact resolved path for guarded cleanup on every success, failure, abort, or retry.

**Step 3b — Clone with local `git` (mandatory when `git` is available).**

Prefer a tool-native process API that passes each command argument separately, without shell interpolation. If a shell is unavoidable, reject `AIDE_SOURCE_URL`, `AIDE_REF`, and `<temp-dir>` values containing NUL, carriage-return, or newline characters, and quote every variable using the active shell's syntax. Never construct a command by concatenating untrusted values into executable shell text.

If `AIDE_REF_TYPE` is `branch` or `tag`:

```
git clone --depth 1 --branch "${AIDE_REF}" -- "${AIDE_SOURCE_URL}" "<temp-dir>"
```

If `AIDE_REF_TYPE` is `commit`, `AIDE_REF` must be a full commit SHA. Because `git clone --branch` cannot resolve a commit SHA, clone without checking out the default branch, then check out the requested commit:

```
git clone --no-checkout -- "${AIDE_SOURCE_URL}" "<temp-dir>"
git -C "<temp-dir>" checkout --detach "${AIDE_REF}"
```

If the commit checkout fails, follow the failure protocol below and ask the user to confirm the SHA. Do not silently fall back to the default branch.

After any successful clone/checkout, resolve `HEAD^{commit}` to a full commit SHA. Resolve the expected commit using an explicit namespace based on `AIDE_REF_TYPE`:

- `branch` → `refs/heads/${AIDE_REF}^{commit}`;
- `tag` → `refs/tags/${AIDE_REF}^{commit}`;
- `commit` → `${AIDE_REF}^{commit}`.

Use argument-array execution rather than interpolated shell text. Require the resolved expected commit to equal `HEAD^{commit}` exactly. If resolution or comparison fails, treat it as a Git/ref failure and stop before copying. Record the verified full `HEAD` commit SHA for provenance.

The user's machine almost certainly already has working credentials configured (SSH key, credential helper, Azure DevOps credential manager, GitHub CLI, or corporate SSO). Let `git` be the **single source of truth for reachability** — if this command fails, jump to the failure protocol below; do **not** switch to HTTP to "double-check".

**Step 3c — No-Git decision (only when `git --version` itself failed).**

Ask the user to choose one of these paths:

1. **Install Git manually (recommended).** Pause the installation while the user installs Git. Then run `git --version` again. If it succeeds, return to Step 3b.
2. **Use a provider-specific ZIP download.** Use the resolved `AIDE_REF_TYPE` to select the matching provider instructions below. The user downloads the ZIP and provides its local path; the agent only validates and extracts that local archive.

For **Azure DevOps**, prefer the authenticated web interface: open the repository at `AIDE_SOURCE_URL`, select the requested branch or tag, choose **Download as Zip**, and provide the downloaded archive to the agent. For a commit SHA, open that commit before downloading. If the host does not offer a ZIP for the selected commit, install Git instead.

For **GitHub**, when `AIDE_SOURCE_URL` is an HTTPS web/clone URL, derive `<github-web-url>` by removing one trailing `/` and an optional trailing `.git`. Use the authenticated web interface or the matching archive URL. For branch and tag refs, preserve `/` separators and percent-encode other unsafe URL characters. A commit ref must already be a full hexadecimal SHA. If `AIDE_SOURCE_URL` is SSH-based, do not derive an archive URL; the user must download through the GitHub or GHES web interface.

```
# Branch
<github-web-url>/archive/refs/heads/${AIDE_REF}.zip

# Tag
<github-web-url>/archive/refs/tags/${AIDE_REF}.zip

# Full commit SHA
<github-web-url>/archive/${AIDE_REF}.zip
```

Private repositories require an authenticated browser session. Do not place a PAT in an archive URL or ask the agent to download it over HTTP.

Before extraction, require the supplied path to be a local regular ZIP file. Inspect archive entries without extracting them and reject the archive if any entry:

- has an absolute path, drive-qualified path, or `..` path component;
- would resolve outside `<temp-dir>`;
- is a symbolic link, junction, hard link, device, or other non-regular special entry.

Also require every archive entry to share exactly one top-level directory. Directly beneath that directory, require all five mandatory source paths (`AGENTS.md`, `.agents/`, `config/`, `templates/`, and `references/`) plus the identity file `README.md`. Do not search recursively for an alternative source root.

Extract only after all validation succeeds. Strip that single provider-added top-level directory so the source paths are directly under `<temp-dir>` (for example, `<temp-dir>/AGENTS.md`). Revalidate all five mandatory paths and the README identity signature after normalization. If validation, normalization, or extraction fails, follow the ZIP failure protocol below.

**On `git clone` or checkout failure:**

Do **not** immediately conclude that the repo "cannot be found." For private Azure DevOps and GitHub repositories, authentication and SSO failures can appear as authorization or not-found errors. Do **not** switch to `Invoke-WebRequest`, `curl`, or a provider REST endpoint to "verify" the repository. Instead, surface the real error and use the following recovery paths in order:

1. **Offer the Azure DevOps HTTPS-to-SSH fallback when applicable.** Use this path only when `AIDE_SOURCE_PROVIDER=azure-devops`, the failed clone URL is HTTPS, and the failure is consistent with HTTPS credential acquisition or authentication (for example, `could not read Username`, a disabled terminal prompt, or an unavailable credential helper). Ask:
   - **A — Retry with Azure DevOps SSH** (recommended when the user's SSH key is already registered).
   - **B — Continue with the standard authentication recovery below.**

   For the default Azure DevOps HTTPS URL, use this exact SSH fallback:

   ```
   git@ssh.dev.azure.com:v3/IntelliwareDev/AI_Knowledge_Repo/AIDE
   ```

   For a custom Azure DevOps Services HTTPS URL, derive an SSH URL only when the URL unambiguously has the form `https://dev.azure.com/<organization>/<project>/_git/<repository>`: map it to `git@ssh.dev.azure.com:v3/<organization>/<project>/<repository>`, preserving existing percent-encoding in path components. For Azure DevOps Server, enterprise mirrors, legacy `visualstudio.com` URLs, or any URL that cannot be mapped unambiguously, do not guess; ask the user for the repository's SSH clone URL and validate locally that it belongs to the selected Azure DevOps provider family.

   If the user chooses A, perform guarded cleanup of the failed `<temp-dir>`, allocate a fresh unique `<temp-dir>`, and retry the same branch/tag/commit operation once with the SSH URL. Apply the same ref-to-`HEAD` verification as the HTTPS attempt. If the SSH clone succeeds, set `AIDE_SOURCE_URL` to the SSH URL actually used so provenance records the successful transport. If it fails, report the SSH error and continue with the recovery paths below; do not alternate repeatedly between HTTPS and SSH. Never place credentials in either URL.
2. **Authenticate Git outside the URL.** Ask the user to authenticate with the selected provider through their normal Git credential helper, SSH agent, provider-supported sign-in flow, or corporate SSO. Never ask the user to paste a PAT into chat or embed a token in `AIDE_SOURCE_URL`. After the user confirms authentication, perform guarded cleanup of the failed `<temp-dir>`, allocate a fresh unique `<temp-dir>`, and retry the currently selected `git clone` command once.
3. **Use a local clone.** If authentication cannot be completed through Git, ask the user to clone the repository manually, restart with availability option A, and provide `AIDE_SOURCE_DIR`.
4. **Confirm the ref and type.** Ask the user to confirm both `AIDE_REF` and `AIDE_REF_TYPE` (the default pair is `main` and `branch`).
5. **Confirm the URL.** If the user passed a fork or mirror, confirm the provider, organization or owner, project where applicable, repository name, and host.

**On ZIP download or extraction failure:**

1. Report the provider, requested ref and ref type, failed operation, and underlying error.
2. For a private repository, ask the user to retry the ZIP download through an authenticated provider web session.
3. Confirm that the selected branch, tag, or commit exists and that the correct provider-specific archive path was used.
4. If ZIP download or extraction still fails, ask the user to install Git and return to Step 3b, or clone manually and restart with availability option A.

Before retrying a ZIP extraction, clean the failed `<temp-dir>` using the guard rules and allocate a fresh unique one. On any exit from the installation after a temporary directory was allocated, attempt guarded cleanup. If cleanup itself fails, warn the user and report the exact retained temporary path.

Only stop the installation after the applicable recovery options have been presented and the user declines or cannot complete them.

**Step 3d — Drain the terminal before the next step.**

A successful `git clone` of this repo writes thousands of files and produces a large burst of terminal output (progress, "Resolving deltas", final summary). On agents that share a persistent shell session between `run_in_terminal` calls, the shell can be idle while the output pipe between the shell and the agent loop is still flushing — issuing a trivial follow-up command (`Test-Path`, `git --version`, `ls`) immediately afterwards can time out on the readiness probe even though the command itself would return in milliseconds.

Two safe patterns; prefer the first:

1. **Run the clone and verification in the same shell call, gated on success.** In Bash, use `git clone … && test -f "<temp-dir>/AGENTS.md"`. In PowerShell, run the clone and execute `Test-Path "<temp-dir>/AGENTS.md"` only when `$LASTEXITCODE -eq 0`; otherwise return the clone's exit code. Do not use an unconditional `;` chain that could run verification after a failed clone.
2. **Insert a short drain.** If chaining isn't practical, issue `Start-Sleep -Milliseconds 500` (PowerShell) or `sleep 0.5` (bash) as a standalone call before the next verification command.

### Step 4 — Create the target
After the target-location and link-safety preconditions succeed, create `${AIDE_TARGET_DIR}` with the agent's tool-native directory operation when available. Re-run both checks after creation. If a shell is required, use the command appropriate to the active shell:

```bash
mkdir -p -- "${AIDE_TARGET_DIR}"
```

```powershell
New-Item -ItemType Directory -Force -LiteralPath "${AIDE_TARGET_DIR}" | Out-Null
```

Do not run a command for one shell in another shell.

### Step 5 — Copy the mandatory subset
Copy these from `AIDE_SOURCE_DIR` into `${AIDE_TARGET_DIR}/`: **Applicable to option A.**
Copy these from `<temp-dir>` into `${AIDE_TARGET_DIR}/`: **Applicable to option B.**

| Path          | Purpose                                                          |
|---------------|------------------------------------------------------------------|
| `AGENTS.md`   | Framework orientation file auto-attached by agentskills.io hosts |
| `.agents/`    | All skills + committed `_registry/` (catalog + workflow graph)   |
| `config/`     | Schemas + example TOMLs the skills reference                     |
| `templates/`  | Reusable section blocks + YAML compositions                      |
| `references/` | Cross-cutting framework references loaded by skills on demand    |

**Replacement rule for installs and updates:** treat the five paths above as AIDE-managed. First verify that `AGENTS.md` is a regular file and that `.agents/`, `config/`, `templates/`, and `references/` are directories. Recursively inspect all five source paths without following links; permit only regular files and directories. Reject symbolic links, junctions, devices, sockets, named pipes, and other special entries. If any mandatory source path is missing, has the wrong type, or contains a forbidden entry, report every issue and stop without modifying the destination.

After source validation succeeds, re-run the link-safety check for every managed destination, remove each existing destination path from `${AIDE_TARGET_DIR}`, and then copy its source counterpart in full. This prevents files removed or renamed upstream from surviving as stale files in the installed canonical tree.

Do not remove or modify any other path under `${AIDE_TARGET_DIR}` during this step. In particular, preserve unrelated files or directories added by the user and preserve `.aide-install.json` until Step 12 refreshes it.

**Drain the terminal before the next step.** Copying `.agents/` alone is hundreds of files; on agents with a persistent shell session, the previous command's output buffer may still be flushing when the next `run_in_terminal` call fires, causing trivial follow-ups (e.g. the Step 6 copy, or the Step 11 `Test-Path` checks) to time out on the readiness probe. Mitigate the same way as Step 3d: prefer running the dependent follow-up in the same shell call and gate it on successful completion of the bulk operation, or insert a short `Start-Sleep -Milliseconds 500` / `sleep 0.5` between calls. This applies after **any** bulk filesystem operation in this runbook, not just this one.

### Step 6 — Copy the optional subset
By default, also copy:
- `README.md` — human reference (not consumed by skills)

Before copying it, require source `README.md` to be a regular, non-link file.

Skip if the user opted out.
When the user opts out, do not create, replace, or remove `${AIDE_TARGET_DIR}/README.md`.

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
> Resolve the destination and `${AIDE_TARGET_DIR}`, then compare them by path components. If the destination is the target itself or a descendant of it (e.g. `AIDE/.agents/skills/...`), **STOP** — that is the canonical tree, which must remain a verbatim copy of source. Do not use a raw string-prefix check. The shim destination is always the bare workspace root: `./.agents/skills/<skill>/SKILL.md`.

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

**Phase A — Preflight**

1. Enumerate every `<stage>/<skill>/SKILL.md` exactly two levels deep under `${AIDE_TARGET_DIR}/.agents/skills/`. Ignore any stage folder whose name begins with `_` (e.g. `_registry`). These canonical SOURCE files remain read-only throughout Step 8.
2. Require at least one canonical SOURCE file and require one whose `<skill>` folder name is exactly `start-project`. If either requirement fails, report it and stop Step 8 without deleting or writing any workspace-root shim.
3. Check for duplicate `<skill>` folder names across stages. Compare names case-insensitively so the result is safe on case-insensitive filesystems. If two or more SOURCE files would map to the same `./.agents/skills/<skill>/SKILL.md` destination, report every conflicting source path and stop Step 8 without deleting or writing any shim. Do not choose a winner based on traversal order.
4. Validate every SOURCE file's frontmatter. After an optional UTF-8 BOM, the first line must be exactly `---`, a later line must be exactly `---` to close the block, and the content between them must parse using a safe YAML parser with arbitrary object construction disabled. The top level must be a mapping, and all mapping keys at every level must be strings. Reject duplicate keys, custom tags, anchors, and aliases. If validation traverses a parser AST, treat a missing or `null` child collection as an empty collection: scalar/leaf nodes commonly expose `children = null`, which is not a validation error. When the agent generates validator code dynamically, syntax-check or compile the complete validator before executing it or allowing it to modify installation paths. Prefer readable multi-line code over compressed one-line expressions. For Ruby, put whitespace around ternary operators (`condition ? true_value : false_value`), especially when the condition is a predicate method ending in `?`; forms such as `predicate?value:other` are parser-ambiguous. A validator syntax error is an installer implementation error, not invalid AIDE source: correct the validator and retry the same phase without presenting it as a source or installation compatibility failure. If any SOURCE file has missing, malformed, or unsafe frontmatter, report every invalid source path and stop Step 8 without deleting or writing any shim.
5. Validate the frontmatter that each shim will emit, applying the planned `name:` normalization before validation:
   - The authoritative `<skill>` folder name, and therefore emitted `name`, must be 1–64 characters, contain only lowercase ASCII letters, digits, and single hyphens, and must not start or end with a hyphen or contain consecutive hyphens.
   - `description` must exist, must be a string, must be non-empty after trimming whitespace, and must contain at most 1024 characters.

   Aggregate and report every invalid SOURCE file, then stop before the Cleanup phase. Do not generate a shim that violates these Agent Skills requirements.
6. Inspect the existing workspace shim root without following links. If `./.agents/skills/` exists, it must be a regular directory. Every immediate child considered by cleanup must be a regular directory, and every existing `<folder>/SKILL.md` must be a regular file. Also inspect every computed destination for canonical skills. If any relevant path is a link, special entry, directory where `SKILL.md` should be a file, or other unexpected object type, aggregate and report all such paths and stop before Cleanup.

**Phase B — Cleanup**

If `./.agents/skills/` already exists at the workspace root, sweep it before generating anything new. Walk its immediate-child folders; for each child folder whose name does **not** begin with `_`:

   - If `<folder>/SKILL.md` exists **and** contains a standalone line exactly equal to `<!-- aide:generated-shim -->`, delete only that `SKILL.md`, regardless of whether sibling files exist. Remove `<folder>` only if it is then empty. If sibling files remain, preserve them and emit a warning.
   - If `<folder>/SKILL.md` exists but does **not** contain that exact standalone marker line, leave the folder untouched and emit a warning — it is hand-authored.
   - If `<folder>/SKILL.md` does not exist, leave any other folder content untouched.

This guarantees a clean slate of marker-tagged shims before regeneration, automatically handling skills that were renamed, moved between stages, or removed from the canonical tree since the last install. Hand-authored files and any non-shim content under `./.agents/skills/` are preserved.

**Phase C — Generation**

1. **Read frontmatter.** For each SOURCE file, read it as UTF-8 and split off the YAML frontmatter block validated during preflight — from the opening `---` line through the closing `---` line, inclusive. Never search later in the body for an opening delimiter.

2. **Determine the skill name.** Take the `name:` value from the frontmatter (strip surrounding quotes if present). The `<skill>` folder name is authoritative:
   - If `name:` differs from the folder name, warn and replace only the shim frontmatter's `name:` value with the folder name.
   - If `name:` is missing, warn and insert `name: <skill>` immediately after the opening `---` line in the shim frontmatter.

   Never modify the canonical SOURCE file.

3. **Compute the DESTINATION path.** It is always:

   ```
   ./.agents/skills/<skill>/SKILL.md
   ```

   Relative to the workspace root. **Not** `${AIDE_TARGET_DIR}/.agents/skills/<skill>/SKILL.md`. **Not** `${AIDE_TARGET_DIR}/.agents/skills/<stage>/<skill>/SKILL.md`. Just `./.agents/skills/<skill>/SKILL.md`.

   Self-check before continuing: resolve both paths and perform a path-component-aware containment check. The destination must be neither `${AIDE_TARGET_DIR}` itself nor a descendant of it. Do not use a raw string-prefix test, because sibling names such as `AIDE-tools` can share the same textual prefix without being inside `AIDE/`.

4. **Render the shim content.** It is a string with two parts:

   - **Part A** — the SOURCE file's frontmatter block, with only the `name:` normalization from generation step 2 applied when necessary.
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

5. **Write the shim** to the DESTINATION path from generation step 3. Apply the link-safety rule before creating parent directories and again before writing the file. Create parent directories under `./.agents/skills/` as needed.

6. **Idempotency / safety rule.** The Cleanup phase has already removed every marker-tagged shim, so in normal operation the DESTINATION will not exist when generation step 5 runs. The only way a file can still be there is if it lacks the marker — in which case it is hand-authored. If you find a pre-existing DESTINATION file at write time:
   - Confirm it contains a standalone line exactly equal to `<!-- aide:generated-shim -->`. If yes, overwrite (this should be rare — only possible if the clean sweep in step 0 was skipped or failed partially).
   - If it does **not** contain that exact standalone marker line, leave it alone and emit a warning. The runbook must never clobber hand-authored files.

**Phase D — Verification**

**Expected result.** A single flat layer of generated shim files at `./.agents/skills/<skill>/SKILL.md`. Compatible hosts can discover them when configured to scan the workspace-relative `.agents/skills/` root; exact discovery defaults depend on the host and version. The canonical nested tree inside `AIDE/` is the single source of truth and is unchanged from Step 5; the workspace-root layer is purely the discovery surface.

**Wrong vs. right (sanity check):**

| ❌ Wrong destination                                        | ✅ Right destination                                        |
|------------------------------------------------------------|------------------------------------------------------------|
| `${AIDE_TARGET_DIR}/.agents/skills/start-project/SKILL.md` | `./.agents/skills/start-project/SKILL.md`                  |
| `AIDE/.agents/skills/start-project/SKILL.md`               | `.agents/skills/start-project/SKILL.md`                    |
| Anything under `${AIDE_TARGET_DIR}/`                       | The workspace root (the directory that *contains* `AIDE/`) |

If after running this step the listing of `${AIDE_TARGET_DIR}/.agents/skills/` shows anything beyond the canonical stage subfolders (`meta/`, `requirements/`, `design/`, `_registry/`, …) and a single flat `<skill>/` folder appears there, **the shims were written to the wrong place**. Report the pollution and stop without modifying the canonical tree. Rerun the installation so Step 5 restores the canonical `.agents/` tree, then regenerate shims at `./.agents/skills/`.

### Step 9 — Generate / refresh the workspace-root orientation block

Hosts that support workspace-root `AGENTS.md` may auto-attach it to agent context. AIDE publishes its framework orientation (plus the host-agnostic coding-standards addendum) into `./AGENTS.md` as a **managed block** delimited by sentinel comments, so the file can also hold hand-authored content the user owns. AIDE only ever writes **between** the sentinels; everything outside them is preserved verbatim across installs.

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

   Determine `EOL` from the first line-ending sequence in `src`: use `\r\n` when the first line ending is CRLF, otherwise use `\n`. If `src` has no line ending, default to `\n`. Preserve all existing internal line endings in `src`.

2. **Read ADDENDUM into memory.** Read `${AIDE_TARGET_DIR}/references/orientation/workspace-agents-coding-standards.md` as UTF-8 into a single string `addendum`. If the file is missing or empty, emit a warning, set `addendum = ""`, and continue — older AIDE installs may not ship it, and the runbook must remain backward-compatible.

   **Strip and validate the leading SOT comment.** The addendum file may open with an HTML comment block (`<!-- … -->`) that documents the source-of-truth and splice-anchor contract for AIDE maintainers. That comment is build-time plumbing, **not** user-facing orientation, and must not leak into `./AGENTS.md`. If `addendum` begins (after any leading whitespace) with `<!--`, require a matching `-->`; if it is missing, stop before modifying `./AGENTS.md` and report the malformed addendum. Otherwise remove everything through that matching `-->` **inclusive**, then trim any leading blank lines. Strip only this single leading comment block; leave later comments untouched.

   After optional comment removal, require the exact line `## Coding standards (auto-enforced per repo)` in every non-empty addendum. If it is absent, stop before modifying `./AGENTS.md` and report the incompatible addendum.

3. **Validate the anchor and splice the addendum.** Locate the literal line `## What this folder is NOT` in `src` regardless of whether `addendum` is empty.
   - **If the anchor is not found:** stop before modifying `./AGENTS.md` and report that the AIDE source is incompatible because the required anchor is missing.
   - **If the anchor is found and `addendum` is non-empty:** preserve the addendum's internal line endings, remove only its trailing line-ending sequences, then insert it followed by `EOL + EOL` immediately **before** the heading line. Do not normalize existing line endings in `src` or inside `addendum`. Call the result `composed_body`.
   - **If the anchor is found and `addendum` is empty:** set `composed_body = src` unchanged.

4. **Build the managed block** in memory:

   ```
   <BEGIN><EOL><composed_body><EOL><END><EOL>
   ```

   Remove only trailing line-ending sequences from `composed_body`, then add exactly one `EOL` before `END` so the end sentinel sits on its own line. Generated separators use `EOL`; existing internal source and addendum line endings remain unchanged.

5. **Inspect DESTINATION (`./AGENTS.md`) and choose a write mode:** If the destination exists, require it to be a regular non-link file. If it is a directory or any other filesystem object type, stop without replacing it. Otherwise count begin/end **sentinel lines** only (per the "sentinel _line_" rule above) — lines that, after leading whitespace, start with `<!-- aide:managed:begin` / `<!-- aide:managed:end`. Prose that merely mentions the substrings does not count.

   - **(a) File does not exist** → **Create.** Write the managed block as the whole file. Line 1 will be `BEGIN`.

   - **(b) File exists and contains exactly one begin sentinel line and one end sentinel line** (begin before end) → **Replace-in-place.** Substitute everything from the `BEGIN` line through the `END` line (inclusive) with the freshly built managed block. Preserve every byte outside the block — content above and below is the user's. **Emit a warning:** *"Refreshed the AIDE managed block in ./AGENTS.md. Any edits made between the aide:managed:begin/end sentinels were discarded by design — put custom content outside the block."*

   - **(c) File exists, no sentinel lines, but line 1 is `LEGACY`** → **Migrate.** The whole file is a pre-managed-block generated copy; replace the entire file with the managed block. Warn: *"Migrated ./AGENTS.md from the legacy whole-file format to the managed-block format."*

   - **(d) File exists, no sentinel lines, not `LEGACY`** → **First adoption on hand-authored file.** **Prepend** the managed block, followed by a blank line, above the user's existing content. The user's bytes are preserved unchanged, pushed below the block. Warn: *"Found a hand-authored ./AGENTS.md. Prepended the AIDE managed block above your content; your content is untouched. Do not edit inside the aide:managed:begin/end sentinels — that region is regenerated on every install."*

   - **(e) File exists with exactly one sentinel line, or `END` precedes `BEGIN`, or more than one begin or end sentinel line** → **Malformed — do not modify.** Leave the file alone, emit a warning naming the anomaly, and stop the installation. Do not write provenance or print the completion banner. Refusing to edit avoids destroying user content around a corrupted block. (The user fixes the sentinels and re-runs.)

6. **Write atomically to DESTINATION via the file-edit tool.** Re-run the link-safety check for `./AGENTS.md`. Allocate a unique, non-existent sibling temporary file in the workspace root; do not use a fixed name and do not overwrite an existing path. Apply link-safety checks to the temporary path, write the complete composed string to it in one call, then atomically replace `./AGENTS.md` when supported. Clean the temporary file on every failure or abort; if cleanup fails, warn and report its exact path. Do **not** spawn a shell, pipe, or redirect when a file-edit tool is available.

7. **Verify** by re-reading `./AGENTS.md` and confirming:
   - The file contains exactly one `aide:managed:begin` and one `aide:managed:end` **sentinel line** (per the sentinel-line rule above), with begin before end.
   - Between the sentinels, the file contains the heading `## Coding standards (auto-enforced per repo)` (the spliced addendum landed) — skip this assertion only if Step 9, algorithm step 2, set `addendum = ""`.
   - Between the sentinels, the file contains the heading `## What this folder is NOT` (the source body survived intact).
   - The bytes **outside** the block match what was intended: none for modes (a) and (c), and exactly the prior out-of-block user content for modes (b) and (d).

   If any assertion fails, the write failed silently or the splice corrupted the body — stop and report.

> **Note on idempotency.** Re-running Step 9 is always safe: modes (b)/(c) replace the block, (d) only prepends the first time (subsequent runs see the sentinels and take mode (b)), and (e) protects corrupted files. The user's out-of-block content is invariant across any number of installs.

**Last-resort shell fallback (only if the agent has no file-write tool at all).** Preallocate a unique, non-existent sibling path and store it in `$agentsTemp` (PowerShell) or `$agents_temp` (Bash). Use a write-to-temp-then-rename pattern in a single non-interactive shell invocation, and never redirect into a file the IDE may have open. `$composed` must be the **entire intended file contents** — for replace-in-place (mode b) and first-adoption prepend (mode d) that means the agent has already merged the managed block with the preserved out-of-block bytes in memory; the shell step only writes the final result, it does not splice:

- **PowerShell:** `Set-Content -LiteralPath $agentsTemp -Value $composed -NoNewline -Encoding utf8; Move-Item -Force -LiteralPath $agentsTemp -Destination AGENTS.md`
- **Bash:** `printf '%s' "$composed" > "$agents_temp" && mv -f -- "$agents_temp" AGENTS.md`

If the shell write or rename fails, remove only the preallocated temporary path using the same link-safety rules. Do not use `{ echo ...; cat ...; } > AGENTS.md`, `Get-Content ... | Set-Content AGENTS.md`, or any other pipeline that writes directly to the live `AGENTS.md` — these are the patterns that have hung sessions.

No symlinks. No junctions. Plain file, plain copy. Re-install refreshes it.

### Step 10 — Clean up
For option B, remove only the exact resolved `<temp-dir>` allocated by this installation run. Before removal, confirm it is not the workspace root, `${AIDE_TARGET_DIR}`, or either path's ancestor. Apply this same guarded cleanup on success, failure, abort, and before every retry. If cleanup fails, warn and report the retained path. Option A does not create a temporary directory.

### Step 11 — Verify the installation
Confirm all the following exist:

- `${AIDE_TARGET_DIR}/AGENTS.md`
- `${AIDE_TARGET_DIR}/.agents/skills/_registry/skills.csv`
- `${AIDE_TARGET_DIR}/config/SCHEMAS.md`
- `${AIDE_TARGET_DIR}/templates/README.md`
- `./.agents/skills/start-project/SKILL.md` — exists and contains a standalone line exactly equal to `<!-- aide:generated-shim -->`; this specific shim is required because `/start-project` is the documented entry point in Step 13
- `./AGENTS.md` — contains the `aide:managed:begin` and `aide:managed:end` sentinel lines (one each, begin before end; a *sentinel line* starts with the marker after optional leading whitespace — prose that merely mentions the substring does not count).
- `./AGENTS.md` — contains the heading `## Coding standards (auto-enforced per repo)` **inside** the managed block (Step 9 addendum splice landed), and the SOT comment that opens the addendum source is **not** present (Step 9.2 strip succeeded). Skip both assertions only if `${AIDE_TARGET_DIR}/references/orientation/workspace-agents-coding-standards.md` is missing (older AIDE install).

**Assert the canonical tree was not polluted.** List the immediate children of `${AIDE_TARGET_DIR}/.agents/skills/`. Every entry must be `_registry`, a stage directory, or the regular non-link metadata file `README.md`. Ignore the allowed root `README.md` when checking the nested skill layout; it documents the skills tree and is not a stage or a generated shim. A stage directory may be empty and may represent a future or add-on stage, but it must not contain a direct child `SKILL.md`; canonical skills have the shape `<stage>/<skill>/SKILL.md`. Known stage examples include `meta`, `requirements`, `design`, `planning`, `execution`, `reverse-engineering`, `knowledge-base`, `quick-dev`, `jira`, `confluence`, and `files-conversion`. If you see a flat skill folder with a direct `SKILL.md` there (e.g. `${AIDE_TARGET_DIR}/.agents/skills/start-project/`), report the pollution and stop without deleting anything from the canonical tree. Rerun the installation so Step 5 restores `.agents/`, then let Step 8 regenerate shims at the workspace root.

If any of the required files are missing or the assertion fails, report which and stop — do not silently continue.

### Step 12 — Record provenance
Compose `${AIDE_TARGET_DIR}/.aide-install.json` in memory. The example below shows the schema with **representative values**; the agent fills each field with the real resolved value at install time (counts come from Step 8, timestamps from the system clock, etc.). Use `null` for metadata that cannot be determined; do not invent placeholder values.

```json
{
  "schema_version": 1,
  "source_method": "git-clone",
  "source_provider": "azure-devops",
  "source_dir": null,
  "source_url": "https://dev.azure.com/IntelliwareDev/AI_Knowledge_Repo/_git/AIDE",
  "ref": "main",
  "ref_type": "branch",
  "ref_verified": true,
  "commit_sha": "0123456789abcdef0123456789abcdef01234567",
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
    "agents_md_write_mode": "create"
  }
}
```

Populate source fields as follows:

- **Availability option A:** set `source_method` to `local-directory`, `source_dir` to the resolved local path, and `source_provider` to `null`; do not ask the user to select a provider. If the directory is a Git clone and its current ref/commit can be resolved and verified, record the Git metadata and set `ref_verified=true`; if metadata is unavailable, set unavailable fields and `ref_verified` to `null`.
- **Option B using Git:** set `source_method` to `git-clone`, `source_dir` to `null`, record the resolved provider URL, ref, ref type, and verified checked-out commit SHA, and set `ref_verified=true`.
- **Option B using ZIP:** set `source_method` to `zip`, `source_dir` to `null`, and record the provider URL, requested ref, and ref type. Record `commit_sha` only when `AIDE_REF_TYPE=commit`; otherwise use `null`. Set `ref_verified=false` unless the archive-to-ref relationship was independently proven; do not treat the filename or user-supplied URL alone as proof.

Never record credentials or authenticated forms of a source URL. `schema_version` must be `1`; reject unsupported versions rather than guessing their meaning.

Apply destination link-safety checks, allocate a unique non-existent sibling temporary file under `${AIDE_TARGET_DIR}`, and write the complete JSON to it in one call. Parse the temporary file as JSON and validate every field against the provenance schema before atomically replacing `.aide-install.json`. Re-read and validate the final file after replacement. On any write, parse, validation, or replacement failure, stop without printing the completion banner and clean only the unique temporary file; if cleanup fails, warn and report its exact path.

### Step 13 — Print next-steps banner
If Step 6 copied `README.md`, tell the user:

> A.I.D.E. is installed at `${AIDE_TARGET_DIR}`. In a compatible IDE configured to scan `.agents/skills/`, type `/` to check skill discovery. If skills don't appear, verify the host configuration and reopen the workspace. Next: see `${AIDE_TARGET_DIR}/README.md` Step 2 (IDE setup) and Step 3 (`/start-project`).

If the user opted out of copying `README.md`, tell the user:

> A.I.D.E. is installed at `${AIDE_TARGET_DIR}`. In a compatible IDE configured to scan `.agents/skills/`, type `/` to check skill discovery. If skills don't appear, verify the host configuration and reopen the workspace. Next: run `/start-project`.

---

## 4. Uninstall

Apply the link-safety precondition to every path before uninstall modifies it. If any destination or existing component beneath the resolved workspace root is a symlink or junction, stop without unlinking or following it.

1. Read `${AIDE_TARGET_DIR}/.aide-install.json` first, if present, so optional copied paths can be identified. Accept it only if it parses, validates, and has supported `schema_version: 1`. Treat missing, malformed, invalid, or unsupported-version provenance as untrusted and ask for explicit confirmation before deleting any target managed path. If the user declines, skip target cleanup and continue only with the marker/sentinel-owned workspace-root cleanup in steps 2–3.

   After provenance is read or missing-provenance cleanup is explicitly confirmed, remove only these AIDE-managed paths from `${AIDE_TARGET_DIR}`:
   - `AGENTS.md`
   - `.agents/`
   - `config/`
   - `templates/`
   - `references/`
   - `README.md` only if the provenance file lists it in `optional_paths`; if provenance is missing or does not list it, preserve it
   - `.aide-install.json`

   Preserve every unlisted file or directory. After removing the managed paths, delete `${AIDE_TARGET_DIR}` only if it is empty. If unrelated content remains, keep the directory and report the preserved paths to the user.
2. Delete `./.agents/skills/<skill>/SKILL.md` files at the workspace root only when the file contains a standalone line exactly equal to `<!-- aide:generated-shim -->`, then remove any now-empty parent folders (including `./.agents/skills/` and `./.agents/` if empty). Preserve any shim file lacking that exact standalone marker line — it is hand-authored.
3. In `./AGENTS.md`:
   - If the path exists but is not a regular non-link file, stop without modifying it.
   - Count sentinel lines using Step 9's sentinel-line detection rule.
   - If there is exactly one begin sentinel line and one end sentinel line, with begin before end → **remove only the managed block** (the sentinels and everything between them), collapsing one adjacent blank line if removal leaves a double blank. Preserve all content outside the block. If the file is left empty (the block was the whole file), delete the file.
   - If there are no sentinel lines and line 1 is the legacy `<!-- aide:generated-agents -->` marker → delete the file (it is wholly generated).
   - If there are no sentinel lines and line 1 is not the legacy marker → leave the file alone (fully hand-authored).
   - If the sentinels are malformed (only one sentinel line, end before begin, or duplicate begin/end lines) → leave the file unchanged and warn. Do not guess the intended block boundaries.

---

## 5. Troubleshooting

- **Skills don't appear in a compatible host's slash picker.** Confirm the host is configured to scan `.agents/skills/`, then confirm Step 8 ran — the required entry-point shim `./.agents/skills/start-project/SKILL.md` must exist at the workspace root and contain a standalone line exactly equal to `<!-- aide:generated-shim -->`. If only the canonical files inside `${AIDE_TARGET_DIR}/.agents/skills/<stage>/<skill>/SKILL.md` exist, the flat-shim pass was skipped — re-run the installation, then reload the IDE window.
- **AIDE updated but skills look stale.** Step 8's Cleanup phase sweeps every marker-tagged shim under `./.agents/skills/` before regeneration. Re-running the one-line prompt is always safe and guarantees the workspace-root shims match the current canonical tree — renamed, moved, or deleted skills are picked up automatically.
- **Network blocked / no `git`.** Follow the Step 3c decision: ask the user to install Git or provide a provider-specific ZIP. If the user clones the repository manually, restart with availability option A and use the local clone as `AIDE_SOURCE_DIR`.
- **`git clone` or download returns 404 / 403 / "repository cannot be found".** This may be an **authentication or SSO** problem rather than a missing repo, especially for private or enterprise-mirrored Azure DevOps or GitHub sources. Do not report the repo as non-existent without confirmation, and do **not** switch to provider CLI or REST probes to "double-check." Follow the failure protocol in Step 3: authenticate through Git and retry once, or ask the user to clone locally and choose option A.
- **Private source repo.** The user must authenticate through a Git credential helper, SSH agent, provider-supported sign-in flow, or corporate SSO. Never ask the user to paste a PAT into chat or embed credentials in the repository URL. Alternatively, have the user clone the repository and choose option A.
- **Hand-authored file at the workspace root.** Step 8 refuses to overwrite any `./.agents/skills/<skill>/SKILL.md` that lacks the `<!-- aide:generated-shim -->` marker. Step 9 treats a hand-authored `./AGENTS.md` (no `aide:managed:begin`/`end` sentinels, not the legacy marker) by **prepending** the AIDE managed block above your content and leaving your content untouched below it — it no longer skips the file. Only edits made *inside* the `aide:managed:begin`/`end` sentinels are lost on re-install; keep your own content outside the block. If the sentinels are malformed (only one present, or out of order), Step 9 refuses to modify the file and warns — fix the sentinels and re-run.
- **Verification command times out immediately after a large copy or clone.** Symptom: a trivial command (`Test-Path`, `git --version`, `ls`, `Get-ChildItem`) reports a timeout when run as the very next `run_in_terminal` call after Step 3's `git clone` or Step 5's bulk copy of `.agents/`, even though the prior bulk command reported success and the file/directory clearly exists. This is **not** a hang of the trivial command — it is the agent's readiness probe racing the previous command's output buffer flush on a persistent shell session. The shell is idle; the pipe between shell and agent loop has not drained. Two fixes, in order of preference: (1) run verification in the same shell call, gated on successful completion of the bulk operation (`&&` in Bash; an explicit `$LASTEXITCODE -eq 0` check in PowerShell); (2) insert a short drain between calls — `Start-Sleep -Milliseconds 500` in PowerShell, `sleep 0.5` in Bash — before verification. Applies after any bulk filesystem operation, not just clone/copy.
- **Step 9 hung the chat / "No output was produced by the command".** The agent implemented Step 9 as a shell redirection (e.g. `{ echo ...; cat AIDE/AGENTS.md; } > AGENTS.md` or `Get-Content ... | Set-Content AGENTS.md`) writing directly to the live `./AGENTS.md`. Because the IDE auto-attaches that file to chat context, the truncating open races or fails silently and the agent loop blocks waiting on stdout that never arrives. Re-run the install and ensure Step 9 uses the agent's in-process file-edit tool (read-file → write-file in memory), or, as a last resort, the temp-file-then-rename shell pattern documented in Step 9. Never redirect into the live `AGENTS.md`.
- **Workspace is under Git.** If the user is vendoring AIDE without committing it, convert the validated target path to a workspace-relative path, escape any special characters according to `.gitignore` syntax, and suggest a root-anchored directory pattern such as `/AIDE/`. Do not insert an absolute path or the literal `${AIDE_TARGET_DIR}` placeholder. Do not automatically ignore the entire workspace-root `.agents/` directory or `AGENTS.md`; either may contain hand-authored content that should remain visible to version control. Ask the user how they want to track generated workspace-root integration files.

---

## 6. Machine-readable manifest

Agents that prefer structured input may parse this block directly instead of the prose above. It is authoritative — if prose and YAML disagree, the YAML wins.

```yaml
aide_install:
  manifest:
    schema_version: 1
    authoritative: true
    on_conflict_with_prose: yaml_wins
  invocation_prompt:
    template: "Install the AIDE framework by following the instructions at `<INSTRUCTIONS_LOCATION>`."
    replace_location_with_one_of:
      - workspace_relative_path
      - absolute_path
      - file_uri
      - https_url
    workspace_root_default: INSTRUCTIONS.md
  defaults:
    source_provider: azure-devops
    source_dir: ../AIDE
    source_url: https://dev.azure.com/IntelliwareDev/AI_Knowledge_Repo/_git/AIDE
    ref: main
    ref_type: branch
    target_dir: ./AIDE
  path_resolution:
    base: workspace_root
    resolve_relative:
      - AIDE_SOURCE_DIR
      - AIDE_TARGET_DIR
    normalize_absolute_paths_before_comparison: true
    resolve_symlinks_where_supported: true
    target_location:
      must_be_strict_descendant_of_workspace_root: true
      reject_workspace_root_itself: true
      reject_outside_workspace_root: true
      validate_before_create_or_modify: true
  filesystem_link_safety:
    inspect_without_following_links: true
    resolve_workspace_root_itself_first: true
    forbid_symlink_or_junction_components_beneath_workspace_root_for:
      - "${AIDE_TARGET_DIR}"
      - "${AIDE_TARGET_DIR}/<managed-path>"
      - "./.agents/skills/<skill>/SKILL.md"
      - "./AGENTS.md"
    revalidate:
      - after_destination_directory_creation
      - immediately_before_every_destructive_operation
      - during_uninstall
    on_link_detected:
      - stop
      - report_exact_path
      - never_follow
      - never_unlink
  inputs:
    source_availability:
      ask_user: true
      ask_first: true
      options:
        local-directory:
          set: AIDE_SOURCE_DIR
          ask_user_for_path: true
          recommend_for_private_sso_or_enterprise_mirror: true
          path_validation:
            reject_same_as_target: true
            reject_source_ancestor_of_target: true
            reject_target_ancestor_of_source: true
            comparison: normalized_absolute_path_components
        download:
          set_from_selected_provider: AIDE_SOURCE_URL
          prompt_for_default_or_custom_repository_url: true
          allow_provider_default_url: true
          allow_fork_or_mirror_url: true
          custom_url_validation:
            parse_locally_without_network_preflight: true
            must_match_selected_provider_family: true
            allow_user_confirmed_enterprise_host: true
            reject_different_or_unsupported_provider: true
            clone_url_schemes:
              - https
              - ssh
            zip_url_derivation_requires_https_web_or_clone_url: true
    source_provider:
      ask_user: true
      ask_only_when_source_availability: download
      display_choices:
        A: azure-devops
        B: github
      options:
        - azure-devops
        - github
      default: azure-devops
    remaining_values:
      use_defaults_silently: true
      confirm_only_when_user_requests_change: true
    ref:
      default_value: main
      default_type: branch
      when_value_changes:
        ask_for_type: true
        allowed_types:
          - branch
          - tag
          - commit
      infer_type_from_ref_text: false
  source_providers:
    azure-devops:
      source_url: https://dev.azure.com/IntelliwareDev/AI_Knowledge_Repo/_git/AIDE
      ssh_fallback_url: git@ssh.dev.azure.com:v3/IntelliwareDev/AI_Knowledge_Repo/AIDE
    github:
      source_url: https://github.com/<owner>/<repo>
  preconditions:
    workspace_root_identified: true
    source_identity:
      applies_to:
        - local-directory
        - git-clone
        - zip
      required_readme:
        path: README.md
        type: regular_file
        symlink_or_junction: forbidden
        optional_utf8_bom_before_first_line: true
        exact_first_line: "# A.I.D.E. (AI Integrated Delivery Enablement)"
      validate_after_source_available_before_target_create_or_modify: true
      applies_even_when_optional_readme_copy_opted_out: true
    local-directory:
      source_dir_must_exist: true
      reject_source_target_overlap: true
    download:
      require_network_access_to_source_url: true
      when_git_unavailable: prompt_no_git_decision
  existing_install:
    detect_when_any_path_exists:
      - "${AIDE_TARGET_DIR}/AGENTS.md"
      - "${AIDE_TARGET_DIR}/.agents"
      - "${AIDE_TARGET_DIR}/config"
      - "${AIDE_TARGET_DIR}/templates"
      - "${AIDE_TARGET_DIR}/references"
      - "${AIDE_TARGET_DIR}/README.md"
      - "${AIDE_TARGET_DIR}/.aide-install.json"
    when_detected:
      prompt_once:
        options:
          overwrite:
            replace_managed_paths_only: true
            preserve_unlisted_target_paths: true
          abort:
            stop: true
    update_intent:
      implies_overwrite_without_prompt: true
      requires_clear_reference_to_aide_installation: true
      keyword_occurrence_without_aide_context_is_not_consent: true
      requires_verified_existing_install:
        provenance_path: "${AIDE_TARGET_DIR}/.aide-install.json"
        must_exist: true
        must_parse_as_json: true
        must_validate_against_provenance_schema: true
        must_not_contain_credentials: true
        resolved_target_dir_must_match_current_target: true
      when_verification_fails_or_provenance_missing: prompt_normal_overwrite_or_abort
      keywords:
        - update
        - upgrade
        - refresh
        - re-install
        - reinstall
        - sync
        - pull latest
        - bring AIDE up to date
  workflow_order:
    - resolve_inputs
    - detect_existing_install
    - fetch_source_for_download_option
    - create_target
    - replace_and_copy_mandatory_paths
    - copy_optional_paths_unless_opted_out
    - generate_workspace_skill_shims
    - generate_or_refresh_workspace_agents_md
    - remove_temporary_source
    - verify_installation
    - write_provenance
    - print_next_steps
  source_materialization:
    temp_dir:
      allocate_for:
        - git-clone
        - zip
      prefer_system_temp_directory: true
      unique_per_installation_run: true
      must_be_new_or_empty: true
      outside_target_dir: true
      never_share_or_reuse: true
      record_exact_resolved_path_for_cleanup: true
    local-directory:
      source_root: "${AIDE_SOURCE_DIR}"
      create_temp_dir: false
    git-clone:
      source_root: "<temp-dir>"
      create_temp_dir: true
    zip:
      source_root: "<temp-dir>"
      create_temp_dir: true
      strip_provider_added_top_level_directory: true
      require_exactly_one_top_level_archive_directory: true
      never_search_recursively_for_source_root: true
      required_paths_directly_under_archive_top_level:
        - AGENTS.md
        - .agents/
        - config/
        - templates/
        - references/
        - README.md
      revalidate_required_paths_after_top_level_strip: true
      revalidate_readme_identity_after_top_level_strip: true
    cleanup:
      local-directory: no_action
      git-clone: remove_guarded_temp_dir_at_step_10
      zip: remove_guarded_temp_dir_at_step_10
      apply_on:
        - success
        - failure
        - abort
        - before_retry
      guard_before_removal:
        remove_only_recorded_exact_resolved_temp_path: true
        reject_workspace_root: true
        reject_target_dir: true
        reject_ancestor_of_workspace_or_target: true
      on_cleanup_failure:
        warn: true
        report_exact_retained_temp_path: true
  copy:
    - AGENTS.md
    - .agents/
    - config/
    - templates/
    - references/
  create_target:
    prefer: tool_native_directory_operation
    shell_fallbacks:
      bash: 'mkdir -p -- "${AIDE_TARGET_DIR}"'
      powershell: 'New-Item -ItemType Directory -Force -LiteralPath "${AIDE_TARGET_DIR}" | Out-Null'
  managed_path_refresh:
    validate_all_sources_before_modifying_destination: true
    source_type_validation:
      AGENTS.md: regular_file
      .agents/: directory
      config/: directory
      templates/: directory
      references/: directory
      recursive_allowed_entry_types:
        - regular_file
        - directory
      recursive_forbidden_entry_types:
        - symbolic_link
        - junction
        - device
        - socket
        - named_pipe
        - other_special_entry
      inspect_without_following_links: true
    source_validation_failure:
      report_all_missing_managed_paths: true
      stop_without_modifying_destination: true
    strategy: replace_each_managed_path_then_copy
    remove_existing_managed_destination_before_copy: true
    copy_each_managed_source_path_in_full: true
    prevents_stale_files: true
    preserve_unlisted_target_paths: true
    preserve_provenance_until_step_12: true
    source_root_by_method:
      local-directory: "${AIDE_SOURCE_DIR}"
      git-clone: "<temp-dir>"
      zip: "<temp-dir>"
  bulk_operation_terminal_drain:
    applies_after:
      - git_clone
      - zip_extract
      - bulk_copy
    preferred: run_dependent_follow_up_in_same_shell_call_gated_on_prior_success
    unconditional_semicolon_chain: forbidden
    fallback:
      powershell: "Start-Sleep -Milliseconds 500"
      bash: "sleep 0.5"
  fetch:
    applies_only_when_source_availability: download
    probe_first: "git --version"        # MUST run before any fetch attempt
    require_git_when_available: true    # if `git --version` works, `git clone`
                                        # is MANDATORY — no HTTP fallback allowed
    prefer: git_clone                   # uses the user's local credential helper
    command_execution:
      prefer_tool_native_argument_array: true
      shell_string_concatenation: forbidden
      shell_fallback:
        reject_control_characters_in:
          - AIDE_SOURCE_URL
          - AIDE_REF
          - temp_dir
        rejected_characters:
          - NUL
          - carriage_return
          - newline
        quote_every_variable_for_active_shell: true
    ref_handling:
      branch:
        command: "git clone --depth 1 --branch \"${AIDE_REF}\" -- \"${AIDE_SOURCE_URL}\" \"<temp-dir>\""
      tag:
        command: "git clone --depth 1 --branch \"${AIDE_REF}\" -- \"${AIDE_SOURCE_URL}\" \"<temp-dir>\""
      commit:
        require_full_commit_sha: true
        commands:
          - "git clone --no-checkout -- \"${AIDE_SOURCE_URL}\" \"<temp-dir>\""
          - "git -C \"<temp-dir>\" checkout --detach \"${AIDE_REF}\""
        on_checkout_failure:
          ask_user_to_confirm_sha: true
          never_fallback_to_default_branch: true
      verify_after_clone_or_checkout:
        resolve_head: "HEAD^{commit}"
        expected_ref_by_type:
          branch: "refs/heads/${AIDE_REF}^{commit}"
          tag: "refs/tags/${AIDE_REF}^{commit}"
          commit: "${AIDE_REF}^{commit}"
        require_expected_commit_equals_head: true
        on_resolution_or_mismatch:
          treat_as_git_ref_failure: true
          stop_before_copy: true
        record_verified_full_head_sha_for_provenance: true
    forbid_api_preflight: true          # do NOT call provider REST APIs to check
                                        # existence before cloning; they may not use
                                        # credentials available to the Git helper
    forbidden_fetch_verbs:              # never use any of these for the source repo
      - Invoke-WebRequest
      - iwr
      - Invoke-RestMethod
      - curl
      - wget
      - az repos show
      - gh api
      - gh repo view
    forbidden_preflight_paths:
      - "_apis/git/"
      - "api.github.com"
      - "raw.githubusercontent.com"
    interpret_not_found_as: "verify_auth_before_repo_missing"
    azure_devops_https_to_ssh_fallback:
      applies_when:
        source_provider: azure-devops
        failed_url_scheme: https
        failure_category:
          - https_credential_acquisition
          - authentication
        example_errors:
          - "could not read Username"
          - terminal_prompts_disabled
          - credential_helper_unavailable
      prompt_user:
        display_choices:
          A: retry_with_azure_devops_ssh
          B: continue_standard_authentication_recovery
        recommended: A
      default_repository:
        https_url: https://dev.azure.com/IntelliwareDev/AI_Knowledge_Repo/_git/AIDE
        ssh_url: git@ssh.dev.azure.com:v3/IntelliwareDev/AI_Knowledge_Repo/AIDE
      custom_azure_devops_services_url:
        derive_only_when_https_shape_is_unambiguous: "https://dev.azure.com/<organization>/<project>/_git/<repository>"
        ssh_shape: "git@ssh.dev.azure.com:v3/<organization>/<project>/<repository>"
        preserve_existing_path_percent_encoding: true
      never_infer_for:
        - azure_devops_server
        - enterprise_mirror
        - legacy_visualstudio_com_url
        - ambiguous_url
      when_not_derivable:
        ask_user_for_exact_ssh_clone_url: true
        validate_selected_provider_family_locally: true
      retry:
        guarded_cleanup_failed_temp_dir_first: true
        allocate_fresh_unique_temp_dir: true
        preserve_ref_and_ref_type: true
        attempts: 1
        verify_ref_matches_head: true
      on_success:
        set_AIDE_SOURCE_URL_to_successful_ssh_url: true
        provenance_records_successful_transport_url: true
      on_failure:
        report_ssh_error: true
        continue_standard_authentication_recovery: true
        do_not_loop_between_https_and_ssh: true
      credentials_in_url: forbidden
    archive_fallback_allowed_only_when: "git --version exits non-zero"
    archive_fallback_formats:
      - zip
    no_git_decision:
      prompt_user: true
      options:
        - install_git_then_retry_step_3b
        - provider_specific_zip
      preferred: install_git_then_retry_step_3b
    provider_zip:
      ownership:
        user_downloads_through_provider_web_interface: true
        user_supplies_local_archive_path: true
        agent_http_download: forbidden
        agent_responsibility:
          - validate_local_archive
          - extract_local_archive
      select_using_AIDE_REF_TYPE:
        - branch
        - tag
        - commit
      azure-devops:
        method: authenticated_web_download
        select_requested_branch_or_tag_before_download: true
        open_requested_commit_before_download_for_sha: true
        when_commit_zip_unavailable: install_git
      github:
        derive_web_url:
          from: "${AIDE_SOURCE_URL}"
          only_when_https_web_or_clone_url: true
          remove_one_trailing_slash: true
          remove_optional_trailing_dot_git: true
          when_ssh_url: require_user_web_interface_download
        ref_url_encoding:
          branch_or_tag:
            preserve_slash_separators: true
            percent_encode_other_unsafe_characters: true
          commit:
            require_full_hexadecimal_sha: true
        branch: "<github-web-url>/archive/refs/heads/${AIDE_REF}.zip"
        tag: "<github-web-url>/archive/refs/tags/${AIDE_REF}.zip"
        commit: "<github-web-url>/archive/${AIDE_REF}.zip"
      private_repo_auth: user_authenticated_browser_session
      forbid_pat_in_url: true
      extract_and_strip_provider_top_level_folder: true
      secure_extraction:
        require_local_regular_zip_file: true
        inspect_entries_before_extraction: true
        reject_entry_when:
          - absolute_path
          - drive_qualified_path
          - parent_path_component
          - resolves_outside_temp_dir
          - symbolic_link
          - junction
          - hard_link
          - device_or_other_special_entry
        require_all_entries_share_exactly_one_top_level_directory: true
        require_mandatory_source_paths_directly_below_top_level: true
        prohibit_recursive_source_root_inference: true
        extract_only_after_validation: true
    on_git_failure:              # in order — never report "repo not found",
                                 # never switch to HTTP to "double-check"
      - report_failed_command_and_underlying_error
      - offer_azure_devops_https_to_ssh_fallback_when_applicable
      - ask_user_to_authenticate_git_outside_url
      - guarded_cleanup_failed_temp_dir
      - allocate_fresh_unique_temp_dir
      - retry_currently_selected_git_clone_once
      - ask_user_for_local_clone_and_use_source_dir
      - ask_user_to_confirm_ref_and_type
      - ask_user_to_confirm_url
    on_zip_failure:
      - report_provider_ref_type_operation_and_error
      - retry_through_authenticated_provider_web_session
      - confirm_ref_and_provider_archive_path
      - guarded_cleanup_failed_temp_dir_before_retry
      - allocate_fresh_unique_temp_dir_before_retry
      - offer_install_git_or_local_clone
    stop_installation_only_after_applicable_recovery_options_exhausted_or_declined: true
    credentials_in_source_url: forbidden
    request_pat_in_chat: forbidden
  copy_optional:
    paths:
      - README.md
    default: copy
    allow_user_opt_out: true
    source_validation:
      README.md:
        type: regular_file
        symlink_or_junction: forbidden
    on_opt_out:
      do_not_create_replace_or_remove_destination_readme: true
    provenance_records_only_paths_actually_copied: true
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
    # If the resolved destination is the target or a descendant of it, stop and
    # re-resolve to `./.agents/skills/<skill>/SKILL.md` at the workspace root.
    phase_order:
      - preflight
      - cleanup
      - generation
      - verification
    walk:        "${AIDE_TARGET_DIR}/.agents/skills/<stage>/<skill>/SKILL.md"   # SOURCE (read)
    emit:        "./.agents/skills/<skill>/SKILL.md"                            # DESTINATION (write) — workspace root
    source:
      encoding: utf-8
      readonly: true
      exact_depth_below_skills_root: 2
      path_shape: "<stage>/<skill>/SKILL.md"
      never_create_modify_or_delete: true
    destination:
      workspace_root_relative: true
      create_parent_directories_as_needed: true
      symlinks: forbidden
      junctions: forbidden
      canonical_skill_copies: forbidden
    forbidden_emit_location: "same as or descendant of resolved ${AIDE_TARGET_DIR}"
    containment_check: path_component_aware_not_raw_string_prefix
    skip_stages_prefix: "_"             # e.g. _registry
    folder_name_is_authoritative: true  # warn if frontmatter `name` differs
    normalize_shim_frontmatter_name:
      mismatch: replace_with_folder_name_and_warn
      missing: insert_folder_name_and_warn
      modify_canonical_source: false
    source_inventory_preflight:
      require_at_least_one_canonical_skill: true
      require_skill_folder_name: start-project
      on_failure: stop_and_report_before_cleaning_existing_shims
    collision_preflight:
      compare_skill_folder_names_case_insensitively: true
      on_duplicate_destination: stop_and_report_all_sources
      run_before_cleaning_existing_shims: true
    frontmatter_preflight:
      opening_delimiter: first_line_after_optional_utf8_bom
      require_exact_opening_and_closing_delimiters: true
      require_valid_yaml: true
      safe_yaml_parsing:
        arbitrary_object_construction: disabled
        require_top_level_mapping: true
        require_string_mapping_keys_at_every_level: true
        generated_validator:
          syntax_check_or_compile_before_execution: true
          syntax_check_before_modifying_installation_paths: true
          prefer_readable_multiline_code: true
          ruby_ternary_operators_require_surrounding_whitespace: true
          syntax_error_classification: installer_implementation_error
          on_syntax_error:
            - correct_validator
            - retry_same_phase
            - do_not_classify_as_invalid_source
        ast_traversal:
          null_or_absent_child_collection: treat_as_leaf
        reject:
          - duplicate_keys
          - custom_tags
          - anchors
          - aliases
      on_invalid: stop_and_report_all_sources
      aggregate_all_invalid_sources_before_reporting: true
      run_before_cleaning_existing_shims: true
      validate_emitted_shim_frontmatter_after_name_normalization:
        name:
          must_match_skill_folder: true
          minimum_characters: 1
          maximum_characters: 64
          allowed_pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$"
          no_leading_trailing_or_consecutive_hyphens: true
        description:
          required: true
          type: string
          nonempty_after_trim: true
          maximum_characters: 1024
        on_invalid:
          aggregate_all_source_paths: true
          stop_before_cleanup: true
    workspace_destination_preflight:
      inspect_without_following_links: true
      shim_root_when_present: regular_directory
      immediate_cleanup_children: regular_directories
      existing_skill_md: regular_file
      computed_destination_when_present: regular_file
      reject_links_special_entries_and_unexpected_object_types: true
      aggregate_all_invalid_paths: true
      stop_before_cleanup: true
    marker:      "<!-- aide:generated-shim -->"
    marker_detection:
      standalone_line_exact_match: true
      trim_whitespace_before_comparison: false
      ignore_midline_mentions: true
    cleanup:
      run_after_preflight_before_generation: true
      root: "./.agents/skills"
      scope: immediate_child_directories
      skip_child_name_prefix: "_"
      marker_tagged_skill:
        delete_skill_md_only: true
        preserve_siblings: true
        warn_when_siblings_remain: true
        remove_child_directory_only_when_empty: true
      unmarked_skill:
        preserve_entire_child_directory: true
        warn_hand_authored: true
      child_without_skill_md:
        preserve_all_content: true
    write_existing_destination:
      marker_present: overwrite
      marker_absent: preserve_and_warn_hand_authored
    rendering:
      frontmatter_then_blank_line_then_body: true
      normalize_name_only_when_required: true
      substitute_resolved_target_dir_in_pointer: true
      use_canonical_stage_and_skill_in_pointer: true
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
    result:
      layout: "one flat generated shim per canonical skill"
      path_shape: "./.agents/skills/<skill>/SKILL.md"
      canonical_tree_unchanged: true
      discovery:
        requires_compatible_host: true
        requires_host_configured_to_scan: "./.agents/skills/"
        automatic_default_discovery_not_guaranteed_across_hosts_or_versions: true
    wrong_destination_recovery:
      condition: flat_skill_directory_written_inside_canonical_skills_root
      action:
        - report_pollution
        - stop_without_modifying_canonical_tree
        - rerun_installation_to_restore_canonical_agents_tree
        - regenerate_shims_with_workspace_root_destination
  agents_md:
    # AIDE publishes its orientation + coding-standards addendum into
    # ./AGENTS.md as a MANAGED BLOCK delimited by sentinels, so the file
    # can also carry hand-authored content the user owns. AIDE writes only
    # BETWEEN the sentinels; everything outside is preserved across installs.
    source:  "${AIDE_TARGET_DIR}/AGENTS.md"
    target:  "./AGENTS.md"
    target_requirements:
      type: plain_file
      symlink: forbidden
      junction: forbidden
      when_existing_type_is_not_regular_file: stop_without_replacing
    source_read:
      encoding: utf-8
      missing_or_empty: stop_and_report_step_5_incomplete
    line_endings:
      detect_from_first_source_line_ending:
        crlf: "\\r\\n"
        otherwise: "\\n"
      default_when_source_has_no_line_ending: "\\n"
      preserve_existing_internal_source_line_endings: true
      preserve_existing_internal_addendum_line_endings: true
      generated_separators_use_detected_source_eol: true
    addendum_source: "${AIDE_TARGET_DIR}/references/orientation/workspace-agents-coding-standards.md"
    addendum_read:
      encoding: utf-8
      missing_or_empty:
        warn: true
        continue_with_empty_addendum: true
      strip_leading_sot_comment:
        only_when_first_non_whitespace_text_starts_with: "<!--"
        remove_through_matching: "-->"
        missing_matching_close: stop_before_modifying_target_and_report_malformed_addendum
        strip_only_one_leading_comment: true
        trim_leading_blank_lines_after_removal: true
        preserve_later_comments: true
      validate_nonempty_addendum:
        require_exact_line: "## Coding standards (auto-enforced per repo)"
        on_missing: stop_before_modifying_target_and_report_incompatible_addendum
    splice:
      before_exact_line: "## What this folder is NOT"
      validate_anchor_even_when_addendum_empty: true
      when_found:
        insert_addendum_before_anchor: true
        one_blank_line_between_addendum_and_anchor: true
        strip_only_trailing_addendum_line_endings_before_insertion: true
      when_missing:
        stop_before_modifying_target: true
        report_incompatible_source_missing_required_anchor: true
      preserve_source_line_endings: true
    addendum_required_heading: "## Coding standards (auto-enforced per repo)"
    addendum_missing_behaviour: warn_and_skip_splice     # back-compat with older AIDE
    block:
      begin_marker: "<!-- aide:managed:begin — DO NOT EDIT INSIDE THIS BLOCK. Everything between this line and aide:managed:end is generated by AIDE and is OVERWRITTEN on every install/update. Put your own content OUTSIDE the block (above or below). -->"
      end_marker:   "<!-- aide:managed:end -->"
      sentinel_line_detection:
        strip_leading_whitespace: true
        begin_line_starts_with: "<!-- aide:managed:begin"
        end_line_starts_with: "<!-- aide:managed:end"
        ignore_midline_mentions: true
      legacy_marker: "<!-- aide:generated-agents -->"   # pre-block whole-file format; migration only
      rendering:
        order:
          - begin_marker
          - composed_body
          - end_marker
        exactly_one_newline_before_end_marker: true
        newline_sequence: detected_source_eol
        strip_only_trailing_composed_body_line_endings_before_end_marker: true
        end_marker_on_own_line: true
        final_newline_after_end_marker: true
      write_modes:
        create:
          condition: target_file_does_not_exist
          action: write_block_as_whole_file
          begin_marker_is_line_1: true
        replace-in-place:
          condition:
            begin_sentinel_lines: 1
            end_sentinel_lines: 1
            begin_precedes_end: true
          action: replace_inclusive_begin_through_end_lines
          preserve_all_out_of_block_bytes: true
          warn_in_block_edits_discarded: true
        migrate:
          condition:
            sentinel_lines: 0
            line_1_equals_legacy_marker: true
          action: replace_whole_file_with_block
          warn_migrated_legacy_format: true
        prepend:
          condition:
            sentinel_lines: 0
            line_1_not_legacy_marker: true
          action: prepend_block_then_one_blank_line
          preserve_existing_file_bytes_below_block: true
          warn_hand_authored_content_preserved: true
        malformed-stop:
          condition_any:
            - exactly_one_sentinel_line_total
            - end_precedes_begin
            - more_than_one_begin_sentinel_line
            - more_than_one_end_sentinel_line
          action: stop_installation_without_modifying_target
          warn_with_anomaly: true
          write_provenance: false
          print_completion_banner: false
      preserves_out_of_block_content: true
      idempotent: true
    write:
      mandatory_method: tool_native_file_write
      compose_entire_destination_in_memory: true
      single_write_call: true
      prefer_atomic_temp_then_rename_when_supported: true
      temp_path:
        location: workspace_root_sibling_of_agents_md
        unique_per_write: true
        must_not_exist_before_write: true
        fixed_name: forbidden
        overwrite_existing_temp_path: forbidden
        apply_link_safety: true
        cleanup_on_failure_or_abort: true
        on_cleanup_failure:
          warn: true
          report_exact_path: true
      never_spawn_shell_when_file_write_tool_exists: true
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
    shell_fallback:
      allowed_only_when_no_file_write_tool: true
      pattern: write_complete_composed_destination_to_temp_then_rename
      require_preallocated_unique_nonexistent_sibling_temp_path: true
      powershell: "Set-Content -LiteralPath $agentsTemp -Value $composed -NoNewline -Encoding utf8; Move-Item -Force -LiteralPath $agentsTemp -Destination AGENTS.md"
      bash: "printf '%s' \"$composed\" > \"$agents_temp\" && mv -f -- \"$agents_temp\" AGENTS.md"
      direct_write_to_live_agents_md: forbidden
    verify_after_write:
      reread_target: true
      sentinel_lines:
        begin_count: 1
        end_count: 1
        begin_precedes_end: true
      inside_block:
        require_addendum_heading_unless_addendum_empty: true
        require_splice_anchor_heading: true
      outside_block:
        create: empty
        migrate: empty
        replace-in-place: exact_prior_out_of_block_bytes
        prepend: exact_prior_file_bytes
      on_failure: stop_and_report_silent_write_failure_or_corruption
  installation_verification:
    run_after_temp_cleanup: true
    required_paths:
      canonical_agents_md: "${AIDE_TARGET_DIR}/AGENTS.md"
      skills_registry: "${AIDE_TARGET_DIR}/.agents/skills/_registry/skills.csv"
      schemas: "${AIDE_TARGET_DIR}/config/SCHEMAS.md"
      templates_readme: "${AIDE_TARGET_DIR}/templates/README.md"
      start_project_shim: "./.agents/skills/start-project/SKILL.md"
      workspace_agents_md: "./AGENTS.md"
    start_project_shim:
      required_because_documented_entry_point: true
      must_contain_standalone_exact_marker_line: "<!-- aide:generated-shim -->"
    workspace_agents_md:
      begin_sentinel_line_count: 1
      end_sentinel_line_count: 1
      begin_must_precede_end: true
      use_agents_md_sentinel_line_detection_rule: true
    when_addendum_source_exists:
      source: "${AIDE_TARGET_DIR}/references/orientation/workspace-agents-coding-standards.md"
      managed_block_must_contain: "## Coding standards (auto-enforced per repo)"
      managed_block_must_not_contain_leading_sot_comment: true
    on_missing_path_or_failed_assertion:
      report_each_failure: true
      stop: true
      never_continue_silently: true
  canonical_tree_verification:
    root: "${AIDE_TARGET_DIR}/.agents/skills"
    inspect: immediate_children
    allowed:
      registry_directory: "_registry"
      metadata_files:
        README.md:
          type: regular_file
          symlink_or_junction: forbidden
          ignore_when_checking_nested_skill_layout: true
      stage_directory:
        must_not_contain_direct_child_SKILL_md: true
        may_be_empty: true
        may_contain_skill_directories_matching: "<skill>/SKILL.md"
        allow_builtin_and_addon_stages: true
        known_examples:
          - meta
          - requirements
          - design
          - planning
          - execution
          - reverse-engineering
          - knowledge-base
          - quick-dev
          - jira
          - confluence
          - files-conversion
    flat_skill_directory_inside_canonical_root:
      classification: misplaced_generated_shim
      action:
        - report
        - stop_without_modifying_canonical_tree
        - rerun_installation_to_restore_canonical_agents_tree
        - regenerate_shims_with_workspace_root_destination
    on_verification_failure: report_and_stop
  provenance_file: "${AIDE_TARGET_DIR}/.aide-install.json"
  provenance:
    write_after_successful_installation_verification: true
    write:
      compose_complete_json_in_memory: true
      apply_destination_link_safety: true
      unique_sibling_temp_file:
        location: "${AIDE_TARGET_DIR}"
        must_not_exist_before_write: true
        fixed_name: forbidden
        overwrite_existing_temp_path: forbidden
      write_complete_json_in_one_call: true
      validate_temp_before_replace:
        parse_as_json: true
        validate_against_provenance_schema: true
      atomically_replace_final_when_supported: true
      reread_and_validate_final_file: true
      on_failure:
        stop: true
        print_completion_banner: false
        cleanup_only_unique_temp_file: true
        on_cleanup_failure:
          warn: true
          report_exact_path: true
    schema:
      schema_version:
        type: integer
        supported_values:
          - 1
      source_method:
        type: enum
        values:
          - local-directory
          - git-clone
          - zip
      source_provider:
        type: enum_or_null
        values:
          - azure-devops
          - github
      source_dir:
        type: string_or_null
      source_url:
        type: string_or_null
        credentials_forbidden: true
      ref:
        type: string_or_null
      ref_type:
        type: enum_or_null
        values:
          - branch
          - tag
          - commit
      ref_verified:
        type: boolean_or_null
      commit_sha:
        type: string_or_null
      installed_at:
        type: string
        format: utc_iso_8601
        source: system_clock
      target_dir:
        type: string
        value: "${AIDE_TARGET_DIR}"
      mandatory_paths:
        value_from: copy
      optional_paths:
        value_from: copy_optional_paths_actually_copied
      workspace_root_files:
        skill_shims_dir: "./.agents/skills"
        skill_shims_swept:
          type: nonnegative_integer
          source: skill_shim_cleanup_count
        skill_shims_generated:
          type: nonnegative_integer
          source: skill_shim_generation_count
        skill_shim_marker: "<!-- aide:generated-shim -->"
        agents_md: "./AGENTS.md"
        agents_md_block_begin: "<!-- aide:managed:begin"
        agents_md_block_end: "<!-- aide:managed:end -->"
        agents_md_write_mode:
          type: enum
          values:
            - create
            - replace-in-place
            - migrate
            - prepend
    unavailable_metadata: null
    never_invent_placeholder_values: true
    never_record_credentials: true
    source_methods:
      local-directory:
        source_dir: resolved_local_path
        source_provider: null
        git_metadata: read_if_available_else_null
        ref_verified: true_when_git_metadata_resolved_and_verified_else_null
      git-clone:
        source_dir: null
        record_url_ref_and_checked_out_commit: true
        ref_verified: true
      zip:
        source_dir: null
        commit_sha: known_commit_sha_else_null
        ref_verified: false_unless_archive_to_ref_relationship_independently_proven
        filename_or_user_supplied_url_alone_is_proof: false
  uninstall:
    read_provenance_first_if_present: true
    provenance_acceptance:
      must_parse_as_json: true
      must_validate_against_provenance_schema: true
      supported_schema_versions:
        - 1
      otherwise_treat_as_untrusted: true
    when_provenance_missing_or_untrusted:
      require_explicit_confirmation_before_target_managed_path_deletion: true
      when_declined:
        skip_target_cleanup: true
        continue_marker_and_sentinel_owned_workspace_cleanup: true
    remove_managed_target_paths:
      - AGENTS.md
      - .agents/
      - config/
      - templates/
      - references/
      - .aide-install.json
    optional_readme:
      remove_only_when_provenance_optional_paths_contains: README.md
      preserve_when_provenance_missing_or_does_not_list: true
    preserve_unlisted_target_paths: true
    remove_target_dir_only_when_empty: true
    report_preserved_target_paths: true
    workspace_skill_shims:
      root: "./.agents/skills"
      remove_skill_md_only_when_standalone_exact_marker_line_present: "<!-- aide:generated-shim -->"
      preserve_unmarked_skill_md: true
      remove_parent_directories_only_when_empty: true
      remove_skills_and_agents_roots_only_when_empty: true
    workspace_agents_md:
      target: "./AGENTS.md"
      require_existing_target_type: regular_non_link_file
      on_other_object_type: stop_without_modifying
      sentinel_line_detection_rule_reference: agents_md.block.sentinel_line_detection
      valid_managed_sentinel_pair:
        condition:
          begin_sentinel_lines: 1
          end_sentinel_lines: 1
          begin_precedes_end: true
        remove_inclusive_managed_block_only: true
        preserve_out_of_block_content: true
        collapse_one_adjacent_blank_line_if_double_blank_remains: true
        delete_file_when_empty_after_removal: true
      no_sentinel_lines_and_line_1_is_legacy_marker:
        delete_whole_file: true
      no_sentinel_lines_and_line_1_is_not_legacy_marker:
        preserve_whole_file: true
      malformed_sentinels:
        condition_any:
          - exactly_one_sentinel_line_total
          - end_precedes_begin
          - more_than_one_begin_sentinel_line
          - more_than_one_end_sentinel_line
        preserve_whole_file: true
        warn_with_anomaly: true
  completion_banner:
    print_only_after_successful_provenance_write: true
    when_readme_copied:
      text: "A.I.D.E. is installed at ${AIDE_TARGET_DIR}. In a compatible IDE configured to scan `.agents/skills/`, type `/` to check skill discovery. If skills don't appear, verify the host configuration and reopen the workspace. Next: see ${AIDE_TARGET_DIR}/README.md Step 2 (IDE setup) and Step 3 (`/start-project`)."
    when_readme_opted_out:
      text: "A.I.D.E. is installed at ${AIDE_TARGET_DIR}. In a compatible IDE configured to scan `.agents/skills/`, type `/` to check skill discovery. If skills don't appear, verify the host configuration and reopen the workspace. Next: run `/start-project`."
  troubleshooting:
    skills_not_discoverable:
      checks:
        - host_is_compatible_and_configured_to_scan: "./.agents/skills/"
        - path_exists: "./.agents/skills/start-project/SKILL.md"
        - file_contains_standalone_exact_line: "<!-- aide:generated-shim -->"
      when_only_canonical_skills_exist:
        diagnosis: workspace_root_flat_shim_generation_was_skipped
        action:
          - rerun_installation
          - reload_ide_window
    stale_skills_after_update:
      action:
        - rerun_installation
        - require_skill_shim_cleanup_before_regeneration
      expected_result: renamed_moved_and_deleted_skills_are_reflected
    network_blocked_or_git_missing:
      rule_reference: fetch.no_git_decision
      manual_clone:
        restart_with_source_availability: local-directory
        set: AIDE_SOURCE_DIR
    repository_not_found_or_forbidden:
      possible_diagnosis:
        - authentication_missing
        - sso_missing
        - ref_incorrect
        - source_url_incorrect
      forbidden_conclusion_without_confirmation: repository_does_not_exist
      forbidden_recovery:
        - provider_cli_preflight
        - provider_rest_preflight
      rule_reference:
        - fetch.on_git_failure
        - fetch.on_zip_failure
    private_repository:
      allowed_authentication:
        - git_credential_helper
        - ssh_agent
        - provider_supported_sign_in
        - corporate_sso
      forbidden:
        - request_pat_in_chat
        - credentials_in_source_url
      fallback: local-directory
    hand_authored_workspace_files:
      skill_rule_reference: skill_shims.write_existing_destination
      agents_md_rule_reference: agents_md.block.write_modes
      preserve_out_of_managed_block_content: true
      malformed_sentinels: do_not_modify_and_warn
    verification_timeout_after_bulk_operation:
      diagnosis: persistent_shell_output_drain_race
      rule_reference: bulk_operation_terminal_drain
    agents_md_write_hang:
      diagnosis: direct_shell_pipeline_or_redirection_to_live_agents_md
      rule_reference:
        - agents_md.write
        - agents_md.forbidden_write_patterns
        - agents_md.shell_fallback
    version_control:
      when_vendoring_without_committing_generated_install:
        target_gitignore_pattern:
          derive_from_validated_target: true
          convert_to_workspace_relative_path: true
          root_anchor_with_leading_slash: true
          directory_suffix_slash: true
          escape_gitignore_special_characters: true
          forbid_absolute_path: true
          forbid_unresolved_placeholder: true
        never_automatically_ignore_whole_paths:
          - "./.agents/"
          - "./AGENTS.md"
        reason: may_contain_hand_authored_content
        ask_user_how_to_track_generated_workspace_integration_files: true
```




