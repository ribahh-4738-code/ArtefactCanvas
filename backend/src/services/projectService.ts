import { prisma } from "../db/prisma.js";
import { httpError } from "../utils/httpError.js";

export type ProjectPatch = {
  name?: string;
  artefato?: string;
  iniciativa?: string;
  aposta?: string;
};

export async function listProjects(companyId?: string) {
  return prisma.project.findMany({
    where: companyId ? { companyId } : undefined,
    orderBy: [{ lastOpenedAt: "desc" }, { name: "asc" }],
    include: {
      company: { select: { id: true, name: true } },
      _count: { select: { tasks: true } },
    },
  });
}

export async function createProject(
  companyId: string,
  name: string,
  fields?: Omit<ProjectPatch, "name">,
) {
  const trimmed = name.trim();
  if (!trimmed) throw httpError("Nome do projeto é obrigatório", 400);
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw httpError("Empresa não encontrada", 404);

  const now = new Date();
  return prisma.project.create({
    data: {
      companyId,
      name: trimmed,
      artefato: fields?.artefato?.trim() ?? "",
      iniciativa: fields?.iniciativa?.trim() ?? "",
      aposta: fields?.aposta?.trim() ?? "",
      lastOpenedAt: now,
    },
    include: {
      company: { select: { id: true, name: true } },
      _count: { select: { tasks: true } },
    },
  });
}

export async function updateProject(id: string, patch: ProjectPatch) {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) throw httpError("Projeto não encontrado", 404);

  const data: ProjectPatch = {};
  if (patch.name !== undefined) {
    const trimmed = patch.name.trim();
    if (!trimmed) throw httpError("Nome do projeto é obrigatório", 400);
    data.name = trimmed;
  }
  if (patch.artefato !== undefined) data.artefato = patch.artefato;
  if (patch.iniciativa !== undefined) data.iniciativa = patch.iniciativa;
  if (patch.aposta !== undefined) data.aposta = patch.aposta;

  return prisma.project.update({
    where: { id },
    data,
    include: {
      company: { select: { id: true, name: true } },
      _count: { select: { tasks: true } },
    },
  });
}

export async function touchProjectOpened(id: string) {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) throw httpError("Projeto não encontrado", 404);
  return prisma.project.update({
    where: { id },
    data: { lastOpenedAt: new Date() },
  });
}

export async function getLastOpenedProjectId(): Promise<string | null> {
  const project = await prisma.project.findFirst({
    orderBy: [{ lastOpenedAt: "desc" }, { createdAt: "desc" }],
    select: { id: true },
  });
  return project?.id ?? null;
}

export async function getDashboard(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      company: true,
      tasks: {
        orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { completedAt: "desc" }],
      },
    },
  });
  if (!project) throw httpError("Projeto não encontrado", 404);

  await prisma.project.update({
    where: { id: projectId },
    data: { lastOpenedAt: new Date() },
  });

  const companies = await listCompaniesLightweight();
  const projects = await prisma.project.findMany({
    where: { companyId: project.companyId },
    orderBy: [{ lastOpenedAt: "desc" }, { name: "asc" }],
    select: { id: true, name: true, companyId: true, lastOpenedAt: true },
  });

  const inDevelopment =
    project.tasks.find((t) => t.status === "IN_DEVELOPMENT") ?? null;
  const next = project.tasks
    .filter((t) => t.status === "NEXT")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const done = project.tasks
    .filter((t) => t.status === "DONE")
    .sort((a, b) => {
      const aTime = a.completedAt?.getTime() ?? 0;
      const bTime = b.completedAt?.getTime() ?? 0;
      return bTime - aTime;
    });

  return {
    company: project.company,
    project: {
      id: project.id,
      companyId: project.companyId,
      name: project.name,
      artefato: project.artefato,
      iniciativa: project.iniciativa,
      aposta: project.aposta,
      lastOpenedAt: project.lastOpenedAt,
    },
    tasks: {
      inDevelopment,
      next,
      done,
    },
    companies,
    projects,
  };
}

async function listCompaniesLightweight() {
  return prisma.company.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
