# Passo a passo para publicar a extensão

## 1. Antes de publicar

- [ ] **Repositório no GitHub** (se ainda não tiver): crie o repo e dê push do código. O `package.json` já tem `repository.url` apontando para o seu fork/repo.
- [ ] **Ajustar `package.json`** (se quiser):
  - `publisher`: hoje está `"defaultcontextgenerator"`. No **VS Code Marketplace** você precisa criar um *publisher* com esse nome (ou trocar para seu usuário, ex.: `"elenotrindade"`). No **Open VSX** o publisher costuma ser seu nome de usuário.
  - `version`: está `0.2.0`. Para cada nova publicação, suba a versão (ex.: `0.2.1`).
- [ ] **Compilar e gerar o .vsix** (teste local):
  ```bash
  npm install
  npm run package
  ```
  Deve gerar `default-context-generator-0.2.0.vsix` na raiz. Teste instalando via **Extensions → ... → Install from VSIX**.

---

## 2. Publicar no Open VSX (recomendado para Cursor)

O Cursor usa o Open VSX; muitas pessoas instalam extensões de lá.

1. **Criar conta:** [open-vsx.org](https://open-vsx.org) → Sign in (GitHub, etc.).
2. **Criar token de acesso:** no Open VSX, em **User Settings → Access Tokens**, crie um token e guarde (ele é mostrado só uma vez).
3. **Na pasta do projeto:**
   ```bash
   npx @vscode/vsce login open-vsx
   ```
   Quando pedir, use seu **nome de usuário do Open VSX** e o **token** como senha.
4. **Publicar:**
   ```bash
   npx @vscode/vsce publish -p <SEU_TOKEN>
   ```
   Ou, se já fez login e o vsce guardou:
   ```bash
   npx @vscode/vsce publish
   ```
5. **Conferir:** em [open-vsx.org](https://open-vsx.org) procure por "Default Context Generator". Qualquer um poderá instalar pela busca de extensões no Cursor (se o Cursor estiver configurado para usar o Open VSX).

**Nota:** O `publisher` no `package.json` deve coincidir com um namespace que você tenha no Open VSX (em geral seu username). Se o publisher for `defaultcontextgenerator`, crie esse namespace no Open VSX ou mude no `package.json` para seu username.

---

## 3. Publicar no VS Code Marketplace

Quem usa VS Code (ou Cursor apontando ao Marketplace) verá a extensão na busca.

1. **Criar publisher:** [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage) → **Create Publisher**. Escolha um ID (ex.: `defaultcontextgenerator` ou seu usuário) e aceite os termos.
2. **Login:**
   ```bash
   npx @vscode/vsce login defaultcontextgenerator
   ```
   (Use o **ID do publisher** que você criou.) Abre o navegador para autenticar.
3. **Publicar:**
   ```bash
   npx @vscode/vsce publish
   ```
4. **Conferir:** [marketplace.visualstudio.com](https://marketplace.visualstudio.com) → procure "Default Context Generator".

---

## 4. Depois de publicar

- **Instalação:** usuários podem buscar "Default Context Generator" nas extensões (Cursor ou VS Code) e instalar.
- **Atualizações:** altere a `version` no `package.json`, rode de novo `npm run package` e `npx @vscode/vsce publish` (e `-p <token>` no Open VSX se usar token).
- O repositório continua público para quem quiser contribuir ou instalar via **Install from VSIX**; você não precisa divulgar, só deixar disponível.

---

## Resumo rápido (Open VSX)

```bash
cd d:\dev2\defaultcontextgenerator
npm install
npm run package
npx @vscode/vsce login open-vsx
npx @vscode/vsce publish -p <TOKEN>
```

Subir a versão no `package.json` antes de cada nova publicação.
