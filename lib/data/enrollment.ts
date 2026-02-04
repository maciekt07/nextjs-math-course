import { and, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";

export const hasEnrollment = (userId: string, courseId: string) =>
  unstable_cache(
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
