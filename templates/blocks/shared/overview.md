---
slug: overview
title: "Executive Summary"
applies-to: [greenfield-requirements-package, greenfield-design-package, greenfield-implementation-package, brownfield-enhancement-spec, quick-dev-spec, kb-instance]
requires-decision-from: [product-owner, architect]
optional: false
order-hint: 5
---

## Executive Summary

A reusable opening block for any package or spec. Compositions place this
near the top so a reader can decide in under a minute whether to keep
reading. Keep prose sharp: full paragraphs, no bullet lists masquerading
as paragraphs, and no boilerplate carried over from previous projects.

---

### Solution / Project Summary

{{summary_paragraph_1_what_this_is}}

State, in one or two sentences, what this artifact is and what it
delivers. Anchor the reader: "This document is the requirements package
for {{project_name}}'s {{epic_or_feature_name}}", _not_ "This is a
document about requirements."

{{summary_paragraph_2_why_now_business_context}}

State the business context: what changed, what problem this solves, why
this work is happening now and not six months ago / six months from now.
A reader skimming should leave with a clear answer to "why this, why
now."

{{summary_paragraph_3_approach_and_shaping_decisions}}

State the approach in plain language and call out the one or two
shaping decisions that the rest of the document follows from. If there
is an ADR or a referenced design doc that pins the approach, link it
here — don't restate its contents.

{{summary_paragraph_4_optional_scope_or_audience}}

Optional fourth paragraph: clarify audience (who must read this, who
may skim), and link out to companion documents (requirements package,
design package, KB) so a reader can navigate the full set without
asking.

{{summary_paragraph_5_optional_status_or_open_questions}}

Optional fifth paragraph: current status, top open questions, or
known blockers. Skip this paragraph if the document is final and there
are no live questions — it then exists only as drift waiting to happen.

---

### Goals

The outcomes this work is responsible for delivering. Goals are
**outcome-shaped**, not output-shaped: they describe what changes for
the user, the business, or the system, not what artifacts get produced.

- {{goal_1}}
- {{goal_2}}
- {{goal_3}}
- {{goal_n}}

> Aim for 3–6 goals. One goal is too thin to be worth listing
> separately; ten goals usually hide a lack of prioritisation. If you
> can't pick a top three, the work isn't shaped enough yet.

---

### Scope

What this artifact covers. State scope in **noun-phrases the reader can
verify** — features, surfaces, repos, journeys — not in soft language
like "improvements to checkout."

**In scope:**

- {{in_scope_1}}
- {{in_scope_2}}
- {{in_scope_3}}
- {{in_scope_n}}

**Surfaces affected** (UI screens, API endpoints, repos, datastores):

- {{surface_1}}
- {{surface_2}}
- {{surface_n}}

---

### Out-of-Scope

What this artifact deliberately does _not_ cover. The out-of-scope list
is what makes scope honest — without it, scope drifts to mean
"everything." Each entry should answer the implicit question
"why isn't X in here?" so a future reader does not have to re-litigate
the boundary.

- {{out_of_scope_1}} — {{out_of_scope_1_rationale}}
- {{out_of_scope_2}} — {{out_of_scope_2_rationale}}
- {{out_of_scope_n}} — {{out_of_scope_n_rationale}}

> If something is out of scope because it lives in a sibling artifact,
> link to that artifact in the rationale: `… handled in
> {{sibling_artifact_name}} ({{sibling_artifact_link}})`. Out-of-scope
> without a pointer to where the work _does_ live is a half-statement.
