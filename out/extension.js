"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const nls_1 = require("./nls");
/** Default prompt (English) — agent receives this so behavior is consistent across locales. */
const PROMPT_DEFAULT = `Generate this project's context for Cursor: documentation by area, rules with skill allocation, and references to the project and technologies.

**Stack and ecosystem (adapt first):**
- Ecosystem-agnostic: the project may be web, mobile, desktop/native, CLI, embedded, or mixed. Identify the ecosystem(s) from folder structure, manifest files, and entrypoints; documentation must reflect what the repository actually is.
- Priority 1 — Existing stack: if the repo already has detectable technologies (languages, frameworks, tools) — e.g. from package.json, requirements.txt, go.mod, Cargo.toml, pubspec.yaml, build.gradle, Xcode project, Dockerfile, etc. — describe and organize documentation around that stack; do not invent a different one.
- Priority 2 — No stack: if the project is empty, idea-only (e.g. README with vision), or has a described problem without implementation, recommend a stack suited to the problem/domain and generate docs/context (and rules/skills) assuming that recommended stack, with a 1–2 sentence justification per area.

**Required outputs (you MUST create ALL THREE in this run):**
1) **docs/context/** — README.md plus at least one doc per relevant area (e.g. backend.md, frontend.md). Do not skip this.
2) **.cursor/rules/** — one or more .mdc rules with skill allocation. Do not finish until docs/context/, .cursor/rules/, and .cursor/skills/ are created.
3) **.cursor/skills/** — at least one skill per relevant area (e.g. .cursor/skills/backend/SKILL.md, .cursor/skills/frontend/SKILL.md). Skills are the best optimization for AI: Cursor loads them when rules reference them. Do not skip this.

Required references (use as source of truth, in this order):
- README (README.md, README.* at project root) — overview, stack, how to use the project. This is the first place to look (industry standard).
- .cursor/skills/default-context-generator/SKILL.md (if present) — read it first and follow its full workflow (interpret existing doc → analyze repo → docs by area → rules with skill allocation). Use the skills table there to map the project and to allocate skills explicitly in rules so Cursor gets maximum benefit.

Skills in rules: In each rule, state explicitly which skill to use for which task (e.g. "When changing the API, use the backend skill"). This ensures Cursor uses the right skills per task and maximizes their value.

Domain skills (focus areas) — map the project to these areas and document each that applies:

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

(Each skill in .cursor/skills/<name>/SKILL.md when present in the workspace.)

Steps (in order):

1) Analyze the repository
- Folder structure (root and first levels; ignore node_modules, .git, build).
- Stack: languages and frameworks (package.json, requirements.txt, go.mod, Cargo.toml, pubspec.yaml, build.gradle, etc.) and versions.
- Entrypoints: main, app, index, main routes.
- Ecosystem(s): identify web, mobile, native/desktop, CLI, or mixed from structure and dependency files.
- Conclude explicitly: (a) "Existing stack" — list technologies found and ecosystem(s); or (b) "No stack" — summarize the problem/vision from README or folder names so you can recommend a stack later.
- Areas present: which of the skills above apply and where in the code each appears.
- Summarize in 1–2 paragraphs: what the project does, main stack (or "no stack") and areas present.

2) Context documentation in docs/context/
- Use docs-as-code: keep docs in Markdown in the repo; reference real code paths and examples to avoid drift.
- Structure (Diátaxis as guide, not rigid): Overview/README (what the project does, for whom, getting started); per-area docs (Reference/Explanation); optional how-to guides for tasks (e.g. setup, deploy); optional tutorials only for libs/SDKs or onboarding.
- README.md: overview, stack, links to docs by area. If the project has no README (or it is empty/irrelevant), create a minimal overview: use docs/context/README.md as the context index and, when appropriate, suggest or add a root README with vision, stack and links to docs/context/.
- If conclusion was "No stack": add a "Recommended stack" subsection in docs/context/README.md (or a dedicated doc) with technologies per area (backend, frontend, DB, etc.) and a brief justification from project context (e.g. "REST API → FastAPI or Express"; "mobile → React Native or Flutter depending on constraints").
- One doc per relevant area (e.g. backend.md, frontend.md): what that area does in the project, where it is in the code, conventions, references to official docs of the technologies.
- ADRs (optional): for significant architecture decisions, suggest docs/adr/ or a section in docs/context/ with short records: context, decision, consequences.

3) Rules in .cursor/rules/ (.mdc format)
- Skill allocation: in each rule, state explicitly which skill to use in which situation (e.g. "When changing the API, use the backend skill") so Cursor uses skills effectively.
- Project reference: point to docs/context/, repo README, architecture.
- Technology references: links or names of official docs (React, FastAPI, etc.) used in the project.
- Concise (< 50 lines), with description, globs or alwaysApply. Suggestion: one core rule (alwaysApply) with context and skills per task; others by glob (e.g. **/*.ts → backend, **/*.tsx → frontend).

4) Skills in .cursor/skills/ (required for best AI optimization)
- Create .cursor/skills/<area>/SKILL.md for each relevant area. When REPO OUTPUT LANGUAGE is English, use English folder names only: backend, frontend, devops, testing, performance, system-design, ux-ui, security, accessibility, technical-docs, software-architecture, data-database, marketing (do not use Portuguese slugs like acessibilidade, seguranca, docs-tecnico, arquiteto-software). When language is Portuguese, Portuguese slugs are fine. Match the area names used in docs/context/ and in rules.
- Each SKILL.md: YAML frontmatter with \`name:\` (slug, same as folder name) and \`description:\` (one line: when to use for this project); body with "When to use" and a reference to docs/context/<area>.md. Keep each skill short and project-specific (what this repo uses, where the code lives, link to the context doc). All content inside SKILL.md in the language chosen (English or Portuguese).
- Rules already reference these skills by name; having the actual SKILL.md files in the repo allows Cursor to load them and gives the best AI behavior. Do not skip this step.

5) Optional: docs/best-practices.md (code patterns, conventions, how to use the skills; can include how-to style guides aligned with Diátaxis).

**Before finishing — verify all required outputs exist:**
- [ ] docs/context/README.md exists
- [ ] At least one docs/context/<area>.md exists (e.g. backend.md, frontend.md)
- [ ] .cursor/rules/ contains at least one .mdc file
- [ ] .cursor/skills/ contains at least one <area>/SKILL.md (e.g. backend/SKILL.md, frontend/SKILL.md)

By the end: docs/context/ with overview and at least one doc per relevant area; .cursor/rules/ with rules that allocate skills; .cursor/skills/ with at least one skill per relevant area; all referencing the project and technologies.`;
const CONFIG_KEY = "defaultContextGenerator.configPath";
function getConfigPath() {
    return (vscode.workspace.getConfiguration().get(CONFIG_KEY) ?? "").trim();
}
async function setConfigPath(filePath) {
    const config = vscode.workspace.getConfiguration();
    const resource = vscode.workspace.workspaceFolders?.[0]?.uri;
    await config.update(CONFIG_KEY, filePath, resource ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global);
}
function getDefaultConfigContent() {
    return PROMPT_DEFAULT;
}
/** Caminho do arquivo de config padrão no workspace (.cursor/default-context-prompt.txt). */
const DEFAULT_CONFIG_RELATIVE = ".cursor/default-context-prompt.txt";
/** Garante que existe um arquivo de configuração base no workspace; usa-o como config atual se ainda não houver path definido. */
async function ensureDefaultConfigFile() {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder || getConfigPath().length > 0)
        return;
    const dir = path.join(folder.uri.fsPath, ".cursor");
    const fullPath = path.join(dir, "default-context-prompt.txt");
    try {
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(fullPath)) {
            fs.writeFileSync(fullPath, getDefaultConfigContent(), "utf-8");
        }
        await setConfigPath(DEFAULT_CONFIG_RELATIVE);
    }
    catch {
        // ignora falha ao criar (permissão, etc.)
    }
}
/** Sentinel in the current default prompt; if the config file doesn't contain it, we treat it as an old version and use built-in prompt. */
const PROMPT_VERSION_SENTINEL = "Required outputs (you MUST create ALL THREE in this run)";
/** Lê o prompt do arquivo de config (se existir) ou retorna o default. Se o path for o arquivo padrão e o conteúdo for versão antiga (sem sentinel), usa PROMPT_DEFAULT do código. */
function getPromptFromConfig() {
    const raw = getConfigPath();
    if (!raw)
        return PROMPT_DEFAULT;
    const p = path.isAbsolute(raw) ? raw : path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "", raw);
    if (!fs.existsSync(p))
        return PROMPT_DEFAULT;
    try {
        const content = fs.readFileSync(p, "utf-8");
        const trimmed = content.trim();
        if (trimmed.startsWith("{")) {
            const obj = JSON.parse(content);
            const prompt = typeof obj.prompt === "string" ? obj.prompt : PROMPT_DEFAULT;
            return prompt.includes(PROMPT_VERSION_SENTINEL) ? prompt : PROMPT_DEFAULT;
        }
        const normalizedPath = path.normalize(raw).replace(/\\/g, "/");
        const isDefaultFile = normalizedPath.endsWith(".cursor/default-context-prompt.txt") || normalizedPath.endsWith("default-context-prompt.txt");
        if (isDefaultFile && !content.includes(PROMPT_VERSION_SENTINEL))
            return PROMPT_DEFAULT;
        return trimmed || PROMPT_DEFAULT;
    }
    catch {
        return PROMPT_DEFAULT;
    }
}
const CONFIG_AUTO = "defaultContextGenerator.autoGenerate";
const CONFIG_AUTO_ONLY_WHEN_MISSING = "defaultContextGenerator.autoGenerateOnlyWhenMissing";
const CONFIG_AUTO_LANG = "defaultContextGenerator.autoGenerateDefaultLanguage";
const CONFIG_REPO_LANGUAGE = "defaultContextGenerator.repoLanguage";
function getRepoLanguage() {
    const v = vscode.workspace.getConfiguration().get(CONFIG_REPO_LANGUAGE);
    if (v === "en" || v === "pt" || v === "mixed")
        return v;
    return "ask";
}
const AUTO_STATE_PREFIX = "dcg_auto_";
/** True if workspace already has docs/context/, .cursor/rules/, or .cursor/skills/ with content (no need to auto-run). */
function hasContextInWorkspace(cwd) {
    const contextDir = path.join(cwd, "docs", "context");
    if (fs.existsSync(contextDir) && fs.readdirSync(contextDir).length > 0)
        return true;
    const rulesDir = path.join(cwd, ".cursor", "rules");
    if (fs.existsSync(rulesDir) && fs.readdirSync(rulesDir).some((f) => f.endsWith(".mdc")))
        return true;
    const skillsDir = path.join(cwd, ".cursor", "skills");
    if (fs.existsSync(skillsDir) && fs.readdirSync(skillsDir).some((d) => {
        const skillDir = path.join(skillsDir, d);
        return fs.statSync(skillDir).isDirectory() && fs.existsSync(path.join(skillDir, "SKILL.md"));
    }))
        return true;
    return false;
}
/** Command palette "Generate context": open chat with prompt, optionally ask language. */
async function gerarContextoCommand(languageParam) {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
        await vscode.window.showErrorMessage((0, nls_1.localize)("error.openFolder"));
        return;
    }
    let language;
    if (languageParam) {
        language = languageParam;
    }
    else if (getRepoLanguage() !== "ask") {
        language = getRepoLanguage();
    }
    else {
        const languageChoice = await vscode.window.showQuickPick([
            { label: (0, nls_1.localize)("language.english"), value: "en" },
            { label: (0, nls_1.localize)("language.portuguese"), value: "pt" },
            { label: (0, nls_1.localize)("language.mixed"), value: "mixed" },
        ], { title: (0, nls_1.localize)("popup.title"), placeHolder: (0, nls_1.localize)("language.pickTitle"), ignoreFocusOut: true });
        if (!languageChoice)
            return;
        language = languageChoice.value;
    }
    await openChatWithPrompt({ appendLanguage: language });
}
/** Run context generation automatically when workspace has no context, to avoid unnecessary manual runs and client usage. */
async function tryAutoRun(extensionContext) {
    const config = vscode.workspace.getConfiguration();
    const autoGenerate = config.get(CONFIG_AUTO, false);
    if (!autoGenerate)
        return;
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder)
        return;
    const onlyWhenMissing = config.get(CONFIG_AUTO_ONLY_WHEN_MISSING, true);
    if (onlyWhenMissing && hasContextInWorkspace(folder.uri.fsPath))
        return;
    const stateKey = AUTO_STATE_PREFIX + folder.uri.fsPath;
    if (extensionContext.globalState.get(stateKey))
        return;
    extensionContext.globalState.update(stateKey, Date.now());
    const lang = config.get(CONFIG_AUTO_LANG, "en");
    await openChatWithPrompt({ appendLanguage: lang });
}
function escapeHtml(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function getPopupHtml(defaultContent, configPath, repoLanguage) {
    const hasConfig = configPath.length > 0;
    const escapedDefault = escapeHtml(defaultContent);
    const escapedPath = escapeHtml(configPath || (0, nls_1.localize)("popup.configNone"));
    const btnConfig = hasConfig ? (0, nls_1.localize)("popup.btnConfigChange") : (0, nls_1.localize)("popup.btnConfig");
    const langEn = escapeHtml((0, nls_1.localize)("language.english"));
    const langPt = escapeHtml((0, nls_1.localize)("language.portuguese"));
    const langMixed = escapeHtml((0, nls_1.localize)("language.mixed"));
    const repoLangLabel = escapeHtml((0, nls_1.localize)("popup.repoLanguageLabel"));
    const selected = repoLanguage === "ask" ? "en" : repoLanguage;
    return /* html */ `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <style>
    body { font-family: var(--vscode-font-family); font-size: 13px; padding: 12px; margin: 0; color: var(--vscode-foreground); background: var(--vscode-editor-background); }
    h2 { margin: 0 0 12px 0; font-size: 14px; }
    .actions { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    button { padding: 8px 12px; cursor: pointer; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 4px; font-size: 13px; }
    button:hover { background: var(--vscode-button-hoverBackground); }
    button.secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
    button.secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
    .repo-lang { margin-bottom: 12px; }
    .repo-lang label { display: block; margin-bottom: 6px; font-weight: 500; }
    .repo-lang select { width: 100%; padding: 6px; font-size: 13px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; }
    .config-section { margin-top: 12px; padding: 10px; background: var(--vscode-editor-inactiveSelectionBackground); border-radius: 4px; }
    .config-section label { display: block; margin-bottom: 4px; font-weight: 500; }
    .config-path { font-size: 11px; word-break: break-all; color: var(--vscode-descriptionForeground); }
    pre { white-space: pre-wrap; word-break: break-word; font-size: 11px; max-height: 180px; overflow: auto; margin: 0; }
  </style>
</head>
<body>
  <h2>${escapeHtml((0, nls_1.localize)("popup.title"))}</h2>
  <div class="repo-lang">
    <label>${repoLangLabel}</label>
    <select id="repoLanguage">
      <option value="en" ${selected === "en" ? "selected" : ""}>${langEn}</option>
      <option value="pt" ${selected === "pt" ? "selected" : ""}>${langPt}</option>
      <option value="mixed" ${selected === "mixed" ? "selected" : ""}>${langMixed}</option>
    </select>
  </div>
  <div class="actions">
    <button id="btnGerar">${escapeHtml((0, nls_1.localize)("popup.btnGenerate"))}</button>
    <button id="btnConfig" class="secondary">${escapeHtml(btnConfig)}</button>
    <button id="btnRestoreDefault" class="secondary">${escapeHtml((0, nls_1.localize)("popup.btnRestoreDefault"))}</button>
    ${hasConfig ? `<button id="btnOpenPrompt" class="secondary">${escapeHtml((0, nls_1.localize)("popup.btnOpenPrompt"))}</button>` : ""}
  </div>
  <div class="config-section">
    <label>${escapeHtml((0, nls_1.localize)("popup.configLabel"))}</label>
    <div class="config-path" id="configPath">${escapedPath}</div>
    ${!hasConfig ? `<label style="margin-top:8px">${escapeHtml((0, nls_1.localize)("popup.promptLabel"))}</label><pre id="defaultPre">${escapedDefault}</pre>` : ""}
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    document.getElementById('btnGerar').onclick = () => {
      vscode.postMessage({ type: 'gerar', language: document.getElementById('repoLanguage').value });
    };
    document.getElementById('btnConfig').onclick = () => vscode.postMessage({ type: 'apontarOuCriarConfig' });
    document.getElementById('btnRestoreDefault').onclick = () => vscode.postMessage({ type: 'resetDefaultPrompt' });
    const btnOpenPrompt = document.getElementById('btnOpenPrompt');
    if (btnOpenPrompt) btnOpenPrompt.onclick = () => vscode.postMessage({ type: 'openPromptConfig' });
  </script>
</body>
</html>`;
}
function showPopup(context) {
    return async () => {
        const configPath = getConfigPath();
        const defaultContent = getDefaultConfigContent();
        const panel = vscode.window.createWebviewPanel("defaultContextGenerator.popup", (0, nls_1.localize)("popup.title"), vscode.ViewColumn.One, { enableScripts: true, retainContextWhenHidden: true });
        panel.webview.html = getPopupHtml(defaultContent, configPath, getRepoLanguage());
        panel.webview.onDidReceiveMessage(async (msg) => {
            if (msg.type === "gerar") {
                const folder = vscode.workspace.workspaceFolders?.[0];
                if (!folder) {
                    await vscode.window.showErrorMessage((0, nls_1.localize)("error.openFolder"));
                    return;
                }
                const lang = msg.language === "pt" || msg.language === "mixed" ? msg.language : "en";
                await openChatWithPrompt({ appendLanguage: lang });
            }
            else if (msg.type === "apontarOuCriarConfig") {
                await vscode.commands.executeCommand("defaultContextGenerator.apontarOuCriarConfig");
                const newPath = getConfigPath();
                panel.webview.html = getPopupHtml(getDefaultConfigContent(), newPath, getRepoLanguage());
            }
            else if (msg.type === "resetDefaultPrompt") {
                await vscode.commands.executeCommand("defaultContextGenerator.resetDefaultPrompt");
                const newPath = getConfigPath();
                panel.webview.html = getPopupHtml(getDefaultConfigContent(), newPath, getRepoLanguage());
            }
            else if (msg.type === "abrirNoChat") {
                await vscode.commands.executeCommand("defaultContextGenerator.abrirNoChat");
            }
            else if (msg.type === "openPromptConfig") {
                const folder = vscode.workspace.workspaceFolders?.[0];
                if (!folder)
                    return;
                const raw = getConfigPath().trim();
                if (!raw)
                    return;
                const fullPath = path.isAbsolute(raw) ? raw : path.join(folder.uri.fsPath, raw);
                try {
                    const doc = await vscode.workspace.openTextDocument(fullPath);
                    await vscode.window.showTextDocument(doc);
                }
                catch (e) {
                    await vscode.window.showErrorMessage((0, nls_1.localize)("error.openPromptConfig", e instanceof Error ? e.message : String(e)));
                }
            }
        }, undefined, context.subscriptions);
    };
}
async function apontarOuCriarConfig() {
    const folder = vscode.workspace.workspaceFolders?.[0];
    const choice = await vscode.window.showQuickPick([
        { label: (0, nls_1.localize)("config.createNew"), value: "create" },
        { label: (0, nls_1.localize)("config.pointExisting"), value: "existing" },
    ], { title: (0, nls_1.localize)("popup.title") + ": " + (0, nls_1.localize)("popup.configLabel"), placeHolder: (0, nls_1.localize)("config.pickOption") });
    if (!choice)
        return;
    if (choice.value === "existing") {
        const chosen = await vscode.window.showOpenDialog({
            defaultUri: folder?.uri,
            filters: { [(0, nls_1.localize)("config.filterText")]: ["txt"], [(0, nls_1.localize)("config.filterJson")]: ["json"] },
            title: (0, nls_1.localize)("config.dialogTitleOpen"),
        });
        if (!chosen?.[0])
            return;
        const p = chosen[0].fsPath;
        const relative = folder && p.startsWith(folder.uri.fsPath)
            ? path.relative(folder.uri.fsPath, p)
            : p;
        await setConfigPath(relative);
        await vscode.window.showInformationMessage((0, nls_1.localize)("config.saved", relative));
        const doc = await vscode.workspace.openTextDocument(chosen[0]);
        await vscode.window.showTextDocument(doc);
        return;
    }
    const defaultUri = folder ? vscode.Uri.joinPath(folder.uri, ".cursor", "default-context-prompt.txt") : undefined;
    const chosen = await vscode.window.showSaveDialog({
        defaultUri,
        filters: { [(0, nls_1.localize)("config.filterText")]: ["txt"], [(0, nls_1.localize)("config.filterJson")]: ["json"] },
        title: (0, nls_1.localize)("config.dialogTitleSave"),
    });
    if (!chosen)
        return;
    const p = chosen.fsPath;
    const content = getDefaultConfigContent();
    const isJson = chosen.path.endsWith(".json");
    const toWrite = isJson ? JSON.stringify({ prompt: content }, null, 2) : content;
    try {
        const dir = path.dirname(p);
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(p, toWrite, "utf-8");
    }
    catch (e) {
        await vscode.window.showErrorMessage((0, nls_1.localize)("error.writeFile", e instanceof Error ? e.message : String(e)));
        return;
    }
    const relative = folder && p.startsWith(folder.uri.fsPath)
        ? path.relative(folder.uri.fsPath, p)
        : p;
    await setConfigPath(relative);
    await vscode.window.showInformationMessage((0, nls_1.localize)("config.savedPath", relative));
    const doc = await vscode.workspace.openTextDocument(chosen);
    await vscode.window.showTextDocument(doc);
}
/** Overwrites the workspace default prompt file with the extension's current PROMPT_DEFAULT and sets config to it. Use when the workspace file is outdated. */
async function resetDefaultPrompt() {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
        await vscode.window.showErrorMessage((0, nls_1.localize)("error.openFolder"));
        return;
    }
    const dir = path.join(folder.uri.fsPath, ".cursor");
    const fullPath = path.join(dir, "default-context-prompt.txt");
    try {
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fullPath, getDefaultConfigContent(), "utf-8");
        await setConfigPath(DEFAULT_CONFIG_RELATIVE);
        await vscode.window.showInformationMessage((0, nls_1.localize)("resetDefaultPrompt.success", fullPath));
    }
    catch (e) {
        await vscode.window.showErrorMessage((0, nls_1.localize)("error.writeFile", e instanceof Error ? e.message : String(e)));
    }
}
/** Builds prompt with optional language instruction at the end. */
function buildPromptForChat(appendLanguage) {
    let prompt = getPromptFromConfig();
    if (appendLanguage === "pt")
        prompt = prompt.trimEnd() + "\n\nReply in Portuguese.";
    else if (appendLanguage === "en")
        prompt = prompt.trimEnd() + "\n\nReply in English.";
    else if (appendLanguage === "mixed")
        prompt = prompt.trimEnd() + "\n\nReply in the language that best fits each section (English or Portuguese).";
    return prompt;
}
/** Copy prompt to clipboard, open chat, then paste into input (workaround: no API to set chat input). */
async function openChatWithPrompt(options) {
    const prompt = buildPromptForChat(options?.appendLanguage);
    await vscode.env.clipboard.writeText(prompt);
    const chatCommands = ["aichat.openChat", "aichat.show-ai-chat", "workbench.action.chat.open", "composer.newAgentChat", "cursor.chat.open"];
    for (const cmd of chatCommands) {
        try {
            await vscode.commands.executeCommand(cmd);
            break;
        }
        catch {
            /* try next */
        }
    }
    // Paste after chat input is focused; delay too short can paste into editor, too long lets user focus elsewhere.
    const PASTE_DELAY_MS = 700;
    setTimeout(async () => {
        try {
            await vscode.commands.executeCommand("editor.action.clipboardPasteAction");
            await vscode.window.showInformationMessage((0, nls_1.localize)("chat.pasted"));
        }
        catch {
            await vscode.window.showInformationMessage((0, nls_1.localize)("chat.copied"));
        }
    }, PASTE_DELAY_MS);
}
async function abrirNoChat() {
    await openChatWithPrompt();
}
function activate(context) {
    void ensureDefaultConfigFile();
    // Auto-run when workspace has no context (after short delay), to avoid unnecessary client usage
    setTimeout(() => {
        tryAutoRun(context).catch(() => { });
    }, 4000);
    context.subscriptions.push(vscode.commands.registerCommand("defaultContextGenerator.showPopup", showPopup(context)));
    context.subscriptions.push(vscode.commands.registerCommand("defaultContextGenerator.gerarContexto", gerarContextoCommand));
    context.subscriptions.push(vscode.commands.registerCommand("defaultContextGenerator.apontarOuCriarConfig", apontarOuCriarConfig));
    context.subscriptions.push(vscode.commands.registerCommand("defaultContextGenerator.abrirNoChat", abrirNoChat));
    context.subscriptions.push(vscode.commands.registerCommand("defaultContextGenerator.resetDefaultPrompt", resetDefaultPrompt));
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(sparkle) " + (0, nls_1.localize)("statusBar.text");
    statusBarItem.tooltip = (0, nls_1.localize)("statusBar.tooltip");
    statusBarItem.command = "defaultContextGenerator.showPopup";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map