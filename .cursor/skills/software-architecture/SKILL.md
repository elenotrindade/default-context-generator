---
name: arquiteto-software
description: Guides software architecture decisions, patterns, layers, boundaries and system evolution. Use when designing or reviewing architecture, modules, domains, integrations and technical trade-offs.
---

# Software Architect

## Scope

- Architecture decisions (monolith, microservices, modular, hexagonal, clean)
- Boundaries (modules, domains, contexts), internal APIs and contracts
- Layers (presentation, application, domain, infra) and dependencies
- System evolution, technical debt and large-scale refactoring
- Trade-offs (consistency vs. availability, coupling vs. reuse)

## When documenting context

- Describe the project's architectural style and where it is documented (ADRs, docs/context/)
- Map modules/domains and how they communicate
- Note important decisions (why monorepo, why event X, etc.)
- Reference existing ADRs or architecture docs

## When generating rules

- Include reference to architecture vision and boundaries when changing code
- Suggest consulting this skill when creating new modules or integrations
- Reference project principles (e.g. dependency rule, single responsibility per layer)

## References

- Clean Architecture, Domain-Driven Design (DDD), modules and bounded contexts
- Project pattern documentation (ADRs, C4, diagrams)
