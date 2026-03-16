# Default Context Generator — Project Idea

## 1. Vision and objective

Automation that runs **inside Git repositories** to:

1. **Set up new projects** — prepare a repository with rules, skills and context documentation for Cursor.
2. **Get into / get context of existing projects** — analyze the code and generate documentation, rules and skills that let Cursor (and you) understand and work on the project consistently.

The result is a Cursor environment "pre-configured" for the repository: **context**, **rules**, **best practices** and **skills** aligned with the code and technologies used.

---

## 2. What the automation generates

### 2.1 Context

Documentation that **breaks down the system and how it works**, organized by **related areas**, based on:

- **Existing documentation** in the repository (when present), in any format — README, CONTRIBUTING, docs/, ADR, API docs, etc. The generator **interprets** this documentation and **indexes it by area of expertise** to reuse it, covering every type of repo (no doc, partial doc, or already well documented).
- **Skills** defined or inferred for the project.
- **Existing code** (folder structure, entrypoints, dependencies, patterns).

Desired format:

- One or more documents (e.g. in `docs/context/` or `.cursor/context/`) that describe:
  - **Architecture** (layers, modules, main flows).
  - **Areas** (e.g. auth, API, frontend, jobs, infra) with description and references to the code.
  - **Conventions** and important decisions (e.g. how state is managed, how APIs are called).
- Text intended for Cursor (and humans) to consume when providing context about the project.

### 2.2 Rules (Cursor rules)

Files in `.cursor/rules/` that:

- **Allocate skills correctly** — explicitly instruct Cursor to use the project's skills (e.g. "when doing X, use skill Y" or list skills by task type).
- **Reference the project** — point to context documentation, README, architecture.
- **Reference technology documentation** — links or mentions to official docs (React, Node, FastAPI, etc.) used in the project, for the agent to consult when needed.

Rules must be **concise** (e.g. &lt; 50 lines per rule), **scoped** (always apply vs. by file type) and **actionable**.

### 2.3 Best practices

Content that can live in rules or in separate documents (e.g. `docs/best-practices.md` or specific rules):

- Code patterns (naming, folder structure, tests).
- How to use the skills in common scenarios (e.g. "when adding an endpoint, use the API skill").
- Commit, PR or review conventions (if applicable).

### 2.4 Project skills

Skills stored in `.cursor/skills/` (per repository):

- **Project-specific** — e.g. "how to add a new endpoint", "how to create a form component in this design system".
- **Code-based** — derived from the structure and patterns already used in the repo.
- **Referenced by rules** — rules must tell Cursor **when** and **how** to use each skill.

The automation can **generate** skills (from templates + code analysis) or **organize** existing skills and ensure the rules mention them correctly.

### 2.5 Domain skills (focus areas)

When analyzing and documenting any repository, the flow maps the project to the **areas** below and uses the corresponding skills as a guide. These are the domain skills used by the Default Context Generator:

| Area | Skill | When to use |
|------|--------|-------------|
| Architecture, modules, boundaries, evolution | arquiteto-software | Architecture decisions, layers, domains, ADRs |
| Scalability, availability, resilience, data at scale | system-design | System design, throughput, failures, queues, trade-offs |
| APIs, services, business logic | backend | Server, API, workers, ORM |
| Web UI, components, state | frontend | React, Vue, SPA, bundler |
| Design, flows, design system | ux-ui | Layouts, visual patterns, UI copy |
| CI/CD, containers, infra | devops | Pipeline, Docker, deploy |
| Auth, sensitive data, OWASP | seguranca | Login, permissions, input |
| Copy, landing, ads | marketing | Commercial copy, CTAs |
| Tests, QA, mocks | testing | Unit, e2e, coverage |
| Database, schemas, migrations | data-database | SQL, ORM, ETL |
| README, API docs, guides | docs-tecnico | Project documentation |
| a11y, ARIA, keyboard | acessibilidade | Accessible interfaces |
| Bundle, queries, cache | performance | Optimization |

All in `.cursor/skills/<name>/SKILL.md`. The orchestration skill is `default-context-generator`, which defines the full workflow.

### 2.6 Stack and technologies to identify

When analyzing a repository, the agent must **identify** and document:

- **Languages and frameworks** — from `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, `pom.xml`, etc., and versions when relevant.
- **Entrypoints** — main, app, index, main routes.
- **Areas present** — which of the domain skills above apply and where in the code each appears.

This information goes into the overview (`docs/context/README.md`), the documents by area and the rules (references to the official documentation of the technologies used).

---

## 3. Approach: Cursor as executor

The automation **does not** rely on a CLI or script that does all the analysis and writing by itself. **Cursor (the agent)** is what runs the flow:

- **Skills and rules** define *how* to analyze the repo, *how* to write context/rules/skills and *in what order*.
- The user triggers the flow (e.g. by asking in chat "generate this project's context" or, in the future, via the extension command).
- Cursor uses the code in the open repository, applies the Default Context Generator skills and **writes** the files to `.cursor/` and `docs/` in the repo itself.

Advantages: no need to maintain parsers for N languages in the project; Cursor already understands the code; the automation "logic" lives in skills/rules, easy to evolve.

---

## 4. Intended usage flow

```
Git repository (open in Cursor)
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  User: "Generate this project's context" (or future command) │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  Cursor (agent) + Default Context Generator skills         │
│  1. Interprets existing doc and index by area               │
│  2. Analyzes repo (languages, structure, deps, conventions) │
│  3. Generates/updates project skills                        │
│  4. Generates context documentation (by area)              │
│  5. Generates/updates rules (skills + refs to project + techs) │
│  6. (Optional) Best practices                               │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
.cursor/
  rules/     ← rules that allocate skills and reference project/techs
  skills/    ← project skills
  context/   ← (optional) or docs/context/
docs/
  context/   ← system documentation by area
  best-practices.md
```

- **New project:** open the repo in Cursor and run the flow to create the context and rules base.
- **Existing project:** run the flow to "get context" and generate/update context, rules and skills.

---

## 5. Rules requirements (summary)

Generated rules must:

| Requirement | Description |
|-------------|-------------|
| **Skill allocation** | Explicitly tell Cursor which skills to use in which situations (by task, by file type, etc.). |
| **Project reference** | Point to context documentation, README, architecture (paths or clear mentions). |
| **Technology reference** | Include references to the official documentation of the libs/frameworks used (links or doc names). |
| **Update documentation** | Instruct the agent that when changing code, architecture or conventions that affect what is documented, **update the corresponding document in `docs/context/` (or `.cursor/context/`) in the same workflow**. Reduces rework and keeps context aligned with the real state of the project (the AI "learns" by keeping the doc up to date). |
| **Format** | Follow the Cursor standard (e.g. `.mdc` in `.cursor/rules/`, frontmatter with `description`, `globs`, `alwaysApply`). |

---

## 6. Build order

The build is done in phases:

1. **Generator skills**  
   Create the skills that the "Default Context Generator" itself will use (or that other projects can reuse), for example:
   - **Orchestration:** `default-context-generator` (full workflow).
   - **Domain:** `arquiteto-software`, `system-design`, `backend`, `frontend`, `ux-ui`, `devops`, `seguranca`, `marketing`, `testing`, `data-database`, `docs-tecnico`, `acessibilidade`, `performance`.

2. **"Get" context**  
   Module that:
   - **detects and interprets existing documentation** (README, docs/, ADR, API docs, etc.) and indexes by area of expertise,
   - analyzes the repository (file tree, languages, dependencies, entrypoints),
   - identifies "areas" (modules, layers, domains),
   - produces context documentation (text per area), **reusing** existing doc when applicable, and metadata for the rules.

3. **Automation**  
   Orchestration that:
   - uses the context module,
   - generates/updates project skills,
   - generates rules (with skill allocation + references to project and technologies),
   - optionally generates best practices and integrates everything into the repo (`.cursor/`, `docs/`).

---

## 7. Technical scope (preliminary)

- **Where it runs:** repository open in Cursor; the agent runs the flow (skills + rules).
- **Input:** current workspace (or, in the extension, the active workspace).
- **Output:** files in `.cursor/` and, if desired, in `docs/`, in the repo itself.
- **Technologies:** the core is skills and rules (Markdown); a CLI is not required. If there are helper scripts (e.g. list files, read package.json), they can be minimal.

---

## 8. Extension (future)

The idea is to **publish as an extension** (Cursor or VS Code), even if only for personal use:

- A **command** (e.g. "Default Context Generator: Generate project context") that triggers the flow in the open workspace.
- The extension can provide the generator's skills/rules and invoke the agent with the right prompt, or open a guided flow.
- Keeping the "Cursor as executor" core makes it simple: the extension only orchestrates *when* to run; Cursor continues to do analysis and writing.

The current design (skills + rules + documentation) is already compatible with this: the extension can bundle these files and expose a command that uses them.

---

## 9. Next steps

1. **Documentation (this file)** — done.
2. **Build the skills** — done (`.cursor/skills/`: default-context-generator + 13 domain skills).
3. **"Get context"** — flow in the default-context-generator skill; validate on a real repo.
4. **Automation** — rule(s) that trigger the flow; then extension with command.

Living document: can be updated as the skills, context module and automation evolve.
