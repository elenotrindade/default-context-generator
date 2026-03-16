# Area: Technical documentation

## What this area does in the project

Centralizes the **project vision**, **usage** and **extension testing instructions**. All in Markdown at the repo root and in `docs/`.

- **PROJECT_IDEA.md** — vision, what the automation generates, Cursor as executor, flow, rules requirements, build order, technical scope, future extension, next steps.
- **README.md** — summary, skills, structure, usage (chat and extension), how to install and test the extension locally and via .vsix.
- **docs/context/** — context documentation generated for this repo (this directory). Includes **doc-existing-repos.md**, which describes how the generator interprets and indexes existing documentation in target repositories.

## Where it is in the code

- **Root:** `PROJECT_IDEA.md`, `README.md`.
- **docs/context/README.md** — context index (overview, stack, areas, structure).
- **docs/context/*.md** — one doc per area (extension, skills-e-rules, docs-tecnico).

## Conventions and decisions

- PROJECT_IDEA is a living document; update it when the flow or extension changes.
- README should allow someone to clone the repo and test the extension (npm install, compile, F5 or Install from VSIX).
- Context in `docs/context/` follows the same model the generator produces for other projects: README + one doc per relevant area.

## Official documentation

- For technical documentation in general: README, CONTRIBUTING and architecture doc good practices (e.g. [Write the Docs](https://www.writethedocs.org/)).
- In this project: keep PROJECT_IDEA and README in sync with the code and `.cursor/`.
