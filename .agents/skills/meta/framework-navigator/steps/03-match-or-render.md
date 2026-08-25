# Step 03 — Match (goal mode) or Render (catalog mode)

After mode detection (step 01) and the state probe (step 02), branch on mode.

---

## Goal-mode branch — Match

### Inputs

- The user utterance.
- The state-probe dict (from step 02).
- The skill catalog (`skills/_registry/skills.csv` or `skills.json`).
- The flow graph (`skills/_registry/workflow-graph.yaml`).

### Procedure

1. **Load the catalog.** Read every data row from `skills.csv` (the count is
   whatever the registry currently holds — do not hard-code a number). Build
   a list of `{name, description, stage}` tuples.
2. **Apply the state-probe override.** If the probe says `project_toml_present
   == false` AND the utterance does not already mention `start-project`,
   skip scoring and return `start-project` as the recommendation with the
   probe's reasoning. Done.
3. **Score every candidate** against the user utterance using
   `references/recommendation-rubric.md`. Each candidate gets a score in
   `[0, 1]`.
4. **Apply the gate filter.** For each candidate, check
   `workflow-graph.yaml` to see whether prerequisites in the active flow are
   met. Apply a 0.3 penalty if a gate is unmet, but **do not** drop the
   candidate (the recommendation will surface the prerequisite as a note).
   **Feature-precondition gate:** if the probe reports `features_toml_present
   == true` and `active_feature == None`, and the candidate is one of the
   feature-aware skills listed in
   `references/ai-principles/feature-precondition.md` (Mode A or B), add
   `select-feature` to that candidate's prerequisites the same way an unmet
   flow gate is added — no score penalty (selecting a feature is a one-turn
   detour, not a missing artifact), but it must render as a prerequisite in
   step 04's output.
5. **Decision-rule loop:**
   - Single dominant candidate (top ≥ 0.55, ≥0.10 ahead of #2) → emit it.
   - Two close candidates → ask **one** disambiguating question chosen per
     `references/recommendation-rubric.md` § "Disambiguation question
     patterns". Re-score with the answer.
   - Still close after one question → ask **one more** (cap = 2). Then emit
     the higher-stage-order candidate and surface the runner-up as
     "alternatively".
   - All candidates < 0.30 → present a top-3 picker: "I'm not sure — did you
     mean A, B, or C?"
6. **Emit the chosen skill name** + the gate notes for step 04 to format.

### Disambiguation rules

- Cap at **2 questions**. The navigator must commit to a recommendation after
  the second answer.
- The questions must be **closed-form** (yes/no, A-or-B). No open-ended
  prompts.
- Examples:
  - "Is this a new feature you're starting from scratch, or are you
    continuing an existing one?"
  - "Does this touch one repo or multiple?"
  - "Do you want a quick fix (1–3 small commits) or a full feature
    (requirements → design → planning)?"
  - "Are you reverse-engineering existing code, or designing something
    new?"

### Output of the goal branch

A struct that step 04 consumes:

```
{
  "recommended_skill": "<skill name>",
  "trigger_phrase": "<exact user-facing phrase>",
  "prerequisites": ["<skill>", ...],   // unmet gates per workflow-graph.yaml
  "alternative": "<skill name | None>",
  "stage": "<stage id>",
  "next_in_flow": "<next skill in the active flow | None>",
  "rationale": "<one sentence>",
  "inconsistencies_to_flag": [str, ...],   // from probe
}
```

---

## Catalog-mode branch — Render

### Inputs

- The skill catalog (`skills/_registry/skills.csv`).
- The flow graph (`skills/_registry/workflow-graph.yaml`).
- The state-probe dict (used only for the contextual footer).

### Procedure

1. **Group catalog rows by `stage`.** Use the stage order from
   `workflow-graph.yaml § stages`:
   `meta → requirements → design → planning → execution →
    reverse-engineering → knowledge-base → quick-dev`.
2. **Render the markdown table.** Columns: Stage | Skill | Description |
   When to use this. The "Description" column is the registry's full
   description (truncated to ~120 chars if needed). The "When to use this"
   column is a single-sentence paraphrase the navigator generates from the
   "Use when…" prefix.
3. **Render flow sequences** from `workflow-graph.yaml § flows`. For each
   flow (greenfield, brownfield, quick-dev), list the skills in order with
   `→` separators; mark gates with `⟶ gate <skill>`; mark dispatcher slots
   (`reverse-engineer-<dynamic>`) with the dispatcher's name in parentheses.
4. **Render the anytime list** from `workflow-graph.yaml § anytime`.
5. **Append the contextual footer** using the state-probe dict — one
   sentence summarising the project's current state and the natural next
   step.
6. **Emit the pointer:** "Run framework-navigator with a specific goal to
   get a personalized recommendation."

### Output of the catalog branch

A complete markdown response (see `references/EXAMPLE.md` § "Example 2"). No
struct — catalog mode bypasses step 04.

---

## What this step does NOT do

- It does not write files.
- It does not invoke other skills.
- It does not invent skill names — every name emitted must be in
  `skills/_registry/skills.csv`. If a candidate is missing from the registry,
  that is a registry bug, not a navigator decision.
