# Step 04 — Recommend (goal mode only)

Catalog mode finishes at step 03. This step formats the goal-mode struct from
step 03 into the user-facing recommendation message.

## Inputs

The struct emitted by step 03's goal branch:

```
{
  "recommended_skill", "trigger_phrase", "prerequisites",
  "alternative", "stage", "next_in_flow", "rationale",
  "inconsistencies_to_flag"
}
```

## Output template

```
[Optional: Inconsistency banner]
> Heads up: <inconsistency 1>; <inconsistency 2>. Resolve before continuing.

[State summary — one sentence]
Detected: <project state — flow, KB status, what's on disk>.

**Recommended skill:** `<recommended_skill>` — <one-sentence rationale>.

**Trigger phrase to paste back:**

> *"<exact phrase>"*

[Optional: Prerequisite block]
**Before this skill runs you'll need:**
- `<prerequisite 1>` — <why>
- `<prerequisite 2>` — <why>

**Position in workflow:** <stage> stage. After this you would typically run
`<next_in_flow>`<, eventually leading to ...>.

[Optional: Alternative]
If instead you wanted to <alternate intent>, run `<alternative>`.
```

## Formatting rules

1. **Exactly one recommended skill** in the headline. Alternatives are
   secondary; never lead with two.
2. **The trigger phrase must be quoted in italics** so the user can copy
   it without ambiguity.
3. **The trigger phrase must include any obvious slot the user should
   fill** — e.g. for `analyze-repository` the phrase is `"Analyze the repo
   at <path> and tell me which RE skill to run."`, with `<path>` left for
   the user to fill in.
4. **Prerequisites are listed only if non-empty.** Pull them from the
   `prerequisites` array (which step 03 derived from `workflow-graph.yaml`).
5. **Position-in-workflow is mandatory.** It anchors the user in the flow
   so they know what comes next. Use the next skill from the flow's
   `sequence` block; if the flow has no further skill, say "this is the
   final stage skill in the <flow> flow".
6. **Inconsistencies bubble to the top.** If the state probe flagged any
   contradictions, render the banner before the recommendation. Do not bury
   them at the end.
7. **No emojis. No exclamation points. No marketing language.** This is a
   precision instrument; the user wants the answer, not enthusiasm.

## Trigger-phrase canon

When picking a trigger phrase for a recommended skill, prefer phrasing that
appears verbatim in that skill's `description` (which is the catalog row).
This guarantees the recommended invocation will trigger the target skill
under agentskills.io routing. Fallback: paraphrase using the skill's
canonical action verb (create / review / execute / analyze / build /
navigate / detect / verify / update / document / plan / track / shard /
scaffold / customize / start).

Examples:

| Skill | Recommended trigger phrase |
|---|---|
| `start-project` | "Start a new project with A.I.D.E." |
| `analyze-repository` | "Analyze the repo at `<path>` and tell me which RE skill to use." |
| `reverse-engineer-api` | "Reverse-engineer the API repository at `<path>`." |
| `build-knowledge-base` | "Build the knowledge base from the RE outputs." |
| `create-requirements-package` | "Create the requirements package for `<feature>`." |
| `review-requirements-package` | "Review the requirements package." |
| `create-design-package` | "Create the design package." |
| `create-implementation-package` | "Create the implementation package." |
| `execute-increments` | "Execute the next increment." |
| `document-quick-change` | "Document a quick change for `<scope>`." |
| `customize-framework` | "Customize the framework for this project." |
| `select-feature` | "Select (or start) the feature I'm working on." |

## Hand-off contract

After emitting the recommendation, the navigator **stops**. It does not:

- Invoke the recommended skill itself.
- Write `project.toml` or any other file.
- Continue the conversation past the recommendation unless the user follows
  up with another question.

The user pastes the trigger phrase, the routing layer hands off to the named
skill, and the navigator's job is done.
