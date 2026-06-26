# Discovery Shims
> Tool- and OS-agnostic skill discovery for agentskills.io hosts.
## What
A.I.D.E. organises skills under stage folders in its own directory:
```
${AIDE_TARGET_DIR}/.agents/skills/<stage>/<skill>/SKILL.md   <-- canonical source of truth
```
agentskills.io hosts (VS Code Copilot Chat, JetBrains Copilot Chat, Cursor,
Claude Code, Cline, ...) discover skills at **workspace-folder-relative**
default roots such as `.agents/skills/`, and most of them expect the flat
layout defined by the spec:
```
./.agents/skills/<skill>/SKILL.md                            <-- what hosts scan
```
Two problems in one: the canonical files live inside `AIDE/` (off the
discovery path) and they are nested two levels deep (wrong shape for hosts
that don't recurse).
A single mechanism solves both: **discovery shims** -- small generated
`SKILL.md` files at the workspace-root flat path that mirror the canonical
frontmatter and point agents at the real file for the body. They carry a
hidden marker so the generator can safely overwrite or remove them on re-run
without touching anything hand-authored.
## Who generates them
**The installation runbook itself.** Shims are produced in-line by
[`INSTRUCTIONS.md`](../../../INSTRUCTIONS.md) **Step 8 -- "Generate flat
skill-discovery shims at the workspace root"**, executed by whatever coding
agent the end user gives the installation prompt to. There is no script, no
symlink, no junction, no build step, and no per-IDE configuration.
This means:
- No Python / Node / shell prerequisites for end users.
- No "missing script" failure mode -- the runbook is the spec.
- No Windows Developer Mode requirement, no OS-specific link mechanisms.
- One installation command (the one-line prompt in
  [`INSTRUCTIONS.md`](../../../INSTRUCTIONS.md)) produces a workspace that
  works in every supported host.
## Where shims live
The canonical tree stays untouched inside `AIDE/`. Shims are written at the
workspace root:
```
${AIDE_TARGET_DIR}/.agents/skills/<stage>/<skill>/SKILL.md   <-- canonical (verbatim, never modified)
./.agents/skills/<skill>/SKILL.md                            <-- generated shim (flat, marker-tagged)
```
Hosts only ever see the flat shims at the workspace root. When the agent
invokes a skill, it reads the shim''s body -- a short pointer paragraph --
and loads the canonical file from inside `AIDE/` for the real workflow
content.
A parallel mechanism handles framework orientation. The host also auto-attaches `AGENTS.md` from each workspace folder root, so the runbook
generates one there:
```
${AIDE_TARGET_DIR}/AGENTS.md                                 <-- canonical (verbatim)
./AGENTS.md                                                  <-- generated copy (marker on line 1)
```
Same idea, different marker: `<!-- aide:generated-agents -->` (line 1) for
the orientation file, `<!-- aide:generated-shim -->` (in body) for each
skill shim. Both are plain files. Re-installs refresh them. Hand-authored
versions of either are detected by the absence of the marker and left
untouched.
## Why this design
| Constraint                                  | Why other approaches fail                                                                                                                                                                            |
|---------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **No per-IDE setup**                        | `chat.agentSkillsLocations` exists only in VS Code; no equivalent for JetBrains / Cursor.                                                                                                            |
| **No symlinks / junctions**                 | Different semantics on macOS / Linux / Windows; Windows symlink creation needs Developer Mode or admin; junctions can''t link files. Eliminating them removes the entire OS-specific fallback chain. |
| **No structural change to existing skills** | Flattening the canonical layout would break every team''s existing paths, bookmarks, docs, and registry.                                                                                             |
| **No build pipeline**                       | A shim generator that lives as a Python / Node script forces users to install runtimes and re-run a command after every AIDE update. Embedding the algorithm in the install runbook removes both.    |
| **No duplicated canonical tree**            | The canonical files exist exactly once, inside `AIDE/`. The workspace root holds only thin generated files; nothing is copied twice.                                                                 |
| **Idempotent re-install**                   | The hidden markers plus a "remove stale" pass make every re-run safe and self-cleaning.                                                                                                              |
Plain files at the flat workspace-root path, generated by the installation
runbook itself, satisfy every constraint, cost nothing, and have zero
special semantics to remember.
## Files in this scheme
| Path                                                                         | Owned by                                     | Committed (here)?                             |
|------------------------------------------------------------------------------|----------------------------------------------|-----------------------------------------------|
| `.agents/skills/<stage>/<skill>/SKILL.md`                                    | Skill author                                 | Yes -- canonical                              |
| `${AIDE_TARGET_DIR}/.agents/skills/<stage>/<skill>/SKILL.md` (consumer side) | Step 5 of `INSTRUCTIONS.md` (verbatim copy)  | n/a -- written into the consumer''s workspace |
| `./.agents/skills/<skill>/SKILL.md` (consumer side)                          | Step 8 of `INSTRUCTIONS.md` (generated shim) | n/a -- written into the consumer''s workspace |
| `./AGENTS.md` (consumer side)                                                | Step 9 of `INSTRUCTIONS.md` (generated copy) | n/a -- written into the consumer''s workspace |
| `.agents/skills/_registry/skills.{csv,json}`                                 | `scripts/build-registry.py`                  | Yes                                           |
## Generator behaviour (mirrors `INSTRUCTIONS.md` Step 8)
The installation agent:
1. Walks every canonical `<stage>/<skill>/SKILL.md` under
   `${AIDE_TARGET_DIR}/.agents/skills/`.
2. Skips stage folders whose name begins with `_` (e.g. `_registry`).
3. Reads the YAML frontmatter block (from the first `---` line through the
   next `---` line). Folder name is authoritative if it disagrees with the
   frontmatter `name:` field -- warn and use the folder name.
4. Writes `./.agents/skills/<skill>/SKILL.md` (workspace root) containing
   the frontmatter verbatim, a blank line, the hidden marker, and a pointer
   paragraph back to the canonical path inside `AIDE/`.
5. If a target shim already exists **without** the marker, leaves it alone
   and warns -- hand-authored files are never clobbered.
6. After the walk, deletes any flat `./.agents/skills/<skill>/SKILL.md`
   (and its now-empty folder) that carries the marker but no longer has a
   canonical source under `${AIDE_TARGET_DIR}/.agents/skills/<stage>/<skill>/`.
See [`INSTRUCTIONS.md` Section 3 Step 8](../../../INSTRUCTIONS.md) for the
full algorithm in the form the installation agent executes, and Section 6 for the
equivalent machine-readable YAML manifest.
## Hidden markers
| Marker                           | Where                                                   | Purpose                                          |
|----------------------------------|---------------------------------------------------------|--------------------------------------------------|
| `<!-- aide:generated-shim -->`   | In the body of each `./.agents/skills/<skill>/SKILL.md` | Signals "safe to overwrite or delete on re-run". |
| `<!-- aide:generated-agents -->` | Line 1 of `./AGENTS.md`                                 | Signals "safe to overwrite or delete on re-run". |
Do not strip either marker from generated files -- that turns them into
hand-authored content the runbook will then refuse to touch. If you want to
maintain a hand-authored flat skill or a hand-authored workspace-root
`AGENTS.md` that survives re-installs, omit the marker and the runbook will
leave it alone.
