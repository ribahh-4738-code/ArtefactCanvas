import { prisma } from "../db/prisma.js";
import { httpError } from "../utils/httpError.js";
import { createTask } from "./taskService.js";

const WHITE_GRID_PROJECT_NAME = "White Grid";

/** Creates a NEXT task in the Artefact Canvas project "White Grid". */
export async function createWhiteGridNextTaskFromJobTitle(jobTitle: string) {
  const trimmed = jobTitle.trim();
  if (!trimmed) throw httpError("Título da vaga é obrigatório", 400);

  const project = await prisma.project.findFirst({
    where: { name: WHITE_GRID_PROJECT_NAME },
    orderBy: { lastOpenedAt: "desc" },
  });
  if (!project) {
    throw httpError(
      `Projeto "${WHITE_GRID_PROJECT_NAME}" não encontrado no Artefact Canvas`,
      404,
    );
  }

  const title = `ver: ${trimmed}`.slice(0, 500);
  return createTask({
    projectId: project.id,
    title,
    status: "NEXT",
  });
}
