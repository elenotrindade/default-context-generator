---
name: performance
description: Guides performance optimization: loading, bundle size, queries and caching. Use when analyzing or improving frontend, API or database performance.
---

# Performance

## Scope

- Loading (lazy load, code splitting, assets)
- Bundle size, tree shaking and dependencies
- Queries and indexes in the database, N+1
- Cache (HTTP, application, CDN) and metrics (LCP, FID, CLS)

## When documenting context

- Describe performance goals or limits (e.g. Lighthouse score)
- Indicate where there is cache and invalidation strategies
- Mention measurement tools (Lighthouse, profiler, APM)

## When generating rules

- Include good practices for queries and avoiding over-fetch
- Reference performance docs of the framework used
