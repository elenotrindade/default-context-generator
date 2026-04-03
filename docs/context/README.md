# Project context — Default Context Generator

## Overview

This repository is the **Default Context Generator**: automation to generate **context**, **rules**, and **skills** for Cursor in any Git repository. The Cursor (agent) runs the flow; there is no heavy CLI — the logic lives in skills and rules (Markdown).

**What the project does:**

- Provides an **orchestration skill** (`default-context-generator`) that defines the workflow: **interpret existing documentation** (when present) and index it by area of expertise → analyze repo → documentation by area (reusing existing doc) → rules with skill allocation.
- The generator **adapts to the type of repository**: with or without documentation, in varied formats (README, docs/, ADR, API docs, etc.); it interprets whatever exists and indexes by area to reuse as much as possible.
- Provides **domain skills** (`software-architecture`, `system-design`, `backend`, `frontend`, `ux-ui`, `devops`, `security`, `marketing`, `testing`, `data-database`, `technical-docs`, `accessibility`, `performance`) to map and document **target** projects when the user runs the generator — see **Repository analysis** below.
- Includes a **Cursor/VS Code extension** that exposes the "Generate project context" flow (prompt + chat) **when the user runs it** — nothing triggers automatically on startup. The extension is **internationalized**: English (primary) and Portuguese (secondary); see [i18n.md](i18n.md) and `.cursor/rules/i18n.mdc`.
- It is designed for use in **any repo**: the user runs the flow (chat or extension) on the target repo and gets `docs/context/`, `.cursor/rules/`, and `.cursor/skills/` generated.

## Stack

| Layer   | Technology                    | Where |
|---------|-------------------------------|-------|
| Extension | VS Code Extension API, TypeScript | `src/extension.ts`, `src/nls.ts` |
| Content | Markdown (skills, rules, docs) | `.cursor/`, `docs/` |
| Build   | TypeScript 5, npm             | `package.json`, `tsconfig.json` |

- **Runtime:** Node (via VS Code/Cursor).
- **Main language:** TypeScript (extension only).
- **Documentation:** README.md (usage and extension); PROJECT_IDEA.md (vision and requirements, when present).

## Repository analysis

**Conclusion: existing stack** — ecosystem is **desktop/editor** (Cursor/VS Code extension), not a standalone web app, mobile app, or CLI product.

| Item | Detail |
|------|--------|
| **Languages / tools** | TypeScript (~5.3), VS Code Extension API (`engines.vscode` ^1.85), npm scripts (`compile`, `vscode:prepublish`, `package`). |
| **Entrypoint** | `package.json` `main` → `./out/extension.js` (compiled from `src/extension.ts`, `activate()` and contributed commands). |
| **This repo’s code areas** | Extension behavior (`src/`), generator Markdown (`.cursor/skills/`, `.cursor/rules/`), project docs (`README.md`, `docs/context/`), i18n (`package.nls*.json`, `src/nls.ts`). |

**Domain skills** under `.cursor/skills/` (e.g. `backend`, `frontend`) are **reusable guides** for classifying and documenting **other** repositories. They are not application layers shipped by this extension. There is **no** product backend/frontend codebase here beyond the extension host.

## Project areas

| Area | Description | Document |
|------|-------------|----------|
| Extension | VS Code/Cursor command, clipboard, opening chat | [extension.md](extension.md) |
| Skills and rules | Generator content (orchestration + domain), format, usage | [skills-e-rules.md](skills-e-rules.md) |
| Technical documentation | README, PROJECT_IDEA (if present), project doc conventions | [technical-docs.md](technical-docs.md) |
| Existing doc in repos | Interpreting and indexing existing documentation by area | [doc-existing-repos.md](doc-existing-repos.md) |
| i18n | Primary language EN, secondary PT; rule and extension strings | [i18n.md](i18n.md), `.cursor/rules/i18n.mdc`, `package.nls*.json`, `src/nls.ts` |

## Folder structure (relevant)

```
defaultcontextgenerator/
├── package.json          # Extension manifest
├── tsconfig.json
├── src/
│   ├── extension.ts      # Commands, popup, chat prompt
│   └── nls.ts            # Runtime UI strings (en/pt)
├── .cursor/
│   ├── rules/            # gerar-contexto, projeto-contexto, extension-typescript, i18n, …
│   └── skills/           # default-context-generator + 13 domain skills
├── docs/
│   └── context/          # This context (README + docs by area)
├── README.md             # Usage, extension, how to test
└── PROJECT_IDEA.md      # Vision, flow, future extension (when present)
```

## Technology references

- [VS Code Extension API](https://code.visualstudio.com/api) — commands, clipboard, `executeCommand`.
- [Cursor](https://cursor.com/docs) — chat/composer, agent; extensions are compatible with VS Code.
- Skills and rules: see `.cursor/skills/default-context-generator/SKILL.md` and Cursor's create-rule / create-skill (when available).
