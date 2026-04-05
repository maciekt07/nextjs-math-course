import "server-only";

import { publishedStatusWhere } from "@/cms/access/contentAccess";
import { getIsDraftMode, withCache } from "@/lib/cache/withCache";
import { getPayloadClient } from "@/lib/payload-client";
import type { Course, Poster } from "@/types/payload-types";

type CourseSeoData = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  posterUrl: string | null;
  posterAlt: string | null;
  updatedAt: string;
};

type LessonSeoData = {
  id: string;
  slug: string;
  title: string;
  free: boolean;
  updatedAt: string;
  course: CourseSeoData;
};

function normalizeCourseSeoData(course: Course | null | undefined) {
  if (!course?.id || !course.slug || !course.title) {
    return null;
  }

  const poster =
    course.poster && typeof course.poster === "object"
      ? (course.poster as Poster)
      : null;

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description ?? null,
    posterUrl: poster?.url ?? null,
    posterAlt: poster?.alt ?? course.title,
    updatedAt: course.updatedAt,
  } satisfies CourseSeoData;
}

export function getCourseSeoData(courseSlug: string) {
  return withCache(
    async () => {
      const payload = await getPayloadClient();
      const isDraftMode = await getIsDraftMode();

      const { docs } = await payload.find({
        collection: "courses",
        limit: 1,
        depth: 1,
        overrideAccess: true,
        draft: isDraftMode,
        where: {
          and: [
            ...(isDraftMode ? [] : [publishedStatusWhere]),
            { slug: { equals: courseSlug } },
          ],
        },
      });

      return normalizeCourseSeoData(docs[0] ?? null);
    },
    ["course-seo", courseSlug],
    {
      revalidate: 3600,
      tags: [`course-slug:${courseSlug}`],
    },
  )();
}

export function getLessonSeoData(courseSlug: string, lessonSlug: string) {
  return withCache(
    async () => {
      const payload = await getPayloadClient();
      const isDraftMode = await getIsDraftMode();

      const { docs } = await payload.find({
        collection: "lessons",
        limit: 1,
        depth: 2,
        overrideAccess: true,
        draft: isDraftMode,
        where: {
          and: [
            ...(isDraftMode ? [] : [publishedStatusWhere]),
            { "course.slug": { equals: courseSlug } },
            { slug: { equals: lessonSlug } },
          ],
        },
      });

      const lesson = docs[0];
      if (!lesson?.id || !lesson.slug || !lesson.title) {
        return null;
      }

      const course =
        typeof lesson.course === "string"
          ? null
          : normalizeCourseSeoData(lesson.course);

      if (!course) {
        return null;
      }

      return {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        free: Boolean(lesson.free),
        updatedAt: lesson.updatedAt,
        course,
      } satisfies LessonSeoData;
    },
    ["lesson-seo", courseSlug, lessonSlug],
    {
      revalidate: 3600,
      tags: [
        `course-slug:${courseSlug}`,
        `lesson-slug:${courseSlug}:${lessonSlug}`,
      ],
    },
  )();
}
