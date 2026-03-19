# Area: Skills and rules

## What this area does in the project

Defines the **content** of the Default Context Generator: the orchestration skill, domain skills, and the rules that trigger the flow. All in Markdown, consumed by Cursor.

- **Orchestration skill:** `default-context-generator` — full workflow (interpret existing doc and index by area → analyze repo → docs/context/ reusing doc → .cursor/rules/ → optionally skills and best practices).
- The orchestration skill includes a **consultative one-shot approach gate** (STOP: no file writes) before generating `docs/context/` and `.cursor/rules/`, so the agent does not infer critical approaches without user confirmation.
- **Domain skills:** software-architecture, system-design, backend, frontend, ux-ui, devops, security, marketing, testing, data-database, technical-docs, accessibility, performance — used to map and document areas in any repo.
- **Trigger rule:** `gerar-contexto.mdc` — when the user asks to generate context, the agent must use the default-context-generator skill.

## Where it is in the code

- **`.cursor/skills/default-context-generator/SKILL.md`** — workflow, domain table, steps 1–5 and checklist.
- **`.cursor/skills/<name>/SKILL.md`** — one folder per domain skill (software-architecture, system-design, backend, frontend, ux-ui, devops, security, marketing, testing, data-database, technical-docs, accessibility, performance).
- **`.cursor/rules/gerar-contexto.mdc`** — alwaysApply rule that points to the skill and to README (and PROJECT_IDEA when present).

## Conventions and decisions

- Skills follow the Cursor format: YAML frontmatter (`name`, `description`) + Markdown body.
- Rules are `.mdc` in `.cursor/rules/` with `description`, `alwaysApply` or `globs`.
- When editing or creating skills/rules for other projects, use the domain skills as a checklist for what to cover per area.
- Format reference: Cursor's create-rule and create-skill (official skills), when available.

## Official documentation

- Cursor: [Rules](https://cursor.com/docs) and [Skills](https://cursor.com/docs) documentation (check current docs).
- In this repo: `.cursor/skills/default-context-generator/SKILL.md` is the workflow reference.
