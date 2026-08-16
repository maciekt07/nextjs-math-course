import "server-only";

import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { serverEnv } from "@/env/server";

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
});
