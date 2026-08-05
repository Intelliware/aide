# Exploration queue

Open questions and requests about **A.I.D.E.'s own development** — things to
investigate, compare, or design next. Working material, in the same category as the
rest of `_docs/`.

**This is not a framework artifact.** No skill emits it, no composition renders it, no
block template or `config/SCHEMAS.md` entry describes it, and no validator checks it.
Nothing in a user's project should ever produce a file like this. It lives here because
A.I.D.E. is itself a repo someone develops, and this is where that repo's open threads
are parked so they do not get lost between sessions.

Distinct from the other `_docs/` files: those record decisions already taken
(`solution-context-gap-audit.md`, `adversarial-review-design.md`), while this records the
asks that led to them. Resolved items stay, marked ✅ with a pointer to where the answer
landed — the request is often the clearest statement of why a feature exists.

Was `TODO.md` at repo root until 2026-08-05.

---

### ✅ DONE — Alignment with BMAD project-cotext / document-project skills/workflows
**Resolved in 1.1.0 (commits 5c7f251 → d4151a8) — solution-context layer.**

In order to create the knowledge base defined in the skills of this project we use the documentation that is reverse engineered from the various reverse engineering       
skills. I believe this creates a good technical knowledge base from the various repositories that consitute the solution that the overall knowledge base represents, but   
it may not be enough from the perspective of documenting the solution perspaective. I know the BMAD method which we have available in the _bmad folder uses a              
generate-project-context and documet-project skill/workflow to do this. Could you please analyze and compare what those 2 BMAD skills/workflows dfo compared to what our   
current knolwedge base building skills do and tell me what the gaps are as well as put together a plan to remediate those gaps.                                            

### ✅ DONE — Alignment with BMAD adverserial review skills/workflows
**Resolved in the `mm/reconcile` branch — adversarial-review layer.**

Landed as two AIDE-native anytime skills rather than one generic one, split along
the axis BMAD's single skill conflates: `meta/review-adversarial` is
attitude-driven (hidden assumptions, weasel words, unsupported claims, scope
inflation) and `meta/review-edge-case-hunter` is method-driven (branches,
boundaries, error paths). They are orthogonal and teams run both.

Targeting: each takes `--stage` and loads a stage-specific failure-mode catalog,
so a requirements review looks for different things than an RE review. All five
`review-*-package` skills wrap them as sub-reviews immediately before their
readiness gate, via the shared dispatcher in
`references/review-patterns/adversarial-wrapper-pattern.md`.

Output format: `aide-adversarial-findings@1` (Format 4) in
`references/review-patterns/review-output-format.md` — YAML frontmatter carrying
`severity_counts`, `worst_severity` and `triage_counts` for machine consumption,
plus a human-readable findings body. The frontmatter is what lets a wrapper map
severity to its own verdict vocabulary without re-reading the prose.

BMAD as found in the _bmad folder has an adverserial review skill that I would like to use in the context of our AIDE framework, however the BMAD skill is 
very generic and I'd like the AIDE skill to be more targetted at what the AIDE framework supports. The BMAD skill's output
is also not very nicely formatted for human readability. So can I ask you too do 2 things 1) provide me a few different options
on how we could structure an adverserial review skill for the AIDE framework and 2) provide some options as to how the skill 
could use better prompting to format the output of its review in a nicer humand readble format (e.g. using buleltted lists, 
but feel free to think of other mechanisms)
