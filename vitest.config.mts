import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
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
