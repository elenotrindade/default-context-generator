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
exports.localize = localize;
/**
 * Localization: primary English, secondary Portuguese.
 * Keys are shared; bundle is chosen by vscode.env.language (e.g. "en", "pt").
 */
const vscode = __importStar(require("vscode"));
const messages = {
    en: {
        "error.openFolder": "Default Context Generator: open a folder (workspace) to generate context.",
        "error.createPromptFile": "Default Context Generator: could not create prompt file: {0}",
        "output.generating": "Generating context in: {0}",
        "output.promptAt": "Prompt at: {0}",
        "progress.starting": "Starting Cursor agent...",
        "progress.done": "Done",
        "progress.auto": "Generating context automatically (none found)...",
        "stream.session": "[Session] {0} started.",
        "stream.reading": "  → Reading: {0}",
        "stream.readDone": "  ✓ Read: {0}",
        "stream.writing": "  → Writing: {0}",
        "stream.writeDone": "  ✓ Written: {0}",
        "stream.writeDoneLines": "  ✓ Written: {0} ({1} lines)",
        "stream.toolStart": "  → Tool...",
        "stream.toolOk": "  ✓ OK",
        "stream.completed": "[Completed]",
        "stream.completedIn": "[Completed] in {0}s",
        "error.agent": "Error: {0}",
        "error.agentInstallWin": "On Windows: install Cursor CLI (PowerShell): irm 'https://cursor.com/install?win32=true' | iex",
        "error.agentInstallPath": "Or in Cursor: Ctrl+Shift+P → \"Install 'cursor' command in PATH\" and restart Cursor.",
        "error.cliNotFound": "Default Context Generator: Cursor CLI not found. In Cursor: Ctrl+Shift+P → \"Install 'cursor' command in PATH\" and restart. Or install: irm 'https://cursor.com/install?win32=true' | iex (PowerShell).",
        "success.ready": "Environment ready! Context in docs/context/, rules in .cursor/rules/, skills in .cursor/skills/.",
        "warn.noOutput": "Default Context Generator: process finished but docs/context/, .cursor/rules/, and .cursor/skills/ were not created. Check the \"Default Context Generator\" panel and ensure Cursor CLI is installed and the prompt was applied.",
        "warn.noOutputLogin": "Default Context Generator: authentication required. Log in to Cursor CLI to generate context.",
        "action.login": "Log in",
        "warn.exitCode": "Default Context Generator finished with exit code {0}. Check the \"Default Context Generator\" panel for details.",
        "popup.title": "Default Context Generator",
        "popup.btnGenerate": "Generate context",
        "popup.btnConfig": "Set or create config file",
        "popup.btnConfigChange": "Change config file",
        "popup.btnRestoreDefault": "Restore default prompt",
        "popup.btnChat": "Open in chat",
        "popup.btnAgentLogin": "Log in to Cursor CLI",
        "popup.configLabel": "Current config",
        "popup.configNone": "(none)",
        "popup.promptLabel": "Default prompt (use the button above to create/edit a file):",
        "config.pickOption": "Choose an option",
        "config.createNew": "Create new config file",
        "config.pointExisting": "Point to existing file",
        "config.dialogTitleOpen": "Choose config file (prompt)",
        "config.dialogTitleSave": "Create config file (prompt)",
        "config.filterText": "Text files",
        "config.filterJson": "JSON",
        "config.saved": "Config set to {0}. Edit the file to customize the prompt.",
        "config.savedPath": "Config saved to {0}. You can edit the file to customize the prompt.",
        "resetDefaultPrompt.success": "Default prompt updated in {0}. Next run will use the extension prompt (docs/context/ + rules).",
        "error.writeFile": "Default Context Generator: could not write file: {0}",
        "chat.copied": "Default Context Generator: prompt copied to clipboard. Paste in chat (Ctrl+V) and send.",
        "login.terminalOpened": "Default Context Generator: terminal opened. Complete Cursor CLI login and try generating context again.",
        "statusBar.text": "Generate context",
        "statusBar.tooltip": "Default Context Generator: open panel to generate context or configure prompt",
        "language.pickTitle": "Repository language (for generated docs and rules)",
        "language.english": "English",
        "language.portuguese": "Portuguese",
        "language.mixed": "Mixed (large legacy codebases)",
        "language.ask": "Ask every time",
        "popup.repoLanguageLabel": "Repository language",
        "model.pickTitle": "Agent model (fewer tokens = lower usage)",
        "model.default": "Default (Cursor default)",
        "model.auto": "Auto",
        "model.opus": "Claude 4.6 Opus (Thinking)",
        "model.sonnet46": "Claude 4.6 Sonnet",
        "model.sonnet45": "Claude 4.5 Sonnet",
        "model.useSetting": "Use setting (defaultContextGenerator.model)",
        "popup.modelLabel": "Agent model",
    },
    pt: {
        "error.openFolder": "Default Context Generator: abra uma pasta (workspace) para gerar o contexto.",
        "error.createPromptFile": "Default Context Generator: não foi possível criar o arquivo do prompt: {0}",
        "output.generating": "Gerando contexto em: {0}",
        "output.promptAt": "Prompt em: {0}",
        "progress.starting": "Iniciando agente Cursor...",
        "progress.done": "Concluído",
        "progress.auto": "Gerando contexto automaticamente (nenhum encontrado)...",
        "stream.session": "[Sessão] {0} iniciado.",
        "stream.reading": "  → Lendo: {0}",
        "stream.readDone": "  ✓ Lido: {0}",
        "stream.writing": "  → Escrevendo: {0}",
        "stream.writeDone": "  ✓ Escrito: {0}",
        "stream.writeDoneLines": "  ✓ Escrito: {0} ({1} linhas)",
        "stream.toolStart": "  → Ferramenta...",
        "stream.toolOk": "  ✓ OK",
        "stream.completed": "[Concluído]",
        "stream.completedIn": "[Concluído] em {0}s",
        "error.agent": "Erro: {0}",
        "error.agentInstallWin": "No Windows: instale o Cursor CLI (PowerShell): irm 'https://cursor.com/install?win32=true' | iex",
        "error.agentInstallPath": "Ou no Cursor: Ctrl+Shift+P → \"Install 'cursor' command in PATH\" e reinicie o Cursor.",
        "error.cliNotFound": "Default Context Generator: Cursor CLI não encontrado. No Cursor: Ctrl+Shift+P → \"Install 'cursor' command in PATH\" e reinicie. Ou instale: irm 'https://cursor.com/install?win32=true' | iex (PowerShell).",
        "success.ready": "Ambiente pronto! Contexto em docs/context/, regras em .cursor/rules/, skills em .cursor/skills/.",
        "warn.noOutput": "Default Context Generator: processo finalizou, mas docs/context/, .cursor/rules/ e .cursor/skills/ não foram criados. Veja o painel \"Default Context Generator\" e confira se o Cursor CLI está instalado e o prompt foi aplicado.",
        "warn.noOutputLogin": "Default Context Generator: autenticação necessária. Faça login no Cursor CLI para gerar contexto.",
        "action.login": "Fazer login",
        "warn.exitCode": "Default Context Generator terminou com código {0}. Veja o painel \"Default Context Generator\" para detalhes.",
        "popup.title": "Default Context Generator",
        "popup.btnGenerate": "Gerar contexto",
        "popup.btnConfig": "Definir ou criar arquivo de configuração",
        "popup.btnConfigChange": "Alterar arquivo de configuração",
        "popup.btnRestoreDefault": "Restaurar prompt padrão",
        "popup.btnChat": "Abrir no chat",
        "popup.btnAgentLogin": "Fazer login no Cursor CLI",
        "popup.configLabel": "Configuração atual",
        "popup.configNone": "(nenhum)",
        "popup.promptLabel": "Prompt padrão (use o botão acima para criar/editar um arquivo):",
        "config.pickOption": "Escolha uma opção",
        "config.createNew": "Criar novo arquivo de configuração",
        "config.pointExisting": "Apontar para arquivo existente",
        "config.dialogTitleOpen": "Escolher arquivo de configuração (prompt)",
        "config.dialogTitleSave": "Criar arquivo de configuração (prompt)",
        "config.filterText": "Arquivos de texto",
        "config.filterJson": "JSON",
        "config.saved": "Configuração apontando para {0}. Edite o arquivo para customizar o prompt.",
        "config.savedPath": "Configuração salva em {0}. Você pode editar o arquivo para customizar o prompt.",
        "resetDefaultPrompt.success": "Prompt padrão atualizado em {0}. A próxima execução usará o prompt da extensão (docs/context/ + rules).",
        "error.writeFile": "Default Context Generator: não foi possível escrever o arquivo: {0}",
        "chat.copied": "Default Context Generator: prompt copiado para a área de transferência. Cole no chat (Ctrl+V) e envie.",
        "login.terminalOpened": "Default Context Generator: terminal aberto. Conclua o login no Cursor CLI e tente gerar contexto novamente.",
        "statusBar.text": "Gerar contexto",
        "statusBar.tooltip": "Default Context Generator: abrir painel para gerar contexto ou configurar o prompt",
        "language.pickTitle": "Idioma do repositório (para docs e regras gerados)",
        "language.english": "Inglês",
        "language.portuguese": "Português",
        "language.mixed": "Misto (bases de código legadas grandes)",
        "language.ask": "Perguntar sempre",
        "popup.repoLanguageLabel": "Idioma do repositório",
        "model.pickTitle": "Modelo do agente (menos tokens = menor uso)",
        "model.default": "Padrão (Cursor padrão)",
        "model.auto": "Auto",
        "model.opus": "Claude 4.6 Opus (Thinking)",
        "model.sonnet46": "Claude 4.6 Sonnet",
        "model.sonnet45": "Claude 4.5 Sonnet",
        "model.useSetting": "Usar configuração (defaultContextGenerator.model)",
        "popup.modelLabel": "Modelo do agente",
    },
};
function getLocale() {
    const lang = vscode.env.language;
    if (lang.startsWith("pt"))
        return "pt";
    return "en";
}
function format(template, ...args) {
    return template.replace(/\{(\d+)\}/g, (_, i) => String(args[Number(i)] ?? ""));
}
function localize(key, ...args) {
    const locale = getLocale();
    const bundle = messages[locale] ?? messages.en;
    const template = bundle[key] ?? messages.en[key] ?? key;
    return args.length > 0 ? format(template, ...args) : template;
}
//# sourceMappingURL=nls.js.map