# Stage 2b: Unsupported Stack Detection

If none of the eleven domain types match and classification confidence is low:

1. **Present findings to user:**

   > "This repository appears to be a **[detected pattern]** which doesn't match any of my eleven reverse-engineering domain types:
   >
   > - **Detected:** [language], [framework], [architectural style]
   > - **Closest matches:** [type1] (~X% fit), [type2] (~Y% fit)
   > - **Key distinguishing signals:** [list what makes this different]
   >
   > For example: GraphQL server (not REST), serverless functions (no persistent server), ML pipeline (training/inference modes), CLI tool (command structure), message queue consumer (event-driven), etc."

2. **Offer two paths:**

   > **A) Force-fit to closest type**
   > Use `reverse-engineer-<closest>` and adapt manually. Some sections may be irrelevant; others may need manual additions.
   >
   > **B) Create a new RE skill**
   > Run `generate-re-skill` to build a tailored documentation pattern for this technology stack. This creates a reusable skill, not just one-off documentation.

3. **Route based on user choice:**
   - **A → Force-fit:** Hand off to the closest RE skill with a warning that some sections may not apply. The user can skip irrelevant sections during extraction.
   - **B → Generate new skill:** Hand off by name to `generate-re-skill`. That skill will analyze the stack, research documentation patterns, and generate a complete RE skill.

**When to trigger Stage 2b:**
- No domain type matches with >70% confidence
- User expresses doubt about the classification
- The repository has characteristics not covered by any type's key distinguisher

**When NOT to trigger Stage 2b:**
- A domain type clearly matches (>80% confidence)
- The mismatch is minor (e.g., Django REST vs. Flask — both are API)
- User already indicated willingness to force-fit
