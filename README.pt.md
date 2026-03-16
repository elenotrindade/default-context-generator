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
- **Domínio:** `arquiteto-software`, `system-design`, `backend`, `frontend`, `ux-ui`, `devops`, `seguranca`, `marketing`, `testing`, `data-database`, `docs-tecnico`, `acessibilidade`, `performance`.

Todas em `.cursor/skills/<nome>/SKILL.md`.

## Estrutura

```
defaultcontextgenerator/
├── PROJECT_IDEA.md
├── README.md
├── package.json, src/, out/   # Extensão Cursor/VS Code
├── .cursor/
│   ├── rules/         # gerar-contexto, projeto-contexto, extension-typescript, i18n
│   └── skills/        # default-context-generator + 13 skills de domínio
└── docs/
    └── context/       # Contexto deste repo (README + extension, skills-e-rules, docs-tecnico)
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

**Opção A — Instalar pela loja (recomendado)**

1. No Cursor: **Extensões** (Ctrl+Shift+X).
2. Busque por **Default Context Generator**.
3. Clique em **Instalar**. A extensão está publicada no [Open VSX](https://open-vsx.org) (e opcionalmente no VS Code Marketplace).
4. Reinicie o Cursor se pedir. O botão **"Gerar contexto"** na status bar (canto inferior direito) e o comando **"Default Context Generator: Gerar contexto do projeto"** ficam disponíveis em qualquer workspace.

**Opção B — Instalar pelo .vsix** (ex.: build a partir do código ou instalação offline)

1. Obtenha um arquivo `.vsix` (por um [release](https://github.com/elenotrindade/default-context-generator/releases) ou build: `npm install && npm run package` neste repo).
2. No Cursor: **Extensões** (Ctrl+Shift+X) → **"..."** → **Install from VSIX...** → selecione o `.vsix`.

**Opção C — Desenvolvimento (F5)**

- **F5** (Run > Start Debugging) abre uma janela de desenvolvimento com a extensão carregada, para testar sem instalar.

**Publicação** (para mantenedores): ver [PUBLISHING.md](PUBLISHING.md).

---

Depois de instalar: abra um repositório, use **"Gerar contexto"** na status bar ou **Ctrl+Shift+P** → "Default Context Generator: Gerar contexto do projeto". A saída do agente aparece no painel **"Default Context Generator"**; ao terminar, **"Ambiente pronto!"** indica que `docs/context/` e `.cursor/rules/` foram gerados.

Para o agente seguir o workflow completo (skills de domínio e interpretação de doc existente), copie a pasta `.cursor/skills/` (e opcionalmente `.cursor/rules/gerar-contexto.mdc`) para o repositório em que você quer gerar contexto, ou deixe este repo aberto em um multi-root workspace.
