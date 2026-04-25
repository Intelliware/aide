---
slug: security-implementation
title: "Security Implementation"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 270
---

## 17. Security Implementation

### 17.1 Security Practices

- **Token Storage:** JWT tokens stored in Redux state (NOT localStorage) — cleared on logout
- **CORS:** API configured to accept requests from app domain only
- **HTTPS:** App and API use HTTPS in production
- **XSS Prevention:** All user input sanitized before display
- **CSRF Protection:** [If applicable — double-submit cookie, SameSite, token-based]

### 17.2 Sensitive Data Handling

- **Passwords:** Never logged or displayed
- **Tokens:** Never logged in console
- **PII:** Treated as sensitive; logged only to secure backend
- **Forms:** Sensitive fields (password, credit card) don't autofill

---

# Part 7 — Quality and Maintenance
