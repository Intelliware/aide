# Overview — review-edge-case-hunter

## Purpose

`review-edge-case-hunter` is the method-driven half of A.I.D.E.'s adversarial review layer. It walks an artifact systematically, enumerating every branching path and boundary the artifact's domain implies, and reports only those the artifact does not handle. Its sibling, `review-adversarial`, questions intent and framing.

This skill catches coverage gaps.

## Why it exists

Constructive sub-reviews (the existing `review-*-package` lineup) check whether the artifact says what it says clearly, completely, and consistently. Adversarial review (`review-adversarial`) checks whether the artifact's framing is honest. Neither systematically asks: **for every branch the artifact's logic implies, is the unhappy path addressed?**

This skill does. It is "method-driven not attitude-driven" by design — exhaustive coverage of the artifact's implied edge surface.

## What "method-driven" means in practice

The skill applies seven edge categories to the target artifact in sequence. For each category, it enumerates the edges the artifact's domain implies, then walks the artifact text to check which are addressed. Only **unaddressed** edges become findings.

### The seven categories

1. **Branching paths** — every `if`, `when`, `else`, conditional behaviour, alternative flow. For each branch, is the alternative path described?
2. **Error paths** — every external dependency, I/O, parse, validation, conversion. For each: timeout, partial failure, invalid input, downstream-error mapping?
3. **Boundary conditions** — every numeric, length, count, age, percentage. For each: zero, one, max, max+1, negative (where applicable)?
4. **Concurrency edges** — every "user X happens", "two concurrent operations", "shared resource". For each: race, double-submission, lost-update, ordering, idempotency?
5. **Time / clock / timezone edges** — every date, time-of-day, schedule, retention, expiry. For each: timezone, DST transition, clock drift, end-of-month, leap year/second, expiry-mid-operation?
6. **Data-shape edges** — every field, list, document. For each: empty, max length, max count, malformed, multi-byte / unicode, nested-empty, nested-cycle?
7. **Authorization / permission edges** — every actor, role, scope. For each: missing permission, partial permission, role transition during operation, impersonation, nested authorization (acting on someone else's data)?

A finding answers: which category, which specific edge, which artifact section *should* have addressed it, and what's missing.

## Stage-specific specializations

The `--stage` hint adjusts which categories are emphasized; it does not skip categories.

| Stage | Emphasized categories |
|---|---|
| `requirements` | Branching paths, error paths, authorization edges |
| `design` | All seven; concurrency and time/clock heavily |
| `planning` | Branching paths (increment ordering), error paths (rollback) |
| `execution` | Boundary conditions (test coverage), data-shape edges (input validation) |
| `reverse-engineering` | Error paths (does the source actually handle each documented case?), data-shape edges (what does the parser accept?) |
| `knowledge-base` | Branching paths (component dependency edges), data-shape edges (frontmatter validity) |
| `quick-dev` | Branching paths, boundary conditions (the most-missed edges in small changes) |
| `meta` | All seven equally |

If `--stage` is absent, the skill detects from artifact frontmatter or path heuristics (same logic as `review-adversarial`).

## Severity scoring

Same conservative bar as `review-adversarial`:

- `critical` — unhandled edge that, if hit, will produce wrong outcomes (silent data loss, security breach, incorrect business outcome). Examples: an authorization edge unaddressed in a money-moving requirement; a concurrency race in a checkout flow.
- `high` — unhandled edge that will degrade the system noticeably. Examples: a timeout case with no fallback in a synchronous user-facing flow; a boundary case (zero items) with undefined UI.
- `medium` — unhandled edge with limited blast radius. Examples: a timezone edge in a logging timestamp; a malformed-input case for an internal-only API.
- `low` — unhandled edge unlikely to ever fire. Examples: a leap-second edge in a UI animation timer.

## What "handled" means

An edge is **handled** if the artifact:

1. Explicitly addresses it (acceptance criterion, behaviour spec, ADR, etc.).
2. Explicitly delegates it ("partner system handles partial failure; we trust it"). Delegation must be named, not implied.
3. Explicitly excludes it ("we do not support multi-byte names in v1; out of scope until v2"). Exclusion must be named.

An edge is **unhandled** if none of the above. Silence is not handling.

Important: the skill reports unhandled edges, not "unhandled-and-likely-to-fire" edges. Likelihood is captured in the severity column. The artifact author can accept a `low`-severity unhandled edge by triaging it `wont-fix` — that's the right outcome for low-likelihood edges that don't warrant treatment.

## Position in workflow

- **Anytime use:** any artifact, any time.
- **Wrapped from a `review-*-package` skill:** invoked as the `review-edge-cases` sub-review (after `review-adversarial-pass`, before the readiness gate).

## What this skill does not do

- It does not exhaustively enumerate every conceivable edge in the universe — only those the artifact's domain implies. A requirement about checkout flow doesn't get edge findings about cosmic-ray bit flips.
- It does not flag handled edges (positive coverage). The output is unhandled edges only.
- It does not perform attitude-driven review. That's `review-adversarial`.
- It does not block the gate by itself — wrappers do, via the verdict-mapping spec.
