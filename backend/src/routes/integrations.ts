import { Router } from "express";
import { z } from "zod";
import { createWhiteGridNextTaskFromJobTitle } from "../services/integrationService.js";
import { statusOf } from "../utils/httpError.js";

export const integrationsRouter = Router();

const whiteGridTaskSchema = z.object({
  title: z.string().trim().min(1).max(500),
});

/** White Grid → Artefact Canvas: cria task Next no projeto "White Grid". */
integrationsRouter.post("/white-grid/tasks", async (req, res, next) => {
  try {
    const parsed = whiteGridTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const task = await createWhiteGridNextTaskFromJobTitle(parsed.data.title);
    res.status(201).json(task);
  } catch (err) {
    const status = statusOf(err);
    if (status < 500) {
      res.status(status).json({ error: (err as Error).message });
      return;
    }
    next(err);
  }
});
