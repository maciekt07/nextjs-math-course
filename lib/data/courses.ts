import { and, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { getPayloadClient } from "@/lib/payload-client";

export const getCourses = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "courses",
      limit: 10,
    });

    const coursesWithLessons = await Promise.all(
      (docs || []).map(async (course) => {
        const { totalDocs: lessonCount } = await payload.find({
          collection: "lessons",
          where: {
            course: { equals: course.id },
          },
          limit: 0,
        });
        return { ...course, lessonCount };
      }),
    );

    return coursesWithLessons;
  },
  ["courses-list"],
  { revalidate: 3600, tags: ["courses-list"] },
);

export const getCoursesByIds = unstable_cache(
  async (ids: string[]) => {
    if (ids.length === 0) return [];
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "courses",
      where: { id: { in: ids } },
      limit: 100,
    });

    const coursesWithLessons = await Promise.all(
      (res.docs || []).map(async (course) => {
        const { totalDocs: lessonCount } = await payload.find({
          collection: "lessons",
          where: {
            course: { equals: course.id },
          },
          limit: 0,
        });
        return { ...course, lessonCount };
      }),
    );

    return coursesWithLessons;
  },
  ["courses-by-ids"],
  { revalidate: 3600, tags: ["courses-list"] },
);

export const getOwnedCourseIds = (userId: string) =>
  unstable_cache(
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
    { revalidate: 300, tags: [`enrollments:${userId}`] },
  )();
