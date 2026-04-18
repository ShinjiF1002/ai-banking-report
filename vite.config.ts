import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

/**
 * Vite config for the Clarity-driven React view.
 *
 * Deploy target: https://shinjif1002.github.io/ai-banking-report/clarity/
 * — gh-pages branch subfolder, old HTML at root preserved unchanged.
 *
 * `root` points at clarity-app/ so the new Vite entry (clarity-app/index.html)
 * does NOT collide with the legacy root /index.html.
 */
export default defineConfig({
  root: resolve(__dirname, "clarity-app"),
  base: "/ai-banking-report/clarity/",
  publicDir: resolve(__dirname, "clarity-app/public"),
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 5178,
    strictPort: true,
  },
});
