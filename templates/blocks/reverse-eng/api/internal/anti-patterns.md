---
slug: anti-patterns
title: "Anti-Patterns"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 370
---

## 27. Anti-Patterns

This section catalogs the mistakes most likely to be introduced by AI-assisted code generation in this specific codebase, paired with the correct pattern. Anti-patterns are codebase-specific: a pattern that's idiomatic in one project (e.g., field injection, throwing strings, returning `null`) may be banned here. The downstream AI must read this list before authoring code in any new feature. Extract anti-patterns from: existing ADRs, code review comments preserved in PR templates, postmortems referencing recurring bugs, comments in code that say "do not do X", and the team's lint configuration.

To verify, cross-check each documented anti-pattern against an actual code site that demonstrates the *correct* counterexample. If a rule is documented but the codebase contains many violations, decide whether it's a real rule (and the violations are tech debt) or aspirational (and should be downgraded to a guideline).

Be careful about generic advice. "Don't use `any`" is true everywhere and not useful here. The valuable anti-patterns are codebase-specific: "don't call repositories from controllers in this codebase" or "don't throw `Error` directly — use `AppException` subclasses." Each anti-pattern should pair a *minimum-reproducible bad example* with a *minimum-reproducible good example*.

Hallucination risks: do not invent anti-patterns that aren't enforced; do not list rules from generic style guides if the codebase doesn't honor them; do not contradict patterns documented in earlier sections.

### Suggested template content

#### 27.1 Anti-Pattern: {{Title — e.g., "Calling Repositories Directly From Controllers"}}

**Why it's wrong here:** {{1-2 sentences referencing the layered architecture decision}}

```{{language}}
// BAD — bypasses service layer, makes endpoint untestable
@Get('/users/:id')
async get(@Param('id') id: string) {
  return this.userRepo.findById(id);
}
```

```{{language}}
// GOOD — go through the service
@Get('/users/:id')
async get(@Param('id') id: string) {
  return this.userService.findById(id);
}
```

**Detection:** {{e.g., custom ESLint rule `no-repo-in-controller`, code-review checklist}}

---

#### 27.2 Anti-Pattern: {{Throwing Plain Errors}}

**Why it's wrong here:** {{global error filter only maps domain exceptions to HTTP status codes; plain `Error` becomes 500}}

```{{language}}
// BAD
if (!user) throw new Error('not found');
```

```{{language}}
// GOOD
if (!user) throw new NotFoundException('user', id);
```

---

#### 27.3 Anti-Pattern: {{Mutating DTOs}}

```{{language}}
// BAD — mutates the request body
dto.email = dto.email.toLowerCase();
return this.create(dto);
```

```{{language}}
// GOOD — return a new normalized object
return this.create({ ...dto, email: dto.email.toLowerCase() });
```

---

#### 27.4 Anti-Pattern: {{N+1 Queries}}

**Why it's wrong here:** {{cross-reference Section 24.3}}

```{{language}}
// BAD
const orders = await orderRepo.findAll();
for (const o of orders) o.user = await userRepo.findById(o.userId);
```

```{{language}}
// GOOD
const orders = await orderRepo.findAll({ include: ['user'] });
```

---

#### 27.5 Anti-Pattern: {{Logging PII}}

```{{language}}
// BAD
logger.info(`user ${user.email} created order ${order.id}`);
```

```{{language}}
// GOOD — structured fields, redaction handles PII
logger.info({ userId: user.id, orderId: order.id }, 'order.created');
```

---

#### 27.6 Anti-Pattern: {{Silent `catch (e) {}`}}

```{{language}}
// BAD — error disappears
try { await sendEmail(...); } catch (e) {}
```

```{{language}}
// GOOD — log + decide: rethrow, fall through, or compensate
try {
  await sendEmail(...);
} catch (e) {
  logger.error({ err: e, userId }, 'email.send.failed');
  // queue for retry instead of failing the request
  await retryQueue.add('send-email', payload);
}
```

---

#### 27.7 Anti-Pattern: {{Hardcoded Configuration}}

```{{language}}
// BAD
const BUCKET = 'svc-uploads-prod';
```

```{{language}}
// GOOD
const BUCKET = config.storage.uploadsBucket;
```

---

#### 27.8 Anti-Pattern: {{Catch-and-Continue Inside Transactions}}

```{{language}}
// BAD — transaction commits inconsistent state
await tx(async (t) => {
  await t.users.update(id, dto);
  try { await t.audit.log(event); } catch {}  // failure swallowed
});
```

```{{language}}
// GOOD — let the transaction abort, or move the audit out of the tx
```

---

#### 27.9 Anti-Pattern: {{Forgotten Pagination}}

```{{language}}
// BAD — unbounded result set
return userRepo.findAll();
```

```{{language}}
// GOOD — paginate at the boundary, see Section 24.2
return userRepo.findAll({ limit, cursor });
```

---

#### 27.10 Anti-Pattern: {{ Use of `any` / dynamic / `interface{}` at Module Boundaries}}

{{Codebase-specific guidance}}
