import { count } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/drizzle/db";
import { user } from "@/drizzle/schema";

export const getUserCount = unstable_cache(
  async () => {
    const result = await db.select({ count: count() }).from(user);
    return result[0]?.count || 0;
  },
  ["user-count"],
  { revalidate: 3600 },
);
