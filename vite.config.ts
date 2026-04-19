import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

/**
 * Vite config for the Clarity-driven React view.
 *
 * S1 banking entry (unchanged): clarity-app/index.html
 *   → https://shinjif1002.github.io/ai-banking-report/clarity/
 *
 * S2 process-catalog entry (new, asymmetric preservation per S2 sub-plan v1.2 β):
 *   clarity-app/process-catalog/index.html
 *   → https://shinjif1002.github.io/ai-banking-report/clarity/process-catalog/
 *
 * Both are published from the gh-pages branch subfolder; main-branch legacy
 * `index.html` at repo root (serving /ai-banking-report/) stays untouched.
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
    rollupOptions: {
      input: {
        banking: resolve(__dirname, "clarity-app/index.html"),
        processCatalog: resolve(
          __dirname,
          "clarity-app/process-catalog/index.html",
        ),
        saasDashboard: resolve(
          __dirname,
          "clarity-app/saas-dashboard/index.html",
        ),
      },
    },
  },
  server: {
    port: 5178,
    strictPort: true,
  },
});
