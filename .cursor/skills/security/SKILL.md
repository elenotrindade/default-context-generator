---
name: security
description: Guides security practices in code and systems: authentication, authorization, sensitive data, OWASP and hardening. Use when reviewing or implementing auth, APIs and data handling.
---

# Security

## Scope

- Authentication (JWT, OAuth, sessions) and authorization (RBAC, permissions)
- Protection of sensitive data, input sanitization, injection prevention
- HTTPS, security headers, CORS
- OWASP good practices and compliance when applicable

## When documenting context

- Describe the auth model and where it is implemented
- Mention policies for secrets and sensitive variables
- Indicate if there is security review or checklist

## When generating rules

- Include rules to not expose secrets, validate input and use prepared statements
- Reference OWASP or security docs of the stack used
