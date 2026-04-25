---
slug: l3-llm-contradiction
sequence: 3
depends-on-prior: true
---

# Step 3 — L3 LLM contradiction check (full mode only)

## Goal

For each remaining suspect (L2 medium/high, or `manual`-flagged from L2),
ask the model whether the component doc still factually matches the
changed code. Catches behavioural / semantic drift no structural diff
would catch.

## When to run

- `--mode=full` only. Gate mode skips this step.
- Skipped components: those with no L1 suspect (current); those whose L2
  said `low` or `holds`.

## Inputs

- Remaining suspects from step 2 (those with severity ≥ medium OR with
  `verification_signal: manual`).
- Cap from `--max-l3-suspects` (default 20).
- L3 cache at `<knowledge_base_path>/.drift-cache.json` (unless
  `--no-cache`).

## Procedure

1. **Cap suspects.** If `len(suspects) > --max-l3-suspects`:
   - Sort by L1 severity DESC, then by L2 severity DESC, then by
     `commits_since` DESC.
   - Take top `--max-l3-suspects`.
   - Record dropped suspects in the report with a `cap-skipped`
     annotation.

2. **For each capped suspect:**
   1. Compute cache key: `sha256(component_id + paths-checksum +
      current_head_for_component_repo)`.
   2. **Cache hit:** read verdict from cache, skip LLM call.
   3. **Cache miss:** prepare the LLM prompt:
      - System: "You are a documentation-drift detector. You will
        receive a component documentation file and a list of source
        files (or diff samples) that may have changed. Your job is to
        decide whether the documentation's factual claims still hold
        against the current source. Output JSON:
        `{verdict: 'holds'|'contradicts'|'ambiguous',
        contradictions: [string]}`."
      - User content:
        - The full component .md (frontmatter + body).
        - For each path in `paths:` that overlaps the diff (from L1):
          a small extract — the file's current contents up to ~200
          lines, plus the unified diff segment if available.
        - The component's `triggers` and `description`.
   4. Make the LLM call. Parse the JSON response.
   5. Severity:
      - `contradicts` → `high`.
      - `ambiguous` → `medium`.
      - `holds` → no L3 row (the L1/L2 row stays).
   6. Cache the verdict.

3. **Cache hygiene.** After the run, prune entries whose
   `current_head_for_component_repo` no longer matches the current state
   (i.e. component was updated since this verdict).

## Acceptance

- Every selected suspect has a verdict (cached or fresh).
- LLM call count ≤ `--max-l3-suspects`.
- Cache file is updated.

## Hand-off

`steps/04-l4-coverage-sweep.md` (full mode) → step 5.
