import { Router } from "express";
import { z } from "zod";
import {
  createCompany,
  listCompanies,
  updateCompany,
} from "../services/companyService.js";
import { statusOf } from "../utils/httpError.js";

export const companiesRouter = Router();

const nameSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(120),
});

companiesRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await listCompanies());
  } catch (err) {
    next(err);
  }
});

companiesRouter.post("/", async (req, res, next) => {
  try {
    const parsed = nameSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const company = await createCompany(parsed.data.name);
    res.status(201).json(company);
  } catch (err) {
    const status = statusOf(err);
    if (status < 500) {
      res.status(status).json({ error: (err as Error).message });
      return;
    }
    next(err);
  }
});

companiesRouter.patch("/:id", async (req, res, next) => {
  try {
    const parsed = nameSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const company = await updateCompany(req.params.id, parsed.data.name);
    res.json(company);
  } catch (err) {
    const status = statusOf(err);
    if (status < 500) {
      res.status(status).json({ error: (err as Error).message });
      return;
    }
    next(err);
  }
});
