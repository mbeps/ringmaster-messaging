import react from "@vitejs/plugin-react";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    // ponytail: environmentMatchGlobs was removed in Vitest 4; a single jsdom
    // env covers both DOM and server-side tests. Upgrade path: test.projects
    // if a node-only test ever needs it.
    environment: "jsdom",
    globals: true,
    include: ["__tests__/**/*.test.{ts,tsx}"],
    setupFiles: ["__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      // ponytail: thresholds kept on the original server-side scope; UI coverage
      // is additive — raise include + thresholds once component tests stabilise.
      include: ["actions/**/*.ts", "libs/**/*.ts", "lib/env.ts"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
