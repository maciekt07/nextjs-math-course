import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { withCache } from "@/lib/cache/with-cache";

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

export function getOwnedCourseIds(userId: string) {
  return withCache(
    async () => {
      const rows = await db
        .select({ courseId: enrollment.courseId })
        .from(enrollment)
        .where(
          and(
            eq(enrollment.userId, userId),
            eq(enrollment.status, "completed"),
          ),
        );

      return rows.map((row) => row.courseId);
    },
    ["enrollments", userId],
    {
      revalidate: 300,
      tags: [`enrollments:${userId}`],
    },
  )();
}
