import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnv = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: rootEnv });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  apiPort: Number(process.env.API_PORT ?? 3089),
  databaseUrl: process.env.DATABASE_URL ?? "",
  dashboardUrl: process.env.DASHBOARD_URL ?? "http://localhost:5175/",
};
