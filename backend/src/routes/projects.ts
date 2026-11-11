import { Router } from "express";
import { z } from "zod";
import {
  createProject,
  getDashboard,
  getLastOpenedProjectId,
  listProjects,
  updateProject,
} from "../services/projectService.js";
import { statusOf } from "../utils/httpError.js";

export const projectsRouter = Router();

const createSchema = z.object({
  companyId: z.string().min(1),
  name: z.string().trim().min(1).max(160),
  artefato: z.string().max(500).optional(),
  iniciativa: z.string().max(500).optional(),
  aposta: z.string().max(500).optional(),
});

const patchSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  artefato: z.string().max(500).optional(),
  iniciativa: z.string().max(500).optional(),
  aposta: z.string().max(500).optional(),
});

projectsRouter.get("/", async (req, res, next) => {
  try {
    const companyId =
      typeof req.query.companyId === "string" ? req.query.companyId : undefined;
    res.json(await listProjects(companyId));
  } catch (err) {
    next(err);
  }
});

projectsRouter.get("/last-opened", async (_req, res, next) => {
  try {
    const id = await getLastOpenedProjectId();
    res.json({ projectId: id });
  } catch (err) {
    next(err);
  }
});

projectsRouter.get("/:id/dashboard", async (req, res, next) => {
  try {
    res.json(await getDashboard(req.params.id));
  } catch (err) {
    const status = statusOf(err);
    if (status < 500) {
      res.status(status).json({ error: (err as Error).message });
      return;
    }
    next(err);
  }
});

projectsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const { companyId, name, ...fields } = parsed.data;
    const project = await createProject(companyId, name, fields);
    res.status(201).json(project);
  } catch (err) {
    const status = statusOf(err);
    if (status < 500) {
      res.status(status).json({ error: (err as Error).message });
      return;
    }
    next(err);
  }
});

projectsRouter.patch("/:id", async (req, res, next) => {
  try {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const project = await updateProject(req.params.id, parsed.data);
    res.json(project);
  } catch (err) {
    const status = statusOf(err);
    if (status < 500) {
      res.status(status).json({ error: (err as Error).message });
      return;
    }
    next(err);
  }
});
