# Security

> Security considerations and best practices for Atlassian CLI

---

## Overview

The Atlassian CLI handles sensitive credentials (Personal Access Tokens) and interacts with corporate Jira and Confluence instances. This document outlines security practices and considerations.

---

## Authentication Security

### Personal Access Tokens (PAT)

- **Storage**: Tokens are stored in `.env` files, which should be:
  - Excluded from version control (`.gitignore`)
  - Readable only by the user (`chmod 600 .env`)
  - Never shared or committed

- **Transmission**: Tokens are sent via HTTPS using Bearer authentication
  ```
  Authorization: Bearer <token>
  ```

- **Logging**: Tokens are automatically redacted in logs
  ```javascript
  // Never logged
  token: '[REDACTED]'
  ```

### Token Best Practices

1. **Regenerate periodically**: Rotate tokens every 90 days
2. **Minimum permissions**: Only grant necessary access
3. **Revoke if compromised**: Immediately revoke suspicious tokens
4. **One token per use case**: Don't reuse tokens across projects

---

## Data Security

### Cached Data

- Cached files may contain sensitive information
- Consider excluding from version control:
  ```gitignore
  cache/jira/**/*.json
  cache/confluence/**/*.json
  ```

- Raw API responses (`.json`) contain full data

### Log Files

- API logs in `_logs_/` may contain:
  - Request URLs and parameters
  - Response status codes
  - Timing information
  - Error messages (may include sensitive context)

- Exclude from version control:
  ```gitignore
  _logs_/
  ```

---

## Environment Variables

### Sensitive Variables

| Variable | Sensitivity | Notes |
|----------|-------------|-------|
| `JIRA_TOKEN` | 🔴 High | Never log or commit |
| `CONFLUENCE_TOKEN` | 🔴 High | Never log or commit |
| `ATLASSIAN_TOKEN` | 🔴 High | Never log or commit |
| `JIRA_URL` | 🟡 Medium | Internal URL |
| `CONFLUENCE_URL` | 🟡 Medium | Internal URL |
| `OUTPUT_DIR` | 🟢 Low | Safe to commit |

### .env File Security

```bash
# Set proper permissions (Unix/Mac)
chmod 600 .env

# Verify permissions
ls -la .env
# Should show: -rw------- (owner read/write only)
```

---

## Network Security

### HTTPS Only

- All API calls use HTTPS
- No HTTP fallback
- Certificate validation enabled

### Corporate Firewalls

If behind a firewall, ensure access to:
- `jira.example.com` (Jira)
- `confluence.example.com` (Confluence)

### Proxy Support

For proxy environments, set:
```bash
export HTTPS_PROXY=http://proxy.example.com:8080
```

---

## Code Security

### Dependency Management

- Regular dependency updates
- `npm audit` for vulnerability scanning
- Lock file (`package-lock.json`) committed

### Input Validation

- Issue keys validated: `^[A-Z]{2,}-\d+$`
- Page IDs validated: `^\d+$`
- URLs validated for proper format

### Output Sanitization

- User input escaped in output
- No code execution from fetched data

---

## Best Practices

### For Users

1. ✅ Keep `.env` out of version control
2. ✅ Use separate tokens for different environments
3. ✅ Regenerate tokens periodically
4. ✅ Review cached data before committing
5. ❌ Don't share tokens or .env files
6. ❌ Don't commit sensitive API responses

### For Contributors

1. ✅ Never log tokens or credentials
2. ✅ Use environment variables for secrets
3. ✅ Validate and sanitize all inputs
4. ✅ Use HTTPS for all external calls
5. ❌ Don't hardcode credentials
6. ❌ Don't disable certificate validation

---

## Incident Response

### If Token is Compromised

1. **Revoke immediately**: Go to Atlassian profile → PAT → Revoke
2. **Generate new token**: Create a fresh token
3. **Update .env**: Replace compromised token
4. **Audit activity**: Review recent Atlassian activity
5. **Report**: Notify security team if required

### If Sensitive Data is Committed

1. **Don't panic**: Act quickly but methodically
2. **Remove from history**: Use `git filter-branch` or BFG
3. **Rotate credentials**: Treat as compromised
4. **Force push**: Update remote with clean history
5. **Notify stakeholders**: Inform affected parties

---

## Compliance

### TD Bank Standards

The CLI follows TD's security requirements:
- Secure credential storage
- HTTPS-only communication
- No sensitive data in logs
- Proper access controls

### OWASP Guidelines

Addresses common security concerns:
- A01: Broken Access Control ✅
- A02: Cryptographic Failures ✅
- A03: Injection ✅
- A07: Auth Failures ✅

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. Contact the security team directly
3. Provide detailed description
4. Allow time for fix before disclosure

---

## Security Checklist

Before using in production:

- [ ] `.env` excluded from git
- [ ] Tokens have minimal required permissions
- [ ] `_logs_/` excluded from git
- [ ] Sensitive cached data excluded from git
- [ ] Running `npm audit` shows no critical issues
- [ ] Using latest version of CLI

---

**See Also**: [ARCHITECTURE.md](ARCHITECTURE.md), [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
