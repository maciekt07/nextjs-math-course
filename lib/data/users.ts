import "server-only";

import { count } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { user } from "@/drizzle/schema";
import { withCache } from "@/lib/cache/withCache";

export const getUserCount = withCache(
  async () => {
    const result = await db.select({ count: count() }).from(user);
    return result[0]?.count || 0;
  },
  ["user-count"],
  { revalidate: 3600 },
);
