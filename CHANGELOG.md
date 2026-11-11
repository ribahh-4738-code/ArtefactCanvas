# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

## [Unreleased]

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

[Unreleased]: https://github.com/ribahh-4738-code/ArtefactCanvas/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ribahh-4738-code/ArtefactCanvas/releases/tag/v0.1.0
