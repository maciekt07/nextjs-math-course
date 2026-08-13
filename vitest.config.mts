import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      "client-only": path.resolve(__dirname, "./lib/stubs/client-only.ts"),
    },
  },
  test: {
    environment: "jsdom",
    env: {
      // skip t3-env validation
      SKIP_ENV_VALIDATION: "1",
    },
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}", "tests/int/**/*.spec.ts"],
  },
});
