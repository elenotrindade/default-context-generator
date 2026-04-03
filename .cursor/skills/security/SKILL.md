---
name: security
description: Guides security in code and systems: secrets and .env hygiene, API hardening, concurrency and race conditions, OWASP, and a practical attacker mindset. Use for auth, APIs, sensitive data, reviews, and threat-aware documentation.
---

# Security

## Scope

- Authentication (JWT, OAuth, sessions) and authorization (RBAC, permissions, resource-level checks)
- Protection of sensitive data, input sanitization, injection prevention
- HTTPS, security headers, CORS
- OWASP (web and API) and secure defaults for the stack in use

## Secrets and environment (.env)

- **Never commit** real secrets, API keys, private keys, or production connection strings. Use `.gitignore` for `.env`, `.env.local`, and similar; prefer a `.env.example` with placeholder names only (no real values).
- Prefer a **secret manager** or vault in non-dev environments (cloud provider secrets, HashiCorp Vault, Doppler, etc.); document where each environment loads secrets from.
- **Rotation:** call out which credentials should rotate on compromise or on schedule; document who owns rotation.
- **Logging:** do not log tokens, passwords, full authorization headers, or raw `.env` contents. Redact or omit sensitive fields in error and audit logs.
- **Docs and examples:** snippets in README and `docs/` must use obvious placeholders (`YOUR_KEY_HERE`); never paste values that could be real.

## APIs (surface and abuse)

- Distinguish **authentication vs authorization**; verify both on every sensitive operation (including object-level: user A must not access user B’s resource).
- **Input validation:** schema validation for JSON bodies and query params; reject unknown fields when it reduces risk.
- **Rate limiting** and throttling where abuse matters (login, password reset, public APIs).
- **Idempotency** for mutating operations that retries can duplicate (payments, provisioning) when the domain requires it.
- **Errors:** return safe messages to clients; avoid stack traces, internal paths, and SQL fragments in responses.
- Align with **OWASP API Security** top risks where applicable (broken object level authorization, excessive data exposure, mass assignment, etc.).

## Concurrency, race conditions, and TOCTOU

- Watch for **check-then-act** patterns across requests or threads (e.g. “if balance sufficient then debit” without atomicity).
- **TOCTOU** on HTTP endpoints: two parallel requests can both pass a validation that should only pass once; use database constraints (unique, check), transactions, row-level locking, or compare-and-swap as appropriate to the stack.
- Prefer **database-enforced invariants** (unique indexes, foreign keys) over application-only checks when they prevent races.
- For high-risk flows, note where **load or parallel tests** help catch obvious races (without claiming full formal verification).

## Testing, review, and attacker mindset

- Encourage **dependency updates** (e.g. Dependabot) and **static analysis** (SAST) where the team can act on findings.
- For exposed services, suggest a **lightweight threat model** (assets, trust boundaries, main abuse cases) in `docs/context/` or a linked security note — keep it short and actionable.
- **Penetration testing** is typically an external, scoped exercise; the skill can recommend **internal checklists** (auth bypass attempts, IDOR, injection probes) for dev/stage only, not production without approval.
- When documenting context, state **where** security-sensitive code lives (auth middleware, policy layer, encryption) and **which** official security guides apply to the stack.

## When documenting context

- Describe the auth model, where it is enforced, and how secrets are loaded per environment.
- Call out PII/sensitive data flows and retention if visible from the codebase.
- Mention whether there is a security review process, SOC2/ISO, or informal checklist — only what the repo or team actually uses.

## When generating rules

- Include rules to **never expose secrets**, validate input, use parameterized queries / ORM-safe APIs, and to use the **security** skill when changing auth, public endpoints, or data handling.
- Reference OWASP and stack-specific security documentation (framework security guides, JWT best practices, etc.).

## Relation to backend

- For API shape, concurrency, and transactional boundaries, use the **backend** skill together with **security**; API and multi-request correctness almost always have a security angle.
