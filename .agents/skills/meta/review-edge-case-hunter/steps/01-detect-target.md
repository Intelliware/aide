# Step 1 — Detect target

Goal: resolve `--target`, classify the artifact, and infer `--stage` if absent.

This step is **identical** to `meta/review-adversarial/steps/01-detect-target.md` — same resolution rules, same classification table, same inference table, same defaults. The only difference is the default `--output-path` filename:

| Skill | Default output filename |
|---|---|
| `review-adversarial` | `review-adversarial.md` |
| `review-edge-case-hunter` | `review-edge-case-hunter.md` |

Apply the procedure documented in `meta/review-adversarial/steps/01-detect-target.md` § 1.1–1.5 verbatim, substituting the output filename above.

The output of this step is the same in-memory record:

```yaml
target_path: <resolved>
target_artifact: <classified>
stage: <inferred or supplied>
target_commit: <sha or 'unknown'>
output_path: <resolved>
```

This record feeds Step 2.
