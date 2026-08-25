---
slug: research-stack
sequence: 2
depends-on-prior: true
---

# Step: Research Stack

Use web search to gather current documentation patterns, architectural conventions, and best practices for the target technology stack.

## When to run

Run this step at the start of Stage 2 (Web Research) of the parent generate-re-skill workflow, after the user has confirmed the stack analysis and domain slug from Stage 1.

## Why research matters

- Documentation patterns evolve with frameworks — what was best practice in 2023 may be outdated
- Different communities have different documentation expectations
- Research prevents generating templates based on outdated assumptions
- Industry examples inform what consumers actually need documented

## Inputs

- Confirmed domain slug from Stage 1
- Primary language and framework from Stage 1
- List of distinguishing characteristics from Stage 1

## Process

### 1. Search for Documentation Patterns

Use WebSearch with queries like:
- `"<framework> documentation best practices <current-year>"`
- `"<technology> API documentation patterns"`
- `"how to document <technology> codebase"`
- `"<framework> project structure documentation"`

Focus on:
- Official documentation guides from the framework/language
- Industry blog posts about documentation patterns
- Open-source projects with well-documented codebases

### 2. Research Architectural Conventions

Search for:
- `"<technology> architecture patterns"`
- `"<framework> project structure best practices"`
- `"<technology> clean architecture"`

Identify:
- Common layers/components in this technology
- Naming conventions
- Directory structure patterns
- Dependency management approaches

### 3. Identify Consumer Needs

Search for:
- `"<technology> getting started guide"`
- `"<technology> developer onboarding"`
- `"what developers need to know about <technology>"`

Determine:
- What do new developers need to understand first?
- What are common pain points?
- What information is often missing from docs?

### 4. Gather Domain-Specific Concerns

Search for:
- `"<technology> security best practices"`
- `"<technology> performance optimization"`
- `"<technology> testing patterns"`

Note any domain-specific concerns:
- Security considerations unique to this technology
- Performance patterns (caching, pooling, batching)
- Testing approaches specific to this stack
- Compliance/regulatory concerns (if applicable)

### 5. Present Findings

Summarize research in a structured format:

```
## Research Findings for <domain-slug>

### Documentation Patterns in the Industry

**Common sections in <technology> documentation:**
1. <section> — <what it covers>
2. <section> — <what it covers>
3. ...

**Tools commonly used:**
- <tool 1> — <purpose>
- <tool 2> — <purpose>

### Architectural Conventions

**Typical layers/components:**
- <layer 1>: <description>
- <layer 2>: <description>

**Directory structure patterns:**
```
<typical directory structure>
```

### Consumer Needs

**What new developers typically need:**
1. <need>
2. <need>

**Common documentation gaps:**
- <gap>

### Domain-Specific Concerns

- **Security:** <considerations>
- **Performance:** <patterns>
- **Testing:** <approaches>

### Implications for Template Design

Based on this research, the Part A blocks should include:
- <block idea 1>
- <block idea 2>

The Part B blocks should include:
- <block idea 1>
- <block idea 2>

Ready to proceed to Stage 3 (Define Template Structure)?
```

### 6. Get User Acknowledgment

Wait for user to acknowledge the research findings before proceeding to template definition. User may:
- Add context from their specific domain knowledge
- Correct any misunderstandings about the technology
- Highlight specific concerns that should be prioritized

## Output

- Summary of industry documentation patterns
- List of common architectural layers/components
- Consumer needs analysis
- Domain-specific concerns
- Initial block ideas for Part A and Part B

## Halt conditions

- Halt if web search fails consistently (ask user for offline context)
- Halt if the technology is so obscure that no patterns can be found (user must provide guidance)
- Halt if user identifies significant errors in the research findings

## Common mistakes

- Relying on outdated documentation patterns — always include current year in searches
- Over-indexing on a single source — look for consensus across multiple sources
- Skipping domain-specific concerns — security/performance/testing are often critical
- Generating templates before research is acknowledged by user
