# Reverse-engineering stage

Skills for documenting existing repositories. Eleven domain skills, a thin dispatcher, a readiness gate, and a skill generator for unsupported stacks.

## Produces
Per repo, a Part A (internal implementation docs) and Part B (consumer-facing docs) artifact set. Part A renders under `<source-repo-path>/docs/<domain>-internal/`; Part B under the user's KB repo at `source-docs/<repo-slug>/<domain>-consumer/`. The KB index aggregator (`skills/knowledge-base/build-knowledge-base/`) consumes these.

Plus a **close-out attestation** per repo — either a mechanical verification report or a human-accepted readiness verdict. See below.

## The close-out gate

Extraction does not close itself. Every `reverse-engineer-*` skill ends by asking the
user how the output should be attested before the KB ingests it
(`references/elicitation-patterns/re-verification-gate-selection.md`):

| Answer | What runs | What you get |
|---|---|---|
| `automated` | `steps/verify.md` in `automated` mode | `MECHANICAL: GO / NO-GO`, scoped to machine-checkable (Tier M) checks. Model-judgment (Tier J) checks are reported UNVERIFIED and never counted toward GO. No human sign-off. |
| `review` | `steps/verify.md` in `review-evidence` mode (no verdict), then `review-reverse-engineering-package` | Nine ordered sub-reviews, each verdict accepted by the user, ending in a written APPROVED / CONDITIONAL / BLOCKED readiness verdict at `<PART-A>/review/`. |

Two properties worth stating plainly, because they are the point of the design:

- **`automated` cannot overstate itself.** It attests that the extraction is
  well-formed, not that it is correct. A GO with a non-empty UNVERIFIED list is the
  normal outcome, and the report says so in those words.
- **`review` loses nothing.** The mechanical checks still run; their report becomes
  evidence for sub-reviews 1, 5, and 6. The human gate is additive.

`[project.elicitation].re_verification_gate` (`ask` default / `review` / `automated`)
pre-answers the question for unattended runs. An unattended run left on `ask` fails
fast — the AI does not pick a mode on the user's behalf.

## Consumes
- Source repository path (elicited from user)
- Repo type identification (api / api-framework / web-app / ui-framework / database / mobile-app / mobile-framework / cobol-program / copybook-library / jcl-job / test-suite — the dispatcher routes)

## Skills
- `analyze-repository/` — thin dispatcher: detects repo type, recommends a domain skill. Now includes Stage 0 (project.toml registration check) and Stage 2b (unsupported stack fallback to `generate-re-skill`).
- `generate-re-skill/` — creates new RE skills for technology stacks not covered by the eleven domain types (e.g., GraphQL servers, serverless functions, ML pipelines, CLI tools). Invoked when `analyze-repository` cannot match a repository or when the user explicitly requests a new skill.
- `reverse-engineer-api/`
- `reverse-engineer-api-framework/`
- `reverse-engineer-web-app/`
- `reverse-engineer-ui-framework/`
- `reverse-engineer-database/`
- `reverse-engineer-mobile-app/`
- `reverse-engineer-mobile-framework/`
- `reverse-engineer-cobol-program/`
- `reverse-engineer-copybook-library/`
- `reverse-engineer-jcl-job/`
- `reverse-engineer-test-suite/`
- `review-reverse-engineering-package/` — per-repo readiness gate for the review path. Independently invocable against an existing extraction without re-running the RE skill that produced it. Sub-reviews 7–8 delegate to `meta/review-adversarial` and `meta/review-edge-case-hunter`.

Internal section headers within each skill use "Stage 1/2/…" (renamed from "Phase 1/2/…" to avoid colliding with the new outer "stage" vocabulary).
