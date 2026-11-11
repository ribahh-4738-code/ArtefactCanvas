import { prisma } from "../db/prisma.js";
import { httpError } from "../utils/httpError.js";

export async function listCompanies() {
  return prisma.company.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { projects: true } },
    },
  });
}

export async function createCompany(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw httpError("Nome da empresa é obrigatório", 400);
  return prisma.company.create({
    data: { name: trimmed },
    include: { _count: { select: { projects: true } } },
  });
}

export async function updateCompany(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw httpError("Nome da empresa é obrigatório", 400);
  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) throw httpError("Empresa não encontrada", 404);
  return prisma.company.update({
    where: { id },
    data: { name: trimmed },
    include: { _count: { select: { projects: true } } },
  });
}
