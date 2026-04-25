---
slug: appendix-a-complete-feature-implementation-walkthrough
title: "Appendix A: Complete Feature Implementation Walkthrough"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 410
---

## Appendix A: Complete Feature Implementation Walkthrough

This appendix is a fully-worked example: a single, modest feature implemented end-to-end through every layer of the codebase, with all the artifacts a real PR would contain. Its purpose is to ground every other section in concrete code so the downstream AI has a high-fidelity reference when authoring a new feature. The walkthrough is *the* canonical example — when the AI is unsure which pattern to follow, it should look here first.

Pick a feature that exercises as many of the prior sections as possible without becoming sprawling: ideally one new endpoint that performs a write, requires authorization, validates input, talks to a downstream service, persists data, emits an event or job, and returns a structured response. A "create reservation" or "cancel order" or "invite user" use case typically fits. Show the OpenAPI spec change, the controller, the DTOs, the service method, the domain rule, the repository method, the migration, the tests, and the metric/log emission.

To verify the walkthrough remains current, treat it as a build artifact — when patterns change in the codebase, this appendix must be updated in the same PR. Stale walkthroughs are worse than missing ones because they actively mislead. If a section in the walkthrough drifts from the rest of the document, fix the walkthrough rather than the prior sections (the prior sections are the single source of truth; the walkthrough is a derived illustration).

Be careful about over-fitting: choose a feature general enough that the patterns transfer, not so quirky that the AI imitates one-off details. Annotate every code block with a comment that says *which prior section* the code instantiates (e.g., `// Section 9: request validation`).

Hallucination risks: do not invent code that doesn't exist in the actual codebase; do not stitch together patterns from different features pretending it's one feature; do not skip any layer to keep the example short — that defeats the purpose.

### Suggested template content

#### A.1 The Feature

**Story:** {{e.g., "Allow an authenticated user to invite a teammate to their account by email. The invitee receives an email with a one-time link; clicking the link creates a User and binds it to the inviter's Account."}}

**Endpoint:** `{{POST /v1/accounts/{accountId}/invitations}}`

**Sections exercised:** {{3, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 20, 21, 22, 26, 28}}

#### A.2 OpenAPI Change (Section 3)

```yaml
# diff against {{openapi.yaml}}
{{snippet showing path, schemas, responses}}
```

#### A.3 Migration (Section 16)

```{{language}}
// {{db/migrations/2024xxxx_add_invitations.ts}}
{{up + down}}
```

#### A.4 Domain Model & Rule (Section 12)

```{{language}}
// src/domain/invitation/invitation.ts
class Invitation {
  // factories, value objects, invariants
}
```

#### A.5 Repository (Section 15)

```{{language}}
// src/invitation/invitation.repo.ts
{{create, findByToken, markAccepted}}
```

#### A.6 DTO + Validation (Section 9)

```{{language}}
// src/invitation/dto/create-invitation.dto.ts
{{class with validators}}
```

#### A.7 Service (Section 11)

```{{language}}
// src/invitation/invitation.service.ts
async invite(account: Account, dto: CreateInvitationDto, actor: User): Promise<Invitation> {
  // Section 8: authorization (actor is account admin)
  // Section 12: domain rule (one pending invite per email per account)
  // Section 11.2: transaction
  // Section 18: enqueue email job
  // Section 21: log info
}
```

#### A.8 Controller (Section 7)

```{{language}}
// src/invitation/invitation.controller.ts
@Post('/v1/accounts/:accountId/invitations')
@Auth({ scope: 'invitations:write' })
async create(@Param('accountId') accountId: string, @Body() dto: CreateInvitationDto, @CurrentUser() actor: User) {
  const inv = await this.service.invite(accountId, dto, actor);
  return toResponseDto(inv); // Section 29
}
```

#### A.9 Background Job — Send Invitation Email (Section 18)

```{{language}}
// src/jobs/send-invitation-email.ts
{{handler with retry, idempotency}}
```

#### A.10 Tests (Section 22)

**Unit (service):**
```{{language}}
{{test for happy path + 2 failure branches}}
```

**Integration (HTTP):**
```{{language}}
{{POST returns 201, persists row, enqueues job}}
```

**Contract (OpenAPI):**
```{{language}}
{{response shape conforms to spec}}
```

#### A.11 Observability Verification (Section 21)

- Log line emitted: `{ event: 'invitation.created', invitationId, accountId, actorId }`
- Metric incremented: `svc_invitations_created_total{result="ok"}`
- Trace span: `invitation.service.invite`

#### A.12 Feature-Flag Gating (Section 26)

```{{language}}
if (!(await flags.boolVariation('release-invitations-v1', { accountId }, false))) {
  throw new NotFoundException(); // hide endpoint when flag off
}
```

#### A.13 Checklist Walkthrough (Section 28)

For each item in Section 28's checklist, show which artifact above satisfies it:

| Checklist Item | Where Satisfied |
|----------------|-----------------|
| {{28.2: OpenAPI updated}} | {{A.2}} |
| {{28.3: validation DTO}} | {{A.6}} |
| {{28.4: service throws typed errors}} | {{A.7}} |
| {{28.5: repo + migration}} | {{A.3, A.5}} |
| {{28.7: structured logs + metric}} | {{A.11}} |
| {{28.9: unit + integration + contract tests}} | {{A.10}} |
| {{28.11: feature flag default off}} | {{A.12}} |
