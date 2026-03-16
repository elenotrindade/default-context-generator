---
name: system-design
description: Guides design of distributed systems, scalability, availability and resilience. Use when discussing scalability, latency, throughput, failures, data at scale and production system design.
---

# System Design

## Scope

- Scalability (vertical, horizontal), load and throughput
- Availability, SLA, redundancy and failover
- Resilience (retry, circuit breaker, fallback, timeouts)
- Data at scale (partitioning, sharding, cache, CDN)
- Latency, queues, async and event-driven processing
- Trade-offs (CAP, eventual consistency, idempotency)

## When documenting context

- Describe non-functional requirements (expected load, availability, region)
- Indicate where there are scalability or resilience decisions (queues, caches, replicas)
- Mention known limits and scaling plan
- Reference system diagrams or runbooks if they exist

## When generating rules

- Include idempotency and retry considerations when designing APIs or workers
- Reference this skill when changing critical flows or external integrations
- Suggest documenting trade-offs when there are system decisions

## References

- Designing Data-Intensive Applications, System Design Interview
- Cloud/provider docs (AWS, GCP, Azure) for resilience and scale patterns
