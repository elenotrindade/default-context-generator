# Area: Technical documentation

## What this area does in the project

Centralizes the **project vision**, **usage** and **extension testing instructions**. All in Markdown at the repo root and in `docs/`.

- **README.md** — summary, skills, structure, usage (chat and extension), how to install and test the extension locally and via .vsix.
- **PROJECT_IDEA.md** (when present) — vision, what the automation generates, Cursor as executor, flow, rules requirements, build order, technical scope, future extension, next steps.
- **docs/context/** — context documentation generated for this repo (this directory). Includes **doc-existing-repos.md**, which describes how the generator interprets and indexes existing documentation in target repositories.
- **`.cursor/default-context-prompt.txt`** — default workspace prompt file the extension can create or restore; **`.cursor/.dcg-prompt.txt`** — optional copy of the same instructions for agents asked to “run the DCG prompt file” (not wired in code unless you set `configPath` to it).

## Where it is in the code

- **Root:** `README.md`, `PROJECT_IDEA.md` (when present).
- **docs/context/README.md** — context index (overview, stack, areas, structure).
- **docs/context/*.md** — one doc per area (extension, skills-e-rules, technical-docs).

## Conventions and decisions

- README is the main entry; it should allow someone to clone the repo and test the extension (npm install, compile, F5 or Install from VSIX).
- PROJECT_IDEA (when present) is a living document; update it when the flow or extension changes.
- Context in `docs/context/` follows the same model the generator produces for other projects: README + one doc per relevant area.

## Official documentation

- For technical documentation in general: README, CONTRIBUTING and architecture doc good practices (e.g. [Write the Docs](https://www.writethedocs.org/)).
- In this project: keep README and PROJECT_IDEA (when present) in sync with the code and `.cursor/`.
