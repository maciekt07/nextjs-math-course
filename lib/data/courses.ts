import { and, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { getPayloadClient } from "@/lib/payload-client";
import type { Course } from "@/types/payload-types";

export interface LessonStats {
  lessonCount: number;
  totalQuizQuestions: number;
  totalReadingTimeSeconds: number;
  totalVideoSeconds: number;
}

const payloadPromise = getPayloadClient();

function getId(value: Course | string): string {
  if (!value) return "";
  return typeof value === "string" ? value : value.id;
}

async function getLessonStatsBatch(courseIds: string[]) {
  if (courseIds.length === 0) return {};

  const payload = await payloadPromise;

  const { docs } = await payload.find({
    collection: "lessons",
    where: {
      course: { in: courseIds },
    },
    select: {
      course: true,
      quiz: true,
      readingTimeSeconds: true,
      videoDurationSeconds: true,
      type: true,
    },
    limit: 10000,
  });

  const statsMap: Record<string, LessonStats> = {};

  for (const id of courseIds) {
    statsMap[id] = {
      lessonCount: 0,
      totalQuizQuestions: 0,
      totalReadingTimeSeconds: 0,
      totalVideoSeconds: 0,
    };
  }

  for (const lesson of docs) {
    const courseId = getId(lesson.course);
    const stats = statsMap[courseId];

    if (!stats) continue;

    stats.lessonCount++;

    if (lesson.type === "quiz") {
      stats.totalQuizQuestions += lesson.quiz?.length ?? 0;
    }

    stats.totalReadingTimeSeconds += lesson.readingTimeSeconds ?? 0;
    stats.totalVideoSeconds += lesson.videoDurationSeconds ?? 0;
  }

  return statsMap;
}

export const getCourses = unstable_cache(
  async () => {
    const payload = await payloadPromise;

    const { docs } = await payload.find({
      collection: "courses",
      limit: 10,
    });

    const courses = docs ?? [];

    const statsMap = await getLessonStatsBatch(courses.map((c) => c.id));

    return courses.map((c) => ({
      ...c,
      ...statsMap[c.id],
    }));
  },
  ["courses-list"],
  {
    revalidate: 3600,
    tags: ["courses-list"],
  },
);

export function getCoursesByIds(ids: string[]) {
  return unstable_cache(
    async () => {
      if (ids.length === 0) return [];

      const payload = await payloadPromise;

      const { docs } = await payload.find({
        collection: "courses",
        where: { id: { in: ids } },
        limit: 100,
      });

      const courses = docs ?? [];

      const statsMap = await getLessonStatsBatch(ids);

      return courses.map((c) => ({
        ...c,
        ...statsMap[c.id],
      }));
    },
    ["courses-by-ids", ...ids],
    {
      revalidate: 3600,
      tags: ["courses-list"],
    },
  )();
}

export function getOwnedCourseIds(userId: string) {
  return unstable_cache(
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
