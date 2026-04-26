---
slug: emit-adr-if-threshold
sequence: 4
depends-on-prior: true
---

# Step 4 — Emit ADR if threshold crossed (full mode only)

## Goal

If the diff crossed an ADR-worthy threshold, emit a new ADR under
`shared/adrs/`. ADRs are append-only; never edit existing ones except for
status transitions.

## Inputs

- `adr_threshold_signals` from step 1.
- `affected_components` from step 2.
- `templates/blocks/knowledge-base/adr-template.md`.
- Existing ADR files under `<knowledge_base_path>/shared/adrs/`.
- Increment context (for `Considered Alternatives`).

## ADR thresholds (recap)

1. New external dependency.
2. Framework replacement.
3. New auth/authz model.
4. New data store.
5. Breaking public-interface change.
6. New cross-cutting standard.

See `references/OVERVIEW.md` for the full list and rationale.

## Procedure

1. **Skip if no signals.** If `adr_threshold_signals` is empty, skip the
   step entirely.

2. **Group signals into ADR-units.** Multiple signals from the same
   feature usually indicate ONE architectural decision (e.g. "added
   fraud vendor" = signals 1 + 2 + 3 if vendor brings its own auth
   flow). Cluster signals into ≥1 ADRs based on theme.

3. **Allocate the next ADR number.** Read all existing
   `shared/adrs/ADR-NNNN-*.md`, find max NNNN, allocate `max + 1`. Pad
   to 4 digits.

4. **Render** `templates/blocks/knowledge-base/adr-template.md` per ADR:

   - `adr_number`: the allocated 4-digit number.
   - `adr_title`: short, decision-naming. "Fraud screening vendor
     selection" — not "We added fraud screening".
   - `adr_status`: `accepted` (the feature has shipped — the decision is
     in force).
   - `adr_date`: today.
   - `adr_deciders`: derived from PR reviewers + actor; if unknown,
     populate with the actor and add a `[REVIEW: deciders unknown]`
     marker. Do NOT silently leave blank — `verify-knowledge-base-coverage`
     flags placeholder ADRs.
   - `adr_consulted`, `adr_informed`: populate from increment context if
     possible; else leave with `[REVIEW: …]` marker.
   - `adr_tags`: short tag list — `[external-dep, vendor-integration]`.
   - **Context:** distill from the increment plans + commit messages.
     Two-to-five paragraphs. Name the forces and the constraints.
   - **Decision:** active voice. "We will use @acme/fraud-vendor-sdk
     for synchronous fraud screening …".
   - **Considered Alternatives:** populate if the increment lists them;
     else write a single row noting "Alternatives not documented at
     decision time" and flag for human follow-up.
   - **Consequences (Positive / Negative / Neutral):** distill from the
     increment's `Outcome` and `Success Criteria` sections.
   - **Affected components:** from `affected_components`.
   - **Migration / adoption plan:** populate from the increment's plan
     section; include rollback notes if present.
   - **Links — Supersedes:** check whether any existing ADR is logically
     superseded by this one. If so, list it AND in step 4b flip its
     status.
   - **Links — Related ADRs / components / external refs:** populate
     where evident.

5. **Write** the ADR file at
   `<knowledge_base_path>/shared/adrs/ADR-NNNN-<kebab-title>.md`.
   Refuse to overwrite — if the file already exists (impossible if
   numbering is correct), error and stop.

### 4b — Status transitions on superseded ADRs

If the new ADR explicitly supersedes ADR-MMMM:

1. Read `shared/adrs/ADR-MMMM-*.md`.
2. **Single-line edit only:** change the `Status:` block from `accepted`
   (or whatever) to `superseded by ADR-NNNN`. Leave every other line
   unchanged. This is the ONLY edit permitted to an accepted ADR.
3. If the existing file is already `superseded by …` or `deprecated`,
   warn but still write the new ADR (decision history can chain).

## Acceptance

- One ADR file written per ADR-unit (typically 0 or 1).
- ADR file parses; required fields populated; placeholders flagged with
  `[REVIEW: …]` markers if unfilled.
- If supersedes is set, the superseded ADR's status line was flipped.
- No existing accepted ADR was edited beyond its status line.

## Hand-off

`steps/05-update-graph.md`.
