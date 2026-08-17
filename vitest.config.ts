import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Jalankan test dalam environment Node (bukan browser/jsdom)
    // karena assessment engine adalah pure function tanpa DOM dependency.
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
