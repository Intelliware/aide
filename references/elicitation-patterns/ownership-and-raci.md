# Elicitation Pattern — Ownership & RACI

Used by `capture-solution-context/steps/06-elicit-integrations-and-ownership.md`.

## Context

Capture who is Responsible / Accountable / Consulted / Informed for
each repo and each major capability. Capture on-call rotations
separately from RACI — RACI is decision authority, on-call is
incident response.

## Conversation script

### Per repo

For each `[[project.repos]]` entry:

1. "Which team executes the work in this repo day-to-day?" (R)
2. "Which team signs off on architectural decisions for this repo?"
   (A — exactly one team)
3. "Which other teams must be consulted before non-trivial changes?"
   (C)
4. "Which teams want to be informed but don't need to weigh in?" (I)

### Per capability (only when it differs from repo defaults)

Read ARCHITECTURE.md § 4 Capability Index. For each capability that
crosses repos OR has unusual sign-off requirements:

1. "Does this capability follow the default ownership of the repo it
   lives in, or is the ownership different?"
2. If different, capture the override row.

### On-call

1. "What rotation covers this solution at 03:00?"
2. "Is there a single rotation across all repos, or per-repo
   rotations?"
3. "Escalation tier 2 — who?"
4. "Escalation tier 3 — who?"
5. "Paging tool / incident-comms channel?"
6. "Handover meeting cadence and time?"

### Decision rights

For these decision classes, ask "who has the final say":
- Architecture (cross-repo, technology choice)
- Security (vulnerability disclosure, threat-model sign-off)
- Product (feature prioritisation, deprecation)
- Hiring / team structure (capacity decisions impacting ownership)

## Probes for blind spots

- "Is there a team that thinks they own this but is not on the list?"
- "Is there a team on the list that doesn't actually have time to
  fulfil the role?"
- "Who would be surprised to read this RACI table?" (good probe for
  hidden disagreement)

## Anti-patterns

- **Multiple Accountable teams.** RACI requires exactly one A per row.
  If the user names two, surface the implicit conflict and ask which
  has final authority.
- **RACI without verification.** A row that no one would actually
  enforce is fiction. Ask: "If the C team objects, does the A team
  actually pause?"
- **On-call assumed in RACI.** On-call is event-driven; RACI is
  steady-state decision authority. Keep them separate.
