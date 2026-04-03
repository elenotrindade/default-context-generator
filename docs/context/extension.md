# Area: Extension (Cursor/VS Code)

## What this area does in the project

The extension exposes a **status bar button** (bottom right: "Generate context") and **commands** in the palette. When you click the button:

1. It opens a **popup (webview)** with:
   - **Reply language** — dropdown (English, Portuguese, Mixed); this is appended to the prompt when you click "Generate context".
   - **Generate context** — copies the prompt (from the config file or the default), appends the language line, opens the chat, and pastes the text into the input so you can send immediately.
   - **Set or create config file** — create or point to a prompt file; path stored in `defaultContextGenerator.configPath`.
   - **Restore default prompt** — overwrites the workspace default prompt with the extension's built-in prompt.
   - **Open prompt config file** — when a config is set, opens that file for editing.
2. If no config file is set, the popup shows the **default prompt** so the user can create or customize it.
3. **Generate context** does **not** run the Cursor CLI: it opens the chat and pastes the prompt (no `agent.exe` or CLI required).

**Manual only:** context generation runs when the user opens the panel or command and chooses to generate — nothing runs automatically on workspace load.

**Repository language:** `defaultContextGenerator.repoLanguage` (en / pt / mixed / ask). When **ask**, the command palette shows a language picker before opening the chat; otherwise the configured language is used.

## Where it is in the code

- **`package.json`** — manifest: `main`, `contributes.commands`, `activationEvents`, configuration (no agent/CLI settings).
- **`src/extension.ts`** — extension logic:
  - `PROMPT_DEFAULT`: built-in default prompt; merged with `getPromptFromConfig()` (reads `defaultContextGenerator.configPath`: `.cursor/default-context-prompt.txt`, another path, or JSON `{"prompt":"..."}`). If the default file is missing the version sentinel, the built-in prompt is used.
  - Config: `defaultContextGenerator.configPath`; repository language: `repoLanguage`.
  - `openChatWithPrompt(options?)`: builds prompt (optional language suffix), copies to clipboard, opens chat, then after a short delay runs paste so the prompt appears in the input.
  - Popup with reply language dropdown, "Generate context", "Set or create config", "Restore default prompt", "Open prompt config file".
  - `gerarContextoCommand()`: command palette "Generate context"; shows language picker when `repoLanguage` is "ask", then calls `openChatWithPrompt`.
- **`src/nls.ts`** — localized strings for the popup, status bar, and messages (`localize()`), keyed by editor display language.
- **`out/extension.js`** — build (from `npm run compile`).

## Conventions and decisions

- The prompt is **self-contained**: it describes the workflow for the agent when the user sends it in chat. It includes a version line (**DCG_CONTEXT_V2**) so the extension can detect outdated workspace copies of `.cursor/default-context-prompt.txt` and substitute the built-in prompt.
- The prompt is structured in sections (mission, path boundary, **constitution + senior agent norms**, Claude Code–style analogues as **documentation-only** guidance, required outputs, consultation gate, stack, steps).
- It requires **docs/context/README.md** and the core rule to encode entry-point maps, a light dependency map, minimal edits, search-before-break, run tests/lint (or state commands), short rules/skills, and no commit/push without explicit confirmation.
- **Security gate:** when APIs/auth/secrets apply, the prompt requires **docs/context/security.md** (or equivalent) and explicit **security** skill routing in generated rules.
- The prompt includes a **consultative one-shot approach gate**: when critical decisions have multiple valid approaches, the agent asks once and performs **no file writes** until the user answers; strict order is analyze → questionnaire → write.
- The prompt enforces **glob partitioning for rules**: generated `.cursor/rules/*.mdc` should use mutually exclusive globs whenever possible to reduce overlapping rule activation and improve context-loading performance.
- The prompt limits **alwaysApply** to a single core rule for global policy; area-specific guidance should stay in non-overlapping glob-scoped rules; avoid duplicating long text between rules and skills.
- Chat-opening commands are tried in order: `aichat.openChat`, `aichat.show-ai-chat`, `workbench.action.chat.open`, `composer.newAgentChat`, `cursor.chat.open`; then paste via `editor.action.clipboardPasteAction` after a delay.
- No CLI or runtime dependencies beyond VS Code/Cursor.

## Official documentation

- [VS Code Extension API](https://code.visualstudio.com/api) — commands, `vscode.env.clipboard`, `vscode.commands.executeCommand`.
