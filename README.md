# Artefact Canvas

Gerenciador de projetos por empresa — dashboard com **Today** (1 destaque), **Next**, **Done** e Instructions por task.

## Requisitos

- Node.js 20+
- Docker (PostgreSQL)
- npm

## Início rápido

```bash
chmod +x index.sh stop.sh reset.sh
./index.sh
```

- App: http://localhost:5175
- API: http://localhost:3089/api/health

## Scripts

| Script | Descrição |
|--------|-----------|
| `./index.sh` | Para processos locais, sobe Postgres, Prisma, seed, API e frontend |
| `./stop.sh` | Encerra API e frontend |
| `./reset.sh` | Reinicia via `index.sh` |

## Portas

| Serviço | Porta |
|---------|-------|
| Frontend (Vite) | 5175 |
| API | 3089 |
| PostgreSQL (host) | 5435 |

## Arquitetura

```
backend/     Express + TypeScript + Prisma (rotas / services)
frontend/    React + TypeScript + Vite + Tailwind
MDs/         Planos e decisões
```

- Rotas API: `/api/health`, `/api/companies`, `/api/projects`, `/api/tasks` (+ `/batch`)
- Sem autenticação no v1 (ferramenta local)
- Identidade visual alinhada ao Time To Think (glass escuro, Manrope)

## Dashboard

- Abre sempre no último projeto aberto (`Project.lastOpenedAt`)
- Clique no nome do projeto → lista projetos da empresa; `+` à direita cria projeto
- Clique no nome da empresa → lista empresas; `+` à esquerda cria empresa
- Metadados **Artefato / Iniciativa / Aposta** (edit in place com duplo clique)
- **Today**: única task em destaque (`IN_DEVELOPMENT`) com Instructions abertas; `+` promove nova e demove a atual para Next
- **Next**: fila com ↑/↓ (↑ no topo promove); `+` textarea em lote (uma task por linha)
- **Done**: agrupado por data; `+` textarea em lote; campo “Data anterior” para datas sem grupo; desmarcar volta para Next
- Instructions por task; ícone de documento em Next/Done quando há texto
- Títulos editáveis (duplo clique) em Today, Next e Done
- Exclusão de task (ícone lixeira, com confirmação)
- Em Done, data de conclusão editável por task (move entre grupos)
- Tipografia fluida (`clamp`) conforme a largura da tela

Seed padrão: empresa `___ Instituto`, projeto `White Grid`.

## Planos

Rascunhos e planos em [`MDs/`](MDs/).

## Changelog

Ver [`CHANGELOG.md`](CHANGELOG.md).

## Workflow

Aguarde testes locais antes de commit, tag e push. Atualize README e CHANGELOG; planos ficam em `MDs/`.
