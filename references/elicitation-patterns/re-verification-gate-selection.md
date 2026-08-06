# Elicitation pattern: RE verification-gate selection

## Purpose

Routes the **close-out** of a reverse-engineering run. Extraction is finished; the
question is how the output gets attested before `build-knowledge-base` ingests it.
Two legal answers: an automated mechanical gate, or a review with human sign-off.

Invoked by every `reverse-engineer-*` skill at the point its workflow would otherwise
have run `steps/verify.md` unconditionally. That unconditional kick-off is what this
pattern replaces: the AI no longer picks the gate on the user's behalf.

Why it exists: RE output feeds the knowledge base, which feeds every downstream stage.
For most of the framework's life this leg closed on an AI self-check that graded its own
extraction against judgment-based checklists and issued its own GO/NO-GO. That is
appropriate for some runs and plainly insufficient for others — a first extraction of a
load-bearing system, a mainframe program nobody has read in a decade, anything that will
anchor a migration. The user is the one who knows which kind of run this is.

## Inputs needed from user

- The close-out mode for this run: `automated` or `review`
- (When `automated` and the mechanical gate returns NO-GO) whether to fix and re-run the
  gate, or escalate to the review path

That is the whole script. This pattern is deliberately one question — it sits at the end
of a long extraction, and a multi-question ceremony there earns nothing.

## Question script

Ask **one question**. Do not proceed on inference.

1. **How should this extraction be closed out?**

   Present it with the trade-off visible, not as a bare enum:

   > Extraction for `<repo>` is complete. How do you want to close it out?
   >
   > **A) Automated verification** — I run the machine-checkable gate: marker scan,
   > inventory reconciliation against `extraction-status.md`, composition block-list
   > completeness, cross-reference resolution, freshness, and any domain tooling
   > (spec linters, JSON/mermaid parse). I issue a mechanical GO/NO-GO.
   >
   > Checks that only I can judge — whether a documented default really matches the
   > code, whether Part A and Part B contradict each other, whether a type signature
   > was simplified — are reported as **UNVERIFIED**. They are never counted toward
   > GO. No human sign-off needed.
   >
   > **B) Review with human sign-off** — the mechanical checks run first as evidence,
   > then `review-reverse-engineering-package` runs nine ordered sub-reviews
   > (completeness, grounding, consistency, coverage, freshness, traceability,
   > adversarial pass, edge cases, readiness). Each verdict is presented for your
   > acceptance, and the run ends with a written APPROVED / CONDITIONAL / BLOCKED
   > readiness verdict on disk.
   >
   > B is strictly additive — it keeps every check A performs and adds judgment on
   > top. A is faster and unattended; it just cannot tell you the extraction is
   > *correct*, only that it is well-formed.

   - **Format:** multiple-choice, single answer
   - **Options:** `automated` / `review`
   - **Validation:** exactly one; no default applied on a non-answer — re-ask
   - **Maps to:** `re_close_out.mode`

**Halt condition.** Do not run either path until this is answered. "The extraction looked
clean" is not an answer, and neither is silence. A skill that picks the gate itself has
reintroduced the problem this pattern exists to fix.

## Pre-answering from config

`[project.elicitation].re_verification_gate` in `project.toml` may pre-answer the
question. Values: `ask` (default) / `review` / `automated`.

| Value | Behavior |
|---|---|
| `ask` | Ask the question. This is the default and the intended normal case. |
| `review` | Echo the pre-set choice — "Closing out via the review path per `re_verification_gate = "review"`" — then route. Do not re-ask; do not treat the config as merely a suggested default. |
| `automated` | Same, for the automated path. |

For unattended invocations (CI, scheduled KB refresh) with `re_verification_gate = "ask"`,
**fail fast** with a clear error naming the key to set — the same convention
`review-requirements-package` § Step 0 uses for a missing `feature-id`. Never silently
pick a mode because nobody is there to answer.

## Routing table

| Answer | Route |
|---|---|
| `automated` | Run `steps/verify.md` in **`automated`** mode. It issues the mechanical GO/NO-GO. On GO, hand off to `build-knowledge-base` / `update-knowledge-base`. On NO-GO, present failures and ask the follow-up in § Inputs. |
| `review` | Run `steps/verify.md` in **`review-evidence`** mode — mechanical checks only, **no verdict issued** — then hand off by name to `review-reverse-engineering-package`, passing the report as evidence. That skill owns the readiness verdict. |

Both routes are legal exits from the RE stage. This is a user-elected fork, in the same
sense as the quality-stage fork at `review-implementation-package` GO — not a gate the
user is talked out of.

## Output format

Record the choice in the change tracker at the Part-A root, so a later reader can tell
which attestation this extraction actually received:

```markdown
| Date | Change Type | Parts Affected | Trigger | Source Version | Verification |
|---|---|---|---|---|---|
| 2026-08-04 | Verified | A, B | RE close-out gate | a3f9c12… | automated (mechanical GO; 7 UNVERIFIED) |
```

The `Verification` cell states the mode and its outcome. For the review path it cites the
readiness verdict instead: `review (CONDITIONAL — see review/readiness-verdict.md)`.

## Validation rules

- The question is asked exactly once per repo per RE run, at close-out — not at skill
  start, where the user cannot yet judge what the extraction produced.
- A non-answer re-asks. There is no inferred default.
- `automated` mode MUST NOT report a model-judgment check as PASS. Its verdict line
  covers machine-checkable items only; judgment items appear under UNVERIFIED with a
  count. A GO with a non-empty UNVERIFIED list is a legal and expected outcome — it means
  "well-formed, not attested as correct", and the report must say so in those terms.
- `review` mode MUST NOT skip the mechanical checks. Choosing human review is not a
  reason to lose the linters.
- In `review-evidence` mode `steps/verify.md` MUST NOT issue GO/NO-GO. Two verdicts for
  one extraction is worse than one.
- The mode and its outcome are logged to the change tracker either way. An extraction
  whose attestation history is unrecorded is indistinguishable from an unattested one.

## Reusable across

All eleven `reverse-engineer-*` skills:
`reverse-engineer-api`, `reverse-engineer-api-framework`, `reverse-engineer-web-app`,
`reverse-engineer-ui-framework`, `reverse-engineer-database`, `reverse-engineer-mobile-app`,
`reverse-engineer-mobile-framework`, `reverse-engineer-cobol-program`,
`reverse-engineer-copybook-library`, `reverse-engineer-jcl-job`,
`reverse-engineer-test-suite`.

Not used by `analyze-repository` — it dispatches, it does not extract, so it has nothing
to attest.
