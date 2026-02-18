import { Redis } from "@upstash/redis";
import { serverEnv } from "@/env/server";

export const redis = new Redis({
  url: serverEnv.UPSTASH_REDIS_REST_URL,
  token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
});
