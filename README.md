# Default Context Generator

**Open source (MIT).** The extension is published so anyone can install it from the marketplace; the repository is public for contributions and transparency. (No promotion — just available for those who find it.)

**Internationalization:** primary language **English**, secondary **Portuguese**. Extension UI and manifest follow the editor language; see [.cursor/rules/i18n.mdc](.cursor/rules/i18n.mdc) and [CONTRIBUTING.md](CONTRIBUTING.md).  
[Português](README.pt.md)

---

Automation that runs **inside Cursor** (the agent runs the flow) to generate **context**, **rules**, **best practices**, and **skills** in Git repositories:

- **Set up new projects** — get the repo ready with rules and context documentation.
- **Get into existing projects** — extract and document the system by area, based on the code and technologies used.

The core is **skills and rules**: Cursor analyzes the repo and writes the files in `.cursor/` and `docs/`. A CLI is not required; the logic lives in Markdown and is easy to evolve.

**Extension:** command "Default Context Generator: Generate project context" — copies the prompt to the clipboard and tries to open chat; you paste (Ctrl+V) and send.

## Project vision

The project vision, Cursor as executor, what the automation generates and the build order are in **[PROJECT_IDEA.md](./PROJECT_IDEA.md)**.

## Build order

1. **Skills** — the generator's own skills (analyze repo, write rules, context documentation).
2. **Get context** — flow/instructions for Cursor to analyze the repo and generate documentation by area.
3. **Automation** — orchestration via rules + skills (and then, optionally, extension command).

## Skills

- **Orchestration:** `default-context-generator` — full flow (interpret existing doc → analyze → context → rules → skills).
- **Domain:** `arquiteto-software`, `system-design`, `backend`, `frontend`, `ux-ui`, `devops`, `seguranca`, `marketing`, `testing`, `data-database`, `docs-tecnico`, `acessibilidade`, `performance`.

All in `.cursor/skills/<name>/SKILL.md`.

## Structure

```
defaultcontextgenerator/
├── PROJECT_IDEA.md
├── README.md
├── package.json, src/, out/   # Cursor/VS Code extension
├── .cursor/
│   ├── rules/         # gerar-contexto, projeto-contexto, extension-typescript, i18n
│   └── skills/        # default-context-generator + 13 domain skills
└── docs/
    └── context/       # This repo's context (README + extension, skills-e-rules, docs-tecnico)
```

## Usage

- **Via chat:** open a repo in Cursor and ask "generate this project's context" (with this repo's skills or the prompt below).
- **Via extension:** **"Generate context"** button in the **status bar** (bottom right) or Ctrl+Shift+P → "Default Context Generator: Generate project context". The **Cursor CLI** runs in headless mode in the open workspace and generates `docs/context/` and `.cursor/rules/` — one click → environment ready. (Requires [Cursor CLI](https://cursor.com/docs/cli/installation) installed.)

### Prerequisite: Cursor CLI

The extension runs the `agent -p --force` command in the workspace. Install the Cursor CLI if you don't have it yet:

- **Windows (PowerShell):** `irm 'https://cursor.com/install?win32=true' | iex`
- **macOS/Linux:** `curl https://cursor.com/install -fsS | bash`

See [Cursor CLI installation](https://cursor.com/docs/cli/installation).

### Install and use in your Cursor

**Option A — Install from .vsix (recommended for personal use)**

1. In the project folder:
   ```bash
   npm install
   npm run package
   ```
   This produces a `default-context-generator-0.1.0.vsix` file in the root.

2. In Cursor: **Extensions** (Ctrl+Shift+X) → **"..."** menu → **Install from VSIX...** → select the generated `.vsix`.

3. Restart Cursor if prompted. The **"Default Context Generator: Generate project context"** command and the **"Generate context"** status bar button will be available in any workspace.

**Option B — Publish to a marketplace (install via extension search)**

See **[PUBLISHING.md](PUBLISHING.md)** for the full step-by-step. In short:

- **Open VSX** (works with Cursor): account at [open-vsx.org](https://open-vsx.org), token, then `npx @vscode/vsce login open-vsx` and `npx @vscode/vsce publish -p <token>`.
- **VS Code Marketplace**: create a publisher at [marketplace.visualstudio.com](https://marketplace.visualstudio.com/manage), then `npx @vscode/vsce login <publisher>` and `npx @vscode/vsce publish`.

Before publishing, set `publisher` and `repository.url` in `package.json` if needed.

**Option C — Development (F5)**

- **F5** (Run > Start Debugging) opens a development window with the extension loaded, to test without installing the .vsix.

---

After installing: open a repository, use **"Generate context"** in the status bar or **Ctrl+Shift+P** → "Default Context Generator: Generate project context". The agent output appears in the **"Default Context Generator"** panel; when it finishes, **"Environment ready!"** indicates that `docs/context/` and `.cursor/rules/` were generated.

For the agent to follow the full workflow (domain skills and interpretation of existing doc), copy the `.cursor/skills/` folder (and optionally `.cursor/rules/gerar-contexto.mdc`) to the repository where you want to generate context, or open this repo in a multi-root workspace.
