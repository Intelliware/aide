# Elicitation Pattern — Personas & Jobs-to-Be-Done

Used by `capture-solution-context/steps/03-elicit-personas.md`.

## Context

Walk the user through naming each user/operator persona who interacts
with the solution and the jobs they hire it to do. Stop when the user
says "that's the full set" — but actively probe for at least one
operator/admin persona alongside any end-user personas (these are
commonly forgotten).

## Conversation script

For each persona round:

1. **Sketch.**
   "Name a person or segment that uses or operates this solution.
   What is their day-job context — where do they sit, what do they care
   about, what are they measured on?"

2. **Jobs-to-be-done (2–4 per persona).**
   For each job:
   - "When does this persona pull out our solution? (situation)"
   - "What outcome are they hoping for? (motivation)"
   - "What does success feel like to them? (outcome)"
   Frame as: *"When <situation>, I want to <motivation>, so I can
   <outcome>."*

3. **Pains and gains (optional).**
   - "What is currently painful about this job for them?"
   - "What would a 10× better experience look like?"

4. **Frequency / criticality.**
   - "How often does this persona perform this job? (every visit / weekly / quarterly / once)"
   - "If this job fails for them, how bad is it?"

## Probes for missed personas

Ask explicitly after the first pass:
- "Who configures the solution behind the scenes? (admin, ops)"
- "Who pays for it but doesn't necessarily use it daily? (economic
  buyer)"
- "Who supports it when things go wrong? (internal support)"
- "Who builds against its API? (developer / integrator)"
- "Who audits it? (compliance / security)"

## Anti-patterns

- **Persona = job title.** A persona is a use-context cluster; titles
  are too narrow. "Merchant Engineer" is a persona; "VP of Engineering
  at <company>" is not.
- **Marketing personas.** Demographics ("32-year-old urban professional")
  are not job-to-be-done frames. Reject.
- **Over-fitting to one customer.** A persona is a cluster; if the
  user keeps describing one specific person, prompt: "Are there others
  who fit this same shape?"
