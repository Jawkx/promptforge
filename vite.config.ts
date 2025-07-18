import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { livestoreDevtoolsPlugin } from "@livestore/devtools-vite";

const isProdBuild = process.env.NODE_ENV === "production";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cloudflare(),
    livestoreDevtoolsPlugin({
      schemaPath: "src/react/livestore/user-store/schema.ts",
    }),
  ],
  worker: isProdBuild ? { format: "es" } : undefined,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/react"),
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react", "@livestore/wa-sqlite"],
  },
});
