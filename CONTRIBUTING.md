# Contributing

This project is **open source (MIT)**. The extension is published so anyone using Cursor can install it; the repo is public for contributions and transparency.

## Internationalization (i18n)

- **Primary language: English.** Secondary: **Portuguese.**
- When adding or editing user-facing content, docs, rules, or skills: write in **English** first; add or update **Portuguese** where applicable.
- Extension strings: `package.nls.json` (en), `package.nls.pt.json` (pt), and `src/nls.ts` (en/pt). Keep keys in sync.
- See [.cursor/rules/i18n.mdc](.cursor/rules/i18n.mdc) for the full i18n policy.

## How to contribute

1. **Translations:** Prefer adding or completing **Portuguese** translations for existing English content (rules, skills, README, extension nls).
2. **Code:** Follow the rules in `.cursor/rules/` (especially `extension-typescript.mdc` for `src/`, `projeto-contexto.mdc` for context).
3. **Docs:** Keep `docs/context/`, README, and PROJECT_IDEA in sync with code and `.cursor/`.

## Publishing

The maintainer publishes the extension to the marketplace so it can be installed by anyone. The project is not actively promoted; the repository remains available for those who find it and want to contribute or fork.
