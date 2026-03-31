import "server-only";

import { and, eq } from "drizzle-orm";
import { publishedStatusWhere } from "@/cms/access/contentAccess";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { getIsDraftMode, withCache } from "@/lib/cache/withCache";
import { getPayloadClient } from "@/lib/payload-client";

const payloadPromise = getPayloadClient();

export const getCourses = withCache(
  async () => {
    const payload = await payloadPromise;
    const isDraftMode = await getIsDraftMode();

    const { docs } = await payload.find({
      collection: "courses",
      limit: 10,
      overrideAccess: true,
      draft: isDraftMode,
      select: {
        title: true,
        slug: true,
        price: true,
        description: true,
        poster: true,
        lessonCount: true,
        totalQuizQuestions: true,
        totalReadingTimeSeconds: true,
        totalVideoSeconds: true,
        firstLessonSlug: true,
        firstFreeLessonSlug: true,
        updatedAt: true,
        createdAt: true,
      },
      where: isDraftMode ? undefined : publishedStatusWhere,
    });

    return docs ?? [];
  },
  ["courses-list"],
  {
    revalidate: 3600,
    tags: ["courses-list"],
  },
);

export function getCoursesByIds(ids: string[]) {
  return withCache(
    async () => {
      if (ids.length === 0) return [];

      const payload = await payloadPromise;
      const isDraftMode = await getIsDraftMode();

      const { docs } = await payload.find({
        collection: "courses",
        limit: 100,
        overrideAccess: true,
        draft: isDraftMode,
        select: {
          title: true,
          slug: true,
          price: true,
          description: true,
          poster: true,
          lessonCount: true,
          totalQuizQuestions: true,
          totalReadingTimeSeconds: true,
          totalVideoSeconds: true,
          firstLessonSlug: true,
          firstFreeLessonSlug: true,
          updatedAt: true,
          createdAt: true,
        },
        where: {
          and: [
            ...(isDraftMode ? [] : [publishedStatusWhere]),
            { id: { in: ids } },
          ],
        },
      });

      return docs ?? [];
    },
    ["courses-by-ids", ...ids],
    {
      revalidate: 3600,
      tags: ["courses-list"],
    },
  )();
}

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

      return rows.map((r) => r.courseId);
    },
    ["enrollments", userId],
    {
      revalidate: 300,
      tags: [`enrollments:${userId}`],
    },
  )();
}
