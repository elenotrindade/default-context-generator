# Default Context Generator

**Código aberto (MIT).** A extensão é publicada para que qualquer pessoa possa instalá-la pela marketplace; o repositório é público para contribuições e transparência. (Sem divulgação — apenas disponível para quem encontrar.)

**Internacionalização:** idioma principal **inglês**, secundário **português**. A UI da extensão e o manifest seguem o idioma do editor; ver [.cursor/rules/i18n.mdc](.cursor/rules/i18n.mdc) e [CONTRIBUTING.md](CONTRIBUTING.md).  
[English](README.md)

---

Automação que roda **dentro do Cursor** (o agente executa o fluxo) para gerar **contexto**, **rules**, **boas práticas** e **skills** em repositórios Git:

- **Setup de novos projetos** — deixar o repo pronto com regras e documentação de contexto.
- **Adentrar projetos existentes** — extrair e documentar o sistema por áreas, com base no código e nas tecnologias usadas.

O núcleo são **skills e rules**: o Cursor analisa o repo e escreve os arquivos em `.cursor/` e `docs/`. Não é obrigatório ter um CLI; a lógica fica em Markdown, fácil de evoluir.

**Extensão:** comando "Default Context Generator: Gerar contexto do projeto" — copia o prompt para a área de transferência e tenta abrir o chat; você cola (Ctrl+V) e envia.

## Documentação da ideia

A visão do projeto, Cursor como executor, o que a automação gera e a ordem de construção estão em **[PROJECT_IDEA.md](./PROJECT_IDEA.md)**.

## Ordem de construção

1. **Skills** — skills do próprio gerador (analisar repo, escrever rules, documentação de contexto).
2. **Pegar contexto** — fluxo/instruções para o Cursor analisar o repo e gerar documentação por áreas.
3. **Automação** — orquestração via rules + skills (e depois, opcionalmente, comando da extensão).

## Skills

- **Orquestração:** `default-context-generator` — fluxo completo (interpretar doc existente → analisar → contexto → rules → skills).
- **Domínio:** `software-architecture`, `system-design`, `backend`, `frontend`, `ux-ui`, `devops`, `security`, `marketing`, `testing`, `data-database`, `technical-docs`, `accessibility`, `performance`.

Todas em `.cursor/skills/<nome>/SKILL.md`. **Nomes de pastas em inglês** (como `technical-docs`, `software-architecture`) para o Cursor carregar as skills corretamente, mesmo com documentação em português.

## Estrutura

```
defaultcontextgenerator/
├── PROJECT_IDEA.md
├── README.md
├── package.json, src/, out/   # Extensão Cursor/VS Code
├── .cursor/
│   ├── rules/         # gerar-contexto, projeto-contexto, extension-typescript, i18n, context-docs
│   └── skills/        # default-context-generator + 13 skills de domínio
└── docs/
    └── context/       # Contexto deste repo (README + extension, skills-e-rules, technical-docs)
```

## Uso

- **Pelo chat:** abrir um repo no Cursor e pedir "gera o contexto deste projeto" (com as skills deste repo ou o prompt abaixo).
- **Pela extensão:** botão **"Gerar contexto"** na **status bar** (canto inferior direito) ou Ctrl+Shift+P → "Default Context Generator: Gerar contexto do projeto". O **Cursor CLI** roda em modo headless no workspace aberto e gera `docs/context/` e `.cursor/rules/` — 1 botão → ambiente pronto. (Requer [Cursor CLI](https://cursor.com/docs/cli/installation) instalado.)

### Pré-requisito: Cursor CLI

A extensão dispara o comando `agent -p --force` no workspace. Instale o Cursor CLI se ainda não tiver:

- **Windows (PowerShell):** `irm 'https://cursor.com/install?win32=true' | iex`
- **macOS/Linux:** `curl https://cursor.com/install -fsS | bash`

Ver [Instalação do Cursor CLI](https://cursor.com/docs/cli/installation).

### Instalar e usar no seu Cursor

O **Cursor** não usa a busca do VS Code Marketplace (ele usa o Open VSX). Por isso o jeito mais simples é instalar pelo **.vsix**:

**Opção A — Instalar pelo .vsix (recomendado no Cursor)**

1. Baixe a extensão: **[VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=elenotrindade.default-context-generator)** → à direita, em **Resources**, clique em **Download Extension** (salva um `.vsix`).  
   Ou use um [release no GitHub](https://github.com/elenotrindade/default-context-generator/releases) se houver.
2. No Cursor: **Extensões** (Ctrl+Shift+X) → **"..."** (no topo do painel) → **Install from VSIX...** → escolha o `.vsix` baixado.
3. Reinicie o Cursor se pedir. O botão **"Gerar contexto"** na status bar (canto inferior direito) e o comando **Default Context Generator: Gerar contexto do projeto** ficam disponíveis.

**Opção B — VS Code**

No VS Code você pode buscar **Default Context Generator** em Extensões (Ctrl+Shift+X) e instalar pela marketplace.

**Opção C — Desenvolvimento (F5)**

- **F5** (Run > Start Debugging) abre uma janela de desenvolvimento com a extensão carregada, para testar sem instalar.

**Publicação** (para mantenedores): ver [PUBLISHING.md](PUBLISHING.md). Para a extensão aparecer na busca do Cursor, é preciso publicar no [Open VSX](https://open-vsx.org) (conta Eclipse Foundation necessária).

---

Depois de instalar: abra um repositório, use **"Gerar contexto"** na status bar ou **Ctrl+Shift+P** → "Default Context Generator: Gerar contexto do projeto". A saída do agente aparece no painel **"Default Context Generator"**; ao terminar, **"Ambiente pronto!"** indica que `docs/context/` e `.cursor/rules/` foram gerados.

Para o agente seguir o workflow completo (skills de domínio e interpretação de doc existente), copie a pasta `.cursor/skills/` (e opcionalmente `.cursor/rules/gerar-contexto.mdc`) para o repositório em que você quer gerar contexto, ou deixe este repo aberto em um multi-root workspace.
