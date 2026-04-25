# Step 01 — Detect mode

The navigator runs in one of two modes. Decide which **before** the state
probe so the rest of the workflow can branch.

## Goal mode

Default. Triggered by any of these utterance shapes:

- "help" / "I need help" / "what should I do next" / "what's next" /
  "where do I start"
- "what's my best option" / "how do I…"
- "I'm not sure which skill" / "I don't know what to run"
- A goal stated in plain English without naming a skill, e.g.:
  - "I want a quick change to this project — what's my best option?"
  - "I want to RE this API project into the global knowledge base — how
    do I go about that?"
  - "Help me write requirements for a new feature."
  - "I have two repos and I want to build the knowledge base."

The hallmark of goal mode is that the utterance encodes **intent** (what the
user wants to accomplish) but does not name a specific skill.

## Catalog mode

Triggered by any of these utterance shapes:

- "what skills are available"
- "show me the catalog" / "show me what's here"
- "list all the skills" / "list the skills"
- "what's in the framework"

The hallmark of catalog mode is that the utterance asks for a **listing**, not
a recommendation.

## Tie-breakers

If the utterance fits both shapes ("show me what's here and tell me what to
run") — treat as **goal mode** and include a brief catalog snippet at the end
of the recommendation. The user has stated a goal; the catalog is supplementary.

If the utterance is a single word ("help") — treat as goal mode. Ask one
clarifying question before doing anything: "Are you looking for a personalized
recommendation (tell me what you want to do), or a list of all skills (catalog
mode)?"

## What this step produces

A single value: `mode = "goal"` or `mode = "catalog"`. Cached for the rest of
the workflow.

## What this step does NOT do

- It does not run the state probe (that's step 02).
- It does not match against the catalog (that's step 03).
- It does not recommend (that's step 04).
- It does not write files.
