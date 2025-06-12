import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

const isProdBuild = process.env.NODE_ENV === "production";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: isProdBuild ? { format: "es" } : undefined,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react", "@livestore/wa-sqlite"],
  },
});
