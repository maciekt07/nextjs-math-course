import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { serverEnv } from "@/env/server";
import * as schema from "./schema";

export const db = drizzle(serverEnv.DATABASE_URL, { schema });
