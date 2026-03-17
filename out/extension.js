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
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const nls_1 = require("./nls");
/** Default prompt (English) — agent receives this so behavior is consistent across locales. */
const PROMPT_DEFAULT = `Generate this project's context for Cursor: documentation by area, rules with skill allocation, and references to the project and technologies.

Required references (use as source of truth):
- PROJECT_IDEA.md (if present at root) — vision, what to generate, domain skills and stack.
- .cursor/skills/default-context-generator/SKILL.md (if present) — full workflow and skills table.

Domain skills (focus areas) — map the project to these areas and document each that applies. In rules, allocate the skill name from the table (e.g. "When changing the API, use the backend skill"):

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

(Each skill in .cursor/skills/<name>/SKILL.md when present in the workspace.)

Steps (in order):

1) Analyze the repository
- Folder structure (root and first levels; ignore node_modules, .git, build).
- Stack: languages and frameworks (package.json, requirements.txt, go.mod, Cargo.toml, etc.) and versions.
- Entrypoints: main, app, index, main routes.
- Areas present: which of the skills above apply and where in the code each appears.
- Summarize in 1–2 paragraphs: what the project does, main stack and areas present.

2) Context documentation in docs/context/
- README.md: overview, stack, links to docs by area.
- One doc per relevant area (e.g. backend.md, frontend.md): what that area does in the project, where it is in the code, conventions, references to official docs of the technologies.

3) Rules in .cursor/rules/ (.mdc format)
- Skill allocation: in each rule, state explicitly which skill to use in which situation (e.g. "When changing the API, use the backend skill").
- Project reference: point to docs/context/, repo README, architecture.
- Technology references: links or names of official docs (React, FastAPI, etc.) used in the project.
- Concise (< 50 lines), with description, globs or alwaysApply. Suggestion: one core rule (alwaysApply) with context and skills per task; others by glob (e.g. **/*.ts → backend, **/*.tsx → frontend).

4) Optional: skills in .cursor/skills/ and docs/best-practices.md (code patterns, conventions, how to use the skills).

By the end: docs/context/ with overview and at least one doc per relevant area; .cursor/rules/ with rules that allocate skills and reference project and technologies.`;
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
/** Lê o prompt do arquivo de config (se existir) ou retorna o default. */
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
            return typeof obj.prompt === "string" ? obj.prompt : PROMPT_DEFAULT;
        }
        return trimmed || PROMPT_DEFAULT;
    }
    catch {
        return PROMPT_DEFAULT;
    }
}
/** Formats one NDJSON line from agent (stream-json) for readable output. Uses localize for UI language. */
function formatStreamJsonLine(line) {
    line = line.trim();
    if (!line)
        return null;
    try {
        const ev = JSON.parse(line);
        const t = ev.type;
        const sub = ev.subtype;
        if (t === "system" && sub === "init") {
            const model = ev.model ?? "agent";
            return (0, nls_1.localize)("stream.session", model);
        }
        if (t === "user")
            return null;
        if (t === "assistant" && ev.message?.content) {
            const text = ev.message.content.map((c) => c.text ?? "").join("").trim();
            if (text)
                return `[Agent] ${text}`;
            return null;
        }
        if (t === "tool_call") {
            const tc = ev.tool_call;
            if (tc?.readToolCall) {
                const pathArg = tc.readToolCall?.args?.path ?? "?";
                return sub === "started" ? (0, nls_1.localize)("stream.reading", pathArg) : (0, nls_1.localize)("stream.readDone", pathArg);
            }
            if (tc?.writeToolCall) {
                const pathArg = tc.writeToolCall?.args?.path ?? "?";
                if (sub === "started")
                    return (0, nls_1.localize)("stream.writing", pathArg);
                const res = tc.writeToolCall?.result?.success;
                if (res && res.linesCreated != null)
                    return (0, nls_1.localize)("stream.writeDoneLines", pathArg, res.linesCreated);
                return (0, nls_1.localize)("stream.writeDone", pathArg);
            }
            return sub === "started" ? (0, nls_1.localize)("stream.toolStart") : (0, nls_1.localize)("stream.toolOk");
        }
        if (t === "result" && sub === "success") {
            const dur = ev.duration_ms;
            return dur != null ? (0, nls_1.localize)("stream.completedIn", (dur / 1000).toFixed(1)) : (0, nls_1.localize)("stream.completed");
        }
    }
    catch {
        // not JSON (partial or other output)
    }
    return null;
}
function getAgentPath() {
    const isWin = process.platform === "win32";
    const candidates = [];
    if (isWin) {
        const localAppData = process.env.LOCALAPPDATA || "";
        const userProfile = process.env.USERPROFILE || "";
        if (localAppData) {
            candidates.push(path.join(localAppData, "cursor-agent"));
            const cursorBin = path.join(localAppData, "Programs", "Cursor", "resources", "app", "bin");
            candidates.push(cursorBin);
        }
        if (userProfile) {
            candidates.push(path.join(userProfile, ".local", "bin"));
            candidates.push(path.join(userProfile, "AppData", "Local", "cursor", "bin"));
        }
    }
    else {
        const home = process.env.HOME || process.env.USERPROFILE || "";
        if (home) {
            candidates.push(path.join(home, ".local", "bin"));
        }
    }
    // No Windows: priorizar agent.exe/agent.cmd (CLI) sobre cursor.exe (Electron) para evitar aviso e falha
    const cursorNames = ["cursor.exe", "cursor.cmd", "cursor"];
    const agentNames = ["agent.exe", "agent.cmd", "agent"];
    const orderFirst = isWin ? agentNames : cursorNames;
    const orderSecond = isWin ? cursorNames : agentNames;
    for (const dir of candidates) {
        if (!fs.existsSync(dir))
            continue;
        for (const name of orderFirst) {
            const full = path.join(dir, name);
            if (fs.existsSync(full)) {
                const isAgent = agentNames.includes(name);
                return {
                    exe: full,
                    argsPrefix: isAgent ? [] : ["agent"],
                    addToPath: dir,
                    useShell: isWin && (name.endsWith(".cmd") || (isAgent ? name === "agent" : !name.includes("."))),
                };
            }
        }
        for (const name of orderSecond) {
            const full = path.join(dir, name);
            if (fs.existsSync(full)) {
                const isAgent = agentNames.includes(name);
                return {
                    exe: full,
                    argsPrefix: isAgent ? [] : ["agent"],
                    addToPath: dir,
                    useShell: isWin && (name.endsWith(".cmd") || (isAgent ? name === "agent" : !name.includes("."))),
                };
            }
        }
    }
    return null;
}
/** Language block at the TOP of the prompt so the agent sees it first. Makes the selected language mandatory for all output and reasoning. */
function getLanguageBlockTop(language) {
    const blocks = {
        en: `---
REPO OUTPUT LANGUAGE: English (selected in the extension menu).
You MUST write ALL generated content in English: file names in docs/context/ (e.g. backend.md, frontend.md, extension.md — do not translate file names), section titles, body text, .cursor/rules/ content, and code examples. Use English for your reasoning and planning throughout so the output stays consistent.
---

`,
        pt: `---
REPO OUTPUT LANGUAGE: Portuguese (selected in the extension menu).
You MUST write ALL generated content in Portuguese: file names in docs/context/ (e.g. backend.md, frontend.md — keep .md names; content inside in Portuguese), section titles, body text, .cursor/rules/ content, and code examples. Use Portuguese for your reasoning and planning throughout so the output stays consistent.
---

`,
        mixed: `---
REPO OUTPUT LANGUAGE: Mixed (selected in the extension menu).
Use a mixed approach: write new or shared documentation in English; keep or mirror existing Portuguese where it is already used in the codebase. File names in docs/context/ stay as in the workflow (e.g. backend.md, frontend.md). Per-file or per-area consistency is more important than a single language. Use the same language as the file/area for your reasoning when working on that part.
---

`,
    };
    return blocks[language];
}
/** Language instruction at the end of the prompt (reinforcement). */
const LANGUAGE_INSTRUCTIONS = {
    en: "Reminder: All generated documentation, rules, file content, and code examples MUST be in English. Follow the REPO OUTPUT LANGUAGE above.",
    pt: "Reminder: All generated documentation, rules, file content, and code examples MUST be in Portuguese. Follow the REPO OUTPUT LANGUAGE above.",
    mixed: "Reminder: Follow the mixed language rule above: English for new/shared docs, Portuguese where already used; keep per-file consistency.",
};
const CONFIG_AUTO = "defaultContextGenerator.autoGenerate";
const CONFIG_AUTO_ONLY_WHEN_MISSING = "defaultContextGenerator.autoGenerateOnlyWhenMissing";
const CONFIG_AUTO_LANG = "defaultContextGenerator.autoGenerateDefaultLanguage";
const CONFIG_MODEL = "defaultContextGenerator.model";
/** Sentinel for "Cursor default" in the dropdown; empty value can be buggy in HTML select. */
const MODEL_DEFAULT_SENTINEL = "__default__";
/** Model options for the selector. Value = slug for agent --model, or MODEL_DEFAULT_SENTINEL for Cursor default. */
const MODEL_OPTIONS = [
    { label: (0, nls_1.localize)("model.default"), value: MODEL_DEFAULT_SENTINEL },
    { label: (0, nls_1.localize)("model.auto"), value: "auto" },
    { label: (0, nls_1.localize)("model.opus"), value: "claude-4-6-opus" },
    { label: (0, nls_1.localize)("model.sonnet46"), value: "claude-4-6-sonnet" },
    { label: (0, nls_1.localize)("model.sonnet45"), value: "claude-4-5-sonnet" },
];
const CONFIG_REPO_LANGUAGE = "defaultContextGenerator.repoLanguage";
function getRepoLanguage() {
    const v = vscode.workspace.getConfiguration().get(CONFIG_REPO_LANGUAGE);
    if (v === "en" || v === "pt" || v === "mixed")
        return v;
    return "ask";
}
const AUTO_STATE_PREFIX = "dcg_auto_";
/** True if workspace already has docs/context/ or .cursor/rules/ with content (no need to auto-run). */
function hasContextInWorkspace(cwd) {
    const contextDir = path.join(cwd, "docs", "context");
    if (fs.existsSync(contextDir) && fs.readdirSync(contextDir).length > 0)
        return true;
    const rulesDir = path.join(cwd, ".cursor", "rules");
    if (fs.existsSync(rulesDir) && fs.readdirSync(rulesDir).some((f) => f.endsWith(".mdc")))
        return true;
    return false;
}
/** Core run: generate context with the given language. Used by both manual command and auto. */
async function runCore(folder, language, options = {}) {
    const { silent = false, promptOverride, model } = options;
    const modelArg = (model === undefined || model === MODEL_DEFAULT_SENTINEL ? "" : model).trim();
    const basePrompt = promptOverride ?? getPromptFromConfig();
    const promptContent = getLanguageBlockTop(language) + basePrompt.trimEnd() + "\n\n" + LANGUAGE_INSTRUCTIONS[language];
    const cwd = folder.uri.fsPath;
    const cursorDir = path.join(cwd, ".cursor");
    const promptFileRel = ".cursor/.dcg-prompt.txt";
    const promptFilePath = path.join(cwd, ".cursor", ".dcg-prompt.txt");
    try {
        if (!fs.existsSync(cursorDir))
            fs.mkdirSync(cursorDir, { recursive: true });
        fs.writeFileSync(promptFilePath, promptContent, "utf-8");
    }
    catch (e) {
        await vscode.window.showErrorMessage((0, nls_1.localize)("error.createPromptFile", e instanceof Error ? e.message : String(e)));
        return;
    }
    const prompt = `Execute exactly the instructions in this file. Read the file first, then follow it: ${promptFileRel}`;
    const outputChannel = vscode.window.createOutputChannel((0, nls_1.localize)("popup.title"));
    outputChannel.clear();
    outputChannel.show();
    outputChannel.appendLine((0, nls_1.localize)("output.generating", cwd));
    if (modelArg)
        outputChannel.appendLine(`Model: ${modelArg}`);
    if (silent)
        outputChannel.appendLine((0, nls_1.localize)("progress.auto"));
    outputChannel.appendLine((0, nls_1.localize)("output.promptAt", promptFilePath));
    outputChannel.appendLine("");
    const agentRes = getAgentPath();
    const exe = agentRes?.exe ?? "agent";
    const args = [
        ...(agentRes?.argsPrefix ?? []),
        ...(modelArg ? ["--model", modelArg] : []),
        "--print",
        "--force",
        "--output-format",
        "stream-json",
        "--stream-partial-output",
        prompt,
    ];
    const useShell = agentRes?.useShell ?? true;
    const env = agentRes?.addToPath
        ? {
            ...process.env,
            PATH: agentRes.addToPath + path.delimiter + (process.env.PATH || ""),
        }
        : process.env;
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: (0, nls_1.localize)("popup.title"),
        cancellable: false,
    }, async (progress) => {
        progress.report({ message: silent ? (0, nls_1.localize)("progress.auto") : (0, nls_1.localize)("progress.starting") });
        let stderrText = "";
        let stdoutBuffer = "";
        return new Promise((resolve) => {
            const child = (0, child_process_1.spawn)(exe, args, {
                cwd,
                shell: useShell,
                env,
            });
            child.stdout?.on("data", (data) => {
                stdoutBuffer += data.toString();
                const lines = stdoutBuffer.split("\n");
                stdoutBuffer = lines.pop() ?? "";
                for (const line of lines) {
                    const formatted = formatStreamJsonLine(line);
                    if (formatted) {
                        outputChannel.appendLine(formatted);
                    }
                }
            });
            child.stderr?.on("data", (data) => {
                const s = data.toString();
                stderrText += s;
                outputChannel.append(s);
            });
            child.on("error", (err) => {
                outputChannel.appendLine("");
                outputChannel.appendLine((0, nls_1.localize)("error.agent", err.message));
                outputChannel.appendLine("");
                outputChannel.appendLine((0, nls_1.localize)("error.agentInstallWin"));
                outputChannel.appendLine((0, nls_1.localize)("error.agentInstallPath"));
                vscode.window.showErrorMessage((0, nls_1.localize)("error.cliNotFound"));
                resolve();
            });
            child.on("close", (code, _signal) => {
                if (stdoutBuffer.trim()) {
                    const formatted = formatStreamJsonLine(stdoutBuffer);
                    if (formatted)
                        outputChannel.appendLine(formatted);
                }
                outputChannel.appendLine("");
                progress.report({ message: (0, nls_1.localize)("progress.done") });
                try {
                    if (fs.existsSync(promptFilePath))
                        fs.unlinkSync(promptFilePath);
                }
                catch {
                    // ignora falha ao remover arquivo temporário
                }
                if (code === 0) {
                    const hasContext = fs.existsSync(path.join(cwd, "docs", "context")) && fs.readdirSync(path.join(cwd, "docs", "context")).length > 0;
                    const hasRules = fs.existsSync(path.join(cwd, ".cursor", "rules")) && fs.readdirSync(path.join(cwd, ".cursor", "rules")).some((f) => f.endsWith(".mdc"));
                    if (hasContext || hasRules) {
                        if (!silent)
                            vscode.window.showInformationMessage((0, nls_1.localize)("success.ready"));
                    }
                    else {
                        const needsAuth = /Authentication required|CURSOR_API_KEY|agent login/i.test(stderrText);
                        const msg = (0, nls_1.localize)("warn.noOutput");
                        if (needsAuth) {
                            vscode.window.showWarningMessage(msg, (0, nls_1.localize)("action.login")).then((choice) => {
                                if (choice === (0, nls_1.localize)("action.login")) {
                                    void vscode.commands.executeCommand("defaultContextGenerator.agentLogin");
                                }
                            });
                        }
                        else {
                            vscode.window.showWarningMessage(msg);
                        }
                    }
                }
                else if (code != null && code !== 0) {
                    const needsAuth = /Authentication required|CURSOR_API_KEY|agent login/i.test(stderrText);
                    if (needsAuth) {
                        vscode.window.showWarningMessage((0, nls_1.localize)("warn.noOutputLogin"), (0, nls_1.localize)("action.login")).then((choice) => {
                            if (choice === (0, nls_1.localize)("action.login")) {
                                void vscode.commands.executeCommand("defaultContextGenerator.agentLogin");
                            }
                        });
                    }
                    else {
                        vscode.window.showWarningMessage((0, nls_1.localize)("warn.exitCode", String(code)));
                    }
                }
                resolve();
            });
        });
    });
}
/** Manual command: use language param, config, or show language picker then run core. */
function runGerarContexto(promptOverride) {
    return async (languageParam) => {
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
            ], {
                title: (0, nls_1.localize)("popup.title"),
                placeHolder: (0, nls_1.localize)("language.pickTitle"),
                ignoreFocusOut: true,
            });
            if (!languageChoice)
                return;
            language = languageChoice.value;
        }
        const configModel = vscode.workspace.getConfiguration().get(CONFIG_MODEL, "").trim();
        const modelChoices = [
            ...MODEL_OPTIONS,
            ...(configModel ? [{ label: `${(0, nls_1.localize)("model.useSetting")} (${configModel})`, value: configModel }] : []),
        ];
        const modelChoice = await vscode.window.showQuickPick(modelChoices, {
            title: (0, nls_1.localize)("popup.title"),
            placeHolder: (0, nls_1.localize)("model.pickTitle"),
            ignoreFocusOut: true,
        });
        if (!modelChoice)
            return;
        const selectedModel = modelChoice.value;
        await runCore(folder, language, { promptOverride, model: selectedModel });
    };
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
    const model = config.get(CONFIG_MODEL, "").trim();
    await runCore(folder, lang === "pt" || lang === "mixed" ? lang : "en", { silent: true, model: model || undefined });
}
function escapeHtml(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function getPopupHtml(defaultContent, configPath, repoLanguage, selectedModel = "") {
    const hasConfig = configPath.length > 0;
    const escapedDefault = escapeHtml(defaultContent);
    const escapedPath = escapeHtml(configPath || (0, nls_1.localize)("popup.configNone"));
    const btnConfig = hasConfig ? (0, nls_1.localize)("popup.btnConfigChange") : (0, nls_1.localize)("popup.btnConfig");
    const langEn = escapeHtml((0, nls_1.localize)("language.english"));
    const langPt = escapeHtml((0, nls_1.localize)("language.portuguese"));
    const langMixed = escapeHtml((0, nls_1.localize)("language.mixed"));
    const repoLangLabel = escapeHtml((0, nls_1.localize)("popup.repoLanguageLabel"));
    const selected = repoLanguage === "ask" ? "en" : repoLanguage;
    const modelLabel = escapeHtml((0, nls_1.localize)("popup.modelLabel"));
    const modelSelected = selectedModel === "" ? MODEL_DEFAULT_SENTINEL : selectedModel;
    const modelOptionsHtml = MODEL_OPTIONS.map((o) => `<option value="${escapeHtml(o.value)}" ${o.value === modelSelected ? "selected" : ""}>${escapeHtml(o.label)}</option>`).join("") +
        (selectedModel && selectedModel !== MODEL_DEFAULT_SENTINEL && !MODEL_OPTIONS.some((o) => o.value === selectedModel)
            ? `<option value="${escapeHtml(selectedModel)}" selected>${escapeHtml((0, nls_1.localize)("model.useSetting"))} (${escapeHtml(selectedModel)})</option>`
            : "");
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
  <div class="repo-lang">
    <label>${modelLabel}</label>
    <select id="model">
      ${modelOptionsHtml}
    </select>
  </div>
  <div class="actions">
    <button id="btnGerar">${escapeHtml((0, nls_1.localize)("popup.btnGenerate"))}</button>
    <button id="btnConfig" class="secondary">${escapeHtml(btnConfig)}</button>
    <button id="btnAbrirChat" class="secondary">${escapeHtml((0, nls_1.localize)("popup.btnChat"))}</button>
    <button id="btnAgentLogin" class="secondary">${escapeHtml((0, nls_1.localize)("popup.btnAgentLogin"))}</button>
  </div>
  <div class="config-section">
    <label>${escapeHtml((0, nls_1.localize)("popup.configLabel"))}</label>
    <div class="config-path" id="configPath">${escapedPath}</div>
    ${!hasConfig ? `<label style="margin-top:8px">${escapeHtml((0, nls_1.localize)("popup.promptLabel"))}</label><pre id="defaultPre">${escapedDefault}</pre>` : ""}
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    document.getElementById('btnGerar').onclick = () => {
      const lang = document.getElementById('repoLanguage').value;
      const model = document.getElementById('model').value;
      vscode.postMessage({ type: 'gerar', language: lang, model: model });
    };
    document.getElementById('btnConfig').onclick = () => vscode.postMessage({ type: 'apontarOuCriarConfig' });
    document.getElementById('btnAbrirChat').onclick = () => vscode.postMessage({ type: 'abrirNoChat' });
    document.getElementById('btnAgentLogin').onclick = () => vscode.postMessage({ type: 'agentLogin' });
  </script>
</body>
</html>`;
}
function showPopup(context) {
    return async () => {
        const configPath = getConfigPath();
        const defaultContent = getDefaultConfigContent();
        const panel = vscode.window.createWebviewPanel("defaultContextGenerator.popup", (0, nls_1.localize)("popup.title"), vscode.ViewColumn.One, { enableScripts: true, retainContextWhenHidden: true });
        const configModel = vscode.workspace.getConfiguration().get(CONFIG_MODEL, "").trim();
        panel.webview.html = getPopupHtml(defaultContent, configPath, getRepoLanguage(), configModel);
        panel.webview.onDidReceiveMessage(async (msg) => {
            if (msg.type === "gerar") {
                const folder = vscode.workspace.workspaceFolders?.[0];
                if (!folder) {
                    await vscode.window.showErrorMessage((0, nls_1.localize)("error.openFolder"));
                    return;
                }
                panel.dispose();
                const lang = msg.language === "pt" || msg.language === "mixed" ? msg.language : "en";
                const rawModel = (msg.model ?? "").trim();
                const model = rawModel === "" || rawModel === MODEL_DEFAULT_SENTINEL ? undefined : rawModel;
                await runCore(folder, lang, { model });
            }
            else if (msg.type === "apontarOuCriarConfig") {
                await vscode.commands.executeCommand("defaultContextGenerator.apontarOuCriarConfig");
                const newPath = getConfigPath();
                const configModel = vscode.workspace.getConfiguration().get(CONFIG_MODEL, "").trim();
                panel.webview.html = getPopupHtml(getDefaultConfigContent(), newPath, getRepoLanguage(), configModel);
            }
            else if (msg.type === "abrirNoChat") {
                await vscode.commands.executeCommand("defaultContextGenerator.abrirNoChat");
            }
            else if (msg.type === "agentLogin") {
                await vscode.commands.executeCommand("defaultContextGenerator.agentLogin");
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
async function abrirNoChat() {
    const prompt = getPromptFromConfig();
    await vscode.env.clipboard.writeText(prompt);
    const chatCommands = ["aichat.openChat", "workbench.action.chat.open", "composer.newAgentChat", "cursor.chat.open"];
    for (const cmd of chatCommands) {
        try {
            await vscode.commands.executeCommand(cmd);
            break;
        }
        catch {
            // tenta o próximo
        }
    }
    await vscode.window.showInformationMessage((0, nls_1.localize)("chat.copied"));
}
function agentLogin() {
    const agentRes = getAgentPath();
    const env = agentRes?.addToPath
        ? { ...process.env, PATH: agentRes.addToPath + path.delimiter + (process.env.PATH || "") }
        : process.env;
    const term = vscode.window.createTerminal({
        name: "Cursor CLI Login",
        env: env,
    });
    term.sendText("agent login");
    term.show();
    vscode.window.showInformationMessage((0, nls_1.localize)("login.terminalOpened"));
}
function activate(context) {
    void ensureDefaultConfigFile();
    // Auto-run when workspace has no context (after short delay), to avoid unnecessary client usage
    setTimeout(() => {
        tryAutoRun(context).catch(() => { });
    }, 4000);
    context.subscriptions.push(vscode.commands.registerCommand("defaultContextGenerator.showPopup", showPopup(context)));
    context.subscriptions.push(vscode.commands.registerCommand("defaultContextGenerator.gerarContexto", (language) => runGerarContexto()(language)));
    context.subscriptions.push(vscode.commands.registerCommand("defaultContextGenerator.apontarOuCriarConfig", apontarOuCriarConfig));
    context.subscriptions.push(vscode.commands.registerCommand("defaultContextGenerator.abrirNoChat", abrirNoChat));
    context.subscriptions.push(vscode.commands.registerCommand("defaultContextGenerator.agentLogin", agentLogin));
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(sparkle) " + (0, nls_1.localize)("statusBar.text");
    statusBarItem.tooltip = (0, nls_1.localize)("statusBar.tooltip");
    statusBarItem.command = "defaultContextGenerator.showPopup";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map