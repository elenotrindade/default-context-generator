---
name: default-context-generator
description: Runs the context generation flow for a repository: interpret existing documentation (when present), analyze the project, index by area of expertise, generate documentation by area and Cursor rules. Use when the user asks to generate project context, set up rules/skills, or "get context" from the repo. The extension is intended to run in **auto** mode when a workspace has no context, to avoid unnecessary manual runs and client usage.
---

# Default Context Generator

Workflow to generate **context**, **rules**, and **skills** in the open repository so that Cursor (and humans) can understand and work on the project consistently. The extension runs **automatically** when a workspace is opened and has no context yet (configurable), to avoid unnecessary consumption for the client. The generator **adapts to the type of repository**: repos with no documentation, with documentation in varied formats (README, docs/, ADR, API docs, etc.), or already structured — in all cases it interprets whatever exists and indexes it by area of expertise to reuse as much as possible.

Path boundary: write outputs only inside the opened repository, with relative paths (for example `docs/context/...`, `.cursor/rules/...`, `.cursor/skills/...`). Never write generated files to external absolute paths.

## Domain skills (reference)

When analyzing and documenting, map the project to the areas below and use the corresponding skills as a guide:

| Area | Skill | When to use |
|------|--------|-------------|
| Architecture, modules, boundaries, evolution | software-architecture | Architecture decisions, layers, domains, ADRs |
| Scalability, availability, resilience, data at scale | system-design | System design, throughput, failures, queues, trade-offs |
| APIs, services, business logic | backend | Server, API, workers, ORM |
| Web UI, components, state | frontend | React, Vue, SPA, bundler |
| Design, flows, design system | ux-ui | Layouts, visual patterns, UI copy |
| CI/CD, containers, infra | devops | Pipeline, Docker, deploy |
| Auth, sensitive data, OWASP | security | Login, permissions, input |
| Copy, landing, ads | marketing | Commercial copy, CTAs |
| Tests, QA, mocks | testing | Unit, e2e, coverage |
| Database, schemas, migrations | data-database | SQL, ORM, ETL |
| README, API docs, guides | technical-docs | Project documentation |
| a11y, ARIA, keyboard | accessibility | Accessible interfaces |
| Bundle, queries, cache | performance | Optimization |

## Workflow (run in order)

### 0. Detect and interpret existing documentation

Goal: **reuse** any documentation already in the repo, in any format, and **index it by area of expertise**. **README** (README.md, README.* at root) is the first source to consider (industry standard) — overview, quick start; then CONTRIBUTING, ARCHITECTURE, and the rest.

- **Detect** typical documentation files and folders (without relying on a single convention):
  - Root: `README*`, `CONTRIBUTING*`, `CHANGELOG*`, `ARCHITECTURE*`, `docs/`, `doc/`, `.github/` (workflows, issue/PR templates).
  - Common patterns: folders `docs/`, `documentation/`, `wiki/`, `architecture/`, `adr/`, `decisions/`, `api/`, `spec/`, `design/`.
  - Files: `*.md` in root and in doc folders, `*.rst`, `*.adoc`, `*.mdx` when present.
- **Interpret** each document found:
  - Identify **type** (overview, contribution, architecture, API, deploy, tests, a11y, etc.) and **audience** (developer, contributor, user).
  - Extract **purpose**, **conventions**, and **decisions** mentioned.
  - Map the content (or sections) to one or more **areas of expertise** from the domain skills table (e.g. API README → backend + technical-docs; CONTRIBUTING with tests → testing; deploy doc → devops).
- **Produce a map** document → area(s): which file/folder feeds which area, for use in step 2. If there is no documentation, the map is empty and the flow continues with code analysis only.

Detailed reference for patterns and indexing: `docs/context/doc-existing-repos.md` (in this repo).

### 1. Analyze the repository

- List folder structure (root and first levels), ignoring `node_modules`, `.git`, build outputs.
- Identify **languages and frameworks** (package.json, requirements.txt, go.mod, Cargo.toml, etc.) and versions.
- Identify **entrypoints** (main, app, index, main routes).
- Identify **areas** of the project: which of the domain skills above apply (backend, frontend, devops, etc.) and where in the code each appears.
- **Cross-check with the map from step 0**: areas already covered by existing documentation vs. areas identified only from code.
- Summarize in 1–2 paragraphs: what the project does, main stack and areas present.

### 2. Generate context documentation (reusing existing doc)

- **Approach consultation gate (STOP: no file writes)**
  - Identify decision points where multiple approaches are valid.
  - For each decision point, propose 2–4 recommended options based on evidence from README/code/folder structure, but MUST NOT pick any approach by inference.
  - Ask the user to select all approaches in ONE consolidated message (one-shot).
  - Do not create or modify any files in `docs/context/` or `.cursor/rules/` until the user answers the questionnaire.
  - After selection, treat the selected approach(es) as the source of truth for the rest of this workflow.

Create or update in `docs/context/` (or `.cursor/context/`):

- **README or index** (`docs/context/README.md`): overview, stack, links to documents by area; if there is relevant existing doc, reference where it came from (e.g. "Overview based on README.md and docs/architecture/."). **If the project has no README** (or it is empty/irrelevant), **create a minimal overview**: generate `docs/context/README.md` as the context index and, when appropriate, suggest or add a root README with vision, stack and links to `docs/context/`.
- **One document per relevant area** (e.g. `backend.md`, `frontend.md`, `api.md`), containing:
  - What that area does in the project
  - Where it is in the code (folders, main files)
  - **Reused content**: incorporate or reference the existing documentation indexed for that area (summarize, link to the original file, avoid duplicating long text unnecessarily). E.g. "API conventions per [docs/api.md](../api.md) in the repo."
  - Important conventions and decisions (from existing doc + from code analysis)
  - References to the official documentation of the technologies used

**If there is indexed existing documentation:** use it as a base; for each area, incorporate or reference the content (link to README, CONTRIBUTING, ADR, etc.). **If not:** generate from scratch from code analysis. Keep text objective, aimed at Cursor and at humans. Use the domain skills as a checklist for what to describe in each area.

- For each selected approach, include “Common implementation cases” as short actionable bullets in the relevant area docs (brief and directly usable by the agent).

### 3. Generate Cursor rules

Create or update files in `.cursor/rules/` (`.mdc` format with frontmatter):

- **Skill allocation**: in each rule, state explicitly which skill to use in which situation (e.g. "When changing the API, use the backend skill"; "When editing components, use frontend and ux-ui").
- **Project reference**: point to `docs/context/`, the repo README and architecture (relative paths).
- **Technology references**: include links or names of the official docs (React, FastAPI, etc.) used in the project.
- **Update documentation when working**: in each rule (or in the core rule), include an explicit instruction that when changing code, architecture or conventions that affect what is documented in `docs/context/` (or `.cursor/context/`), the agent **updates the corresponding document in the same workflow**. This avoids drift between code and context and keeps documentation reflecting the current state. Example phrase to embed in generated rules: *"When changing [area/code] that affects what is described in context docs, update the corresponding doc in `docs/context/` in the same work."*
- Keep each rule **concise** (ideally &lt; 50 lines), with `description`, `globs` (if by file type) or `alwaysApply: true`.
- Suggestion: one "core" rule (alwaysApply) that points to context, lists skills per task and includes the obligation to keep docs in sync; other rules by glob (e.g. `**/*.ts` → backend, `**/*.tsx` → frontend) referencing the area doc and updates when there are relevant changes.

- When generating rules, incorporate “Common implementation cases” aligned with the user-selected approach(es), so Cursor has concrete guidance beyond the high-level docs.

### 4. (Optional) Project skills

If the project has or needs specific skills in `.cursor/skills/`, create or list them and ensure the rules reference them (when to use each).

### 5. (Optional) Best practices

If desired, add `docs/best-practices.md` or specific rules with code patterns, commit/PR conventions and how to use the skills in common scenarios.

## Checklist when done

- [ ] **Existing documentation** (if any) was detected, interpreted and indexed by area of expertise
- [ ] `docs/context/` (or `.cursor/context/`) with overview and at least one doc per relevant area (reusing existing doc when applicable)
- [ ] `.cursor/rules/` with rules that allocate skills and reference the project and technologies
- [ ] README or main rule mentions where the context is and which skills to use per task type
- [ ] Rules instruct to **update context documentation** when code or decision changes affect what is documented (keep docs in sync in the same workflow)

## Reference

In this repository: `README.md` for overview; `PROJECT_IDEA.md` for full requirements (when present). For any repo: prefer README first, then PROJECT_IDEA if it exists.
