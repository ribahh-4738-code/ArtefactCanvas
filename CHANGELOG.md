# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

## [Unreleased]

## [0.4.0] — 2026-11-12

### Adicionado

- Integração White Grid: `POST /api/integrations/white-grid/tasks` cria task **Next** no projeto "White Grid" com título `ver: …`

### Alterado

- Seletor de projeto no chrome: label à esquerda (abaixo de Artefact Canvas); ▾ e `+` à direita sob a nav INSTITUTO
- `+` cria tarefa em Today; ▾ troca/cria projetos (padrão Time to Think)
- Removidos seletor de empresa, título/projeto no content e `+` ao lado de Today — content começa em Artefato

## [0.3.0] — 2026-11-11

### Alterado

- Chrome full-bleed com `InstitutoAppChrome` (produto + INSTITUTO fora do `main` max-w); tipografia com sombra no padrão Time to Think
- Navegação entre ferramentas na mesma aba (`target="_self"` via tool-shell)

## [0.2.0] — 2026-11-11

### Adicionado

- Barra INSTITUTO via `@instituto/tool-shell` (Artefact Canvas ativo; links para as demais ferramentas)

## [0.1.0] — 2026-11-11

### Adicionado

- Scaffold Artefact Canvas (Node/TS + Prisma/Postgres + React/Vite/Tailwind)
- Scripts `index.sh`, `reset.sh`, `stop.sh` e Docker Postgres (`artefactcanvas-db` :5435)
- Modelos Company, Project, Task (`instructions`, status `IN_DEVELOPMENT` | `NEXT` | `DONE`)
- API: `/api/health`, `/api/companies`, `/api/projects` (dashboard + last-opened), `/api/tasks` (+ `/batch`, move, demote, delete)
- Dashboard: seletor empresa/projeto no header; **Today** (destaque) / **Next** / **Done**
- Instructions por task (abertas no destaque; ícone em Next/Done)
- Inserção em lote via textarea em Next e Done; campo “Data anterior” em Done
- Edição de título, exclusão de task e edição da data de conclusão
- Tipografia fluida (`clamp`) e identidade visual glass (`--ac-*`, Manrope)
- Seed White Grid (`___ Instituto`)

[Unreleased]: https://github.com/ribahh-4738-code/ArtefactCanvas/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/ribahh-4738-code/ArtefactCanvas/releases/tag/v0.4.0
[0.3.0]: https://github.com/ribahh-4738-code/ArtefactCanvas/releases/tag/v0.3.0
[0.2.0]: https://github.com/ribahh-4738-code/ArtefactCanvas/releases/tag/v0.2.0
[0.1.0]: https://github.com/ribahh-4738-code/ArtefactCanvas/releases/tag/v0.1.0
