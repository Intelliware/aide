---
slug: glossary
title: "Glossary"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 400
---

## 30. Glossary

This section defines the project-specific vocabulary that is otherwise opaque to a downstream AI: domain terms (industry concepts that mean something specific here), internal acronyms, codebase shorthand, and aliases that appear in code but not in product copy. The goal is that an AI reading any function name, comment, or commit message in this codebase can resolve every term without guessing. Without a glossary, AI-generated code drifts toward generic naming that conflicts with the team's vocabulary.

Extract terms by skimming module names, class names, comment headers, and the README. Pay special attention to terms where the codebase usage diverges from common usage (e.g., "Order" might mean only the active-customer-facing kind, while archived/historical orders use a different name; "Account" might mean billing entity, not user identity). Include canonical *ID prefixes* so an AI can recognize identifier shapes by sight.

To verify, search the codebase for each term and confirm the definition matches actual usage. Add cross-references where two terms are easily confused (Account vs User, Tenant vs Organization, Subscription vs Plan). Note any deprecated terms that still appear in code so the AI doesn't propagate them in new work.

Be careful about scope: don't redefine industry-standard terms unless the codebase uses them in a non-standard way. Don't pad the glossary with generic technical terms (HTTP, JSON, REST). Do include any term where misunderstanding would cause incorrect code.

Hallucination risks: do not invent terms that don't appear in the code; do not document an aspirational meaning ("we *should* use X to mean Y") — document actual usage.

### Suggested template content

#### 30.1 Domain Terms

| Term | Definition | Notes / Cross-References |
|------|------------|--------------------------|
| {{Account}} | {{Billing entity. One Account contains 1..N Users.}} | {{Not the same as User}} |
| {{Tenant}} | {{Logical isolation unit. One Tenant = one Account in this codebase.}} | {{Used in row-level security}} |
| {{Subscription}} | {{Time-bounded entitlement attached to an Account}} | {{See `entitlement-*` flags, Section 26}} |
| {{Plan}} | {{Catalog SKU; Subscriptions reference a Plan}} | {{Plans are versioned}} |
| {{Order}} | {{Customer-facing purchase. Closed orders move to ArchivedOrder.}} | |
| {{ArchivedOrder}} | {{Read-only historical Order, > 90 days old}} | {{Different table, no FKs back}} |

#### 30.2 Acronyms

| Acronym | Expansion | Used In |
|---------|-----------|---------|
| {{DTO}} | {{Data Transfer Object}} | {{request/response shapes}} |
| {{VO}} | {{Value Object}} | {{domain layer}} |
| {{S2S}} | {{Service-to-Service (auth)}} | {{Section 8, Section 19}} |
| {{IDP}} | {{Identity Provider}} | {{Section 8}} |
| {{RLS}} | {{Row-Level Security}} | {{Section 14}} |

#### 30.3 ID Prefixes

| Prefix | Resource | Example |
|--------|----------|---------|
| `{{usr_}}` | User | `{{usr_01HX9K...}}` |
| `{{acc_}}` | Account | `{{acc_01HX9L...}}` |
| `{{ord_}}` | Order | `{{ord_01HX9M...}}` |
| `{{evt_}}` | Domain event | `{{evt_01HX9N...}}` |
| `{{job_}}` | Background job | `{{job_01HX9P...}}` |

ID format: {{ULID with prefix, 26 chars after prefix}}.

#### 30.4 Codebase Shorthand

| Shorthand | Meaning |
|-----------|---------|
| `{{svc}}` | {{this service's package prefix in metric and log namespaces}} |
| `{{repo}}` | {{repository, not "repository as in git"}} |
| `{{ctx}}` | {{request context (user, tenantId, traceId)}} |

#### 30.5 Deprecated Terms (Avoid in New Code)

| Old Term | Replaced By | Why Deprecated |
|----------|-------------|----------------|
| {{Customer}} | {{Account}} | {{ambiguous with end-user}} |
| {{Workspace}} | {{Tenant}} | {{collision with editor concept}} |
