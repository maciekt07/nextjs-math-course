import { defineConfig, devices } from "@playwright/test";

import "dotenv/config";

// https://playwright.dev/docs/test-configuration.
export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // https://playwright.dev/docs/test-reporters
  reporter: "html",
  // https://playwright.dev/docs/api/class-testoptions
  use: {
    baseURL: "http://localhost:3000",
    // https://playwright.dev/docs/trace-viewer
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chromium" },
    },
  ],
  webServer: {
    command: "pnpm dev",
    reuseExistingServer: true,
    url: "http://localhost:3000",
  },
});
