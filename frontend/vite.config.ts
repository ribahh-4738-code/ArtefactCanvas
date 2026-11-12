import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const toolShell = path.resolve(root, "../../instituto-tool-shell");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@instituto/tool-shell/styles.css": path.join(toolShell, "src/styles.css"),
      "@instituto/tool-shell": path.join(toolShell, "src/index.ts"),
    },
    dedupe: ["react", "react-dom", "lucide-react"],
  },
  optimizeDeps: {
    exclude: ["@instituto/tool-shell"],
  },
  server: {
    port: 5175,
    strictPort: true,
    fs: { allow: [root, toolShell] },
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY ?? "http://localhost:3089",
        changeOrigin: true,
      },
    },
  },
});
