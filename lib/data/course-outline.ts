import { publishedStatusWhere } from "@/cms/access/contentAccess";
import { getIsDraftMode, withCache } from "@/lib/cache/with-cache";
import { getPayloadClient } from "@/lib/payload-client";

export const getCourseWithLessons = (courseSlug: string) =>
  withCache(
    async () => {
      const payload = await getPayloadClient();

      const isDraftMode = await getIsDraftMode();

      const { docs: courseDocs } = await payload.find({
        collection: "courses",
        overrideAccess: true,
        draft: isDraftMode,
        where: {
          and: [
            ...(isDraftMode ? [] : [publishedStatusWhere]),
            { slug: { equals: courseSlug } },
          ],
        },
        limit: 1,
      });

      if (!courseDocs.length) return null;

      const course = courseDocs[0];

      const [{ docs: chapters }, { docs: lessons }] = await Promise.all([
        payload.find({
          collection: "chapters",
          overrideAccess: true,
          draft: isDraftMode,
          where: { course: { equals: course.id } },
          depth: 0,
          limit: 100,
        }),
        payload.find({
          collection: "lessons",
          overrideAccess: true,
          draft: isDraftMode,
          where: {
            and: [
              ...(isDraftMode ? [] : [publishedStatusWhere]),
              { course: { equals: course.id } },
            ],
          },
          limit: 100,
          select: {
            title: true,
            slug: true,
            free: true,
            id: true,
            type: true,
            chapter: true,
            quiz: { id: true },
            videoDurationSeconds: true,
            readingTimeSeconds: true,
          },
        }),
      ]);

      const lessonsByChapter: Record<string, typeof lessons> = {};
      chapters.forEach((chapter) => {
        lessonsByChapter[chapter.id] = [];
      });

      const ungroupedLessons: typeof lessons = [];

      lessons.forEach((lesson) => {
        const chapterId =
          typeof lesson.chapter === "string"
            ? lesson.chapter
            : lesson.chapter?.id;

        if (chapterId && lessonsByChapter[chapterId]) {
          lessonsByChapter[chapterId].push(lesson);
        } else {
          ungroupedLessons.push(lesson);
        }
      });

      const sortedLessons: typeof lessons = [];
      chapters.forEach((chapter) => {
        sortedLessons.push(...lessonsByChapter[chapter.id]);
      });

      sortedLessons.push(...ungroupedLessons);

      return { course, lessons: sortedLessons, chapters };
    },
    ["course-layout", courseSlug],
    {
      revalidate: 3600,
      tags: [`course-slug:${courseSlug}`],
    },
  )();
