---
name: backend
description: Guides implementation and analysis of APIs, services, business logic and data layer. Use when working with backends, REST/GraphQL, servers, ORMs, queues and integrations.
---

# Backend

## Scope

- APIs (REST, GraphQL, gRPC), authentication and authorization
- Business logic, domain rules
- Persistence (ORM, migrations, queries)
- Queues, async jobs, workers
- Integrations with external services

## When documenting context

- Identify entrypoints (main, app, routes), layers (controller → service → repository)
- List technologies (framework, runtime, database) and versions
- Reference official documentation of the framework and main libs

## When generating rules

- Include conventions for error handling, validation and logging
- Reference official docs (e.g. FastAPI, Express, Django) in project rules
