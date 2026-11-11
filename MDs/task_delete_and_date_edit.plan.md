---
name: Task delete and date edit
overview: Exclusão de tasks e edição da data de conclusão em Done.
todos:
  - id: api-delete-date
    content: DELETE /api/tasks/:id e PATCH completedOn em Done
    status: completed
  - id: ui-delete-date
    content: Ícone lixeira + input date em Done; README/CHANGELOG
    status: completed
isProject: false
---

# Exclusão de task e edição de data

- `DELETE /api/tasks/:id` com confirmação na UI (Today, Next, Done).
- Em Done, `input type="date"` por task altera `completedAt` via `PATCH` (`completedOn`) e move o grupo.
