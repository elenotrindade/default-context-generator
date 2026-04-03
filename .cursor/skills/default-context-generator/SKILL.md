---
name: default-context-generator
description: Runs the context generation flow for a repository: interpret existing documentation (when present), analyze the project, index by area of expertise, generate docs/context/, .cursor/rules/, and .cursor/skills/. Use when the user asks to generate project context, set up rules/skills, or "get context" from the repo. The VS Code/Cursor extension only pastes this workflow into chat when the user runs it — generation is always manual.
---

# Default Context Generator

Workflow to generate **context**, **rules**, and **skills** in the open repository so that Cursor (and humans) can work consistently. The generator **adapts to the type of repository**: no documentation, mixed formats (README, docs/, ADR, API docs), or already structured — interpret what exists and index it by area of expertise to reuse as much as possible.

**Path boundary:** write outputs only inside the opened repository, with relative paths (for example `docs/context/...`, `.cursor/rules/...`, `.cursor/skills/...`). Never write generated files to external absolute paths.

**Strict phase order:** (1) Analyze → (2) approach consultation when needed (**STOP: no file writes** until the user answers) → (3) Write `docs/context/`, `.cursor/rules/`, and `.cursor/skills/`.

## What generated artifacts should encode

**Project constitution** (in `docs/context/README.md` + one concise **alwaysApply** rule):

- Stack, install steps, **test/lint/format/build commands** (from README or documented after inference).
- **Entry points map** (critical folders/modules) and a **light dependency map** between major parts.
- **Agent norms:** prefer minimal edits; search the repo before breaking APIs; run documented tests/lint after substantive changes (or state what should run); keep rules/skills short; no git commit/push without explicit user confirmation; brief architectural note when changing boundaries.
- **Security gate:** if the repo has HTTP APIs, auth, secrets, PII/payment, or sensitive trust boundaries, add **docs/context/security.md** (or equivalent) and route auth/API/secret/concurrency work to the **security** skill in generated rules.

**Cursor vs other tools (document, do not copy proprietary protocols):**

- **docs/context/README.md** plays a role similar to a team-shared root instruction file (e.g. public `CLAUDE.md` pattern): short constitution + links.
- **Named prompts:** optional **docs/context/agent-prompts.md** for copy-paste Composer/chat checklists (Cursor has no `.claude/commands/` equivalent in-repo).
- **Hooks:** no VS Code session hooks — put **CI, pre-commit, destructive-command policy** in **devops** / **security** context docs.

## Domain skills (reference)

When analyzing and documenting, map the project to the areas below:

| Area | Skill | When to use |
|------|--------|-------------|
| Architecture, modules, boundaries, evolution | software-architecture | Architecture decisions, layers, domains, ADRs |
| Scalability, availability, resilience, data at scale | system-design | System design, throughput, failures, queues, trade-offs |
| APIs, services, business logic | backend | Server, API, workers, ORM |
| Web UI, components, state | frontend | React, Vue, SPA, bundler |
| Design, flows, design system | ux-ui | Layouts, visual patterns, UI copy |
| CI/CD, containers, infra | devops | Pipeline, Docker, deploy |
| Secrets, .env, authZ/authN, API abuse, race/TOCTOU, OWASP, reviews | security | Login, permissions, inputs, HTTP APIs, sensitive data, concurrent requests |
| Copy, landing, ads | marketing | Commercial copy, CTAs |
| Tests, QA, mocks | testing | Unit, e2e, coverage |
| Database, schemas, migrations | data-database | SQL, ORM, ETL |
| README, API docs, guides | technical-docs | Project documentation |
| a11y, ARIA, keyboard | accessibility | Accessible interfaces |
| Bundle, queries, cache | performance | Optimization |

## Workflow (run in order)

### 0. Detect and interpret existing documentation

Goal: **reuse** any documentation already in the repo and **index it by area of expertise**. **README** at the project root is the first source — overview, quick start; then CONTRIBUTING, ARCHITECTURE, and the rest.

- **Detect** typical documentation files and folders (without relying on a single convention):
  - Root: `README*`, `CONTRIBUTING*`, `CHANGELOG*`, `ARCHITECTURE*`, `docs/`, `doc/`, `.github/` (workflows, issue/PR templates).
  - Common patterns: folders `docs/`, `documentation/`, `wiki/`, `architecture/`, `adr/`, `decisions/`, `api/`, `spec/`, `design/`.
  - Files: `*.md` in root and in doc folders, `*.rst`, `*.adoc`, `*.mdx` when present.
- **Interpret** each document: type, audience, purpose, conventions, decisions; map sections to one or more **areas** from the table above.
- **Produce a map** document → area(s) for use in step 1.

Detailed reference: `docs/context/doc-existing-repos.md` (in this repo).

### 1. Analyze the repository

- Folder structure (root and first levels), ignoring `node_modules`, `.git`, build outputs.
- Languages, frameworks, versions, entrypoints, ecosystem(s).
- **Areas** that apply and where they live in code; flag **security-sensitive** zones (APIs, auth, secrets).
- Cross-check with the map from step 0.
- Summarize in 1–2 paragraphs.

### 2. Approach consultation gate (STOP: no file writes)

- Identify decision points; propose 2–4 options each with evidence; **do not** pick by inference.
- Ask for **one consolidated** user reply (one-shot).
- **Do not** create or modify `docs/context/`, `.cursor/rules/`, or `.cursor/skills/` until the user answers when this gate applies.
- After selection, use it as source of truth; add "Common implementation cases" bullets to area docs and rules.

### 3. Generate context documentation

Create or update in `docs/context/` (or `.cursor/context/`):

- **README.md:** constitution content (stack, commands, entry map, dependency sketch, links to areas); reuse indexed doc where relevant.
- **One doc per relevant area** with reused content linked/summarized, conventions, code locations, technology references, "Common implementation cases".
- **security.md** when APIs/auth/secrets/sensitive data exist (secrecy, API hardening, races, safe errors, governance vs pentest).
- Optional: `docs/context/agent-prompts.md`, ADRs.

### 4. Generate Cursor rules

- `.mdc` files: **skill allocation** per task; project + tech references; **update context when code changes** instruction in core or area rules.
- **Glob partitioning:** mutually exclusive globs; split by directory when extensions overlap; **at most one** core `alwaysApply` for routing/policy — keep it short; **do not** paste full skill bodies into rules.

### 5. Project skills (required for target repos)

Create `.cursor/skills/<area>/SKILL.md` for each relevant area (short, project-specific; English slugs when output language is English). Rules must reference these skills by name. Include **security** when the project exposure warrants it.

### 6. Optional

- `docs/best-practices.md`, commit/PR patterns aligned with the team.

## Checklist when done

- [ ] Existing documentation (if any) detected, interpreted, indexed by area
- [ ] `docs/context/README.md` encodes constitution + entry/dependency map where applicable
- [ ] At least one `docs/context/<area>.md`; **security** doc/section if APIs/auth/secrets apply
- [ ] `.cursor/rules/` with skill allocation, non-overlapping globs, one concise core alwaysApply
- [ ] `.cursor/skills/` with project-specific SKILL.md files referenced by rules
- [ ] Rules tell the agent to **update** `docs/context/` when changes affect documented behavior
- [ ] Optional `docs/context/agent-prompts.md` if useful for the team

## Reference

In this repository: `README.md` for overview; `PROJECT_IDEA.md` for full requirements (when present). For any repo: prefer README first, then PROJECT_IDEA if it exists.
