import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ✅ OBLIGATOIRE POUR maplibre-gl
  esbuild: {
    target: "es2020",
  },

  // ✅ FORCER LA TRANSPILATION DE maplibre-gl
  optimizeDeps: {
    include: ["maplibre-gl"],
    esbuildOptions: {
      target: "es2020",
    },
  },

  build: {
    target: "es2020",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

}));

