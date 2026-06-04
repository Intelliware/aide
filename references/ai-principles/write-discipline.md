# Write Discipline

Global operational reference for all `create-*` skills (`create-requirements-package`, `create-design-package`, `create-implementation-package`). This reference MUST be read and applied at the start of every create-skill invocation — before any workflow step executes.

## Mandatory user prompts (unconditional — always ask)

Present these prompts to the user at the start of the skill, before Step 0/1. Do not skip, infer, or default without asking.

---

### Prompt 1 — Acknowledgement Mode

> How would you like me to work through this package?
>
> **A) Interactive** — I'll present each section/block one at a time, summarize what I produced, and wait for your acknowledgement before moving on.
>
> **B) One-pass** — I'll produce all sections continuously without pausing between each. You review the complete package at the end.

Record the user's choice. If **Interactive**, apply the full 7-Step per-file Workflow with per-section pause-and-acknowledge. If **One-pass**, produce sections sequentially without inter-section pauses but still apply the write-on-acknowledge invariant below.

---

### Prompt 2 — Output Structure

> How would you like the output organized?
>
> **A) Full structure** — One file per section/block, plus an index/manifest file that links to them all.
>
> **B) Combined** — All content assembled into a single document.

Record the user's choice. This overrides the default composition output strategy regardless of `default_flow` in `project.toml`. A brownfield project can choose Full structure; a greenfield project can choose Combined. The workflow steps (discovery, analysis, etc.) still follow what `default_flow` dictates — only the output file organization changes.

---

### Prompt 3 — Confirmation

> Regardless of the choices above, I will:
> - Write each file to disk as soon as it's complete (not defer to the end)
> - If a later section conflicts with an earlier file, I'll surface it, get your OK, update in place, and log it in the change tracker
>
> Ready to proceed?

Wait for the user to confirm before starting any workflow step.

---

## Write-on-acknowledge invariant (applies to ALL modes)

This invariant is non-negotiable regardless of acknowledgement mode or output structure chosen:

1. **Each artifact MUST be written to disk immediately upon completion.** In Interactive mode, "completion" means after user acknowledgement. In One-pass mode, "completion" means after the AI finishes drafting each file.

2. **Do not accumulate content in conversation for a single bulk write at assembly time.** Every section/block/artifact gets its own file write as it is produced.

3. **The assembly/synthesis step produces an index/manifest that links to already-written files — it does NOT duplicate their content inline.** If the user chose "Full structure", the final assembled file is a table of contents with relative links. If the user chose "Combined", the assembly step still writes incrementally per-section (not all-at-once at the end).

4. **Discovery and analysis artifacts follow the same rule.** Each sub-step output (e.g., `raw-architectural-observations.md`, `stakeholder-map.md`, `codebase-analysis.md`) is written to disk immediately — not held in conversation until the discovery/analysis phase completes.

---

## Back-revision protocol

If a later block/section surfaces a conflict or inconsistency with a previously-written file:

1. **Surface the conflict** to the user explicitly — state which earlier file is affected and what the contradiction is.
2. **Get acknowledgement** of the proposed fix (or an alternative direction from the user).
3. **Update the earlier file in place** on disk.
4. **Record** a `Modified` row in the change tracker with the reason (e.g., "Conflict with §9 Integration Design — updated queue routing").
5. **Continue** with the current block.

Writing immediately does not mean files are frozen. It means files exist on disk as you go — they can be revised, but revisions are explicit, acknowledged, and tracked.

---

## Anti-pattern warning

The following behaviour is a critical failure mode and MUST NOT occur:

> Drafting all sections/blocks in conversation (or in the AI's working memory) and deferring all file writes to a single assembly pass at the end of the skill.

This results in:
- Missing per-block files (only the uber/assembled file exists)
- Loss of work if the conversation is interrupted
- Inability to verify intermediate outputs against source
- The assembled file duplicating content instead of serving as an index

If you detect yourself accumulating content without writing files, stop immediately and write the pending artifacts to disk before continuing.
