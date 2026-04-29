# Step 3 — Emit Format 4 findings file

Goal: render the in-memory findings list to a file at `output_path` conforming exactly to `references/review-patterns/review-output-format.md` schema `aide-adversarial-findings@1`.

This step is **identical** to `meta/review-adversarial/steps/03-emit.md` with one difference: the frontmatter `produced_by` field is `review-edge-case-hunter` instead of `review-adversarial`.

Apply the procedure documented there verbatim — § 3.1 (compute aggregates), § 3.2 (render frontmatter, with the corrected `produced_by`), § 3.3 (render body), § 3.4 (write file), § 3.5 (validation gate).

## Section 3.3a — title line

The title line uses "Edge-case findings" instead of "Adversarial findings":

```markdown
# Edge-case findings — <human title>
```

`<human title>` derivation is the same as in the sibling skill.

## Why two skills share Format 4

The schema is shared so wrappers can consume both findings files identically. The only field that signals which skill produced a given file is `produced_by` (and the title line, which is for human readers).

This is intentional: wrappers map `worst_severity` → verdict using the same table for both producers. Teams reading raw findings files can see at a glance which skill produced which file via title and frontmatter; downstream automation does not need to branch on producer.
