import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { companiesRouter } from "./routes/companies.js";
import { healthRouter } from "./routes/health.js";
import { projectsRouter } from "./routes/projects.js";
import { tasksRouter } from "./routes/tasks.js";
import { ensureSeedData } from "./scripts/seed.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api/health", healthRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/tasks", tasksRouter);

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  },
);

async function boot() {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL não configurada");
  }
  await ensureSeedData();
  app.listen(env.apiPort, () => {
    console.log(`Artefact Canvas API on :${env.apiPort}`);
  });
}

boot().catch((err) => {
  console.error(err);
  process.exit(1);
});
