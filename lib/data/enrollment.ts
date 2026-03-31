import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { withCache } from "@/lib/cache/withCache";

export const hasEnrollment = (userId: string, courseId: string) =>
  withCache(
    async () => {
      const rows = await db
        .select()
        .from(enrollment)
        .where(
          and(
            eq(enrollment.userId, userId),
            eq(enrollment.courseId, courseId),
            eq(enrollment.status, "completed"),
          ),
        );
      return rows.length > 0;
    },
    ["enrollment", userId, courseId],
    { revalidate: 300, tags: [`enrollment:${userId}:${courseId}`] },
  )();
