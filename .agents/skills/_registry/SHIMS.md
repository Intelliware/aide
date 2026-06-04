# Discovery Shims

> Tool- and OS-agnostic skill discovery for agentskills.io hosts.

## What

A.I.D.E. organises skills under stage folders:

```
.agents/skills/<stage>/<skill>/SKILL.md   ← canonical source of truth
```

Most Copilot / agentskills.io hosts (VS Code Copilot Chat, JetBrains Copilot
Chat, Cursor, Claude Code, Cline, …) discover skills at the flat shape
defined by the agentskills.io spec:

```
<root>/<skill>/SKILL.md                   ← flat — what hosts scan
```

The mismatch is bridged by **discovery shims** — small generated SKILL.md
files at the flat location that mirror the canonical frontmatter and point
agents at the real file for the body. They contain a hidden marker so the
generator can safely overwrite them on re-run without touching anything
hand-authored.

## Where shims live

Shims are a **build output**, never a source-tree concern. They are emitted
only into the consumable bundle produced by `package-aide`:

```
build/AIDE/.agents/skills/<skill>/SKILL.md   ← generated, gitignored via /build/
```

The source `.agents/skills/` tree stays purely canonical. There is no
`.gitignore` allow-list of stage folders to maintain when new stages or
skills are added.

## Why this design

| Constraint | Why other approaches fail |
|---|---|
| **No per-IDE setup** | Manual symlinks/junctions require OS-specific commands and (on Windows) developer mode or admin. |
| **No structural change to existing skills** | Flattening the canonical layout breaks every team's existing paths, bookmarks, and scripts. |
| **Cross-OS** | Symlinks behave differently on Windows / macOS / Linux and across Git configs. Plain files don't. |
| **Cross-host** | All known hosts (and the agentskills.io spec) agree on `<root>/<skill>/SKILL.md`. |
| **Source-tree hygiene** | Build artefacts in source require either commit (drift) or per-stage `.gitignore` allow-lists (maintenance burden). Emitting only into `build/` removes both. |

Plain files at the flat path satisfy every constraint, cost nothing, and have
zero special semantics to remember.

## Files in this scheme

| Path | Owned by | Committed? |
|---|---|---|
| `.agents/skills/<stage>/<skill>/SKILL.md` | Skill author | ✓ Yes — canonical |
| `build/AIDE/.agents/skills/<skill>/SKILL.md` | `scripts/build-skill-shims.{py,js}` | ✗ No — gitignored via `/build/` |
| `build/AIDE/.agents/skills/<stage>/<skill>/SKILL.md` | `scripts/package-aide.{py,js}` (file copy) | ✗ No — gitignored via `/build/` |
| `.agents/skills/_registry/skills.{csv,json}` | `scripts/build-registry.{py,js}` | ✓ Yes |

## Generator behaviour

`scripts/build-skill-shims.py` (and its Node parity `scripts/build-skill-shims.js`):

- Walks every canonical `<stage>/<skill>/SKILL.md` in the source tree.
- Requires `--out <dir>` — the script **never** writes into the source tree.
- Writes / refreshes `<out>/<skill>/SKILL.md` (copies frontmatter verbatim,
  appends a pointer paragraph + hidden marker).
- Removes flat folders under `--out` whose canonical source no longer exists.
- Refuses to overwrite any flat `SKILL.md` that does **not** carry the marker
  — protecting hand-authored files in unusual `--out` targets.
- Stdlib-only. Works on Windows, macOS, Linux.

Both runtimes produce byte-equivalent output. The Node version exists so
contributors without a Python toolchain can run the full build pipeline.

## How shims get into a bundle

`scripts/package-aide.{py,js}` is the only normal caller of the shim generator.
Its workflow:

1. Recreate `<repo>/build/AIDE/`.
2. Copy the canonical source tree into `build/AIDE/`.
3. Invoke `build-skill-shims --out build/AIDE/.agents/skills/` to emit flat
   shims directly into the bundle.

```
python3 scripts/package-aide.py    # or:
node scripts/package-aide.js
```

One command. The build is fully reproducible, the source tree is unchanged,
and the bundle is ready to open in any agentskills.io host.

## Manual invocation (rare)

If you ever need shims somewhere other than `build/AIDE/`:

```
python3 scripts/build-skill-shims.py --out <dir>     # or:
node scripts/build-skill-shims.js --out <dir>
```

`--clean` removes every shim under `<dir>`; canonical `.agents/skills/` is
never touched.

## Hidden marker

Every generated shim contains the literal string:

```
<!-- aide:generated-shim -->
```

The generator uses it as the only signal that a file is safe to overwrite or
delete. Do not strip it from generated files.

