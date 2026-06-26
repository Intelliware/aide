<!--
SOT for the "Coding standards (auto-enforced per repo)" section that
INSTRUCTIONS.md Step 9 splices into the generated workspace-root
./AGENTS.md (before the "## What this folder is NOT" heading).

This file is content composed into ./AGENTS.md at install time, not itself
an instruction file. Edit here, re-run the AIDE install to propagate.

Splice anchor (MUST remain stable): heading "## What this folder is NOT"
in AIDE/AGENTS.md. If renamed/removed, the splice falls back to
"append with warning" per the runbook.
-->

## Coding standards (auto-enforced per repo)

Any repo in this workspace may publish coding standards in the conventional
location its AI tooling reads — typically a dot-folder (e.g.
`.github/instructions/`, `.cursor/rules/`, `.continue/rules/`) or a
root-level file (e.g. `CLAUDE.md`, `.junie/guidelines.md`, `CONVENTIONS.md`).
These are common examples, not an exhaustive list.

Before generating or modifying code in a repo, **every** AI agent — whichever
host is running — MUST:

1. Look in that repo for AI coding-standards files in the conventional
   locations above (and any equivalent your host uses). "That repo" is the
   nearest enclosing folder with its own version-control root or project
   manifest; when editing inside it, its standards apply — not those of a
   sibling or parent repo.
2. Read each file whose scope matches the files you're about to touch. Many
   formats declare scope in YAML frontmatter (`applyTo:`, `globs:`); a file
   with no scope field applies to its whole directory or repo.
3. Comply with what you find — these rules are binding, not advisory.

Notes:

- A host that natively reads its own format will auto-attach the matching
  files; this contract exists so a **non-native** agent (e.g. Copilot editing
  a repo that only ships `.cursor/rules/`) still honours them.
- If a shared parent folder above your repos also publishes standards, your
  host may auto-attach them too; when they conflict with the repo's own, the
  repo-local, more-specific rule wins.
- Ignore standards files inside dependency or build trees (`node_modules/`,
  `vendor/`, `dist/`, `build/`, `target/`, etc.) and inside any `AIDE/`
  install — those aren't the repo's own standards.
- A `README.md` next to these files is human documentation, not a standard.
- If two matching rules genuinely conflict, prefer the more specific one;
  if still ambiguous, ask rather than guess.
- Absence of any matching file in a repo means "no repo-specific standard
  applies" — fall back to general engineering judgement.

