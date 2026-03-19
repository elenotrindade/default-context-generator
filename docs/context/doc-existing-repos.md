# Interpreting existing documentation in repositories

This document describes how the Default Context Generator **detects**, **interprets**, and **indexes** documentation already present in repositories, so it can be reused when generating context by area of expertise. That way the generator covers repos with no doc, with doc in varied formats, or already well documented.

## 1. Goal

- **Interpret** documentation in any format or convention (README, docs/, ADR, API docs, etc.).
- **Index** by area of expertise (domain skills: backend, frontend, devops, testing, etc.).
- **Reuse** when generating `docs/context/`: incorporate or reference instead of recreating from scratch.

## 2. Where to look for documentation

### 2.1 Files in the root

| Pattern | Typical use | Suggested area(s) |
|--------|-------------|-------------------|
| `README`, `README.md`, `README.*` | Overview, quick start, installation | technical-docs, all (overview) |
| `CONTRIBUTING`, `CONTRIBUTING.md` | How to contribute, tests, PRs | technical-docs, testing |
| `CHANGELOG`, `CHANGELOG.md` | Change history | technical-docs |
| `ARCHITECTURE`, `ARCHITECTURE.md` | System architecture | software-architecture, system-design |
| `API.md`, `api.md` | API description | backend, technical-docs |
| `SECURITY`, `SECURITY.md` | Security policy, reporting vulnerabilities | security, technical-docs |
| `DESIGN`, `design.md` | Product/UI design | ux-ui, frontend |
| `DEPLOY`, `deploy.md`, `DEPLOYMENT` | How to deploy | devops |

### 2.2 Common folders

| Folder | Typical content | Suggested area(s) |
|--------|-----------------|-------------------|
| `docs/`, `documentation/` | Guides, specs, tutorials | technical-docs + specific content |
| `doc/` | Same (convention in some ecosystems) | technical-docs + specific content |
| `architecture/`, `docs/architecture/` | Diagrams, ADRs, decisions | software-architecture, system-design |
| `adr/`, `decisions/`, `docs/adr/` | Architecture Decision Records | software-architecture |
| `api/`, `docs/api/`, `openapi/` | API spec (OpenAPI, etc.) | backend, technical-docs |
| `spec/`, `specs/`, `design-docs/` | Specifications, design | Content-dependent |
| `wiki/` | Project wiki | technical-docs + specific content |
| `.github/` | workflows, ISSUE_TEMPLATE, PULL_REQUEST_TEMPLATE, CODEOWNERS | devops, technical-docs |

### 2.3 File formats

- **Markdown:** `.md`, `.mdx` — preferred.
- **ReStructuredText:** `.rst` — common in Python.
- **AsciiDoc:** `.adoc`, `.asciidoc` — common in Java and others.
- **Plain text:** `.txt` when clearly documentation (e.g. `README.txt`).

The agent should **read the content** to interpret type and area; file and folder names are initial hints.

## 3. How to interpret a document

For each document found:

1. **Type:** overview, contribution, architecture, API, deploy, tests, security, design, a11y, performance, etc.
2. **Audience:** developer, contributor, end user, operations.
3. **Relevant content:** purpose, conventions, decisions, commands, examples.
4. **Area(s) of expertise:** map to one or more domain skills (table in the default-context-generator skill).

### 3.1 Content → area mapping

| Content / typical keywords | Area(s) |
|---------------------------|---------|
| Layers, modules, boundaries, ADR, architecture decisions | software-architecture |
| Scalability, availability, queues, throughput, resilience | system-design |
| Endpoints, REST, GraphQL, server, workers, ORM | backend |
| Components, React/Vue/Svelte, SPA, bundler, state | frontend |
| Layout, design system, flows, UI copy | ux-ui |
| CI/CD, Docker, Kubernetes, pipeline, deploy, infra | devops |
| Auth, permissions, OWASP, sensitive data | security |
| Copy, landing, CTAs, ads | marketing |
| Tests, unit, e2e, mocks, coverage, TDD | testing |
| Database, schema, migrations, SQL, ETL | data-database |
| README, guides, API docs, how to use | technical-docs |
| a11y, ARIA, keyboard, screen reader | accessibility |
| Bundle size, queries, cache, optimization | performance |

A single document can be indexed in several areas (e.g. README that covers API + deploy → backend + devops + technical-docs).

## 4. Produce the document → area(s) map

By the end of workflow step 0:

- List of **documents found** with path and inferred type.
- For each document: **which areas** it feeds (and, if useful, sections or topics).
- Use in step 2: when generating each doc in `docs/context/` by area, **incorporate or reference** the existing documents mapped to that area (avoid duplicating long text; prefer link + summary).

## 5. Repos with no documentation or non-standard conventions

- **No doc found:** map is empty; the flow continues with code analysis only (steps 1 and 2).
- **Non-standard conventions:** the agent should look for **content** (text files that describe the project, architecture, API, deploy), not only standard names. E.g. `development.md`, `setup.md`, `runbook.md` also go into the map and are indexed by content.

## 6. Cross-reference

- Full workflow: `.cursor/skills/default-context-generator/SKILL.md` (steps 0 and 2).
- Domain skills: table in the same skill (and in `PROJECT_IDEA.md` when present).
