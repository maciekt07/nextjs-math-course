import path from "node:path";
import { config } from "dotenv";

config({
  path: path.resolve(process.cwd(), ".env.development"),
  override: true,
});
