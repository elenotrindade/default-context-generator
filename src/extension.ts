import * as vscode from "vscode";
import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { localize } from "./nls";

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

function getConfigPath(): string {
  return (
    vscode.workspace.getConfiguration().get<string>(CONFIG_KEY) ?? ""
  ).trim();
}

async function setConfigPath(filePath: string): Promise<void> {
  const config = vscode.workspace.getConfiguration();
  const resource = vscode.workspace.workspaceFolders?.[0]?.uri;
  await config.update(CONFIG_KEY, filePath, resource ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global);
}

function getDefaultConfigContent(): string {
  return PROMPT_DEFAULT;
}

/** Caminho do arquivo de config padrão no workspace (.cursor/default-context-prompt.txt). */
const DEFAULT_CONFIG_RELATIVE = ".cursor/default-context-prompt.txt";

/** Garante que existe um arquivo de configuração base no workspace; usa-o como config atual se ainda não houver path definido. */
async function ensureDefaultConfigFile(): Promise<void> {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder || getConfigPath().length > 0) return;
  const dir = path.join(folder.uri.fsPath, ".cursor");
  const fullPath = path.join(dir, "default-context-prompt.txt");
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, getDefaultConfigContent(), "utf-8");
    }
    await setConfigPath(DEFAULT_CONFIG_RELATIVE);
  } catch {
    // ignora falha ao criar (permissão, etc.)
  }
}

/** Lê o prompt do arquivo de config (se existir) ou retorna o default. */
function getPromptFromConfig(): string {
  const raw = getConfigPath();
  if (!raw) return PROMPT_DEFAULT;
  const p = path.isAbsolute(raw) ? raw : path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "", raw);
  if (!fs.existsSync(p)) return PROMPT_DEFAULT;
  try {
    const content = fs.readFileSync(p, "utf-8");
    const trimmed = content.trim();
    if (trimmed.startsWith("{")) {
      const obj = JSON.parse(content) as { prompt?: string };
      return typeof obj.prompt === "string" ? obj.prompt : PROMPT_DEFAULT;
    }
    return trimmed || PROMPT_DEFAULT;
  } catch {
    return PROMPT_DEFAULT;
  }
}

/** Formats one NDJSON line from agent (stream-json) for readable output. Uses localize for UI language. */
function formatStreamJsonLine(line: string): string | null {
  line = line.trim();
  if (!line) return null;
  try {
    const ev = JSON.parse(line) as { type?: string; subtype?: string; message?: { content?: Array<{ text?: string }> }; tool_call?: Record<string, { args?: { path?: string }; result?: { success?: { path?: string; linesCreated?: number; fileSize?: number } } }> };
    const t = ev.type;
    const sub = ev.subtype;
    if (t === "system" && sub === "init") {
      const model = (ev as { model?: string }).model ?? "agent";
      return localize("stream.session", model);
    }
    if (t === "user") return null;
    if (t === "assistant" && ev.message?.content) {
      const text = ev.message.content.map((c) => c.text ?? "").join("").trim();
      if (text) return `[Agent] ${text}`;
      return null;
    }
    if (t === "tool_call") {
      const tc = ev.tool_call;
      if (tc?.readToolCall) {
        const pathArg = tc.readToolCall?.args?.path ?? "?";
        return sub === "started" ? localize("stream.reading", pathArg) : localize("stream.readDone", pathArg);
      }
      if (tc?.writeToolCall) {
        const pathArg = tc.writeToolCall?.args?.path ?? "?";
        if (sub === "started") return localize("stream.writing", pathArg);
        const res = tc.writeToolCall?.result?.success;
        if (res && res.linesCreated != null) return localize("stream.writeDoneLines", pathArg, res.linesCreated);
        return localize("stream.writeDone", pathArg);
      }
      return sub === "started" ? localize("stream.toolStart") : localize("stream.toolOk");
    }
    if (t === "result" && sub === "success") {
      const dur = (ev as { duration_ms?: number }).duration_ms;
      return dur != null ? localize("stream.completedIn", (dur / 1000).toFixed(1)) : localize("stream.completed");
    }
  } catch {
    // not JSON (partial or other output)
  }
  return null;
}

function getAgentPath(): { exe: string; argsPrefix: string[]; addToPath?: string; useShell: boolean } | null {
  const isWin = process.platform === "win32";
  const candidates: string[] = [];

  if (isWin) {
    const localAppData = process.env.LOCALAPPDATA || "";
    const userProfile = process.env.USERPROFILE || "";
    if (localAppData) {
      candidates.push(path.join(localAppData, "cursor-agent"));
      const cursorBin = path.join(
        localAppData,
        "Programs",
        "Cursor",
        "resources",
        "app",
        "bin"
      );
      candidates.push(cursorBin);
    }
    if (userProfile) {
      candidates.push(path.join(userProfile, ".local", "bin"));
      candidates.push(path.join(userProfile, "AppData", "Local", "cursor", "bin"));
    }
  } else {
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
    if (!fs.existsSync(dir)) continue;
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
function getLanguageBlockTop(language: "en" | "pt" | "mixed"): string {
  const blocks: Record<"en" | "pt" | "mixed", string> = {
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
const LANGUAGE_INSTRUCTIONS: Record<"en" | "pt" | "mixed", string> = {
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
const MODEL_OPTIONS: { label: string; value: string }[] = [
  { label: localize("model.default"), value: MODEL_DEFAULT_SENTINEL },
  { label: localize("model.auto"), value: "auto" },
  { label: localize("model.opus"), value: "claude-4-6-opus" },
  { label: localize("model.sonnet46"), value: "claude-4-6-sonnet" },
  { label: localize("model.sonnet45"), value: "claude-4-5-sonnet" },
];
const CONFIG_REPO_LANGUAGE = "defaultContextGenerator.repoLanguage";
type RepoLanguage = "en" | "pt" | "mixed";

function getRepoLanguage(): RepoLanguage | "ask" {
  const v = vscode.workspace.getConfiguration().get<string>(CONFIG_REPO_LANGUAGE);
  if (v === "en" || v === "pt" || v === "mixed") return v;
  return "ask";
}
const AUTO_STATE_PREFIX = "dcg_auto_";

/** True if workspace already has docs/context/ or .cursor/rules/ with content (no need to auto-run). */
function hasContextInWorkspace(cwd: string): boolean {
  const contextDir = path.join(cwd, "docs", "context");
  if (fs.existsSync(contextDir) && fs.readdirSync(contextDir).length > 0) return true;
  const rulesDir = path.join(cwd, ".cursor", "rules");
  if (fs.existsSync(rulesDir) && fs.readdirSync(rulesDir).some((f) => f.endsWith(".mdc"))) return true;
  return false;
}

/** Core run: generate context with the given language. Used by both manual command and auto. */
async function runCore(
  folder: vscode.WorkspaceFolder,
  language: "en" | "pt" | "mixed",
  options: { silent?: boolean; promptOverride?: string; model?: string } = {}
): Promise<void> {
  const { silent = false, promptOverride, model } = options;
  const modelArg = (model === undefined || model === MODEL_DEFAULT_SENTINEL ? "" : model).trim();
  const basePrompt = promptOverride ?? getPromptFromConfig();
  const promptContent =
    getLanguageBlockTop(language) + basePrompt.trimEnd() + "\n\n" + LANGUAGE_INSTRUCTIONS[language];
  const cwd = folder.uri.fsPath;
  const cursorDir = path.join(cwd, ".cursor");
  const promptFileRel = ".cursor/.dcg-prompt.txt";
  const promptFilePath = path.join(cwd, ".cursor", ".dcg-prompt.txt");

  try {
    if (!fs.existsSync(cursorDir)) fs.mkdirSync(cursorDir, { recursive: true });
    fs.writeFileSync(promptFilePath, promptContent, "utf-8");
  } catch (e) {
    await vscode.window.showErrorMessage(localize("error.createPromptFile", e instanceof Error ? e.message : String(e)));
    return;
  }

  const prompt = `Execute exactly the instructions in this file. Read the file first, then follow it: ${promptFileRel}`;

  const outputChannel = vscode.window.createOutputChannel(localize("popup.title"));
  outputChannel.clear();
  outputChannel.show();
  outputChannel.appendLine(localize("output.generating", cwd));
  if (modelArg) outputChannel.appendLine(`Model: ${modelArg}`);
  if (silent) outputChannel.appendLine(localize("progress.auto"));
  outputChannel.appendLine(localize("output.promptAt", promptFilePath));
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

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: localize("popup.title"),
      cancellable: false,
    },
    async (progress) => {
      progress.report({ message: silent ? localize("progress.auto") : localize("progress.starting") });

        let stderrText = "";
        let stdoutBuffer = "";
        return new Promise<void>((resolve) => {
          const child = spawn(exe, args, {
            cwd,
            shell: useShell,
            env,
          });

          child.stdout?.on("data", (data: Buffer | string) => {
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
          child.stderr?.on("data", (data: Buffer | string) => {
            const s = data.toString();
            stderrText += s;
            outputChannel.append(s);
          });

          child.on("error", (err: Error) => {
            outputChannel.appendLine("");
            outputChannel.appendLine(localize("error.agent", err.message));
            outputChannel.appendLine("");
            outputChannel.appendLine(localize("error.agentInstallWin"));
            outputChannel.appendLine(localize("error.agentInstallPath"));
            vscode.window.showErrorMessage(localize("error.cliNotFound"));
            resolve();
          });

          child.on("close", (code: number | null, _signal: NodeJS.Signals | null) => {
            if (stdoutBuffer.trim()) {
              const formatted = formatStreamJsonLine(stdoutBuffer);
              if (formatted) outputChannel.appendLine(formatted);
            }
            outputChannel.appendLine("");
            progress.report({ message: localize("progress.done") });
            try {
              if (fs.existsSync(promptFilePath)) fs.unlinkSync(promptFilePath);
            } catch {
              // ignora falha ao remover arquivo temporário
            }
            if (code === 0) {
              const hasContext = fs.existsSync(path.join(cwd, "docs", "context")) && fs.readdirSync(path.join(cwd, "docs", "context")).length > 0;
              const hasRules = fs.existsSync(path.join(cwd, ".cursor", "rules")) && fs.readdirSync(path.join(cwd, ".cursor", "rules")).some((f) => f.endsWith(".mdc"));
              if (hasContext || hasRules) {
                if (!silent) vscode.window.showInformationMessage(localize("success.ready"));
              } else {
                const needsAuth = /Authentication required|CURSOR_API_KEY|agent login/i.test(stderrText);
                const msg = localize("warn.noOutput");
                if (needsAuth) {
                  vscode.window.showWarningMessage(msg, localize("action.login")).then((choice) => {
                    if (choice === localize("action.login")) {
                      void vscode.commands.executeCommand("defaultContextGenerator.agentLogin");
                    }
                  });
                } else {
                  vscode.window.showWarningMessage(msg);
                }
              }
            } else if (code != null && code !== 0) {
              const needsAuth = /Authentication required|CURSOR_API_KEY|agent login/i.test(stderrText);
              if (needsAuth) {
                vscode.window.showWarningMessage(localize("warn.noOutputLogin"), localize("action.login")).then((choice) => {
                  if (choice === localize("action.login")) {
                    void vscode.commands.executeCommand("defaultContextGenerator.agentLogin");
                  }
                });
              } else {
                vscode.window.showWarningMessage(localize("warn.exitCode", String(code)));
              }
            }
            resolve();
          });
        });
      }
    );
}

/** Manual command: use language param, config, or show language picker then run core. */
function runGerarContexto(promptOverride?: string) {
  return async (languageParam?: RepoLanguage) => {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
      await vscode.window.showErrorMessage(localize("error.openFolder"));
      return;
    }
    let language: RepoLanguage;
    if (languageParam) {
      language = languageParam;
    } else if (getRepoLanguage() !== "ask") {
      language = getRepoLanguage() as RepoLanguage;
    } else {
      const languageChoice = await vscode.window.showQuickPick(
        [
          { label: localize("language.english"), value: "en" as const },
          { label: localize("language.portuguese"), value: "pt" as const },
          { label: localize("language.mixed"), value: "mixed" as const },
        ],
        {
          title: localize("popup.title"),
          placeHolder: localize("language.pickTitle"),
          ignoreFocusOut: true,
        }
      );
      if (!languageChoice) return;
      language = languageChoice.value;
    }

    const configModel = vscode.workspace.getConfiguration().get<string>(CONFIG_MODEL, "").trim();
    const modelChoices = [
      ...MODEL_OPTIONS,
      ...(configModel ? [{ label: `${localize("model.useSetting")} (${configModel})`, value: configModel }] : []),
    ];
    const modelChoice = await vscode.window.showQuickPick(modelChoices, {
      title: localize("popup.title"),
      placeHolder: localize("model.pickTitle"),
      ignoreFocusOut: true,
    });
    if (!modelChoice) return;
    const selectedModel = modelChoice.value;

    await runCore(folder, language, { promptOverride, model: selectedModel });
  };
}

/** Run context generation automatically when workspace has no context, to avoid unnecessary manual runs and client usage. */
async function tryAutoRun(extensionContext: vscode.ExtensionContext): Promise<void> {
  const config = vscode.workspace.getConfiguration();
  const autoGenerate = config.get<boolean>(CONFIG_AUTO, false);
  if (!autoGenerate) return;

  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) return;

  const onlyWhenMissing = config.get<boolean>(CONFIG_AUTO_ONLY_WHEN_MISSING, true);
  if (onlyWhenMissing && hasContextInWorkspace(folder.uri.fsPath)) return;

  const stateKey = AUTO_STATE_PREFIX + folder.uri.fsPath;
  if (extensionContext.globalState.get(stateKey)) return;
  extensionContext.globalState.update(stateKey, Date.now());

  const lang = config.get<string>(CONFIG_AUTO_LANG, "en") as "en" | "pt" | "mixed";
  const model = config.get<string>(CONFIG_MODEL, "").trim();
  await runCore(folder, lang === "pt" || lang === "mixed" ? lang : "en", { silent: true, model: model || undefined });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getPopupHtml(defaultContent: string, configPath: string, repoLanguage: RepoLanguage | "ask", selectedModel: string = ""): string {
  const hasConfig = configPath.length > 0;
  const escapedDefault = escapeHtml(defaultContent);
  const escapedPath = escapeHtml(configPath || localize("popup.configNone"));
  const btnConfig = hasConfig ? localize("popup.btnConfigChange") : localize("popup.btnConfig");
  const langEn = escapeHtml(localize("language.english"));
  const langPt = escapeHtml(localize("language.portuguese"));
  const langMixed = escapeHtml(localize("language.mixed"));
  const repoLangLabel = escapeHtml(localize("popup.repoLanguageLabel"));
  const selected = repoLanguage === "ask" ? "en" : repoLanguage;
  const modelLabel = escapeHtml(localize("popup.modelLabel"));
  const modelSelected = selectedModel === "" ? MODEL_DEFAULT_SENTINEL : selectedModel;
  const modelOptionsHtml =
    MODEL_OPTIONS.map(
      (o) => `<option value="${escapeHtml(o.value)}" ${o.value === modelSelected ? "selected" : ""}>${escapeHtml(o.label)}</option>`
    ).join("") +
    (selectedModel && selectedModel !== MODEL_DEFAULT_SENTINEL && !MODEL_OPTIONS.some((o) => o.value === selectedModel)
      ? `<option value="${escapeHtml(selectedModel)}" selected>${escapeHtml(localize("model.useSetting"))} (${escapeHtml(selectedModel)})</option>`
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
  <h2>${escapeHtml(localize("popup.title"))}</h2>
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
    <button id="btnGerar">${escapeHtml(localize("popup.btnGenerate"))}</button>
    <button id="btnConfig" class="secondary">${escapeHtml(btnConfig)}</button>
    <button id="btnAbrirChat" class="secondary">${escapeHtml(localize("popup.btnChat"))}</button>
    <button id="btnAgentLogin" class="secondary">${escapeHtml(localize("popup.btnAgentLogin"))}</button>
  </div>
  <div class="config-section">
    <label>${escapeHtml(localize("popup.configLabel"))}</label>
    <div class="config-path" id="configPath">${escapedPath}</div>
    ${!hasConfig ? `<label style="margin-top:8px">${escapeHtml(localize("popup.promptLabel"))}</label><pre id="defaultPre">${escapedDefault}</pre>` : ""}
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

function showPopup(context: vscode.ExtensionContext): () => Promise<void> {
  return async () => {
    const configPath = getConfigPath();
    const defaultContent = getDefaultConfigContent();
    const panel = vscode.window.createWebviewPanel(
      "defaultContextGenerator.popup",
      localize("popup.title"),
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    const configModel = vscode.workspace.getConfiguration().get<string>(CONFIG_MODEL, "").trim();
    panel.webview.html = getPopupHtml(defaultContent, configPath, getRepoLanguage(), configModel);

    panel.webview.onDidReceiveMessage(
      async (msg: { type: string; language?: string; model?: string }) => {
        if (msg.type === "gerar") {
          const folder = vscode.workspace.workspaceFolders?.[0];
          if (!folder) {
            await vscode.window.showErrorMessage(localize("error.openFolder"));
            return;
          }
          panel.dispose();
          const lang = msg.language === "pt" || msg.language === "mixed" ? msg.language : "en";
          const rawModel = (msg.model ?? "").trim();
          const model = rawModel === "" || rawModel === MODEL_DEFAULT_SENTINEL ? undefined : rawModel;
          await runCore(folder, lang, { model });
        } else if (msg.type === "apontarOuCriarConfig") {
          await vscode.commands.executeCommand("defaultContextGenerator.apontarOuCriarConfig");
          const newPath = getConfigPath();
          const configModel = vscode.workspace.getConfiguration().get<string>(CONFIG_MODEL, "").trim();
          panel.webview.html = getPopupHtml(getDefaultConfigContent(), newPath, getRepoLanguage(), configModel);
        } else if (msg.type === "abrirNoChat") {
          await vscode.commands.executeCommand("defaultContextGenerator.abrirNoChat");
        } else if (msg.type === "agentLogin") {
          await vscode.commands.executeCommand("defaultContextGenerator.agentLogin");
        }
      },
      undefined,
      context.subscriptions
    );
  };
}

async function apontarOuCriarConfig() {
  const folder = vscode.workspace.workspaceFolders?.[0];
  const choice = await vscode.window.showQuickPick(
    [
      { label: localize("config.createNew"), value: "create" },
      { label: localize("config.pointExisting"), value: "existing" },
    ],
    { title: localize("popup.title") + ": " + localize("popup.configLabel"), placeHolder: localize("config.pickOption") }
  );
  if (!choice) return;

  if (choice.value === "existing") {
    const chosen = await vscode.window.showOpenDialog({
      defaultUri: folder?.uri,
      filters: { [localize("config.filterText")]: ["txt"], [localize("config.filterJson")]: ["json"] },
      title: localize("config.dialogTitleOpen"),
    });
    if (!chosen?.[0]) return;
    const p = chosen[0].fsPath;
    const relative = folder && p.startsWith(folder.uri.fsPath)
      ? path.relative(folder.uri.fsPath, p)
      : p;
    await setConfigPath(relative);
    await vscode.window.showInformationMessage(localize("config.saved", relative));
    const doc = await vscode.workspace.openTextDocument(chosen[0]);
    await vscode.window.showTextDocument(doc);
    return;
  }

  const defaultUri = folder ? vscode.Uri.joinPath(folder.uri, ".cursor", "default-context-prompt.txt") : undefined;
  const chosen = await vscode.window.showSaveDialog({
    defaultUri,
    filters: { [localize("config.filterText")]: ["txt"], [localize("config.filterJson")]: ["json"] },
    title: localize("config.dialogTitleSave"),
  });
  if (!chosen) return;
  const p = chosen.fsPath;
  const content = getDefaultConfigContent();
  const isJson = chosen.path.endsWith(".json");
  const toWrite = isJson ? JSON.stringify({ prompt: content }, null, 2) : content;
  try {
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, toWrite, "utf-8");
  } catch (e) {
    await vscode.window.showErrorMessage(localize("error.writeFile", e instanceof Error ? e.message : String(e)));
    return;
  }
  const relative = folder && p.startsWith(folder.uri.fsPath)
    ? path.relative(folder.uri.fsPath, p)
    : p;
  await setConfigPath(relative);
  await vscode.window.showInformationMessage(localize("config.savedPath", relative));
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
    } catch {
      // tenta o próximo
    }
  }
  await vscode.window.showInformationMessage(localize("chat.copied"));
}

function agentLogin() {
  const agentRes = getAgentPath();
  const env = agentRes?.addToPath
    ? { ...process.env, PATH: agentRes.addToPath + path.delimiter + (process.env.PATH || "") }
    : process.env;
  const term = vscode.window.createTerminal({
    name: "Cursor CLI Login",
    env: env as { [key: string]: string },
  });
  term.sendText("agent login");
  term.show();
  vscode.window.showInformationMessage(localize("login.terminalOpened"));
}

export function activate(context: vscode.ExtensionContext) {
  void ensureDefaultConfigFile();

  // Auto-run when workspace has no context (after short delay), to avoid unnecessary client usage
  setTimeout(() => {
    tryAutoRun(context).catch(() => {});
  }, 4000);

  context.subscriptions.push(
    vscode.commands.registerCommand("defaultContextGenerator.showPopup", showPopup(context))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "defaultContextGenerator.gerarContexto",
      (language?: RepoLanguage) => runGerarContexto()(language)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("defaultContextGenerator.apontarOuCriarConfig", apontarOuCriarConfig)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("defaultContextGenerator.abrirNoChat", abrirNoChat)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("defaultContextGenerator.agentLogin", agentLogin)
  );

  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = "$(sparkle) " + localize("statusBar.text");
  statusBarItem.tooltip = localize("statusBar.tooltip");
  statusBarItem.command = "defaultContextGenerator.showPopup";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
}

export function deactivate() {}
