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

Record the user's choice. If **Interactive**, apply the full 7-Step per-file Workflow with per-section pause-and-acknowledge. If **One-pass**, produce sections **sequentially, writing each file to disk before drafting the next**, but without inter-section acknowledgement prompts. "One-pass" means no user-facing pauses — it does **not** mean batching writes to the end. The write-on-acknowledge invariant below still applies; in One-pass mode, "acknowledge" is the AI's own completion of a section, not a user round-trip.

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

## Per-section persistence checkpoint (recurring re-anchor)

The invariant above is read once at skill start; the workflows it governs can run 10+ sections deep. To prevent decay over context distance, every per-section workflow MUST end with a persistence checkpoint **before advancing to the next section**:

> **Persistence checkpoint.** Confirm the file for the just-completed section exists on disk at its expected path and contains the acknowledged content. If it does not, write it now. Do not begin the next section until this is true.

**Verification must be independent of the write tool's response.** A file-write tool reporting "success" is not sufficient proof that content persisted — the write may silently fail or be truncated by editor file-watching races, OS-level locks, or tool-layer bugs. After every write, verify via a **separate mechanism**: read the file back (e.g., `read_file` or terminal `Get-Content`/`cat`), or check its byte length is non-zero (e.g., terminal `(Get-Item <path>).Length`). If verification shows the file is empty or missing, re-write immediately before proceeding.

This applies in both Interactive and One-pass modes. It is not a new step — it is a non-negotiable gate on the existing "advance to next section" transition. Skipping it is equivalent to violating the write-on-acknowledge invariant.

The checkpoint is intentionally cheap: in the common case the file was written at acknowledgement time and the check is a no-op. Its value is catching two failure modes: (1) the AI drafted a section, the user acknowledged, the conversation moved on, and the write silently never happened; (2) the write tool reported success but the content did not persist to disk.

---

## Closing inventory check (handoff gate)

Before the skill emits its `## Next skill` handoff, the AI MUST perform a single inventory check:

1. **Enumerate expected artifacts** from the composition the skill resolved at the start (the section list, plus any discovery/analysis artifacts produced along the way).
2. **List files actually on disk** in the package output directory.
3. **Compare.** If every expected artifact has a corresponding file with non-trivial content, proceed to handoff.
4. **If any expected artifact is missing or empty,** halt. Surface the gap explicitly ("Composition expected `04-functional-reqs.md`; no such file on disk."), produce the missing artifacts, and re-run the check before handing off.

This is the safety net for cases where both the write-on-acknowledge invariant and the per-section persistence checkpoint were bypassed. It converts a silent end-state drift (skill claims completion; only the assembled file exists) into a halt consistent with Principle 7 (halt on ambiguity, never guess).

The check runs once, at skill end, so its cost is negligible. It is not a substitute for the per-section checkpoint — by the time the inventory runs, recovering missing sections is more expensive than catching them at the moment of acknowledgement.

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
