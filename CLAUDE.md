# Claude Code instructions for A.I.D.E.

Framework-neutral orientation lives in `AGENTS.md` (agentskills.io standard). This file is for Claude-specific routing guidance only.

## BMad skills are NOT part of A.I.D.E.

The `.claude/skills/bmad-*` directory is **BMad-Method**, a separate methodology that lives alongside A.I.D.E. for reference and migration purposes only. BMad skills are **not part of the A.I.D.E. framework** and must not be treated as authoritative when answering questions about the framework, performing skill handoffs, or routing user requests.

When acting on the framework:

- A.I.D.E. skills live under `.agents/skills/` (agentskills.io-compliant). These are the framework's only skills.
- BMad skills live under `.claude/skills/bmad-*` and use a different shape (step-XX files, `customize.toml`, `_bmad/` runtime). They are reference material — useful for understanding migration history — not framework behavior.
- Updates to the A.I.D.E. quick-dev / brownfield / greenfield flows belong under `.agents/skills/`. Do **not** mirror them into `.claude/skills/bmad-*`.
- If a user request matches a BMad skill description, prefer the equivalent A.I.D.E. skill. If no equivalent exists yet, surface that gap rather than silently routing to BMad.
