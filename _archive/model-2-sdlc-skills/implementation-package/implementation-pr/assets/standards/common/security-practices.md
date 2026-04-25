# Security Practices Standards

## Purpose

These standards establish baseline security controls for application code. They defend against the most common vulnerability classes (injection, broken access control, sensitive data exposure) and ensure that security is built into every service rather than bolted on after the fact.

## Applicability

All backend services, APIs, and web applications. Frontend applications follow SEC-01, SEC-04, and SEC-02. Infrastructure and CI/CD pipelines follow SEC-02, SEC-09, and SEC-10. Libraries and SDKs follow all rules except SEC-05, SEC-07, and SEC-08, which are application-level concerns.

## Rules

### SEC-01: Validate All Inputs

**Severity:** Error
**Rule:** Validate every external input at the API or form boundary using schema validation — never trust client-supplied data.
**Why:** Unvalidated input is the root cause of injection, type confusion, and business logic bypass vulnerabilities.

**Compliant:**

```typescript
const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
});
const data = schema.parse(req.body);
```

**Non-compliant:**

```typescript
const { email, age } = req.body;
await createUser(email, age);
```

### SEC-02: No Hardcoded Secrets

**Severity:** Error
**Rule:** Never commit passwords, API keys, tokens, or connection strings in source code — load them from environment variables or a secret manager.
**Why:** Secrets in source code are trivially extracted from version history, build artifacts, and client bundles.

**Compliant:**

```typescript
const apiKey = process.env.PAYMENT_API_KEY;
if (!apiKey) throw new Error("PAYMENT_API_KEY is not configured");
```

**Non-compliant:**

```typescript
const apiKey = "sk_live_9a8b7c6d5e4f3a2b1c0d";
```

### SEC-03: Parameterized Queries Only

**Severity:** Error
**Rule:** Use parameterized queries or an ORM for all database access — never concatenate user input into query strings.
**Why:** String concatenation enables SQL and NoSQL injection, the most exploited vulnerability class for over two decades.

**Compliant:**

```typescript
const users = await db.query(
  "SELECT * FROM users WHERE email = $1",
  [email]
);
```

**Non-compliant:**

```typescript
const users = await db.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

### SEC-04: Encode Output

**Severity:** Error
**Rule:** HTML-encode, URL-encode, or use framework auto-escaping for all dynamic content rendered in the UI.
**Why:** Unencoded output enables cross-site scripting (XSS), allowing attackers to execute arbitrary code in users' browsers.

**Compliant:**

```typescript
return <p>{userComment}</p>; // React auto-escapes
```

**Non-compliant:**

```typescript
return <p dangerouslySetInnerHTML={{ __html: userComment }} />;
```

### SEC-05: Enforce Authentication on All Endpoints

**Severity:** Error
**Rule:** Every API endpoint must require authentication unless it is explicitly marked as public in a route allowlist — default to deny.
**Why:** A single unprotected endpoint can expose sensitive data or operations to anonymous attackers.

**Compliant:**

```typescript
app.use(authMiddleware);
app.get("/health", skipAuth, healthHandler);
app.get("/api/orders", ordersHandler);
```

**Non-compliant:**

```typescript
app.get("/api/orders", ordersHandler);
app.get("/api/admin/users", adminUsersHandler);
```

### SEC-06: Implement Authorization Checks

**Severity:** Error
**Rule:** Check permissions at the service layer, not only at route guards — enforce defense in depth so that no code path bypasses authorization.
**Why:** Route-only guards are bypassed by internal calls, message consumers, and refactored code paths.

**Compliant:**

```typescript
async function deleteProject(actor: User, projectId: string) {
  const project = await projectRepo.findById(projectId);
  if (project.ownerId !== actor.id) throw new ForbiddenError();
  await projectRepo.delete(projectId);
}
```

**Non-compliant:**

```typescript
async function deleteProject(projectId: string) {
  await projectRepo.delete(projectId);
}
```

### SEC-07: Rate Limit Public-Facing Endpoints

**Severity:** Warning
**Rule:** Apply rate limiting to authentication, registration, password reset, and any public API endpoint to prevent brute force and abuse.
**Why:** Unthrottled endpoints allow credential stuffing, enumeration, and denial-of-service attacks.

**Compliant:**

```typescript
app.post("/auth/login", rateLimit({ windowMs: 60_000, max: 10 }), loginHandler);
app.post("/auth/reset", rateLimit({ windowMs: 60_000, max: 5 }), resetHandler);
```

**Non-compliant:**

```typescript
app.post("/auth/login", loginHandler);
app.post("/auth/reset", resetHandler);
```

### SEC-08: Configure CORS Restrictively

**Severity:** Warning
**Rule:** Whitelist specific allowed origins — never use the wildcard `*` origin for APIs that serve authenticated requests.
**Why:** Permissive CORS allows malicious sites to make authenticated requests on behalf of your users.

**Compliant:**

```typescript
app.use(cors({
  origin: ["https://app.example.com", "https://admin.example.com"],
  credentials: true,
}));
```

**Non-compliant:**

```typescript
app.use(cors({ origin: "*" }));
```

### SEC-09: Use Secure HTTP Headers

**Severity:** Warning
**Rule:** Set `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options`, and `X-Frame-Options` on all HTTP responses.
**Why:** Security headers mitigate protocol downgrade, XSS, MIME-sniffing, and clickjacking attacks with minimal effort.

**Compliant:**

```typescript
app.use(helmet({
  contentSecurityPolicy: { directives: { defaultSrc: ["'self'"] } },
  hsts: { maxAge: 31_536_000, includeSubDomains: true },
}));
```

**Non-compliant:**

```typescript
app.use(express());
// No security headers configured
```

### SEC-10: Audit Dependencies

**Severity:** Error
**Rule:** Run dependency auditing (`npm audit`, `pip audit`, or equivalent) in CI and block builds that contain known critical or high-severity vulnerabilities.
**Why:** Third-party packages are the most common vector for supply-chain attacks and known CVEs.

**Compliant:**

```typescript
// In CI pipeline configuration
// "npm audit --audit-level=high || exit 1"
```

**Non-compliant:**

```typescript
// No audit step in CI pipeline
// Known-vulnerable lodash@4.17.11 remains in package-lock.json
```

### SEC-11: Never Expose Internal Errors to Clients

**Severity:** Error
**Rule:** Return safe, generic error messages to API consumers — never include stack traces, SQL errors, or internal file paths in responses.
**Why:** Detailed error messages reveal internal architecture, library versions, and data schemas to attackers.

**Compliant:**

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({ error: "An internal error occurred" });
});
```

**Non-compliant:**

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});
```

### SEC-12: Handle Sensitive Data Carefully

**Severity:** Error
**Rule:** Encrypt sensitive data at rest, enforce HTTPS for data in transit, minimize data retention, and mask sensitive fields in logs (per LOG-05).
**Why:** Data breaches are multiplied in impact when data is stored unencrypted, retained longer than necessary, or transmitted in the clear.

**Compliant:**

```typescript
const encrypted = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv },
  key,
  encoder.encode(ssnPlaintext)
);
await db.query("INSERT INTO profiles (ssn_enc) VALUES ($1)", [encrypted]);
```

**Non-compliant:**

```typescript
await db.query(
  "INSERT INTO profiles (ssn) VALUES ($1)",
  [ssnPlaintext]
);
```

## Customization

- **SEC-07 rate limits:** Thresholds vary by endpoint sensitivity — authentication endpoints typically allow 5–10 requests per minute, while read-heavy public APIs may allow hundreds. Tune based on legitimate traffic patterns.
- **SEC-08 CORS wildcard:** True public APIs (no cookies, no auth headers) may use `origin: "*"`. The restriction applies specifically to APIs that serve credentialed requests.
- **SEC-09 header values:** Exact `Content-Security-Policy` directives and `Strict-Transport-Security` `max-age` values depend on infrastructure, CDN configuration, and frontend framework requirements. The requirement is that the headers are present and intentionally configured.
