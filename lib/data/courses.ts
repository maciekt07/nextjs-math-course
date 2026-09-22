import "server-only";

import { publishedStatusWhere } from "@/cms/access/contentAccess";
import { getIsDraftMode, withCache } from "@/lib/cache/with-cache";
import { getPayloadClient } from "@/lib/payload-client";

export { getOwnedCourseIds } from "@/lib/data/enrollment";

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
