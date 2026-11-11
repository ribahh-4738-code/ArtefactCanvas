import { Router } from "express";
import { z } from "zod";
import {
  createTask,
  createTasksBatch,
  deleteTask,
  demoteInDevelopment,
  moveNextTask,
  updateTask,
} from "../services/taskService.js";
import { statusOf } from "../utils/httpError.js";

export const tasksRouter = Router();

const createSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(1).max(500),
  status: z.enum(["NEXT", "DONE", "IN_DEVELOPMENT"]).optional(),
  completedOn: z.string().optional(),
  instructions: z.string().max(20000).optional(),
});

const batchSchema = z.object({
  projectId: z.string().min(1),
  titles: z.array(z.string().max(500)).min(1),
  status: z.enum(["NEXT", "DONE"]),
  completedOn: z.string().optional(),
});

const patchSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  instructions: z.string().max(20000).optional(),
  completed: z.boolean().optional(),
  completedOn: z.string().optional(),
});

const moveSchema = z.object({
  direction: z.enum(["up", "down"]),
});

tasksRouter.post("/batch", async (req, res, next) => {
  try {
    const parsed = batchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const tasks = await createTasksBatch(parsed.data);
    res.status(201).json(tasks);
  } catch (err) {
    const status = statusOf(err);
    if (status < 500) {
      res.status(status).json({ error: (err as Error).message });
      return;
    }
    next(err);
  }
});

tasksRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const task = await createTask(parsed.data);
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

tasksRouter.patch("/:id", async (req, res, next) => {
  try {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const task = await updateTask(req.params.id, parsed.data);
    res.json(task);
  } catch (err) {
    const status = statusOf(err);
    if (status < 500) {
      res.status(status).json({ error: (err as Error).message });
      return;
    }
    next(err);
  }
});

tasksRouter.post("/:id/move", async (req, res, next) => {
  try {
    const parsed = moveSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const task = await moveNextTask(req.params.id, parsed.data.direction);
    res.json(task);
  } catch (err) {
    const status = statusOf(err);
    if (status < 500) {
      res.status(status).json({ error: (err as Error).message });
      return;
    }
    next(err);
  }
});

tasksRouter.post("/:id/demote", async (req, res, next) => {
  try {
    const task = await demoteInDevelopment(req.params.id);
    res.json(task);
  } catch (err) {
    const status = statusOf(err);
    if (status < 500) {
      res.status(status).json({ error: (err as Error).message });
      return;
    }
    next(err);
  }
});

tasksRouter.delete("/:id", async (req, res, next) => {
  try {
    await deleteTask(req.params.id);
    res.status(204).end();
  } catch (err) {
    const status = statusOf(err);
    if (status < 500) {
      res.status(status).json({ error: (err as Error).message });
      return;
    }
    next(err);
  }
});
