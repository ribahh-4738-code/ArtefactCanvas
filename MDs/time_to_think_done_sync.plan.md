# Sync Done → Time To Think (v0.5.0)

Status: implementado.

## Objetivo

Histórico de tasks **Done** no Time To Think, uma timeline por projeto (**AC: [nome]**), mantida atualizada. Sem campos novos no TT.

## Comportamento

- Ao marcar Done / criar Done em lote / editar título, Instructions ou data de Done → upsert no TT
- Ao desmarcar Done ou excluir task Done → remove o momento no TT
- Ao renomear projeto → atualiza o título da timeline
- Boot + `POST /api/integrations/time-to-think/sync-done` → backfill idempotente

## Config

`TIME_TO_THINK_API_URL` (padrão `http://localhost:3088`).

## Contrato TT

Ver plano irmão em Time To Think: `MDs/artefact_canvas_done_sync.plan.md`.
