import { TaskStatus } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { httpError } from "../utils/httpError.js";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDateOnly(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw httpError("Data inválida (use YYYY-MM-DD)", 400);
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) {
    throw httpError("Data inválida", 400);
  }
  return startOfDay(d);
}

async function nextSortOrder(projectId: string, status: TaskStatus): Promise<number> {
  const last = await prisma.task.findFirst({
    where: { projectId, status },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return (last?.sortOrder ?? -1) + 1;
}

/** Demote current IN_DEVELOPMENT to top of NEXT queue (sortOrder 0). */
async function demoteCurrentHighlight(projectId: string, excludeId?: string) {
  const existing = await prisma.task.findFirst({
    where: {
      projectId,
      status: "IN_DEVELOPMENT",
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
  if (!existing) return;

  const queue = await prisma.task.findMany({
    where: { projectId, status: "NEXT", id: { not: existing.id } },
    orderBy: { sortOrder: "asc" },
  });

  await prisma.$transaction([
    ...queue.map((t, i) =>
      prisma.task.update({
        where: { id: t.id },
        data: { sortOrder: i + 1 },
      }),
    ),
    prisma.task.update({
      where: { id: existing.id },
      data: { status: "NEXT", sortOrder: 0 },
    }),
  ]);
}

export async function createTask(input: {
  projectId: string;
  title: string;
  status?: "NEXT" | "DONE" | "IN_DEVELOPMENT";
  completedOn?: string;
  instructions?: string;
}) {
  const title = input.title.trim();
  if (!title) throw httpError("Título da tarefa é obrigatório", 400);

  const project = await prisma.project.findUnique({ where: { id: input.projectId } });
  if (!project) throw httpError("Projeto não encontrado", 404);

  const status: TaskStatus = input.status ?? "NEXT";
  let completedAt: Date | null = null;

  if (status === "DONE") {
    completedAt = input.completedOn
      ? parseDateOnly(input.completedOn)
      : startOfDay(new Date());
  } else if (status === "IN_DEVELOPMENT") {
    await demoteCurrentHighlight(input.projectId);
  }

  const sortOrder =
    status === "DONE" || status === "IN_DEVELOPMENT"
      ? 0
      : await nextSortOrder(input.projectId, status);

  return prisma.task.create({
    data: {
      projectId: input.projectId,
      title,
      instructions: input.instructions ?? "",
      status,
      sortOrder,
      completedAt,
    },
  });
}

export async function createTasksBatch(input: {
  projectId: string;
  titles: string[];
  status: "NEXT" | "DONE";
  completedOn?: string;
}) {
  const titles = input.titles.map((t) => t.trim()).filter(Boolean);
  if (titles.length === 0) throw httpError("Nenhum título informado", 400);

  const project = await prisma.project.findUnique({ where: { id: input.projectId } });
  if (!project) throw httpError("Projeto não encontrado", 404);

  if (input.status === "DONE") {
    const completedAt = input.completedOn
      ? parseDateOnly(input.completedOn)
      : startOfDay(new Date());
    const created = await prisma.$transaction(
      titles.map((title) =>
        prisma.task.create({
          data: {
            projectId: input.projectId,
            title,
            status: "DONE",
            sortOrder: 0,
            completedAt,
          },
        }),
      ),
    );
    return created;
  }

  let sortOrder = await nextSortOrder(input.projectId, "NEXT");
  const created = await prisma.$transaction(
    titles.map((title) => {
      const order = sortOrder;
      sortOrder += 1;
      return prisma.task.create({
        data: {
          projectId: input.projectId,
          title,
          status: "NEXT",
          sortOrder: order,
        },
      });
    }),
  );
  return created;
}

export async function updateTask(
  id: string,
  patch: {
    title?: string;
    instructions?: string;
    completed?: boolean;
    completedOn?: string;
  },
) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw httpError("Tarefa não encontrada", 404);

  const data: {
    title?: string;
    instructions?: string;
    status?: TaskStatus;
    completedAt?: Date | null;
    sortOrder?: number;
  } = {};

  if (patch.title !== undefined) {
    const trimmed = patch.title.trim();
    if (!trimmed) throw httpError("Título da tarefa é obrigatório", 400);
    data.title = trimmed;
  }

  if (patch.instructions !== undefined) {
    data.instructions = patch.instructions;
  }

  if (patch.completed === true) {
    if (task.status !== "DONE") {
      data.status = "DONE";
      data.completedAt = patch.completedOn
        ? parseDateOnly(patch.completedOn)
        : startOfDay(new Date());
      data.sortOrder = 0;
    } else if (patch.completedOn) {
      data.completedAt = parseDateOnly(patch.completedOn);
    }
  } else if (patch.completed === false) {
    if (task.status === "DONE") {
      data.status = "NEXT";
      data.completedAt = null;
      data.sortOrder = await nextSortOrder(task.projectId, "NEXT");
    }
  } else if (patch.completedOn !== undefined) {
    if (task.status !== "DONE") {
      throw httpError("Só tarefas Done podem ter a data alterada", 400);
    }
    data.completedAt = parseDateOnly(patch.completedOn);
  }

  if (Object.keys(data).length === 0) return task;

  return prisma.task.update({
    where: { id },
    data,
  });
}

export async function deleteTask(id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw httpError("Tarefa não encontrada", 404);
  await prisma.task.delete({ where: { id } });
}

/** Move a NEXT task up/down. Up from index 0 promotes to IN_DEVELOPMENT. */
export async function moveNextTask(id: string, direction: "up" | "down") {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw httpError("Tarefa não encontrada", 404);
  if (task.status !== "NEXT") {
    throw httpError("Só a fila Next pode ser reordenada", 400);
  }

  const queue = await prisma.task.findMany({
    where: { projectId: task.projectId, status: "NEXT" },
    orderBy: { sortOrder: "asc" },
  });
  const index = queue.findIndex((t) => t.id === id);
  if (index < 0) throw httpError("Tarefa não encontrada na fila", 404);

  if (direction === "up") {
    if (index === 0) {
      return promoteToInDevelopment(task.id);
    }
    const above = queue[index - 1]!;
    await prisma.$transaction([
      prisma.task.update({
        where: { id: task.id },
        data: { sortOrder: above.sortOrder },
      }),
      prisma.task.update({
        where: { id: above.id },
        data: { sortOrder: task.sortOrder },
      }),
    ]);
    return prisma.task.findUniqueOrThrow({ where: { id } });
  }

  if (index >= queue.length - 1) {
    return task;
  }
  const below = queue[index + 1]!;
  await prisma.$transaction([
    prisma.task.update({
      where: { id: task.id },
      data: { sortOrder: below.sortOrder },
    }),
    prisma.task.update({
      where: { id: below.id },
      data: { sortOrder: task.sortOrder },
    }),
  ]);
  return prisma.task.findUniqueOrThrow({ where: { id } });
}

/** Demote IN_DEVELOPMENT to top of NEXT queue. */
export async function demoteInDevelopment(id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw httpError("Tarefa não encontrada", 404);
  if (task.status !== "IN_DEVELOPMENT") {
    throw httpError("Tarefa não está em desenvolvimento", 400);
  }

  const queue = await prisma.task.findMany({
    where: { projectId: task.projectId, status: "NEXT" },
    orderBy: { sortOrder: "asc" },
  });

  await prisma.$transaction([
    ...queue.map((t, i) =>
      prisma.task.update({
        where: { id: t.id },
        data: { sortOrder: i + 1 },
      }),
    ),
    prisma.task.update({
      where: { id },
      data: { status: "NEXT", sortOrder: 0 },
    }),
  ]);

  return prisma.task.findUniqueOrThrow({ where: { id } });
}

async function promoteToInDevelopment(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw httpError("Tarefa não encontrada", 404);

  const current = await prisma.task.findFirst({
    where: { projectId: task.projectId, status: "IN_DEVELOPMENT" },
  });

  await prisma.$transaction(async (tx) => {
    if (current) {
      const nextQueue = await tx.task.findMany({
        where: {
          projectId: task.projectId,
          status: "NEXT",
          id: { not: taskId },
        },
        orderBy: { sortOrder: "asc" },
      });
      for (let i = 0; i < nextQueue.length; i++) {
        await tx.task.update({
          where: { id: nextQueue[i]!.id },
          data: { sortOrder: i + 1 },
        });
      }
      await tx.task.update({
        where: { id: current.id },
        data: { status: "NEXT", sortOrder: 0 },
      });
    }

    await tx.task.update({
      where: { id: taskId },
      data: { status: "IN_DEVELOPMENT", sortOrder: 0, completedAt: null },
    });
  });

  return prisma.task.findUniqueOrThrow({ where: { id: taskId } });
}
