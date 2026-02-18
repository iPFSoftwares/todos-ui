import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://localhost:8080",
        changeOrigin: true
      }
    }
  },
  test: {
    environment: "./test-environment.ts",
    setupFiles: "./src/setupTests.ts",
    globals: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      reporter: ["text", "json", "html"],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90
      },
      exclude: ["src/main.tsx", "src/types.ts", "src/**/*.d.ts", "src/__tests__/**"]
    }
  }
});
